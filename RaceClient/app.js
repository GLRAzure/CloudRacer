
/**
 * Module dependencies.
 */

var express = require('express');
var app = express();
//var routes = require('./routes');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var eventHubs = require('eventhubs-js');
var _ = require('lodash');
var serialport = require('serialport');
var moment = require('moment');
var SQLConnection = require('tedious').Connection;
var SQLRequest = require('tedious').Request;


var sqlConnectionConfig = {
    userName: 'dbadmin@cloudracer',
    password: 'cl0udr@c3r',
    server: 'cloudracer.database.windows.net',
    options: {encryption: true, database: 'cloudracerdb'}    
};

var sqlConnection = new SQLConnection(sqlConnectionConfig);

var lastSensorOutput;
var lastBandOutput = {
    bpm: 0
};
var fakeSerialInterval;
var activeRace = false;
var raceLength = 60000;
var wheelCirc = 2000; // in mm
var mmInMi = 1609344;



var raceData = { 
    playerName: "",
    startTime: "",
    endTime: "",
    startRotations: 0,
    sensorData: []
};

var port;

function initBand() {
    const spawn = require('child_process').spawn;
    const bandSensorApp = spawn('bandSensorApp.exe', []);

    bandSensorApp.stdout.on('data', function(data) {
        bandData(data);
    });
}

function bandData(data) {
    var output = JSON.parse(data);
    console.log("Band Data Received: %s", data);
    lastBandOutput.bpm = output.bpm;
}

function initSerialPort() {
    serialport.list(function (err, ports) {
        var COMport = _.find(ports, function (p) { return p.pnpId.search('VID_2341&PID_8036') > 0; })
        if (_.isUndefined(COMport)) {
            console.log("Bike sensor not found. virtual sensor data will be returned.");
            var data = '{ "rotations": 0, "rpm": 0}';
            fakeSerialInterval = setInterval(function(data) {serialData(data);}, 20, data);
            return;
        }
        console.log(COMport.comName);
        port = new serialport.SerialPort(COMport.comName, {
            baudRate: 57600,
            parser: serialport.parsers.readline("\n")
        });
        
        port.on('open', serialOpen);
        port.on('data', serialData);
        port.on('close', serialClose);
        port.on('error', serialError);
    });
}

function serialData(serialtext) {
    var data;
    try {
        data = JSON.parse(serialtext);
        data.readingTime = moment();
        //console.log("%s", JSON.stringify(data));
        lastSensorOutput = data;
        if(activeRace==true && data.readingTime.isBefore(raceData.endTime)) {
            var output = {
                playerName: raceData.playerName,
                startTime: raceData.startTime,
                readingTime: moment(),
                endTime: "",
                speed: "",
                rpm: data.rpm,
                startRotations: raceData.startRotations,
                rotations: data.rotations,
                distance: ((data.rotations-data.startRotations)*wheelCirc)/mmInMi,
                bpm: lastBandOutput.bpm,
            };
            updateLiveRaceStats(output);
        } else if (activeRace==true) {
            activeRace = false;
            var output = {
                playerName: raceData.playerName,
                startTime: raceData.startTime,
                readingTime: moment(),
                endTime: moment(),
                speed: "",
                rpm: "",
                startRotations: raceData.startRotations,
                rotations: data.rotations,
                distance: ((data.rotations-data.startRotations)*wheelCirc)/mmInMi,
                bpm: lastBandOutput.bpm,
            };
            updateLiveRaceStats(output);
            //updateRaceResults('need to pass the race summary data');
        }
    } catch (e) {
        console.log("Malformed JSON received: %s", serialtext);
    }
}

function serialOpen() {
    console.log('port open. Data rate: ' + port.options.baudRate);
}

function serialClose() {
    console.log('port closed.');
}

function serialError(error) {
    console.log('Serial port error: ' + error);
}


initSerialPort();

eventHubs.init({
    hubNamespace: "cloudracer",
    hubName: "racetelemetry",
    keyName: "raceowner",
    key: "8w3z+bUOryua0Tc39yePrIALm0xxBy1d0BUCGZ42y0k="
});

// all environments
app.set('port', process.env.PORT || 8888);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
//app.use(app.router);
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
//if ('development' == app.get('env')) {
//    app.use(express.errorHandler());
//}

//app.get('/', routes.racestart);
//app.post('/race', routes.race);
//app.post('/raceresults', routes.raceresults);

//setup websocket listeners
io.sockets.on('connection', function (socket) {
    socket.on('start', function (data) { startRace(data); });
    socket.on('banddata', function(data){ bandData(data); });
    socket.on("stop", function (data) { stopRace(data); });
});

//start up the Express server
server.listen(app.get('port'), function () {
    console.log('web server listening on port ' + app.get('port'));
});

function startRace(data) {
    var time = moment();
    raceData = { 
        playerName: data.playerName,
        startTime: time,
        endTime: time.add(raceLength,'milliseconds'),
        rotationsStart: lastSensorOutput.rotations,
        sensorData: []
    };
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
    var results = _.reduce(data, function(results, value, field){
        results.fields.push(field);
        results.values.push(value);
        
        return results;
    } );
    
    var fieldList = results.fields.join(',');
    var valueList = results.values.join(',');
    
    
    var request = new SQLRequest('insert into raceResults ('+fieldList+') values ('+valueList+')', function(err){
        if(err)(console.log(err))
    });
    sqlConnection.execSql(request);
}
