var webSocketsServerPort = 1337;

var webSocketServer = require("websocket").server;
var http = require("http");
var Player = require("./player").player;
var Client = require("./client").client;

var clients = [];
var players = [];
var entities = [];

var last_processed_input = [];

var server = http.createServer(function(request, response) {});

server.listen(webSocketsServerPort, function() {
	console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

var wsServer = new webSocketServer({
  	httpServer: server
});

var ids = new Array(65535);

for(var i = 0; i < 65536; i++) {
	ids[i] = i;
}

for(var i = 0; i < ids.length; i++) {
	var index = Math.floor(Math.random() * ids.length);
	
	var temp = ids[index];
	
	ids[index] = ids[i];
	ids[i] = temp;
}

wsServer.on("request", function(request) {
	var connection = request.accept(null, request.origin); 
	
	console.log((new Date()) + " Connection accepted.");
	
	var id = ids.pop();
	
	var color = Math.floor(Math.random() * 6);
	
	var player = new Player(id, color);
	var client = new Client(connection);
	
	
	players.push(player);
	clients.push(client);
	
	connection.on("message", function(message) {
		if(message.type === "binary") {
			var bin = message.binaryData;
			
			switch(bin[0]) {
				case 0x00:
					connection.sendBytes(new Buffer([0x00, id >> 8, id & 255]));
				break;
				default:
					player.messages.push(bin);
				break;
			}
		}
	});
	
	connection.on("close", function(connection) {
		ids.push(id);
		
		console.log("dropped");
		
		//TODO: find better way to do this, without messing up other indexes when splicing, and not holding a bunch on nulls
		players.splice(players.indexOf(player), 1);
		clients.splice(clients.indexOf(client), 1);
	});
});

var looper = setInterval(function() {
	var arr = [0x01];
	
	for(var i = 0; i < players.length; i++) {
		var player = players[i];
		
		for(var j = 0; j < player.messages.length; j++) {
			var bin = player.messages[j];
			
			switch(bin[0]) {
				case 0x01:
					if(bin.length === 5) {
						var delta = ((bin[2] << 8) + bin[3]) / 100000;
						
						if(bin[1] & 8) {
							player.x -= delta * player.speed;
						}

						if(bin[1] & 4) {
							player.x += delta * player.speed;
						}
						
						if(bin[1] & 2) {
							player.y -= delta * player.speed;
						}
						
						if(bin[1] & 1) {
							player.y += delta * player.speed;
						}
					}
				break;
			}
		}
		
		player.messages = [];
		
		arr.push(0x00);
		
		arr.push(player.id >> 8);
		arr.push(player.id & 255);
		
		arr.push(player.color);
		
		var num = Math.round(player.x) + 32768;
		
		arr.push(num >> 8);
		arr.push(num & 255);
		
		num = Math.round(player.y) + 32768;
		
		arr.push(num >> 8);
		arr.push(num & 255);
	}
	
	var buffer = new Buffer(arr);
	//send updates
	//console.log(arr);
	//console.log(clients.length);
	
	for(var i = 0; i < clients.length; i++) {
		clients[i].connection.sendBytes(buffer);
	}
}, 100);
