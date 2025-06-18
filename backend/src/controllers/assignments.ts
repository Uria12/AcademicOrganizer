import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAssignment = async (req: Request, res: Response) => {
  console.log("📦 Incoming POST /api/assignments body:", req.body);

  if (!req.user) {
    console.log("❌ No user found in request");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, description, deadline } = req.body;
  const userId = req.user.id; // Extract authenticated user id from jwt middleware
  
 // Validate required fields before database operation
  if (!title || !deadline) {
    console.log("❌ Missing required fields:", { title, deadline });
    return res.status(400).json({ error: 'Title and deadline are required' });
  }
  
  try {
    console.log("🔄 Creating assignment with data:", {
      title,
      description,
      deadline: new Date(deadline),
      userId
    });

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || '',
        deadline: new Date(deadline), // Convert string deadline to Date object for PostgreSQL storage
        userId,
      },
    });
    
    console.log("✅ Assignment created successfully:", assignment);
    res.status(201).json(assignment);
  } catch (error) {
    console.error("❌ Database error creating assignment:", error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

export const getAssignments = async (req: Request, res: Response) => {
  if (!req.user) {
    console.log("❌ No user found in getAssignments request");
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = req.user.id;
  console.log("📋 Fetching assignments for user:", userId);
  
  try {
    // Fetch only assignments belonging to the authenticated user
    const assignments = await prisma.assignment.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' } // Show newest assignments first
    });
    
    console.log("📦 Found assignments:", assignments.length);
    res.json(assignments);
  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log("🔄 Updating assignment:", id, "with status:", status);

  try {
    const existing = await prisma.assignment.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Not your assignment' });
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: { status },
    });

    console.log("✅ Assignment updated:", updated);
    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating assignment:", error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};


export const deleteAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log("🗑️ Deleting assignment:", id);

  try {
    const existing = await prisma.assignment.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Not your assignment' });
    }

    await prisma.assignment.delete({
      where: { id }
    });

    console.log("✅ Assignment deleted successfully");
    res.status(200).json({ message: 'Assignment deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    console.error("❌ Error deleting assignment:", error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};
