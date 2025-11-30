import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths / height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(10,10,20);

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 

scenes.add(new THREE.GridHelper(30, 30)); 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 

// =====================================================================
// SAMPLE OBJECTS
// =====================================================================
const parent = new THREE.Group();
scenes.add(parent);

for (let i = 0; i < 12; i++) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshNormalMaterial()
    );
    parent.add(box);
}

// =====================================================================
// FLEX FUNCTIONS (CSS-LIKE)
// =====================================================================

// FLEX ROW (display:flex; flex-direction:row)
function flexRow(parent, gap = 1) {
    parent.children.forEach((child, i) => {
        child.position.set(i * gap, 0, 0);
    });
}

// FLEX COLUMN
function flexColumn(parent, gap = 1) {
    parent.children.forEach((child, i) => {
        child.position.set(0, -i * gap, 0);
    });
}

// FLEX WRAP
function flexWrap(parent, maxPerRow = 3, gap = 1) {
    parent.children.forEach((child, i) => {
        const col = i % maxPerRow;
        const row = Math.floor(i / maxPerRow);
        child.position.set(col * gap, -row * gap, 0);
    });
}

// FLEX JUSTIFY CONTENT
function flexJustify(parent, type = "start", gap = 1) {
    const items = parent.children;
    const count = items.length;
    const totalW = (count - 1) * gap;
    let pos = [];

    switch(type) {
        case "start":
            for (let i = 0; i < count; i++) pos[i] = i*gap;
            break;
        case "center":
            for (let i = 0; i < count; i++) pos[i] = i*gap - totalW/2;
            break;
        case "end":
            for (let i = 0; i < count; i++) pos[i] = i*gap - totalW;
            break;
        case "between":
            if (count === 1) { pos[0] = 0; break; }
            const gB = totalW/(count-1);
            for (let i = 0; i < count; i++) pos[i] = i*gB - totalW/2;
            break;
        case "around":
            const gA = totalW/count;
            for (let i = 0; i < count; i++) pos[i] = i*gA + gA/2 - totalW/2;
            break;
        case "evenly":
            const gE = totalW/(count+1);
            for (let i = 0; i < count; i++) pos[i] = (i+1)*gE - totalW/2;
            break;
    }

    items.forEach((child,i) => child.position.set(pos[i],0,0));
}

// FLEX CENTER
function flexCenter(parent) {
    const box = new THREE.Box3().setFromObject(parent);
    const center = new THREE.Vector3();
    box.getCenter(center);
    parent.children.forEach(c => c.position.sub(center));
}

// =====================================================================
// GRID FUNCTIONS (CSS-LIKE)
// =====================================================================

// GRID REPEAT
function gridRepeat(parent, columns = 2, gap = 1) {
    parent.children.forEach((child, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        child.position.set(col * gap, -row * gap, 0);
    });
}

// FIXED 2x2
function gridFixed(parent, gap = 1) {
    gridRepeat(parent, 2, gap);
}

// AUTO-FIT
function gridAutoFit(parent, maxWidth = 5, gap = 1) {
    let x = 0, y = 0;
    parent.children.forEach(child => {
        child.position.set(x,y,0);
        x += gap;
        if (x > maxWidth) {
            x = 0;
            y -= gap;
        }
    });
}

// AUTO-FILL (mirip CSS grid-auto-fill)
function gridAutoFill(parent, maxWidth = 5, gap = 1) {
    let x = 0, y = 0;

    parent.children.forEach(child => {
        if (x + gap > maxWidth) {
            x = 0;
            y -= gap;
        }
        child.position.set(x,y,0);
        x += gap;
    });
}

// GRID AUTO-FLOW DENSE (CSS grid-auto-flow:dense)
function gridAutoFlowDense(parent, columns = 3, gap = 1) {
    let grid = [];
    const items = parent.children;

    function place(child, index) {
        const col = index % columns;
        const row = Math.floor(index / columns);
        child.position.set(col * gap, -row * gap, 0);
    }

    // Place items without gaps
    items.forEach((child, i) => {
        grid.push(i);
        place(child, i);
    });
}

// GRID ROWS REPEAT
function gridRowsRepeat(parent, rows = 2, gap = 1) {
    parent.children.forEach((child, i) => {
        const row = i % rows;
        const col = Math.floor(i / rows);
        child.position.set(col * gap, -row * gap, 0);
    });
}

// GRID AUTO SIZE
function gridAutoSize(parent, columns = 2, gap = 0.2) {
    let maxW = 0, maxH = 0;
    parent.children.forEach(child => {
        const box = new THREE.Box3().setFromObject(child);
        const size = new THREE.Vector3();
        box.getSize(size);
        maxW = Math.max(maxW, size.x);
        maxH = Math.max(maxH, size.y);
    });

    parent.children.forEach((child, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        child.position.set(col*(maxW+gap), -row*(maxH+gap), 0);
    });
}

// GRID CENTER
function gridCenter(parent) {
    const box = new THREE.Box3().setFromObject(parent);
    const center = new THREE.Vector3();
    box.getCenter(center);
    parent.children.forEach(c => c.position.sub(center));
}

// =====================================================================
// GRID 3D (X,Y,Z layout system)
// =====================================================================

// Grid 3D XYZ
function grid3D(parent, cols = 3, rows = 3, layers = 2, gap = 2) {
    parent.children.forEach((child, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols) % rows;
        const layer = Math.floor(i / (cols*rows));

        child.position.set(
            col * gap,
            -row * gap,
            -layer * gap
        );
    });
}

// Grid 3D Auto
function grid3DAuto(parent, maxCols = 4, maxRows = 4, gap = 2) {
    parent.children.forEach((child, i) => {
        const col = i % maxCols;
        const row = Math.floor(i / maxCols) % maxRows;
        const layer = Math.floor(i / (maxCols * maxRows));

        child.position.set(
            col * gap,
            -row * gap,
            -layer * gap
        );
    });
}

// =====================================================================
// DEMO: PILIH SALAH SATU
// =====================================================================

// FLEX
// flexRow(parent, 1.5);
// flexColumn(parent, 1.5);
// flexWrap(parent, 3, 1.5);
// flexJustify(parent, "center", 1.5);
// flexCenter(parent);

// GRID
// gridRepeat(parent, 3, 1.5);
// gridAutoFit(parent, 4, 1.2);
// gridAutoFill(parent, 6, 1.2);
// gridAutoFlowDense(parent, 3, 1.5);
// gridRowsRepeat(parent, 2, 1.5);
gridAutoSize(parent, 3, 0.3);
gridCenter(parent);

// GRID 3D
// grid3D(parent, 3, 3, 2, 2);
// grid3DAuto(parent, 3, 3, 2);

// =====================================================================
const animate = () => {
    renderer.render(scenes, camera)
    requestAnimationFrame(animate)
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = window.innerWidth / window.innerHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(window.innerWidth, window.innerHeight); 
});