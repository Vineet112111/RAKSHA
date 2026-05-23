import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/user.js';

// JWT Generator helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Zod Schemas for Validation
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  defaultSOSMessage: z.string().optional(),
  language: z.string().optional(),
  city: z.string().optional(),
});

const loginSchema = z.object({
  emailOrPhone: z.string().min(4, 'Email or Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, phone, password, defaultSOSMessage, language, city } = validatedData;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or phone number already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      defaultSOSMessage,
      language,
      city,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          defaultSOSMessage: user.defaultSOSMessage,
          language: user.language,
          city: user.city,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ success: false, message: errorMsg });
    }
    console.error('[REGISTER ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { emailOrPhone, password } = validatedData;

    // Find user by email or phone (include password for checking)
    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email/phone or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email/phone or password' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        defaultSOSMessage: user.defaultSOSMessage,
        language: user.language,
        city: user.city,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ success: false, message: errorMsg });
    }
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('[PROFILE ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};
