import React, { useState } from 'react';

type Assignment = {
  id: string;
  title: string;
  deadline: string;
  description?: string;
  status?: string;
};

type Props = {
  assignments: Assignment[];
  error: string | null;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Assignment>) => void;
};

const AssignmentBoard: React.FC<Props> = ({ 
  assignments, 
  error, 
  onStatusChange, 
  onDelete, 
  onUpdate 
}) => {
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Assignment>>({});

  // Group assignments by status
  const groupedAssignments = {
    pending: assignments.filter(a => a.status === 'pending' || !a.status),
    'in-progress': assignments.filter(a => a.status === 'in-progress'),
    completed: assignments.filter(a => a.status === 'completed')
  };

  const statusConfig = {
    pending: {
      title: '📋 Pending',
      color: 'bg-yellow-50 border-yellow-200',
      headerColor: 'bg-yellow-500',
      cardColor: 'bg-yellow-50 hover:bg-yellow-100'
    },
    'in-progress': {
      title: '🔄 In Progress',
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-500',
      cardColor: 'bg-blue-50 hover:bg-blue-100'
    },
    completed: {
      title: '✅ Completed',
      color: 'bg-green-50 border-green-200',
      headerColor: 'bg-green-500',
      cardColor: 'bg-green-50 hover:bg-green-100'
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">Overdue</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium">Due Today</span>;
    } else if (diffDays === 1) {
      return <span className="text-orange-500 font-medium">Due Tomorrow</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-600 font-medium">Due in {diffDays} days</span>;
    } else {
      return <span className="text-gray-600">Due {date.toLocaleDateString()}</span>;
    }
  };

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <div className={`${statusConfig[assignment.status as keyof typeof statusConfig]?.cardColor || 'bg-gray-50'} 
      border border-gray-200 rounded-lg p-4 mb-3 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer`}>
      {editId === assignment.id ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title || ''}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Title"
          />
          <textarea
            value={editData.description || ''}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Description"
            rows={3}
          />
          <input
            type="datetime-local"
            value={editData.deadline || ''}
            onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onUpdate(assignment.id, editData);
                setEditId(null);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditId(null)}
              className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1 mr-2">{assignment.title}</h3>
            <div className="flex space-x-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditId(assignment.id);
                  setEditData({
                    title: assignment.title,
                    description: assignment.description,
                    deadline: assignment.deadline.slice(0, 16),
                  });
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(assignment.id);
                }}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {assignment.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">{assignment.description}</p>
          )}
          
          <div className="text-xs text-gray-500 mb-3">
            {formatDeadline(assignment.deadline)}
          </div>
          
          <select
            value={assignment.status || 'pending'}
            onChange={(e) => onStatusChange(assignment.id, e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="pending">📋 Pending</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Mobile: Single column, Desktop: Three columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {Object.entries(groupedAssignments).map(([status, statusAssignments]) => (
          <div key={status} className="flex flex-col">
            <div className={`${statusConfig[status as keyof typeof statusConfig]?.headerColor} 
              text-white px-4 py-3 rounded-t-lg shadow-sm`}>
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-sm">
                  {statusConfig[status as keyof typeof statusConfig]?.title}
                </h2>
                <span className="bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs font-medium">
                  {statusAssignments.length}
                </span>
              </div>
            </div>
            
            <div className={`${statusConfig[status as keyof typeof statusConfig]?.color} 
              border border-gray-200 rounded-b-lg p-3 lg:p-4 min-h-[300px] lg:min-h-[400px] shadow-sm flex-1`}>
              {statusAssignments.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <div className="text-2xl mb-2">📭</div>
                  No assignments in this status
                </div>
              ) : (
                <div className="space-y-3">
                  {statusAssignments.map((assignment) => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentBoard; 