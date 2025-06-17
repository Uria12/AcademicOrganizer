import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z.string().min(1),
  deadline: z.string(), 
  status: z.enum(["pending", "in-progress", "completed"]).optional()
});
