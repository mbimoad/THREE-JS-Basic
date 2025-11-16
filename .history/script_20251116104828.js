/***********************************************************************************************
 * GLOBAL SETUP — satu scene, satu camera, satu renderer
 ***********************************************************************************************/
import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scenes = new THREE.Scene(); 
let widths = window.innerWidth; 
let height = window.innerHeight; 
let aspect = widths/heights; 

let camera = new THREE.PerspectiveCamera(8, aspect, 0.1, 1000); 
camera.position.set(30, 30, 30); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2();


/***********************************************************************************************
 * ███████  ██████  ███    ███  █████  ████████ 
 * ██      ██    ██ ████  ████ ██   ██    ██    
 * █████   ██    ██ ██ ████ ██ ███████    ██    
 * ██      ██    ██ ██  ██  ██ ██   ██    ██    
 * ██       ██████  ██      ██ ██   ██    ██    
 *
 *  SCRIPT PERTAMA (ASLI, hanya mengganti "scenes" → "scene")
 ***********************************************************************************************/

const grids = new THREE.GridHelper(20, 20); 
const light = new THREE.AmbientLight(0xFFFFFF, 1); 
grids.raycast = () => {}; 
scenes.add(grids, light)

const modelurl = new URL('./warehouserack2/scene.gltf', import.meta.url);
const modeload = new GLTFLoader();
let levelPlanes = [];

const getDimentionalOfObject = child => {
    let box = new THREE.Box3().setFromObject(child);
    const size = new THREE.Vector3();
    let center = box.getCenter(new THREE.Vector3())
    box.getSize(size);
    center.y += 0.1;
    
    return {
        center,
        x: size.x, 
        y: size.y
    }; 
}

function createPlaneGeometryInside(child, parent, column, row) {
    const geometry = new THREE.PlaneGeometry(parent.x, 1,column,row);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00FF00, 
        side: THREE.DoubleSide, 
        transparent: false, 
        opacity: 0.5, 
        wireframe: true
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.copy(parent.center);
    plane.rotation.x = -Math.PI/2;

    const helper = new THREE.BoxHelper(child, 0xff00ff);
    helper.raycast = () => {}; 
    scenes.add(helper);

    scenes.add(plane);
    return plane; 
}

let hoverBox_script1 = [];
let container_script1 = {};

const GetPositionXYZ_script1 = (Gwidths, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, k, nem) => {
    return {
        x: (-Gwidths/2 + i * cellwidths + cellwidths / 2) + ground.position.x, 
        z: (-Gheight/2 + j * cellheight + cellheight / 2) + ground.position.z, 
        y: boxHeight/2 + k * boxHeight, 
        newname: `${nem}-${i}-${j}`
    }
}

function createHoverToPlaneGeometry_script1(ground, Gwidth, Gheight, Gwsegmn, Ghsegmn, name) {

    const cellwidths = Gwidth / Gwsegmn;
    const cellheight = Gheight / Ghsegmn;
    const b = 0.3;

    for (let i = 0; i < Gwsegmn; i++) {
        for (let j = 0; j < Ghsegmn; j++) {

            const hover = new THREE.Mesh(
                new THREE.BoxGeometry(cellwidths, 0.01, cellheight), 
                new THREE.MeshBasicMaterial({color: 0x00FF00, transparent: true, opacity: 0.0})
            );

            const pos = GetPositionXYZ_script1(Gwidth, Gheight, cellwidths, cellheight, b, ground, i, j, 0, name);

            hover.position.set(pos.x, 0.01 + ground.position.y, pos.z);
            hover.name = pos.newname;

            hover.userData = { cellwidths, cellheight, boxHeight: b };
            container_script1[pos.newname] = 0;

            hoverBox_script1.push(hover);
            scenes.add(hover);
        }
    }
}

