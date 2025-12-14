const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML)
app.use(express.static(__dirname));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);

// Simplified routes for lab testing
const authenticate = require('./middleware/auth');
const authorize = require('./middleware/rbac');
const { viewCourses, submitAssignment } = require('./controllers/studentController');
const { createCourse } = require('./controllers/teacherController');
const { login } = require('./controllers/authController');

// POST /login (alias for /api/auth/login)
app.post('/login', login);

// GET /courses (works for both student and teacher)
app.get('/courses', authenticate, authorize('course', 'view'), viewCourses);

// POST /courses (teacher only)
app.post('/courses', authenticate, authorize('course', 'create'), createCourse);

// POST /assignments/submit (student only)
app.post('/assignments/submit', authenticate, authorize('assignment', 'submit'), submitAssignment);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LMS Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint - serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 LMS Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Student: http://localhost:${PORT}/api/student`);
  console.log(`   - Teacher: http://localhost:${PORT}/api/teacher`);
  console.log(`\n✅ Server started successfully!\n`);
});

module.exports = app;

