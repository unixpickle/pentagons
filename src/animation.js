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
