import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import nebula from './img/nebula.jpg'; 
import stars from './img/stars.jpg'; 

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.lookAt(0, 0, 0); 
camera.position.set(3,5,15);



// RGBE 
// const rgbeLoader = new RGBELoader(); 
// const kantorurls = new URL('./img/kantor.hdr', import.meta.url); 
// rgbeLoader.load(kantorurls.href, item => {
//     item.mapping = THREE.EquirectangularReflectionMapping; 
//     scenes.background = item; 
//     scenes.environment = item; 
// })

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x000000); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.dampingFactor = 0.12; 
orbit.enableDamping = true; 
orbit.enableZoom = true; 

const lights = [
    new THREE.AmbientLight(0xFFFFFF, 1), 
    new THREE.DirectionalLight(0xFFFFFF, 1), 
    new THREE.SpotLight(0xFFFFFF, 1), 
    new THREE.HemisphereLight(0xFFFFFF, 0x333333, 1), 
    new THREE.PointLight(0xFFFFFF, 1), 
    new THREE.RectAreaLight(0xFFFFFF, 1)
]
lights.forEach(item => scenes.add(item))

// Helper 
const helper = [
    new THREE.GridHelper(30),
    new THREE.AxesHelper(30), 
    new THREE.CameraHelper(lights[1].shadow.camera), 
    new THREE.DirectionalLightHelper(lights[1]), 
    new THREE.SpotLightHelper(lights[2]), 
    new THREE.HemisphereLightHelper(lights[3]), 
    new THREE.PointLightHelper(lights[4]),
]
helper.forEach(item => scenes.add(item))


const textureLoad = new THREE.TextureLoader(); 
const nebulaTexts = textureLoad.load('./img/nebula.jpg'); 

const geometry = [
    new THREE.BoxGeometry(1,1,1), 
    new THREE.PlaneGeometry(1,1), 
    new THREE.SphereGeometry(0.6,32,32), 
    new THREE.ConeGeometry(0.6,1,32), 
    new THREE.CylinderGeometry(0.6,0.6,1,32), 
    new THREE.TorusGeometry(0.6,0.2,16, 100), 
    new THREE.TorusKnotGeometry(0.6,0.2,100,16), 
    new THREE.TetrahedronGeometry(0.6), 
    new THREE.DodecahedronGeometry(0.6)
]; 
const material = [
    new THREE.MeshNormalMaterial(), 
    new THREE.MeshMatcapMaterial({matcap: nebulaTexts}),
    new THREE.MeshBasicMaterial({color: 0xFFFFFF, map: nebulaTexts}), 
    new THREE.MeshToonMaterial({color: 0xFFFFFF, map: nebulaTexts}), 
    new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: nebulaTexts}), 
    new THREE.MeshPhongMaterial({color: 0xFFFFFFF, map: nebulaTexts, shininess: 3}),
    new THREE.MeshStandardMaterial({color: 0xFFFFFF, map: nebulaTexts, roughness: 0.3}), 
    new THREE.MeshPhysicalMaterial({color: 0xFFFFFF, map: nebulaTexts, ior: 1.5, transmission: 0.3, roughness: 0.3})
]
const meshes = []; 
for(let i=0; i<geometry.length; i++) {
    for(let j=0; j<material.length; j++) {
        const mesh = new THREE.Mesh(geometry[i], material[j]); 
        mesh.position.z = (i-geometry.length / 2) * 2.2; 
        mesh.position.x = (j-material.length / 2) * 2.2; 
        mesh.position.y = 0.5; 
        mesh.name = `Box_${i}${j}`; 
        scenes.add(mesh)
        meshes.push(mesh); 
        scenes.add(new THREE.BoxHelper(mesh, 0xFFFFFF));
    }
}
const point = [
    new THREE.Vector3(1,2,3), 
    new THREE.Vector3(4,5,6), 
    new THREE.Vector3(7,8,9), 
]
const line = new THREE.BufferGeometry().setFromPoints(point); 
const mats = new THREE.LineBasicMaterial({color: 0xFFFFFF}); 
const mesh = new THREE.Line(line, mats); 
scenes.add(mesh)

const cubeTextureLoad = new THREE.CubeTextureLoader();
const multiTextureLoa = [
    new THREE.MeshBasicMaterial({map: textureLoad.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoad.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoad.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoad.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoad.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoad.load(stars)}),
] 
scenes.background = cubeTextureLoad.load([
    nebula, 
    nebula,
    stars,
    stars,
    stars,
    stars,
]); 

meshes[0].position.y = 3; 
meshes[3].position.y = 3; 
meshes[0].material = multiTextureLoa; 
meshes[0].material.map = nebulaTexts; 
meshes[3].material.color.set(0xFF0000); 
meshes[3].material.emissive.set(0xFF0000); 
meshes[3].material.opacity = 0.5; 
meshes[3].material.transparent = true;  
meshes[3].material.wireframe = true;   
meshes[3].material.side = THREE.DoubleSide; 

meshes[3].visible = true; 
meshes[3].receiveShadow = true; 
meshes[3].castShadow = true; 
meshes[3].scale.set(2,2,2); 
meshes[3].translateY(0.2); 
meshes[3].rotateY(0.2); 
meshes[3].layers.enable(0); 
meshes[3].layers.enable(1); 
meshes[3].name = 'bimo'; 
meshes[3].userData = {info: 123}

const group = new THREE.Group(); 
group.add(meshes[0]);
group.add(meshes[3]);
scenes.add(group)
group.name = 'bimo'; 
group.visible = true; 
group.receiveShadow = true; 
group.castShadow = true; 
group.translateY(0.2); 
group.rotateX(0.2); 
// group.scale.set(2,2,2); 
group.position.set(1,1,1); 
group.userData = {info: 123}; 
group.traverse(i => {
    if(i.isMesh) {
        console.log(i.name || i.type)
        // i.material.dispose();
        // i.geometry.dispose();
    }
})
group.remove(meshes[0]);
group.remove(group.getObjectByName('bimo'));
group.clear(); 
console.log(group.children.length)

const video = document.getElementById('video'); 
video.src = 'bardoc.webm'; 
video.loop = true; 
meshes[4].name = 'bardock'; 
meshes[4].material.map = 

const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})