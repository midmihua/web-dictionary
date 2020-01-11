const expect = require('chai').expect;
const request = require('supertest');
const _ = require('lodash');
const isEqual = require('lodash.isequal');

const app = require('../src/app');
const conn = require('../src/db');
const User = require('../src/models/user');

const baseUri = '/apiv1/auth';
const USER_PUT_DATA = require('./fixtures/user/post_data.json');
const USER_PUT_DATA_ERR = require('./fixtures/user/post_data_err.json');

describe('Auth routes', () => {

    before((done) => {
        conn.connect()
            .then(() => {
                User.deleteMany({})
                    .then(() => done());
            })
            .catch(err => done(err));
    });

    after((done) => {
        conn.close()
            .then(() => done())
            .catch(err => done(err));
    });

    afterEach((done) => {
        User.deleteMany({})
            .then(() => done());
    });

    it('OK, GET/ - getting users when database is empty', (done) => {
        request(app)
            .get(baseUri)
            .then(response => {
                const { statusCode, body, type } = response;
                expect(statusCode).to.equal(200);
                expect(type).to.equal('application/json');
                expect(body).to.have.property('users');
                expect(body.users).to.be.an('array').with.lengthOf(0);
                done();
            });
    });

    it('OK, PUT/ && GET/ - creating new user', (done) => {
        request(app)
            .put(baseUri)
            .send(USER_PUT_DATA)
            .then(putRes => {
                const { statusCode, body, type } = putRes;
                expect(statusCode).to.equal(201);
                expect(type).to.equal('application/json');
                expect(body).to.have.property('userId');
                expect(body.userId).to.be.a('string').with.lengthOf.above(0);
                // GET newly created user
                request(app)
                    .get(baseUri)
                    .then(getRes => {
                        const getBody = getRes.body;
                        expect(getBody).to.have.property('users');
                        expect(getBody.users).to.have.lengthOf(1);
                        expect(getBody.users[0]).to.have.property('_id');
                        expect(getBody.users[0]._id).to.equal(body.userId);
                        done();
                    });
            });
    });

    it('FAIL, PUT/ - creating user with existing email', (done) => {
        request(app)
            .put(baseUri)
            .send(USER_PUT_DATA)
            .then(response => {
                const { statusCode, body, type } = response;
                expect(statusCode).to.equal(201);
                expect(type).to.equal('application/json');
                expect(body).to.have.property('userId');
                expect(body.userId).to.be.a('string').with.lengthOf.above(0);
                // PUT one more time the same user
                request(app)
                    .put(baseUri)
                    .send(USER_PUT_DATA)
                    .then(secondRes => {
                        const { statusCode, body, type } = secondRes;
                        expect(statusCode).to.equal(422);
                        expect(type).to.equal('application/json');
                        expect(body).to.have.property('array').with.lengthOf(1);
                        expect(isEqual(body.array[0], USER_PUT_DATA_ERR)).to.be.true;
                        done();
                    });
            });
    });

    const noName = _.cloneDeep(USER_PUT_DATA);
    delete noName['name'];
    const noEmail = _.cloneDeep(USER_PUT_DATA);
    delete noEmail['email'];
    const noPass = _.cloneDeep(USER_PUT_DATA);
    delete noPass['password'];
    [
        { param: 'name', data: noName },
        { param: 'email', data: noEmail },
        { param: 'password', data: noPass }
    ]
        .forEach((element) => {
            it(`FAIL, PUT/ - if '${element.param}' is not provided`, (done) => {
                request(app)
                    .put(baseUri)
                    .send(element.data)
                    .then(response => {
                        const { statusCode, body, type } = response;
                        expect(statusCode).to.equal(422);
                        expect(type).to.equal('application/json');
                        expect(body.message).to.be.equal('Validation failed, entered data is incorrect.');
                        expect(body.array[0].param).to.be.equal(element.param);
                        done();
                    });
            });
        });

    it('OK, POST/ - getting active token', (done) => {
        const TO_INIT_TOKEN = {
            "name": "TA User token",
            "email": "ta.user.token@test.com",
            "password": "12345"
        };
        // PUT new user to db
        request(app)
            .put(baseUri)
            .send(TO_INIT_TOKEN)
            .then(response => {
                expect(response.ok).to.be.true;
                expect(response.statusCode).to.be.equal(201);
                request(app)
                    // POST to get active token
                    .post(baseUri)
                    .send(TO_INIT_TOKEN)
                    .set('Accept', 'application/json')
                    .then(response => {
                        const { statusCode, body, type } = response;
                        expect(statusCode).to.be.equal(200);
                        expect(type).to.equal('application/json');
                        expect(body).to.have.property('token').that.is.a('string').with.lengthOf.above(0);
                        expect(body).to.have.property('userId').that.is.a('string').with.lengthOf.above(0);
                        done();
                    });
            });
    });

});