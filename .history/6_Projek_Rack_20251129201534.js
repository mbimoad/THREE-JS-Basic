import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
function getFormula(w,h,wg,hg) {
    const cw = w/wg; 
    const ch = w/hg; 
    const cs = 0.01; 
    const bh = 0.3; 
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
function createHover(s,w,h,wg,hg,n) {
    const {cw,ch,bh,cs,bw,bd} = getFormula(w,h,wg,hg); 
    for(let i=0; i<wg; i++) {
        for(let j=0; j<hg; j++) {
            const hov = boxes(cw,cs,ch,0x00FF00, true, 0); 
            const pos = gposi(w,h,cw,ch,bh,s,i,j,0,)
        }
    }
}

const wadah = []; 
const modeload = new GLTFLoader(); 
modeload.load('./rack1/scene.gltf', item => {
    scenes.add(item.scene)
    let tinggi = 0; 
    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) wadah.push(i); 
        if(i.name == "Sides_1") {
            i.scale.y = 2;
            i.updateMatrixWorld(true); 
            tinggi = getObjectSize(i).y;
            console.log(tinggi)
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
    for (let i=0; i<=long; i++) wadah[i].position.y = marginBawah + gaps * i;

    // Add hover 
    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) {
            const p = getObjectSize(i); 
            const s = planeShadowed(p, 3, 2); 

        }
    })
})

const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})