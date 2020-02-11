//.  app.js
'use strict';
var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    bodyParser = require( 'body-parser' ),
    cloudantlib = require( '@cloudant/cloudant' ),
    crypto = require( 'crypto' ),
    ejs = require( 'ejs' ),
    jwt = require( 'jsonwebtoken' ),
    session = require( 'express-session' ),
    app = express();
var settings = require( './settings' );

var db = null;
var cloudant = cloudantlib( { account: settings.db_username, password: settings.db_password } );
if( cloudant ){
  cloudant.db.get( settings.db_name, function( err, body ){
    if( err ){
      if( err.statusCode == 404 ){
        cloudant.db.create( settings.db_name, function( err, body ){
          if( err ){
            db = null;
          }else{
            db = cloudant.db.use( settings.db_name );
          }
        });
      }else{
        db = cloudant.db.use( settings.db_name );
      }
    }else{
      db = cloudant.db.use( settings.db_name );
    }
  });
}

app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.all( '/*', basicAuth( function( user, pass ){
  if( settings.basic_username && settings.basic_password ){
    return ( settings.basic_username === user && settings.basic_password === pass );
  }else{
    return true;
  }
}));

app.use( bodyParser.urlencoded( { limit: '10mb', extended: true } ) );
app.use( bodyParser.json() );

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

app.use( session({
  secret: settings.superSecret,
  resave: false,
  saveUnitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 60 * 24 * 30  //. 30 days
  }
}));

app.get( '/', function( req, res ){
  if( req.session && req.session.token ){
    //. トークンをデコード
    var token = req.session.token;
    jwt.verify( token, settings.superSecret, function( err, user ){
      if( err ){
        res.redirect( '/login?message=Invalid token.' );
      }else if( user && user.username && user.role ){
        //. '(user.role)_home' がロール毎の各ユーザーのトップページ
        res.render( user.role + '_home', { user: user, token: token } );
      }else{
        res.redirect( '/login?message=Invalid token.' );
      }
    });
  }else{
    res.redirect( '/login' );
  }
});

app.get( '/login', function( req, res ){
  var message = null;
  if( req.query.message ){
    message = req.query.message;
  }
  res.render( 'login', { user: null, message: message } );
});

app.post( '/login', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var id = req.body.id;
  var password = req.body.password;

  var hash = crypto.createHash( 'sha512' );
  hash.update( password );
  var hash_password = hash.digest( 'hex' );

  db.get( id, function( err, user ){
    if( err ){
      res.status( 400 );
      //res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
      res.write( JSON.stringify( { status: false, message: "wrong id and/or password." }, 2, null ) );
      res.end();
    }else{
      if( user.password && user.password == hash_password ){
        var token = jwt.sign( user, settings.superSecret, { expiresIn: '25h' } );
        req.session.token = token;
        res.write( JSON.stringify( { status: true, token: token }, 2, null ) );
        res.end();
      }else{
        delete req.session.token;
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: "wrong id and/or password." }, 2, null ) );
        res.end();
      }
    }
  });
});

app.post( '/platformer', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  if( db ){
    var data = req.body;
    if( data ){
      var id = data.id ? data.id : 'platformer';
      db.get( id, { include_docs: true }, function( err, user ){
        if( !err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: 'platformer already existed.' }, 2, null ) );
          res.end();
        }else{
          var _password = data.password ? data.password : id;
          var hash = crypto.createHash( 'sha512' );
          hash.update( _password );
          var password = hash.digest( 'hex' );
          var user = {
            _id: id,
            username: id,
            password: password,
            name: data.name ? data.name : 'プラットフォーマー',
            ruby: data.ruby ? data.ruby : 'ぷらっとふぉーまー',
            type: 'user',
            zip: data.zip ? data.zip : '',
            tel: data.tel ? data.tel : '',
            email: data.email ? data.email : '',
            role: 0,
            typestamp: ( new Date() ).getTime()
          };

          db.insert( user, function( err, body ){
            if( err ){
              res.status( 400 );
              res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
              res.end();
            }else{
              res.write( JSON.stringify( { status: true, user: body }, 2, null ) );
              res.end();
            }
          });
        }
      });
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: 'no post data found.' }, 2, null ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db not ready.' }, 2, null ) );
    res.end();
  }
});

//. ここより上で定義する API には認証フィルタをかけない
//. ここより下で定義する API には認証フィルタをかける

app.use( function( req, res, next ){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if( !token ){
    return res.status( 403 ).send( { status: false, message: 'No token provided.' } );
  }

  jwt.verify( token, settings.superSecret, function( err, decoded ){
    if( err ){
      return res.json( { status: false, message: 'Invalid token.' } );
    }

    //console.log( decoded );
    req.decoded = decoded;  //. req.decoded = ログイン済み user のオブジェクト
    next();
  });
});


