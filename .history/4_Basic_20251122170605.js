import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let widths = window.innerWidth;
let height = window.innerHeight;
let aspect = widths / height;
const scenes = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(8, aspect, 0.1, 1000);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(widths, height);
renderer.setClearColor(0x333333);
document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
const grids = new THREE.GridHelper(20, 20);
grids.raycast = () => {}; // pointer-events: none
scenes.add(grids);
scenes.add(new THREE.AmbientLight(0xffffff, 1));
const createBox = (w1,w2,w3,c,t,o) => new THREE.Mesh(new THREE.BoxGeometry(w1, w2, w3),new THREE.MeshBasicMaterial({ color: c, transparent: t, opacity: o }));

let hoverBox = [];
let container = {};
let stackedBoxes = [];
let spinningBox = null;

let maxstacked = 5;
function GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, k, key) {
    return {
        x: (-Gwidth / 2 + i * cellwidths + cellwidths / 2) + ground.position.x,
        z: (-Gheight / 2 + j * cellheight + cellheight / 2) + ground.position.z,
        y: (boxHeight / 2) + (k * boxHeight),
        newname: `${key}-${i}-${j}`
    };
}
function createHoverToPlaneGeometry(ground, Gwidth, Gheight, Gwsegmn, Ghsegmn, key) {
    const cellwidths = Gwidth / Gwsegmn;
    const cellheight = Gheight / Ghsegmn;
    const cellHovers = 0.01;
    const boxHeight = 0.3;
    for (let i = 0; i < Gwsegmn; i++) {
        for (let j = 0; j < Ghsegmn; j++) {
            const hover = createBox(cellwidths, cellHovers, cellheight, 0x00FF00, true, 0.0); 
            const pos   = GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, 0, key);
            hover.position.set(pos.x, cellHovers + ground.position.y, pos.z);
            hover.name = pos.newname;
            hover.userData.cellwidths = cellwidths;
            hover.userData.cellheight = cellheight;
            hover.userData.boxHeight = boxHeight;
            container[pos.newname] = 0;

            hoverBox.push(hover);
            scenes.add(hover);
        }
    }
}
function getDimentionalOfObject(child) {
    let box = new THREE.Box3().setFromObject(child);
    const size = new THREE.Vector3();
    let center = box.getCenter(new THREE.Vector3());
    box.getSize(size);
    center.y += 0.1;

    return {
        center,
        x: size.x,
        y: size.y
    };
}
function createPlaneGeometryInside(child, parent, col, row) {
    const geo = new THREE.PlaneGeometry(parent.x, 1, col, row);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, opacity: 0.2, transparent: true, wireframe: true });
    const plane = new THREE.Mesh(geo, mat);
    plane.position.copy(parent.center);
    plane.rotation.x = -Math.PI / 2;
    scenes.add(plane);
    return plane;
}
function loopingBoxToPlaneGeometry(stacked, ground, Gwidth, Gheight, Gwsegmn, Ghsegmn, key) {
    const cellwidths = Gwidth / Gwsegmn;
    const cellheight = Gheight / Ghsegmn;
    const boxWidth = Math.min(0.3, cellwidths * 0.8);
    const boxDepth = Math.min(0.3, cellheight * 0.8);
    const boxHeight = 0.3;
    for (let i = 0; i < Gwsegmn; i++) {
        for (let j = 0; j < Ghsegmn; j++) {
            for (let k = 0; k < stacked; k++) {
                const b   = createBox(boxWidth, boxHeight, boxDepth, Math.random() * 0xFFFFFF, false, 1); 
                const pos = GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, k, key);
                b.position.set(pos.x, pos.y + ground.position.y, pos.z);
                scenes.add(b);
                stackedBoxes.push(b);
            }
        }
    }
}
function createGround(Gwidth, Gheight, Gwsegmn, Ghsegmn) {
    const g = new THREE.Mesh(
        new THREE.PlaneGeometry(Gwidth, Gheight, Gwsegmn, Ghsegmn),
        new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
    );
    g.rotation.x = -Math.PI / 2;
    return g;
}
const modelurl = new URL('./rack2/scene.gltf', import.meta.url);
const modeload = new GLTFLoader();
modeload.load(modelurl.href, (gltf) => {
    const model = gltf.scene;
    scenes.add(model);
    model.traverse(child => {
        if (child.name.includes("Shelf_Supports")) {
            const parent = getDimentionalOfObject(child);
            const plane = createPlaneGeometryInside(child, parent, 3, 2);
            createHoverToPlaneGeometry(plane, parent.x, 1, 3, 2, child.name);
        }
    });
});
const ground1 = createGround(2, 2, 3, 2);
ground1.position.x = -3;
scenes.add(ground1);

createHoverToPlaneGeometry(ground1, 2, 2, 3, 2, "G1");
loopingBoxToPlaneGeometry(2, ground1, 2, 2, 3, 2, "G1BOX");
const ground2 = createGround(2, 2, 3, 2);
ground2.position.x = 3;
scenes.add(ground2);
createHoverToPlaneGeometry(ground2, 2, 2, 3, 2, "G2");

const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();
let ishover = null;
function getIntersects(obj, e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    return raycaster.intersectObjects(obj);
}
window.addEventListener("mousemove", e => {
    const hit = getIntersects(hoverBox, e);
    if (hit.length > 0) {
        const obj = hit[0].object;
        if (ishover !== obj) {
            if (ishover) ishover.material.opacity = 0;
            ishover = obj;
            ishover.material.opacity = 0.5;
        }
    } else {
        if (ishover) {
            ishover.material.opacity = 0;
            ishover = null;
        }
    }
});
window.addEventListener("dblclick", e => {
    stackedBoxes.forEach(b => b.rotation.set(0, 0, 0));
    spinningBox = null;
    const hit = getIntersects(scenes.children, e);
    if (hit.length === 0) return;
    const obj = hit[0].object;
    if (stackedBoxes.includes(obj)) {
        obj.material.color.set(Math.random() * 0xffffff);
        spinningBox = obj;
        alert("You clicked a box.");
        return;
    }
    if (hoverBox.includes(obj)) {
        const count = container[obj.name];
        if (count >= maxstacked) {
            alert(`MAX STACK REACHED for ${obj.name}`);
            return;
        }
        const w = obj.userData.cellwidths * 0.8;
        const h = obj.userData.cellheight * 0.8;
        const b = obj.userData.boxHeight;
        const newBox = createBox(w,b,h, Math.random() * 0xFFFFFF, false, 1); 
        newBox.position.set(
            obj.position.x,
            obj.position.y + (b / 2) + (count * b),
            obj.position.z
        );
        stackedBoxes.push(newBox);
        scenes.add(newBox);
        container[obj.name]++;
    }
});
function animate() {
    if (spinningBox) spinningBox.rotation.y += 0.05;
    renderer.render(scenes, camera);
    requestAnimationFrame(animate);
}
animate();
window.addEventListener("resize", () => {
    widths = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = widths / height;
    camera.updateProjectionMatrix();
    renderer.setSize(widths, height);
});
