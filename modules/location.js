var Promise = require('es6-promise').Promise;
var request = require('request');

function getCoordinateData(lat, lon) {
  
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
    'Lorensberg': ['dark progressive house', 'deep house', 'dubstep'],
    'Inom Vallgraven': ['dark progressive house', 'deep house'],
    'Johanneberg': ['downtempo', 'alternative rock'],
    'Heden': ['classic swedish pop'],
    'Olivedal': ['blues-rock', 'electropunk', 'indie post-punk', 'contemporary jazz', 'deep smooth jazz']
  };
  
  return {location: location, genres: locationGenreMap[location]};
}

module.exports = getCoordinateData;
