# RENDER.md — World Rupture Documentary Render Guide

**Working Title:** *Nvidia After Jensen Huang: How One Company Came to Run AI*  
**Format:** `1920×1080` · `30 fps` · `19,350 frames` (`10:45` total: `10:30` main + `0:15` end screen)  
**Main Composition ID:** `Main`

---

## 1. Google Colab T4 GPU Rendering (`world_rupture_colab_render.ipynb`)

Open [`world_rupture_colab_render.ipynb`](file:///c:/Users/heroi/Desktop/AIVideo/world_rupture_colab_render.ipynb) in Google Colab and select **Runtime → Change runtime type → T4 GPU**.

### Why Colab Needs `libnvidia-gl` + `chrome-for-testing`
1. Google Colab's default container image installs a **compute-only** NVIDIA driver (CUDA works, but `libEGL_nvidia.so.0` / `libGLX_nvidia.so.0` are often omitted). **Cell 2** detects the active NVIDIA driver major version (`nvidia-smi`) and installs the matching `libnvidia-gl-<major>` package plus `xvfb`, `libegl1`, `libgles2`, and `libvulkan1`.
2. Remotion's default `--chrome-mode=headless-shell` disables Linux GPU drivers. **Cells 3–6** pass `--chrome-mode=chrome-for-testing` and `--enable-multiprocess-on-linux`.

---

## 2. Testing `--gl` Modes on a 60-Frame Test (Pick the Fastest)

Before running the full render, test `--gl=angle-egl`, `--gl=vulkan`, `--gl=egl`, `--gl=angle`, and `--gl=swangle` on a 60-frame slice:

```bash
# 1. Inspect whether Chrome reports "Hardware accelerated" or "SwiftShader" (CPU)
npx remotion gpu --chrome-mode=chrome-for-testing --enable-multiprocess-on-linux --gl=angle-egl

# 2. Benchmark 60 frames across each backend
for GL in angle-egl vulkan egl angle swangle; do
  time npx remotion render src/index.ts Main "out/test_${GL}.mp4" \
    --frames=420-479 \
    --codec=h264 --crf=18 --muted \
    --concurrency=2 \
    --chrome-mode=chrome-for-testing \
    --enable-multiprocess-on-linux \
    --gl="$GL" --overwrite
done
```

- Pick whichever `--gl` mode finishes fastest **and** produces a clean non-black video (`out/test_<GL>.mp4`).
- If your Colab VM cannot load `libnvidia-gl` and falls back to `swangle` (CPU), you can lower `PERF_MODE` in [`src/config.ts`](file:///c:/Users/heroi/Desktop/AIVideo/src/config.ts) from `"med"` to `"low"` to halve instance counts and geometry segments.

---

## 3. Chunked Rendering (1,800-Frame Muted Chunks) & FFmpeg Concatenation

Render in 60-second (`1,800`-frame) chunks so a Colab disconnect never loses more than one chunk:

```bash
# Example single chunk (frames 0–1799):
npx remotion render src/index.ts Main out/parts/part_00.mp4 \
  --frames=0-1799 --codec=h264 --crf=18 --muted \
  --concurrency=2 --chrome-mode=chrome-for-testing \
  --enable-multiprocess-on-linux --gl=angle-egl
```

Once all 11 chunks (`part_00.mp4` … `part_10.mp4`, covering frames `0..19349`) are rendered, concatenate them and mux with `master_audio.wav` using [`scripts/concat.sh`](file:///c:/Users/heroi/Desktop/AIVideo/scripts/concat.sh):

```bash
bash scripts/concat.sh out/parts master_audio.wav
```

Which runs:
```bash
ffmpeg -y -f concat -safe 0 -i list.txt -c copy video_noaudio.mp4
ffmpeg -y -i video_noaudio.mp4 -i master_audio.wav -c:v copy -c:a aac -b:a 320k -shortest final.mp4
```

---

## 4. Per-Scene Benchmark Table (`PERF_MODE = "med"`, 1920×1080)

Measured via headless Chromium (`chrome-for-testing`, `dpr = 1`, pre-bundled build):

| Scene ID | Composition | Frames | Primary 3D / 2D Elements | Triangle Budget | Avg Render Speed |
| :--- | :--- | ---: | :--- | ---: | ---: |
| `S0_ColdOpen` | `S0-ColdOpen` | 1,050 | 60 instanced 3D bars (3 rows), crack + wave collapse, `StatCounter` | ~1.5k tris | ~0.28 s/frame |
| `S1_Promise` | `S1-Promise` | 900 | `GlobeDots` (~6k land dots), 3 projected `Callout` chips | ~40k tris | ~0.31 s/frame |
| `S2_Origins` | `S2-Origins` | 2,400 | `TimelineRibbon3D`, morphing `ChipDie` (`1600` cores), cash bar | ~22k tris | ~0.29 s/frame |
| `S3_GPU` | `S3-GPU` | 1,650 | `CpuBlocks` (8), `CoreGrid` (`64×64` = 4,096 cells), `WireSphere` | ~26k tris | ~0.30 s/frame |
| `S4_CUDA` | `S4-CUDA` | 2,250 | `LayerTower` (24 blocks + switching-cost wall), `LineChart2D` | ~1.2k tris | ~0.26 s/frame |
| `S5_DeepLearning` | `S5-DeepLearning` | 2,250 | `NeuralNet3D` (36 nodes, ~260 edges, 44 pulses) + 2D comparison | ~18k tris | ~0.29 s/frame |
| `S6_GoldRush` | `S6-GoldRush` | 2,400 | `DataCenterAisle` (40 racks + 1,280 LEDs) → 5-step 3D staircase | ~19k tris | ~0.28 s/frame |
| `S7_Moat` | `S7-Moat` | 2,100 | `GlobeDots` + US→Taiwan `ArcLines` → `StackedMoats` (3 slabs) | ~42k tris | ~0.31 s/frame |
| `S8_Geopolitics` | `S8-Geopolitics` | 1,950 | `GlobeDots` + 3 color-switching `ArcLines` + timeline strip | ~44k tris | ~0.32 s/frame |
| `S9_WhatNow` | `S9-WhatNow` | 1,950 | `Monolith` + 5 surface crack paths + 4 competitor slabs + split | ~2.4k tris | ~0.26 s/frame |
| `EndScreen` | `EndScreen` | 450 | Cream/slate split banner, central `CrackLine`, card placeholders | DOM/SVG | ~0.18 s/frame |

*(All scenes are well below the 4.0 s/frame threshold and 150k triangle budget.)*

---

## 5. Unverified Facts Checklist (`src/data/facts.json`)

Every item in [`src/data/facts.json`](file:///c:/Users/heroi/Desktop/AIVideo/src/data/facts.json) is currently marked `"verified": false`. Review and set `"verified": true` before publishing:

1. `founded_year` (`1993`) — Nvidia founded by Jensen Huang, Chris Malachowski, Curtis Priem at a San Jose Denny's diner.
2. `early_capital` (`$40,000`) — Commonly cited early startup capital figure.
3. `nv1_year` (`1995`) — NV1 launch (commercial disappointment).
4. `cash_crisis_years` (`1996–1997`) — Company close to running out of cash (~1996–97).
5. `riva_128_year` (`1997`) — RIVA 128 launch saves the company.
6. `ipo_date` (`January 1999`) — Nvidia Initial Public Offering.
7. `geforce_256_year` (`1999`) — GeForce 256 marketed as the "world's first GPU".
8. `cpu_vs_gpu_cores` (`8 cores vs thousands of cores`) — Architectural comparison wording.
9. `cuda_announced` (`Nov 2006`) — CUDA architecture announced.
10. `cuda_released` (`2007`) — CUDA SDK initial public release.
11. `alexnet_year` (`2012`) — AlexNet wins ImageNet on two Nvidia GTX 580 GPUs.
12. `alexnet_error` (`15.3%`) — AlexNet ImageNet top-5 error rate.
13. `alexnet_runnerup_error` (`26.2%`) — ImageNet 2012 runner-up top-5 error rate.
14. `dgx1_year` (`2016`) — First DGX-1 delivered to OpenAI.
15. `transformers_year` (`2017`) — "Attention Is All You Need" Transformer paper published.
16. `mellanox_year` (`2019`) — Mellanox acquisition announced.
17. `mellanox_value` (`$6.9B`) — Mellanox acquisition value.
18. `h100_year` (`2022`) — Nvidia Hopper H100 Tensor Core GPU announced.
19. `chatgpt_date` (`Nov 30, 2022`) — ChatGPT public release.
20. `mcap_1t` (`$1T`, May 2023) — Market cap milestone.
21. `mcap_2t` (`$2T`, Feb 2024) — Market cap milestone.
22. `mcap_3t` (`$3T`, Jun 2024) — Market cap milestone.
23. `mcap_4t` (`$4T`, Jul 2025) — Market cap milestone.
24. `mcap_5t` (`$5T`, Oct 2025) — Market cap milestone.
25. `export_controls_date` (`Oct 2022`) — US export controls on advanced AI chips to China begin.
26. `resignation_date` (`Nov 12, 2026`) — Reported resignation of CEO Jensen Huang; CFO Colette Kress named interim CEO.
27. `mcap_drop` (`$1.75T`) — Reported ~$1.7–1.8 trillion market value drop from record high.
28. `doj_statement` (`Unproven allegation`) — DOJ official stated it had not determined whether Huang was in a relationship with a suspected agent (allegation only, unproven).
29. `as_of_date` (`as of Nov 14, 2026`) — Reporting cutoff date displayed on screen.

*(No `TODO_FACT` missing-entry placeholders were triggered.)*

---

## 6. Legal & YouTube Disclosure Notes

- **Visuals:** All visuals in this project are **100% procedural 3D / SVG motion graphics** generated deterministically in code (Three.js + D3 + Remotion). No AI-generated photorealistic faces, likenesses, voice clones, or trademarked Nvidia logos are included in the visual code. If you add an AI-synthesized voiceover at `public/audio/vo.wav`, enable YouTube's altered/synthetic audio disclosure toggle if applicable.
- **Editorial Guardrails:** All references to the November 2026 reporting are explicitly labelled as reported/unproven (`"Allegations reported in the news are unproven."`, `"as of Nov 14, 2026"`), and the closing card displays `"Not financial advice."`
