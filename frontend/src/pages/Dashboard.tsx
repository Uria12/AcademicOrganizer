import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentList from '../components/AssignmentList';
import { Assignment } from '../App'; // Importing the type from App

interface DashboardProps {
  assignments: Assignment[];
  error: string | null;
  loading: boolean;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  fetchAssignments: () => void;
  logout: () => void;
  user?: { email: string };
}

const Dashboard: React.FC<DashboardProps> = ({
  assignments,
  error,
  loading,
  onStatusChange,
  onDelete,
  fetchAssignments,
  logout,
  user
}) => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  
  // Filter and sort assignments
  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  }).sort((a, b) => {
    const dateA = new Date(a.deadline).getTime();
    const dateB = new Date(b.deadline).getTime();
    return sort === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Academic Organizer</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <AssignmentForm onAdd={fetchAssignments} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Filter and Sort Controls */}
          <div className="md:col-span-3 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Filter by Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort by Deadline</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="asc">Earliest First</option>
                  <option value="desc">Latest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignment List */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <AssignmentList
                    assignments={filteredAssignments}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete} error={null} filter={''} onUpdate={function (id: string, updatedData: Partial<{ id: string; title: string; deadline: string; description?: string; status?: string; }>): void {
                      throw new Error('Function not implemented.');
                    } }              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;