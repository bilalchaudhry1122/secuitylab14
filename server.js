const expressFramework = require('express');
const corsMiddleware = require('cors');
const pathModule = require('path');
require('dotenv').config();

const authenticationRoutes = require('./endpoints/authRoutes');
const learnerRoutes = require('./endpoints/studentRoutes');
const instructorRoutes = require('./endpoints/teacherRoutes');

const application = expressFramework();
const serverPort = process.env.PORT || 3000;

application.use(corsMiddleware());
application.use(expressFramework.json());
application.use(expressFramework.urlencoded({ extended: true }));

application.use(expressFramework.static(__dirname));

application.use((request, response, nextHandler) => {
  console.log(`${new Date().toISOString()} - ${request.method} ${request.path}`);
  nextHandler();
});

application.use('/api/auth', authenticationRoutes);
application.use('/api/student', learnerRoutes);
application.use('/api/teacher', instructorRoutes);

const verifyAuth = require('./guards/auth');
const checkPermissions = require('./guards/rbac');
const { viewCourses, submitAssignment } = require('./handlers/studentController');
const { createCourse } = require('./handlers/teacherController');
const { login } = require('./handlers/authController');

application.post('/login', login);

application.get('/courses', verifyAuth, checkPermissions('course', 'view'), viewCourses);

application.post('/courses', verifyAuth, checkPermissions('course', 'create'), createCourse);

application.post('/assignments/submit', verifyAuth, checkPermissions('assignment', 'submit'), submitAssignment);

application.get('/health', (request, response) => {
  response.json({
    success: true,
    message: 'LMS Server is running',
    timestamp: new Date().toISOString()
  });
});

application.get('/', (request, response) => {
  response.sendFile(pathModule.join(__dirname, 'index.html'));
});

application.use((request, response) => {
  response.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

application.use((errorObject, request, response, nextHandler) => {
  console.error('Error:', errorObject);
  response.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? errorObject.message : 'Something went wrong'
  });
});

application.listen(serverPort, () => {
  console.log(`\n🚀 LMS Server is running on http://localhost:${serverPort}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   - Auth: http://localhost:${serverPort}/api/auth`);
  console.log(`   - Student: http://localhost:${serverPort}/api/student`);
  console.log(`   - Teacher: http://localhost:${serverPort}/api/teacher`);
  console.log(`\n✅ Server started successfully!\n`);
});

module.exports = application;
