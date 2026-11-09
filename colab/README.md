# 🎬 Remotion 3D Animation & Google Colab GPU Rendering Guide

This setup allows you to build **3D animations with Three.js**, add **animated captions & audio** in Remotion, preview smoothly on your laptop, and render final high-definition MP4 videos using free **Google Colab Cloud GPU acceleration**.

---

## 🏗️ Architecture

- **3D Engine**: Three.js + React Three Fiber (`@remotion/three`, `three`, `@react-three/fiber`, `@react-three/drei`)
- **Captions & Subtitles**: Remotion animated overlay with word highlighting (`src/components/Captions/CaptionsOverlay.tsx`)
- **Audio & Sound**: Remotion audio manager with fade envelopes (`src/components/Audio/AudioTrack.tsx`)
- **Compositions**:
  - `ThreeDAnimation`: 9:16 vertical (1080x1920) for TikTok, Reels, YouTube Shorts.
  - `ThreeDAnimationLandscape`: 16:9 widescreen (1920x1080) for YouTube / desktop.

---

## 💻 1. Local Development (Previewing on your laptop)

You do **not** need a GPU on your laptop to design and preview animations in real time.

Start the Remotion Studio:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You can scrub through frames, tweak 3D shapes, adjust colors, and edit captions live.

---

## ☁️ 2. Rendering on Google Colab (Free GPU)

Rendering 3D frames can be computationally heavy. Google Colab provides free NVIDIA GPUs (T4 / A100) with WebGL acceleration.

### Step-by-Step Instructions:

1. **Open Google Colab**:
   - Go to [colab.research.google.com](https://colab.research.google.com).
   - Click **File** ➔ **Upload notebook** ➔ select [`colab/Render_Remotion_3D_GPU.ipynb`](./Render_Remotion_3D_GPU.ipynb).

2. **Select GPU Runtime**:
   - In Colab, click **Runtime** ➔ **Change runtime type**.
   - Under **Hardware accelerator**, select **T4 GPU** (or any GPU).
   - Click **Save**.

3. **Provide Your Code**:
   - **Method A (GitHub - Recommended)**: Push your repo to GitHub and run:
     ```bash
     !git clone https://github.com/<YOUR_USER>/<REPO>.git /content/AIVideo
     %cd /content/AIVideo
     ```
   - **Method B (Zip Upload)**: Zip your project folder (without `node_modules`), drag it into the Colab file explorer on the left, and run:
     ```bash
     !unzip -q -o /content/AIVideo.zip -d /content/AIVideo
     %cd /content/AIVideo
     ```

4. **Run the Notebook Cells**:
   - Step through the notebook cells or click **Runtime** ➔ **Run all**.
   - The notebook will automatically install Node.js 22, FFmpeg, and render using GPU flags (`--gl=angle`).
   - When finished, the `.mp4` file will automatically download to your computer!

---

## 🎨 3. Customizing Your 3D Animation

- **3D Meshes & Lights**: [`src/components/ThreeDScene/Scene3D.tsx`](../src/components/ThreeDScene/Scene3D.tsx) & [`FloatingObject.tsx`](../src/components/ThreeDScene/FloatingObject.tsx)
- **Captions & Text**: [`src/components/Captions/CaptionsOverlay.tsx`](../src/components/Captions/CaptionsOverlay.tsx)
- **Audio & Music**: Place any `.mp3` or `.wav` in [`public/`](../public/) and pass the filename to the `audioUrl` prop.

