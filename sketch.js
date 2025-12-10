let points = [];
let shapes = [];
let normpoints = [];
let normshapes = [];
let clientnum = 0;

// Add the button for "Begin Display"
document.addEventListener("DOMContentLoaded", function () {

  // 1. Create the REAL first button
  const mainStart = document.createElement("button");
  mainStart.id = "mainStart";
  mainStart.textContent = "Start Drawing";
  document.body.appendChild(mainStart);

  // 2. Hide everything else until mainStart is clicked
  const startDraw = document.createElement("text");
  startDraw.id = "startDraw";
  startDraw.textContent = "begin drawing";
  startDraw.classList.add("hidden");
  document.body.appendChild(startDraw);

  const refreshBtn = document.createElement("button");
  refreshBtn.id = "refreshBtn";
  refreshBtn.textContent = "create new drawing";
  refreshBtn.classList.add("hidden");
  document.body.appendChild(refreshBtn);

  // 3. When mainStart is clicked → reveal the real UI
  mainStart.addEventListener("pointerdown", () => {
    mainStart.classList.add("hidden");
    startDraw.classList.remove("hidden");
  });

  // 4. Your existing logic:
  document.addEventListener("pointerdown", function () {
    // only hide begin drawing after main start has been pressed
    if (!startDraw.classList.contains("hidden")) {
      startDraw.classList.add("hidden");
      refreshBtn.classList.remove("hidden");
    }
  });

  refreshBtn.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    location.reload();
  });

});



function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  frameRate(60);
  
  //websocket setup
  const serverAddress = "wss://flowjockey-server.onrender.com";
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
