// Import
import * as THREE from 'three'; 
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import stars from './solarsystem/stars.jpg';
import sun from './solarsystem/sun.jpg';
import earth from './solarsystem/earth.jpg';
import saturn from './solarsystem/saturn.jpg';
import saturnring from './solarsystem/saturn ring.png';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// Header
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths / height;
const scenes = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(20, aspect, .1, 1000);
camera.position.set(-90, 140, 140);
camera.lookAt(0, 0, 0);

// Canvas
const renderer = new THREE.WebGLRenderer(); 
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement);

// Helper
const grids = new THREE.GridHelper(30);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
scenes.add(grids);

// Create Particle Animation
let positions = [];
let velocities = [];
let qt = 100;
for (let i = 0; i < qt; i++) {
  for (let j = 0; j < qt; j++) {
    positions.push(i - qt / 2, 0, j - qt / 2);
    velocities.push(0, Math.random() * 1, 0);
  }
}
let gr = new THREE.BufferGeometry();
gr.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
let pmat = new THREE.PointsMaterial({
  size: 0.5,
  color: 0xFFFFFF,
  // map: new THREE.TextureLoader().load('path/to/texture.png') // kalau mau pakai texture
});

let partikel = new THREE.Points(gr, pmat);
scenes.add(partikel);

const animateParticle = () => {
    const posAttr = gr.attributes.position.array;
    for (let i = 0; i < posAttr.length; i += 3) {
      posAttr[i] += velocities[i];     // x += vx
      posAttr[i + 1] += velocities[i + 1]; // y += vy
      posAttr[i + 2] += velocities[i + 2]; // z += vz
      // kalau y lebih dari 51, reset ke 0
      if (posAttr[i + 1] > 51) {
        posAttr[i + 1] = 0;
      }
    }
    gr.attributes.position.needsUpdate = true;
}


// Texture
const cubeText = new THREE.CubeTextureLoader();
const loadText = new THREE.TextureLoader(); 
scenes.background = cubeText.load([stars, stars, stars, stars, stars, stars]);

const planet = (size, position, texture, ring) => {
    const geo = new THREE.SphereGeometry(size, 40, 40);
    const mat = new THREE.MeshBasicMaterial({ map: loadText.load(texture) });
    const mesh = new THREE.Mesh(geo, mat);
    const obj3D = new THREE.Object3D();

    if (ring.texture) {
        const ringGeo = new THREE.RingGeometry(ring.inrad, ring.ourad, 20);
        const ringMat = new THREE.MeshBasicMaterial({
            map: ring.texture,
            side: THREE.DoubleSide,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.x = position;
        ringMesh.rotation.x = -Math.PI / 2;
        obj3D.add(ringMesh);
    }

    obj3D.add(mesh);
    scenes.add(obj3D);
    mesh.position.x = position;

    return { mesh, obj3D };
};

const vsuns   = planet(10, 0, sun, false);
const vearth  = planet(3, 20, earth, false);
const vsaturn = planet(6, 50, saturn, {
    inrad: 5,
    ourad: 15,
    texture: loadText.load(saturnring)
});

// ----------------------------
// GSAP PALING SEDERHANA
const startPos = camera.position.clone();
const tween = gsap.to(camera.position, {
    x: 30,
    y: 30,
    z: 30,
    duration: 2,
    paused: true,
});
window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        tween.play();
    } 
    else if (e.button === 2) {
        gsap.to(camera.position, {
            x: startPos.x,
            y: startPos.y,
            z: startPos.z,
            duration: 1
        });
    }
});

// TextGeometry 
const loader = new FontLoader();
loader.load('./fonts/helvetiker_bold.typeface.json', function (font) {
  const textGeo = new THREE.TextGeometry('Halo!', {
    font: font,
    size: 55,
    height: 30,
  });
  
  // Create a mesh with the geometry and material, etc.
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const textMesh = new THREE.Mesh(textGeo, material);
  textMesh.position.set(20,20,20)
  scenes.add(textMesh);
});


// Animasi planet
function animate() {
    animateParticle(); 
    vsaturn.obj3D.rotation.y += 0.002;
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);

// Resize
window.addEventListener('resize', () => {
    camera.aspect = aspect;
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height);
});