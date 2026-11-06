# REDESIGN_GUIDE.md

Black · White · Gold editorial redesign of the Anubhav Khati portfolio, built directly on the existing Vite + vanilla JS repository.

---

## 1. Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run preview
```

No new dependencies were added. `package.json`, `vite.config.js`, routes (single page, `#anchors`) and all asset paths are unchanged.

> **Verification note.** The `node_modules` folder in the ZIP only contains Windows binaries (esbuild/rollup `win32-x64`), so `vite` could not be started in my Linux sandbox. I verified the site by serving the same source files (`index.html`, `src/`, `public/`) over a plain static server and driving it with headless Chromium (desktop 1440×900, 1280×720, tablet 1024×768, mobile 390×844, and `prefers-reduced-motion`). I did **not** run `npm run build`, and `dist/` is still the old build until you do. Web fonts could not be downloaded in the sandbox, so I saw the serif/sans fallbacks, not Cormorant Garamond / Manrope / DM Mono.

---

## 2. Summary of the visual transformation

The old site was a street-poster pastiche (yellow/pink/cyan stickers, spray-paint wall, vinyl turntable, record crate, LED counters, shutter door) and followed the reference site's structure closely. It is replaced by a **dark-room gallery / film-frame** identity that suits a Film Studies visual artist:

* **Palette:** `#080808` black, `#FFFFFF` white, `#D4AF37` metallic gold, `#BFA15F` champagne. Sections alternate dark / light. Gold is used for lines, numerals, fills and highlights, never as a large flat yellow. On white sections gold is only used as a highlight bar or hairline (gold text on white has poor contrast).
* **Type:** Cormorant Garamond (display, light + italic), Manrope (body), Helvetica system stack (labels/numbers). Devanagari titles fall back to Noto Serif Devanagari.
* **Motifs:** gold crop-marks / viewfinder corners, offset hairline frames behind photos, numbered chapters (01–07), gold hairlines that draw themselves, rotating text badge, foil-gradient on italic words.
* **Layout:** asymmetric hero (giant two-line name, indented italic surname, layered portrait with offset frame and badge), rounded "sheets" that overlap each other, oversized typographic lists, pinned horizontal film strip, scroll-drawn timeline.

### Preserved
* All copy, contact details, links (mailto / tel / Instagram / Facebook / CV PDF), SEO/OG/JSON-LD tags, favicon and manifest (recoloured), all seven images in `public/assets/images/`, the section anchors `#home #about #experience #work #skills #education #interests #contact`, skip link, accessible names, keyboard support, copy-email button with toast.
* The existing Vite setup, folder structure (`src/styles`, `src/styles/sections`, `src/scripts`, `src/data`) and per-section CSS split.
* `award-aavritti.jpg` was in the repo but unused; it now appears in Education & Recognition.

### Redesigned
Hero, About, Experience, Work, Skills & Tools, Education & Recognition, Interests, Contact, Footer, header/navigation, mobile menu, buttons, brand band.

### Removed (by design, to break the resemblance)
Shutter "door" intro, sticker bombs / tape / marker typography, LED stat displays, turntable + tonearm experience selector, draggable sticker wall + "stick them again" shuffle, record-crate education selector, vinyl "singles" interests, **spray-paint canvas and "Take your tag" export**, stacked sticky "layer" scrolling, setlist pill, decorative sound toggle (it never played audio), Bungee / Permanent Marker fonts, and the yellow/pink/cyan/green/red colours.
Their content is kept, only the interaction is replaced: experience → accordion, education → timeline, skills → typographic index, interests → large hover rows.

### Newly introduced
Preloader (counter + split curtain), custom gold cursor, scroll-progress line, back-to-top progress ring, hide-on-scroll header that switches light/dark tone per section, full-screen menu, masked text reveals, scroll-scrubbed paragraph, parallax images, velocity-reactive marquees, pinned horizontal film gallery, count-up stats, magnetic buttons, pointer-following gold light, scroll-drawn timeline, film-grain overlay.

---

## 3. Animation concepts adapted from the reference video

I studied the uploaded video as 13 frames sampled every 6 s (about 78 s of footage) plus the existing code. That shows composition and sequencing, not exact easing or timing, so I did not copy timings. I did not open strike.uno itself.

| Concept seen in the reference | Original adaptation here |
|---|---|
| Hero "name tag" entrance, staggered pop-in | Masked per-letter rise of the name, staggered role/CTA fade-ups gated by the preloader (`preloader.js`, `reveal.js`, `lib/split.js`) |
| Tape / marquee band between sections | Large italic/outline serif marquees that speed up and skew with scroll velocity, reverse on scroll-up (`marquee.js`) |
| Animated stat strip | Editorial numerals with count-up (`reveal.js`) |
| Sections stacking over each other on scroll | Rounded overlapping sheets alternating dark/light, plus a pinned horizontal gallery for Work (`work.js`) |
| Interactive contact wall | Pointer-following gold light, magnetic buttons, big underline-sweep email link (`hero.js`, `magnetic.js`) |
| Scroll-spy nav + floating UI | Header tone switching, hide/show, scroll progress, to-top ring (`chrome.js`) |
| Parallax mouse depth in hero | Scroll parallax on portrait/badge/name and inside image masks (`parallax.js`) |

---

## 4. Where things live

### Design tokens (colours, fonts, spacing, easing, durations)
`src/styles/tokens.css`
* Palette: `--black --white --gold --champagne`, derived tints `--text-on-dark`, `--hair-on-dark`, `--gold-foil` etc.
* Fonts: `--f-display`, `--f-body`, `--f-label`
* Layout: `--gutter --max --section-pad --radius-sheet --header-h`
* Motion: `--ease-out --ease-io --dur-reveal --stagger`

