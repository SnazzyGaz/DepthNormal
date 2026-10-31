# Relief Forge: update notes

Changes made to `index.html` from the GitHub version (commit 4ea81d0). With all new settings off, the 16-bit PNG export is byte-identical to the original's (checked on the test project).

**Exports are not changed by the preview.** The preview only shows what your process will produce. The PNG and STL always carry the full design, so CAM, slicer or laser software can use finer tools or rest passes. Only **Mould draft** changes the export, and only when it's set above 0°.

## New in 2.0.5 (fixes)

- **Lithophane always uses the current picture.** Its baked picture was only refreshed when the light controls moved, so after opening another project or image it could save the previous one, and a different-sized picture gave a broken STL. It now rebakes whenever the picture, normals or mask change.
- **Exports always match the current settings.** Exporting straight after moving a slider (with full-size preview) could save the result from before the move. PNG and STL exports now finish any pending update first.
- **Smoother fine STLs.** When the STL grid is coarser than the picture, the heights are averaged over each cell before sampling, so fine texture no longer turns into jaggies or moiré. Exports at pixel spacing are unchanged.
- **AI models pinned to a fixed version.** Depth and normal models now download from a fixed revision, so an update by the model makers can't change results without warning. Models already downloaded are reused, with no new download.
- **16-bit normal maps keep full precision.** Uploaded normal maps saved in older projects are read at 16 bits instead of 8 (less banding and drift). Opening a new picture no longer carries over the last project's uploaded normals.

## New in 2.0.3

### Lithophane (Export → Lithophane…)
A backlit plate for 3D printing that shows the subject like lit marble. The AI surface is lit by a light you set (direction as a clock face and height above the plate), then turned into thickness: bright = thin, dark = thick, on a log curve because light fades exponentially in plastic. Settings: background (dark, glowing or as rendered; needs a mask), width, thinnest and thickest (0.8 / 3 mm), frame, detail (0.2 / 0.15 / 0.1 mm), with a backlit, baked-picture or thickness preview and the STL size before saving. The STL is a closed mesh: textured front, flat back. Opens in its own panel, so the Export list only gains one button.
Printability: the bake is area-averaged down to the plate grid and smoothed to nozzle size (**Smoothing**, default 0.4 mm), so sharp one-pixel shadow lines no longer become needle-like spikes; **Shadow softness** (default Medium) lifts the very darkest tones a little so deep shadows become rounded bumps rather than full-thickness cliffs. Default detail is now 0.2 mm, matching a 0.4 mm nozzle (smaller files). On David the steepest wall drops from 18.7 to 14 mm per mm.

**3D preview:** Preview → *3D, drag to spin* shows the plate in 3D with a light behind it: spin and zoom it, set the back light, room light (how it looks with the lamp off), light colour and how quickly light fades in your plastic. Tilting the plate darkens it as light crosses more plastic, like the real thing.

### More materials and finishes in the 3D view
New materials: Carrara marble (veined), granite, black granite, mossy stone, terracotta, a Ceramic group (white, celadon, cobalt and tenmoku glazes that pool darker in recesses, plus unglazed bisque), brushed stainless, anodised blue, red and black, verdigris copper, and silk PLA in gold and copper. New **Surface finish** under Patina: enamel or epoxy fill (flush, in a chosen colour, adjustable height), laser burn (darker the deeper the cut), proof and reverse proof. New **Size reference** in the Board card: a ruler or a bank card at true size beside the board. View only; exports are unchanged.

### Run passes warns when the normal model isn't loaded
Instead of quietly running depth only (much less detail), the first press explains and points to Setup; pressing Run again goes ahead with depth only. Uploaded normals count as loaded.


## New in 2.0.2

### Max quality normals (Generate)
Runs each normal tile a second time with the picture shifted by half a model patch (7 px at model size) and averages the two. The model's patch grid lands in different places and cancels out, instead of being cleaned up afterwards; tiles also blend over their full overlap. About 2× normal-pass time. Tested on 10 projects: up to half the grid ripple on flat areas where the grid showed (Doge, USMC), 12–34% less elsewhere, detail unchanged (within 1–2%). For the most fine detail, use it with Normal tiles at 4 across: on David, 4 across gave 16% more fine detail and 12% less ripple than 3 across.

