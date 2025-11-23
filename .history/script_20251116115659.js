import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

let gridsize = 20; 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 
scenes.add(new THREE.GridHelper(gridsize, gridsize)); 
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1)); 
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({colorWrite: c, color: Math.random() * 0xFFFFFF})); 

const createInvisibleWall = (x) => {
    const wall = boxmesh(8,4,2.2,true); 
    wall.position.x = x; 
    wall.position.y = 2; 
    wall.renderOrder = 1; 
    scenes.add(wall); 

    const wallclone = wall.clone(); 
    wallclone.position.x = -x; 
    scenes.add(wallclone)


}
createInvisibleWall(8.09); 

const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate); 

window.appendChild('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})