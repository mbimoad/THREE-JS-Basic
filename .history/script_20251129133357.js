import * as THREE from 'three'; 

const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(0, 5, 15); 
camera.lookAt(0,0,0); 

window.addEventListener('resize', function(e) {
    
})