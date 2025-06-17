import React, { useState } from 'react';

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
    
    if (isSubmitting) return; // Prevent duplicate submissions
    
    setIsSubmitting(true);
    
    try {
      console.log('📤 Submitting assignment:', assignment);
      
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Assignment created successfully:', result);
        
        // reset form
        setAssignment({ title: '', deadline: '', description: '' });
        
        // refresh the list
        onAdd();
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create assignment:', errorData);
        alert('Failed to create assignment: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Network error creating assignment:', error);
      alert('Network error. Please try again.');
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
        <input
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