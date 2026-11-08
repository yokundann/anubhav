# Refinement Report

Scope: a targeted polish pass on the approved redesign. No sections, layouts or components were rebuilt.

## 1. Font correction
- **Font identified:** DM Mono (the `--f-mono` token), the monospace used for every small uppercase label in your screenshots: nav, eyebrows (`01 ABOUT`), `FIG. 01` captions, `SCROLL`, film meta lines, buttons, footer copyright, hero sub-line.
- **Why it was one token:** the repo had no stray hard-coded copies. All 30 usages went through `var(--f-mono)` across 11 CSS files; the only other reference was the Google Fonts `<link>`.
- **What changed:**
  - `src/styles/tokens.css`: `--f-mono` replaced by `--f-helvetica` (`'Helvetica Neue', Helvetica, Arial, 'Nimbus Sans', 'Liberation Sans', sans-serif`) and `--f-label: var(--f-helvetica)`.
  - All 30 `var(--f-mono)` uses renamed to `var(--f-label)`: `base.css` (2), `components.css` (8), `hero.css` (4), `work.css` (4), `about.css` (2), `education.css` (2), `skills.css` (2), `experience.css` (2), `footer.css` (2), `contact.css` (1), `interests.css` (1).
  - `index.html`: DM Mono removed from the Google Fonts request (one fewer download). Cormorant Garamond and Manrope are untouched.
  - Letter-spacing on those label rules was reduced by ~25% where it was 0.14em or more, because Helvetica capitals are wider than monospace ones.
- Helvetica is a system font, not downloaded. Windows and Android resolve it to Arial, Linux to Nimbus/Liberation Sans. This is the standard behaviour of a Helvetica stack.

## 2. Professional information
**Added**
- Current affiliation, exactly as you gave it: "Currently at Ministry of Culture, Tourism and Civil Aviation, Government of Nepal". It appears in the hero (under the links), in the Experience intro, and as `worksFor` in the JSON-LD. No title, department, dates or duties were added.
- LinkedIn and FilmFreeway links (contact section and footer, plus JSON-LD `sameAs`), from the PDF.
- "Script Supervision" added to Practice (one of the three top skills on LinkedIn).
- One Chef Nepal bullet from LinkedIn: social media content and visual assets for digital platforms.

**Not added, on purpose**
- "Pubg Mobile, Operations Manager" and "Clash of Clans Mod Apk, Chief Strategy Officer" read as gaming jokes, not professional roles. I did not publish them.
- "Creative Director" (LinkedIn headline) was not adopted as a title (see below).

## 3. Needs your confirmation
1. **Ministry:** it appears in neither the LinkedIn PDF nor the existing CV. LinkedIn lists Ekaa Kombucha as the current role. It is published only because you stated it. Please confirm, and give me the designation if you want it shown.
2. **Chef Nepal dates:** site/CV say May–Sep 2024; LinkedIn says Jul–Dec 2024. Left as on the site.
3. **Kantipur:** site/CV say "Social Media Strategist, Kantipur Publications, Mar 2019–May 2021"; LinkedIn says "Social Media Marketing Specialist, Kantipur Media Group, Apr 2019–Nov 2021". Left as on the site.
4. **Synergy Plus** (Content Creator, Feb–Sep 2023) is on the site and CV but not on LinkedIn.
5. **Education:** site says Bachelor's in Film Studies, Jan 2022–Present, "Screenplay Writing and Direction"; LinkedIn says 2020–2024, "Direction and Script Writing". "Present" may now be stale.
6. **Creative Director:** LinkedIn's summary says "Creative Director"; the site presents a Visual Artist. Not changed without your say-so.
7. The CV PDF in `/public/assets` was not regenerated and still lacks the Ministry line.

## 4. Preserved
Black/white/gold palette, Cormorant + Manrope pairing, hero composition, preloader, pinned horizontal film gallery, scrubbed About paragraph, timeline fill, accordion experience, marquees, cursor, magnetic buttons, parallax, all copy not listed above. The existing reveal system already had fade-up, clip-path image reveals, split-text, one-time triggering, `prefers-reduced-motion` support and a JS-gated fallback, so Phase 6 was met by what was there.

## 5. Audit notes (not changed)
The uppercase tracked labels, numbered markers and `·`-joined meta strings are a recognisable "designed website" convention. They are consistent with the approved identity and your preservation rules, so I kept them. If you want a less templated feel later, the first candidates are the numbered eyebrows on non-sequential sections (Skills, Interests) and the uppercase labels.

## 6. Animation and robustness
- Two reveal variants added in `components.css`: `data-reveal="left"` (timeline entries slide in from the left) and `data-reveal="fade"` (opacity only, used on the Open-to-opportunities card). The rest keep their existing treatments.
- Failsafe: if the scripts have not initialised after 6 s, `index.html` removes the `js` class so nothing stays invisible. `main.js` sets `window.__siteReady`.

## 7. Responsive
No layout changes were needed. Measured at 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844, 375×812 and 320×700: zero horizontal page overflow at every size (only the marquee tracks, which are intentionally clipped). Spot-checked screenshots at desktop, tablet and mobile.

## 8. Files
- **Modified:** `index.html`, `src/scripts/main.js`, `src/styles/tokens.css`, `base.css`, `components.css`, and `sections/{hero,about,experience,work,skills,education,interests,contact,footer}.css`, `REDESIGN_GUIDE.md`.
- **Created:** `REFINEMENT_REPORT.md`.
- **Dependencies:** none added or changed.

## 9. Testing: what was and was not done
**Done** (headless Chromium, serving the source files directly): all nine viewports above for overflow; scroll-through at 1440 (normal and reduced-motion) and 390 confirming every reveal element triggers; zero console/page errors; computed font-family checked on nav, eyebrow, button, link, caption, meta and footer elements, with no monospace left anywhere.

**Not done**
- `npm run build` was **not run**: `vite` could not be installed offline here. Please run `npm install && npm run build`. The `dist/` folder in the zip is **stale** and does not contain these changes. There is no lint script in `package.json`.
- Google Fonts could not load offline, so display and body type fell back to system serif/sans in my screenshots. Helvetica was rendered by its metric-compatible stand-in (Liberation Sans). Real Helvetica on macOS/iOS was not seen.
- No real touch device, Windows or Safari testing. The pinned gallery was exercised only by the scroll-through, not frame-by-frame.
