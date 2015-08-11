var mongo = require('mongodb');
var db = require('monk')('localhost:27017/splore');
var Spotify = require('spotify-web-api-node');
var Utils = require('../utils');

var Users = db.get('users');

var storedState = Utils.generateRandomString();
var scopes = ['playlist-modify-public'];

var Constructor = function() {
  var client = null;

  var init = function() {
    if(!client) {
      client = new Spotify({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/callback'
      });
    }
  };

  init();

  return {

    state: storedState,

    client: client,

    auth: function() {
      return client.createAuthorizeURL(scopes, storedState);
    },

    createUser: function(data) {
      client.setAccessToken(data.access_token);
      client.setRefreshToken(data.refresh_token);

      client.authed = true;

      return client.getMe()
        .then(function(data) {
          return Users.insert({username: data.body.id});
        });
    }
  };
};

module.exports = Constructor();
