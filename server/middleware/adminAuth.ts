// Enhanced RBAC middleware for admin routes
import { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../auth';
import { storage } from '../storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}

// Middleware to enforce admin or staff role authentication
export const requireAdminRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-admin-token'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    let user = null;
    
    // Handle JWT Bearer tokens
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      user = await getUserFromToken(token);
    }
    
    // Handle legacy admin tokens in development
    else if (process.env.NODE_ENV === 'development' && process.env.QA_MODE === 'ON' && 
             typeof authHeader === 'string' && authHeader.length > 0) {
      // Allow development bypass only with some token/header present
      req.user = {
        id: 'dev-admin',
        email: 'dev@admin.local',
        role: 'admin',
        firstName: 'Development',
        lastName: 'Admin'
      };
      return next();
    }

    if (!user) {
      // Log failed authentication attempt
      await storage.createSecurityLog({
        userId: null,
        eventType: 'login',
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        isSuccess: false,
        metadata: { 
          action: 'admin_access_denied',
          reason: 'invalid_token',
          endpoint: req.path,
          method: req.method
        }
      });

      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid authentication token'
      });
    }

    // Check if user has admin or staff role
    if (user.role !== 'admin' && user.role !== 'staff') {
      // Log unauthorized role access attempt
      await storage.createSecurityLog({
        userId: user.id,
        eventType: 'login',
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        isSuccess: false,
        metadata: { 
          action: 'admin_access_denied',
          reason: 'insufficient_role',
          userRole: user.role,
          endpoint: req.path,
          method: req.method,
          email: user.email
        }
      });

      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Administrator or staff privileges required'
      });
    }

    // Log successful admin access
    await storage.createSecurityLog({
      userId: user.id,
      eventType: 'login',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      isSuccess: true,
      metadata: { 
        action: 'admin_access_granted',
        userRole: user.role,
        endpoint: req.path,
        method: req.method,
        email: user.email
      }
    });

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error('Admin authentication middleware error:', error);
    
    await storage.createSecurityLog({
      userId: null,
      eventType: 'login',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      isSuccess: false,
      metadata: { 
        action: 'admin_auth_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: req.path,
        method: req.method
      }
    });

    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Authentication system error'
    });
  }
};

// Middleware that allows both admin and staff roles
export const requireStaffRole = requireAdminRole;

// Middleware that requires only admin role (not staff)
export const requireAdminOnly = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await requireAdminRole(req, res, (error) => {
    if (error) return next(error);
    
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Administrator role required'
      });
    }
    
    next();
  });
};