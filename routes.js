var router = require('express').Router();
var querystring = require('querystring');

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/login', function (req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: '9dbef430285b4fe8b11a2dd3e19fbf77',
      redirect_uri: req.protocol + '://' + req.get('Host') + '/callback',
      state: generateRandomString(16)
    }));
});

router.get('/callback', function (req, res) {
  // Handle spotify authentication callback
});

module.exports = router;
