const TOTAL_TILES = 50;
const SMILEY = '😊';
const ANGRY = '😠';
const MIN_INTERVAL = 250;

let currentTile = 0;
let score = 0;
let correctTiles = 0;
let wrongTiles = 0;
let previousEmoji = null;
let currentEmoji = null;
let tileAnswered = false;
let gameActive = false;
let sequence = [];
let tileTimer = null;

const elements = {
  start: document.querySelector('#start-screen'),
  game: document.querySelector('#game-screen'),
  result: document.querySelector('#result-screen'),
  startButton: document.querySelector('#start-button'),
  againButton: document.querySelector('#again-button'),
  tile: document.querySelector('#emoji-tile'),
  tileCount: document.querySelector('#tile-count'),
  score: document.querySelector('#score'),
  correct: document.querySelector('#correct'),
  wrong: document.querySelector('#wrong'),
  timer: document.querySelector('#timer'),
  speedLabel: document.querySelector('#speed-label'),
  progressBar: document.querySelector('#progress-bar'),
  feedback: document.querySelector('#feedback'),
  hint: document.querySelector('#hint'),
  finalScore: document.querySelector('#final-score'),
  finalCorrect: document.querySelector('#final-correct'),
  finalWrong: document.querySelector('#final-wrong'),
  finalAccuracy: document.querySelector('#final-accuracy')
};

function generateSequence() {
  const generated = Array.from({ length: TOTAL_TILES }, () => Math.random() < 0.5 ? SMILEY : ANGRY);
  // Guarantee both target and non-target angry patterns in every round.
  generated[0] = ANGRY;
  generated[1] = ANGRY;
  generated[2] = SMILEY;
  generated[3] = ANGRY;
  return generated;
}

function getTileInterval(tileIndex) {
  return Math.max(MIN_INTERVAL, 2000 - Math.floor(tileIndex / 10) * 250);
}

function getSpeedLabel(interval) {
  if (interval >= 2000) return 'Starting pace';
  if (interval >= 1500) return 'Warming up';
  if (interval >= 1000) return 'Quickening';
  if (interval >= 500) return 'Fast pace';
  return 'Final sprint';
}

function updateUI(interval = getTileInterval(currentTile)) {
  elements.tileCount.textContent = `Tile ${currentTile} / ${TOTAL_TILES}`;
  elements.score.textContent = score;
  elements.correct.textContent = correctTiles;
  elements.wrong.textContent = wrongTiles;
  elements.timer.textContent = `${(interval / 1000).toFixed(2)}s`;
  elements.speedLabel.textContent = getSpeedLabel(interval);
  elements.progressBar.style.width = `${(currentTile / TOTAL_TILES) * 100}%`;
}

function startGame() {
  clearTimeout(tileTimer);
  currentTile = 0; score = 0; correctTiles = 0; wrongTiles = 0;
  previousEmoji = null; currentEmoji = null; tileAnswered = false; gameActive = true;
  sequence = generateSequence();
  elements.start.hidden = true;
  elements.result.hidden = true;
  elements.game.hidden = false;
  elements.tile.disabled = false;
  updateUI();
  showNextTile();
}

function showNextTile() {
  if (!gameActive) return;
  if (currentTile >= TOTAL_TILES) { endGame(); return; }

  currentTile += 1;
  previousEmoji = currentEmoji;
  currentEmoji = sequence[currentTile - 1];
  tileAnswered = false;
  const interval = getTileInterval(currentTile - 1);
  elements.tile.textContent = currentEmoji;
  elements.tile.setAttribute('aria-label', `Current emoji: ${currentEmoji}`);
  elements.tile.classList.remove('correct', 'wrong', 'enter');
  void elements.tile.offsetWidth;
  elements.tile.classList.add('enter');
  elements.hint.textContent = currentEmoji === ANGRY ? 'Tap if the pattern is right' : 'Watch the sequence';
  updateUI(interval);
  tileTimer = setTimeout(showNextTile, interval);
}

function handleTileClick() {
  if (tileAnswered || !gameActive) return;
  tileAnswered = true;

  const isTarget = previousEmoji === SMILEY && currentEmoji === ANGRY;
  if (isTarget) {
    score += 2;
    correctTiles += 1;
    showFeedback('✓ Correct +2', true);
    elements.tile.classList.add('correct');
  } else {
    score -= 1;
    wrongTiles += 1;
    showFeedback('✕ Wrong -1', false);
    elements.tile.classList.add('wrong');
  }
  updateUI(getTileInterval(currentTile - 1));
}

function showFeedback(message, isGood) {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${isGood ? 'good' : 'bad'} show`;
  void elements.feedback.offsetWidth;
}

function endGame() {
  gameActive = false;
  clearTimeout(tileTimer);
  elements.tile.disabled = true;
  elements.game.hidden = true;
  elements.result.hidden = false;
  const attempts = correctTiles + wrongTiles;
  const accuracy = attempts ? (correctTiles / attempts) * 100 : 0;
  elements.finalCorrect.textContent = correctTiles;
  elements.finalWrong.textContent = wrongTiles;
  elements.finalScore.textContent = score;
  elements.finalAccuracy.textContent = `${accuracy.toFixed(1)}%`;
}

elements.startButton.addEventListener('click', startGame);
elements.againButton.addEventListener('click', startGame);
elements.tile.addEventListener('click', handleTileClick);
document.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && !gameActive && !elements.result.hidden) {
    event.preventDefault();
    startGame();
  } else if ((event.key === 'Enter' || event.key === ' ') && !gameActive && !elements.start.hidden) {
    event.preventDefault();
    startGame();
  }
});