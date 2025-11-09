import * as THREE from 'three'; 
import * as CANNON from 'cannon-es'; 
import * as YUKA from 'yuka'; 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const scenes = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(0, 5, 10); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

// FPS Camera 
let keyboard = [];
let button   = document.querySelector('button'); 
let controls = new PointerLockControls(camera, renderer.domElement); 
controls.addEventListener('lock',   e => button.innerHTML = "lock")
controls.addEventListener('unlock', e => button.innerHTML = "unlock")
button.addEventListener('click', function(e) {
    controls.lock(); 
})
window.addEventListener('keyup', function(e) {
  keyboard[e.key] = false; 
})
window.addEventListener('keydown', function(e) {
  keyboard[e.key] = true; 
})
function triggerKeyboard(speed) {
    if(keyboard['w']) controls.moveForward(speed); 
    if(keyboard['s']) controls.moveForward(-speed); 
    if(keyboard['a']) controls.moveRight(-speed); 
    if(keyboard['d']) controls.moveRight(speed); 
}

const size = 1;
let datas = []; 
const createBox = (pushdb,x,y,color) => {
    console.log("Create Box")
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(size,size,size), 
        new THREE.MeshBasicMaterial({color: color})
    )
    box.position.y = y; 
    box.position.x = x; 
    if(pushdb) datas.push(box); 
    return box;
}


// Cannon ES (Fisika. Analogi seperti HTML Visual, dan JS Brain)
const visualGnds = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({color: 0x00FF00, side: THREE.DoubleSide})) 
const visualBox1 = createBox(false, 0, 0, 0xFFFFFF); 
const brainWorld = new CANNON.World({gravity: new CANNON.Vec3(0, -9.81, 0)}); 
const brainGroun = new CANNON.Body({
  mass: 0, 
  shape: new CANNON.Plane()
})
const brainBoxes = new CANNON.Body({ // 2 Required Property (mass, shape (sesuaikan))
  mass: 1, // Mass > 0 Untuk Jatuh
  shape: new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2)), 
  position: new CANNON.Vec3(0, 5, 0) // 5 lantai atas
}) 
// Optional (karna three js udah set default)
const dmat = new CANNON.Material(); 
brainWorld.defaultContactMaterial = new CANNON.ContactMaterial(dmat, dmat, {friction: 0.9, restitution: 0.4})
// Rotasi horizontal 
visualGnds.rotation.x = -Math.PI/2; 
brainGroun.quaternion.setFromEuler(-Math.PI/2, 0, 0); 
// Add
brainWorld.addBody(brainBoxes); 
brainWorld.addBody(brainGroun); 
scenes.add(visualBox1, visualGnds); 
// Brain Animate 
const brainAnimate = () => {
  brainWorld.step(1/60); 
  visualBox1.position.copy(brainBoxes.position); 
  visualBox1.quaternion.copy(brainBoxes.quaternion); 
}

// Yuka (Artificial Inteligence)
const visualBox2 = createBox(false, 0, 0, 0x0000FF);
const mana = new YUKA.EntityManager(); 
const time = new YUKA.Time(); 
const ybox = new YUKA.Vehicle();
const goal = new YUKA.Vector3(5,0,0); 
const behv = new YUKA.SeekBehavior(goal);  
ybox.position.set(0, 0, 0); 
ybox.maxSpeed = 2;  
ybox.steering.add(behv); 
ybox.setRenderComponent(visualBox2, (e,r) => r.position.copy(e.position)); 
mana.add(ybox); 
scenes.add(visualBox2)
const yukaAnimate = () => mana.update(time.update().getDelta());


// barcode 
async function createBarcode() {
    const warna  = "#D2B48C"; 
    const canvas = document.createElement('canvas'); 
    canvas.width = 512; 
    canvas.height = 512; 
    const ctx = canvas.getContext('2d'); 
    ctx.fillStyle = warna; 
    ctx.textAlign = 'center'; 
    ctx.font = '40px Arial'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    ctx.fillText('Kardus', canvas.width/2, 100); 

    const barcodeWidth = 300; 
    const barcodeHeigh = barcodeWidth/2; 
    const barcodeImage = await new Promise(resolve => {
        const image = new Image(); 
        image.crossOrigin = 'anonymous'; 
        image.src = './img/barcode.gif'; 
        image.onload = () => resolve(image); 
    })
    ctx.drawImage(barcodeImage, (canvas.width-barcodeWidth)/2, barcodeHeigh, barcodeWidth, barcodeHeigh);
    return {canvas, warna}; 
}
const barcode = await createBarcode(); 
setInterval(() => {
    let box = createBox(true,3, datas.length-1, 0x999999); 
    const brown  = new THREE.MeshBasicMaterial({color: barcode.warna}); 
    const front  = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(barcode.canvas)}); 
    const multi  = [front,front,front,front,front,brown];
    box.material = multi;
    scenes.add(box)
    console.log("Add box")
}, 1000);


// CSS3D
const renderer2 = new CSS3DRenderer(); 
document.body.appendChild(renderer2.domElement); 
renderer2.setSize(widths, height);
renderer2.domElement.style.position = 'absolute'; 
renderer2.domElement.style.top = '0'; 
renderer2.domElement.style.left = '0'; 
renderer2.domElement.style.right = '0'; 
renderer2.domElement.style.bottom = '0'; 
renderer2.domElement.style.zIndex = '1'; 
renderer2.domElement.style.pointerEvents = 'none'; 

let posy   = 0.6; 
const div  = document.querySelector('div'); 
let cssobj = new CSS3DObject(div)
// cssobj.position.set(0,0,0); 
cssobj.scale.set(0.02, 0.02, 0.02, 0.02); 
cssobj.position.copy(visualBox2.position)
cssobj.position.y += posy;
scenes.add(cssobj)

const animate = () => {
  // Fps  
  triggerKeyboard(0.2); 
  // Canon
  brainAnimate();
  // Yuka 
  yukaAnimate(); 
  cssobj.position.copy(visualBox2.position); 
  cssobj.position.y += posy;
  renderer2.render(scenes, camera)
  renderer.render(scenes, camera); 
  requestAnimationFrame(animate); 
}
animate(); 

window.addEventListener('resize', function(e) {
  camera.aspect = aspect; 
  camera.updateProjectionMatrix(); 
  renderer.setSize(widths, height); 
})