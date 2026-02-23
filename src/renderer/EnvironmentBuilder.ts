import * as THREE from 'three';

export type BackgroundType = 'forest' | 'cave' | 'dark';

interface EnvironmentConfig {
    backgroundColor: number;
    fogColor: number;
    fogNear: number;
    fogFar: number;
    ambientColor: number;
    ambientIntensity: number;
    directionalColor: number;
    directionalIntensity: number;
    fillColor: number;
    fillIntensity: number;
    groundColor: number;
}

const CONFIGS: Record<BackgroundType, EnvironmentConfig> = {
    forest: {
        backgroundColor: 0x0a1f0a,
        fogColor: 0x1a3a1a,
        fogNear: 12,
        fogFar: 35,
        ambientColor: 0x446644,
        ambientIntensity: 0.6,
        directionalColor: 0xffe8c0,
        directionalIntensity: 0.9,
        fillColor: 0x335522,
        fillIntensity: 0.3,
        groundColor: 0x2a4a2a,
    },
    cave: {
        backgroundColor: 0x0d0d1a,
        fogColor: 0x151525,
        fogNear: 10,
        fogFar: 30,
        ambientColor: 0x334466,
        ambientIntensity: 0.4,
        directionalColor: 0x6688cc,
        directionalIntensity: 0.6,
        fillColor: 0x443366,
        fillIntensity: 0.3,
        groundColor: 0x2a2a3a,
    },
    dark: {
        backgroundColor: 0x0a0510,
        fogColor: 0x100818,
        fogNear: 8,
        fogFar: 28,
        ambientColor: 0x442244,
        ambientIntensity: 0.35,
        directionalColor: 0xaa4466,
        directionalIntensity: 0.7,
        fillColor: 0x662244,
        fillIntensity: 0.4,
        groundColor: 0x1a1025,
    },
};

/**
 * Builds themed 3D environments for battle scenes.
 */
export class EnvironmentBuilder {
    /**
     * Builds a complete environment for the given scene and background type.
     * Returns an array of objects added so they can be cleaned up.
     */
    static build(scene: THREE.Scene, backgroundType: string): THREE.Object3D[] {
        const type = (backgroundType as BackgroundType) || 'forest';
        const config = CONFIGS[type] ?? CONFIGS.forest;
        const objects: THREE.Object3D[] = [];

        // Scene background & fog
        scene.background = new THREE.Color(config.backgroundColor);
        scene.fog = new THREE.Fog(config.fogColor, config.fogNear, config.fogFar);

        // Lights
        const ambient = new THREE.AmbientLight(config.ambientColor, config.ambientIntensity);
        scene.add(ambient);
        objects.push(ambient);

        const directional = new THREE.DirectionalLight(config.directionalColor, config.directionalIntensity);
        directional.position.set(5, 10, 5);
        directional.castShadow = true;
        directional.shadow.mapSize.width = 1024;
        directional.shadow.mapSize.height = 1024;
        scene.add(directional);
        objects.push(directional);

        const fill = new THREE.DirectionalLight(config.fillColor, config.fillIntensity);
        fill.position.set(-5, 5, -5);
        scene.add(fill);
        objects.push(fill);

        // Ground
        const groundGeo = new THREE.PlaneGeometry(40, 30);
        const groundMat = new THREE.MeshLambertMaterial({ color: config.groundColor });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        scene.add(ground);
        objects.push(ground);

        // Theme-specific decorations
        switch (type) {
            case 'forest':
                objects.push(...this.buildForest(scene));
                break;
            case 'cave':
                objects.push(...this.buildCave(scene));
                break;
            case 'dark':
                objects.push(...this.buildDark(scene));
                break;
        }

        return objects;
    }

    // ---- Forest Theme ----
    private static buildForest(scene: THREE.Scene): THREE.Object3D[] {
        const objects: THREE.Object3D[] = [];

        // Trees
        const treePositions = [
            [-10, -6], [-8, -8], [-12, -4], [-9, 6], [-11, 4],
            [10, -5], [8, -7], [12, -3], [9, 5], [11, 3],
            [-7, -9], [7, -9], [-6, 8], [6, 8],
        ];

        for (const [x, z] of treePositions) {
            const tree = this.createTree();
            tree.position.set(x, -0.5, z);
            tree.rotation.y = Math.random() * Math.PI * 2;
            const scale = 0.7 + Math.random() * 0.6;
            tree.scale.set(scale, scale, scale);
            scene.add(tree);
            objects.push(tree);
        }

        // Grass tufts
        for (let i = 0; i < 40; i++) {
            const grass = this.createGrass();
            grass.position.set(
                (Math.random() - 0.5) * 28,
                -0.45,
                (Math.random() - 0.5) * 18
            );
            scene.add(grass);
            objects.push(grass);
        }

        // Firefly particles
        const fireflies = this.createFireflies(60, 0xaaff44);
        scene.add(fireflies);
        objects.push(fireflies);

        // Soft green point light
        const greenGlow = new THREE.PointLight(0x44ff44, 0.3, 20);
        greenGlow.position.set(0, 3, 0);
        scene.add(greenGlow);
        objects.push(greenGlow);

        return objects;
    }

