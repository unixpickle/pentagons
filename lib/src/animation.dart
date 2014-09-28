part of pentagons;

class _Animation {
  /**
   * The start date of the animation.
   */
  final DateTime start;
  
  /**
   * The duration of the animation.
   */
  final double duration;
  
  /**
   * The initial state of the pentagon controlled by the animation.
   */
  final _Pentagon startPentagon;
  
  /**
   * The final state of the pentagon controlled by the animation.
   */
  final _Pentagon endPentagon;
  
  /**
   * `true` if the animation has been running for at least [duration] seconds.
   */
  bool get isDone {
    return (new DateTime.now().difference(start).inMilliseconds / 1000) >=
        duration;
  }
  
  /**
   * Generate a new animation that will act on a given pentagon in a
   * "gravitational" way.
   */
  _Animation(Random r, _Pentagon startPentagon, List<_Pentagon> others)
      : start = new DateTime.now(),
        startPentagon = startPentagon,
        endPentagon = new _Pentagon.gravity(r, startPentagon, others),
        duration = 30.0 + r.nextDouble() * 30.0;
  
  /**
   * Create a zero-second animation which does nothing.
   */
  _Animation.identity(_Pentagon start)
      : startPentagon = start,
        endPentagon = start,
        duration = 0.0,
        start = new DateTime.now();
  
  /**
   * Generate the pentagon which represents the current mixture of
   * [startPentagon] and [endPentagon].
   */
  _Pentagon intermediatePentagon() {
    double diff = new DateTime.now().difference(start).inMilliseconds / 1000;
    double percent = max(min(diff / duration, 1.0), 0.0);
    return startPentagon + (endPentagon - startPentagon) * percent;
  }
}
