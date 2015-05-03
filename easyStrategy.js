//Globals
var canvas = document.getElementById("canvas");
var g = canvas.getContext("2d"); //graphic context
var frameRequest;	//saves id of the frame request to the window
var objects = [];
var selectedObject;

//functions
function main() {
	//intit
	objects.push(new Castle(new Vector(100, 100), 0));
	objects.push(new SwordFighter(new Vector(300, 300), 0));
	//start loop
	loop();
}

function loop(deltaT) {
	frameRequest = window.requestAnimationFrame(loop);		//request next frame

	update(deltaT); 
	render(deltaT);	
}
 
function update(deltaT) {
	objects.forEach(function(o){ o.update(deltaT) });
}
 
function render(deltaT) {
	g.fillStyle = "green";
	//g.fillRect(canvas.offsetLeft, canvas.offsetTop, canvas.width, canvas.height);
	objects.forEach(function(o){ o.render(deltaT) });
}

canvas.addEventListener("click", function (event) {
	var mousePos = new Vector(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);

	objects.forEach(function(o) {
		//checks whether clicked or not
		if(mousePos.x > o.pos.x && mousePos.x < o.pos.x + o.width
			&& mousePos.y > o.pos.y && mousePos.y < o.pos.y + o.height) {
			o.isSelected = true;
			selectedObject = o;
		}
		else {
			if(event.ctrlKey && o.isSelected) {//control button 
				o.goal = mousePos;
			} 
			else {
				o.isSelected = false;
				selectedObject = undefined;
			}
		}
	});

});
 
 // classes
 
var gameObject = {
	isInside : function(x, y) {
		if(x >= this.pos.x && x <= this.pos.x + this.width 
			&& y >= this.pos.y && y <= this.pos.y + this.height)
			return true;
		else
			return false;
	}
	
};

function Vector(x, y) {
	this.x = x;
	this.y = y;
	this.equals = function(v) {
		return v.x === this.x && v.y === this.y;
	};
	this.add = function(v) {
		return new Vector(this.x + v.x, this.y + v.y);
	};
	this.sub = function(v) {
		return new Vector(this.x - v.x, this.y - v.y);
	};
	this.norm = function() {
		return Math.sqrt(x * x + y * y);
	};
	this.unitVec = function() {
		var norm = this.norm();
		return new Vector(this.x / norm, this.y / norm) ;
	}
}	 
 
function Castle(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.width = 200;
	this.height = 200;
	this.isSelected = false;

	this.update = function(){};
	this.render = function(deltaT) {
		g.clearRect(this.pos.x, this.pos.y, this.width, this.height);
		g.fillStyle = "black";
		g.beginPath();
		g.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		if(this.isSelected) {
			g.fillStyle = "red";
			g.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		}
		g.stroke();
	};
}
Castle.prototype = gameObject;

function Barrack(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.width = 100;
	this.height = 100;
	this.isSelected = false;
	this.update = function(){};
	this.render = function(deltaT) {
		g.fillStyle = "black";
		g.clearRect(this.pos.x, this.pos.y, this.width, this.height);
		g.beginPath();
		g.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		if(this.isSelected) {
			g.fillStyle = "red";
			g.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		}
		g.stroke();
	};
}
Barrack.prototype = gameObject;

function SwordFighter(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.width = 32;
	this.height = 32;
	this.isSelected = false;
	this.goal = pos;
	this.path = [];
	//this.speed = 2;
	this.checkPath = function() {

	};
	this.update = function() {
		if(!this.pos.equals(this.goal)) {
			//gerade
			var m = (this.pos.y - this.goal.y) / (this.pos.x - this.goal.x);
			var b = this.pos.y - m * (this.pos.x) ;
			g.beginPath();
			g.fillStyle = "black";
			g.moveTo(0,b);
			g.lineTo( this.goal.x,  m*this.goal.x+b);
			g.stroke();
			//
			for(var i = 0; i < objects.length; i++) {
				var o = objects[i];
				if(o != this)
/*
				//g.strokeRect(o.pos.x, m * o.pos.x + b, 2, 2);
		code of sides:		 _2
				       1|_|4
					8
*/
				if(((this.pos.x >= o.pos.x && this.goal.x <= o.pos.x) ||
					 (this.goal.x >= o.pos.x && this.pos.x <= o.pos.x) &&
				   (this.pos.y >= o.pos.y && this.goal.y <= o.pos.y) ||
					 (this.goal.y >= o.pos.y && this.pos.y <= o.pos.y)) ||
				   ((this.pos.x >= o.pos.x + o.width && this.goal.x <= o.pos.x + o.width) || 
					(this.goal.x >= o.pos.x + o.width && this.pos.x <= o.pos.x + o.width)) && 
				   (this.pos.y >= o.pos.y + o.height && this.goal.y <= o.pos.y + o.height) || 
					(this.goal.y >= o.pos.y + o.height && this.pos.y <= o.pos.y + o.height)){

					var result = 0;
					if(m * o.pos.x + b + this.height >= o.pos.y && m * o.pos.x + b <= o.pos.y + o.height) result |= 1;
					if(m * (o.pos.x + o.width) + b + this.height >= o.pos.y && m * (o.pos.x + o.width) + b <= o.pos.y + o.height) result |= 4;
					if((o.pos.y - b) / m >= o.pos.x && (o.pos.y - b) / m <= o.pos.x + o.width) result |= 2;
					if((o.pos.y + o.height - b) / m >= o.pos.x && (o.pos.y + o.height - b) / m <= o.pos.x + o.width) result |= 8;
					console.log(result);
					switch(result){
						case 0: break;
						case 3: break; //links oben
						case 5: break; //waagerecht
						case 6: break; //rechts oben
						case 9: break; //links unten
						case 10: break;//horizontal
						case 12: break;//rechts unten
						default: console.log("Fail in collision detection");
					}
				}
			}
			
			//ollis ziiiigg
			 var vec = this.goal.sub(this.pos).unitVec();
			// for(var i = 0; i < objects.length; i++) {
				// var o = objects[i];
				// if(o != this) {
					// if(!o.isInside(this.pos.x + vec.x, this.pos.y + vec.y)) {
						 this.pos.x += vec.x;
						 this.pos.y += vec.y;
					// }
				// }
			// }
		}
	};
	this.render = function(deltaT) {
		g.fillStyle = "black";
		g.clearRect(this.pos.x, this.pos.y, this.width, this.height);
		g.beginPath();
		g.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		if(this.isSelected) {
			g.fillStyle = "red";
			g.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		}
		g.stroke();
	};
}
SwordFighter.prototype = gameObject;
 
main();
