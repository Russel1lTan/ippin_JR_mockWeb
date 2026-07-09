const paths = {
  events: ["data", "events.json"],
  menu: ["data", "menu.json"],
  site: ["data", "site.json"],
};

const defaults = {
  events: { year: 2026, month: 7, events: [] },
  menu: { sections: [] },
  site: {
    restaurantName: "IPPIN JAPANESE DINING",
    address: "",
    phone: "",
    aiBookingPhone: "",
    reservationEmail: "",
    managerEmail: "",
    bookingUrl: "",
    serviceTimes: [],
    backgroundMusic: {
      enabled: false,
      title: "",
      audioUrl: "",
      volume: 0.35,
      loop: true,
    },
  },
};

const state = {
  folderHandle: null,
  fileHandles: {},
  data: structuredClone(defaults),
};

const statusEl = document.querySelector("#status");
const saveAllButton = document.querySelector("#save-all");
const openFolderButton = document.querySelector("#open-folder");
const publishOnlineButton = document.querySelector("#publish-online");
const eventList = document.querySelector("#event-list");
const menuList = document.querySelector("#menu-list");
const menuSectionSelect = document.querySelector("#menu-section");
const siteForm = document.querySelector("#site-form");

const isLocalMaintenanceServer =
  location.protocol.startsWith("http") && ["localhost", "127.0.0.1"].includes(location.hostname);
const localPreviewUrl = `${location.origin}/whatson.html`;

const setStatus = (message) => {
  statusEl.textContent = message;
};

const getNestedHandle = async (pathParts, create = false) => {
  let handle = state.folderHandle;
  for (let index = 0; index < pathParts.length; index += 1) {
    const part = pathParts[index];
    if (index === pathParts.length - 1) {
      return handle.getFileHandle(part, { create });
    }
    handle = await handle.getDirectoryHandle(part, { create });
  }
  return null;
};

const readJsonFile = async (key) => {
  try {
    const handle = await getNestedHandle(paths[key], true);
    state.fileHandles[key] = handle;
    const file = await handle.getFile();
    const text = await file.text();
    state.data[key] = text.trim() ? JSON.parse(text) : structuredClone(defaults[key]);
  } catch (error) {
    state.data[key] = structuredClone(defaults[key]);
    setStatus(`Created default ${paths[key].join("/")}`);
  }
};

const writeJsonFile = async (key) => {
  const handle = state.fileHandles[key] || (await getNestedHandle(paths[key], true));
  const writable = await handle.createWritable();
  await writable.write(`${JSON.stringify(state.data[key], null, 2)}\n`);
  await writable.close();
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
};

const collectFormState = () => {
  state.data.events.year = Number(document.querySelector("#events-year").value);
  state.data.events.month = Number(document.querySelector("#events-month").value);
};

const loadFromServer = async () => {
  const payload = await requestJson("/api/data");
  state.data.events = payload.events || structuredClone(defaults.events);
  state.data.menu = payload.menu || structuredClone(defaults.menu);
  state.data.site = payload.site || structuredClone(defaults.site);
  renderAll();
  saveAllButton.disabled = false;
  publishOnlineButton.disabled = false;
  openFolderButton.textContent = "Reload Local Data";
  setStatus(`Loaded through local maintenance server. Preview changed pages at ${localPreviewUrl}.`);
};

const saveToServer = async () => {
  collectFormState();
  await requestJson("/api/save", {
    method: "POST",
    body: JSON.stringify(state.data),
  });
  setStatus(`Saved locally at ${new Date().toLocaleTimeString()}. Preview at ${localPreviewUrl}, then publish online.`);
};

const updateObjectField = (object, field, value) => {
  object[field] = value;
};

