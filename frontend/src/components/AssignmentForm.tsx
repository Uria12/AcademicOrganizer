import React, { useState } from 'react';
import apiClient from '../api/client';

// Title: UI/UX Enhancement for AssignmentForm Component
// Description: Improves usability, accessibility, and feedback for the assignment creation form, including clear titles, inline validation, accessible labels, and a visually distinct submit button.

type Props = {
  onAdd: () => void;
};

type Assignment = {
  title: string;
  deadline: string;
  description: string;
};

type Errors = {
  title?: string;
  deadline?: string;
};

const AssignmentForm: React.FC<Props> = ({ onAdd }) => {
  const [assignment, setAssignment] = useState<Assignment>({
    title: '',
    deadline: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const newErrors: Errors = {};
    if (!assignment.title.trim()) newErrors.title = 'Title is required.';
    if (!assignment.deadline) newErrors.deadline = 'Deadline is required.';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/assignments', assignment);
      if (response.status === 201) {
        setAssignment({ title: '', deadline: '', description: '' });
        setErrors({});
        onAdd();
      } else {
        const errorData = response.data;
        alert('Failed to create assignment: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        alert('Failed to create assignment: ' + error.response.data.error);
      } else {
        alert('Network error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 max-w-md mx-auto p-6 bg-white rounded shadow" aria-labelledby="assignment-form-title">
      <h2 id="assignment-form-title" className="text-2xl font-bold mb-1">Add New Assignment</h2>
      <p className="mb-4 text-gray-600">Fill out the form below to add a new assignment. All fields marked with <span className='text-red-500'>*</span> are required.</p>
      <div className="grid grid-cols-1 gap-4">
        <label htmlFor="assignment-title" className="font-medium">Title <span className="text-red-500">*</span></label>
        <input
          id="assignment-title"
          type="text"
          placeholder="e.g. Math Homework 1"
          value={assignment.title}
          onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
          className={`p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.title ? 'border-red-500' : ''}`}
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'assignment-title-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.title && <span id="assignment-title-error" className="text-red-500 text-sm">{errors.title}</span>}

        <label htmlFor="assignment-deadline" className="font-medium">Deadline <span className="text-red-500">*</span></label>
        <input
          id="assignment-deadline"
          type="datetime-local"
          value={assignment.deadline}
          onChange={(e) => setAssignment({ ...assignment, deadline: e.target.value })}
          className={`p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.deadline ? 'border-red-500' : ''}`}
          required
          aria-required="true"
          aria-invalid={!!errors.deadline}
          aria-describedby={errors.deadline ? 'assignment-deadline-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.deadline && <span id="assignment-deadline-error" className="text-red-500 text-sm">{errors.deadline}</span>}

        <label htmlFor="assignment-description" className="font-medium">Description</label>
        <textarea
          id="assignment-description"
          placeholder="Add any details or instructions (optional)"
          value={assignment.description}
          onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          {isSubmitting ? 'Adding...' : 'Add Assignment'}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;