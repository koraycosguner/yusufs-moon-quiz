// ===== Moon Phases Data =====
const MOON_PHASES = [
    { name: 'New Moon',         emoji: '🌑', order: 0 },
    { name: 'Waxing Crescent',  emoji: '🌒', order: 1 },
    { name: 'First Quarter',    emoji: '🌓', order: 2 },
    { name: 'Waxing Gibbous',   emoji: '🌔', order: 3 },
    { name: 'Full Moon',        emoji: '🌕', order: 4 },
    { name: 'Waning Gibbous',   emoji: '🌖', order: 5 },
    { name: 'Third Quarter',    emoji: '🌗', order: 6 },
    { name: 'Waning Crescent',  emoji: '🌘', order: 7 },
];

const ENCOURAGEMENTS = [
    "You're a moon expert! 🌙",
    "Stellar work! ⭐",
    "Out of this world! 🚀",
    "Amazing astronaut! 👨‍🚀",
    "Super space scientist! 🔭",
    "You're shining bright! ✨",
    "Moon master! 🌝",
    "Cosmic genius! 🌌",
    "Astronomical! 💫",
    "Keep reaching for the stars! 🌟",
];

const WRONG_ENCOURAGEMENTS = [
    "Almost! Try again next time! 💪",
    "Good try! Keep learning! 📚",
    "The moon is tricky! You'll get it! 🌙",
    "Don't give up, astronaut! 🚀",
];

// ===== Diamonds =====
const DIAMONDS_PER_CORRECT = 1;
const DIAMONDS_STORAGE_KEY = 'yusufs-moon-diamonds';

function loadDiamonds() {
    try {
        const data = JSON.parse(localStorage.getItem(DIAMONDS_STORAGE_KEY));
        return data ? data.diamonds : 0;
    } catch (e) {
        return 0;
    }
}

function saveDiamonds(amount) {
    localStorage.setItem(DIAMONDS_STORAGE_KEY, JSON.stringify({ diamonds: amount }));
}

function resetDiamonds() {
    if (confirm("Reset Yusuf's Diamonds to 0?")) {
        saveDiamonds(0);
        updateDiamondsDisplay();
        alert('Diamonds reset to 0!');
    }
}

function updateDiamondsDisplay() {
    const diamonds = loadDiamonds();
    // Update all diamond displays
    const els = ['diamonds-total', 'diamonds-game', 'spell-diamonds-game', 'order-diamonds-game'];
    els.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = diamonds;
    });
}

// Initialize diamonds on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDiamondsDisplay();
});

// ===== Screen Management =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    target.classList.add('active');
    if (screenId === 'results-screen') {
        target.style.display = 'flex';
        target.style.justifyContent = 'center';
        target.style.alignItems = 'center';
    }
}

// ===== Mode Selection =====
let selectedMode = 'identify';

function setMode(mode, btn) {
    selectedMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    playSound('click');
}

function startSelected() {
    playSound('click');
    if (selectedMode === 'identify') {
        startIdentifyQuiz();
    } else if (selectedMode === 'spell') {
        startSpellQuiz();
    } else if (selectedMode === 'position') {
        startPositionQuiz();
    } else {
        startOrderQuiz();
    }
}

// ===== Sounds =====
function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
            case 'correct':
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
                break;
            case 'wrong':
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
                break;
            case 'click':
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.1);
                break;
            case 'complete':
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
                osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.7);
                break;
        }
    } catch (e) {
        // Ignore audio errors
    }
}

// ===== IDENTIFY QUIZ MODE =====
const quizState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    totalQuestions: 20,
    sessionDiamonds: 0,
    waiting: false,
};

function startIdentifyQuiz() {
    quizState.questions = generateIdentifyQuestions(quizState.totalQuestions);
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizState.streak = 0;
    quizState.bestStreak = 0;
    quizState.correctAnswers = 0;
    quizState.sessionDiamonds = 0;
    quizState.waiting = false;

    document.getElementById('score').textContent = '0';
    document.getElementById('streak-text').textContent = '🔥 0';
    updateDiamondsDisplay();
    updateProgress();

    showScreen('quiz-screen');
    showQuestion();
}

