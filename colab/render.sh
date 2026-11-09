#!/usr/bin/env bash
set -e

echo "=== Remotion Cloud GPU Render Script ==="

# Check GPU
if command -v nvidia-smi &> /dev/null; then
    echo "GPU detected:"
    nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader
else
    echo "Warning: No NVIDIA GPU detected. Rendering may use software rasterization."
fi

# Ensure output directory exists
mkdir -p out

COMPOSITION=${1:-"ChokepointEscalationMaster"}
OUTPUT_PATH=${2:-"out/${COMPOSITION}.mp4"}

echo "Rendering composition: $COMPOSITION"
echo "Output target: $OUTPUT_PATH"

npx remotion render "$COMPOSITION" "$OUTPUT_PATH" \
  --gl=angle \
  --enable-multiprocess-on-linux \
  --concurrency=2 \
  --overwrite

echo "=== Render complete: $OUTPUT_PATH ==="
