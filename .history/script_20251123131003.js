import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x333333);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Helpers
scene.add(new THREE.GridHelper(20, 20));
scene.add(new THREE.AmbientLight(0xffffff, 1));

// Boxes and hover
let hoverBoxes = [], stackedBoxes = [], container = {}, spinningBox = null;
const MAX_STACKED = 5;

function createBox({ width=1, height=1, depth=1, color=0xffffff, opacity=1, transparent=false }) {
    return new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshBasicMaterial({ color, opacity, transparent })
    );
}

// Hover grid creation
function createHoverGrid(parent, config) {
    const { width, depth, rows, cols, namePrefix } = config;
    const boxHeight = 0.3;
    const cellW = width / cols;
    const cellD = depth / rows;
    
    for (let i=0; i<cols; i++){
        for (let j=0; j<rows; j++){
            const hover = createBox({ width: cellW, height: 0.01, depth: cellD, color: 0x00ff00, opacity: 0 });
            hover.position.set(
                parent.position.x - width/2 + cellW/2 + i*cellW,
                parent.position.y + 0.01,
                parent.position.z - depth/2 + cellD/2 + j*cellD
            );
            hover.name = `${namePrefix}-${i}-${j}`;
            hover.userData = { cw: cellW, ch: cellD, bh: boxHeight };
            container[hover.name] = 0;
            hoverBoxes.push(hover);
            scene.add(hover);
        }
    }
}

// Stack boxes on hover
function stackBox(hover) {
    const count = container[hover.name];
    if (count >= MAX_STACKED) { alert("MAX STACK REACHED"); return; }

    const { cw, ch, bh } = hover.userData;
    const box = createBox({ width: cw*0.8, height: bh, depth: ch*0.8, color: Math.random()*0xffffff });
    box.position.set(hover.position.x, hover.position.y + bh/2 + count*bh, hover.position.z);
    stackedBoxes.push(box);
    scene.add(box);
    container[hover.name]++;
}

// Example ground + hover grid
function createGround(x, z, width=2, depth=2, rows=3, cols=2, namePrefix="G") {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(width, depth, cols, rows),
        new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
    );
    ground.rotation.x = -Math.PI/2;
    ground.position.set(x, 0, z);
    scene.add(ground);
    createHoverGrid(ground, { width, depth, rows, cols, namePrefix });
    return ground;
}

createGround(-3, 0, 2, 2, 3, 2, "G1");
createGround(3, 0, 2, 2, 3, 2, "G2");

// Raycaster for hover & click
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentHover = null;

function getIntersects(objects, event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(objects);
}

window.addEventListener("mousemove", e => {
    const hits = getIntersects(hoverBoxes, e);
    if (hits.length) {
        const obj = hits[0].object;
        if (currentHover !== obj) {
            if (currentHover) currentHover.material.opacity = 0;
            currentHover = obj;
            currentHover.material.opacity = 0.5;
        }
    } else if (currentHover) {
        currentHover.material.opacity = 0;
        currentHover = null;
    }
});

window.addEventListener("dblclick", e => {
    stackedBoxes.forEach(b => b.rotation.set(0,0,0));
    spinningBox = null;

    const hits = getIntersects(scene.children, e);
    if (!hits.length) return;

    const obj = hits[0].object;
    if (stackedBoxes.includes(obj)) {
        obj.material.color.set(Math.random()*0xffffff);
        spinningBox = obj;
        alert("You clicked a box!");
        return;
    }
    if (hoverBoxes.includes(obj)) stackBox(obj);
});

// Animate
function animate() {
    if (spinningBox) spinningBox.rotation.y += 0.05;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
