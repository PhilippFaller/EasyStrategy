//Globals
var canvas = document.getElementById("myCanvas");
canvas.width  = window.innerWidth ;
canvas.height = window.innerHeight;
var g = canvas.getContext("2d"); //graphic context
g.lineWidth = 2;
g.font = "20px Arial";
var frameRequest;	//saves id of the frame request to the window
var objects = [];
var selectedObject;
var gap = 5;
var TWO_PI = 2 * Math.PI;
var lastTime = 0;
var rigthVec = new Vector(1, 0);
var money = 200;
var mouse = new Vector(0, 0);
var nextBuilding = undefined;


//functions
function main() {
	//intit
	objects.push(new Castle(new Vector(200, 200), 1));
	objects.push(new SwordFighter(new Vector(305, 305), 1));
	objects.push(new SwordFighter(new Vector(400, 400), 2));
	objects.push(new Archer(new Vector(600, 300), 1));
//	g.fillStyle = "green";
//	g.fillRect(0, 0, canvas.width, canvas.height);
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
	//if building to build
	if(nextBuilding != undefined){
		g.fillStyle = "blue";
		g.beginPath();
		g.arc(mouse.x, mouse.y, nextBuilding.prototype.radius, 0, TWO_PI);
		g.fill();
	}
	
	//money
	g.fillStyle = "yellow";
	g.beginPath();
	g.arc(30, 30, 10, 0, TWO_PI);
	g.fill()
	g.fillStyle = "black";
	g.fillText(Math.floor(money), 45, 40);
}

canvas.addEventListener("click", function (event) {
	var mousePos = new Vector(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
	if(nextBuilding != undefined){
		objects.push(new nextBuilding(mousePos, 1));
		nextBuilding = undefined;
	}
//console.log(mousePos);
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

canvas.addEventListener('mousemove', function(e){ 
    mouse.x = e.clientX || e.pageX; 
    mouse.y = e.clientY || e.pageY 
}, false);

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
		else if(this.owner === 2) g.strokeStyle = "red";
		else g.strokeStyle = "black";
		if(this.isSelected){
			g.fillStyle = "blue";
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
		if(this.specialRender) this.specialRender(); 
	};	
}; 

function MenuItem(pos, constructor, cost) {
	this.pos = pos;
	this.owner = 0;
	if(constructor.prototype.radius != 16) this.radius = 32;
	else this.radius = 16;
	this.sqrRadius = this.radius * this.radius;
	this.isSelected = false;
	this.life = 100;
	this.img = constructor.prototype.img;
	this.update = function(deltaT) {
		if(this.isSelected){
			nextBuilding = constructor;
//			console.log(constructor);
			money -= cost;
		}
	};
	this.render = function (deltaT) {
		g.fillStyle = "white";
		g.beginPath();
		g.arc(this.pos.x, this.pos.y, this.radius, 0, TWO_PI);
		g.fill();
		g.drawImage(this.img, this.pos.x - this.radius / 2, this.pos.y - this.radius / 2, this.radius, this.radius);
	};
}
MenuItem.prototype = new GameObject();
 
function Castle(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.radius = 75;
	this.sqrRadius = this.radius * this.radius;
	this.isSelected = false;
	this.life = 100;
	this.item1;
	this.item2;
	this.contains = function(pos){
		if(Castle.prototype.contains.call(this, pos)){
			if(this.item1){
				if(this.item1.contains(pos)){
					this.item1.isSelected = true;
					return false;
				}
				else if(this.item2.contains(pos)){
					this.item2.isSelected = true;
					return false;
				}
			}
			return true;
		}
	};
	this.update = function(deltaT) {
		if(this.item1){
			this.item1.update();
			this.item2.update();
		}
		if(deltaT) money += deltaT / 2000;
	};
	this.specialRender = function() {
		if(this.item1){
			this.item1.render();
			this.item2.render();
		}
		if(this.isSelected){
			this.item1 = new MenuItem(
					this.pos.sub(new Vector(30, 30)), Barrack, 200);
			this.item2 = new MenuItem(
					this.pos.sub(new Vector(-30, -30)), House, 100);
		}
		else{
			if(this.item1 != undefined) {
				this.item1 = undefined;
				this.item2 = undefined;
			}
		}
	};
}
Castle.prototype = new GameObject();
Castle.prototype.img = new Image();
Castle.prototype.img.src = "castle.png";

function Barrack(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.radius = 50;
	this.sqrRadius = this.radius * this.radius;
	this.isSelected = false;
	this.life = 100;
	this.items = [];
	this.contains = function(pos){
		if(Castle.prototype.contains.call(this, pos)){
			if(this.items[0]){
				this.items.forEach(function(o) {
					if(o.contains(pos)){
						o.isSelected = true;
						return false;
					}
				});
			}
			return true;
		}
	};
	this.update = function(deltaT) {
		if(this.items[0]){
			this.items.forEach(function(o){
				o.update();
			});
		}
		if(deltaT) money += deltaT / 2000;
	};
	this.specialRender = function() {
		if(this.items[0]){
			this.items.forEach(function(o){
				o.render();
			});
		}
		if(this.isSelected){
			this.items[0] = (new MenuItem(this.pos.sub(new Vector(20, 20)), SwordFighter, 200));
			this.items[1] = (new MenuItem(this.pos.sub(new Vector(-20, -20)), Archer, 100));
//			this.items[2] = (new MenuItem(this.pos.sub(new Vector(-20, 20)), Archer, 100));
//			this.items[3] = (new MenuItem(this.pos.sub(new Vector(20, -20)), Archer, 100));
		}
		else{
			if(this.items[0] != undefined) {
				this.items = [];
			}
		}
	};

}
Barrack.prototype = new GameObject();
Barrack.prototype.img = new Image();
Barrack.prototype.img.src = "barrack.png";
Barrack.prototype.radius = 50;

function House(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.radius = 50;
	this.sqrRadius = this.radius * this.radius;
	this.isSelected = false;
	this.life = 100;
	this.update = function(){};

}
House.prototype = new GameObject();
House.prototype.img = new Image();
House.prototype.img.src = "house.png";
House.prototype.radius = 50;

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
		var newEnemy = false;
		for(var i = 0; i < objects.length; i++){
			var o = objects[i];
			if( o.collides(goal, this.radius)){
				goal = o.pos.add(this.pos.sub(o.pos).unitVec().mul(o.radius + this.radius +this.range -  gap));
				if(o.owner != this.owner){
					this.enemy = o;
					newEnemy = true;
				}
			}
		}
		if(!newEnemy) this.enemy = undefined;
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
Archer.prototype.img.src = "crossbow.png";

 
main();