import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const widths = window.innerWidth; 
const height = window.innerHeight;
const aspect = widths/height;
const scenes = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
camera.position.set(5, 10, 5);
camera.lookAt(0,0,0)
renderer.setSize(widths, height);
renderer.setClearColor(0xFEFEFE);
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement);

let gs = 20; 
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update(); 
scenes.add(new THREE.GridHelper(gs, gs));
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1));
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: Math.random() * 0xFFFFFF, colorWrite: c}));

// Invisible walls
const createInvisibleWall = (x) => {
    const wall = boxmesh(8,4,2.2,true); 
    wall.position.set(x, 2, 0);
    wall.renderOrder = 1;
    let mirror = wall.clone(); 
    mirror.position.x = -x;
    scenes.add(mirror, wall); 
};
createInvisibleWall(8.09);

const mixers = [];
const loader = new GLTFLoader();
const clock  = new THREE.Clock();
loader.load('./models/Chicken.gltf', item => {
    item.scene.scale.set(0.4,0.4,0.4); 
    item.scene.position.x = 0, 
    item.scene.rotation.y = -Math.PI/2 || 0; 
    scenes.add(item.scene);

    if(item.animations.length > 0) {
        const mixer    = new THREE.AnimationMixer(item.scene); 
        const walkIdle = THREE.AnimationClip.findByName(item.animations, 'Walk');
        if(walkIdle) {
            const action = mixer.clipAction(walkIdle); 
            action.play(); 
            mixers.push({mixer, model: item.scene})
        }
    }
    item.scene.traverse(i => {
        if(i.isMesh) i.renderOrder = 2; 
    })
})

// Pointing
const CreateGround = (s,c,n,t,v) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(s,s), new THREE.MeshBasicMaterial({transparent: t, color: c, side: THREE.DoubleSide})); 
    mesh.rotation.x = -Math.PI/2 || 0; 
    mesh.name = n; 
    mesh.visible = v; 
    return mesh;
}
const gm = CreateGround(gs, 0xABC00FF, 'ground', false, false); 
const gh = CreateGround(1, 0xFFFFFF, null, true, true);
scenes.add(gm, gh)


let intersects  = undefined; 
let objects     = [];
const check = () => objects.find(i => i.position.x == gh.position.x && i.position.z == gh.position.z);
const mousePosition = new THREE.Vector2(); 
const raycaster = new THREE.Raycaster(); 
function updateMouse(e) {
    mousePosition.x =  (e.clientX / widths ) * 2 - 1; 
    mousePosition.y = -(e.clientY / height ) * 2 + 1;  
}

window.addEventListener('mousemove', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mousePosition, camera); 
    intersects = raycaster.intersectObjects(scenes.children); 
    intersects.forEach(i => {
        if(i.object.name == 'ground') {
            const hp = new THREE.Vector3().copy(i.point).floor().addScalar(0.5); 
            gh.position.set(hp.x, 0, hp.z);
            if(check()) gh.material.color.setHex(0xFF0000)
            else gh.material.color.setHex(0x000000);
        }
    })
})
// Inisialisasi 
const box = boxmesh(1,1,1,true); 
box.position.set(0,0.5, -3)
box.position.drag = true;
scenes.add(box);
window.addEventListener('dblclick', function(e) {
    if(!check()){
        intersects.forEach(item => {
            if(item.object.name == 'ground') {
                let bc = box.clone(); 
                bc.position.copy(gh.position); 
                bc.position.y = 0.5;
                bc.scale.set(0.5,0.5,0.5);
                scenes.add(bc); 
                objects.push(bc);
            }
        })
    }
})

// Drag Drop
let gap1 = 2;
let gap2 = gap1 + .2; 
let grid = []; 
let target = undefined; 
let drag = false;
for(let i=0; i<1; i++) {
    // Lebar
    for(let j=0; j<2; j++) {
        // Panjang
        for(let k=0; k<3; k++) {
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(2,2), 
                new THREE.MeshBasicMaterial({color: 0xEEEEEE, side: THREE.DoubleSide})
            )
            scenes.add(mesh); 
            mesh.rotation.x = -Math.PI/2; 
            mesh.position.set(gap2*j, 1, gap2*k); 
            mesh.userData.islv = i; 
            grid.push(mesh); 
        }
    }
}
window.addEventListener('pointerdown', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mousePosition, camera); 
    const i = raycaster.intersectObject(box); 
    if(i.length > 0) drag = true; 
})
window.addEventListener('pointerup', function(e) {
    e.preventDefault();
    drag = false; 
})
window.addEventListener('pointermove', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mousePosition, camera); 
    if(drag) {
        const io = raycaster.intersectObjects(grid, true); 
        if(io.length > 0) { 
            target  = new THREE.Vector3(io[0].object.position.x, io[0].object.position.y + 0.5, io[0].object.position.z)
        } else {
            const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0); 
            const point = new THREE.Vector3(); 
            raycaster.ray.intersectPlane(plane, point); 
            if(point) target = new THREE.Vector3(point.x, 0.5, point.z)
        }
    }
})

// MODEL MODIFICATION
const wadah = []; 
const modelboxs = new URL('./boxs1/scene.gltf', import.meta.url); 
const modelrack = new URL('./rack1/scene.gltf', import.meta.url); 
loader.load(modelrack.href, item => {
    scenes.add(item.scene); 
    item.scene.position.set(0,2,0); 
    item.scene.scale.set(2,1,2);
})

// Animation loop
function animate(time) {
    mixers.forEach(({ mixer, model }) => {
        mixer.update(clock.getDelta());
        model.position.x -= 0.03;
        if (model.position.x < -5) model.position.x = 5;
    });
    gh.material.opacity = 1 + Math.sin(time/120);
    objects.forEach(item => {
        if(item.type == "Mesh") {
            item.rotation.x = time/1000;
            item.rotation.y = time/1000;
        }
    })
    // Drag drop 
    if(target && !box.position.equals(target)) box.position.lerp(target, 0.1);
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(widths, height);
});