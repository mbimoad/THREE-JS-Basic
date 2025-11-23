import * as THREE from 'three'

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
const renderer = new THREE.WebGLRenderer(); 
camera.position.set(5, 10, 15); 
camera.lookAt(0,0,0); 
renderer.setSize(widths, height); 
renderer.setClearColor(0xFEFEFE); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 



window.appendChild('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})