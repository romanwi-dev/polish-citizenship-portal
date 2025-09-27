/**
 * ID generation utility for CAP and Tasks
 * Simple implementation for production-ready unique IDs
 */

export function id(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}