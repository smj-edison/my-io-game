var Player = function(id, color) {
	this.id = id;
	this.x = 0;
	this.y = 0;
	this.speed = 200; // units/s
	this.messages = [];
	this.color = color;
};

exports.player = Player;
