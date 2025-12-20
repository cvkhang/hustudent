import { Op } from 'sequelize';
import { User, Question, Answer, AnswerVote, Group, sequelize } from '../models.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

const createQuestion = async (userId, { title, content, tags, visibility = 'public', groupId, attachment_url, attachment_name }) => {
  if (!title || !content) throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Title and content are required');
  const question = await Question.create({
    author_id: userId,
    group_id: groupId,
    visibility,
    title,
    content,
    tags: tags || [],
    attachment_url: attachment_url || null,
    attachment_name: attachment_name || null
  });
  return getQuestionById(question.id, userId);
};

const getQuestionById = async (questionId, userId = null) => {
  const question = await Question.findByPk(questionId, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] },
      {
        model: Answer, as: 'answers', where: { deleted_at: null }, required: false,
        include: [
          { model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] }
        ],
        order: [['vote_score', 'DESC'], ['created_at', 'ASC']]
      }
    ]
  });
  if (!question || question.deleted_at) throw new AppError(ErrorCodes.NOT_FOUND, 'Question not found');

  const answerCount = await Answer.count({ where: { question_id: questionId, deleted_at: null } });

  // Fetch user votes for all answers
  const questionData = question.toJSON();
  if (userId && questionData.answers && questionData.answers.length > 0) {
    const answerIds = questionData.answers.map(a => a.id);
    const userVotes = await AnswerVote.findAll({
      where: { answer_id: answerIds, user_id: userId },
      attributes: ['answer_id', 'value']
    });

    const voteMap = {};
    userVotes.forEach(v => { voteMap[v.answer_id] = v.value; });

    questionData.answers = questionData.answers.map(answer => ({
      ...answer,
      user_vote: voteMap[answer.id] || 0
    }));
  }

  return { ...questionData, answerCount };
};

const searchQuestions = async (userId, { q, tag, scope, groupId, author_id, solved, sort = 'new', page = 1, limit = 20 }) => {
  const where = { deleted_at: null };
  if (q) where.title = { [Op.iLike]: `%${q}%` };
  if (tag) {
    // Use literal with explicit TEXT array cast to avoid type mismatch
    where[Op.and] = sequelize.literal(`tags && ARRAY['${tag}']::TEXT[]`);
  }
  if (groupId) where.group_id = groupId;
  if (author_id) where.author_id = author_id;
  if (solved) where.best_answer_id = { [Op.not]: null };

  const offset = (page - 1) * limit;
  const order = sort === 'top' ? [['created_at', 'DESC']] : [['created_at', 'DESC']];

  const { rows, count } = await Question.findAndCountAll({
    where,
    include: [
      { model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] },
      // Include answers to get count
      {
        model: Answer,
        as: 'answers',
        attributes: ['id'],
        where: { deleted_at: null },
        required: false
      }
    ],
    limit,
    offset,
    order
  });

  // Add answerCount to each question
  const questionsWithCount = rows.map(q => {
    const qData = q.toJSON();
    return {
      ...qData,
      answerCount: qData.answers ? qData.answers.length : 0,
      answers: undefined // Remove answers array to reduce payload size
    };
  });

  return {
    questions: questionsWithCount,
    meta: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
  };
};

const updateQuestion = async (userId, questionId, updates) => {
  const question = await Question.findByPk(questionId);
  if (!question || question.deleted_at) throw new AppError(ErrorCodes.NOT_FOUND, 'Question not found');
  if (question.author_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Only author can edit');
  await question.update({ title: updates.title, content: updates.content, tags: updates.tags });
  return getQuestionById(questionId, userId);
};

const deleteQuestion = async (userId, questionId) => {
  const question = await Question.findByPk(questionId);
  if (!question || question.deleted_at) throw new AppError(ErrorCodes.NOT_FOUND, 'Question not found');
  if (question.author_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Only author can delete');
  await question.update({ deleted_at: new Date() });
  return { message: 'Question deleted' };
};

const createAnswer = async (userId, questionId, content) => {
  const question = await Question.findByPk(questionId);
  if (!question || question.deleted_at) throw new AppError(ErrorCodes.NOT_FOUND, 'Question not found');
  if (!content) throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Content is required');

  const answer = await Answer.create({ question_id: questionId, author_id: userId, content });
  return Answer.findByPk(answer.id, { include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] }] });
};

const updateAnswer = async (userId, answerId, content) => {
  const answer = await Answer.findByPk(answerId);
  if (!answer || answer.deleted_at) throw new AppError(ErrorCodes.NOT_FOUND, 'Answer not found');
  if (answer.author_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Only author can edit');
  await answer.update({ content });
  return answer;
};

const deleteAnswer = async (userId, answerId) => {
  const answer = await Answer.findByPk(answerId);
  if (!answer || answer.deleted_at) throw new AppError(ErrorCodes.NOT_FOUND, 'Answer not found');
  if (answer.author_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Only author can delete');
  await answer.update({ deleted_at: new Date() });
  return { message: 'Answer deleted' };
};

const voteAnswer = async (userId, answerId, value) => {
  if (![1, -1, 0].includes(value)) throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Value must be 1, -1, or 0');
  const answer = await Answer.findByPk(answerId);
  if (!answer || answer.deleted_at) throw new AppError(ErrorCodes.NOT_FOUND, 'Answer not found');

  const existingVote = await AnswerVote.findOne({
    where: { answer_id: answerId, user_id: userId }
  });

  let scoreDelta = 0;

  if (value === 0) {
    // Remove vote
    if (existingVote) {
      scoreDelta = -existingVote.value;
      await existingVote.destroy();
    }
  } else {
    // Add or update vote
    if (existingVote) {
      scoreDelta = value - existingVote.value;
      await existingVote.update({ value });
    } else {
      scoreDelta = value;
      await AnswerVote.create({ answer_id: answerId, user_id: userId, value });
    }
  }

  await answer.increment('vote_score', { by: scoreDelta });
  await answer.reload();
  return { voteScore: answer.vote_score, userVote: value };
};

const setBestAnswer = async (userId, questionId, answerId) => {
  const question = await Question.findByPk(questionId);
  if (!question || question.deleted_at) throw new AppError(ErrorCodes.NOT_FOUND, 'Question not found');
  if (question.author_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Only question author can set best answer');

  const answer = await Answer.findByPk(answerId);
  console.log('🔍 Debug setBestAnswer:', {
    answerId,
    questionId,
    answerQuestionId: answer?.question_id,
    questionIdType: typeof questionId,
    answerQuestionIdType: typeof answer?.question_id,
    answerExists: !!answer,
    answerDeleted: answer?.deleted_at,
    match: answer?.question_id === parseInt(questionId)
  });

  if (!answer) throw new AppError(ErrorCodes.NOT_FOUND, 'Answer not found');
  if (answer.deleted_at) throw new AppError(ErrorCodes.NOT_FOUND, 'Answer has been deleted');
  if (answer.question_id !== parseInt(questionId)) throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Answer does not belong to this question');

  await question.update({ best_answer_id: answerId });
  return { message: 'Best answer set' };
};

export default { createQuestion, getQuestionById, searchQuestions, updateQuestion, deleteQuestion, createAnswer, updateAnswer, deleteAnswer, voteAnswer, setBestAnswer };
