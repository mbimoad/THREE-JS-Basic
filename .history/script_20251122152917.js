import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scenes = new THREE.Scene();  
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5,10,15); 
camera.lookAt(0,0,0); 
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(widths, height); 
renderer.setClearColor(0xDDDDDD); 
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

let gs = 20; 
scenes.add(new THREE.GridHelper(gs,gs)); 
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1)); 
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({colorWrite: c, color: Math.random() * 0xFFFFFF}));
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 

const createInvisibleWall = x => {
    const wall = boxmesh(8,4,2.2, true);
    wall.position.set(x,2,0); 
    wall.renderOrder = 1; 
    const wallc = wall.clone(); 
    wallc.position.x = -x; 
    scenes.add(wall,wallc)
}
createInvisibleWall(8.09); 

const loader = new GLTFLoader(); 
const mixers = []; 
const clocks = new THREE.Clock(); 
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
            mixers.push(
                {model: item.scene, mixer}
            )
        }
    }

    item.scene.traverse(i => {
        if(i.isMesh) i.renderOrder = 2; 
    })
})

// Pointing 
const createPlaneGround = (s,c,n,t,v) => {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(s,s), 
        new THREE.MeshBasicMaterial({color: c, transparent: t})
    )
    mesh.name = n; 
    mesh.visible = v; 
    mesh.rotation.x = -Math.PI/2; 
    return mesh; 
}
const ob = []; 
const gm = createPlaneGround(gs, 0xFF00FF, 'ground', false, false);
const gh = createPlaneGround(1, null, null, true, true);
scenes.add(gm,gh);

let raycaster = new THREE.Raycaster(); 
let mouseposi = new THREE.Vector2(); 
let intersect = undefined; 
let checkobjs = () => ob.find(item => item.position.x == gh.position.x && item.position.z == gh.position.z); 
const updateMouse = (e) => {
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
            if(checkobjs()) gh.material.color.set(0xFF0000);
            else gh.material.color.set(0xFFFFFF)
        }
    })
})

const box = boxmesh(1,1,1,true);
box.position.set(0,0.5,-3)
box.position.drag = true; 
scenes.add(box)

window.addEventListener('dblclick', function(e) {
    if(!checkobjs()) {
        const bc = box.clone(); 
        bc.position.copy(gh.position); 
        bc.position.y = 0.5; 
        bc.scale.set(0.5,0.5,0.5);
        scenes.add(bc); 
        ob.push(bc)
        gh.material.color.set(0xFF0000)
    }
})

let gap1 = 2; 
let gap2 = gap1 + 0.2; 
let grid = []; 
let target = undefined; 
let drag = false; 
for(let i=0; i<1; i++) {
    for(let j=0; j<2; j++) {
        for(let k=0; k<3; k++) {
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(gap1,gap1), 
                new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide})
            )
            mesh.rotation.x = -Math.PI/2; 
            mesh.position.set(gap2*j, 1, gap2*k)
            mesh.userData.islv = i;
            scenes.add(mesh)
            grid.push(mesh)
        }
    }
}

window.addEventListener('pointerdown', function(e) {
    updateMouse(e);
    raycaster.setFromCamera(mouseposi, camera); 
    const io = raycaster.intersectObject(box); 
    console.log(io);
    if(io.length > 0) drag = true;   
})

window.addEventListener('pointerup', function(e) {
    e.preventDefault(); 
    drag = false; 
})

window.addEventListener('pointermove', function(e) {
    updateMouse(e); 
    raycaster.setFromCamera(mouseposi, camera); 
    if(drag) {
        const io = raycaster.intersectObjects(grid, true); 
        if(io) {

            if(io.length > 0) 
                target = new THREE.Vector3(
                    io[0].object.position.x, 
                    io[0].object.position.y + 0.5, 
                    io[0].object.position.z
                ); 
        } else {
            const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0); 
            const point = new THREE.Vector3(); 
            raycaster.ray.intersectPlane(plane, point); 
            target = new THREE.Vector3(point.x, 0.5, point.z); 
        }
    }
})

const modelboxs = new URL('./boxs1/scene.gltf', import.meta.url);
const modelrack = new URL('./rack2/scene.gltf', import.meta.url);
const wadah = []; 
loader.load(modelrack.href, item => {
    scenes.add(item.scene);
    item.scene.scale.set(2,1,2)
    item.scene.position.x = 0; 
    item.scene.position.y = 2; 
    let tinggi = 0; 

    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) wadah.push(i)
        if(i.name == "Sides_1") {
            i.scale.y = 2;
            i.updateMatrixWorld(true); 
            tinggi = getObjectSize(i).y;
            console.log(tinggi)
        }
    })
    const lst = wadah.length - 1;
    const wcl = wadah[lst].clone(); 
    wadah.push(wcl); 
    const gap = tinggi / lst; 
    item.scene.add(wcl); 
    
    for(let i=0; i<=lst; i++) wadah[i].position.y = gap * i;
   

})

function getObjectSize(obj) {
    const boxs = new THREE.Box3().setFromObject(obj); 
    const size = new THREE.Vector3(); 
    boxs.getSize(size); 
    return size; 
}


const animate = (time) => {
    renderer.render(scenes,camera)
    mixers.forEach(({model, mixer}) => {
        mixer.update(clocks.getDelta()); 
        model.position.x -= 0.03;
        if(model.position.x < -5) model.position.x = 5; 
    })
    gh.material.opacity = 1 + Math.sin(time/120)

    ob.forEach(item => {
        if(item.type == "Mesh") {
            item.rotation.x += 0.05; 
            item.rotation.y += 0.05; 
        }
    })

    if(target && !box.position.equals(target)) box.position.lerp(target, 0.1);
}
renderer.setAnimationLoop(animate)



window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths,height); 
})