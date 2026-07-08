const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const loadMore = document.querySelector(".load-more");
const gallery = document.querySelector(".gallery-section");
const siteHeader = document.querySelector(".site-header");
const siteDefaults = {
  restaurantName: "IPPIN JAPANESE DINING",
  shortName: "IPPIN",
  copyrightYear: "2026",
  address: "The Garden Pavilion, West Village, Level 2/97 Boundary St, West End QLD 4101",
  phone: "1800 749 177 or 0432 111 287",
  aiBookingPhone: "0468 153 749",
  reservationEmail: "reservation@ippin-wv.com.au",
  managerEmail: "manager@ippin-wv.com.au",
  bookingUrl: "https://www.sevenrooms.com/explore/ippinjapanesedining/reservations/create/search/",
  findUsUrl: "about.html#contact-details",
  logoUrl:
    "https://static.wixstatic.com/media/0e0390_657064e383634f6a9622112d2a5b7fb5~mv2.png/v1/fill/w_588,h_240,al_c,q_95,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ippin_Wordmark_White.png",
  agfgVoteUrl: "https://www.agfg.com.au/restaurant/ippin-japanese-dining-118894",
  agfgVoteImage: "https://media1.agfg.com.au/images/links/voteforus-sq-140x80.png",
  footerCtas: {
    find: "FIND US EASILY | CLICK HERE",
    book: "\u3054\u4e88\u7d04\u306f\u3053\u3061\u3089 RESERVATION HERE",
  },
  serviceTimes: [
    { days: "Mon-Thu", hours: "11:00am-2:30pm | 5:00pm-10:00pm", lastOrders: "Kitchen last orders: 9:00pm" },
    { days: "Fri-Sat", hours: "11:00am-late", lastOrders: "Kitchen last orders: 9:30pm" },
    { days: "Sun", hours: "11:00am-9:00pm", lastOrders: "Kitchen last orders: 9:00pm" },
  ],
  footerLinks: [
    { label: "WHAT'S ON", href: "whatson.html" },
    { label: "FULL MENU", href: "menu.html" },
    { label: "FUNCTIONS", href: "functions.html" },
    { label: "CONTACT", href: "about.html#contact-details" },
    { label: "E-GIFT CARD", href: "gift-card.html" },
  ],
};
let bookingUrl = siteDefaults.bookingUrl;
let findUsUrl = siteDefaults.findUsUrl;
let logoUrl = siteDefaults.logoUrl;
let floatingFindLabel = siteDefaults.footerCtas.find;
let floatingBookLabel = siteDefaults.footerCtas.book;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const currentPage = window.location.pathname.split("/").pop() || "index.html";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeAttribute = escapeHtml;

