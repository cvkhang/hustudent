import api from '@/lib/api';

// Flashcards
export const getMySets = async () => {
  const res = await api.get('/flashcards');
  return res.data;
};

export const getSet = async (setId) => {
  const res = await api.get(`/flashcards/${setId}`);
  return res.data;
};

export const getStudyCards = async (setId) => {
  const res = await api.get(`/flashcards/${setId}/study`);
  return res.data;
};

// Quizzes
export const getQuizzes = async (params) => {
  const res = await api.get('/quizzes', { params });
  return res.data;
};

export const getQuiz = async (quizId) => {
  const res = await api.get(`/quizzes/${quizId}`);
  return res.data;
};

export const getQuizQuestions = async (quizId) => {
  const res = await api.get(`/quizzes/${quizId}/questions`);
  return res.data;
};

export const submitQuizAttempt = async (quizId, answers) => {
  const res = await api.post(`/quizzes/${quizId}/attempts`, { answers });
  return res.data;
};

// Groups
export const getGroups = async (params) => {
  const res = await api.get('/groups', { params });
  return res.data;
};

export const joinGroup = async (groupId) => {
  const res = await api.post(`/groups/${groupId}/join`);
  return res.data;
};


// Matching
export const getMatchingProfiles = async () => {
  // This assumes there's an endpoint for matching recommendation
  // If not, we might need to use `users` with filters
  const res = await api.get('/matching/recommendations');
  return res.data;
};
