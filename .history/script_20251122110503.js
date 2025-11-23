import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1)); 
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: Math.random() * 0xFFFFFF, colorWrite: c})); 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 

const createInvisibleWall = x => {
    const wall = boxmesh(8,4,2.2,true); 
    wall.position.set(x,2,0); 
    wall.renderOrder = 1; 

    const wall2 = wall.clone(); 
    wall.position.x = -x; 
    scenes.add(wall,wall2); 
}
createInvisibleWall(8.09)

const loader = new GLTFLoader(); 
const mixers = []; 
const clocks = new THREE.Clock(); 
loader.load('./models/Chicken.gltf', item => {
    scenes.add(item.scene);
    item.scene.scale.set(0.4,0.4,0.4);
    item.scene.position.x = 0; 
    item.scene.rotation.y = -Math.PI/2 || 0;

    if(item.animations.length > 0) {
        
    }
})

const animate = () => {
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})