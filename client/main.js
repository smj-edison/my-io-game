var width = document.documentElement.clientWidth;
var height = document.documentElement.clientHeight;


var canvas = document.getElementById("canvas");

canvas.width = width;
canvas.height = height;

var ctx = canvas.getContext("2d");


var keys = [];

var client = new Client();
var world = new World();

var ws = new WebSocket("ws://192.168.1.149:1337");
ws.binaryType = "arraybuffer";


ws.onmessage = function(data) {
	data = new Uint8Array(data.data);
	
	switch(data[0]) {
		case 0:
			client.id = (data[1] << 8) + data[2];
			console.log("Got id: " + client.id);
		break;
		case 1:
			world.interpret(data);
			//console.log(data);
		break;
		default:
			console.log(data);
		break;
	}
};

ws.onopen = function() {
	ws.send(new Uint8Array([0]));
};

document.addEventListener("keydown", function(e) {
	keys[e.keyCode] = true;
});

document.addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
});

var lastTime = new Date();

var moveFrame = 0;
//no need to spam key movements
setInterval(function() {
	var moveNum = 0;
	
	if(keys[37] || keys[65]) {
		moveNum += 0x08;
	} else if(keys[39] || keys[68]) {
		moveNum += 0x04;
	}
	
	if(keys[38] || keys[87]) {
		moveNum += 0x02;
	} else if(keys[40] || keys[83]) {
		moveNum += 0x01;
	}
	
	if(moveNum != 0) {
		var val = (new Date() - lastTime) * 100;
		
		ws.send(new Uint8Array([0x1, moveNum, val >> 8, val & 255, moveFrame]));
		moveFrame++;
	}
	
	lastTime = +new Date();
}, 100);


var render = function() {
	ctx.beginPath();
	ctx.clearRect(0, 0, width, height);
	ctx.closePath();
	
	world.render(ctx, client.id, width, height);
	window.requestAnimationFrame(render);
};

window.requestAnimationFrame(render);
