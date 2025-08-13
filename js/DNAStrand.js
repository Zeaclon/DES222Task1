import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('dna3d-container');

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // aspect=1 as placeholder
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x222222);  // optional background color
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Resize handler
function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// Call resize initially and on window resize
window.addEventListener('resize', onWindowResize);
window.addEventListener('load', () => {
    onWindowResize();
});

// DNA parameters
const numBasePairs = 100;
const radius = 2;
const height = 10;

// Materials & geometry
const basePairGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const basePairMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// Groups for the helices and bridges
const dnaHelix1 = new THREE.Group();
const dnaHelix2 = new THREE.Group();
const basePairsBridges = new THREE.Group();

// Create helix spheres
for (let i = 0; i < numBasePairs; i++) {
    const angle = (i / numBasePairs) * Math.PI * 2;
    const y = (i / numBasePairs) * height - height / 2;

    const x1 = radius * Math.cos(angle);
    const z1 = radius * Math.sin(angle);
    const basePair1 = new THREE.Mesh(basePairGeometry, basePairMaterial);
    basePair1.position.set(x1, y, z1);
    dnaHelix1.add(basePair1);

    const x2 = radius * Math.cos(angle + Math.PI);
    const z2 = radius * Math.sin(angle + Math.PI);
    const basePair2 = new THREE.Mesh(basePairGeometry, basePairMaterial);
    basePair2.position.set(x2, y, z2);
    dnaHelix2.add(basePair2);
}

// Helper to create cylinder bridges
function createBridgeBetweenPoints(start, end, radius, color) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();

    const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cylinder = new THREE.Mesh(geometry, material);

    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    cylinder.position.copy(midpoint);

    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

    return cylinder;
}

// Create bridges
for (let i = 0; i < numBasePairs; i++) {
    const angle = (i / numBasePairs) * Math.PI * 2;
    const y = (i / numBasePairs) * height - height / 2;

    const start = new THREE.Vector3(radius * Math.cos(angle), y, radius * Math.sin(angle));
    const end = new THREE.Vector3(radius * Math.cos(angle + Math.PI), y, radius * Math.sin(angle + Math.PI));

    const bridge = createBridgeBetweenPoints(start, end, 0.05, 0x0000ff);
    basePairsBridges.add(bridge);
}

// Add everything to scene
scene.add(dnaHelix1);
scene.add(dnaHelix2);
scene.add(basePairsBridges);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    dnaHelix1.rotation.y += 0.001;
    dnaHelix2.rotation.y += 0.001;
    basePairsBridges.rotation.y += 0.001;

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Change color on click
document.addEventListener('click', () => {
    const newColor = new THREE.Color(Math.random(), Math.random(), Math.random());
    basePairMaterial.color.set(newColor);
});