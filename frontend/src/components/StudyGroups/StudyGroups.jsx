import React, { useState, useEffect } from 'react';

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Study Groups & Scheduling</h1>
      {groups.length === 0 ? (
        <p>No groups found. Create your first group!</p>
      ) : (
        <ul>
          {groups.map(group => (
            <li key={group.id}>
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <p>Members: {group.members.length}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudyGroups;