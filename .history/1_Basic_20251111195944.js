import * as THREE from 'three'; 
import * as DAT from 'dat.gui'; 
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gsap from 'gsap';

// Img
import i_stars from './img/stars.jpg'; 
import i_nebula from './img/nebula.jpg'; 
import earth from './solarsystem/earth.jpg'; 
import saturn from './solarsystem/saturn.jpg'; 
import saturnring from './solarsystem/saturnring.png'; 

// =====================================================================
const widths = window.innerWidth; 
const height = window.innerHeight; 
const aspect = widths/height; 
const scenes = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000); 
camera.position.set(0, 5, 15); 
camera.lookAt(0, 0, 0); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize(widths, height); 
renderer.setPixelRatio(window.devicePixelRatio); 
document.body.appendChild(renderer.domElement); 

 
const orbit  = new OrbitControls(camera, renderer.domElement); 
orbit.enableDamping = true; 
orbit.dampingFactor = 0.12; 
orbit.enableZoom = false; 

orbit.update(); 
// =====================================================================
// RGBE Loader 
const rgbeload = new RGBELoader(); 
const rgbeurls = new URL('./img/kantor.hdr', import.meta.url); 
rgbeload.load(rgbeurls.href, item => {
    item.mapping = THREE.EquirectangularReflectionMapping
    scenes.background = item; 
    scenes.environment = item; 
})
const lights = [
  new THREE.AmbientLight(0xFFFFFF, 0.5), 
  new THREE.DirectionalLight(0xFFFFFF, 0.5), 
  new THREE.SpotLight(0xFFFFFF, 0.5), 
  new THREE.PointLight(0xFFFFFF, 0.5), 
  new THREE.HemisphereLight(0xFFFFFF, 0x000000, 0.5)
]; 
const helper = [
  new THREE.AxesHelper(5), 
  new THREE.GridHelper(20, 20), 
  new THREE.DirectionalLightHelper(lights[1]), 
  new THREE.SpotLightHelper(lights[2]), 
  new THREE.PointLightHelper(lights[3]), 
  new THREE.HemisphereLightHelper(lights[4])
]
lights.forEach(item => scenes.add(item));
helper.forEach(item => scenes.add(item));

const geometrie  = [
  new THREE.BoxGeometry(1,1,1), 
  new THREE.PlaneGeometry(1,1),
  new THREE.SphereGeometry(0.6,32,32), 
  new THREE.ConeGeometry(0.6,1,32), 
  new THREE.CylinderGeometry(0.6, 0.6, 1, 32), 
  new THREE.TorusGeometry(0.6, 0.2, 16, 100), 
  new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16), 
  new THREE.DodecahedronGeometry(0.6),
  new THREE.TetrahedronGeometry(0.6), 
]; 
const textureLoad = new THREE.TextureLoader();
const nebula      = textureLoad.load('./img/nebula.jpg');  
const materials = [
  new THREE.MeshNormalMaterial(), 
  new THREE.MeshMatcapMaterial({matcap: nebula}), 
  new THREE.MeshBasicMaterial({color: 0xFF00FF, map: nebula}), 
  new THREE.MeshToonMaterial({color: 0xFF00FF}), 
  new THREE.MeshLambertMaterial({color: 0xFF00FF}), 
  new THREE.MeshPhongMaterial({color: 0xFF00FF, map: nebula, shininess: 0.8}), 
  new THREE.MeshStandardMaterial({color: 0xFF00FF, map: nebula, shininess: 0.8, roughness: 0.3}), 
  new THREE.MeshPhysicalMaterial({color: 0xFF00FF, map: nebula, shininess: 0.8, roughness: 0.3, ior: 1.5, transmission: 0.3})
]

const meshes = []; 
for(let i=0; i<geometrie.length; i++) {
  for(let j=0; j<materials.length; j++) {
      const mesh = new THREE.Mesh(geometrie[i], materials[j]); 
      mesh.position.z = (i-geometrie.length/2)*2.2; 
      mesh.position.x = (j-materials.length/2)*2.2;
      mesh.position.y = 0.5; 
      mesh.name  = `Box_${i}${j}`; 
      meshes.push(mesh); 
      scenes.add(mesh);  
      scenes.add(new THREE.BoxHelper(mesh, 0x00FF00)); 
  }
}
// Line
const points = [
  new THREE.Vector3(1,2,3), 
  new THREE.Vector3(4,5,6),
]; 
const lineGeo = new THREE.BufferGeometry().setFromPoints(points); 
const lineMat = new THREE.LineBasicMaterial({color: 0xFFFFFF}); 
const lineMes = new THREE.Line(lineGeo, lineMat); 
scenes.add(lineMes); 

