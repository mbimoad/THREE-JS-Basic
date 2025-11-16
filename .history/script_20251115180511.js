import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const widths = window.innerWidth; 
const height = window.innerHeight;
const aspect = widths/height;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
camera.position.set(0, 4, 14);
camera.lookAt(0,0,0)
renderer.setSize(widths, height);
renderer.setClearColor(0xFEFEFE);
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update(); 
scene.add(new THREE.GridHelper(20, 20));
scene.add(new THREE.AmbientLight(0xFFFFFF, 1));

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

    scene.add(mirror); 
    scene.add(wall);
};
createInvisibleWall(8.09);


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
const groundMes = CreateGround(20, 0xABC00FF, 'ground', false, false); 
const groundHov = CreateGround(1, null, null, true, true);


// Loaders
const mixers = [];
const loader = new GLTFLoader();
const clock  = new THREE.Clock();
loader.load('./models/Chicken.gltf', item => {
    item.scene.scale.set(0.4,0.4,0.4); 
    item.scene.position.x = 0, 
    item.scene.rotation.y = -Math.PI/2 || 0; 
    scene.add(item.scene);

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


// Animation loop
function animate() {
    const delta = clock.getDelta();
    mixers.forEach(({ mixer, model }) => {
        mixer.update(delta);
        model.position.x -= 0.03;
        if (model.position.x < -10) model.position.x = 10;
    });
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(widths, height);
});