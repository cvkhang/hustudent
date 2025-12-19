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