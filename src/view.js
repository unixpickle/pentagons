var ELEMENT_ID = 'pentagon-background'

// CanvasView is an abstract subclass for a view that draws everything into a
// canvas.
function CanvasView() {
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

  this._width = 0;
  this._height = 0;
  this._updateSize();

  window.addEventListener('resize', this._handleResize.bind(this));
}

CanvasView.prototype.draw = function() {
  throw new Error('override this in a subclass');
};

CanvasView.prototype.start = function() {
  this._tick();
};

CanvasView.prototype._handleResize = function() {
  this._updateSize();
  this.draw();
};

CanvasView.prototype._requestAnimationFrame = function() {
  setTimeout(this._tick.bind(this), 1000/24);
};

CanvasView.prototype._tick = function() {
  this.draw();
  this._requestAnimationFrame();
};

CanvasView.prototype._updateSize = function() {
  this._width = window.innerWidth;
  this._height = window.innerHeight;
  this._canvas.width = this._width;
  this._canvas.height = this._height;
};

// CanvasDrawView is a subclass of CanvasView that re-draws the pentagons in
// each frame using a path.
function CanvasDrawView() {
  CanvasView.call(this);
  this.start();
}

CanvasDrawView.prototype = Object.create(CanvasView.prototype);

CanvasDrawView.prototype.draw = function() {
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

    var centerX = frame.x*size + xOffset;
    var centerY = frame.y*size + yOffset;
    var radius = size * frame.radius;

    context.fillStyle = 'rgba(255, 255, 255,' + frame.opacity.toPrecision(5) +
      ')';
    context.beginPath();
    for (var j = 0; j < 5; ++j) {
      var x = Math.cos(frame.rotation + j*Math.PI*2/5)*radius + centerX;
      var y = Math.sin(frame.rotation + j*Math.PI*2/5)*radius + centerY;
      if (j === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();
    context.fill();
  }
};

// CanvasImageView is a subclass of CanvasView that pre-generates an image of a
// pentagon and then scales/rotates/translates that image.
function CanvasImageView() {
  CanvasView.call(this);

  this._imageSize = 0;
  this._imageCache = {};
  this.start();
}

CanvasImageView.prototype = Object.create(CanvasView.prototype);

CanvasImageView.prototype.draw = function() {
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
    var radius = size * frame.radius;

    context.globalAlpha = frame.opacity;
    context.translate(translateX, translateY);
    context.rotate(frame.rotation);
    context.drawImage(image, -radius, -radius, radius*2, radius*2);
    // NOTE: save()/reset() are apparentlty slow, although this is mainly a
    // premature optimization.
    context.rotate(-frame.rotation);
    context.translate(-translateX, -translateY);
  }
};

CanvasImageView.prototype._pentagonImage = function() {
  this._updateImageSize();
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

CanvasImageView.prototype._updateImageSize = function() {
  var maxRadius = Math.max(this._width, this._height) * Pentagon.MAX_RADIUS;
  var maxRadiusLog = Math.ceil(Math.log(maxRadius) / Math.log(2));
  var imageSize = Math.pow(2, 1+maxRadiusLog);
  if (imageSize === this._imageSize) {
    return;
  }
  this._imageSize = imageSize;
};

function makeAbsoluteAndFullScreen(element) {
  element.style.position = 'fixed';
  element.style.top = 0;
  element.style.left = 0;
  element.style.width = '100%';
  element.style.height = '100%';
}
