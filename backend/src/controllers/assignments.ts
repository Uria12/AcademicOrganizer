import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { cache, invalidateCache } from '../middleware/cache';

const prisma = new PrismaClient();

// Enhanced error handling
class AssignmentError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AssignmentError';
  }
}

// Input validation helper
const validateAssignmentInput = (data: any) => {
  const errors: string[] = [];
  
  if (!data.title?.trim()) {
    errors.push('Title is required and cannot be empty');
  }
  
  if (!data.deadline) {
    errors.push('Deadline is required');
  } else {
    const deadline = new Date(data.deadline);
    if (isNaN(deadline.getTime())) {
      errors.push('Invalid deadline format');
    } else if (deadline < new Date()) {
      errors.push('Deadline cannot be in the past');
    }
  }
  
  if (data.status && !['pending', 'in-progress', 'completed'].includes(data.status)) {
    errors.push('Invalid status value');
  }
  
  return errors;
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    console.log("📦 Creating assignment:", { body: req.body, user: req.user?.id });

    if (!req.user) {
      throw new AssignmentError('Unauthorized', 401);
    }

    const { title, description, deadline, status } = req.body;
    
    // Enhanced validation
    const validationErrors = validateAssignmentInput(req.body);
    if (validationErrors.length > 0) {
      throw new AssignmentError(`Validation failed: ${validationErrors.join(', ')}`, 400);
    }

    // Check for duplicate assignment titles for the same user
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        userId: req.user.id,
        title: title.trim(),
        deadline: new Date(deadline)
      }
    });

    if (existingAssignment) {
      throw new AssignmentError('An assignment with this title and deadline already exists', 409);
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        deadline: new Date(deadline),
        userId: req.user.id,
        status: status || 'pending',
      },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    // Invalidate cache for this user's assignments
    cache.delete(`${req.user.id}:/api/assignments`);
    
    console.log("✅ Assignment created:", assignment.id);
    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Assignment created successfully'
    });

  } catch (error) {
    console.error("❌ Create assignment error:", error);
    
    if (error instanceof AssignmentError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          error: 'Assignment with this title already exists'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create assignment'
    });
  }
};

export const getAssignments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AssignmentError('Unauthorized', 401);
    }

    const { status, sort = 'deadline', order = 'asc' } = req.query;
    console.log("📋 Fetching assignments for user:", req.user.id, { status, sort, order });

    // Build where clause
    const where: Prisma.AssignmentWhereInput = {
      userId: req.user.id
    };

    if (status && status !== 'all') {
      where.status = status as string;
    }

    // Build order clause
    let orderBy: any = {};
    if (sort === 'deadline') {
      orderBy.deadline = order as 'asc' | 'desc';
    } else if (sort === 'created') {
      orderBy.createdAt = order as 'asc' | 'desc';
    } else if (sort === 'title') {
      orderBy.title = order as 'asc' | 'desc';
    }

    const assignments = await prisma.assignment.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    // Add computed fields
    const assignmentsWithComputed = assignments.map(assignment => ({
      ...assignment,
      isOverdue: new Date(assignment.deadline) < new Date() && assignment.status !== 'completed',
      daysUntilDeadline: Math.ceil((new Date(assignment.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));

    console.log("📦 Found assignments:", assignmentsWithComputed.length);
    res.json({
      success: true,
      data: assignmentsWithComputed,
      meta: {
        total: assignmentsWithComputed.length,
        overdue: assignmentsWithComputed.filter(a => a.isOverdue).length,
        completed: assignmentsWithComputed.filter(a => a.status === 'completed').length
      }
    });

  } catch (error) {
    console.error("❌ Get assignments error:", error);
    
    if (error instanceof AssignmentError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments'
    });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, status } = req.body;

    if (!req.user) {
      throw new AssignmentError('Unauthorized', 401);
    }

    console.log("🔄 Updating assignment:", id, "with data:", req.body);

    // Validate input if provided
    if (Object.keys(req.body).length > 0) {
      const validationErrors = validateAssignmentInput(req.body);
      if (validationErrors.length > 0) {
        throw new AssignmentError(`Validation failed: ${validationErrors.join(', ')}`, 400);
      }
    }

    // Check ownership and existence
    const existing = await prisma.assignment.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new AssignmentError('Assignment not found', 404);
    }

    if (existing.userId !== req.user.id) {
      throw new AssignmentError('Forbidden: Not your assignment', 403);
    }

    // Build update data
    const updateData: Prisma.AssignmentUpdateInput = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.assignment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    // Invalidate cache
    cache.delete(`${req.user.id}:/api/assignments`);

    console.log("✅ Assignment updated:", updated.id);
    res.json({
      success: true,
      data: updated,
      message: 'Assignment updated successfully'
    });

  } catch (error) {
    console.error("❌ Update assignment error:", error);
    
    if (error instanceof AssignmentError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Assignment not found'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update assignment'
    });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new AssignmentError('Unauthorized', 401);
    }

    console.log("🗑️ Deleting assignment:", id);

    // Check ownership and existence
    const existing = await prisma.assignment.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new AssignmentError('Assignment not found', 404);
    }

    if (existing.userId !== req.user.id) {
      throw new AssignmentError('Forbidden: Not your assignment', 403);
    }

    await prisma.assignment.delete({
      where: { id }
    });

    // Invalidate cache
    cache.delete(`${req.user.id}:/api/assignments`);

    console.log("✅ Assignment deleted successfully");
    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error("❌ Delete assignment error:", error);
    
    if (error instanceof AssignmentError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Assignment not found'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete assignment'
    });
  }
};

// New method: Get assignment statistics
export const getAssignmentStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AssignmentError('Unauthorized', 401);
    }

    const stats = await prisma.assignment.groupBy({
      by: ['status'],
      where: { userId: req.user.id },
      _count: { status: true }
    });

    const total = await prisma.assignment.count({
      where: { userId: req.user.id }
    });

    const overdue = await prisma.assignment.count({
      where: {
        userId: req.user.id,
        deadline: { lt: new Date() },
        status: { not: 'completed' }
      }
    });

    const upcoming = await prisma.assignment.count({
      where: {
        userId: req.user.id,
        deadline: {
          gte: new Date(),
          lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        status: { not: 'completed' }
      }
    });

    res.json({
      success: true,
      data: {
        total,
        overdue,
        upcoming,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error("❌ Get stats error:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};