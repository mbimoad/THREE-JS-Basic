import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

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
scene.add(new THREE.GridHelper(12, 12));
scene.add(new THREE.AmbientLight(0xFFFFFF, 1));

// Invisible walls
const createInvisibleWall = (x) => {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(8, 4, 2.2),
        new THREE.MeshBasicMaterial({ colorWrite: false })
    );
    wall.position.set(x, 2, 0);
    wall.renderOrder = 1;
    scene.add(wall);
};
createInvisibleWall(-8.09);
createInvisibleWall(8.09);

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
        const mixer = 
    }
})

// Utility function for loading models
function loadModel({ path, scale, positionX, rotationY, animName }) {
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.x = positionX;
        model.rotation.y = rotationY || 0;
        scene.add(model);

        // Animation
        if (gltf.animations.length && animName) {
            const mixer = new THREE.AnimationMixer(model);
            const clip = THREE.AnimationClip.findByName(gltf.animations, animName);
            if (clip) {
                const action = mixer.clipAction(clip);
                action.play();
                mixers.push({ mixer, model });
            }
        }

        model.traverse((node) => {
            if (node.isMesh) node.renderOrder = 2;
        });
    });
}


loadModel({
    path: '../models/Chicken.gltf',
    scale: 0.4,
    positionX: 0,
    rotationY: -Math.PI / 2,
    animName: 'Walk'
});

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