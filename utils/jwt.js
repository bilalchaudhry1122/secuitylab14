const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key';

/**
 * Create JWT access token
 * @param {Object} payload - User information to encode
 * @returns {String} JWT token string
 */
function generateToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
}

/**
 * Validate and decode JWT token
 * @param {String} token - JWT token string to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

module.exports = {
  generateToken,
  verifyToken
};
