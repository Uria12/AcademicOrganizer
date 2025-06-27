import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/notes';
import validate from '../middleware/validate';
import { noteSchema } from '../schemas/notes';

const router = Router();

router.get('/', getNotes);
router.post('/', validate(noteSchema), createNote);
router.put('/:id', validate(noteSchema), updateNote);
router.delete('/:id', deleteNote);

export default router;