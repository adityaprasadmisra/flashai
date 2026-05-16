/**
 * script.js — FlashAI
 * Flashcard generation, navigation, flip, difficulty breakdown.
 */

/* ── State ── */
let cards         = [];
let currentIndex  = 0;
let isFlipped     = false;
let selectedCount = 10;

/* ── DOM ── */
const topicInput      = document.getElementById('topic-input');
const generateBtn     = document.getElementById('generate-btn');
const loadingOverlay  = document.getElementById('loading-overlay');
const loaderSub       = document.getElementById('loader-sub');
const flashcardSec    = document.getElementById('flashcard-section');
const flashcard       = document.getElementById('flashcard');
const questionText    = document.getElementById('question-text');
const answerText      = document.getElementById('answer-text');
const currentCardEl   = document.getElementById('current-card');
const totalCardsEl    = document.getElementById('total-cards');
const progressBar     = document.getElementById('fc-progress');
const prevBtn         = document.getElementById('prev-btn');
const nextBtn         = document.getElementById('next-btn');
const charCountEl     = document.getElementById('char-count');
const errorBanner     = document.getElementById('error-banner');
const errorTextEl     = document.getElementById('error-text');
const diffBadge       = document.getElementById('fc-diff-badge');
const countEasyEl     = document.getElementById('count-easy');
const countMidEl      = document.getElementById('count-medium');
const countHardEl     = document.getElementById('count-hard');

/* ── Difficulty split ── */
function split(total) {
  const easy = Math.round(total * 0.25);
  const hard = Math.round(total * 0.25);
  return { easy, medium: total - easy - hard, hard };
}

function updateDiffPreview(total) {
  const { easy, medium, hard } = split(total);
  countEasyEl.textContent = easy;
  countMidEl.textContent  = medium;
  countHardEl.textContent = hard;
}

/* ── Count pills ── */
document.querySelectorAll('.count-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.count-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    selectedCount = parseInt(pill.dataset.count);
    updateDiffPreview(selectedCount);
  });
});
updateDiffPreview(selectedCount);

/* ── Char counter ── */
topicInput.addEventListener('input', () => {
  const len = topicInput.value.length;
  charCountEl.textContent = `${len} / 3000`;
  charCountEl.style.color = len > 2800 ? 'rgba(255,255,255,0.7)' : '';
});

/* ── Example chips ── */
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    topicInput.value = chip.dataset.topic;
    topicInput.dispatchEvent(new Event('input'));
    topicInput.focus();
  });
});

/* ── Generate ── */
generateBtn.addEventListener('click', async () => {
  const topic = topicInput.value.trim();
  if (!topic) { showError('Please enter a topic or paste your study notes.'); return; }
  dismissError();
  setLoading(true);
  flashcardSec.classList.add('hidden');

  try {
    const res  = await fetch('/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ topic, count: selectedCount }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Generation failed.');
    cards = data.flashcards;
    if (!cards || !cards.length) throw new Error('No flashcards were returned.');
    loadCards();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

/* ── Load cards ── */
function loadCards() {
  currentIndex = 0;
  totalCardsEl.textContent = cards.length;
  renderCard(false);
  flashcardSec.classList.remove('hidden');
  flashcardSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Difficulty label ── */
function getDiff(idx, total) {
  const { easy, medium } = split(total);
  if (idx < easy) return 'easy';
  if (idx < easy + medium) return 'medium';
  return 'hard';
}

/* ── Render card ── */
function renderCard(animate = true) {
  const card = cards[currentIndex];

  if (animate) {
    flashcard.classList.add('animating');
    flashcard.addEventListener('animationend', () => flashcard.classList.remove('animating'), { once: true });
  }

  isFlipped = false;
  flashcard.classList.remove('flipped');
  questionText.textContent  = card.question;
  answerText.textContent    = card.answer;
  currentCardEl.textContent = currentIndex + 1;
  progressBar.style.width   = `${((currentIndex + 1) / cards.length) * 100}%`;

  const diff = getDiff(currentIndex, cards.length);
  const labels = { easy: 'Easy', medium: 'Medium', hard: 'Advanced' };
  diffBadge.textContent = labels[diff];
  diffBadge.className   = `fc-badge ${diff}`;

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === cards.length - 1;
}

/* ── Flip ── */
function flipCard() {
  isFlipped = !isFlipped;
  flashcard.classList.toggle('flipped', isFlipped);
}
flashcard.addEventListener('click', flipCard);

/* ── Navigation ── */
function prevCard() { if (currentIndex > 0) { currentIndex--; renderCard(); } }
function nextCard() { if (currentIndex < cards.length - 1) { currentIndex++; renderCard(); } }

document.addEventListener('keydown', e => {
  if (flashcardSec.classList.contains('hidden')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextCard();
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prevCard();
  if (e.key === ' ') { e.preventDefault(); flipCard(); }
});

/* ── Restart ── */
function restartSession() {
  flashcardSec.classList.add('hidden');
  topicInput.value = '';
  charCountEl.textContent = '0 / 3000';
  cards = [];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Helpers ── */
function setLoading(on) {
  loadingOverlay.classList.toggle('hidden', !on);
  generateBtn.disabled = on;
  generateBtn.querySelector('.btn-text').textContent = on ? 'Generating…' : 'Generate Flashcards';
  if (on && loaderSub) loaderSub.textContent = `Generating ${selectedCount} flashcards locally…`;
}
function showError(msg) {
  errorTextEl.textContent = msg;
  errorBanner.classList.remove('hidden');
}
function dismissError() {
  errorBanner.classList.add('hidden');
}

/* Spotlight follow (subtle) */
document.addEventListener('mousemove', e => {
  const s = document.getElementById('spotlight');
  if (s) { s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; }
});