const fetchJson = (path) =>
  fetch(`${path}?v=${Date.now()}`, { cache: "no-store" }).then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load ${path}`);
    }
    return response.json();
  });

const syncActiveLinks = () => {
  document.querySelectorAll(".site-nav a, .footer-bottom a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const linkPage = href.split("#")[0];

    link.removeAttribute("aria-current");
    if (linkPage === currentPage || (currentPage === "index.html" && linkPage === "")) {
      link.setAttribute("aria-current", "page");
    }
  });
};

const ensureFloatingCta = () => {
  const floatingCta = document.querySelector(".floating-cta") || document.createElement("div");
  floatingCta.className = "floating-cta";
  floatingCta.setAttribute("aria-label", "Quick actions");
  floatingCta.innerHTML = `
    <a class="floating-cta-find" href="${findUsUrl}">
      <span>FIND US EASILY | CLICK HERE</span>
      <span class="floating-cta-pin" aria-hidden="true"></span>
    </a>
    <a class="floating-cta-book" href="${bookingUrl}" target="_blank" rel="noreferrer">ご予約はこちら RESERVATION HERE</a>
  `;

  if (!floatingCta.isConnected) {
    document.body.append(floatingCta);
  }

  const findCtaText = floatingCta.querySelector(".floating-cta-find span:first-child");
  if (findCtaText) {
    findCtaText.textContent = floatingFindLabel;
  }

  const bookingCta = floatingCta.querySelector(".floating-cta-book");
  if (bookingCta) {
    bookingCta.textContent = floatingBookLabel;
  }
};

syncActiveLinks();

const syncHeaderState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 8);
};

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

menuToggle?.addEventListener("click", () => {
  const isOpen = siteNav?.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

loadMore?.addEventListener("click", () => {
  const expanded = gallery?.classList.toggle("is-expanded");
  loadMore.textContent = expanded ? "Show Less" : "Load More";
});

let menuTabs = document.querySelectorAll("[data-menu-tab]");
let menuPanels = document.querySelectorAll("[data-menu-panel]");
const menuTitle = document.querySelector("[data-menu-title]");
let menuLabels = {
  banquet: "Banquet Menu",
  alacarte: "A La Carte Menu",
  lunch: "Express Lunch Menu",
  vegetarian: "Vegetarian Option",
};

const refreshMenuRefs = () => {
  menuTabs = document.querySelectorAll("[data-menu-tab]");
  menuPanels = document.querySelectorAll("[data-menu-panel]");
};

const showMenuPanel = (panelName, updateHash = true) => {
  refreshMenuRefs();
  if (!menuPanels.length) {
    return;
  }

  const firstPanel = Object.keys(menuLabels)[0] || "banquet";
  const nextPanel = menuLabels[panelName] ? panelName : firstPanel;

  menuTabs.forEach((tab) => {
    const isActive = tab.dataset.menuTab === nextPanel;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  menuPanels.forEach((panel) => {
    const isActive = panel.dataset.menuPanel === nextPanel;
    panel.classList.toggle("is-active", isActive);
    panel.toggleAttribute("hidden", !isActive);
  });

  if (menuTitle) {
    menuTitle.textContent = menuLabels[nextPanel];
  }

  if (updateHash) {
    history.replaceState(null, "", `#${nextPanel}`);
  }
};

const bindMenuTabs = () => {
  refreshMenuRefs();
  menuTabs.forEach((tab) => {
    tab.setAttribute("role", "tab");
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      showMenuPanel(tab.dataset.menuTab);
    });
  });
};

const renderDishList = (courses = []) =>
  courses
    .map(
      (course) => `
        <div class="dish-item">
          <h3>${escapeHtml(course.name)}</h3>
          ${course.note ? `<p>${escapeHtml(course.note)}</p>` : ""}
        </div>
      `
    )
    .join("");

const renderCompactDish = (dish) => `
  <div class="compact-dish">
    <span>${escapeHtml(dish.name)}</span>
    ${dish.price ? `<em>${escapeHtml(dish.price)}</em>` : ""}
    ${dish.note ? `<p>${escapeHtml(dish.note)}</p>` : ""}
  </div>
`;

const renderMenuCategories = (categories = []) =>
  categories
    .map(
      (category) => `
        <section class="menu-category">
          <h3>${escapeHtml(category.title)}</h3>
          ${category.note ? `<p>${escapeHtml(category.note)}</p>` : ""}
          ${(category.dishes || []).map(renderCompactDish).join("")}
        </section>
      `
    )
    .join("");

