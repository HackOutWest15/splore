var Promise = require('es6-promise').Promise;
var request = require('request');

function getCoordinateData(coords) {
  var lat = coords.lat,
      lon = coords.lon;
  
  var googleMapsRequestURL = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&latlng=' +
    lat + ',' +
    lon;
  
  var promise = new Promise(function (resolve, reject) {
  
    request(googleMapsRequestURL, function (err, res, body) {
      if (err) {
        reject(err);
      } else {
        var locationArea;
        
        var locationDataArray = JSON.parse(body).results[0].address_components;
        
        // Retrieve 'sublocality' field from requested googleapis' object
        for (var i in locationDataArray) {
          if (locationDataArray.hasOwnProperty(i)) {
            
            var locationDataSlice = locationDataArray[i];
            
            for (var j in locationDataSlice.types) {
              if (locationDataSlice.types.hasOwnProperty(j)) {
                
                var locationDataType = locationDataSlice.types[j];

                if(locationDataType === 'sublocality') {
                  locationArea = locationDataSlice.long_name;
                  break;
                }
              }
            }
          }
          if (locationArea) {
            break;
          }
        }

        resolve(matchLocationWithGenre(locationArea));
      }
    });
  });

  return promise;
}

function matchLocationWithGenre(location) {
  
  // TODO: Expand genres with echonest' similar
  // Observe, hardcoded locations and genres for Hackathon demo purposes
  var locationGenreMap = {
    'Lorensberg': ['disco house'],
    'Inom Vallgraven': ['deep house'],
    'Johanneberg': ['alternative rock'],
    'Heden': ['swedish pop'],
    'Olivedal': ['indie']
  };
  
  return {location: location, genres: locationGenreMap[location]};
}

module.exports = getCoordinateData;
