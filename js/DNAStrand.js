import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js';
import { buildDNA, createBridgeBetweenPoints } from './dna.js';
import { getLogs, logEvent } from './logger.js';

const container = document.getElementById('dna3d-container');
const logInfo = document.getElementById('logInfo'); // may be null

// --- Scene setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = true;
controls.enableZoom = true;

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Build DNA from persisted logs ---
const logs = getLogs(); // <- get logs from localStorage
const { dnaHelix1, dnaHelix2, basePairsBridges } = buildDNA(logs);
scene.add(dnaHelix1, dnaHelix2, basePairsBridges);

// --- Raycaster ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(basePairsBridges.children);

    if (logInfo) { // only update if element exists
        if (intersects.length > 0) {
            const log = intersects[0].object.userData.log;
            logInfo.innerHTML = `Time: ${log.time} | Type: ${log.type} | Message: ${log.message}`;
        } else {
            logInfo.innerHTML = 'Hover over a bridge to see log info';
        }
    }
}

window.addEventListener('mousemove', onMouseMove);

// --- Animate ---
function animate() {
    requestAnimationFrame(animate);
    dnaHelix1.rotation.y += 0.002;
    dnaHelix2.rotation.y += 0.002;
    basePairsBridges.rotation.y += 0.002;
    controls.update();
    renderer.render(scene, camera);
}
animate();


// --- Buttons ---
const addBridgeBtn = document.getElementById('addBridgeBtn');
const removeBridgeBtn = document.getElementById('removeBridgeBtn');

// Helper to add a custom bridge
addBridgeBtn.addEventListener('click', () => {
    const h1Children = dnaHelix1.children;
    const h2Children = dnaHelix2.children;
    if (h1Children.length && h2Children.length) {
        const idx = Math.floor(Math.random() * h1Children.length);
        const start = h1Children[idx].position;
        const end = h2Children[idx].position;

        const customLog = {
            time: new Date().toISOString(),
            type: 'custom',
            message: 'User hacked this DNA bridge!'
        };

        // --- Persist to localStorage ---
        logEvent(customLog.type, customLog.message);

        // --- Add visually ---
        const bridge = createBridgeBetweenPoints(
            start,
            end,
            0.1,
            0xffff00,  // yellow for custom
            customLog
        );
        basePairsBridges.add(bridge);
    }
});

// Remove last bridge
removeBridgeBtn.addEventListener('click', () => {
    const logs = getLogs();
    if (basePairsBridges.children.length > 0 && logs.length > 0) {
        const lastBridge = basePairsBridges.children[basePairsBridges.children.length - 1];
        basePairsBridges.remove(lastBridge);

        // Remove last log from localStorage
        logs.pop();
        localStorage.setItem('siteLogs', JSON.stringify(logs));
    }
});