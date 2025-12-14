const fs = require('fs');
const path = require('path');

const permissionConfigPath = path.join(__dirname, '..', 'permissions.json');
let permissionRules = {};

try {
  const permissionFileContent = fs.readFileSync(permissionConfigPath, 'utf8');
  permissionRules = JSON.parse(permissionFileContent);
} catch (error) {
  console.error('Error loading permissions.json:', error);
  permissionRules = {};
}

/**
 * Permission Check Middleware
 * Validates user permissions based on role and requested action
 * 
 * @param {String} resourceType - The resource name (e.g., "course", "assignment")
 * @param {String} operationType - The operation name (e.g., "create", "view", "delete")
 * @returns {Function} Express middleware function
 */
const checkPermissions = (resourceType, operationType) => {
  return (request, response, next) => {
    try {
      if (!request.user || !request.user.role) {
        return response.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const userRoleType = request.user.role.toLowerCase();

      if (!permissionRules[resourceType]) {
        return response.status(403).json({
          success: false,
          message: `Resource '${resourceType}' not found in permissions`
        });
      }

      if (!permissionRules[resourceType][userRoleType]) {
        return response.status(403).json({
          success: false,
          message: `Role '${userRoleType}' not found for resource '${resourceType}'`
        });
      }

      const hasPermission = permissionRules[resourceType][userRoleType][operationType];

      if (hasPermission === undefined) {
        return response.status(403).json({
          success: false,
          message: `Operation '${operationType}' not defined for role '${userRoleType}' in resource '${resourceType}'`
        });
      }

      if (!hasPermission) {
        return response.status(403).json({
          success: false,
          error: "Access Denied"
        });
      }

      next();
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Authorization error',
        error: error.message
      });
    }
  };
};

module.exports = checkPermissions;
