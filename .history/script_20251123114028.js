import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight;
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(8, aspect, 0.1, 1000); 
camera.position.set(30, 30, 30); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height)
renderer.setClearColor(0x333333); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement)

const boxes = (w1,w2,w3,c,t,o) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: c, transparent: t, opacity: o})); 
const orbit = new OrbitControls(camera, renderer.domElement);
const grids = new THREE.GridHelper(20, 20); 
grids.raycast = () => {}; 
orbit.update(); 
scenes.add(grids);
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1)); 
let hoverBox = [], stackedBoxes = [], container = {}, spinningBox = null, maxstacked = 5; 

const loader = new GLTFLoader(); 
loader.load('./rack1/Scene.gltf', item => {
    scenes.add(item.scene); 
    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) {
            const parent = getObjectSize(i);
        }
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