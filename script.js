const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const loadMore = document.querySelector(".load-more");
const gallery = document.querySelector(".gallery-section");

menuToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

loadMore?.addEventListener("click", () => {
  const expanded = gallery.classList.toggle("is-expanded");
  loadMore.textContent = expanded ? "Show Less" : "Load More";
});
