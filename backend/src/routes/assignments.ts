import express from 'express';
import {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  getAssignmentStats,
} from '../controllers/assignments';
import validate from '../middleware/validate';
import { assignmentSchema } from '../schemas/assignments';
import { cacheMiddleware, invalidateCache } from '../middleware/cache';

const router = express.Router();

// GET routes with caching
router.get('/', cacheMiddleware(5 * 60 * 1000), getAssignments); // Cache for 5 minutes
router.get('/stats', cacheMiddleware(2 * 60 * 1000), getAssignmentStats); // Cache for 2 minutes

// POST route with validation
router.post(
  '/',
  (req, res, next) => {
    console.log("🔥 [Router] POST /api/assignments hit");
    next();
  },
  validate(assignmentSchema),
  createAssignment
);

// PUT and DELETE routes with cache invalidation
router.put('/:id', invalidateCache('/api/assignments'), updateAssignment);
router.delete('/:id', invalidateCache('/api/assignments'), deleteAssignment);

export default router;
