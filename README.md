<p align="center">
  <img src="docs/images/logo.svg" width="96" alt="">
</p>

<h1 align="center">Relief Forge</h1>

<p align="center"><b>Turn a picture into a carvable relief.</b><br>
Height maps and STLs for CNC, fibre-laser engraving, 3D printing and moulds, made in your browser.</p>

<p align="center">
  <a href="#get-it">Get it</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="docs/Relief-Forge-Basics.pdf">User guide (PDF)</a> ·
  <a href="#licence">Licence</a>
</p>

![Relief Forge: a coin portrait in the Sculpt step](docs/images/sculpt.png)

---

## What it does

Relief Forge turns an ordinary picture into a **height map**: a greyscale image where **white = high** and **black = low**. CNC routers, fibre lasers and 3D printers read that grey as depth, so your picture comes out as a raised, carved object: a coin, a medal, a badge, a stone panel or a statue relief.

Two AI models look at your picture. One estimates **distance** (depth), the other estimates **surface direction** (normals). Relief Forge blends the two into a clean relief, then gives you presets and sliders to shape it, a live 3D preview, and export to 16-bit PNG, STL and more.

**Everything runs on your own computer.** Pictures are never uploaded. The AI models download once and are cached by your browser.

## Features

- **Image → height map** with Depth Anything 3 (depth) and MoGe-2 (normals), fused into one relief
- **Tiled passes** for extra detail on large images
- **Presets** for statues (shallow / deep), coins, challenge coins and emblems, plus your own saved presets
- **Background masking**: automatic, flat-colour pick, transparency, or paint it yourself
- **Shape, finish and edge controls**: levelling, detail EQ, crease deepening, soft roll-off to the background
- **Layers** to blend in other maps, before or after shaping
- **Touch-up brush**: raise, lower and smooth directly on the result
- **Live 3D showroom** with materials (metals, wood, stone, resin…), lighting, and a "skin" view of your original picture on the model
- **Export**: 16-bit PNG, STL (with optional silicone pour box and print-bed splitting), normal map, and `.relief` project files
- **Mould mode**: invert and mirror for casting

## Get it

| | |
|---|---|
| **Use in the browser** | [Open Relief Forge](https://snazzygaz.github.io/DepthNormal/) |

Open it in **Chrome** or **Edge**. No installation and no account are needed.

### What you need

- A recent Chrome or Edge on Windows, macOS or Linux
- A graphics card with WebGPU support for good speed. Without one it still works on the CPU, just slowly.
- About 1 GB of free space for the AI models, and an internet connection for the first run
- **A good picture**: high resolution, sharp, evenly lit, with the subject separated from its background (transparent or a single plain colour). AI image editing can help prepare one.

> **Linux:** WebGPU is on by default in Chrome only for some GPUs (e.g. Intel Gen12+, recent NVIDIA on Wayland). On others it falls back to the CPU unless Chrome is launched with WebGPU enabled.

## How it works

| Step | What you do |
|---|---|
| **1 · Setup** | Load the depth and normal models. Slow only the first time. Or open a saved `.relief` project. |
| **2 · Generate** | Add your picture and press **Run passes**. |
| **3 · Sculpt** | Pick a preset, adjust the sliders, and watch the Shaded and 3D views update. |
| **4 · Export** | Download the 16-bit height map, an STL, the normal map, or save the project. |

### Which preset?

| Subject | Preset |
|---|---|
| Starting from scratch | **Neutral · base only** |
| Not sure / anything | **NHeavyDat** |
| Statue, figure, carving | **Statue · shallow** or **Statue · deep** |
| Coin or medal with a face | **Coin · stepped portrait** or **Coin · crisp, keeps steps (OG2)** |
| Busy challenge coin | **Coin · challenge / busy art** |
| Badge, crest, emblem | **Emblem · stepped crest** |

![3D showroom](docs/images/3d.png)

The full walkthrough, with every panel explained in plain English, is in the **[user guide (PDF)](docs/Relief-Forge-Basics.pdf)**.

## Tips

- **Input quality beats settings.** A sharp, clean, cut-out picture gives a cleaner relief than any slider can.
- Use the **16-bit PNG** for CNC and lasers. 8-bit gives visible steps.
- **Shaded** is the easiest view for judging the result. **3D** shows how it will really look.
- If you get a **"device lost"** error, close other GPU-heavy programs, lower *Normal detail*, and reload the page.
- Save a **project** (`.relief`) to come back later without re-running the AI.

## Licence

**Relief Forge** © 2026 Garyck Arntzen. Free to use. All rights reserved: no copying, modification or redistribution of the application without permission. Provided as is, without warranty. The reliefs you make with it are yours.

### Third-party components

| Component | By | Licence |
|---|---|---|
| Depth Anything 3 · Mono Large | ByteDance Seed (Depth Anything team) | Apache 2.0 |
| DA3 Mono Large ONNX conversion | Jens Duttke | Apache 2.0 |
| Depth Anything V2 · Large / Base *(optional)* | Depth Anything team; ONNX by onnx-community | CC BY-NC 4.0, **non-commercial only** |
| MoGe-2 normal models | Microsoft | MIT |
| DINOv2 (inside MoGe-2) | Meta AI | Apache 2.0 |
| ONNX Runtime Web | Microsoft | MIT |
| three.js | three.js authors | MIT |
| Manrope, IBM Plex Mono | Mikhail Sharanda; IBM | SIL Open Font Licence 1.1 |

The AI models are downloaded from Hugging Face on first use and are not part of this repository. Full licence texts are on each project's page.

> **Commercial use:** use Depth Anything 3 for depth. Depth Anything V2 Large/Base are for non-commercial use only.
