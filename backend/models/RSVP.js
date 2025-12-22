// RSVP Model (In-memory for demo)
let rsvps = [];

export class RSVP {
  constructor(sessionId, userId, status) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.status = status; // 'yes', 'no', 'cancel'
    this.createdAt = new Date();
  }

  static create(sessionId, userId, status) {
    const existing = rsvps.find(r => r.sessionId === sessionId && r.userId === userId);
    if (existing) {
      existing.status = status;
      existing.createdAt = new Date();
      return existing;
    } else {
      const rsvp = new RSVP(sessionId, userId, status);
      rsvps.push(rsvp);
      return rsvp;
    }
  }

  static findBySession(sessionId) {
    return rsvps.filter(r => r.sessionId === sessionId);
  }

  static getAttendeeCount(sessionId) {
    return rsvps.filter(r => r.sessionId === sessionId && r.status === 'yes').length;
  }

  static getUserRSVP(sessionId, userId) {
    return rsvps.find(r => r.sessionId === sessionId && r.userId === userId);
  }
}