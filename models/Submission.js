const { submissions } = require('../config/database');

class Submission {
  constructor(data) {
    this.id = data.id || submissions.length + 1;
    this.assignmentId = data.assignmentId;
    this.studentId = data.studentId;
    this.content = data.content;
    this.fileUrl = data.fileUrl;
    this.submittedAt = new Date();
    this.updatedAt = new Date();
  }

  static create(data) {
    const submission = new Submission(data);
    submissions.push(submission);
    return submission;
  }

  static findById(id) {
    return submissions.find(s => s.id === parseInt(id));
  }

  static findByStudentId(studentId) {
    return submissions.filter(s => s.studentId === parseInt(studentId));
  }

  static findByAssignmentId(assignmentId) {
    return submissions.filter(s => s.assignmentId === parseInt(assignmentId));
  }

  static findByStudentAndAssignment(studentId, assignmentId) {
    return submissions.find(
      s => s.studentId === parseInt(studentId) && s.assignmentId === parseInt(assignmentId)
    );
  }

  static findAll() {
    return submissions;
  }

  static update(id, data) {
    const submission = submissions.find(s => s.id === parseInt(id));
    if (submission) {
      Object.assign(submission, data);
      submission.updatedAt = new Date();
    }
    return submission;
  }
}

module.exports = Submission;

