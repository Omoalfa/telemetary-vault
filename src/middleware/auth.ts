import { Request, Response, NextFunction } from "express";

export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header("X-API-KEY");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};
