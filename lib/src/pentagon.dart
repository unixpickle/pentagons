part of pentagons;

class _Pentagon {
  final Float32x4 positionalSize;
  final double opacity;
  
  double get x => positionalSize.x;
  double get y => positionalSize.y;
  double get rotation => positionalSize.z;
  double get radius => positionalSize.w;
  
  static double randomRadius(Random r) {
    var first = pow(r.nextDouble(), 15) + 1.0;
    return 0.05 + first * 0.075;
  }
  
  static double randomOpacity(Random r) {
    return max(min((r.nextDouble() - 0.1) * 0.22, 0.22), 0.0);
  }
  
  static double closeRotation(Random r, double start) {
    return start + (r.nextDouble() - 0.5) * PI;
  }
  
  static double cappedAngle(double angle) {
    while (angle < 0) angle += PI * 2;
    while (angle > PI * 2) angle -= PI * 2;
    return angle;
  }
  
  /**
   * Use various gravity-based tactics and inverse square voodoo in conjunction
   * with some random number magic to generate a new coordinate for a pentagon.
   * 
   * The weird argument, [getter], exists so you can use this method both for
   * the *x* and the *y* component of a pentagon. See [gravityXValue] and
   * [gravityYValue] to see why this is so.
   */
  static double componentValue(Random r, _Pentagon current,
                               List<_Pentagon> others, Function getter) {
    double force = 0.0;
    double myVal = getter(current);
    
    // apply inverse square forces from edges (just for kicks)
    force = (1 / pow(myVal, 2)) - (1 / pow(1 - myVal, 2));
    
    // apply inverse square forces from pentagons
    for (var p in others) {
      double distSquared = pow(p.x - current.x, 2) + pow(p.y - current.y, 2);
      double forceMag = 1 / distSquared;
      double distance = sqrt(distSquared);
      force -= forceMag * (getter(p) - myVal) / distance;
    }
    
    force += (r.nextDouble() - 0.5) * 20;
    
    force = max(min(force, 100.0), -100.0) / 500.0;
    return max(min(myVal + force, 1.0), 0.0);
  }
  
  /**
   * Generate a new *x* component.
   */
  static double gravityXValue(Random r, _Pentagon current,
                                List<_Pentagon> others) {
    return componentValue(r, current, others, (a) => a.x);
  }
  
  /**
   * Generate a new *y* component.
   */
  static double gravityYValue(Random r, _Pentagon current,
                                List<_Pentagon> others) {
    return componentValue(r, current, others, (a) => a.y);
  }
  
  _Pentagon(double _x, double _y, double _rotation, double _radius,
            this.opacity)
      : positionalSize = new Float32x4(_x, _y, _rotation, _radius);
  
  _Pentagon.raw(this.positionalSize, this.opacity);
  
  _Pentagon.random(Random r)
      : opacity = randomOpacity(r),
        positionalSize = new Float32x4(r.nextDouble(), r.nextDouble(),
                                       r.nextDouble() * 2 * PI,
                                       randomRadius(r));
  
  _Pentagon.gravity(Random r, _Pentagon current, List<_Pentagon> others)
      : opacity = randomOpacity(r),
        positionalSize = new Float32x4(gravityXValue(r, current, others),
                                       gravityYValue(r, current, others),
                                       closeRotation(r, current.rotation),
                                       randomRadius(r));
  
  _Pentagon.capAngle(_Pentagon p)
      : opacity = p.opacity,
        positionalSize = p.positionalSize.withZ(cappedAngle(p.rotation));
  
  _Pentagon operator +(_Pentagon p) {
    return new _Pentagon.raw(positionalSize + p.positionalSize,
                             opacity + p.opacity);
  }
  
  _Pentagon operator -(_Pentagon p) {
    return new _Pentagon.raw(positionalSize - p.positionalSize,
                             opacity - p.opacity);
  }
  
  _Pentagon operator *(double value) {
    return new _Pentagon.raw(positionalSize.scale(value), opacity * value);
  }
  
  _Pentagon operator /(double value) {
    return this * (1 / value);
  }
  
  void fill(CanvasRenderingContext2D context, double size, String color) {
    context.fillStyle = "rgba($color, $opacity)";
    context.beginPath();
    for (int i = 0; i < 5; i++) {
      double ang = rotation + i.toDouble() * PI * 2 / 5.0;
      if (i == 0) {
        context.moveTo((x + cos(ang) * radius) * size,
            (y + sin(ang) * radius) * size);
      } else {
        context.lineTo((x + cos(ang) * radius) * size,
            (y + sin(ang) * radius) * size);
      }
    }
    context.closePath();
    context.fill();
  }
  
  String toString() => 'Pentagon(x=$x, y=$y, radius=$radius, opacity=$opacity,'
      ' rotation=$rotation';
}
