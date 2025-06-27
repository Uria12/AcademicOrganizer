import { Router } from 'express';
import { 
  getNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  getNoteStats, 
  searchNotes 
} from '../controllers/notes';
import validate from '../middleware/validate';
import { noteSchema } from '../schemas/notes';
import { cacheMiddleware, invalidateCache } from '../middleware/cache';

const router = Router();

// GET routes with caching
router.get('/', cacheMiddleware(5 * 60 * 1000), getNotes); // Cache for 5 minutes
router.get('/stats', cacheMiddleware(2 * 60 * 1000), getNoteStats); // Cache for 2 minutes
router.get('/search', cacheMiddleware(1 * 60 * 1000), searchNotes); // Cache for 1 minute

// POST route with validation
router.post('/', validate(noteSchema), createNote);

// PUT and DELETE routes with cache invalidation
router.put('/:id', invalidateCache('/api/notes'), validate(noteSchema), updateNote);
router.delete('/:id', invalidateCache('/api/notes'), deleteNote);

export default router;