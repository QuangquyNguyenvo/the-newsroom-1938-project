// Every cue is a short local recording, decoded once and mixed through Web Audio so it
// starts on the click, can overlap itself and fades instead of cutting. Sound never
// changes puzzle state.
export function createSound(root) {
  let muted = false,
    context,
    master;
  try {
    muted = localStorage.getItem('game-lsd:sound') === 'off';
  } catch {}
  const files = {
    click: ['type-space.mp3'],
    open: ['paper-open.mp3'],
    // Page turns rotate through three takes so repeated flips do not sound stamped.
    page: ['paper-turn-0.mp3', 'paper-turn-1.mp3', 'paper-turn-2.mp3'],
    paper: ['paper-turn-1.mp3'],
    book: ['paper-turn-2.mp3'],
    photo: ['paper-turn-1.mp3'],
    door: ['door-open.mp3'],
    drawer: ['drawer.mp3'],
    drawerClose: ['drawer-close.mp3'],
    clockTick: ['clock-tick.mp3'],
    bell: ['bike-bell.mp3'],
    record: ['type-bell.mp3'],
    wood: ['drawer.mp3'],
    press: ['press.mp3'],
    close: ['paper-close.mp3'],
    place: ['type-key.mp3'],
    success: ['type-bell-2.mp3'],
    error: ['knock-error.mp3'],
    switch: ['old-switch.mp3'],
    type: ['type-key.mp3'],
  };
  const levels = {
    door: 0.35,
    page: 0.35,
    paper: 0.35,
    book: 0.35,
    drawer: 0.35,
    press: 0.17,
    clockTick: 0.3,
    place: 0.3,
    open: 0.3,
    close: 0.3,
    type: 0.12,
  };
  // The cue files are peak-levelled; these keep the quieter source takes in their place.
  const trims = {
    click: 0.31,
    open: 0.51,
    close: 0.4,
    paper: 0.72,
    photo: 0.72,
    drawer: 0.34,
    wood: 0.34,
    drawerClose: 0.5,
    press: 0.58,
  };
  // Small pitch drift for cues that repeat many times in a row.
  const drift = { click: 0.05, place: 0.06, page: 0.05, paper: 0.05, photo: 0.05, type: 0.12 };
  const ambientLevel = { intro: 0.05, room: 0.1 };
  const buffers = new Map(),
    playing = new Set(),
    silentTimers = new Set(),
    turn = {};
  let lastType = 0,
    ambient,
    ambientGain,
    ambientMode = '',
    bellTimer;

  function ensureContext() {
    if (context) return context;
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(context.destination);
    // Decode the small cue set up front so the first use is not late.
    for (const list of Object.values(files)) for (const file of list) load(file);
    return context;
  }
  function load(file) {
    if (!buffers.has(file))
      buffers.set(
        file,
        fetch(`${import.meta.env.BASE_URL}assets/audio/${file}`)
          .then((response) => {
            if (!response.ok) throw new Error(file);
            return response.arrayBuffer();
          })
          .then((data) => context.decodeAudioData(data))
          .catch(() => null),
      );
    return buffers.get(file);
  }
  function delay(seconds, callback) {
    const timer = setTimeout(() => {
      silentTimers.delete(timer);
      callback();
    }, seconds * 1000);
    silentTimers.add(timer);
  }
  function pick(kind) {
    const list = files[kind] || files.click;
    turn[kind] = ((turn[kind] ?? -1) + 1) % list.length;
    return list[turn[kind]];
  }
  function fadeOut(entry, seconds = 0.08) {
    if (entry.ended) return;
    try {
      entry.gain.gain.cancelScheduledValues(context.currentTime);
      entry.gain.gain.setTargetAtTime(0.0001, context.currentTime, seconds / 3);
      entry.source.stop(context.currentTime + seconds);
    } catch {
      entry.finish();
    }
  }
  function play(kind = 'click', options = {}) {
    if (kind === 'type') {
      tick();
      return Promise.resolve();
    }
    if (kind === 'clock') kind = 'clockTick';
    // The door waits for its sound; without sound it still gets a fixed beat.
    const silent = () => {
      if (!options.wait) return Promise.resolve();
      options.onDuration?.(2.4);
      return new Promise((resolve) => delay(2.4, resolve));
    };
    if (muted || document.hidden) return silent();
    try {
      ensureContext();
      context.resume().catch(() => {});
    } catch {
      root.dataset.soundState = 'unavailable';
      return silent();
    }
    return load(pick(kind)).then((buffer) => {
      if (!buffer || muted || document.hidden) return silent();
      return new Promise((resolve) => {
        const source = context.createBufferSource(),
          gain = context.createGain();
        const entry = {
          kind,
          source,
          gain,
          ended: false,
          finish() {
            if (entry.ended) return;
            entry.ended = true;
            playing.delete(entry);
            source.disconnect();
            gain.disconnect();
            resolve();
          },
        };
        source.buffer = buffer;
        if (drift[kind]) source.playbackRate.value = 1 + (Math.random() * 2 - 1) * drift[kind];
        gain.gain.value = (options.volume ?? levels[kind] ?? 0.22) * (trims[kind] ?? 1);
        source.connect(gain);
        gain.connect(master);
        source.onended = entry.finish;
        playing.add(entry);
        if (options.wait) {
          root.dataset.entryDuration = buffer.duration.toFixed(2);
          options.onDuration?.(buffer.duration);
        }
        source.start();
        // A context the browser keeps suspended must not leave the door waiting forever.
        delay(buffer.duration / source.playbackRate.value + 0.6, entry.finish);
        root.dataset.lastSound = kind;
        root.dataset.soundState = 'playing';
      });
    });
  }
  // Typewriter key for text that appears letter by letter.
  function tick() {
    if (muted || document.hidden) return;
    const now = performance.now();
    if (now - lastType < 70) return;
    lastType = now;
    play('place', { volume: levels.type });
  }
  function stop(kind) {
    for (const entry of [...playing]) if (!kind || entry.kind === kind) fadeOut(entry);
  }

  // Room tone: one seamless loop under both the opening and the room, with an
  // occasional bicycle bell from the street once the player is inside.
  function scheduleBell() {
    clearTimeout(bellTimer);
    bellTimer = setTimeout(
      () => {
        if (ambientMode === 'room' && !muted && !document.hidden) play('bell', { volume: 0.07 });
        scheduleBell();
      },
      35000 + Math.random() * 50000,
    );
  }
  function setAmbient(mode) {
    ambientMode = mode;
    if (mode === 'room') scheduleBell();
    else clearTimeout(bellTimer);
    if (muted || document.hidden) return;
    try {
      ensureContext();
      context.resume().catch(() => {});
    } catch {
      return;
    }
    if (!mode) {
      if (ambientGain) ambientGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.3);
      return;
    }
    load('ambient-heat.mp3').then((buffer) => {
      if (!buffer || ambientMode !== mode) return;
      if (!ambient) {
        ambient = context.createBufferSource();
        ambientGain = context.createGain();
        ambient.buffer = buffer;
        ambient.loop = true;
        ambientGain.gain.value = 0.0001;
        ambient.connect(ambientGain);
        ambientGain.connect(master);
        ambient.start();
      }
      ambientGain.gain.cancelScheduledValues(context.currentTime);
      ambientGain.gain.setTargetAtTime(ambientLevel[mode], context.currentTime, 0.8);
      root.dataset.ambient = 'playing';
    });
  }
  const startIntro = () => setAmbient('intro');
  const stopIntro = () => {
    if (ambientMode === 'intro') setAmbient('');
  };
  const startAmbient = () => setAmbient('room');
  const visibility = () => {
    if (!context) return;
    if (document.hidden) {
      context.suspend().catch(() => {});
    } else if (!muted) {
      context.resume().catch(() => {});
      if (ambientMode) setAmbient(ambientMode);
    }
  };
  document.addEventListener('visibilitychange', visibility);
  function toggle() {
    muted = !muted;
    if (muted) stop();
    if (context) master.gain.setTargetAtTime(muted ? 0 : 1, context.currentTime, 0.05);
    if (!muted && ambientMode) setAmbient(ambientMode);
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
      for (const entry of [...playing]) entry.finish();
      clearTimeout(bellTimer);
      document.removeEventListener('visibilitychange', visibility);
      silentTimers.forEach(clearTimeout);
      silentTimers.clear();
      ambient = null;
      context?.close().catch(() => {});
    },
  };
}
