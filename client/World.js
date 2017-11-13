var colors = ["red", "orange", "yellow", "green", "blue", "purple"];

var World = function() {
	this.renderElements = [];
	this.players = {};
	this.frame = 0;
};

World.prototype.interpret = function(binData) {
	for(var i = 1; i < binData.length; i++) {
		switch(binData[i]) {
			case 0x00:
				var id = (binData[i + 1] << 8) + binData[i + 2];
				
				this.players[id] = {
					color: colors[binData[i + 3]],
					x: ((binData[i + 4] << 8) + binData[i + 5]) - 32768,
					y: ((binData[i + 6] << 8) + binData[i + 7]) - 32768,
					frame: this.frame
				};
				
				i += 7;
			break;
		}
	}
	
	for(var i in this.players) {
		if(this.players[i].frame !== this.frame) {
			delete this.players[i];
		}
	}
	
	this.frame++;
};

World.prototype.render = function(ctx, playerId, width, height) {
	//console.log(this.players);
	//has it loaded
	if(this.players[playerId]) {
		ctx.beginPath();
		
		ctx.stroke();
		ctx.closePath();
		
		ctx.save();
		ctx.translate(-this.players[playerId].x + width / 2, -this.players[playerId].y + height / 2);		
		
		for(var key in this.players) {
			if(playerId.toString() === key) {
				continue;
			}
			
			ctx.beginPath();
			ctx.lineWidth = 10;
			ctx.fillStyle = this.players[key].color;
			ctx.strokeStyle = "black";
			ctx.arc(this.players[key].x, this.players[key].y, 40, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
		}
	
		ctx.restore();
		
		ctx.beginPath();
		ctx.lineWidth = 10;
		ctx.fillStyle = this.players[playerId].color;
		ctx.strokeStyle = "black";
		ctx.arc(width / 2, height / 2, 40, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}
};
