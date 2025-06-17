import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z.string().min(1),
  deadline: z.string().datetime(), // or z.date() if you parse it
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed"]).optional()
});
