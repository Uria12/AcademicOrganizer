import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all notes for the authenticated user
export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new note
export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { title, content, link, tag } = req.body;
    const note = await prisma.note.create({
      data: { title, content, link, tag, userId }
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update a note
export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { title, content, link, tag } = req.body;

    // Only allow updating notes belonging to the user
    const note = await prisma.note.updateMany({
      where: { id, userId },
      data: { title, content, link, tag }
    });

    if (note.count === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote = await prisma.note.findUnique({ where: { id } });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a note
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;

    // Only allow deleting notes belonging to the user
    const note = await prisma.note.deleteMany({
      where: { id, userId }
    });

    if (note.count === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
