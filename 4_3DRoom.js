import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const scenes = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000); 
camera.position.set(30, 20, 10); 
camera.lookAt(0, 0, 0);  

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths,height); 
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x333333);
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
orbit.update(); 
light.position.y = 10;


const createPlaneGeometry = (x,y, color) => {
    return new THREE.Mesh(
        new THREE.PlaneGeometry(x, y), 
        new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide})
    )
}
const ground   = createPlaneGeometry(10, 10, 0x00FF00); 
const backwall = createPlaneGeometry(10, 3,  0xFF0000); 
const sidewall = createPlaneGeometry(10, 3,  0x0000FF); 
ground.rotation.x = -Math.PI/2; 
backwall.position.z = 5; 
backwall.position.y = 1.5; 
sidewall.rotation.y = -Math.PI/2; 
sidewall.position.x = -5; 
sidewall.position.y = 1.5; 

// box
const box = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1), 
    new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.5, metalness: 0.3 })
); 
box.position.y = 0.5;

// === Membuat Group ===
const room = new THREE.Group();
room.name = 'roomGroup'; // nama unik untuk identifikasi
room.add(ground);
room.add(backwall);
room.add(sidewall);
room.add(box);
room.position.set(0, 10, 0);   // geser seluruh isi group ke atas
room.scale.set(1, 1, 1);       // skala 1 artinya tidak berubah
room.visible = true;           // tampilkan / sembunyikan group
room.userData = { 
  infoku: 'room baru', 
  createdAt: new Date().toLocaleString() 
};
room.castShadow = true;        // child bisa punya shadow
room.receiveShadow = true;
scenes.add(room, light);

console.log('Isi group:');
room.traverse((item) => {
  console.log(item.name || item.type);
});

// === Contoh remove satu object dari group ===
room.remove(box); 
const target = room.getObjectByName('sidewall');
if (target) {
  room.remove(target);
}
// Clear semua isi
room.traverse(obj => {
  if (obj.isMesh) {
    obj.geometry.dispose();
    obj.material.dispose();
  }
});
room.clear(); // hapus semua child di group (kosong)
console.log('Jumlah child setelah clear:', room.children.length);

// Buatkan versi merge

// By model 
const modelurl = new URL('./gaming_room/scene.gltf', import.meta.url); 
const modeload = new GLTFLoader(); 
modeload.load(modelurl.href, item => {
    item.scene.scale.set(0.2,0.2,0.2);
    scenes.add(item.scene)
    item.scene.traverse(function(child) {
        // Hilangkan sofanya 
        if(child.name == "sofa_17" || child.name == "bantal_1003_18") child.visible = false; 
        // Floor 
        if(child.name == "Object_4") {
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(1,1,1),
                new THREE.MeshBasicMaterial({color: 0xFF0000}), 
            )
            box.position.y = 0.5;
            item.scene.add(box);
        }
    })
})


const animate = () => {
    box.rotation.y += 0.05;
    requestAnimationFrame(animate); 
    renderer.render(scenes, camera); 
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})

// === Tombol toggle Fog ===
// fog = efek kabut
let fogEnabled = true;
scenes.background = new THREE.Color(0x87ceeb); // langit biru
scenes.fog = new THREE.Fog(0x87ceeb, 15, 60);  // mulai jarak 15, hilang di 60


const btn = document.createElement('button');
btn.textContent = 'Toggle Fog (ON)';
Object.assign(btn.style, {
  position: 'absolute',
  top: '10px',
  left: '10px',
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.8)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
});
document.body.appendChild(btn);

btn.onclick = () => {
  fogEnabled = !fogEnabled;
  scenes.fog = fogEnabled ? new THREE.Fog(0x87ceeb, 15, 60) : null;
  btn.textContent = fogEnabled ? 'Toggle Fog (ON)' : 'Toggle Fog (OFF)';
};