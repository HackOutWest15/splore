var Spotify = require('spotify-web-api-node');
var Utils = require('../utils');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');

// Modules
var getSpotifyUris = require('./lookup');
var getLocationGenres = require('./location');
var times = require('./momenthandler');
var getWeather = require('./weatherhandler');

var db = require('promised-mongo')(process.env.DB_CONNECTION);
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
        redirectUri: process.env.ROOT + '/callback'
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
      var weatherPromise = getWeather(coords.lat, coords.lon);

      Promise.all([genrePromise, timesPromise, weatherPromise])

      .then(function(results) {
        /* 0: location, 1: timeParams, 2: weatherParam */
        return _.extend(results[1], {
          style: results[0].genres.join(','),
          mood: results[2]
        });
      })

      .then(getSpotifyUris)

      .then(function(uris) {

        if(uris.length > 0) {
          return client.replaceTracksInPlaylist(user.username, user.playlistId, uris)
          .then(function(data) {
            console.log('Added ' + uris.length + ' songs to ' + user.playlistId);
          }, function(err) {
            console.error(err);
          });
        }
      });

      genrePromise.then(function(location) {
        console.log(location);
        var title = 'Splore (' + location.location + ')';

        client.changePlaylistDetails(user.username, user.playlistId, {
          name: title
        }).then(function() {
          console.log('Changed to ' + title);
        });
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
