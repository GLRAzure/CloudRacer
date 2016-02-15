var config = require('./config');
var speedometer = require('./speedometer');

speedometer.connect(function(data) {console.log(data.rpm)});

