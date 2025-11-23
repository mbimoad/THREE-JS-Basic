import * as THREE from 'three'; 

const widths = window.innerWidth;
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
const renderer = new THREE.WebGLRenderer({antialias: true});
camera.position.set(5, 10, 5);
camera.lookAt(0, 0, 0); 

renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0xFFFFFF); 
document.body.appendChild(renderer.domElement); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    renderer.setSize(widths, height); 
    renderer.
})