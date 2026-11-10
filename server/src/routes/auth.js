import express from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken, requireAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['admin', 'facility_manager', 'student']).optional(),
});

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'facility_manager', 'student']).default('student'),
});

// Demo accounts endpoint for 1-click test login
router.get('/demo-accounts', (req, res) => {
  res.json({
    roles: [
      {
        role: 'admin',
        title: 'Administrator',
        username: 'admin',
        password: 'Admin@123',
        description: 'Full access to AI Planner, Reports, Alerts, Thresholds, Devices & Analytics.',
      },
      {
        role: 'facility_manager',
        title: 'Facility Manager',
        username: 'manager',
        password: 'Manager@123',
        description: 'Access to AI Planner, Reports, Alerts, Thresholds, and Analytics.',
      },
      {
        role: 'student',
        title: 'Student / User',
        username: 'student',
        password: 'Student@123',
        description: 'Read-only access to Campus Sustainability Statistics, Metrics & Charts.',
      },
    ],
  });
});

// Login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findOne({ username: username.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password.',
        },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password.',
        },
      });
    }

    // If role was selected in the login form, ensure user role matches or update if admin allowed
    if (role && user.role !== role) {
      // In demo mode or if user has access, allow role switch for demo users or notify
      if (['admin', 'manager', 'student'].includes(user.username)) {
        user.role = role;
        await user.save();
      } else {
        return res.status(403).json({
          error: {
            code: 'ROLE_MISMATCH',
            message: `Account has role '${user.role}', but login requested '${role}'.`,
          },
        });
      }
    }

    const payload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Signup
router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const normalizedUsername = username.toLowerCase().trim();

    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) {
      return res.status(409).json({
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username is already taken.',
        },
      });
    }

    const passwordHash = await User.hashPassword(password);
    const newUser = await User.create({
      username: normalizedUsername,
      passwordHash,
      role: role || 'student',
    });

    const payload = {
      id: newUser._id.toString(),
      username: newUser.username,
      role: newUser.role,
    };

    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Refresh token
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    return res.status(401).json({
      error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token missing' },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newAccessToken = signAccessToken({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    });

    res.json({ token: newAccessToken });
  } catch (err) {
    res.status(401).json({
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token invalid' },
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// Me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
