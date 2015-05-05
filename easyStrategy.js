//Globals
var canvas = document.getElementById("canvas");
var g = canvas.getContext("2d"); //graphic context
g.lineWidth = 2;
var frameRequest;	//saves id of the frame request to the window
var objects = [];
var selectedObject;
var gap = 5;
var TWO_PI = 2 * Math.PI;
var lastTime = 0;
var rigthVec = new Vector(1, 0);

//functions
function main() {
	//intit
	objects.push(new Castle(new Vector(200, 200), 0));
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
		if(event.ctrlKey){//control button 
			if(o.isSelected) o.setGoal(mousePos);
		} else{
			if(o.contains(mousePos)) {
				o.isSelected = true;
				selectedObject = o;
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
		if(this.goal.sub(this.pos).norm() <= 3) this.waypoint = this.goal = this.pos;
		else{
			if(this.waypoint.sub(this.pos).norm() <= 3) this.setWaypoint(this.goal);
			this.checkPath(this.waypoint);
			this.pos.addEq(this.waypoint.sub(this.pos).unitVec().mul(deltaT / 15));
		}
	};
	this.checkPath = function(goal) {
		var m = (goal.y - this.pos.y) / (goal.x - this.pos.x);
		var b = this.pos.y - m * this.pos.x;
		var m1 = -1 / m;
		for(var i = 0; i < objects.length; i++){
			var o = objects[i];
			if(o != this){
				var b1 = o.pos.y - m1 * o.pos.x;
				var xIntersection = (b1 - b) / (m - m1);
				var yIntersection = m1 * xIntersection + b1;
				if((this.pos.x <= xIntersection && xIntersection <= goal.x) 
					|| goal.x <= xIntersection && xIntersection <= this.pos.x){
					var diff = (new Vector(xIntersection, yIntersection)).sub(o.pos); 
					if(diff.norm() <= (o.radius + this.radius)){
						this.setWaypoint(o.pos.add(diff.unitVec().mul(this.radius + o.radius + gap)));
//						g.startPath();
//						g.arc(this.waypoint.x, this.waypoint.y, 3, 0, TWO_PI);
//						g.fill();
						this.checkPath(this.waypoint)
					}
					
				}
			}

		}
	};
	this.setGoal = function(goal) {
//		this.goal = new Vector(goal.x - this.width / 2, goal.y - this.height / 2);
		for(var i = 0; i < objects.length; i++){
			var o = objects[i];
			if( o.contains(goal)){
				goal = o.pos.add(goal.sub(o.pos).unitVec().mul(o.radius + this.radius +  gap));
			}
		}
		this.goal = goal;
		this.setWaypoint(goal);
	};
	this.setWaypoint = function(waypoint) {
		this.waypoint = waypoint;
		var movement = this.waypoint.sub(this.pos);
		this.angle = Math.acos(movement.dotP(rigthVec) / movement.norm());
		if(movement.y < 0) this.angle = TWO_PI - this.angle;

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
	this.waypoint = this.goal;
	this.angle = 0;
	
	this.update = function(deltaT) {
		if(!this.pos.equals(this.goal)) {
			this.move(deltaT);
		}
	};
	this.render = function(deltaT) {
		if(this.isSelected){
			g.strokeStyle = "red";
			g.beginPath();
			g.arc(this.pos.x, this.pos.y, this.radius, 0, TWO_PI);
			g.stroke();
		}
//		else g.fillStyle = "black";
		
		g.save();
		g.translate(this.pos.x, this.pos.y);
		g.rotate(this.angle);
		g.drawImage(swordFighterImg, -this.radius, -this.radius);
		g.restore();
	};
}
SwordFighter.prototype = new Troop();
var swordFighterImg = new Image();
swordFighterImg.src = "/home/philipp/workspace/EasyStrategy/swordfighter.png";
 
main();