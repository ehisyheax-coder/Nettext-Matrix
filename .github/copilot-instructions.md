# GitHub Copilot Instructions – NETTEXT PRO

## Project Overview
- Name: NETTEXT PRO v5.1
- Type: Single-file web app (HTML/CSS/JS)
- Purpose: Convert uploaded images into ASCII/Matrix‑style digital art with real‑time wave, glow, and chromatic effects.
- No external dependencies – pure vanilla JavaScript, Canvas API.

## Tech Stack
- ES6+ JavaScript
- HTML5 / CSS3 (CSS variables, Grid/Flex, animations)
- Canvas 2D Context
- RequestAnimationFrame for animation loop

## Current Code Structure
All code resides inside `index.html`:
- `<style>` block: UI styling, dark theme, toast notifications, overlay, responsive design.
- `<script>` block: everything from image upload, resizing (max 1024px), edge detection (Sobel), foreground mask (saliency + distance), grid generation, frequency/phase calculation, contrast stretching, background rendering (rain / noise), and character drawing with wave & glow.

## Key Functions (for Copilot to understand)
- `loadImage()` – handles file upload, auto‑resize to max 1024px (anti‑crash on mobile).
- `computeEdgeMap()` – Sobel operator, returns Float32Array.
- `computeForegroundMask()` – combines edge, color saliency, and center bias.
- `computeLocalFreqPhase()` – safe against division by zero / index out of bounds.
- `generateGrid()` – main pipeline: edge map → mask → freq/phase → grid cell properties → contrast stretch → character assignment.
- `drawForeground()` – renders text cells with wave offset, rotation, chromatic aberration, and glow shadow.
- `renderBackgroundDynamic()` – draws Matrix Rain or Perlin noise.
- `updateMovingForeground()` – randomly mutates characters on edge cells every few frames.
- `renderFull()` – combines background + foreground + optional mask overlay.

## Priority Upgrade Areas (when asked)
1. **Performance** – For grids larger than 60x60, implement dirty rectangle or throttling. OffscreenCanvas for backgrounds.
2. **Modularization** – Split into ES6 modules: `imageProcessor.js`, `gridGenerator.js`, `effects.js`, `ui.js`, `main.js`. Keep functionality identical.
3. **Mobile enhancements** – Add touch gestures for zoom/rotate original image before processing. Improve touch event handling on canvas.
4. **Preset system** – Save/load all slider and select values to/from `localStorage`. Provide a "Reset" button.
5. **Bug fixes** – Prevent any remaining `NaN` in contrast stretch when `maxB === minB`. Guard against tiny images (width<2 or height<2).
6. **Testing** – Simple unit tests (e.g., with Playwright) for `computeEdgeMap`, `computeForegroundMask`, `generateGrid`.
7. **PWA** – Add `manifest.json` and service worker for installability on mobile devices.

## Coding Guidelines
- Use `const` and `let`, avoid `var`.
- Add JSDoc comments for any new or modified functions.
- Maintain the existing visual style and behavior unless explicitly asked to change.
- When splitting files, ensure the app still works without a build step (direct `<script>` imports with type="module").
- For significant changes, always open a Pull Request first – do not commit directly to `main`.

## Environment
- The app is served via GitHub Pages from the root: `https://ehisyex-coder.github.io/Nettext-Matrix-/`
- Also runs locally by opening `index.html` in any modern browser.

Thank you for helping improve NETTEXT PRO!
