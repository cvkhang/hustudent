<<<<<<< HEAD
// StudySession Model (In-memory for demo)
let sessions = [];
let nextSessionId = 1;

export class StudySession {
  constructor(groupId, title, description, dateTime, creatorId) {
    this.id = nextSessionId++;
    this.groupId = groupId;
    this.title = title;
    this.description = description;
    this.dateTime = new Date(dateTime);
    this.creatorId = creatorId;
    this.createdAt = new Date();
    this.rsvps = []; // { userId, status: 'yes'|'no'|'cancel' }
  }

  static create(groupId, title, description, dateTime, creatorId) {
    const session = new StudySession(groupId, title, description, dateTime, creatorId);
    sessions.push(session);
    return session;
  }

  static findByGroup(groupId) {
    return sessions.filter(s => s.groupId === groupId);
  }

  static findUpcomingByGroup(groupId) {
    const now = new Date();
    return sessions.filter(s => s.groupId === groupId && s.dateTime > now);
  }

  static findPastByGroup(groupId) {
    const now = new Date();
    return sessions.filter(s => s.groupId === groupId && s.dateTime <= now);
  }

  static findById(id) {
    return sessions.find(s => s.id === id);
  }

  static addRsvp(sessionId, userId, status) {
    const session = this.findById(sessionId);
    if (session) {
      const existing = session.rsvps.find(r => r.userId === userId);
      if (existing) {
        existing.status = status;
      } else {
        session.rsvps.push({ userId, status });
      }
      return true;
    }
    return false;
  }

  static getAttendeeCount(sessionId) {
    const session = this.findById(sessionId);
    return session ? session.rsvps.filter(r => r.status === 'yes').length : 0;
  }
}
=======
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudySession = sequelize.define('StudySession', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'online' // online | offline
  },
  location_text: {
    type: DataTypes.STRING,
    allowNull: true
  },
  agenda: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'study_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  validate: {
    endAfterStart() {
      if (this.end_time <= this.start_time) {
        throw new Error('End time must be after start time');
      }
    }
  }
});

module.exports = StudySession;
>>>>>>> 462527b96fc15095c276acdd1a184feb484472e6
