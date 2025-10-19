// Import
import * as THREE from 'three'; 
import * as dat from 'dat.gui'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// HDR
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';



// Header
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
camera.position.set(10, 10, 10); 
camera.lookAt(0,0,0);

// Canvas
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xDDDDDD);
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement);

// Helper 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 
const grids = new THREE.GridHelper(30); 
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8); 
const directsLight = new THREE.DirectionalLight(0xFFFFFF, 0.9); 
directsLight.position.set(10, 11, 7);
scenes.add(grids);
scenes.add(ambientLight);
scenes.add(directsLight);

// Gui
const options = {warna: 0xFF0000};
const gui = new dat.GUI();

// Load Model
const modelurl = new URL('../models/Cow.gltf', import.meta.url);
const modeload = new GLTFLoader(); 

// Animation
let mixer; 
const clock = new THREE.Clock(); 
modeload.load(modelurl.href, function(gltf) {
    scenes.add(gltf.scene);

    // See all animation
    console.log(gltf.animations);

    // Load Spesific
    mixer = new THREE.AnimationMixer(gltf.scene); 

    // Idle Animation
    const idleClip   = THREE.AnimationClip.findByName(gltf.animations, 'Idle_2');
    const idleAction = mixer.clipAction(idleClip); 
    idleAction.play();
    idleAction.loop = THREE.LoopOnce; 

    const eatingClip   = THREE.AnimationClip.findByName(gltf.animations, 'Eating');
    const eatingAction = mixer.clipAction(eatingClip); 
    eatingAction.loop = THREE.LoopOnce; 

    mixer.addEventListener('finished', function(e) {
        if(e.action._clip.name == "Eating") {
            idleAction.reset(); 
            idleAction.play(); 
        } else if(e.action._clip.name == "Idle_2") {
            eatingAction.reset(); 
            eatingAction.play(); 
        }
    })

    // Load All
    // gltf.animations.forEach(item => {
    //     const action = mixer.clipAction(item);
    //     action.play();
    // })


    // Get All Object
    gltf.scene.traverse(function(obj) {
        // Apakah Mes object?
        if(obj.isMes) {
            obj.material.color.setHex(0xFF00FF);
        }
    })

    // Set Color for layer
    gltf.scene.getObjectByName('Cube_1').material.color.setHex(0xFF0000);
    gui.addColor(options, 'warna').onChange(function(e) {
        gltf.scene.getObjectByName('Cube_1').material.color.setHex(e);
    });

    // We can also set the event if the models already loaded
    window.addEventListener('mousedown', function(e) {
        console.log("Eventku")
        console.log(e.button); 
    })

}, undefined, function(e) {
    console.log(e);
})


// HDR
renderer.outputEncoding = THREE.sRGbEncoding; 
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8; 

const loading = new THREE.LoadingManager(); 
const progres = document.querySelector('progress'); 
loading.onStart = (url, loaded, total) => {}; 
loading.onError = (url, loaded, total) => {}; 
loading.onProgress = (url, loaded, total) => {
    progres.value = (loaded/total) * 100; 
}; 
loading.onLoad = (url, loaded, total) => progres.style.display = 'none';

const modelurl2 = new URL("../models/mars_one_mission_-_base/scene.gltf", import.meta.url);
const hdrurl   = new URL("../img/kantor.hdr", import.meta.url);
const gltfload = new GLTFLoader(loading); 
const rgbeload = new RGBELoader();

rgbeload.load(hdrurl, item => {
    item.mapping = THREE.EquirectangularReflectionMapping;
    scenes.background = item; 
    scenes.environment = item;

    scenes.add(new THREE.Mesh(
        new THREE.SphereGeometry(1, 50, 50), 
        new THREE.MeshPhysicalMaterial({
            roughness: 0, 
            metalness: 0, 
            color: 0xFF00FF, 
            transmission: 1, 
            ior: 2, 
        }),
    ));
    gltfload.load(modelurl2.href, item => {
        scenes.add(item.scene)
    });
})


function animate() {
    if(mixer) mixer.update(clock.getDelta());
    renderer.render(scenes, camera); 
}

renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix();
    renderer.setSize(widths, height); 
})