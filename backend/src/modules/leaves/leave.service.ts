import { NotFoundError } from '../../common/errors/app-error';
import { CreateLeaveDto, LeaveApplication, LeaveStatus } from './leave.types';
import { LeaveModel } from './leave.model';

export class LeaveService {
  async getAllLeaves(): Promise<LeaveApplication[]> {
    const docs = await LeaveModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      applicantName: d.applicantName,
      applicantRole: d.applicantRole,
      leaveType: d.leaveType,
      startDate: d.startDate,
      endDate: d.endDate,
      reason: d.reason,
      handoverPerson: d.handoverPerson,
      status: d.status,
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    }));
  }

  async createLeave(dto: CreateLeaveDto): Promise<LeaveApplication> {
    const created: any = await LeaveModel.create({
      ...dto,
      status: 'PENDING',
    });

    return {
      id: created._id.toString(),
      applicantName: created.applicantName,
      applicantRole: created.applicantRole,
      leaveType: created.leaveType,
      startDate: created.startDate,
      endDate: created.endDate,
      reason: created.reason,
      handoverPerson: created.handoverPerson,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async updateStatus(id: string, status: LeaveStatus): Promise<LeaveApplication> {
    const updated: any = await LeaveModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!updated) {
      throw new NotFoundError(`Leave application with id ${id} not found`);
    }

    return {
      id: updated._id.toString(),
      applicantName: updated.applicantName,
      applicantRole: updated.applicantRole,
      leaveType: updated.leaveType,
      startDate: updated.startDate,
      endDate: updated.endDate,
      reason: updated.reason,
      handoverPerson: updated.handoverPerson,
      status: updated.status,
      createdAt: updated.createdAt ? updated.createdAt.toISOString() : new Date().toISOString(),
    };
  }
}
