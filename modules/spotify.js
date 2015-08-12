var Spotify = require('spotify-web-api-node');
var Utils = require('../utils');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');

// Modules
var getSpotifyUris = require('./lookup');
var getLocationGenres = require('./location');
var times = require('./momenthandler');

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

    updatePlaylist: function(user, coords) {
      /* coords = {lat, lon} */

      var genrePromise = getLocationGenres(coords);
      var timesPromise = times();

      Promise.all([genrePromise, timesPromise])

      .then(function(results) {
        /* 0: location, 1: timeParams */
        return _.extend(results[1], {
          style: results[0].genres.join(','),
        });
      })

      .then(getSpotifyUris)

      .then(function(uris) {
        
        console.log(uris);

        if(uris.length > 0) {
          return client.replaceTracksInPlaylist(user.username, user.playlistId, uris)
          .then(function(data) {
            console.log('Added ' + uris.length + ' songs to ' + user.playlistId);
          }, function(err) {
            console.error(err);
          });
        }
      });
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
