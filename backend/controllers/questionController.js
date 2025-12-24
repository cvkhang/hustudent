import questionService from '../services/questionService.js';
import uploadService from '../services/uploadService.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

const createQuestion = async (req, res, next) => {
  try {
    let data = { ...req.body };

    // Parse tags if it's a JSON string (from FormData)
    if (typeof data.tags === 'string') {
      try {
        data.tags = JSON.parse(data.tags);
      } catch (e) {
        data.tags = [];
      }
    }

    // Handle file upload
    if (req.file) {
      const uploadedFile = await uploadService.uploadFile(
        uploadService.BUCKETS.attachments,
        req.file,
        'questions'
      );
      data.attachment_url = uploadedFile.url;
      data.attachment_name = req.file.originalname;
    }

    const q = await questionService.createQuestion(req.userId, data);
    res.status(201).json({ data: q });
  } catch (e) {
    next(e);
  }
};

const getQuestions = async (req, res, next) => {
  try {
    const r = await questionService.searchQuestions(req.userId, req.query);
    res.json({ data: r.questions, meta: r.meta });
  } catch (e) {
    next(e);
  }
};

const getQuestion = async (req, res, next) => {
  try {
    const q = await questionService.getQuestionById(req.params.questionId, req.userId);
    res.json({ data: q });
  } catch (e) {
    next(e);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const q = await questionService.updateQuestion(req.userId, req.params.questionId, req.body);
    res.json({ data: q });
  } catch (e) {
    next(e);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const r = await questionService.deleteQuestion(req.userId, req.params.questionId);
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
};

const createAnswer = async (req, res, next) => {
  try {
    const a = await questionService.createAnswer(req.userId, req.params.questionId, req.body.content);
    res.status(201).json({ data: a });
  } catch (e) {
    next(e);
  }
};

const updateAnswer = async (req, res, next) => {
  try {
    const a = await questionService.updateAnswer(req.userId, req.params.answerId, req.body.content);
    res.json({ data: a });
  } catch (e) {
    next(e);
  }
};

const deleteAnswer = async (req, res, next) => {
  try {
    const r = await questionService.deleteAnswer(req.userId, req.params.answerId);
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
};

const voteAnswer = async (req, res, next) => {
  try {
    const r = await questionService.voteAnswer(req.userId, req.params.answerId, req.body.value);
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
};

const setBestAnswer = async (req, res, next) => {
  try {
    const r = await questionService.setBestAnswer(req.userId, req.params.questionId, req.body.answerId);
    res.json({ data: r });
  } catch (e) {
    next(e);
  }
};

export default { createQuestion, getQuestions, getQuestion, updateQuestion, deleteQuestion, createAnswer, updateAnswer, deleteAnswer, voteAnswer, setBestAnswer };
