# FINAL_ENHANCEMENTS

> **Update v3** (this section supersedes the v2 palette table and v2 file table below where they differ; the v2 notes remain for history.)

## v3: what changed
1. **Day / night mode**: a sun/moon button in the header (works on mobile too). It picks your saved choice, otherwise your system setting (night if neither). Switching plays a circular colour wipe from the button (View Transitions, with a soft cross-fade fallback; instant with reduced motion). Night keeps every section dark; day turns every section light. Each section keeps its own tint in both modes. The menu overlay, preloader, header, browser theme colour and scrollbar follow the mode.
2. **Vivid palette** (`src/styles/tokens.css`): teal `#1f9d92`/`#45d1c0`, wine `#a3344d`/`#f58aa5`, violet `#a28df0`/`#5a45c2`, gold `#d1a02f`/`#efc24f`. Night grounds: deep teal `#0c2b2b`, wine `#2d1019`, indigo `#1b1745`. Day grounds: mint `#d3f1ea`, blush `#fbdbe2`, lavender `#e2dcff`, sand `#f4e7c6`. Day/night rules live in `src/styles/base.css` ("Day / night" block): inside each section the foundation tokens are inverted, so the existing rules adapt without being rewritten.
3. **Script labels instead of capitals**: section eyebrows ("Experience", "Selected Work"...), the hero line "Kathmandu · Visual artist & storyteller", "Currently at", timeline kinds, skills headings, contact labels, footer headings and the hero badge ring now use the display italic (Cormorant Garamond italic, already loaded). Section numbers stay in small Helvetica. Token: `--f-script` / `--script-size`.
4. **Smoother hovers**: one shared soft easing (`--ease-hover`) and duration (`--t-hover`, 0.75s) across buttons, links, nav, lists, rows, footer and posters. Underlines draw over a faint base line (no keyframe flicker). The italic-swap on hover (which made text jump) is replaced by smooth colour and indent. Magnetic buttons now glide with per-frame easing. Menu links no longer inherit the open-animation delay on hover.
5. **New loader**: the name is set in outlined letters that fill in one by one as the counter climbs (Anubhav in ink, Khati in gold italic). The counter is continuously eased (no steps or stalls), about 3.4s on first visit and 1.5s on repeat visits in the same session, then the curtain opens. Tune in `src/scripts/preloader.js` (`DURATION`, `SMOOTH`, `HOLD`).
6. **Sticky navbar**: the header is always visible (the hide-on-scroll behaviour is removed) and gains a blurred backing after 24px of scroll.

## v3 testing
Served the source directly in headless Chromium: both modes at 1440 and 390 with full scroll-through, plus 320, 375, 430, 768, 1024, 1366, 1920 for overflow: no horizontal overflow, no console errors, all reveals fire, toggle switches mode and saves it, header stays at the top after scrolling, loader frames checked from 0 to 100%. `npm run build` still could not be run here (no node_modules, installs blocked), so run it locally once.

## Files to change in your repo (cumulative: original upload → v3)
If your repo is still the original upload, replace/add everything below. If you already applied v2, the rows marked **v3** are the only ones that changed since.

| File path | Action | Changed in | What you do |
|---|---|---|---|
| `index.html` | Modified | v2 + **v3** | Replace |
| `public/favicon.svg` | Modified | v2 | Replace |
| `public/site.webmanifest` | Modified | v2 | Replace |
| `src/styles/tokens.css` | Modified | v2 + **v3** | Replace |
| `src/styles/base.css` | Modified | v2 + **v3** | Replace |
| `src/styles/components.css` | Modified | v2 + **v3** | Replace |
| `src/styles/sections/hero.css` | Modified | v2 + **v3** | Replace |
| `src/styles/sections/about.css` | Modified | v2 + **v3** | Replace |
| `src/styles/sections/experience.css` | Modified | v2 + **v3** | Replace |
| `src/styles/sections/work.css` | Modified | v2 + **v3** | Replace |
| `src/styles/sections/skills.css` | Modified | v2 + **v3** | Replace |
| `src/styles/sections/education.css` | Modified | v2 + **v3** | Replace |
| `src/styles/sections/interests.css` | Modified | v2 + **v3** | Replace |
| `src/styles/sections/contact.css` | Modified | v2 + **v3** | Replace |
| `src/styles/sections/footer.css` | Modified | v2 + **v3** | Replace |
| `src/scripts/preloader.js` | Modified | **v3** | Replace |
| `src/scripts/chrome.js` | Modified | v2 + **v3** | Replace |
| `src/scripts/magnetic.js` | Modified | **v3** | Replace |
| `src/scripts/main.js` | Modified | **v3** | Replace |
| `src/scripts/reveal.js` | Modified | v2 | Replace |
| `src/scripts/work.js` | Modified | v2 | Replace |
| `src/scripts/mode.js` | **Created** | **v3** | Add to `src/scripts/` (new day/night toggle logic; imported by `main.js`) |
| `FINAL_ENHANCEMENTS.md` | Created | v2 + v3 | Add to repo root |
| Deleted files | None | | |

