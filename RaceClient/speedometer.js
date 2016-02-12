var config = require('./config');
var serialport = require('serialport');
var _ = require('lodash');
var moment = require('moment');

var speedometer = {};

speedometer.lastReading = {
    rotations: 0,
    rpm: 0,
    distance: 0,
    readingTime: 0
};

speedometer.connect = function(callbackData, callbackError, callbackClose, callbackOpen) {
    serialport.list(function (err, ports) {
        var COMport = _.find(ports, function (p) { return p.pnpId.search(config.deviceId) > 0; })
        if (_.isUndefined(COMport)) {
            console.log("Bike sensor not found. virtual sensor data will be returned.");
            
            var data = '{ "rotations": 0, "distance": 0, rpm": 0 }';
            setInterval(function(data) {
                data = '{ "rotations": 0, "distance": ' + Math.floor((Math.random() * 10) + 1) + ',"rpm": ' + Math.floor((Math.random() * 10) + 1) + ' }';
                serialData(data, callbackData);
            }, 20, data);

            return;
        }
        console.log(COMport.comName);
        speedometer._port = new serialport.SerialPort(COMport.comName, {
            baudRate: 250000,
            parser: serialport.parsers.readline("\n")
        });
        
        speedometer._port.on('data', function(data) { serialData(data, callbackData); });
        speedometer._port.on('open', serialOpen);
        speedometer._port.on('close', serialClose);
        speedometer._port.on('error', serialError);
    });
};

speedometer.disconnect = function(){
    this._port.close();
};

function serialData(serialtext, callbackData) {
    var data;
    try {
        data = JSON.parse(serialtext);
        //console.log("Data: %s", serialtext);

    } catch (e) {
        console.log("Malformed JSON received: %s", e);
        console.log("Text was: %s", serialtext);
        return;
    }
    speedometer.lastReading.rpm = data.rpm;
    speedometer.lastReading.rotations = data.rotations;
    speedometer.lastReading.distance = data.distance;
    speedometer.lastReading.readingTime = moment();
    if(!_.isUndefined(callbackData)) { callbackData(speedometer.lastReading)}
}

function serialOpen(callbackOpen) {
    console.log('port open. Data rate: ' + speedometer._port.options.baudRate);
    if(!_.isUndefined(callbackOpen)) { callbackOpen()}
}

function serialClose(callbackClosed) {
    console.log('port closed.');
    if(!_.isUndefined(callbackClosed)) { callbackClosed()}
}

function serialError(error, callbackError) {
    console.log('Serial port error: ' + error);
    if(!_.isUndefined(callbackError)) { callbackError(error)}
}

module.exports = speedometer;