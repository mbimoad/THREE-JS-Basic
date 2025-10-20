import * as THREE from 'three'; 
import * as dat from 'dat.gui';
import nebula from './img/nebula.jpg';
import stars from './img/stars.jpg';

// Header
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

// Canvas
const renderer = new THREE.WebGLRenderer(); 
renderer.setClearColor(0xFFFFFF);
renderer.shadowMap.enabled = true; 
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement);

// Texture
const cubeTexture = new THREE.CubeTextureLoader(); 
scenes.background = cubeTexture.load([
    nebula,
    nebula,
    stars,
    stars,
    stars,
    stars,
]);

const loadTexture = new THREE.TextureLoader(); 
const multi = [
    new THREE.MeshBasicMaterial({map: loadTexture.load(nebula)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(nebula)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}),
]
const boxTextGeo = new THREE.BoxGeometry(5,5,5); 
const boxTextMat = new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}); 
const boxTextMes = new THREE.Mesh(boxTextGeo, multi);

// ======================================= Attribute 
// Geometry 
const geo = boxTextMes.geometry;
console.log(geo.attributes.normal);
console.log(geo.attributes.uv);
console.log(geo.attributes.color);
console.log(geo.index);

// Material
const mat = boxTextMes.material[0] || boxTextMes.material;
if(mat.color) mat.color.set(0x00ff00);    // hijau
mat.opacity = 0.5;
mat.transparent = true;
mat.wireframe = true;
mat.side = THREE.DoubleSide;

console.group(`🔍 ${boxTextMes.name}`);
console.log("📦 Geometry attributes:", boxTextMes.geometry.attributes);
console.log("🧱 Material:", boxTextMes.material);
console.log("🖼️ Map:", boxTextMes.material.map);
console.log("🎨 Color:", boxTextMes.material.color);
console.log("🔧 Material type:", boxTextMes.material.type);
console.log("📛 Name:", boxTextMes.name);
console.log("📋 UserData:", boxTextMes.userData);
console.groupEnd();
console.log("📦 Geometry attributes:", boxTextMes.geometry.attributes);
console.log("🧩 Position array:", boxTextMes.geometry.attributes.position.array);
console.log("🔢 Vertex count:", boxTextMes.geometry.attributes.position.count);


// === 1️⃣ Identitas & Data ===
boxTextMes.name = 'bimo';
boxTextMes.userData = {
  info: 'Data sederhana',
  author: 'Bimo',
  health: 100,
  isEnemy: false,
};

// === 2️⃣ Posisi, Rotasi, Skala (pakai angka biasa) ===
boxTextMes.position.set(10, 10, -10);
boxTextMes.rotation.set(0.5, 1, 0); // rotasi sederhana (radian, tapi angkanya mudah)
boxTextMes.scale.set(1.5, 1.5, 1.5);

// === 3️⃣ Material & Tekstur ===
const loadTexture = new THREE.TextureLoader();
boxTextMes.material.map = loadTexture.load(nebula); // pakai tekstur nebula
boxTextMes.material.color.set(0xff00ff); // tetap ungu
boxTextMes.material.emissive.set(0x222222);
boxTextMes.material.needsUpdate = true;

// === 4️⃣ Visibility & Shadows ===
boxTextMes.visible = true;
boxTextMes.castShadow = true;
boxTextMes.receiveShadow = true;

// === 5️⃣ Transformasi Tambahan ===
boxTextMes.rotateY(0.5);   // rotasi tambahan di sumbu Y
boxTextMes.translateZ(2);  // geser 2 unit ke arah depan lokal

// === 6️⃣ Layer & Helper ===
boxTextMes.layers.enable(0); // tetap di layer utama
const helper = new THREE.BoxHelper(boxTextMes, 0x00ff00);
scene.add(helper);
const pos = boxTextMes.geometry.attributes.position;
pos.setXYZ(0, 1, 1, 1); pos.needsUpdate = true; // ubah vertex 0
scenes.add(boxTextMes)


// Gui
const spotLight       = new THREE.SpotLight(0xFF0000, 0.5); 
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
spotLight.angle = 0.5;
scenes.add(spotLight)
scenes.add(spotLightHelper)

const gui = new dat.GUI(); 
const options = {
    angle: 0, 
    penumbra: 0, 
    warna: 0xFFFFFF, 
    hewan: 0xFFFFFF,
}
gui.addColor(options, 'warna').onChange(function(e) {
    groundMes.material.color.set(e);
})
gui.add(options, 'penumbra', 0, 1.5);
gui.add(options, 'angle', 0, 1.5);


// Pointing
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster(); 
window.addEventListener('mousemove', function(e) {
    mousePosition.x =  (e.clientX / widths) * 2 - 1;
    mousePosition.y = -(e.clientY / height) * 2 + 1;
})

const pointing = () => {
    raycaster.setFromCamera(mousePosition, camera);
    let intersects = raycaster.intersectObjects(scenes.children); 
    for(let i=0; i<intersects.length; i++) {
        let active = intersects[i].object; 
        if(active.id == cubeMes.id) active.material.color.set(0xFFFFFF); 
        if(active.name == 'bimo') active.rotation.x += 0.1;
    }
}

function animate() {
    pointing(); 
    spotLight.penumbra = options.penumbra; 
    spotLightHelper.update(); 
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = aspect;
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height);
})