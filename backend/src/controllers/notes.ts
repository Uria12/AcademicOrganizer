import { Request, Response } from 'express';

export const getNotes = async (req: Request, res: Response) => {
  try {
    // sample placeholder response
    res.json({ message: 'Get notes endpoint' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    // sample placeholder response
    res.json({ message: 'Create note endpoint' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
