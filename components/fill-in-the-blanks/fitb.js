/**
 * Fill-in-the-Blanks (FITB) – Shared Game Logic
 *
 * See style-guide.md §13 for full documentation.
 *
 * Requires components/confetti.js to be loaded first (see §8.5) — this file
 * calls the global `Confetti.launch()` / `Confetti.stop()` rather than
 * implementing its own celebration effect.
 *
 * Responsibilities:
 * - Load a JSON data file
 * - Generate 10-word spaced-repetition rounds
 * - Persist per-word stats (localStorage) and the current round (sessionStorage)
 * - Render blanks in the word display
 * - Render hint buttons (TTS, definitions)
 * - Play sounds (TTS, correct, incorrect) — correct.ogg is the sole feedback
 *   for a correct answer; there is no on-screen congratulatory message
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
  const ROUND_ADVANCE_MS = 1500;
  const ROUND_AUTO_ADVANCE_MS = 8000;
  const ROUND_SIZE = 10;
  const CONTROLS_ANIM_MS = 450;

  const state = {
    data: {
      /** @type {string} */
      dataFile: '',
      /** @type {Record<string, { 'hidden-letters': number, definitions: Array<{ pos: string, definition: string }> }> | null} */
      wordData: null,
      /** @type {{ bands: Array<{ id: string, maxCorrect: number, sound: string | null, confetti: boolean }> } | null} */
      scoringData: null,
    },
    session: {
      /** @type {boolean} */
      roundActive: false,
      /** @type {{ word: string, definitions: Array<{ pos: string, definition: string }>, hiddenLetters: number }} */
      currentPrompt: {
        word: '',
        definitions: [],
        hiddenLetters: 0,
      },
      /** @type {{ hadMistakeThisWord: boolean, firstGuessCorrectCount: number, results: Array<'perfect' | 'helped' | null> }} */
      roundSummary: {
        hadMistakeThisWord: false,
        firstGuessCorrectCount: 0,
        results: [],
      },
    },
    ui: {
      /** @type {boolean} */
      hintButtonsWired: false,
      /** @type {boolean} */
      answerButtonsWired: false,
      /** @type {boolean} */
      roundActionsWired: false,
      /** @type {ReturnType<typeof setTimeout> | null} */
      advanceTimeout: null,
      /** @type {ReturnType<typeof setTimeout> | null} */
      autoAdvanceTimeout: null,
      /** @type {HTMLDialogElement | null} */
      definitionsModal: null,
      /** @type {HTMLAudioElement | null} */
      currentTtsAudio: null,
    },
  };

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
    const dir = state.data.dataFile.includes('/')
      ? state.data.dataFile.slice(0, state.data.dataFile.lastIndexOf('/') + 1)
      : '';
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

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * @param {HTMLElement} element
   * @param {string} animationClass
   * @returns {Promise<void>}
   */
  function playControlsAnimation(element, animationClass) {
    return new Promise((resolve) => {
      if (prefersReducedMotion()) {
        element.classList.remove(animationClass);
        resolve();
        return;
      }

      let settled = false;
      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        element.classList.remove(animationClass);
        resolve();
      };

      element.classList.remove(animationClass);
      void element.offsetWidth;
      element.classList.add(animationClass);
      element.addEventListener('animationend', finish, { once: true });
      window.setTimeout(finish, CONTROLS_ANIM_MS + 50);
    });
  }

  /**
   * Reveal answer buttons with a grow-in (or instantly if reduced motion /
   * already visible). Used when a round starts — not between words.
   * @returns {Promise<void>}
   */
  function showAnswerButtons() {
    const container = document.querySelector('.fitb-answer-buttons');
    if (!(container instanceof HTMLElement)) {
      return Promise.resolve();
    }

    if (!container.classList.contains('hidden')) {
      return Promise.resolve();
    }

    container.classList.remove('hidden', 'fitb-answer-buttons--exit');
    return playControlsAnimation(container, 'fitb-answer-buttons--enter');
  }

  /**
   * Shrink answer buttons away, then hide them so round actions can sit in
   * the same slot.
   * @returns {Promise<void>}
   */
  function hideAnswerButtons() {
    const container = document.querySelector('.fitb-answer-buttons');
    if (!(container instanceof HTMLElement) || container.classList.contains('hidden')) {
      return Promise.resolve();
    }

    container.classList.remove('fitb-answer-buttons--enter');

    if (prefersReducedMotion()) {
      container.classList.add('hidden');
      container.classList.remove('fitb-answer-buttons--exit');
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        // Hide while the exit keyframe's final scale is still applied so the
        // buttons don't snap back to full size for a frame.
        container.classList.add('hidden');
        container.classList.remove('fitb-answer-buttons--exit');
        resolve();
      };

      void container.offsetWidth;
      container.classList.add('fitb-answer-buttons--exit');
      container.addEventListener('animationend', finish, { once: true });
      window.setTimeout(finish, CONTROLS_ANIM_MS + 50);
    });
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
    if (!state.session.roundActive) {
      return;
    }

    const { word, hiddenLetters } = state.session.currentPrompt;
    const { roundSummary } = state.session;
    const chosen = button.textContent || '';
    const correctAnswer = getHiddenSubstring(word, hiddenLetters);

    if (chosen !== correctAnswer) {
      button.disabled = true;
      button.classList.add('fitb-answer-btn--disabled');
      playFeedbackSound('incorrect');
      playIncorrectWordAnimation();
      roundSummary.hadMistakeThisWord = true;
      return;
    }

    state.session.roundActive = false;

    if (!roundSummary.hadMistakeThisWord) {
      roundSummary.firstGuessCorrectCount += 1;
    }

    playFeedbackSound('correct');
    lockAnswerButtonsAfterCorrect(button);

    const stats = getStats();
    const wordStats = getWordStats(stats, word);
    if (roundSummary.hadMistakeThisWord) {
      wordStats.box = Math.max(0, wordStats.box - 1);
    } else {
      wordStats.box = Math.min(3, wordStats.box + 1);
    }
    wordStats.lastRound = stats.roundNumber;
    wordStats.seen += 1;
    stats.words[word] = wordStats;
    saveStats(stats);

    const round = getCurrentRound();
    let roundComplete = false;
    if (round) {
      const slot = round.index;
      roundSummary.results[slot] = roundSummary.hadMistakeThisWord ? 'helped' : 'perfect';
      round.index += 1;
      if (round.index < ROUND_SIZE) {
        saveCurrentRound(round);
      } else if (round.index === ROUND_SIZE) {
        clearCurrentRound();
        roundComplete = true;
      }
      updateProgress(round.index, true);
    } else {
      updateProgress();
    }

    const wordDisplay = document.getElementById('word-display');
    if (wordDisplay) {
      renderWordDisplay(wordDisplay, buildWordDisplay(word, 0));
    }

    if (state.ui.advanceTimeout) {
      clearTimeout(state.ui.advanceTimeout);
    }

    if (roundComplete) {
      const capturedScore = roundSummary.firstGuessCorrectCount;
      state.ui.advanceTimeout = setTimeout(() => {
        state.ui.advanceTimeout = null;
        onRoundComplete(capturedScore);
      }, ROUND_ADVANCE_MS);
      return;
    }

    state.ui.advanceTimeout = setTimeout(() => {
      state.ui.advanceTimeout = null;
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

    if (state.ui.answerButtonsWired) {
      return;
    }

    container.addEventListener('click', (event) => {
      const button = event.target.closest('.fitb-answer-btn');
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      handleAnswerClick(button);
    });

    state.ui.answerButtonsWired = true;
  }

  function loadRound() {
    if (!state.data.wordData) {
      return;
    }

    state.session.roundSummary.hadMistakeThisWord = false;

    let round = getCurrentRound();
    if (round === null) {
      round = generateRound();
    }

    const word = round.words[round.index];
    const entry = state.data.wordData[word];
    state.session.currentPrompt = {
      word,
      definitions: entry.definitions,
      hiddenLetters: entry['hidden-letters'],
    };

    const wordDisplay = document.getElementById('word-display');
    if (wordDisplay) {
      renderWordDisplay(
        wordDisplay,
        buildWordDisplay(word, state.session.currentPrompt.hiddenLetters),
      );
    }

    resetAnswerButtons();
    updateProgress();
    state.session.roundActive = true;
    preloadWordTts();

    // Grow in only when coming from a hidden state (page load / next round),
    // not when advancing to the next word within the same round.
    showAnswerButtons();
  }

  function preloadFeedbackSounds() {
    getFeedbackSound('correct');
    getFeedbackSound('incorrect');
    getFeedbackSound('applause');
    getFeedbackSound('success');
  }

  function preloadWordTts() {
    const { word } = state.session.currentPrompt;
    const url = getTtsUrl(state.data.dataFile, word);
    if (state.ui.currentTtsAudio?.src.endsWith(`${word}.mp3`)) {
      return;
    }

    state.ui.currentTtsAudio = new Audio(url);
    state.ui.currentTtsAudio.preload = 'auto';
  }

  function playWordTts() {
    if (!state.ui.currentTtsAudio) {
      preloadWordTts();
    }

    const audio = state.ui.currentTtsAudio;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error('FITB: could not play TTS', error);
    });
  }

  function getStatsKey() {
    return `fitb-stats:${getSlugFromDataFile(state.data.dataFile)}`;
  }

  function getRoundKey() {
    return `fitb-round:${getSlugFromDataFile(state.data.dataFile)}`;
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
    state.session.roundSummary.firstGuessCorrectCount = 0;
    state.session.roundSummary.results = new Array(ROUND_SIZE).fill(null);

    const stats = getStats();
    stats.roundNumber += 1;
    const roundNumber = stats.roundNumber;

    /** @type {string[]} */
    const priority = [];
    /** @type {string[]} */
    const review = [];

    for (const word of Object.keys(state.data.wordData)) {
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
      const backfill = Object.keys(state.data.wordData)
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
   * @param {boolean} [animate=false]
   */
  function updateProgress(completedOverride, animate = false) {
    const element = document.querySelector('[data-fitb-progress]');
    if (!element) {
      return;
    }

    const completed = completedOverride ?? (getCurrentRound()?.index ?? 0);
    const { results } = state.session.roundSummary;

    element.setAttribute('aria-valuenow', String(completed));
    element.innerHTML = Array.from({ length: ROUND_SIZE }, (_, i) => {
      if (i >= completed) {
        return '<span class="fitb-progress-segment"></span>';
      }

      const isPerfect = results[i] === 'perfect';
      const isNew = animate && i === completed - 1;
      const cls = [
        'fitb-progress-segment',
        isPerfect ? 'fitb-progress-segment--perfect' : 'fitb-progress-segment--filled',
        isNew ? 'fitb-progress-segment--new' : '',
      ].filter(Boolean).join(' ');

      return `<span class="${cls}"></span>`;
    }).join('');
  }

  function getScoringFile() {
    const dir = state.data.dataFile.includes('/')
      ? state.data.dataFile.slice(0, state.data.dataFile.lastIndexOf('/') + 1)
      : '';
    return `${dir}fitb-scoring.json`;
  }

  /**
   * @param {number} score
   * @returns {{ id: string, maxCorrect: number, sound: string | null, confetti: boolean } | null}
   */
  function getScoreBand(score) {
    if (!state.data.scoringData?.bands?.length) {
      return null;
    }

    const bands = [...state.data.scoringData.bands].sort(
      (a, b) => a.maxCorrect - b.maxCorrect,
    );
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

    hideAnswerButtons().then(() => {
      showRoundActions();
      startAutoAdvance();
    });
  }

  function clearAutoAdvance() {
    if (state.ui.autoAdvanceTimeout) {
      clearTimeout(state.ui.autoAdvanceTimeout);
      state.ui.autoAdvanceTimeout = null;
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

    state.ui.autoAdvanceTimeout = setTimeout(() => {
      state.ui.autoAdvanceTimeout = null;
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
      <button class="fitb-break-btn btn" type="button">Take a break</button>
      <button class="fitb-continue-btn btn" type="button"><span>Continue</span></button>
    `;
    game.appendChild(container);
    return container;
  }

  function wireRoundActions() {
    if (state.ui.roundActionsWired) {
      return;
    }

    const container = getOrCreateRoundActions();
    if (!container) {
      return;
    }

    container.querySelector('.fitb-break-btn')?.addEventListener('click', () => {
      clearAutoAdvance();
      stopConfetti();
      window.location.href = './index.html';
    });

    container.querySelector('.fitb-continue-btn')?.addEventListener('click', () => {
      loadNextRound();
    });

    state.ui.roundActionsWired = true;
  }

  function showRoundActions() {
    wireRoundActions();
    const container = getOrCreateRoundActions();
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.classList.remove('hidden');
    playControlsAnimation(container, 'fitb-round-actions--enter');
  }

  function hideRoundActions() {
    const container = document.querySelector('.fitb-round-actions');
    container?.classList.add('hidden');
    container?.classList.remove('fitb-round-actions--enter');
    document.querySelector('.fitb-continue-btn')?.classList.remove('fitb-continue-btn--filling');
  }

  /**
   * Fires the shared confetti celebration (see components/confetti.js,
   * documented in style-guide.md §8.5) inside the game wrapper.
   */
  function launchConfetti() {
    const game = document.querySelector('.fitb-game');
    if (game) {
      Confetti.launch(game);
    }
  }

  function stopConfetti() {
    Confetti.stop();
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
    if (state.ui.definitionsModal) {
      return state.ui.definitionsModal;
    }

    const existingModal = document.querySelector('.fitb-definitions-modal');
    if (existingModal instanceof HTMLDialogElement) {
      state.ui.definitionsModal = wireDefinitionsModal(existingModal);
      return state.ui.definitionsModal;
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
    state.ui.definitionsModal = wireDefinitionsModal(modal);
    return modal;
  }

  function showDefinitionsModal() {
    const modal = getOrCreateDefinitionsModal();
    const list = modal.querySelector('.fitb-definitions-list');
    if (!list) {
      return;
    }

    list.innerHTML = state.session.currentPrompt.definitions
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
    if (state.ui.hintButtonsWired) {
      return;
    }

    const buttons = document.querySelectorAll('.fitb-hint-btn');
    if (buttons.length < 2) {
      return;
    }

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const TAPPED_DURATION_MS = 500;
    /** @type {ReturnType<typeof setTimeout> | null} */
    let tappedTimeout = null;

    /**
     * Adds the tapped class to trigger the full animation on touch devices.
     * @param {HTMLElement} button
     */
    function handleTapAnimation(button) {
      if (!isTouchDevice) return;

      // Clear any existing timeout to handle rapid taps
      if (tappedTimeout) {
        clearTimeout(tappedTimeout);
      }

      // Add the tapped class to start the animation
      button.classList.add('fitb-hint-btn--tapped');

      // Remove the class after the animation duration
      tappedTimeout = setTimeout(() => {
        button.classList.remove('fitb-hint-btn--tapped');
        tappedTimeout = null;
      }, TAPPED_DURATION_MS);
    }

    buttons[0].addEventListener('click', (e) => {
      handleTapAnimation(buttons[0]);
      playWordTts(e);
    });

    buttons[1].addEventListener('click', (e) => {
      handleTapAnimation(buttons[1]);
      showDefinitionsModal(e);
    });

    state.ui.hintButtonsWired = true;
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
    state.data.dataFile = config.dataFile;

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
        state.data.wordData = data;
        state.data.scoringData = scoring;
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
