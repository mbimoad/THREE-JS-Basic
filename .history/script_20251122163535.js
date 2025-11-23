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

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x000000); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

let gs = 20; 
scenes.add(new THREE.GridHelper(gs,gs)); 
scenes.add(new THREE.AmbientLight(0xFFFFFF,1)); 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: Math.random() * 0xFFFFFF, colorWrite: c})); 

// 1. invisible
function createInvisibleWall(x) {
    const wall = boxmesh(8,4,2.2, true);
    wall.position.set(x,2,0);
    wall.renderOrder = 1; 
    const walls = wall.clone(); 
    walls.position.x = -x; 
    scenes.add(wall, walls)
}
createInvisibleWall(8.09)

const clocks = new THREE.Clock(); 
const mixers = []; 
const loader = new GLTFLoader(); 
loader.load('./models/Chicken.gltf', item => {
    scenes.add(item.scene); 
    item.scene.position.x = 0; 
    item.scene.rotation.y = -Math.PI/2; 
    item.scene.scale.set(0.5,0.5,0.5);
    if(item.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(item.scene); 
        const walks = THREE.AnimationClip.findByName(item.animations, 'Walk'); 
        if(walks) {
            const action = mixer.clipAction(walks); 
            action.play(); 
            mixers.push({
                model: item.scene, 
                mixer
            })
        }
    }
    item.scene.traverse(i => {
        if(i.isMesh) i.renderOrder = 2;  
    })
})

// Pointing 
const createGround = (s,c,t,v,n) => {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(s,s), 
        new THREE.MeshBasicMaterial({
            transparent: t, 
            side: THREE.DoubleSide, 
            color: c
        })
    )
}

function animate() {
    mixers.forEach(({model, mixer}) => {
        mixer.update(clocks.getDelta()); 
        model.position.x -= 0.03;
        if(model.position.x < -5) model.position.x = 5; 
    })
    renderer.render(scenes, camera);    
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths,height); 
})