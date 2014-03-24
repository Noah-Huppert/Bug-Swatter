/* Server Setup */
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


app.use(express.static(__dirname + '/public'));

//var port = Number(process.env.PORT || 5000);
var port = 8080;

server.listen(port, function(){
	console.log('Listening on port %d', server.address().port);
});

/*var bs = {};
bs.DEBUG = true;

bs.alert = function(sMessage, sLocation, sDebugStatement){
	var location = "";
	var debugStatement = false;
	var showMessage = true;

	if(bs.DEBUG && typeof sLocation == 'string'){
		location = " - " + sLocation;
	} else if(typeof sLocation == 'boolean'){
		debugStatement = sLocation
	}

	if(typeof sDebugStatement == 'boolean'){
		debugStatement = sDebugStatement;
	}

	if(debugStatement == true)
		if(bs.DEBUG == false)
			showMessage = false;

	if(showMessage){
		if(typeof sMessage === 'object'){
			console.log("Bug Swatter" + location + ":");
			console.log(sMessage);
			console.log("");
		} else{
			console.log("Bug Swatter" + location + ": " + sMessage);
		}
	}
};*/

/* PostgreSQL */
/*bs.db = {};
var sql = require('mssql');

var config = {
	user: 'root',
	password: 'theraininspain',
	server: 'http://paas_25880.dc1.gpaas.net/',
	database: 'mysql'
};

var connection = new sql.Connection(config, function(err) {
	bs.alert("connected");
	bs.alert(err);
});*/


/* Socket IO */
/*bs.io = {};

bs.io.onConnect = function(socket){
	socket.on('disconnect', bs.io.onDisconnect);
	socket.on('message', bs.io.onMessage);
	socket.on('anything', bs.io.onAnything);
};

bs.io.onDisconnect = function(){
	bs.alert("disconnect", "bs.io.onDisconnect");
};

bs.io.onMessage = function(message){
	bs.alert(message, "bs.io.onMessage");
};

bs.io.onAnything = function(data){
	bs.alert(data, "bs.io.onAnything");
};

io.sockets.on('connection', bs.io.onConnect);*/