const bcrypt = require('bcryptjs');
const { users } = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id || users.length + 1;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'student'; // 'student' or 'teacher'
    this.name = data.name;
    this.createdAt = new Date();
  }

  static async create(data) {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = new User({
      ...data,
      password: hashedPassword
    });

    users.push(user);
    return user;
  }

  static findByEmail(email) {
    return users.find(u => u.email === email);
  }

  static findById(id) {
    return users.find(u => u.id === parseInt(id));
  }

  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}

module.exports = User;

