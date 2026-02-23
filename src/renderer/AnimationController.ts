import * as THREE from 'three';

interface TweenAnimation {
    object: THREE.Object3D;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    duration: number;
    elapsed: number;
    onComplete?: () => void;
    returnToStart: boolean;
    phase: 'forward' | 'return';
}

interface ParticleEffect {
    particles: THREE.Mesh[];
    elapsed: number;
    duration: number;
}

export class AnimationController {
    private scene: THREE.Scene;
    private animations: TweenAnimation[] = [];
    private particles: ParticleEffect[] = [];
    private flashMeshes: Map<THREE.Group, { elapsed: number; duration: number }> = new Map();

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    update(): void {
        const dt = 1 / 60; // Approximate delta time

        // Update tween animations
        this.animations = this.animations.filter((anim) => {
            anim.elapsed += dt;
            const t = Math.min(anim.elapsed / anim.duration, 1);
            const eased = this.easeInOutQuad(t);

            if (anim.phase === 'forward') {
                anim.object.position.lerpVectors(anim.startPos, anim.endPos, eased);
                if (t >= 1) {
                    if (anim.returnToStart) {
                        anim.phase = 'return';
                        anim.elapsed = 0;
                        return true;
                    }
                    anim.onComplete?.();
                    return false;
                }
            } else {
                anim.object.position.lerpVectors(anim.endPos, anim.startPos, eased);
                if (t >= 1) {
                    anim.object.position.copy(anim.startPos);
                    anim.onComplete?.();
                    return false;
                }
            }
            return true;
        });

        // Update particle effects
        this.particles = this.particles.filter((effect) => {
            effect.elapsed += dt;
            const t = effect.elapsed / effect.duration;
            if (t >= 1) {
                for (const p of effect.particles) {
                    this.scene.remove(p);
                    p.geometry.dispose();
                    (p.material as THREE.Material).dispose();
                }
                return false;
            }
            for (const p of effect.particles) {
                p.position.y += dt * 2;
                const mat = p.material as THREE.MeshBasicMaterial;
                mat.opacity = 1 - t;
            }
            return true;
        });

        // Update flash effects
        for (const [mesh, data] of this.flashMeshes.entries()) {
            data.elapsed += dt;
            const t = data.elapsed / data.duration;
            if (t >= 1) {
                mesh.traverse((child) => {
                    if (child instanceof THREE.Mesh && !child.userData.isIndicator) {
                        const mat = child.material as THREE.MeshPhongMaterial;
                        mat.emissive.setHex(0x000000);
                    }
                });
                this.flashMeshes.delete(mesh);
            } else {
                const flash = Math.sin(t * Math.PI * 4) > 0;
                mesh.traverse((child) => {
                    if (child instanceof THREE.Mesh && !child.userData.isIndicator) {
                        const mat = child.material as THREE.MeshPhongMaterial;
                        mat.emissive.setHex(flash ? 0xff2222 : 0x000000);
                    }
                });
            }
        }
    }

    playAttack(
        mesh: THREE.Object3D,
        fromPos: THREE.Vector3,
        toPos: THREE.Vector3,
        onComplete: () => void
    ): void {
        // Move toward target (midpoint)
        const midpoint = fromPos.clone().lerp(toPos, 0.6);

        this.animations.push({
            object: mesh,
            startPos: fromPos.clone(),
            endPos: midpoint,
            duration: 0.3,
            elapsed: 0,
            onComplete,
            returnToStart: true,
            phase: 'forward',
        });
    }

    playDamageFlash(mesh: THREE.Group): void {
        this.flashMeshes.set(mesh, { elapsed: 0, duration: 0.5 });
    }

    playHealParticles(position: THREE.Vector3): void {
        const particles: THREE.Mesh[] = [];
        for (let i = 0; i < 8; i++) {
            const geom = new THREE.SphereGeometry(0.08, 6, 6);
            const mat = new THREE.MeshBasicMaterial({
                color: 0x44ff88,
                transparent: true,
                opacity: 1,
            });
            const particle = new THREE.Mesh(geom, mat);
            particle.position.set(
                position.x + (Math.random() - 0.5) * 1,
                position.y + Math.random() * 0.5,
                position.z + (Math.random() - 0.5) * 1
            );
            this.scene.add(particle);
            particles.push(particle);
        }
        this.particles.push({ particles, elapsed: 0, duration: 1.0 });
    }

    playMagicProjectile(
        from: THREE.Vector3,
        to: THREE.Vector3,
        onComplete: () => void
    ): void {
        const geom = new THREE.SphereGeometry(0.2, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.9,
        });
        const projectile = new THREE.Mesh(geom, mat);
        projectile.position.copy(from);
        projectile.position.y += 1;
        this.scene.add(projectile);

        const targetPos = to.clone();
        targetPos.y += 0.5;

        this.animations.push({
            object: projectile,
            startPos: from.clone().add(new THREE.Vector3(0, 1, 0)),
            endPos: targetPos,
            duration: 0.5,
            elapsed: 0,
            onComplete: () => {
                this.scene.remove(projectile);
                geom.dispose();
                mat.dispose();
                onComplete();
            },
            returnToStart: false,
            phase: 'forward',
        });
    }

    private easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
}
