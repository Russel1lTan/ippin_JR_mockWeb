# IPPIN website replica

Static HTML/CSS/JavaScript replica of the IPPIN Japanese Dining website for local iteration and future improvements.

Open `index.html` directly in a browser to view it. The replica uses remote Wix image URLs where the live site serves images, and stores large official PDF menus locally in `assets/`.

## Pages

- `index.html` - homepage with hero panels, booking options, gallery, contact footer and real Virtual Tour / SevenRooms links.
- `whatson.html` - What's On page with event sections and the July 2026 calendar table.
- `menu.html` - full menu page covering Banquet, A La Carte, Express Lunch and Vegetarian Option states.
- `bottomless.html` - Bottomless Lunch page.
- `beverage.html` - Beverage Menu page with official Wine & Sake List PDF embedded from `assets/beverage-menu.pdf`.
- `functions.html` - Functions page with seating, rooms, canapes and official Function Pack PDF embedded from `assets/function-pack.pdf`.
- `about.html` - About / Contact page based on the live `japanese-restaurant-brisbane` route.
- `gift-card.html` - E-Gift Card page with real Square order and balance links.

## Local Assets

- `assets/beverage-menu.pdf`
- `assets/function-pack.pdf`

Temporary PDF extraction files are ignored under `tmp/`.

## GitHub

Remote repository:

- https://github.com/Russel1lTan/ippin_JR_mockWeb.git

## Next Improvements

- Visually compare each local page against desktop and mobile screenshots from the live site.
- Replace remote Wix image URLs with owned local image files if IPPIN supplies originals.
- Consider extracting repeated navigation/footer markup into a build step if this grows beyond static HTML.
- Add deployment instructions once a GitHub repository or hosting target is chosen.
