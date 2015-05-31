function PentagonView() {
  this._element = document.createElement('div');
  this._pentagonElements = [];
  for (var i = 0, len = Pentagon.allPentagons.length; i < len; ++i) {
    var element = document.createElement('img');
    element.style.display = 'block';
    element.style.position = 'fixed';
    element.style.left = 0;
    element.style.top = 0;
    this._pentagonElements[i] = element;
    this._element.appendChild(element);
  }
  this._imageSize = 0;
  this._width = window.innerWidth;
  this._height = window.innerHeight;
  this._updateImage();

  document.body.insertBefore(this._element, document.body.childNodes[0] ||
    null);
  window.addEventListener('resize', this._updateAll.bind(this));
}

PentagonView.prototype._updateAll = function() {
  this._updateSize();
  this._updateImage();
};

PentagonView.prototype._updateImage = function() {
  var maxRadius = Math.max(this._width, this._height) * Pentagon.MAX_RADIUS;
  var maxRadiusLog = Math.ceil(Math.log(maxRadius) / Math.log(2));
  var imageSize = Math.pow(2, 1+maxRadiusLog);

  if (imageSize === this._imageSize) {
    return;
  }
  this._imageSize = imageSize;

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
  for (var i = 0, len = this._pentagonElements.length; i < len; ++i) {
    this._pentagonElements[i].src = imageData;
  }
};

PentagonView.prototype._updateSize = function() {
  this._width = window.innerWidth;
  this._height = window.innerHeight;
};
