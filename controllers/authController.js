const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role
    const validRole = role && (role.toLowerCase() === 'teacher' || role.toLowerCase() === 'student')
      ? role.toLowerCase()
      : 'student';

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: validRole
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Try to load from users.json first
    const fs = require('fs');
    const path = require('path');
    const usersPath = path.join(__dirname, '..', 'users.json');
    
    let user = null;
    
    // Check if users.json exists
    if (fs.existsSync(usersPath)) {
      const usersData = fs.readFileSync(usersPath, 'utf8');
      const users = JSON.parse(usersData);
      user = users.find(u => u.email === email && u.password === password);
    }
    
    // Fallback to User model
    if (!user) {
      const dbUser = User.findByEmail(email);
      if (dbUser) {
        const isPasswordValid = await dbUser.comparePassword(password);
        if (isPasswordValid) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role
          };
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      token: token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login
};

