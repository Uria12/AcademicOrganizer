import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteForm from '../../components/NoteForm';

global.fetch = jest.fn();

describe('NoteForm Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders note form with all fields', () => {
    render(<NoteForm />);
    
    expect(screen.getByPlaceholderText('Note Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Content')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Link (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tag')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add note/i })).toBeInTheDocument();
  });

  test('updates form fields when user types', async () => {
    const user = userEvent.setup();
    render(<NoteForm />);
    
    const titleInput = screen.getByPlaceholderText('Note Title');
    const contentInput = screen.getByPlaceholderText('Content');
    const linkInput = screen.getByPlaceholderText('Link (optional)');
    const tagInput = screen.getByPlaceholderText('Tag');
    
    await user.type(titleInput, 'Study Notes');
    await user.type(contentInput, 'Important concepts to remember');
    await user.type(linkInput, 'https://example.com');
    await user.type(tagInput, 'math');
    
    expect(titleInput).toHaveValue('Study Notes');
    expect(contentInput).toHaveValue('Important concepts to remember');
    expect(linkInput).toHaveValue('https://example.com');
    expect(tagInput).toHaveValue('math');
  });

  test('submits note with correct data', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', title: 'Study Notes' })
    });

    render(<NoteForm />);
    
    await user.type(screen.getByPlaceholderText('Note Title'), 'Study Notes');
    await user.type(screen.getByPlaceholderText('Content'), 'Important concepts');
    await user.type(screen.getByPlaceholderText('Tag'), 'math');
    await user.click(screen.getByRole('button', { name: /add note/i }));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Study Notes',
          content: 'Important concepts',
          link: '',
          tag: 'math'
        })
      });
    });
  });

  test('handles optional fields correctly', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({ ok: true });

    render(<NoteForm />);
    
    await user.type(screen.getByPlaceholderText('Note Title'), 'Study Notes');
    await user.type(screen.getByPlaceholderText('Content'), 'Important concepts');
    // Leave link and tag empty
    await user.click(screen.getByRole('button', { name: /add note/i }));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Study Notes',
          content: 'Important concepts',
          link: '',
          tag: ''
        })
      });
    });
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    render(<NoteForm />);
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    await user.click(submitButton);
    
    // HTML5 validation should prevent submission
    expect(fetch).not.toHaveBeenCalled();
  });

  test('resets form after successful submission', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({ ok: true });

    render(<NoteForm />);
    
    const titleInput = screen.getByPlaceholderText('Note Title');
    const contentInput = screen.getByPlaceholderText('Content');
    
    await user.type(titleInput, 'Test Note');
    await user.type(contentInput, 'Test Content');
    await user.click(screen.getByRole('button', { name: /add note/i }));
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
    });
  });
});