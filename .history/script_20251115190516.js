import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const widths = window.innerWidth; 
const height = window.innerHeight;
const aspect = widths/height;
const scenes = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
camera.position.set(0, 4, 14);
camera.lookAt(0,0,0)
renderer.setSize(widths, height);
renderer.setClearColor(0xFEFEFE);
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement);

let gridsize = 20; 
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update(); 
scenes.add(new THREE.GridHelper(gridsize, gridsize));
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1));

// Invisible walls
const createInvisibleWall = (x) => {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(8, 4, 2.2),
        new THREE.MeshBasicMaterial({ colorWrite: true, color: 0xFF00FF })
    );
    wall.position.set(x, 2, 0);
    wall.renderOrder = 1;
    // Mirror 
    let mirror = wall.clone(); 
    mirror.position.x = -x;
    scenes.add(mirror); 
    scenes.add(wall);
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
const CreateGround = (size, color, name, istransparent, isvisible) => {
    const Mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size), 
        new THREE.MeshBasicMaterial({
            transparent: istransparent, 
            color: color, 
            side: THREE.DoubleSide
        })
    )
    Mesh.rotation.x = -Math.PI/2;
    Mesh.name = name;
    Mesh.visible = isvisible
    return Mesh; 
}
const groundMes = CreateGround(gridsize, 0xABC00FF, 'ground', false, false); 
const groundHov = CreateGround(1, null, null, true, true);
scenes.add(groundMes, groundHov)


let intersects  = undefined; 
let objects     = [];
const check = () => objects.find(i => i.position.x == groundHov.position.x && i.position.z == groundHov.position.z);
const mousePosition = new THREE.Vector2(); 
const raycaster = new THREE.Raycaster(); 
function updateMouse(e) {
    mousePosition.x =  (e.clientX / window.innerWidth ) * 2 - 1; 
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;  
}

window.addEventListener('mousemove', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mousePosition, camera); 
    intersects = raycaster.intersectObjects(scenes.children); 
    intersects.forEach(item => {
        if(item.object.name == 'ground') {
            const hoverPos = new THREE.Vector3().copy(item.point).floor().addScalar(0.5); 
            groundHov.position.set(hoverPos.x, 0, hoverPos.z);
            if(check()) groundHov.material.color.setHex(0xFF0000)
            else groundHov.material.color.setHex(0x000000);
        }
    })
})
// Inisialisasi 
const box = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), new THREE.MeshNormalMaterial());
box.position.set(0,0.5, -3)
scenes.add(box);

window.addEventListener('dblclick', function(e) {
    if(!check()){
        intersects.forEach(item => {
            if(item.object.name == 'ground') {
                let bc = box.clone(); 
                box.position.copy(groundHov.position); 
                box.position.y = 0.5;
                scenes.add(box); 
                objects.push(box);
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

window.addEventListener('pointerdown', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mousePosition, camera); 
    const i = raycaster.intersectObject(box); 
    if(i.length > 0) {
        drag = true; 
    }
})

// Level
for(let i=0; i<1; i++) {
    // Lebar
    for(let j=0; j<2; j++) {
        // Panjang
        for(let k=0; k<3; k++) {
            const cell = new THREE.Mesh(
                new THREE.PlaneGeometry(2,2), 
                new THREE.MeshBasicMaterial({color: 0xEEEEEE, side: THREE.DoubleSide})
            )
            cell.rotation.x = -Math.PI/2; 
            cell.position.set(gap2*j, gap1*i, gap2*k); 
            cell.userData.islv = i; 
            scenes.add(cell); 
            grid.push(cell); 
        }
    }
}

// Animation loop
function animate(time) {
    mixers.forEach(({ mixer, model }) => {
        mixer.update(clock.getDelta());
        model.position.x -= 0.03;
        if (model.position.x < -10) model.position.x = 10;
    });
    groundHov.material.opacity = 1 + Math.sin(time/120);
    objects.forEach(item => {
        if(item.type == "Mesh") {
            item.rotation.x = time/1000;
            item.rotation.y = time/1000;
        }
    })
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(widths, height);
});