import React, { useState, useEffect } from 'react';

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudyGroups;