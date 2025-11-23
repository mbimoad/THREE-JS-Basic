import * as THREE from 'three'; 

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5,10,15); 
camera.lookAt(0,0,0); 
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(widths,height); 
renderer.setClearColor(0x000000); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

const gs = 20;
scenes.add(new THREE.GridHelper(gs,gs))

const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height);
})
