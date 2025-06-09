import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentForm from '../../components/AssignmentForm';

// Mock fetch globally
global.fetch = jest.fn();

describe('AssignmentForm Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders assignment form with all required fields', () => {
    render(<AssignmentForm />);
    
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // datetime-local input
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add assignment/i })).toBeInTheDocument();
  });

  test('updates input values when user types', async () => {
    const user = userEvent.setup();
    render(<AssignmentForm />);
    
    const titleInput = screen.getByPlaceholderText('Title');
    const descriptionInput = screen.getByPlaceholderText('Description');
    
    await user.type(titleInput, 'Math Homework');
    await user.type(descriptionInput, 'Chapter 5 exercises');
    
    expect(titleInput).toHaveValue('Math Homework');
    expect(descriptionInput).toHaveValue('Chapter 5 exercises');
  });

  test('submits form with correct data', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', title: 'Math Homework' })
    });

    render(<AssignmentForm />);
    
    const titleInput = screen.getByPlaceholderText('Title');
    const deadlineInput = screen.getByDisplayValue('');
    const descriptionInput = screen.getByPlaceholderText('Description');
    const submitButton = screen.getByRole('button', { name: /add assignment/i });
    
    await user.type(titleInput, 'Math Homework');
    await user.type(deadlineInput, '2024-12-31T23:59');
    await user.type(descriptionInput, 'Chapter 5 exercises');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Math Homework',
          deadline: '2024-12-31T23:59',
          description: 'Chapter 5 exercises'
        })
      });
    });
  });

  test('resets form after successful submission', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({ ok: true });

    render(<AssignmentForm />);
    
    const titleInput = screen.getByPlaceholderText('Title');
    const submitButton = screen.getByRole('button', { name: /add assignment/i });
    
    await user.type(titleInput, 'Test Assignment');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
    });
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<AssignmentForm />);
    
    const titleInput = screen.getByPlaceholderText('Title');
    const submitButton = screen.getByRole('button', { name: /add assignment/i });
    
    await user.type(titleInput, 'Test Assignment');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error creating assignment:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test('prevents submission with empty required fields', async () => {
    const user = userEvent.setup();
    render(<AssignmentForm />);
    
    const submitButton = screen.getByRole('button', { name: /add assignment/i });
    await user.click(submitButton);
    
    // HTML5 validation should prevent submission
    expect(fetch).not.toHaveBeenCalled();
  });
});