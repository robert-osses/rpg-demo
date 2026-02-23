import * as THREE from 'three';
import { EnvironmentBuilder } from './EnvironmentBuilder';

export class SceneManager {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    private animationFrameId: number | null = null;
    private renderCallbacks: Array<() => void> = [];
    private envObjects: THREE.Object3D[] = [];

    constructor(canvas: HTMLCanvasElement, width: number, height: number, backgroundType: string = 'forest') {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 8, 14);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false,
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Build themed environment
        this.envObjects = EnvironmentBuilder.build(this.scene, backgroundType);
    }

    addRenderCallback(cb: () => void): void {
        this.renderCallbacks.push(cb);
    }

    start(): void {
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);
            for (const cb of this.renderCallbacks) {
                cb();
            }
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.renderer.dispose();
        this.scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                if (Array.isArray(obj.material)) {
                    obj.material.forEach((m) => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
    }
}
