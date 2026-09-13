# Pluto’s Family Bar

The website at **https://www.plutos.co.za/**. This repository serves the public site; `MichaelBernhardt/plutos-bar` is the separate legacy Ionic gate-control app.

The 2026 Halloween edition adapts the supplied “The Overgrowth” design with a dark botanical-horror layout, a cinematic greenhouse background, a seasonal edition of the new Pluto’s logo, and real photographs of Slate “Pointy” and Tiaan. Event details are readable text, and the actual supplied invitation poster is displayed prominently on the page. It and the silent film remain available to download.

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

Browser checks cover Chromium, Firefox and mobile Safari: event information, image and download URLs, calendar time, responsive widths, mobile keyboard navigation, invitation video loading, background playback and pause controls, hidden-tab suspension, autoplay fallbacks, data saver, no-JavaScript access, reduced motion and automated WCAG accessibility checks. These supplement visual review; they do not certify accessibility.

## Publishing

GitHub Pages uses **GitHub Actions** as its source. The workflow checks every pull request, then checks and deploys `main` after a merge. `npm run stage` copies only public website files into `_site`; the deployment does not contain development dependencies or tests. The original root image URLs remain available for existing links.

The `CNAME` and existing Pages custom domain are `www.plutos.co.za`. Preserve the existing DNS and HTTPS configuration. Both the domain and certificate are managed through the repository’s Pages settings.

To check an already published site:

```sh
SITE_URL=https://www.plutos.co.za npm test
```

## Content and assets

- `index.html`, `styles.css`, `script.js`, `atmosphere.js`: page content, design and progressive mobile navigation.
- `assets/plutos-halloween-2026.ics`: calendar invitation; 31 October 2026 at 16:00 SAST (14:00 UTC). No end time is invented.
- `assets/plutos-halloween-2026-poster.*`, `assets/plutos-halloween-2026.mp4`: original supplied invitation media. The video is silent and has no autoplay; the event information is also provided in HTML.
- `assets/plutos-logo-2026-original.png`: the new approved master logo, preserved unchanged. `assets/plutos-logo-2026.webp` is the normal web version. `assets/plutos-logo-halloween-2026.webp` is the temporary Halloween edition, created with ChatGPT image generation. See [brand guidance and prompt](assets/README.md). `assets/tiaan.webp` is the optimized real household photograph.
- `assets/fern.webp`: retained artwork from the earlier design (not displayed in the Halloween theme), an optimized public-domain botanical plate, **Polypodium vulgare**, from _The Ferns of Great Britain and Ireland_ (1857), by Thomas Moore, edited by John Lindley, nature-printed by Henry Bradbury. [Original scan and rights information on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Polypodium_vulgare_Moore1.png). Attribution is retained here. No generated photographs of the venue or residents are used.
- `assets/overgrowth-invitation-social.png`: a 1200 × 630 browser-rendered preview of the new design for social sharing. `assets/invitation-preview.webp` is the lightweight thumbnail for the original film.
- Typography: Cormorant Garamond and DM Sans, served by Google Fonts with Georgia and Arial fallbacks.
- `robots.txt`, `sitemap.xml`: public search discovery. Inclusion in search results is controlled by search engines.

The original Downloads pack is kept untouched. Slate “Pointy” is September 2026’s Roomie of the Month, with the user-supplied photo preserved unchanged and an optimized WebP used on the page. The coffee machine is September’s appliance winner; Tiaan’s fuller April 2026 roomie story remains as a dated previous feature. The fuller household stories, six bar features, drinks and braai lists, and house motto are retained in a conversational voice. Bennie has his own introduction and a place among the residents, with recurring mentions throughout the page.

## Halloween background

`assets/greenhouse-loop.mp4` is a silent 12-second loop (about 1 MB). It adds a gentle, continuous push in and out of custom greenhouse concept artwork made with ChatGPT’s built-in image tool. `assets/greenhouse-night.webp` is the 180 KB static fallback. The original artwork and exact prompt are preserved in `assets/README.md`. This is Halloween scenery, not a photograph of the venue. The previous cropped-root background is retained for old links.

The loop plays inline on desktop and mobile. A persistent control pauses or resumes it; it also pauses when the page is hidden. Reduced-motion and data-saving preferences prevent the video from loading until the visitor explicitly chooses to play. If JavaScript or autoplay is unavailable, the still background remains. The original invitation film is loaded separately only when its disclosure is opened, including through the poster’s “Watch the invitation” link. The full poster is the first content below the header, with a link to its original full-resolution PNG.

To reproduce the background with FFmpeg and cwebp:

```sh
cwebp -q 84 assets/greenhouse-night-original.png -o assets/greenhouse-night.webp
ffmpeg -i assets/greenhouse-night-original.png -vf "scale=2304:1536,zoompan=z='1.015-0.015*cos(2*PI*on/240)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=240:s=1440x960:fps=20,format=yuv420p" -an -c:v libx264 -preset slow -crf 25 -movflags +faststart assets/greenhouse-loop.mp4
```

Fog, floating embers/spores, gently moving edge vines, coffee-cup steam, and mouse parallax are rendered locally with CSS, SVG and canvas. They share the background video’s Play/Pause effects control and stop with reduced motion, data saver or a hidden tab. No animation framework is required.

## Invitation first, mobile first

The opening hero and repeated date strip have been consolidated into the invitation section. The original poster loads eagerly with high priority at the top, followed immediately by calendar, save and film links. Readable event details sit beside it on desktop and below it on phones. The mobile header is compact, navigation collapses below 961px, primary touch targets are at least 44px, and the motion control stays in the header instead of covering page content. Mobile body copy uses larger reading sizes. Pointy, the coffee-machine award, Tiaan’s archived story and Bennie’s fuller copy are retained.
