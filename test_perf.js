import { performance } from 'perf_hooks';

// Mock window and AudioContext for testing
global.window = {};

class MockAudioContext {
  constructor() {
    this.sampleRate = 44100;
    this.currentTime = 0;
    this.destination = {};
  }
  createBuffer(channels, size, sampleRate) {
    return {
      getChannelData: () => new Float32Array(size)
    };
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createBiquadFilter() {
    return {
      type: '',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      Q: { setValueAtTime: () => {} },
      connect: () => {}
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {}
    };
  }
  createOscillator() {
    return {
      type: '',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
}

global.window.AudioContext = MockAudioContext;

// Uncached version
const playSnapSoundUncached = () => {
  try {
    const AudioCtx = window.AudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    // ... creating nodes ...
  } catch (e) {
  }
};

// Cached version
let cachedAudioCtx = null;
let cachedSnapBuffer = null;

const playSnapSoundCached = () => {
  try {
    const AudioCtx = window.AudioContext;
    if (!AudioCtx) return;

    if (!cachedAudioCtx) {
      cachedAudioCtx = new AudioCtx();
    }
    const ctx = cachedAudioCtx;

    if (!cachedSnapBuffer) {
      const bufferSize = ctx.sampleRate * 0.08;
      cachedSnapBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = cachedSnapBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    // ... creating nodes ...
  } catch (e) {
  }
};

// Benchmark
const iterations = 10000;

const startUncached = performance.now();
for (let i = 0; i < iterations; i++) {
  playSnapSoundUncached();
}
const endUncached = performance.now();

const startCached = performance.now();
for (let i = 0; i < iterations; i++) {
  playSnapSoundCached();
}
const endCached = performance.now();

console.log(`Uncached: ${(endUncached - startUncached).toFixed(2)} ms`);
console.log(`Cached: ${(endCached - startCached).toFixed(2)} ms`);
