/* global describe, it */

var assert = require('assert')
var absoluteUrl = require('../')

describe('absoluteUrl', function () {
  it('should generate a HTTP URL that contains protocol, hostname, port and path', function () {
    var req = {
      app: {
        get: function () { return null }
      },
      hostname: 'example.org',
      protocol: 'http',
      socket: {
        address: function () { return { port: 123 } }
      },
      url: 'index.html'
    }

    absoluteUrl()(req, null, function () {})

    assert.equal(req.absoluteUrl(), 'http://example.org:123/index.html')
  })

  it('should generate a HTTP URL that contains protocol, hostname, port and path from originalUrl', function () {
    var req = {
      app: {
        get: function () { return null }
      },
      hostname: 'example.org',
      protocol: 'http',
      socket: {
        address: function () { return { port: 123 } }
      },
      url: 'index.html',
      originalUrl: 'original/index.html'
    }

    absoluteUrl()(req, null, function () {})

    assert.equal(req.absoluteUrl(), 'http://example.org:123/original/index.html')
  })

  it('should detect SSL/TLS protocol', function () {
    var req = {
      app: {
        get: function () { return null }
      },
      hostname: 'example.org',
      protocol: 'http',
      socket: {
        address: function () { return { port: 123 } },
        ssl: {}
      },
      url: 'index.html'
    }

    absoluteUrl()(req, null, function () {})

    assert.equal(req.absoluteUrl(), 'https://example.org:123/index.html')
  })

  it('should skip default HTTP port', function () {
    var req = {
      app: {
        get: function () { return null }
      },
      hostname: 'example.org',
      protocol: 'http',
      socket: {
        address: function () { return { port: 80 } }
      },
      url: 'index.html'
    }

    absoluteUrl()(req, null, function () {})

    assert.equal(req.absoluteUrl(), 'http://example.org/index.html')
  })

  it('should skip default HTTPS port', function () {
    var req = {
      app: {
        get: function () { return null }
      },
      hostname: 'example.org',
      protocol: 'http',
      socket: {
        address: function () { return { port: 443 } },
        ssl: {}
      },
      url: 'index.html'
    }

    absoluteUrl()(req, null, function () {})

    assert.equal(req.absoluteUrl(), 'https://example.org/index.html')
  })

  it('should use basePath', function () {
    var req = {
      app: {
        get: function () { return null }
      },
      hostname: 'example.org',
      protocol: 'http',
      socket: {
        address: function () { return { port: 123 } }
      },
      url: 'index.html'
    }

    absoluteUrl({basePath: 'test'})(req, null, function () {})

    assert.equal(req.absoluteUrl(), 'http://example.org:123/test/index.html')
  })

  it('should ignore proxy headers if not enabled', function () {
    var req = {
      app: {
        get: function () { return null }
      },
      hostname: 'example.org',
      protocol: 'http',
      socket: {
        address: function () { return { port: 123 } }
      },
      url: 'index.html',
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'otherhost',
        'x-forwarded-port': 456
      }
    }

    absoluteUrl()(req, null, function () {})

    assert.equal(req.absoluteUrl(), 'http://example.org:123/index.html')
  })

  it('should use proxy headers', function () {
    var req = {
      app: {
        get: function (key) { return key === 'trust proxy' }
      },
      hostname: 'example.org',
      protocol: 'http',
      socket: {
        address: function () { return { port: 123 } }
      },
      url: 'index.html',
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'otherhost:456'
      }
    }

    absoluteUrl()(req, null, function () {})

    assert.equal(req.absoluteUrl(), 'https://otherhost:456/index.html')
  })
})