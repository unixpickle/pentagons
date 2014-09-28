part of pentagons;

/**
 * A "view" which draws moving pentagons into a canvas.
 */
class PentagonsView {
  /**
   * The canvas which this view draws into.
   */
  final CanvasElement canvas;
  
  /**
   * The RGB color components of the pentagons.
   * 
   * Each component ranges from 0 to 255 (inclusive).
   */
  List<int> pentagonsColor;
  
  final List<_FluidPentagon> _fluidPentagons = [];
  CanvasRenderingContext2D _context;
  
  /**
   * Create a [PentagonsView] that draws [count] pentagons into a [canvas].
   */
  PentagonsView(this.canvas, int count, {this.pentagonsColor: null}) {
    if (pentagonsColor == null) {
      pentagonsColor = [255, 255, 255];
    }
    _context = canvas.getContext('2d');
    var r = new Random();
    for (int i = 0; i < count; ++i) {
      _fluidPentagons.add(new _FluidPentagon(r, this));
    }
  }
  
  /**
   * If you resize the canvas element, you should call this method before you
   * call [draw].
   */
  void updateContext() {
    _context = canvas.getContext('2d');
    _context.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  /**
   * Draw the next frame and perform an animation step.
   */
  void draw() {
    _context.clearRect(0, 0, canvas.width, canvas.height);
    double size = (canvas.width > canvas.height ? canvas.width :
                   canvas.height).toDouble();
    var colorStr = '${pentagonsColor[0]}, ${pentagonsColor[1]}, '
         '${pentagonsColor[2]}';
    for (_FluidPentagon p in _fluidPentagons) {
      p.nextFrame().fill(_context, size, colorStr);
    }
  }
}
