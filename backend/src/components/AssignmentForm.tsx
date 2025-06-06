import React, { useState } from 'react';

type Assignment = {
  title: string;
  deadline: string;
  description: string;
};

const AssignmentForm: React.FC = () => {
  const [assignment, setAssignment] = useState<Assignment>({
    title: '',
    deadline: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      });
      if (response.ok) {
        // Refresh assignment list
        setAssignment({ title: '', deadline: '', description: '' });
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Add New Assignment</h2>
      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Title"
          value={assignment.title}
          onChange={(e) => setAssignment({...assignment, title: e.target.value})}
          className="p-2 border rounded"
          required
        />
        <input
          type="datetime-local"
          value={assignment.deadline}
          onChange={(e) => setAssignment({...assignment, deadline: e.target.value})}
          className="p-2 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={assignment.description}
          onChange={(e) => setAssignment({...assignment, description: e.target.value})}
          className="p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Assignment
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;