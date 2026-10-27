import type { Customization } from '../customization'

// Original synthesized scores plus the bundled CC0 crowd recording (audio/CREDITS.txt).
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
  ticking: { notes: [1600], step: 0, duration: 0.03, wave: 'triangle', sweep: 0.25, repeat: 65 },
  click: { notes: [1800], step: 0, duration: 0.025, wave: 'sine', sweep: 1, repeat: 120 },
  drum: { notes: [150], step: 0, duration: 0.09, wave: 'sine', sweep: 0.35, repeat: 150 },
  pulse: {
    notes: [110, 116.54],
    step: 0.12,
    duration: 0.16,
    wave: 'triangle',
    sweep: 0.8,
    repeat: 500,
  },
  woodblock: {
    notes: [950, 1450],
    step: 0,
    duration: 0.035,
    wave: 'triangle',
    sweep: 0.7,
    repeat: 85,
  },
  heartbeat: { notes: [70, 90], step: 0.17, duration: 0.14, wave: 'sine', sweep: 0.6, repeat: 800 },
  arpeggio: {
    notes: [220, 261.63, 329.63, 415.3],
    step: 0.09,
    duration: 0.15,
    wave: 'triangle',
    sweep: 1,
    repeat: 700,
  },
  space: {
    notes: [146.83, 155.56, 220],
    step: 0,
    duration: 0.8,
    wave: 'triangle',
    sweep: 1.35,
    repeat: 800,
  },
  chime: {
    notes: [523.25, 659.25, 783.99, 1046.5],
    step: 0.13,
    duration: 0.7,
    wave: 'sine',
    sweep: 1,
    repeat: 1200,
  },
  fanfare: {
    notes: [392, 392, 523.25, 659.25, 783.99, 1046.5],
    step: 0.18,
    duration: 0.55,
    wave: 'sawtooth',
    sweep: 1,
    repeat: 1000,
  },
  victory: {
    notes: [261.63, 392, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.5],
    step: 0.22,
    duration: 0.7,
    wave: 'sawtooth',
    sweep: 1,
    repeat: 1500,
  },
  magic: {
    notes: [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568, 2093],
    step: 0.09,
    duration: 0.8,
    wave: 'sine',
    sweep: 1,
    repeat: 1100,
  },
  bell: {
    notes: [523.25, 659.25, 783.99, 1046.5],
    step: 0.16,
    duration: 1.6,
    wave: 'sine',
    sweep: 1,
    repeat: 2200,
  },
  arcade: {
    notes: [523, 659, 784, 1047, 784, 1047, 1319, 1568],
    step: 0.1,
    duration: 0.2,
    wave: 'square',
    sweep: 1,
    repeat: 1000,
  },
  gong: {
    notes: [261.63, 329.63, 392, 523.25],
    step: 0,
    duration: 2.2,
    wave: 'sawtooth',
    sweep: 1,
    repeat: 2000,
  },
}
let context: AudioContext | null = null
let applause: Promise<AudioBuffer> | null = null
const playing = new Set<() => void>()
export async function prepareApplause(): Promise<AudioBuffer> {
  context ??= new AudioContext()
  const audio = context
  applause ??= fetch('/audio/applause.wav')
    .then(async (response) => {
      if (!response.ok) throw new Error(`Could not load applause (HTTP ${response.status}).`)
      return audio.decodeAudioData(await response.arrayBuffer())
    })
    .catch((error) => {
      applause = null
      throw error
    })
  return applause
}

