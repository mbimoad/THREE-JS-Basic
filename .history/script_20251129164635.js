
import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(0,2,15); 
camera.lookAt(0,0,0); 
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor(0x555555);  
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(widths, height);
document.body.appendChild(renderer.domElement); 
let gs = 30; 

// 1. Buat tangan ala Minecraft
const handGeometry = new THREE.BoxGeometry(.5, .5, 2); // ukuran tangan
const handMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc99 }); // warna kulit
const hand = new THREE.Mesh(handGeometry, handMaterial);

hand.position.set(1, 2, -2); // x = kanan, y = bawah, z = ke depan
camera.add(hand);
scenes.add(camera);

// FPS
scenes.add(new THREE.GridHelper(gs,gs, 0x00FF00, 0x00FF00)); 
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1))
const controls = new PointerLockControls(camera, renderer.domElement);


const keyboard = []; 
const triggers = (speed) => {
    if(keyboard['w']) controls.moveForward(speed)
    if(keyboard['s']) controls.moveForward(-speed)
    if(keyboard['a']) controls.moveRight(-speed)
    if(keyboard['d']) controls.moveRight(speed)

    const limit = gs / 2 - 1; // batas ruangan, minus margin
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -limit, limit);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -limit, limit);
    camera.position.y = Math.max(1, camera.position.y); 
}

window.addEventListener('keyup', function(e) {
    console.log(e.key)
    if(e.key == "q") controls.lock();
    else keyboard[e.key] = false;
})
window.addEventListener('keydown', e => keyboard[e.key] = true)

// Texture Prepare 
const textureLoad = new THREE.TextureLoader() 
const floor       = textureLoad.load('./img/floor.jpg');
const wall        = textureLoad.load('./img/wall.jpg');

const CreateGround = (s,c,n,t,v) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(s,s), new THREE.MeshBasicMaterial({transparent: t, color: c, side: THREE.DoubleSide})); 
    mesh.rotation.x = -Math.PI/2 || 0; 
    mesh.name = n; 
    mesh.visible = v; 
    return mesh;
}


// Pointing 
const ground      = CreateGround(30, null, 'ground', true, true);
ground.position.y = -0.1;
floor.wrapS = THREE.RepeatWrapping;
floor.wrapT = THREE.RepeatWrapping;
floor.repeat.set(7, 7);
ground.material.map = floor; 
ground.material.color.multiplyScalar(0.7)

const hovers      = CreateGround(1, 0xFFFFFF, null, true, true);  
ground.rotation.x = -Math.PI/2;
scenes.add(ground, hovers)



const machines      = [
    { "machine": 3, "position": new THREE.Vector3(-1.5, 0.5, .5 ) },
    { "machine": 3, "position": new THREE.Vector3(-14.5, 0.5, 14.5) },
    { "machine": 3, "position": new THREE.Vector3(13.5, 0.5, -14.5) },
];
const checkers      = () => machines.find(i => i.position.x === hovers.position.x && i.position.z === hovers.position.z);
const mousePosition = new THREE.Vector2(); 
const raycaster     = new THREE.Raycaster(); 
let intersects      = undefined; 
const getIntersects = (e,obj,s) => {
    mousePosition.x =  (e.clientX/widths) * 2 - 1;
    mousePosition.y = -(e.clientY/height) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera); 
    if(s) return raycaster.intersectObjects(obj); 
    else return raycaster.intersectObject(obj); 
}
window.addEventListener('mousemove', function(e) {
    intersects = getIntersects(e, scenes.children, true);
    intersects.forEach(i => {
        if(i.object.name == 'ground') {
            const point = new THREE.Vector3().copy(i.point).floor().addScalar(0.5);
            hovers.position.set(point.x, 0, point.z); 
            if(checkers()) hovers.material.color.set(0xFF0000); 
            else hovers.material.color.set(0xFFFFFF)
        }
    }) 
})

