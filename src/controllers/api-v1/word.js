const { validationResult } = require('express-validator');

const Word = require('../../models/word');
const User = require('../../models/user');

exports.getWords = (req, res, next) => {
    Word.find()
        .then(words => {
            res.status(200).json({
                message: 'Fetched words successfully.',
                words: words
            });
        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};

exports.getWord = (req, res, next) => {
    const wordId = req.params.wordId;
    Word.findById(wordId)
        .then(word => {
            if (!word) {
                const error = new Error('Could not find word.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: 'Word fetched.',
                word: word
            });
        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};

exports.addWord = (req, res, next) => {
    const errors = validationResult(req);
    // If validation errors appear
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.array = errors.array();
        throw error;
    }
    // If validation passed
    const newWord = new Word({
        word: req.body.word,
        translate: req.body.translate,
        description: req.body.description,
        creator: req.userId
    });
    let creator;
    // (?) TBD - Word & User collections have to be updated withib one transaction
    newWord.save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.words.push(newWord);
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Word added successfully.',
                word: newWord,
                creator: { _id: creator._id, name: creator.name }
            });
        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};

exports.updateWord = (req, res, next) => {
    const errors = validationResult(req);
    // If validation errors appear
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.array = errors.array();
        throw error;
    }

    const wordId = req.params.wordId;
    const updWord = req.body.word;
    const updTranslate = req.body.translate;
    const updDescription = req.body.description;

    Word.findById(wordId)
        .then(word => {
            if (!word) {
                const error = new Error('Could not find word.');
                error.statusCode = 404;
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
            return word.save();
        })
        .then(updatedWord => {
            res.status(200).json({
                message: 'Word updated.',
                word: updatedWord
            })
        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};

exports.deleteWord = (req, res, next) => {
    const wordId = req.params.wordId;
    let deletedWord;
    Word.findById(wordId)
        .then(word => {
            if (!word) {
                const error = new Error('Could not find word.');
                error.statusCode = 404;
                throw error;
            }
            if (word.creator.toString() !== req.userId) {
                const error = new Error('Not authorized.')
                error.statusCode = 403;
                throw error;
            }
            deletedWord = word;
            return Word.findByIdAndRemove(wordId);
        })
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.words.pull(wordId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'Word deleted.',
                word: deletedWord
            });
        })
        .catch(err => {
            if (!err.statusCode)
                err.statusCode = 500;
            next(err);
        });
};