function generateIdentifyQuestions(count) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        const correctPhase = MOON_PHASES[Math.floor(Math.random() * MOON_PHASES.length)];

        // Generate 3 wrong choices
        const wrongChoices = MOON_PHASES
            .filter(p => p.name !== correctPhase.name)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        // All 4 choices, shuffled
        const choices = [...wrongChoices, correctPhase].sort(() => Math.random() - 0.5);

        questions.push({
            phase: correctPhase,
            choices: choices,
        });
    }
    return questions;
}

function showQuestion() {
    if (quizState.currentIndex >= quizState.totalQuestions) {
        showResults('identify');
        return;
    }

    const q = quizState.questions[quizState.currentIndex];
    document.getElementById('moon-visual').textContent = q.phase.emoji;

    const choicesArea = document.getElementById('choices-area');
    choicesArea.innerHTML = '';

    q.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.name;
        btn.onclick = () => handleChoice(btn, choice, q.phase);
        choicesArea.appendChild(btn);
    });

    const feedback = document.getElementById('feedback-message');
    feedback.classList.add('hidden');
    feedback.className = 'feedback-message hidden';

    updateProgress();
}

function handleChoice(btn, chosen, correct) {
    if (quizState.waiting) return;
    quizState.waiting = true;

    const allBtns = document.querySelectorAll('.choice-btn');

    if (chosen.name === correct.name) {
        // Correct!
        btn.classList.add('correct');
        playSound('correct');

        quizState.score += 10;
        quizState.streak++;
        quizState.correctAnswers++;
        if (quizState.streak > quizState.bestStreak) quizState.bestStreak = quizState.streak;

        document.getElementById('score').textContent = quizState.score;
        document.getElementById('streak-text').textContent = '🔥 ' + quizState.streak;

        // Diamond reward
        const currentDiamonds = loadDiamonds();
        const newDiamonds = currentDiamonds + DIAMONDS_PER_CORRECT;
        saveDiamonds(newDiamonds);
        quizState.sessionDiamonds += DIAMONDS_PER_CORRECT;
        updateDiamondsDisplay();

        showFeedbackMessage(true, correct.name);
        showBriefOverlay('🎉 ' + randomFrom(ENCOURAGEMENTS));

    } else {
        // Wrong
        btn.classList.add('wrong');
        playSound('wrong');

        quizState.streak = 0;
        document.getElementById('streak-text').textContent = '🔥 0';

        // Highlight correct answer
        allBtns.forEach(b => {
            if (b.textContent === correct.name) {
                b.classList.add('revealed');
            }
        });

        showFeedbackMessage(false, correct.name);
        showBriefOverlay(randomFrom(WRONG_ENCOURAGEMENTS));
    }

    // Disable all buttons
    allBtns.forEach(b => b.style.pointerEvents = 'none');

    setTimeout(() => {
        quizState.currentIndex++;
        quizState.waiting = false;
        showQuestion();
    }, 2000);
}

function showFeedbackMessage(isCorrect, correctName) {
    const feedback = document.getElementById('feedback-message');
    feedback.classList.remove('hidden', 'correct-msg', 'wrong-msg');

    if (isCorrect) {
        feedback.classList.add('correct-msg');
        feedback.textContent = `✅ Correct! That's the ${correctName}!`;
    } else {
        feedback.classList.add('wrong-msg');
        feedback.textContent = `The correct answer was: ${correctName}`;
    }
}

function showBriefOverlay(text) {
    const overlay = document.getElementById('feedback-overlay');
    const content = document.getElementById('feedback-content');
    content.textContent = text;
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('hidden'), 1200);
}

