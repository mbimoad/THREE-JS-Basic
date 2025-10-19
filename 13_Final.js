import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scenes = new THREE.Scene(); 
let widths = window.innerWidth; 
let height = window.innerHeight; 
let aspect = widths/height; 
let camera = new THREE.PerspectiveCamera(8, aspect, 0.1, 1000); 
camera.position.set(30, 30, 30); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement);
const grids = new THREE.GridHelper(20, 20); 
const light = new THREE.AmbientLight(0xFFFFFF, 1); 
orbit.update(); 
grids.raycast = () => {}; // ini seperti pointer events none pada css. untuk by pass 
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

const getBoundingBoxOfGroup = (group) => {
  
    const boundingBox = new THREE.Box3();
    group.traverse((node) => {
        if (node.isMesh) {
            node.updateWorldMatrix(true, true); // pastikan transformasi up-to-date
            const meshBox = new THREE.Box3().setFromObject(node);
            boundingBox.union(meshBox); // gabungkan bounding box
        }
    });

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    boundingBox.getSize(size);
    boundingBox.getCenter(center);
    center.y += 0.1;
    return {
        size,
        center
    };
};

function createPlaneGeometryInside(child, parent, column, row) {
    const geometry    = new THREE.PlaneGeometry(parent.x, 1,column,row);
    const material    = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide, transparent: false, opacity: 0.5, wireframe: true });
    const plane       = new THREE.Mesh(geometry, material);
    console.log(plane)
    plane.position.copy(parent.center);
    plane.rotation.x = -Math.PI/2;

    // By passing the raycaster 
    const helper = new THREE.BoxHelper(child, 0xff00ff);
    helper.raycast = () => {}; 
    scenes.add(helper);

    scenes.add(plane);
    return plane; 
}

function loopingBoxToPlaneGeometry(stacked = 1, ground, Gwidth, Gheight, Gwsegmn, Ghsegmn, name) {
    const cellwidths = Gwidth / Gwsegmn;
    const cellheight = Gheight / Ghsegmn;
    const boxWidth = Math.min(0.5, cellwidths * 0.8);
    const boxDepth = Math.min(0.5, cellheight * 0.8);
    const boxHeight = 0.3;
    const cellHovers = 0.01;
    
    // === Buat box tumpuk per cell ===
    for (let i = 0; i < Gwsegmn; i++) {
        for (let j = 0; j < Ghsegmn; j++) {
            for (let k = 0; k < stacked; k++) {
                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth),
                    new THREE.MeshBasicMaterial({ color: Math.floor(Math.random() * 0xFFFFFF)})
                );    
                const {x,y,z, newname} = GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, k, name); 
                box.position.set(
                    x + ground.position.x,
                    y + ground.position.y, 
                    z + ground.position.z
                );

                scenes.add(box);
            }
        }
    }
}

let hoverBox  = []; 
let container = {}; 
const GetPositionXYZ = (Gwidths, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, k, nem) => {
    let x = 0; 
    let y = 0; 
    let z = 0; 
    return {
        x: (-Gwidths/2 + i * cellwidths + cellwidths / 2) + ground.position.x, 
        z: (-Gheight/2 + j * cellheight + cellheight / 2) + ground.position.z, 
        y: boxHeight/2 + k * boxHeight, 
        newname: `${nem}-${i}-${j}`
    }
}

function createHoverToPlaneGeometry(ground, Gwidth, Gheight, Gwsegmn, Ghsegmn, name) {
    const cellwidths = Gwidth / Gwsegmn;
    const cellheight = Gheight / Ghsegmn;
    const boxWidth = Math.min(0.3, cellwidths * 0.8);
    const boxDepth = Math.min(0.3, cellheight * 0.8);
    const boxHeight = 0.3;
    const cellHovers = 0.01;
    for(let i=0; i<Gwsegmn; i++) {
        for(let j=0; j<Ghsegmn; j++) {
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(cellwidths, cellHovers, cellheight), 
                new THREE.MeshBasicMaterial({color: 0x00FF00, transparent: true, opacity: 0.0})
            )

            // Hitung posisi tengah cell
            const {x,y,z, newname} = GetPositionXYZ(Gwidth, Gheight, cellwidths, cellheight, boxHeight, ground, i, j, 0, name); 


            box.position.set(
                x + ground.position.x,
                cellHovers + ground.position.y, 
                z + ground.position.z
            );

            box.name  = newname;
            box.userData.cellwidths = cellwidths; 
            box.userData.cellheight = cellheight; 
            box.userData.boxHeight  = boxHeight; 

            container[newname] = 0; 
            scenes.add(box)
            hoverBox.push(box)
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
            createHoverToPlaneGeometry(plane, parent.x, 1,3,2, child.name);
            // loopingBoxToPlaneGeometry(2, plane, parent.x,1,3,2, child.name); 
        }
    });

    console.log(`✅ ${levelPlanes.length} plane dibuat dan diposisikan.`);
});


// Pointing for hover
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


const stackedBoxes = [];
let spinningBox = null; 
let maxstacked = 5; 
window.addEventListener('dblclick', function(e) {

    stackedBoxes.forEach(item => item.rotation.set(0,0,0))
    spinningBox = null; 
    let intersects = getIntersects(scenes.children, e); 

    if(intersects.length > 0) {
        const i = intersects[0].object; 
        console.log(i)
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
                newBox.position.set(i.position.x, ((b/2) + (stack * b)) + i.position.y,  i.position.z)
                scenes.add(newBox); 
                stackedBoxes.push(newBox);
                container[i.name]++; 
            } else {
                this.alert(`MAX REACHED FOR THIS ${i.name}`)
            }
        }
    } 
})


function animate() {
    if(spinningBox) spinningBox.rotation.y += 0.05;
    renderer.render(scenes, camera);
    requestAnimationFrame(animate) 
}
animate();
window.addEventListener('resize', function(e) {
    widths = this.window.innerWidth; 
    height = this.window.innerHeight; 
    aspect = widths/height; 
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})