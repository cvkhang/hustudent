import * as sessionService from '../services/sessionService.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

/**
 * POST /groups/:groupId/sessions
 */
const createSession = async (req, res, next) => {
  try {
    const session = await sessionService.createSession(req.userId, req.params.groupId, req.body);
    res.status(201).json({ data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /groups/:groupId/sessions
 */
const getGroupSessions = async (req, res, next) => {
  try {
    const { from, to, page, limit } = req.query;
    const result = await sessionService.getGroupSessions(req.params.groupId, {
      from, to, page: parseInt(page) || 1, limit: parseInt(limit) || 20
    });
    res.json({ data: result.sessions, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /sessions/:sessionId
 */
const getSession = async (req, res, next) => {
  try {
    const session = await sessionService.getSessionById(req.params.sessionId, req.userId);
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /sessions/:sessionId
 */
const updateSession = async (req, res, next) => {
  try {
    const session = await sessionService.updateSession(req.userId, req.params.sessionId, req.body);
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /sessions/:sessionId
 */
const deleteSession = async (req, res, next) => {
  try {
    const result = await sessionService.deleteSession(req.userId, req.params.sessionId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /sessions/:sessionId/rsvp
 */
const submitRsvp = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'status is required');
    }
    const rsvp = await sessionService.submitRsvp(req.userId, req.params.sessionId, status);
    res.json({ data: rsvp });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /sessions/:sessionId/rsvps
 */
const getSessionRsvps = async (req, res, next) => {
  try {
    const rsvps = await sessionService.getSessionRsvps(req.params.sessionId);
    res.json({ data: rsvps });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /me/sessions
 */
const getUserSessions = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const sessions = await sessionService.getUserSessions(req.userId, { from, to });
    res.json({ data: sessions });
  } catch (error) {
    next(error);
  }
};

export {
  createSession,
  getGroupSessions,
  getSession,
  updateSession,
  deleteSession,
  submitRsvp,
  getSessionRsvps,
  getUserSessions
};
