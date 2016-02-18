var sql = require('mssql');
var azure = require('azure-storage');
var config = require('./config');

/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');

var app = express();
var racerList = "";

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static('public'));

var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'));

io.sockets.on('connection', function (socket) {
    // When the client emits 'sendmessage,' the following method is triggered
    socket.on('getleaders', function (data) {
        // Message is broadcast to all clients
        getLeaderBoard();
        socket.emit('displayleaders', racerList);
    });
});

function getLeaderBoard() {
    sql.connect(config.mssql, function (err) {
        var request = new sql.Request();
        
        var query = 'select top 10 * from dbo.raceResults where distance is not null order by distance desc';
        request.query(query, function (err, rs) {
            if (err) {
                console.log(err);
            } else {
                racerList = rs;
            }
        });
    });
}

function queryTableStorage() {
    var azureTable = azure.createTableService(config.tablestorage.accountName, config.tablestorage.accountKey);

    var query = new azure.TableQuery().where("PartitionKey eq ?", 'Pete');
    
    azureTable.queryEntities(config.tablestorage.tableName, query, null, function (err, result, response) {
        if (!err) {
            console.log(result.entries);
        }
    });


}
