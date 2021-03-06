/*
  global describe: true
  global it: true
  global expect: true
  global setUp: true
  global authorization: true
  global request: true
  global beforeEach: true
  global regularAuthorization: true
  global afterEach: true
  global tearDown: true
*/

describe('Party [PUT] /party/:id', () => {
  let partyID = null
  let partyName = null
  beforeEach(done => {
    setUp()
      .then(() => {
        request
          .post('/api/v1/parties')
          .set('Authorization', authorization)
          .send({ name: 'WEE', avatar: 'WEE.jpeg', bio: 'xxxy' })
          .expect(201)
          .end((err, res) => {
            if (err) console.log(err)
            partyID = res.body.data.party.id
            partyName = res.body.data.party.name
            done()
          })
      })
  })

  afterEach(done => {
    tearDown().then(() => done())
  })

  it('should not allow non-admins to update parties', done => {
    let data = { name: 'QQW' }
    request
      .put(`/api/v1/party/${partyID}`)
      .set('Authorization', regularAuthorization)
      .send(data)
      .expect(403)
      .end((err, res) => {
        if (err) console.log(err)
        expect(res.body.status.message).to.equal('failed')
        expect(res.body.status.code).to.equal(403)
        done(err)
      })
  })
  it('should allow admins to update party', done => {
    let data = { name: 'MatchboX Twenty', slogan: 'By Order of the Peaky Blinders' }
    request
      .put(`/api/v1/party/${partyID}`)
      .set('Authorization', authorization)
      .send(data)
      .expect(200)
      .end((err, res) => {
        if (err) console.log(err)
        expect(res.body.status.message).to.equal('success')
        expect(typeof res.body.data.party.id).to.equal('string')
        expect(res.body.data.party.name).to.equal(data.name)
        done(err)
      })
  })
  it('should not allow empty name', done => {
    let party = { name: null }
    request
      .put(`/api/v1/party/${partyID}`)
      .set('Authorization', authorization)
      .send(party)
      .expect(400)
      .end((err, res) => {
        if (err) console.log(err)
        expect(res.body.status.message).to.equal('failed')
        expect(res.body.error.message).to.equal('party Error: Expected "name" to be type string, instead found object')
        done(err)
      })
  })
  it('should not allow empty name', done => {
    let party = { name: '', avatar: 'qqw.jpeg', bio: 'xxxy' }
    request
      .put(`/api/v1/party/${partyID}`)
      .set('Authorization', authorization)
      .send(party)
      .expect(400)
      .end((err, res) => {
        expect(res.body.status.message).to.equal('failed')
        expect(res.body.error.message).to.equal('party Error: Missing required parameter name')
        done(err)
      })
  })
  it('should not allow non string avatar', done => {
    let party = { name: 'IOE', avatar: [['qqw.jpeg']], bio: 'xxxy' }
    request
      .put(`/api/v1/party/${partyID}`)
      .set('Authorization', authorization)
      .send(party)
      .expect(400)
      .end((err, res) => {
        expect(res.body.status.message).to.equal('failed')
        expect(res.body.error.message).to.equal('party Error: Expected "avatar" to be type string, instead found object')
        done(err)
      })
  })
  it('should not allow non image type for avatar', done => {
    let party = { name: 'IOE', avatar: 'qqw.iup', bio: 'xxxy' }
    request
      .put(`/api/v1/party/${partyID}`)
      .set('Authorization', authorization)
      .send(party)
      .expect(400)
      .end((err, res) => {
        expect(res.body.status.message).to.equal('failed')
        expect(res.body.error.message).to.equal('invalid party avatar')
        done(err)
      })
  })
  it('should not allow non string type for bio', done => {
    let party = { name: 'IOE', avatar: 'qqw.jpg', bio: [['cnkd', 'cmdlcd']] }
    request
      .put(`/api/v1/party/${partyID}`)
      .set('Authorization', authorization)
      .send(party)
      .expect(400)
      .end((err, res) => {
        expect(res.body.status.message).to.equal('failed')
        expect(res.body.error.message).to.equal('party Error: Expected "bio" to be type string, instead found object')
        done(err)
      })
  })
  it('should not update existing party name', done => {
    let data = { name: partyName, avatar: '', bio: 'SOMETHING' }
    request
      .put(`/api/v1/party/${partyID}`)
      .set('Authorization', authorization)
      .send(data)
      .expect(409)
      .end((err, res) => {
        if (err) console.log(err)
        expect(res.body.status.message).to.equal('failed')
        expect(res.body.status.code).to.equal(409)
        done(err)
      })
  })
})
