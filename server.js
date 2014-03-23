var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

server.listen(8080, function(){
	console.log('Listening on port %d', server.address().port);
});

/*app.get('/', function(req, res){
	res.sendfile(__dirname + '/public/' + req.url);
	console.log(req.url);
});

app.get('GET', function(req, res){
	res.sendfile(__dirname + '/public/' + req.url);
	console.log(req.url);
});*/