import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // now it's App.tsx

interface User {
  id: string;
  name: string;
  email: string;
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>('http://localhost:5000/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Users</h1>
      {loading ? (
        <p>Loading...</p>
      ) : users.length > 0 ? (
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
    </div>
  );
};

export default App;
