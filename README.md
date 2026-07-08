# IPPIN website replica

Static HTML/CSS/JavaScript replica of the IPPIN Japanese Dining website for local iteration and future improvements.

Open `index.html` directly in a browser to view it. The replica uses remote Wix image URLs where the live site serves images, and stores large official PDF menus locally in `assets/`.

## Maintenance Panel

Open `admin.html` in Chrome or Edge to edit daily content without touching the page HTML.

1. Click `Open Website Folder`.
2. Choose this project folder: `C:\Users\11vac\Desktop\IPPIN`.
3. Edit events, menu data, or site information.
4. Click `Save All Data`.
5. Commit and push the changed JSON files.

Editable data files:

- `data/events.json` - drives the What's On calendar on `whatson.html`.
- `data/menu.json` - drives the Full Menu tabs, menu items, categories and dish lists on `menu.html`.
- `data/site.json` - drives shared footer contact details, service times, AGFG badge data and floating CTA links.

Chrome may ask for folder permission because the editor writes directly to local files. This is expected.

## Pages

- `index.html` - homepage with hero panels, booking options, gallery, contact footer and real Virtual Tour / SevenRooms links.
- `whatson.html` - What's On page with event sections and the July 2026 calendar table.
- `menu.html` - full menu page covering Banquet, A La Carte, Express Lunch and Vegetarian Option states.
- `bottomless.html` - Bottomless Lunch page.
- `beverage.html` - Beverage Menu page with official Wine & Sake List PDF embedded from `assets/beverage-menu.pdf`.
- `functions.html` - Functions page with seating, rooms, canapes and official Function Pack PDF embedded from `assets/function-pack.pdf`.
- `about.html` - About / Contact page based on the live `japanese-restaurant-brisbane` route.
- `gift-card.html` - E-Gift Card page with real Square order and balance links.
- `admin.html` - local maintenance panel for events, menu data and daily site information.

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
