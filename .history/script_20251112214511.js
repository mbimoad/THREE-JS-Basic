import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// === SETUP DASAR ===
const scenes = new THREE.Scene();
const widths = window.innerWidth;
const height = window.innerHeight;
const aspect = widths / height;
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
camera.position.set(5, 10, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xDDDDDD);
renderer.setSize(widths, height);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
scenes.add(ambientLight);

const loader = new GLTFLoader();
const modelurl = new URL('./warehouserack2/scene.gltf', import.meta.url);

// === FUNGSI GABUNGAN ===
function addItem(type, level, options = {}) {
    const object = new THREE.Box3().setFromObject(level);
    const size = new THREE.Vector3();
    object.getSize(size);

    const boxwidth = options.boxwidth || 0.5;
    const gap = options.gap || 0.1;
    const totalwidth = boxwidth + gap;

    switch (type) {
        case 'box': {
            const levellength = size.x;
            const boxcount = Math.floor(levellength / totalwidth);
            const startx = level.position.x - (levellength / 2) + (boxwidth / 2);

            for (let i = 0; i < boxcount; i++) {
                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(boxwidth, boxwidth, boxwidth),
                    new THREE.MeshBasicMaterial({ color: Math.floor(Math.random() * 0xffffff) })
                );
                box.position.set(
                    startx + i * totalwidth,
                    level.position.y + 0.4,
                    level.position.z - 0.3
                );
                scenes.add(box);
            }
            break;
        }

        case 'boxModel': {
            const modelurl = new URL('./crate_box/scene.gltf', import.meta.url);
            loader.load(modelurl.href, (item) => {
                const scale = options.scale || 0.009;
                item.scene.scale.set(scale, scale, scale);
                item.scene.position.set(
                    level.position.x,
                    level.position.y + 0.4,
                    level.position.z - 0.3
                );
                scenes.add(item.scene);
            });
            break;
        }

        case 'fullBox': {
            const rows = options.rows || 3;
            const cols = options.cols || 4;
            const stack = options.stack || 2;
            const start_X = level.position.x - (totalwidth * (cols - 1) / 2);
            const start_Z = level.position.z - (totalwidth * (rows - 1) / 2);
            const baseY = level.position.y + 0.25;

            for (let i = 0; i < stack; i++) {
                for (let j = 0; j < rows; j++) {
                    for (let k = 0; k < cols; k++) {
                        const box = new THREE.Mesh(
                            new THREE.BoxGeometry(boxwidth, boxwidth, boxwidth),
                            new THREE.MeshBasicMaterial({ color: Math.floor(Math.random() * 0xffffff) })
                        );
                        box.position.set(
                            start_X + k - 0.5 * totalwidth,
                            baseY + i + totalwidth,
                            start_Z - 0.5 + j * totalwidth
                        );
                        scenes.add(box);
                    }
                }
            }
            break;
        }

        default:
            console.warn('Unknown addItem type:', type);
    }
}

// === LOAD MODEL RACK ===
const levelList = [];
loader.load(modelurl.href, (item) => {
    scenes.add(item.scene);
    item.scene.scale.set(2, 1, 2);

    let totalHeight = 0;
    item.scene.traverse((i) => {
        if (i.name === 'Sides_1') {
            i.scale.y = 2;
            i.updateMatrixWorld(true);
            const object = new THREE.Box3().setFromObject(i);
            const size = new THREE.Vector3();
            object.getSize(size);
            totalHeight = size.y;
        }

        if (i.name.includes('Shelf_Supports')) {
            levelList.push(i);
        }
    });

    const lastlevel = levelList[levelList.length - 1];
    const clonelvls = lastlevel.clone();
    item.scene.add(clonelvls);
    levelList.push(clonelvls);

    const levels = levelList.length;
    const spacing = totalHeight / (levels - 1);
    for (let i = 0; i < levelList.length; i++) {
        const lv = levelList[i];
        lv.position.y = spacing * i;
    }

    // Gunakan fungsi tunggal
    addItem('box', levelList[1]);
    addItem('boxModel', levelList[2]);
    levelList.forEach((lvl) => addItem('fullBox', lvl, { stack: 1 }));
});

// === ANIMASI DAN RESIZE ===
const animate = () => {
    renderer.render(scenes, camera);
};
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(widths, height);
});