const renderFeatureMenuBlock = (item, panelId, index = 0) => `
  <article ${index === 0 ? `id="${escapeAttribute(panelId)}"` : ""} class="menu-block" data-menu-panel="${escapeAttribute(panelId)}">
    <div class="menu-block-heading">
      ${item.eyebrow ? `<p class="eyebrow">${escapeHtml(item.eyebrow)}</p>` : ""}
      <h2>${escapeHtml(item.title)}</h2>
      ${item.price ? `<strong>${escapeHtml(item.price)}</strong>` : ""}
    </div>
    ${
      item.image
        ? `<figure class="menu-block-image">
            <img src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.imageAlt || item.title)}">
          </figure>`
        : ""
    }
    ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ""}
    ${item.courses?.length ? `<div class="dish-list">${renderDishList(item.courses)}</div>` : ""}
    ${
      item.pairing
        ? `<aside class="pairing-card">
            <h3>${escapeHtml(item.pairing.title)}</h3>
            ${(item.pairing.lines || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          </aside>`
        : ""
    }
  </article>
`;

const renderCompositeMenuBlock = (section) => {
  const mainItem = section.items?.[0];
  const isLarge = section.id === "alacarte";
  const headingTitle = mainItem?.title || section.label;
  const headingEyebrow = mainItem?.eyebrow || section.eyebrow || "";
  const headingPrice = mainItem?.price || "";
  const image = mainItem?.image || section.image;
  const imageAlt = mainItem?.imageAlt || section.imageAlt || headingTitle;
  const summary = mainItem?.summary || section.summary || "";

  return `
    <article id="${escapeAttribute(section.id)}" class="menu-block ${isLarge ? "menu-block-large" : ""}" data-menu-panel="${escapeAttribute(section.id)}">
      <div class="menu-block-heading">
        ${headingEyebrow ? `<p class="eyebrow">${escapeHtml(headingEyebrow)}</p>` : ""}
        <h2>${escapeHtml(headingTitle)}</h2>
        ${headingPrice ? `<strong>${escapeHtml(headingPrice)}</strong>` : ""}
      </div>
      ${
        image
          ? `<figure class="menu-block-image ${isLarge || section.categories?.length ? "menu-block-image-wide" : ""}">
              <img src="${escapeAttribute(image)}" alt="${escapeAttribute(imageAlt)}">
            </figure>`
          : ""
      }
      ${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
      ${
        section.highlights?.length
          ? `<div class="alacarte-highlights" aria-label="${escapeAttribute(section.label)} highlights">
              ${section.highlights.map((highlight) => `<span>${escapeHtml(highlight)}</span>`).join("")}
            </div>`
          : ""
      }
      ${mainItem?.courses?.length ? `<div class="dish-list">${renderDishList(mainItem.courses)}</div>` : ""}
      ${section.categories?.length ? `<div class="menu-category-grid">${renderMenuCategories(section.categories)}</div>` : ""}
    </article>
  `;
};

const renderMenuSection = (section) => {
  if (section.id === "banquet") {
    return (section.items || []).map((item, index) => renderFeatureMenuBlock(item, section.id, index)).join("");
  }
  return renderCompositeMenuBlock(section);
};

const renderMenuFromData = (menuData) => {
  const tabsContainer = document.querySelector(".menu-tabs");
  const menuList = document.querySelector(".menu-list");
  const menuHeadingEyebrow = document.querySelector(".menu-section-heading .eyebrow");
  const menuHeadingText = document.querySelector(".menu-section-heading p:last-child");
  const pageHero = document.querySelector(".page-hero");

  if (!tabsContainer || !menuList || !menuData?.sections?.length) {
    return;
  }

  menuLabels = Object.fromEntries(menuData.sections.map((section) => [section.id, section.label]));
  tabsContainer.innerHTML = menuData.sections
    .map(
      (section, index) =>
        `<a class="${index === 0 ? "is-active" : ""}" href="#${escapeAttribute(section.id)}" data-menu-tab="${escapeAttribute(section.id)}">${escapeHtml(section.label)}</a>`
    )
    .join("");
  menuList.innerHTML = menuData.sections.map(renderMenuSection).join("");

  if (menuHeadingEyebrow) {
    menuHeadingEyebrow.textContent = menuData.location || "Boundary Street";
  }
  if (menuHeadingText) {
    menuHeadingText.textContent = menuData.notice || "";
  }
  if (pageHero && menuData.hero) {
    const heroEyebrow = pageHero.querySelector(".eyebrow");
    const heroTitle = pageHero.querySelector("h1");
    const heroText = pageHero.querySelector(".page-hero-content p:last-child");
    const heroImage = pageHero.querySelector("img");
    if (heroEyebrow) heroEyebrow.textContent = menuData.hero.eyebrow || "";
    if (heroTitle) heroTitle.innerHTML = escapeHtml(menuData.hero.title || "FULL\nMENU").replace(/\n/g, "<br>");
    if (heroText) heroText.textContent = menuData.notice || "";
    if (heroImage && menuData.hero.image) {
      heroImage.src = menuData.hero.image;
      heroImage.alt = menuData.hero.imageAlt || "IPPIN menu";
    }
  }

  bindMenuTabs();
  const initialPanel = window.location.hash.replace("#", "") || menuData.sections[0].id;
  showMenuPanel(initialPanel, false);
};

bindMenuTabs();

if (menuPanels.length) {
  const initialPanel = window.location.hash.replace("#", "") || "banquet";
  showMenuPanel(initialPanel, false);
  fetchJson("data/menu.json").then(renderMenuFromData).catch(() => {});
}

const revealTargets = document.querySelectorAll(
  ".section, .content-section:not(.menu-section), .feature-band, .about-band, .gallery-section, .page-hero-content, .hero-panel, .booking-card, .content-card, .event-card, .calendar-panel, .review-card, .beverage-feature, .function-card, .room-card, .gift-award-grid article"
);

if (reduceMotion) {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
} else {
  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
}

const calendarEvent = document.querySelector(".calendar-event");
const calendarEventImage = document.querySelector(".calendar-event-image");
const calendarEventTitle = document.querySelector(".calendar-event h3");
const calendarEventDate = document.querySelector(".calendar-event-date");
const calendarEventDescription = document.querySelector(".calendar-event-description");
const calendarGrid = document.querySelector(".calendar-grid");
const calendarHeaderTitle = document.querySelector(".calendar-header h2");

const formatEventDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const activateCalendarDay = (day) => {
  document.querySelectorAll(".calendar-has-event").forEach((eventDay) => {
    eventDay.classList.toggle("is-active", eventDay === day);
    eventDay.setAttribute("aria-expanded", String(eventDay === day));
  });

  if (calendarEventImage && day.dataset.eventImage) {
    calendarEventImage.src = day.dataset.eventImage;
    calendarEventImage.alt = day.dataset.eventTitle || "";
  }

  if (calendarEventTitle && day.dataset.eventTitle) {
    calendarEventTitle.textContent = day.dataset.eventTitle;
  }

  if (calendarEventDate && day.dataset.eventDate) {
    calendarEventDate.textContent = day.dataset.eventDate;
  }

  if (calendarEventDescription && day.dataset.eventDescription) {
    calendarEventDescription.textContent = day.dataset.eventDescription;
  }

  calendarEvent?.classList.remove("is-highlighted");
  window.requestAnimationFrame(() => calendarEvent?.classList.add("is-highlighted", "is-expanded"));
};

const bindCalendarDays = () => {
  document.querySelectorAll(".calendar-has-event").forEach((day) => {
    day.setAttribute("aria-expanded", String(day.classList.contains("is-active")));
    day.addEventListener("click", () => activateCalendarDay(day));
    day.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateCalendarDay(day);
      }
    });
  });
};

