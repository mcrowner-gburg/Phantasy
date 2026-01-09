// src/App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>('http://localhost:5000/api/admin/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Admin Users</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          {users.length > 0 ? (
            <ul>
              {users.map(user => (
                <li key={user.id}>
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          ) : (
            <p>No users found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default App;
export default function App() {
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setServerMessage(data.message))
      .catch(err => setServerMessage('Error connecting to server'));
  }, []);

  return (
    <div>
      <h1>Hello Phantasy!</h1>
      <p>{serverMessage}</p>
    </div>
  );
}
