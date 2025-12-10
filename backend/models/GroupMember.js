// GroupMember Model (In-memory for demo)
let groupMembers = [];

export class GroupMember {
  constructor(groupId, userId, role = 'member') {
    this.groupId = groupId;
    this.userId = userId;
    this.role = role;
    this.joinedAt = new Date();
  }

  static create(groupId, userId, role) {
    const member = new GroupMember(groupId, userId, role);
    groupMembers.push(member);
    return member;
  }

  static findByGroup(groupId) {
    return groupMembers.filter(m => m.groupId === groupId);
  }

  static findByUser(userId) {
    return groupMembers.filter(m => m.userId === userId);
  }

  static remove(groupId, userId) {
    groupMembers = groupMembers.filter(m => !(m.groupId === groupId && m.userId === userId));
  }

  static isAdmin(groupId, userId) {
    const member = groupMembers.find(m => m.groupId === groupId && m.userId === userId);
    return member && member.role === 'admin';
  }
}