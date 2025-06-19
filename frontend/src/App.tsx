import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContainer from './components/auth/AuthContainer';
import AssignmentForm from './components/AssignmentForm';
import AssignmentList from './components/AssignmentList';

// Type definitions
type User = {
  id: string;
  email: string;
};

type Assignment = {
  id: string;
  title: string;
  deadline: string;
  description?: string;
  status?: string;
};

// Main App Component
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you would verify the token with your backend
      console.log('🔐 User token found, assuming authenticated');
      // For demo, just set a dummy user
      setUser({ id: 'demo-user', email: 'user@example.com' });
    }
  }, []);

  // Handle authentication success
  const handleAuthSuccess = (userData: User, token: string) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    console.log('👋 User logged out');
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    if (!user) return;
    
    console.log('🔄 Fetching assignments...');
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/assignments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }

      const sorted = [...data].sort((a, b) => {
        const da = new Date(a.deadline).getTime();
        const db = new Date(b.deadline).getTime();
        return sort === 'asc' ? da - db : db - da;
      });

      setAssignments(sorted);
    } catch (err) {
      console.error('❌ Error fetching assignments:', err);
      setError(`Failed to load assignments: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle assignment status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    console.log(`🔄 Updating assignment ${id} to status: ${newStatus}`);
    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update assignment ${id}`);
      }

      setAssignments(prev => 
        prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      console.error(`❌ Error updating assignment ${id}:`, err);
      alert('Failed to update status. Try again later.');
    }
  };

  // Handle assignment deletion
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete assignment');
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('❌ Error deleting assignment:', err);
      alert('Failed to delete assignment. Try again.');
    }
  };

  // Handle assignment update
  const handleUpdate = async (
    id: string,
    updates: Partial<Pick<Assignment, 'title' | 'description' | 'deadline'>>
  ) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update assignment');
      const updated = await res.json();
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    } catch (err) {
      console.error('❌ Error updating assignment:', err);
      alert('Failed to update. Try again.');
    }
  };

  // Load assignments when user changes
  useEffect(() => {
    if (user) {
      fetchAssignments();
    } else {
      setAssignments([]);
    }
  }, [user]);

  // Dashboard component
  const Dashboard: React.FC = () => (
    <div className="p-4 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800">Academic Organizer</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, {user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <AssignmentForm onAdd={fetchAssignments} />

      <div className="flex gap-4 items-center mb-4 mt-6 p-4 bg-white rounded-lg shadow">
        <div>
          <label className="mr-2 font-medium">Filter by status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded shadow-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium">Sort by deadline:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
            className="p-2 border rounded shadow-sm"
          >
            <option value="asc">Earliest First</option>
            <option value="desc">Latest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading assignments...</p>
        </div>
      ) : (
        <AssignmentList
          assignments={assignments}
          error={error}
          filter={filter}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <AuthContainer onSuccess={handleAuthSuccess} />}
        />
      </Routes>
    </Router>
  );
};

export default App;