import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.lookAt(0, 0, 0); 
camera.position.set(30,30,30);



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
    new THREE.Toru
]

const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})