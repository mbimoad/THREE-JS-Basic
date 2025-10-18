import * as THREE from 'three'; 
import * as CANON from 'cannon-es'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height;
const scenes = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(30, 30, 30); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setClearColor(0xFFFFFF); 
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
const grids = new THREE.GridHelper(30); 
const light = new THREE.DirectionalLight(); 
orbit.update();
scenes.add(grids);
scenes.add(light);

// Ground
const worlds    = new CANON.World({gravity: new CANON.Vec3(0, -9.81, 0)});
const groundGeo = new THREE.PlaneGeometry(30, 30); 
const groundMat = new THREE.MeshBasicMaterial({color: 0xFF00FF});
const groundMes = new THREE.Mesh(groundGeo, groundMat);
const groundPhy = new CANON.Material(); 
const groundBdy = new CANON.Body({
    type: CANON.Body.STATIC, 
    material: groundPhy, 
    shape: new CANON.Box(new CANON.Vec3(15, 15, 0.1)), // Penulisan shape Berlaku untuk planeGeometry, boxGeometry
})
groundBdy.quaternion.setFromEuler(-Math.PI/2, 0, 0); // Mendatarkan
scenes.add(groundMes);
worlds.addBody(groundBdy);

const mousePosition = new THREE.Vector2(); 
const raycaster     = new THREE.Raycaster(); 
const intersects    = new THREE.Vector3(); 
const groundsVector = new THREE.Vector3(); 
const grounds       = new THREE.Plane(); 

window.addEventListener('mousemove', function(e) {
    mousePosition.x =   (e.clientX / widths) * 2 - 1;
    mousePosition.y = - (e.clientY / height) * 2 + 1;
    groundsVector.copy(camera.position).normalize(); 
    grounds.setFromNormalAndCoplanarPoint(groundsVector, scenes.position); 
    raycaster.setFromCamera(mousePosition, camera); 
    raycaster.ray.intersectPlane(grounds, intersects);
})
window.addEventListener('click', function() {createBall(1);})
const arr_ballMesh = []; 
const arr_ballBody = []; 

const createBall = (size) => {
    const ballGeo = new THREE.SphereGeometry(size, 30, 30); 
    const ballMat = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xFFFFFF, 
        metalness: 0,
        roughness: 0, 
    })
    const ballMes = new THREE.Mesh(ballGeo, ballMat);
    const ballPhy = new CANON.Material(); 
    const ballBdy = new CANON.Body({
        shape: new CANON.Sphere(size), 
        mass: 10, 
        material: ballPhy, 
        position: new CANON.Vec3(intersects.x, intersects.y, intersects.z)
    })
    ballMes.castShadow = true;     
    
    const ballGround = new CANON.ContactMaterial(ballPhy, groundPhy, {friction: 0.1}); 
    scenes.add(ballMes);
    worlds.addBody(ballBdy); 
    worlds.addContactMaterial(ballGround); 

    arr_ballMesh.push(ballMes); 
    arr_ballBody.push(ballBdy);
}


// Orbit modification
orbit.panSpeed = 2; 
orbit.rotateSpeed = 2; 
orbit.maxDistance = 10; 
orbit.enablePan = false; 
orbit.enableDamping = true; 
orbit.autoRotate = true; 
orbit.autoRotateSpeed = 5; 
orbit.target = new THREE.Vector3(2,2,2); 

orbit.mouseButtons.RIGHT = THREE.MOUSE.ROTATE; 
orbit.mouseButtons.LEFT = THREE.MOUSE.PAN;
orbit.keys = {
    LEFT: 'ArrowLeft', 
    UP: 'ArrowUp', 
    RIGHT: 'KeyD', 
    DOWN: 'KeyS',
}
orbit.listenToKeyEvents(window);
orbit.keyPanSpeed = 20; 
orbit.minAzimuthAngle = Math.PI/4; 
orbit.minPolarAngle   = Math.PI/4; 
orbit.maxAzimuthAngle = Math.PI/2; 
orbit.maxPolarAngle   = Math.PI/2; 
window.addEventListener('keydown', function(e) {
    if(e.code == "KeyS") orbit.saveState(); 
    if(e.code == "KeyL") orbit.reset(); 
})


function animate() {
    worlds.step(1/60);
    groundMes.position.copy(groundBdy.position);
    groundMes.quaternion.copy(groundBdy.quaternion);
    for(let i=0; i<arr_ballMesh.length; i++) {
        arr_ballMesh[i].position.copy(arr_ballBody[i].position);
        arr_ballMesh[i].quaternion.copy(arr_ballBody[i].quaternion);
    }
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height);
})