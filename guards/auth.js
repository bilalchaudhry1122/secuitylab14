const { verifyToken } = require('../services/jwt');

const verifyAuth = (requestObject, responseObject, nextHandler) => {
  try {
    const authorizationHeader = requestObject.headers.authorization;
    
    if (!authorizationHeader) {
      return responseObject.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    if (!authorizationHeader.startsWith('Bearer ')) {
      return responseObject.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>'
      });
    }

    const tokenString = authorizationHeader.substring(7);

    if (!tokenString) {
      return responseObject.status(401).json({
        success: false,
        message: 'Token not provided'
      });
    }

    const decodedToken = verifyToken(tokenString);

    requestObject.user = {
      id: decodedToken.id,
      role: decodedToken.role,
      email: decodedToken.email
    };

    nextHandler();
  } catch (errorObject) {
    return responseObject.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: errorObject.message
    });
  }
};

module.exports = verifyAuth;
