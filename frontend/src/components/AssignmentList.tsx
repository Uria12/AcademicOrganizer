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
  filter: string;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Assignment>) => void;
};

const AssignmentList: React.FC<Props> = ({ assignments, error, filter, onStatusChange, onDelete, onUpdate }) => {
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Assignment>>({});

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">My Assignments</h2>
      {error && <p className="text-red-600">{error}</p>}
      {assignments.length === 0 ? (
        <p className="text-gray-600 italic">No assignments match the selected filter.</p>
      ) : (
        <ul className="space-y-3">
          {assignments.map((assignment) => (
            <li key={assignment.id} className="border p-3 rounded shadow">
              {editId === assignment.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                    placeholder="Description"
                  />
                  <input
                    type="datetime-local"
                    value={editData.deadline || ''}
                    onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                  />
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        onUpdate(assignment.id, editData);
                        setEditId(null);
                      }}
                      className="px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-2 py-1 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-bold">{assignment.title}</div>
                  {assignment.description && <p>{assignment.description}</p>}
                  <div className="text-sm text-gray-600">
                    Due: {new Date(assignment.deadline).toLocaleString()}
                  </div>
                  <div className="mt-2 text-sm">
                    <label className="mr-2 font-medium">Status:</label>
                    <select
                      value={assignment.status || 'pending'}
                      onChange={(e) => onStatusChange(assignment.id, e.target.value)} // Update assignment status via API call to backend
                      className="p-1 border rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="mt-2 space-x-2 text-sm">
                    <button
                      onClick={() => {
                        setEditId(assignment.id);
                        setEditData({
                          title: assignment.title,
                          description: assignment.description,
                          deadline: assignment.deadline.slice(0, 16), // trim to yyyy-MM-ddTHH:mm
                        });
                      }}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(assignment.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssignmentList;
