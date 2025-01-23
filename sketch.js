const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;

// Matter.js physics stuff
const { Engine, Bodies, Composite, Body, Vector } = Matter;
let engine;
let bridge;
let ball;

// ml5.js tracker stuff
let handpose;
let video;
let hands = [];
let handOptions = { maxHands: 1, flipHorizontal: true };

function preload() {
  // Load the handpose model
  handpose = ml5.handpose(handOptions);
}

function gotHands(results) {
  // Callback function; save the output to the hands variable
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  engine = Engine.create();
  setupGame();

  // Create the webcam, start detecting hands
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  handpose.detectStart(video, gotHands);
}

function setupGame() {
  bridge = new Bridge(16);
  ball = Bodies.circle(width / 2, height / 2, 20, { restitution: 1, friction: 0 });
  Composite.clear(engine.world); // Clear the physics world
  Composite.add(engine.world, ball); // Add the ball to the world
  Composite.add(engine.world, bridge.particles); // Add the bridge particles
}

function draw() {
  background(255);

  // Flip video for better hand tracking experience
  push();
  if (handOptions.flipHorizontal) {
    translate(width, 0);
    scale(-1, 1);
  }
  image(video, 0, 0, width, height);
  pop();

  // Display hands and detect collision
  if (hands.length > 0) {
    noFill();
    stroke("rgb(10,10,10)");
    let thumbx = hands[0].keypoints[THUMB_TIP].x;
    let thumby = hands[0].keypoints[THUMB_TIP].y;
    let indexx = hands[0].keypoints[INDEX_FINGER_TIP].x;
    let indexy = hands[0].keypoints[INDEX_FINGER_TIP].y;
    circle(thumbx, thumby, 28);
    circle(indexx, indexy, 28);
  }

  checkBallCollision();
  keepBallInBounds();
  checkOutOfBounds();

  Engine.update(engine); // Update the physics engine
  renderBall();
  bridge.setToHandPoints();
  bridge.show();
}

//---------------------------------------------------------
function renderBall() {
  let pos = ball.position;
  fill(0);
  noStroke(0);
  push();
  translate(pos.x, pos.y);
  circle(0, 0, 40); // Draw the ball
  pop();
}

function checkBallCollision() {
  if (bridge.isBallTouchingLine(ball)) {
    // Reverse the Y velocity to simulate bounce
    let vel = ball.velocity;
    let newVelX = random(-5, 5); // Add randomness to horizontal bounce
    let newVelY = -Math.abs(vel.y) * 1.2; // Increase upward bounce speed
    Body.setVelocity(ball, { x: vel.x + newVelX, y: newVelY });
  }
}

function keepBallInBounds() {
  let pos = ball.position;
  let vel = ball.velocity;

  // Prevent the ball from going out of the left or right bounds
  if (pos.x - 20 < 0) {
    Body.setVelocity(ball, { x: Math.abs(vel.x), y: vel.y });
  } else if (pos.x + 20 > width) {
    Body.setVelocity(ball, { x: -Math.abs(vel.x), y: vel.y });
  }

  // Prevent the ball from going above the screen
  if (pos.y - 20 < 0) {
    Body.setVelocity(ball, { x: vel.x, y: Math.abs(vel.y) });
  }
}

function checkOutOfBounds() {
  if (ball.position.y > height + 20) {
    // Reset the game if the ball falls below the screen
    setupGame();
  }
}

//---------------------------------------------------------
class Bridge {
  constructor(radius) {
    this.radius = radius; // Radius of the "raqueta"
    this.particles = [];

    // Create two particles representing the ends of the "raqueta"
    let thumbParticle = Bodies.circle(width / 2 - 50, height / 2, this.radius, { isStatic: false });
    let indexParticle = Bodies.circle(width / 2 + 50, height / 2, this.radius, { isStatic: false });

    this.particles.push(thumbParticle, indexParticle);

    // Add particles to the world
    Composite.add(engine.world, this.particles);
  }

  setToHandPoints() {
    if (hands.length > 0) {
      // Get the positions of the thumb and index finger
      let thumbx = hands[0].keypoints[THUMB_TIP].x;
      let thumby = hands[0].keypoints[THUMB_TIP].y;
      let indexx = hands[0].keypoints[INDEX_FINGER_TIP].x;
      let indexy = hands[0].keypoints[INDEX_FINGER_TIP].y;

      // Move the particles to the detected positions
      Body.setPosition(this.particles[0], { x: thumbx, y: thumby });
      Body.setPosition(this.particles[1], { x: indexx, y: indexy });
    }
  }

  isBallTouchingLine(ball) {
    let ballPos = ball.position;

    // Get the positions of the particles
    let thumb = this.particles[0].position;
    let index = this.particles[1].position;

    // Calculate the vector of the line and the vector from the thumb to the ball
    let lineVec = { x: index.x - thumb.x, y: index.y - thumb.y };
    let ballVec = { x: ballPos.x - thumb.x, y: ballPos.y - thumb.y };

    // Length of the line
    let lineLength = Math.sqrt(lineVec.x ** 2 + lineVec.y ** 2);

    // Projection of the ball's position onto the line
    let dotProduct = (ballVec.x * lineVec.x + ballVec.y * lineVec.y) / lineLength;
    let projection = {
      x: thumb.x + (dotProduct / lineLength) * lineVec.x,
      y: thumb.y + (dotProduct / lineLength) * lineVec.y,
    };

    // Check if the projection is within the line segment
    let withinSegment = dotProduct >= 0 && dotProduct <= lineLength;

    // Calculate the perpendicular distance from the ball to the line
    let distToLine = Math.sqrt(
      (ballPos.x - projection.x) ** 2 + (ballPos.y - projection.y) ** 2
    );

    // Check if the ball is close enough to the line
    return withinSegment && distToLine <= this.radius + 20; // 20 is an adjustable margin
  }

  show() {
    fill(80);
    stroke(0);

    // Draw the particles
    for (let particle of this.particles) {
      push();
      translate(particle.position.x, particle.position.y);
      circle(0, 0, this.radius * 2);
      pop();
    }

    // Draw the line
    stroke(0);
    strokeWeight(2);
    line(
      this.particles[0].position.x,
      this.particles[0].position.y,
      this.particles[1].position.x,
      this.particles[1].position.y
    );
  }
}

