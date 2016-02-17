var config = require('./config');
var moment = require('moment');
var eventHubs = require('eventhubs-js');
var sql = require('mssql');
var _ = require('lodash');

var racelive = {};

racelive.playerName;
racelive.startTime;
racelive.endTime;
racelive.startRotations;
racelive.sensordata = {};
racelive.activeRace = false;
racelive._io;

racelive.init = function(io){
    eventHubs.init(config.eventhub);
    racelive._io = io;
};

racelive.start = function(playerInfo, lastSensorReading, io){
    this.playerName = playerInfo.playerName;
    this.startTime = moment();
    this.endTime = moment(racelive.startTime).add(config.raceLength,'milliseconds');
    this.startRotations = lastSensorReading.rotations;
    this.sensorData =  [lastSensorReading];
    this.activeRace = true;
};

racelive.stop = function () {
    this.activeRace = false;    
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
        distance: ((data.rotations-data.startRotations)*config.wheelCirc)/config.mmInMi,
        bpm: data.bpm
    };
    if (data.readingTime.isBefore(this.endTime)){
        this._updateLiveStats(output);
    } else {
        this.activeRace = false;
        this._updateLiveStats(output);
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
    /*
    var results = _.reduce(data, function(result, value, field){
        result.fields.push(field);
        result.values.push(value);
        
        return result;
    }, {fields:[], values:[]} );
    
    var fieldList = results.fields.join(',');
    var valueList = results.values.join(',');
    */
    
    sql.connect(config.mssql, function(err) {
        var request = new sql.Request();
        request.input('playerName', data.playerName);
        request.input('startTime', new Date(data.startTime));
        request.input('endTime', new Date(data.endTime));
        request.input('distance', data.distance);
        request.input('maxSpeed', 0);
        request.input('maxDistancePerBeat', 0);
        request.input('maxAcceleration', 0);
        request.input('maxAccelPerBeat', 0);
        //request.input('sensordata', JSON.stringify(data.sensorData));
        
        var query = 'insert into raceResults (playerName, startTime, endTime, distance, maxSpeed, maxDistancePerBeat, maxAcceleration, maxAccelPerBeat) '+
        'values (@playerName, @startTime, @endTime, @distance, @maxSpeed, @maxDistancePerBeat, @maxAcceleration, @maxAccelPerBeat)';
        request.query(query, function(err, rs) {
          if (err)  {
              console.log(err);
          } else {
              console.log('yes');
          }
        });
    });
}


module.exports = racelive;