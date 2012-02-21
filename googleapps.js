(function() {
  var openid;
  openid = require('openid');
  module.exports = function(domain, options) {
    var oExtensions, oRelyingParty;
    if (options == null) {
      options = {};
    }
    oExtensions = [
      new openid.AttributeExchange({
        'http://axschema.org/contact/email': 'required'
      })
    ];
    oRelyingParty = new openid.RelyingParty('', null, true, false, oExtensions);
    return function(req, res, next) {
      oRelyingParty.returnUrl = "http" + (options.secure ? 's' : '') + "://" + req.headers.host + "/_auth";
      if (req.session.authenticated) {
        return next();
      }
      if (/^\/_auth/.test(req.url)) {
        return oRelyingParty.verifyAssertion(req, function(error, result) {
          if (result != null ? result.authenticated : void 0) {
            if (result.claimedIdentifier.indexOf(domain) === -1) {
              res.writeHead(403, error);
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
            console.log(result);
            res.writeHead(403, error);
            return res.end();
          }
        });
      } else {
        return oRelyingParty.authenticate("https://www.google.com/accounts/o8/site-xrds?hd=" + domain, false, function(error, authUrl) {
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
}).call(this);
