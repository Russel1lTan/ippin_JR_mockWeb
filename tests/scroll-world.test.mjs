import test from "node:test";
import assert from "node:assert/strict";

import { clamp, getSceneState } from "../scroll-world.js";

test("clamp keeps values inside the requested range", () => {
  assert.equal(clamp(-0.4, 0, 1), 0);
  assert.equal(clamp(0.45, 0, 1), 0.45);
  assert.equal(clamp(1.4, 0, 1), 1);
});

test("the first scene is fully visible at the top", () => {
  const state = getSceneState(0, 3, 0.2);

  assert.equal(state.activeIndex, 0);
  assert.equal(state.localProgress, 0);
  assert.deepEqual(state.scenes.map((scene) => scene.opacity), [1, 0, 0]);
});

test("the timeline crossfades into the next scene near a boundary", () => {
  const state = getSceneState(0.3, 3, 0.2);

  assert.equal(state.activeIndex, 0);
  assert.ok(Math.abs(state.scenes[0].opacity - 0.5) < 0.0001);
  assert.ok(Math.abs(state.scenes[1].opacity - 0.5) < 0.0001);
});

test("the next scene becomes active immediately after its boundary", () => {
  const state = getSceneState(1 / 3, 3, 0.2);

  assert.equal(state.activeIndex, 1);
  assert.equal(state.localProgress, 0);
  assert.deepEqual(state.scenes.map((scene) => scene.opacity), [0, 1, 0]);
});

test("the last scene reaches full local progress at the bottom", () => {
  const state = getSceneState(1, 3, 0.2);

  assert.equal(state.activeIndex, 2);
  assert.equal(state.localProgress, 1);
  assert.deepEqual(state.scenes.map((scene) => scene.opacity), [0, 0, 1]);
});
