const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Grade = require('../models/Grade');
const { enrollments } = require('../config/database');

/**
 * View enrolled courses
 */
const viewCourses = (req, res) => {
  try {
    res.json({
      success: true,
      message: "Courses fetched successfully",
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error.message
    });
  }
};

/**
 * View assignments for enrolled courses
 */
const viewAssignments = (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get enrolled course IDs
    const enrolledCourseIds = enrollments
      .filter(e => e.studentId === studentId)
      .map(e => e.courseId);

    // Get assignments for enrolled courses
    const assignments = Assignment.findAll()
      .filter(a => enrolledCourseIds.includes(a.courseId));

    res.json({
      success: true,
      message: 'Assignments retrieved successfully',
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments',
      error: error.message
    });
  }
};

/**
 * Submit assignment
 */
const submitAssignment = (req, res) => {
  try {
    const studentId = req.user.id;
    const { assignmentId, content, fileUrl } = req.body;

    if (!assignmentId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID and content are required'
      });
    }

    // Check if assignment exists
    const assignment = Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if student is enrolled in the course
    const isEnrolled = enrollments.some(
      e => e.courseId === assignment.courseId && e.studentId === studentId
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check if submission already exists
    let submission = Submission.findByStudentAndAssignment(studentId, assignmentId);
    
    if (submission) {
      // Update existing submission
      submission = Submission.update(submission.id, { content, fileUrl });
    } else {
      // Create new submission
      submission = Submission.create({
        assignmentId,
        studentId,
        content,
        fileUrl
      });
    }

    res.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message
    });
  }
};

/**
 * View own submissions
 */
const viewSubmissions = (req, res) => {
  try {
    const studentId = req.user.id;
    const submissions = Submission.findByStudentId(studentId);

    res.json({
      success: true,
      message: 'Submissions retrieved successfully',
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
};

/**
 * View own grades
 */
const viewGrades = (req, res) => {
  try {
    const studentId = req.user.id;
    const grades = Grade.findByStudentId(studentId);

    res.json({
      success: true,
      message: 'Grades retrieved successfully',
      data: grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve grades',
      error: error.message
    });
  }
};

module.exports = {
  viewCourses,
  viewAssignments,
  submitAssignment,
  viewSubmissions,
  viewGrades
};

