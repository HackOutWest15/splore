var moment = require('moment');

module.exports = function() {
  var date = moment();
  var hour = date.hour();
  var day = date.day();
  var scaleofhappiness;

  if (day > 4 || (day === 0 && hour < 5)) {
    scaleofhappiness = lookupvalues(1, hour);
  } else {
    scaleofhappiness = lookupvalues(0, hour);
  }

  var map = {};

  map.max_tempo = scaleofhappiness * 500;
  // map.min_tempo = scaleofhappiness * 300;
  map.max_danceability = scaleofhappiness;
  // map.min_danceability = scaleofhappiness * 0.8;
  map.max_energy = scaleofhappiness;
  // map.min_energy = scaleofhappiness * 0.8;
  map.max_liveness = scaleofhappiness;
  // map.min_liveness = scaleofhappiness * 0.8;

  return map;
};

var lookupvalues = function(day, hour) {
  if (hour < 5) {
      if (day === 1) {
        return 1;
      }
      return 0.5;
  }
  if (hour < 6) {
    return 0;
  }
  if (hour < 12) {
    if (day === 1) {
      return 0.3;
    }
  }
  if (hour < 20) {
    return 0.5;
  } else if (day === 1) {
    return 0.9;
  }
  return 0.6;
};
