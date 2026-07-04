const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const loadMore = document.querySelector(".load-more");
const gallery = document.querySelector(".gallery-section");
const siteHeader = document.querySelector(".site-header");
const bookingUrl = "https://www.sevenrooms.com/explore/ippinjapanesedining/reservations/create/search/";
const findUsUrl = "about.html#contact-details";
const logoUrl = "https://static.wixstatic.com/media/0e0390_657064e383634f6a9622112d2a5b7fb5~mv2.png/v1/fill/w_588,h_240,al_c,q_95,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ippin_Wordmark_White.png";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const currentPage = window.location.pathname.split("/").pop() || "index.html";

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

const revealTargets = document.querySelectorAll(
  ".section, .content-section, .feature-band, .about-band, .gallery-section, .page-hero-content, .hero-panel, .booking-card, .content-card, .menu-block, .event-card, .calendar-panel, .review-card, .beverage-feature, .function-card, .room-card, .gift-award-grid article, .dish-item, .compact-dish"
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

document.querySelectorAll(".calendar-has-event").forEach((day) => {
  day.setAttribute("aria-expanded", String(day.classList.contains("is-active")));
  const activateDay = () => {
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

  day.addEventListener("click", activateDay);
  day.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateDay();
    }
  });
});

if (!reduceMotion) {
  const hero = document.querySelector(".hero");
  hero?.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    hero.querySelectorAll(".hero-panel img").forEach((image, index) => {
      const depth = (index + 1) * 5;
      image.style.transform = `scale(1.05) translate(${x * depth}px, ${y * depth}px)`;
    });
  });

  hero?.addEventListener("pointerleave", () => {
    hero.querySelectorAll(".hero-panel img").forEach((image) => {
      image.style.transform = "";
    });
  });
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
}

ensureFloatingCta();
syncActiveLinks();