const renderCalendarFromData = (calendarData) => {
  if (!calendarGrid || !calendarHeaderTitle || !calendarData?.year || !calendarData?.month) {
    return;
  }

  const monthIndex = Number(calendarData.month) - 1;
  const monthName = new Date(calendarData.year, monthIndex, 1).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(calendarData.year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(calendarData.year, monthIndex, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const eventMap = new Map((calendarData.events || []).map((eventItem) => [eventItem.date, eventItem]));

  calendarHeaderTitle.innerHTML = `<span aria-hidden="true">&#9638;</span> ${monthName}`;
  calendarGrid.innerHTML = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    .map((day) => `<span class="weekday" role="columnheader">${day}</span>`)
    .join("");

  for (let index = 0; index < mondayOffset; index += 1) {
    calendarGrid.insertAdjacentHTML("beforeend", '<span class="calendar-day calendar-empty" aria-hidden="true"></span>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${calendarData.year}-${String(calendarData.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const eventItem = eventMap.get(dateKey);
    if (eventItem) {
      const thumbnail = eventItem.thumbnail || eventItem.image;
      calendarGrid.insertAdjacentHTML(
        "beforeend",
        `<button class="calendar-day calendar-has-event" type="button" data-event-title="${escapeAttribute(eventItem.title)}" data-event-date="${escapeAttribute(formatEventDate(eventItem.date))}" data-event-description="${escapeAttribute(eventItem.description)}" data-event-image="${escapeAttribute(eventItem.image)}">
          <span>${day}</span>
          ${thumbnail ? `<img src="${escapeAttribute(thumbnail)}" alt="">` : ""}
        </button>`
      );
    } else {
      calendarGrid.insertAdjacentHTML("beforeend", `<span class="calendar-day">${day}</span>`);
    }
  }

  while ((calendarGrid.children.length - 7) % 7 !== 0) {
    calendarGrid.insertAdjacentHTML("beforeend", '<span class="calendar-day calendar-empty" aria-hidden="true"></span>');
  }

  const firstEventDay = calendarGrid.querySelector(".calendar-has-event");
  if (firstEventDay) {
    firstEventDay.classList.add("is-active");
    activateCalendarDay(firstEventDay);
  }
  bindCalendarDays();
};

if (calendarGrid) {
  fetch(`data/events.json?v=${Date.now()}`, { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("No events data"))))
    .then(renderCalendarFromData)
    .catch(bindCalendarDays);
}

if (!document.querySelector(".site-footer")) {
  const footer = document.createElement("footer");
  footer.id = "contact";
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-cta">
      <a href="${findUsUrl}">FIND US EASILY | CLICK HERE</a>
      <a href="${bookingUrl}" target="_blank" rel="noreferrer">ご予約はこちら Reservation Here</a>
    </div>
    <div class="footer-main">
      <div class="footer-brand">
        <h2>IPPIN JAPANESE DINING</h2>
        <img class="footer-brand-logo" src="${logoUrl}" alt="IPPIN">
        <a class="footer-agfg-vote" href="https://www.agfg.com.au/restaurant/ippin-japanese-dining-118894" target="_blank" rel="noreferrer" aria-label="Vote for IPPIN on AGFG">
          <img src="https://media1.agfg.com.au/images/links/voteforus-sq-140x80.png" alt="AGFG vote for us">
        </a>
      </div>
      <div>
        <p>Address: The Garden Pavilion, West Village, Level 2/97 Boundary St, West End QLD 4101</p>
        <p>1800 749 177 or 0432 111 287</p>
        <p>After hours? Try our AI booking assistant (Beta): 0468 153 749</p>
        <p>To book, please email <a href="mailto:reservation@ippin-wv.com.au">reservation@ippin-wv.com.au</a></p>
        <p>For general enquiries, hiring, please email <a href="mailto:manager@ippin-wv.com.au">manager@ippin-wv.com.au</a></p>
      </div>
      <div>
        <h3>Service Time:</h3>
        <p>Mon-Thu<br>11:00am-2:30pm | 5:00pm-10:00pm<br>Kitchen last orders: 9:00pm</p>
        <p>Fri-Sat<br>11:00am-late<br>Kitchen last orders: 9:30pm</p>
        <p>Sun<br>11:00am-9:00pm<br>Kitchen last orders: 9:00pm</p>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 by IPPIN JAPANESE DINING</span>
      <div>
        <a href="whatson.html">WHAT'S ON</a>
        <a href="menu.html">FULL MENU</a>
        <a href="functions.html">FUNCTIONS</a>
        <a href="about.html#contact-details">CONTACT</a>
        <a href="gift-card.html">E-GIFT CARD</a>
      </div>
    </div>
  `;
  document.body.append(footer);
  const generatedBookCta = footer.querySelector(".footer-cta a:last-child");
  if (generatedBookCta) {
    generatedBookCta.textContent = "\u3054\u4e88\u7d04\u306f\u3053\u3061\u3089 Reservation Here";
  }
}

ensureFloatingCta();
syncActiveLinks();

const renderFooterFromData = (site = siteDefaults) => {
  bookingUrl = site.bookingUrl || siteDefaults.bookingUrl;
  findUsUrl = site.findUsUrl || siteDefaults.findUsUrl;
  logoUrl = site.logoUrl || siteDefaults.logoUrl;
  floatingFindLabel = site.footerCtas?.find || siteDefaults.footerCtas.find;
  floatingBookLabel = site.footerCtas?.book || siteDefaults.footerCtas.book;

  const footer = document.querySelector(".site-footer") || document.createElement("footer");
  const serviceTimes = site.serviceTimes?.length ? site.serviceTimes : siteDefaults.serviceTimes;
  const footerLinks = site.footerLinks?.length ? site.footerLinks : siteDefaults.footerLinks;
  const footerCtas = { ...siteDefaults.footerCtas, ...(site.footerCtas || {}) };

  footer.id = "contact";
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-cta">
      <a href="${escapeAttribute(findUsUrl)}">${escapeHtml(footerCtas.find)}</a>
      <a href="${escapeAttribute(bookingUrl)}" target="_blank" rel="noreferrer">${escapeHtml(footerCtas.book)}</a>
    </div>
    <div class="footer-main">
      <div class="footer-brand">
        <h2>${escapeHtml(site.restaurantName || siteDefaults.restaurantName)}</h2>
        <img class="footer-brand-logo" src="${escapeAttribute(logoUrl)}" alt="${escapeAttribute(site.shortName || "IPPIN")}">
        <a class="footer-agfg-vote" href="${escapeAttribute(site.agfgVoteUrl || siteDefaults.agfgVoteUrl)}" target="_blank" rel="noreferrer" aria-label="Vote for IPPIN on AGFG">
          <img src="${escapeAttribute(site.agfgVoteImage || siteDefaults.agfgVoteImage)}" alt="AGFG vote for us">
        </a>
      </div>
      <div>
        <p>Address: ${escapeHtml(site.address || siteDefaults.address)}</p>
        <p>${escapeHtml(site.phone || siteDefaults.phone)}</p>
        <p>After hours? Try our AI booking assistant (Beta): ${escapeHtml(site.aiBookingPhone || siteDefaults.aiBookingPhone)}</p>
        <p>To book, please email <a href="mailto:${escapeAttribute(site.reservationEmail || siteDefaults.reservationEmail)}">${escapeHtml(site.reservationEmail || siteDefaults.reservationEmail)}</a></p>
        <p>For general enquiries, hiring, please email <a href="mailto:${escapeAttribute(site.managerEmail || siteDefaults.managerEmail)}">${escapeHtml(site.managerEmail || siteDefaults.managerEmail)}</a></p>
      </div>
      <div>
        <h3>Service Time:</h3>
        ${serviceTimes
          .map((time) => `<p>${escapeHtml(time.days)}<br>${escapeHtml(time.hours)}<br>${escapeHtml(time.lastOrders)}</p>`)
          .join("")}
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${escapeHtml(site.copyrightYear || siteDefaults.copyrightYear)} by ${escapeHtml(site.restaurantName || siteDefaults.restaurantName)}</span>
      <div>
        ${footerLinks.map((link) => `<a href="${escapeAttribute(link.href)}">${escapeHtml(link.label)}</a>`).join("")}
      </div>
    </div>
  `;

  if (!footer.isConnected) {
    document.body.append(footer);
  }

  ensureFloatingCta();
  syncActiveLinks();
};

renderFooterFromData(siteDefaults);
fetchJson("data/site.json").then(renderFooterFromData).catch(() => {});
