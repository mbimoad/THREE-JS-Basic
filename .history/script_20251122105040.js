import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth;
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
const renderer = new THREE.WebGLRenderer({antialias: true});
camera.position.set(5, 10, 5);
camera.lookAt(0, 0, 0); 

renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0xFFFFFF); 
document.body.appendChild(renderer.domElement); 

let gs = 20; 
scenes.add(new THREE.GridHelper(gs,gs))
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1)); 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({colorWrite: c, color: Math.random() * 0xFFFFFF}))

const createInvisibleWall = x => {
    const wall = boxmesh(8,4,2.2, true); 
    wall.position.set(x,2,0); 
    wall.renderOrder = 1; 
    // mirror 
    let mirror = wall.clone(); 
    mirror.position.x = -x; 
    scenes.add(mirror); 
    scenes.add(wall); 
}
createInvisibleWall(8.09); 

const mixers = []; 
const loaders = new GLTFLoader(); 
loaders.load('./models/Chicken.gltf', item => {
    item.scene.scale.set(0.4, 0.4, 0.4); 
    item.scene.position.x = 0; 
    item.scene.rotation.y = -Math.PI/2 || 0; 
    scenes.add(item.scene);

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

const animate = (time) => {
    mixers.forEach(({mixer, model}) => {
        model.position.x -= 0.03; 
        if(model.position.x < -5)
            model.position.x = 5;
    })
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate);


window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})