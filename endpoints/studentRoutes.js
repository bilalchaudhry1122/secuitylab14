const express = require('express');
const router = express.Router();
const authenticate = require('../guards/auth');
const authorize = require('../guards/rbac');
const {
  viewCourses,
  viewAssignments,
  submitAssignment,
  viewSubmissions,
  viewGrades
} = require('../handlers/studentController');

router.use(authenticate);

router.get('/courses', authorize('course', 'view'), viewCourses);

router.get('/assignments', authorize('assignment', 'view'), viewAssignments);

router.post('/assignments/submit', authorize('assignment', 'submit'), submitAssignment);

router.get('/submissions', authorize('submission', 'view'), viewSubmissions);

router.get('/grades', authorize('grade', 'view'), viewGrades);

module.exports = router;
