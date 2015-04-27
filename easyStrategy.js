//Globals
var canvas = document.getElementById("canvas");
var g = canvas.getContext("2d"); //graphic context
var frameRequest;	//saves id of the frame request to the window
var objects = [];
var selectedObject;

//functions
function main() {
	//intit
	objects.push(new Castle(new Vector(10, 10), 0));
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
	g.fillRect(canvas.offsetLeft, canvas.offsetTop, canvas.width, canvas.height);
	objects.forEach(function(o){ o.render(deltaT) });
}

canvas.addEventListener("click", function (event) {
	// var x = event.clientX - canvas.offsetLeft; 
	// var y = event.clientY - canvas.offsetTop;
	var pos = new Vector(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);

	objects.forEach(function(o) {
		//checks whether clicked or not
		if(pos.x > o.pos.x && pos.x < o.pos.x + o.width && pos.y > o.pos.y && pos.y < o.pos.y + o.height) {
			o.isSelected = true;
			selectedObject = o;
		}
		else
		{
			if(event.ctrlKey) {//control button 
				o.goalX = pos.x;
				o.goalY = pos.y;
			} 
			else {
				o.isSelected = false;
				selectedObject = undefined;
			}
		}
	});

});
	
 
 // classes
function Vector(x, y) {
	this.x = x;
	this.y = y;
	this.add = function(v) {
		return new Vector(this.x + v.x, this.y + v.y);
	};
	this.sub = function(v) {
		return new Vector(this.x - v.x, this.y - v.y);
	};
	this.norm = function() {
		return Math.sqrt(x*x + y*y);
	};
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
		if(this.isSelected)
		{
			g.fillStyle = "red";
			g.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		}
		g.stroke();
	};
}

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

function SwordFighter(pos, owner) {
	this.pos = pos;
	this.owner = owner;
	this.width = 10;
	this.height = 10;
	this.isSelected = false;
	this.goalX = pos.x;
	this.goalY = pos.y;
	//this.speed = 2;
	this.update = function() {
		if(this.pos.x < this.goalX) this.pos.x++;
		else if(this.pos.x > this.goalX) this.pos.x--;
		if(this.pos.y < this.goalY) this.pos.y++;
		else if(this.pos.y > this.goalY) this.pos.y--; 
	};
	this.render = function(deltaT) {
		g.fillStyle = "black";
		g.clearRect(this.pos.x, this.pos.y, this.width, this.height);
		g.beginPath();
		g.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		if(this.isSelected)
		{
			g.fillStyle = "red";
			g.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		}
		g.stroke();
	};
}
 
main();


