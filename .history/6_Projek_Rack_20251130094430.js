import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5,10,15); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0x333333)
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update();
scenes.add(new THREE.GridHelper(30, 30)); 
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1));
const boxes = (w1,w2,w3,c,t,o) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: c, transparent: t, opacity: o}))
const hoverbox = [],
      stackbox = [], 
      stackeds = 5, 
      storebox = {}; 

      function getObjectSize(obj) {
        obj.updateWorldMatrix(true, true);
    
        // bounding box world
        const worldBox = new THREE.Box3().setFromObject(obj);
    
        // convert ke local
        const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
        worldBox.applyMatrix4(inv);
    
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        worldBox.getSize(size);
        worldBox.getCenter(center);
    
        return {
            cntr: center, // sudah dalam LOCAL SPACE
            x: size.x,
            y: size.y,
            z: size.z
        };
    }
    

function planeShadowed(parentInfo, col, row, parentMesh) {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(parentInfo.x, parentInfo.z, col, row),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true })
    );

    mesh.rotation.x = -Math.PI / 2;

    // convert world → local
    const worldPos = parentInfo.cntr.clone();
    const localPos = parentMesh.worldToLocal(worldPos);

    mesh.position.copy(localPos);

    parentMesh.add(mesh);
    return mesh;
}


function getFormula(w,h,wg,hg,boxH) {
    const cw = w/wg; 
    const ch = h/hg; 
    const cs = 0.01; 
    const bh = boxH; 
    const bw = Math.min(0.3, cw * 0.8);
    const bd = Math.min(0.3, ch * 0.8);
    return {cw,ch,bh,cs,bw,bd};
}
function gposi(w, h, cw, ch, bh, s, i, j, k, n, cs) {
    const y = bh / 2 + k * bh;
    return {
         x: (-w / 2 + i * cw + cw / 2) + s.position.x,
         z: (-h / 2 + j * ch + ch / 2) + s.position.z,
         y: y,
        y2: y  + s.position.y,
        y3: cs + s.position.y,
        newname: `${n}-${i}-${j}`
    };
}
function createHover(s,w,h,wg,hg,n,boxH,obj) {
    const {cw,ch,bh,cs,bw,bd} = getFormula(w,h,wg,hg,boxH); 
    for(let i=0; i<wg; i++) {
        for(let j=0; j<hg; j++) {
            const hov = boxes(cw,cs,ch,0x00FF00, true, 1); 
            const pos = gposi(w,h,cw,ch,bh,s,i,j,0,n, cs);  
            hov.position.set(pos.x,pos.y3, pos.z); 
            hov.name = pos.newname; 
            hov.userData.cw = cw; 
            hov.userData.ch = ch; 
            hov.userData.bh = bh;
            hov.userData.ww = obj; 
            storebox[pos.newname] = 0; 
            hoverbox.push(hov); 
            scenes.add(hov); 
        }
    }
}

const racks = []; 
const wadah = []; 
const modeload = new GLTFLoader(); 
modeload.load('./rack1/scene.gltf', item => {
    let tinggi = 0; 
    // item.scene.scale.z = 2;
    // item.scene.updateMatrixWorld(true)
    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) wadah.push(i); 
        if(i.name == "Sides_1") {
            i.scale.y = 2;
            i.updateMatrixWorld(true); // Update Posisinya
            tinggi = getObjectSize(i).y;
        }
    })

    // Tambah 5 Level
    let hope = 6; 
    let rest = hope - wadah.length; // 6-3 
    for(let i=0; i<rest; i++) {
        let wadahbaru = wadah[0].clone(); 
        item.scene.add(wadahbaru)
        wadah.push(wadahbaru);
    }
    
    let long = wadah.length - 1 ;
    let marginBawah  = 0.4;
    let marginAtas   = 0.4;
    let usableHeight = tinggi - marginAtas - marginBawah;
    let gaps = usableHeight / long;
    let boxH = (gaps/stackeds) - 0.05; // gap dibagi jumlah maximal box
    for (let i=0; i<=long; i++) wadah[i].position.y = marginBawah + gaps * i;

    // Single Rack 
    // scenes.add(item.scene)
    // item.scene.traverse(i => {
    //     if(i.name.includes("Shelf_Supports")) {
    //         const p = getObjectSize(i); 
    //         const s = planeShadowed(p, 3, 2); 
    //         createHover(s, p.x, 1, 3, 2, i.name, boxH, i);
    //     }
    // })


    // Multiple rack 
    const rackqtys = 4; 
    const gridSize = 2;   // 2x2
    const spacing  = 5;    // jarak antar objek (lebih longgar)
    const offsetX  = (gridSize - 1) * spacing / 2;
    const offsetZ  = (gridSize - 1) * spacing / 2;
    for (let i = 0; i < rackqtys; i++) {
        const rack = SkeletonUtils.clone(item.scene);    
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;

        // shift posisi agar grid center
        rack.position.set(col * spacing - offsetX, 0, row * spacing - offsetZ);
        rack.updateMatrixWorld(true); // Update Posisinya
        racks.push(rack)
    }
    
    racks.forEach((item, index) => {
        scenes.add(item)
        item.traverse(i => {
            if(i.name.includes("Shelf_Supports")) {
                const p = getObjectSize(i); 
                const s = planeShadowed(p, 2, 3, i);
                const n = i.name + "_" + index; 
                createHover(s, p.x, 1, 3, 2, n, boxH, i);
            }
        })
    })
    
})

// Pointing
const raycaster     = new THREE.Raycaster(); 
const mousePosition = new THREE.Vector2(); 
let intersects = undefined, ishover = null;  
const getIntersects = (e, obj, s) => {
    mousePosition.x =  (e.clientX/widths) * 2 - 1;
    mousePosition.y = -(e.clientY/height) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera); 
    if(s) return raycaster.intersectObjects(obj); 
    else return raycaster.intersectObject(obj)
}; 
window.addEventListener('mousemove', function(e) {
    intersects = getIntersects(e, hoverbox, true); 
    if(intersects.length > 0) {
        if(ishover !== intersects[0].object) {
            if(ishover) ishover.material.opacity = 0
            ishover = intersects[0].object; 
            ishover.material.opacity = 0.5;
        }
    } else {
        if(ishover) {
            ishover.material.opacity = 0; 
            ishover = null; 
        }
    }
})
window.addEventListener('dblclick', function(e) {
    intersects = getIntersects(e, hoverbox, true);
    if (intersects.length === 0) return;

    const count = storebox[intersects[0].object.name];     
    if (count >= stackeds) {
        alert("Max");
        return;
    }

    const w = intersects[0].object.userData.cw * 0.5;
    const h = intersects[0].object.userData.ch * 0.5;
    const b = intersects[0].object.userData.bh;
    const s = boxes(w, b, h, Math.random() * 0xFFFFFF, false, 1);

    // --- posisi tengah cell di world ---
    const centerWorld = new THREE.Vector3();
    intersects[0].object.getWorldPosition(centerWorld);
    const centerLocal = intersects[0].object.userData.ww.worldToLocal(centerWorld.clone());

    s.position.set(
        centerLocal.x,
        centerLocal.y + (b / 2) + (count * b),
        centerLocal.z
    );

    intersects[0].object.userData.ww.add(s);
    stackbox.push(s);
    storebox[intersects[0].object.name]++;
});



const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})