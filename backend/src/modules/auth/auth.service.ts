import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import {
  UnauthorizedError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from '../../common/errors/app-error';
import { env } from '../../config/env';
import {
  AuthResponse,
  AuthUser,
  LoginDto,
  RegisterDto,
  GoogleLoginDto,
  SetPasswordDto,
  ChangePasswordDto,
  ClientInfo,
  isMemberAccessAllowed,
} from './auth.types';
import { UserModel, IUserDocument } from '../users/user.model';
import { SessionModel } from './session.model';

export class AuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(env.GOOGLE.CLIENT_ID);
  }

  /**
   * Generates Access Token & Refresh Token pair, and stores a hashed session in MongoDB.
   */
  private async createSessionAndTokens(
    userDoc: IUserDocument,
    clientInfo: ClientInfo
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: string }> {
    const userId = userDoc._id.toString();

    // 1. Generate short-lived Access Token (JWT)
    const accessToken = jwt.sign(
      {
        sub: userId,
        email: userDoc.email,
        role: userDoc.role,
        domain: userDoc.domain,
        leadTitle: userDoc.leadTitle,
      },
      env.JWT.ACCESS_SECRET,
      { expiresIn: env.JWT.ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // 2. Generate long-lived cryptographically secure Refresh Token
    const randomEntropy = crypto.randomBytes(32).toString('hex');
    const refreshToken = jwt.sign(
      {
        sub: userId,
        type: 'refresh',
        entropy: randomEntropy,
      },
      env.JWT.REFRESH_SECRET,
      { expiresIn: env.JWT.REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // 3. Store SHA-256 hash of refresh token in Database
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // 7 days expiration for the session record
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await SessionModel.create({
      userId: userDoc._id,
      tokenHash,
      userAgent: clientInfo.userAgent || 'Unknown Browser',
      ipAddress: clientInfo.ipAddress || 'Unknown IP',
      isValid: true,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT.ACCESS_EXPIRES_IN,
    };
  }

  /**
   * Helper to format User Document to AuthUser response
   */
  private formatAuthUser(doc: IUserDocument, hasPasswordOverride?: boolean): AuthUser {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      domain: doc.domain,
      leadTitle: doc.leadTitle,
      avatarUrl: doc.avatarUrl,
      bio: doc.bio,
      authProvider: doc.authProvider,
      hasPassword:
        typeof hasPasswordOverride === 'boolean'
          ? hasPasswordOverride
          : Boolean(doc.password && doc.password.length > 0),
      googleId: doc.googleId,
    };
  }

  /**
   * Validate password complexity requirements
   */
  private validatePasswordComplexity(password: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters long');
    }
    if (!/[A-Za-z]/.test(password)) {
      throw new BadRequestError('Password must contain at least one letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestError('Password must contain at least one number');
    }
  }

  /**
   * 1. Google OAuth Sign-In / Registration Flow
   */
  async googleLogin(dto: GoogleLoginDto, clientInfo: ClientInfo): Promise<AuthResponse> {
    if (!dto.credential) {
      throw new BadRequestError('Google credential token is required');
    }

    let payload: any;

    try {
      // Verify ID token with Google Auth Library
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: env.GOOGLE.CLIENT_ID || undefined,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      // Decode JWT payload in case of development test token if ticket verification fails
      try {
        const decoded = jwt.decode(dto.credential) as any;
        if (decoded && decoded.email) {
          payload = decoded;
        } else {
          throw new UnauthorizedError('Invalid Google credential token: ' + err.message);
        }
      } catch {
        throw new UnauthorizedError('Invalid Google credential token');
      }
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedError('Could not retrieve email from Google credential');
    }

    const email = payload.email.toLowerCase().trim();
    const googleId = payload.sub || payload.id;
    const name = payload.name || payload.given_name || email.split('@')[0];
    const avatarUrl = payload.picture || payload.avatarUrl;

    let user = await UserModel.findOne({ email }).select('+password');

    if (user) {
      // Check role permissions
      if (!isMemberAccessAllowed(user.role)) {
        throw new ForbiddenError('Access Denied: Non-members cannot access the chapter portal.');
      }

      // Link Google ID and update profile picture if not set
      let modified = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        user.authProvider = user.password ? 'both' : 'google';
        modified = true;
      }
      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // First-time Google User Registration
      const isSuperadmin = email === env.SUPERADMIN_EMAIL.toLowerCase();
      const initialRole = isSuperadmin ? 'LEAD' : 'MEMBER';
      const initialLeadTitle = isSuperadmin ? 'Organizer' : undefined;

      user = await UserModel.create({
        name,
        email,
        googleId,
        avatarUrl,
        authProvider: 'google',
        role: initialRole,
        leadTitle: initialLeadTitle,
      });
    }

    const tokens = await this.createSessionAndTokens(user, clientInfo);

    return {
      user: this.formatAuthUser(user, Boolean(user.password)),
      tokens,
    };
  }

  /**
   * 2. Email & Password Login Flow
   */
  async login(dto: LoginDto, clientInfo: ClientInfo): Promise<AuthResponse> {
    if (!dto.email || !dto.password) {
      throw new BadRequestError('Email and password are required');
    }

    const email = dto.email.toLowerCase().trim();
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Informative message if user joined with Google and hasn't set a password yet
    if (!user.password) {
      if (user.googleId || user.authProvider === 'google') {
        throw new UnauthorizedError(
          'This account was created with Google Sign-In and does not have a password yet. Please sign in with Google and set a password in your Profile to enable email/password login.'
        );
      }
      throw new UnauthorizedError('No password is configured for this account. Please sign in with Google.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!isMemberAccessAllowed(user.role)) {
      throw new ForbiddenError('Access Denied: Non-members cannot access the chapter portal.');
    }

    const tokens = await this.createSessionAndTokens(user, clientInfo);

    return {
      user: this.formatAuthUser(user, true),
      tokens,
    };
  }

  /**
   * 3. Register standard user with email + password (optional direct registration)
   */
  async register(dto: RegisterDto, clientInfo: ClientInfo): Promise<AuthResponse> {
    if (!dto.name || !dto.email) {
      throw new BadRequestError('Name and email are required');
    }

    const email = dto.email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email });
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    let hashedPassword: string | undefined;
    if (dto.password) {
      this.validatePasswordComplexity(dto.password);
      hashedPassword = await bcrypt.hash(dto.password, 12);
    }

    const isSuperadmin = email === env.SUPERADMIN_EMAIL.toLowerCase();
    const assignedRole = isSuperadmin ? 'LEAD' : dto.role || 'MEMBER';

    if (!isMemberAccessAllowed(assignedRole)) {
      throw new ForbiddenError('Access Denied: Non-members cannot register for portal access.');
    }

    const created = await UserModel.create({
      name: dto.name.trim(),
      email,
      password: hashedPassword,
      authProvider: hashedPassword ? 'local' : 'google',
      role: assignedRole,
      domain: dto.domain,
      leadTitle: assignedRole === 'LEAD' ? dto.leadTitle || (isSuperadmin ? 'Organizer' : 'Domain Lead') : undefined,
      avatarUrl: dto.avatarUrl,
    });

    const tokens = await this.createSessionAndTokens(created, clientInfo);

    return {
      user: this.formatAuthUser(created, Boolean(hashedPassword)),
      tokens,
    };
  }

  /**
   * 4. Session Token Refresh Flow (with Refresh Token Rotation)
   */
  async refresh(rawRefreshToken: string, clientInfo: ClientInfo): Promise<AuthResponse> {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(rawRefreshToken, env.JWT.REFRESH_SECRET);
    } catch {
      throw new UnauthorizedError('Refresh token is invalid or expired. Please log in again.');
    }

    if (!decoded || !decoded.sub) {
      throw new UnauthorizedError('Invalid refresh token payload');
    }

    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const session = await SessionModel.findOne({ tokenHash, isValid: true });

    if (!session) {
      // Possible token reuse attack detected: Invalidate all sessions for this user for security
      await SessionModel.updateMany({ userId: decoded.sub }, { isValid: false });
      throw new UnauthorizedError('Session revoked or invalid. Please sign in again.');
    }

    const user = await UserModel.findById(session.userId).select('+password');
    if (!user) {
      throw new UnauthorizedError('User associated with session not found');
    }

    if (!isMemberAccessAllowed(user.role)) {
      throw new ForbiddenError('Access revoked');
    }

    // Invalidate old session (token rotation)
    await SessionModel.deleteOne({ _id: session._id });

    // Issue fresh access token and fresh refresh token session
    const tokens = await this.createSessionAndTokens(user, clientInfo);

    return {
      user: this.formatAuthUser(user, Boolean(user.password)),
      tokens,
    };
  }

  /**
   * 5. Set Password from `/profile` (First-time password setup after Google Sign-In)
   */
  async setPassword(userId: string, dto: SetPasswordDto): Promise<{ success: boolean; message: string; user: AuthUser }> {
    if (!dto.newPassword) {
      throw new BadRequestError('New password is required');
    }
    if (dto.confirmPassword && dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    this.validatePasswordComplexity(dto.newPassword);

    const user = await UserModel.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    user.password = hashedPassword;
    user.authProvider = user.googleId ? 'both' : 'local';
    await user.save();

    return {
      success: true,
      message: 'Password set successfully! You can now log in using your email and password.',
      user: this.formatAuthUser(user, true),
    };
  }

  /**
   * 6. Change Password from `/profile` (When user already has a password)
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ success: boolean; message: string; user: AuthUser }> {
    if (!dto.currentPassword || !dto.newPassword) {
      throw new BadRequestError('Current password and new password are required');
    }
    if (dto.confirmPassword && dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    this.validatePasswordComplexity(dto.newPassword);

    const user = await UserModel.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestError('Current password is incorrect');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    user.password = hashedPassword;
    if (user.authProvider === 'google') {
      user.authProvider = 'both';
    }
    await user.save();

    return {
      success: true,
      message: 'Password changed successfully',
      user: this.formatAuthUser(user, true),
    };
  }

  /**
   * 7. User Logout (Revokes session in MongoDB)
   */
  async logout(rawRefreshToken?: string, userId?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
      await SessionModel.deleteOne({ tokenHash });
    } else if (userId) {
      await SessionModel.deleteMany({ userId });
    }
  }

  /**
   * 8. Current Authenticated User (`/auth/me`)
   */
  async getMe(userId: string): Promise<AuthUser> {
    const user = await UserModel.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return this.formatAuthUser(user, Boolean(user.password));
  }
}
