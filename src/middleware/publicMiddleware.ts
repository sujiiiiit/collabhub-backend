import { Request, Response, NextFunction } from "express";

export const publicMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // This middleware simply allows the request to proceed
  next();
};