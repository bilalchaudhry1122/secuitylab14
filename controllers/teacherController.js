const CourseModel = require('../models/Course');
const AssignmentModel = require('../models/Assignment');
const SubmissionModel = require('../models/Submission');
const GradeModel = require('../models/Grade');
const UserModel = require('../models/User');
const { enrollments } = require('../config/database');

/**
 * Create new course
 */
const createCourse = (request, response) => {
  try {
    const instructorId = request.user.id;
    const { title, description } = request.body;

    if (!title || !description) {
      return response.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const newCourse = CourseModel.create({
      title,
      description,
      teacherId: instructorId
    });

    response.status(201).json({
      success: true,
      message: 'Course created successfully'
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

/**
 * Modify course information
 */
const updateCourse = (request, response) => {
  try {
    const instructorId = request.user.id;
    const courseId = request.params.id;
    const { title, description } = request.body;

    const courseData = CourseModel.findById(courseId);
    if (!courseData) {
      return response.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courseData.teacherId !== instructorId) {
      return response.status(403).json({
        success: false,
        message: 'You can only update your own courses'
      });
    }

    const modifiedCourse = CourseModel.update(courseId, { title, description });

    response.json({
      success: true,
      message: 'Course updated successfully',
      data: modifiedCourse
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

/**
 * View instructor's courses
 */
const viewCourses = (request, response) => {
  try {
    const instructorId = request.user.id;
    const courseList = CourseModel.findByTeacherId(instructorId);

    response.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: courseList
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
 * Handle student enrollment management
 */
const manageStudents = (request, response) => {
  try {
    const instructorId = request.user.id;
    const courseId = request.params.courseId;
    const { action, studentId } = request.body;

    const courseData = CourseModel.findById(courseId);
    if (!courseData) {
      return response.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courseData.teacherId !== instructorId) {
      return response.status(403).json({
        success: false,
        message: 'You can only manage students in your own courses'
      });
    }

    if (action === 'enroll') {
      if (!studentId) {
        return response.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const learnerData = UserModel.findById(studentId);
      if (!learnerData || learnerData.role !== 'student') {
        return response.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const enrollmentResult = CourseModel.enrollStudent(courseId, studentId);
      if (enrollmentResult) {
        response.json({
          success: true,
          message: 'Student enrolled successfully'
        });
      } else {
        response.status(400).json({
          success: false,
          message: 'Student is already enrolled'
        });
      }
    } else if (action === 'remove') {
      if (!studentId) {
        return response.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const enrollmentIndex = enrollments.findIndex(
        e => e.courseId === parseInt(courseId) && e.studentId === parseInt(studentId)
      );

      if (enrollmentIndex !== -1) {
        enrollments.splice(enrollmentIndex, 1);
        response.json({
          success: true,
          message: 'Student removed successfully'
        });
      } else {
        response.status(404).json({
          success: false,
          message: 'Student is not enrolled in this course'
        });
      }
    } else {
      response.status(400).json({
        success: false,
        message: 'Invalid action. Use "enroll" or "remove"'
      });
    }
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to manage students',
      error: error.message
    });
  }
};

/**
 * Create new assignment
 */
const createAssignment = (request, response) => {
  try {
    const instructorId = request.user.id;
    const { title, description, courseId, dueDate } = request.body;

    if (!title || !description || !courseId) {
      return response.status(400).json({
        success: false,
        message: 'Title, description, and course ID are required'
      });
    }

    const courseData = CourseModel.findById(courseId);
    if (!courseData) {
      return response.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courseData.teacherId !== instructorId) {
      return response.status(403).json({
        success: false,
        message: 'You can only create assignments for your own courses'
      });
    }

    const newAssignment = AssignmentModel.create({
      title,
      description,
      courseId,
      teacherId: instructorId,
      dueDate
    });

    response.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: newAssignment
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
};

/**
 * Modify assignment details
 */
const updateAssignment = (request, response) => {
  try {
    const instructorId = request.user.id;
    const assignmentId = request.params.id;
    const { title, description, dueDate } = request.body;

    const assignmentData = AssignmentModel.findById(assignmentId);
    if (!assignmentData) {
      return response.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignmentData.teacherId !== instructorId) {
      return response.status(403).json({
        success: false,
        message: 'You can only update your own assignments'
      });
    }

    const modifiedAssignment = AssignmentModel.update(assignmentId, {
      title,
      description,
      dueDate
    });

    response.json({
      success: true,
      message: 'Assignment updated successfully',
      data: modifiedAssignment
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message
    });
  }
};

/**
 * Remove assignment
 */
const deleteAssignment = (request, response) => {
  try {
    const instructorId = request.user.id;
    const assignmentId = request.params.id;

    const assignmentData = AssignmentModel.findById(assignmentId);
    if (!assignmentData) {
      return response.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignmentData.teacherId !== instructorId) {
      return response.status(403).json({
        success: false,
        message: 'You can only delete your own assignments'
      });
    }

    AssignmentModel.delete(assignmentId);

    response.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
};

/**
 * View all submissions for assignment
 */
const viewAllSubmissions = (request, response) => {
  try {
    const instructorId = request.user.id;
    const assignmentId = request.params.assignmentId;

    const assignmentData = AssignmentModel.findById(assignmentId);
    if (!assignmentData) {
      return response.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignmentData.teacherId !== instructorId) {
      return response.status(403).json({
        success: false,
        message: 'You can only view submissions for your own assignments'
      });
    }

    const submissionList = SubmissionModel.findByAssignmentId(assignmentId);

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
 * Evaluate and grade submission
 */
const gradeSubmission = (request, response) => {
  try {
    const instructorId = request.user.id;
    const submissionId = request.params.submissionId;
    const { score, feedback } = request.body;

    if (!score) {
      return response.status(400).json({
        success: false,
        message: 'Score is required'
      });
    }

    const submissionData = SubmissionModel.findById(submissionId);
    if (!submissionData) {
      return response.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const assignmentData = AssignmentModel.findById(submissionData.assignmentId);
    if (!assignmentData || assignmentData.teacherId !== instructorId) {
      return response.status(403).json({
        success: false,
        message: 'You can only grade submissions for your own assignments'
      });
    }

    let gradeData = GradeModel.findBySubmissionId(submissionId);

    if (gradeData) {
      gradeData = GradeModel.update(gradeData.id, {
        score,
        feedback,
        gradedBy: instructorId
      });
    } else {
      gradeData = GradeModel.create({
        submissionId,
        assignmentId: submissionData.assignmentId,
        studentId: submissionData.studentId,
        score,
        feedback,
        gradedBy: instructorId
      });
    }

    response.json({
      success: true,
      message: 'Submission graded successfully',
      data: gradeData
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: error.message
    });
  }
};

module.exports = {
  createCourse,
  updateCourse,
  viewCourses,
  manageStudents,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  viewAllSubmissions,
  gradeSubmission
};
