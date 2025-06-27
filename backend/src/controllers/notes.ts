import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { cache } from '../middleware/cache';

const prisma = new PrismaClient();

// Enhanced error handling
class NoteError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'NoteError';
  }
}

// Input validation helper
const validateNoteInput = (data: any) => {
  const errors: string[] = [];
  
  if (!data.title?.trim()) {
    errors.push('Title is required and cannot be empty');
  }
  
  if (!data.content?.trim()) {
    errors.push('Content is required and cannot be empty');
  }
  
  if (data.title?.trim().length > 255) {
    errors.push('Title must be less than 255 characters');
  }
  
  if (data.content?.trim().length > 10000) {
    errors.push('Content must be less than 10,000 characters');
  }
  
  if (data.link && data.link.trim()) {
    try {
      new URL(data.link);
    } catch {
      errors.push('Invalid URL format');
    }
  }
  
  if (data.tag && data.tag.trim().length > 50) {
    errors.push('Tag must be less than 50 characters');
  }
  
  return errors;
};

// Search and filter helper
const buildNoteQuery = (userId: string, query: any) => {
  const where: Prisma.NoteWhereInput = { userId };
  
  // Search in title and content
  if (query.search) {
    where.OR = [
      { title: { contains: query.search as string, mode: 'insensitive' } },
      { content: { contains: query.search as string, mode: 'insensitive' } }
    ];
  }
  
  // Filter by tag
  if (query.tag && query.tag !== 'all') {
    where.tag = query.tag as string;
  }
  
  // Filter by date range
  if (query.dateFrom || query.dateTo) {
    (where as any).createdAt = {};
    if (query.dateFrom) {
      (where as any).createdAt.gte = new Date(query.dateFrom as string);
    }
    if (query.dateTo) {
      (where as any).createdAt.lte = new Date(query.dateTo as string);
    }
  }
  
  return where;
};

// Get all notes for the authenticated user
export const getNotes = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new NoteError('Unauthorized', 401);
    }

    const { search, tag, sort = 'created', order = 'desc', page = '1', limit = '20', dateFrom, dateTo } = req.query;
    console.log("📝 Fetching notes for user:", req.user.id, { search, tag, sort, order, page, limit });

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100); // Max 100 per page
    const offset = (pageNum - 1) * limitNum;

    // Build query
    const where = buildNoteQuery(req.user.id, req.query);
    
    // Build order clause
    let orderBy: any = {};
    if (sort === 'created') {
      orderBy.createdAt = order as 'asc' | 'desc';
    } else if (sort === 'title') {
      orderBy.title = order as 'asc' | 'desc';
    } else if (sort === 'updated') {
      orderBy.updatedAt = order as 'asc' | 'desc';
    }

    // Get notes with pagination
    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy,
        skip: offset,
        take: limitNum,
        include: {
          user: {
            select: { email: true }
          }
        }
      }),
      prisma.note.count({ where })
    ]);

    // Add computed fields
    const notesWithComputed = notes.map(note => ({
      ...note,
      wordCount: note.content.split(/\s+/).filter(word => word.length > 0).length,
      readingTime: Math.ceil(note.content.split(/\s+/).length / 200), // 200 words per minute
      hasLink: !!note.link,
      excerpt: note.content.length > 150 ? note.content.substring(0, 150) + '...' : note.content
    }));

    console.log("📦 Found notes:", notesWithComputed.length, "of", total);
    res.json({
      success: true,
      data: notesWithComputed,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error("❌ Get notes error:", error);
    
    if (error instanceof NoteError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes'
    });
  }
};

// Create a new note
export const createNote = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new NoteError('Unauthorized', 401);
    }

    console.log("📝 Creating note:", { body: req.body, user: req.user.id });

    const { title, content, link, tag } = req.body;
    
    // Enhanced validation
    const validationErrors = validateNoteInput(req.body);
    if (validationErrors.length > 0) {
      throw new NoteError(`Validation failed: ${validationErrors.join(', ')}`, 400);
    }

    // Check for duplicate note titles for the same user
    const existingNote = await prisma.note.findFirst({
      where: {
        userId: req.user.id,
        title: title.trim()
      }
    });

    if (existingNote) {
      throw new NoteError('A note with this title already exists', 409);
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        link: link?.trim() || null,
        tag: tag?.trim() || null,
        userId: req.user.id,
      },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    // Invalidate cache for this user's notes
    cache.delete(`${req.user.id}:/api/notes`);
    
    console.log("✅ Note created:", note.id);
    res.status(201).json({
      success: true,
      data: note,
      message: 'Note created successfully'
    });

  } catch (error) {
    console.error("❌ Create note error:", error);
    
    if (error instanceof NoteError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          error: 'Note with this title already exists'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create note'
    });
  }
};

