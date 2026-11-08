# V6 changes
Fonts: Caveat (director's pencil notes) and Pinyon Script (sign-offs) added to the Google Fonts link. No other dependencies.

## Fixes
- "frame?" (and every italic / gradient headline) no longer clipped: word masks and gradient-clipped spans now have room for overhangs and descenders (cinema.css §2).
- Uppercase grotesk labels removed: N°01 line, hero sub-line, HUD, stat captions, "frame 01" labels, interest tags, cursor label, numerals and captions are now handwritten (Caveat) or Cormorant italic.
- Cursor "Film" bubble no longer sticks after the pinned Work section scrolls away (cursor.js).
- Education award caption no longer sits under the outline frame.

## Smoother Education reel (education.js + education.css)
Everything is continuous and damped: per-frame focus value --f, damped playhead, slot-column readouts, slower odometer. No class snapping, no 30fps throttling.

## Every section got its own scene (cinema.css + cinema.js)
About: bokeh light-table, rack-focus photo with autofocus box + pencil note, shot-list ticks · Experience: anamorphic streaks, pointer spotlight, wipe-fill names ·
Work: projector beam + dust, film-strip posters that lean with scroll speed · Skills: lens chart, rack focus on hover, working aperture ·
Education: dusk / film burn / stars, projector-gate award · Interests: colour washes, timecode ring · Contact: golden-hour leak + clapperboard (click or "Copy email" = new take).

## Footer: the end credits
"क्रमशः to be continued…" title card, giant name lit by a flashlight that follows the pointer (auto-sweeps on touch), closing credits rolling on a letterboxed film screen (pauses on hover),
projector beam leaning toward the pointer, live Kathmandu clock. Sign-off: "made with dherai dherai maya ❤️".

New files: src/styles/sections/cinema.css, src/scripts/cinema.js. Rewritten: education.js, footer.js. Small edits: index.html, cursor.js, work.js, main.js, education.css.
