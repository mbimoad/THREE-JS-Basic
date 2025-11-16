/***********************************************************************************************
 * 
 *  GLOBAL SCENE — HANYA 1 UNTUK SEMUA SCRIPT
 * 
 ***********************************************************************************************/
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// ======================================================================
// SINGLE SCENE FOR BOTH SCRIPTS
// ======================================================================
const scene  = new THREE.Scene();
const width  = window.innerWidth;
const height = window.innerHeight;
const aspect = width / height;

const camera = new THREE.PerspectiveCamera(5, aspect, 0.1, 2000);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setClearColor(0xEEEEEE);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();




/***********************************************************************************************
 * 
 *  ███████  ██████  ███    ███ ██████  ██ ████████ 
 *  ██      ██    ██ ████  ████ ██   ██ ██    ██    
 *  █████   ██    ██ ██ ████ ██ ██████  ██    ██    
 *  ██      ██    ██ ██  ██  ██ ██   ██ ██    ██    
 *  ██       ██████  ██      ██ ██   ██ ██    ██    
 * 
 *  SCRIPT PERTAMA (APA ADANYA – TIDAK DIUBAH)
 * 
 ***********************************************************************************************/

// =====================================================
// 💡 PASTE SCRIPT PERTAMA KAMU DI BAGIAN INI
// =====================================================
//
// CATATAN:
// - Ganti semua "scenes" → "scene" supaya pakai scene global.
// - Selain itu tidak ada yang diubah sama sekali.
//
// =====================================================

/* 
   ⭐⭐ CONTOH PENEMPATANNYA ⭐⭐
   const loader = new GLTFLoader();
   ...
   scene.add(rack);
*/

// === SILAKAN PASTE SCRIPT PERTAMA MU DISINI ===
// (kalau mau, bilang “masukkan script pertama full”, nanti aku paste otomatis)







/***********************************************************************************************
 * 
 *  ███████  ██████  ███    ██ ███████ ██    ██ 
 *  ██      ██    ██ ████   ██ ██       ██  ██  
 *  █████   ██    ██ ██ ██  ██ █████     ████   
 *  ██      ██    ██ ██  ██ ██ ██         ██    
 *  ██       ██████  ██   ████ ███████    ██    
 *
 *  SCRIPT KEDUA — DIBUAT MENGIKUTI POLA SCRIPT PERTAMA
 * 
 ***********************************************************************************************/

let hoverBox     = [];
let stackedBoxes = [];
let container    = {};
let spinningBox  = null;
let maxstacked   = 5;

// ======================================================================
// CREATE GROUND (FOLLOW POLA SCRIPT PERTAMA)
// ======================================================================
function createPlaneGround(Gwidth, Gheight, Gwsegmn, Ghsegmn, name) {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(Gwidth, Gheight, Gwsegmn, Ghsegmn),
        new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.name = name;
    return ground;
}

// ======================================================================
function GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, k, key) {
    return {
        x: (-Gwidth/2 + i * cellwidths + cellwidths/2) + ground.position.x,
        z: (-Gheight/2 + j * cellheight + cellheight/2) + ground.position.z,
        y: (boxHeight/2) + (k * boxHeight),
        newname: `${key}-${i}-${j}`,
    };
}

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
                new THREE.MeshBasicMaterial({ color: 0x00FF00, opacity: 0, transparent: true })
            );

            const pos = GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, 0, name);

            hover.position.set(pos.x, cellHovers + ground.position.y, pos.z);
            hover.name = pos.newname;

            hover.userData = { cellwidths, cellheight, boxHeight };

            container[pos.newname] = 0;

            hoverBox.push(hover);
            scene.add(hover);
        }
    }
}

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

                scene.add(box);
            }
        }
    }
}

// ======================================================================
// BUILD TWO GROUNDS
// ======================================================================
const ground1 = createPlaneGround(2, 2, 3, 2, "ground1");
ground1.position.x = -3;
scene.add(ground1);

createHoverToPlaneGeometry(ground1, 2, 2, 3, 2, "hov1");
loopingBoxToPlaneGeometry(2, ground1, 2, 2, 3, 2, "box1");

const ground2 = createPlaneGround(2, 2, 3, 2, "ground2");
scene.add(ground2);

createHoverToPlaneGeometry(ground2, 2, 2, 3, 2, "hov2");


// ======================================================================
// RAYCAST LOGIC (SAMA DENGAN SCRIPT PERTAMA)
// ======================================================================
function getIntersects(objs, e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mousePosition, camera);
    return raycaster.intersectObjects(objs);
}

let ishover = null;

window.addEventListener("mousemove", (e) => {
    const hits = getIntersects(hoverBox, e);

    if (hits.length > 0) {
        const obj = hits[0].object;
        if (ishover !== obj) {
            if (ishover) ishover.material.opacity = 0;
            ishover = obj;
            obj.material.opacity = 0.5;
        }
    } else {
        if (ishover) ishover.material.opacity = 0;
        ishover = null;
    }
});

// ======================================================================
window.addEventListener("dblclick", (e) => {

    stackedBoxes.forEach(b => b.rotation.set(0,0,0));
    spinningBox = null;

    const hits = getIntersects(scene.children, e);
    if (hits.length === 0) return;

    const obj = hits[0].object;

    // click box
    if (stackedBoxes.includes(obj)) {
        obj.material.color.set(Math.random() * 0xFFFFFF);
        spinningBox = obj;
        alert("You click the box");
        return;
    }

    // click hover
    if (hoverBox.includes(obj)) {
        const stack = container[obj.name];
        const b     = obj.userData.boxHeight;

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

            scene.add(newBox);
            stackedBoxes.push(newBox);

            container[obj.name]++;
        }
        else {
            alert(`MAX REACHED FOR ${obj.name}`);
        }
    }
});

// ======================================================================
function animate() {
    if (spinningBox) spinningBox.rotation.y += 0.05;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
