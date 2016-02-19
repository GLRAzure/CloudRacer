var config = require('./config');
var moment = require('moment');
var eventHubs = require('eventhubs-js');
var sql = require('mssql');
var _ = require('lodash');
var racestats_beginning = {maxSpeed:0, maxBPM: 0, maxDistancePerBeat: 0, maxAcceleration: 0, maxAccelerationPerBeat: 0};

var racelive = {};

racelive.playerName;
racelive.startTime;
racelive.endTime;
racelive.startRotations;
racelive.startDistance;
racelive.sensordata = [];
racelive.activeRace = false;
racelive._io;
racelive.raceStats = racestats_beginning;

racelive.init = function(io){
    eventHubs.init(config.eventhub);
    racelive._io = io;
};

racelive.start = function(playerInfo, lastSensorReading, io){
    console.log('Starting race for player %s', playerInfo.playerName);
    this.playerName = playerInfo.playerName;
    this.startTime = moment();
    this.startDistance = lastSensorReading.distance;
    this.endTime = moment(racelive.startTime).add(config.raceLength,'milliseconds');
    this.startRotations = lastSensorReading.rotations;
    this.sensorData =  [lastSensorReading];
    this.raceStats = racestats_beginning;
    this.activeRace = true;
    this._io.sockets.emit('liveRaceStart', { raceLength: config.raceLength});
};

racelive.stop = function (data) {
    this.activeRace = false;
    data.sensorData = this.sensordata;
    data.raceStats = this.raceStats;
    this._io.sockets.emit('liveRaceStop', data);
};

racelive.updateRace = function(data) {
    var output = {
        playerName: this.playerName,
        startTime: this.startTime,
        readingTime: data.readingTime,
        endTime: this.endTime,
        speed: data.rpm*config.wheelCirc/config.mmInMi,
        rpm: data.rpm,
        startRotations: this.startRotations,
        rotations: data.rotations,
        distance: ((data.distance-this.startDistance)*config.mToMi,
        bpm: data.bpm,
        acceleration: 0
    };
    
    if (this.sensorData.length > 20)
        output.acceleration = output.speed - this.sensorData[this.sensorData.length - 20].speed;
        if (output.acceleration > this.raceStats.maxAcceleration)
            this.raceStats.maxAcceleration = output.acceleration;
    
    if (output.bpm > this.raceStats.maxBPM)
        this.raceStats.maxBPM = output.bpm;
        
    if (output.speed > this.raceStats.maxSpeed)
        this.raceStats.maxSpeed = output.speed;
    
    if (data.readingTime.isBefore(this.endTime)){
        this._updateLiveStats(output);
    } else {
        this._updateLiveStats(output);
        this.stop(output);
        this._updateRaceResults(output);
    }
}

racelive._updateLiveStats = function(data){

    this.sensorData.push(data);
    this._io.sockets.emit('liveRaceData', data);
    eventHubs.sendMessage({  message: data, deviceId: 1 });
    console.log(JSON.stringify(data));
};

racelive._updateRaceResults = function (data) { 

    sql.connect(config.mssql, function(err) {
        var request = new sql.Request();
        request.input('playerName', data.playerName);
        request.input('startTime', new Date(data.startTime));
        request.input('endTime', new Date(data.endTime));
        request.input('distance', sql.Decimal(18,4), data.distance);
        request.input('maxSpeed', sql.Decimal(18,4), racelive.raceStats.maxSpeed);
        request.input('maxDistancePerBeat', sql.Decimal(18,4), 0);
        request.input('maxAcceleration', sql.Decimal(18,4), racelive.raceStats.maxAcceleration);
        request.input('maxAccelPerBeat', sql.Decimal(18,4), 0);
        request.input('maxBPM', sql.Decimal(18,4), racelive.raceStats.maxBPM);
        //request.input('sensordata', JSON.stringify(this.raceStats.sensorData));
        
        var query = 'insert into raceResults (playerName, startTime, endTime, distance, maxSpeed, maxDistancePerBeat, maxAcceleration, maxAccelPerBeat, maxBPM) '+
        'values (@playerName, @startTime, @endTime, @distance, @maxSpeed, @maxDistancePerBeat, @maxAcceleration, @maxAccelPerBeat, @maxBPM)';
        request.query(query, function(err, rs) {
          if (err)  {
              console.log(err);
          } else {
              console.log('racer results updated.');
              console.log(request.query);
          }
        });
    });
}


module.exports = racelive;