function updateProgress() {
    const pct = (quizState.currentIndex / quizState.totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').textContent =
        quizState.currentIndex + ' / ' + quizState.totalQuestions;
}

// ===== SPELL QUIZ MODE =====
const spellState = {
    phases: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    totalQuestions: 20,
    sessionDiamonds: 0,
    attempts: 0,
    waiting: false,
};

function startSpellQuiz() {
    // Repeat phases to fill 20 questions, shuffled
    const pool = [];
    while (pool.length < spellState.totalQuestions) {
        pool.push(...[...MOON_PHASES].sort(() => Math.random() - 0.5));
    }
    spellState.phases = pool.slice(0, spellState.totalQuestions);
    spellState.currentIndex = 0;
    spellState.score = 0;
    spellState.streak = 0;
    spellState.bestStreak = 0;
    spellState.correctAnswers = 0;
    spellState.sessionDiamonds = 0;
    spellState.attempts = 0;
    spellState.waiting = false;

    document.getElementById('spell-score').textContent = '0';
    document.getElementById('spell-streak-text').textContent = '🔥 0';

    document.getElementById('spell-diamonds-display').style.display = '';
    document.getElementById('spell-diamonds-game').textContent = loadDiamonds();

    updateSpellProgress();
    showScreen('spell-screen');
    showSpellQuestion();
}

function showSpellQuestion() {
    if (spellState.currentIndex >= spellState.totalQuestions) {
        showResults('spell');
        return;
    }

    spellState.attempts = 0;
    const phase = spellState.phases[spellState.currentIndex];
    document.getElementById('spell-moon-visual').textContent = phase.emoji;

    const input = document.getElementById('spell-input');
    input.value = '';
    input.focus();

    const feedback = document.getElementById('spell-feedback');
    feedback.classList.add('hidden');
    feedback.className = 'spell-feedback hidden';

    const hint = document.getElementById('spell-hint');
    hint.classList.add('hidden');

    updateSpellProgress();
}

function handleSpellKeyPress(event) {
    if (event.key === 'Enter') {
        checkSpelling();
    }
}

function checkSpelling() {
    if (spellState.waiting) return;

    const input = document.getElementById('spell-input');
    const userAnswer = input.value.trim();
    const phase = spellState.phases[spellState.currentIndex];
    const correctName = phase.name;

    if (!userAnswer) return;

    spellState.attempts++;

    const feedback = document.getElementById('spell-feedback');
    const hint = document.getElementById('spell-hint');

    // Case-insensitive comparison
    if (userAnswer.toLowerCase() === correctName.toLowerCase()) {
        // Correct!
        playSound('correct');
        feedback.classList.remove('hidden', 'wrong-spell');
        feedback.classList.add('correct-spell');
        feedback.textContent = `✅ Correct! ${phase.emoji} ${correctName}`;

        spellState.score += 10;
        spellState.streak++;
        spellState.correctAnswers++;
        if (spellState.streak > spellState.bestStreak) spellState.bestStreak = spellState.streak;

        document.getElementById('spell-score').textContent = spellState.score;
        document.getElementById('spell-streak-text').textContent = '🔥 ' + spellState.streak;

        // Diamonds reward (only on first attempt)
        if (spellState.attempts === 1) {
            const currentDiamonds = loadDiamonds();
            const newDiamonds = currentDiamonds + DIAMONDS_PER_CORRECT;
            saveDiamonds(newDiamonds);
            spellState.sessionDiamonds += DIAMONDS_PER_CORRECT;
            document.getElementById('spell-diamonds-game').textContent = newDiamonds;
        }

        hint.classList.add('hidden');

        // Show overlay
        const overlay = document.getElementById('spell-feedback-overlay');
        const content = document.getElementById('spell-feedback-content');
        content.textContent = '🎉 ' + randomFrom(ENCOURAGEMENTS);
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('hidden'), 1200);

        spellState.waiting = true;
        setTimeout(() => {
            spellState.currentIndex++;
            spellState.waiting = false;
            showSpellQuestion();
        }, 1800);

    } else {
        // Wrong
        playSound('wrong');
        feedback.classList.remove('hidden', 'correct-spell');
        feedback.classList.add('wrong-spell');

        spellState.streak = 0;
        document.getElementById('spell-streak-text').textContent = '🔥 0';

        if (spellState.attempts >= 2) {
            // After 2 wrong attempts, show the answer and move on
            feedback.innerHTML = `❌ The correct spelling is:<span class="correct-spelling">${correctName}</span>`;

            hint.classList.add('hidden');

            spellState.waiting = true;
            setTimeout(() => {
                spellState.currentIndex++;
                spellState.waiting = false;
                showSpellQuestion();
            }, 3000);
        } else {
            // First wrong attempt — give a hint
            feedback.textContent = `❌ Not quite! Try again...`;

            // Show hint with first letter and length
            hint.classList.remove('hidden');
            const blanks = correctName.split('').map((ch, i) => {
                if (i === 0 || ch === ' ') return ch;
                return '_';
            }).join(' ');
            hint.innerHTML = `💡 Hint: <strong>${blanks}</strong> (${correctName.length} letters)`;

            input.value = '';
            input.focus();
        }
    }
}

