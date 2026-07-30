/**
 * Fill-in-the-Blanks (FITB) – Shared Game Logic
 *
 * See style-guide.md §13 for full documentation.
 *
 * Responsibilities:
 * - Load a JSON data file
 * - Pick a random word
 * - Render blanks in the word display
 * - Render hint buttons (TTS, definitions)
 * - Play sounds (TTS, correct, incorrect)
 * - Show the definitions modal
 * - Render answer buttons from a fixed options list
 * - Check answers and run the game loop
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

  /** @type {boolean} */
  let roundActive = false;

  /** @type {boolean} */
  let hintButtonsWired = false;

  /** @type {boolean} */
  let answerButtonsWired = false;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let advanceTimeout = null;

  /** @type {HTMLDialogElement | null} */
  let definitionsModal = null;

  /** @type {HTMLAudioElement | null} */
  let currentTtsAudio = null;

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
   * @param {'correct' | 'incorrect'} name
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
   * @param {'correct' | 'incorrect'} name
   */
  function playFeedbackSound(name) {
    const audio = getFeedbackSound(name);
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error(`FITB: could not play ${name} sound`, error);
    });
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
      return;
    }

    roundActive = false;
    playFeedbackSound('correct');
    lockAnswerButtonsAfterCorrect(button);

    const wordDisplay = document.getElementById('word-display');
    if (wordDisplay) {
      renderWordDisplay(wordDisplay, buildWordDisplay(currentWord, 0));
    }

    showCorrectMessage();

    if (advanceTimeout) {
      clearTimeout(advanceTimeout);
    }

    advanceTimeout = setTimeout(() => {
      advanceTimeout = null;
      loadRound(currentWord);
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

  /**
   * @param {string} [excludeWord]
   */
  function loadRound(excludeWord) {
    if (!wordData) {
      return;
    }

    const words = Object.keys(wordData);
    let word = words[Math.floor(Math.random() * words.length)];

    if (excludeWord && words.length > 1) {
      let attempts = 0;
      while (word === excludeWord && attempts < 10) {
        word = words[Math.floor(Math.random() * words.length)];
        attempts += 1;
      }
    }

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
    roundActive = true;
    preloadWordTts();
  }

  function preloadFeedbackSounds() {
    getFeedbackSound('correct');
    getFeedbackSound('incorrect');
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

    fetch(config.dataFile)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${config.dataFile}: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        wordData = data;
        renderAnswerButtons(config.options);
        wireHintButtons();
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
