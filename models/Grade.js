const { grades } = require('../config/database');

class Grade {
  constructor(data) {
    this.id = data.id || grades.length + 1;
    this.submissionId = data.submissionId;
    this.assignmentId = data.assignmentId;
    this.studentId = data.studentId;
    this.score = data.score;
    this.feedback = data.feedback;
    this.gradedBy = data.gradedBy; // teacherId
    this.gradedAt = new Date();
  }

  static create(data) {
    const grade = new Grade(data);
    grades.push(grade);
    return grade;
  }

  static findById(id) {
    return grades.find(g => g.id === parseInt(id));
  }

  static findByStudentId(studentId) {
    return grades.filter(g => g.studentId === parseInt(studentId));
  }

  static findBySubmissionId(submissionId) {
    return grades.find(g => g.submissionId === parseInt(submissionId));
  }

  static findByAssignmentId(assignmentId) {
    return grades.filter(g => g.assignmentId === parseInt(assignmentId));
  }

  static update(id, data) {
    const grade = grades.find(g => g.id === parseInt(id));
    if (grade) {
      Object.assign(grade, data);
      grade.gradedAt = new Date();
    }
    return grade;
  }
}

module.exports = Grade;

