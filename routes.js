var router = require('express').Router();
var querystring = require('querystring');

var Spotify = require('./modules/spotify');

var checkAuth = function(req, res, next) {
  if(Spotify.client.authed) {
    console.log('authed');
    res.redirect('/playlist');
  } else {
    console.log('not authed');
    next();
  }
};

router.get('/', checkAuth, function(req, res) {
  res.render('index');
});

router.get('/login', checkAuth, function (req, res) {
  res.redirect(Spotify.auth());
});

router.get('/playlist', function(req, res) {
  if(!Spotify.client.authed) {
    return res.redirect('/');
  }

  Spotify.client.getMe().then(function(data) {
    console.log("id", data.body.id);
  });
  res.render('playlist');
});

router.get('/callback', function (req, res) {
  
  var state = req.query.state;
  var code = req.query.code;
  
  if (state === null || state !== Spotify.state) {
    res.redirect('/' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    
    Spotify.client.authorizationCodeGrant(code).then(function(data) {
      Spotify.createUser(data.body).then(function() {
        res.redirect('/playlist');
      });
    });
  }
});

module.exports = router;
