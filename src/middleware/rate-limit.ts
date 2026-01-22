import { Request, Response, NextFunction } from "express";

// A simple in-memory rate limiter for demonstration. For production, use Redis.
// Given we have Redis, let's just do a simple token bucket or fixed window using Redis, or just mocking it as allowed by the prompt ("mock acceptable").
// I will implement a simple in-memory one for now to avoid extra dependency 'rate-limiter-flexible' unless I add it.
// The prompt says "mock acceptable".

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 1000;
const ipMap = new Map<string, { count: number, resetTime: number }>();

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "unknown";
  const now = Date.now();

  const record = ipMap.get(ip);

  if (!record || now > record.resetTime) {
    ipMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_SIZE_IN_SECONDS * 1000
    });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: "Too many requests" });
  }

  record.count += 1;
  next();
};
