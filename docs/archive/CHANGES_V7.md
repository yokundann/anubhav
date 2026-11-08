# V7 — Editorial magazine layer

One new stylesheet (`src/styles/editorial.css`, loaded last) and one added `<link>` in `index.html`. No scripts, content, routes or images were touched.
To compare with V6, delete that one `<link>` line.

## Layout
- Running head on every section: folio number, section name, and a hairline that runs the full measure.
- Experience and Skills: headline in the left 8 columns, standfirst hanging bottom-right (asymmetric); other sections keep a single-column head.
- One shared rhythm: `--section-pad`, `--head-gap`, `--col-gap`, `--measure`. Page is ~1,000px shorter at 1440.
- Sheet corner radius reduced (pages, not pills). Buttons 2px radius, hairline icon buttons.

## Typography
- Headlines slightly smaller (6.3rem max), balanced wrapping, no thick highlighter bar under light-section italics.
- Interest tags become a typeset line (Light / Frame / Moment) instead of pill chips.
- Skills index and marquees scaled down; reading widths capped (46–56ch).

## Less decoration
- Retired: hero scratches, sprocket strips, flare, vertical lines, portrait offset outline and duplicate crop marks, About/Education offset outlines.
- "Open to…" card → rule + italic pull-quote. Education wash softened. Contact crop frame dimmed. Grain 0.045 → 0.03.
- Kept: light leaks, aperture, viewfinder HUD, rack-focus photo, film-strip posters, LED stats, clapperboard, end credits, all animations and day/night.

## Responsive
- Contact grid pinned to the gutters at ≤1099px (fixes 302px content in a 280px column at 320px); smaller email line on phones.

## Round 2 — more magazine, and smoothness

### Magazine
- Folio on every running head ("Anubhav Khati · p. 03"), figure numbers on captions, serif standfirsts under headlines, column rules between side-by-side blocks, double rule above the footer, finer type rendering (kerning, ligatures).

### Performance (measured: scripted wheel-scroll, average ms/frame, software-rendered headless Chromium, lower is better; relative figures matter, not absolute)
| Segment | V6 original | V7 now |
|---|---|---|
| Hero → About | 39 | 20 |
| Experience | 58 | 23 |
| Work (pinned gallery) | 110 | 28 |
| Skills → Education | 46 | 22 |
| Interests | 39 | 17 |
| Contact / footer | 55 | 25 |

What was slow and what changed:
- Projector beams (Work + footer): animated `filter: brightness()` and `clip-path` on viewport-sized layers → static SVG wedge + opacity flicker. This alone was ~60 ms/frame in Work.
- Pointer glow (hero, contact): a section-sized gradient repainted every frame → a small layer moved with `translate`; no writes once it settles.
- Layout thrash: scripts interleaved DOM writes and `getBoundingClientRect()` reads inside one frame. `lib/motion.js` ticker is now two-phase (all reads, then all writes; `onFrame(fn)` may return a write function, `'late'` for write-only subscribers). Converted: parallax, scrollfx, work, education, chrome, cinema, marquee, hero, footer, cursor. Work no longer reads film rects per frame; the marquee no longer reads `offsetWidth` per frame.
- Full-screen `mix-blend-mode` (grain, leaks, burns), animated `blur()`, header `backdrop-filter`, animated grain layer → plain alpha layers, solid-ish header, static grain.
- Ambient animations now pause when their section is off-screen or the tab is hidden (`src/scripts/perf.js`); half the particles; none on touch / ≤900px.
- Automatic `html.lite` mode (motion.js): if a device averages below ~40fps for ~3s, the ambient layers (grain, particles, bokeh, extra beams) switch off. Content and interaction are unaffected.
- Permanent `will-change` on ~150 reveal/split elements removed.

### Files changed this round
`index.html` (editorial link, folio spans), `src/scripts/main.js` (init perf), `src/scripts/perf.js` (new), `lib/motion.js`, `parallax.js`, `scrollfx.js`, `work.js`, `education.js`, `chrome.js`, `cinema.js`, `marquee.js`, `hero.js`, `footer.js`, `cursor.js`, `src/styles/editorial.css` (new).

## Round 3 — the magazine flip
- **Page turn:** each page (section) is hinged at its top edge and turns into place as it arrives, with a cast shadow onto the page beneath. CSS scroll-driven animation (transform + opacity only: no JavaScript, no per-frame cost). Phones get a plain 2D lift. Browsers without `animation-timeline` show pages already in place; reduced-motion users get no turn; `html.lite` (slow devices) turns it off.
- **Flip pager** (`src/scripts/pager.js`, ≥761px): previous / next page buttons with the current folio ("p. 03 · Selected Work"). One IntersectionObserver, no scroll listener.
- **Cover:** "Inside this issue" strip under the hero (desktop) linking to three headline pages.
- **Contents page:** the mobile menu is now a table of contents with page numbers and dotted leaders.
- **Faster start:** intro curtain cut from ~5.5s to ~3s on a first visit (~1.8s when returning; was ~3.2s); Google Fonts no longer block first paint (display=swap, loaded asynchronously); hero portrait preloaded.
- Files: `index.html`, `src/scripts/main.js`, `src/scripts/pager.js` (new), `src/scripts/preloader.js`, `src/styles/components.css`, `src/styles/editorial.css`.
