import React, { useState, useEffect } from 'react';

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({ title: '', description: '', dateTime: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/study-groups');
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/study-groups/${groupId}/join`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to join group');
      alert('Joined group successfully!');
      fetchGroups(); // Refresh list
    } catch (err) {
      alert('Error joining group: ' + err.message);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const response = await fetch('http://localhost:5000/api/study-groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to create group');
      const data = await response.json();
      setGroups([...groups, data.data]);
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleViewSessions = async (groupId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/study-groups/${groupId}/sessions?type=upcoming`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data.data || []);
      setSelectedGroup(groupId);
    } catch (err) {
      alert('Error fetching sessions: ' + err.message);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/study-groups/${selectedGroup}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionFormData)
      });
      if (!response.ok) throw new Error('Failed to create session');
      const data = await response.json();
      setSessions([...sessions, data.data]);
      setSessionFormData({ title: '', description: '', dateTime: '' });
      setShowSessionForm(false);
    } catch (err) {
      alert('Error creating session: ' + err.message);
    }
  };

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Study Groups & Scheduling</h1>
      <button onClick={() => setShowCreateForm(true)}>Create New Group</button>
      {showCreateForm && (
        <form onSubmit={handleCreateGroup}>
          <input
            type="text"
            placeholder="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Group'}
          </button>
          <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
        </form>
      )}
      {groups.length === 0 ? (
        <p>No groups found. Create your first group!</p>
      ) : (
        <ul>
          {groups.map(group => (
            <li key={group.id}>
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <p>Members: {group.members.length}</p>
              <button onClick={() => handleJoinGroup(group.id)}>Join Group</button>
              <button onClick={() => handleViewSessions(group.id)}>View Sessions</button>
            </li>
          ))}
        </ul>
      )}
      {selectedGroup && (
        <div>
          <h2>Sessions for Group {selectedGroup}</h2>
          <button onClick={() => setShowSessionForm(true)}>Create Session</button>
          {showSessionForm && (
            <form onSubmit={handleCreateSession}>
              <input
                type="text"
                placeholder="Session Title"
                value={sessionFormData.title}
                onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={sessionFormData.description}
                onChange={(e) => setSessionFormData({ ...sessionFormData, description: e.target.value })}
                required
              />
              <input
                type="datetime-local"
                value={sessionFormData.dateTime}
                onChange={(e) => setSessionFormData({ ...sessionFormData, dateTime: e.target.value })}
                required
              />
              <button type="submit">Create Session</button>
              <button type="button" onClick={() => setShowSessionForm(false)}>Cancel</button>
            </form>
          )}
          {sessions.length === 0 ? (
            <p>No upcoming sessions.</p>
          ) : (
            <ul>
              {sessions.map(session => (
                <li key={session.id}>
                  <h4>{session.title}</h4>
                  <p>{session.description}</p>
                  <p>Date: {new Date(session.dateTime).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyGroups;