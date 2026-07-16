export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getSceneState(progress, sceneCount, overlap = 0.18) {
  const count = Math.max(1, Math.floor(sceneCount));
  const normalized = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
  const safeOverlap = clamp(overlap, 0.01, 0.49);
  const scaled = normalized === 1 ? count : normalized * count;
  const activeIndex = normalized === 1
    ? count - 1
    : Math.min(count - 1, Math.floor(scaled));
  const localProgress = normalized === 1 ? 1 : scaled - activeIndex;
  const scenes = Array.from({ length: count }, (_, index) => ({
    index,
    opacity: index === activeIndex ? 1 : 0,
    progress: index < activeIndex ? 1 : index === activeIndex ? localProgress : 0,
  }));

  if (activeIndex < count - 1 && localProgress > 1 - safeOverlap) {
    const blend = (localProgress - (1 - safeOverlap)) / safeOverlap;
    scenes[activeIndex].opacity = 1 - blend;
    scenes[activeIndex + 1].opacity = blend;
  }

  return { activeIndex, localProgress, scenes };
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createScene(scene, index) {
  const article = createElement("article", "sw-scene");
  article.dataset.scene = String(index);
  article.setAttribute("aria-label", scene.label);

  const backdrop = createElement("div", "sw-scene__backdrop");
  backdrop.style.backgroundImage = `url("${scene.image}")`;
  backdrop.style.backgroundPosition = scene.position || "center";
  const media = createElement("figure", "sw-scene__media");
  const image = createElement("img");
  image.src = scene.image;
  image.alt = scene.imageAlt;
  image.style.objectPosition = scene.position || "center";
  media.appendChild(image);

  const shade = createElement("div", "sw-scene__shade");
  const copy = createElement("div", "sw-scene__copy");
  copy.appendChild(createElement("p", "sw-scene__eyebrow", scene.eyebrow));
  copy.appendChild(createElement("h2", "sw-scene__title", scene.title));
  copy.appendChild(createElement("p", "sw-scene__body", scene.body));

  if (scene.tags?.length) {
    const tags = createElement("ul", "sw-scene__tags");
    scene.tags.forEach((tag) => {
      const item = createElement("li", "", tag);
      tags.appendChild(item);
    });
    copy.appendChild(tags);
  }

  if (scene.cta) {
    const actions = createElement("div", "sw-scene__actions");
    Object.values(scene.cta).forEach((action, actionIndex) => {
      const link = createElement("a", actionIndex ? "sw-button sw-button--ghost" : "sw-button", action.label);
      link.href = action.href;
      if (action.external) {
        link.target = "_blank";
        link.rel = "noreferrer";
      }
      actions.appendChild(link);
    });
    copy.appendChild(actions);
  }

  if (scene.awardImage) {
    const award = createElement("img", "sw-scene__award");
    award.src = scene.awardImage;
    award.alt = scene.awardAlt || "";
    article.appendChild(award);
  }

  article.append(backdrop, media, shade, copy);
  return article;
}

export function mountScrollWorld(root, config) {
  if (!root || !config?.scenes?.length || typeof document === "undefined") return null;

  const scenes = config.scenes;
  root.classList.add("sw-world");
  root.style.setProperty("--scene-count", scenes.length);

  const stage = createElement("div", "sw-stage");
  const topbar = createElement("header", "sw-topbar");
  const home = createElement("a", "sw-brand");
  home.href = config.brand.href;
  const logo = createElement("img");
  logo.src = config.brand.logo;
  logo.alt = config.brand.name;
  home.appendChild(logo);
  const exit = createElement("a", "sw-exit", "Original site");
  exit.href = config.exit.href;
  topbar.append(home, exit);

  const sceneLayer = createElement("div", "sw-scenes");
  const sceneElements = scenes.map((scene, index) => createScene(scene, index));
  sceneLayer.append(...sceneElements);

  const route = createElement("nav", "sw-route");
  route.setAttribute("aria-label", "Scroll world scenes");
  const routeButtons = scenes.map((scene, index) => {
    const button = createElement("button", "sw-route__item");
    button.type = "button";
    button.setAttribute("aria-label", `Go to ${scene.label}`);
    button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><b>${scene.label}</b>`;
    route.appendChild(button);
    return button;
  });

  const progress = createElement("div", "sw-progress");
  const progressBar = createElement("span");
  progress.appendChild(progressBar);
  const hint = createElement("p", "sw-hint", "Scroll to enter");
  stage.append(topbar, sceneLayer, route, progress, hint);
  root.replaceChildren(stage);

  let frame = 0;
  let activeIndex = -1;

  function render() {
    frame = 0;
    const bounds = root.getBoundingClientRect();
    const distance = Math.max(1, root.offsetHeight - window.innerHeight);
    const normalized = clamp(-bounds.top / distance, 0, 1);
    const state = getSceneState(normalized, scenes.length, config.overlap);

    sceneElements.forEach((element, index) => {
      const sceneState = state.scenes[index];
      const cameraProgress = sceneState.progress;
      element.style.opacity = sceneState.opacity.toFixed(4);
      element.style.setProperty("--camera-scale", (1.02 + cameraProgress * 0.1).toFixed(4));
      element.style.setProperty("--camera-x", `${(cameraProgress - 0.5) * -3.5}%`);
      element.style.setProperty("--camera-y", `${(cameraProgress - 0.5) * -2.2}%`);
      element.style.setProperty("--copy-shift", `${(1 - sceneState.opacity) * 28}px`);
      element.setAttribute("aria-hidden", sceneState.opacity < 0.05 ? "true" : "false");
    });

    if (activeIndex !== state.activeIndex) {
      activeIndex = state.activeIndex;
      routeButtons.forEach((button, index) => {
        const current = index === activeIndex;
        button.classList.toggle("is-active", current);
        button.setAttribute("aria-current", current ? "step" : "false");
      });
    }

    progressBar.style.transform = `scaleX(${normalized})`;
    hint.classList.toggle("is-hidden", normalized > 0.04);
  }

  function requestRender() {
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  routeButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const distance = root.offsetHeight - window.innerHeight;
      const targetProgress = index === scenes.length - 1
        ? 1
        : (index + 0.08) / scenes.length;
      window.scrollTo({
        top: root.offsetTop + distance * targetProgress,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
  });

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
  render();

  return {
    destroy() {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      if (frame) window.cancelAnimationFrame(frame);
    },
  };
}
