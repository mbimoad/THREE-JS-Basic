import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ======================
// Setup Scene, Camera, Renderer
// ======================
const scene = new THREE.Scene();
scene.add(new THREE.GridHelper(50, 50));

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x333333);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Helper update
function update(obj) {
    obj.updateMatrixWorld(true);
}

// ======================
// Materi 1: Parent & Child + updateMatrixWorld
// ======================
const parent = new THREE.Mesh(
    new THREE.BoxGeometry(5, 5, 5),
    new THREE.MeshNormalMaterial()
);
parent.position.set(0, 2.5, 0);
scene.add(parent);

const child = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 16, 16),
    new THREE.MeshNormalMaterial({ wireframe: true })
);
child.position.set(3, 3, 0);
parent.add(child);

setInterval(() => {
    parent.rotation.y += 0.01;
    update(parent);

    child.position.x += 0.1;

    console.log("Child World Pos:", child.getWorldPosition(new THREE.Vector3()));
}, 1000);

// ======================
// Materi 2: localToWorld & worldToLocal
// ======================
setInterval(() => {
    const local = new THREE.Vector3(2, 0, 0);
    const world = parent.localToWorld(local.clone());
    const back = parent.worldToLocal(world.clone());

    console.log("Local -> World:", world);
    console.log("World -> Local:", back);
}, 2000);

// ======================
// Materi 3: Bounding (Box + Center + Size + Sphere) – DIGABUNG
// ======================
const boundObj = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshNormalMaterial({ wireframe: true })
);
boundObj.position.set(-10, 1, 0);
scene.add(boundObj);

const box = new THREE.Box3();
const sphere = new THREE.Sphere();
const tempVec = new THREE.Vector3();

setInterval(() => {
    boundObj.rotation.y += 0.01;
    update(boundObj);

    box.setFromObject(boundObj);
    box.getBoundingSphere(sphere);

    console.log("Box Size:", box.getSize(tempVec.clone()));
    console.log("Box Center:", box.getCenter(tempVec.clone()));
    console.log("Sphere Radius:", sphere.radius);
}, 1000);

// ======================
// Materi 4: Quaternion, Scale, Decompose, Translate, Rotate
// ======================
const advancedMesh = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 3, 8),
    new THREE.MeshNormalMaterial({ wireframe: true })
);
advancedMesh.position.set(10, 1, 0);
scene.add(advancedMesh);

update(advancedMesh);

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
const scl = new THREE.Vector3();

advancedMesh.matrixWorld.decompose(pos, quat, scl);
console.log("Decompose ->", pos, quat, scl);

advancedMesh.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 4));
advancedMesh.translateX(1);
advancedMesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 6);

setInterval(() => {
    advancedMesh.rotation.x += 0.01;
    advancedMesh.rotation.z += 0.005;
    update(advancedMesh);
}, 16);

// ======================
// Materi 5: getWorldDirection
// ======================
const dirObj = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 3),
    new THREE.MeshNormalMaterial()
);
dirObj.position.set(0, 5, -10);
scene.add(dirObj);

setInterval(() => {
    dirObj.rotation.y += 0.2;
    update(dirObj);

    const dir = new THREE.Vector3();
    dirObj.getWorldDirection(dir);

    console.log("World Direction:", dir);
}, 800);

// ======================
// Materi 6: translateOnAxis
// ======================
const mover = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 16),
    new THREE.MeshNormalMaterial()
);
mover.position.set(-15, 1, -5);
scene.add(mover);

setInterval(() => {
    mover.translateOnAxis(new THREE.Vector3(0, 0, 1), 0.2);
    update(mover);

    console.log("Mover:", mover.position);
}, 500);

// ======================
// Materi 7: rotateAroundPoint
// ======================
function rotateAroundPoint(obj, point, axis, angle) {
    obj.position.sub(point);
    obj.position.applyAxisAngle(axis, angle);
    obj.position.add(point);
    obj.rotateOnAxis(axis, angle);
}

const orbiter = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial({ wireframe: true })
);
orbiter.position.set(5, 5, 0);
scene.add(orbiter);

const pivot = new THREE.Vector3(0, 5, 0);

setInterval(() => {
    rotateAroundPoint(orbiter, pivot, new THREE.Vector3(0, 1, 0), 0.05);
    update(orbiter);
}, 50);

// ======================
// Materi 8: ATTACH (Reparent Keep World Transform)
// ======================
function reparentKeepWorld(child, newParent) {
    update(child);

    const pos = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
    const quat = new THREE.Quaternion();
    child.getWorldQuaternion(quat);
    const scl = new THREE.Vector3();
    child.getWorldScale(scl);

    newParent.add(child);

    child.position.copy(pos);
    child.quaternion.copy(quat);
    child.scale.copy(scl);
}

const attachA = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshNormalMaterial());
const attachB = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshNormalMaterial());
const attachChild = new THREE.Mesh(new THREE.SphereGeometry(0.8,16,16), new THREE.MeshNormalMaterial({wireframe:true}));

attachA.position.set(15,2,0);
attachB.position.set(20,2,0);
attachChild.position.set(15,4,0);

scene.add(attachA, attachB, attachChild);

setTimeout(() => {
    reparentKeepWorld(attachChild, attachB);
}, 3000);

// ======================
// Materi 9: Instanced Mesh
// ======================
const geo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0xff5555 });
const cube = new THREE.Mesh(geo, mat);
cube.position.set(-3, 0.5, 0);
scenes.add(cube);

const count = 100;
const inst = new THREE.InstancedMesh(geo, mat, count);
const dummy = new THREE.Object3D();
for (let i = 0; i < count; i++) {
    dummy.position.set(
        (Math.random() - 0.5) * 10,
        0.5,
        (Math.random() - 0.5) * 10
    );
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
}
scenes.add(inst);

const instGeom = new THREE.BoxGeometry(1, 1, 1);
const instMat = new THREE.MeshNormalMaterial();
const instCount = 20;

const instanced = new THREE.InstancedMesh(instGeom, instMat, instCount);
scene.add(instanced);

const dummy = new THREE.Object3D();

for (let i = 0; i < instCount; i++) {
    dummy.position.set(
        Math.random() * 10 - 5,
        Math.random() * 5 + 1,
        Math.random() * 10 - 5
    );
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
}
instanced.instanceMatrix.needsUpdate = true;

const loader = new GLTFLoader();
loader.load('./models/monkey.glb', (gltf) => {
    const original = gltf.scene.children[0];    
    const geometry = original.geometry;
    const material = original.material;

    const count = 5000;
    const inst = new THREE.InstancedMesh(geometry, material, count);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
        dummy.position.set(
            Math.random() * 100,
            0,
            Math.random() * 100
        );
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
    }

    inst.instanceMatrix.needsUpdate = true;
    scene.add(inst);
});

// ======================
// Materi 10: Texture Repeat
// ======================
const texLoader = new THREE.TextureLoader();
const floorTex = texLoader.load("https://threejs.org/examples/textures/brick_diffuse.jpg");
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(4, 4);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({ map: floorTex })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.01;
scene.add(floor);

// ======================
// Render Loop
// ======================
function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// ======================
// Resize Handling
// ======================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});