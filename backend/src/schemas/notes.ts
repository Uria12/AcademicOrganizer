import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  tag: z.string().optional().or(z.literal(''))
}); 