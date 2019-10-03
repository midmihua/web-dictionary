const { validationResult } = require('express-validator');

const Word = require('../../models/word');
const User = require('../../models/user');

exports.getWords = async (req, res, next) => {
    try {
        const words = await Word.find();
        if (!words) {
            const error = new Error('Words have not been found.');
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({ message: 'Fetched words successfully.', words: words });
        return
    } catch (err) {
        err.statusCode = err.statusCode ? err.statusCode : 500;
        next(err);
        return err;
    }
};

exports.getWord = async (req, res, next) => {
    const wordId = req.params.wordId;
    try {
        const word = await Word.findById(wordId);
        if (!word) {
            const error = new Error('Word has not been found.');
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({ message: 'Word fetched.', word: word });
        return;
    } catch (err) {
        err.statusCode = err.statusCode ? err.statusCode : 500;
        next(err);
        return err;
    }
};

exports.addWord = async (req, res, next) => {
    const errors = validationResult(req);
    // If validation errors appear
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.array = errors.array();
        next(error);
    }
    // If validation passed
    const newWord = new Word({
        word: req.body.word,
        translate: req.body.translate,
        description: req.body.description,
        creator: req.userId
    });
    // (?) TBD - Word & User collections have to be updated withib one transaction
    try {
        const wordSaveRes = await newWord.save();
        if (!wordSaveRes) {
            const error = new Error('Word has not been saved.');
            error.statusCode = 401;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User has not been found.');
            error.statusCode = 401;
            throw error;
        }
        user.words.push(newWord);
        const userSaveRes = await user.save();
        if (!userSaveRes) {
            const error = new Error('User has not been updated.');
            error.statusCode = 401;
            throw error;
        }
        res.status(201).json({
            message: 'Word added successfully.',
            word: newWord,
            creator: { _id: user._id, name: user.name }
        });
        return;
    } catch (err) {
        err.statusCode = err.statusCode ? err.statusCode : 500;
        next(err);
        return err;
    }
};

exports.updateWord = async (req, res, next) => {
    const errors = validationResult(req);
    // If validation errors appear
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.array = errors.array();
        next(error);
    }

    const wordId = req.params.wordId;
    const updWord = req.body.word;
    const updTranslate = req.body.translate;
    const updDescription = req.body.description;

    try {
        const word = await Word.findById(wordId);
        if (!word) {
            const error = new Error('Word has not been found.');
            error.statusCode = 401;
            throw error;
        }
        if (word.creator.toString() !== req.userId) {
            const error = new Error('Not authorized.')
            error.statusCode = 403;
            throw error;
        }
        word.word = updWord;
        word.translate = updTranslate;
        word.description = updDescription;

        const updatedWord = await word.save();
        if (!updatedWord) {
            const error = new Error('Word has not been updated.');
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({ message: 'Word updated.', word: updatedWord });
        return;
    } catch (err) {
        err.statusCode = err.statusCode ? err.statusCode : 500;
        next(err);
        return err;
    }
};

exports.deleteWord = async (req, res, next) => {
    const wordId = req.params.wordId;
    try {
        const word = await Word.findById(wordId);
        if (!word) {
            const error = new Error('Word has not been found.');
            error.statusCode = 401;
            throw error;
        }
        if (word.creator.toString() !== req.userId) {
            const error = new Error('Not authorized.')
            error.statusCode = 403;
            throw error;
        }
        const removeRes = await Word.findByIdAndRemove(wordId);
        if (!removeRes) {
            const error = new Error('Word has not been removed.');
            error.statusCode = 401;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User has not been found.');
            error.statusCode = 401;
            throw error;
        }
        user.words.pull(wordId);
        const updateRes = await user.save();
        if (!updateRes) {
            const error = new Error('User has not been updated.');
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({ message: 'Word deleted.', word: word });
        return;
    } catch (err) {
        err.statusCode = err.statusCode ? err.statusCode : 500;
        next(err);
        return err;
    }
};