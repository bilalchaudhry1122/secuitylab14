const { courses, enrollments } = require('../config/database');

class Course {
  constructor(data) {
    this.id = data.id || courses.length + 1;
    this.title = data.title;
    this.description = data.description;
    this.teacherId = data.teacherId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(data) {
    const course = new Course(data);
    courses.push(course);
    return course;
  }

  static findById(id) {
    return courses.find(c => c.id === parseInt(id));
  }

  static findByTeacherId(teacherId) {
    return courses.filter(c => c.teacherId === parseInt(teacherId));
  }

  static findAll() {
    return courses;
  }

  static update(id, data) {
    const course = courses.find(c => c.id === parseInt(id));
    if (course) {
      Object.assign(course, data);
      course.updatedAt = new Date();
    }
    return course;
  }

  static delete(id) {
    const index = courses.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
      courses.splice(index, 1);
      return true;
    }
    return false;
  }

  static getEnrolledStudents(courseId) {
    return enrollments
      .filter(e => e.courseId === parseInt(courseId))
      .map(e => e.studentId);
  }

  static enrollStudent(courseId, studentId) {
    const exists = enrollments.find(
      e => e.courseId === parseInt(courseId) && e.studentId === parseInt(studentId)
    );
    if (!exists) {
      enrollments.push({
        courseId: parseInt(courseId),
        studentId: parseInt(studentId),
        enrolledAt: new Date()
      });
      return true;
    }
    return false;
  }
}

module.exports = Course;