No dependency, `package.json` or lockfile changes. Do not overwrite `package.json`, `package-lock.json`, `vite.config.js`, `.env*`, hosting config, or `public/assets/`. Order: copy files, add `mode.js`, `npm install`, `npm run build`, deploy. The ZIP has no `dist/`; the build regenerates it.

---

# v2 notes (history)

Refinement pass on the Anubhav Khati portfolio (Vite, vanilla CSS and JS). No dependencies were added, removed or changed.

## 1. What changed, in short
- **Colour identity**: black, white and gold only → warm ivory / deep charcoal / antique gold, with teal, burgundy and lavender used one accent per section. Dark sections are now subtly tinted (teal, burgundy, lavender-slate) so the page shifts mood as you scroll.
- **Typography**: all small text is Helvetica, sentence case. Wide-tracked all-caps survives only on tiny category labels (eyebrows, timeline kind, footer headings, contact labels, hero "Currently at", badge ring).
- **Motion**: every existing animation is kept. New motion is added (list in section 5), and sections now have different motion personalities.
- **Less generic**: gold-foil gradient replaced by a restrained two-tone sheen, glowing black "open" card replaced by a solid burgundy card, bright shimmer buttons simplified, poster stacks and interest rows given asymmetric, editorial placement.
- **Responsive**: verified at all 9 requested viewports, no horizontal overflow, no console errors.

## 2. Monospaced font
- The font was **DM Mono** (token `--f-mono`). An earlier pass already replaced it with Helvetica (`--f-helvetica` / `--f-label`) and removed it from the Google Fonts request.
- Re-verified in this pass: a repo-wide search finds no monospace family in any source file (the only remaining matches are two comments saying it was removed), and a computed-style scan of every element in Chromium at all viewports found no `mono`, `courier` or `consolas` family.
- Cormorant Garamond (display) and Manrope (body) are untouched.

## 3. Typography changes (file → change)
| File | Change |
|---|---|
| `src/styles/tokens.css` | Helvetica stack `--f-helvetica`; `--f-label` alias; new label scale `--label-size`, `--label-track` (sentence case) and `--caps-size`, `--caps-track` (small caps labels). Single place to tune. |
| `src/styles/base.css` | `.eyebrow` 11px caps, tracking 0.1em (was 12px, 0.165em). |
| `src/styles/components.css` | Nav, buttons, text links, menu footer, toast, cursor label, preloader label: sentence case, 14-15px, tracking 0.015em (were 11-12.5px uppercase, 0.1-0.24em). Text links get 44px touch height on coarse pointers. |
| `src/styles/sections/hero.css` | `.hero__sub`, caption, scroll cue → sentence case. |
| `.../work.css`, `.../experience.css`, `.../about.css`, `.../education.css`, `.../skills.css`, `.../interests.css`, `.../footer.css` | Captions, meta lines, years and numerals → sentence case Helvetica. |
| `index.html` | Font comment updated. Font links unchanged. |

## 4. Colour palette: where each colour is configured
All in `src/styles/tokens.css` (values) and `src/styles/base.css` (per-section assignment block, "Per-section colour direction").

| Token | Hex | Used for |
|---|---|---|
| `--charcoal` (alias `--black`) | #17191B | Dark ground, text on light |
| `--ivory` | #F5F2EA | Light sections, text on dark |
| `--ivory-deep` | #ECE7DA | Skills section ground |
| `--gold` / `--gold-hi` | #B89A59 / #CDB27A | Hero, contact, marquee band, hairlines |
| `--teal` `--teal-ink` `--teal-hi` | #527C78 / #3D625E / #86B0AB | Experience (dark) and Skills (light) |
| `--burgundy` / `--rose-hi` | #874F59 / #CF9CA6 | About (light) and Work (dark), open-to-work card |
| `--lavender` / `--lavender-ink` | #A69BB8 / #6B6083 | Education (dark), Interests (light), contact glow |
| `--ground-teal` `--ground-burgundy` `--ground-lavender` | #131D1D #1D1618 #181820 | Tinted dark section backgrounds |

Per-section accent, background and hover colours flow through `--accent`, `--accent-alt`, `--accent-soft` and `--section-bg`. The `-ink` tones are darker variants chosen so small text on ivory keeps readable contrast (the old champagne numerals on white did not).

## 5. Animations
**Kept as they were**: preloader curtain and counter, hero character reveal, count-up stats, portrait mask, scrubbed About paragraph, accordion, pinned horizontal Work gallery, drawing timeline, marquees, magnetic buttons, custom cursor, back-to-top ring, nav roll hover, parallax, progress bar.

