# IPPIN Scroll World Experiment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a separate no-cost, three-scene scroll-world prototype using IPPIN's existing visual assets.

**Architecture:** A standalone HTML page mounts a small vanilla JavaScript scroll controller. Pure timeline helpers calculate active scene, local progress, and opacity; CSS consumes those values to create full-screen parallax and crossfades.

**Tech Stack:** Semantic HTML, CSS custom properties, ES modules, Node built-in test runner.

## Global Constraints

- Do not modify or replace the existing public pages.
- Do not add runtime dependencies.
- Use only existing IPPIN imagery and artwork.
- Respect `prefers-reduced-motion` and mobile safe areas.

---

### Task 1: Scroll Timeline

**Files:**
- Create: `tests/scroll-world.test.mjs`
- Create: `scroll-world.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `clamp(value, min, max)`, `getSceneState(progress, sceneCount, overlap)`, and `mountScrollWorld(root, config)`.

- [ ] Write tests asserting boundary clamping, active scene selection, local progress, and crossfade opacity.
- [ ] Run `npm test` and verify failure because `scroll-world.js` is absent.
- [ ] Implement the pure timeline functions and browser mount function.
- [ ] Run `npm test` and verify all tests pass.

### Task 2: Standalone Experience

**Files:**
- Create: `scroll-world.html`
- Create: `scroll-world.css`

**Interfaces:**
- Consumes: `mountScrollWorld(root, config)` from Task 1.
- Produces: a static-server-compatible experiment at `/scroll-world.html`.

- [ ] Build semantic scene markup and no-JavaScript fallback copy.
- [ ] Add three IPPIN scene configurations with existing image URLs and real navigation targets.
- [ ] Implement full-screen layered photography, route rail, progress, copy, CTA, mobile layout, and reduced-motion styling.
- [ ] Validate HTML structure and run `npm test`.

### Task 3: Browser Verification

**Files:**
- Modify only files from Tasks 1-2 if verification finds defects.

**Interfaces:**
- Consumes: `/scroll-world.html` from Task 2.
- Produces: verified desktop and mobile render behavior.

- [ ] Start the existing static maintenance server.
- [ ] Verify initial, middle, and final scroll positions in a browser.
- [ ] Capture desktop and mobile screenshots and inspect them for clipping, blank media, unreadable copy, and CTA overlap.
- [x] Run `npm test`, inspect `git diff --check`, and commit the experiment on `codex/scroll-world-experiment`.
