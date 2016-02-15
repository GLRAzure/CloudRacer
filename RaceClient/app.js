var config = require('./config');
var speedometer = require('./speedometer');
var msband = require('./msband');
var racelive = require('./racelive');

var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

function readSensors(data) {
    data.bpm = msband.lastReading.bpm;
    
    if(racelive.activeRace==true) {
        racelive.updateRace(data);
    }
}

//connect to the speedometer sensor
speedometer.connect(function (data) {readSensors(data)});

// all environments
app.set('port', 8888);
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.static('public'));

//start band listener
msband.connect(io);

//setup the live race
racelive.init(io);

//setup websocket listeners for the player controls
io.sockets.on('connection', function (socket) {
    socket.on('start', function (data) { racelive.start(data, speedometer.lastReading, io); });
    socket.on("stop", function (data) { racelive.stop(data); });
});

//start up the Express server
server.listen(app.get('port'), function () {
    console.log('web server listening on port ' + app.get('port'));
});

/*
function startRace(data) {
    raceData.playerName = data.playerName;
    raceData.startTime = moment();
    raceData.endTime = moment(raceData.startTime).add(config.raceLength,'milliseconds');
    raceData.startRotations = lastSensorOutput.rotations;
    raceData.sensorData =  [];
    activeRace = true;
}

function stopRace(data) {
    //send raceresults to storage
    
    //send raceresults to display
    
    //end the active race and reset the counters
    activeRace = false;
}

function updateLiveRaceStats(data) {
    //write to socket;
    //write to eventshub;
    raceData.sensorData.push(data);
    io.sockets.emit('liveRaceData', data);
    //console.log(JSON.stringify(raceData));
    eventHubs.sendMessage({  message: data, deviceId: 1 });
    console.log(JSON.stringify(data));
}

function updateRaceResults(data) {    
    var results = _.reduce(data, function(result, value, field){
        result.fields.push(field);
        result.values.push(value);
        
        return result;
    }, {fields:[], values:[]} );
    
    var fieldList = results.fields.join(',');
    var valueList = results.values.join(',');
    
    var query = 'insert into raceResults ('+fieldList+') values ('+valueList+')';
    var request = new SQLRequest(query, function(err){
        if(err)(console.log(err))
    });
    //sqlConnection.execSql(request);
}
*/
