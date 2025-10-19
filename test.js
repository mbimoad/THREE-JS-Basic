import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 3, 4);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const planeWidth = 2;
const planeHeight = 2;
const widthSeg = 3;
const heightSeg = 2;

const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide,
  wireframe: true,
});

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(planeWidth, planeHeight, widthSeg, heightSeg),
  planeMaterial
);
plane.rotation.x = -Math.PI / 2;
plane.position.set(2, 0, -2);
scene.add(plane);

// === Buat cell collider (hoverBoxes) ===
const cellWidth = planeWidth / widthSeg;
const cellHeight = planeHeight / heightSeg;
const boxHeight = 0.3;

const hoverBoxes = [];
const cellStackCount = {}; // key: cell-i-j, value: count (0–3)

for (let i = 0; i < widthSeg; i++) {
  for (let j = 0; j < heightSeg; j++) {
    const boxGeo = new THREE.BoxGeometry(cellWidth, 0.01, cellHeight);
    const boxMat = new THREE.MeshBasicMaterial({
      color: Math.floor(Math.random() * 0xFFFFFF),
      transparent: true,
      opacity: 0.0, // invisible
    });
    const box = new THREE.Mesh(boxGeo, boxMat);

    const x = -planeWidth / 2 + cellWidth / 2 + i * cellWidth + plane.position.x;
    const z = -planeHeight / 2 + cellHeight / 2 + j * cellHeight + plane.position.z;

    box.position.set(x, 0.01, z);
    const cellName = `cell-${i}-${j}`;
    box.name = cellName;

    cellStackCount[cellName] = 0; // init

    scene.add(box);
    hoverBoxes.push(box);
  }
}

// Raycaster & mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const stackedBoxes = []; // Menyimpan semua box yang ditambahkan
let spinningBox = null; // Box yang sedang diputar

function onClick(event) {
    // tolong reset semua rotasi box dan animasinya
    stackedBoxes.forEach(box => {
        box.rotation.set(0, 0, 0); // Reset rotasi ke awal
      });
      spinningBox = null;
      
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    raycaster.setFromCamera(mouse, camera);
  
    const intersects = raycaster.intersectObjects(scene.children); // ← semua objek di scene
  
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
  
      // === Cek kalau yang diklik adalah box stack ===
      if (stackedBoxes.includes(clickedObject)) {
        // Ubah warna random
        clickedObject.material.color.set(Math.random() * 0xffffff);
  
        // Putar box (set sebagai spinningBox)
        spinningBox = clickedObject;
  
        // Alert atau console log
        alert("Box clicked!");
  
        return; // jangan lanjut ke logic cell
      }
  
      // === Cek kalau yang diklik adalah hoverBox/cell ===
      if (hoverBoxes.includes(clickedObject)) {
        const cellName = clickedObject.name;
        const stack = cellStackCount[cellName];
  
        if (stack < 3) {
          const newBox = new THREE.Mesh(
            new THREE.BoxGeometry(cellWidth * 0.8, boxHeight, cellHeight * 0.8),
            new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
          );
  
          newBox.position.set(
            clickedObject.position.x,
            (boxHeight / 2) + (stack * boxHeight),
            clickedObject.position.z
          );
  
          scene.add(newBox);
          stackedBoxes.push(newBox); // Tambahkan ke daftar
          cellStackCount[cellName]++;
        } else {
          console.log(`Max stack reached for ${cellName}`);
        }
      }
    }
  }
  
window.addEventListener('click', onClick);

function animate() {
  if (spinningBox) {
     spinningBox.rotation.y += 0.05;
  }

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