function updateSpellProgress() {
    const pct = (spellState.currentIndex / spellState.totalQuestions) * 100;
    document.getElementById('spell-progress-fill').style.width = pct + '%';
    document.getElementById('spell-progress-text').textContent =
        spellState.currentIndex + ' / ' + spellState.totalQuestions;
}

// ===== ORDER QUIZ MODE =====
const orderState = {
    correctOrder: [],
    placed: [],
    shuffledChoices: [],
    score: 0,
    sessionDiamonds: 0,
    roundsCompleted: 0,
    totalRounds: 5,
    waiting: false,
};

function startOrderQuiz() {
    orderState.placed = [];
    orderState.score = 0;
    orderState.sessionDiamonds = 0;
    orderState.roundsCompleted = 0;
    orderState.waiting = false;

    document.getElementById('order-score').textContent = '0';

    document.getElementById('order-diamonds-display').style.display = '';
    document.getElementById('order-diamonds-game').textContent = loadDiamonds();

    showScreen('order-screen');
    startOrderRound();
}

function startOrderRound() {
    orderState.correctOrder = [...MOON_PHASES];
    orderState.placed = [];
    orderState.shuffledChoices = [...MOON_PHASES].sort(() => Math.random() - 0.5);
    orderState.waiting = false;

    updateOrderProgress();
    renderOrderChoices();
    renderOrderPlaced();

    document.getElementById('order-question').textContent =
        `Round ${orderState.roundsCompleted + 1}: Tap the moon phases in order! (New Moon → Waning Crescent)`;
}

function renderOrderChoices() {
    const container = document.getElementById('order-choices');
    container.innerHTML = '';

    orderState.shuffledChoices.forEach((phase, i) => {
        const btn = document.createElement('button');
        btn.className = 'order-choice-btn';
        if (orderState.placed.find(p => p.name === phase.name)) {
            btn.classList.add('used');
        }
        btn.innerHTML = `<span class="choice-emoji">${phase.emoji}</span><span>${phase.name}</span>`;
        btn.onclick = () => placePhase(phase);
        container.appendChild(btn);
    });
}

function renderOrderPlaced() {
    const container = document.getElementById('order-placed');
    container.innerHTML = '';

    if (orderState.placed.length === 0) {
        container.innerHTML = '<p style="color:#a0a0d0;margin:auto;">Tap phases in order below...</p>';
        return;
    }

    orderState.placed.forEach((phase, i) => {
        const div = document.createElement('div');
        div.className = 'placed-moon';
        div.innerHTML = `<span class="placed-emoji">${phase.emoji}</span><span class="placed-number">${i + 1}</span>`;
        container.appendChild(div);
    });
}

function placePhase(phase) {
    if (orderState.waiting) return;
    if (orderState.placed.find(p => p.name === phase.name)) return;

    playSound('click');
    orderState.placed.push(phase);
    renderOrderPlaced();
    renderOrderChoices();

    // Check if all placed
    if (orderState.placed.length === MOON_PHASES.length) {
        orderState.waiting = true;
        checkOrder();
    }
}

function undoOrder() {
    if (orderState.waiting) return;
    if (orderState.placed.length === 0) return;
    playSound('click');
    orderState.placed.pop();
    renderOrderPlaced();
    renderOrderChoices();
}