### Add fine detail from the picture (Generate)
Adds the picture's finest light-and-dark texture to the normals' slopes (guided-filter detail transfer), with subtle / normal / strong amounts. Clear gains on hair, fur and engraving; best on stone- or clay-style pictures, since on colourful photos painted patterns turn into bumps too. Applied live when the relief is built, never baked into the project: it can be changed or turned off any time, and it's saved with the project and covered by undo.

### Save and Open remember your folder
Save dialogs open in the folder of the last file of that kind you saved, and Open project in the folder of the last project, kept between visits (Chrome and Edge; the desktop app already did this).

### Tested and dropped
MoGe's own depth as a second opinion (it only flattened the relief by 0.2–2.8%; no front-to-back fixes), a whole-image pass to steer tiles (mostly added perspective tilt), and multi-look combinations (grid moved, smaller tiles averaged, median of four): none beat the shift average per pass.

## New (2.0.0 / 2.0.1)

### Process sim (its own tab, next to 3D)
Shows what your machine can actually make of the relief: a CNC bit, a filament or resin 3D printer, or a laser. Pick **Process sim** in the tab bar. The picture shows the result and a panel on the right holds all its settings. Any change re-runs it straight away, without touching Export.
- **Its own piece size** (width and depth), copied from Export the first time; **Copy size from Export** syncs it again.
- **CNC bits:** ball-nose, tapered ball-nose, V-bit, flat end mill and **bull-nose** (flat end with rounded corners, new). V-bit: full V angle, tip width and **bit width**. It warns when the relief is deeper than the V's cone can reach, since the shank would then rub. **Stepover** (ball, tapered, bull-nose): shows the ridges left between finishing passes and gives their height.
- **3D printing:** layer height and line width (filament), layer height and pixel size (resin), each explained in plain words.
- **Print angle** (filament and resin): flat face up, tilted 30°, 45° or 60°, or standing up. Each layer is the slice at its middle, extended across the layer's thickness, so within a layer the surface is just two flat faces: the layer's edge and its flat top. It isn't a copy of the true surface. The steps' size depends on how much the surface faces the build direction (tested: a flat field at 60° gives a clean sawtooth with no variation along each layer). Flat prints terrace on gentle slopes; standing prints trade that for fine layer lines. Faces pointing down more than 45° are shown in **amber** (they need supports). The result gives the average surface error, so the angles can be compared: on the David, flat 0.050 mm against 0.004 mm standing up (0.2 mm layers). On a test ramp the errors match the stair-step formula (half a layer flat; 0.0025 mm standing). Resin defaults to 30°. See `print-orientation.png`.
- **Laser:** fibre, diode or CO₂ fill in typical values; spot size, **wall angle** (new, now editable) and depth per pass.
- A short "What is this?" explains what the sim is and isn't. A colour key sits under a plain-language result list (what fills in, what's lost, ridge height, layers or passes).
- **Show** in the bottom bar switches between differences, the finished surface and the design. Exports are never changed by the sim.
- Checked against hand calculations: ball-nose ridges at 1 mm stepover with a 3 mm bit come out 0.0858 mm (theory 0.0858) and with a 6 mm bit at 2 mm, 0.1716 mm (theory 0.1716). A bull-nose's corner fillet matches its corner radius exactly. The earlier groove checks for ball, V-bit, tapered and printing still hold.

### Mould draft (Edges → Mould draft)
- 0–20° from vertical. No wall in the output is steeper than 90° minus the draft, so casts release from silicone or rigid moulds.
- Only adds material at the foot of steep walls. Tops, the field and fine detail are never lowered.
- Works in real units from Export, including in the half-resolution preview.
- Verified: at 5° on the test coin, the steepest wall in the exported 16-bit PNG is exactly cot 5° = 11.43 mm per mm.

### Autosave and restore
The open project is saved inside the browser about once a minute, only when something has changed and nothing is computing (about 2 s of packing on a 2048 px project). On the next start, Setup offers **Restore last session** with the project's name and when it was saved. It covers crashes, graphics-driver resets and closed tabs. One session is kept, the latest.

