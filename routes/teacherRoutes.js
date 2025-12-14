const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
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

// All teacher routes require authentication
router.use(authenticate);

// Course routes
router.post('/courses', authorize('course', 'create'), createCourse);
router.get('/courses', authorize('course', 'view'), viewCourses);
router.put('/courses/:id', authorize('course', 'update'), updateCourse);
router.post('/courses/:courseId/students', authorize('course', 'manageStudents'), manageStudents);

// Assignment routes
router.post('/assignments', authorize('assignment', 'create'), createAssignment);
router.put('/assignments/:id', authorize('assignment', 'update'), updateAssignment);
router.delete('/assignments/:id', authorize('assignment', 'delete'), deleteAssignment);

// Submission routes
router.get('/assignments/:assignmentId/submissions', authorize('submission', 'viewAll'), viewAllSubmissions);

// Grade routes
router.post('/submissions/:submissionId/grade', authorize('submission', 'grade'), gradeSubmission);

module.exports = router;

