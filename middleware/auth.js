const { verifyToken } = require('../utils/jwt');

/**
 * Token Verification Middleware
 * Processes Authorization header → Validates JWT → Attaches user context → Blocks invalid tokens
 */
const verifyUserToken = (request, response, next) => {
  try {
    const authorizationHeader = request.headers.authorization;
    
    if (!authorizationHeader) {
      return response.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    if (!authorizationHeader.startsWith('Bearer ')) {
      return response.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>'
      });
    }

    const accessToken = authorizationHeader.substring(7);

    if (!accessToken) {
      return response.status(401).json({
        success: false,
        message: 'Token not provided'
      });
    }

    const decodedPayload = verifyToken(accessToken);

    request.user = {
      id: decodedPayload.id,
      role: decodedPayload.role,
      email: decodedPayload.email
    };

    next();
  } catch (error) {
    return response.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

module.exports = verifyUserToken;
