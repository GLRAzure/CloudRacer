var config = require('./config');
var msband = require('./msband');
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);



app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static('public'));

io.sockets.on('connection', function (socket) {
    socket.on('woot', function(data){ console.log(data); });
});

msband.connect(io, function(data) {console.log(data.bpm)});

server.listen(8888, function () {
  console.log('Example app listening!');
});