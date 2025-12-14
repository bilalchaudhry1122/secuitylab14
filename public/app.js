const SERVER_URL = 'http://localhost:3000';
let activeToken = null;
let activeUserType = null;

window.addEventListener('DOMContentLoaded', function() {
    const storedToken = localStorage.getItem('access_token');
    const storedType = localStorage.getItem('user_type');
    if (storedToken) {
        activeToken = storedToken;
        activeUserType = storedType;
        refreshInterface();
    }
});

async function authenticateUser() {
    const userType = document.getElementById('roleSelector').value;
    const userEmail = userType === 'student' ? 'student@lms.com' : 'teacher@lms.com';
    const userPassword = '123';

    try {
        const result = await fetch(`${SERVER_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userEmail, password: userPassword })
        });

        const responseData = await result.json();
        
        if (responseData.success && responseData.token) {
            activeToken = responseData.token;
            activeUserType = userType;
            localStorage.setItem('access_token', responseData.token);
            localStorage.setItem('user_type', userType);
            refreshInterface();
            displayMessage('tokenContainer', `Authentication successful! Token: ${responseData.token}`, 'success');
        } else {
            alert('Authentication failed: ' + (responseData.message || 'Unknown error'));
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function endSession() {
    activeToken = null;
    activeUserType = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    refreshInterface();
    document.getElementById('tokenContainer').style.display = 'none';
    document.getElementById('activeUser').style.display = 'none';
}

function refreshInterface() {
    if (activeToken) {
        document.getElementById('tokenText').textContent = activeToken;
        document.getElementById('tokenContainer').style.display = 'block';
        document.getElementById('userDetails').textContent = `${activeUserType.toUpperCase()} - Active Session`;
        document.getElementById('activeUser').style.display = 'block';
    } else {
        document.getElementById('tokenContainer').style.display = 'none';
        document.getElementById('activeUser').style.display = 'none';
    }
}

function getAuthHeaders() {
    if (!activeToken) {
        throw new Error('Not authenticated. Please authenticate first.');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`
    };
}

function displayMessage(elementId, text, status) {
    const element = document.getElementById(elementId);
    element.style.display = 'block';
    element.textContent = text;
    element.className = `test-result result-${status}`;
}

async function checkStudentCourseAccess() {
    if (activeUserType !== 'student') {
        alert('Please authenticate as Student first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/courses`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-student-courses', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-student-courses', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-student-courses', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkStudentTaskAccess() {
    if (activeUserType !== 'student') {
        alert('Please authenticate as Student first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/student/assignments`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-student-tasks', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-student-tasks', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-student-tasks', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkStudentUploadAccess() {
    if (activeUserType !== 'student') {
        alert('Please authenticate as Student first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/assignments/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                assignmentId: 1,
                content: 'Test submission from student'
            })
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-student-upload', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-student-upload', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-student-upload', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkStudentScoreAccess() {
    if (activeUserType !== 'student') {
        alert('Please authenticate as Student first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/student/grades`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-student-scores', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-student-scores', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-student-scores', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkStudentCreateCourse() {
    if (activeUserType !== 'student') {
        alert('Please authenticate as Student first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/courses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: 'Hacked Course',
                description: 'Should fail - Student cannot create'
            })
        });
        const data = await result.json();
        if (result.status === 403) {
            displayMessage('output-student-create-course', 
                `✅ CORRECTLY DENIED (403)\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-student-create-course', 
                `❌ UNEXPECTED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-student-create-course', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkStudentCreateTask() {
    if (activeUserType !== 'student') {
        alert('Please authenticate as Student first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/teacher/assignments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: 'Test Assignment',
                description: 'Should fail',
                courseId: 1
            })
        });
        const data = await result.json();
        if (result.status === 403) {
            displayMessage('output-student-create-task', 
                `✅ CORRECTLY DENIED (403)\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-student-create-task', 
                `❌ UNEXPECTED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-student-create-task', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkStudentEvaluateAccess() {
    if (activeUserType !== 'student') {
        alert('Please authenticate as Student first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/teacher/submissions/1/grade`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                score: 100,
                feedback: 'Should fail'
            })
        });
        const data = await result.json();
        if (result.status === 403) {
            displayMessage('output-student-evaluate', 
                `✅ CORRECTLY DENIED (403)\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-student-evaluate', 
                `❌ UNEXPECTED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-student-evaluate', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkStudentViewAllAccess() {
    if (activeUserType !== 'student') {
        alert('Please authenticate as Student first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/teacher/assignments/1/submissions`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await result.json();
        if (result.status === 403) {
            displayMessage('output-student-view-all', 
                `✅ CORRECTLY DENIED (403)\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-student-view-all', 
                `❌ UNEXPECTED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-student-view-all', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkInstructorCreateCourse() {
    if (activeUserType !== 'teacher') {
        alert('Please authenticate as Teacher first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/courses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: 'Web Engineering',
                description: 'Introduction to web development and security'
            })
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-instructor-create-course', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-instructor-create-course', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-instructor-create-course', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkInstructorCreateTask() {
    if (activeUserType !== 'teacher') {
        alert('Please authenticate as Teacher first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/teacher/assignments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: 'Assignment 1: Security',
                description: 'Write about server-side security',
                courseId: 1,
                dueDate: '2024-12-31'
            })
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-instructor-create-task', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-instructor-create-task', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-instructor-create-task', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkInstructorViewAllAccess() {
    if (activeUserType !== 'teacher') {
        alert('Please authenticate as Teacher first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/teacher/assignments/1/submissions`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-instructor-view-all', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-instructor-view-all', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-instructor-view-all', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkInstructorEvaluateAccess() {
    if (activeUserType !== 'teacher') {
        alert('Please authenticate as Teacher first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/teacher/submissions/1/grade`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                score: 85,
                feedback: 'Good work! Well explained security concepts.'
            })
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-instructor-evaluate', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-instructor-evaluate', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-instructor-evaluate', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkInstructorUpdateAccess() {
    if (activeUserType !== 'teacher') {
        alert('Please authenticate as Teacher first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/teacher/courses/1`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: 'Updated Course Title',
                description: 'Updated course description'
            })
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-instructor-update', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-instructor-update', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-instructor-update', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkInstructorManageAccess() {
    if (activeUserType !== 'teacher') {
        alert('Please authenticate as Teacher first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/api/teacher/courses/1/students`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                action: 'enroll',
                studentId: 1
            })
        });
        const data = await result.json();
        if (result.ok) {
            displayMessage('output-instructor-manage', 
                `✅ SUCCESS (${result.status})\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-instructor-manage', 
                `❌ FAILED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-instructor-manage', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkInstructorUploadAccess() {
    if (activeUserType !== 'teacher') {
        alert('Please authenticate as Teacher first');
        return;
    }
    try {
        const result = await fetch(`${SERVER_URL}/assignments/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                assignmentId: 1,
                content: 'Teacher submission - should fail'
            })
        });
        const data = await result.json();
        if (result.status === 403) {
            displayMessage('output-instructor-upload', 
                `✅ CORRECTLY DENIED (403)\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-instructor-upload', 
                `❌ UNEXPECTED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-instructor-upload', `❌ ERROR: ${err.message}`, 'error');
    }
}

async function checkUnauthenticatedAccess() {
    const savedToken = activeToken;
    activeToken = null;
    
    try {
        const result = await fetch(`${SERVER_URL}/courses`, {
            method: 'GET'
        });
        const data = await result.json();
        if (result.status === 401) {
            displayMessage('output-no-auth', 
                `✅ CORRECTLY DENIED (401)\n${JSON.stringify(data, null, 2)}`, 'success');
        } else {
            displayMessage('output-no-auth', 
                `❌ UNEXPECTED (${result.status})\n${JSON.stringify(data, null, 2)}`, 'error');
        }
    } catch (err) {
        displayMessage('output-no-auth', `❌ ERROR: ${err.message}`, 'error');
    } finally {
        activeToken = savedToken;
    }
}