const renderEvents = () => {
  document.querySelector("#events-year").value = state.data.events.year || new Date().getFullYear();
  document.querySelector("#events-month").value = state.data.events.month || new Date().getMonth() + 1;
  eventList.innerHTML = "";

  state.data.events.events.forEach((eventItem, index) => {
    const node = document.querySelector("#event-template").content.cloneNode(true);
    const card = node.querySelector(".editor-card");
    card.querySelector("[data-card-title]").textContent = eventItem.title || `Event ${index + 1}`;

    card.querySelectorAll("[data-field]").forEach((input) => {
      const field = input.dataset.field;
      input.value = eventItem[field] || "";
      input.addEventListener("input", () => {
        updateObjectField(eventItem, field, input.value);
        card.querySelector("[data-card-title]").textContent = eventItem.title || `Event ${index + 1}`;
      });
    });

    card.querySelector("[data-remove]").addEventListener("click", () => {
      state.data.events.events.splice(index, 1);
      renderEvents();
    });

    eventList.append(node);
  });
};

const courseTextFromArray = (courses = []) =>
  courses.map((course) => `${course.name || ""}${course.note ? ` | ${course.note}` : ""}`).join("\n");

const courseArrayFromText = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...noteParts] = line.split("|").map((part) => part.trim());
      return { name, note: noteParts.join(" | ") };
    });

const categoryTextFromArray = (categories = []) =>
  categories
    .map((category) => {
      const lines = [`# ${category.title || "Category"}`];
      if (category.note) {
        lines.push(`! ${category.note}`);
      }
      (category.dishes || []).forEach((dish) => {
        lines.push(`${dish.name || ""}${dish.price ? ` | ${dish.price}` : " | "}${dish.note ? ` | ${dish.note}` : ""}`);
      });
      return lines.join("\n");
    })
    .join("\n\n");

const categoryArrayFromText = (text) => {
  const categories = [];
  let currentCategory = null;

  text.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    if (line.startsWith("#")) {
      currentCategory = { title: line.replace(/^#+/, "").trim(), dishes: [] };
      categories.push(currentCategory);
      return;
    }

    if (!currentCategory) {
      currentCategory = { title: "Category", dishes: [] };
      categories.push(currentCategory);
    }

    if (line.startsWith("!")) {
      currentCategory.note = line.replace(/^!+/, "").trim();
      return;
    }

    const [name = "", price = "", ...noteParts] = line.split("|").map((part) => part.trim());
    currentCategory.dishes.push({ name, price, note: noteParts.join(" | ") });
  });

  return categories;
};

const activeMenuSection = () =>
  state.data.menu.sections.find((section) => section.id === menuSectionSelect.value) ||
  state.data.menu.sections[0];

const renderMenuSelect = () => {
  menuSectionSelect.innerHTML = "";
  state.data.menu.sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section.id;
    option.textContent = section.label;
    menuSectionSelect.append(option);
  });
};