    private static createTree(): THREE.Group {
        const group = new THREE.Group();

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 2.5, 6);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3520 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.25;
        trunk.castShadow = true;
        group.add(trunk);

        // Foliage layers
        const foliageColors = [0x1a5a1a, 0x226622, 0x2a7a2a];
        const sizes = [
            { r: 1.2, h: 1.8, y: 3.0 },
            { r: 0.9, h: 1.4, y: 4.2 },
            { r: 0.6, h: 1.0, y: 5.0 },
        ];

        for (let i = 0; i < 3; i++) {
            const { r, h, y } = sizes[i];
            const coneGeo = new THREE.ConeGeometry(r, h, 7);
            const coneMat = new THREE.MeshLambertMaterial({ color: foliageColors[i] });
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.position.y = y;
            cone.castShadow = true;
            group.add(cone);
        }

        return group;
    }

    private static createGrass(): THREE.Group {
        const group = new THREE.Group();
        const bladeCount = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < bladeCount; i++) {
            const geo = new THREE.ConeGeometry(0.03, 0.3 + Math.random() * 0.2, 4);
            const mat = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(0.28 + Math.random() * 0.05, 0.6, 0.25 + Math.random() * 0.1),
            });
            const blade = new THREE.Mesh(geo, mat);
            blade.position.set(
                (Math.random() - 0.5) * 0.3,
                0.15,
                (Math.random() - 0.5) * 0.3
            );
            blade.rotation.z = (Math.random() - 0.5) * 0.4;
            group.add(blade);
        }

        return group;
    }

    // ---- Cave Theme ----
    private static buildCave(scene: THREE.Scene): THREE.Object3D[] {
        const objects: THREE.Object3D[] = [];

        // Stalactites from ceiling
        for (let i = 0; i < 25; i++) {
            const stalactite = this.createStalactite();
            stalactite.position.set(
                (Math.random() - 0.5) * 30,
                8 + Math.random() * 4,
                (Math.random() - 0.5) * 20
            );
            scene.add(stalactite);
            objects.push(stalactite);
        }

        // Rock pillars
        const pillarPositions = [
            [-8, -5], [-10, 3], [8, -4], [10, 5], [-6, 7], [7, -7],
        ];
        for (const [x, z] of pillarPositions) {
            const pillar = this.createRockPillar();
            pillar.position.set(x, -0.5, z);
            pillar.rotation.y = Math.random() * Math.PI;
            scene.add(pillar);
            objects.push(pillar);
        }

        // Glowing crystals
        const crystalPositions = [
            [-5, -3], [6, 2], [-3, 5], [4, -6], [-9, 0], [9, -2],
        ];
        const crystalColors = [0x4488ff, 0x6644ff, 0x44aaff, 0x8844ff, 0x44ccff, 0x6666ff];

        for (let i = 0; i < crystalPositions.length; i++) {
            const [x, z] = crystalPositions[i];
            const crystal = this.createCrystal(crystalColors[i]);
            crystal.position.set(x, -0.5, z);
            scene.add(crystal);
            objects.push(crystal);

            // Point light for crystal glow
            const light = new THREE.PointLight(crystalColors[i], 0.4, 6);
            light.position.set(x, 0.5, z);
            scene.add(light);
            objects.push(light);
        }

        // Ambient cave particles (dust)
        const dust = this.createFireflies(40, 0x6688aa);
        scene.add(dust);
        objects.push(dust);

        return objects;
    }

    private static createStalactite(): THREE.Mesh {
        const height = 1 + Math.random() * 2.5;
        const geo = new THREE.ConeGeometry(0.15 + Math.random() * 0.2, height, 5);
        const mat = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0.08, 0.1, 0.2 + Math.random() * 0.1),
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = Math.PI; // point downward
        return mesh;
    }

    private static createRockPillar(): THREE.Group {
        const group = new THREE.Group();
        const height = 2 + Math.random() * 3;
        const geo = new THREE.CylinderGeometry(
            0.4 + Math.random() * 0.3,
            0.6 + Math.random() * 0.4,
            height,
            6
        );
        const mat = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0.07, 0.15, 0.2),
        });
        const pillar = new THREE.Mesh(geo, mat);
        pillar.position.y = height / 2;
        pillar.castShadow = true;
        group.add(pillar);
        return group;
    }

    private static createCrystal(color: number): THREE.Group {
        const group = new THREE.Group();

        for (let i = 0; i < 3; i++) {
            const height = 0.6 + Math.random() * 0.8;
            const geo = new THREE.ConeGeometry(0.08 + Math.random() * 0.06, height, 5);
            const mat = new THREE.MeshPhongMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.8,
                shininess: 100,
            });
            const shard = new THREE.Mesh(geo, mat);
            shard.position.set(
                (Math.random() - 0.5) * 0.3,
                height / 2,
                (Math.random() - 0.5) * 0.3
            );
            shard.rotation.z = (Math.random() - 0.5) * 0.5;
            shard.rotation.x = (Math.random() - 0.5) * 0.3;
            group.add(shard);
        }

        return group;
    }

    // ---- Dark Tower Theme ----
    private static buildDark(scene: THREE.Scene): THREE.Object3D[] {
        const objects: THREE.Object3D[] = [];

        // Ruined pillars
        const pillarPositions = [
            [-9, -5], [-7, 5], [9, -4], [7, 6],
            [-11, 0], [11, 0], [-5, -8], [5, -8],
        ];

        for (const [x, z] of pillarPositions) {
            const pillar = this.createRuinedPillar();
            pillar.position.set(x, -0.5, z);
            pillar.rotation.y = Math.random() * Math.PI;
            scene.add(pillar);
            objects.push(pillar);
        }

        // Floating dark energy orbs
        const orbPositions = [
            [-3, 3, -2], [4, 4, 3], [-5, 2, 4], [6, 5, -3],
            [0, 6, -5], [-2, 4, 6],
        ];
        const orbColors = [0xaa2255, 0x8833aa, 0xcc3366, 0x6622aa, 0xdd4488, 0x7733cc];

        for (let i = 0; i < orbPositions.length; i++) {
            const [x, y, z] = orbPositions[i];
            const orb = this.createEnergyOrb(orbColors[i]);
            orb.position.set(x, y, z);
            scene.add(orb);
            objects.push(orb);

            const light = new THREE.PointLight(orbColors[i], 0.5, 8);
            light.position.set(x, y, z);
            scene.add(light);
            objects.push(light);
        }

        // Dark particles
        const particles = this.createFireflies(80, 0x8844aa);
        scene.add(particles);
        objects.push(particles);

        // Eerie ground cracks (emissive lines)
        for (let i = 0; i < 6; i++) {
            const crack = this.createGroundCrack();
            crack.position.set(
                (Math.random() - 0.5) * 20,
                -0.48,
                (Math.random() - 0.5) * 14
            );
            crack.rotation.y = Math.random() * Math.PI;
            scene.add(crack);
            objects.push(crack);
        }

        return objects;
    }

    private static createRuinedPillar(): THREE.Group {
        const group = new THREE.Group();

        const fullHeight = 3 + Math.random() * 2;
        const brokenHeight = fullHeight * (0.4 + Math.random() * 0.4);

        // Main pillar (broken)
        const geo = new THREE.CylinderGeometry(0.35, 0.45, brokenHeight, 8);
        const mat = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0.75, 0.1, 0.15),
        });
        const pillar = new THREE.Mesh(geo, mat);
        pillar.position.y = brokenHeight / 2;
        pillar.castShadow = true;
        group.add(pillar);

        // Base
        const baseGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.3, 8);
        const baseMat = new THREE.MeshLambertMaterial({ color: 0x1a1020 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.15;
        group.add(base);

        // Rubble pieces
        for (let i = 0; i < 3; i++) {
            const rubbleGeo = new THREE.DodecahedronGeometry(0.15 + Math.random() * 0.15);
            const rubbleMat = new THREE.MeshLambertMaterial({ color: 0x1a1520 });
            const rubble = new THREE.Mesh(rubbleGeo, rubbleMat);
            rubble.position.set(
                (Math.random() - 0.5) * 1.2,
                0.1,
                (Math.random() - 0.5) * 1.2
            );
            group.add(rubble);
        }

        return group;
    }

    private static createEnergyOrb(color: number): THREE.Mesh {
        const geo = new THREE.SphereGeometry(0.2 + Math.random() * 0.15, 12, 12);
        const mat = new THREE.MeshPhongMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.6,
        });
        return new THREE.Mesh(geo, mat);
    }

    private static createGroundCrack(): THREE.Group {
        const group = new THREE.Group();
        const segments = 3 + Math.floor(Math.random() * 4);

        for (let i = 0; i < segments; i++) {
            const len = 0.5 + Math.random() * 1.5;
            const geo = new THREE.PlaneGeometry(len, 0.04);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xaa3355,
                transparent: true,
                opacity: 0.4 + Math.random() * 0.3,
            });
            const seg = new THREE.Mesh(geo, mat);
            seg.rotation.x = -Math.PI / 2;
            seg.position.set(
                i * 0.8 + (Math.random() - 0.5) * 0.3,
                0,
                (Math.random() - 0.5) * 0.5
            );
            seg.rotation.z = (Math.random() - 0.5) * 0.6;
            group.add(seg);
        }

        return group;
    }

    // ---- Shared utilities ----
    private static createFireflies(count: number, color: number): THREE.Points {
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 24;
            positions[i * 3 + 1] = 0.5 + Math.random() * 6;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color,
            size: 0.08,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        return new THREE.Points(geo, mat);
    }
}