### Typography and global styles
* Google Fonts `<link>` in `index.html` (head). Change families there and in `tokens.css`.
* Reset, body, theme scopes (`[data-theme='dark'|'light']`), `.title`, `.eyebrow`, `.sheet`: `src/styles/base.css`.

### Components (header, menu, buttons, cursor, preloader, marquee, reveal states, toast, grain)
`src/styles/components.css`

### Sections
`src/styles/sections/{hero,about,experience,work,skills,education,interests,contact,footer}.css`

### Animations (JS)
| File | What it does |
|---|---|
| `src/scripts/lib/motion.js` | Single rAF ticker, smoothed scroll state, helpers, `reduced` flag. `SCROLL_SMOOTH` controls parallax inertia. |
| `src/scripts/lib/split.js` | Splits text into masked words/chars (keeps `<em>`). |
| `src/scripts/preloader.js` | Counter + curtain; `DURATION` (2000 ms first visit, 800 ms repeat in session). |
| `src/scripts/reveal.js` | `[data-reveal]`, `[data-split]`, `[data-d]` delays, counters. |
| `src/scripts/parallax.js` | `[data-parallax]`, `[data-img-parallax]`, hero name drift. |
| `src/scripts/marquee.js` | Marquee loop; `BASE` px/s. |
| `src/scripts/work.js` | Pins Work and maps scroll to horizontal movement. |
| `src/scripts/scrollfx.js` | Word-by-word scrub (About), timeline line (Education). |
| `src/scripts/chrome.js` | Header, progress, to-top, scroll-spy. |
| `src/scripts/menu.js` | Mobile menu, focus trap, copy-email toast. |
| `src/scripts/cursor.js`, `magnetic.js`, `hero.js`, `experience.js` | Cursor, magnetic buttons, pointer light, accordion. |
| `src/scripts/main.js` | Entry point wiring everything. |
| `src/data/content.js` | Email + toast strings only (page copy lives in `index.html`). |

CSS-driven animation: reveal transitions in `components.css` (`html.js [data-reveal]…`), foil shimmer (`@keyframes foil` in `base.css`), rotating badge and scroll cue (`hero.css`), accordion (`experience.css`), hover sweeps (buttons, lists, rows).

---

## 5. Modified, created and deleted files

**Modified:** `index.html`, `public/favicon.svg`, `public/site.webmanifest` (colours), `src/data/content.js` (trimmed), `src/scripts/main.js`, `src/scripts/reveal.js`, `src/scripts/parallax.js` (rewritten), `src/styles/tokens.css`, `base.css`, `components.css`, and every file in `src/styles/sections/` (rewritten).

**Created:** `src/scripts/{chrome,cursor,experience,hero,magnetic,marquee,menu,preloader,scrollfx,work}.js`, `src/scripts/lib/{motion,split}.js`, `REDESIGN_GUIDE.md`.

**Deleted:** `src/scripts/{crate,door,layers,led,nav,singles,spray,stickers,turntable}.js`, `src/styles/sections/door.css`.

**Untouched:** `package.json`, `vite.config.js`, `public/assets/**`, `dist/**` (stale until rebuilt). `git status` may show many files as modified only because of CRLF/LF line endings in the ZIP.

---

## 6. How to change things

* **Change colours:** edit the four palette variables in `tokens.css`.
* **Add/replace a section:** every section is `<section data-theme="dark|light" data-tone="…">` in `index.html` with its own CSS file. Add `data-reveal` to elements for a fade-up, `data-split="words|chars"` on headings for masked text, `data-d="200"` for a delay in ms.
* **Timing / easing:** global in `tokens.css` (`--ease-*`, `--dur-reveal`, `--stagger`). Preloader length in `preloader.js`; marquee speed `BASE` in `marquee.js`; parallax strength in the HTML attributes `data-parallax="0.06"` / `data-img-parallax="0.08"` (keep image values ≤ 0.1).
* **Experience roles:** duplicate an `<li class="xp">` block in `index.html` (keep unique `id`/`aria-controls`).
* **Films:** duplicate an `<article class="film">` block; the pinned width is measured automatically.
* **Images / CV:** replace files in `public/assets/images/` and `public/assets/` keeping file names, or update the `src`/`href`. Give new `<img>` `width`/`height` attributes to avoid layout shift. Parallax images use `.frame > img[data-img-parallax]` and are cropped to the frame.
* **Cursor label on films:** `data-cursor-label="Film"`.
* **Disable the film grain:** remove `<div class="grain">`.

---

## 7. Accessibility & performance

* `prefers-reduced-motion`: no preloader, everything visible immediately, no parallax/marquee motion, Work becomes a normal stacked list.
* Reveal states only apply when JS is running (`html.js`), so content is visible without JS.
* Coarse pointers (touch) get no custom cursor or magnetic effect; Work is stacked below 901 px width.
* Menu and accordion use proper `aria-expanded`, `inert` when closed, focus trap and Escape.
* One shared `requestAnimationFrame` loop; off-screen work is skipped.

## 8. Limitations / manual attention

* `npm run build` and the real Vite dev server were **not** run (see note in §1). Please run both once.
* Fonts load from Google Fonts; I could not see the final typography. If you want fully offline fonts, self-host them in `public/` and update the `@font-face`/`<link>`.
* Smooth scrolling is native (`scroll-behavior`) with eased parallax; I did not add Lenis because it was not needed.
* The old spray-wall souvenir download and decorative sound toggle no longer exist.
* Images are your originals; I did not recompress them (the portrait is 1638 px square and could be optimised).
* I only verified in Chromium; Safari/Firefox are untested. `translate` / `color-mix` / `inert` need current browsers.
* The CV PDF and academic details are unchanged; please confirm copy such as "2019" and GPA remain what you want public.
