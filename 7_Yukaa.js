import * as THREE from 'three'; 
import * as YUKA from 'yuka'; 

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000); 
camera.position.set(0, 5, 10); 
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 

const visualBox = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1), 
    new THREE.MeshNormalMaterial(), 
); 

// YUKA (Artifial inteligence)
const entityManager = new YUKA.EntityManager(); 
const time = new YUKA.Time(); 

const yukaBox = new YUKA.Vehicle(); 
yukaBox.position.set(0, 0, 0); 
yukaBox.maxSpeed = 2; 

// Atur target dan behaviour
const target = new YUKA.Vector3(5,0,0); 
const behaviour = new YUKA.SeekBehavior(target); 
yukaBox.steering.add(behaviour); 

// Sinkronasi yuka ke three JS 
yukaBox.setRenderComponent(visualBox, (e, r) => {
    r.position.copy(e.position)
})

// Tambahkan ke manager 
entityManager.add(yukaBox); 
scenes.add(visualBox);

function animate() {
    // Animasikan yuka 
    const delta = time.update().getDelta(); 
    entityManager.update(delta);
    renderer.render(scenes, camera); 
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})