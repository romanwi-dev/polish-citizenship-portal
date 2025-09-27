// Development authentication utilities for admin APIs
// Allows token bypass in development/preview when QA_MODE is ON

export const isDev = () => process.env.NODE_ENV === 'development';

export const qaOn = () => {
  const qaMode = (process.env.QA_MODE || '').toUpperCase();
  return qaMode === 'ON' || qaMode === '1' || qaMode === 'TRUE';
};

export const allowDev = () => isDev() && qaOn();

// Helper to check admin authentication with role-based access
export const checkAdminAuth = async (token: string | string[]): Promise<boolean> => {
  // Normalize token to string (handle array headers)
  const normalizedToken = Array.isArray(token) ? token[0] : String(token || '');
  
  // Allow bypass in development when QA_MODE is ON
  if (allowDev()) {
    return true;
  }
  
  try {
    // Use JWT token for role-based authentication
    if (normalizedToken.startsWith('Bearer ')) {
      const jwtToken = normalizedToken.split(' ')[1];
      const { getUserFromToken } = await import('../auth');
      const user = await getUserFromToken(jwtToken);
      
      // Check if user has admin or staff role
      return user && (user.role === 'admin' || user.role === 'staff');
    }
    
    // Fallback to legacy ADMIN_TOKEN for backwards compatibility
    const expectedToken = process.env.ADMIN_TOKEN;
    return !!expectedToken && normalizedToken === expectedToken;
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return false;
  }
};