const renderMenu = () => {
  const section = activeMenuSection();
  menuList.innerHTML = "";

  if (!section) {
    menuList.innerHTML = "<p>No menu section found. Add data to data/menu.json first.</p>";
    return;
  }

  const metaCard = document.createElement("article");
  metaCard.className = "editor-card";
  metaCard.innerHTML = `
    <div class="card-actions"><strong>Section Settings</strong></div>
    <div class="field-grid">
      <label>Label <input data-section-field="label" type="text"></label>
      <label>Eyebrow <input data-section-field="eyebrow" type="text"></label>
      <label class="full">Summary <textarea data-section-field="summary" rows="3"></textarea></label>
      <label class="full">Image URL <input data-section-field="image" type="url"></label>
      <label class="full">Highlights, comma separated <input data-section-field="highlightsText" type="text"></label>
      <label class="full">Categories<br><small># Category, ! note, then Dish | Price | Note</small><textarea data-section-field="categoriesText" rows="12"></textarea></label>
    </div>
  `;
  metaCard.querySelectorAll("[data-section-field]").forEach((input) => {
    const field = input.dataset.sectionField;
    if (field === "highlightsText") {
      input.value = (section.highlights || []).join(", ");
    } else if (field === "categoriesText") {
      input.value = categoryTextFromArray(section.categories);
    } else {
      input.value = section[field] || "";
    }
    input.addEventListener("input", () => {
      if (field === "highlightsText") {
        section.highlights = input.value.split(",").map((item) => item.trim()).filter(Boolean);
      } else if (field === "categoriesText") {
        section.categories = categoryArrayFromText(input.value);
      } else {
        section[field] = input.value;
      }
      renderMenuSelect();
      menuSectionSelect.value = section.id;
    });
  });
  menuList.append(metaCard);

  (section.items || []).forEach((item, index) => {
    const node = document.querySelector("#menu-template").content.cloneNode(true);
    const card = node.querySelector(".editor-card");
    card.querySelector("[data-card-title]").textContent = item.title || `Menu item ${index + 1}`;

    card.querySelectorAll("[data-field]").forEach((input) => {
      const field = input.dataset.field;
      input.value = field === "coursesText" ? courseTextFromArray(item.courses) : item[field] || "";
      input.addEventListener("input", () => {
        if (field === "coursesText") {
          item.courses = courseArrayFromText(input.value);
        } else {
          updateObjectField(item, field, input.value);
        }
        card.querySelector("[data-card-title]").textContent = item.title || `Menu item ${index + 1}`;
      });
    });

    card.querySelector("[data-remove]").addEventListener("click", () => {
      section.items.splice(index, 1);
      renderMenu();
    });

    menuList.append(node);
  });
};

const renderSite = () => {
  siteForm.innerHTML = "";
  const fields = [
    "restaurantName",
    "shortName",
    "copyrightYear",
    "address",
    "phone",
    "aiBookingPhone",
    "reservationEmail",
    "managerEmail",
    "bookingUrl",
    "findUsUrl",
    "logoUrl",
    "agfgVoteUrl",
    "agfgVoteImage",
  ];

  fields.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = field.replace(/([A-Z])/g, " $1");
    const input = document.createElement("input");
    input.value = state.data.site[field] || "";
    input.addEventListener("input", () => {
      state.data.site[field] = input.value;
    });
    label.append(input);
    siteForm.append(label);
  });

  const serviceTimes = document.createElement("label");
  serviceTimes.className = "full";
  serviceTimes.textContent = "Service Times, one per line";
  const textarea = document.createElement("textarea");
  textarea.rows = 7;
  textarea.value = (state.data.site.serviceTimes || [])
    .map((time) => `${time.days} | ${time.hours} | ${time.lastOrders}`)
    .join("\n");
  textarea.addEventListener("input", () => {
    state.data.site.serviceTimes = textarea.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [days = "", hours = "", lastOrders = ""] = line.split("|").map((part) => part.trim());
        return { days, hours, lastOrders };
      });
  });
  serviceTimes.append(textarea);
  siteForm.append(serviceTimes);

  const ctas = document.createElement("label");
  ctas.className = "full";
  ctas.textContent = "Footer CTAs";
  const ctaTextarea = document.createElement("textarea");
  ctaTextarea.rows = 3;
  ctaTextarea.value = `${state.data.site.footerCtas?.find || ""}\n${state.data.site.footerCtas?.book || ""}`;
  ctaTextarea.addEventListener("input", () => {
    const [find = "", book = ""] = ctaTextarea.value.split("\n");
    state.data.site.footerCtas = { find: find.trim(), book: book.trim() };
  });
  ctas.append(ctaTextarea);
  siteForm.append(ctas);

  const music = {
    enabled: false,
    title: "",
    audioUrl: "",
    volume: 0.35,
    loop: true,
    ...(state.data.site.backgroundMusic || {}),
  };
  state.data.site.backgroundMusic = music;

  const musicPanel = document.createElement("fieldset");
  musicPanel.className = "admin-subpanel full";
  musicPanel.innerHTML = `
    <legend>Background Music</legend>
    <label class="checkbox-label"><input data-music-field="enabled" type="checkbox"> Enable background music</label>
    <label>Track Title <input data-music-field="title" type="text" placeholder="Aruarian Dance - Nujabes"></label>
    <label class="full">Audio URL <input data-music-field="audioUrl" type="url" placeholder="Use a licensed .mp3 or .ogg URL"></label>
    <label>Volume <input data-music-field="volume" type="number" min="0" max="1" step="0.05"></label>
    <label class="checkbox-label"><input data-music-field="loop" type="checkbox"> Loop track</label>
    <p class="field-note full">Use only music you own or have permission to stream. Browser autoplay is blocked, so visitors start music with the Music button.</p>
  `;

  musicPanel.querySelectorAll("[data-music-field]").forEach((input) => {
    const field = input.dataset.musicField;
    if (input.type === "checkbox") {
      input.checked = Boolean(music[field]);
    } else {
      input.value = music[field] ?? "";
    }
    input.addEventListener("input", () => {
      if (input.type === "checkbox") {
        music[field] = input.checked;
      } else if (field === "volume") {
        music[field] = Number(input.value);
      } else {
        music[field] = input.value;
      }
    });
  });
  siteForm.append(musicPanel);
};

