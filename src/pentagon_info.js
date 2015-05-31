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
