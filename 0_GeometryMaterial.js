import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackBallControls } from 'three/examples/jsm/controls/TrackBallControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

// --- BASIC SETUP ---
let width = window.innerWidth;
let height = window.innerHeight;
let aspect = width / height;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);

camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- SUPPORT LIGHT & CONTROL ---
const controls = new THREE.FirstPersonControls(cam, renderer.domElement);
//const controls = new THREE.TrackBallControls(cam, renderer.domElement);
//const controls = new OrbitControls(camera, renderer.domElement);
firstperson.lockSpeed = 0.1;
orbit.update();


const ambient = new THREE.AmbientLight(0xffffff, 0.5);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(ambient, dirLight);

// --- GROUND ---
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);


// --- LIGHT --- 
const lights = [
  new THREE.AmbientLight(0xffffff, 0.3),
  new THREE.DirectionalLight(0xffffff, 0.5),
  new THREE.PointLight(0xffaa00, 0.6),
  new THREE.SpotLight(0x00aaff, 0.5),
  new THREE.HemisphereLight(0xaaaaff, 0x444400, 0.6),
];
lights.forEach(light => scene.add(light));

// --- HELPER --- 
const helpers = [
  new THREE.AxesHelper(5),
  new THREE.GridHelper(20, 20),
  new THREE.DirectionalLightHelper(new THREE.DirectionalLight(), 2),
  new THREE.PointLightHelper(new THREE.PointLight(0xff0000, 1), 1),
  new THREE.SpotLightHelper(new THREE.SpotLight(0xffffff, 1)),
  new THREE.HemisphereLightHelper(new THREE.HemisphereLight(0x00ffff, 0xff00ff), 1),
  new THREE.CameraHelper(new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100))
];
helpers.forEach(helper => scene.add(helper));



// --- GEOMETRIES ---
const geometries = [
  new THREE.BoxGeometry(1, 1, 1),             // 1. Kubus
  new THREE.SphereGeometry(0.6, 32, 32),      // 2. Bola
  new THREE.ConeGeometry(0.6, 1, 32),         // 3. Kerucut
  new THREE.CylinderGeometry(0.5, 0.5, 1, 32),// 4. Silinder
  new THREE.TorusGeometry(0.5, 0.2, 16, 100), // 5. Donat
  new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16), // 6. Donat simpul
  new THREE.DodecahedronGeometry(0.6),        // 7. 12 sisi
  new THREE.TetrahedronGeometry(0.7),         // 8. Piramid 4 sisi
  new THREE.PlaneGeometry(1, 1)               // 9. Bidang datar
];

// --- MATERIALS ---
const materials = [
  new THREE.MeshBasicMaterial({ color: 0xff4444 }),  // Tanpa cahaya
  new THREE.MeshNormalMaterial(),                    // Berdasarkan normal
  new THREE.MeshLambertMaterial({ color: 0x00ff88 }),// Lembut
  new THREE.MeshPhongMaterial({ color: 0x4488ff, shininess: 80 }), // Mengkilap
  new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.6, roughness: 0.3 }), // Realistik
  new THREE.MeshToonMaterial({ color: 0x66ccff }),   // Kartun-style
  new THREE.MeshMatcapMaterial({
    matcap: new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/nidorx/matcaps/master/256/DBD8C9_948E82_ADA69A_B5B0A3.png'
    )
  }),
  // --- Tambahan: PHYSICAL MATERIAL (paling realistis) ---
  new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.5,  // efek transparan
    ior: 1.45,          // indeks bias
    thickness: 0.5      // ketebalan untuk efek refraksi
  })
];

// --- GENERATE MESHES ---
for (let i = 0; i < geometries.length; i++) {
  for (let j = 0; j < materials.length; j++) {
    const mesh = new THREE.Mesh(geometries[i], materials[j]);
    mesh.position.x = (j - materials.length / 2) * 2.2;
    mesh.position.z = (i - geometries.length / 2) * 2.2;
    mesh.position.y = 0.5;
    scene.add(mesh);
  }
}

// --- LINE ---
const points = [
  new THREE.Vector3(-5, 1, -5),
  new THREE.Vector3(-2, 2, -3),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(2, 2, 3),
  new THREE.Vector3(5, 1, 5)
];
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

// --- ANIMATE ---
function animate() {
  scene.traverse(obj => {
    if (obj.isMesh && obj !== ground) {
      obj.rotation.x += 0.01;
      obj.rotation.y += 0.01;
    }
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// --- RESIZE ---
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});