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