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

let maxstacked = 5, container = {}, hoverbox = [], stackedBox = []; 
const orbit = new OrbitControls(camera, renderer.domElement); 
const boxes = (w1,w2,w3,c,t,o) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: c, transparent: t, opacity: o}))
const grids = new THREE.GridHelper(20,20);
orbit.update(); 
scenes.add(grids);
grids.raycast = () => {};  
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1))

const loader = new GLTFLoader(); 
loader.load('./rack1/Scene.gltf', item => {
    scenes.add(item.scene); 
    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) {
            const p = getObjectSize(i); 
            const s = createShadowed(p,3,2); 
            createHover(s,p.x,1,3,2,i.name);
        }
    })
})
function getFormula(w,h,wg,hg) {
    const cw = w/wg;
    const ch = h/hg; 
    const cs = 0.01; 
    const bh = 0.3; 
    const bw = Math.min(0.3, cw * 0.8);
    const bd = Math.min(0.3, ch * 0.8);
    return {cw,ch,cs,bh,bw,bd}
}
function createHover(s,w,h,wg,hg,n) {
    const {cw,ch,cs,bh,bw,bd} = getFormula(w,h,wg,hg); 
    for(let i=0; i<wg; i++) {
        for(let j=0; j<hg; j++) {
            const hov = boxes(cw,cs,ch,0xFFFFFF,true,0); 
            const pos = gposi(w,h,cw,ch,bh,s,i,j,0,n,cs);
            hov.name = pos.name; 
            hov.userData.cw = cw; 
            hov.userData.ch = ch; 
            hov.userData.bh = bh; 
            hov.position.set(pos.x,pos.y3,pos.z); 
            scenes.add(hov)
            container[pos.name] = 0; 
            hoverbox.push(hov); 
        }
    }
}
function gposi(w,h,cw,ch,bh,s,i,j,k,n,cs) {
    let y = bh / 2 + k * bh;
    return {
        x: (-w/2 + i * cw+cw/2) + s.position.x,
        z: (-h/2 + j * ch+ch/2) + s.position.z,
        y: y, 
        y2: y + s.position.y, 
        y3: cs + s.position.y, 
        name: `${n}-${i}-${j}`
    } 
}
function createShadowed(parent, col, row) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(parent.x,1,col,row), new THREE.MeshBasicMaterial({color: 0x00FF00, wireframe: true})); 
    mesh.rotation.x = -Math.PI/2; 
    mesh.position.copy(parent.cntr); 
    scenes.add(mesh)
    return mesh
}
const createGround = (w,h,wg,hg) => {
    const g = new THREE.Mesh(
        new THREE.PlaneGeometry(w,h,wg,hg), 
        new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true})
    )
    g.rotation.x = -Math.PI/2; 
  
    return g;
}
const ground1 = createGround(2,2,3,2);
const ground2 = createGround(2,2,3,2);
scenes.add(ground1,ground2)
ground1.position.x = -3;
ground2.position.x = 3;
createHover(ground1,2,2,3,2);
createHover(ground2,2,2,3,2);
function loopingBoxToPlaneGeometry(stack,s,w,h,wg,hg,n) {
    const {cw,ch,bh,cs,bw,bd} = getFormula(w,h,wg,hg)
}

const getObjectSize = parent => {
    const boxs = new THREE.Box3().setFromObject(parent); 
    const size = new THREE.Vector3(); 
    const cntr = boxs.getCenter(new THREE.Vector3()); 
    cntr.y += 0.1; 
    boxs.getSize(size); 
    return {
        cntr, 
        x: size.x, 
        y: size.y, 
        z: size.z
    }
}
const raycaster = new THREE.Raycaster(); 
const mouseposi = new THREE.Vector2(); 
const getIntersects = (obj, e) => {
    mouseposi.x =   (e.clientX/widths) * 2 - 1;
    mouseposi.y = - (e.clientY/height) * 2 + 1;
    raycaster.setFromCamera(mouseposi, camera); 
    return raycaster.intersectObjects(obj)
}
let ishover = null; 
window.addEventListener('mousemove', function(e) {
    const hit = getIntersects(hoverbox, e); 
    if(hit.length > 0) {
        if(ishover != hit[0].object) {
            if(ishover) ishover.material.opacity = 0;
            ishover = hit[0].object; 
            ishover.material.opacity = 1;
        }
    } else {
        if(ishover) {
            ishover.material.opacity = 0;
            return;
        }
    }
})
let spinningBox = undefined;
window.addEventListener('dblclick', function(e) {
    let hit = getIntersects(scenes.children, e); 
    if(hit.length === 0) return;
    if(hit.length > 0) {
        if(stackedBox.includes(hit[0].object)) {
            alert("You click the box");
            spinningBox = hit[0].object; 
            return;
        }
        console.log(container)
        if(hoverbox.includes(hit[0].object)) {
            const count = container[hit[0].object.name]; 
            if(count >= maxstacked) {
                alert("max reached");
                return;
            }

            const w = hit[0].object.userData.cw * 0.8;
            const h = hit[0].object.userData.ch * 0.8;
            const b = hit[0].object.userData.bh;
            const newbox = boxes(w,b,h,Math.random() * 0xFFFFFF, true, 1); 
            newbox.position.set(
                hit[0].object.position.x,
                hit[0].object.position.y + (b/2) + (count * b),
                hit[0].object.position.z,
            )
            scenes.add(newbox); 
            container[hit[0].object.name]++; 
            stackedBox.push(newbox)
        }
    }
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