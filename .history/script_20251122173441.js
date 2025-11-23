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
renderer.setSize(widths,height); 
renderer.setClearColor(0x000000); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

const gs = 20;
scenes.add(new THREE.GridHelper(gs,gs));
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1));
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: Math.random() * 0xFFFFFF, colorWrite: c})); 

const createInvisibleWall = x => {
    const wall = boxmesh(8,4,2.2, true); 
    wall.position.set(x,2,0); 
    wall.renderOrder = 1;
    const wallc = wall.clone(); 
    wallc.position.x = -x; 
    scenes.add(wall,wallc)
}
createInvisibleWall(8.09)

const mixers = []; 
const clocks = new THREE.Clock(); 
const loader = new GLTFLoader(); 
loader.load('./models/Chicken.gltf', item => {
    scenes.add(item.scene); 
    item.scene.position.x = 0; 
    item.scene.rotation.y = -Math.PI/2 || 0;
    item.scene.scale.set(0.5,0.5,0.5); 
    if(item.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(item.scene); 
        const walks = THREE.AnimationClip.findByName(item.animations, 'Walk'); 
        if(walks) {
            const action = mixer.clipAction(walks); 
            action.play(); 
            mixers.push({model: item.scene, mixer});
        }   
    }
    item.scene.traverse(i => {
        if(i.isMesh) i.renderOrder = 2; 
    })
}) 

const createGround = (s,c,t,v,n) => {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(s,s), 
        new THREE.MeshBasicMaterial({
            color: c, 
            transparent: t, 
            side: THREE.DoubleSide
        })
    )
    mesh.name = n; 
    mesh.visible = v;
    mesh.rotation.x = -Math.PI/2 || 0; 
    return mesh; 
}
const ob = []; 
const gm = createGround(gs, 0x222222, false, false, 'ground');
const gh = createGround(1, false, true, true, null);
const ch = () => ob.find(item => item.position.x == gh.position.x && item.position.z == gh.position.z);

let intersect = undefined; 
let mouseposi = new THREE.Vector2(); 
let raycaster = new THREE.Raycaster(); 
let updateMouse = e => {
    mouseposi.x =  (e.clientX / widths) * 2 - 1;
    mouseposi.y = -(e.clientY / height) * 2 + 1;
}
window.addEventListener('mousemove', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mouseposi, camera); 
    intersect = raycaster.intersectObjects(scenes.children); 
    intersect.forEach(item => {
        if(item.object.name == 'ground') {
            const hp = new THREE.Vector3().copy(item.point).floor().addScalar(0.5); 
            gh.position.set(hp.x, 0, hp.z);
            if(ch()) gh.material.color.set(0xFF0000); 
            else gh.material.color.set(0xFFFFFF); 
        }
    })
})
scenes.add(gm,gh)

const box = boxmesh(1,1,1,true);
box.position.set(0,0.5,-3);
box.position.drag = true; 
scenes.add(box)
window.addEventListener('dblclick', function(e) {
    if(!ch()) {
        const bc = box.clone();
        bc.position.copy(gh.position);
        bc.position.y = 0.5; 
        bc.scale.set(0.5,0.5,0.5); 
        scenes.add(bc);
        ob.push(bc); 
        gh.material.color.set(0xFF0000)
    }
})

let gap1 = 2; 
let gap2 = gap1 + 0.2; 
let grid = []; 
let drag = false; 
let target = undefined; 
for(let i=0; i<1; i++) {
    for(let j=0; j<2; j++) {
        for(let k=0; k<3; k++) {
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(gap1, gap1), 
                new THREE.MeshBasicMaterial({color: 0xBBBBBB, side: THREE.DoubleSide})
            )
            mesh.userData.islv = i;
            mesh.rotation.x = -Math.PI/2;
            mesh.position.set(gap2*j, 1, gap2*k);
            scenes.add(mesh)
            grid.push(mesh)
        }
    }
}

window.addEventListener('pointerdown', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mouseposi, camera); 
    let io = raycaster.intersectObject(box); 
    console.log(io)
    if(io.length > 0) drag = true;
})

window.addEventListener('pointerup', function(e) {
    e.preventDefault(); 
    drag = false; 
})

window.addEventListener('pointermove', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mouseposi, camera); 
    let io = raycaster.intersectObjects(grid, true); 
    if(drag) {
        if(io.length > 0) {
            target = new THREE.Vector3(
                io[0].object.position.x,
                io[0].object.position.y + 0.5,
                io[0].object.position.z,
            ) 
        } else {
            const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0); 
            const point = new THREE.Vector3(); 
            raycaster.ray.intersectPlane(plane, point); 
            if(point) target = new THREE.Vector3(point.x, 0.5, point.z);
        }
    }
})

const modelboxs = new URL('./boxs1/scene.gltf', import.meta.url);
const modelrack = new URL('./rack1/scene.gltf', import.meta.url);
loader.load(modelrack.href, item => {
    scenes.add(item.scene); 
    item.scene.position.set(0,2,0);
})


const animate = () => {
    renderer.render(scenes, camera); 
    mixers.forEach(({model,mixer}) => {
        mixer.update(clocks.getDelta());
        model.position.x -= 0.03; 
        if(model.position.x < -5) model.position.x = 5;
    })
    if(target && !box.position.equals(target)) box.position.lerp(target, 0.1);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height);
})