const renderAll = () => {
  renderEvents();
  renderMenuSelect();
  renderMenu();
  renderSite();
};

openFolderButton.addEventListener("click", async () => {
  if (isLocalMaintenanceServer) {
    try {
      await loadFromServer();
    } catch (error) {
      setStatus(`Could not load local data: ${error.message}`);
    }
    return;
  }

  if (!window.showDirectoryPicker) {
    setStatus("Your browser does not support folder editing. Use Chrome or Edge.");
    return;
  }

  state.folderHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  await Promise.all([readJsonFile("events"), readJsonFile("menu"), readJsonFile("site")]);
  renderAll();
  saveAllButton.disabled = false;
  setStatus("Loaded data files. Edit and click Save All Data.");
});

saveAllButton.addEventListener("click", async () => {
  if (isLocalMaintenanceServer) {
    try {
      await saveToServer();
    } catch (error) {
      setStatus(`Save failed: ${error.message}`);
    }
    return;
  }

  collectFormState();
  await Promise.all([writeJsonFile("events"), writeJsonFile("menu"), writeJsonFile("site")]);
  setStatus(`Saved locally at ${new Date().toLocaleTimeString()}. To publish: git add data && git commit && git push.`);
});

publishOnlineButton.addEventListener("click", async () => {
  if (!isLocalMaintenanceServer) {
    setStatus("Publishing is available when admin.html is opened through npm run admin.");
    return;
  }

  publishOnlineButton.disabled = true;
  saveAllButton.disabled = true;
  setStatus("Saving and publishing to GitHub Pages...");

  try {
    await saveToServer();
    const payload = await requestJson("/api/publish", { method: "POST" });
    setStatus(payload.message || "Published online. GitHub Pages may take a minute to refresh.");
  } catch (error) {
    setStatus(`Publish failed: ${error.message}`);
  } finally {
    publishOnlineButton.disabled = false;
    saveAllButton.disabled = false;
  }
});

document.querySelector("#add-event").addEventListener("click", () => {
  state.data.events.events.push({
    date: "",
    title: "New Event",
    description: "",
    image: "",
    thumbnail: "",
  });
  renderEvents();
});

document.querySelector("#add-menu-item").addEventListener("click", () => {
  const section = activeMenuSection();
  if (!section) return;
  if (!section.items) {
    section.items = [];
  }
  section.items.push({
    title: "New Menu Item",
    price: "",
    eyebrow: "",
    summary: "",
    image: "",
    courses: [],
  });
  renderMenu();
});

menuSectionSelect.addEventListener("change", renderMenu);

document.querySelectorAll("[data-admin-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-admin-tab]").forEach((item) => {
      item.classList.toggle("is-active", item === tab);
    });
    document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.adminPanel === tab.dataset.adminTab);
    });
  });
});

if (isLocalMaintenanceServer) {
  loadFromServer().catch((error) => {
    setStatus(`Local server detected, but data could not load: ${error.message}`);
  });
}
