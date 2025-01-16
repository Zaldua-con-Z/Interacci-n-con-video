//Uso de ml5.j para hand pose
let handPose;
let video;
let hands = [];

const THUMB_TIP= 4;
const INDEX_FINGER_TIP= 8;

//Uso de js.
const {Engine, Body, Bodies, Composite, Composites, Constraint} = Matter;

let engine;
let bridge; let num=2; let radius=10; let length=15;


function preload() {
  // Load the handPose model
  handPose = ml5.handPose({maxHands: 1,flipped:true});
}


function setup() { 
    createCanvas(640, 480);
    // Create the webcam video and hide it
    video = createCapture(VIDEO,{flipped: true});
    video.size(640, 480);
    video.hide();
    // start detecting hands from the webcam video
    handPose.detectStart(video, gotHands);


  engine = Engine.create();
  bridge = new Bridge (num, radius, length);
  

}

function draw() {
  background(220);
  Engine.update(engine);

  // Draw the webcam video
  image(video, 0, 0, width, height);

  if (hands.length>0){
    let thumb= hands[0].keypoints[THUMB_TIP];
    let index = hands[0].keypoints[INDEX_FINGER_TIP];
    fill(0, 0, 5);
    noStroke();
    circle(thumb.x, thumb.y, 10);
    circle(index.x, index.y, 10);

    bridge.bodies[0].position.x= thumb.x;
    bridge.bodies[0].position.y= thumb.y;
    bridge.bodies[bridge.bodies.length-1].position.x= index.x;
    bridge.bodies[bridge.bodies.length-1].position.y= index.y;
    bridge.display();
  }
  
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}