function checkOrder() {
    let allCorrect = true;
    for (let i = 0; i < MOON_PHASES.length; i++) {
        if (orderState.placed[i].order !== i) {
            allCorrect = false;
            break;
        }
    }

    if (allCorrect) {
        playSound('correct');
        orderState.score += 20;
        document.getElementById('order-score').textContent = orderState.score;

        // Diamonds: 4 per correct answer (entire round counts as getting all 8 right)
        const earned = DIAMONDS_PER_CORRECT * MOON_PHASES.length; // 4 * 8 = 32 per round
        const currentDiamonds = loadDiamonds();
        const newDiamonds = currentDiamonds + earned;
        saveDiamonds(newDiamonds);
        orderState.sessionDiamonds += earned;
        document.getElementById('order-diamonds-game').textContent = newDiamonds;

        showOrderOverlay('🎉 Perfect Order! ' + randomFrom(ENCOURAGEMENTS));

        orderState.roundsCompleted++;
        updateOrderProgress();

        setTimeout(() => {
            if (orderState.roundsCompleted >= orderState.totalRounds) {
                showResults('order');
            } else {
                startOrderRound();
            }
        }, 2000);

    } else {
        playSound('wrong');

        showOrderOverlay('Not quite! The correct order is:\n🌑🌒🌓🌔🌕🌖🌗🌘\nTry again!');

        setTimeout(() => {
            orderState.placed = [];
            orderState.waiting = false;
            renderOrderPlaced();
            renderOrderChoices();
        }, 3000);
    }
}

function showOrderOverlay(text) {
    const overlay = document.getElementById('order-feedback-overlay');
    const content = document.getElementById('order-feedback-content');
    content.textContent = text;
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('hidden'), 2500);
}

function updateOrderProgress() {
    const pct = (orderState.roundsCompleted / orderState.totalRounds) * 100;
    document.getElementById('order-progress-fill').style.width = pct + '%';
    document.getElementById('order-progress-text').textContent =
        orderState.roundsCompleted + ' / ' + orderState.totalRounds;
}

// ===== POSITION QUIZ MODE =====
// Moon orbital positions (0=left/between sun & earth, going counterclockwise)
// Sun is on the LEFT, Earth is in the CENTER
// Positions around the orbit (angles in degrees, 0° = left/toward sun):
const POSITION_ANGLES = {
    'New Moon':         180,   // Between Sun and Earth (left side)
    'Waxing Crescent':  225,  // Top-left
    'First Quarter':    270,  // Top (directly above Earth)
    'Waxing Gibbous':   315,  // Top-right
    'Full Moon':        0,    // Right side (opposite Sun)
    'Waning Gibbous':   45,   // Bottom-right
    'Third Quarter':    90,   // Bottom (directly below Earth)
    'Waning Crescent':  135,  // Bottom-left
};

const posState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    totalQuestions: 20,
    sessionDiamonds: 0,
    waiting: false,
};

function startPositionQuiz() {
    // Generate 20 random questions from the 8 phases
    const pool = [];
    while (pool.length < posState.totalQuestions) {
        pool.push(...[...MOON_PHASES].sort(() => Math.random() - 0.5));
    }
    posState.questions = pool.slice(0, posState.totalQuestions);
    posState.currentIndex = 0;
    posState.score = 0;
    posState.streak = 0;
    posState.bestStreak = 0;
    posState.correctAnswers = 0;
    posState.sessionDiamonds = 0;
    posState.waiting = false;

    document.getElementById('pos-score').textContent = '0';
    document.getElementById('pos-streak-text').textContent = '🔥 0';
    document.getElementById('pos-diamonds-game').textContent = loadDiamonds();

    showScreen('position-screen');
    drawOrbitDiagram();
    showPositionQuestion();
}

