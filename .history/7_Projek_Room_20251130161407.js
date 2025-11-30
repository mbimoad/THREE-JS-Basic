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

scenes.add(new THREE.GridHelper(30,30)); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update(); 

camera.position.set(-0.1910, 0.6239, -0.7202);
camera.rotation.set(-3.0264, -0.3315, -3.1040);
orbit.target.set(0.0123, 0.5561, -0.1336);
camera.lookAt(orbit.target);

// Easily to get perspective camera
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
        copyPerspectiveCamera(camera)
    }
});


const copyPerspectiveCamera = (camera) => {
    const n = navigator; 
    const p = camera.position;
    const r = camera.rotation;
    const t = orbit.target;
    const code =
    `camera.position.set(${p.x.toFixed(4)}, ${p.y.toFixed(4)}, ${p.z.toFixed(4)});
camera.rotation.set(${r.x.toFixed(4)}, ${r.y.toFixed(4)}, ${r.z.toFixed(4)});
orbit.target.set(${t.x.toFixed(4)}, ${t.y.toFixed(4)}, ${t.z.toFixed(4)});
camera.lookAt(orbit.target);`;
    if (n.clipboard && n.clipboard.writeText) {
        n.clipboard.writeText(code).then(() => alert("Camera Copy", code))
    } else {
        alert.log("API tidak tersedia. Kode :\n", code);
    }
}
  

const spotligh = new THREE.SpotLight(0xFFFFFF, .5);
const hemiligh = new THREE.HemisphereLight(0xFFFFFF, .5);
const modeload = new GLTFLoader(); 
modeload.load('./andy_room.gltf', item => {
    scenes.add(item.scene);
    item.scene.add(spotligh);
    item.scene.add(hemiligh);
    spotligh.position.set(0, 2, 0) 

    item.scene.traverse(i => {
        if(i.name == "Desk") {
            const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshNormalMaterial()); 
            box.position.x = 10;
            i.add(box)
            console.log(i)
            box.scale.set(1 / i.scale.x, 1 / i.scale.y, 1 / i.scale.z);
            
        }
    })
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