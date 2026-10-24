/* ============================================================
   瓜田98 · 音效系统
   使用 Web Audio API 现场合成，无外部音频文件。
   默认关闭，用户通过任务栏音量图标主动开启。
   ============================================================ */
(function () {
  'use strict';

  class SoundSystem {
    constructor() {
      this.enabled = false;
      this.ctx = null;
      this.master = null;
      this._lastClick = 0;
    }

    ensureContext() {
      if (this.ctx) return this.ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.18;
        this.master.connect(this.ctx.destination);
      } catch (err) {
        this.ctx = null;
      }
      return this.ctx;
    }

    setEnabled(on) {
      this.enabled = !!on;
      if (on) {
        const ctx = this.ensureContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(function () {});
        }
        this.play('click');
      }
    }

    tone(freq, duration, options) {
      if (!this.enabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(function () {});
      }
      const opts = options || {};
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = opts.type || 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + (opts.delay || 0));
      if (opts.endFreq) {
        osc.frequency.linearRampToValueAtTime(opts.endFreq, ctx.currentTime + (opts.delay || 0) + duration);
      }
      const volume = typeof opts.volume === 'number' ? opts.volume : 0.12;
      const start = ctx.currentTime + (opts.delay || 0);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    }

    play(name) {
      if (!this.enabled) return;
      switch (name) {
        case 'click': {
          const now = Date.now();
          if (now - this._lastClick < 35) return;
          this._lastClick = now;
          this.tone(760, 0.035, { type: 'square', volume: 0.055 });
          break;
        }
        case 'menu':
          this.tone(520, 0.025, { type: 'square', volume: 0.045 });
          break;
        case 'open':
          this.tone(392, 0.08, { type: 'triangle', volume: 0.08 });
          this.tone(587, 0.1, { type: 'triangle', volume: 0.07, delay: 0.055 });
          break;
        case 'close':
          this.tone(587, 0.07, { type: 'triangle', volume: 0.07 });
          this.tone(392, 0.1, { type: 'triangle', volume: 0.07, delay: 0.055 });
          break;
        case 'minimize':
          this.tone(440, 0.07, { type: 'sine', volume: 0.055, endFreq: 220 });
          break;
        case 'error':
          this.tone(180, 0.14, { type: 'sawtooth', volume: 0.075 });
          this.tone(140, 0.2, { type: 'sawtooth', volume: 0.07, delay: 0.16 });
          break;
        case 'startup': {
          const notes = [392, 523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, i) => {
            this.tone(freq, 0.28, { type: 'triangle', volume: 0.075, delay: i * 0.115 });
            this.tone(freq / 2, 0.32, { type: 'sine', volume: 0.035, delay: i * 0.115 });
          });
          this.tone(261.63, 0.9, { type: 'sine', volume: 0.04, delay: 0.06 });
          break;
        }
        case 'shutdown': {
          const notes = [783.99, 659.25, 523.25, 392, 261.63];
          notes.forEach((freq, i) => {
            this.tone(freq, 0.38, { type: 'triangle', volume: 0.065, delay: i * 0.15 });
          });
          break;
        }
        case 'bsod': {
          this.tone(220, 0.5, { type: 'square', volume: 0.055 });
          this.tone(110, 0.6, { type: 'square', volume: 0.045, delay: 0.1 });
          this.tone(220, 0.5, { type: 'square', volume: 0.055, delay: 0.75 });
          break;
        }
        case 'chime':
          this.tone(880, 0.12, { type: 'sine', volume: 0.05 });
          this.tone(1174.66, 0.2, { type: 'sine', volume: 0.045, delay: 0.1 });
          break;
        case 'modem': {
          this.tone(1200, 0.12, { type: 'sine', volume: 0.035 });
          this.tone(2100, 0.12, { type: 'sine', volume: 0.035, delay: 0.14 });
          this.tone(1500, 0.4, { type: 'sawtooth', volume: 0.022, delay: 0.3 });
          break;
        }
        default:
          break;
      }
    }
  }

  window.GuaSound = new SoundSystem();
})();
