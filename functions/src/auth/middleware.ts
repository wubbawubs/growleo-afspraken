import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// 1. Declare custom interface to extend Request
interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

// 2. Update function signature to use AuthRequest
export async function verifyAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {  // Add return type
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return; // Add explicit return
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token met de juiste projectId
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Now TypeScript knows req.user exists
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth verification failed:', error);
    res.status(401).json({ error: 'Unauthorized' });
    return; // Add explicit return
  }
}

export async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  console.log('👑 === ADMIN CHECK START ===');
  const user = (req as any).user;
  
  if (!user) {
    console.log('❌ No user found in request');
    res.status(401).json({ error: 'No authentication token provided' });
    return;
  }

  console.log('👤 User role:', user.role);
  if (user.role !== 'admin') {
    console.log('🚫 User is not admin');
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  console.log('✅ Admin check passed');
  next();
} 