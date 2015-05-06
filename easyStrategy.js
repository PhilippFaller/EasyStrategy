//Globals
var canvas = document.getElementById("myCanvas");
//canvas.width  = window.innerWidth ;
//canvas.height = window.innerHeight;
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
	objects.push(new SwordFighter(new Vector(305, 305), 1));
	objects.push(new SwordFighter(new Vector(400, 400), 2))
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
			if(o.owner === 1 && o.contains(mousePos)) {
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

function map(value, oldMax, newMax){
	return (value / oldMax) * newMax;
}
 
 // classes
 
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

function GameObject () {
	this.contains = function(pos) {
		return pos.sub(this.pos).qNorm() <= this.sqrRadius;
	};
	this.collides = function(pos, radius) {
		return pos.sub(this.pos).norm() <= this.radius + radius;
	};
	this.render = function(deltaT) {
		if(this.owner === 1) g.strokeStyle = "blue";
		else g.strokeStyle = "red";
		if(this.isSelected){
			g.beginPath();
			g.arc(this.pos.x, this.pos.y, this.radius, 0, TWO_PI);
			g.fill();
		}
		g.beginPath();
		g.arc(this.pos.x, this.pos.y, this.radius, 0, map(this.life, 100, TWO_PI));
		g.stroke();
		g.save();
		g.translate(this.pos.x, this.pos.y);
		g.rotate(this.angle);
		g.drawImage(this.img, - this.radius, -this.radius);
		g.restore();
	};	
}; 
 
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
	this.radius = 16;
	this.sqrRadius = this.radius * this.radius;
	this.angle = 0;
	this.life = 100;
	this.enemy = undefined;
	
	this.update = function(deltaT) {
		if(!this.pos.equals(this.goal)) {
			this.move(deltaT);
		}
		this.attack(deltaT);
	};
	this.move = function(deltaT) {
//		if(this.enemy != undefined){
//			var v = new Vector(this.enemy.pos.x, this.enemy.pos.y);
//			this.goal = v;
//			this.waypoint = v;
//		}
//		console.log(this.pos.x + " " + this.pos.y);
		if(this.goal.sub(this.pos).norm() <= 3){
			this.waypoint = this.goal = this.pos;
			if(this.enemy != undefined){
				var movement = this.enemy.pos.sub(this.pos);
				this.angle = Math.acos(movement.dotP(rigthVec) / movement.norm());
				if(movement.y < 0) this.angle = TWO_PI - this.angle;
			}
		}
		else{
			if(this.waypoint.sub(this.pos).norm() <= 3) this.setWaypoint(this.goal);
			this.checkPath(this.waypoint);
			this.pos.addEq(this.waypoint.sub(this.pos).unitVec().mul(deltaT / 15));
		}
	};
	this.checkPath = function(goal) {
//		console.log(this.pos.x);
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
//		console.log(this.pos.x);
	};
	this.setGoal = function(goal) {
//		this.goal = new Vector(goal.x - this.width / 2, goal.y - this.height / 2);
		for(var i = 0; i < objects.length; i++){
			var o = objects[i];
			if( o.collides(goal, this.radius)){
				goal = o.pos.add(goal.sub(o.pos).unitVec().mul(o.radius + this.radius +  gap));
				if(o.owner != this.owner) this.enemy = o;
			}
			else this.enemy = undefined;
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
	this.attack = function(deltaT) {
		if(this.enemy != undefined){
			if(this.pos.sub(this.enemy.pos).norm() <= this.radius + this.enemy.radius + this.range){
				this.enemy.life -= deltaT / this.damageConst;
//				console.log(this.life);
				if(this.enemy.life <= 0){
					objects.splice(objects.indexOf(this.enemy),1);
					this.enemy = undefined;
				} 
					
			}
		}
	};
};
Troop.prototype = new GameObject();

function SwordFighter(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.isSelected = false;
	this.goal = pos;
	this.waypoint = this.goal;
	this.range = 2 * gap;
	this.damageConst = 60;
}
SwordFighter.prototype = new Troop();
SwordFighter.prototype.img = new Image();
SwordFighter.prototype.img.src = "swordfighter.png";

function Archer(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.isSelected = false;
	this.goal = pos;
	this.waypoint = this.goal;
	this.range = 2 * gap + 100;
	this.damageConst = 60;
}
Archer.prototype = new Troop();
Archer.prototype.img = new Image();
Archer.prototype.img.src = "swordfighter.png";

 
main();