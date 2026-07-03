const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const loadMore = document.querySelector(".load-more");
const gallery = document.querySelector(".gallery-section");
const bookingUrl = "https://www.sevenrooms.com/explore/ippinjapanesedining/reservations/create/search/";
const logoUrl = "https://static.wixstatic.com/media/0e0390_657064e383634f6a9622112d2a5b7fb5~mv2.png/v1/fill/w_294,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ippin_Wordmark_White.png";

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".site-nav a, .footer-bottom a").forEach((link) => {
  const href = link.getAttribute("href") || "";
  const linkPage = href.split("#")[0];

  if (linkPage === currentPage || (currentPage === "index.html" && linkPage === "")) {
    link.setAttribute("aria-current", "page");
  }
});

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

if (!document.querySelector(".site-footer")) {
  const footer = document.createElement("footer");
  footer.id = "contact";
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="footer-cta">
      <a href="about.html#contact-details">FIND US EASILY | CLICK HERE</a>
      <a href="${bookingUrl}" target="_blank" rel="noreferrer">Reservation Here</a>
    </div>
    <div class="footer-main">
      <img src="${logoUrl}" alt="IPPIN">
      <div>
        <h2>IPPIN JAPANESE DINING</h2>
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
