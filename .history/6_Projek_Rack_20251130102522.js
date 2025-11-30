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
let   hoverbox = [],
      datasbox = [], 
      stackeds = 5, 
      storebox = {}; 

// Initialize data 
datasbox = [
    {
        "rack": "Shelf_Supports_12_3-1-1",
        "position": new THREE.Vector3(0.2651501893997188, 0.18979999930858557, 0)
    },
    {
        "rack": "Shelf_Supports_12_0-1-1",
        "position": new THREE.Vector3(0.26515018939971924, 0.18979999930858601, 0)
    }
];

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
function planeShadowed(parentObj, size, col, row) {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x, 1, col, row),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true })
    );

    mesh.rotation.x = -Math.PI / 2;

    const wp = new THREE.Vector3();
    parentObj.getWorldPosition(wp);
    mesh.position.y = wp.y += 0.1;
    // mesh.position.set(wp.x, wp.y + 0.1, wp.z);
    parentObj.parent.add(mesh);
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
function createHover(plane, w, h, wg, hg, n, boxH, obj) {
    const {cw, ch, bh, cs, bw, bd} = getFormula(w, h, wg, hg, boxH);

    for (let i = 0; i < wg; i++) {
        for (let j = 0; j < hg; j++) {
            const hov = boxes(cw, cs, ch, 0x00FF00, true, 1);
            hov.material.opacity = 0.4;

            // --- posisi center hover cell di world ---
            const pos = gposi(w, h, cw, ch, bh, plane, i, j, 0, n, cs);
            hov.position.set(pos.x, pos.y3, pos.z);

            hov.name = pos.newname;
            hov.userData.cw = cw;
            hov.userData.ch = ch;
            hov.userData.bh = bh;
            hov.userData.ww = obj;  // pakai obj yang asli

            // Simpan hover di store
            storebox[pos.newname] = 0;
            hoverbox.push(hov);

            // --- tambahkan hover ke objek rak langsung ---
            obj.parent.add(hov);  // ikut bergerak kalau rak clone
        }
    }
}

const racks = []; 
const wadah = []; 
const modeload = new GLTFLoader(); 
modeload.load('./rack1/scene.gltf', item => {
    let tinggi = 0; 
    item.scene.scale.z = 2; 
    item.scene.updateMatrixWorld(true)
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
    //         const s = planeShadowed(i, p, 3, 2); 
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
                const s = planeShadowed(i, p, 3, 2);                
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
    datasbox.push({
        position: s.position, 
        rack: intersects[0].object.name,
    });
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