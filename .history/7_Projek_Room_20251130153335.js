import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 


  

const renderer = new THREE.WebGLRenderer({antialias: true}); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0x333333); 
document.body.appendChild(renderer.domElement); 

scenes.add(new THREE.AmbientLight(0xFFFFFF, 1)); 
scenes.add(new THREE.GridHelper(30,30)); 



const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 

camera.position.set(-0.3386, 0.6920, 0.6777);
camera.rotation.set(-0.1659, -0.4032, -0.0656);
orbit.target.set(0.0123, 0.5561, -0.1336);
camera.lookAt(orbit.target);


window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
  
      const p = camera.position;
      const r = camera.rotation;
      const t = orbit.target;
  
      const code =
    `camera.position.set(${p.x.toFixed(4)}, ${p.y.toFixed(4)}, ${p.z.toFixed(4)});
    camera.rotation.set(${r.x.toFixed(4)}, ${r.y.toFixed(4)}, ${r.z.toFixed(4)});
    orbit.target.set(${t.x.toFixed(4)}, ${t.y.toFixed(4)}, ${t.z.toFixed(4)});
    camera.lookAt(orbit.target);`;
  
      // Cek apakah clipboard tersedia
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
          .then(() => console.log("📋 Copied to clipboard:\n", code))
          .catch(err => console.warn("Clipboard error:", err));
      } else {
        console.log("📋 Clipboard API tidak tersedia. Berikut kodenya:\n", code);
      }
    }
  });
  


const modeload = new GLTFLoader(); 
modeload.load('./andy_room.gltf', item => {
    scenes.add(item.scene);
    item.scene.add(new THREE.DirectionalLight(0xFFFFFF, 1)); 
})

const animate = () => {
    renderer.render(scenes, camera)
    requestAnimationFrame(animate)
}
animate(); 

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})