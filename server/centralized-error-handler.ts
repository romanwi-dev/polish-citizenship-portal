import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class CustomAppError extends Error implements AppError {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  // Log error details for debugging
  console.error('Error occurred:', {
    message: err.message,
    statusCode: err.statusCode || 500,
    code: err.code || 'INTERNAL_ERROR',
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user?.id || 'anonymous'
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Determine error code
  const errorCode = err.code || 'INTERNAL_ERROR';

  // Send consistent error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.details : undefined,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || Math.random().toString(36).substring(7)
    }
  });
};

// Common error types for consistency
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

// Helper functions for common errors
export const createValidationError = (message: string, details?: any) => 
  new CustomAppError(message, 400, ErrorTypes.VALIDATION_ERROR, details);

export const createAuthenticationError = (message: string = 'Authentication required') => 
  new CustomAppError(message, 401, ErrorTypes.AUTHENTICATION_ERROR);

export const createAuthorizationError = (message: string = 'Insufficient permissions') => 
  new CustomAppError(message, 403, ErrorTypes.AUTHORIZATION_ERROR);

export const createNotFoundError = (resource: string = 'Resource') => 
  new CustomAppError(`${resource} not found`, 404, ErrorTypes.NOT_FOUND_ERROR);

export const createConflictError = (message: string) => 
  new CustomAppError(message, 409, ErrorTypes.CONFLICT_ERROR);

export const createDatabaseError = (message: string, details?: any) => 
  new CustomAppError(message, 500, ErrorTypes.DATABASE_ERROR, details);

export const createExternalApiError = (service: string, message: string) => 
  new CustomAppError(`${service} API error: ${message}`, 502, ErrorTypes.EXTERNAL_API_ERROR);

// Async error wrapper to catch async function errors
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};