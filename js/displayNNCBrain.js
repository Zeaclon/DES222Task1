import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/OBJLoader.js';

export function createNeuralNetwork(container) {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 300); // Zoom out a bit more

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    // Add lights so materials can be seen
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Group to hold brain mesh and neurons
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Load brain model
    const objLoader = new OBJLoader();
    objLoader.load(
        'assets/models/brain-parts-big_07.obj',
        (brainMesh) => {
            // Scale and position the brain mesh
            brainMesh.scale.set(0.5, 0.5, 0.5);
            brainMesh.position.set(0, 0, 0);
            brainGroup.add(brainMesh);

            // Extract all vertices from brainMesh and its children
            let positions = [];
            brainMesh.traverse((child) => {
                if (child.isMesh) {
                    const posAttr = child.geometry.attributes.position;
                    for (let i = 0; i < posAttr.count; i++) {
                        positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
                    }
                }
            });

            const pointsGeometry = new THREE.BufferGeometry();
            pointsGeometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(positions, 3)
            );

            // Create points material (dots)
            const pointsMaterial = new THREE.PointsMaterial({
                color: 0x44aaff,
                size: 0.15,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.8,
            });

            // Create Points object (the dot skin)
            const brainPoints = new THREE.Points(pointsGeometry, pointsMaterial);
            brainGroup.add(brainPoints);

            // Hide the original mesh if you want just dots visible
            brainMesh.visible = false; // or set material.opacity=0.1 and material.transparent=true to keep mesh faintly visible
        },
        undefined,
        (error) => {
            console.error('Error loading brain model:', error);
        }
    );

    // Resize handling
    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener('resize', onWindowResize);

    // Animate loop
    function animate() {
        requestAnimationFrame(animate);
        brainGroup.rotation.y += 0.001;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
