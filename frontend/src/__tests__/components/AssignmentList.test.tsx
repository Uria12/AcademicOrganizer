/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentList from '../../components/AssignmentList';
import '@testing-library/jest-dom';

const mockAssignments = [
  {
    id: '1',
    title: 'Math Homework',
    description: 'Chapter 5',
    deadline: '2025-12-01T12:00:00Z',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Science Project',
    description: '',
    deadline: '2025-11-01T12:00:00Z',
    status: 'completed',
  },
];

describe('AssignmentList Component', () => {
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    mockOnStatusChange.mockClear();
  });

  test('renders assignments with correct details', () => {
    render(
      <AssignmentList
        assignments={mockAssignments}
        error={null}
        filter="all"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Math Homework')).toBeInTheDocument();
    expect(screen.getByText('Science Project')).toBeInTheDocument();
    expect(screen.getAllByText(/status:/i).length).toBe(2);
  });

  test('filters by status', () => {
    render(
      <AssignmentList
        assignments={mockAssignments}
        error={null}
        filter="pending"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Math Homework')).toBeInTheDocument();
    expect(screen.queryByText('Science Project')).not.toBeInTheDocument();
  });

  test('renders empty state when no assignments match filter', () => {
    render(
      <AssignmentList
        assignments={[]}
        error={null}
        filter="completed"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/no assignments match/i)).toBeInTheDocument();
  });

  test('renders error message if provided', () => {
    render(
      <AssignmentList
        assignments={[]}
        error="Something went wrong"
        filter="all"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test('calls onStatusChange when dropdown is changed', async () => {
    const user = userEvent.setup();

    render(
      <AssignmentList
        assignments={mockAssignments}
        error={null}
        filter="all"
        onStatusChange={mockOnStatusChange}
      />
    );

    const dropdowns = screen.getAllByRole('combobox');
    await user.selectOptions(dropdowns[0], 'in-progress');

    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'in-progress');
  });
});
