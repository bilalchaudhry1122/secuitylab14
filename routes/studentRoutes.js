const express = require('express');
const routeHandler = express.Router();
const verifyUserToken = require('../middleware/auth');
const checkPermissions = require('../middleware/rbac');
const {
  viewCourses,
  viewAssignments,
  submitAssignment,
  viewSubmissions,
  viewGrades
} = require('../controllers/studentController');

routeHandler.use(verifyUserToken);

routeHandler.get('/courses', checkPermissions('course', 'view'), viewCourses);

routeHandler.get('/assignments', checkPermissions('assignment', 'view'), viewAssignments);

routeHandler.post('/assignments/submit', checkPermissions('assignment', 'submit'), submitAssignment);

routeHandler.get('/submissions', checkPermissions('submission', 'view'), viewSubmissions);

routeHandler.get('/grades', checkPermissions('grade', 'view'), viewGrades);

module.exports = routeHandler;
