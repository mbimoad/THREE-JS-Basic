import * as THREE from 'three'; 
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
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


boxTextMes.userData = { info: 'Data sederhana' };
boxTextMes.material.color.set(0xff00ff); // warna ungu
boxTextMes.material.map = null; // hapus texture kalau ada
boxTextMes.position.set(10,10,-10);
boxTextMes.material.map = loadTexture.load(nebula);
boxTextMes.name = 'bimo';
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