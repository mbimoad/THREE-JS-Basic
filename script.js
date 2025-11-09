import * as THREE from 'three'; 
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as CANNON from 'cannon-es'; 
import * as YUKA from 'yuka'; 
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(0,2,15);
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0xFFFFFF); 
document.body.appendChild(renderer.domElement); 

scenes.add(new THREE.GridHelper(30,30))
const button = document.querySelector('button'); 
const controls = new PointerLockControls(camera, renderer.domElement); 
controls.addEventListener('lock', e => button.innerHTML = 'lock');
controls.addEventListener('unlock', e => button.innerHTML = 'unlock');
button.addEventListener('click', e => controls.lock()); 
const keyboard = []; 
window.addEventListener('keyup', e => keyboard[e.key] = false);
window.addEventListener('keydown', e => keyboard[e.key] = true);
const trigger = speed => {
    if(keyboard['s']) controls.moveForward(-speed);
    if(keyboard['w']) controls.moveForward(speed);
    if(keyboard['a']) controls.moveRight(-speed);
    if(keyboard['d']) controls.moveRight(speed);
}

const size = 1;
const brainWorld = new CANNON.World({gravity: new CANNON.Vec3(0, -9.81, 0)}); 
const brainGroun = new CANNON.Body({
    mass: 0, 
    shape: new CANNON.Plane(),
})
const brainBoxes = new CANNON.Body({
    mass: 1, 
    shape: new CANNON.Box(new CANNON.Vec3(size/2,size/2,size/2)), 
    position: new CANNON.Vec3(0, 5, 0)
}); 
brainWorld.addBody(brainGroun);
brainWorld.addBody(brainBoxes);
brainGroun.quaternion.setFromEuler(-Math.PI/2,0,0); 
const dmat = new CANNON.Material(); 
brainWorld.defaultContactMaterial = new CANNON.ContactMaterial(dmat, dmat, {friction: 0.9, restitution: 0.4}); 
const datas = []; 
const createBox = (pushdb, x,y, color) => {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(size,size,size), 
        new THREE.MeshBasicMaterial({color: color})
    )
    box.position.x = x; 
    box.position.y = y; 
    if(pushdb) datas.push(box); 
    return box;
}
const visualBox1 = createBox(false, 0, 0.5, 0xFF0000); 
scenes.add(visualBox1); 
const visualGnd1 = new THREE.Mesh(new THREE.PlaneGeometry(30,30), new THREE.MeshBasicMaterial({color: 0x00FF00})); 
scenes.add(visualGnd1); 
visualGnd1.rotation.x = -Math.PI/2; 
const brainAnimate = () => {
    brainWorld.step(1/60); 
    visualBox1.position.copy(brainBoxes.position);
    visualBox1.quaternion.copy(brainBoxes.quaternion);
}

const visualBox2 = createBox(false, -3, 0.5, 0x0000FF); 
scenes.add(visualBox2)
const mana = new YUKA.EntityManager(); 
const time = new YUKA.Time(); 
const goal = new YUKA.Vector3(0,0.5,5); 
const behv = new YUKA.SeekBehavior(goal); 
const ybox = new YUKA.Vehicle(); 
ybox.position.set(0,0.5,0); 
ybox.maxSpeed = 2; 
ybox.steering.add(behv); 
ybox.setRenderComponent(visualBox2, (e,r) => {
    r.position.copy(e.position)
})
mana.add(ybox); 

async function barcode() {
    const warna = "#DDBBAA"; 
    const canvas = document.createElement('canvas'); 
    canvas.width = 512; 
    canvas.height = 512; 
    const ctx = canvas.getContext('2d'); 
    ctx.textAlign = 'center'; 
    ctx.fillStyle = warna; 
    ctx.font = '40px Arial'; 
    ctx.fillRect(0,0,canvas.width,canvas.height); 
    ctx.fillText('kardus', canvas.width/2, 100); 

    const barcodeW = 300; 
    const barcodeH = barcodeW/2; 
    const barcodeI = await new Promise(resolved => {
        const image = new Image(); 
        image.src = './img/barcode.gif'; 
        image.crossOrigin = 'anonymous'; 
        image.onload = () => resolved(image); 
    })
    ctx.drawImage(barcodeI, (canvas.width - barcodeW)/2, barcodeH, barcodeW, barcodeH); 
    return {canvas, warna}
}
const b = await barcode(); 
setInterval(() => {
    const box = createBox(true, 3, datas.length - 1, b.warna); 
    const fro = new THREE.MeshBasicMaterial({color: b.warna}); 
    const bac = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(b.canvas)}); 
    const mul = [fro,fro,fro,bac,bac,bac]; 
    box.material = mul; 
    scenes.add(box); 
}, 2000);

const renderer2 = new CSS3DRenderer(); 
renderer2.domElement.style.position = 'absolute';
renderer2.domElement.style.top = '0';
renderer2.domElement.style.left = '0';
renderer2.domElement.style.right = '0';
renderer2.domElement.style.bottom = '0';
renderer2.setSize(widths, height); 
document.body.appendChild(renderer2.domElement); 

const div = document.querySelector('div'); 
const obj = new CSS3DObject(div); 
obj.scale.set(0.02, 0.02, 0.02); 
obj.position.copy(visualBox2.position); 
obj.position.y += 0.5; 
scenes.add(obj)

const animate = () => {
    mana.update(time.update().getDelta())
    trigger(0.02)
    brainAnimate();
    renderer.render(scenes, camera);
    renderer2.render(scenes,camera); 
    obj.position.copy(visualBox2.position); 
    obj.position.y += 0.5; 
    requestAnimationFrame(animate)

}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.render(widths, height)
})