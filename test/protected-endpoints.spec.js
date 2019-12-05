const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Things Endpoints', function() {
  let db

  const {
    testUsers,
    testThings,
    testReviews,
  } = helpers.makeThingsFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  const protectedEndpoints = [
      {
        name: 'GET /api/things/thing_id',
        path: '/api/things/:thing_id',
        method: supertest(app).get,   
      },
    {
        name: 'GET /api/things/:thing_id/reviews',
        path: '/api/things/1/reviews',
        method: supertest(app).get,

    },
    {
        name: 'POST /api/reviews',
        path: '/api/reviews',
        method: supertest(app).get,
    }
  ]
  protectedEndpoints.forEach(endpoint => {
      describe(endpoint.name, () => {
        it(`responds 401 'Missing basic token' when no token `,() => {
            return endpoint.method(endpoint.path)
            .expect(401, {error: {message: 'Missing basic token'}})
        });

        it.only(`responds 401 'Unauthorized request' when no credentials in token`, () => {
            const userNoCreds = {user_name:'', password:''};
            return endpoint.method(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(userNoCreds))
            .expect(401, {error: { message: 'Unauthorized request'}})
        });

        it(`responds with 401 'Unathorized request' when invalid credentials`, () => {
            const wrongUser = {user_name: 'wrong', password: 'bla'};
            return endpoint.method(endpoint.path)
                .set('Authorizaton',
                helpers.makeAuthHeader(wrongUser))
                .expect(401, {error: { message: 'Unauthorized request'}})
        });

        it(`responds 401 'Unauthorized request' when invalid password`, () => {
            const userInvalidPass = {
                user_name: testUsers[0], password:'wrong'
            }
            return endpoint.method(endpoint.path)
                .set('Authorizaton',
                helpers.makeAuthHeader(userInvalidPass))
                .expect(401, {error: { message: 'Unauthorized request'}})
      });
    })
  })
})