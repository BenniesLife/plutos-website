# Pluto’s Family Bar

The website at **https://www.plutos.co.za/**. This repository serves the public site; `MichaelBernhardt/plutos-bar` is the separate legacy Ionic gate-control app.

The 2026 Halloween edition adapts the supplied “The Overgrowth” design with an editorial layout, an archival botanical print, the original Pluto’s logo, and the existing photograph of Tiaan. Event details are readable text, and the original invitation poster and silent film remain available to download.

## Preview and check

The website is plain HTML, CSS and JavaScript, with no runtime dependencies or compilation.

```sh
python3 -m http.server 4173
```

Open http://localhost:4173. To run the development checks (Node 22 and Python 3):

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run format:check
npm run stage
npm test
```

Browser checks cover Chromium, Firefox and mobile Safari: event information, image and download URLs, calendar time, responsive widths, mobile keyboard navigation, video loading and pause behaviour, no-JavaScript access, reduced motion and automated WCAG accessibility checks. These supplement visual review; they do not certify accessibility.

## Publishing

GitHub Pages uses **GitHub Actions** as its source. The workflow checks every pull request, then checks and deploys `main` after a merge. `npm run stage` copies only public website files into `_site`; the deployment does not contain development dependencies or tests. The original root image URLs remain available for existing links.

The `CNAME` and existing Pages custom domain are `www.plutos.co.za`. Preserve the existing DNS and HTTPS configuration. Both the domain and certificate are managed through the repository’s Pages settings.

To check an already published site:

```sh
SITE_URL=https://www.plutos.co.za npm test
```

## Content and assets

- `index.html`, `styles.css`, `script.js`: page content, design and progressive mobile navigation.
- `assets/plutos-halloween-2026.ics`: calendar invitation; 31 October 2026 at 16:00 SAST (14:00 UTC). No end time is invented.
- `assets/plutos-halloween-2026-poster.*`, `assets/plutos-halloween-2026.mp4`: original supplied invitation media. The video is silent and has no autoplay; the event information is also provided in HTML.
- `assets/plutos-logo.webp`, `assets/tiaan.webp`: optimized versions of the existing logo and real household photograph. The source images are retained in the repository root.
- `assets/fern.webp`: optimized public-domain botanical plate, **Polypodium vulgare**, from _The Ferns of Great Britain and Ireland_ (1857), by Thomas Moore, edited by John Lindley, nature-printed by Henry Bradbury. [Original scan and rights information on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Polypodium_vulgare_Moore1.png). The page credits the print. No generated photographs of the venue or residents are used.
- `assets/overgrowth-social.png`: a 1200 × 630 browser-rendered preview of the new design for social sharing. `assets/invitation-preview.webp` is the lightweight thumbnail for the original film.
- Typography: Italiana and DM Sans, served by Google Fonts with Georgia and Arial fallbacks.
- `robots.txt`, `sitemap.xml`: public search discovery. Inclusion in search results is controlled by search engines.

The original Downloads pack is kept untouched. The archived April 2026 Roomie of the Month is labelled with its date.
