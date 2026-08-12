const SohamVerseApp = (() => {
  const STORAGE_KEY = 'sohamBirthdayProgress';
  const targetTimestamp = new Date(SOHAM_CONFIG.targetDateTimeIST).getTime();
  const gameDefinitionList = [
    { id: 'reaction', number: '01', title: 'SPIDER-SENSE', desc: 'Reaction test: catch the glow before it disappears.' },
    { id: 'marvelQuiz', number: '02', title: 'THE MARVEL ARCHIVES', desc: 'Marvel knowledge challenge.' },
    { id: 'memoryMatch', number: '03', title: 'AVENGERS MEMORY GRID', desc: 'Match symbols. Build the memory core.' },
    { id: 'heroDecision', number: '04', title: 'WHAT WOULD SOHAM DO?', desc: 'Hero decisions, funny outcomes, major respect.' },
    { id: 'energyCatch', number: '05', title: 'INFINITY ENERGY', desc: 'Catch the good energy. Avoid the bad ones.' },
    { id: 'sohamQuiz', number: '06', title: 'THE SOHAM ARCHIVE', desc: 'A deeply personalized quiz about Soham.' },
    { id: 'familyQuiz', number: '07', title: 'FAMILY FILES', desc: 'A family knowledge challenge with birthday stories, dates, and memories.' },
    { id: 'familyScan', number: '08', title: 'FAMILY SCAN', desc: 'HTML canvas scan to reveal the family archive and PDF memory sheet.' },
    { id: 'finalBoss', number: '09', title: 'FINAL BOSS', desc: 'The final mission: Level 18.' },
  ];

  const state = {
    soundEnabled: false,
    experienceStarted: false,
    countdownTimer: null,
    storyTimer: null,
    storyIndex: 0,
    completed: {},
    totalScore: 0,
    revealSeen: false,
    storySkipped: false,
    secretMode: false,
    reviewMode: false,
    reviewQueue: ['screen-loading', 'screen-countdown', 'screen-midnight', 'screen-story', 'screen-hub'],
    reviewStep: 0,
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.completed) state.completed = saved.completed;
      if (typeof saved.totalScore === 'number') state.totalScore = saved.totalScore;
      if (typeof saved.soundEnabled === 'boolean') state.soundEnabled = saved.soundEnabled;
    } catch (error) {
      console.warn('Progress not restored', error);
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completed: state.completed,
      totalScore: state.totalScore,
      soundEnabled: state.soundEnabled,
    }));
  }

  function resetProgress() {
    state.completed = {};
    state.totalScore = 0;
    state.revealSeen = false;
    state.storySkipped = false;
    state.secretMode = false;
    localStorage.removeItem(STORAGE_KEY);
    renderHub();
  }

  function setScreen(id) {
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.toggle('active', screen.id === id);
    });
  }

  function hideSoundGate() {
    const gate = document.getElementById('sound-gate');
    if (gate) gate.classList.add('hidden');
  }

  function enableSound() {
    state.soundEnabled = true;
    if (window.AudioSys) {
      window.AudioSys.enable();
    }
    saveProgress();
    hideSoundGate();
    if (!state.experienceStarted) {
      startExperience();
    }
  }

  function enterSilent() {
    state.soundEnabled = false;
    if (window.AudioSys) window.AudioSys.disable();
    saveProgress();
    hideSoundGate();
    if (!state.experienceStarted) {
      startExperience();
    }
  }

  function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }

  function updateCountdownDisplay() {
    const now = Date.now();
    const diff = targetTimestamp - now;
    const { days, hours, minutes, seconds } = formatCountdown(diff);
    document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(seconds).padStart(2, '0');

    if (!state.warningTriggered && diff <= 33000 && window.AudioSys && state.soundEnabled) {
      state.warningTriggered = true;
      window.AudioSys.stop('loopbeforetimer');
      window.AudioSys.play('countdown33', { volume: 0.8, loop: true });
    }

    if (diff <= 0) {
      clearInterval(state.countdownTimer);
      triggerMidnight();
    }
  }

  function startCountdownLoop() {
    updateCountdownDisplay();
    state.countdownTimer = setInterval(updateCountdownDisplay, 1000);
  }

  function triggerMidnight() {
    if (state.experienceStarted && state.midnightTriggered) return;
    state.midnightTriggered = true;
    const screen = document.getElementById('screen-midnight');
    setScreen('screen-midnight');
    if (window.AudioSys && state.soundEnabled) {
      window.AudioSys.play('midnight', { loop: false, volume: 0.7 });
      window.AudioSys.play('birthday', { loop: true, volume: 0.4 });
    }

    const text = document.getElementById('midnight-text');
    text.classList.remove('show');
    text.innerHTML = '<div>LEVEL 18</div><div style="font-size:.5em; letter-spacing:.18em; margin-top:1rem;">UNLOCKED</div>';
    text.classList.add('show');
    screen.classList.add('midnight-shake');
    setTimeout(() => {
      text.innerHTML = '<div>HAPPY BIRTHDAY</div><div style="font-size:.47em; letter-spacing:.18em; margin-top:1rem;">SOHAM</div>';
      text.classList.remove('show');
      void text.offsetWidth;
      text.classList.add('show');
      const wave = document.createElement('div');
      wave.className = 'energy-wave';
      screen.appendChild(wave);
      Particles.confettiBurst(0.5, 0.3, 180);
      Particles.fireworksShow(6);
    }, 1100);

    setTimeout(() => {
      buildStory();
      setScreen('screen-story');
    }, 2600);
  }

  function startExperience() {
    state.experienceStarted = true;
    state.warningTriggered = false;
    const now = Date.now();
    if (now >= targetTimestamp) {
      triggerMidnight();
      return;
    }
    if (window.AudioSys && state.soundEnabled) {
      window.AudioSys.play('loopbeforetimer', { volume: 0.7, loop: true });
    }
    setScreen('screen-countdown');
    startCountdownLoop();
  }

  function runLoadingSequence() {
    const steps = [
      'INITIALIZING SOHAMVERSE...',
      'SCANNING HERO PROFILE...',
      'IDENTITY CONFIRMED',
      'SOHAM',
      'AGE: 17',
      'NEW LEVEL DETECTED...',
      '18',
    ];
    const loadingText = document.getElementById('loading-text');
    const loadingBar = document.getElementById('loading-bar');
    let n = 0;

    const updateStep = () => {
      if (n >= steps.length) {
        setTimeout(() => {
          setScreen('screen-countdown');
          startCountdownLoop();
        }, 500);
        return;
      }

      const step = steps[n];
      if (step === 'SOHAM') {
        loadingText.classList.add('hero');
      } else {
        loadingText.classList.remove('hero');
      }
      loadingText.textContent = step;
      loadingBar.style.width = `${(n + 1) / steps.length * 100}%`;
      n += 1;
      setTimeout(updateStep, n === steps.length ? 900 : 500);
    };

    updateStep();
  }

  function assetFallback(label) {
    return `
      <div class="asset-fallback">
        <div style="font-size:1.3rem; color: var(--red-bright);">⚠</div>
        <div>${label}</div>
      </div>
    `;
  }

  function safeImageCard(photo, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'story-card';
    wrapper.dataset.index = index;

    const img = document.createElement('img');
    img.alt = photo.title || 'Soham memory';
    img.src = photo.src;
    img.loading = 'eager';
    img.onerror = () => {
      wrapper.innerHTML = assetFallback('IMAGE UNAVAILABLE');
    };

    const caption = document.createElement('div');
    caption.className = 'story-caption';
    caption.innerHTML = `
      <div class="title">${photo.title || ''}</div>
      <div class="cap">${photo.caption || ''}</div>
    `;

    wrapper.appendChild(img);
    wrapper.appendChild(caption);
    return wrapper;
  }

  function safeVideoCard(video, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'story-card';
    wrapper.dataset.index = index;

    const item = document.createElement('video');
    item.src = video.src;
    item.muted = true;
    item.autoplay = true;
    item.playsInline = true;
    item.loop = true;
    item.controls = false;
    item.onerror = () => {
      wrapper.innerHTML = assetFallback('VIDEO UNAVAILABLE');
    };

    const caption = document.createElement('div');
    caption.className = 'story-caption';
    caption.innerHTML = `
      <div class="title">${video.title || 'VIDEO MEMORY'}</div>
      <div class="cap">A moment worth replaying.</div>
    `;

    wrapper.appendChild(item);
    wrapper.appendChild(caption);
    return wrapper;
  }

  function getRandomQuote() {
    const quotes = Array.isArray(HERO_QUOTES) && HERO_QUOTES.length ? HERO_QUOTES : [
      'The next arc is always the best one.',
      'A little chaos is just a sign of a big story.'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  function buildSideQuotePanel() {
    const quote = getRandomQuote();
    return `
      <aside class="side-quote-panel">
        <div class="eyebrow">HERO NOTE</div>
        <div class="side-quote">“${quote}”</div>
      </aside>
    `;
  }

  function buildStory() {
    const stage = document.getElementById('screen-story');
    if (!stage) return;

    const photoItems = SOHAM_PHOTOS.map((item) => ({ ...item, kind: 'photo' }));
    const videoItems = SOHAM_VIDEOS.map((item) => ({ ...item, kind: 'video' }));
    const combined = [...photoItems, ...videoItems];

    const storyMarkup = `
      <div class="story-layout">
        <div class="story-main">
          <div class="section-wrap">
            <div class="section-head">
              <div class="eyebrow">THE STORY SO FAR</div>
              <div class="display-lg">SOHAM: THE ORIGIN STORY</div>
            </div>

            <div class="marvel-opening-wrap">
              <video id="marvel-opening-video" muted playsinline autoplay controls="false" preload="auto">
                <source src="assets/videos/marvelopening.mp4" type="video/mp4">
              </video>
            </div>

            <div class="story-stage-wrap">
              <button class="story-arrow left" id="story-prev" aria-label="Previous photo">‹</button>
              <div class="story-stage" id="story-stage"></div>
              <button class="story-arrow right" id="story-next" aria-label="Next photo">›</button>
            </div>

            <div class="story-interlude" id="story-interlude">17 YEARS OF MEMORIES</div>
            <div class="story-progress" id="story-progress"></div>
            <div class="story-controls">
              <button class="btn" id="skip-story">SKIP TO TRAINING</button>
            </div>

            <div class="section-head" style="margin-top:4rem;">
              <div class="eyebrow">MEMORY TIMELINE</div>
              <div class="display-lg">THE CHAPTERS</div>
            </div>
            <div class="timeline-track">
              <div class="timeline-card">
                <div class="timeline-year">2008</div>
                <div class="timeline-chapter">CHAPTER 01</div>
                <div class="timeline-desc">The beginning. Tiny, curious, and already a little chaotic.</div>
              </div>
              <div class="timeline-card">
                <div class="timeline-year">2012</div>
                <div class="timeline-chapter">CHAPTER 02</div>
                <div class="timeline-desc">The childhood arc. Big smiles, big energy, bigger mischief.</div>
              </div>
              <div class="timeline-card">
                <div class="timeline-year">2016</div>
                <div class="timeline-chapter">CHAPTER 03</div>
                <div class="timeline-desc">School era. Friendships, confidence, and unstoppable momentum.</div>
              </div>
              <div class="timeline-card">
                <div class="timeline-year">2020</div>
                <div class="timeline-chapter">CHAPTER 04</div>
                <div class="timeline-desc">The chaos era. Every chapter had its own unforgettable burst of fun.</div>
              </div>
              <div class="timeline-card">
                <div class="timeline-year">2024</div>
                <div class="timeline-chapter">CHAPTER 05</div>
                <div class="timeline-desc">Growth, ambition, and the kind of personality that lights up a room.</div>
              </div>
              <div class="timeline-card">
                <div class="timeline-year">2026</div>
                <div class="timeline-chapter">CHAPTER 06</div>
                <div class="timeline-desc">Level 18. The beginning of a new chapter, and a legendary one.</div>
              </div>
            </div>
          </div>
        </div>
        ${buildSideQuotePanel()}
      </div>
    `;

    stage.innerHTML = storyMarkup;

    const storyStage = document.getElementById('story-stage');
    const progressWrap = document.getElementById('story-progress');
    const interlude = document.getElementById('story-interlude');
    const skipButton = document.getElementById('skip-story');
    const openingVideo = document.getElementById('marvel-opening-video');
    const prevBtn = document.getElementById('story-prev');
    const nextBtn = document.getElementById('story-next');

    function renderStoryCards() {
      storyStage.innerHTML = '';
      progressWrap.innerHTML = '';

      combined.forEach((item, index) => {
        const card = item.kind === 'video' ? safeVideoCard(item, index) : safeImageCard(item, index);
        storyStage.appendChild(card);

        const dot = document.createElement('span');
        dot.className = 'story-dot';
        progressWrap.appendChild(dot);
      });
    }

    renderStoryCards();

    const cards = [...storyStage.querySelectorAll('.story-card')];
    const dots = [...progressWrap.querySelectorAll('.story-dot')];

    function renderStoryCard(index) {
      cards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
        card.classList.toggle('leaving', i !== index);
      });
      dots.forEach((dot, i) => dot.classList.toggle('on', i === index));

      if (index === 0) {
        interlude.textContent = '17 YEARS OF MEMORIES';
        interlude.classList.add('show');
      } else if (index === Math.floor(cards.length / 2)) {
        interlude.textContent = 'BUT THIS...';
        interlude.classList.add('show');
      } else if (index === cards.length - 1) {
        interlude.textContent = 'WELCOME TO 18.';
        interlude.classList.add('show');
      } else {
        interlude.classList.remove('show');
      }
    }

    function stepStory(direction = 1) {
      if (state.storySkipped || !cards.length) return;
      const nextIndex = (state.storyIndex + direction + cards.length) % cards.length;
      state.storyIndex = nextIndex;
      renderStoryCard(nextIndex);
    }

    if (openingVideo) {
      openingVideo.play().catch(() => {});
      openingVideo.addEventListener('ended', () => {
        openingVideo.parentElement.classList.add('hidden');
        renderStoryCard(0);
      }, { once: true });
    } else {
      renderStoryCard(0);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => stepStory(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => stepStory(1));
    if (storyStage) {
      storyStage.addEventListener('click', () => stepStory(1));
    }

    clearInterval(state.storyTimer);
    state.storyTimer = setInterval(() => stepStory(1), 4500);

    skipButton.addEventListener('click', () => {
      state.storySkipped = true;
      clearInterval(state.storyTimer);
      renderHub();
      setScreen('screen-hub');
    });
  }

  function renderHub() {
    const root = document.getElementById('screen-hub');
    if (!root) return;

    const totalGames = gameDefinitionList.length;
    const completedCount = Object.keys(state.completed).length;
    const rank = getRankForScore(state.totalScore);

    root.innerHTML = `
      <div class="hub-layout">
        <div class="hub-main">
          <div class="section-wrap">
            <div class="section-head">
              <div class="eyebrow">HERO TRAINING</div>
              <div class="display-lg">THE SOHAMVERSE COMMAND ROOM</div>
            </div>

            <div class="hub-status">
              <div>
                <span class="eyebrow" style="display:block; margin-bottom:.4rem;">SOHAM</span>
                <b>LEVEL 18</b>
              </div>
              <div>
                <span class="eyebrow" style="display:block; margin-bottom:.4rem;">XP</span>
                <b>${state.totalScore}</b>
              </div>
              <div>
                <span class="eyebrow" style="display:block; margin-bottom:.4rem;">RANK</span>
                <b>${rank}</b>
              </div>
              <div>
                <span class="eyebrow" style="display:block; margin-bottom:.4rem;">COMPLETED</span>
                <b>${completedCount}/${totalGames}</b>
              </div>
            </div>

            <div class="xp-bar-track">
              <div class="xp-bar-fill" style="width:${Math.min(100, (state.totalScore / 10000) * 100)}%"></div>
            </div>

            <div class="game-grid">
              ${gameDefinitionList.map((game, index) => {
                const isDone = !!state.completed[game.id];
                const unlocked = index === 0 || gameDefinitionList.slice(0, index).every((prev) => !!state.completed[prev.id]);
                return `
                  <button class="game-card ${isDone ? 'done' : ''}" data-game-id="${game.id}" ${unlocked ? '' : 'disabled'}>
                    <div class="num">GAME ${game.number}</div>
                    <h3>${game.title}</h3>
                    <p>${game.desc}</p>
                    <div class="status">${isDone ? '✓ COMPLETE' : unlocked ? 'READY' : 'LOCKED'}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        ${buildSideQuotePanel()}
      </div>
    `;

    root.querySelectorAll('.game-card').forEach((card) => {
      const id = card.dataset.gameId;
      const game = gameDefinitionList.find((item) => item.id === id);
      const disabled = card.hasAttribute('disabled');
      if (!disabled) {
        card.addEventListener('click', () => startGame(game.id));
      }
    });
  }

  function finalizeGame(gameId, awardedScore) {
    state.completed[gameId] = true;
    state.totalScore += Math.round(awardedScore || 0);
    saveProgress();
    renderHub();
    if (window.AudioSys && state.soundEnabled) {
      window.AudioSys.play('levelup', { volume: 0.6 });
    }

    const allComplete = gameDefinitionList.every((game) => state.completed[game.id]);
    if (allComplete) {
      setTimeout(() => {
        showFinalReveal();
      }, 500);
      return;
    }

    setTimeout(() => {
      setScreen('screen-hub');
    }, 250);
  }

  function startGame(gameId) {
    const gameEl = document.getElementById('screen-game');
    gameEl.innerHTML = '';
    setScreen('screen-game');

    if (window.AudioSys && state.soundEnabled) {
      window.AudioSys.play('gameStart', { volume: 0.5 });
    }

    const match = {
      reaction: () => Games.reaction(gameEl, (score) => finalizeGame('reaction', score)),
      marvelQuiz: () => Games.marvelQuiz(gameEl, (score) => finalizeGame('marvelQuiz', score)),
      memoryMatch: () => Games.memoryMatch(gameEl, (score) => finalizeGame('memoryMatch', score)),
      heroDecision: () => Games.heroDecision(gameEl, (score) => finalizeGame('heroDecision', score)),
      energyCatch: () => Games.energyCatch(gameEl, (score) => finalizeGame('energyCatch', score)),
      sohamQuiz: () => Games.sohamQuiz(gameEl, (score) => finalizeGame('sohamQuiz', score)),
      familyQuiz: () => Games.familyQuiz(gameEl, (score) => finalizeGame('familyQuiz', score)),
      familyScan: () => Games.familyScan(gameEl, (score) => finalizeGame('familyScan', score)),
      finalBoss: () => Games.finalBoss(gameEl, (score) => finalizeGame('finalBoss', score)),
    };

    if (match[gameId]) {
      match[gameId]();
    }
  }

  function showFinalReveal() {
    const root = document.getElementById('screen-reveal');
    const totalScore = state.totalScore;
    const rank = getRankForScore(totalScore);
    const message = SOHAM_MESSAGE;

    root.innerHTML = `
      <div class="section-wrap reveal-score">
        <div class="eyebrow">FINAL SCORE</div>
        <div class="display-lg">MISSION COMPLETE</div>
        <div class="display-md" style="margin-top:1rem;">SOHAM · LEVEL 18</div>
        <div class="display-md" style="margin-top:1rem; color: var(--gold);">RANK: ${rank}</div>
        <div class="display-md" style="margin-top:1rem;">SCORE: ${totalScore} XP</div>

        <div class="reveal-final-photo">
          <img src="${SOHAM_FINAL_PHOTO}" alt="Soham happy birthday" onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\'asset-fallback\'>FINAL PHOTO UNAVAILABLE</div>'" />
        </div>

        <div class="display-lg" style="margin-top:1rem;">HAPPY<br>18TH<br>BIRTHDAY<br>SOHAM!</div>

        <div class="reveal-message">
          <p><strong>${message.heading}</strong></p>
          ${message.paragraphs.map((p) => `<p>${p}</p>`).join('')}
          <p><strong>${message.signoff}</strong></p>
          <p>${message.closing}</p>
        </div>

        <div class="reveal-buttons">
          <button class="btn" id="replay-experience">PLAY AGAIN</button>
          <button class="btn ghost" id="view-memories">VIEW MEMORIES</button>
          <button class="btn gold" id="view-score">VIEW SCORE</button>
        </div>
      </div>
    `;

    if (window.AudioSys && state.soundEnabled) {
      window.AudioSys.play('finalReveal', { volume: 0.8 });
      window.AudioSys.play('finalMusic', { loop: true, volume: 0.6 });
    }

    Particles.confettiBurst(0.5, 0.18, 240);
    Particles.confettiBurst(0.1, 0.18, 120);
    Particles.confettiBurst(0.9, 0.16, 120);
    Particles.fireworksShow(8);

    document.getElementById('replay-experience').addEventListener('click', () => {
      resetProgress();
      state.experienceStarted = false;
      setScreen('screen-countdown');
      startExperience();
    });

    document.getElementById('view-memories').addEventListener('click', () => {
      buildStory();
      setScreen('screen-story');
    });

    document.getElementById('view-score').addEventListener('click', () => {
      setScreen('screen-reveal');
    });

    setScreen('screen-reveal');
  }

  function attachGlobalControls() {
    const muteButton = document.getElementById('btn-mute');
    if (muteButton) {
      muteButton.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        if (window.AudioSys) {
          if (state.soundEnabled) {
            window.AudioSys.enable();
          } else {
            window.AudioSys.disable();
          }
        }
        muteButton.textContent = state.soundEnabled ? '🔊' : '🔇';
        saveProgress();
      });
    }

    const restartButton = document.getElementById('btn-restart');
    if (restartButton) {
      restartButton.addEventListener('click', () => {
        resetProgress();
        state.experienceStarted = false;
        setScreen('screen-loading');
        runLoadingSequence();
      });
    }

    const enterSound = document.getElementById('btn-enter-sound');
    if (enterSound) {
      enterSound.addEventListener('click', enableSound);
    }

    const silentButton = document.getElementById('btn-enter-silent');
    if (silentButton) {
      silentButton.addEventListener('click', enterSilent);
    }

    const countdown18 = document.querySelector('.countdown-18');
    if (countdown18) {
      let secretClicks = 0;
      countdown18.addEventListener('click', () => {
        secretClicks += 1;
        if (secretClicks >= 5) {
          state.totalScore += 500;
          saveProgress();
          renderHub();
          if (window.AudioSys && state.soundEnabled) {
            window.AudioSys.play('levelup', { volume: 0.6 });
          }
          const target = document.getElementById('countdown-live-note');
          if (target) {
            target.textContent = 'SECRET HERO MODE ACTIVATED';
          }
        }
      });
    }

    const keyHistory = [];
    document.addEventListener('keydown', (event) => {
      if (event.key && /^[a-zA-Z]$/.test(event.key)) {
        keyHistory.push(event.key.toLowerCase());
        if (keyHistory.length > 5) keyHistory.shift();
        const combo = keyHistory.join('');
        if (combo.includes('soham') || (combo.endsWith('soham'))) {
          state.secretMode = true;
          state.totalScore += 500;
          saveProgress();
          renderHub();
          if (window.AudioSys && state.soundEnabled) {
            window.AudioSys.play('success', { volume: 0.6 });
          }
        }
      }
    });
  }

  function ready() {
    loadProgress();
    renderHub();
    Particles.init();
    attachGlobalControls();
    if (state.soundEnabled) {
      window.AudioSys && window.AudioSys.enable();
    }
    setScreen('screen-loading');
    runLoadingSequence();
  }

  return { ready, startExperience, triggerMidnight, buildStory, renderHub, showFinalReveal, resetProgress };
})();

document.addEventListener('DOMContentLoaded', () => {
  window.SohamVerseApp = SohamVerseApp;
  SohamVerseApp.ready();
});
