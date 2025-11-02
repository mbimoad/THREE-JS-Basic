import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scenes = new THREE.Scene(); 
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(5, 10, 10); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setClearColor(0xDDDDDD); 
renderer.setSize(widths, height); 
document.body.appendChild(renderer.domElement); 

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1); 
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update(); 
scenes.add(ambientLight)

const modelurl = new URL('./warehouserack2/scene.gltf', import.meta.url); 
const modeload = new GLTFLoader(); 
modeload.load(modelurl.href, item => {
    scenes.add(item.scene);
    item.scene.position.x = 2; 
    item.scene.traverse(i => {
        if(i.name == 'Sides_1') {
            i.position.set(0, 0, 3); 
            i.scale.set(2,2,2)
        }

        if(i.name.includes('Shelf_Supports')) {
            i.scale.z = 5; 
            i.scale.x = 1.5; 
            i.position.z = 3.5; 
        }
    })
})

const levelList = []; 
modeload.load(modelurl.href, item => {

    scenes.add(item.scene);
    let totalHeight = 0; 
    item.scene.scale.set(2,1,2);

    item.scene.traverse(i => {
        if(i.name == 'Sides_1') {
            i.scale.y = 2; 
            i.updateMatrixWorld(true); 

            const object = new THREE.Box3().setFromObject(i); 
            const size   = new THREE.Vector3(); 
            object.getSize(size); 
            totalHeight = size.y; 
        }

        if(i.name.includes('Shelf_Supports')) {
            levelList.push(i); 
        }
    })

    console.log(totalHeight)
    const lastlevel = levelList[levelList.length - 1]; 
    const clonelvls = lastlevel.clone(); 
    item.scene.add(clonelvls); 
    levelList.push(clonelvls); 

    const levels = levelList.length; 
    const spacin = totalHeight / (levels - 1); 
    for(let i=0; i<levelList.length; i++) {
        const lv = levelList[i]; 
        lv.position.y = spacin * i;
    }
    // Add Box Normal
    addBox(levelList[1])
    // Add Model Box
    addBoxModel(levelList[2])
    // Add full box
    levelList.forEach(item => addFullBox(item, 1))
})

const addBox = l => {
    const object = new THREE.Box3().setFromObject(l); 
    const size = new THREE.Vector3(); 
    object.getSize(size); 

    const levellength = size.x; 
    const boxwidth = 0.5; 
    const gap = 0.1; 
    const totalwidth = boxwidth + gap; 

    const boxcount = Math.floor(levellength / totalwidth); 
    const startx = l.position.x - (levellength / 2) + (boxwidth / 2); 

    for(let i=0; i<boxcount; i++) {
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(boxwidth, boxwidth, boxwidth), 
            new THREE.MeshBasicMaterial({color: Math.floor(Math.random() * 0xffffff)})
        )
        box.position.set(
            startx + i * totalwidth, 
            l.position.y + 0.4, 
            l.position.z - 0.3
        )
        scenes.add(box); 
    }
}

const addBoxModel = l => {
    const modelurl = new URL('./crate_box/scene.gltf', import.meta.url); 
    modeload.load(modelurl.href, item => {
        let size = 0.009; 
        item.scene.scale.set(size,size,size);
        item.scene.position.set(
            l.position.x,
            l.position.y + 0.4, 
            l.position.z - 0.3
        )
        scenes.add(item.scene); 
    })
}

const addFullBox = (l, stack = 2) => {
    const object = new THREE.Box3().setFromObject(l); 
    const size = new THREE.Vector3(); 
    object.getSize(size); 

    const boxwidth = 0.5; 
    const gap = 0.1; 
    const totalwidth = boxwidth + gap; 
    
    const rows = 3; 
    const cols = 4; 
    const start_X = l.position.x - (totalwidth * (cols - 1) / 2);
    const start_Z = l.position.z - (totalwidth * (rows - 1) / 2);
    const baseY = l.position.y + 0.25; 

    for(let i=0; i<stack; i++) {
        for(let j=0; j<rows; j++) {
            for(let k=0; k<cols; k++) {
                const boxs = new THREE.Mesh(
                    new THREE.BoxGeometry(boxwidth, boxwidth, boxwidth), 
                    new THREE.MeshBasicMaterial({color: Math.floor(Math.random() * 0xFFFFFF)})
                )
                boxs.position.set(
                    start_X + k - 0.5 * totalwidth, 
                    baseY + i + totalwidth, 
                    start_Z - 0.5 + j * totalwidth
                )
                scenes.add(boxs)
            }
        }
    }
}

const animate = () => {
    renderer.render(scenes, camera)
}

renderer.setAnimationLoop(animate); 
window.addEventListener('resize', function(e) {
    camera.aspect = aspect; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(widths, height); 
})