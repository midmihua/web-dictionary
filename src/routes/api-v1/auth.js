const express = require('express');
const router = express.Router();

const { putValidator, postValidator } = require('./validator/auth-validator');

const User = require('../../models/user');

// Import controller
const userController = require('../../controllers/api-v1/auth');

// @route GET /apiv1/user
// @desc  Get all users from db
router.get('/', userController.getUsers);

// @route PUT /apiv1/user
// @desc  Signup new user
router.put('/', putValidator(User), userController.signup);

// @route POST /apiv1/user
// @desc  User login
router.post('/', postValidator(User), userController.login);

module.exports = router;