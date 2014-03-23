var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

var port = Number(process.env.PORT || 5000);

server.listen(port, function(){
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