import React, { useState } from 'react';

type Assignment = {
  id: string;
  title: string;
  deadline: string;
  description?: string;
  status?: string;
};

type AssignmentListProps = {
  assignments: Assignment[];
  error: string | null;
  filter: string;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Assignment, 'title' | 'description' | 'deadline'>>) => void;
};

const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  error,
  filter,
  onStatusChange,
  onDelete,
  onUpdate
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Assignment>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Filter assignments based on status
  const filteredAssignments = filter === 'all' 
    ? assignments 
    : assignments.filter(a => a.status === filter);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle edit start
  const handleEditStart = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setEditForm({
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline.split('.')[0] // Remove milliseconds
    });
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Handle edit save
  const handleEditSave = async (id: string) => {
    if (!editForm.title || !editForm.deadline) return;
    
    try {
      setIsEditing(true);
      await onUpdate(id, editForm);
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error('Error updating assignment:', err);
    } finally {
      setIsEditing(false);
    }
  };

  // Handle edit form change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Status badge styling
  const getStatusStyle = (status: string = 'pending') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (filteredAssignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No assignments found</p>
        <p className="text-sm text-gray-400 mt-2">
          {filter !== 'all' ? `Try changing your filter settings` : 'Create a new assignment to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredAssignments.map(assignment => (
        <div key={assignment.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          {editingId === assignment.id ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={editForm.deadline || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editForm.description || ''}
                  onChange={handleEditChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditSave(assignment.id)}
                  disabled={isEditing}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm disabled:bg-green-400"
                >
                  {isEditing ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleEditCancel}
                  disabled={isEditing}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-800">{assignment.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(assignment.status)}`}>
                  {assignment.status?.replace('-', ' ') || 'pending'}
                </span>
              </div>
              
              {assignment.description && (
                <p className="mt-2 text-gray-600 text-sm">{assignment.description}</p>
              )}
              
              <div className="mt-3 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Due: <span className="font-medium">{formatDate(assignment.deadline)}</span>
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <select
                    value={assignment.status || 'pending'}
                    onChange={(e) => onStatusChange(assignment.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  <button
                    onClick={() => handleEditStart(assignment)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => onDelete(assignment.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default AssignmentList;