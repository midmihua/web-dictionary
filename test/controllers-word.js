const expect = require('chai').expect;
const should = require('chai').should();
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const _ = require('lodash');

const Word = require('../src/models/word');
const User = require('../src/models/user');
const WordController = require('../src/controllers/api-v1/word');

// Import test data
const WORD_POST_DATA = require('./fixtures/word/post_data.json');
const WORD_POST_DATA_RES = require('./fixtures/word/post_data_res.json');
const USER_POST_DATA = require('./fixtures/user/post_data.json');

// Mocking req, res
const req = httpMocks.createRequest();
const res = httpMocks.createResponse();
req.body = WORD_POST_DATA;

describe('Word controller', function () {

    describe('#1 - getWords', function () {

        it('should throw an error with code 500 if accessing the database fails', function (done) {
            sinon.stub(Word, 'find');

            Word.find.throws();
            WordController.getWords(req, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    expect(result).to.have.property('statusCode', 500);
                    expect(Word.find.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.find.restore();
                });
        });

        it('should throw 401 error - Words have not been found', function (done) {
            sinon.stub(Word, 'find');

            Word.find.returns(null);

            WordController.getWords(req, res, () => { })
                .then(result => {
                    expect(result).to.be.a('error');
                    result.message.should.equal('Words have not been found.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(Word.find.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.find.restore();
                });
        });

        it('should throw nothing if getWords is succeded', function (done) {
            sinon.stub(Word, 'find');

            Word.find.returns([WORD_POST_DATA_RES]);

            WordController.getWords(req, res, () => { })
                .then(result => {
                    expect(result).to.be.undefined;
                    expect(Word.find.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.find.restore();
                });
        });
    });

    describe('#2 - getWord', function () {

        const reqWithId = _.cloneDeep(req);
        reqWithId.params.wordId = 1;

        it('should throw an error with code 500 if accessing the database fails', function (done) {
            sinon.stub(Word, 'findById');

            Word.findById.throws();
            WordController.getWord(reqWithId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    expect(result).to.have.property('statusCode', 500);
                    expect(Word.findById.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                });
        });

        it('should throw 401 error - Word has not been found', function (done) {
            sinon.stub(Word, 'findById');

            Word.findById.returns(null);
            WordController.getWord(reqWithId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('Word has not been found.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(Word.findById.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                });
        });

        it('should throw nothing if getWord is succeded', function (done) {
            sinon.stub(Word, 'findById');

            Word.findById.returns([WORD_POST_DATA_RES]);
            WordController.getWord(reqWithId, res, () => { })
                .then(result => {
                    expect(result).to.be.undefined;
                    expect(Word.findById.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                });
        });
    });

    describe('#3 - addWord', function () {

        const reqWithUserId = _.cloneDeep(req);
        reqWithUserId.userId = 1;

        it('should throw 401 error - Word has not been saved', function (done) {
            const word = Word.prototype;
            sinon.stub(word, 'save');

            word.save.returns(false);

            WordController.addWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('Word has not been saved.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(word.save.called).to.be.true;
                    done();
                })
                .finally(() => {
                    word.save.restore();
                });
        });

        it('should throw 401 error - User has not been found', function (done) {
            const word = Word.prototype;
            sinon.stub(word, 'save');
            sinon.stub(User, 'findById');

            word.save.returns(true);
            User.findById.returns(false);

            WordController.addWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('User has not been found.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(word.save.called).to.be.true;
                    expect(User.findById.called).to.be.true;
                    done();
                })
                .finally(() => {
                    word.save.restore();
                    User.findById.restore();
                });
        });

        it('should throw 401 error - User has not been updated', function (done) {
            const word = Word.prototype;
            const user = User.prototype;
            sinon.stub(word, 'save');
            sinon.stub(User, 'findById');
            sinon.stub(user, 'save');

            word.save.returns(true);

            User.findById.returns(
                new User({ name, email, password } = USER_POST_DATA)
            );

            user.save.returns(false);

            WordController.addWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('User has not been updated.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(word.save.called).to.be.true;
                    expect(User.findById.called).to.be.true;
                    expect(user.save.called).to.be.true;
                    done();
                })
                .finally(() => {
                    word.save.restore();
                    User.findById.restore();
                    user.save.restore();
                });
        });

        it('should throw nothing if addWord is succeded', function (done) {
            const word = Word.prototype;
            const user = User.prototype;
            sinon.stub(word, 'save');
            sinon.stub(User, 'findById');
            sinon.stub(user, 'save');

            word.save.returns(true);

            User.findById.returns(
                new User({ name, email, password } = USER_POST_DATA)
            );

            user.save.returns(true);

            WordController.addWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.undefined;
                    expect(word.save.called).to.be.true;
                    expect(User.findById.called).to.be.true;
                    expect(user.save.called).to.be.true;
                    done();
                })
                .finally(() => {
                    word.save.restore();
                    User.findById.restore();
                    user.save.restore();
                });
        });
    });

    describe('#4 - updateWord', function () {

        let reqWithUserId = _.cloneDeep(req);
        reqWithUserId.userId = 1;
        reqWithUserId.params.wordId = 1;

        it('should throw 401 error - Word has not been found', function (done) {
            sinon.stub(Word, 'findById');

            Word.findById.returns(false);

            WordController.updateWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('Word has not been found.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(Word.findById.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                });
        });

        it('should throw 403 error - Not authorized', function (done) {
            sinon.stub(Word, 'findById');

            Word.findById.returns(WORD_POST_DATA_RES);

            WordController.updateWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('Not authorized.');
                    expect(result).to.have.property('statusCode', 403);
                    expect(Word.findById.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                });
        });

        it('should throw 401 error - Word has not been updated', function (done) {
            const word = Word.prototype;
            sinon.stub(word, 'save');
            sinon.stub(Word, 'findById');

            word.save.returns(false);

            const testUser = new User(
                { name, email, password } = USER_POST_DATA
            );

            Word.findById.returns(
                new Word({
                    word: WORD_POST_DATA_RES.word,
                    translate: WORD_POST_DATA_RES.translate,
                    description: WORD_POST_DATA_RES.description,
                    creator: testUser._id
                })
            );

            reqWithUserId.userId = testUser._id.toString();

            WordController.updateWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('Word has not been updated.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(Word.findById.called).to.be.true;
                    expect(word.save.called).to.be.true;
                    done();
                })
                .finally(() => {
                    word.save.restore();
                    Word.findById.restore();
                });
        });

        it('should throw nothing if updateWord is succeded', function (done) {
            const word = Word.prototype;
            sinon.stub(word, 'save');
            sinon.stub(Word, 'findById');

            word.save.returns(true);

            const testUser = new User(
                { name, email, password } = USER_POST_DATA
            );

            Word.findById.returns(
                new Word({
                    word: WORD_POST_DATA_RES.word,
                    translate: WORD_POST_DATA_RES.translate,
                    description: WORD_POST_DATA_RES.description,
                    creator: testUser._id
                })
            );

            reqWithUserId.userId = testUser._id.toString();

            WordController.updateWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.undefined;
                    expect(Word.findById.called).to.be.true;
                    expect(word.save.called).to.be.true;
                    done();
                })
                .finally(() => {
                    word.save.restore();
                    Word.findById.restore();
                });
        });
    });

    describe('#5 - deleteWord', function () {

        let reqWithUserId = _.cloneDeep(req);
        reqWithUserId.userId = 1;

        it('should throw 401 error - Word has not been found', function (done) {
            sinon.stub(Word, 'findById');

            Word.findById.returns(false);

            WordController.deleteWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('Word has not been found.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(Word.findById.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                });
        });

        it('should throw 403 error - Not authorized', function (done) {
            sinon.stub(Word, 'findById');

            Word.findById.returns(WORD_POST_DATA_RES);

            WordController.deleteWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('Not authorized.');
                    expect(result).to.have.property('statusCode', 403);
                    expect(Word.findById.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                });
        });

        it('should throw 401 error - Word has not been removed', function (done) {
            sinon.stub(Word, 'findById');
            sinon.stub(Word, 'findByIdAndRemove');

            const testUser = new User(
                { name, email, password } = USER_POST_DATA
            );

            Word.findById.returns(
                new Word({
                    word: WORD_POST_DATA_RES.word,
                    translate: WORD_POST_DATA_RES.translate,
                    description: WORD_POST_DATA_RES.description,
                    creator: testUser._id
                })
            );

            Word.findByIdAndRemove.returns(false);

            reqWithUserId.userId = testUser._id.toString();

            WordController.deleteWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('Word has not been removed.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(Word.findById.called).to.be.true;
                    expect(Word.findByIdAndRemove.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                    Word.findByIdAndRemove.restore();
                });
        });

        it('should throw 401 error - User has not been found', function (done) {
            sinon.stub(Word, 'findById');
            sinon.stub(Word, 'findByIdAndRemove');
            sinon.stub(User, 'findById');

            const testUser = new User(
                { name, email, password } = USER_POST_DATA
            );

            Word.findById.returns(
                new Word({
                    word: WORD_POST_DATA_RES.word,
                    translate: WORD_POST_DATA_RES.translate,
                    description: WORD_POST_DATA_RES.description,
                    creator: testUser._id
                })
            );

            Word.findByIdAndRemove.returns(true);

            reqWithUserId.userId = testUser._id.toString();

            User.findById.returns(false);

            WordController.deleteWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('User has not been found.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(Word.findById.called).to.be.true;
                    expect(Word.findByIdAndRemove.called).to.be.true;
                    expect(User.findById.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                    Word.findByIdAndRemove.restore();
                    User.findById.restore();
                });
        });

        it('should throw 401 error - User has not been updated', function (done) {
            const user = User.prototype;
            sinon.stub(Word, 'findById');
            sinon.stub(Word, 'findByIdAndRemove');
            sinon.stub(User, 'findById');
            sinon.stub(user, 'save');

            const testUser = new User(
                { name, email, password } = USER_POST_DATA
            );

            const testWord = new Word({
                word: WORD_POST_DATA_RES.word,
                translate: WORD_POST_DATA_RES.translate,
                description: WORD_POST_DATA_RES.description,
                creator: testUser._id
            });

            reqWithUserId.userId = testUser._id.toString();
            testUser.words = [testWord._id];

            Word.findById.returns(testWord);
            Word.findByIdAndRemove.returns(true);

            User.findById.returns(testUser);
            user.save.returns(false);

            WordController.deleteWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('User has not been updated.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(Word.findById.called).to.be.true;
                    expect(Word.findByIdAndRemove.called).to.be.true;
                    expect(User.findById.called).to.be.true;
                    expect(user.save.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                    Word.findByIdAndRemove.restore();
                    User.findById.restore();
                    user.save.restore();
                });
        });

        it('should throw nothing if updateWord is succeded', function (done) {
            const user = User.prototype;
            sinon.stub(Word, 'findById');
            sinon.stub(Word, 'findByIdAndRemove');
            sinon.stub(User, 'findById');
            sinon.stub(user, 'save');

            const testUser = new User(
                { name, email, password } = USER_POST_DATA
            );

            const testWord = new Word({
                word: WORD_POST_DATA_RES.word,
                translate: WORD_POST_DATA_RES.translate,
                description: WORD_POST_DATA_RES.description,
                creator: testUser._id
            });

            reqWithUserId.userId = testUser._id.toString();
            testUser.words = [testWord._id];

            Word.findById.returns(testWord);
            Word.findByIdAndRemove.returns(true);

            User.findById.returns(testUser);
            user.save.returns(true);

            WordController.deleteWord(reqWithUserId, res, () => { })
                .then(result => {
                    expect(result).to.be.undefined;
                    expect(Word.findById.called).to.be.true;
                    expect(Word.findByIdAndRemove.called).to.be.true;
                    expect(User.findById.called).to.be.true;
                    expect(user.save.called).to.be.true;
                    done();
                })
                .finally(() => {
                    Word.findById.restore();
                    Word.findByIdAndRemove.restore();
                    User.findById.restore();
                    user.save.restore();
                });
        });
    });
});