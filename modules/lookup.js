var query = require('querystring');
var request = require('request');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');

var echoNestURL = 'http://developer.echonest.com/api/v4/song/search';
var spotifyURL = 'https://api.spotify.com/v1/search';

function searchEchoNest(params){
  if(typeof params !== 'object') {
    throw new Error('Params must be an object!');
  }

  if(!process.env.ECHONEST_API_KEY) {
    throw new Error('No EchoNest API key provided!');
  }

  _.extend(params, {
    format: 'json',
    api_key: process.env.ECHONEST_API_KEY
  });

  var promise = new Promise(function(resolve, reject) {
    request.get({
      url: echoNestURL,
      qs: params,
      json: true
    }, function(err, res) {
      if(err) {
        reject(err);
      } else {
        var tracks = _.uniq(_.pluck(res.body.response.songs, 'title'));
        resolve(tracks);
      }
    });
  });
  
  return promise;
}

function searchSpotify(songs) {
  if(!Array.isArray(songs)) {
    throw new Error('Songs must be an array of song titles!');
  }

  var params = {
    type: 'track',
    market: 'SE',
    limit: 1
  };

  function sendReq(songTitle) {
    return new Promise(function(resolve, reject) {
      var query = _.extend({}, params, { q: songTitle})
      request({
        url: spotifyURL,
        qs: query,
        json: true
      }, function(err, res) {
        if(err) { 
          reject(err); 
        } else {
          if(res.body.tracks && res.body.tracks.items.length > 0) {
            resolve(res.body.tracks.items[0].uri);
          } else {
            resolve(false);  
          }
        }
      })
    });
  }

  return Promise.all(songs.map(sendReq)).then(function(uris) {
    return _.compact(uris);
  });
}

function search(params) {
  return searchEchoNest(params).then(searchSpotify);
}

module.exports = search;