export function stopSounds() {
  for (const stop of playing) stop()
}
// A positive duration plays a spin score; zero plays a complete result/removal cue.
export function playSound(
  sound: Sound,
  volume: number,
  reportError: (error: unknown) => void,
  spinDuration = 0,
): () => void {
  if (sound === 'none' || volume === 0) return () => {}
  context ??= new AudioContext()
  const audio = context
  void audio.resume().catch(reportError)
  const output = audio.createGain()
  output.gain.value = (volume / 100) * (sound === 'applause' ? 1 : 0.35)
  output.connect(audio.destination)
  if (sound === 'applause') {
    let stopped = false
    let source: AudioBufferSourceNode | null = null
    const stop = () => {
      if (stopped) return
      stopped = true
      if (source) {
        source.onended = null
        source.stop()
        source.disconnect()
      }
      output.disconnect()
      playing.delete(stop)
    }
    playing.add(stop)
    void prepareApplause()
      .then((buffer) => {
        if (stopped) return
        source = audio.createBufferSource()
        source.buffer = buffer
        // Keep the recording's room sound and high-frequency handclap detail intact.
        source.connect(output)
        source.onended = stop
        source.start()
      })
      .catch((error) => {
        stop()
        reportError(error)
      })
    return stop
  }
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 3200
  filter.Q.value = 0.5
  filter.connect(output)
  const nodes = new Set<AudioScheduledSourceNode>()
  const started = performance.now()
  let timer: number | undefined
  const stop = () => {
    clearTimeout(timer)
    output.disconnect()
    filter.disconnect()
    for (const node of nodes) node.stop()
    nodes.clear()
    playing.delete(stop)
  }
  // Reuse the percussion buffer through the spin, instead of allocating on every tick.
  let noise: AudioBuffer | null = null
  if (['shaker', 'drum', 'ticking', 'woodblock'].includes(sound)) {
    const duration = sound === 'drum' ? 0.09 : 0.04
    noise = audio.createBuffer(2, Math.ceil(audio.sampleRate * duration), audio.sampleRate)
    let seed = 98123
    for (let channel = 0; channel < 2; channel++) {
      const samples = noise.getChannelData(channel)
      for (let i = 0; i < samples.length; i++) {
        seed = (1664525 * seed + 1013904223) >>> 0
        const t = i / audio.sampleRate
        samples[i] = (seed / 2147483648 - 1) * Math.exp(-t * 65) * 0.65
      }
    }
  }
  const play = () => {
    const progress = spinDuration ? (performance.now() - started) / (spinDuration * 1000) : 0
    if (spinDuration && progress >= 1) {
      stop()
      return
    }
    const level = spinDuration ? 0.55 + progress * 0.45 : 1
    const now = audio.currentTime
    if (noise) {
      const source = audio.createBufferSource()
      const gain = audio.createGain()
      gain.gain.value = level
      source.buffer = noise
      source.connect(gain)
      gain.connect(filter)
      source.onended = () => {
        source.disconnect()
        gain.disconnect()
        nodes.delete(source)
      }
      nodes.add(source)
      source.start()
    }
    if (sound !== 'shaker') {
      const tone = tones[sound]
      tone.notes.forEach((frequency, i) => {
        const start = now + i * tone.step
        const oscillator = audio.createOscillator()
        const envelope = audio.createGain()
        oscillator.type = tone.wave
        const pitch = frequency * (sound === 'space' ? 1 + progress : 1)
        oscillator.frequency.setValueAtTime(pitch, start)
        oscillator.frequency.exponentialRampToValueAtTime(pitch * tone.sweep, start + tone.duration)
        oscillator.connect(envelope)
        envelope.connect(filter)
        const peak =
          (level * (tone.wave === 'square' ? 0.3 : tone.wave === 'sawtooth' ? 0.4 : 0.6)) /
          Math.sqrt(tone.step === 0 ? tone.notes.length : 1)
        envelope.gain.setValueAtTime(0.001, start)
        envelope.gain.exponentialRampToValueAtTime(peak, start + 0.005)
        if (tone.wave === 'sawtooth')
          envelope.gain.setValueAtTime(peak, start + tone.duration * 0.45)
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
    if (spinDuration) {
      const repeat = sound === 'shaker' ? 80 : tones[sound].repeat
      const wheelClicks = ['ticking', 'woodblock', 'shaker'].includes(sound)
      const delay = wheelClicks ? repeat + 600 * progress ** 2 : repeat * (1 - progress * 0.65)
      timer = window.setTimeout(
        play,
        Math.min(delay, spinDuration * 1000 - (performance.now() - started)),
      )
    }
  }
  playing.add(stop)
  play()
  if (!spinDuration) {
    const duration =
      sound === 'shaker'
        ? 0.04
        : tones[sound].step * (tones[sound].notes.length - 1) + tones[sound].duration
    timer = window.setTimeout(stop, (duration + 0.1) * 1000)
  }
  return stop
}
