var Promise = require('es6-promise').Promise;
var SMHI = require("smhi-node");

function getWeatherData(latitude, longitude) {
  var promise = new Promise(function (resolve, reject) {
      SMHI.getClosestGridpointForLatAndLong(latitude, longitude).
        then(function(response) {
          SMHI.getForecastForLatAndLong(response.lat, response.lon).
            then(function(response) {
            var forecasts = response.getForecasts();
            var nexthour = forecasts[0];
            resolve(weathermoodmap[nexthour.getPrecipitationCategory()]);
          });
      }, function(err) {
        resolve(weathermoodmap[0]);
      });
  });
  return promise;
}

var weathermoodmap = {};
weathermoodmap[0] = "party music";
weathermoodmap[1] = "cold";
weathermoodmap[2] = "angry";
weathermoodmap[3] = "melancholia";
weathermoodmap[4] = "calming";
weathermoodmap[5] = "manic";
weathermoodmap[6] = "angst-ridden";

module.exports = getWeatherData;
