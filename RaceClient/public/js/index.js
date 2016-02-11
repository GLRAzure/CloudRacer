var app = angular.module('CloudRacerApp', ['btford.socket-io']);

app.factory('mySocket', function (socketFactory) {
  var myIoSocket = io.connect('localhost:8888');
  var mySocket = socketFactory({
    ioSocket: myIoSocket
  });
  mySocket.forward('error');
  return mySocket;
});

app.controller('CloudRacerLeaderboardController', function() {
    this.distance = {
      value: 1,
      playerName: "Bob"
    }

    this.speed = {
      value: 30,
      playerName: "Jill"
    }
    
  }); 

app.controller('CloudRacerLiveRaceController', function(mySocket) {
  var race = this;
  race.startrace = function() {
    console.log(this.playerName);
    mySocket.emit('start', this.playerName);
    mySocket.on('playerdata', function(data) {
        this.livestats = data;
    });
  };
    
});