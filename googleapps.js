var openid = require('openid');
module.exports = function(domain) {
  var oExtensions, oRelyingParty;
  oExtensions = [
    new openid.AttributeExchange({
      'http://axschema.org/contact/email': 'required'
    })
  ];
  oRelyingParty = new openid.RelyingParty('', null, false, false, oExtensions);
  return function(req, res, next) {
    oRelyingParty.returnUrl = "http://" + req.headers.host + "/_auth";
    if (req.session.authenticated) {
      return next();
    }
    if (/^\/_auth/.test(req.url)) {
      return oRelyingParty.verifyAssertion(req, function(result) {
        if (result.authenticated) {
          if (result.claimedIdentifier.indexOf(domain) === -1) {
            res.writeHead(403, result.error);
            return res.end();
          }
          req.session.authenticated = true;
          req.session.user = result.email;
          res.writeHead(302, {
            Location: req.session.returnTo || '/'
          });
          req.session.returnTo = null;
          return res.end();
        } else {
          res.writeHead(403, result.error);
          return res.end();
        }
      });
    } else {
      return oRelyingParty.authenticate("https://www.google.com/accounts/o8/site-xrds?hd=" + domain, false, function(authUrl) {
        if (!authUrl) {
          res.writeHead(500, 'google auth error');
          return res.end();
        } else {
          req.session.returnTo = req.url;
          res.writeHead(302, {
            Location: authUrl
          });
          return res.end();
        }
      });
    }
  };
};
