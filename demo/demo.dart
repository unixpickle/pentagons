import 'package:pentagons/pentagons.dart';
import 'dart:html';

CanvasElement canvas;
PentagonsView view;

void main() {
  canvas = querySelector('#canvas');
  canvas..width = window.innerWidth..height = window.innerHeight;
  view = new PentagonsView(canvas, 15);
  drawNextFrame(null);
  window.onResize.listen((_) {
    canvas..width = window.innerWidth..height = window.innerHeight;
    view.updateContext();
  });
}

void drawNextFrame(_) {
  view.draw();
  window.animationFrame.then(drawNextFrame);
}
