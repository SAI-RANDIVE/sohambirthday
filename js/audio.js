const AudioSys = (() => {
  const cache = {};
  let enabled = false;
  let context = null;
  let masterGain = null;
  let currentMusicTrack = null;

  const musicTracks = new Set([
    'intro',
    'countdown33',
    'loopbeforetimer',
    'midnight',
    'hero',
    'game',
    'finalMusic',
    'birthday',
  ]);

  function ensureContext() {
    if (!context) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return null;
      context = new AudioContextCtor();
      masterGain = context.createGain();
      masterGain.gain.value = 0.0001;
      masterGain.connect(context.destination);
    }
    return context;
  }

  function setEnabled(value) {
    enabled = !!value;
    if (context && masterGain) {
      masterGain.gain.setTargetAtTime(enabled ? 0.7 : 0.0001, context.currentTime, 0.08);
    }
  }

  function enable() {
    const ctx = ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    setEnabled(true);
  }

  function disable() {
    setEnabled(false);
    stopMusic();
  }

  function getAudioObject(src) {
    if (!cache[src]) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0.6;
      cache[src] = audio;
    }
    return cache[src];
  }

  function stopMusic() {
    Object.keys(SOHAM_AUDIO || {}).forEach((key) => {
      if (!musicTracks.has(key)) return;
      const src = SOHAM_AUDIO[key];
      if (!src || !cache[src]) return;
      const audio = cache[src];
      audio.pause();
      audio.currentTime = 0;
    });
    currentMusicTrack = null;
  }

  function play(name, options = {}) {
    if (!enabled || !SOHAM_AUDIO || !SOHAM_AUDIO[name]) return;
    const src = SOHAM_AUDIO[name];
    const audio = getAudioObject(src);
    const isMusic = musicTracks.has(name);

    if (isMusic && currentMusicTrack && currentMusicTrack !== name) {
      const currentSrc = SOHAM_AUDIO[currentMusicTrack];
      if (currentSrc && cache[currentSrc]) {
        cache[currentSrc].pause();
        cache[currentSrc].currentTime = 0;
      }
    }

    const shouldLoop = isMusic ? true : false;
    audio.loop = options.loop !== undefined ? !!options.loop : shouldLoop;
    audio.volume = typeof options.volume === 'number' ? options.volume : 0.6;

    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    if (isMusic) {
      currentMusicTrack = name;
    }
  }

  function stop(name) {
    const src = SOHAM_AUDIO && SOHAM_AUDIO[name];
    if (!src || !cache[src]) return;
    const audio = cache[src];
    audio.pause();
    audio.currentTime = 0;
    if (currentMusicTrack === name) currentMusicTrack = null;
  }

  window.AudioSys = {
    enable,
    disable,
    setEnabled,
    play,
    stop,
    stopMusic,
    isEnabled: () => enabled,
    getContext: () => context,
    currentTrack: () => currentMusicTrack,
  };

  return window.AudioSys;
})();
