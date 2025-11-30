import * as THREE from 'three'; 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as CANON from 'cannon-es'; 
import * as yuka from 'yuka';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(0, 5, 15); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x333333); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement);

const boxmesh = (w1,w2,w3,c,t,o) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: c, transparent: t, opacity: o})); 
scenes.add(new THREE.GridHelper(30,30)); 
const controls = new PointerLockControls(camera, renderer.domElement); 
const keyboard = []; 
const button   = document.querySelector('button'); 
controls.addEventListener('lock', e => button.innerHTML = 'lock');
controls.addEventListener('unlock', e => button.innerHTML = 'unlock');
button.addEventListener('click', e => controls.lock()); 
window.addEventListener('keyup', e => keyboard[e.key] = false);
window.addEventListener('keydown', e => keyboard[e.key] = true);
const updateKeyboard = speed => {
    if(keyboard['s']) controls.moveForward(-speed);
    if(keyboard['w']) controls.moveForward(speed);
    if(keyboard['a']) controls.moveRight(-speed);
    if(keyboard['d']) controls.moveRight(speed);
}

const size = 1; 
let datas = []; 
const createBox = (push,x,y,color) => {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(size,size,size), 
        new THREE.MeshBasicMaterial({color: color})
    )
    box.position.x = x; 
    box.position.y = y; 
    if(push) datas.push(box)
        return box; 

}

const visualGnds = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({color: Math.random() * 0xFFFFFF, side: THREE.DoubleSide}))
const visualBox1 = createBox(false, 0, 0, 0x00FF00)
visualBox1.position.y = 0.5;
visualGnds.rotation.x = -Math.PI/2;
scenes.add(visualGnds);
scenes.add(visualBox1);
const brainWorld = new CANON.World({gravity: new CANON.Vec3(0, -9.81, 0)}); 
const brainGroun = new CANON.Body({
    shape: new CANON.Plane(), 
    mass: 0, 
})
const brainBoxes = new CANON.Body({
    shape: new CANON.Box(new CANON.Vec3(size, size, size)), 
    mass: 1, 
    position: new CANON.Vec3(0,5,0)
})
const dmat = new CANON.Material(); 
brainWorld.defaultContactMaterial = new CANON.ContactMaterial(dmat, dmat, {friction: 0.9, restitution: 0.3}); 
brainGroun.quaternion.setFromEuler(-Math.PI/2, 0,0);
brainWorld.addBody(brainBoxes); 
brainWorld.addBody(brainGroun);
const brainAnimate = () => {
    brainWorld.step(1/60); 
    visualBox1.position.copy(brainBoxes.position);
    visualBox1.quaternion.copy(brainBoxes.quaternion);
} 

const visualBox2 = createBox(false, 0, 0, 0x888888);
scenes.add(visualBox2)
const mana = new yuka.EntityManager(); 
const time = new yuka.Time(); 
const 

const animate = (time) => {
    brainAnimate();
    updateKeyboard(0.2)
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height)
})