/* =========================================================================
   GAMES — each function renders into `el` and calls onComplete(score, meta)
   when finished. Score is already scaled to that game's max award.
   ========================================================================= */

const Games = (() => {

  function sfx(name){ if (window.AudioSys) window.AudioSys.play(name); }
  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  function resultBlock(el, { title, sub, scoreLabel }, onContinue) {
    const wrap = document.createElement('div');
    wrap.className = 'game-result';
    wrap.innerHTML = `
      <div class="display-lg red-glow">${title}</div>
      <p class="muted" style="margin:.8rem 0 1.4rem;">${sub}</p>
      <div class="display-md">${scoreLabel}</div>
      <button class="btn" style="margin-top:2rem;" id="game-continue-btn">CONTINUE</button>
    `;
    el.appendChild(wrap);
    wrap.querySelector('#game-continue-btn').addEventListener('click', onContinue);
  }

  /* ----------------------------------------------------------------------
     GAME 1 — SPIDER-SENSE (reaction test)
     ---------------------------------------------------------------------- */
  function reaction(el, onComplete) {
    el.innerHTML = `
      <div class="game-header">
        <div class="eyebrow">GAME 01</div>
        <div class="display-lg">SPIDER-SENSE</div>
        <p class="muted">Click the glowing target the instant it appears. 10 rounds.</p>
      </div>
      <div class="game-stats">
        <span>ROUND <b id="rx-round">0/10</b></span>
        <span>AVG <b id="rx-avg">—</b> ms</span>
        <span>SCORE <b id="rx-score">0</b></span>
      </div>
      <div class="game-area" id="rx-area"></div>
    `;
    const area = el.querySelector('#rx-area');
    const ROUNDS = 10;
    let round = 0;
    let times = [];
    let waitStart = 0;
    let target = null;
    let timeoutId = null;

    function nextRound() {
      if (target) { target.remove(); target = null; }
      if (round >= ROUNDS) return finish();
      round++;
      el.querySelector('#rx-round').textContent = `${round}/${ROUNDS}`;
      const delay = 500 + Math.random() * 1400;
      timeoutId = setTimeout(spawnTarget, delay);
    }

    function spawnTarget() {
      const rect = area.getBoundingClientRect();
      const size = 64;
      const x = Math.random() * (rect.width - size);
      const y = Math.random() * (rect.height - size);
      target = document.createElement('button');
      target.className = 'reaction-target';
      target.style.left = x + 'px';
      target.style.top = y + 'px';
      target.setAttribute('aria-label', 'target');
      waitStart = performance.now();
      target.addEventListener('click', onHit);
      area.appendChild(target);
    }

    function onHit() {
      const t = performance.now() - waitStart;
      times.push(t);
      sfx('success');
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      el.querySelector('#rx-avg').textContent = avg;
      const score = Math.round(clamp(1000 - avg * 0.85, 100, 1000) * (round / ROUNDS));
      el.querySelector('#rx-score').textContent = score;
      nextRound();
    }

    function finish() {
      const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 999;
      const rating = clamp(Math.round(100 - avg / 6), 10, 99);
      const score = clamp(Math.round(1000 - avg * 0.85), 100, 1000);
      sfx('levelup');
      resultBlock(el, {
        title: 'SPIDER-SENSE SYNCHRONIZED',
        sub: `SPIDER-SENSE RATING: ${rating}%  ·  AVG REACTION: ${avg}ms`,
        scoreLabel: `+${score} XP`,
      }, () => onComplete(score));
    }

    nextRound();
  }

  /* ----------------------------------------------------------------------
     GAME 2 — THE MARVEL ARCHIVES (quiz)
     ---------------------------------------------------------------------- */
  function marvelQuiz(el, onComplete) {
    const bank = (window.SOHAM_QUESTION_BANK && window.SOHAM_QUESTION_BANK.marvel) || MARVEL_QUIZ;
    quizRunner(el, {
      gameNum: '02', title: 'THE MARVEL ARCHIVES',
      sub: 'Prove your knowledge of the Marvel Universe. 10 questions, 10 seconds each.',
      questions: bank.slice(0, 10), maxScore: 2000,
      resultTitle: 'ARCHIVES DECRYPTED',
    }, onComplete);
  }

  /* ----------------------------------------------------------------------
     GAME 6 — WHO KNOWS SOHAM? (personalized quiz)
     ---------------------------------------------------------------------- */
  function sohamQuiz(el, onComplete) {
    const personalBank = (window.SOHAM_QUESTION_BANK && window.SOHAM_QUESTION_BANK.personal) || SOHAM_QUIZ;
    const bgmiBank = (window.SOHAM_QUESTION_BANK && window.SOHAM_QUESTION_BANK.bgmi) || [];
    const bank = [...personalBank, ...bgmiBank].slice(0, 10);
    quizRunner(el, {
      gameNum: '06', title: 'THE SOHAM ARCHIVE',
      sub: 'Think you know the birthday boy?',
      questions: bank, maxScore: 2500,
      resultTitle: 'PROFILE VERIFIED',
    }, onComplete);
  }

  function quizRunner(el, cfg, onComplete) {
    el.innerHTML = `
      <div class="game-header">
        <div class="eyebrow">GAME ${cfg.gameNum}</div>
        <div class="display-lg">${cfg.title}</div>
        <p class="muted">${cfg.sub}</p>
      </div>
      <div class="game-stats">
        <span>QUESTION <b id="qz-n">1/${cfg.questions.length}</b></span>
        <span>CORRECT <b id="qz-correct">0</b></span>
      </div>
      <div class="game-area">
        <div class="quiz-timerbar"><div class="quiz-timerbar-fill" id="qz-timerfill"></div></div>
        <div class="quiz-question" id="qz-question"></div>
        <div class="quiz-options" id="qz-options"></div>
      </div>
    `;
    let idx = 0, correct = 0, timer = null, timeLeft = 10;

    function renderQ() {
      const q = cfg.questions[idx];
      el.querySelector('#qz-n').textContent = `${idx + 1}/${cfg.questions.length}`;
      el.querySelector('#qz-question').textContent = q.q;
      const optWrap = el.querySelector('#qz-options');
      optWrap.innerHTML = '';
      q.options.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'quiz-option';
        b.textContent = opt;
        b.addEventListener('click', () => answer(i));
        optWrap.appendChild(b);
      });
      timeLeft = 10;
      tickTimer();
      clearInterval(timer);
      timer = setInterval(tickTimer, 100);
    }

    function tickTimer() {
      timeLeft -= 0.1;
      const fill = el.querySelector('#qz-timerfill');
      if (fill) fill.style.width = `${clamp(timeLeft / 10 * 100, 0, 100)}%`;
      if (timeLeft <= 0) { clearInterval(timer); answer(-1); }
    }

    function answer(choiceIdx) {
      clearInterval(timer);
      const q = cfg.questions[idx];
      const opts = el.querySelectorAll('.quiz-option');
      opts.forEach((b, i) => {
        b.disabled = true;
        if (i === q.a) b.classList.add('correct');
        else if (i === choiceIdx) b.classList.add('wrong');
      });
      if (choiceIdx === q.a) { correct++; sfx('success'); }
      else sfx('wrong');
      el.querySelector('#qz-correct').textContent = correct;
      setTimeout(() => {
        idx++;
        if (idx >= cfg.questions.length) finish();
        else renderQ();
      }, 700);
    }

    function finish() {
      const score = Math.round((correct / cfg.questions.length) * cfg.maxScore);
      sfx('levelup');
      resultBlock(el, {
        title: cfg.resultTitle,
        sub: `SCORE: ${correct}/${cfg.questions.length} CORRECT`,
        scoreLabel: `+${score} XP`,
      }, () => onComplete(score));
    }

    renderQ();
  }

  /* ----------------------------------------------------------------------
     GAME 3 — AVENGERS MEMORY GRID
     ---------------------------------------------------------------------- */
  function memoryMatch(el, onComplete) {
    const icons = ['🕸️','🛡️','⚡','💥','🐾','🌀','🚀','🧠'];
    let deck = [...icons, ...icons]
      .map(v => ({ v, id: Math.random() }))
      .sort(() => Math.random() - .5);

    el.innerHTML = `
      <div class="game-header">
        <div class="eyebrow">GAME 03</div>
        <div class="display-lg">AVENGERS MEMORY GRID</div>
        <p class="muted">Find every matching pair.</p>
      </div>
      <div class="game-stats">
        <span>MOVES <b id="mm-moves">0</b></span>
        <span>MATCHES <b id="mm-matches">0/${icons.length}</b></span>
        <span>TIME <b id="mm-time">0s</b></span>
      </div>
      <div class="game-area"><div class="memory-grid" id="mm-grid"></div></div>
    `;
    const grid = el.querySelector('#mm-grid');
    let moves = 0, matches = 0, first = null, lock = false;
    const start = performance.now();
    let timerId = setInterval(() => {
      el.querySelector('#mm-time').textContent = Math.round((performance.now() - start) / 1000) + 's';
    }, 250);

    deck.forEach((card, i) => {
      const c = document.createElement('div');
      c.className = 'memory-card';
      c.innerHTML = `<div class="memory-card-inner">
          <div class="memory-face memory-front">?</div>
          <div class="memory-face memory-back">${card.v}</div>
        </div>`;
      c.dataset.value = card.v;
      c.dataset.index = i;
      c.addEventListener('click', () => flip(c));
      grid.appendChild(c);
    });

    function flip(c) {
      if (lock || c.classList.contains('flipped') || c.classList.contains('matched')) return;
      c.classList.add('flipped');
      sfx('click');
      if (!first) { first = c; return; }
      moves++;
      el.querySelector('#mm-moves').textContent = moves;
      lock = true;
      const second = c;
      if (first.dataset.value === second.dataset.value) {
        first.classList.add('matched'); second.classList.add('matched');
        matches++;
        el.querySelector('#mm-matches').textContent = `${matches}/${icons.length}`;
        sfx('success');
        first = null; lock = false;
        if (matches === icons.length) finish();
      } else {
        setTimeout(() => {
          first.classList.remove('flipped');
          second.classList.remove('flipped');
          first = null; lock = false;
        }, 700);
      }
    }

    function finish() {
      clearInterval(timerId);
      const elapsed = (performance.now() - start) / 1000;
      const score = clamp(Math.round(1500 - (moves - icons.length) * 40 - elapsed * 4), 300, 1500);
      sfx('levelup');
      resultBlock(el, {
        title: 'MEMORY CORE SYNCHRONIZED',
        sub: `${moves} MOVES · ${Math.round(elapsed)}s`,
        scoreLabel: `+${score} XP`,
      }, () => onComplete(score));
    }
  }

  /* ----------------------------------------------------------------------
     GAME 4 — WHAT WOULD SOHAM DO? (hero decision, humorous, always positive)
     ---------------------------------------------------------------------- */
  function heroDecision(el, onComplete) {
    const scenarios = [
      {
        prompt: 'A villain threatens the city. You have 10 seconds.',
        a: { label: 'Save the world.', reaction: 'Naturally. The city is safe. Legend status: rising.' },
        b: { label: 'Order food first.', reaction: 'Respectable. Heroes need fuel. The city survives anyway.' },
      },
      {
        prompt: 'Your team needs a leader for the next mission.',
        a: { label: 'Take charge.', reaction: 'Bold move. The squad falls in line immediately.' },
        b: { label: 'Delegate to Iron Man.', reaction: 'Efficient. Tony was going to take credit either way.' },
      },
      {
        prompt: 'A wormhole opens in your bedroom.',
        a: { label: 'Investigate immediately.', reaction: 'Fearless. You find snacks from another dimension.' },
        b: { label: 'Close the door and nap.', reaction: 'Iconic. The wormhole closes itself out of respect.' },
      },
    ];
    let idx = 0, score = 0;

    el.innerHTML = `
      <div class="game-header">
        <div class="eyebrow">GAME 04</div>
        <div class="display-lg">WHAT WOULD SOHAM DO?</div>
        <p class="muted">There are no wrong answers. Only hero answers.</p>
      </div>
      <div class="game-area" id="hd-area" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem; text-align:center; gap:1.4rem;"></div>
    `;
    const area = el.querySelector('#hd-area');

    function renderScenario() {
      const s = scenarios[idx];
      area.innerHTML = `
        <div class="eyebrow">SCENARIO ${idx + 1}/${scenarios.length}</div>
        <div class="display-md">${s.prompt}</div>
        <div style="display:flex; gap:1rem; flex-wrap:wrap; justify-content:center; margin-top:1rem;">
          <button class="btn" data-c="a">${s.a.label}</button>
          <button class="btn ghost" data-c="b">${s.b.label}</button>
        </div>
        <div class="muted" id="hd-reaction" style="min-height:1.4em; margin-top:1rem;"></div>
      `;
      area.querySelectorAll('button[data-c]').forEach(b => {
        b.addEventListener('click', () => choose(b.dataset.c));
      });
    }

    function choose(c) {
      const s = scenarios[idx];
      sfx('click');
      area.querySelector('#hd-reaction').textContent = s[c].reaction;
      area.querySelectorAll('button[data-c]').forEach(b => b.disabled = true);
      score += 333;
      setTimeout(() => {
        idx++;
        if (idx >= scenarios.length) finish();
        else renderScenario();
      }, 1100);
    }

    function finish() {
      sfx('levelup');
      resultBlock(el, {
        title: 'DECISIONS LOGGED',
        sub: 'Every path led somewhere heroic.',
        scoreLabel: `+${Math.round(score)} XP`,
      }, () => onComplete(Math.round(score)));
    }

    renderScenario();
  }

  /* ----------------------------------------------------------------------
     GAME 5 — INFINITY ENERGY (arcade catch)
     ---------------------------------------------------------------------- */
  function energyCatch(el, onComplete) {
    el.innerHTML = `
      <div class="game-header">
        <div class="eyebrow">GAME 05</div>
        <div class="display-lg">INFINITY ENERGY</div>
        <p class="muted">Move with ← → / A D (or touch). Catch orbs, avoid bombs. 60 seconds.</p>
      </div>
      <div class="game-stats">
        <span>SCORE <b id="ec-score">0</b></span>
        <span>COMBO <b id="ec-combo">x1</b></span>
        <span>TIME <b id="ec-time">60s</b></span>
      </div>
      <div class="game-area"><div class="catch-canvas-wrap"><canvas id="catch-canvas"></canvas>
        <div class="catch-hint">← → / A D / SWIPE TO MOVE</div>
      </div></div>
    `;
    const canvas = el.querySelector('#catch-canvas');
    const ctx = canvas.getContext('2d');
    let cw, ch;
    function fit() {
      const rect = canvas.parentElement.getBoundingClientRect();
      cw = canvas.width = rect.width;
      ch = canvas.height = rect.height;
    }
    fit();

    const paddle = { w: 90, h: 14, x: 0, y: 0, speed: 9 };
    paddle.x = cw / 2 - paddle.w / 2;
    paddle.y = ch - 30;
    let keys = {};
    let items = [];
    let score = 0, combo = 1, timeLeft = 60, spawnTimer = 0;
    let running = true;

    function onKey(e, down) {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        keys[e.key.toLowerCase().replace('arrow', '')] = down;
      }
    }
    const kd = e => onKey(e, true), ku = e => onKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    let touchX = null;
    canvas.addEventListener('touchmove', e => {
      const rect = canvas.getBoundingClientRect();
      touchX = e.touches[0].clientX - rect.left;
    }, { passive: true });

    function spawn() {
      const bad = Math.random() < 0.28;
      items.push({
        x: Math.random() * (cw - 20) + 10,
        y: -20,
        r: bad ? 12 : 10,
        vy: 1.8 + Math.random() * 1.6 + timeLeft < 55 ? 0 : 0,
        bad,
      });
    }

    let last = performance.now();
    function loop(now) {
      if (!running) return;
      const dt = Math.min(now - last, 40); last = now;
      timeLeft -= dt / 1000;
      if (timeLeft <= 0) return finish();
      el.querySelector('#ec-time').textContent = Math.ceil(timeLeft) + 's';

      // move paddle
      if (keys['left'] || keys['a']) paddle.x -= paddle.speed;
      if (keys['right'] || keys['d']) paddle.x += paddle.speed;
      if (touchX !== null) paddle.x = touchX - paddle.w / 2;
      paddle.x = clamp(paddle.x, 0, cw - paddle.w);

      spawnTimer -= dt;
      if (spawnTimer <= 0) { spawn(); spawnTimer = 480 - clamp((60 - timeLeft) * 3, 0, 260); }

      items.forEach(it => it.y += (1.6 + (60 - timeLeft) * 0.02) * (dt / 16));
      items = items.filter(it => {
        if (it.y > ch + 20) return false;
        // collision
        if (it.y + it.r >= paddle.y && it.y - it.r <= paddle.y + paddle.h &&
            it.x >= paddle.x - it.r && it.x <= paddle.x + paddle.w + it.r) {
          if (it.bad) { combo = 1; score = Math.max(0, score - 60); sfx('wrong'); }
          else { score += 20 * combo; combo = clamp(combo + 1, 1, 8); sfx('click'); }
          el.querySelector('#ec-score').textContent = score;
          el.querySelector('#ec-combo').textContent = 'x' + combo;
          return false;
        }
        return true;
      });

      ctx.clearRect(0, 0, cw, ch);
      // paddle
      ctx.fillStyle = '#FF3035';
      ctx.shadowColor = '#FF3035'; ctx.shadowBlur = 14;
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.shadowBlur = 0;
      // items
      items.forEach(it => {
        ctx.beginPath();
        ctx.fillStyle = it.bad ? '#444' : '#FFD166';
        ctx.shadowColor = it.bad ? '#000' : '#FFD166';
        ctx.shadowBlur = it.bad ? 0 : 10;
        ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
        ctx.fill();
        if (it.bad) {
          ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('X', it.x, it.y + 4);
        }
      });
      ctx.shadowBlur = 0;

      requestAnimationFrame(loop);
    }

    function finish() {
      running = false;
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      const finalScore = clamp(Math.round(score * 1.1), 0, 2000);
      sfx('levelup');
      resultBlock(el, {
        title: 'ENERGY STABILIZED',
        sub: `RAW SCORE: ${score}`,
        scoreLabel: `+${finalScore} XP`,
      }, () => onComplete(finalScore));
    }

    requestAnimationFrame(loop);
  }

  /* ----------------------------------------------------------------------
     GAME 7 — FINAL BOSS: rapid-fire mixed challenge
     ---------------------------------------------------------------------- */
  function finalBoss(el, onComplete) {
    const pool = [...MARVEL_QUIZ, ...SOHAM_QUIZ].sort(() => Math.random() - .5).slice(0, 8);
    el.innerHTML = `
      <div class="game-header">
        <div class="eyebrow">FINAL MISSION</div>
        <div class="display-lg">LEVEL 18</div>
        <p class="muted">One final challenge. Rapid fire — answer fast, answer true.</p>
      </div>
      <div class="game-stats">
        <span>Q <b id="fb-n">1/${pool.length}</b></span>
        <span>CORRECT <b id="fb-correct">0</b></span>
        <span>MULTIPLIER <b id="fb-mult">x1.0</b></span>
      </div>
      <div class="game-area">
        <div class="quiz-timerbar"><div class="quiz-timerbar-fill" id="fb-timerfill"></div></div>
        <div class="quiz-question" id="fb-question"></div>
        <div class="quiz-options" id="fb-options"></div>
      </div>
    `;
    let idx = 0, correct = 0, mult = 1, timer = null, timeLeft = 6;

    function renderQ() {
      const q = pool[idx];
      el.querySelector('#fb-n').textContent = `${idx + 1}/${pool.length}`;
      el.querySelector('#fb-question').textContent = q.q;
      const optWrap = el.querySelector('#fb-options');
      optWrap.innerHTML = '';
      q.options.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'quiz-option';
        b.textContent = opt;
        b.addEventListener('click', () => answer(i));
        optWrap.appendChild(b);
      });
      timeLeft = 6;
      clearInterval(timer);
      timer = setInterval(tick, 100);
    }
    function tick() {
      timeLeft -= 0.1;
      const fill = el.querySelector('#fb-timerfill');
      if (fill) fill.style.width = `${clamp(timeLeft / 6 * 100, 0, 100)}%`;
      if (timeLeft <= 0) { clearInterval(timer); answer(-1); }
    }
    function answer(choiceIdx) {
      clearInterval(timer);
      const q = pool[idx];
      const opts = el.querySelectorAll('.quiz-option');
      opts.forEach((b, i) => {
        b.disabled = true;
        if (i === q.a) b.classList.add('correct');
        else if (i === choiceIdx) b.classList.add('wrong');
      });
      if (choiceIdx === q.a) {
        correct++; mult = clamp(mult + 0.15, 1, 2.5); sfx('success');
      } else { mult = 1; sfx('wrong'); }
      el.querySelector('#fb-correct').textContent = correct;
      el.querySelector('#fb-mult').textContent = 'x' + mult.toFixed(1);
      setTimeout(() => {
        idx++;
        if (idx >= pool.length) finish();
        else renderQ();
      }, 500);
    }
    function finish() {
      const base = (correct / pool.length) * 5000;
      const score = clamp(Math.round(base * clamp(mult, 1, 1.6)), 0, 5000);
      sfx('levelup');
      resultBlock(el, {
        title: 'MISSION COMPLETE',
        sub: `${correct}/${pool.length} CORRECT · FINAL MULTIPLIER x${mult.toFixed(1)}`,
        scoreLabel: `+${score} XP`,
      }, () => onComplete(score));
    }
    renderQ();
  }

  return { reaction, marvelQuiz, memoryMatch, heroDecision, energyCatch, sohamQuiz, finalBoss };
})();