require('dotenv-extended').load();
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const User = require('../../models/user');

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        if (!users) {
            const error = new Error('Users have not been found.');
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({ message: 'Fetched users successfully.', users: users });
        return;
    } catch (err) {
        err.statusCode = err.statusCode ? err.statusCode : 500;
        next(err);
        return err;
    }
};

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.array = errors.array();
        next(error);
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const hashedPwd = await bcrypt.hash(password, 12);
        const user = new User({
            name: name,
            email: email,
            password: hashedPwd
        });
        const result = await user.save();
        res.status(201).json({ message: 'User created.', userId: result._id });
        return;
    } catch (err) {
        err.statusCode = err.statusCode ? err.statusCode : 500;
        next(err);
        return err;
    }
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, loadedUser.password);
        if (!isEqual) {
            const error = new Error('Wrong password.');
            error.statusCode = 401;
            error.isEqual = isEqual;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            jwtSecret,
            { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        return;
    } catch (err) {
        err.statusCode = err.statusCode ? err.statusCode : 500;
        next(err);
        return err;
    }
};