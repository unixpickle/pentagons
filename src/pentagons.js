var PENTAGON_COUNT = 18;

function Pentagon() {
  var start = new PentagonInfo({
    radius: randomRadius(),
    opacity: randomOpacity(),
    x: Math.random(),
    y: Math.random(),
    rotation: Math.random() * Math.PI * 2
  });
  this._currentAnimation = new Animation(start, start, 1);
  this._lastFrame = start;
}

Pentagon.allPentagons = [];

Pentagon.prototype.frame = function() {
  var frame = this._currentAnimation.frame().clampedAngle();
  this._lastFrame = frame;
  if (this._currentAnimation.isDone()) {
    this._generateNewAnimation();
  }
  return frame;
};

Pentagon.prototype._generateNewAnimation = function(animation) {
  var info = new PentagonInfo({
    x: this._gravityCoord('x'),
    y: this._gravityCoord('y'),
    radius: randomRadius(),
    opacity: randomOpacity(),
    rotation: Math.PI*(Math.random()-0.5) + this._lastFrame.rotation
  });
  this._currentAnimation = new Animation(this._lastFrame, info,
    randomDuration());
};

Pentagon.prototype._gravityCoord = function(axis) {
  var axisCoord = this._lastFrame[axis];

  // Apply inverse-square forces from edges.
  var force = 1/Math.pow(axisCoord+0.01, 2) - 1/Math.pow(1.01-axisCoord, 2);

  // Apply inverse-square forces from other pentagons.
  for (var i = 0, len = Pentagon.allPentagons.length; i < len; ++i) {
    var pentagon = Pentagon.allPentagons[i];
    if (pentagon === this) {
      continue;
    }
    var d2 = PentagonInfo.distanceSquared(this._lastFrame, pentagon._lastFrame);
    if (Math.abs(d2) < 0.00001) {
      return Math.random();
    }
    var forceMag = 1 / d2;
    var distance = Math.sqrt(d2);
    force -= forceMag * (pentagon._lastFrame[axis] - axisCoord) / distance;
  }

  // Add a random component to the force.
  force += (Math.random - 0.5) * 20;

  // Cap the force at +/- 0.2 and add it to the current coordinate.
  force = Math.max(Math.min(force, 100), -100) / 500;
  return Math.max(Math.min(axisCoord+force, 1), 0);
};

function generatePentagons() {
  for (var i = 0; i < PENTAGON_COUNT; ++i) {
    Pentagon.allPentagons.push(new Pentagon());
  }
}

function randomDuration() {
  return 30 + 30*Math.random();
}

function randomOpacity() {
  return Math.random()*0.22 + 0.02;
}

function randomRadius() {
  return 0.05 + (Math.pow(Math.random(), 15)+1)*0.075;
}
