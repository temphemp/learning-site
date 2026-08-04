/**
 * Fill-in-the-Blanks (FITB) – Shared Game Logic
 *
 * See style-guide.md §13 for full documentation.
 *
 * Responsibilities:
 * - Load a JSON data file
 * - Generate 10-word spaced-repetition rounds
 * - Persist per-word stats (localStorage) and the current round (sessionStorage)
 * - Render blanks in the word display
 * - Render hint buttons (TTS, definitions)
 * - Play sounds (TTS, correct, incorrect)
 * - Show the definitions modal
 * - Render answer buttons from a fixed options list
 * - Check answers, update SRS boxes, and advance within/across rounds
 *
 * Page files supply only a shell and a small config object, e.g.:
 *
 *   FITB.init({
 *     dataFile: './data-files/ending-l.json',
 *     options: ['le', 'el', 'al'],
 *   });
 */

const FITB = (() => {
  const CONGRATULATORY_MESSAGES = [
    'Great job! ✨',
    'You got it! 🎉',
    'Brilliant spelling! ⭐',
    'Fantastic work! 🌟',
    'Super star! 💫',
    'Nailed it! 🏆',
  ];

  const ROUND_ADVANCE_MS = 1500;
  const ROUND_AUTO_ADVANCE_MS = 5000;
  const ROUND_SIZE = 10;

  const CONFETTI_COLORS = [
    '#6C5CE7',
    '#A29BFE',
    '#FD79A8',
    '#FDCB6E',
    '#00CEC9',
    '#E17055',
    '#74B9FF',
  ];

  /** @type {string} */
  let currentWord = '';

  /** @type {Array<{ pos: string, definition: string }>} */
  let currentDefinitions = [];

  /** @type {number} */
  let currentHiddenLetters = 0;

  /** @type {string} */
  let dataFile = '';

  /** @type {Record<string, { 'hidden-letters': number, definitions: Array<{ pos: string, definition: string }> }>} */
  let wordData = null;

  /** @type {{ bands: Array<{ id: string, maxCorrect: number, sound: string | null, confetti: boolean }> } | null} */
  let scoringData = null;

  /** @type {boolean} */
  let roundActive = false;

  /** @type {boolean} */
  let hintButtonsWired = false;

  /** @type {boolean} */
  let answerButtonsWired = false;

  /** @type {boolean} */
  let roundActionsWired = false;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let advanceTimeout = null;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let autoAdvanceTimeout = null;

  /** @type {boolean} */
  let hadMistakeThisWord = false;

  /** @type {number} */
  let firstGuessCorrectCount = 0;

  /** @type {HTMLDialogElement | null} */
  let definitionsModal = null;

  /** @type {HTMLAudioElement | null} */
  let currentTtsAudio = null;

  /** @type {HTMLCanvasElement | null} */
  let confettiCanvas = null;

  /** @type {number | null} */
  let confettiAnimationId = null;

  /** @type {Record<string, HTMLAudioElement>} */
  const feedbackSounds = {};

  /** @type {Record<string, string>} */
  const POS_CLASS_MAP = {
    noun: 'fitb-pos--noun',
    'plural noun': 'fitb-pos--plural-noun',
    verb: 'fitb-pos--verb',
    adjective: 'fitb-pos--adjective',
    adverb: 'fitb-pos--adverb',
    determiner: 'fitb-pos--determiner',
    pronoun: 'fitb-pos--pronoun',
  };

  /**
   * @param {string} path
   * @returns {string}
   */
  function getSlugFromDataFile(path) {
    const filename = path.replace(/^.*\//, '');
    return filename.replace(/\.json$/i, '');
  }

  /**
   * @param {string} file
   * @param {string} word
   * @returns {string}
   */
  function getTtsUrl(file, word) {
    const slug = getSlugFromDataFile(file);
    const dir = file.includes('/') ? file.slice(0, file.lastIndexOf('/') + 1) : '';
    const soundsDir = dir.replace(/data-files\/?$/, 'static/sounds/');
    return `${soundsDir}${slug}-tts/${word}.mp3`;
  }

  /**
   * @param {string} pos
   * @returns {string}
   */
  function posToClass(pos) {
    return POS_CLASS_MAP[pos.trim().toLowerCase()] || 'fitb-pos--other';
  }

  /**
   * @param {string} text
   * @returns {string}
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getStaticSoundsPath() {
    const dir = dataFile.includes('/') ? dataFile.slice(0, dataFile.lastIndexOf('/') + 1) : '';
    return dir.replace(/data-files\/?$/, 'static/sounds/');
  }

  /**
   * @param {'correct' | 'incorrect' | 'applause' | 'success'} name
   * @returns {HTMLAudioElement}
   */
  function getFeedbackSound(name) {
    if (!feedbackSounds[name]) {
      const audio = new Audio(`${getStaticSoundsPath()}${name}.ogg`);
      audio.preload = 'auto';
      feedbackSounds[name] = audio;
    }

    return feedbackSounds[name];
  }

  /**
   * @param {'correct' | 'incorrect' | 'applause' | 'success'} name
   */
  function playFeedbackSound(name) {
    const audio = getFeedbackSound(name);
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error(`FITB: could not play ${name} sound`, error);
    });
  }

  /**
   * Play a celebration sound only after correct.ogg has finished (or immediately
   * if it already ended), so the two never overlap.
   * @param {'applause' | 'success'} name
   */
  function playCelebrationAfterCorrect(name) {
    const correctAudio = getFeedbackSound('correct');

    const playCelebration = () => {
      playFeedbackSound(name);
    };

    if (!correctAudio.paused && !correctAudio.ended) {
      correctAudio.addEventListener('ended', playCelebration, { once: true });
      return;
    }

    playCelebration();
  }

  /**
   * @param {string} word
   * @param {number} hiddenLetters
   * @returns {string}
   */
  function getHiddenSubstring(word, hiddenLetters) {
    const count = Math.min(Math.abs(hiddenLetters), word.length);

    if (hiddenLetters > 0) {
      return word.slice(0, count);
    }

    if (hiddenLetters < 0) {
      return word.slice(word.length - count);
    }

    return '';
  }

  function hideCorrectMessage() {
    const message = document.getElementById('correct-message');
    if (message) {
      message.classList.add('hidden');
    }
  }

  function showCorrectMessage() {
    const message = document.getElementById('correct-message');
    if (!message) {
      return;
    }

    const text =
      CONGRATULATORY_MESSAGES[Math.floor(Math.random() * CONGRATULATORY_MESSAGES.length)];
    message.textContent = text;
    message.classList.remove('hidden');
  }

  function resetAnswerButtons() {
    document.querySelectorAll('.fitb-answer-btn').forEach((button) => {
      button.disabled = false;
      button.classList.remove(
        'fitb-answer-btn--correct',
        'fitb-answer-btn--disabled',
      );
    });
  }

  /**
   * @param {HTMLButtonElement} correctButton
   */
  function lockAnswerButtonsAfterCorrect(correctButton) {
    document.querySelectorAll('.fitb-answer-btn').forEach((button) => {
      button.disabled = true;

      if (button === correctButton) {
        button.classList.add('fitb-answer-btn--correct');
      } else {
        button.classList.add('fitb-answer-btn--disabled');
      }
    });
  }

  function playIncorrectWordAnimation() {
    const wordDisplay = document.getElementById('word-display');
    if (!wordDisplay) {
      return;
    }

    wordDisplay.classList.remove('fitb-word-display--incorrect');
    void wordDisplay.offsetWidth;
    wordDisplay.classList.add('fitb-word-display--incorrect');

    wordDisplay.addEventListener(
      'animationend',
      () => {
        wordDisplay.classList.remove('fitb-word-display--incorrect');
      },
      { once: true },
    );
  }

  /**
   * @param {HTMLButtonElement} button
   */
  function handleAnswerClick(button) {
    if (!roundActive) {
      return;
    }

    const chosen = button.textContent || '';
    const correctAnswer = getHiddenSubstring(currentWord, currentHiddenLetters);

    if (chosen !== correctAnswer) {
      playFeedbackSound('incorrect');
      playIncorrectWordAnimation();
      hadMistakeThisWord = true;
      return;
    }

    roundActive = false;

    if (!hadMistakeThisWord) {
      firstGuessCorrectCount += 1;
    }

    playFeedbackSound('correct');
    lockAnswerButtonsAfterCorrect(button);

    const stats = getStats();
    const wordStats = getWordStats(stats, currentWord);
    if (hadMistakeThisWord) {
      wordStats.box = Math.max(0, wordStats.box - 1);
    } else {
      wordStats.box = Math.min(3, wordStats.box + 1);
    }
    wordStats.lastRound = stats.roundNumber;
    wordStats.seen += 1;
    stats.words[currentWord] = wordStats;
    saveStats(stats);

    const round = getCurrentRound();
    let roundComplete = false;
    if (round) {
      round.index += 1;
      if (round.index < ROUND_SIZE) {
        saveCurrentRound(round);
      } else if (round.index === ROUND_SIZE) {
        clearCurrentRound();
        roundComplete = true;
      }
      updateProgress(round.index);
    } else {
      updateProgress();
    }

    const wordDisplay = document.getElementById('word-display');
    if (wordDisplay) {
      renderWordDisplay(wordDisplay, buildWordDisplay(currentWord, 0));
    }

    showCorrectMessage();

    if (advanceTimeout) {
      clearTimeout(advanceTimeout);
    }

    if (roundComplete) {
      const capturedScore = firstGuessCorrectCount;
      advanceTimeout = setTimeout(() => {
        advanceTimeout = null;
        onRoundComplete(capturedScore);
      }, ROUND_ADVANCE_MS);
      return;
    }

    advanceTimeout = setTimeout(() => {
      advanceTimeout = null;
      loadRound();
    }, ROUND_ADVANCE_MS);
  }

  /**
   * @param {string[]} options
   */
  function renderAnswerButtons(options) {
    const container = document.querySelector('.fitb-answer-buttons');
    if (!container) {
      return;
    }

    container.innerHTML = options
      .map((option) => `<button class="fitb-answer-btn" type="button">${escapeHtml(option)}</button>`)
      .join('');

    if (answerButtonsWired) {
      return;
    }

    container.addEventListener('click', (event) => {
      const button = event.target.closest('.fitb-answer-btn');
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      handleAnswerClick(button);
    });

    answerButtonsWired = true;
  }

  function loadRound() {
    if (!wordData) {
      return;
    }

    hadMistakeThisWord = false;

    let round = getCurrentRound();
    if (round === null) {
      round = generateRound();
    }

    const word = round.words[round.index];
    const entry = wordData[word];
    currentWord = word;
    currentDefinitions = entry.definitions;
    currentHiddenLetters = entry['hidden-letters'];

    const wordDisplay = document.getElementById('word-display');
    if (wordDisplay) {
      renderWordDisplay(wordDisplay, buildWordDisplay(word, currentHiddenLetters));
    }

    hideCorrectMessage();
    resetAnswerButtons();
    updateProgress();
    roundActive = true;
    preloadWordTts();
  }

  function preloadFeedbackSounds() {
    getFeedbackSound('correct');
    getFeedbackSound('incorrect');
    getFeedbackSound('applause');
    getFeedbackSound('success');
  }

  function preloadWordTts() {
    const url = getTtsUrl(dataFile, currentWord);
    if (currentTtsAudio?.src.endsWith(`${currentWord}.mp3`)) {
      return;
    }

    currentTtsAudio = new Audio(url);
    currentTtsAudio.preload = 'auto';
  }

  function playWordTts() {
    if (!currentTtsAudio) {
      preloadWordTts();
    }

    const audio = currentTtsAudio;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error('FITB: could not play TTS', error);
    });
  }

  function getStatsKey() {
    return `fitb-stats:${getSlugFromDataFile(dataFile)}`;
  }

  function getRoundKey() {
    return `fitb-round:${getSlugFromDataFile(dataFile)}`;
  }

  /**
   * @returns {{ roundNumber: number, words: Record<string, { box: number, lastRound: number, seen: number }> }}
   */
  function getStats() {
    try {
      const stored = window.localStorage.getItem(getStatsKey());
      if (!stored) {
        return { roundNumber: 0, words: {} };
      }

      const parsed = JSON.parse(stored);
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        typeof parsed.words !== 'object' ||
        parsed.words === null ||
        Array.isArray(parsed.words)
      ) {
        return { roundNumber: 0, words: {} };
      }

      return {
        roundNumber: typeof parsed.roundNumber === 'number' ? parsed.roundNumber : 0,
        words: parsed.words,
      };
    } catch (error) {
      return { roundNumber: 0, words: {} };
    }
  }

  /**
   * @param {{ roundNumber: number, words: Record<string, { box: number, lastRound: number, seen: number }> }} stats
   */
  function saveStats(stats) {
    try {
      window.localStorage.setItem(getStatsKey(), JSON.stringify(stats));
    } catch (error) {
      console.warn('FITB: could not save stats', error);
    }
  }

  /**
   * @param {{ roundNumber: number, words: Record<string, { box: number, lastRound: number, seen: number }> }} stats
   * @param {string} word
   * @returns {{ box: number, lastRound: number, seen: number }}
   */
  function getWordStats(stats, word) {
    return stats.words[word] || { box: 0, lastRound: 0, seen: 0 };
  }

  /**
   * @returns {{ words: string[], index: number } | null}
   */
  function getCurrentRound() {
    try {
      const stored = window.sessionStorage.getItem(getRoundKey());
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !Array.isArray(parsed.words) ||
        typeof parsed.index !== 'number'
      ) {
        return null;
      }

      return parsed;
    } catch (error) {
      return null;
    }
  }

  /**
   * @param {{ words: string[], index: number }} round
   */
  function saveCurrentRound(round) {
    try {
      window.sessionStorage.setItem(getRoundKey(), JSON.stringify(round));
    } catch (error) {
      console.warn('FITB: could not save current round', error);
    }
  }

  function clearCurrentRound() {
    try {
      window.sessionStorage.removeItem(getRoundKey());
    } catch (error) {
      console.warn('FITB: could not clear current round', error);
    }
  }

  const BOX_DUE_INTERVAL = {
    0: 0,
    1: 2,
    2: 4,
    3: 8,
  };

  /**
   * @param {number} box
   * @returns {number}
   */
  function getDueInterval(box) {
    return Object.prototype.hasOwnProperty.call(BOX_DUE_INTERVAL, box)
      ? BOX_DUE_INTERVAL[box]
      : Number.POSITIVE_INFINITY;
  }

  /**
   * @param {{ box: number, lastRound: number, seen: number }} wordStats
   * @param {number} roundNumber
   * @returns {boolean}
   */
  function isWordDue(wordStats, roundNumber) {
    if (wordStats.seen === 0) {
      return true;
    }

    return roundNumber - wordStats.lastRound >= getDueInterval(wordStats.box);
  }

  /**
   * @template T
   * @param {T[]} items
   * @returns {T[]}
   */
  function shuffleInPlace(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    return items;
  }

  /**
   * @param {string[]} pool
   * @param {number} count
   * @returns {string[]}
   */
  function pickRandomUnique(pool, count) {
    return shuffleInPlace([...pool]).slice(0, Math.min(count, pool.length));
  }

  /**
   * @returns {{ words: string[], index: number }}
   */
  function generateRound() {
    firstGuessCorrectCount = 0;

    const stats = getStats();
    stats.roundNumber += 1;
    const roundNumber = stats.roundNumber;

    /** @type {string[]} */
    const priority = [];
    /** @type {string[]} */
    const review = [];

    for (const word of Object.keys(wordData)) {
      const wordStats = getWordStats(stats, word);
      if (!isWordDue(wordStats, roundNumber)) {
        continue;
      }

      if (wordStats.seen === 0 || wordStats.box === 0 || wordStats.box === 1) {
        priority.push(word);
      } else if (wordStats.box === 2 || wordStats.box === 3) {
        review.push(word);
      }
    }

    const selected = pickRandomUnique(priority, 6);
    const selectedSet = new Set(selected);

    const reviewPool = review.filter((word) => !selectedSet.has(word));
    for (const word of pickRandomUnique(reviewPool, ROUND_SIZE - selected.length)) {
      selected.push(word);
      selectedSet.add(word);
    }

    if (selected.length < ROUND_SIZE) {
      const backfill = Object.keys(wordData)
        .filter((word) => !selectedSet.has(word))
        .map((word) => {
          const wordStats = getWordStats(stats, word);
          return {
            word,
            overdue:
              roundNumber - wordStats.lastRound - getDueInterval(wordStats.box),
          };
        })
        .sort((a, b) => b.overdue - a.overdue);

      for (const { word } of backfill) {
        if (selected.length >= ROUND_SIZE) {
          break;
        }
        selected.push(word);
        selectedSet.add(word);
      }
    }

    shuffleInPlace(selected);

    saveStats(stats);

    const round = { words: selected, index: 0 };
    saveCurrentRound(round);
    return round;
  }

  function getProgress() {
    const round = getCurrentRound();
    return {
      completed_in_round: round ? round.index : 0,
      round_size: ROUND_SIZE,
      round_number: getStats().roundNumber,
    };
  }

  /**
   * @param {number} [completedOverride]
   */
  function updateProgress(completedOverride) {
    const element = document.querySelector('[data-fitb-progress]');
    if (!element) {
      return;
    }

    const completed = completedOverride ?? (getCurrentRound()?.index ?? 0);

    element.setAttribute('aria-valuenow', String(completed));
    element.innerHTML = Array.from({ length: ROUND_SIZE }, (_, i) =>
      `<span class="fitb-progress-segment${i < completed ? ' fitb-progress-segment--filled' : ''}"></span>`,
    ).join('');
  }

  function getScoringFile() {
    const dir = dataFile.includes('/') ? dataFile.slice(0, dataFile.lastIndexOf('/') + 1) : '';
    return `${dir}fitb-scoring.json`;
  }

  /**
   * @param {number} score
   * @returns {{ id: string, maxCorrect: number, sound: string | null, confetti: boolean } | null}
   */
  function getScoreBand(score) {
    if (!scoringData?.bands?.length) {
      return null;
    }

    const bands = [...scoringData.bands].sort((a, b) => a.maxCorrect - b.maxCorrect);
    return bands.find((band) => score <= band.maxCorrect) || bands[bands.length - 1];
  }

  /**
   * @param {number} score
   */
  function onRoundComplete(score) {
    const band = getScoreBand(score);

    if (band?.sound === 'applause' || band?.sound === 'success') {
      playCelebrationAfterCorrect(band.sound);
    }

    if (band?.confetti) {
      launchConfetti();
    }

    showRoundActions();
    startAutoAdvance();
  }

  function clearAutoAdvance() {
    if (autoAdvanceTimeout) {
      clearTimeout(autoAdvanceTimeout);
      autoAdvanceTimeout = null;
    }

    const continueBtn = document.querySelector('.fitb-continue-btn');
    continueBtn?.classList.remove('fitb-continue-btn--filling');
  }

  function startAutoAdvance() {
    clearAutoAdvance();

    const continueBtn = document.querySelector('.fitb-continue-btn');
    if (continueBtn) {
      // Restart CSS animation by forcing a reflow after removing the class.
      void continueBtn.offsetWidth;
      continueBtn.classList.add('fitb-continue-btn--filling');
    }

    autoAdvanceTimeout = setTimeout(() => {
      autoAdvanceTimeout = null;
      loadNextRound();
    }, ROUND_AUTO_ADVANCE_MS);
  }

  function loadNextRound() {
    clearAutoAdvance();
    hideRoundActions();
    stopConfetti();
    loadRound();
  }

  function getOrCreateRoundActions() {
    const existing = document.querySelector('.fitb-round-actions');
    if (existing instanceof HTMLElement) {
      return existing;
    }

    const game = document.querySelector('.fitb-game');
    if (!game) {
      return null;
    }

    const container = document.createElement('div');
    container.className = 'fitb-round-actions hidden';
    container.innerHTML = `
      <button class="fitb-done-btn btn" type="button">I'm done for today</button>
      <button class="fitb-continue-btn btn" type="button"><span>Continue</span></button>
    `;
    game.appendChild(container);
    return container;
  }

  function wireRoundActions() {
    if (roundActionsWired) {
      return;
    }

    const container = getOrCreateRoundActions();
    if (!container) {
      return;
    }

    container.querySelector('.fitb-done-btn')?.addEventListener('click', () => {
      clearAutoAdvance();
      stopConfetti();
      window.location.href = './index.html';
    });

    container.querySelector('.fitb-continue-btn')?.addEventListener('click', () => {
      loadNextRound();
    });

    roundActionsWired = true;
  }

  function showRoundActions() {
    wireRoundActions();
    const container = getOrCreateRoundActions();
    container?.classList.remove('hidden');
  }

  function hideRoundActions() {
    const container = document.querySelector('.fitb-round-actions');
    container?.classList.add('hidden');
    document.querySelector('.fitb-continue-btn')?.classList.remove('fitb-continue-btn--filling');
  }

  function stopConfetti() {
    if (confettiAnimationId !== null) {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
    }

    confettiCanvas?.remove();
    confettiCanvas = null;
  }

  function launchConfetti() {
    stopConfetti();

    const game = document.querySelector('.fitb-game');
    if (!(game instanceof HTMLElement)) {
      return;
    }

    if (getComputedStyle(game).position === 'static') {
      game.style.position = 'relative';
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'fitb-confetti-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    game.prepend(canvas);
    confettiCanvas = canvas;

    const resize = () => {
      const rect = game.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resize();

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      stopConfetti();
      return;
    }

    const width = () => canvas.clientWidth;
    const height = () => canvas.clientHeight;
    const originX = width() / 2;
    const originY = height() * 0.72;
    const durationMs = 3000;
    const startTime = performance.now();

    /** @type {Array<{ x: number, y: number, vx: number, vy: number, size: number, color: string, rotation: number, spin: number }>} */
    const particles = Array.from({ length: 120 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = 6 + Math.random() * 10;
      return {
        x: originX + (Math.random() - 0.5) * 40,
        y: originY,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
      };
    });

    const gravity = 0.22;
    const drag = 0.992;

    const frame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const alpha = 1 - progress;

      ctx.clearRect(0, 0, width(), height());
      ctx.globalAlpha = alpha;

      for (const particle of particles) {
        particle.vx *= drag;
        particle.vy = particle.vy * drag + gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.spin;

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        ctx.restore();
      }

      ctx.globalAlpha = 1;

      if (progress < 1 && confettiCanvas === canvas) {
        confettiAnimationId = requestAnimationFrame(frame);
        return;
      }

      stopConfetti();
    };

    confettiAnimationId = requestAnimationFrame(frame);
  }

  /**
   * @param {HTMLDialogElement} modal
   * @returns {HTMLDialogElement}
   */
  function wireDefinitionsModal(modal) {
    if (modal.dataset.fitbWired === 'true') {
      return modal;
    }

    modal.querySelector('.dialog-close')?.addEventListener('click', () => {
      modal.close();
    });

    modal.dataset.fitbWired = 'true';
    return modal;
  }

  /**
   * @returns {HTMLDialogElement}
   */
  function getOrCreateDefinitionsModal() {
    if (definitionsModal) {
      return definitionsModal;
    }

    const existingModal = document.querySelector('.fitb-definitions-modal');
    if (existingModal instanceof HTMLDialogElement) {
      definitionsModal = wireDefinitionsModal(existingModal);
      return definitionsModal;
    }

    const modal = document.createElement('dialog');
    modal.className = 'app-dialog fitb-definitions-modal';
    modal.setAttribute('aria-labelledby', 'fitb-definitions-title');
    modal.innerHTML = `
      <button type="button" class="dialog-close" aria-label="Close definitions">×</button>
      <h2 class="fitb-modal-title" id="fitb-definitions-title">Definitions</h2>
      <div class="fitb-definitions-list"></div>
    `;

    document.body.appendChild(modal);
    definitionsModal = wireDefinitionsModal(modal);
    return modal;
  }

  function showDefinitionsModal() {
    const modal = getOrCreateDefinitionsModal();
    const list = modal.querySelector('.fitb-definitions-list');
    if (!list) {
      return;
    }

    list.innerHTML = currentDefinitions
      .map(({ pos, definition }) => {
        const posClass = posToClass(pos);
        return `
          <div class="fitb-definition-row">
            <span class="fitb-pos-badge ${posClass}">${escapeHtml(pos)}</span>
            <p>${escapeHtml(definition)}</p>
          </div>
        `;
      })
      .join('');

    modal.showModal();
  }

  function wireHintButtons() {
    if (hintButtonsWired) {
      return;
    }

    const buttons = document.querySelectorAll('.fitb-hint-btn');
    if (buttons.length < 2) {
      return;
    }

    buttons[0].addEventListener('click', playWordTts);
    buttons[1].addEventListener('click', showDefinitionsModal);
    hintButtonsWired = true;
  }

  /**
   * @param {string} word
   * @param {number} hiddenLetters
   * @returns {string}
   */
  function buildWordDisplay(word, hiddenLetters) {
    const count = Math.min(Math.abs(hiddenLetters), word.length);
    let html = '';

    for (let i = 0; i < word.length; i++) {
      const isHidden =
        hiddenLetters > 0
          ? i < count
          : hiddenLetters < 0
            ? i >= word.length - count
            : false;

      if (isHidden) {
        html += '<span class="fitb-blank">_</span>';
      } else {
        html += word[i];
      }
    }

    return html;
  }

  /**
   * @param {HTMLElement} wordDisplay
   * @param {string} html
   */
  function renderWordDisplay(wordDisplay, html) {
    wordDisplay.classList.remove('fitb-word-display--loading');
    wordDisplay.removeAttribute('aria-busy');
    wordDisplay.removeAttribute('aria-label');
    wordDisplay.innerHTML = html;
  }

  /**
   * @param {{ dataFile: string, options: string[] }} config
   */
  function init(config) {
    dataFile = config.dataFile;

    Promise.all([
      fetch(config.dataFile).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${config.dataFile}: ${response.status}`);
        }
        return response.json();
      }),
      fetch(getScoringFile()).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load scoring file: ${response.status}`);
        }
        return response.json();
      }),
    ])
      .then(([data, scoring]) => {
        wordData = data;
        scoringData = scoring;
        renderAnswerButtons(config.options);
        wireHintButtons();
        wireRoundActions();
        preloadFeedbackSounds();
        loadRound();
      })
      .catch((error) => {
        console.error('FITB: could not start game', error);

        const wordDisplay = document.getElementById('word-display');
        if (wordDisplay) {
          renderWordDisplay(wordDisplay, 'Could not load word');
        }
      });
  }

  return { init };
})();
