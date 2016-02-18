var app = angular.module('CloudRacerApp', ['btford.socket-io', 'zingchart-angularjs']);
var raceDuration = 30000; //ms

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

app.controller('CloudRacerLiveRaceController', function($scope, mySocket) {
    var race = this;
    var graphUpdateInterval = 100;

    race.thisRaceData = [];
    race.rpmValues = [];
    race.distanceValues = [];
    race.raceChartJson = {
        type : 'area',
        plot :      { aspect:"spline" }, 
        'scale-x': {
            'min-value': 0,
            'max-value': raceDuration,
            step: 5000,
            'guide': {
                "line-width":"2px",
                "line-color":"red",
                "line-style":"solid",
                "alpha":0.5
            }
        },
        'scale-y': {
            'min-value': 0,
            'max-value': 120
        },
        series :    [
        { 
                text: 'RPM',
                values : race.rpmValues, 
                marker: { visible: 0 }
                },
        { 
                text: 'Distance',
                values : race.distanceValues,
                marker: { visible: 0 }
                }
        ]
    };
    
    race.rpmGaugeJson = {
        "type":"gauge", 
        "scale-r":{
            "aperture":300,     //Specify your scale range.
            "values":"0:120:10" //Provide min/max/step scale values.
        },
        "title": {
            "text":"RPM"
            },
        "series":[
            {"values":[0]}
        ]
    };

    var momStart;
    var nextUpdateTime;
    mySocket.on('playerdata', function(data) {
        race.livestats = data;
    });
    
    mySocket.on('liveRaceData', function(data) {
        momStart = momStart || moment(data.startTime);
        nextUpdateTime = nextUpdateTime || moment();
        var momentCur = moment(data.readingTime);
        data.elapsedTime = momentCur.diff(momStart);
        race.thisRaceData.push(data);
        if (moment().diff(nextUpdateTime) >= 0) {  // time to update the graph?
            race.rpmValues.push([data.elapsedTime,data.rpm]);
            race.distanceValues.push([data.elapsedTime,data.disance]);            
            race.rpmGaugeJson.series[0].values = [data.rpm];
            nextUpdateTime = nextUpdateTime.add(graphUpdateInterval, 'ms'); // set next update time
        }
    });
  
    race.startrace = function() {
        race.thisRaceData = [];
        race.distanceValues.length = 0;
        race.rpmValues.length = 0;
        console.log(this.playerName);
        mySocket.emit('start', { "playerName": this.playerName});
    };
    race.sendBandData = function() {
        mySocket.emit('banddata', '{ "bpm": 5 }');
    };
    
});