function drawOrbitDiagram() {
    const container = document.querySelector('.orbit-diagram-container');
    const size = container.offsetWidth || 360;

    const canvas = document.getElementById('orbit-canvas');
    // Match canvas resolution to container size
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const orbitR = size * 0.35; // 35% of container size
    const sunX = size * 0.08;  // Sun position (8% from left)

    ctx.clearRect(0, 0, size, size);

    // Draw orbit path (dashed circle)
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Sun (left side, outside orbit)
    ctx.font = `${size * 0.1}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☀️', sunX, cy);

    // Sun label
    ctx.font = `bold ${size * 0.03}px sans-serif`;
    ctx.fillStyle = '#ffd700';
    ctx.fillText('SUN', sunX, cy + size * 0.07);

    // Draw sun rays (light direction arrow)
    ctx.beginPath();
    ctx.moveTo(sunX + size * 0.07, cy);
    ctx.lineTo(cx - orbitR - 10, cy);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Earth (center)
    ctx.font = `${size * 0.09}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🌍', cx, cy);

    // Earth label
    ctx.font = `bold ${size * 0.03}px sans-serif`;
    ctx.fillStyle = '#4db8ff';
    ctx.fillText('EARTH', cx, cy + size * 0.07);

    // Generate clickable position buttons
    const posContainer = document.getElementById('orbit-positions');
    posContainer.innerHTML = '';

    const positions = Object.entries(POSITION_ANGLES);
    positions.forEach(([phaseName, angle]) => {
        const rad = (angle * Math.PI) / 180;
        const x = cx + orbitR * Math.cos(rad);
        const y = cy + orbitR * Math.sin(rad);

        const btn = document.createElement('button');
        btn.className = 'orbit-pos-btn';
        btn.style.left = (x / size * 100) + '%';
        btn.style.top = (y / size * 100) + '%';
        btn.textContent = '?';
        btn.dataset.phase = phaseName;
        btn.dataset.angle = angle;
        btn.onclick = () => handlePositionChoice(btn, phaseName);
        posContainer.appendChild(btn);
    });
}

function showPositionQuestion() {
    if (posState.currentIndex >= posState.totalQuestions) {
        showResults('position');
        return;
    }

    const phase = posState.questions[posState.currentIndex];
    document.getElementById('pos-phase-emoji').textContent = phase.emoji;
    document.getElementById('pos-phase-name').textContent = phase.name;

    // Reset all position buttons
    document.querySelectorAll('.orbit-pos-btn').forEach(btn => {
        btn.className = 'orbit-pos-btn';
        btn.textContent = '?';
        btn.style.pointerEvents = '';
    });

    const feedback = document.getElementById('pos-feedback');
    feedback.classList.add('hidden');

    updatePositionProgress();
}

function handlePositionChoice(btn, clickedPhaseName) {
    if (posState.waiting) return;
    posState.waiting = true;

    const currentPhase = posState.questions[posState.currentIndex];
    const correctPhaseName = currentPhase.name;
    const allBtns = document.querySelectorAll('.orbit-pos-btn');

    if (clickedPhaseName === correctPhaseName) {
        // Correct!
        btn.classList.add('correct-pos');
        btn.textContent = currentPhase.emoji;
        playSound('correct');

        posState.score += 10;
        posState.streak++;
        posState.correctAnswers++;
        if (posState.streak > posState.bestStreak) posState.bestStreak = posState.streak;

        document.getElementById('pos-score').textContent = posState.score;
        document.getElementById('pos-streak-text').textContent = '🔥 ' + posState.streak;

        // Diamond reward
        const cd = loadDiamonds();
        const nd = cd + DIAMONDS_PER_CORRECT;
        saveDiamonds(nd);
        posState.sessionDiamonds += DIAMONDS_PER_CORRECT;
        document.getElementById('pos-diamonds-game').textContent = nd;

        showPosFeedback(true, correctPhaseName);

        const overlay = document.getElementById('pos-feedback-overlay');
        const content = document.getElementById('pos-feedback-content');
        content.textContent = '🎉 ' + randomFrom(ENCOURAGEMENTS);
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('hidden'), 1200);

    } else {
        // Wrong
        btn.classList.add('wrong-pos');
        playSound('wrong');

        posState.streak = 0;
        document.getElementById('pos-streak-text').textContent = '🔥 0';

        // Reveal correct position
        allBtns.forEach(b => {
            if (b.dataset.phase === correctPhaseName) {
                b.classList.add('revealed-pos');
                b.textContent = currentPhase.emoji;
            }
        });

        showPosFeedback(false, correctPhaseName);
    }

    // Disable all buttons
    allBtns.forEach(b => b.style.pointerEvents = 'none');

    setTimeout(() => {
        posState.currentIndex++;
        posState.waiting = false;
        showPositionQuestion();
    }, 2200);
}

