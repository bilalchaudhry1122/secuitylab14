const CourseModel = require('../models/Course');
const AssignmentModel = require('../models/Assignment');
const SubmissionModel = require('../models/Submission');
const GradeModel = require('../models/Grade');
const { enrollments } = require('../config/database');

const viewCourses = (requestObject, responseObject) => {
  try {
    responseObject.json({
      success: true,
      message: "Courses fetched successfully",
      data: []
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: errorObject.message
    });
  }
};

const viewAssignments = (requestObject, responseObject) => {
  try {
    const learnerId = requestObject.user.id;
    
    const enrolledCourseIdList = enrollments
      .filter(enrollmentRecord => enrollmentRecord.studentId === learnerId)
      .map(enrollmentRecord => enrollmentRecord.courseId);

    const assignmentList = AssignmentModel.findAll()
      .filter(assignmentRecord => enrolledCourseIdList.includes(assignmentRecord.courseId));

    responseObject.json({
      success: true,
      message: 'Assignments retrieved successfully',
      data: assignmentList
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments',
      error: errorObject.message
    });
  }
};

const submitAssignment = (requestObject, responseObject) => {
  try {
    const learnerId = requestObject.user.id;
    const { assignmentId, content, fileUrl } = requestObject.body;

    if (!assignmentId || !content) {
      return responseObject.status(400).json({
        success: false,
        message: 'Assignment ID and content are required'
      });
    }

    const assignmentRecord = AssignmentModel.findById(assignmentId);
    if (!assignmentRecord) {
      return responseObject.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const isEnrolledInCourse = enrollments.some(
      enrollmentRecord => enrollmentRecord.courseId === assignmentRecord.courseId && enrollmentRecord.studentId === learnerId
    );

    if (!isEnrolledInCourse) {
      return responseObject.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    let submissionRecord = SubmissionModel.findByStudentAndAssignment(learnerId, assignmentId);
    
    if (submissionRecord) {
      submissionRecord = SubmissionModel.update(submissionRecord.id, { content, fileUrl });
    } else {
      submissionRecord = SubmissionModel.create({
        assignmentId,
        studentId: learnerId,
        content,
        fileUrl
      });
    }

    responseObject.json({
      success: true,
      message: 'Assignment submitted successfully'
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: errorObject.message
    });
  }
};

const viewSubmissions = (requestObject, responseObject) => {
  try {
    const learnerId = requestObject.user.id;
    const submissionList = SubmissionModel.findByStudentId(learnerId);

    responseObject.json({
      success: true,
      message: 'Submissions retrieved successfully',
      data: submissionList
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions',
      error: errorObject.message
    });
  }
};

const viewGrades = (requestObject, responseObject) => {
  try {
    const learnerId = requestObject.user.id;
    const gradeList = GradeModel.findByStudentId(learnerId);

    responseObject.json({
      success: true,
      message: 'Grades retrieved successfully',
      data: gradeList
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to retrieve grades',
      error: errorObject.message
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