app.post( '/logout', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  //req.session.token = null;
  delete req.session.token;
  res.write( JSON.stringify( { status: true }, 2, null ) );
  res.end();
});

app.get( '/users', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  //var me = req.decoded;

  if( db ){
    var _limit = req.query.limit ? parseInt( req.query.limit ) : 0;
    var _offset = req.query.offset ? parseInt( req.query.offset ) : 0;
    var limit = isNaN( _limit ) ? 0 : _limit;
    var offset = isNaN( _offset ) ? 0 : _offset;
    db.list( { include_docs: true }, function( err, result ){
      if( err ){
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
        res.end();
      }else{
        var users = [];
        result.rows.forEach( function( user ){
          delete user.doc._rev;
          delete user.doc.password;
          users.push( user.doc );
        });

        if( offset ){
          if( limit ){
            users = users.slice( offset, limit );
          }else{
            users = users.slice( offset );
          }
        }else if( limit ){
          users = users.slice( 0, limit );
        }

        res.write( JSON.stringify( { status: true, users: users }, 2, null ) );
        res.end();
      }
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db not ready.' }, 2, null ) );
    res.end();
  }
});

app.get( '/user/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  //var me = req.decoded;

  if( db ){
    var id = req.params.id;
    if( id ){
      db.get( id, { include_docs: true }, function( err, user ){
        if( err ){
          res.status( 400 );
          res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
          res.end();
        }else{
          delete user['_rev'];
          delete user['password'];
          res.write( JSON.stringify( { status: true, user: user }, 2, null ) );
          res.end();
        }
      });
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: 'parameter id required.' }, 2, null ) );
      res.end();
    }
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, message: 'db not ready.' }, 2, null ) );
    res.end();
  }
});

app.post( '/user', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var me = req.decoded;

  if( me.role == 0 ){
    if( db ){
      var data = req.body;
      if( data && data.id ){
        var id = data.id;
        db.get( id, { include_docs: true }, function( err, user ){
          if( !err ){
            res.status( 400 );
            res.write( JSON.stringify( { status: false, message: 'same id already existed.' }, 2, null ) );
            res.end();
          }else{
            var role = data.role;
            if( role === undefined ){
              res.status( 400 );
              res.write( JSON.stringify( { status: false, message: 'role need to be specified.' }, 2, null ) );
              res.end();
            }else if( role == 0 ){
              res.status( 400 );
              res.write( JSON.stringify( { status: false, message: 'platformer already existed.' }, 2, null ) );
              res.end();
            }else{
              var _password = data.password ? data.password : id;
              var hash = crypto.createHash( 'sha512' );
              hash.update( _password );
              var password = hash.digest( 'hex' );
              var user = {
                _id: id,
                username: id,
                password: password,
                name: data.name ? data.name : '',
                ruby: data.ruby ? data.ruby : '',
                type: 'user',
                zip: data.zip ? data.zip : '',
                tel: data.tel ? data.tel : '',
                email: data.email ? data.email : '',
                role: role,
                typestamp: ( new Date() ).getTime()
              };

              db.insert( user, function( err, body ){
                if( err ){
                  res.status( 400 );
                  res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
                  res.end();
                }else{
                  res.write( JSON.stringify( { status: true, user: body }, 2, null ) );
                  res.end();
                }
              });
            }
          }
        });
      }else{
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: 'no post data found.' }, 2, null ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: 'db not ready.' }, 2, null ) );
      res.end();
    }
  }else{
    res.status( 401 );
    res.write( JSON.stringify( { status: false, message: 'permission error.' }, 2, null ) );
    res.end();
  }
});

app.delete( '/user/:id', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var me = req.decoded;

  if( me.role == 0 ){
    if( db ){
      var id = req.params.id;
      if( id ){
        db.get( id, { include_docs: true }, function( err, user ){
          if( err ){
            res.status( 400 );
            res.write( JSON.stringify( { status: false, message: err }, 2, null ) );
            res.end();
          }else{
            var rev = user['_rev'];
            db.destroy( id, rev, function( err, body, header ){
              if( err ){
                res.status( 400 );
                res.write( JSON.stringify( { status: false, error: err }, null, 2 ) );
                res.end();
              }else{
                res.write( JSON.stringify( { status: true } ) );
                res.end();
              }
            });
          }
        });
      }else{
        res.status( 400 );
        res.write( JSON.stringify( { status: false, message: 'parameter id required.' }, 2, null ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, message: 'db not ready.' }, 2, null ) );
      res.end();
    }
  }else{
    res.status( 401 );
    res.write( JSON.stringify( { status: false, message: 'permission error.' }, 2, null ) );
    res.end();
  }
});


var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );
