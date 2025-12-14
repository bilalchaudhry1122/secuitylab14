const CourseModel = require('../models/Course');
const AssignmentModel = require('../models/Assignment');
const SubmissionModel = require('../models/Submission');
const GradeModel = require('../models/Grade');
const { enrollments } = require('../config/database');

/**
 * Retrieve courses for enrolled students
 */
const viewCourses = (request, response) => {
  try {
    response.json({
      success: true,
      message: "Courses fetched successfully",
      data: []
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error.message
    });
  }
};

/**
 * Retrieve assignments for enrolled courses
 */
const viewAssignments = (request, response) => {
  try {
    const learnerId = request.user.id;
    
    const enrolledCourseIds = enrollments
      .filter(e => e.studentId === learnerId)
      .map(e => e.courseId);

    const assignmentList = AssignmentModel.findAll()
      .filter(a => enrolledCourseIds.includes(a.courseId));

    response.json({
      success: true,
      message: 'Assignments retrieved successfully',
      data: assignmentList
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments',
      error: error.message
    });
  }
};

/**
 * Submit assignment work
 */
const submitAssignment = (request, response) => {
  try {
    const learnerId = request.user.id;
    const { assignmentId, content, fileUrl } = request.body;

    if (!assignmentId || !content) {
      return response.status(400).json({
        success: false,
        message: 'Assignment ID and content are required'
      });
    }

    const assignmentData = AssignmentModel.findById(assignmentId);
    if (!assignmentData) {
      return response.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const isEnrolled = enrollments.some(
      e => e.courseId === assignmentData.courseId && e.studentId === learnerId
    );

    if (!isEnrolled) {
      return response.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    let submissionData = SubmissionModel.findByStudentAndAssignment(learnerId, assignmentId);
    
    if (submissionData) {
      submissionData = SubmissionModel.update(submissionData.id, { content, fileUrl });
    } else {
      submissionData = SubmissionModel.create({
        assignmentId,
        studentId: learnerId,
        content,
        fileUrl
      });
    }

    response.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message
    });
  }
};

/**
 * View own submissions
 */
const viewSubmissions = (request, response) => {
  try {
    const learnerId = request.user.id;
    const submissionList = SubmissionModel.findByStudentId(learnerId);

    response.json({
      success: true,
      message: 'Submissions retrieved successfully',
      data: submissionList
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: error.message
    });
  }
};

/**
 * View own grades
 */
const viewGrades = (request, response) => {
  try {
    const learnerId = request.user.id;
    const gradeList = GradeModel.findByStudentId(learnerId);

    response.json({
      success: true,
      message: 'Grades retrieved successfully',
      data: gradeList
    });
  } catch (error) {
    response.status(500).json({
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
