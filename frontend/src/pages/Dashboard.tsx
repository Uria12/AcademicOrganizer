/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentBoard from '../components/AssignmentBoard';
import AssignmentList from '../components/AssignmentList';
import { Assignment } from '../App'; // Importing the type from App

interface DashboardProps {
  assignments: Assignment[];
  error: string | null;
  loading: boolean;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Assignment>) => void;
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
  onUpdate,
  fetchAssignments,
  logout,
  user
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filter, setFilter] = useState('all');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Academic Organizer</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user?.email}</span>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Assignment Form */}
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6 mb-6">
          <AssignmentForm onAdd={fetchAssignments} />
        </div>

        {/* View Mode Toggle and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Filter for list view */}
              {viewMode === 'list' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Filter:</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              
              {/* View mode toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <button
                  onClick={() => setViewMode('board')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'board'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📋 Board
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📝 List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Display */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : viewMode === 'board' ? (
          <AssignmentBoard
            assignments={assignments}
            error={error}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ) : (
          <AssignmentList
            assignments={assignments.filter(assignment => {
              if (filter === 'all') return true;
              return assignment.status === filter;
            })}
            error={error}
            filter={filter}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;