//Globals
var canvas = document.getElementById("canvas");
var g = canvas.getContext("2d"); //graphic context
var frameRequest;	//saves id of the frame request to the window
var objects = [];
var selectedObject;
//var gap = 5;
var TWO_PI = 2 * Math.PI;
var lastTime = 0;

//functions
function main() {
	//intit
	objects.push(new Castle(new Vector(100, 100), 0));
	objects.push(new SwordFighter(new Vector(305, 305), 0));
	//start loop
	loop();
}

function loop(time) {
	frameRequest = window.requestAnimationFrame(loop);		//request next frame
	var deltaT = time - lastTime;
	update(deltaT); 
	render(deltaT);	
	lastTime = time;
}
 
function update(deltaT) {
	objects.forEach(function(o){ o.update(deltaT) });
}
 
function render(deltaT) {
	g.fillStyle = "green";
//	g.fillRect(canvas.offsetLeft, canvas.offsetTop, canvas.width, canvas.height);
	g.fillRect(0, 0, canvas.width, canvas.height);
	objects.forEach(function(o){ o.render(deltaT) });
}

canvas.addEventListener("click", function (event) {
	var mousePos = new Vector(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);

	objects.forEach(function(o) {
		//checks whether clicked or not
		if(o.contains(mousePos)) {
			o.isSelected = true;
			selectedObject = o;
		}
		else {
			if(event.ctrlKey && o.isSelected) {//control button 
				o.setGoal(mousePos);
			} 
			else {
				o.isSelected = false;
				selectedObject = undefined; //TODO warum springt er hier hin?!
			}
		}
	});

});

function between(nStart, nBetween, nEnd){
	return (nStart <= nBetween && nBetween <= nEnd) || (nEnd <= nBetween && nBetween <= nStart);
}
 
 // classes
 
function GameObject () {
	this.contains = function(pos) {
		return pos.sub(this.pos).qNorm() <= this.sqrRadius;
	};
	
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
	this.addEq = function(v) {
		this.x += v.x;
		this.y += v.y;
	};
	this.dotP = function(v) {
		return this.x * v.x + this.y * v.y
	};
	this.norm = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};
	this.qNorm = function() {
		return this.x * this.x + this.y * this.y;
	};
	this.unitVec = function() {
		var norm = this.norm();
		return new Vector(this.x / norm, this.y / norm) ;
	}
}	 
 
function Castle(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.radius = 75;
	this.sqrRadius = this.radius * this.radius;
	this.isSelected = false;

	this.update = function(){};
	this.render = function(deltaT) {
//		g.clearRect(this.pos.x, this.pos.y, this.width, this.height);
		g.beginPath();
		if(this.isSelected)	g.fillStyle = "red";
		else g.fillStyle = "black";
		g.arc(this.pos.x, this.pos.y, this.radius, 0, TWO_PI);
		g.fill();
	};
}
Castle.prototype = new GameObject();

function Barrack(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.radius = 50;
	this.sqrRadius = this.radius * this.radius;
	this.isSelected = false;
	this.update = function(){};
	this.render = function(deltaT) {
		g.beginPath();
		if(this.isSelected)	g.fillStyle = "red";
		else g.fillStyle = "black";
		g.arc(this.pos.x, this.pos.y, this.radius, 0, TWO_PI);
		g.fill();
	};
}
Barrack.prototype = new GameObject();

function Troop () {
	this.move = function(deltaT) {
		var delta = this.goal.sub(this.pos);
		if(delta.norm() <= 3) this.goal = this.pos;
		else this.pos.addEq(this.goal.sub(this.pos).unitVec().mul(deltaT / 15));
	};
	this.checkPath = function(goal) {

	};
	this.setGoal = function(goal) {
//		this.goal = new Vector(goal.x - this.width / 2, goal.y - this.height / 2);
		for(var i = 0; i < objects.length; i++){
			var o = objects[i];
			if( o.contains(goal)){
				goal = o.pos.add(goal.sub(o.pos).norm().mul(o.radius + 1));
			}
		}
		this.goal = goal;
	};
};
Troop.prototype = new GameObject();

function SwordFighter(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.radius = 16;
	this.sqrRadius = this.radius * this.radius;
	this.isSelected = false;
	this.goal = pos;
	this.waypoint;
	
	this.update = function(deltaT) {
		if(!this.pos.equals(this.goal)) {
			this.move(deltaT);
		}
	};
	this.render = function(deltaT) {
		g.beginPath();
		if(this.isSelected)	g.fillStyle = "red";
		else g.fillStyle = "black";
		g.arc(this.pos.x, this.pos.y, this.radius, 0, TWO_PI);
		g.fill();
	};
}
SwordFighter.prototype = new Troop();
 
main();