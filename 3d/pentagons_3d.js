(function () {

  const MIN_Z = -17;
  const MAX_Z = -10;
  const MIN_OPACITY = 0.3;
  const MAX_OPACITY = 0.6;

  class PentagonState {
    constructor(x, y, z, size, opacity, angle1, angle2, angle3) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.size = size;
      this.opacity = opacity;
      this.angle1 = angle1;
      this.angle2 = angle2;
      this.angle3 = angle3;
    }

    static random() {
      const newZ = Math.random() * (MAX_Z - MIN_Z) + MIN_Z;
      const randCoord = () => (Math.random() * 2 - 1) * newZ;
      return new PentagonState(
        randCoord(),
        randCoord(),
        newZ,
        Math.random() + 0.5,
        Math.random() * (MAX_OPACITY - MIN_OPACITY) + MIN_OPACITY,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
      );
    }

    clone() {
      return new PentagonState(this.x, this.y, this.z, this.size, this.opacity, this.angle1,
        this.angle2, this.angle3);
    }

    scale(scale) {
      this.x *= scale;
      this.y *= scale;
      this.z *= scale;
      this.size *= scale;
      this.opacity *= scale;
      this.angle1 *= scale;
      this.angle2 *= scale;
      this.angle3 *= scale;
      return this;
    }

    add(state) {
      this.x += state.x;
      this.y += state.y;
      this.z += state.z;
      this.size += state.size;
      this.opacity += state.opacity;
      this.angle1 += state.angle1;
      this.angle2 += state.angle2;
      this.angle3 += state.angle3;
      return this;
    }
  }

  class Transition {
    constructor(state1, state2, duration) {
      this.state1 = state1;
      this.state2 = state2;
      this.duration = duration;
      this.start = performance.now();
    }

    static random(pentagons, pentagon) {
      return new Transition(
        pentagon.getState(),
        PentagonState.random(),
        1000 * (Math.random() * 30 + 30),
      );
    }

    frame() {
      const frac = (performance.now() - this.start) / this.duration;
      if (frac >= 1) {
        return this.state2;
      }
      return this.state1.clone().scale(1 - frac).add(this.state2.clone().scale(frac));
    }

    done() {
      return performance.now() - this.start >= this.duration;
    }
  }

  class Pentagon {
    constructor() {
      this.material = new THREE.MeshPhongMaterial({
        color: 0x777777,
        flatShading: true,
        blending: THREE.AddBlending,
        emissive: 0x888888,
      });
      this.material.transparent = true;
      this.object = this._createDodecahedron();
    }

    getState() {
      return new PentagonState(
        this.object.position.x,
        this.object.position.y,
        this.object.position.z,
        this.object.scale.x,
        this.material.opacity,
        this.object.rotation.x,
        this.object.rotation.y,
        this.object.rotation.z,
      );
    }

    setState(state) {
      this.object.scale.set(state.size, state.size, state.size);
      this.object.position.set(state.x, state.y, state.z);
      this.object.rotation.set(state.angle1, state.angle2, state.angle3);
      this.material.opacity = state.opacity;
    }

    _createDodecahedron() {
      const geometry = new THREE.Geometry();
      geometry.vertices.push(
        new THREE.Vector3(0.467553, -0.210489, 1.305761),
        new THREE.Vector3(-0.378692, 0.322582, 1.310278),
        new THREE.Vector3(-0.226795, 1.148332, 0.768874),
        new THREE.Vector3(0.713188, 1.127193, 0.428504),
        new THREE.Vector3(1.142373, 0.286016, 0.759570),
        new THREE.Vector3(0.679612, 1.080934, -0.571656),
        new THREE.Vector3(-0.281712, 1.076166, -0.845973),
        new THREE.Vector3(-0.841348, 1.117167, -0.019519),
        new THREE.Vector3(-1.373494, 0.272495, 0.036652),
        new THREE.Vector3(-1.087336, -0.218731, 0.858488),
        new THREE.Vector3(-0.679414, -1.085204, 0.574421),
        new THREE.Vector3(0.282197, -1.080709, 0.850958),
        new THREE.Vector3(0.842117, -1.122313, 0.023682),
        new THREE.Vector3(1.373724, -0.277053, -0.032478),
        new THREE.Vector3(1.087909, 0.213780, -0.855100),
        new THREE.Vector3(-1.141584, -0.290661, -0.757190),
        new THREE.Vector3(-0.712992, -1.130675, -0.424622),
        new THREE.Vector3(0.227379, -1.154183, -0.764205),
        new THREE.Vector3(0.379231, -0.327682, -1.307044),
        new THREE.Vector3(-0.466758, 0.206038, -1.302103),
      );
      const pentagons = [
        [0, 1, 2, 3, 4],
        [4, 3, 5, 14, 13],
        [3, 2, 7, 6, 5],
        [2, 1, 9, 8, 7],
        [1, 0, 11, 10, 9],
        [0, 4, 13, 12, 11],
        [8, 9, 10, 16, 15],
        [10, 11, 12, 17, 16],
        [12, 13, 14, 18, 17],
        [14, 5, 6, 19, 18],
        [6, 7, 8, 15, 19],
        [15, 16, 17, 18, 19],
      ];
      pentagons.forEach((pentagon) => {
        geometry.faces.push(
          new THREE.Face3(pentagon[0], pentagon[1], pentagon[3]),
          new THREE.Face3(pentagon[1], pentagon[2], pentagon[3]),
          new THREE.Face3(pentagon[3], pentagon[4], pentagon[0]),
        );
      });
      return new THREE.Mesh(geometry, this.material);
    }
  }

  class Pentagons {
    constructor(numPentagons) {
      this.pentagons = [];
      this.transitions = [];
      for (let i = 0; i < numPentagons; ++i) {
        const p = new Pentagon();
        p.setState(PentagonState.random());
        this.pentagons.push(p);
      }
      for (let i = 0; i < numPentagons; ++i) {
        this.transitions.push(Transition.random(this.pentagons, this.pentagons[i]));
      }
    }

    frame() {
      this.pentagons.forEach((p, i) => {
        const done = this.transitions[i].done();
        p.setState(this.transitions[i].frame());
        if (done) {
          this.transitions[i] = Transition.random(this.pentagons, p);
        }
      });
    }
  }

  class PentagonView {
    constructor(pentagons) {
      this.pentagons = pentagons || new Pentagons(30);

      this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setClearColor(0x65bcd4, 1);
      this.renderer.context.disable(this.renderer.context.DEPTH_TEST);
      this.renderer.domElement.style.zIndex = -1;
      this.renderer.domElement.style.position = 'fixed';
      this.renderer.domElement.style.left = '0';
      this.renderer.domElement.style.top = '0';
      if (document.body.firstChild) {
        document.body.insertBefore(this.renderer.domElement, document.body.firstChild);
      } else {
        document.body.appendChild(this.renderer.domElement);
      }

      this.scene = new THREE.Scene();
      this.pentagons.pentagons.forEach((p) => this.scene.add(p.object));

      const light = new THREE.PointLight(0xffffff, 1);
      light.position.set(0, 0, 10);
      this.scene.add(light);

      this.handleResize();
    }

    frame() {
      this.pentagons.frame();
      this.renderer.render(this.scene, this.camera);
    }

    animate() {
      setInterval(() => this.frame(), 1000 / 24);
      window.addEventListener('resize', () => {
        this.handleResize();
        this.frame();
      });
    }

    handleResize() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  window.PentagonView = PentagonView;

})();
