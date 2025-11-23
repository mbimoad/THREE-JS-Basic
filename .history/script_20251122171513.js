import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader}
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
scenes.add(new THREE.GridHelper(gs,gs));
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1));
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: Math.random() * 0xFFFFFF, colorWrite: c})); 

const createInvisibleWall = x => {
    const wall = boxmesh(8,4,2.2, true); 
    wall.position.set(x,2,0); 
    wall.renderOrder = 1;
    const wallc = wall.clone(); 
    wallc.position.x = -x; 
    scenes.add(wall,wallc)
}
createInvisibleWall(8.09)

const loader = 


const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height);
})
