//Globals
var canvas = document.getElementById("canvas");
var g = canvas.getContext("2d"); //graphic context
var frameRequest;	//saves id of the frame request to the window
var objects = [];
var selectedObject;

//functions
function main(){
	//intit
	objects.push(new Castle(10, 10, 0));
	objects.push(new SwordFighter(300, 300, 0));
	//start loop
	loop();
}

function loop(deltaT) {
    frameRequest = window.requestAnimationFrame(loop);		//request next frame

    update(deltaT); 
    render(deltaT);	
 }
 
 function update(deltaT){
	objects.forEach(function(o){o.update(deltaT)});
 }
 
 function render(deltaT){
	g.fillStyle = "green";
	g.fillRect(canvas.offsetLeft, canvas.offsetTop, canvas.width, canvas.height);
	objects.forEach(function(o){o.render(deltaT)});
 }

canvas.addEventListener("click", function (event){
		var x = event.clientX - canvas.offsetLeft; 
		var y = event.clientY - canvas.offsetTop;

		objects.forEach(function(o){
			//checks wheter clicked or not
			if(x > o.x && x < o.x + o.width && y > o.y && y < o.y + o.height){
				o.isSelected = true;
				selectedObject = o;
			}
			else{
				if(event.ctrlKey){ //middle mouse button
					o.goalX = x;
					o.goalY = y;
				} 
				else {
					o.isSelected = false;
					selectedObject = undefined;
				}
			}
		});

	}
		
);
	
 
 // classes
 function Castle(x, y, owner){
	 this.x = x;
	 this.y = y;
	 this.owner = owner;
	 this.width = 200;
	 this.height = 200;
	 this.isSelected = false;

	 this.update = function(){};
	 this.render = function(deltaT){
		 g.clearRect(this.x, this.y, this.width, this.height);
		 g.fillStyle = "black";
		 g.beginPath();
		 g.fillRect(this.x, this.y, this.width, this.height);
		 if(this.isSelected){
			 g.fillStyle = "red";
			 g.fillRect(this.x, this.y, this.width, this.height);
		 }
		 g.stroke();
	 };
 }

function Barrack(x, y, owner){
		 this.x = x;
	 this.y = y;
	 this.owner = owner;
	 this.width = 100;
	 this.height = 100;
	 this.isSelected = false;
	 this.update = function(){};
	 this.render = function(deltaT){
		 g.fillStyle = "black";
		 g.clearRect(this.x, this.y, this.width, this.height);
		 g.beginPath();
		 g.fillRect(this.x, this.y, this.width, this.height);
		 if(this.isSelected){
			 g.fillStyle = "red";
			 g.fillRect(this.x, this.y, this.width, this.height);
		 }
		 g.stroke();
	 };
}

function SwordFighter(x, y, owner){
	 this.x = x;
	 this.y = y;
	 this.owner = owner;
	 this.width = 10;
	 this.height = 10;
	 this.isSelected = false;
	 this.goalX = x;
	 this.goalY = y;
	 //this.speed = 2;
	 this.update = function(){
		if(this.x < this.goalX) this.x++;
		else if(this.x > this.goalX) this.x--;
		if(this.y < this.goalY) this.y++;
		else if(this.y > this.goalY) this.y--; 
	 };
	 this.render = function(deltaT){
		 g.fillStyle = "black";
		 g.clearRect(this.x, this.y, this.width, this.height);
		 g.beginPath();
		 g.fillRect(this.x, this.y, this.width, this.height);
		 if(this.isSelected){
			 g.fillStyle = "red";
			 g.fillRect(this.x, this.y, this.width, this.height);
		 }
		 g.stroke();
	 };
}
 
 main();


