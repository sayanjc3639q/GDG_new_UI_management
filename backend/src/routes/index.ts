import { Router } from 'express';
import { createAuthRouter } from '../modules/auth';
import { createUsersRouter } from '../modules/users';
import { createEventsRouter } from '../modules/events';
import { createTasksRouter } from '../modules/tasks';
import { createMeetingsRouter } from '../modules/meetings';
import { createLeavesRouter } from '../modules/leaves';
import { createRsvpRouter } from '../modules/rsvp';
import { TaskModel } from '../modules/tasks/task.model';
import { MeetingModel } from '../modules/meetings/meeting.model';
import { LeaveModel } from '../modules/leaves/leave.model';
import { EventModel } from '../modules/events/event.model';
import { ApiResponseUtil } from '../common/utils/api-response';

export function createApiRouter(): Router {
  const router = Router();

  // Health check endpoint
  router.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Aggregated live dashboard stats
  router.get('/dashboard/stats', async (_req, res, next) => {
    try {
      const [tasksCount, meetingsCount, leavesCount, eventsCount] = await Promise.all([
        TaskModel.countDocuments(),
        MeetingModel.countDocuments(),
        LeaveModel.countDocuments(),
        EventModel.countDocuments(),
      ]);

      const [recentTasks, upcomingMeetings] = await Promise.all([
        TaskModel.find().sort({ createdAt: -1 }).limit(3).lean(),
        MeetingModel.find().sort({ createdAt: -1 }).limit(3).lean(),
      ]);

      ApiResponseUtil.success(res, {
        stats: {
          tasksCount,
          meetingsCount,
          leavesCount,
          eventsCount,
        },
        recentTasks: recentTasks.map((t: any) => ({
          id: t._id.toString(),
          title: t.title,
          description: t.description,
          assignee: t.assignee,
          domain: t.domain,
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate,
        })),
        upcomingMeetings: upcomingMeetings.map((m: any) => ({
          id: m._id.toString(),
          title: m.title,
          agenda: m.agenda,
          date: m.date,
          time: m.time,
          meetLink: m.meetLink,
          attendeesCount: m.attendeesCount,
          host: m.host,
          status: m.status,
        })),
      });
    } catch (error) {
      next(error);
    }
  });

  // Mount Domain Modules
  router.use('/auth', createAuthRouter());
  router.use('/users', createUsersRouter());
  router.use('/events', createEventsRouter());
  router.use('/tasks', createTasksRouter());
  router.use('/meetings', createMeetingsRouter());
  router.use('/leaves', createLeavesRouter());
  router.use('/rsvp', createRsvpRouter());

  return router;
}
