openid = require('openid')

module.exports = (domain, options = {}) ->
  oExtensions = [new openid.AttributeExchange('http://axschema.org/contact/email': 'required')]
  oRelyingParty = new openid.RelyingParty('', null, true, false, oExtensions)

  return (req, res, next) ->
    oRelyingParty.returnUrl = "http#{if options.secure then 's' else ''}://#{req.headers.host}/_auth"

    if req.session.authenticated
      return next()

    if /^\/_auth/.test(req.url)
      oRelyingParty.verifyAssertion req, (error, result) ->
        if result?.authenticated
          if result.claimedIdentifier.indexOf(domain) == -1
            res.writeHead 403, error
            return res.end()

          req.session.authenticated = true
          req.session.user = result.email
          req.session.claimedIdentifier = result.claimedIdentifier
          res.writeHead 302, Location: req.session.returnTo || '/'
          req.session.returnTo = null
          return res.end()

        else
          console.log(result)
          res.writeHead 403, error
          return res.end()
    else
      oRelyingParty.authenticate "https://www.google.com/accounts/o8/site-xrds?hd=#{domain}", false, (error, authUrl) ->
        if not authUrl
          res.writeHead 500, 'google auth error'
          return res.end()

        else
          req.session.returnTo = req.url
          res.writeHead 302, Location: authUrl
          return res.end()
