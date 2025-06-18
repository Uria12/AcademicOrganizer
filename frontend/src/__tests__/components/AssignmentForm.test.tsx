/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentForm from '../../components/AssignmentForm';
import '@testing-library/jest-dom';


describe('AssignmentForm Component', () => {
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    mockOnAdd.mockClear();
    global.fetch = jest.fn();
  });

  test('renders the form fields', () => {
    render(<AssignmentForm onAdd={mockOnAdd} />);
    
    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add assignment/i })).toBeInTheDocument();
  });

  test('submits form successfully', async () => {
    const user = userEvent.setup();

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', title: 'Test', deadline: '2025-01-01T00:00', description: 'Desc' }),
    });

    render(<AssignmentForm onAdd={mockOnAdd} />);

    await user.type(screen.getByPlaceholderText('Title'), 'Test');
    await user.type(screen.getByPlaceholderText('Description'), 'Desc');
    await user.type(screen.getByLabelText(/deadline/i) || screen.getByDisplayValue(''), '2025-01-01T00:00');
    await user.click(screen.getByRole('button', { name: /add assignment/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(mockOnAdd).toHaveBeenCalled();
    });
  });

  test('shows alert on failed request', async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Test error' })
    });

    render(<AssignmentForm onAdd={mockOnAdd} />);
    await user.type(screen.getByPlaceholderText('Title'), 'Test');
    await user.type(screen.getByPlaceholderText('Description'), 'Desc');
    await user.type(screen.getByLabelText(/deadline/i) || screen.getByDisplayValue(''), '2025-01-01T00:00');
    await user.click(screen.getByRole('button', { name: /add assignment/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/test error/i));
    });
  });

  test('prevents submission if already submitting', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // never resolves

    render(<AssignmentForm onAdd={mockOnAdd} />);
    await user.type(screen.getByPlaceholderText('Title'), 'Title');
    await user.type(screen.getByLabelText(/deadline/i) || screen.getByDisplayValue(''), '2025-01-01T00:00');
    await user.click(screen.getByRole('button', { name: /add assignment/i }));

    await user.click(screen.getByRole('button', { name: /adding.../i }));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
