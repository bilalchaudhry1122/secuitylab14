const fs = require('fs');
const path = require('path');

// Load permissions from JSON file
const permissionsPath = path.join(__dirname, '..', 'permissions.json');
let permissions = {};

try {
  const permissionsData = fs.readFileSync(permissionsPath, 'utf8');
  permissions = JSON.parse(permissionsData);
} catch (error) {
  console.error('Error loading permissions.json:', error);
  permissions = {};
}

/**
 * RBAC Authorization Middleware
 * Checks if user role has permission for the requested action
 * 
 * @param {String} module - The module name (e.g., "course", "assignment")
 * @param {String} action - The action name (e.g., "create", "view", "delete")
 * @returns {Function} Express middleware function
 */
const authorize = (module, action) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated (should be set by auth middleware)
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const userRole = req.user.role.toLowerCase();

      // Check if module exists in permissions
      if (!permissions[module]) {
        return res.status(403).json({
          success: false,
          message: `Module '${module}' not found in permissions`
        });
      }

      // Check if role exists for this module
      if (!permissions[module][userRole]) {
        return res.status(403).json({
          success: false,
          message: `Role '${userRole}' not found for module '${module}'`
        });
      }

      // Check if action is allowed for this role
      const isAllowed = permissions[module][userRole][action];

      if (isAllowed === undefined) {
        return res.status(403).json({
          success: false,
          message: `Action '${action}' not defined for role '${userRole}' in module '${module}'`
        });
      }

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          error: "Access Denied"
        });
      }

      // Permission granted, proceed
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        error: error.message
      });
    }
  };
};

module.exports = authorize;

