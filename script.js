import * as THREE from 'three'; 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as CANNON from 'cannon-es'; 
import * as YUKA from 'yuka'; 
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(10, 20, 25); 
camera.lookAt(0,0,0)

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0xFFFFFF); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement);

scenes.add(new THREE.GridHelper(30, 30)); 
let keyboard = []; 
let button = document.querySelector('button'); 
let controls = new PointerLockControls(camera, renderer.domElement); 
button.addEventListener('click', function(e) {
    controls.lock(); 
})
controls.addEventListener('lock', e => button.innerHTML = 'lock');
controls.addEventListener('unlock', e => button.innerHTML = 'unlock');
window.addEventListener('keyup', e => {
    keyboard[e.key] = false; 
})
window.addEventListener('keydown', e => {
    keyboard[e.key] = true; 
})
function triggerKeyboard(speed) {
    if(keyboard['w']) controls.moveForward(speed);
    if(keyboard['s']) controls.moveForward(-speed);
    if(keyboard['d']) controls.moveRight(speed);
    if(keyboard['a']) controls.moveRight(-speed);
}
let size = 1; 
let datas = []; 
const brainWorld = new CANNON.World({gravity: new CANNON.Vec3(0, -9.81, 0)}); 
const brainGroun = new CANNON.Body({
    mass: 0, 
    shape: new CANNON.Plane()
}); 
const brainBoxes = new CANNON.Body({
    mass: 1, 
    shape: new CANNON.Box(new CANNON.Vec3(size/2,size/2,size/2)), 
    position: new CANNON.Vec3(0, 5, 0)
})
const dmat = new CANNON.Material(); 
brainWorld.defaultContactMaterial = new CANNON.ContactMaterial(dmat, dmat, {friction: 0.9, restitution: 0.4})
brainWorld.addBody(brainGroun);
brainWorld.addBody(brainBoxes);
brainGroun.quaternion.setFromEuler(-Math.PI/2,  0, 0); 

const createbox = (pushdb,x,y,color) => {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size,size,size), 
        new THREE.MeshBasicMaterial({color: color})
    ); 
    mesh.position.x = x; 
    mesh.position.y = y;
    if(pushdb) datas.push(mesh)
    return mesh; 
}
const visualBox1 = createbox(false, 0,0,0xFFFF00); 
const visualGnd1 = new THREE.Mesh(new THREE.PlaneGeometry(30,30), new THREE.MeshBasicMaterial({color: 0xFFFFFF})); 
visualGnd1.rotation.x = -Math.PI/2; 
scenes.add(visualBox1);
scenes.add(visualGnd1);
const brainAnimate = () => {
    brainWorld.step(1/60); 
    visualBox1.position.copy(brainBoxes.position);
    visualBox1.quaternion.copy(brainBoxes.quaternion);
}

const visualBox2 = createbox(false, 0, 0, 0xFF00FF); 
const mana = new YUKA.EntityManager(); 
const time = new YUKA.Time(); 
const ybox = new YUKA.Vehicle(); 
const goal = new YUKA.Vector3(5,0,0); 
const behv = new YUKA.SeekBehavior(goal); 
ybox.position.set(0,0,0); 
ybox.maxSpeed = 2; 
ybox.steering.add(behv); 
ybox.setRenderComponent(visualBox2, (e,r) => {
    r.position.copy(e.position)
}); 
mana.add(ybox); 
scenes.add(visualBox2); 

async function barcode() {
    const warnas  = "#DDBBAA"; 
    const canvas  = document.createElement('canvas'); 
    canvas.width  = 512; 
    canvas.height = 512;
    const ctx = canvas.getContext('2d'); 
    ctx.textAlign = 'center'; 
    ctx.font = '40px Arial'; 
    ctx.fillStyle = warnas; 
    ctx.fillRect(0,0,canvas.width,canvas.height); 
    ctx.fillText('kardus',canvas.width/2, 100); 
    
    const barcodeW = 300; 
    const barcodeH = barcodeW/2; 
    const barcodeI = await new Promise(resolved => {
        const image = new Image(); 
        image.src = "./img/barcode.gif"; 
        image.crossOrigin = 'anonymous'; 
        image.onload = () => resolved(image); 
    })

    ctx.drawImage(barcodeI, (canvas.width - barcodeW), barcodeH, barcodeW, barcodeH); 
    return {
        canvas, warnas
    }
}
const b = await barcode() 
setInterval(() => {
    const boxes = createbox(true, 6, datas.length-1 + 5, b.warnas); 
    const front = new THREE.MeshBasicMaterial({color: b.warnas}); 
    const backs = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(b.canvas)}); 
    const multi = [front,front,backs,backs,backs,backs]; 
    boxes.material = multi; 
    scenes.add(boxes)
}, 2000);

const renderer2 = new CSS3DRenderer(); 
document.body.appendChild(renderer2.domElement); 
renderer2.setSize(widths,height); 
renderer2.domElement.style.position = 'absolute';
renderer2.domElement.style.top = '0';
renderer2.domElement.style.left = '0';
renderer2.domElement.style.right = '0';
renderer2.domElement.style.bottom = '0';
renderer2.domElement.style.zIndex = '1';
const div = document.querySelector('div'); 
const obj = new CSS3DObject(div); 
obj.scale.set(0.02, 0.02, 0.02); 
obj.position.copy(visualBox2.position); 
obj.position.y += 0.5; 
scenes.add(obj)

const animate = () => {
    mana.update(time.update().getDelta(0))
    triggerKeyboard(0.2);
    brainAnimate();

    obj.position.copy(visualBox2.position); 
    obj.position.y += 0.5;
    renderer2.render(scenes, camera); 


    renderer.render(scenes, camera); 
    requestAnimationFrame(animate)
}
animate(); 


window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})