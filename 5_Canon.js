import * as THREE from 'three';         // Visual (HTML) 
import * as CANNON from 'cannon-es';    // Otak   (Javascript)  

let width = window.innerWidth; 
let height = window.innerHeight; 
let aspect = width/height
let scenes = new THREE.Scene(); 
let camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000); 
camera.position.set(0, 5, 10); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(width, height); 
document.body.appendChild(renderer.domElement); 

// Membuat Visual Box dan Ground
const ukuran = 1; 
const visualBox = new THREE.Mesh(
    new THREE.BoxGeometry(ukuran, ukuran, ukuran), 
    new THREE.MeshNormalMaterial() // Debug Rainbox color
)
const visualGround = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10), 
    new THREE.MeshBasicMaterial({color: 0x00FF00, side: THREE.DoubleSide})
)

// Membuat Otak Box dan Ground
const world    = new CANNON.World({gravity: new CANNON.Vec3(0, -9.81, 0)});
const brainBox = new CANNON.Body({
    // 3 Properti wajib (mass, shape sesuaikan)
    mass: 1, // mass > 0 bisa jatuh
    shape: new CANNON.Box(new CANNON.Vec3(ukuran/2, ukuran/2, ukuran/2)), 
    position: new CANNON.Vec3(0, 5, 0) // 5 dilantai atas
})
const brainGround = new CANNON.Body({
    mass: 0, 
    shape: new CANNON.Plane()
})

// Rotasi horizontal
visualGround.rotation.x = -Math.PI/2;
brainGround.quaternion.setFromEuler(-Math.PI/2, 0, 0); 

// Add Visual dan Otaknya
world.addBody(brainBox);     // cuman bisa masukin 1 1
world.addBody(brainGround); // cuman bisa masukin 1 1
scenes.add(visualBox, visualGround);

// Scipt optional pantulan dan gesekan (Kalo tidak dibikin akan pake default bawaan three js) 
const defaultMaterial = new CANNON.Material(); 
world.defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {friction: 0.9, restitution: 0.4});

// Animate
function brainAnimate() {
    world.step(1/60); 
    visualBox.position.copy(brainBox.position);      // memasukan posisi badan ke posisi otak
    visualBox.quaternion.copy(brainBox.quaternion);  // memasukan rotasi badan ke rotasi otak
}
function animate() {
    brainAnimate(); 
    renderer.render(scenes, camera);
    requestAnimationFrame(animate)
}
animate();

window.addEventListener('resize', function(e) {
    width = this.window.innerWidth; 
    height = this.window.innerHeight; 
    aspect = width/height; 
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(width, height); 
})