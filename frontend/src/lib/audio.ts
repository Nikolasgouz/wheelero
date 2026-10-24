// Original procedural sounds: no downloaded recordings or third-party audio assets.
let context: AudioContext | null = null
const playing = new Set<() => void>()
export function stopSounds() {
  for (const stop of playing) stop()
}
export function playSound(sound: string, volume: number, loop = false): () => void {
  if (sound === 'none' || volume === 0) return () => {}
  context ??= new AudioContext()
  const audio = context
  void audio.resume()
  const output = audio.createGain()
  output.gain.value = (volume / 100) * 0.35
  output.connect(audio.destination)
  const nodes: AudioScheduledSourceNode[] = []
  const play = () => {
    const now = audio.currentTime
    if (sound === 'applause') {
      const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate)
      const samples = buffer.getChannelData(0)
      // Overlapping, decaying noise bursts emulate subdued hand claps.
      let seed = 98123
      for (let i = 0; i < samples.length; i++) {
        seed = (1664525 * seed + 1013904223) >>> 0
        const t = i / audio.sampleRate
        samples[i] =
          (seed / 2147483648 - 1) * Math.exp(-((t * 9) % 1) * 8) * Math.min(t * 8, 1) * (1 - t / 2)
      }
      const source = audio.createBufferSource()
      source.buffer = buffer
      source.connect(output)
      source.start()
      nodes.push(source)
    } else {
      const frequencies =
        sound === 'fanfare'
          ? [523, 659, 784, 1047]
          : sound === 'chime'
            ? [660, 880]
            : [sound === 'drum' ? 110 : sound === 'pulse' ? 330 : 1800]
      frequencies.forEach((frequency, i) => {
        const oscillator = audio.createOscillator()
        const envelope = audio.createGain()
        const duration = sound === 'ticking' || sound === 'click' ? 0.025 : 0.35
        oscillator.frequency.value = frequency
        oscillator.connect(envelope)
        envelope.connect(output)
        envelope.gain.setValueAtTime(0.7, now + i * 0.14)
        envelope.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + duration)
        oscillator.start(now + i * 0.14)
        oscillator.stop(now + i * 0.14 + duration)
        nodes.push(oscillator)
      })
    }
  }
  play()
  const interval = loop ? window.setInterval(play, sound === 'drum' ? 240 : 120) : undefined
  const stop = () => {
    clearInterval(interval)
    clearTimeout(timeout)
    output.disconnect()
    for (const node of nodes) node.stop()
    playing.delete(stop)
  }
  const timeout = loop ? undefined : window.setTimeout(stop, 2200)
  playing.add(stop)
  return stop
}
