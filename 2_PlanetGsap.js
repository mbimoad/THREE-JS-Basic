// Import
import * as THREE from 'three'; 
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import stars from '../solarsystem/stars.jpg';
import sun from '../solarsystem/sun.jpg';
import earth from '../solarsystem/earth.jpg';
import saturn from '../solarsystem/saturn.jpg';
import saturnring from '../solarsystem/saturn ring.png';

// Header
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height;
const scenes = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(20, aspect, .1, 1000);
camera.position.set(-90, 140, 140);
camera.lookAt(0,0,0);

// Canvas
const renderer = new THREE.WebGLRenderer(); 
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement);

// Helper
const grids = new THREE.GridHelper(30);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
scenes.add(grids);

// Texture
const cubeText = new THREE.CubeTextureLoader();
const loadText = new THREE.TextureLoader(); 
scenes.background = cubeText.load([stars,stars,stars,stars,stars,stars]);

const planet = (size, position, texture, ring) => {
    const planeGeo = new THREE.SphereGeometry(size, 40, 40);
    const planeMat = new THREE.MeshBasicMaterial({map: loadText.load(texture)});
    const planeMes = new THREE.Mesh(planeGeo, planeMat);
    const plane3DS = new THREE.Object3D(); 

    if(ring.texture) {
        const ringGeo = new THREE.RingGeometry(ring.inrad, ring.ourad, 20); 
        const ringMat = new THREE.MeshBasicMaterial({
            map: ring.texture, 
            side: THREE.DoubleSide,
        });
        const ringMes = new THREE.Mesh(ringGeo, ringMat);
        ringMes.position.x = position;
        ringMes.rotation.x = -0.5 * Math.PI;
        plane3DS.add(ringMes);
    }

    plane3DS.add(planeMes);
    scenes.add(plane3DS);
    planeMes.position.x = position;

    return {
        planeMes,
        plane3DS,
    }
}

const vsuns   = planet(10, 0, sun, false);
const vearth  = planet(3, 20, earth, false);
const vsaturn = planet(6, 50, saturn, {
    inrad: 5, 
    ourad: 15, 
    texture: loadText.load(saturnring)
});

// Click event 
let position = true; 
const TIMELINE = gsap.timeline(); 
const lookAtCenter = () => camera.lookAt(0, 0, 0);
const positions = [
    { z: 14 },
    { y: 10 },
    { x: 10, y: 100, z: 100 }
];
function moveCamera(x, y, z, d) {
    gsap.to(camera.position, {x,y,z, duration: d});
}
window.addEventListener('mousedown', function(e) {
    if (e.button === 0) {
        positions.forEach(pos => {
            TIMELINE.to(camera.position, {
                ...pos,
                duration: 1.5,
                onUpdate: lookAtCenter
            });
        });
    } else if (e.button === 2) {
        if(position) moveCamera(30, 20, -50, 3);
        else moveCamera(0.5, 0.8, 10, 3);
        position = !position; 
    }
})

function animate() {
    vsaturn.plane3DS.rotateY(0.001);
    vsaturn.plane3DS.rotateY(0.001);
    renderer.render(scenes, camera);
}
renderer.setAnimationLoop(animate);
window.addEventListener('resize', function() {
    camera.aspect = aspect;
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height);
})