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
const gm = createPlaneGround(gs, 0xFF00FF, 'ground', false, false);
const gh = createPlaneGround(1, null, null, true, true);
scenes.add(gm,gh);

const animate = () => {
    renderer.render(scenes,camera)
    mixers.forEach(({model, mixer}) => {
        mixer.update(clocks.getDelta()); 
        model.position.x -= 0.03;
        if(model.position.x < -5) model.position.x = 5; 
    })
}
renderer.setAnimationLoop(animate)



window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths,height); 
})