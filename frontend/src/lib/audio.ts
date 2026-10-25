import type { Customization } from '../customization'

// Original scores, synthesized locally. No recordings or external downloads.
type Tone = {
  notes: number[]
  step: number
  duration: number
  wave: OscillatorType
  sweep: number
  repeat: number
}
type Sound = Customization['spin_sound'] | Customization['result_sound'] | 'click'
const tones: Record<Exclude<Sound, 'none' | 'applause' | 'shaker'>, Tone> = {
  ticking: { notes: [1800], step: 0, duration: 0.025, wave: 'sine', sweep: 1, repeat: 120 },
  click: { notes: [1800], step: 0, duration: 0.025, wave: 'sine', sweep: 1, repeat: 120 },
  drum: { notes: [140], step: 0, duration: 0.18, wave: 'sine', sweep: 0.3, repeat: 240 },
  pulse: { notes: [330], step: 0, duration: 0.25, wave: 'sine', sweep: 1, repeat: 400 },
  woodblock: {
    notes: [850, 1250],
    step: 0.08,
    duration: 0.045,
    wave: 'triangle',
    sweep: 0.7,
    repeat: 300,
  },
  heartbeat: { notes: [70, 90], step: 0.17, duration: 0.14, wave: 'sine', sweep: 0.6, repeat: 800 },
  arpeggio: {
    notes: [262, 330, 392, 523],
    step: 0.12,
    duration: 0.18,
    wave: 'triangle',
    sweep: 1,
    repeat: 600,
  },
  space: { notes: [220, 330], step: 0.32, duration: 0.6, wave: 'sine', sweep: 2, repeat: 1000 },
  chime: { notes: [660, 880], step: 0.14, duration: 0.35, wave: 'sine', sweep: 1, repeat: 700 },
  fanfare: {
    notes: [523, 659, 784, 1047],
    step: 0.14,
    duration: 0.35,
    wave: 'triangle',
    sweep: 1,
    repeat: 1000,
  },
  victory: {
    notes: [392, 392, 523, 659, 784],
    step: 0.2,
    duration: 0.5,
    wave: 'triangle',
    sweep: 1,
    repeat: 1500,
  },
  magic: {
    notes: [1047, 1319, 1568, 2093],
    step: 0.11,
    duration: 0.55,
    wave: 'sine',
    sweep: 1.15,
    repeat: 1100,
  },
  bell: { notes: [880, 1760, 2640], step: 0, duration: 1.4, wave: 'sine', sweep: 1, repeat: 1600 },
  arcade: {
    notes: [523, 659, 784, 1047, 784, 1047],
    step: 0.12,
    duration: 0.12,
    wave: 'square',
    sweep: 1,
    repeat: 1000,
  },
  gong: {
    notes: [110, 173, 237, 341],
    step: 0,
    duration: 1.8,
    wave: 'sine',
    sweep: 0.8,
    repeat: 2000,
  },
}
let context: AudioContext | null = null
const playing = new Set<() => void>()
export function stopSounds() {
  for (const stop of playing) stop()
}
export function playSound(sound: Sound, volume: number, loop = false): () => void {
  if (sound === 'none' || volume === 0) return () => {}
  context ??= new AudioContext()
  const audio = context
  void audio.resume()
  const output = audio.createGain()
  output.gain.value = (volume / 100) * 0.35
  output.connect(audio.destination)
  const nodes = new Set<AudioScheduledSourceNode>()
  const play = () => {
    const now = audio.currentTime
    if (sound === 'applause' || sound === 'shaker') {
      const duration = sound === 'applause' ? 2 : 0.09
      const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate)
      const samples = buffer.getChannelData(0)
      let seed = 98123
      for (let i = 0; i < samples.length; i++) {
        seed = (1664525 * seed + 1013904223) >>> 0
        const t = i / audio.sampleRate
        const envelope =
          sound === 'applause'
            ? Math.exp(-((t * 9) % 1) * 8) * Math.min(t * 8, 1) * (1 - t / 2)
            : Math.sin((Math.PI * t) / duration) * Math.exp(-t * 35) * 0.5
        samples[i] = (seed / 2147483648 - 1) * envelope
      }
      const source = audio.createBufferSource()
      source.buffer = buffer
      source.connect(output)
      source.onended = () => {
        source.disconnect()
        nodes.delete(source)
      }
      nodes.add(source)
      source.start()
    } else {
      const tone = tones[sound]
      tone.notes.forEach((frequency, i) => {
        const start = now + i * tone.step
        const oscillator = audio.createOscillator()
        const envelope = audio.createGain()
        oscillator.type = tone.wave
        oscillator.frequency.setValueAtTime(frequency, start)
        oscillator.frequency.exponentialRampToValueAtTime(
          frequency * tone.sweep,
          start + tone.duration,
        )
        oscillator.connect(envelope)
        envelope.connect(output)
        envelope.gain.setValueAtTime(0.001, start)
        envelope.gain.exponentialRampToValueAtTime(
          (tone.wave === 'square' ? 0.2 : 0.6) / Math.sqrt(tone.step === 0 ? tone.notes.length : 1),
          start + 0.005,
        )
        envelope.gain.exponentialRampToValueAtTime(0.001, start + tone.duration)
        oscillator.onended = () => {
          oscillator.disconnect()
          envelope.disconnect()
          nodes.delete(oscillator)
        }
        nodes.add(oscillator)
        oscillator.start(start)
        oscillator.stop(start + tone.duration)
      })
    }
  }
  play()
  const repeat = sound === 'applause' ? 2200 : sound === 'shaker' ? 160 : tones[sound].repeat
  const interval = loop ? window.setInterval(play, repeat) : undefined
  const stop = () => {
    clearInterval(interval)
    clearTimeout(timeout)
    output.disconnect()
    for (const node of nodes) node.stop()
    nodes.clear()
    playing.delete(stop)
  }
  const timeout = loop ? undefined : window.setTimeout(stop, 2200)
  playing.add(stop)
  return stop
}
