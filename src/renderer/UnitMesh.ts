import * as THREE from 'three';
import type { SpriteShape } from '../engine/types';

export interface UnitMeshData {
    id: string;
    spriteColor: string;
    spriteShape: SpriteShape;
    isPlayer: boolean;
    position: THREE.Vector3;
}

/**
 * Creates a 3D mesh for a combat unit.
 * Box for warriors/fighters, Sphere for mages/casters.
 */
export function createUnitMesh(data: UnitMeshData): THREE.Group {
    const group = new THREE.Group();
    group.userData.unitId = data.id;

    const color = new THREE.Color(data.spriteColor);

    if (data.spriteShape === 'sphere') {
        // Mage: sphere body + small cone hat
        const bodyGeom = new THREE.SphereGeometry(0.5, 16, 16);
        const bodyMat = new THREE.MeshPhongMaterial({ color, shininess: 80 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.5;
        body.castShadow = true;
        group.add(body);

        // Hat
        const hatGeom = new THREE.ConeGeometry(0.35, 0.6, 8);
        const hatMat = new THREE.MeshPhongMaterial({
            color: color.clone().multiplyScalar(0.6),
            shininess: 60,
        });
        const hat = new THREE.Mesh(hatGeom, hatMat);
        hat.position.y = 1.2;
        hat.castShadow = true;
        group.add(hat);
    } else {
        // Warrior: box body + small box head
        const bodyGeom = new THREE.BoxGeometry(0.7, 0.9, 0.5);
        const bodyMat = new THREE.MeshPhongMaterial({ color, shininess: 60 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.45;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeom = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMat = new THREE.MeshPhongMaterial({
            color: 0xffccaa,
            shininess: 40,
        });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.15;
        head.castShadow = true;
        group.add(head);

        // Shield for player warriors
        if (data.isPlayer) {
            const shieldGeom = new THREE.BoxGeometry(0.1, 0.5, 0.4);
            const shieldMat = new THREE.MeshPhongMaterial({
                color: color.clone().multiplyScalar(0.7),
                shininess: 100,
            });
            const shield = new THREE.Mesh(shieldGeom, shieldMat);
            shield.position.set(-0.45, 0.5, 0);
            group.add(shield);
        }
    }

    // Name indicator (small floating sphere above unit)
    const indicatorGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const indicatorMat = new THREE.MeshBasicMaterial({
        color: data.isPlayer ? 0x44ff44 : 0xff4444,
    });
    const indicator = new THREE.Mesh(indicatorGeom, indicatorMat);
    indicator.position.y = 1.6;
    indicator.userData.isIndicator = true;
    group.add(indicator);

    group.position.copy(data.position);

    return group;
}

/**
 * Updates unit mesh to reflect alive/dead state.
 */
export function updateUnitMesh(
    group: THREE.Group,
    isAlive: boolean,
    isCurrentTurn: boolean
): void {
    // Fade dead units
    group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            if (child.userData.isIndicator) {
                // Pulse the indicator for current turn
                const scale = isCurrentTurn ? 1.5 + Math.sin(Date.now() * 0.005) * 0.5 : 1;
                child.scale.setScalar(scale);
                return;
            }
            const mat = child.material as THREE.MeshPhongMaterial;
            mat.opacity = isAlive ? 1.0 : 0.3;
            mat.transparent = !isAlive;
        }
    });

    // Lay down dead units
    if (!isAlive) {
        group.rotation.z = Math.PI / 2;
        group.position.y = -0.3;
    } else {
        group.rotation.z = 0;
    }
}
