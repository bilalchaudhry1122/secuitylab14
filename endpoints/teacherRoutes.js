const express = require('express');
const router = express.Router();
const authenticate = require('../guards/auth');
const authorize = require('../guards/rbac');
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
} = require('../handlers/teacherController');

router.use(authenticate);

router.post('/courses', authorize('course', 'create'), createCourse);
router.get('/courses', authorize('course', 'view'), viewCourses);
router.put('/courses/:id', authorize('course', 'update'), updateCourse);
router.post('/courses/:courseId/students', authorize('course', 'manageStudents'), manageStudents);

router.post('/assignments', authorize('assignment', 'create'), createAssignment);
router.put('/assignments/:id', authorize('assignment', 'update'), updateAssignment);
router.delete('/assignments/:id', authorize('assignment', 'delete'), deleteAssignment);

router.get('/assignments/:assignmentId/submissions', authorize('submission', 'viewAll'), viewAllSubmissions);

router.post('/submissions/:submissionId/grade', authorize('submission', 'grade'), gradeSubmission);

module.exports = router;
