import React, { useState } from 'react';
import apiClient from '../api/client';

type Props = {
  onAdd: () => void;
};

type Assignment = {
  title: string;
  deadline: string;
  description: string;
};

const AssignmentForm: React.FC<Props> = ({ onAdd }) => {
  const [assignment, setAssignment] = useState<Assignment>({
    title: '',
    deadline: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('📤 Submitting assignment:', assignment);
      
      const response = await apiClient.post('/assignments', assignment);

      console.log('✅ Assignment created successfully:', response.data);
      
      // Reset form to initial state after successful creation
      setAssignment({ title: '', deadline: '', description: '' });
      
      // refresh the list
      onAdd();
    } catch (error: any) {
      console.error('❌ Failed to create assignment:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert('Failed to create assignment: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
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
          onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
          className="p-2 border rounded"
          required
          disabled={isSubmitting}
        />
        <label htmlFor="deadline" className="sr-only">Deadline</label>
        <input
          id="deadline"
          type="datetime-local"
          value={assignment.deadline}
          onChange={(e) => setAssignment({ ...assignment, deadline: e.target.value })}
          className="p-2 border rounded"
          required
          disabled={isSubmitting}
        />
        <textarea
          placeholder="Description"
          value={assignment.description}
          onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
          className="p-2 border rounded"
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Assignment'}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;