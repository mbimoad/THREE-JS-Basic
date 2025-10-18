import * as THREE from 'three'; 
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import nebula from './img/nebula.jpg';
import stars from './img/stars.jpg';

// Header
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

// Canvas
const renderer = new THREE.WebGLRenderer(); 
renderer.setClearColor(0xFFFFFF);
renderer.shadowMap.enabled = true; 
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement);

// Box 
const boxGeo = new THREE.BoxGeometry(5,5,5); 
const boxMat = new THREE.MeshBasicMaterial({color: 0xFFF000, wireframe: true}); 
const boxMes = new THREE.Mesh(boxGeo, boxMat); 
scenes.add(boxMes);

// Line
const points = [
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(0, 10, 0),
    new THREE.Vector3(10, 0, 0),
];
const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
const lineMat = new THREE.LineBasicMaterial({color: 0xFFFFFF}); 
const lineMes = new THREE.Line(lineGeo, lineMat);
scenes.add(lineMes);

// Ground
const groundGeo = new THREE.PlaneGeometry(30, 30); 
const groundMat = new THREE.MeshStandardMaterial({color: 0xFA10FF, side: THREE.DoubleSide}); 
const groundMes = new THREE.Mesh(groundGeo, groundMat);
groundMes.rotation.x = -0.5 * Math.PI;
scenes.add(groundMes);


// Windows
const windowsGeo = new THREE.PlaneGeometry(10, 10, 10, 10);
const windowsMat = new THREE.MeshBasicMaterial({wireframe: true, color: 0xFFFFFF});
const windowsMes = new THREE.Mesh(windowsGeo, windowsMat);
windowsMes.position.set(10, 10, 10);
let last = windowsMes.geometry.attributes.position.array.length - 1; 
windowsMes.geometry.attributes.position.array[last] -= 10 * Math.random(); 
scenes.add(windowsMes)

// Cube 
const cubeGeo = new THREE.SphereGeometry(5, 40, 40); 
const cubeMat = new THREE.MeshStandardMaterial({color: 0x00FF00, wireframe: true}); 
const cubeMes = new THREE.Mesh(cubeGeo, cubeMat);
cubeMes.position.set(10, 10, 0);
scenes.add(cubeMes);

// Model
const loading = new THREE.LoadingManager(); 
const progress = document.querySelector('progress'); 
loading.onStart = (url, loaded, total) => {};
loading.onError = (url, loaded, total) => {};
loading.onProgress = (url, loaded, total) => {
    progress.value = (loaded/total) * 100; 
};
loading.onLoad = (url, loaded, total) => {
    progress.style.display = 'none';
}
const modelurl = new URL('./models/Cow.gltf', import.meta.url); 
const modeload = new GLTFLoader(loading); // GLTFLoader()

let mixer; 
const clock = new THREE.Clock(); 

modeload.load(modelurl.href, item => {
    item.scene.position.set(10, 10, 10); 
    item.scene.scale.set(3,3,3); 
    scenes.add(item.scene);
    console.log(item.animations);

    mixer = new THREE.AnimationMixer(item.scene); 
    const animes1 = THREE.AnimationClip.findByName(item.animations, 'Idle_2'); 
    const action1 = mixer.clipAction(animes1); 
    action1.play(); 
    action1.loop = THREE.LoopOnce;
    
    const animes2 = THREE.AnimationClip.findByName(item.animations, 'Eating'); 
    const action2 = mixer.clipAction(animes2); 
    action2.play(); 
    action2.loop = THREE.LoopOnce;
    
    mixer.addEventListener('finished', e => {
        if(e.action._clip.name == 'Eating') {
            action1.reset(); 
            action1.play(); 
        } else if(e.action._clip.name == 'Idle_2') {
            action2.reset();
            action2.play();
        }
    })

    // Load all animation
    item.animations.forEach(item => {
        const actions = mixer.clipAction(item); 
        actions.play(); 
    })

    // Get Object
    item.scene.traverse(obj => {
        if(obj.isMesh) obj.material.color.setHex(0xFF00FF)
    })

    // Set color 
    item.scene.getObjectByName('Cube_1').material.color.setHex(0xFF0000);
    gui.addColor(options, 'hewan').onChange(function(e) {
        item.scene.getObjectByName('Cube_1').material.color.setHex(e);
    })

    window.addEventListener('mousedown', function(e) {
        console.log("Event didalam animation")
    })


})

