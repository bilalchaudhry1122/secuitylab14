const UserModel = require('../models/User');
const { generateToken } = require('../services/jwt');

const registerUser = async (requestObject, responseObject) => {
  try {
    const { email, password, name, role } = requestObject.body;

    if (!email || !password || !name) {
      return responseObject.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    const existingUserRecord = UserModel.findByEmail(email);
    if (existingUserRecord) {
      return responseObject.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const validUserRole = role && (role.toLowerCase() === 'teacher' || role.toLowerCase() === 'student')
      ? role.toLowerCase()
      : 'student';

    const newUser = await UserModel.create({
      email,
      password,
      name,
      role: validUserRole
    });

    const jwtToken = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    responseObject.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser.toJSON(),
        token: jwtToken
      }
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Registration failed',
      error: errorObject.message
    });
  }
};

const authenticateUser = async (requestObject, responseObject) => {
  try {
    const { email, password } = requestObject.body;

    if (!email || !password) {
      return responseObject.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const fileSystem = require('fs');
    const pathUtility = require('path');
    const usersFilePath = pathUtility.join(__dirname, '..', 'data', 'users.json');
    
    let foundUser = null;
    
    if (fileSystem.existsSync(usersFilePath)) {
      const usersFileData = fileSystem.readFileSync(usersFilePath, 'utf8');
      const usersArray = JSON.parse(usersFileData);
      foundUser = usersArray.find(userRecord => userRecord.email === email && userRecord.password === password);
    }
    
    if (!foundUser) {
      const databaseUser = UserModel.findByEmail(email);
      if (databaseUser) {
        const passwordMatches = await databaseUser.comparePassword(password);
        if (passwordMatches) {
          foundUser = {
            id: databaseUser.id,
            email: databaseUser.email,
            role: databaseUser.role
          };
        }
      }
    }

    if (!foundUser) {
      return responseObject.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const accessToken = generateToken({
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role
    });

    responseObject.json({
      success: true,
      message: 'Login successful',
      token: accessToken
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Login failed',
      error: errorObject.message
    });
  }
};

module.exports = {
  register: registerUser,
  login: authenticateUser
};
