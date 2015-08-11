var mongo = require('mongodb');
var db = require('monk')('localhost:27017/splore');
var Spotify = require('spotify-web-api-node');

var client = new Spotify();

module.exports = {

  setToken: function(token) {
    client.setAccessToken(token);
  },

  createPlaylist: function() {

  }

}
