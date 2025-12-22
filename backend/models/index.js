import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';

// Initialize Sequelize with Supabase PostgreSQL
const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Supabase requires SSL
    }
  }
});

// Import models (will be created)
// Authentication & Users
import User from './User.js';
import AuthRefreshToken from './AuthRefreshToken.js';

// Friends
import FriendRequest from './FriendRequest.js';
import Friendship from './Friendship.js';

// Chat & Messages
import Chat from './Chat.js';
import Message from './Message.js';
import MessageAttachment from './MessageAttachment.js';

// Groups & Sessions
import Group from './Group.js';
import GroupMember from './GroupMember.js';
import StudySession from './StudySession.js';
import SessionRsvp from './SessionRsvp.js';

// Posts
import Post from './Post.js';
import PostLike from './PostLike.js';
import PostBookmark from './PostBookmark.js';
import PostComment from './PostComment.js';

// Q&A
import Question from './Question.js';
import Answer from './Answer.js';
import AnswerVote from './AnswerVote.js';

// Social Matching
import Subject from './Subject.js';
import UserStudyProfile from './UserStudyProfile.js';
import UserSubject from './UserSubject.js';
import StudyInvitation from './StudyInvitation.js';
import StudyBuddy from './StudyBuddy.js';

// Learning Tools
import FlashcardSet from './FlashcardSet.js';
import Flashcard from './Flashcard.js';
import FlashcardProgress from './FlashcardProgress.js';
import Quiz from './Quiz.js';
import QuizQuestion from './QuizQuestion.js';
import QuizAttempt from './QuizAttempt.js';

// Notifications
import Notification from './Notification.js';

// ============================================
// ASSOCIATIONS
// ============================================

// === User <-> AuthRefreshToken ===
User.hasMany(AuthRefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
AuthRefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// === User <-> FriendRequest ===
User.hasMany(FriendRequest, { foreignKey: 'from_user_id', as: 'sentRequests' });
User.hasMany(FriendRequest, { foreignKey: 'to_user_id', as: 'receivedRequests' });
FriendRequest.belongsTo(User, { foreignKey: 'from_user_id', as: 'fromUser' });
FriendRequest.belongsTo(User, { foreignKey: 'to_user_id', as: 'toUser' });

// === Chat Associations ===
Chat.belongsTo(User, { foreignKey: 'user_a', as: 'userA' });
Chat.belongsTo(User, { foreignKey: 'user_b', as: 'userB' });
Chat.hasMany(Message, { foreignKey: 'chat_id', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.hasMany(MessageAttachment, { foreignKey: 'message_id', as: 'attachments' });
MessageAttachment.belongsTo(Message, { foreignKey: 'message_id', as: 'message' });

// === Group Associations ===
Group.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Group.hasMany(GroupMember, { foreignKey: 'group_id', as: 'members' });
Group.hasMany(StudySession, { foreignKey: 'group_id', as: 'sessions' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });
GroupMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(GroupMember, { foreignKey: 'user_id', as: 'groupMemberships' });

// === StudySession Associations ===
StudySession.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });
StudySession.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
StudySession.hasMany(SessionRsvp, { foreignKey: 'session_id', as: 'rsvps' });
SessionRsvp.belongsTo(StudySession, { foreignKey: 'session_id', as: 'session' });
SessionRsvp.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// === Post Associations ===
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
Post.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });
Post.hasMany(PostLike, { foreignKey: 'post_id', as: 'likes' });
Post.hasMany(PostBookmark, { foreignKey: 'post_id', as: 'bookmarks' });
Post.hasMany(PostComment, { foreignKey: 'post_id', as: 'comments' });
PostLike.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
PostLike.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PostBookmark.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
PostBookmark.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PostComment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
PostComment.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// === Q&A Associations ===
Question.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
Question.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });
Question.hasMany(Answer, { foreignKey: 'question_id', as: 'answers' });
Answer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
Answer.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
Answer.hasMany(AnswerVote, { foreignKey: 'answer_id', as: 'votes' });
AnswerVote.belongsTo(Answer, { foreignKey: 'answer_id', as: 'answer' });
AnswerVote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// === Social Matching Associations ===
User.hasOne(UserStudyProfile, { foreignKey: 'user_id', as: 'studyProfile' });
UserStudyProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserStudyProfile.belongsTo(Subject, { foreignKey: 'learning_status_subject', as: 'currentSubject' });

User.hasMany(UserSubject, { foreignKey: 'user_id', as: 'subjects' });
UserSubject.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserSubject.belongsTo(Subject, { foreignKey: 'subject_code', as: 'subject' });

User.hasMany(StudyInvitation, { foreignKey: 'from_user_id', as: 'sentInvitations' });
User.hasMany(StudyInvitation, { foreignKey: 'to_user_id', as: 'receivedInvitations' });
StudyInvitation.belongsTo(User, { foreignKey: 'from_user_id', as: 'fromUser' });
StudyInvitation.belongsTo(User, { foreignKey: 'to_user_id', as: 'toUser' });
StudyInvitation.belongsTo(Subject, { foreignKey: 'subject_code', as: 'subject' });

StudyBuddy.belongsTo(User, { foreignKey: 'user_a', as: 'userA' });
StudyBuddy.belongsTo(User, { foreignKey: 'user_b', as: 'userB' });
StudyBuddy.belongsTo(Subject, { foreignKey: 'subject_code', as: 'subject' });

// === Flashcard Associations ===
FlashcardSet.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
FlashcardSet.hasMany(Flashcard, { foreignKey: 'set_id', as: 'cards' });
Flashcard.belongsTo(FlashcardSet, { foreignKey: 'set_id', as: 'set' });
FlashcardProgress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
FlashcardProgress.belongsTo(Flashcard, { foreignKey: 'card_id', as: 'card' });

// === Quiz Associations ===
Quiz.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', as: 'questions' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id', as: 'attempts' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
QuizAttempt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// === Notification Associations ===
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// ============================================
// EXPORTS
// ============================================

const db = {
  sequelize,
  Sequelize,
  // Auth & Users
  User,
  AuthRefreshToken,
  // Friends
  FriendRequest,
  Friendship,
  // Chat
  Chat,
  Message,
  MessageAttachment,
  // Groups & Sessions
  Group,
  GroupMember,
  StudySession,
  SessionRsvp,
  // Posts
  Post,
  PostLike,
  PostBookmark,
  PostComment,
  // Q&A
  Question,
  Answer,
  AnswerVote,
  // Social Matching
  Subject,
  UserStudyProfile,
  UserSubject,
  StudyInvitation,
  StudyBuddy,
  // Learning Tools
  FlashcardSet,
  Flashcard,
  FlashcardProgress,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  // Notifications
  Notification
};

export { sequelize };
export default db;
