var Spotify = require('spotify-web-api-node');
var Utils = require('../utils');

var db = require('promised-mongo')('splore');
var Users = db.collection('users');

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

  var createPlaylist = function(username) {
    return client.createPlaylist(username, 'Splore', { public: true });
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
          var username = data.body.id;

          return Users.findOne({username: username})
            .then(function(user) {
              if(user) {
                client.username = user.username;
                return user;
              }

              return createPlaylist(username)
                .then(function(data) {
                  client.username = data.body.owner.id;

                  return Users.save({
                    username: data.body.owner.id,
                    playlistId: data.body.id
                  });
                });
            })
        })
    }
  };
};

module.exports = Constructor();
