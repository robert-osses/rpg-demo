---
name: threejs-renderer-setup
description: Instructions for integrating Three.js rendering within React for Antigravity battle scenes.
---

## Step-by-step
1. Create canvas element as React ref.
2. Initialize Three.js scene, camera, and lights.
3. Build animation loop using `requestAnimationFrame`.
4. On component unmount, dispose of geometry and textures.
5. Keep rendering logic decoupled from game state logic.

## Best Practices
- Use an offscreen canvas for pre-rendering complex assets.
- Optimize texture sizes for browser performance.