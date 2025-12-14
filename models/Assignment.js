const { assignments } = require('../config/database');

class Assignment {
  constructor(data) {
    this.id = data.id || assignments.length + 1;
    this.title = data.title;
    this.description = data.description;
    this.courseId = data.courseId;
    this.teacherId = data.teacherId;
    this.dueDate = data.dueDate;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(data) {
    const assignment = new Assignment(data);
    assignments.push(assignment);
    return assignment;
  }

  static findById(id) {
    return assignments.find(a => a.id === parseInt(id));
  }

  static findByCourseId(courseId) {
    return assignments.filter(a => a.courseId === parseInt(courseId));
  }

  static findByTeacherId(teacherId) {
    return assignments.filter(a => a.teacherId === parseInt(teacherId));
  }

  static findAll() {
    return assignments;
  }

  static update(id, data) {
    const assignment = assignments.find(a => a.id === parseInt(id));
    if (assignment) {
      Object.assign(assignment, data);
      assignment.updatedAt = new Date();
    }
    return assignment;
  }

  static delete(id) {
    const index = assignments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      assignments.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = Assignment;

