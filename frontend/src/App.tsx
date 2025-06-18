/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import AssignmentForm from './components/AssignmentForm';
import AssignmentList from './components/AssignmentList';

type Assignment = {
  id: string;
  title: string;
  deadline: string;
  description?: string;
  status?: string;
};

const App: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);

const handleStatusChange = async (id: string, newStatus: string) => {
  console.log(`🔄 Updating assignment ${id} to status: ${newStatus}`);
  try {
    const response = await fetch(`/api/assignments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update assignment ${id}`);
    }

    setAssignments((prev) => // Optimistically update UI before API call for better UX
      prev.map((a) =>
        a.id === id ? { ...a, status: newStatus } : a
      )
    );
  } catch (err) {
    console.error(`❌ Error updating assignment ${id}:`, err);
    alert('Failed to update status. Try again later.');
  }
};

const handleDelete = async (id: string) => {
  try {
    const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete assignment');
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  } catch (err) {
    console.error('❌ Error deleting assignment:', err);
    alert('Failed to delete assignment. Try again.');
  }
};

const handleUpdate = async (
  id: string,
  updates: Partial<Pick<Assignment, 'title' | 'description' | 'deadline'>>
) => {
  try {
    const res = await fetch(`/api/assignments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update assignment');
    const updated = await res.json();
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  } catch (err) {
    console.error('❌ Error updating assignment:', err);
    alert('Failed to update. Try again.');
  }
};



  const fetchAssignments = async () => {
    console.log('🔄 Fetching assignments...');
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/assignments');
      console.log('📡 Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Received data:', data);

      if (!Array.isArray(data)) {
        console.error('❌ Data is not an array:', data);
        throw new Error('Invalid data format received');
      }

      const sorted = [...data].sort((a, b) => {
        const da = new Date(a.deadline).getTime();
        const db = new Date(b.deadline).getTime();
        return sort === 'asc' ? da - db : db - da;
      });

      setAssignments(sorted);
      console.log('✅ Assignments set successfully:', sorted.length, 'items');
    } catch (err) {
      console.error('❌ Error fetching assignments:', err);
      setError(`Failed to load assignments: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // remove sort dependency to avoid unnecessary refetches

  // Handle sort changes separately
  useEffect(() => {
    if (assignments.length > 0) {
      // Sort assignments by deadline (earliest or latest first)
      const sorted = [...assignments].sort((a, b) => {
        const da = new Date(a.deadline).getTime();
        const db = new Date(b.deadline).getTime();
        return sort === 'asc' ? da - db : db - da;
      });
      setAssignments(sorted);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <AssignmentForm onAdd={fetchAssignments} />

      <div className="flex gap-4 items-center mb-4">
        <div>
          <label className="mr-2 font-medium">Filter by status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-1 border rounded"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="mr-2 font-medium">Sort by deadline:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
            className="p-1 border rounded"
          >
            <option value="asc">Earliest First</option>
            <option value="desc">Latest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading assignments...</p>
      ) : (
        <AssignmentList
  assignments={assignments}
  error={error}
  filter={filter}
  onStatusChange={handleStatusChange}
  onDelete={handleDelete}
  onUpdate={handleUpdate}
/>
      )}
    </div>
  );
};

export default App;