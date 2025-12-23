import api from '@/lib/api';

const groupService = {
  getGroups: async (params) => {
    const res = await api.get('/groups', { params });
    return res.data.data;
  },
  createGroup: async (data) => {
    const res = await api.post('/groups', data);
    return res.data.data;
  },
  getGroupDetails: async (id) => {
    const res = await api.get(`/groups/${id}`);
    return res.data.data;
  },
  joinGroup: async (id) => {
    const res = await api.post(`/groups/${id}/join`);
    return res.data;
  },
  leaveGroup: async (id) => {
    const res = await api.post(`/groups/${id}/leave`);
    return res.data;
  },
  getMembers: async (id) => {
    const res = await api.get(`/groups/${id}/members`);
    return res.data.data;
  },
  // Sessions
  getSessions: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/sessions`);
    return res.data.data;
  },
  createSession: async (groupId, data) => {
    const res = await api.post(`/groups/${groupId}/sessions`, data);
    return res.data.data;
  },
  rsvpSession: async (sessionId, status) => {
    const res = await api.post(`/sessions/${sessionId}/rsvp`, { status });
    return res.data.data;
  },

  // New features
  getSessionAttendees: async (sessionId) => {
    const res = await api.get(`/sessions/${sessionId}/attendees`);
    return res.data.data;
  },

  getMySchedule: async () => {
    const res = await api.get('/sessions/schedule');
    return res.data.data;
  },

  deleteSession: async (sessionId) => {
    const res = await api.delete(`/sessions/${sessionId}`);
    return res.data;
  },

  updateSession: async (sessionId, data) => {
    const res = await api.patch(`/sessions/${sessionId}`, data);
    return res.data.data;
  },

  getGroupChat: async (groupId) => {
    const res = await api.get(`/chats/group/${groupId}`);
    return res.data.data;
  },

  getChatMessages: async (chatId, params) => {
    const res = await api.get(`/chats/${chatId}/messages`, { params });
    return res.data.data;
  },

  sendChatMessage: async (chatId, formData) => {
    const res = await api.post(`/chats/${chatId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  }
};

export default groupService;
