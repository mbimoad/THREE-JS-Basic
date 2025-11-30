import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5,10,15); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0x333333)
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update();

scenes.add(new THREE.GridHelper(30, 30)); 
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1));

const racklvls = []; 
const modeload = new GLTFLoader(); 
modeload.load('./rack1/scene.gltf', item => {
    scenes.add(item.scene)
    let rackHeight = 0; 
    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) racklvls.push(i); 
    })
})

const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})