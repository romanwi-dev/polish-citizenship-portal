import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import type { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: JWT_SECRET environment variable is required in production');
    process.exit(1);
  }
  
  // Use a development secret with warning
  console.warn('⚠️  WARNING: Using default JWT secret for development. Set JWT_SECRET for production!');
  return 'dev-jwt-secret-change-for-production';
})();
const PASSWORD_HASH_SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function generateEmailVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const user = await storage.getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const token = generateToken(user.id);
  return { user, token };
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  const user = await storage.getUser(decoded.userId);
  return user || null;
}