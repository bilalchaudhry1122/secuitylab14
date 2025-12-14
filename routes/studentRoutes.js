const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  viewCourses,
  viewAssignments,
  submitAssignment,
  viewSubmissions,
  viewGrades
} = require('../controllers/studentController');

// All student routes require authentication
router.use(authenticate);

// View enrolled courses - student can view courses
router.get('/courses', authorize('course', 'view'), viewCourses);

// View assignments - student can view assignments
router.get('/assignments', authorize('assignment', 'view'), viewAssignments);

// Submit assignment - student can submit assignments
router.post('/assignments/submit', authorize('assignment', 'submit'), submitAssignment);

// View own submissions - student can view their submissions
router.get('/submissions', authorize('submission', 'view'), viewSubmissions);

// View own grades - student can view their grades
router.get('/grades', authorize('grade', 'view'), viewGrades);

module.exports = router;

