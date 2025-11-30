import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
//   camera.position.set(-0.3877, 0.8284, 0.7099);
camera.rotation.set(-0.2522, -0.3334, -0.0841);
  
window.addEventListener('keydown', (e) => {
    if (e.key === 'p') {
      const p = camera.position;
      const r = camera.rotation;
      const t = controls.target; // lookAt target
  
      const code = `
  camera.position.set(${p.x.toFixed(4)}, ${p.y.toFixed(4)}, ${p.z.toFixed(4)});
  camera.rotation.set(${r.x.toFixed(4)}, ${r.y.toFixed(4)}, ${r.z.toFixed(4)});
  controls.target.set(${t.x.toFixed(4)}, ${t.y.toFixed(4)}, ${t.z.toFixed(4)});
  camera.lookAt(controls.target);
  `;
  
      navigator.clipboard.writeText(code);
      console.log("Camera + target copied:\n", code);
    }
  });
  
  
  
camera.lookAt(0,0,0); 
const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 

scenes.add(new THREE.AmbientLight(0xFFFFFF, 1)); 
scenes.add(new THREE.GridHelper(30,30)); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 


const modeload = new GLTFLoader(); 
modeload.load('./andy_room.gltf', item => {
    scenes.add(item.scene);
    item.scene.add(new THREE.DirectionalLight(0xFFFFFF, 1)); 
})

const animate = () => {
    console.log(camera.position)
    renderer.render(scenes, camera)
    requestAnimationFrame(animate)
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})