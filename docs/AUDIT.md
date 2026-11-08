# Audit of v7 and what v8 changes

## What v7 did well (kept)
- Strong, true content: 4 roles, 3 films, festival recognition, education, skills, interests, contact. **Every line of it is preserved in v8.**
- Cinema metaphors that fit a director: viewfinder corners, clapperboard, closing credits, Kathmandu clock, "to be continued". All kept, reworked.
- Day/night mode, skip link, keyboard-reachable accordions, SEO/OG/JSON-LD, copy-email with toast.

## Findings

| Area | Finding in v7 | Fix in v8 |
|---|---|---|
| Performance | 6 Google font families (Cormorant, Manrope, Space Grotesk, Noto Serif Devanagari, Caveat, Pinyon Script), 21 JS/CSS files, 3,000 lines of CSS, a full-page preloader gated on a 6 s timeout | 3 families (Archivo, Mrs Saint Delafield, Noto Sans Devanagari), 4 CSS files, 1 JS file, no preloader |
| CSS architecture | `editorial.css` was an override layer on top of 11 other stylesheets (specificity fights, "remove this line to see the old design") | One token file + three plain files, no overrides |
| Motion | Custom cursor, grain overlay, light leaks, scratches, bokeh, pinned horizontal gallery, scroll-scrubbed text, magnetic buttons, per-section reveals: competing for attention and heavy on low-end phones | One orchestrated hero entrance (arch rises, signature is written, tags pop), count-up on stats, accordion and menu transitions (all answer a click). Everything respects `prefers-reduced-motion` |
| Information design | Section numbers 01–07 and "p. 0X" folios on content that is not a sequence; label/eyebrow on every heading | Numbers removed; one small label per section |
| Education order | Timeline ran 2022, 2021, 2023, 2023 (neither ascending nor descending) | Grouped: Education (2022, 2021) then Recognition (2023 ×2) with a type tag on each |
| Work | Films in a pinned horizontal scroll that hijacks vertical scrolling and is hard to use on trackpads/keyboards | Plain 3-up poster grid, posters shown in full, details always visible (no hover-only info) |
| Contact | Mail link only; no way to write a message in-page | Added a short form that builds a `mailto:` (no backend). Copy email and CV download kept |
| Accessibility | Text sizes in small caps/tracked labels, decorative layers announced in places, collapsed content still tabbable | Sentence-case labels, decorative layers `aria-hidden`, collapsed accordion panels `inert`, credits roll pausable by hover **or keyboard focus**, visible focus rings |
| Metadata | `og:image` and `twitter:image` were relative paths (social crawlers ignore these); apple-touch-icon pointed at a JPG | Absolute `og:image`/`twitter:image` URLs. (Add a 1200×630 share image when you have one.) |
| Repo hygiene | Root `assets/` holds 7 `.jpe` files that duplicate `public/assets/images`; `documents/` duplicates the CV; 7 change-log markdown files in the root | Old logs moved to `docs/archive/`. Root `assets/` and `documents/` left untouched so nothing is lost, safe to delete once you've checked |
| Images | Posters and photos shipped as full-size JPGs, `loading="eager"` on all three posters | Only the hero portrait is eager/high priority; everything else lazy with width/height set. (Next step: export WebP/AVIF versions.) |

## Design direction in v8
Reference theme: cool grey-blue studio wall, white rounded cards, giant ghost type fading out behind headings, a portrait in an orange arch, a handwritten signature across it, black pills and a rotating seal. Adapted, not copied:
- The arch is a **duotone of Anubhav's own portrait** (grey image multiplied over projector orange); the same treatment returns in Contact with a working **clapperboard**.
- The ghost words are his world: VISUAL, EXPERIENCE, FILMS, CRAFT, HONORS, INTERESTS, CONTACT, and his name in the footer.
- The reference's client-logo tiles become his four organisations; the testimonial rows become the education/recognition rows; the FAQ accordion becomes Experience and Interests.
- The **closing-credits roll** stays as the footer's showpiece, now on a letterboxed screen with film perforations.
- Palette: `#bcc4ce` ground, `#ffffff` cards, `#050505` ink, `#ff5a2c` projector orange, `#5a2bff` signature violet. Night mode swaps grounds only.

## Not verified
- I could not run `npm run build` (no network here), and web fonts could not load in my preview, so I checked layout with fallback fonts (which are wider than Archivo's condensed cut, a worst case). Text-fitting code shrinks giant words if they ever overflow. Please check once on your machine with `npm run dev`.
