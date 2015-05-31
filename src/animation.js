function Animation(startInfo, endInfo, durationMilliseconds) {
  this._startInfo = startInfo;
  this._endInfo = endInfo;
  this._startEndDifference = PentagonInfo.difference(endInfo, startInfo);
  this._duration = durationMilliseconds;
  this._startTime = unixMillisecondTime();
  this._isDone = false;
}

Animation.prototype.frame = function() {
  var fraction = this._elapsed() / this._duration;
  if (fraction >= 1) {
    this._isDone = true;
    return this._endInfo;
  }
  return PentagonInfo.sum(this._startEndDifference.scale(fraction),
    this._startInfo);
};

Animation.prototype.isDone = function() {
  return this._isDone;
};

Animation.prototype._elapsed = function() {
  return Math.max(unixMillisecondTime()-this._startTime, 0);
};

function unixMillisecondTime() {
  return new Date().getTime();
}
