'use strict'

// Tests for `.replyWithFile()`.

const path = require('path')
const { expect } = require('chai')
const proxyquire = require('proxyquire').noPreserveCache()
const nock = require('..')
const got = require('./got_client')

require('./setup')

const textFile = path.join(__dirname, '..', 'assets', 'reply_file_1.txt')
const binaryFile = path.join(__dirname, '..', 'assets', 'reply_file_2.txt.gz')

describe('`.replyWithFile()', () => {
  it('reply with file', async () => {
    const scope = nock('http://example.test')
      .get('/')
      .replyWithFile(200, textFile)

    const { statusCode, body } = await got('http://example.test/')

    expect(statusCode).to.equal(200)
    expect(body).to.equal('Hello from the file!')

    scope.done()
  })

  it('reply with file with headers', async () => {
    const scope = nock('http://example.test')
      .get('/')
      .replyWithFile(200, binaryFile, {
        'content-encoding': 'gzip',
      })

    const { statusCode, body } = await got('http://example.test/')

    expect(statusCode).to.equal(200)
    expect(body).to.have.lengthOf(20)
    scope.done()
  })

  describe('with no fs', () => {
    const { Scope } = proxyquire('../lib/scope', {
      './interceptor': proxyquire('../lib/interceptor', { fs: null }),
    })

    it('throws the expected error', () => {
      expect(() =>
        new Scope('http://example.test').get('/').replyWithFile(200, textFile)
      ).to.throw(Error, 'No fs')
    })
  })
})
