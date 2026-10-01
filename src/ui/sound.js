// Local recordings and quiet synthesized ticks; sound never changes puzzle state.
export function createSound(root) {
  let muted = false,
    context;
  try {
    muted = localStorage.getItem('game-lsd:sound') === 'off';
  } catch {}
  // Every cue is a real recording now; long field recordings play a short excerpt (seconds).
  const names = {
    click: 'type-space.ogg',
    open: 'paper-open.ogg',
    page: 'paper-turn-0.ogg',
    paper: 'paper-turn-1.ogg',
    book: 'paper-turn-2.ogg',
    photo: 'paper-turn-1.ogg',
    door: 'door-open.mp3',
    drawer: 'drawer.wav',
    drawerClose: 'drawer-close.wav',
    clockTick: 'clock-tick.ogg',
    bell: 'bike-bell.ogg',
    record: 'type-bell.ogg',
    wood: 'drawer.wav',
    press: 'press.mp3',
    close: 'paper-close.ogg',
    place: 'type-key.ogg',
    success: 'type-bell-2.ogg',
    error: 'knock-error.ogg',
    switch: 'old-switch.ogg',
  };
  const excerpts = { open: 0.8, close: 0.7, error: 1.1, switch: 0.9, clockTick: 3.2, press: 2.2 };
  const playing = new Map(),
    silentTimers = new Set();
  let lastTick = 0;
  let introNodes = [],
    introBus,
    introWanted = false;
  // Original restrained cinematic bed. Synthesized here, not archival audio or a period recording.
  function startIntro() {
    introWanted = true;
    if (muted || document.hidden || introNodes.length) return;
    try {
      context ??= new AudioContext();
      introBus = context.createGain();
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 550;
      filter.connect(introBus);
      introBus.connect(context.destination);
      introBus.gain.setValueAtTime(0.0001, context.currentTime);
      introBus.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 2.2);
      introNodes = [introBus, filter];
      [110, 164.81, 220.1].forEach((frequency, index) => {
        const oscillator = context.createOscillator(),
          gain = context.createGain();
        oscillator.type = index === 2 ? 'triangle' : 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.value = [0.8, 0.28, 0.08][index];
        oscillator.connect(gain);
        gain.connect(filter);
        oscillator.start();
        introNodes.push(oscillator, gain);
      });
      const pulse = context.createOscillator(),
        depth = context.createGain();
      pulse.frequency.value = 0.13;
      depth.gain.value = 0.006;
      pulse.connect(depth);
      depth.connect(introBus.gain);
      pulse.start();
      introNodes.push(pulse, depth);
      context
        .resume()
        .then(() => {
          if (introNodes.length && !muted && !document.hidden) root.dataset.introSound = 'playing';
        })
        .catch(() => {
          root.dataset.introSound = 'unavailable';
        });
    } catch {
      stopIntro();
    }
  }
  function stopIntro(clearRequest = true) {
    if (clearRequest) introWanted = false;
    const nodes = introNodes;
    introNodes = [];
    if (introBus && context?.state !== 'closed') {
      introBus.gain.cancelScheduledValues(context.currentTime);
      introBus.gain.setTargetAtTime(0.0001, context.currentTime, 0.22);
    }
    if (nodes.length)
      delay(0.9, () => {
        for (const node of nodes) {
          try {
            node.stop?.();
            node.disconnect();
          } catch {}
        }
      });
    introBus = null;
    if (root.dataset.introSound) root.dataset.introSound = 'stopped';
  }
  // Recorded typewriter key, decoded once and replayed cheaply per glyph.
  let keyBuffer, keyLoading;
  function loadKey() {
    keyLoading ??= fetch(`${import.meta.env.BASE_URL}assets/audio/type-key.ogg`)
      .then((r) => r.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        keyBuffer = buffer;
      })
      .catch(() => {});
  }
  function typeKey() {
    const now = performance.now();
    if (now - lastTick < 70) return true;
    try {
      context ??= new AudioContext();
      context.resume().catch(() => {});
      loadKey();
      if (!keyBuffer) return false;
      lastTick = now;
      const source = context.createBufferSource(),
        gain = context.createGain();
      source.buffer = keyBuffer;
      source.playbackRate.value = 0.9 + Math.random() * 0.25;
      gain.gain.value = 0.12;
      source.connect(gain);
      gain.connect(context.destination);
      source.start();
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
      root.dataset.lastSound = 'type';
      return true;
    } catch {
      return false;
    }
  }
  // Quiet room ambience with an occasional bicycle bell from the street.
  let ambient, bellTimer;
  function scheduleBell() {
    clearTimeout(bellTimer);
    bellTimer = setTimeout(
      () => {
        if (ambient && !ambient.paused && !document.hidden) play('bell', { volume: 0.07 });
        scheduleBell();
      },
      35000 + Math.random() * 50000,
    );
  }
  function startAmbient() {
    if (muted) return;
    ambient ??= Object.assign(
      new Audio(`${import.meta.env.BASE_URL}assets/audio/ambient-heat.ogg`),
      { loop: true, volume: 0.1 },
    );
    ambient
      .play()
      .then(() => {
        root.dataset.ambient = 'playing';
        scheduleBell();
      })
      .catch(() => {});
  }
  function stopAmbient() {
    ambient?.pause();
    clearTimeout(bellTimer);
    if (root.dataset.ambient) root.dataset.ambient = 'paused';
  }
  const visibility = () => {
    if (document.hidden) {
      stopAmbient();
      stopIntro(false);
    } else {
      if (root.dataset.ambient === 'paused') startAmbient();
      if (introWanted) startIntro();
    }
  };
  document.addEventListener('visibilitychange', visibility);
  function tick(kind = 'type') {
    if (kind === 'type' && !muted && !document.hidden && typeKey()) return;
    if (muted || document.hidden) return;
    const now = performance.now();
    if (kind === 'type' && now - lastTick < 85) return;
    lastTick = now;
    try {
      context ??= new AudioContext();
      context.resume().catch(() => {});
      const oscillator = context.createOscillator(),
        gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(
        kind === 'clock' ? 180 : kind === 'switch' ? 500 : 820,
        context.currentTime,
      );
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        kind === 'type' ? 0.014 : 0.035,
        context.currentTime + 0.003,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.027);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.03);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      root.dataset.lastSound = kind;
      root.dataset.soundState = 'playing';
    } catch {}
  }
  function delay(seconds, callback) {
    const timer = setTimeout(() => {
      silentTimers.delete(timer);
      callback();
    }, seconds * 1000);
    silentTimers.add(timer);
  }
  function play(kind = 'click', options = {}) {
    if (kind === 'type') {
      tick(kind);
      return Promise.resolve();
    }
    if (kind === 'clock') kind = 'clockTick';
    if (muted || document.hidden) {
      if (options.wait) {
        options.onDuration?.(2.4);
        return new Promise((resolve) => delay(2.4, resolve));
      }
      return Promise.resolve();
    }
    const audio = new Audio(
      `${import.meta.env.BASE_URL}assets/audio/${names[kind] || names.click}`,
    );
    audio.volume =
      options.volume ??
      (['door', 'page', 'paper', 'book', 'drawer'].includes(kind)
        ? 0.35
        : kind === 'press'
          ? 0.17
          : kind === 'clockTick'
            ? 0.3
            : kind === 'place'
              ? 0.3
              : kind === 'open' || kind === 'close'
                ? 0.3
                : 0.22);
    return new Promise((resolve) => {
      let timer,
        ended = false;
      const finish = () => {
        if (ended) return;
        ended = true;
        clearTimeout(timer);
        audio.pause();
        playing.delete(audio);
        resolve();
      };
      playing.set(audio, { kind, finish });
      audio.addEventListener(
        'loadedmetadata',
        () => {
          if (options.wait) {
            root.dataset.entryDuration = audio.duration.toFixed(2);
            options.onDuration?.(audio.duration);
          }
        },
        { once: true },
      );
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });
      audio.addEventListener(
        'playing',
        () => {
          root.dataset.lastSound = kind;
          root.dataset.soundState = 'playing';
          if (excerpts[kind]) {
            clearTimeout(timer);
            timer = setTimeout(finish, excerpts[kind] * 1000);
          }
        },
        { once: true },
      );
      timer = setTimeout(finish, 20000);
      audio.play().catch(() => {
        root.dataset.soundState = 'unavailable';
        if (options.wait) {
          options.onDuration?.(2.4);
          clearTimeout(timer);
          timer = setTimeout(finish, 2400);
        } else finish();
      });
    });
  }
  function stop(kind) {
    for (const entry of [...playing.values()]) if (!kind || entry.kind === kind) entry.finish();
  }
  function toggle() {
    muted = !muted;
    if (muted) {
      stop();
      stopAmbient();
      stopIntro(false);
    } else {
      if (root.dataset.ambient) startAmbient();
      if (introWanted) startIntro();
    }
    try {
      localStorage.setItem('game-lsd:sound', muted ? 'off' : 'on');
    } catch {}
    root.dispatchEvent(new CustomEvent('soundchange'));
    return muted;
  }
  return {
    play,
    tick,
    stop,
    toggle,
    startAmbient,
    startIntro,
    stopIntro,
    get muted() {
      return muted;
    },
    dispose() {
      stop();
      stopAmbient();
      stopIntro();
      ambient = null;
      document.removeEventListener('visibilitychange', visibility);
      silentTimers.forEach(clearTimeout);
      silentTimers.clear();
      context?.close().catch(() => {});
    },
  };
}
