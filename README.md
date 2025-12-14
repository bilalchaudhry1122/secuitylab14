# secuitylab14

Learning Management System (LMS) with Role-Based Access Control (RBAC) Security Implementation

## Features

- JWT-based Authentication
- RBAC Authorization using JSON configuration
- Student and Teacher role-based permissions
- RESTful API endpoints
- Browser-based testing interface

## Project Structure

```
├── server.js                 # Main server file
├── index.html                # Browser testing interface
├── users.json                # User data
├── permissions.json          # RBAC permissions configuration
├── config/
│   └── database.js           # In-memory database
├── controllers/              # Route controllers
├── middleware/               # Auth and RBAC middleware
├── models/                   # Data models
└── routes/                   # API routes
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

