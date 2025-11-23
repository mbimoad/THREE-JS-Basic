import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(8, aspect, 0.1, 1000); 
camera.position.set(30,30,30); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x999999); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
const grids = new THREE.GridHelper(20,20); 
grids.raycast = () => {};
orbit.update(); 
scenes.add(grids); 
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1))

const loader = new GLTFLoader(); 
loader.load('./rack1/Scene.gltf', item => {
    scenes.add(item.scene); 
    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) {
            const p = getObjectSize(i);
            logbody
        }
    })
})

function getObjectSize(parent) {
    const boxs = new THREE.Box3().setFromObject(parent); 
    const size = new THREE.Vector3(); 
    const cntr = boxs.getCenter(new THREE.Vector3()); 
    cntr.y += 0.1; 
    return {
        cntr, 
        x: size.x,
        y: size.y
    }
}

const animate = () => {
    renderer.render(scenes, camera)
}


renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})