### Undo / redo for settings
**↶ Undo / ↷ Redo** in the Preset card, or Ctrl+Z / Ctrl+Y (Ctrl+Shift+Z). Every settings change that updates the relief is a step, up to 150, including presets, sliders, layers, curve and mask choice. Mask painting and the touch-up brush keep their own undo while they're active. Decide for me's trial runs aren't recorded. History starts fresh with each project or image.

### My tools (Process sim)
Save the bit, printer or laser currently set in the Process sim under a name, and pick it again from **My tools** next time. Tools are kept in the browser; **Export** and **Import** move them as a file. `my-tools.json` holds the nine bits from your box (flats, O-flutes, compression, 1/4″ ball, 1/16″ tapered ball 5.4°, 60° and 90° V-bits), ready to import.

### Process sim in 3D
The Process sim tab has a **Picture / 3D** switch at the top of its panel. In 3D, the surface your tool or printer would make is shown at real size and you can orbit it, with the settings panel still on the right. **Show** picks what's on it: *Differences* wraps the red / blue / amber picture over the made surface, *As made* shows the bare made surface, *Design* shows the original. The board takes the sim's width and depth, and the 3D viewer's own side panel is hidden there so the sim panel has the room. Changing a setting re-runs the sim and updates the 3D. The 3D tab itself always shows the design (its old Show → As made selector is gone).

### Mask focus
Clicking the **Mask** tab brings the Background & mask card forward: it jumps to Sculpt, opens the card, scrolls to it and dims the other cards (hover one to bring it back). Leaving the Mask view puts the panel back exactly as it was: same step, scroll position and open or closed card. If you move to another step yourself while in the Mask view, it leaves you there.

### Plainer descriptions
Every slider's hover help is rewritten: what it does, in bold, then what higher and lower do, plus a tip where it helps. Card notes in Sculpt and Export and several button hints are simpler too.

### Pixel settings show millimetres
Smooth, Smooth after layers, Normal denoise, Mask cleanup and Edge roundover now show their real size next to the pixel value, for example `6 · 0.59 mm`. The size follows the panel width in Export.

