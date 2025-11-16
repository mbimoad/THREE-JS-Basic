import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

const widths = window.innerWidth; 
const height = window.innerHeight;
const aspect = widths/height;
const scenes = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
camera.position.set(0, 4, 14);
camera.lookAt(0,0,0)
renderer.setSize(widths, height);
renderer.setClearColor(0xFEFEFE);
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement);

let grid = 20; 
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update(); 
scenes.add(new THREE.GridHelper(grid, grid));
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1));

// Invisible walls
const createInvisibleWall = (x) => {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(8, 4, 2.2),
        new THREE.MeshBasicMaterial({ colorWrite: true, color: 0xFF00FF })
    );
    wall.position.set(x, 2, 0);
    wall.renderOrder = 1;
    // Mirror 
    let mirror = wall.clone(); 
    mirror.position.x = -x;
    scenes.add(mirror); 
    scenes.add(wall);
};
createInvisibleWall(8.09);


// Loaders
let ayam = undefined; 
const mixers = [];
const loader = new GLTFLoader();
const clock  = new THREE.Clock();
loader.load('./models/Chicken.gltf', item => {
    item.scene.scale.set(0.4,0.4,0.4); 
    item.scene.position.x = 0, 
    item.scene.rotation.y = -Math.PI/2 || 0; 
    scenes.add(item.scene);
    ayam = SkeletonUtils.clone(item.scene); 

    if(item.animations.length > 0) {
        const mixer    = new THREE.AnimationMixer(item.scene); 
        const walkIdle = THREE.AnimationClip.findByName(item.animations, 'Walk');
        if(walkIdle) {
            const action = mixer.clipAction(walkIdle); 
            action.play(); 
            mixers.push({mixer, model: item.scene})
        }
    }
    item.scene.traverse(i => {
        if(i.isMesh) i.renderOrder = 2; 
    })
})

// Pointing
const CreateGround = (size, color, name, istransparent, isvisible) => {
    const Mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size), 
        new THREE.MeshBasicMaterial({
            transparent: istransparent, 
            color: color, 
            side: THREE.DoubleSide
        })
    )
    Mesh.rotation.x = -Math.PI/2;
    Mesh.name = name;
    Mesh.visible = isvisible
    return Mesh; 
}
const groundMes = CreateGround(grid, 0xABC00FF, 'ground', false, false); 
const groundHov = CreateGround(1, null, null, true, true);
scenes.add(groundMes, groundHov)

let intersects  = undefined; 
let objects     = [];
const check = () => objects.find(i => i.position.x == groundHov.position.x && i.position.z == groundHov.position.z);
const mousePosition = new THREE.Vector2(); 
const raycaster = new THREE.Raycaster(); 
window.addEventListener('mousemove', function(e) {
    mousePosition.x =  (e.clientX / widths)  * 2 - 1; 
    mousePosition.y = -(e.clientY / height) * 2 + 1;   
    raycaster.setFromCamera(mousePosition, camera); 
    intersects = raycaster.intersectObjects(scenes.children); 
    intersects.forEach(item => {
        if(item.object.name == 'ground') {
            const hoverPos = new THREE.Vector3().copy(item.point).floor().addScalar(0.5); 
            groundHov.position.set(hoverPos.x, 0, hoverPos.z);
            if(check()) groundHov.material.color.setHex(0xFF0000)
            else groundHov.material.color.setHex(0x000000);
        }
    })
})
window.addEventListener('dblclick', function(e) {
    if(!check()){
        intersects.forEach(item => {
            if(item.object.name == 'ground') {

            }
        })
    }
})



// Animation loop
function animate() {
    const delta = clock.getDelta();
    mixers.forEach(({ mixer, model }) => {
        mixer.update(delta);
        model.position.x -= 0.03;
        if (model.position.x < -10) model.position.x = 10;
    });
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(widths, height);
});