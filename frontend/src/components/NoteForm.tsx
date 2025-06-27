import React, { useState } from 'react';
import apiClient from '../api/client';

interface Note {
  title: string;
  content: string;
  link?: string;
  tag?: string;
}

interface Errors {
  title?: string;
  content?: string;
  link?: string;
}

interface Props {
  onAdd: () => void;
}

const NoteForm: React.FC<Props> = ({ onAdd }) => {
  const [note, setNote] = useState<Note>({
    title: '',
    content: '',
    link: '',
    tag: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const newErrors: Errors = {};
    if (!note.title.trim()) newErrors.title = 'Title is required.';
    if (!note.content.trim()) newErrors.content = 'Content is required.';
    if (note.link && !isValidUrl(note.link)) newErrors.link = 'Please enter a valid URL.';
    return newErrors;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/notes', {
        title: note.title.trim(),
        content: note.content.trim(),
        link: note.link?.trim() || undefined,
        tag: note.tag?.trim() || undefined
      });
      
      if (response.status === 201) {
        setNote({ title: '', content: '', link: '', tag: '' });
        setErrors({});
        onAdd();
      } else {
        const errorData = response.data;
        alert('Failed to create note: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        alert('Failed to create note: ' + error.response.data.error);
      } else {
        alert('Network error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 max-w-md mx-auto p-6 bg-white rounded shadow" aria-labelledby="note-form-title">
      <h2 id="note-form-title" className="text-2xl font-bold mb-1">Create New Note</h2>
      <p className="mb-4 text-gray-600">Fill out the form below to add a new note. Fields marked with <span className='text-red-500'>*</span> are required.</p>
      
      <div className="grid grid-cols-1 gap-4">
        <label htmlFor="note-title" className="font-medium">Title <span className="text-red-500">*</span></label>
        <input
          id="note-title"
          type="text"
          placeholder="e.g. Math Lecture Notes - Chapter 5"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          className={`p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.title ? 'border-red-500' : ''}`}
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'note-title-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.title && <span id="note-title-error" className="text-red-500 text-sm">{errors.title}</span>}

        <label htmlFor="note-content" className="font-medium">Content <span className="text-red-500">*</span></label>
        <textarea
          id="note-content"
          placeholder="Write your notes here..."
          value={note.content}
          onChange={(e) => setNote({ ...note, content: e.target.value })}
          className={`p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px] resize-vertical ${errors.content ? 'border-red-500' : ''}`}
          required
          aria-required="true"
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? 'note-content-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.content && <span id="note-content-error" className="text-red-500 text-sm">{errors.content}</span>}

        <label htmlFor="note-link" className="font-medium">Link (Optional)</label>
        <input
          id="note-link"
          type="url"
          placeholder="https://example.com/resource"
          value={note.link}
          onChange={(e) => setNote({ ...note, link: e.target.value })}
          className={`p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.link ? 'border-red-500' : ''}`}
          aria-invalid={!!errors.link}
          aria-describedby={errors.link ? 'note-link-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.link && <span id="note-link-error" className="text-red-500 text-sm">{errors.link}</span>}

        <label htmlFor="note-tag" className="font-medium">Tag (Optional)</label>
        <input
          id="note-tag"
          type="text"
          placeholder="e.g. Math, Physics, Study"
          value={note.tag}
          onChange={(e) => setNote({ ...note, tag: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          {isSubmitting ? 'Creating...' : 'Create Note'}
        </button>
      </div>
    </form>
  );
};

export default NoteForm;
