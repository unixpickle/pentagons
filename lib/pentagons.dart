/**
 * A simple way to add a casual sense of freedom to any webpage.
 * 
 * With **pentagons**, you can easily turn any canvas into a dynamically moving
 * cluster of pentagons. The pentagons rotate, scale, and translate in a
 * semi-random way. In fact, the pentagons move with an algorithm that attempts
 * to prevent them from making "ugly" formations.
 * 
 * You can create a [PentagonsView] and dynamically update it as follows:
 * 
 *     import 'package:pentagons/pentagons.dart';
 *     CanvasElement canvas;
 *     PentagonsView view;
 *     
 *     void main() {
 *       canvas = querySelector('#canvas');
 *       canvas..width = window.innerWidth..height = window.innerHeight;
 *       view = new PentagonsView(canvas, 15);
 *       drawNextFrame(null);
 *     }
 *     
 *     void drawNextFrame(_) {
 *       view.draw();
 *       window.animationFrame.then(drawNextFrame);
 *     }
 * 
 * This example creates a new [PentagonsView] which will draw 15 pentagons on a
 * canvas named "#canvas".
 * 
 * Of course, this example does not handle window resizing. To fix this, add
 * the following code to your main() function:
 *
 *     window.onResize.listen((_) {
 *       canvas..width = window.innerWidth..height = window.innerHeight;
 *       view.updateContext();
 *     });
 * 
 * This way, the view will be alerted when the canvas has resized and will get
 * a new 2D rendering context internally.
 */
library pentagons;

import 'dart:html';
import 'dart:math';
import 'dart:typed_data';

part 'src/animation.dart';
part 'src/pentagon.dart';
part 'src/fluid_pentagon.dart';
part 'src/pentagons_view.dart';
