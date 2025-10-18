import * as THREE from 'three';         // Visual (HTML) 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SKELETON from 'three/examples/jsm/utils/SkeletonUtils'; 
let width = window.innerWidth; 
let height = window.innerHeight; 
let aspect = width/height
let scenes = new THREE.Scene(); 
let camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(30, 30, 30); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(width, height); 
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
const grids = new THREE.GridHelper(20, 20);
let ambient = new THREE.AmbientLight(0xFFFFFF, 9); 
orbit.update();

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
const groundMes = CreateGround(20, 0xABC00FF, 'ground', false, false); 
const groundHov = CreateGround(1, null, null, true, true);

// Create Object Pointing
const clock    = new THREE.Clock(); 
const modeload = new GLTFLoader(); 
const cubeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4,4,2), new THREE.MeshBasicMaterial({color: 0xFF00FF, wireframe: true})); 
const modelurl = new URL('./models/Stag.gltf', import.meta.url); 
let model, anime;
modeload.load(modelurl.href, item => {
    item.scene.scale.set(0.3,0.3,0.3); 
    model = item.scene; 
    anime = item.animations; 
})

// Pointing
const mousePosition = new THREE.Vector2(); 
const raycaster = new THREE.Raycaster(); 
let intersects; 
const pointing = (e) => {
    mousePosition.x =  (e.clientX / width)  * 2 - 1; 
    mousePosition.y = -(e.clientY / height) * 2 + 1; 
    raycaster.setFromCamera(mousePosition, camera); 
    intersects = raycaster.intersectObjects(scenes.children); 
    // Object Pointing
    intersects.forEach(item => {
        if(item.object.name == 'ground') {
            const hoverPos = new THREE.Vector3().copy(item.point).floor().addScalar(0.5); 
            groundHov.position.set(hoverPos.x, 0, hoverPos.z);
            if(check()) groundHov.material.color.setHex(0xFF0000)
            else groundHov.material.color.setHex(0xFFFFFF);
        }
    })
}
window.addEventListener('mousemove', e => pointing(e)); 

// Object add
let objects = []; 
let mixers  = [];
const mapping = data => {
    data.position.copy(groundHov.position); 
    scenes.add(data); 
    objects.push(data);
}
const check = () => objects.find(i => i.position.x == groundHov.position.x && i.position.z == groundHov.position.z);
const addObject = () => {
    const user = prompt("Add Object ? (1/2)");
    if(user == "1") {
        const cube = cubeMesh.clone(); 
        mapping(cube);
    } else {
        const mymodel = SKELETON.clone(model); 
        mapping(mymodel);
        const mixer  = new THREE.AnimationMixer(mymodel); 
        const plays  = THREE.AnimationClip.findByName(anime, 'Idle_2'); 
        const action = mixer.clipAction(plays); 
        action.play(); 
        mixers.push(mixer);
    }
}
window.addEventListener('dblclick', function(e) {
    if(!check()) {
        intersects.forEach(item => {
            if(item.object.name == 'ground') {
                console.log("you in ground"); 
                addObject();
            }
        })
    }
})

scenes.add(grids, groundMes, groundHov, ambient);
function animate(time) {
    // Blinking
    groundHov.material.opacity = 1 + Math.sin(time/120);
    objects.forEach(item => {
        if(item.type == "Mesh") {
            item.rotation.x = time/1000;
            item.rotation.y = time/1000;
        }
    })
    if(mixers.length > 0) mixers.forEach(item => item.update(clock.getDelta()))
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate)
window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(width, height); 
})