### Desktop app (desktop/ folder + GitHub workflow)
- Electron app that runs the same `index.html` in its own window. Pushing a tag (e.g. `v2.0.0`) makes GitHub build a Windows portable .exe plus a Linux AppImage and .deb, attest them, and attach them to a draft Release.
- **AI runtime order:** WebGPU first (as in the browser), then the native CPU runtime (much faster than the browser's CPU path), then the browser's CPU path. DirectML (Windows) is an opt-in checkbox in Setup → Graphics. On an NVIDIA Turing card it was no faster than WebGPU (38.6 s vs 36.4 s for the same passes) and returned a broken map for the fp16 DA3 depth model, while MoGe was fine. If a native runtime returns a broken map (NaN, or a flat image), that model switches to the browser runtime automatically and the passes carry on; the check is written to `main.log`.
- **Graphics card:** the app asks for the high-performance GPU, and on Windows sets its own per-app graphics preference once (only if none is set), so DirectML uses it too. Before this, WebGPU picked the built-in Intel graphics on a PC with an NVIDIA card.
- **Windows downloads:** setup.exe (per-user install, recommended), .zip, portable .exe. On some PCs the portable .exe closes at once: it unpacks to Temp, and if Temp's permissions don't let Chromium's sandbox read it, Electron stops at start-up (seen and confirmed in the log on the test PC).
- **Start-up log** at `%APPDATA%\Relief Forge\main.log`, plus local crash dumps. Tested here with small test models on the native CPU runtime (fp16, fp32 and int64 inputs and outputs). DirectML itself needs a real Windows machine to test.
- Native save dialogs (remembering the folder per kind of file), and only paths picked in a dialog can be written. Window size is remembered, links open in your browser, and the CDN scripts are kept for offline use.
- `index.html` changes: the native runtime hook, tensors built without onnxruntime-web if it didn't load, and the Graphics switch (desktop only). The web version behaves as before; the export test still matches.

### Saving reworked
- **Every save asks where.** The PNG, STL, normal map, project, preset and tool exports each open a Save dialog (Chrome / Edge) with a suggested name. It remembers the last folder for each kind of file. Cancelling saves nothing. Other browsers simply download as before. The shared *File name* box is gone.
- **Project Open / Save in the header** (top left, from any step), with **Ctrl+S** / **Ctrl+O**, and a .relief file (or an image) dropped anywhere on the window opens it. The Project card in Export is gone.
- **Version number** next to the title (v2.0.0), also stored in saved projects.
- All saving goes through one function (`saveAs`), with a hook (`window.rfNative`) for the desktop build's native dialogs.

### Speed-ups
Measured on a slow 2-core test machine with the David statue (your machine will be faster across the board). Every result is bit-for-bit the same as before: the export test and all the compared outputs match exactly.

| | Before | After |
|---|---|---|
| Moving **Depth anchoring size** | 8.0 s | 3.1 s |
| **Decide for me…** | 53 s | 27 s |
| Process sim (ball-nose, preview) | 1.1 s | 0.6 s |
| Autosave after a settings change (the brief freeze) | 1.5 s | 0.1 s |

- The anchored base's plain normal integration doesn't depend on the anchoring size, so it is kept and reused. Moving that slider, or trying presets that differ only in it, skips the biggest solve.
- A mask rebuilt with the same result (a preset or undo touched a mask setting) keeps its old arrays, so everything cached against the mask stays valid. This is most of the Decide for me gain.
- The CNC simulation's tool shape check takes a fast path away from the borders.
- Autosave and Save project pack the depth, normals and image once and reuse them; only settings and brushwork are re-packed.
- Smaller savings in wide blurs, row blurs and the field levelling fit.
- **Previews solve the anchored base at half size** (exports always use the full-size solve). First preview with an anchored preset: 8.0 s → 4.9 s; Decide for me: 27 s → 26 s. Checked against the full-size export, scaled down: the preview now matches it more closely than before (coin: 6.5% → 0.6% of the height range, RMS; David: 1.06% → 1.01%). The old preview mixed a full-size base with everything else at half size, which sat the coin's subject about 6% off.
- Not changed: the core height solver (most of a Shape slider's time). It is already memory-bound; making it faster would change results slightly, so it stays as it is.

## Fixed
- The preset list is now Relief Forge's own drop-down instead of the browser's. Chrome on Windows sometimes closed the browser's list straight after the first click. The new list shows the groups (Recommended in bronze) and works with the arrow keys, Enter and Esc.
- Undo could skip a step when a change arrived while the relief was still being computed: the first Ctrl+Z did nothing and the second jumped two steps. Each change is now recorded as soon as it settles.
- Opening a project no longer carries over settings that didn't exist when it was saved (for example Rim lock or Depth anchoring size from the previously open project); they now start at their neutral value.
- `Core.poisson` no longer throws on odd image sizes. It pads by repeating the last row or column, which is exact. The import path already rounded to even sizes, so this only guards future code paths.

## Round 2: settings sweep, anchored base, patch-grid cleanup

### New base: Normals · anchored to depth (Sculpt → Base)
Plain normal integration gets fine detail right but drifts at broad scale (a face can tilt or bowl, so the order front-to-back is lost). The depth map has the order right but little detail. The new base solves for the height whose slopes match the normals while staying close to the depth (screened Poisson: minimise |∇h − g|² + λ|h − depth|²). Forms smaller than **Depth anchoring size** (% of the long side, default 3) follow the normals; larger forms follow the depth.
- Unmasked: exact solve by DCT. Masked: the broad correction is solved on a shrunk grid with walls at the outline, then scaled back up within the subject only.
- Depth models smear thin parts (horn tips, fingers) into the background, so anchoring fades out within one anchoring size of the outline; thin parts follow the normals from the body they hang off. (Without this a horn tip on one test project was pulled 200 units below everything else.)
- Broad-order score (correlation of broad relief with broad depth) went from 0.20 → 0.97 on the GAZ coin and 0.63 → 0.95 on the David statue, with fine detail unchanged.

### Remove patch grid from normals (Generate, on by default)
The normal model leaves a faint lattice (one cell per image patch, 17.5 px at 2048 px) that shows as waffle texture on flat backgrounds. It is found automatically per project (period search over 6–48 px, strength check) and subtracted block by block, using flat-facing pixels only so real detail isn't touched. Found on 3 of the 4 projects with stored normals; on the fourth nothing stood out, so nothing was changed. The status next to the checkbox says what it did. See `patch-grid-before-after.png`.

### Recommended presets (new preset group, top of the list)
Tested ~180 setting combinations (98 random on the original bases, 75 on the anchored base, plus follow-ups) on 7 projects, then checked the picks on 11 more, all at half resolution. Each result was scored on fine and mid detail fidelity against the normals, broad order against the depth, field flatness (coins), grain and clipping. The picks:

| Preset | Best for | 18 projects: mean score · mean rank of 8 · beats NHeavyDat |
|---|---|---|
| Anchored · all-rounder | Safe default: never worse than 5th on any project | 0.867 · 3.4 · 16/18 |
| Anchored · coin & medal | Coins, medals, emblems | 0.853 · 3.6 · 17/18 |
| Anchored · keeps volume | Top scorer on 9 of 18, coins and figures alike; can look soft on faces | 0.883 · 2.1 · 15/18 |
| Anchored · crisp contrast | Punchier modelling | 0.831 · 5.6 · 15/18 |
| Crisp · classic base | The original auto base, crisper than NHeavyDat | 0.832 · 5.9 · 14/18 |
| *NHeavyDat (for reference)* | | 0.779 · 6.9 |

The 18 projects: the original 7, plus 11 added later (ElizCoin, USMC, VikingCoin, RampantLion, Aquila, bull, Dinosk, Fullskullpanel, GeraltRender, Luciferpanel, and RealcoinPhoto, a real photo of a gold coin rather than a white-stone render). The anchored presets held up on the real photo too (0.87 vs NHeavyDat 0.62).

Findings:
- Plane and dome levelling help coins (flat field) but hurt figures; on the anchored base most levelling is unnecessary, as the depth already keeps the field in order.
- The metrics reward true volume. By eye, *Anchored · figure* is a little soft around eye sockets on the David; *Anchored · crisp contrast* and *Crisp · classic* read punchier. Pick by look.
- `sweep-presets.json` holds the five presets in the app's import format; `sweep-presets-compare.png` and `sweep-presets-compare-2.png` show them on 17 of the projects.

### Tested on 15 more photo / stone pairs
Bark, Brooklyn Bridge, brick, a car, a cat, a clock mechanism, a dog, an engine, a feather, a fish, a gothic window, an iguana, snake scales, the space shuttle and the Statue of Liberty, each as a raw photo and a white-stone render. See `photo-vs-stone-a.png` and `photo-vs-stone-b.png`.
- Anchored · all-rounder, Crisp · classic and Anchored · crisp contrast look best on these; Anchored · keeps volume goes soft on scenes and textures.
- Stone renders help most on objects with colour or shine (car, clock, engine, fish, iguana, cat). For surface textures (bark, brick, scales) the raw photo does about as well.
- A small subject in a big scene (Statue of Liberty) wastes the depth on the scene: crop to the subject first.

### Preset list tidied
- **Recommended (tested on 22 projects)** is now the first group: the four anchored presets, Crisp · classic base, and Neutral · base only.
- All older presets (NHeavyDat, Statue, Coin, Emblem, Portrait…) are kept, under groups labelled **Legacy ·**.
- **A new image starts from Anchored · all-rounder** after its passes run, if no preset is chosen yet and normals are available. Opening a saved project keeps that project's own settings.
- **Presets keep your edge settings.** Edge smoothing, edge softness, mask cleanup, lift, roll-off, roll-off landing, roundover and mould draft stay as you set them, unless the preset sets them itself (NHeavyDat and the Statue presets set a roll-off). **Reset all** still clears everything.

### Decide for me… (Preset card)
Tries each Recommended preset on the image at preview size, scores it, and shows all five as shaded thumbnails with the scorer's pick marked. Click one to apply it; until you do, your own settings are left as they were.
- The score combines fine and mid detail (relief slopes vs the normals), order (broad relief vs the depth map) and, for coin-like pieces, how flat the field stays. Grain and clipping count against. How much the flat field counts follows how much of the subject faces straight out, so coins and figures are scored differently without a switch; the panel says how it read the piece.
- Each result also gets credit for its detail budget (how much of the height goes on detail rather than broad form), relative to the best of the five. Without that, the scorer picked the softest preset on 40 of 52 test projects, including ones where it looked washed out (a car, the Statue of Liberty, a feather). With it, picks spread across the presets and match the look much better. It still shows all five rather than applying one silently.
- 25–60 s on a slow 2-core test machine; faster on a normal desktop. Scores match the offline sweep exactly.
 (a stop sign and a burger, each as flat art and as a white-stone render; see `flat-art-compare.png`): the anchored presets came out best on all four. Signs and lettering work fine straight from flat art; objects with real 3D form (food, creatures) come out much richer from the stone render.

With all new settings off and the test project, the 16-bit PNG export is still byte-identical to the original.

### Rim lock (Edges → Rim lock, coins)
Gives a coin's rim one exact profile all the way round, so it sits level at its own height everywhere.
- Every point within the set width of the outline takes the robust average height (trimmed mean) of all points at the same distance from the outline. Highs are clipped and lows raised to that average. It works for any outline shape: a circle, an octagon, a shield.
- On the rim's steep walls a fraction of a pixel of error in the distance becomes a visible step, which showed as radial streaks. So the correction is measured where the profile is gentle (rim top, field) and carried smoothly across the walls: the walls move with the rim rather than being redrawn.
- Width is in px with mm shown, like the other pixel settings. **Double-click the slider to find the rim automatically.** It finds the biggest step down within the outer 10% and stops at the foot of that wall, and it refuses when there is no clear rim (the David, for example). Keep decorated bands (rope, braid, lettering) outside the width: anything inside it becomes plain.
- Applied at the end, after the edge roll-off and roundover and before Full range and Mould draft. Anti-aliased outline pixels and everything inside the width are untouched. Needs a mask.
- The lock never ends on a wall. If the width lands partway up a slope (the inner wall of a rim groove, say), the end moves out to the next gentle ground and the fade runs there. Across walls the correction falls back to a wider average where there is little gentle ground nearby. This fixed lines and dots that showed only in full-size output on the lion shield (`rim-lock-banding-fix.png`).
- Tested on the GAZ coin, both Queen coins, USMC, Viking and the stop sign: auto widths of 50–80 px at 2048 (the same at preview size), and the spread of heights around the rim dropped 4–6×. See `rim-lock-before-after.png`.

### Recover from GPU failures without restarting the browser
A driver reset (running out of video memory, a game or video grabbing the GPU, a driver hiccup) used to leave the depth and normal passes failing until Chrome was restarted.
- The app now watches for the GPU being lost. When it happens, or a pass fails with a GPU error, a **Recover GPU** button appears next to Run and in Setup → Graphics.
- Recover releases the models, asks the browser for the GPU again, and rebuilds the models from the local cache, so nothing is downloaded again. Your image, mask and settings stay; run the passes again.
- If the browser won't give the GPU back, the models load on the CPU instead so you can carry on (slower). Chrome switches the GPU off for the rest of the browser session after GPU crashes, so getting the GPU back then still needs a browser restart. The same happens if the GPU fails again straight after a recovery. Press Recover again later to retry the GPU.
- Tested with a simulated device loss and with no GPU available; not yet on a real driver reset.

## Files
- `index.html`: the updated app.
- `test-coin.relief`: a synthetic test project (a coin with rim, lettering and hair grooves 0.4–2.3 mm wide on a 200 mm panel). Open it in Setup → Open project, then open Export → Preview as made.
- `process-sim.png`: the Process sim tab on the GAZ coin.
- `README.md`: features list updated.
- `my-tools.json`: your bits, to import into Process sim → My tools.
- `rim-lock-before-after.png`: rims before and after Rim lock, shading exaggerated.
- `photo-vs-stone-a.png`, `photo-vs-stone-b.png`: the 15 photo / stone pairs under five presets.
- `sweep-presets.json`, `sweep-presets-compare.png`, `sweep-presets-compare-2.png`, `patch-grid-before-after.png`: from the settings sweep.

The embedded 3D viewer (`VIEWER_HTML`) only gained what the Process sim's 3D mode needs: a colour overlay as a skin, a compact mode without its side panel, and taking the board size from the app.
