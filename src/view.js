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