modeload.load(modelurl.href, (gltf) => {

    const model = gltf.scene;
    scenes.add(model);

    model.traverse((child) => {
        if(child.name.includes("Shelf_Supports")) {

            const parent = getDimentionalOfObject(child);
            const plane  = createPlaneGeometryInside(child, parent, 3, 2);

            createHoverToPlaneGeometry_script1(plane, parent.x, 1,3,2, child.name);
        }
    });
});


/***********************************************************************************************
 * ███████  ██████  ███    ██ ███████ ██    ██ 
 * ██      ██    ██ ████   ██ ██       ██  ██  
 * █████   ██    ██ ██ ██  ██ █████     ████   
 * ██      ██    ██ ██  ██ ██ ██         ██    
 * ██       ██████  ██   ████ ███████    ██    
 *
 * SCRIPT KEDUA — sudah mengikuti pola SCRIPT PERTAMA
 ***********************************************************************************************/

let hoverBox2 = [];
let stackedBoxes2 = [];
let container2 = {};
let spinningBox2 = null;
let maxstacked2 = 5;

// ======================================================================
function createPlaneGround(Gwidth, Gheight, Gwsegmn, Ghsegmn, name) {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(Gwidth, Gheight, Gwsegmn, Ghsegmn),
        new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
    );
    ground.rotation.x = -Math.PI/2;
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
                new THREE.MeshBasicMaterial({
                    color: 0x00FF00,
                    opacity: 0.0,
                    transparent: true
                })
            );

            const pos = GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, 0, name);

            hover.position.set(pos.x, cellHovers + ground.position.y, pos.z);
            hover.name = pos.newname;

            hover.userData = { cellwidths, cellheight, boxHeight };

            container2[pos.newname] = 0;
            hoverBox2.push(hover);

            scenes.add(hover);
        }
    }
}

// ======================================================================
function loopingBoxToPlaneGeometry(stacked, ground, Gwidth, Gheight, Gwsegmn, Ghsegmn, name) {

    const cellwidths = Gwidth / Gwsegmn;
    const cellheight = Gheight / Ghsegmn;

    const boxHeight  = 0.3;
    const boxWidths  = Math.min(0.3, cellwidths * 0.8);
    const boxDepths  = Math.min(0.3, cellheight * 0.8);

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
// Two grounds
// ======================================================================
const ground1 = createPlaneGround(2, 2, 3, 2, "ground1");
ground1.position.x = -3;
scenes.add(ground1);

createHoverToPlaneGeometry(ground1, 2, 2, 3, 2, "hov1");
loopingBoxToPlaneGeometry(2, ground1, 2, 2, 3, 2, "box1");

const ground2 = createPlaneGround(2, 2, 3, 2, "ground2");
scenes.add(ground2);
createHoverToPlaneGeometry(ground2, 2, 2, 3, 2, "hov2");


// ======================================================================
// RAYCAST — berlaku untuk hover script 1 & script 2
// ======================================================================
function getIntersects(objs, e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mousePosition, camera);
    return raycaster.intersectObjects(objs);
}

let ishover = null;

window.addEventListener("mousemove", (e) => {

    const hits = [
        ...getIntersects(hoverBox_script1, e),
        ...getIntersects(hoverBox2, e)
    ];

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

    stackedBoxes2.forEach(b => b.rotation.set(0,0,0));
    spinningBox2 = null;

    const hits = getIntersects(scene.children, e);
    if (hits.length === 0) return;

    const obj = hits[0].object;

    // Box click
    if (stackedBoxes2.includes(obj)) {
        obj.material.color.set(Math.random() * 0xFFFFFF);
        spinningBox2 = obj;
        alert("You click the box");
        return;
    }

    // Hover click
    if (hoverBox2.includes(obj)) {
        const stack = container2[obj.name];
        const b     = obj.userData.boxHeight;

        if (stack < maxstacked2) {

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
            stackedBoxes2.push(newBox);

            container2[obj.name]++;
        }
        else {
            alert(`MAX REACHED FOR ${obj.name}`);
        }
    }
});

// ======================================================================
function animate() {
    if (spinningBox2) spinningBox2.rotation.y += 0.05;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resize
window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});
