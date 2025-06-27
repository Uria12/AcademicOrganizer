import React, { useState } from 'react';

type Note = {
  id: string;
  title: string;
  content: string;
  link?: string;
  tag?: string;
  createdAt: string;
};

type Props = {
  notes: Note[];
  error: string | null;
  filter: string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Note>) => void;
};

const NoteList: React.FC<Props> = ({ notes, error, filter, onDelete, onUpdate }) => {
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Note>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Filter notes based on selected tag (all, or specific tag) and search term
  const filtered = notes.filter((note) => {
    const matchesFilter = filter === 'all' || note.tag === filter;
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tag && note.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Get unique tags for filter dropdown
  const uniqueTags = Array.from(new Set(notes.map(note => note.tag).filter(Boolean)));

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">My Notes</h2>
      
      {/* Search and Filter Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filter}
          onChange={(e) => {/* This would be handled by parent component */}}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All Tags</option>
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      {filtered.length === 0 ? (
        <p className="text-gray-600 italic">
          {searchTerm || filter !== 'all' 
            ? 'No notes match your search criteria.' 
            : 'No notes found. Create your first note to get started!'}
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((note) => (
            <li key={note.id} className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
              {editId === note.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Title"
                  />
                  <textarea
                    value={editData.content || ''}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px] resize-vertical"
                    placeholder="Content"
                  />
                  <input
                    type="url"
                    value={editData.link || ''}
                    onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Link (optional)"
                  />
                  <input
                    type="text"
                    value={editData.tag || ''}
                    onChange={(e) => setEditData({ ...editData, tag: e.target.value })}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Tag (optional)"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        onUpdate(note.id, editData);
                        setEditId(null);
                        setEditData({});
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditId(null);
                        setEditData({});
                      }}
                      className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{note.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditId(note.id);
                          setEditData({
                            title: note.title,
                            content: note.content,
                            link: note.link || '',
                            tag: note.tag || ''
                          });
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(note.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-gray-700 mb-3">
                    {truncateContent(note.content)}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    {note.tag && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {note.tag}
                      </span>
                    )}
                    {note.link && (
                      <a
                        href={note.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Link
                      </a>
                    )}
                    <span className="text-gray-500">
                      Created: {formatDate(note.createdAt)}
                    </span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NoteList;
