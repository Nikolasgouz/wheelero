"""Prepare our six-second CC0 applause excerpt from the credited original WAV."""

import array
import math
from pathlib import Path
import sys
import wave

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / "public/audio/applause.wav"
with wave.open(str(source), "rb") as recording:
    assert recording.getnchannels() == 2
    assert recording.getsampwidth() == 2
    assert recording.getframerate() == 44100
    recording.setpos(2 * 44100)
    samples = array.array("h", recording.readframes(6 * 44100))
if sys.byteorder != "little":
    samples.byteswap()

gain = 0.94 * 32767 / max(abs(sample) for sample in samples)
for frame in range(len(samples) // 2):
    time = frame / 44100
    fade = min(1, time / 0.015) * min(1, (6 - time) / 0.8)
    for channel in range(2):
        index = frame * 2 + channel
        samples[index] = round(samples[index] * gain * fade)

rms = math.sqrt(sum(sample * sample for sample in samples) / len(samples)) / 32768
print(f"RMS: {20 * math.log10(rms):.1f} dBFS")
if sys.byteorder != "little":
    samples.byteswap()
target.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(target), "wb") as clip:
    clip.setparams((2, 2, 44100, 0, "NONE", "not compressed"))
    clip.writeframes(samples.tobytes())
print(target)