function showPosFeedback(isCorrect, correctName) {
    const feedback = document.getElementById('pos-feedback');
    feedback.classList.remove('hidden', 'correct-spell', 'wrong-spell');

    if (isCorrect) {
        feedback.classList.add('correct-spell');
        feedback.textContent = `✅ Correct! That's where the ${correctName} goes!`;
    } else {
        feedback.classList.add('wrong-spell');
        feedback.textContent = `The ${correctName} goes at the highlighted position.`;
    }
}

function updatePositionProgress() {
    const pct = (posState.currentIndex / posState.totalQuestions) * 100;
    document.getElementById('pos-progress-fill').style.width = pct + '%';
    document.getElementById('pos-progress-text').textContent =
        posState.currentIndex + ' / ' + posState.totalQuestions;
}

// ===== Results =====
function showResults(mode) {
    playSound('complete');

    let score, correct, total, bestStreak, sessionDiamonds;

    if (mode === 'identify') {
        score = quizState.score;
        correct = quizState.correctAnswers;
        total = quizState.totalQuestions;
        bestStreak = quizState.bestStreak;
        sessionDiamonds = quizState.sessionDiamonds;
    } else if (mode === 'spell') {
        score = spellState.score;
        correct = spellState.correctAnswers;
        total = spellState.totalQuestions;
        bestStreak = spellState.bestStreak;
        sessionDiamonds = spellState.sessionDiamonds;
    } else if (mode === 'position') {
        score = posState.score;
        correct = posState.correctAnswers;
        total = posState.totalQuestions;
        bestStreak = posState.bestStreak;
        sessionDiamonds = posState.sessionDiamonds;
    } else {
        score = orderState.score;
        correct = orderState.roundsCompleted;
        total = orderState.totalRounds;
        bestStreak = orderState.roundsCompleted;
        sessionDiamonds = orderState.sessionDiamonds;
    }

    const pct = total > 0 ? correct / total : 0;

    // Title
    let title;
    if (pct >= 0.9) title = '🎉 Moon Master! 🎉';
    else if (pct >= 0.7) title = '🌟 Great Job! 🌟';
    else if (pct >= 0.5) title = '👍 Nice Try! 👍';
    else title = '🌙 Keep Practicing! 🌙';

    document.getElementById('results-title').textContent = title;
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-correct').textContent = correct + ' / ' + total;
    document.getElementById('final-streak').textContent = bestStreak;

    // Stars
    const stars = pct >= 0.9 ? 5 : pct >= 0.7 ? 4 : pct >= 0.5 ? 3 : pct >= 0.3 ? 2 : 1;
    document.getElementById('star-rating').textContent = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);

    // Diamonds results
    document.getElementById('diamonds-session').textContent = sessionDiamonds;
    document.getElementById('diamonds-total-result').textContent = loadDiamonds();
    document.getElementById('diamonds-results').style.display = '';

    showScreen('results-screen');

    // Confetti for great results
    if (pct >= 0.7) {
        launchConfetti();
    }
}

function playAgain() {
    playSound('click');
    startSelected();
}

function goHome() {
    playSound('click');
    updateDiamondsDisplay();
    showScreen('start-screen');
}

// ===== Confetti =====
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff8ff8', '#b088f9'];
    const moonEmojis = ['🌙', '⭐', '✨', '💫', '🌟'];

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: (Math.random() - 0.5) * 4,
            speedY: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            isEmoji: Math.random() > 0.7,
            emoji: moonEmojis[Math.floor(Math.random() * moonEmojis.length)],
        });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);

            if (p.isEmoji) {
                ctx.font = `${p.size * 2}px serif`;
                ctx.textAlign = 'center';
                ctx.fillText(p.emoji, 0, 0);
            } else {
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            ctx.restore();
        });

        frame++;
        if (frame < 180) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animate();
}

// ===== Helpers =====
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
