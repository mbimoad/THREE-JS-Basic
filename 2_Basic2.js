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

let datas = []; 
const createBox = (pushdb,x,y,size,color) => {
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
const size = 1;
const visualGnds = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({color: 0x00FF00, side: THREE.DoubleSide})) 
const visualBox1 = createBox(false, 0, 0, 1, 0xFFFFFF); 
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
  visualBox1.quaternion.copy(brainGroun.quaternion); 
}

// Yuka (Artificial Inteligence)
const visualBox2 = createBox(false, 0, 0, 1, 0x0000FF);
const mana = new YUKA.EntityManager(); 
const time = new YUKA.Time(); 
const ybox = new YUKA.Vehicle();
const goal = new YUKA.Vector3(5,0,0); 
const behv = new YUKA.SeekBehavior(goal);  
ybox.position.set(0, 0, 0); 
ybox.maxSpeed = 2;  
ybox.steering.add(behv); 
mana.add(ybox); 
ybox.setRenderComponent(visualBox2, (e,r) => r.position.copy(e.position)); 
scenes.add(visualBox2)
const yukaAnimate = () => {
  const delta = time.update().getDelta(); 
  mana.update(delta);
}

// barcode 
async function createBarcode() {
    const warna  = "#D2B48C"; 
    const canvas = document.createElement('canvas'); 
    canvas.width = 512; 
    canvas.height = 512; 
    const ctx = canvas.getContext('2d'); 
    ctx.fillStyle = warna; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    ctx.fillStyle = 'black'; 
    ctx.font = '40px Arial'; 
    ctx.textAlign = 'center'; 
    ctx.fillText('Kardus', canvas.width/2, 100); 

    const barcodeWidth = 300; 
    const barcodeHeigh = 150; 
    const barcodeImage = await new Promise(resolve => {
        const image = new Image(); 
        image.crossOrigin = 'anonymous'; 
        image.src = './img/barcode.gif'; 
        image.onload = () => resolve(image); 
    })
    ctx.drawImage(barcodeImage, (canvas.width-barcodeWidth)/2, 150, barcodeWidth, barcodeHeigh);
    return {canvas, warna}; 
}
const barcodeTex = await createBarcode(); 

window.addEventListener('keypress', function(e) {
  if(e.key == "Enter") {
     let box = createBox(true, 3, datas.length + 1, 1, 0x999999);      
     const brown      = new THREE.MeshBasicMaterial({color: barcodeTex.warna}); 
     const front      = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(barcodeTex.canvas)}); 
     const material   = [brown, brown, brown, front, front, brown]; 
     box.material = material;
     scenes.add(box)
  }
})

const overflowRenderer = r => {
  r.domElement.style.position = 'absolute';
  r.domElement.style.top = '0';
  r.domElement.style.left = '0';
  r.domElement.style.zIndex = '1';
  r.domElement.style.pointerEvents = 'none';
}

// CSS3D
const sceneCss  = new THREE.Scene(); 
const renderer2 = new CSS3DRenderer(); 
renderer2.setSize(widths, height);
overflowRenderer(renderer2);
// overflowRenderer(renderer);

// By Element
document.body.appendChild(renderer2.domElement); 
let div   = document.querySelector('div') 
let obj   = new CSS3DObject(div); 
obj.position.set(0,0,0); 
obj.scale.set(0.02,0.02, 0.02); 
sceneCss.add(obj); 

// Inject HTML into Box
const createElement = (name) => {
  const nameDiv = document.createElement('div');
  nameDiv.innerHTML = `<h1>${name}</h1>`;
  nameDiv.style.padding = '4px 8px';
  nameDiv.style.background = 'rgba(255,255,255,0.8)';
  nameDiv.style.borderRadius = '4px';
  nameDiv.style.fontSize = '12px';
  nameDiv.style.textAlign = 'center';
  return nameDiv; 
}
let   nvy = 0.6; 
const nv1 = createElement("Box 2")
const ov1 = new CSS3DObject(nv1); 
ov1.position.copy(visualBox2.position); 
ov1.scale.set(0.01, 0.01, 0.01)
ov1.position.y += nvy;
sceneCss.add(ov1); 

const animate = () => {
  // Fps  
  triggerKeyboard(0.2); 
  // Canon
  brainAnimate();
  // Yuka 
  yukaAnimate(); 
  // Text 
  obj.rotateY(0.0004);
  ov1.position.copy(visualBox2.position); 
  ov1.position.y += nvy;

  renderer.render(scenes, camera);
  renderer2.render(sceneCss, camera) 
  requestAnimationFrame(animate); 
}
animate(); 

window.addEventListener('resize', function(e) {
  camera.aspect = aspect; 
  camera.updateProjectionMatrix(); 
  renderer.setSize(widths, height); 
})