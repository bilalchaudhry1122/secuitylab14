const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Grade = require('../models/Grade');
const User = require('../models/User');
const { enrollments } = require('../config/database');

/**
 * Create a new course
 */
const createCourse = (req, res) => {
  try {
    const teacherId = req.user.id;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const course = Course.create({
      title,
      description,
      teacherId
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

/**
 * Update course content
 */
const updateCourse = (req, res) => {
  try {
    const teacherId = req.user.id;
    const courseId = req.params.id;
    const { title, description } = req.body;

    const course = Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if teacher owns this course
    if (course.teacherId !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own courses'
      });
    }

    const updatedCourse = Course.update(courseId, { title, description });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

/**
 * View own courses
 */
const viewCourses = (req, res) => {
  try {
    const teacherId = req.user.id;
    const courses = Course.findByTeacherId(teacherId);

    res.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: courses
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
 * Manage enrolled students (add/remove)
 */
const manageStudents = (req, res) => {
  try {
    const teacherId = req.user.id;
    const courseId = req.params.courseId;
    const { action, studentId } = req.body;

    const course = Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if teacher owns this course
    if (course.teacherId !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage students in your own courses'
      });
    }

    if (action === 'enroll') {
      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const student = User.findById(studentId);
      if (!student || student.role !== 'student') {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const enrolled = Course.enrollStudent(courseId, studentId);
      if (enrolled) {
        res.json({
          success: true,
          message: 'Student enrolled successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Student is already enrolled'
        });
      }
    } else if (action === 'remove') {
      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }

      const index = enrollments.findIndex(
        e => e.courseId === parseInt(courseId) && e.studentId === parseInt(studentId)
      );

      if (index !== -1) {
        enrollments.splice(index, 1);
        res.json({
          success: true,
          message: 'Student removed successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this course'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Use "enroll" or "remove"'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage students',
      error: error.message
    });
  }
};

/**
 * Create assignment
 */
const createAssignment = (req, res) => {
  try {
    const teacherId = req.user.id;
    const { title, description, courseId, dueDate } = req.body;

    if (!title || !description || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and course ID are required'
      });
    }

    // Check if course exists and teacher owns it
    const course = Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.teacherId !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only create assignments for your own courses'
      });
    }

    const assignment = Assignment.create({
      title,
      description,
      courseId,
      teacherId,
      dueDate
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
};

/**
 * Update assignment
 */
const updateAssignment = (req, res) => {
  try {
    const teacherId = req.user.id;
    const assignmentId = req.params.id;
    const { title, description, dueDate } = req.body;

    const assignment = Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if teacher owns this assignment
    if (assignment.teacherId !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own assignments'
      });
    }

    const updatedAssignment = Assignment.update(assignmentId, {
      title,
      description,
      dueDate
    });

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: updatedAssignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message
    });
  }
};

/**
 * Delete assignment
 */
const deleteAssignment = (req, res) => {
  try {
    const teacherId = req.user.id;
    const assignmentId = req.params.id;

    const assignment = Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if teacher owns this assignment
    if (assignment.teacherId !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own assignments'
      });
    }

    Assignment.delete(assignmentId);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
};

/**
 * View all student submissions for an assignment
 */
const viewAllSubmissions = (req, res) => {
  try {
    const teacherId = req.user.id;
    const assignmentId = req.params.assignmentId;

    const assignment = Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if teacher owns this assignment
    if (assignment.teacherId !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view submissions for your own assignments'
      });
    }

    const submissions = Submission.findByAssignmentId(assignmentId);

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
 * Grade a submission
 */
const gradeSubmission = (req, res) => {
  try {
    const teacherId = req.user.id;
    const submissionId = req.params.submissionId;
    const { score, feedback } = req.body;

    if (!score) {
      return res.status(400).json({
        success: false,
        message: 'Score is required'
      });
    }

    const submission = Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if teacher owns the assignment
    const assignment = Assignment.findById(submission.assignmentId);
    if (!assignment || assignment.teacherId !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only grade submissions for your own assignments'
      });
    }

    // Check if grade already exists
    let grade = Grade.findBySubmissionId(submissionId);

    if (grade) {
      // Update existing grade
      grade = Grade.update(grade.id, {
        score,
        feedback,
        gradedBy: teacherId
      });
    } else {
      // Create new grade
      grade = Grade.create({
        submissionId,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        score,
        feedback,
        gradedBy: teacherId
      });
    }

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: grade
    });
  } catch (error) {
    res.status(500).json({
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

