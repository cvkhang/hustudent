import flashcardService from '../services/flashcardService.js';

// Sets
const createSet = async (req, res, next) => {
  try {
    const set = await flashcardService.createSet(req.userId, req.body);
    res.status(201).json({ data: set });
  } catch (e) { next(e); }
};

const getMySets = async (req, res, next) => {
  try {
    const sets = await flashcardService.getSets(req.userId);
    res.json({ data: sets });
  } catch (e) { next(e); }
};

const getPublicSets = async (req, res, next) => {
  try {
    const sets = await flashcardService.getPublicSets(req.query);
    res.json({ data: sets });
  } catch (e) { next(e); }
};

const getSet = async (req, res, next) => {
  try {
    const set = await flashcardService.getSetById(req.params.setId, req.userId);
    res.json({ data: set });
  } catch (e) { next(e); }
};

const updateSet = async (req, res, next) => {
  try {
    const set = await flashcardService.updateSet(req.userId, req.params.setId, req.body);
    res.json({ data: set });
  } catch (e) { next(e); }
};

const deleteSet = async (req, res, next) => {
  try {
    const result = await flashcardService.deleteSet(req.userId, req.params.setId);
    res.json({ data: result });
  } catch (e) { next(e); }
};

// Cards
const addCard = async (req, res, next) => {
  try {
    const card = await flashcardService.addCard(req.userId, req.params.setId, req.body);
    res.status(201).json({ data: card });
  } catch (e) { next(e); }
};

const updateCard = async (req, res, next) => {
  try {
    const card = await flashcardService.updateCard(req.userId, req.params.cardId, req.body);
    res.json({ data: card });
  } catch (e) { next(e); }
};

const deleteCard = async (req, res, next) => {
  try {
    const result = await flashcardService.deleteCard(req.userId, req.params.cardId);
    res.json({ data: result });
  } catch (e) { next(e); }
};

// Study
const getStudyCards = async (req, res, next) => {
  try {
    const cards = await flashcardService.getStudyCards(req.userId, req.params.setId);
    res.json({ data: cards });
  } catch (e) { next(e); }
};

const updateProgress = async (req, res, next) => {
  try {
    const progress = await flashcardService.updateCardProgress(req.userId, req.params.cardId, req.body);
    res.json({ data: progress });
  } catch (e) { next(e); }
};

const getProgress = async (req, res, next) => {
  try {
    const stats = await flashcardService.getSetProgress(req.userId, req.params.setId);
    res.json({ data: stats });
  } catch (e) { next(e); }
};

export default {
  createSet, getMySets, getPublicSets, getSet, updateSet, deleteSet,
  addCard, updateCard, deleteCard,
  getStudyCards, updateProgress, getProgress
};
