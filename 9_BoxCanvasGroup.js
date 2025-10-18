import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(10, aspect, 0.1, 1000); 
camera.position.set(30, 30, 30); 
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 

// Nomral Style
let datas = []; 
const createNormalBox = (positionY, color) => {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(2,2,2), 
        new THREE.MeshBasicMaterial({color: color})
    )
    box.position.y = positionY; 
    datas.push(box); 
    return box;
}
const box1 = createNormalBox(0, 0xFF00FF); 
const box2 = createNormalBox(2, 0xFF0000); 
const box3 = createNormalBox(4, 0x0000FF); 
scenes.add(box1);

// Barcode style
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

const barcode  = await createBarcode(); 
const brown    = new THREE.MeshBasicMaterial({color: barcode.warna}); 
const front    = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(barcode.canvas)}); 
const material = [brown, brown, brown, front, front, brown]; 
box1.material   = material; // ubah box material ke material


window.addEventListener('keypress', function(e) {
    let gap = 3;
    if(e.key == 'Enter') createNormalBox(datas.length * gap); 
})

// Group 
const model = new THREE.Group(); 
model.add(box2);
model.add(box3);
scenes.add(model); 

function animate() {
    model.rotateY(0.04);
    box1.rotateY(-0.04);
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})