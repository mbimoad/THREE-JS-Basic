import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update();

// FPS
// scenes.add(new THREE.GridHelper(gs,gs)); 
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1))
const controls = new PointerLockControls(camera, renderer.domElement);
const keyboard = []; 
const triggers = speed => {
    if(keyboard['w']) controls.moveForward(speed)
    if(keyboard['s']) controls.moveForward(-speed)
    if(keyboard['a']) controls.moveRight(-speed)
    if(keyboard['d']) controls.moveRight(speed)
} 
window.addEventListener('keyup', function(e) {
    console.log(e.key)
    if(e.key == "q") controls.lock();
    else keyboard[e.key] = false;
})
window.addEventListener('keydown', e => keyboard[e.key] = true)

const CreateGround = (s,c,n,t,v) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(s,s), new THREE.MeshBasicMaterial({transparent: t, color: c, side: THREE.DoubleSide})); 
    mesh.rotation.x = -Math.PI/2 || 0; 
    mesh.name = n; 
    mesh.visible = v; 
    return mesh;
}

// Pointing 
const textureLoad = new THREE.TextureLoader().load('./img/floor.jpg');
const ground      = CreateGround(30, null, 'ground', true, true);
ground.position.y = -0.5;
// cara buat ukuran texture kaya background size 30
textureLoad.wrapS = THREE.RepeatWrapping;
textureLoad.wrapT = THREE.RepeatWrapping;
textureLoad.repeat.set(6, 6);
ground.material.map = textureLoad; 

const hovers      = CreateGround(1, 0xFFFFFF, null, true, true);  
ground.rotation.x = -Math.PI/2;
scenes.add(ground, hovers)


const machines      = [];  
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
const machineLoader = (type,scale) => {
    // let src = `./models/monkey.glb`;
    let src = `./machine${type}/scene.gltf`;
    modeloader.load(src, item => {
        scenes.add(item.scene); 
        item.scene.position.copy(hovers.position); 
        item.scene.scale.set(scale,scale,scale)
        item.scene.position.y = scale;
        machines.push(item.scene); 
        console.log(machines)
    }) 
}

window.addEventListener('dblclick', function(e) {
    if(!checkers()) {
        intersects.forEach(item => {
            if(item.object.name == 'ground') {
                machineLoader(3, 0.5);
            }
        })
    }
})



const animate = () => {
    triggers(0.06);
    renderer.render(scenes, camera); 
    requestAnimationFrame(animate)
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})