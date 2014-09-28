part of pentagons;

/**
 * Represents an animating pentagon.
 */
class _FluidPentagon {
  final PentagonsView view;
  _Animation currentAnimation;
  
  _FluidPentagon(Random r, this.view) {
    currentAnimation = new _Animation.identity(new _Pentagon.random(r));
  }
  
  _Pentagon nextFrame() {
    var result = currentAnimation.intermediatePentagon();
    if (currentAnimation.isDone) {
      var capped = new _Pentagon.capAngle(currentAnimation.endPentagon);
      currentAnimation = new _Animation(new Random(), capped, others());
    }
    return result;
  }
  
  List<_Pentagon> others() {
    var result = [];
    for (_FluidPentagon p in view._fluidPentagons) {
      if (p == this) continue;
      result.add(p.currentAnimation.intermediatePentagon());
    }
    return result;
  }
}
