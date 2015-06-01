var ELEMENT_ID = 'pentagon-background'

function PentagonView() {
  this._element = document.getElementById(ELEMENT_ID);
  if (!this._element) {
    this._element = document.createElement('div');
    this._element.id = ELEMENT_ID;
  }

  this._pentagonElements = [];
  for (var i = 0, len = Pentagon.allPentagons.length; i < len; ++i) {
    var element = document.createElement('img');
    element.style.display = 'block';
    element.style.position = 'fixed';
    element.style.left = 0;
    element.style.top = 0;
    element.style.opacity = 0;
    this._pentagonElements[i] = element;
    this._element.appendChild(element);
  }
  this._imageSize = 0;
  this._width = window.innerWidth;
  this._height = window.innerHeight;
  this._imageCache = {};
  this._updateImage();

  if (!this._element.parentNode) {
    document.body.insertBefore(this._element, document.body.childNodes[0] ||
      null);
  }
  window.addEventListener('resize', this._updateAll.bind(this));
  this._requestAnimationFrame();
}

PentagonView.prototype._computeImageData = function() {
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

  var imageData = canvas.toDataURL('image/png');
  this._imageCache['' + imageSize] = imageData;
  return imageData;
};

PentagonView.prototype._layoutPentagons = function() {
  var xOffset = 0;
  var yOffset = 0;
  var size = Math.max(this._width, this._height);
  if (this._width < this._height) {
    xOffset = -(this._height - this._width) / 2;
  } else {
    yOffset = -(this._width - this._height) / 2;
  }
  for (var i = 0, len = this._pentagonElements.length; i < len; ++i) {
    var frame = Pentagon.allPentagons[i].frame();
    var element = this._pentagonElements[i];

    var translateX = frame.x*size - this._imageSize/2 + xOffset;
    var translateY = frame.y*size - this._imageSize/2 + yOffset;
    var angle = frame.rotation * 180 / Math.PI;
    var scale = 2 * size * frame.radius / this._imageSize;

    var transform = 'translate(' + translateX.toPrecision(5) + 'px, ' +
      translateY.toPrecision(5) + 'px) rotate(' + angle.toPrecision(5) +
      'deg) scale(' + scale.toPrecision(5) + ', ' + scale.toPrecision(5) + ')';
    element.style.opacity = frame.opacity;
    element.style.transform = transform;
    element.style.webkitTransform = transform;
    element.style.MozTransform = transform;
    element.style.msTransform = transform;
  }
};

PentagonView.prototype._requestAnimationFrame = function() {
  setTimeout(this._tick.bind(this), 1000/24);
};

PentagonView.prototype._tick = function() {
  this._layoutPentagons();
  this._requestAnimationFrame();
};

PentagonView.prototype._updateAll = function() {
  this._updateSize();
  this._updateImage();
  this._layoutPentagons();
};

PentagonView.prototype._updateImage = function() {
  var maxRadius = Math.max(this._width, this._height) * Pentagon.MAX_RADIUS;
  var maxRadiusLog = Math.ceil(Math.log(maxRadius) / Math.log(2));
  var imageSize = Math.pow(2, 1+maxRadiusLog);
  if (imageSize === this._imageSize) {
    return;
  }
  this._imageSize = imageSize;

  var imageData = this._computeImageData();
  for (var i = 0, len = this._pentagonElements.length; i < len; ++i) {
    this._pentagonElements[i].src = imageData;
  }
};

PentagonView.prototype._updateSize = function() {
  this._width = window.innerWidth;
  this._height = window.innerHeight;
};