// Backgorund modification
const multi_cube  = [
  i_nebula,
  i_nebula,
  i_stars,
  i_stars,
  i_stars,
  i_stars,
]
scenes.background = new THREE.CubeTextureLoader().load(multi_cube); 
// Box modification
const multi_mater = [
  new THREE.MeshBasicMaterial({map: textureLoad.load(i_nebula)}), 
  new THREE.MeshBasicMaterial({map: textureLoad.load(i_nebula)}), 
  new THREE.MeshBasicMaterial({map: textureLoad.load(i_stars)}), 
  new THREE.MeshBasicMaterial({map: textureLoad.load(i_stars)}), 
  new THREE.MeshBasicMaterial({map: textureLoad.load(i_stars)}), 
  new THREE.MeshBasicMaterial({map: textureLoad.load(i_stars)}), 
]
meshes[0].position.y = 4;  
meshes[3].position.y = 3;

meshes[0].material = multi_mater; // Mengganti di THREE.Mesh(geo, disini); 
meshes[0].material.map = nebula;  // Mengganti di THREE.Material({map})
meshes[3].material.color.set(0xFFFFFF);
meshes[3].material.emissive.set(0xFFFFFF); 
meshes[3].material.opacity = 0.5;
meshes[3].material.transparent = true; 
meshes[3].material.wireframe = true; 
meshes[3].material.side = THREE.DoubleSide; 
meshes[3].scale.set(2,2,2); 
meshes[3].userData = {info: 123}; 
meshes[3].name = 'bimo';   
meshes[3].visible = true; 
meshes[3].castShadow = true; 
meshes[3].receiveShadow = true; 
meshes[3].rotateY(0.5); 
meshes[3].translateZ(2); 
meshes[3].layers.enable(0); // mengaktifkan layer didalam objek
meshes[3].layers.enable(1); // mengaktifkan layer didalam objek

// Group 
const myBox = new THREE.Group(); 
myBox.name  = "BoxGroup";
myBox.castShadow = true; 
myBox.receiveShadow = true; 
myBox.visible = true; 
meshes[13].name = "m13" 
myBox.add(meshes[13])
myBox.add(meshes[14])
myBox.add(meshes[15])
myBox.add(meshes[16])
myBox.position.set(0, 10, 0)
myBox.scale.set(1, 1, 1)
myBox.traverse(item => {
  console.log(item.name || item.type); 
  if(item.isMesh) {
    item.geometry.dispose(); 
    item.material.dispose(); 
  }
})
scenes.add(myBox); 
myBox.remove(meshes[16])
myBox.remove(myBox.getObjectByName('m13'))
console.log(myBox.children.length)
// myBox.clear(); 

// Video
const video = document.getElementById('video'); 
video.src  = "bardoc.webm"; 
video.loop = true;  
meshes[4].name = 'bardock'; 
meshes[4].material.map = new THREE.VideoTexture(video); 
// Audio
let soundListen = new THREE.AudioListener(); 
let sound1      = new THREE.Audio(soundListen); 
let sound2      = new THREE.PositionalAudio(soundListen);
let soundLoad1  = new THREE.AudioLoader().load('dragonball.ogg', item => {
    sound1.setBuffer(item) // sound1.play(); 
}); 
let soundLoad2  = new THREE.AudioLoader().load('dragonball.ogg', item => {
    sound2.setBuffer(item)
    sound2.setRefDistance(1); // sound2.play(); 
}); 
meshes[4].add(sound2); 
window.addEventListener('keydown', e => {
  if(e.key == "q") {
    if(sound1.isPlaying) {
      sound1.pause(); 
      sound2.pause(); 
    } else {
      sound1.play(); 
      sound2.play(); 
    }
  }
})

// Gui
const option = {angle: 0, kotak: 0xFFFFFF, sapi: 0xFFFFFF}; 
const gui    = new DAT.GUI();
gui.add(option, 'angle', 0, 1); 
gui.addColor(option, 'kotak').onChange(function(e) {
    meshes[4].material.color.set(e);
})

// Model 
const loading = new THREE.LoadingManager(); 
const progres = document.querySelector('progress');
loading.onProgress = (u,l,t) => progres.value = (l/t) * 100; 
loading.onLoad     = (u,l,t) => progres.style.display = 'none';
let mixer; 
const clock    = new THREE.Clock(); 
const modelurl = new URL('./models/Cow.gltf', import.meta.url); 
const modeload = new GLTFLoader(loading);
modeload.load(modelurl.href, item => {
  scenes.add(item.scene); 
  mixer = new THREE.AnimationMixer(item.scene);
  const idleClip = THREE.AnimationClip.findByName(item.animations, 'Idle_2'); 
  const idleActi = mixer.clipAction(idleClip); 
  idleActi.play(); 
  idleActi.loop = THREE.LoopOnce;  
  mixer.addEventListener('finished', function(e) {
    if(e.action._clip.name == "Idle_2") {
      idleActi.reset(); 
      idleActi.play(); 
    }
  })
  item.animations.forEach(i => {
      const action = mixer.clipAction(i); 
      action.play(); 
      action.loop = THREE.LoopOnce; 
  })
  // Layer Modification 
  let cube1 = item.scene.getObjectByName('Cube_1'); 
  cube1.material.color.setHex(0xFF00FF); 

  item.scene.traverse(i => {
    if(i.isMesh) {
       console.log(i.material.color, i.name)
       // Menghilangkan layer 
       if(i.name == "Cube_3" || i.name == "Cube_6") i.visible = false; 
       // Menambahkan Box
       if(i.name == "Cube") {
          const box = meshes[5].clone(); 
          box.position.set(0,0,0) // reset position
          box.position.y = 5; 
          item.scene.add(box)
       }
    }
  })
  // Menghilangkan 
  gui.addColor(option, 'sapi').onChange(e => {
      cube1.material.color.setHex(e);
  })

  // double
  const clone = SkeletonUtils.clone(item.scene);
  clone.position.y = 6;
  scenes.add(clone);
})
// Blinking
let blinkis = false; 
let blinkin = null; 
const startBlink = obj => {
  blinkis = true; 
  blinkin = setInterval(() => obj.material.color.set(Math.random() * 0xFFFFFF), 2000); 
}
const stopBlink = obj => {
  if(!blinkis) {
    clearInterval(blinkin); 
    obj.material.color.set(0xFFFFFF);
  } 
}

