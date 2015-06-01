// pentagons version 0.1.0
//
// Copyright (c) 2014-2015, Alex Nichol and Jonathan Loeb.
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer. 
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
(function() {

  // These variables are used to take long pauses (i.e. garbage collection
  // pauses, etc.) and turn them into short pauses.
  var LAG_SMOOTH_THRESHOLD = 500;
  var LAG_SMOOTH_ADJUSTED = 50;

  function Animation(startInfo, endInfo, durationMilliseconds) {
    this._startInfo = startInfo;
    this._endInfo = endInfo;
    this._startEndDifference = PentagonInfo.difference(endInfo, startInfo);
    this._duration = durationMilliseconds;
    this._startTime = unixMillisecondTime();
    this._lastFrameTime = this._startTime;
    this._isDone = false;
  }

  Animation.prototype.frame = function() {
    if (this._duration === 0) {
      this._isDone = true;
      return this._endInfo;
    }

    var fraction = this._elapsed() / this._duration;
    if (fraction >= 1) {
      this._isDone = true;
      return this._endInfo;
    }
    return PentagonInfo.sum(this._startEndDifference.scaled(fraction),
      this._startInfo);
  };

  Animation.prototype.isDone = function() {
    return this._isDone;
  };

  Animation.prototype._elapsed = function() {
    var now = unixMillisecondTime();
    if (now < this._lastFrameTime) {
      // This may occur if the user sets back their clock.
      this._startTime = now;
    } else if (this._lastFrameTime + LAG_SMOOTH_THRESHOLD <= now) {
      this._startTime += (now - this._lastFrameTime) - LAG_SMOOTH_ADJUSTED;
    }
    this._lastFrameTime = now;
    return Math.max(now-this._startTime, 0);
  };

  function unixMillisecondTime() {
    return new Date().getTime();
  }
  window.addEventListener('load', function() {
    generatePentagons();
    new PentagonView();
  });
  function PentagonInfo(fields) {
    this.x = fields.x;
    this.y = fields.y;
    this.radius = fields.radius;
    this.rotation = fields.rotation;
    this.opacity = fields.opacity;
  }

  PentagonInfo.difference = function(info1, info2) {
    return PentagonInfo.sum(info1, info2.scaled(-1));
  };

  PentagonInfo.distanceSquared = function(info1, info2) {
    return Math.pow(info1.x-info2.x, 2) + Math.pow(info1.y-info2.y, 2);
  };

  PentagonInfo.sum = function(info1, info2) {
    return new PentagonInfo({
      x: info1.x + info2.x,
      y: info1.y + info2.y,
      radius: info1.radius + info2.radius,
      rotation: info1.rotation + info2.rotation,
      opacity: info1.opacity + info2.opacity
    });
  };

  PentagonInfo.prototype.clampedAngle = function() {
    var rotation = this.rotation % (Math.PI * 2);
    if (rotation < 0) {
      rotation += Math.PI * 2;
    }
    var result = new PentagonInfo(this);
    result.rotation = rotation;
    return result;
  };

  PentagonInfo.prototype.scaled = function(scaler) {
    return new PentagonInfo({
      x: this.x * scaler,
      y: this.y * scaler,
      radius: this.radius * scaler,
      rotation: this.rotation * scaler,
      opacity: this.opacity * scaler
    });
  };
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

  Pentagon.MAX_RADIUS = 0.2;

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
    force += (Math.random() - 0.5) * 20;

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
    return 30000 + 30000*Math.random();
  }

  function randomOpacity() {
    return Math.random()*0.22 + 0.02;
  }

  function randomRadius() {
    return 0.05 + (Math.pow(Math.random(), 15)+1)*0.075;
  }
  var ELEMENT_ID = 'pentagon-background'

  function PentagonView() {
    this._canvas = document.createElement('canvas');
    this._element = document.getElementById(ELEMENT_ID);
    if (!this._element) {
      this._element = document.createElement('div');
      this._element.id = ELEMENT_ID;
      document.body.insertBefore(this._element, document.body.childNodes[0] ||
        null);
    }

    makeAbsoluteAndFullScreen(this._element);
    makeAbsoluteAndFullScreen(this._canvas);

    this._element.appendChild(this._canvas);

    this._imageSize = 0;
    this._imageCache = {};
    this._width = 0;
    this._height = 0;
    this._updateSize();
    this._updateImage();

    window.addEventListener('resize', this._updateAll.bind(this));
    this._tick();
  }

  PentagonView.prototype._drawPentagons = function() {
    var image = this._pentagonImage();
    var context = this._canvas.getContext('2d');

    context.clearRect(0, 0, this._width, this._height);

    var size = Math.max(this._width, this._height);
    var xOffset = 0;
    var yOffset = 0;
    if (this._width < this._height) {
      xOffset = -(this._height - this._width) / 2;
    } else {
      yOffset = -(this._width - this._height) / 2;
    }

    for (var i = 0, len = Pentagon.allPentagons.length; i < len; ++i) {
      var frame = Pentagon.allPentagons[i].frame();

      var translateX = frame.x*size + xOffset;
      var translateY = frame.y*size + yOffset;
      var scale = 2 * size * frame.radius / this._imageSize;

      context.globalAlpha = frame.opacity;
      context.translate(translateX, translateY);
      context.rotate(frame.rotation);
      context.scale(scale, scale);
      context.translate(-this._imageSize/2, -this._imageSize/2);1
      context.drawImage(image, 0, 0);
      // NOTE: save()/reset() are apparentlty slow, although this is mainly a
      // premature optimization.
      context.translate(this._imageSize/2, this._imageSize/2);1
      context.scale(1/scale, 1/scale);
      context.rotate(-frame.rotation);
      context.translate(-translateX, -translateY);
    }
  };

  PentagonView.prototype._pentagonImage = function() {
    var imageSize = this._imageSize;

    if (this._imageCache.hasOwnProperty('' + imageSize)) {
      return this._imageCache['' + imageSize];
    }

    var canvas = document.createElement('canvas');
    canvas.width = imageSize;
    canvas.height = imageSize;

    var context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.beginPath();
    for (var angle = 0; angle < 360; angle += 360/5) {
      var x = Math.cos(angle * Math.PI / 180)*imageSize/2 + imageSize/2;
      var y = Math.sin(angle * Math.PI / 180)*imageSize/2 + imageSize/2;
      if (angle === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();
    context.fill();

    var image = document.createElement('img');
    image.src = canvas.toDataURL('image/png');
    this._imageCache['' + imageSize] = image;
    return image;
  };

  PentagonView.prototype._requestAnimationFrame = function() {
    setTimeout(this._tick.bind(this), 1000/24);
  };

  PentagonView.prototype._tick = function() {
    this._drawPentagons();
    this._requestAnimationFrame();
  };

  PentagonView.prototype._updateAll = function() {
    this._updateSize();
    this._updateImage();
    this._drawPentagons();
  };

  PentagonView.prototype._updateImage = function() {
    var maxRadius = Math.max(this._width, this._height) * Pentagon.MAX_RADIUS;
    var maxRadiusLog = Math.ceil(Math.log(maxRadius) / Math.log(2));
    var imageSize = Math.pow(2, 1+maxRadiusLog);
    if (imageSize === this._imageSize) {
      return;
    }
    this._imageSize = imageSize;
  };

  PentagonView.prototype._updateSize = function() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._canvas.width = this._width;
    this._canvas.height = this._height;
  };

  function makeAbsoluteAndFullScreen(element) {
    element.style.position = 'fixed';
    element.style.top = 0;
    element.style.left = 0;
    element.style.width = '100%';
    element.style.height = '100%';
  }

})();
