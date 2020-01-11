const { body } = require('express-validator');

module.exports.putValidator = () => {
    return [
        body('word').trim().not().isEmpty(),
        body('translate').trim().not().isEmpty()
    ];
};

module.exports.postValidator = (Word) => {
    return [
        body('word')
            .trim()
            .not()
            .isEmpty()
            .custom((value, { req }) => {
                return Word.findOne({ word: value.toLowerCase() })
                    .then(wordDoc => {
                        if (wordDoc)
                            return Promise.reject('This word already exists.')
                    })
            }),
        body('translate')
            .trim()
            .not()
            .isEmpty()
    ];
};