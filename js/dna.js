import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

// --- Helper: map log types to colors ---
function getBridgeColor(type) {
    switch(type) {
        case 'init': return 0x0000ff; // blue
        case 'pageChange': return 0x00ff00; // green
        case 'click': return 0xff00ff; // purple
        case 'error': return 0xff0000; // red
        default: return 0xffff00;           // yellow for anything else
    }
}

// --- Create a bridge between two points ---
export function createBridgeBetweenPoints(start, end, radius, color, log) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    const geom = new THREE.CylinderGeometry(radius, radius, length, 12);
    const mat = new THREE.MeshBasicMaterial({ color });
    const cyl = new THREE.Mesh(geom, mat);
    cyl.position.copy(new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
    cyl.userData.log = log;
    return cyl;
}

// --- Build the DNA strand ---
export function buildDNA(logs, radius = 2, helixTwist = Math.PI / 5, bridgeRadius = 0.1, step = 1, backboneDensity = 5) {
    const h1 = new THREE.Group();
    const h2 = new THREE.Group();
    const bridges = new THREE.Group();
    const bpGeom = new THREE.SphereGeometry(0.12, 16, 16);

    if (!logs.length) return { dnaHelix1: h1, dnaHelix2: h2, basePairsBridges: bridges };

    // --- Convert ISO strings to numbers
    const numericLogs = logs
        .filter(l => !isNaN(Date.parse(l.time)))
        .map(l => ({ ...l, time: new Date(l.time).getTime() }));

    const minTime = Math.min(...numericLogs.map(l => l.time));
    const maxTime = Math.max(...numericLogs.map(l => l.time));

    // Map logs to y positions along the helix
    numericLogs.forEach(l => {
        l.y = ((l.time - minTime) / (maxTime - minTime)) * ((numericLogs.length - 1) * step);
    });

    const totalHeight = (numericLogs.length - 1) * step;
    const totalSteps = Math.ceil(totalHeight * backboneDensity); // number of backbone spheres

    for (let s = 0; s <= totalSteps; s++) {
        const t = s / totalSteps;
        const y = t * totalHeight;

        const angle = t * numericLogs.length * helixTwist;
        const angleOpp = angle + Math.PI;

        const x1 = radius * Math.cos(angle), z1 = radius * Math.sin(angle);
        const x2 = radius * Math.cos(angleOpp), z2 = radius * Math.sin(angleOpp);

        // backbone spheres
        const bp1 = new THREE.Mesh(bpGeom, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        bp1.position.set(x1, y, z1);
        h1.add(bp1);

        const bp2 = new THREE.Mesh(bpGeom, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        bp2.position.set(x2, y, z2);
        h2.add(bp2);

        // bridges at closest logs
        const log = numericLogs.find(l => Math.abs(l.y - y) < step / 2);
        if (log) {
            const color = getBridgeColor(log.type);
            bridges.add(createBridgeBetweenPoints(
                new THREE.Vector3(x1, y, z1),
                new THREE.Vector3(x2, y, z2),
                bridgeRadius,
                color,
                log
            ));
        }
    }

    return { dnaHelix1: h1, dnaHelix2: h2, basePairsBridges: bridges };
}