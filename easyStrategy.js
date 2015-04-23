//Globals
var g = document.getElementById("canvas").getContext("2d"); //graphic context
var frameRequest;	//saves id of the frame request to the window
var objects = [];

//functions
function main(){
	//intit
	var v = new Castle(10, 10, 0);
	objects.push();
	console.log(v.x);
	v.render(0);
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
	 for(o in objects){
		 o.render(deltaT);
	 }
 }
 
 // classes
 function Castle(x, y, owner){
	 this.x = x;
	 this.y = y;
	 this.owner = owner;
	 this.width = 200;
	 this.height = 200;

	 this.update = function(){console.log("salle");};
	 this.render = function(deltaT){
		 console.log("hi");
		 g.fillColor = "red";
		 g.beginPath();
		 g.fillRect(this.x, this.y, this.width, this.height);
		 g.stroke();
	 };
 }
 
 main();
