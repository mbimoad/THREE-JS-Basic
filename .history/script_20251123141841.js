import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(8, aspect, 0.1, 1000); 
camera.position.set(30,30,30); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x999999); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement);
const boxes = (w1,w2,w3,c,t,o) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: c, transparent: t, opacity: o}))
const orbit = new OrbitControls(camera, renderer.domElement);
const grids = new THREE.GridHelper(20,20); 
grids.raycast = () => {};
orbit.update(); 
scenes.add(grids); 
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1))

const loader = new GLTFLoader(); 
loader.load('./rack1/Scene.gltf', item => {
    scenes.add(item.scene); 
    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) {
            const p = getObjectSize(i);
            const s = planeShadowed(p,3,2)
            createHover(s,p.x,1,3,2, i.name); 
        }
    })
})
const raycaster = new THREE.Raycaster(); 
const mousePosition = new THREE.Vector2(); 
const getIntersects = (obj,e) => {
    mousePosition.x =  (e.clientX/widths) * 2 - 1; 
    mousePosition.y = -(e.clientY/height) * 2 + 1; 
    raycaster.setFromCamera(mousePosition, camera); 
    return raycaster.intersectObjects(obj)
}
window.addEventListener('mousemove', function(e) {
    let cursor = getIntersects(hoverBox, e);
    if(cursor.length > 0)
})

const hoverBox = [], 
container = {};

function createHover(s,w,h,wg,hg,n) {
    const cw = w/wg;
    const ch = h/hg; 
    const cs = 0.01; 
    const bh = 0.3; 
    for(let i=0; i<wg; i++) {
        for(let j=0; j<hg; j++) {
            const hov = boxes(cw,cs,ch,0xFFFFFF,true,0);
            const pos = gposi(w,h,cw,ch,bh,s,i,j,0,n,cs); 
            hov.position.set(pos.x,pos.y3,pos.z)
            hov.name = pos.name; 
            hov.userData.cw = cw; 
            hov.userData.ch = ch; 
            hov.userData.bh = bh; 
            scenes.add(hov)
            hoverBox.push(hov); 
            container[pos.name] = 0; 
        }
    }
}
function gposi(w,h,cw,ch,bh,s,i,j,k,n,cs) {
    let y = bh/2 + k * bh;
    return {
        x: (-w/2 + i * cw + cw / 2) + s.position.x,
        z: (-h/2 + j * ch + ch / 2) + s.position.z,
        y: y,
        y2: y + s.position.y,
        y3: cs + s.position.y,
        name: `${n}-${i}-${j}`
    }
}

function planeShadowed(parent, col, row) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(parent.x, 1, col, row), new THREE.MeshBasicMaterial({color: 0x00FF00, wireframe: true})); 
    scenes.add(mesh); 
    mesh.rotation.x = -Math.PI/2; 
    mesh.position.copy(parent.cntr); 
    return mesh
}
function getObjectSize(parent) {
    const boxs = new THREE.Box3().setFromObject(parent); 
    const size = new THREE.Vector3(); 
    const cntr = boxs.getCenter(new THREE.Vector3()); 
    cntr.y += 0.1; 
    boxs.getSize(size)
    return {
        cntr, 
        x: size.x,
        y: size.y
    }
}

const animate = () => {
    renderer.render(scenes, camera)
}


renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})