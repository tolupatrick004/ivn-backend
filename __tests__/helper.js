import supertest from 'supertest'
import chai from 'chai'
import faker from 'faker'
import sinon from 'sinon'
import jwt from 'jsonwebtoken'
import { Client } from 'pg'

import app from '../src/server'

const client = new Client(Object.assign(
  {},
  require('../knexfile').test.connection,
  {
    host: '127.0.0.1',
    port: 5432
  }
))

client.connect()

global.app = app
global.faker = faker
global.request = supertest(app)
global.expect = chai.expect
global.assert = chai.assert
global.jwt = jwt
global.tokenize = id => jwt.sign({ data: id }, process.env.TOKEN_SECRET)
global.sinon = sinon
global.admin = {}

global.db = client

global.authorization = null
global.regularAuthorization = null
global.superAuthorization = null
global.politicianAuthorization = null
global.candidateAuthorization = null
global.cutOfftime = new Date()

global.party = null

global.setUp = () => {
  return client.query('SELECT u.*, p.role_id, r.name as role_name FROM "user_role" p LEFT JOIN "user" u ON u.id = p.user_id LEFT JOIN "role" r ON r.id = p.role_id')
    .then(res => {
      const users = fmtUsers(res.rows)
      global.admin = getRole(users, 'admin')
      global.superAdmin = getRole(users, 'super admin')
      global.regular = getRegular(users)
      global.politician = getRole(users, 'politician')
      global.candidate = getRole(users, 'candidate')
      global.authorization = jwt.sign({ data: { id: global.admin.id } }, process.env.TOKEN_SECRET)
      global.superAuthorization = jwt.sign({ data: { id: global.superAdmin.id } }, process.env.TOKEN_SECRET)

      global.regularAuthorization = jwt.sign({ data: { id: global.regular.id } }, process.env.TOKEN_SECRET)
      global.politicianAuthorization = jwt.sign({ data: { id: global.politician.id } }, process.env.TOKEN_SECRET)
      global.candidateAuthorization = jwt.sign({ data: { id: global.candidate.id } }, process.env.TOKEN_SECRET)

      return client.query('SELECT * FROM party')
        .then(res => {
          global.party = res.rows[0]
        })
    })
    .catch(error => console.error(error))
}
global.tearDown = () => {
  console.log('tearing down')
  return Promise.all([
    client.query('DELETE FROM party WHERE created_at > $1', [global.cutOfftime]),
    client.query('DELETE FROM post WHERE created_at > $1', [global.cutOfftime]),
    client.query('DELETE FROM answer WHERE created_at > $1', [global.cutOfftime]),
    client.query('DELETE FROM notification WHERE created_at > $1', [global.cutOfftime]),
    client.query('DELETE FROM poll WHERE created_at > $1', [global.cutOfftime]),
    client.query('DELETE FROM question WHERE created_at > $1', [global.cutOfftime]),
    client.query('DELETE FROM user_follow WHERE created_at > $1', [global.cutOfftime]),
    client.query('DELETE FROM user_endorse WHERE created_at > $1', [global.cutOfftime]),
    client.query('DELETE FROM user_role WHERE created_at > $1', [global.cutOfftime])
  ])
    .then(() =>
      client
        .query('DELETE FROM "user" WHERE created_at > $1', [global.cutOfftime])
        .then(() => true)
        .catch(e => { throw e }))
    .catch(e => { throw e })
}

function fmtUsers (rows) {
  return rows.reduce((acc, user) => {
    if (acc[user.id]) {
      acc[user.id].roles.push(user.role_name)
    } else {
      acc[user.id] = user
      acc[user.id].roles = [user.role_name]
    }
    return acc
  }, {})
}

function getRole (users, role) {
  return Object
    .values(users)
    .filter(user => user.roles.indexOf(role) !== -1)[0]
}

function getRegular (users) {
  return Object
    .values(users)
    .filter(user => user.roles.length === 1 && user.roles[0] === 'regular')[0]
}
