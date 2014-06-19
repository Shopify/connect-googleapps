---
layout: index
---

# connect-googleapps

Google Apps OpenID authentication middleware for Connect/Node.js.

## Usage

Make sure you are using a session middleware.

    $ npm install connect-googleapps

```javascript
connect = require('connect');
googleAuth = require('connect-googleapps');

connect(
  connect.logger(),
  connect.cookieParser(),
  connect.session({ secret: 'unicorns' }),
  googleAuth('example.org'),

  connect.router(function(app) {
    app.get('/', function(req, res, next){
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write(req.session.user);
      res.end();
    });
  })
).listen(3000);
```
