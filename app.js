const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authenticationRoutes = require('./routes/authRoutes');
const learnerRoutes = require('./routes/studentRoutes');
const instructorRoutes = require('./routes/teacherRoutes');

const application = express();
const SERVER_PORT = process.env.PORT || 3000;

application.use(cors());
application.use(express.json());
application.use(express.urlencoded({ extended: true }));

application.use(express.static(__dirname));
application.use('/public', express.static(path.join(__dirname, 'public')));

application.use((request, response, next) => {
  console.log(`${new Date().toISOString()} - ${request.method} ${request.path}`);
  next();
});

application.use('/api/auth', authenticationRoutes);
application.use('/api/student', learnerRoutes);
application.use('/api/teacher', instructorRoutes);

const verifyUserToken = require('./middleware/auth');
const checkPermissions = require('./middleware/rbac');
const { viewCourses, submitAssignment } = require('./controllers/studentController');
const { createCourse } = require('./controllers/teacherController');
const { login } = require('./controllers/authController');

application.post('/login', login);

application.get('/courses', verifyUserToken, checkPermissions('course', 'view'), viewCourses);

application.post('/courses', verifyUserToken, checkPermissions('course', 'create'), createCourse);

application.post('/assignments/submit', verifyUserToken, checkPermissions('assignment', 'submit'), submitAssignment);

application.get('/health', (request, response) => {
  response.json({
    success: true,
    message: 'Access Control Server is running',
    timestamp: new Date().toISOString()
  });
});

application.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

application.use((request, response) => {
  response.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

application.use((error, request, response, next) => {
  console.error('Server Error:', error);
  response.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

application.listen(SERVER_PORT, () => {
  console.log(`\n🚀 Access Control Server is running on http://localhost:${SERVER_PORT}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   - Authentication: http://localhost:${SERVER_PORT}/api/auth`);
  console.log(`   - Learner: http://localhost:${SERVER_PORT}/api/student`);
  console.log(`   - Instructor: http://localhost:${SERVER_PORT}/api/teacher`);
  console.log(`\n✅ Server started successfully!\n`);
});

module.exports = application;

