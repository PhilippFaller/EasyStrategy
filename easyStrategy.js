//Globals
var canvas = document.getElementById("canvas");
var g = canvas.getContext("2d"); //graphic context
var frameRequest;	//saves id of the frame request to the window
var objects = [];
var selectedObject;
var gap = 5;

//functions
function main() {
	//intit
	objects.push(new Castle(new Vector(100, 100), 0));
	objects.push(new SwordFighter(new Vector(305, 305), 0));
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
	this.mul = function(s) {
		return new Vector(this.x * s, this.y * s);
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

var troop = {
	move : function(deltaT) {
		if(this.waypoint === 0)	this.checkPath(this.goal);
		else {
			if(this.waypoint.sub(this.pos).norm() <= 1){
				this.waypoint = 0;
				this.move();
			}
			else this.checkPath(this.waypoint);
		}
		var vec;
		if(this.waypoint === 0) vec = this.goal.sub(this.pos).unitVec();
		else vec = this.waypoint.sub(this.pos).unitVec();
//		console.log(this.waypoint);
		 vec.mul(deltaT / 50);
		 this.pos.x += vec.x;
		 this.pos.y += vec.y;	
	},
	checkPath : function(goal) {
		for(var i = 0; i < objects.length; i++){
			var o = objects[i];
			if(o != this)
				//wenn objekt ungefähr dazwischen liegt
				if(((this.pos.x >= o.pos.x && goal.x <= o.pos.x) ||
					 (goal.x >= o.pos.x && this.pos.x <= o.pos.x) &&
				   (this.pos.y >= o.pos.y && goal.y <= o.pos.y) ||
					 (goal.y >= o.pos.y && this.pos.y <= o.pos.y)) ||
				   ((this.pos.x >= o.pos.x + o.width && goal.x <= o.pos.x + o.width) || 
					(goal.x >= o.pos.x + o.width && this.pos.x <= o.pos.x + o.width)) && 
				   (this.pos.y >= o.pos.y + o.height && goal.y <= o.pos.y + o.height) || 
					(goal.y >= o.pos.y + o.height && this.pos.y <= o.pos.y + o.height)){
					//Gerade aufstellen
					var m = (this.pos.y - goal.y) / (this.pos.x - goal.x);
					var b = this.pos.y - m * (this.pos.x) ;
					//Überprüfen welche Seite vom Rechteck geschnitten wird
					var result = 0;
					if(m * o.pos.x + b + this.height >= o.pos.y && m * o.pos.x + b <= o.pos.y + o.height) result |= 1;
					if(m * (o.pos.x + o.width) + b + this.height >= o.pos.y && m * (o.pos.x + o.width) + b <= o.pos.y + o.height) result |= 4;
					if((o.pos.y - b) / m >= o.pos.x && (o.pos.y - b) / m <= o.pos.x + o.width) result |= 2;
					if((o.pos.y + o.height - b) / m >= o.pos.x && (o.pos.y + o.height - b) / m <= o.pos.x + o.width) result |= 8;
					console.log(result);
					switch(result){
						case 0: return; //Rekursion unterbrechen
						case 3: this.waypoint = new Vector(o.pos.x - this.width - gap, o.pos.y - gap); break; //links oben
						case 5:	//waagerecht
							//Wenn waagerechter Schnitt unter der Hälfte des Objekts liegt, unten rum laufen
							if(this.pos.y - this.height / 2 > o.pos.y + o.height / 2)
								this.waypoint = new Vector(o.pos.x + o.width / 2, o.pos.y + o.height + gap);
							else
								this.waypoint = new Vector(o.pos.x + o.width / 2, o.pos.y - gap); 
							break; 
						case 6: this.waypoint = new Vector(o.pos.x + o.width + gap, o.pos.y - gap); break; //rechts oben
						case 9: this.waypoint = new Vector(o.pos.x - this.width - gap, o.pos.y +o.height + gap); break; //links unten
						case 10:  //senkrecht
							//Wenn senkrecht Schnitt unter der Hälfte des Objekts liegt, unten rum laufen
							if(this.pos.x - this.width / 2 > o.pos.x + o.width / 2)
								this.waypoint = new Vector(o.pos.x + o.width + gap, o.pos.y + o.height / 2);
							else
								this.waypoint = new Vector(o.pos.x - gap, o.pos.y + o.height / 2); 
							break;
						case 12: this.waypoint = new Vector(o.pos.x + o.width + gap, o.pos.y + o.height + gap); break;//rechts unten
						default: console.log("Fail in collision detection");
					};
					//Rekursion
					this.checkPath(this.waypoint);
				}
		}
	}
};
troop.prototype = gameObject;

function SwordFighter(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.width = 32;
	this.height = 32;
	this.isSelected = false;
	this.goal = pos;
	this.waypoint = 0;
	
	this.update = function(deltaT) {
		if(!this.pos.equals(this.goal)) {
			this.move(deltaT);
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
SwordFighter.prototype = troop;
 
main();
