import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const scenes = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000); 
camera.position.set(-30, 30, 30); 
camera.lookAt(0, 0, 0);  

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths,height); 
renderer.setClearColor(0xEEEEEE);
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 

const createPlaneGeometry = (x,y, color) => {
    return new THREE.Mesh(
        new THREE.PlaneGeometry(x, y), 
        new THREE.MeshBasicMaterial({color: color})
    )
}
const ground   = createPlaneGeometry(10, 10, 0x00FF00); 
const backwall = createPlaneGeometry(10, 3,  0xFF0000); 
const sidewall = createPlaneGeometry(10, 3,  0x0000FF); 
ground.rotation.x = -Math.PI/2; 
backwall.position.z = -5; 
backwall.position.y = 1.5; 
sidewall.rotation.y = -Math.PI/2; 
sidewall.position.x = 5; 
sidewall.position.y = 1.5; 

// box
const box = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1), 
    new THREE.MeshStandardMaterial(), 
); 
box.position.y = 0.5;
scenes.add(ground, backwall, sidewall, box); 

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