import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ======================
// Scene, Camera, Renderer
// ======================
const scene = new THREE.Scene();
scene.add(new THREE.GridHelper(50, 50));

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,20,40);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x333333);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// ======================
// Materi 1: Parent & Child (updateMatrixWorld)
// ======================
const parent = new THREE.Mesh(
    new THREE.BoxGeometry(5,5,5),
    new THREE.MeshNormalMaterial()
);
parent.position.set(0,2.5,0);
scene.add(parent);

const child = new THREE.Mesh(
    new THREE.SphereGeometry(1.5,16,16),
    new THREE.MeshNormalMaterial({wireframe:true})
);
child.position.set(3,3,0); // posisi lokal relatif parent
parent.add(child);

// Animasi rotasi parent
const animate = () => {
    parent.rotation.y += 0.01;
    parent.updateMatrixWorld(true);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};
animate();

// Simulasi updateMatrixWorld setiap detik
setInterval(() => {
    child.position.x += 0.1; 
    
    const beforeChild = child.getWorldPosition(new THREE.Vector3());
    const beforeParent = parent.getWorldPosition(new THREE.Vector3());
    
    parent.updateMatrixWorld(true);
    
    const afterChild = child.getWorldPosition(new THREE.Vector3());
    const afterParent = parent.getWorldPosition(new THREE.Vector3());
    
    console.log(`Child local x: ${child.position.x.toFixed(2)}, before: ${beforeChild.x.toFixed(2)}, after: ${afterChild.x.toFixed(2)}`);
}, 1000);

// ======================
// Materi 2: localToWorld & worldToLocal
// ======================
const localPoint = new THREE.Vector3(1,1,0);
const worldPoint = parent.localToWorld(localPoint.clone());
const backToLocal = parent.worldToLocal(worldPoint.clone());
console.log("Local -> World:", localPoint, "->", worldPoint);
console.log("World -> Local:", worldPoint, "->", backToLocal);

setInterval(() => {
    const local = new THREE.Vector3(2,0,0);
    const world = parent.localToWorld(local.clone());
    console.log("Local -> World:", local, "->", world);

    const back = parent.worldToLocal(world.clone());
    console.log("World -> Local:", world, "->", back);
}, 2000);

// ======================
// Materi 3: Advanced Positioning / Matrix / Bounding
// ======================
const demoBox = new THREE.Mesh(
    new THREE.BoxGeometry(2,2,2),
    new THREE.MeshNormalMaterial({wireframe:true})
);
demoBox.position.set(-10,1,0);
scene.add(demoBox);

const demoBounding = new THREE.Box3().setFromObject(demoBox);
console.log("Demo Box Bounding Min:", demoBounding.min, "Max:", demoBounding.max);
console.log("Demo Box Center:", demoBounding.getCenter(new THREE.Vector3()));
console.log("Demo Box Size:", demoBounding.getSize(new THREE.Vector3()));

demoBox.updateMatrixWorld(true);
const posFromMatrix = new THREE.Vector3().setFromMatrixPosition(demoBox.matrixWorld);
console.log("Demo Box Position from matrixWorld:", posFromMatrix);

const localDemo = new THREE.Vector3(0.5,0.5,0);
const worldDemo = demoBox.localToWorld(localDemo.clone());
const backToLocalDemo = demoBox.worldToLocal(worldDemo.clone());
console.log("Demo Box Local -> World:", localDemo, "->", worldDemo);
console.log("Demo Box World -> Local:", worldDemo, "->", backToLocalDemo);

demoBox.lookAt(new THREE.Vector3(0,0,0));

setInterval(() => {
    demoBox.rotation.x += 0.01;
    demoBox.rotation.z += 0.005;
    demoBox.updateMatrixWorld(true);
}, 16);

// ======================
// Materi 4: Quaternion, Scale, Decompose, Translate & Rotate
// ======================
const advancedMesh = new THREE.Mesh(
    new THREE.ConeGeometry(1.5,3,8),
    new THREE.MeshNormalMaterial({wireframe:true})
);
advancedMesh.position.set(10,1,0);
scene.add(advancedMesh);

const worldQuat = new THREE.Quaternion();
advancedMesh.getWorldQuaternion(worldQuat);
console.log("Advanced Mesh World Quaternion:", worldQuat);

const worldScale = new THREE.Vector3();
advancedMesh.getWorldScale(worldScale);
console.log("Advanced Mesh World Scale:", worldScale);

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
const scale = new THREE.Vector3();
advancedMesh.updateMatrixWorld(true);
advancedMesh.matrixWorld.decompose(pos, quat, scale);
console.log("Decomposed matrixWorld -> pos:", pos, "quat:", quat, "scale:", scale);

const rotateMatrix = new THREE.Matrix4().makeRotationY(Math.PI/4);
advancedMesh.applyMatrix4(rotateMatrix);
advancedMesh.updateMatrixWorld(true);
console.log("Advanced Mesh Position after applyMatrix4:", advancedMesh.position);

advancedMesh.translateX(1);
advancedMesh.translateY(0.5);
advancedMesh.translateZ(-0.5);
advancedMesh.updateMatrixWorld(true);
console.log("Advanced Mesh after translate (local):", advancedMesh.position);

advancedMesh.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/6);
advancedMesh.updateMatrixWorld(true);
console.log("Advanced Mesh after rotateOnAxis:", advancedMesh.rotation);

const lookTarget = new THREE.Vector3(0,0,0);
advancedMesh.lookAt(lookTarget);
console.log("Advanced Mesh lookAt target:", lookTarget);

// Animasi tambahan agar kelihatan bergerak
setInterval(() => {
    advancedMesh.rotation.x += 0.01;
    advancedMesh.rotation.z += 0.005;
    advancedMesh.updateMatrixWorld(true);
}, 16);

// ======================
// Resize handling
// ======================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});