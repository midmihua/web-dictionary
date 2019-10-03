const { expect } = require('chai');
const supertest = require('supertest');

// Load app instance
const { app, stopHandler } = require('../src/app');

let request;
const baseUri = '/apiv1/auth';

describe('Auth routes', () => {

    before(() => {
        request = supertest(app);
    });

    after(() => {
        stopHandler();
    });

    describe('#1 - route: GET /', () => {

        it('should work (base call)', (done) => {
            request
                .get(baseUri)
                .then(response => {
                    done();
                });
        });
    });
});