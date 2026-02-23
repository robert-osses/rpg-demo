import * as THREE from 'three';
import type { UnitViewData } from '../app/battleAdapter';
import { SceneManager } from './SceneManager';
import { createUnitMesh, updateUnitMesh } from './UnitMesh';
import { AnimationController } from './AnimationController';

export class BattlefieldRenderer {
    private sceneManager: SceneManager;
    private unitMeshes: Map<string, THREE.Group> = new Map();
    private unitPositions: Map<string, THREE.Vector3> = new Map();
    public animationController: AnimationController;

    constructor(canvas: HTMLCanvasElement, width: number, height: number, backgroundType: string = 'forest') {
        this.sceneManager = new SceneManager(canvas, width, height, backgroundType);
        this.animationController = new AnimationController(this.sceneManager.scene);

        // Add animation update to render loop
        this.sceneManager.addRenderCallback(() => {
            this.animationController.update();
        });
    }

    /**
     * Initialize the battlefield with unit positions.
     */
    setupUnits(playerUnits: UnitViewData[], enemyUnits: UnitViewData[]): void {
        this.clearUnits();

        // Position player units on the left
        playerUnits.forEach((unit, i) => {
            const x = -4;
            const z = this.getUnitZPosition(i, playerUnits.length);
            const pos = new THREE.Vector3(x, 0, z);
            this.unitPositions.set(unit.id, pos.clone());

            const mesh = createUnitMesh({
                id: unit.id,
                spriteColor: unit.spriteColor,
                spriteShape: unit.spriteShape as 'box' | 'sphere',
                isPlayer: true,
                position: pos,
            });
            this.sceneManager.scene.add(mesh);
            this.unitMeshes.set(unit.id, mesh);
        });

        // Position enemy units on the right
        enemyUnits.forEach((unit, i) => {
            const x = 4;
            const z = this.getUnitZPosition(i, enemyUnits.length);
            const pos = new THREE.Vector3(x, 0, z);
            this.unitPositions.set(unit.id, pos.clone());

            const mesh = createUnitMesh({
                id: unit.id,
                spriteColor: unit.spriteColor,
                spriteShape: unit.spriteShape as 'box' | 'sphere',
                isPlayer: false,
                position: pos,
            });
            // Face enemies toward players
            mesh.rotation.y = Math.PI;
            this.sceneManager.scene.add(mesh);
            this.unitMeshes.set(unit.id, mesh);
        });
    }

    private getUnitZPosition(index: number, total: number): number {
        const spread = 1.5;
        const offset = ((total - 1) * spread) / 2;
        return index * spread - offset;
    }

    /**
     * Update unit visuals based on current state.
     */
    updateUnits(units: UnitViewData[]): void {
        for (const unit of units) {
            const mesh = this.unitMeshes.get(unit.id);
            if (mesh) {
                updateUnitMesh(mesh, unit.isAlive, unit.isCurrentTurn);
            }
        }
    }

    /**
     * Play attack animation: unit moves toward target and back.
     */
    playAttackAnimation(
        attackerId: string,
        targetId: string,
        onComplete: () => void
    ): void {
        const attackerMesh = this.unitMeshes.get(attackerId);
        const targetPos = this.unitPositions.get(targetId);
        const attackerOrigPos = this.unitPositions.get(attackerId);

        if (!attackerMesh || !targetPos || !attackerOrigPos) {
            onComplete();
            return;
        }

        this.animationController.playAttack(
            attackerMesh,
            attackerOrigPos,
            targetPos,
            onComplete
        );
    }

    /**
     * Play damage flash on a unit.
     */
    playDamageEffect(targetId: string): void {
        const mesh = this.unitMeshes.get(targetId);
        if (mesh) {
            this.animationController.playDamageFlash(mesh);
        }
    }

    /**
     * Play heal effect on a unit.
     */
    playHealEffect(targetId: string): void {
        const pos = this.unitPositions.get(targetId);
        if (pos) {
            this.animationController.playHealParticles(pos);
        }
    }

    /**
     * Play magic cast effect
     */
    playMagicEffect(casterId: string, targetId: string, onComplete: () => void): void {
        const casterPos = this.unitPositions.get(casterId);
        const targetPos = this.unitPositions.get(targetId);

        if (!casterPos || !targetPos) {
            onComplete();
            return;
        }

        this.animationController.playMagicProjectile(casterPos, targetPos, onComplete);
    }

    private clearUnits(): void {
        for (const mesh of this.unitMeshes.values()) {
            this.sceneManager.scene.remove(mesh);
            mesh.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m) => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        this.unitMeshes.clear();
        this.unitPositions.clear();
    }

    start(): void {
        this.sceneManager.start();
    }

    resize(width: number, height: number): void {
        this.sceneManager.resize(width, height);
    }

    dispose(): void {
        this.clearUnits();
        this.sceneManager.dispose();
    }
}