// Helper
const orbit = new OrbitControls(camera, renderer.domElement); 
const grid = new THREE.GridHelper(30);
const axes = new THREE.AxesHelper(30);

scenes.add(grid);
scenes.add(axes);
orbit.update(); 

// Light
const ambienLight  = new THREE.AmbientLight(0xFFFFFF, 0.3); 
const directlight  = new THREE.DirectionalLight(0xFFFFFF, 0.5); 
const cameraHelper = new THREE.CameraHelper(directlight.shadow.camera);
const directLightHelper = new THREE.DirectionalLightHelper(directlight);
directlight.position.set(30,30,30);

const spotLight       = new THREE.SpotLight(0xFF0000, 0.5); 
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
spotLight.angle = 0.5;
scenes.add(spotLight)
scenes.add(spotLightHelper)
scenes.add(cameraHelper)
scenes.add(ambienLight);
scenes.add(directlight);
scenes.add(directLightHelper);

scenes.fog = new THREE.FogExp2(0xFFFFFF, 0.01);
spotLight.castShadow = true; 
cubeMes.castShadow = true; 
groundMes.receiveShadow = true; 

// Texture
const cubeTexture = new THREE.CubeTextureLoader(); 
scenes.background = cubeTexture.load([
    nebula,
    nebula,
    stars,
    stars,
    stars,
    stars,
]);


const loadTexture = new THREE.TextureLoader(); 
const multi = [
    new THREE.MeshBasicMaterial({map: loadTexture.load(nebula)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(nebula)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}),
    new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}),
]
const boxTextGeo = new THREE.BoxGeometry(5,5,5); 
const boxTextMat = new THREE.MeshBasicMaterial({map: loadTexture.load(stars)}); 
const boxTextMes = new THREE.Mesh(boxTextGeo, multi);
boxTextMes.position.set(10,10,-10);
boxTextMes.material.map = loadTexture.load(nebula);
boxTextMes.name = 'bimo';
scenes.add(boxTextMes)

// Gui
const gui = new dat.GUI(); 
const options = {
    angle: 0, 
    penumbra: 0, 
    warna: 0xFFFFFF, 
    hewan: 0xFFFFFF,
}
gui.addColor(options, 'warna').onChange(function(e) {
    groundMes.material.color.set(e);
})
gui.add(options, 'penumbra', 0, 1.5);
gui.add(options, 'angle', 0, 1.5);



// Pointing
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster(); 

window.addEventListener('mousemove', function(e) {
    mousePosition.x =  (e.clientX / widths) * 2 - 1;
    mousePosition.y = -(e.clientY / height) * 2 + 1;
})

const pointing = () => {
    raycaster.setFromCamera(mousePosition, camera);
    let intersects = raycaster.intersectObjects(scenes.children); 
    for(let i=0; i<intersects.length; i++) {
        let active = intersects[i].object; 
        if(active.id == cubeMes.id) active.material.color.set(0xFFFFFF); 
        if(active.name == 'bimo') active.rotation.x += 0.1;
    }
}


// RGBE LOADER 3D
const hdrurl   = new URL('./img/kantor.hdr', import.meta.url); 
const rgbeload = new RGBELoader(); 
rgbeload.load(hdrurl, item => {
    item.mapping = THREE.EquirectangularReflectionMapping;
    scenes.background = item; 
    scenes.environment = item; 
    scenes.add(new THREE.Mesh(new THREE.SphereGeometry(1, 50, 50), new THREE.MeshPhysicalMaterial({roughness: 0, metalness: 0, color: 0xFF0FF, transmission: 1, ior: 2}))); 
})


function animate() {
    if(mixer) mixer.update(clock.getDelta())
    pointing(); 
    spotLight.penumbra = options.penumbra; 
    spotLight.angle = options.angle;
    spotLightHelper.update(); 
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = aspect;
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height);
})