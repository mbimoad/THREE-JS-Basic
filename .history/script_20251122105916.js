import * as THREE from 'three'; 

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight;
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5, 10, 5); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setClearColor(0xCCCCCC); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement)

const gs = 20; 
scenes.add(new THREE.GridHelper(gs, gs));
scenes.add(new THREE.AmbientLight())


const animate = () => {
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})