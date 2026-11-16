#!/usr/bin/env bash
set -euo pipefail

PARTS_DIR="${1:-out/parts}"
MASTER_AUDIO="${2:-public/audio/vo.wav}"
OUT_DIR="$(dirname "$PARTS_DIR")"

echo "=== Concatenating rendered chunks in $PARTS_DIR ==="
cd "$PARTS_DIR"
ls part_*.mp4 | sed "s/^/file '/; s/$/'/" > list.txt
ffmpeg -y -f concat -safe 0 -i list.txt -c copy "../video_noaudio.mp4"
cd - > /dev/null

if [ -f "$MASTER_AUDIO" ]; then
  echo "=== Muxing video_noaudio.mp4 with $MASTER_AUDIO -> $OUT_DIR/final.mp4 ==="
  ffmpeg -y -i "$OUT_DIR/video_noaudio.mp4" -i "$MASTER_AUDIO" \
    -c:v copy -c:a aac -b:a 320k -shortest "$OUT_DIR/final.mp4"
else
  echo "=== $MASTER_AUDIO not found; copying video_noaudio.mp4 -> $OUT_DIR/final.mp4 ==="
  cp "$OUT_DIR/video_noaudio.mp4" "$OUT_DIR/final.mp4"
fi

ls -lh "$OUT_DIR/final.mp4"
