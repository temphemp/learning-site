document.addEventListener('DOMContentLoaded', () => {
  const wordList = document.querySelector('.word-list');
  const revealButton = document.querySelector('#reveal-answers');
  const tallyButton = document.querySelector('#tally-score');
  const scoreDialog = document.querySelector('#score-dialog');
  const closeScoreDialogButton = document.querySelector('#close-score-dialog');
  const scoreDialogDoneButton = document.querySelector('#score-dialog-done');
  const scoreCorrectCount = document.querySelector('#score-correct-count');
  const scoreTitle = document.querySelector('#score-title');
  const scoreMessage = document.querySelector('#score-message');
  const supportsSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let answersRevealed = false;

  // Reset the control explicitly in case the browser restores form state on reload.
  tallyButton.disabled = true;
  const soundPaths = {
    correct: 'static/sounds/correct.ogg',
    incorrect: 'static/sounds/incorrect.ogg',
    applause: 'static/sounds/applause.ogg',
    success: 'static/sounds/success.ogg',
  };
  const sounds = {};

  const getSound = (soundName) => {
    if (!sounds[soundName]) {
      const audio = new Audio(soundPaths[soundName]);
      audio.preload = 'auto';
      audio.load();
      sounds[soundName] = audio;
    }
    return sounds[soundName];
  };

  const preloadSounds = (...names) => {
    names.forEach((name) => getSound(name));
  };
  const scoringConfig = fetch('data-files/scoring.json')
    .then((response) => {
      if (!response.ok) throw new Error('Could not load scoring config.');
      return response.json();
    });

  let bands = [];

  scoringConfig.then((config) => {
    bands = config.bands;
  });

  const playSound = (soundName) => {
    const sound = getSound(soundName);
    if (!sound) return;

    const play = () => {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // The sound files may not be present yet, or the browser may block playback.
      });
    };

    if (sound.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      play();
    } else {
      sound.addEventListener('canplaythrough', play, { once: true });
    }
  };

  const getScoreBand = (scorePercent) => {
    for (const band of bands) {
      if (scorePercent < band.max) return band;
    }
    return bands[bands.length - 1];
  };

  const showScore = (correctAnswers, totalAnswers) => {
    const scorePercent = (correctAnswers / totalAnswers) * 100;
    const band = getScoreBand(scorePercent);

    scoreCorrectCount.textContent = correctAnswers;
    scoreTitle.textContent = band.title;
    scoreMessage.textContent = 'Good job! You did it!';

    if (Array.isArray(band.messages) && band.messages.length) {
      scoreMessage.textContent = band.messages[Math.floor(Math.random() * band.messages.length)];
    }

    if (band.sound) playSound(band.sound);

    Confetti.stop();
    scoreDialog.showModal();
    if (band.id === 'best') Confetti.launch(scoreDialog);
  };

  const createAnswerActions = (word) => {
    const actions = document.createElement('div');
    actions.className = 'answer-actions';
    actions.setAttribute('role', 'group');
    actions.setAttribute('aria-label', `Did you spell ${word} correctly?`);

    const choices = [
      { result: 'correct', symbol: '✓', label: `I spelled ${word} correctly` },
      { result: 'incorrect', symbol: '✕', label: `I did not spell ${word} correctly` },
    ];

    choices.forEach(({ result, symbol, label }) => {
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.className = `answer-choice answer-choice--${result}`;
      choice.textContent = symbol;
      choice.setAttribute('aria-label', label);
      choice.setAttribute('aria-pressed', 'false');
      choice.addEventListener('click', () => {
        if (actions.dataset.result) return;

        actions.dataset.result = result;
        choice.classList.add('is-selected');
        choice.setAttribute('aria-pressed', 'true');
        actions.querySelectorAll('.answer-choice').forEach((option) => {
          if (option !== choice) option.disabled = true;
        });
        actions.closest('.word-item').classList.remove('needs-marking');
        actions.closest('.word-item').removeAttribute('tabindex');
        playSound(result);
      });
      actions.append(choice);
    });

    return actions;
  };

  document.querySelectorAll('.speak-button').forEach((button) => {
    button.addEventListener('click', () => {
      if (!supportsSpeech) return;

      const activeButton = document.querySelector('.speak-button.is-speaking');
      activeButton?.classList.remove('is-speaking');
      window.speechSynthesis.cancel();

      const word = button.closest('.word-item').dataset.word;
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.75;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.voiceURI === 'Google UK English Female' || v.name === 'Google UK English Female');
      utterance.voice = preferred || voices.find(v => v.lang.startsWith('en-GB')) || null;
      utterance.onend = utterance.onerror = () => button.classList.remove('is-speaking');

      button.classList.add('is-speaking');
      window.speechSynthesis.speak(utterance);
    });
  });

  revealButton.addEventListener('click', () => {
    if (answersRevealed) return;

    window.speechSynthesis?.cancel();
    document.querySelectorAll('.word-item').forEach((item) => {
      const word = item.querySelector('.word-answer');
      word.hidden = false;
      item.classList.add('is-revealed');
      item.append(createAnswerActions(word.textContent));
    });

    revealButton.textContent = 'Answers Revealed!';
    revealButton.disabled = true;
    answersRevealed = true;
    tallyButton.disabled = false;
    preloadSounds('correct', 'incorrect', 'applause', 'success');
    wordList.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  });

  tallyButton.addEventListener('click', () => {
    if (!answersRevealed) {
      tallyButton.disabled = true;
      return;
    }

    const wordItems = [...document.querySelectorAll('.word-item')];
    wordItems.forEach((item) => item.classList.remove('needs-marking'));

    const itemsWithActions = wordItems.map((item) => ({
      item,
      actions: item.querySelector('.answer-actions'),
    }));

    const unmarkedItems = itemsWithActions
      .filter(({ actions }) => !actions?.dataset.result)
      .map(({ item }) => item);
    if (unmarkedItems.length) {
      unmarkedItems.forEach((item) => {
        item.classList.add('needs-marking');
        item.tabIndex = -1;
      });

      const firstUnmarkedItem = unmarkedItems[0];
      firstUnmarkedItem.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      });
      firstUnmarkedItem.focus({ preventScroll: true });
      return;
    }

    const correctAnswers = itemsWithActions.filter(({ actions }) => actions?.dataset.result === 'correct').length;
    showScore(correctAnswers, wordItems.length);
  });

  [closeScoreDialogButton, scoreDialogDoneButton].forEach((button) => {
    button.addEventListener('click', () => {
      Confetti.stop();
      scoreDialog.close();
    });
  });
});
