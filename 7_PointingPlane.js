import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const scenes = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(5, aspect, 0.1, 1000); 
camera.position.set(30, 30, 30); 
camera.lookAt(0, 0, 0);  

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths,height); 
renderer.setClearColor(0xEEEEEE);
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 

// Global variable 
const Gwidths   = 2; // default value is 1
const Gheight   = 2; // default value is 1 
const Gwsegmn   = 3; // default value is 1 - Grid column 3
const Ghsegmn   = 2; // default value is 1 - Grid rows   2
const hoverBox  = []; 
const container = {};
// Ambil Ukuran Cell
const cellwidths = Gwidths / Gwsegmn; 
const cellheight = Gheight / Ghsegmn; 
const cellHovers = 0.01;
// Buat Box Berdasarkan ukuran cell
const boxWidths  = Math.min(0.3, cellwidths * 0.8); 
const boxDepths  = Math.min(0.3, cellheight * 0.8); 
const boxHeight  = 0.3; 

// Create Ground
const createGround = () => {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(Gwidths, Gheight, Gwsegmn, Ghsegmn),
        new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true})
    )
    ground.rotation.x = -Math.PI/2; 
    return ground; 
}

// ========================================================== LOOPING BOX
const GetPositionXYZ = (ground, i, j, k, nem) => {
    let x = 0; 
    let y = 0; 
    let z = 0; 
    return {
        x: (-Gwidths/2 + i * cellwidths + cellwidths / 2) + ground.position.x, 
        z: (-Gheight/2 + j * cellheight + cellheight / 2) + ground.position.z, 
        y: boxHeight/2 + k * boxHeight, 
        name: `${nem}-${i}-${j}`
    }
}

const createHoverToPlaneGeometry = (ground, name) => {
    for(let i=0; i<Gwsegmn; i++) {
        for(let j=0; j<Ghsegmn; j++) {
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(cellwidths, cellHovers, cellheight), 
                new THREE.MeshBasicMaterial({color: 0x00FF00, transparent: true, opacity: 0.0})
            )
            const pos               = GetPositionXYZ(ground, i, j, 0, name); 
            box.name                = pos.name; 
            box.userData.cellwidths = cellwidths; 
            box.userData.cellheight = cellheight; 
            box.userData.boxHeight  = boxHeight; 
            

            container[pos.name] = 0; 
            box.position.set(pos.x, cellHovers, pos.z)
            scenes.add(box)
            hoverBox.push(box)
        }
    }
}

const loopingBoxToPlaneGeometry = (stacked = 1, ground, name) => {
    for(let i=0; i<Gwsegmn; i++) {
        for(let j=0; j<Ghsegmn; j++) {
            for(let k=0; k<stacked; k++) {
                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(boxWidths, boxHeight, boxDepths), 
                    new THREE.MeshBasicMaterial({color: Math.floor(Math.random() * 0xFFFFFF)})
                )
                const pos = GetPositionXYZ(ground, i, j, k, name); 
                box.name  = pos.name; 
                box.position.set(pos.x, pos.y, pos.z)
                scenes.add(box)
            }
        }
    }
}
// ==================================================================
const ground1 = createGround(); 
ground1.position.x = -3;
scenes.add(ground1)

createHoverToPlaneGeometry(ground1, "hov1"); 
loopingBoxToPlaneGeometry(2, ground1, "box1"); 


// Pointing
const raycaster = new THREE.Raycaster(); 
const mousePosition = new THREE.Vector2(); 
let ishover = null; 
const getIntersects = (obj, e) => {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera); 
    const intersects = raycaster.intersectObjects(obj); 
    return intersects; 
}

window.addEventListener('mousemove', function(e) {
    let intersects = getIntersects(hoverBox, e)
    if(intersects.length > 0) {
        const i = intersects[0].object; 
        if(ishover !== i) {
            if(ishover) ishover.material.opacity = 0.0; // reset
            ishover = i; 
            ishover.material.opacity = 0.5;             // highlight
        }
    } else {
        if(ishover) {
            ishover.material.opacity = 0.0; 
            ishover = null; 
        }
    }
})

const ground2 = createGround(); 
scenes.add(ground2)
createHoverToPlaneGeometry(ground2, "hov2"); 

const stackedBoxes = [];
let spinningBox = null; 
let maxstacked = 5; 
window.addEventListener('dblclick', function(e) {
    stackedBoxes.forEach(item => item.rotation.set(0,0,0))
    spinningBox = null; 
    let intersects = getIntersects(scenes.children, e); 
    if(intersects.length > 0) {
        const i = intersects[0].object; 
        // Jika box di click
        if(stackedBoxes.includes(i)) {
            i.material.color.set(Math.random() * 0xFFFFFF); 
            spinningBox = i; 
            this.alert("You click the box")
            return;
        } 
        // Jika hover yg di click
        else if(hoverBox.includes(i)) {
            const stack = container[i.name]; 
            if(stack < maxstacked) {
                let w = i.userData.cellwidths; 
                let h = i.userData.cellheight; 
                let b = i.userData.boxHeight; 

                const newBox = new THREE.Mesh(
                    new THREE.BoxGeometry(w * 0.8, b, h * 0.8), 
                    new THREE.MeshBasicMaterial({color: Math.floor(Math.random() * 0xFFFFFF)})
                ) 
                newBox.position.set(i.position.x, (b/2) + (stack * b),  i.position.z)
                scenes.add(newBox); 
                stackedBoxes.push(newBox);
                container[i.name]++; 
            } else {
                this.alert(`MAX REACHED FOR THIS ${i.name}`)
            }
        }
    } 
})

const animate = () => {
    if(spinningBox) spinningBox.rotation.y += 0.05;
    requestAnimationFrame(animate); 
    renderer.render(scenes, camera); 
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})