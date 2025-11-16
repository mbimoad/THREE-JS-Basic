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
renderer.setClearColor(0xFFFFFF); 
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.enableRotate = false; 

let box = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1), 
    new THREE.MeshStandardMaterial({color: 0x0000FF})
); 
box.position.set(0, 0.5, -3); 
box.position.drag = true; 
scenes.add(box);

let gap1 = 2;
let gap2 = gap1 + .2; 
let grid = []; 
let target = undefined; 
let drag = false; 



let mousePosition = new THREE.Vector2(); 
let raycaster     = new THREE.Raycaster(); 

function updateMouse(e) {
    mousePosition.x =  (e.clientX / window.innerWidth ) * 2 - 1; 
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;  
}
function whenMouseDown(e) {
   
}
function whenMouseUp(e) {
  
}
function whenMouseMove(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mousePosition, camera); 
    if(drag) {
        const io = raycaster.intersectObjects(grid, true); 
        if(io.length > 0) {
            const i = io[0]; 
            target  = new THREE.Vector3(i.object.position.x, i.object.position.y + 0.5, i.object.position.z)
        } else {
            const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0); 
            const point = new THREE.Vector3(); 
            raycaster.ray.intersectPlane(plane, point); 
            if(point) target = new THREE.Vector3(point.x, 0.5, point.z)
        }
    } 
}


function animate() {
    orbit.update(); 
    if(target && !box.position.equals(target)) box.position.lerp(target, 0.1);
    renderer.render(scenes, camera); 
    requestAnimationFrame(animate);
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})
window.addEventListener('pointermove', whenMouseMove, false);
window.addEventListener('pointerup', whenMouseUp, false);
window.addEventListener('pointerdown', whenMouseDown, false);