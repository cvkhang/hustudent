import studySessionService from '../services/studySessionService.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

const createSession = async (req, res, next) => {
  try {
    const session = await studySessionService.createSession(req.params.groupId, req.body, req.userId);
    res.status(201).json({ success: true, data: session, message: 'Session created successfully' });
  } catch (error) {
    next(error);
  }
};

const getGroupSessions = async (req, res, next) => {
  try {
    const sessions = await studySessionService.getGroupSessions(req.params.groupId, req.userId);
    res.json({ data: sessions });
  } catch (error) {
    next(error);
  }
};

const rsvpSession = async (req, res, next) => {
  try {
    const rsvp = await studySessionService.rsvpSession(req.params.id, req.userId, req.body.status);
    res.json({ success: true, data: rsvp, message: 'RSVP updated' });
  } catch (error) {
    next(error);
  }
};
const getSessionAttendees = async (req, res, next) => {
  try {
    const attendees = await studySessionService.getSessionAttendees(req.params.id);
    res.json({ success: true, data: attendees });
  } catch (error) {
    next(error);
  }
};

const getMySchedule = async (req, res, next) => {
  try {
    const schedule = await studySessionService.getMySchedule(req.userId);
    res.json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

const deleteSession = async (req, res, next) => {
  try {
    await studySessionService.deleteSession(req.params.id, req.userId);
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const updateSession = async (req, res, next) => {
  try {
    const session = await studySessionService.updateSession(req.params.id, req.userId, req.body);
    res.json({ success: true, data: session, message: 'Session updated successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  createSession,
  getGroupSessions,
  rsvpSession,
  getSessionAttendees,
  getMySchedule,
  deleteSession,
  updateSession
};
