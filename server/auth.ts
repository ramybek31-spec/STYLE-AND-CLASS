import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { getDb, persistDb } from "./db";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET || "style_and_class_default_secret_london_2026";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "StyleAndClassLondon2026!";

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: "ADMIN" | "MANAGER";
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function signAdminToken(user: AuthenticatedUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AuthenticatedUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch {
    return null;
  }
}

/**
 * Express middleware to protect administrative routes
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.admin_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Admin authentication required." });
  }

  const user = verifyAdminToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }

  (req as any).adminUser = user;
  next();
}

/**
 * Log administrative audit event
 */
export async function recordAuditLog(actor: string, action: string, details: string, ip?: string) {
  try {
    const db = await getDb();
    const id = `audit-${uuidv4()}`;
    const now = new Date().toISOString();
    db.run(`
      INSERT INTO audit_logs (id, actor, action, details, ip_address, timestamp)
      VALUES (
        '${id}', '${actor.replace(/'/g, "''")}', '${action.replace(/'/g, "''")}',
        '${details.replace(/'/g, "''")}', '${(ip || "").replace(/'/g, "''")}', '${now}'
      );
    `);
    persistDb();
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

export { ADMIN_PASSWORD };
