import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000); 
camera.position.set(0, 0, 5); 
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 



const gridHelper = new THREE.GridHelper(30, 30);
gridHelper.position.y = -0.5; 
scenes.add(gridHelper)

let clock    = new THREE.Clock() 
let controls = new PointerLockControls(camera, renderer.domElement); 
const btn = document.querySelector('button'); 
btn.addEventListener('click', function(e) {
  controls.lock(); 
})

let keyboard = []; 
addEventListener('keyup', function(e) {
  keyboard[e.key] = false;
})

addEventListener('keydown', function(e) {
  keyboard[e.key] = true;
})

function processKeyboard(delta) {
  let speed = 0.2;
  let actualSpeed = speed * delta; 
  if(keyboard['w']) {
    controls.moveForward(speed);
  } 
  if(keyboard['s']) {
    controls.moveForward(-speed); 
  }
  if(keyboard['a']) {
    controls.moveRight(-speed); 
  }
  if(keyboard['d']) {
    controls.moveRight(speed); 
  }
}

controls.addEventListener('lock', e => {
  btn.innerHTML = "LOCK"
})
controls.addEventListener('unlock', e => {
  btn.innerHTML = "UNLOCK"
})

const visualBox = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1), 
    new THREE.MeshNormalMaterial(), 
);
scenes.add(visualBox)


// CSS3D
const renderer2 = new CSS3DRenderer(); 
renderer2.setSize(widths, height); 
document.body.appendChild(renderer2.domElement); 

let div = document.createElement('div'); 
div.innerHTML = `<h1>Hello Dunia</h1> <input type="text">`; 
let obj = new CSS3DObject(div); 
obj.position.set(0, 0, 0); 
obj.rotation.y += Math.PI/4; 
scenes.add(obj); 

function animate() {
    let delta = clock.getDelta(); 
    processKeyboard(); 
    renderer.render(scenes, camera); 
    renderer2.render(scenes, camera); 
    obj.rotateY(0.004) 
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})