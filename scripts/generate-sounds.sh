#!/usr/bin/env bash
# Regenerates the bundled notification sounds in ../sounds/ using ffmpeg
# sine-wave synthesis. Nothing here is sampled from any existing recording -
# these are generated tones, so there's no copyright concern in bundling
# and sharing them.
set -euo pipefail

cd "$(dirname "$0")/../sounds"

# ping: single short beep
ffmpeg -y -f lavfi -i "sine=frequency=1046:duration=0.18" \
  -af "afade=t=in:d=0.01,afade=t=out:st=0.13:d=0.05,volume=0.6" \
  -ar 44100 -ac 1 ping.wav

# chime: two-note rising chime (default)
ffmpeg -y -filter_complex "
  sine=frequency=1318:duration=0.14[a0];
  sine=frequency=1760:duration=0.18[a1];
  [a0]afade=t=in:d=0.01,afade=t=out:st=0.09:d=0.04[a0f];
  [a1]afade=t=in:d=0.01,afade=t=out:st=0.12:d=0.05[a1f];
  [a0f][a1f]concat=n=2:v=0:a=1,volume=0.6[out]
" -map "[out]" -ar 44100 -ac 1 chime.wav

# success: three-note ascending arpeggio
ffmpeg -y -filter_complex "
  sine=frequency=1046:duration=0.10[a0];
  sine=frequency=1318:duration=0.10[a1];
  sine=frequency=1568:duration=0.16[a2];
  [a0]afade=t=in:d=0.01,afade=t=out:st=0.06:d=0.03[a0f];
  [a1]afade=t=in:d=0.01,afade=t=out:st=0.06:d=0.03[a1f];
  [a2]afade=t=in:d=0.01,afade=t=out:st=0.10:d=0.05[a2f];
  [a0f][a1f][a2f]concat=n=3:v=0:a=1,volume=0.6[out]
" -map "[out]" -ar 44100 -ac 1 success.wav

# alert: two quick beeps separated by a gap
ffmpeg -y -filter_complex "
  sine=frequency=880:duration=0.10[a0];
  anullsrc=r=44100:cl=mono:d=0.08[s0];
  sine=frequency=880:duration=0.10[a1];
  [a0]afade=t=in:d=0.01,afade=t=out:st=0.06:d=0.03[a0f];
  [a1]afade=t=in:d=0.01,afade=t=out:st=0.06:d=0.03[a1f];
  [a0f][s0][a1f]concat=n=3:v=0:a=1,volume=0.6[out]
" -map "[out]" -ar 44100 -ac 1 alert.wav

echo "Generated: ping.wav chime.wav success.wav alert.wav"
