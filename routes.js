var router = require('express').Router();
var querystring = require('querystring');

var db = require('promised-mongo')(process.env.DB_CONNECTION);
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

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/login', function (req, res) {
  res.redirect(Spotify.auth());
});

router.post('/users/:username/setPhoneId', function(req, res) {
  var id = req.body.phoneId;
  var username = req.params.username;
  var coords = {
    lat: req.body.lat,
    lon: req.body.lon
  };

  Users.update({username: username}, {$set: {
    phoneId: id
  }})
  .then(function() {
    return Users.findOne({username: username});
  })
  .then(function(user) {
    return Spotify.updatePlaylist(user, coords);
  })
  .then(function() {
    res.json({status: 'ok'});
  });
});

router.post('/users/:username/updateLocation', function(req, res) {
  var username = req.params.username;
  Users.findOne({username: username}).then(function(user) {
    
    var lon = req.body.lon;
    var lat = req.body.lat;
    
    return Spotify.updatePlaylist(user, {
      lat: lat,
      lon: lon
    });
  }).then(function() {
    res.json({status: 'ok'});
  });
});

router.get('/playlist/:username', function(req, res) {
  var username = req.params.username;
  Users.findOne({username: username}).then(function(user) {
    if(!user) {
      return res.redirect('/');
    }

    res.render('playlist', {
      user: user,
      playlistURI: 'spotify:user:' + user.username + ':playlist:' + user.playlistId
    });
  });
});

router.post('/update', function(req, res) {
  var phoneId = req.body.phoneID;
  
  var coords = {
    lat: req.body.latitude,
    lon: req.body.longitude
  };

  Users.findOne({phoneId: phoneId}).then(function(user) {
    Spotify.updatePlaylist(user, coords);
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
