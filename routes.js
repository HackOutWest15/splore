var router = require('express').Router();
var querystring = require('querystring');
var request = require('request');
var utils = require('./utils');

var storedState = Utils.generateRandomString();

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/login', function (req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      redirect_uri: req.protocol + '://' + req.get('Host') + '/callback',
      state: storedState
    }));
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
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: req.protocol + '://' + req.get('Host') + '/callback',
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
      },
      json: true
    };
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // Handle post success
        console.log(body);
        res.redirect('/playlist');
      } else {
        // Handle post error
      }
    });
  }
  
  
});

module.exports = router;
