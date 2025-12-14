const UserModel = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Create new user account
 */
const register = async (request, response) => {
  try {
    const { email, password, name, role } = request.body;

    if (!email || !password || !name) {
      return response.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    const existingUserAccount = UserModel.findByEmail(email);
    if (existingUserAccount) {
      return response.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const assignedRole = role && (role.toLowerCase() === 'teacher' || role.toLowerCase() === 'student')
      ? role.toLowerCase()
      : 'student';

    const newUser = await UserModel.create({
      email,
      password,
      name,
      role: assignedRole
    });

    const accessToken = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    response.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser.toJSON(),
        token: accessToken
      }
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * Authenticate user and provide access token
 */
const login = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const fs = require('fs');
    const path = require('path');
    const usersFilePath = path.join(__dirname, '..', 'users.json');
    
    let authenticatedUser = null;
    
    if (fs.existsSync(usersFilePath)) {
      const usersFileData = fs.readFileSync(usersFilePath, 'utf8');
      const usersList = JSON.parse(usersFileData);
      authenticatedUser = usersList.find(u => u.email === email && u.password === password);
    }
    
    if (!authenticatedUser) {
      const databaseUser = UserModel.findByEmail(email);
      if (databaseUser) {
        const passwordMatches = await databaseUser.comparePassword(password);
        if (passwordMatches) {
          authenticatedUser = {
            id: databaseUser.id,
            email: databaseUser.email,
            role: databaseUser.role
          };
        }
      }
    }

    if (!authenticatedUser) {
      return response.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const accessToken = generateToken({
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      role: authenticatedUser.role
    });

    response.json({
      success: true,
      message: 'Login successful',
      token: accessToken
    });
  } catch (error) {
    response.status(500).json({
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
