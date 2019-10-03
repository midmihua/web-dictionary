const expect = require('chai').expect;
const should = require('chai').should();
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

const User = require('../src/models/user');
const AuthController = require('../src/controllers/api-v1/auth');

// Import test data
const USER_POST_DATA = require('./fixtures/user/post_data.json');
const USER_POST_DATA_RES = require('./fixtures/user/post_data_res.json');

describe('Auth Controller', function () {

    // Mocking req, res
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    req.body = USER_POST_DATA;

    describe('#1 - getUsers', function () {

        it('should throw an error with code 500 if accessing the database fails', function (done) {
            sinon.stub(User, 'find');

            User.find.throws();

            AuthController.getUsers(req, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    expect(result).to.have.property('statusCode', 500);
                    expect(User.find.called).to.be.true;
                    done();
                })
                .finally(() => {
                    User.find.restore();
                });
        });

        it('should throw 401 error - Users have not been found', function (done) {
            sinon.stub(User, 'find');

            User.find.returns(null);

            AuthController.getUsers(req, res, () => { })
                .then(result => {
                    expect(result).to.be.a('error');
                    result.message.should.equal('Users have not been found.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(User.find.called).to.be.true;
                    done();
                })
                .finally(() => {
                    User.find.restore();
                });
        });

        it('should throw nothing if getUsers is succeded', function (done) {
            sinon.stub(User, 'find');

            User.find.returns([USER_POST_DATA_RES]);

            AuthController.getUsers(req, res, () => { })
                .then(result => {
                    expect(result).to.be.undefined;
                    expect(User.find.called).to.be.true;
                    done();
                })
                .finally(() => {
                    User.find.restore();
                });
        });
    });

    describe('#2 - Signup', function () {

        it('should throw an error with code 500 if accessing the database fails', function (done) {
            const user = User.prototype;
            sinon.stub(user, 'save');

            user.save.throws();

            AuthController.signup(req, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    expect(result).to.have.property('statusCode', 500);
                    expect(user.save.called).to.be.true;
                    done();
                })
                .finally(() => {
                    user.save.restore();
                });
        });

        it('should throw nothing if signup is succeded', function (done) {
            const user = User.prototype;
            sinon.stub(user, 'save');

            user.save.returns({ _id: 1 });

            AuthController.signup(req, res, () => { })
                .then(result => {
                    expect(result).to.be.undefined;
                    expect(user.save.called).to.be.true;
                    done();
                })
                .finally(() => {
                    user.save.restore();
                });
        });
    });

    describe('#3 - Login', function () {

        it('should throw an error with code 500 if accessing the database fails', function (done) {
            sinon.stub(User, 'findOne');

            User.findOne.throws();

            AuthController.login(req, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    expect(result).to.have.property('statusCode', 500);
                    expect(User.findOne.called).to.be.true;
                    done();
                })
                .finally(() => {
                    User.findOne.restore();
                });
        });

        it('should throw 401 error - A user with this email could not be found.', function (done) {
            sinon.stub(User, 'findOne');

            User.findOne.returns(false);

            AuthController.login(req, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('A user with this email could not be found.');
                    expect(result).to.have.property('statusCode', 401);
                    expect(User.findOne.called).to.be.true;
                    done();
                })
                .finally(() => {
                    User.findOne.restore();
                });
        });

        it('should throw 401 error - Wrong password.', function (done) {
            sinon.stub(User, 'findOne');
            sinon.stub(bcrypt, 'compare');

            User.findOne.returns(USER_POST_DATA_RES);
            bcrypt.compare.returns(false);

            AuthController.login(req, res, () => { })
                .then(result => {
                    expect(result).to.be.an('error');
                    result.message.should.equal('Wrong password.');
                    expect(result).to.have.a.property('statusCode', 401);
                    expect(User.findOne.called).to.be.true;
                    expect(bcrypt.compare.called).to.be.true;
                    done();
                }).finally(() => {
                    User.findOne.restore();
                    bcrypt.compare.restore();
                });
        });

        it('should throw nothing if login is succeded', function (done) {
            sinon.stub(User, 'findOne');
            sinon.stub(bcrypt, 'compare');
            sinon.stub(jwt, 'sign');

            User.findOne.returns(USER_POST_DATA_RES);
            bcrypt.compare.returns(true);
            jwt.sign.returns('mocked_token');

            AuthController.login(req, res, () => { })
                .then(result => {
                    expect(result).to.be.undefined;
                    expect(User.findOne.called).to.be.true;
                    expect(bcrypt.compare.called).to.be.true;
                    expect(jwt.sign.called).to.be.true;
                    done();
                })
                .finally(() => {
                    User.findOne.restore();
                    bcrypt.compare.restore();
                    jwt.sign.restore();
                });
        });
    });


});
