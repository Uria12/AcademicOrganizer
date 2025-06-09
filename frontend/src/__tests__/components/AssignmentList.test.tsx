import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentList from '../../components/AssignmentList';

global.fetch = jest.fn();

const mockAssignments = [
  {
    id: '1',
    title: 'Math Homework',
    description: 'Chapter 5 exercises',
    deadline: '2024-12-31T23:59:00.000Z',
    status: 'pending',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    title: 'History Essay',
    description: 'Essay on World War II',
    deadline: '2024-12-25T23:59:00.000Z',
    status: 'in-progress',
    createdAt: '2024-01-02T00:00:00.000Z'
  }
];

describe('AssignmentList Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<AssignmentList />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders assignments after successful fetch', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAssignments
    });

    render(<AssignmentList />);
    
    await waitFor(() => {
      expect(screen.getByText('Math Homework')).toBeInTheDocument();
      expect(screen.getByText('History Essay')).toBeInTheDocument();
    });
  });

  test('renders empty state when no assignments', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<AssignmentList />);
    
    await waitFor(() => {
      expect(screen.getByText(/no assignments/i)).toBeInTheDocument();
    });
  });

  test('displays assignment details correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAssignments
    });

    render(<AssignmentList />);
    
    await waitFor(() => {
      expect(screen.getByText('Math Homework')).toBeInTheDocument();
      expect(screen.getByText('Chapter 5 exercises')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  test('handles status updates', async () => {
    const user = userEvent.setup();
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssignments
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockAssignments[0], status: 'completed' })
      });

    render(<AssignmentList />);
    
    await waitFor(() => {
      expect(screen.getByText('Math Homework')).toBeInTheDocument();
    });

    const statusButton = screen.getByRole('button', { name: /mark complete/i });
    await user.click(statusButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assignments/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
    });
  });

  test('handles assignment deletion', async () => {
    const user = userEvent.setup();
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssignments
      })
      .mockResolvedValueOnce({ ok: true });

    render(<AssignmentList />);
    
    await waitFor(() => {
      expect(screen.getByText('Math Homework')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/assignments/1', {
        method: 'DELETE'
      });
    });
  });

  test('filters assignments by status', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAssignments
    });

    render(<AssignmentList />);
    
    await waitFor(() => {
      expect(screen.getByText('Math Homework')).toBeInTheDocument();
      expect(screen.getByText('History Essay')).toBeInTheDocument();
    });

    const filterSelect = screen.getByLabelText(/filter by status/i);
    await user.selectOptions(filterSelect, 'pending');
    
    expect(screen.getByText('Math Homework')).toBeInTheDocument();
    expect(screen.queryByText('History Essay')).not.toBeInTheDocument();
  });

  test('sorts assignments by deadline', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAssignments
    });

    render(<AssignmentList />);
    
    await waitFor(() => {
      const assignments = screen.getAllByTestId('assignment-item');
      expect(assignments[0]).toHaveTextContent('History Essay'); // Earlier deadline
      expect(assignments[1]).toHaveTextContent('Math Homework'); // Later deadline
    });
  });
});