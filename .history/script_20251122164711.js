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

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x000000); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

let gs = 20; 
scenes.add(new THREE.GridHelper(gs,gs)); 
scenes.add(new THREE.AmbientLight(0xFFFFFF,1)); 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: Math.random() * 0xFFFFFF, colorWrite: c})); 

// 1. invisible
function createInvisibleWall(x) {
    const wall = boxmesh(8,4,2.2, true);
    wall.position.set(x,2,0);
    wall.renderOrder = 1; 
    const walls = wall.clone(); 
    walls.position.x = -x; 
    scenes.add(wall, walls)
}
createInvisibleWall(8.09)

const clocks = new THREE.Clock(); 
const mixers = []; 
const loader = new GLTFLoader(); 
loader.load('./models/Chicken.gltf', item => {
    scenes.add(item.scene); 
    item.scene.position.x = 0; 
    item.scene.rotation.y = -Math.PI/2; 
    item.scene.scale.set(0.5,0.5,0.5);
    if(item.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(item.scene); 
        const walks = THREE.AnimationClip.findByName(item.animations, 'Walk'); 
        if(walks) {
            const action = mixer.clipAction(walks); 
            action.play(); 
            mixers.push({
                model: item.scene, 
                mixer
            })
        }
    }
    item.scene.traverse(i => {
        if(i.isMesh) i.renderOrder = 2;  
    })
})

// Pointing 
const createGround = (s,c,t,v,n) => {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(s,s), 
        new THREE.MeshBasicMaterial({
            transparent: t, 
            side: THREE.DoubleSide, 
            color: c
        })
    )
    mesh.visible = v; 
    mesh.name = n; 
    mesh.rotation.x = -Math.PI/2; 
    return mesh
}
const ob = []; 
const gm = createGround(gs, 0x0000FF, false, false, 'ground');
const gh = createGround(1, null, true, true, null);
const ch = () => ob.find(item => item.position.x == gh.position.x && item.position.z == gh.position.z)
scenes.add(gm,gh)

let intersect = undefined; 
let raycaster = new THREE.Raycaster(); 
let mouseposi = new THREE.Vector2(); 
const updateMouse = e => {
    mouseposi.x =   (e.clientX/widths) * 2 - 1; 
    mouseposi.y = - (e.clientY/height) * 2 + 1; 
}

window.addEventListener('mousemove', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mouseposi, camera); 
    intersect = raycaster.intersectObjects(scenes.children); 
    intersect.forEach(item => {
        if(item.object.name == 'ground') {
            const hp = new THREE.Vector3().copy(item.point).floor().addScalar(0.5); 
            gh.position.set(hp.x,0,hp.z);  
            if(ch()) {
                gh.material.color.set(0xFF0000)
            } else {
                gh.material.color.set(0xFFFFFF)
            }
        }
    })
})
const box = boxmesh(1,1,1,true); 
box.position.set(0,0.5,-3);
box.position.drag = true; 
scenes.add(box);
window.addEventListener('dblclick', function(e) {
    if(!ch()) {
        intersect.forEach(item => {
            if(item.object.name == 'ground') {
                const bc = box.clone(); 
                bc.scale.set(0.5,0.5,0.5); 
                bc.position.copy(gh.position); 
                bc.position.y = 0.5;
                scenes.add(bc)
                gh.material.color.set(0xFF0000)
                ob.push(bc)
            }
        })
    }
})
// 3. drag drop 
let gap1 = 2; 
let gap2 = gap1 + 0.2; 
let grid = []; 
let target = undefined; 
let drag = false; 
for(let i=0; i<1; i++) {
    for(let j=0; j<2; j++) {
        for(let k=0; k<2; k++) {
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(gap1,gap1), 
                new THREE.MeshBasicMaterial({color: 0xFFFFFF, side: THREE.DoubleSide})
            )
            
        }
    }
}



function animate() {
    mixers.forEach(({model, mixer}) => {
        mixer.update(clocks.getDelta()); 
        model.position.x -= 0.03;
        if(model.position.x < -5) model.position.x = 5; 
    })
    renderer.render(scenes, camera);    
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths,height); 
})