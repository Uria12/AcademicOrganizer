import express from 'express';
import {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignments';
import validate from '../middleware/validate';
import { assignmentSchema } from '../schemas/assignments';

const router = express.Router();

router.get('/', getAssignments);
router.post(
  '/',
  (req, res, next) => {
    console.log("🔥 [Router] POST /api/assignments hit");
    next();
  },
  validate(assignmentSchema),
  createAssignment
);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

export default router;
