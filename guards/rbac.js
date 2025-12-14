const fileSystem = require('fs');
const pathUtility = require('path');

const permissionsFilePath = pathUtility.join(__dirname, '..', 'config', 'permissions.json');
let permissionConfig = {};

try {
  const permissionsData = fileSystem.readFileSync(permissionsFilePath, 'utf8');
  permissionConfig = JSON.parse(permissionsData);
} catch (errorObject) {
  console.error('Error loading permissions.json:', errorObject);
  permissionConfig = {};
}

const checkPermissions = (moduleName, actionName) => {
  return (requestObject, responseObject, nextHandler) => {
    try {
      if (!requestObject.user || !requestObject.user.role) {
        return responseObject.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const userRoleType = requestObject.user.role.toLowerCase();

      if (!permissionConfig[moduleName]) {
        return responseObject.status(403).json({
          success: false,
          message: `Module '${moduleName}' not found in permissions`
        });
      }

      if (!permissionConfig[moduleName][userRoleType]) {
        return responseObject.status(403).json({
          success: false,
          message: `Role '${userRoleType}' not found for module '${moduleName}'`
        });
      }

      const hasPermission = permissionConfig[moduleName][userRoleType][actionName];

      if (hasPermission === undefined) {
        return responseObject.status(403).json({
          success: false,
          message: `Action '${actionName}' not defined for role '${userRoleType}' in module '${moduleName}'`
        });
      }

      if (!hasPermission) {
        return responseObject.status(403).json({
          success: false,
          error: "Access Denied"
        });
      }

      nextHandler();
    } catch (errorObject) {
      return responseObject.status(500).json({
        success: false,
        message: 'Authorization error',
        error: errorObject.message
      });
    }
  };
};

module.exports = checkPermissions;
