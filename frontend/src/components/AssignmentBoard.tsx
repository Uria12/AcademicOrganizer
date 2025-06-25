import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

type Assignment = {
  id: string;
  title: string;
  deadline: string;
  description?: string;
  status?: string;
};

type Props = {
  assignments: Assignment[];
  error: string | null;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Assignment>) => void;
};

const STATUSES = [
  { key: 'pending', title: '📋 Pending' },
  { key: 'in-progress', title: '🔄 In Progress' },
  { key: 'completed', title: '✅ Completed' },
];

const AssignmentBoard: React.FC<Props> = ({ 
  assignments, 
  error, 
  onStatusChange, 
  onDelete, 
  onUpdate 
}) => {
  console.log('[DEBUG] AssignmentBoard render - assignments received:', assignments);
  console.log('[DEBUG] AssignmentBoard render - number of assignments:', assignments.length);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Assignment>>({});

  // Debug: Show all unique status values
  const uniqueStatuses = [...new Set(assignments.map(a => a.status))];
  console.log('[DEBUG] Unique status values in assignments:', uniqueStatuses);
  
  // Debug: Check if assignments have proper IDs
  const assignmentIds = assignments.map(a => a.id);
  console.log('[DEBUG] Assignment IDs:', assignmentIds);
  console.log('[DEBUG] Assignment statuses:', assignments.map(a => ({ id: a.id, status: a.status })));
  
  // Validate assignment structure
  const validAssignments = assignments.filter(a => a && a.id && typeof a.id === 'string');
  console.log('[DEBUG] Valid assignments count:', validAssignments.length);
  console.log('[DEBUG] Invalid assignments:', assignments.filter(a => !a || !a.id || typeof a.id !== 'string'));

  // Defensive: Ensure all assignments have a valid status
  const validStatusKeys = STATUSES.map(s => s.key);
  console.log('[DEBUG] Valid status keys:', validStatusKeys);
  const assignmentsWithStatus = validAssignments.map(a => ({
    ...a,
    status: validStatusKeys.includes(a.status || 'pending') ? (a.status || 'pending') : 'pending',
  }));
  console.log('[DEBUG] Assignments with normalized status:', assignmentsWithStatus);

  // Group assignments by status
  const groupedAssignments: Record<string, Assignment[]> = {
    pending: assignmentsWithStatus.filter(a => a.status === 'pending'),
    'in-progress': assignmentsWithStatus.filter(a => a.status === 'in-progress'),
    completed: assignmentsWithStatus.filter(a => a.status === 'completed'),
  };
  
  // Defensive: Collect assignments with unknown status
  const unknownStatusAssignments = assignmentsWithStatus.filter(a => !validStatusKeys.includes(a.status));
  if (unknownStatusAssignments.length > 0) {
    console.warn('[WARNING] Some assignments have unknown status and will not be draggable:', unknownStatusAssignments);
  }

  console.log('[DEBUG] Grouped assignments:', groupedAssignments);
  console.log('[DEBUG] Statuses:', STATUSES);
  console.log('[DEBUG] Droppable keys that will be rendered:', STATUSES.map(s => s.key));

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">Overdue</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium">Due Today</span>;
    } else if (diffDays === 1) {
      return <span className="text-orange-500 font-medium">Due Tomorrow</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-600 font-medium">Due in {diffDays} days</span>;
    } else {
      return <span className="text-gray-600">Due {date.toLocaleDateString()}</span>;
    }
  };

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md relative">
      {editId === assignment.id ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title || ''}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Title"
          />
          <textarea
            value={editData.description || ''}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Description"
            rows={3}
          />
          <input
            type="datetime-local"
            value={editData.deadline || ''}
            onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onUpdate(assignment.id, editData);
                setEditId(null);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditId(null)}
              className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1 mr-2">{assignment.title}</h3>
            <div className="flex space-x-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditId(assignment.id);
                  setEditData({
                    title: assignment.title,
                    description: assignment.description,
                    deadline: assignment.deadline.slice(0, 16),
                  });
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(assignment.id);
                }}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {assignment.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">{assignment.description}</p>
          )}
          
          <div className="text-xs text-gray-500 mb-3">
            {formatDeadline(assignment.deadline)}
          </div>
          
          <select
            value={assignment.status || 'pending'}
            onChange={(e) => onStatusChange(assignment.id, e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="pending">📋 Pending</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </>
      )}
    </div>
  );

  // Debug: Log assignments on drag start/end
  const onDragStart = (result: any) => {
    console.log('[DEBUG] Drag started:', result);
    console.log('[DEBUG] Assignments at drag start:', assignmentsWithStatus);
    console.log('[DEBUG] Droppable keys at drag start:', STATUSES.map(s => s.key));
    console.log('[DEBUG] Grouped assignments at drag start:', groupedAssignments);
  };

  const onDragUpdate = (result: any) => {
    console.log('[DEBUG] Drag update:', result);
  };

  const onDragEnd = (result: DropResult) => {
    console.log('[DEBUG] Drag ended:', result);
    console.log('[DEBUG] Assignments at drag end:', assignmentsWithStatus);
    const { source, destination, draggableId } = result;
    if (!destination) {
      console.log('[DEBUG] No destination, drag cancelled');
      return;
    }
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    console.log('[DEBUG] Source status:', sourceStatus, 'Destination status:', destStatus);
    console.log('[DEBUG] Draggable ID:', draggableId);
    if (sourceStatus !== destStatus) {
      console.log('[DEBUG] Status changed from', sourceStatus, 'to', destStatus);
      console.log('[DEBUG] Calling onStatusChange with:', draggableId, destStatus);
      onStatusChange(draggableId, destStatus);
    } else {
      console.log('[DEBUG] Same status, no change needed');
    }
  };

  console.log('[DEBUG] About to render DragDropContext with droppables:', STATUSES.map(s => s.key));
  
  return (
    <div className="mt-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Show loading state if no assignments yet */}
      {assignments.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-2xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading assignments...</h3>
          <p className="text-gray-600">Please wait while we load your assignments.</p>
        </div>
      )}
      
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart} onDragUpdate={onDragUpdate}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {STATUSES.map(({ key, title }) => {
            console.log(`[DEBUG] Rendering Droppable for key: ${key}, title: ${title}`);
            return (
              <Droppable droppableId={key} key={key}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                  console.log(`[DEBUG] Droppable render for ${key}:`, { isDraggingOver: snapshot.isDraggingOver, draggingFromThisWith: snapshot.draggingFromThisWith });
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`droppable-zone flex flex-col min-h-[300px] lg:min-h-[400px] bg-white border rounded-lg shadow-sm p-3 lg:p-4 ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    >
                      <div className="font-semibold text-sm mb-2">{title} <span className="ml-2 text-xs text-gray-400">{groupedAssignments[key]?.length || 0}</span></div>
                      
                      <div className="space-y-3 flex-1">
                        {groupedAssignments[key] && groupedAssignments[key].length > 0 ? (
                          groupedAssignments[key].map((assignment, idx) => {
                            console.log(`[DEBUG] Rendering Draggable for assignment:`, assignment.id, 'in status:', key, 'at index:', idx);
                            return (
                              <Draggable draggableId={assignment.id} index={idx} key={assignment.id}>
                                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                                  console.log(`[DEBUG] Draggable render for ${assignment.id}:`, { isDragging: snapshot.isDragging, isDropAnimating: snapshot.isDropAnimating });
                                  return (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`draggable-item ${snapshot.isDragging ? 'bg-blue-100 shadow-lg' : ''}`}
                                      style={provided.draggableProps.style}
                                    >
                                      <AssignmentCard assignment={assignment} />
                                    </div>
                                  );
                                }}
                              </Draggable>
                            );
                          })
                        ) : (
                          <div className="text-center text-gray-500 text-sm py-8">
                            <div className="text-2xl mb-2">📭</div>
                            {assignments.length === 0 ? 'No assignments yet' : 'No assignments in this status'}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  );
                }}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default AssignmentBoard; 