**New or improved**
- Section-aware accent: progress bar, cursor, logo dot, header hover states take the colour of the section in view and cross-fade (`chrome.js`, `--live-accent`).
- Film posters unmask and captions slide in as each one travels into the pinned strip (`work.js`, `--in`; CSS in `work.css`).
- Side mask reveal for the About photo (`data-reveal="clip-x"`), footer wordmark wipes in.
- Hairlines draw themselves left to right on experience rows, About list, Skills lists and Interests rows (`.draw`).
- Eyebrow rules draw in; hero stat rules draw in, staggered with the count-up.
- Skills "Tools" slide in from the right, About list rises, Interests words rise out of a mask. Each section has its own motion character.
- Display-italic sheen is now a slow, single-accent shimmer instead of a bright gold-foil sweep.
- Performance: `will-change` dropped after reveal, grain animation disabled on touch and small screens, lighter header blur.
- Safeguards kept: content stays visible without JS (6s fallback), `prefers-reduced-motion` shows everything and disables pinning (tested).

## 6. Responsive
- Tested 1920x1080, 1440x900, 1366x768, 1024x768, 768x1024, 430x932, 390x844, 375x812, 320x700: zero horizontal overflow, zero console errors.
- Mobile Work: posters full width, alternating sides. Interests stagger is desktop only. About body indent only on desktop.
- 320px fixes: footer wordmark scaled, footer email wraps, footer columns collapse to one, copyright kept clear of the back-to-top button.
- Touch: text links and footer links have 44px-high tap areas on touch devices; menu footer links padded.

## 7. File-by-file GitHub update guide
Apply on top of your existing repo. All paths are relative to the repo root (the folder containing `package.json`).

| File path | Action | Purpose | What you do |
|---|---|---|---|
| `index.html` | Modified | Theme colour, font comment, `draw` / `clip-x` / `row` reveal attributes, hero `fetchpriority` | Replace |
| `public/favicon.svg` | Modified | New charcoal and antique-gold colours | Replace |
| `public/site.webmanifest` | Modified | Background and theme colour #17191b | Replace |
| `src/styles/tokens.css` | Modified | New palette, grounds, label scale, accent defaults | Replace |
| `src/styles/base.css` | Modified | Theme scopes, per-section accents, eyebrow, title italics | Replace |
| `src/styles/components.css` | Modified | Reveal variants, `.draw`, header, buttons, cursor, marquee, type | Replace |
| `src/styles/sections/hero.css` | Modified | Palette, stat hairlines, labels | Replace |
| `src/styles/sections/about.css` | Modified | Burgundy accent and card, asymmetry, labels | Replace |
| `src/styles/sections/experience.css` | Modified | Teal accent, labels | Replace |
| `src/styles/sections/work.css` | Modified | Rose accent, poster unmask, mobile composition | Replace |
| `src/styles/sections/skills.css` | Modified | Teal ink accent, tools motion | Replace |
| `src/styles/sections/education.css` | Modified | Lavender accent, timeline | Replace |
| `src/styles/sections/interests.css` | Modified | Lavender accent, stagger, word mask rise | Replace |
| `src/styles/sections/contact.css` | Modified | Gold and lavender glow, labels | Replace |
| `src/styles/sections/footer.css` | Modified | Labels, touch targets, 320px fixes | Replace |
| `src/scripts/chrome.js` | Modified | Live section accent | Replace |
| `src/scripts/work.js` | Modified | Poster unmask on scroll | Replace |
| `src/scripts/reveal.js` | Modified | Observe parent for `clip-x` masks | Replace |
| `FINAL_ENHANCEMENTS.md` | Created | This document | Add to repo root |
| Deleted files | None | | Nothing to delete |

**Do not overwrite**: `package.json`, `package-lock.json`, `vite.config.js` (unchanged), any `.env` or hosting config (Netlify, Vercel, CNAME), and your `public/assets/` images and CV (unchanged).

**Order**: 1) copy all Modified files over yours, 2) add `FINAL_ENHANCEMENTS.md`, 3) `npm install` (no new packages), 4) `npm run build`, 5) deploy. No lockfile change is needed.

**dist/ folder**: the ZIP does not include `dist/`. The copy in your upload was a stale build. Run `npm run build` to regenerate it (if you commit `dist/`, commit the new one).

## 8. Build, lint, tests
- `npm run build` **was not run**: this sandbox has no `node_modules` and package installs are disabled, so Vite could not be installed. Please run it once locally. The code uses only plain CSS and ES modules with no new syntax, so no build problems are expected, but this is unverified.
- No lint script exists in `package.json`.
- Tested instead: the source served unbundled (with `public/` mapped to the site root, as Vite does) in headless Chromium: 9 viewports, scroll-through reveal check (all elements reveal), console errors (none), overflow (none), computed-font scan (no monospace), reduced-motion run, JavaScript-disabled run (content visible).

## 9. Remaining issues and caveats
- Google Fonts could not load in the sandbox, so I saw serif and sans fallbacks, not real Cormorant Garamond and Manrope. Helvetica was rendered by its metric-compatible stand-in (Liberation Sans); real Helvetica (macOS, iOS) not seen. Windows and Android show Arial.
- I did not test on real touch devices or Safari.
- The pre-existing `REDESIGN_GUIDE.md` and `REFINEMENT_REPORT.md` are left as they were; they predate this pass.
