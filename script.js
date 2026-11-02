import { WebGLRenderer, PerspectiveCamera, Scene, Clock, Box3, Color } from './three.module.js';
import { VRButton } from './VRButton.js';
import { OrbitControls } from './OrbitControls.js';
import { GLTFGoogleTiltBrushMaterialExtension } from './three-icosa.module.js';
import { GLTFLoader } from './GLTFLoader.js';

const artworks = {
  'student-202.glb': '202 陳O涵',
  'student-203.glb': '203 鄭O允',
};
const requested = new URLSearchParams(window.location.search).get('model');
const modelFile = Object.hasOwn(artworks, requested) ? requested : 'student-202.glb';

class Sketch {
  constructor() {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.xr.enabled = true;
    this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0.95, 2);
    this.scene = new Scene();
    this.scene.background = new Color(0x000000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.clock = new Clock();
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(VRButton.createButton(this.renderer));
    this.addArtworkMenu();
    window.addEventListener('resize', () => this.resize());
    this.load();
    this.render();
  }

  addArtworkMenu() {
    const menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;top:16px;left:16px;z-index:10;color:#fff;font:16px sans-serif;background:rgba(0,0,0,.65);padding:12px 14px;border-radius:10px;';
    menu.innerHTML = '<div style="margin-bottom:8px;font-weight:700">VR頭盔3D繪圖學生作品</div>';
    const select = document.createElement('select');
    select.style.cssText = 'font:inherit;padding:6px;max-width:220px;';
    for (const [file, name] of Object.entries(artworks)) {
      const option = new Option(name, file, file === modelFile, file === modelFile);
      select.add(option);
    }
    select.addEventListener('change', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('model', select.value);
      window.location.href = url.toString();
    });
    menu.appendChild(select);
    document.body.appendChild(menu);
  }

  load() {
    const loader = new GLTFLoader();
    loader.register(parser => new GLTFGoogleTiltBrushMaterialExtension(parser, './brushes/'));
    loader.load(modelFile, (tiltData) => {
      this.mesh = tiltData.scene;
      new Box3().setFromObject(this.mesh);
      this.controls.target.set(0, 0.95, 0);
      this.scene.add(this.mesh);
    }, undefined, (error) => console.error('Unable to load artwork:', error));
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.controls.update();
    this.renderer.setAnimationLoop(() => this.render());
    this.renderer.render(this.scene, this.camera);
  }
}
new Sketch();
