import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5, 10, 10); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setClearColor(0xDDDDDD); 
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement); 

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1); 
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update(); 
scenes.add(ambientLight)

const getObjectSize = obj => {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    return size;
};
const getWorldPosition = parent => {
    const worldPos = new THREE.Vector3(); 
    parent.getWorldPosition(worldPos); 
    return worldPos
}


const modelbox = new URL('./crate_box/scene.gltf', import.meta.url); 
const modelurl = new URL('./warehouserack2/scene.gltf', import.meta.url); 
const modeload = new GLTFLoader(); 
const wadah = []; 
modeload.load(modelurl.href, item => {
    
})



const addFullBox = obj => { 
    const spacing = 0.6; 
    const side    = 1;   
    for (let y = 0; y < 3; y++) { 
        for (let i = -side; i <= side; i++) { 
            const worldPos = getWorldPosition(obj); 
            const posX = worldPos.x + i * spacing; 
            const posY = worldPos.y + y * spacing + 0.1; 
            const posZ = 0; 
            createBox(0.5, false, scenes, posX, posY, posZ); 
        }
    }
}

const animate = () => {
    renderer.render(scenes, camera)
}

renderer.setAnimationLoop(animate); 
window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})