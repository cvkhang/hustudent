// Group Model (In-memory for demo)
let groups = [];
let nextId = 1;

export class Group {
  constructor(name, description, creatorId) {
    this.id = nextId++;
    this.name = name;
    this.description = description;
    this.creatorId = creatorId;
    this.createdAt = new Date();
    this.members = [{ userId: creatorId, role: 'admin', joinedAt: new Date() }];
  }

  static create(name, description, creatorId) {
    const group = new Group(name, description, creatorId);
    groups.push(group);
    return group;
  }

  static findAll() {
    return groups;
  }

  static findById(id) {
    return groups.find(g => g.id === id);
  }

  static findByCreator(creatorId) {
    return groups.filter(g => g.creatorId === creatorId);
  }

  static addMember(groupId, userId, role = 'member') {
    const group = this.findById(groupId);
    if (group && !group.members.find(m => m.userId === userId)) {
      group.members.push({ userId, role, joinedAt: new Date() });
      return true;
    }
    return false;
  }

  static removeMember(groupId, userId) {
    const group = this.findById(groupId);
    if (group) {
      group.members = group.members.filter(m => m.userId !== userId);
      return true;
    }
    return false;
  }
}