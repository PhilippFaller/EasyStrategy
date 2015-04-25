//Globals
var canvas = document.getElementById("canvas");
var g = canvas.getContext("2d"); //graphic context
var frameRequest;	//saves id of the frame request to the window
var objects = [];

//functions
function main(){
	//intit
	var v = new Castle(10, 10, 0);
	objects.push(v);
	//start loop
	loop();
}

function loop(deltaT) {
    frameRequest = window.requestAnimationFrame(loop);		//request next frame

    update(deltaT); 
    render(deltaT);	
 }
 
 function update(deltaT){
	 /*for(o in objects){
		 o.update();
	 }*/
 }
 
 function render(deltaT){
	objects.forEach(function(o){o.render(deltaT)});
 }

canvas.addEventListener("click", function (event){
		var x = event.clientX - canvas.offsetLeft; 
		var y = event.clientY - canvas.offsetTop;

		objects.forEach(function(o){
			if(x > o.x && x < o.x + o.width && y > o.y && y < o.y + o.height){
				o.isSelected = true;
			}
			else{
				o.isSelected = false;
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
	 this.isSelevted = false;

	 this.update = function(){console.log("salle");};
	 this.render = function(deltaT){
		 g.clearRect(this.x, this.y, this.width, this.height);
		 g.beginPath();
		 g.fillRect(this.x, this.y, this.width, this.height);
		 if(this.isSelected){
			 g.fillStyle = "red";
			 g.fillRect(this.x, this.y, this.width, this.height);
			 g.fillStyle = "black";
		 }
		 g.stroke();
	 };
 }
 
 main();

