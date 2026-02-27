# 🎬 AI Movie Director & ComfyUI Voice Recording Pipeline
## Comprehensive End-User Manual

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Prerequisites & Installation](#2-prerequisites--installation)
3. [ComfyUI Workflow: Voice Recording](#3-comfyui-workflow-voice-recording)
4. [Infinite Runner](#4-infinite-runner)
5. [Movie Director Pipeline](#5-movie-director-pipeline)
6. [Architecture & How It Works](#6-architecture--how-it-works)
7. [Troubleshooting](#7-troubleshooting)
8. [Performance Tuning](#8-performance-tuning)
9. [FAQ](#9-faq)
10. [Quick Reference Card](#10-quick-reference-card)

---

## 1. System Overview

This project contains **three interconnected systems**:

| Component | Purpose | File |
|-----------|---------|------|
| **Voice Recording Workflow** | ComfyUI workflow with LoadAudio to use your own voice recordings in LTX-2 video generation | `LTX2 Add Voice Recording.json` |
| **Infinite Runner** | Automatically queues and re-runs any ComfyUI workflow infinitely | `infinite_runner.py` |
| **Movie Director** | AI-powered pipeline that converts a plot into cinematic scene prompts using Qwen | `movie_director.py` |

### What This Is NOT
- ❌ Not a voice cloning system — it uses your **actual recorded voice**
- ❌ Not a video editor — it generates **prompts** for video generation tools
- ❌ Not cloud-based — everything runs **locally** on your hardware

---

## 2. Prerequisites & Installation

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| GPU VRAM | 8 GB | 16+ GB |
| System RAM | 16 GB | 32 GB |
| Storage | 20 GB free | 50 GB free |
| GPU | NVIDIA RTX 3060 | RTX 4080+ |

### Software Requirements

```bash
# System
Python 3.10+
CUDA 11.8+ (for GPU acceleration)
ComfyUI (latest, with custom nodes)

# Python packages (for Movie Director)
pip install torch transformers accelerate bitsandbytes

# Python packages (for Infinite Runner)
pip install requests websocket-client

# Alternative: Ollama (recommended for Movie Director)
# Install from https://ollama.ai
pip install ollama
ollama pull qwen2.5:7b
```

### ComfyUI Custom Nodes Required

These should already be installed if you're using the LTX-2 workflow:

- **ComfyUI-VideoHelperSuite** (VHS) — video combine/export
- **ComfyUI-KJNodes** — image resize utilities
- **ComfyUI-LTXVideo** — LTX-2 model support
- **Derfuu_ComfyUI_ModdedNodes** — type conversion utilities

### 📥 Models to Download

| Model | Size | Location | Download |
|-------|------|----------|----------|
| `ltx-2-19b-dev-fp8.safetensors` | ~10 GB | `models/checkpoints/` | [HuggingFace](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-19b-dev-fp8.safetensors) |
| `gemma_3_12B_it_fp8_e4m3fn.safetensors` | ~6 GB | `models/text_encoders/` | [HuggingFace](https://huggingface.co/GitMylo/LTX-2-comfy_gemma_fp8_e4m3fn/blob/main/gemma_3_12B_it_fp8_e4m3fn.safetensors) |
| `ltx-2-19b-distilled-lora-384.safetensors` | ~100 MB | `models/loras/` | [HuggingFace](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-19b-distilled-lora-384.safetensors) |
| `ltx-2-19b-ic-lora-detailer.safetensors` | ~100 MB | `models/loras/` | [HuggingFace](https://huggingface.co/Lightricks/LTX-2-19b-IC-LoRA-Detailer/blob/main/ltx-2-19b-ic-lora-detailer.safetensors) |
| `ltx-2-spatial-upscaler-x2-1.0.safetensors` | ~200 MB | `models/latent_upscale_models/` | [HuggingFace](https://huggingface.co/Lightricks/LTX-2/blob/main/ltx-2-spatial-upscaler-x2-1.0.safetensors) |

---

## 3. ComfyUI Workflow: Voice Recording

### 3.1 Overview

The updated workflow adds **green-colored nodes** for loading your own voice recording directly into the LTX-2 video generation pipeline. This is **not** voice cloning — your actual recorded audio will be embedded into the generated video.

### 3.2 Available Workflow Files

| File | Description |
|------|-------------|
| `LTX2 Add Voice Recording.json` | Original workflow + voice recording nodes |
| `LTX2 Voice Recording (Duplicate).json` | Exact copy for experimentation |
| `LTX2 Movie Director Pipeline.json` | Voice recording + cinematic movie prompt |

### 3.3 How to Use Voice Recording

#### Step 1: Load the Workflow
1. Open ComfyUI in your browser
2. Click **Load** → navigate to `workflows/`
3. Select `LTX2 Add Voice Recording.json`

#### Step 2: Load Your Image
1. In the **LoadImage** node (top-left), load your source image
2. This is the starting frame for your video

#### Step 3: Load Your Voice Recording
1. Find the green **LoadAudio** node at the bottom of the canvas
2. Click the upload button and select your audio file
3. Supported formats: **WAV, MP3, FLAC, OGG**
4. Best results with recordings **≤ 10 seconds**

#### Step 4: Wire the Audio (Inside Subgraph)
1. Click the **top-right corner** of the "Image 2 Video Workflow" subgraph node to expand it
2. Inside, locate the green nodes:
   - **LoadAudio** (green) — your voice recording
   - **LTXVAudioVAEEncode** (green) — encodes audio to latent
3. **Disconnect** the existing link from `LTXVEmptyLatentAudio` → `LTXVConcatAVLatent`
4. **Connect** the `Latent` output of `LTXVAudioVAEEncode` → `LTXVConcatAVLatent` (audio_latent input)

#### Step 5: Generate
1. Click **Queue Prompt** (or press Ctrl+Enter)
2. Wait for generation (typically 2-10 minutes depending on GPU)
3. Output video with your voice will appear in the **VHS_VideoCombine** preview

### 3.4 Tips for Best Voice Results

| Tip | Why |
|-----|-----|
| Record in WAV 44.1kHz/48kHz | Highest quality, no compression artifacts |
| Keep recordings under 10s | Matches the video generation length |
| Record in a quiet environment | Background noise degrades output |
| Speak clearly and at normal pace | The model works best with natural speech |
| Match audio length to frame count | 121 frames @ 25fps = ~4.8 seconds |

### 3.5 Switching Back to Generated Audio

To switch back to AI-generated audio (no voice recording):
1. Open the subgraph
2. **Disconnect** `LTXVAudioVAEEncode` → `LTXVConcatAVLatent`
3. **Reconnect** `LTXVEmptyLatentAudio` → `LTXVConcatAVLatent`

---

## 4. Infinite Runner

### 4.1 What It Does

The infinite runner **continuously queues your ComfyUI workflow** to the server API, waits for completion, randomizes seeds, and re-queues. Perfect for overnight batch generation.

### 4.2 Quick Start

```bash
# Basic usage — runs forever with default settings
python3 infinite_runner.py --workflow "/path/to/your/workflow.json"

# Specify server address (if remote)
python3 infinite_runner.py -w workflow.json -s 192.168.1.100:8188

# Limit to 20 runs with 10s delay between each
python3 infinite_runner.py -w workflow.json --max-runs 20 --delay 10

# Keep same seeds (no randomization)
python3 infinite_runner.py -w workflow.json --no-randomize

# Full example for overnight run
python3 infinite_runner.py \
  --workflow "/home/blokey/ComfyUI/user/default/workflows/LTX2 Add Voice Recording.json" \
  --server 127.0.0.1:8188 \
  --delay 5 \
  --timeout 7200
```

### 4.3 Command-Line Options

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--workflow` | `-w` | *required* | Path to ComfyUI workflow JSON |
| `--server` | `-s` | `127.0.0.1:8188` | ComfyUI server address |
| `--delay` | `-d` | `3` | Seconds between runs |
| `--max-runs` | `-m` | `0` (infinite) | Maximum number of runs |
| `--no-randomize` | — | `False` | Don't randomize seeds |
| `--timeout` | `-t` | `3600` | Timeout per run (seconds) |

### 4.4 Features

- **Auto-reconnect**: If ComfyUI server disconnects, it waits and retries (up to 50 attempts)
- **Seed randomization**: Each run uses different random seeds for variety
- **WebSocket monitoring**: Real-time progress tracking (falls back to polling if websocket-client not installed)
- **Graceful shutdown**: Press `Ctrl+C` to finish the current run and exit cleanly
- **Full logging**: All runs logged to `infinite_runner_logs/run_YYYYMMDD_HHMMSS.log`

### 4.5 Running Overnight

```bash
# Start ComfyUI first (in WSL or terminal)
cd ~/ComfyUI
python main.py --novram &

# Wait for it to start, then launch the runner
python3 infinite_runner.py \
  -w "/home/blokey/ComfyUI/user/default/workflows/LTX2 Add Voice Recording.json" \
  --delay 5 \
  --timeout 3600

# Or use nohup to survive terminal close
nohup python3 infinite_runner.py -w workflow.json > runner_output.log 2>&1 &
```

### 4.6 Output

Generated videos will be saved by ComfyUI to its default output directory:
```
~/ComfyUI/output/
├── LTX-2_00001-audio.mp4
├── LTX-2_00002-audio.mp4
├── LTX-2_00003-audio.mp4
└── ...
```

---

## 5. Movie Director Pipeline

### 5.1 What It Does

Accepts **one plot sentence** and automatically generates a complete sequence of 10-20 second cinematic scene prompts ready for video generation tools like LTX-2, Wan, Runway, Pika, etc.

### 5.2 Quick Start

```bash
# Default plot (cyberpunk android story)
python3 movie_director.py

# Custom plot
python3 movie_director.py --plot "A lonely astronaut finds alien music on Mars"

# Use Ollama backend (easier setup, recommended)
python3 movie_director.py --backend ollama --plot "A time traveler stuck in medieval Japan"

# Custom output directory
python3 movie_director.py --plot "..." --output my_first_film
```

### 5.3 Command-Line Options

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--plot` | `-p` | *android cyberpunk* | Master plot for the film |
| `--output` | `-o` | `movie_output` | Output directory |
| `--backend` | `-b` | `transformers` | Backend: `transformers` or `ollama` |
| `--ollama-model` | — | `qwen2.5:7b` | Ollama model name |
| `--ollama-url` | — | `http://localhost:11434` | Ollama server URL |

### 5.4 Backends Comparison

| Feature | Transformers | Ollama (Recommended) |
|---------|-------------|------|
| Setup difficulty | Medium (CUDA, bitsandbytes) | Easy (just install Ollama) |
| VRAM management | Manual (4-bit quant) | Automatic |
| Speed | Fast (direct GPU) | Fast (native optimization) |
| Model formats | HuggingFace only | GGUF, HF, custom |
| Fault tolerance | Good (OOM handling) | Excellent (native) |
| Multi-GPU | Via device_map | Automatic |

**My recommendation**: Use **Ollama** if you already have it installed. It handles quantization, memory, and model management natively. The transformers backend gives more control but requires careful VRAM management.

### 5.5 Output Structure

```
movie_output/
├── scene_01.txt          # First scene prompt
├── scene_02.txt          # Second scene prompt
├── scene_03.txt          # Third scene prompt
├── ...
├── scene_XX.txt          # Last scene prompt
├── manifest.json         # Metadata (plot, config, timestamps)
└── full_script.txt       # All scenes concatenated
```

### 5.6 Scene Prompt Format

Each `scene_XX.txt` contains a production-ready video prompt like:

```
Medium close-up, slow dolly in. The android, a pale-skinned humanoid with 
glowing amber irises, short-cropped silver hair, and a matte-black 
exoskeleton visible beneath torn synthetic skin, stands motionless on 
the edge of a crumbling concrete rooftop. Rain cascades down their face 
in thin rivulets, catching neon reflections — cyan from a holographic 
billboard to the left, magenta from a distant nightclub sign. The 
camera pushes slowly toward their face as their eyes widen almost 
imperceptibly. Volumetric fog swirls at chest height. The city below 
is half-submerged, with dark water lapping at the second-floor windows 
of brutalist towers. Mood: melancholic wonder. Lighting: cool blue 
ambient from overcast sky, warm amber from the android's eyes.
```

### 5.7 Using Scenes with Video Generation

After running the pipeline, feed each scene prompt into your preferred tool:

**LTX-2 (via ComfyUI)**:
1. Copy scene text into the positive prompt node
2. Load a matching reference image
3. Generate

**Runway Gen-3/4**:
1. Paste the scene prompt into the text box
2. Optionally upload a reference image/frame
3. Generate

**Wan (ComfyUI)**:
1. Use the scene text as the prompt
2. Set matching duration (10-20s)
3. Generate

**Batch Processing** (with infinite_runner.py):
1. Create a workflow for each scene (or script to swap prompts)
2. Use the infinite runner to process them sequentially

### 5.8 Running Overnight

```bash
# Transformers backend with nohup
nohup python3 movie_director.py \
  --plot "A deep-sea explorer discovers an ancient civilization beneath the Pacific" \
  --output deep_sea_film \
  > movie_director_output.log 2>&1 &

# Check progress
tail -f movie_director_output.log

# Ollama (simpler)
nohup python3 movie_director.py \
  --backend ollama \
  --plot "..." \
  > output.log 2>&1 &
```

---

## 6. Architecture & How It Works

### 6.1 Voice Recording Workflow Architecture

```
┌──────────────┐     ┌─────────────────────────────────────────────────┐
│  LoadImage    │────▶│           Image 2 Video Subgraph                │
└──────────────┘     │                                                  │
                     │  ┌──────────────┐    ┌────────────────────┐     │
┌──────────────┐     │  │ ImageResize  │───▶│ LTXVPreprocess     │     │
│  LoadAudio   │     │  └──────────────┘    └────────────────────┘     │
│  (Voice Rec) │     │                                                  │
└──────────────┘     │  ┌──────────────────┐  ┌─────────────────────┐  │
                     │  │ EmptyLatentVideo  │─▶│ ImgToVideoInplace   │  │
                     │  └──────────────────┘  └─────────────────────┘  │
                     │                                                  │
                     │  ┌──────────────────┐  ┌─────────────────────┐  │
                     │  │ 🎤 LoadAudio     │─▶│ AudioVAEEncode      │  │
                     │  │ (Voice Record)   │  │ (Latent Audio)      │  │
                     │  └──────────────────┘  └─────────────────────┘  │
                     │           OR                                     │
                     │  ┌──────────────────┐                           │
                     │  │ EmptyLatentAudio │─▶ ConcatAVLatent ─▶ ...  │
                     │  │ (Generated)      │                           │
                     │  └──────────────────┘                           │
                     │                                                  │
                     │  Sampling (2-pass) ─▶ Upscale ─▶ VAE Decode    │
                     └──────────────────────────────────────────────────┘
                                          │
                                          ▼
                     ┌─────────────────────────────────────┐
                     │  VHS_VideoCombine (MP4 output)       │
                     └─────────────────────────────────────┘
```

### 6.2 Movie Director Pipeline Architecture

```
    ┌─────────────────┐
    │  Master Plot     │
    │  (one sentence)  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Phase 1:        │ ◀── Qwen 7B (4-bit)
    │  Generate Outline│ ◀── OUTLINE_SYSTEM_PROMPT
    │  (8-12 beats)    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Character Desc  │ ◀── Auto-generated for consistency
    │  Generation      │
    └────────┬────────┘
             │
     ┌───────┼───────┐
     ▼       ▼       ▼
   Beat 1  Beat 2  Beat N   ◀── Phase 2: Iterate
     │       │       │       ◀── DIRECTOR_SYSTEM_PROMPT
     ▼       ▼       ▼       ◀── Clear VRAM after each
   Scene   Scene   Scene
    1-2     3-4     N-M
     │       │       │
     └───────┼───────┘
             │
             ▼
    ┌─────────────────┐
    │  Phase 3: Save   │
    │  scene_01.txt    │
    │  scene_02.txt    │
    │  manifest.json   │
    │  full_script.txt │
    └─────────────────┘
```

### 6.3 Infinite Runner Architecture

```
    ┌──────────────────┐
    │  Load Workflow    │
    │  JSON             │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Convert to API   │
    │  Prompt Format    │
    └────────┬─────────┘
             │
    ┌────────▼─────────┐◀──────────────┐
    │  Randomize Seeds  │               │
    └────────┬─────────┘               │
             │                          │
             ▼                          │
    ┌──────────────────┐               │
    │  Queue to ComfyUI │               │
    │  via HTTP API     │               │
    └────────┬─────────┘               │
             │                          │
             ▼                          │
    ┌──────────────────┐               │
    │  Wait (WebSocket  │               │
    │  or Polling)      │               │
    └────────┬─────────┘               │
             │                          │
             ▼                          │
    ┌──────────────────┐    delay      │
    │  Run Complete     │──────────────┘
    └──────────────────┘
          (loop forever)
```

---

## 7. Troubleshooting

### 7.1 ComfyUI Workflow Issues

| Problem | Solution |
|---------|----------|
| Workflow won't load | Make sure all custom nodes are installed. Check ComfyUI console for missing node errors. |
| "Node type not found" | Install the required custom node pack. Restart ComfyUI. |
| VRAM error during generation | Add `--novram` to `run_nvidia_gpu.bat`. Reduce frame count or resolution. |
| Audio not playing in output | Ensure VHS (VideoHelperSuite) is installed. Check the VHS_VideoCombine node settings. |
| Green nodes not visible | The LoadAudio and AudioVAEEncode nodes are inside the subgraph. Click the top-right corner of the subgraph node to expand it. |
| Audio quality is poor | Use WAV format at 44.1kHz/48kHz. Avoid compressed MP3 under 128kbps. |

### 7.2 Infinite Runner Issues

| Problem | Solution |
|---------|----------|
| "Server unreachable" | Make sure ComfyUI is running first. Check the server address. |
| Stuck on a run | The default timeout is 3600s (1 hour). Use `--timeout` to change. |
| No output files | ComfyUI saves to its own output directory, not the runner's directory. Check `~/ComfyUI/output/`. |
| "requests not found" | Run `pip install requests websocket-client`. |
| Same outputs each time | Make sure you're NOT using `--no-randomize`. Seeds are randomized by default. |

### 7.3 Movie Director Issues

| Problem | Solution |
|---------|----------|
| CUDA OOM | The script handles this with automatic retry at lower token count. If persistent, close other GPU applications. |
| Model download slow | First run downloads ~4GB. Use a fast connection or pre-download the model. |
| "bitsandbytes not found" | `pip install bitsandbytes`. On Windows, you may need `pip install bitsandbytes-windows`. |
| Ollama connection refused | Make sure Ollama is running: `ollama serve`. Pull the model: `ollama pull qwen2.5:7b`. |
| Few scenes generated | Increase the beat count by modifying the outline prompt, or run twice and combine outputs. |
| Incoherent scenes | Lower temperature to 0.6, increase repetition_penalty to 1.2 in the script. |
| Script crashes overnight | Check `movie_director.log` for the exact error. Usually VRAM-related — the fallback handler should catch most cases. |

---

## 8. Performance Tuning

### 8.1 GPU Memory Optimization

```python
# In movie_director.py, adjust these:
GEN_CONFIG["max_new_tokens"] = 512   # Lower = less VRAM per scene
                                      # 1024 is default, 512 for tight VRAM

# For 8GB GPUs, also try:
# - Close all other GPU applications
# - Use Ollama backend (better memory management)
# - Reduce batch_size to 1 in the workflow
```

### 8.2 Generation Quality vs Speed

| Parameter | More Creative | More Coherent | Faster |
|-----------|--------------|---------------|--------|
| `temperature` | 0.9-1.0 | 0.5-0.7 | N/A |
| `top_p` | 0.95 | 0.8 | N/A |
| `repetition_penalty` | 1.0 | 1.2-1.3 | N/A |
| `max_new_tokens` | 1024 | 512 | 256 |

### 8.3 ComfyUI Workflow Speed

| Setting | Faster | Higher Quality |
|---------|--------|----------------|
| Resolution | 720×480 | 1280×720 |
| Frame count | 61 (2.4s) | 121 (4.8s) |
| Sampling steps | 12-15 | 20-25 |
| CFG scale | 3-4 | 5-7 |
| Upscaler | Skip | 2× spatial |

---

## 9. FAQ

**Q: Can I use this to clone someone's voice?**
A: No. This system loads your **actual voice recording** as audio. It does not synthesize, clone, or modify voices. The audio from your recording is encoded directly into the video's latent space.

**Q: How long can my voice recording be?**
A: The workflow is configured for 121 frames at 25fps (~4.8 seconds). Match your recording length to this. For longer recordings, increase the frame_count in the subgraph settings.

**Q: Can I use the Movie Director prompts with tools other than LTX-2?**
A: Absolutely. The scene prompts are plain text descriptions. They work with any text-to-video tool: Runway Gen-3/4, Pika, Kling, Wan, Mochi, etc.

**Q: Will the infinite runner fill up my disk?**
A: Yes, eventually. Each generated video is ~5-20MB. At 5 minutes per generation, that's ~120-480 videos overnight (~2-10GB). Monitor your disk space or set `--max-runs`.

**Q: Can I run Movie Director without a GPU?**
A: With the Ollama backend, yes (it will use CPU, but slowly). The transformers backend requires a CUDA GPU for 4-bit quantization.

**Q: How many scenes does Movie Director generate?**
A: Typically 10-25 scenes from an 8-12 beat outline. Each scene is a 10-20 second shot description. Total film length: 1-5 minutes.

**Q: Can I change the AI model?**
A: Yes. For transformers, change `MODEL_NAME` in the script. For Ollama, use `--ollama-model`. Any instruction-tuned LLM works (Mistral, Llama, etc.).

**Q: How do I stop the infinite runner?**
A: Press `Ctrl+C`. It will finish the current run and exit gracefully. Or use `kill` on the process.

**Q: The workflow JSON is corrupted after modification. How do I fix it?**
A: The original workflow was backed up implicitly. Re-download it or use the duplicate workflow (`LTX2 Voice Recording (Duplicate).json`).

---

## 10. Quick Reference Card

### Voice Recording Workflow
```
1. Load workflow in ComfyUI
2. Upload image in LoadImage node
3. Open subgraph → find green nodes
4. Upload audio in green LoadAudio
5. Rewire: AudioVAEEncode output → ConcatAVLatent input
6. Queue and generate
```

### Infinite Runner
```bash
# DESKTOP SHORTCUT: Double-click "ComfyUI Infinite Runner.bat" on your desktop

# Or from WSL terminal:
~/run_infinite.sh

# With custom options:
python3 ~/ComfyUI/user/default/workflows/infinite_runner.py \
  -w "~/ComfyUI/user/default/workflows/LTX2 Add Voice Recording.json" \
  --delay 5

# Stop
Ctrl+C

# Check logs
cat ~/infinite_runner_logs/run_*.log
```

### Movie Director
```bash
# DESKTOP SHORTCUT: Double-click "AI Movie Director.bat" on your desktop

# Or from WSL terminal:
~/run_movie_director.sh "Your plot here"

# Direct call with Ollama:
python3 ~/ComfyUI/user/default/workflows/movie_director.py \
  --backend ollama --plot "Your plot here"

# Check output
ls ~/movie_output/
cat ~/movie_output/scene_01.txt
```

### Desktop Shortcuts (C:\Users\razer\Desktop\)
```
ComfyUI Infinite Runner.bat  →  runs ~/run_infinite.sh
AI Movie Director.bat        →  runs ~/run_movie_director.sh
WSL ComfyUI Terminal.bat     →  opens WSL terminal in correct environment
```

### File Locations
```
Scripts:    ~/run_infinite.sh
            ~/run_movie_director.sh
Workflows:  ~/ComfyUI/user/default/workflows/
Output:     ~/ComfyUI/output/              (videos)
            ~/movie_output/                (scene prompts)
Logs:       ~/infinite_runner_logs/        (runner logs)
            ~/movie_director.log           (director log)
```

---

## Appendix A: Full File Manifest

```
scripts/
├── modify_workflow.py      # Workflow modification tool
├── infinite_runner.py      # ComfyUI infinite execution loop
└── movie_director.py       # AI movie prompt generation pipeline

docs/
└── EndUser-Manual.md       # This manual

ComfyUI Workflows (in ~/ComfyUI/user/default/workflows/):
├── LTX2 Add Voice Recording.json           # Updated with voice recording
├── LTX2 Voice Recording (Duplicate).json   # Duplicate for experimentation
└── LTX2 Movie Director Pipeline.json       # Movie-optimized variant
```

## Appendix B: Example Plots for Movie Director

```
"A rogue android discovers emotions in a flooded cyberpunk city."
"A lighthouse keeper finds a message in a bottle from the future."
"Two rival samurai must unite to face a supernatural threat in Edo-period Japan."
"A deep-sea expedition discovers a living ancient civilization beneath the Pacific."
"An astronaut stranded on Mars finds alien music encoded in the rocks."
"A child's imaginary friend turns out to be a ghost from 200 years ago."
"A street artist's paintings start coming to life at midnight in Paris."
"The last librarian protects forbidden knowledge in a post-apocalyptic wasteland."
"A quantum physicist accidentally creates a portal to a parallel dimension."
"A retired detective takes one last case that unravels the fabric of reality."
```

---

*Generated by AI Movie Director Pipeline v2.0 | Claude Opus 4.6*
*Last updated: 2026-02-26*
