import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5,10,15); 
camera.lookAt(0,0,0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setClearColor(0x333333)
document.body.appendChild(renderer.domElement); 

const orbit = new OrbitControls(camera, renderer.domElement); 
orbit.update();

scenes.add(new THREE.GridHelper(30, 30)); 
scenes.add(new THREE.AmbientLight(0xFFFFFF, 1));

const getObjectSize = obj => {
    const boxs = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    const cntr = boxs.getCenter(new THREE.Vector3())
    cntr.y += 0.1; 
    boxs.getSize(size);
    return {
        cntr,
        x: size.x, 
        y: size.y
    };
};
const wadah = []; 
const modeload = new GLTFLoader(); 
modeload.load('./rack1/scene.gltf', item => {
    scenes.add(item.scene)
    let tinggi = 0; 
    item.scene.traverse(i => {
        if(i.name.includes("Shelf_Supports")) wadah.push(i); 
        if(i.name == "Sides_1") {
            i.scale.y = 2;
            i.updateMatrixWorld(true); 
            tinggi = getObjectSize(i).y;
            console.log(tinggi)
        }
    })
    // Tambah 5 Level
    let hope = 6; 
    let rest = hope - wadah.length; // 6-3 
    for(let i=0; i<rest; i++) {
        let wadahbaru = wadah[0].clone(); 
        item.scene.add(wadahbaru)
        wadah.push(wadahbaru);
    }
    
    let long = wadah.length - 1 ;
    let marginBawah  = 0.4;
    let marginAtas   = 0.4;
    let usableHeight = tinggi - marginAtas - marginBawah;
    let gaps = usableHeight / long;
    for (let i=0; i<=long; i++) wadah[i].position.y = marginBawah + gaps * i;

    // Add hover 
    

})

const animate = () => {
    renderer.render(scenes, camera); 
}
renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})