# secuitylab14

Learning Management System (LMS) with Role-Based Access Control (RBAC) Security Implementation

## Project Structure

```
├── server.js                 # Main server file
├── index.html                # Browser testing interface
├── config/
│   ├── database.js           # In-memory database
│   └── permissions.json      # RBAC permissions configuration
├── data/
│   └── users.json            # User data
├── endpoints/                # API route definitions
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   └── teacherRoutes.js
├── guards/                   # Authentication & authorization middleware
│   ├── auth.js
│   └── rbac.js
├── handlers/                 # Request handlers (controllers)
│   ├── authController.js
│   ├── studentController.js
│   └── teacherController.js
├── models/                   # Data models
│   ├── Assignment.js
│   ├── Course.js
│   ├── Grade.js
│   ├── Submission.js
│   └── User.js
└── services/                 # Utility services
    └── jwt.js
```

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:
```
JWT_SECRET=your-secret-key-here
PORT=3000
```

## Usage

Start the server:
```bash
node server.js
```

Open browser:
```
http://localhost:3000
```

## Test Users

- Student: `student@lms.com` / `123`
- Teacher: `teacher@lms.com` / `123`

## API Endpoints

- `POST /login` - Login and get JWT token
- `GET /courses` - View courses
- `POST /courses` - Create course (Teacher only)
- `POST /assignments/submit` - Submit assignment (Student only)

## Technologies

- Node.js
- Express.js
- JWT (JSON Web Tokens)
- RBAC (Role-Based Access Control)

