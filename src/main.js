window.addEventListener('load', function() {
  generatePentagons();
  
  // I found that CanvasDrawView was faster in Firefox but CanvasImageView was
  // faster in Chrome and Safari.
  if (navigator.userAgent.indexOf('Firefox') !== -1) {
    new CanvasDrawView();
  } else {
    new CanvasImageView();
  }
});
