var config = require('./config');
var moment = require('moment');
var _ = require('lodash');

var msband = {};

msband.lastReading = {
    bpm: 0,
    lastReadingTime: 0
};

msband.connect = function(io, callbackData){
    io.sockets.on('connection', function (socket) {
        socket.on('banddata', function(data){ msband._socketData(data, callbackData); });
    });
};

msband._socketData = function(data, callbackData) {
    var output = JSON.parse(data);
    this.lastReadingTime = moment();
    this.lastReading.bpm = output.bpm;
    console.log("Band Data Received: %s", data);
    
    if(!_.isUndefined(callbackData)) {callbackData(this.lastReading)}
};

msband.disconnect = function (data) {

};

module.exports = msband;