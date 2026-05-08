import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "qirahub-jwt-dev-secret";

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
  userIsAdmin?: boolean;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      isAdmin: boolean;
    };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userIsAdmin = decoded.isAdmin;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
