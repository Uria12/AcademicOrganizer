import React from 'react';

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
};

const AssignmentList: React.FC<Props> = ({ assignments, error, filter }) => {
  const filtered = filter === 'all'
    ? assignments
    : assignments.filter((a) => a.status === filter);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">My Assignments</h2>
      {error && <p className="text-red-600">{error}</p>}
      {filtered.length === 0 ? (
        <p className="text-gray-600 italic">No assignments match the selected filter.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((assignment) => (
            <li key={assignment.id} className="border p-3 rounded shadow">
              <div className="font-bold">{assignment.title}</div>
              {assignment.description && <p>{assignment.description}</p>}
              <div className="text-sm text-gray-600">
                Due: {new Date(assignment.deadline).toLocaleString()}
              </div>
              {assignment.status && (
                <div className="text-sm text-blue-600 font-medium">
                  Status: {assignment.status}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssignmentList;
