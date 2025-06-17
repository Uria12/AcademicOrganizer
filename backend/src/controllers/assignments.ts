import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAssignment = async (req: Request, res: Response) => {
  console.log("📦 Incoming POST /api/assignments body:", req.body); // ✅ DEBUG

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, description, deadline } = req.body;
  const userId = req.user.id;
  
  try {
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        userId,
      },
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};


export const getAssignments = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.id;
  
  try {
    const assignments = await prisma.assignment.findMany({ where: { userId } });
    res.json(assignments);
  } catch {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const assignment = await prisma.assignment.update({
      where: { id },
      data: { status },
    });
    res.json(assignment);
  } catch {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    await prisma.assignment.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};