const modeloader    = new GLTFLoader(); 
const machineLoader = (type,scale,load,position) => {
    // let src = `./models/monkey.glb`;
    let src = `./machine${type}/scene.gltf`;
    modeloader.load(src, item => {
        scenes.add(item.scene); 
        item.scene.scale.set(scale,scale,scale)
 
        if(!load) {
            item.scene.position.copy(hovers.position);  
            machines.push({
                machine: type, 
                position: item.scene.position
            });    
        } else {
            item.scene.position.copy(position)
        }
        item.scene.position.y = scale;
    }) 
}

window.addEventListener('dblclick', function(e) {
    if(!checkers()) {
        intersects.forEach(item => {
            if(item.object.name == 'ground') {
                machineLoader(3, 0.5, false, null);
            }
        })
    }
})

// Bikin Tembok
const wallHeight = 5;
const wallThickness = 0.5;
const wallMaterial = new THREE.MeshStandardMaterial({ map: wall });
wallMaterial.color.multiplyScalar(0.7);

// Helper buat mesh
function createMesh(geometry, material, x, y, z, rx = 0, ry = 0, rz = 0) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    scenes.add(mesh);
    return mesh;
}

const halfGS = gs / 2;
const halfHeight = wallHeight / 2;

// Buat tembok depan & belakang
let depan    = createMesh(new THREE.BoxGeometry(gs, wallHeight, wallThickness), wallMaterial, 0, halfHeight,  halfGS);
let belakang = createMesh(new THREE.BoxGeometry(gs, wallHeight, wallThickness), wallMaterial, 0, halfHeight, -halfGS);

// Buat tembok kiri & kanan
let kiri  = createMesh(new THREE.BoxGeometry(wallThickness, wallHeight, gs), wallMaterial, -halfGS, halfHeight, 0);
let kanan = createMesh(new THREE.BoxGeometry(wallThickness, wallHeight, gs), wallMaterial,  halfGS, halfHeight, 0);

// Tambah lukisan
const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xFF00FF})); 
kiri.add(box)

// Buat atap sederhana (piramida segiempat)
const roofHeight = 3;
const roofMaterial = new THREE.MeshStandardMaterial({ map: wall });
createMesh(new THREE.ConeGeometry(halfGS * Math.sqrt(2), roofHeight, 4), roofMaterial, 0, wallHeight + roofHeight/2, 0, 0, Math.PI/4, 0);



const renderer2 = new CSS3DRenderer(); 
const cssobjs = [];
document.body.appendChild(renderer2.domElement); 
renderer2.setSize(widths, height);
renderer2.domElement.style.position = 'absolute'; 
renderer2.domElement.style.top = '0'; 
renderer2.domElement.style.left = '0'; 
renderer2.domElement.style.right = '0'; 
renderer2.domElement.style.bottom = '0'; 
renderer2.domElement.style.zIndex = '1'; 
renderer2.domElement.style.pointerEvents = 'none'; 
const createDiv = (teks,position) => {
    const div = document.createElement('div');
    div.textContent = teks;
    div.setAttribute("class", "machine_status")
    document.body.appendChild(div);   
    let cssobj = new CSS3DObject(div); 
    cssobj.scale.set(0.02,0.02,0.02,0.02); 
    cssobj.position.copy(position); 
    cssobj.position.y += 0.8; 
    scenes.add(cssobj) 
}
let inc = 1;
window.addEventListener('mousedown', function(e) {
    document.querySelector('.machine_status').innerHTML = parseInt(inc++);
})

// Loaders
machines.forEach(item => {
    console.log(machines)
    machineLoader(item.machine, 0.5, true, item.position)
    createDiv(`Machine ${item.machine}`, item.position); 
})



const animate = () => {
    hand.position.y = -1 + Math.sin(Date.now() * 0.005) * 0.1;
    triggers(0.2);

    renderer.render(scenes, camera); 
    renderer2.render(scenes,camera)

    requestAnimationFrame(animate)
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})