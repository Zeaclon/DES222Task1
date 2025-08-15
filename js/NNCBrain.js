import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/OBJLoader.js';

export function createNeuralNetwork(container, options = {}) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        2000
    );
    camera.position.set(0, 0, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // for crisp rendering
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;

    // On window resize
    function onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener('resize', onWindowResize);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    const objLoader = new OBJLoader();
    objLoader.load(
        options.modelPath || 'assets/models/brain-parts-big_07.OBJ',
        (brainMesh) => {
            brainMesh.scale.set(0.5, 0.5, 0.5);
            brainMesh.position.set(0, 0, 0);
            brainGroup.add(brainMesh);

            // Extract vertices for neurons
            const positions = [];
            brainMesh.traverse((child) => {
                if (child.isMesh) {
                    const posAttr = child.geometry.attributes.position;
                    for (let i = 0; i < posAttr.count; i++) {
                        positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
                    }
                }
            });

            const pointsGeometry = new THREE.BufferGeometry();
            pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

            const pointsMaterial = new THREE.PointsMaterial({
                color: 0x44aaff,
                size: 0.15,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.8
            });

            const brainPoints = new THREE.Points(pointsGeometry, pointsMaterial);
            brainGroup.add(brainPoints);

            brainMesh.visible = false;

            // --- Create connections between neurons ---
            const connectionsGroup = new THREE.Group();
            brainGroup.add(connectionsGroup);

            function createConnections(count = 300) {
                connectionsGroup.clear();
                for (let i = 0; i < count; i++) {
                    const a = Math.floor(Math.random() * positions.length / 3);
                    const b = Math.floor(Math.random() * positions.length / 3);
                    if (a === b) continue;

                    const geometry = new THREE.BufferGeometry();
                    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
                        positions[a*3], positions[a*3+1], positions[a*3+2],
                        positions[b*3], positions[b*3+1], positions[b*3+2]
                    ], 3));

                    // Random color for now (can map to telemetry later)
                    const color = new THREE.Color(`hsl(${Math.random()*360},100%,50%)`);
                    const material = new THREE.LineBasicMaterial({ color, transparent:true, opacity:0.5 });
                    const line = new THREE.Line(geometry, material);

                    connectionsGroup.add(line);
                }
            }

            createConnections();

            // Lights to simulate “activity”
            const pulseLights = [];
            for (let i = 0; i < 5; i++) {
                const light = new THREE.PointLight(0x00ffff, 1, 50);
                light.position.set(Math.random()*50-25, Math.random()*50-25, Math.random()*50-25);
                scene.add(light);
                pulseLights.push(light);
            }

            // Raycaster for hover highlights
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            window.addEventListener('mousemove', e => {
                mouse.x = (e.clientX / container.clientWidth)*2-1;
                mouse.y = -(e.clientY / container.clientHeight)*2+1;
            });

            function highlightNearestNeuron() {
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObject(brainPoints);
                if(intersects.length) {
                    const p = intersects[0].point;
                    connectionsGroup.children.forEach(line=>{
                        const positions = line.geometry.attributes.position.array;
                        const d1 = new THREE.Vector3(positions[0],positions[1],positions[2]).distanceTo(p);
                        const d2 = new THREE.Vector3(positions[3],positions[4],positions[5]).distanceTo(p);
                        line.material.opacity = (d1<2 || d2<2) ? 1 : 0.1;
                    });
                } else {
                    connectionsGroup.children.forEach(line=>{
                        line.material.opacity = 0.5;
                    });
                }
            }

            // Animate
            function animate() {
                requestAnimationFrame(animate);
                brainGroup.rotation.y += 0.002;

                // Pulse lights
                const time = performance.now();
                pulseLights.forEach((l, idx) => {
                    l.intensity = 0.5 + 0.5*Math.sin(time*0.001 + idx);
                    l.color.setHSL((time*0.0001 + idx/5) % 1, 1, 0.5);
                });

                highlightNearestNeuron();
                controls.update();
                renderer.render(scene, camera);
            }
            animate();
        },
        undefined,
        (err) => console.error('Error loading brain model:', err)
    );

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}