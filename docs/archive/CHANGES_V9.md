# V9: motion pass

- Header: Instagram and Facebook icons now sit dead-centre in their round buttons (the breakpoint rule had replaced the centring display mode).
- Signature: the purple "Anubhav Khati" has room on all sides, a corrected reveal clip, and is fitted to the real panel width, so no swash is cut at any size.
- Loader: film-gate loader (sprocket strips, viewfinder corners, reel with progress ring, count-up) that opens as an orange-edged iris. Skipped for reduced motion, hash links and mid-page reloads.
- Favicon: your AK image, as favicon.ico, 16/32 PNG, apple-touch-icon and manifest icons (public/).
- Motion layer (src/styles/motion.css, src/scripts/motion.js): word-by-word titles, focus-pull and "develop" reveals, hero parallax, film timeline progress bar, lens cursor, tilt and glare on film cards, magnetic buttons, spotlight cards, accordion stagger, drawing education timeline, REC timecode, auto clapperboard, subtle grain.
- All of it is switched off for prefers-reduced-motion; touch devices skip cursor, tilt and magnet.

## V9.1
- Removed the ring cursor: the normal system cursor is back.
- Removed the vertical orange line and dots beside the Education rows.
- Removed the orbiting ring/dot around the About portrait; the pupils now follow the pointer (public/assets/images/anubhav-avatar-eyes.jpg is the portrait without pupils; motion.js draws them).
