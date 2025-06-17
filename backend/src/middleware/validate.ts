import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log("📥 Received body:", req.body);
    try {
      schema.parse(req.body); // ✅ Correct: only validate body
      next();
    } catch (err: any) {
      console.log("❌ Zod Validation Error:", err.errors);
      return res.status(400).json(err.errors);
    }
  };

export default validate;
