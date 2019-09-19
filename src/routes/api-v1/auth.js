const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const User = require('../../models/user');

// Import controller
const userController = require('../../controllers/api-v1/auth');

// @route GET /apiv1/user
// @desc  Get all users from db
router.get('/', userController.getUsers);

// @route PUT /apiv1/user
// @desc  Signup new user
router.put(
    '/',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc)
                            return Promise.reject('E-mail address already exists.')
                    })
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 5 }),
        body('name')
            .trim()
            .not()
            .isEmpty()
    ],
    userController.signup
);

// @route POST /apiv1/user
// @desc  User login
router.post('/', userController.login);

module.exports = router;