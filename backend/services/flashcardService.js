import { Op } from 'sequelize';
import { FlashcardSet, Flashcard, FlashcardProgress, User, sequelize } from '../models/index.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

// ==========================================
// FLASHCARD SETS
// ==========================================
const createSet = async (userId, { title, description, tags, visibility }) => {
  const set = await FlashcardSet.create({
    owner_id: userId,
    title,
    description,
    tags: tags || [],
    visibility: visibility || 'private'
  });
  return set;
};

const getSets = async (userId, { visibility } = {}) => {
  const where = { owner_id: userId };

  const sets = await FlashcardSet.findAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'full_name'] }],
    order: [['updated_at', 'DESC']]
  });

  // Calculate progress for each set
  // Note: This is an N+1 query pattern, effective for MVP but consider optimizing with a raw query for scale.
  for (const set of sets) {
    const stats = await getSetProgress(userId, set.id);
    const percentage = stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0;
    set.setDataValue('progress', percentage);
    set.setDataValue('stats', stats);
  }

  return sets;
};

const getPublicSets = async ({ q, tags } = {}) => {
  const where = { visibility: 'public' };
  if (q) where.title = { [Op.iLike]: `%${q}%` };
  if (tags) where.tags = { [Op.overlap]: tags };

  return FlashcardSet.findAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'full_name'] }],
    order: [['created_at', 'DESC']],
    limit: 50
  });
};

const getSetById = async (setId, userId) => {
  const set = await FlashcardSet.findByPk(setId, {
    include: [
      { model: User, as: 'owner', attributes: ['id', 'full_name'] },
      { model: Flashcard, as: 'cards', order: [['position', 'ASC']] }
    ]
  });

  if (!set) throw new AppError(ErrorCodes.NOT_FOUND, 'Flashcard set not found');

  // Check visibility
  if (set.visibility !== 'public' && set.owner_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Cannot access this set');
  }

  return set;
};

const updateSet = async (userId, setId, updates) => {
  const set = await FlashcardSet.findByPk(setId);
  if (!set) throw new AppError(ErrorCodes.NOT_FOUND, 'Set not found');
  if (set.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your set');

  await set.update(updates);
  return set;
};

const deleteSet = async (userId, setId) => {
  const set = await FlashcardSet.findByPk(setId);
  if (!set) throw new AppError(ErrorCodes.NOT_FOUND, 'Set not found');
  if (set.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your set');

  await set.destroy();
  return { message: 'Set deleted' };
};

// ==========================================
// FLASHCARDS
// ==========================================
const addCard = async (userId, setId, { front, back, hint }) => {
  const set = await FlashcardSet.findByPk(setId);
  if (!set) throw new AppError(ErrorCodes.NOT_FOUND, 'Set not found');
  if (set.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your set');

  const position = await Flashcard.count({ where: { set_id: setId } });

  const card = await Flashcard.create({
    set_id: setId,
    front,
    back,
    hint,
    position
  });

  await set.increment('card_count');
  return card;
};

const updateCard = async (userId, cardId, updates) => {
  const card = await Flashcard.findByPk(cardId, {
    include: [{ model: FlashcardSet, as: 'set' }]
  });
  if (!card) throw new AppError(ErrorCodes.NOT_FOUND, 'Card not found');
  if (card.set.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your card');

  await card.update(updates);
  return card;
};

const deleteCard = async (userId, cardId) => {
  const card = await Flashcard.findByPk(cardId, {
    include: [{ model: FlashcardSet, as: 'set' }]
  });
  if (!card) throw new AppError(ErrorCodes.NOT_FOUND, 'Card not found');
  if (card.set.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your card');

  await card.set.decrement('card_count');
  await card.destroy();
  return { message: 'Card deleted' };
};

// ==========================================
// STUDY MODE
// ==========================================
const getStudyCards = async (userId, setId) => {
  const set = await getSetById(setId, userId);

  // Get user progress for this set
  const progress = await FlashcardProgress.findAll({
    where: { user_id: userId },
    include: [{
      model: Flashcard,
      as: 'card',
      where: { set_id: setId }
    }]
  });

  const progressMap = {};
  progress.forEach(p => { progressMap[p.card_id] = p; });

  return set.cards.map(card => ({
    ...card.toJSON(),
    progress: progressMap[card.id] || { status: 'unknown', review_count: 0 }
  }));
};

const updateCardProgress = async (userId, cardId, { status }) => {
  const card = await Flashcard.findByPk(cardId);
  if (!card) throw new AppError(ErrorCodes.NOT_FOUND, 'Card not found');

  const [progress, created] = await FlashcardProgress.findOrCreate({
    where: { user_id: userId, card_id: cardId },
    defaults: { user_id: userId, card_id: cardId, status, review_count: 1, last_reviewed_at: new Date() }
  });

  if (!created) {
    await progress.update({
      status,
      review_count: progress.review_count + 1,
      last_reviewed_at: new Date()
    });
  }

  return progress;
};

const getSetProgress = async (userId, setId) => {
  const set = await FlashcardSet.findByPk(setId);
  if (!set) throw new AppError(ErrorCodes.NOT_FOUND, 'Set not found');

  const [results] = await sequelize.query(`
    SELECT 
      fp.status,
      COUNT(*) as count
    FROM flashcard_progress fp
    JOIN flashcards f ON f.id = fp.card_id
    WHERE fp.user_id = :userId AND f.set_id = :setId
    GROUP BY fp.status
  `, {
    replacements: { userId, setId }
  });

  const stats = { known: 0, unknown: 0, learning: 0, total: set.card_count };
  results.forEach(r => { stats[r.status] = parseInt(r.count); });

  return stats;
};

export default {
  createSet, getSets, getPublicSets, getSetById, updateSet, deleteSet,
  addCard, updateCard, deleteCard,
  getStudyCards, updateCardProgress, getSetProgress
};
