var router = require('express').Router();
var querystring = require('querystring');

var db = require('promised-mongo')('splore');
var Users = db.collection('users');

var Spotify = require('./modules/spotify');

var checkAuth = function(req, res, next) {
  if(Spotify.client.authed) {
    console.log('authed');
    res.redirect('/playlist/' + Spotify.client.username);
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

router.post('/users/:username/setPhoneId', function(req, res) {
  var id = req.body.phoneId;
  var username = req.params.username;

  Users.update({username: username}, {$set: {
    phoneId: id
  }})
  .then(function() {
    res.json({status: 'ok'});
  });
});

router.get('/playlist/:username', function(req, res) {
  if(!Spotify.client.authed) {
    console.log('Not authed, redirecting ..');
    return res.redirect('/');
  }

  var username = req.params.username;
  Users.findOne({username: username}).then(function(user) {
    Spotify.updatePlaylist(user, {foo: 'bar'});
    res.render('playlist', user);
  });
});

router.post('/update', function(req, res) {
  var phoneId = req.query.phoneID;
  var latitude = req.query.latitude;
  var longitude = req.query.longitude;
  var coords = {"lat":latitude, "long":longitude};
  console.log(req.body);

  Users.findOne({phoneId: phoneId}).then(function(user) {
    //updatePlaylist(user, coords);
  })

})

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
      Spotify.createUser(data.body).then(function(user) {
        res.redirect('/playlist/' + user.username);
      });
    });
  }
});

module.exports = router;
