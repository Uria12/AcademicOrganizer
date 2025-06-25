import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import apiClient from './api/client';

// Main App Component
const App: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch assignments with useCallback
  const fetchAssignments = useCallback(async () => {
    if (!isAuthenticated) return;
    
    console.log('🔄 Fetching assignments...');
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/assignments');
      
      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }

      setAssignments(data);
    } catch (err) {
      console.error('❌ Error fetching assignments:', err);
      setError(`Failed to load assignments: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Handle assignment status change
  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    console.log(`🔄 Updating assignment ${id} to status: ${newStatus}`);
    try {
      await apiClient.put(`/assignments/${id}`, { status: newStatus });
      setAssignments(prev => 
        prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      console.error(`❌ Error updating assignment ${id}:`, err);
      alert('Failed to update status. Try again later.');
    }
  }, []);

  // Handle assignment deletion
  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('❌ Error deleting assignment:', err);
      alert('Failed to delete assignment. Try again.');
    }
  }, []);

  // Handle assignment update
  const handleUpdate = useCallback(async (id: string, updatedData: Partial<Assignment>) => {
    console.log(`🔄 Updating assignment ${id} with data:`, updatedData);
    try {
      await apiClient.put(`/assignments/${id}`, updatedData);
      setAssignments(prev => 
        prev.map(a => a.id === id ? { ...a, ...updatedData } : a)
      );
    } catch (err) {
      console.error(`❌ Error updating assignment ${id}:`, err);
      alert('Failed to update assignment. Try again later.');
    }
  }, []);

  // Load assignments when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchAssignments();
    } else {
      setAssignments([]);
    }
  }, [isAuthenticated, fetchAssignments]);

  const DarkModeToggle: React.FC = () => {
    const [dark, setDark] = useState(() =>
      window.matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, [dark]);

    return (
      <button
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setDark(d => !d)}
      >
        {dark ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
        )}
      </button>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DarkModeToggle />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  assignments={assignments}
                  error={error}
                  loading={loading}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  fetchAssignments={fetchAssignments}
                  logout={logout}
                  user={user ?? undefined}
                />
              } 
            />
            <Route 
              path="/" 
              element={
                <Dashboard 
                  assignments={assignments}
                  error={error}
                  loading={loading}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  fetchAssignments={fetchAssignments}
                  logout={logout}
                  user={user ?? undefined}
                />
              } 
            />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
};

// Type definitions - moved outside component
export type Assignment = {
  id: string;
  title: string;
  deadline: string;
  description?: string;
  status?: string;
};

export default App;