import matchingService from '../services/matchingService.js';

// === SUBJECTS ===
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await matchingService.getAllSubjects(req.query);
    res.json({ data: subjects });
  } catch (e) { next(e); }
};

export const getSubject = async (req, res, next) => {
  try {
    const subject = await matchingService.getSubjectByCode(req.params.code);
    res.json({ data: subject });
  } catch (e) { next(e); }
};

// === STUDY PROFILE ===
export const getStudyProfile = async (req, res, next) => {
  try {
    const profile = await matchingService.getStudyProfile(req.userId);
    res.json({ data: profile });
  } catch (e) { next(e); }
};

export const updateStudyProfile = async (req, res, next) => {
  try {
    const profile = await matchingService.updateStudyProfile(req.userId, req.body);
    res.json({ data: profile });
  } catch (e) { next(e); }
};

export const updateLearningStatus = async (req, res, next) => {
  try {
    const { status, subjectCode } = req.body;
    const profile = await matchingService.updateLearningStatus(req.userId, { status, subjectCode });
    res.json({ data: profile });
  } catch (e) { next(e); }
};

// === USER SUBJECTS ===
export const getUserSubjects = async (req, res, next) => {
  try {
    const subjects = await matchingService.getUserSubjects(req.userId);
    res.json({ data: subjects });
  } catch (e) { next(e); }
};

export const addUserSubject = async (req, res, next) => {
  try {
    const subject = await matchingService.addUserSubject(req.userId, req.body);
    res.status(201).json({ data: subject });
  } catch (e) { next(e); }
};

export const updateUserSubject = async (req, res, next) => {
  try {
    const subject = await matchingService.updateUserSubject(req.userId, req.params.code, req.body);
    res.json({ data: subject });
  } catch (e) { next(e); }
};

export const removeUserSubject = async (req, res, next) => {
  try {
    const result = await matchingService.removeUserSubject(req.userId, req.params.code);
    res.json({ data: result });
  } catch (e) { next(e); }
};

// === SUGGESTIONS ===
export const getFriendSuggestions = async (req, res, next) => {
  try {
    const suggestions = await matchingService.getFriendSuggestions(req.userId, req.query);
    res.json({ data: suggestions });
  } catch (e) { next(e); }
};

export const getRecommendedGroups = async (req, res, next) => {
  try {
    const groups = await matchingService.getRecommendedGroups(req.userId, req.query);
    res.json({ data: groups });
  } catch (e) { next(e); }
};

// === STUDY INVITATIONS ===
export const sendStudyInvitation = async (req, res, next) => {
  try {
    const invitation = await matchingService.sendStudyInvitation(req.userId, req.body);
    res.status(201).json({ data: invitation });
  } catch (e) { next(e); }
};

export const getStudyInvitations = async (req, res, next) => {
  try {
    const invitations = await matchingService.getStudyInvitations(req.userId, req.query);
    res.json({ data: invitations });
  } catch (e) { next(e); }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const result = await matchingService.respondToInvitation(req.userId, req.params.id, true);
    res.json({ data: result });
  } catch (e) { next(e); }
};

export const declineInvitation = async (req, res, next) => {
  try {
    const result = await matchingService.respondToInvitation(req.userId, req.params.id, false);
    res.json({ data: result });
  } catch (e) { next(e); }
};

// === STUDY BUDDIES ===
export const getStudyBuddies = async (req, res, next) => {
  try {
    const buddies = await matchingService.getStudyBuddies(req.userId);
    res.json({ data: buddies });
  } catch (e) { next(e); }
};

export default {
  getSubjects, getSubject,
  getStudyProfile, updateStudyProfile, updateLearningStatus,
  getUserSubjects, addUserSubject, updateUserSubject, removeUserSubject,
  getFriendSuggestions, getRecommendedGroups,
  sendStudyInvitation, getStudyInvitations, acceptInvitation, declineInvitation,
  getStudyBuddies
};