// Pointing
const mousePosition = new THREE.Vector2(); 
const raycaster     = new THREE.Raycaster(); 
window.addEventListener('mousemove', function(e) {
  mousePosition.x =  (e.clientX / widths) * 2 - 1; 
  mousePosition.y = -(e.clientY / height) * 2 + 1; 
})
const pointing = () => {
  raycaster.setFromCamera(mousePosition, camera); 
  let intersects = raycaster.intersectObjects(scenes.children); 
  intersects.forEach(item => {
    if(item.object.id == meshes[4].id) item.object.material.color.set(0xFF00FF); 
    if(item.object.name == "bimo") item.object.rotation.y += 0.5;
    if(item.object.name == "bardock") video.play();
    if(item.object.id == meshes[5].id) {
        startBlink(meshes[5]); 
    } 
  })
}
// Planet
const planet = (size, position, texture, ring) => {
  const geo = new THREE.SphereGeometry(size, 40, 40);
  const mat = new THREE.MeshBasicMaterial({ map: textureLoad.load(texture) });
  const mesh = new THREE.Mesh(geo, mat);
  const obj3D = new THREE.Object3D();
  if (ring.texture) {
      const ringGeo = new THREE.RingGeometry(ring.inrad, ring.ourad, 20);
      const ringMat = new THREE.MeshBasicMaterial({
          map: ring.texture,
          side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.x = position;
      ringMesh.rotation.x = -Math.PI / 2;
      obj3D.add(ringMesh);
  }
  obj3D.add(mesh);
  scenes.add(obj3D);
  mesh.position.x = position;
  return { mesh, obj3D };
};
const vearth  = planet(5, 20, earth, false);
const vsaturn = planet(10, 50, saturn, {
    inrad: 5,
    ourad: 15,
    texture: textureLoad.load(saturnring)
});

// Create 3D Room 
const create3DRoom = (x,y,color, type) => {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(x,y), 
        new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide})
    )
    let pi = -Math.PI/2;
    let s  = 10; 
    let v  = 5; 

    // Ground 
    if(type == 1) {
      mesh.rotation.x = pi;
      mesh.position.y = s-1.5; 
    }
    // Back wall
    if(type == 2) {
        mesh.position.y = s; 
        mesh.position.z = v; 
    }
    // Sidewall
    if(type == 3) {
        mesh.rotation.y = pi; 
        mesh.position.x = -v; 
        mesh.position.y = s; 
    }
    mesh.userData = "room"; 
    scenes.add(mesh); 
    return mesh; 
}
const ground = create3DRoom(10, 10, 0x00FF00, 1);
const backwall = create3DRoom(10, 3, 0xFF0000, 2);
const sidewall = create3DRoom(10, 3, 0x0000FF, 3);

// Gsap 
// Fog (efek kabut ketika menjauh)
const tween = gsap.to(camera.position, {x: 30, y: 30, z: 30, duration: 2, paused: true}); 
setTimeout(() => {
    tween.play();
    scenes.fog = new THREE.Fog(0xFFFFFF, 15, 60);  
}, 1000);

const animate = () => {
  // Model 
  if(mixer) mixer.update(clock.getDelta())
  // GUI
  lights[0].angle = option.angle; 
  // Scan Object
  scenes.traverse(item => {if(item.isMesh && item.userData != 'room') item.rotation.x += 0.01;})
  // Pointing
  pointing();
  // Planet 
  vsaturn.obj3D.rotation.y += 0.0005; 
  vearth.obj3D.rotation.y += 0.005; 
  // Animate
  requestAnimationFrame(animate); 
  renderer.render(scenes, camera);  
}
animate(); 
window.addEventListener('resize', function(e) {
  camera.aspect = aspect;
  camera.updateProjectionMatrix(); 
  renderer.setSize(widths, height);  
})