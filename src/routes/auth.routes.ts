import { Router, Request, Response, NextFunction, IRouter } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import { AppError } from '../middleware/error.middleware';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router: IRouter = Router();

/**
 * Parse time string to seconds (e.g., '7d' -> 604800)
 */
const parseTimeToSeconds = (time: string): number => {
  const match = time.match(/^(\d+)([smhd])$/);
  if (!match) return 86400 * 7; // default 7 days
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 86400 * 7;
  }
};

// In-memory user store for demo purposes
// TODO: Replace with your Mongoose User model
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

const users: Map<string, User> = new Map();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      throw new AppError('Please provide email, password, and name', 400);
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = `user_${Date.now()}`;
    const newUser: User = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    };

    users.set(userId, newUser);

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      config.jwtSecret,
      { expiresIn: parseTimeToSeconds(config.jwtExpiresIn) }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user by email
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: parseTimeToSeconds(config.jwtExpiresIn) }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = users.get(req.user?.userId || '');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side should remove token)
 * @access  Private
 */
router.post('/logout', authenticate, (_req: AuthRequest, res: Response) => {
  // In a production app, you might want to:
  // - Add the token to a blacklist
  // - Invalidate refresh tokens
  // - Update user's last logout timestamp
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Private
 */
router.post('/refresh', authenticate, (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = users.get(req.user?.userId || '');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: parseTimeToSeconds(config.jwtExpiresIn) }
    );

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
