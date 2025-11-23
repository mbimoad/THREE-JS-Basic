import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight;
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5, 10, 5); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setClearColor(0xCCCCCC); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement)

const gs = 20; 
scenes.add(new THREE.GridHelper(gs, gs));
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1)); 
const boxmesh = (w1,w2,w3,c) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshBasicMaterial({color: Math.random() * 0xFFFFFF, colorWrite: c})); 
const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 

const createInvisibleWall = x => {
    const wall = boxmesh(8,4,2.2,true); 
    wall.position.set(x,2,0); 
    wall.renderOrder = 1; 

    const wall2 = wall.clone(); 
    wall.position.x = -x; 
    scenes.add(wall,wall2); 
}
createInvisibleWall(8.09)

const loader = new GLTFLoader(); 
const mixers = []; 
const clocks = new THREE.Clock(); 
loader.load('./models/Chicken.gltf', item => {
    scenes.add(item.scene);
    item.scene.scale.set(0.4,0.4,0.4);
    item.scene.position.x = 0; 
    item.scene.rotation.y = -Math.PI/2 || 0;

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
        if(i.isMesh) i.renderOrder = -1; 
    })
})

const createGround = (s,c,n,t,v) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(s,s), new THREE.MeshBasicMaterial({
        color: c, 
        transparent: t, 
        visible: v, 
        side: THREE.DoubleSide,
    }))
    mesh.name = n
    mesh.rotation.x = -Math.PI/2;
    return mesh
}
const ob = []; 
const gm = createGround(gs, 0xFF00FF, 'ground', false, false); 
const gh = createGround(1, null, null, true, true); 
scenes.add(gm,gh)


let intersect = undefined; 
let raycaster = new THREE.Raycaster(); 
let mouseposi = new THREE.Vector2();
let checkobjs = () => ob.find(item => item.position.x == gh.position.x && item.position.z == gh.position.z)
let updatemou = e => {
    mouseposi.x =   (e.clientX/widths) * 2.2 - 1;
    mouseposi.y = - (e.clientY/height) * 2.2 + 1;
} 
window.addEventListener('mousemove', function(e) {
    updatemou(e); 
    raycaster.setFromCamera(mouseposi, camera); 
    intersect = raycaster.intersectObjects(scenes.children); 
    intersect.forEach(item => {
        if(item.object.name == 'ground') {
            let hp = new THREE.Vector3().copy(item.point).floor().addScalar(0.5); 
            gh.position.set(hp.x, 0, hp.z); 
            if(checkobjs()) gh.material.color.set(0xFF0000)
            else gh.material.color.set(0xFFFFFF)
            
        }
    })
})
 
const box = boxmesh(1,1,1,true); 
scenes.add(box)
box.position.y = 0.5;

const animate = (time) => {
    mixers.forEach(({mixer, model}) => {
        mixer.update(clocks.getDelta()); 
        model.position.x -= 0.03;
        if(model.position.x < -5) model.position.x = 5; 
    })
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})