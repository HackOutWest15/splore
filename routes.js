var router = require('express').Router();
var querystring = require('querystring');
var Utils = require('./utils');
var Spotify = require('spotify-web-api-node');

var storedState = Utils.generateRandomString();
var scopes = ['playlist-modify-public'];

var client;

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/login', function (req, res) {

  client = new Spotify({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: req.protocol + '://' + req.get('Host') + '/callback'
  });

  var url = client.createAuthorizeURL(scopes, storedState);
  res.redirect(url);
});

router.get('/playlist', function(req, res) {
  res.render('playlist');
});

router.get('/callback', function (req, res) {
  
  var state = req.query.state;
  var code = req.query.code;
  
  if (state === null || state !== storedState) {
    res.redirect('/' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    client.authorizationCodeGrant(code).then(function(data) {
      console.log(data.body);
      res.redirect('/playlist');
    });
  }
});

module.exports = router;
