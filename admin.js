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
const eventList = document.querySelector("#event-list");
const menuList = document.querySelector("#menu-list");
const menuSectionSelect = document.querySelector("#menu-section");
const siteForm = document.querySelector("#site-form");

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

  section.items.forEach((item, index) => {
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
    "address",
    "phone",
    "aiBookingPhone",
    "reservationEmail",
    "managerEmail",
    "bookingUrl",
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
};

const renderAll = () => {
  renderEvents();
  renderMenuSelect();
  renderMenu();
  renderSite();
};

openFolderButton.addEventListener("click", async () => {
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
  state.data.events.year = Number(document.querySelector("#events-year").value);
  state.data.events.month = Number(document.querySelector("#events-month").value);
  await Promise.all([writeJsonFile("events"), writeJsonFile("menu"), writeJsonFile("site")]);
  setStatus(`Saved ${new Date().toLocaleTimeString()}. Remember to git commit and push.`);
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
