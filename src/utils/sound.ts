import type {Ps2ButtonId} from '../data/ps2Mapping';

let audioContext: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;

function getAudioNodes(): {ctx: AudioContext; destination: AudioNode} | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!audioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
      masterCompressor = audioContext.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-16, audioContext.currentTime);
      masterCompressor.knee.setValueAtTime(12, audioContext.currentTime);
      masterCompressor.ratio.setValueAtTime(6, audioContext.currentTime);
      masterCompressor.attack.setValueAtTime(0.002, audioContext.currentTime);
      masterCompressor.release.setValueAtTime(0.08, audioContext.currentTime);
      masterCompressor.connect(audioContext.destination);
    }
  }
  if (!audioContext) {
    return null;
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return {
    ctx: audioContext,
    destination: masterCompressor ?? audioContext.destination,
  };
}

function playPs2Chime(
  ctx: AudioContext,
  destination: AudioNode,
  fundamentalHz: number,
  duration = 0.14
): void {
  const now = ctx.currentTime;

  const oscMain = ctx.createOscillator();
  const oscHarmonic = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  oscMain.type = 'sine';
  oscMain.frequency.setValueAtTime(fundamentalHz, now);

  oscHarmonic.type = 'triangle';
  oscHarmonic.frequency.setValueAtTime(fundamentalHz * 2, now);

  const harmonicGain = ctx.createGain();
  harmonicGain.gain.setValueAtTime(0.22, now);
  harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.65);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2800, now);
  filter.Q.setValueAtTime(0.8, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.11, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

  oscMain.connect(filter);
  oscHarmonic.connect(harmonicGain);
  harmonicGain.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  oscMain.start(now);
  oscHarmonic.start(now);
  oscMain.stop(now + duration + 0.01);
  oscHarmonic.stop(now + duration + 0.01);
}

function playDpadSwitch(ctx: AudioContext, destination: AudioNode, pitchOffset = 0): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(920 + pitchOffset, now);
  osc.frequency.exponentialRampToValueAtTime(260, now + 0.022);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1100, now);
  filter.Q.setValueAtTime(1.1, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.095, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.026);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc.start(now);
  osc.stop(now + 0.03);
}

function playShoulderPulse(ctx: AudioContext, destination: AudioNode, isTrigger: boolean): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  const startFreq = isTrigger ? 175 : 215;
  const endFreq = isTrigger ? 92 : 118;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.085);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(640, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.14, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.095);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

function playDoublePulse(ctx: AudioContext, destination: AudioNode, highTone: boolean): void {
  const base = highTone ? 640 : 480;
  [0, 0.044].forEach((offset, idx) => {
    const start = ctx.currentTime + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(idx === 0 ? base : base * 1.18, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.042);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(start);
    osc.stop(start + 0.048);
  });
}

export function playButtonClickSound(buttonId: Ps2ButtonId): void {
  const nodes = getAudioNodes();
  if (!nodes) {
    return;
  }
  const {ctx, destination} = nodes;

  switch (buttonId) {
    // Action face buttons: distinct crystalline PS2 browser harmonic notes
    case 'cross':
      playPs2Chime(ctx, destination, 392.0, 0.13); // G4 (suave médio-grave)
      break;
    case 'circle':
      playPs2Chime(ctx, destination, 440.0, 0.13); // A4 (médio)
      break;
    case 'square':
      playPs2Chime(ctx, destination, 493.88, 0.14); // B4 (médio-agudo)
      break;
    case 'triangle':
      playPs2Chime(ctx, destination, 587.33, 0.15); // D5 (agudo cristalino)
      break;

    // D-Pad: short dry soft micro-switch click
    case 'up':
      playDpadSwitch(ctx, destination, 40);
      break;
    case 'down':
      playDpadSwitch(ctx, destination, -30);
      break;
    case 'left':
      playDpadSwitch(ctx, destination, 0);
      break;
    case 'right':
      playDpadSwitch(ctx, destination, 15);
      break;

    // Shoulders & Triggers: subtle full low pulse
    case 'l1':
    case 'r1':
      playShoulderPulse(ctx, destination, false);
      break;
    case 'l2':
    case 'r2':
      playShoulderPulse(ctx, destination, true);
      break;

    // System & Stick clicks: quick discrete double pulse
    case 'start':
    case 'select':
      playDoublePulse(ctx, destination, true);
      break;
    case 'l3':
    case 'r3':
      playDoublePulse(ctx, destination, false);
      break;
  }
}
