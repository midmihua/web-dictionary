const express = require('express');
const router = express.Router();

const { putValidator, postValidator } = require('./validator/word-validator');

const Word = require('../../models/word');

// Import controller
const wordController = require('../../controllers/api-v1/word');

// Auth middleware
const isAuth = require('../../middleware/is-auth');

// @route GET /apiv1/word
// @desc  Get all words from db
router.get('/', isAuth, wordController.getWords);

// @route GET /apiv1/word/wordId
// @desc  Get a single word by id
router.get('/:wordId', isAuth, wordController.getWord);

// @route POST /apiv1/word
// @desc  Add a new word to db
router.post('/', isAuth, postValidator(Word), wordController.addWord);

// @route PUT /apiv1/word
// @desc  Update an existing word
router.put('/:wordId', isAuth, putValidator(), wordController.updateWord);

// @route DELETE /apiv1/word/wordId
// @desc  Delete a single word by id
router.delete('/:wordId', isAuth, wordController.deleteWord);

module.exports = router;