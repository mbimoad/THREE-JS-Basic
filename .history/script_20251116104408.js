import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
let scenes = new THREE.Scene();
let widths = window.innerWidth;
let height = window.innerHeight;
let aspect = widths / height;
let camera = new THREE.PerspectiveCamera(5, aspect, 0.1, 1000);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(widths, height);
renderer.setClearColor(0xEEEEEE);
document.body.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

// ======================================================================
// GLOBAL (hanya data, bukan ukuran cell/box)
// ======================================================================
let hoverBox = [];
let container = {};
let stackedBoxes = [];
let spinningBox = null;
let maxstacked = 5;

// ======================================================================
// PLANE / GROUND (mengikuti pola script pertama)
// ======================================================================
function createPlaneGround(Gwidth, Gheight, Gwsegmn, Ghsegmn, keyname) {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(Gwidth, Gheight, Gwsegmn, Ghsegmn),
        new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.name = keyname;
    return ground;
}

// ======================================================================
// POSISI (ikut pola script pertama, pakai parameter penuh)
// ======================================================================
function GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, k, name) {
    return {
        x: (-Gwidth/2 + i * cellwidths + cellwidths/2) + ground.position.x,
        z: (-Gheight/2 + j * cellheight + cellheight/2) + ground.position.z,
        y: (boxHeight/2) + (k * boxHeight),
        newname: `${name}-${i}-${j}`
    };
}

// ======================================================================
// HOVER PLANE (mengikuti style script pertama)
// ======================================================================
function createHoverToPlaneGeometry(ground, Gwidth, Gheight, Gwsegmn, Ghsegmn, name) {

    const cellwidths = Gwidth / Gwsegmn;
    const cellheight = Gheight / Ghsegmn;
    const cellHovers = 0.01;
    const boxHeight  = 0.3;

    for (let i = 0; i < Gwsegmn; i++) {
        for (let j = 0; j < Ghsegmn; j++) {

            const hover = new THREE.Mesh(
                new THREE.BoxGeometry(cellwidths, cellHovers, cellheight),
                new THREE.MeshBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0 })
            );

            const pos = GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, 0, name);

            hover.position.set(pos.x, cellHovers + ground.position.y, pos.z);
            hover.name = pos.newname;

            hover.userData.cellwidths = cellwidths;
            hover.userData.cellheight = cellheight;
            hover.userData.boxHeight  = boxHeight;

            container[pos.newname] = 0;

            hoverBox.push(hover);
            scenes.add(hover);
        }
    }
}

// ======================================================================
// LOOP BOX TUMPUKAN
// ======================================================================
function loopingBoxToPlaneGeometry(stacked, ground, Gwidth, Gheight, Gwsegmn, Ghsegmn, name) {

    const cellwidths = Gwidth / Gwsegmn;
    const cellheight = Gheight / Ghsegmn;
    const boxHeight  = 0.3;

    const boxWidths = Math.min(0.3, cellwidths * 0.8);
    const boxDepths = Math.min(0.3, cellheight * 0.8);

    for (let i = 0; i < Gwsegmn; i++) {
        for (let j = 0; j < Ghsegmn; j++) {
            for (let k = 0; k < stacked; k++) {

                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(boxWidths, boxHeight, boxDepths),
                    new THREE.MeshBasicMaterial({ color: Math.random() * 0xFFFFFF })
                );

                const pos = GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, k, name);
                box.position.set(pos.x, pos.y + ground.position.y, pos.z);
                box.name = pos.newname;

                scenes.add(box);
            }
        }
    }
}

// ======================================================================
// GROUND 1
// ======================================================================
const ground1 = createPlaneGround(2, 2, 3, 2, "ground1");
ground1.position.x = -3;
scenes.add(ground1);

createHoverToPlaneGeometry(ground1, 2, 2, 3, 2, "hov1");
loopingBoxToPlaneGeometry(2, ground1, 2, 2, 3, 2, "box1");

// ======================================================================
// GROUND 2
// ======================================================================
const ground2 = createPlaneGround(2, 2, 3, 2, "ground2");
scenes.add(ground2);

createHoverToPlaneGeometry(ground2, 2, 2, 3, 2, "hov2");

// ======================================================================
// RAYCASTER
// ======================================================================
const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();
let ishover = null;

function getIntersects(obj, e) {
    mousePosition.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    return raycaster.intersectObjects(obj);
}

// ======================================================================
// MOUSE MOVE — HOVER EFFECT
// ======================================================================
window.addEventListener("mousemove", (e) => {
    let intersects = getIntersects(hoverBox, e);

    if (intersects.length > 0) {
        const i = intersects[0].object;

        if (ishover !== i) {
            if (ishover) ishover.material.opacity = 0;
            ishover = i;
            i.material.opacity = 0.5;
        }
    } else {
        if (ishover) ishover.material.opacity = 0;
        ishover = null;
    }
});

// ======================================================================
// DOUBLE CLICK — STACKING BOX
// ======================================================================
window.addEventListener("dblclick", (e) => {

    stackedBoxes.forEach(b => b.rotation.set(0, 0, 0));
    spinningBox = null;

    let intersects = getIntersects(scenes.children, e);
    if (intersects.length === 0) return;

    const obj = intersects[0].object;

    // CLICK BOX
    if (stackedBoxes.includes(obj)) {
        obj.material.color.set(Math.random() * 0xFFFFFF);
        spinningBox = obj;
        alert("You click the box");
        return;
    }

    // CLICK HOVER
    if (hoverBox.includes(obj)) {

        const stack = container[obj.name];
        const b = obj.userData.boxHeight;

        if (stack < maxstacked) {

            const w = obj.userData.cellwidths;
            const h = obj.userData.cellheight;

            const newBox = new THREE.Mesh(
                new THREE.BoxGeometry(w * 0.2, b, h * 0.2),
                new THREE.MeshBasicMaterial({ color: Math.random() * 0xFFFFFF })
            );

            newBox.position.set(
                obj.position.x,
                (b/2) + (stack * b),
                obj.position.z
            );

            scenes.add(newBox);
            stackedBoxes.push(newBox);
            container[obj.name]++;
        }
        else {
            alert(`MAX REACHED FOR THIS ${obj.name}`);
        }
    }
});

// ======================================================================
// ANIMATE
// ======================================================================
function animate() {
    if (spinningBox) spinningBox.rotation.y += 0.05;
    renderer.render(scenes, camera);
    requestAnimationFrame(animate);
}
animate();

// ======================================================================
// RESIZE
// ======================================================================
window.addEventListener("resize", () => {
    widths = window.innerWidth;
    height = window.innerHeight;
    aspect = widths / height;

    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(widths, height);
});