// Update a note
export const updateNote = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new NoteError('Unauthorized', 401);
    }

    const { id } = req.params;
    const { title, content, link, tag } = req.body;

    console.log("🔄 Updating note:", id, "with data:", req.body);

    // Validate input if provided
    if (Object.keys(req.body).length > 0) {
      const validationErrors = validateNoteInput(req.body);
      if (validationErrors.length > 0) {
        throw new NoteError(`Validation failed: ${validationErrors.join(', ')}`, 400);
      }
    }

    // Check ownership and existence
    const existing = await prisma.note.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new NoteError('Note not found', 404);
    }

    if (existing.userId !== req.user.id) {
      throw new NoteError('Forbidden: Not your note', 403);
    }

    // Build update data
    const updateData: Prisma.NoteUpdateInput = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (link !== undefined) updateData.link = link?.trim() || null;
    if (tag !== undefined) updateData.tag = tag?.trim() || null;

    const updated = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    // Invalidate cache
    cache.delete(`${req.user.id}:/api/notes`);

    console.log("✅ Note updated:", updated.id);
    res.json({
      success: true,
      data: updated,
      message: 'Note updated successfully'
    });

  } catch (error) {
    console.error("❌ Update note error:", error);
    
    if (error instanceof NoteError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Note not found'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update note'
    });
  }
};

// Delete a note
export const deleteNote = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new NoteError('Unauthorized', 401);
    }

    const { id } = req.params;
    console.log("🗑️ Deleting note:", id);

    // Check ownership and existence
    const existing = await prisma.note.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new NoteError('Note not found', 404);
    }

    if (existing.userId !== req.user.id) {
      throw new NoteError('Forbidden: Not your note', 403);
    }

    await prisma.note.delete({
      where: { id }
    });

    // Invalidate cache
    cache.delete(`${req.user.id}:/api/notes`);

    console.log("✅ Note deleted successfully");
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error("❌ Delete note error:", error);
    
    if (error instanceof NoteError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Note not found'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete note'
    });
  }
};

// Get note statistics
export const getNoteStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new NoteError('Unauthorized', 401);
    }

    const [total, withLinks, withTags, tagStats, recentNotes] = await Promise.all([
      prisma.note.count({ where: { userId: req.user.id } }),
      prisma.note.count({ 
        where: { 
          userId: req.user.id,
          link: { not: null }
        }
      }),
      prisma.note.count({ 
        where: { 
          userId: req.user.id,
          tag: { not: null }
        }
      }),
      prisma.note.groupBy({
        by: ['tag'],
        where: { 
          userId: req.user.id,
          tag: { not: null }
        },
        _count: { tag: true }
      }),
      prisma.note.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, createdAt: true }
      })
    ]);

    // Calculate word count manually
    const allNotes = await prisma.note.findMany({
      where: { userId: req.user.id },
      select: { content: true }
    });

    const totalWords = allNotes.reduce((sum, note) => sum + note.content.split(/\s+/).filter(word => word.length > 0).length, 0);
    const avgWords = total > 0 ? Math.round(totalWords / total) : 0;

    res.json({
      success: true,
      data: {
        total,
        withLinks,
        withTags,
        avgWords,
        totalWords,
        byTag: tagStats.reduce((acc, stat) => {
          if (stat.tag) {
            acc[stat.tag] = stat._count.tag;
          }
          return acc;
        }, {} as Record<string, number>),
        recentNotes
      }
    });

  } catch (error) {
    console.error("❌ Get note stats error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch note statistics'
    });
  }
};

// Search notes with advanced filtering
export const searchNotes = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new NoteError('Unauthorized', 401);
    }

    const { q, tag, dateFrom, dateTo, sort = 'relevance' } = req.query;
    
    if (!q || typeof q !== 'string') {
      throw new NoteError('Search query is required', 400);
    }

    console.log("🔍 Searching notes:", { q, tag, dateFrom, dateTo, sort });

    const where = buildNoteQuery(req.user.id, { search: q, tag, dateFrom, dateTo });
    
    // Build order clause for search relevance
    let orderBy: any = {};
    if (sort === 'relevance') {
      // For relevance, we'll order by title matches first, then content matches
      orderBy = [
        { title: { contains: q as string, mode: 'insensitive' } },
        { createdAt: 'desc' }
      ];
    } else if (sort === 'date') {
      orderBy.createdAt = 'desc';
    } else if (sort === 'title') {
      orderBy.title = 'asc';
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy,
      take: 50, // Limit search results
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    // Add search relevance scoring
    const notesWithRelevance = notes.map(note => {
      let score = 0;
      const query = (q as string).toLowerCase();
      
      if (note.title.toLowerCase().includes(query)) score += 10;
      if (note.content.toLowerCase().includes(query)) score += 5;
      if (note.tag?.toLowerCase().includes(query)) score += 3;
      
      return {
        ...note,
        relevanceScore: score,
        wordCount: note.content.split(/\s+/).filter(word => word.length > 0).length,
        excerpt: note.content.length > 200 ? note.content.substring(0, 200) + '...' : note.content
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      success: true,
      data: notesWithRelevance,
      meta: {
        query: q,
        total: notesWithRelevance.length,
        searchTime: Date.now()
      }
    });

  } catch (error) {
    console.error("❌ Search notes error:", error);
    
    if (error instanceof NoteError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
};
