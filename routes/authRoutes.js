const express = require('express');
const routeHandler = express.Router();
const { register, login } = require('../controllers/authController');

routeHandler.post('/register', register);
routeHandler.post('/login', login);

module.exports = routeHandler;
