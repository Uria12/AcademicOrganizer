import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { Assignment } from '../App';
import '@testing-library/jest-dom';

const mockAssignments: Assignment[] = [];
const mockProps = {
  assignments: mockAssignments,
  error: null,
  loading: false,
  onStatusChange: jest.fn(),
  onDelete: jest.fn(),
  fetchAssignments: jest.fn(),
  logout: jest.fn(),
  user: { email: 'test@example.com' },
  onUpdate: jest.fn(),
};

describe('Dashboard Settings Tab', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders Settings tab and reminder input', () => {
    render(<Dashboard {...mockProps} />);
    // Open settings tab
    fireEvent.click(screen.getByText(/settings/i));
    expect(screen.getByText(/reminder settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/days before deadline/i)).toBeInTheDocument();
  });

  test('changes reminder days input and saves to localStorage', async () => {
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    const input = screen.getByLabelText(/days before deadline/i);
    fireEvent.change(input, { target: { value: '3' } });
    expect(input).toHaveValue(3);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(localStorage.getItem('reminderDays')).toBe('3');
      expect(screen.getByText(/saved!/i)).toBeInTheDocument();
    });
  });

  test('shows feedback message when saved', async () => {
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    const input = screen.getByLabelText(/days before deadline/i);
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(await screen.findByText(/saved!/i)).toBeInTheDocument();
  });

  test('loads default value of 1 when no localStorage value exists', () => {
    localStorage.clear();
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    const input = screen.getByLabelText(/days before deadline/i);
    expect(input).toHaveValue(1);
  });

  test('loads saved value from localStorage on component mount', () => {
    localStorage.setItem('reminderDays', '5');
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    const input = screen.getByLabelText(/days before deadline/i);
    expect(input).toHaveValue(5);
  });

  test('enforces minimum value of 1', () => {
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    const input = screen.getByLabelText(/days before deadline/i);
    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue(1);
  });

  test('enforces maximum value of 7', () => {
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    const input = screen.getByLabelText(/days before deadline/i);
    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue(7);
  });

  test('handles invalid input by defaulting to 1', () => {
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    const input = screen.getByLabelText(/days before deadline/i);
    fireEvent.change(input, { target: { value: 'invalid' } });
    expect(input).toHaveValue(1);
  });

  test('feedback message disappears after 2 seconds', async () => {
    jest.useFakeTimers();
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    const input = screen.getByLabelText(/days before deadline/i);
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    expect(screen.getByText(/saved!/i)).toBeInTheDocument();
    
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.queryByText(/saved!/i)).not.toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  test('input has correct min and max attributes', () => {
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    const input = screen.getByLabelText(/days before deadline/i);
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '7');
  });

  test('displays help text explaining the feature', () => {
    render(<Dashboard {...mockProps} />);
    fireEvent.click(screen.getByText(/settings/i));
    expect(screen.getByText(/you will receive an email reminder/i)).toBeInTheDocument();
  });
}); 