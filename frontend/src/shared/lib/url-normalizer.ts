/**
 * Normalizes and validates social URLs (GitHub & LinkedIn).
 * Accepts raw usernames, usernames with @, or full URLs.
 * Validates domain integrity and prevents broken/malicious URLs.
 */

export function normalizeGithubUrl(input?: string): { url: string; error?: string } {
  if (!input || !input.trim()) return { url: '' };

  let raw = input.trim();

  // Remove leading @ if present
  if (raw.startsWith('@')) {
    raw = raw.substring(1);
  }

  // If input looks like a simple username without scheme or domain
  if (!raw.includes('/') && !raw.includes('.')) {
    const validUsername = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(raw);
    if (!validUsername) {
      return { url: '', error: 'Invalid GitHub username format. Use only alphanumeric characters and single hyphens.' };
    }
    return { url: `https://github.com/${raw}` };
  }

  // If it doesn't start with http/https, add https:// for parsing
  let candidate = raw;
  if (!candidate.startsWith('http://') && !candidate.startsWith('https://')) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    const hostname = parsed.hostname.toLowerCase();

    // Verify it's genuinely github.com
    if (hostname !== 'github.com' && hostname !== 'www.github.com') {
      return { url: '', error: 'Invalid GitHub URL. Must be a valid github.com profile link.' };
    }

    const pathname = parsed.pathname.replace(/^\/+|\/+$/g, '');
    if (!pathname) {
      return { url: '', error: 'GitHub URL must specify a username profile path (e.g. github.com/username).' };
    }

    return { url: `https://github.com/${pathname}` };
  } catch {
    return { url: '', error: 'Broken or invalid URL structure for GitHub profile.' };
  }
}

export function normalizeLinkedinUrl(input?: string): { url: string; error?: string } {
  if (!input || !input.trim()) return { url: '' };

  let raw = input.trim();

  // Remove leading @ if present
  if (raw.startsWith('@')) {
    raw = raw.substring(1);
  }

  // If input looks like a simple username or handle without slashes or dots
  if (!raw.includes('/') && !raw.includes('.')) {
    const validHandle = /^[a-zA-Z0-9\-_%]+$/.test(raw);
    if (!validHandle) {
      return { url: '', error: 'Invalid LinkedIn username handle format.' };
    }
    return { url: `https://linkedin.com/in/${raw}` };
  }

  // If candidate starts with in/username
  if (raw.startsWith('in/')) {
    const handle = raw.replace('in/', '').trim();
    return { url: `https://linkedin.com/in/${handle}` };
  }

  let candidate = raw;
  if (!candidate.startsWith('http://') && !candidate.startsWith('https://')) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    const hostname = parsed.hostname.toLowerCase();

    // Verify domain contains linkedin.com
    if (!hostname.includes('linkedin.com')) {
      return { url: '', error: 'Invalid LinkedIn URL. Must be a valid linkedin.com profile link.' };
    }

    let pathname = parsed.pathname.replace(/^\/+|\/+$/g, '');
    if (!pathname) {
      return { url: '', error: 'LinkedIn URL must specify a profile path (e.g. linkedin.com/in/username).' };
    }

    // Standardize to /in/ path if not present
    if (!pathname.startsWith('in/') && !pathname.startsWith('pub/') && !pathname.startsWith('company/')) {
      pathname = `in/${pathname}`;
    }

    return { url: `https://www.linkedin.com/${pathname}` };
  } catch {
    return { url: '', error: 'Broken or invalid URL structure for LinkedIn profile.' };
  }
}
