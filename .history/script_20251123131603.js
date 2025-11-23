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

let hoverBox  = [], stackedBoxes = [], container = {}, spinningBox = null, maxstacked = 5;
const boxes   = (w1,w2,w3,c,t,o) => new THREE.Mesh(new THREE.BoxGeometry(w1, w2, w3),new THREE.MeshBasicMaterial({ color: c, transparent: t, opacity: o }));
const orbit   = new OrbitControls(camera, renderer.domElement);
const grids   = new THREE.GridHelper(20, 20);
grids.raycast = () => {}; // pointer-events: none
orbit.update();
scenes.add(grids);
scenes.add(new THREE.AmbientLight(0xffffff, 1));

const loader = new GLTFLoader();
loader.load('./rack1/scene.gltf', item => {
    scenes.add(item.scene)
    item.scene.traverse(i => {
        if (i.name.includes("Shelf_Supports")) {
            const p = getObjectSize(i);
            const s = planeShadowed(p, 3, 2);
            createHover(s, p.x, 1, 3, 2, i.name);
        }
    });
});
function gposi(w, h, cw, ch, bh, s, i, j, k, n, cs) {
    const y = bh / 2 + k * bh;
    return {
        x: (-w / 2 + i * cw + cw / 2) + s.position.x,
        z: (-h / 2 + j * ch + ch / 2) + s.position.z,
        y: y,
        y2: cs + s.position.y,
        y3: y  + s.position.y,
        newname: `${n}-${i}-${j}`
    };
}
function createHover(s, w, h, wg, hg, n) {
    const cw = w / wg;
    const ch = h / hg;
    const cs = 0.01;
    const bh = 0.3;
    for (let i = 0; i < wg; i++) {
        for (let j = 0; j < hg; j++) {
            const hov = boxes(cw, cs, ch, 0x00FF00, true, 0.0); 
            const pos = gposi(w, h, cw, ch, bh, s, i, j, 0, n, cs);
            hov.position.set(pos.x, pos.y2, pos.z);
            hov.name = pos.newname;
            hov.userData.cw = cw;
            hov.userData.ch = ch;
            hov.userData.bh = bh;
            container[pos.newname] = 0;
            hoverBox.push(hov);
            scenes.add(hov);
        }
    }
}
const getObjectSize = obj => {
    const boxs = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    const cntr = boxs.getCenter(new THREE.Vector3())
    cntr.y += 0.1; 
    boxs.getSize(size);
    return {
        cntr,
        x: size.x, 
        y: size.y
    };
};
function planeShadowed(parent,col,row) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(parent.x,1,col,row), new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true})); 
    mesh.rotation.x = -Math.PI/2; 
    mesh.position.copy(parent.cntr); 
    scenes.add(mesh); 
    return mesh; 
}
function loopingBoxToPlaneGeometry(stacked, p, w, h, wg, hg, n) {
    const cw = w / wg;
    const ch = h / hg;
    const bw = Math.min(0.3, cw * 0.8);
    const bd = Math.min(0.3, ch * 0.8);
    const bh = 0.3;
    for (let i = 0; i < wg; i++) {
        for (let j = 0; j < hg; j++) {
            for (let k = 0; k < stacked; k++) {
                const b   = boxes(bw, bh, bd, Math.random() * 0xFFFFFF, false, 1); 
                const pos = gposi(w, h, cw, ch, bh, p, i, j, k, n);
                b.position.set(pos.x, pos.y3, pos.z);
                scenes.add(b);
                stackedBoxes.push(b);
            }
        }
    }
}
function createGround(w, h, wg, hg) {
    const g = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h, wg, hg),
        new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
    );
    g.rotation.x = -Math.PI / 2;
    return g;
}
const ground1 = createGround(2, 2, 3, 2);
ground1.position.x = -3;
scenes.add(ground1);

createHover(ground1, 2, 2, 3, 2, "G1");
loopingBoxToPlaneGeometry(2, ground1, 2, 2, 3, 2, "G1BOX");
const ground2 = createGround(2, 2, 3, 2);
ground2.position.x = 3;
scenes.add(ground2);
createHover(ground2, 2, 2, 3, 2, "G2");

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
        const w = obj.userData.cw * 0.8;
        const h = obj.userData.ch * 0.8;
        const b = obj.userData.bh;
        const newBox = boxes(w,b,h, Math.random() * 0xFFFFFF, false, 1); 
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