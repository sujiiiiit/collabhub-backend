import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

// Configure multer for PDF file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Adjust storage as needed
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed") as unknown as null, false);
    }
  }
}).single('resume');

export const fileValidator = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};
