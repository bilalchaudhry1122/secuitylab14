const express = require('express');
const routeHandler = express.Router();
const verifyUserToken = require('../middleware/auth');
const checkPermissions = require('../middleware/rbac');
const {
  createCourse,
  updateCourse,
  viewCourses,
  manageStudents,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  viewAllSubmissions,
  gradeSubmission
} = require('../controllers/teacherController');

routeHandler.use(verifyUserToken);

routeHandler.post('/courses', checkPermissions('course', 'create'), createCourse);
routeHandler.get('/courses', checkPermissions('course', 'view'), viewCourses);
routeHandler.put('/courses/:id', checkPermissions('course', 'update'), updateCourse);
routeHandler.post('/courses/:courseId/students', checkPermissions('course', 'manageStudents'), manageStudents);

routeHandler.post('/assignments', checkPermissions('assignment', 'create'), createAssignment);
routeHandler.put('/assignments/:id', checkPermissions('assignment', 'update'), updateAssignment);
routeHandler.delete('/assignments/:id', checkPermissions('assignment', 'delete'), deleteAssignment);

routeHandler.get('/assignments/:assignmentId/submissions', checkPermissions('submission', 'viewAll'), viewAllSubmissions);

routeHandler.post('/submissions/:submissionId/grade', checkPermissions('submission', 'grade'), gradeSubmission);

module.exports = routeHandler;
