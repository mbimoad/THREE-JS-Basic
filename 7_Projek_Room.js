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

function addFlexBoxesToDesk(deskObj, margin, items) {
  // Bounding Detail
  const bounding = new THREE.Box3().setFromObject(deskObj);
  const ml = margin;
  const mr = margin;
  const xmin = bounding.min.x;
  const ymin = bounding.min.y;
  const zmin = bounding.min.z;
  const xmax = bounding.max.x;
  const ymax = bounding.max.y;
  const zmax = bounding.max.z;
  const widths = xmax - xmin;
  const middle = (zmax + zmin) / 2;
  const usable = widths - ml - mr;

  // Start
  for (let i = 0; i < items; i++) {
    let x = (xmin + ml) + (usable / (items - 1)) * i;
    let y = ymax;
    let z = middle;
    const worldPos = new THREE.Vector3(x,y,z);
    // convert world → local
    const localPos = worldPos.clone();
    deskObj.worldToLocal(localPos);
    const box = boxesmes(20, 20, 20);
    box.position.copy(localPos);
    deskObj.add(box);
  }
}

function getObjRealPos(obj, type, marginLeft = 0, marginRight = 0) {
    let worldpos = undefined;
    let bounding = new THREE.Box3().setFromObject(obj);

    if(type == "top") {
        worldpos = new THREE.Vector3(
            (bounding.min.x + bounding.max.x) / 2,
            bounding.max.y,
            (bounding.min.z + bounding.max.z) / 2
        );
    } else if(type == "center") {
        worldpos = new THREE.Vector3();
        bounding.getCenter(worldpos);
    } else if(type == "bottom") {
        worldpos = new THREE.Vector3(
            (bounding.min.x + bounding.max.x) / 2,
            bounding.min.y,
            (bounding.min.z + bounding.max.z) / 2
        );
    } else if(type == "left") {
        worldpos = new THREE.Vector3(
            bounding.min.x + marginLeft,
            (bounding.min.y + bounding.max.y) / 2,
            (bounding.min.z + bounding.max.z) / 2
        );
    } else if(type == "right") {
        worldpos = new THREE.Vector3(
            bounding.max.x - marginRight,
            (bounding.min.y + bounding.max.y) / 2,
            (bounding.min.z + bounding.max.z) / 2
        );
    } else if(type == "front") {
        worldpos = new THREE.Vector3(
            (bounding.min.x + bounding.max.x) / 2,
            (bounding.min.y + bounding.max.y) / 2,
            bounding.max.z
        );
    } else if(type == "back") {
        worldpos = new THREE.Vector3(
            (bounding.min.x + bounding.max.x) / 2,
            (bounding.min.y + bounding.max.y) / 2,
            bounding.min.z
        );
    } else if(type == "top-front") {
        worldpos = new THREE.Vector3(
            (bounding.min.x + bounding.max.x) / 2,
            bounding.max.y,
            bounding.max.z
        );
    } else if(type == "top-back") {
        worldpos = new THREE.Vector3(
            (bounding.min.x + bounding.max.x) / 2,
            bounding.max.y,
            bounding.min.z
        );
    } else if(type == "top-left") {
        worldpos = new THREE.Vector3(
            bounding.min.x + marginLeft,
            bounding.max.y,
            (bounding.min.z + bounding.max.z) / 2
        );
    } else if(type == "top-right") {
        worldpos = new THREE.Vector3(
            bounding.max.x - marginRight,
            bounding.max.y,
            (bounding.min.z + bounding.max.z) / 2
        );
    } else if(type == "bottom-left") {
        worldpos = new THREE.Vector3(
            bounding.min.x + marginLeft,
            bounding.min.y,
            (bounding.min.z + bounding.max.z) / 2
        );
    } else if(type == "bottom-right") {
        worldpos = new THREE.Vector3(
            bounding.max.x - marginRight,
            bounding.min.y,
            (bounding.min.z + bounding.max.z) / 2
        );
    } else if(type.startsWith("corner-")) {
        const index = Number(type.split("-")[1]);
        const xs = [bounding.min.x, bounding.max.x];
        const ys = [bounding.min.y, bounding.max.y];
        const zs = [bounding.min.z, bounding.max.z];
        const cx = xs[(index & 1) ? 1 : 0];
        const cy = ys[(index & 2) ? 1 : 0];
        const cz = zs[(index & 4) ? 1 : 0];
        worldpos = new THREE.Vector3(cx, cy, cz);
    }

    obj.worldToLocal(worldpos);
    return worldpos;
}
  
const boxesmes = (w1,w2,w3) => new THREE.Mesh(new THREE.BoxGeometry(w1,w2,w3), new THREE.MeshNormalMaterial());
const spotligh = new THREE.SpotLight(0xFFFFFF, .5);
const hemiligh = new THREE.HemisphereLight(0xFFFFFF, .5);
const modeload = new GLTFLoader(); 
modeload.load('./andy_room.gltf', item => {
    scenes.add(item.scene);
    item.scene.add(spotligh);
    item.scene.add(hemiligh);
    spotligh.position.set(0, 2, 0) 

    item.scene.traverse(i => {
        if (i.name === "Desk") {
            // addFlexBoxesToDesk(i,10,4);
            let box = boxesmes(20,20,20);
            box.position.copy(getObjRealPos(i, "top-left", 1));
            i.add(box)
        }
    });
  
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