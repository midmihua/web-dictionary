const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../src/middleware/is-auth');

const getReqObject = (header) => {
    return {
        get: () => {
            return header;
        }
    }
};

describe('Middleware: is-auth.js -> NOK cases', function () {

    it('should thrown an error if no authorization header is present', function () {
        const req = getReqObject(null);
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw(
            'Not authenticated.'
        );
    });

    it('should thrown an error if autherization value is incorrect', function () {
        const req = getReqObject('incorrect-format');
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw(
            'Authorization value has incorrect format.'
        );
    });
});

describe('Middleware: is-auth.js -> OK cases', function () {

    it('should return -userId- prop if validation is passed', function () {
        const req = getReqObject('Bearer abc');

        sinon.stub(jwt, 'verify');
        jwt.verify.returns({ userId: 'dummyId' });

        authMiddleware(req, {}, () => { });
        expect(req).to.have.property('userId', 'dummyId');
        expect(jwt.verify.called).to.be.true;

        jwt.verify.restore();
    });
});