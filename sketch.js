

let points = [];
let shapes = [];
let normpoints = [];
let normshapes = [];
let clientnum = 0;

// Add the button for "Begin Display"
document.addEventListener("DOMContentLoaded", function () {
  const startDraw = document.createElement("text");
  startDraw.id = "startDraw";
  startDraw.textContent = "Begin Drawing";
  document.body.appendChild(startDraw);

  document.addEventListener("click", function () {
    startDraw.classList.add("hidden"); // Hide the button
  });
});


function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  frameRate(60);
  
  //websocket setup
  const serverAddress = "wss://serverfortwo.glitch.me/";
  ws = new WebSocket(serverAddress);
  ws.onopen = function(){
    const clientdata = {type:'client_info',app:'draw'};
    ws.send(JSON.stringify(clientdata));
    console.log("I just connected to the server on "+serverAddress);
  }
  
  ws.onmessage = function (event) {
  let reader = new FileReader();
    let obj = reader.readAsText(event.data);   
    reader.onload = function() {
      let obj = JSON.parse(reader.result);
      console.log(obj);
      if(obj.type=='clientnum'&&clientnum==0){
        clientnum = obj.number;
        console.log(clientnum);
      }
      };
  };
}

function draw() {
    //draw previous shapes
    for (let i=0;i<shapes.length;i++){
        for(let shape of shapes){
            beginShape();
            for(let pt of shape){
                curveVertex(pt.x,pt.y);
            }
            endShape();
        } 
    }

    //draw active shape
    beginShape();
    stroke(255);
    fill(0,0,0,0);
    for (let i = 0; i < points.length; i++) {
      curveVertex(points[i].x, points[i].y);
    }
    endShape();
  
}

function touchStarted(){
    points = [];
    normpoints = [];
    points.push(createVector(mouseX, mouseY));
}
    
function touchMoved(){
    points.push(createVector(mouseX, mouseY));
}

function touchEnded(){
    // Properly iterate over the points array to normalize coordinates
    for (let pt of points) {
        // Normalize each point's x and y coordinates
        let normalizedX = pt.x / windowWidth;
        let normalizedY = pt.y / windowHeight;
        normpoints.push(createVector(normalizedX, normalizedY));
    }

    console.log(normpoints);
    shapes.push([...points]);
    normshapes.push([...normpoints]);
    const shapedata = {type:'newshape',points:normshapes[normshapes.length-1],clientnum:clientnum};
    ws.send(JSON.stringify(shapedata));
}