const CourseModel = require('../models/Course');
const AssignmentModel = require('../models/Assignment');
const SubmissionModel = require('../models/Submission');
const GradeModel = require('../models/Grade');
const UserModel = require('../models/User');
const { enrollments } = require('../config/database');

const createCourse = (requestObject, responseObject) => {
  try {
    const instructorId = requestObject.user.id;
    const { title, description } = requestObject.body;

    if (!title || !description) {
      return responseObject.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const newCourse = CourseModel.create({
      title,
      description,
      teacherId: instructorId
    });

    responseObject.status(201).json({
      success: true,
      message: 'Course created successfully'
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: errorObject.message
    });
  }
};

const updateCourse = (requestObject, responseObject) => {
  try {
    const instructorId = requestObject.user.id;
    const courseIdentifier = requestObject.params.id;
    const { title, description } = requestObject.body;

    const courseRecord = CourseModel.findById(courseIdentifier);
    if (!courseRecord) {
      return responseObject.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courseRecord.teacherId !== instructorId) {
      return responseObject.status(403).json({
        success: false,
        message: 'You can only update your own courses'
      });
    }

    const updatedCourseRecord = CourseModel.update(courseIdentifier, { title, description });

    responseObject.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourseRecord
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: errorObject.message
    });
  }
};

const viewCourses = (requestObject, responseObject) => {
  try {
    const instructorId = requestObject.user.id;
    const courseList = CourseModel.findByTeacherId(instructorId);

    responseObject.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: courseList
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: errorObject.message
    });
  }
};

const manageStudents = (requestObject, responseObject) => {
  try {
    const instructorId = requestObject.user.id;
    const courseIdentifier = requestObject.params.courseId;
    const { action, studentId } = requestObject.body;

    const courseRecord = CourseModel.findById(courseIdentifier);
    if (!courseRecord) {
      return responseObject.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courseRecord.teacherId !== instructorId) {
      return responseObject.status(403).json({
        success: false,
        message: 'You can only manage students in your own courses'
      });
    }

    if (action === 'enroll') {
      if (!studentId) {
        return responseObject.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const studentRecord = UserModel.findById(studentId);
      if (!studentRecord || studentRecord.role !== 'student') {
        return responseObject.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const enrollmentSuccess = CourseModel.enrollStudent(courseIdentifier, studentId);
      if (enrollmentSuccess) {
        responseObject.json({
          success: true,
          message: 'Student enrolled successfully'
        });
      } else {
        responseObject.status(400).json({
          success: false,
          message: 'Student is already enrolled'
        });
      }
    } else if (action === 'remove') {
      if (!studentId) {
        return responseObject.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const enrollmentIndex = enrollments.findIndex(
        enrollmentRecord => enrollmentRecord.courseId === parseInt(courseIdentifier) && enrollmentRecord.studentId === parseInt(studentId)
      );

      if (enrollmentIndex !== -1) {
        enrollments.splice(enrollmentIndex, 1);
        responseObject.json({
          success: true,
          message: 'Student removed successfully'
        });
      } else {
        responseObject.status(404).json({
          success: false,
          message: 'Student is not enrolled in this course'
        });
      }
    } else {
      responseObject.status(400).json({
        success: false,
        message: 'Invalid action. Use "enroll" or "remove"'
      });
    }
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to manage students',
      error: errorObject.message
    });
  }
};

const createAssignment = (requestObject, responseObject) => {
  try {
    const instructorId = requestObject.user.id;
    const { title, description, courseId, dueDate } = requestObject.body;

    if (!title || !description || !courseId) {
      return responseObject.status(400).json({
        success: false,
        message: 'Title, description, and course ID are required'
      });
    }

    const courseRecord = CourseModel.findById(courseId);
    if (!courseRecord) {
      return responseObject.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courseRecord.teacherId !== instructorId) {
      return responseObject.status(403).json({
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

    responseObject.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: newAssignment
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: errorObject.message
    });
  }
};

const updateAssignment = (requestObject, responseObject) => {
  try {
    const instructorId = requestObject.user.id;
    const assignmentIdentifier = requestObject.params.id;
    const { title, description, dueDate } = requestObject.body;

    const assignmentRecord = AssignmentModel.findById(assignmentIdentifier);
    if (!assignmentRecord) {
      return responseObject.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignmentRecord.teacherId !== instructorId) {
      return responseObject.status(403).json({
        success: false,
        message: 'You can only update your own assignments'
      });
    }

    const updatedAssignmentRecord = AssignmentModel.update(assignmentIdentifier, {
      title,
      description,
      dueDate
    });

    responseObject.json({
      success: true,
      message: 'Assignment updated successfully',
      data: updatedAssignmentRecord
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: errorObject.message
    });
  }
};

const deleteAssignment = (requestObject, responseObject) => {
  try {
    const instructorId = requestObject.user.id;
    const assignmentIdentifier = requestObject.params.id;

    const assignmentRecord = AssignmentModel.findById(assignmentIdentifier);
    if (!assignmentRecord) {
      return responseObject.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignmentRecord.teacherId !== instructorId) {
      return responseObject.status(403).json({
        success: false,
        message: 'You can only delete your own assignments'
      });
    }

    AssignmentModel.delete(assignmentIdentifier);

    responseObject.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: errorObject.message
    });
  }
};

const viewAllSubmissions = (requestObject, responseObject) => {
  try {
    const instructorId = requestObject.user.id;
    const assignmentIdentifier = requestObject.params.assignmentId;

    const assignmentRecord = AssignmentModel.findById(assignmentIdentifier);
    if (!assignmentRecord) {
      return responseObject.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignmentRecord.teacherId !== instructorId) {
      return responseObject.status(403).json({
        success: false,
        message: 'You can only view submissions for your own assignments'
      });
    }

    const submissionList = SubmissionModel.findByAssignmentId(assignmentIdentifier);

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

const gradeSubmission = (requestObject, responseObject) => {
  try {
    const instructorId = requestObject.user.id;
    const submissionIdentifier = requestObject.params.submissionId;
    const { score, feedback } = requestObject.body;

    if (!score) {
      return responseObject.status(400).json({
        success: false,
        message: 'Score is required'
      });
    }

    const submissionRecord = SubmissionModel.findById(submissionIdentifier);
    if (!submissionRecord) {
      return responseObject.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const assignmentRecord = AssignmentModel.findById(submissionRecord.assignmentId);
    if (!assignmentRecord || assignmentRecord.teacherId !== instructorId) {
      return responseObject.status(403).json({
        success: false,
        message: 'You can only grade submissions for your own assignments'
      });
    }

    let gradeRecord = GradeModel.findBySubmissionId(submissionIdentifier);

    if (gradeRecord) {
      gradeRecord = GradeModel.update(gradeRecord.id, {
        score,
        feedback,
        gradedBy: instructorId
      });
    } else {
      gradeRecord = GradeModel.create({
        submissionId: submissionIdentifier,
        assignmentId: submissionRecord.assignmentId,
        studentId: submissionRecord.studentId,
        score,
        feedback,
        gradedBy: instructorId
      });
    }

    responseObject.json({
      success: true,
      message: 'Submission graded successfully',
      data: gradeRecord
    });
  } catch (errorObject) {
    responseObject.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: errorObject.message
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
