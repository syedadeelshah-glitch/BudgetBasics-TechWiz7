/**
 * BudgetBasics - NextGen BudgetBee
 * Educational Quizzes & Interactive Needs vs Wants Classification Game
 * Techwiz 7 - Category 1 (Web Innovation Unleashed)
 */

document.addEventListener('DOMContentLoaded', () => {
  initBudgetBasicsQuiz();
});

/* ==========================================================================
   1. Budgeting Basics Concept Guides & Knowledge Check (SRS Module 1)
   ========================================================================== */
const BUDGETING_KNOWLEDGE_QUESTIONS = [
  {
    id: 1,
    question: "Which of the following is considered a 'Fixed Expense' for a student?",
    options: [
      "Weekend dinner outings with study peers",
      "Monthly hostel room rent or lease payment",
      "Snacks and energy drinks between lectures",
      "New video game launch preorder"
    ],
    correct: 1,
    explanation: "Rent is a fixed recurring expense because the cost is predictable, mandatory, and does not fluctuate drastically month-to-month."
  },
  {
    id: 2,
    question: "Under the 50-30-20 budgeting framework, what does the 20% bucket represent?",
    options: [
      "Leisure, dining out, and movie streaming",
      "Emergency savings, debt repayment, and future goals",
      "Commute bus fares and campus cafeteria lunches",
      "Annual tax filings only"
    ],
    correct: 1,
    explanation: "The 20% allocation is dedicated to paying yourself first—building an emergency cushion and funding future personal milestones."
  },
  {
    id: 3,
    question: "What is the primary benefit of the '48-Hour Waiting Rule'?",
    options: [
      "It lets the store offer an extra clearance discount",
      "It eliminates emotional impulse buying on non-essential wants",
      "It guarantees textbook delivery speed",
      "It improves your credit score immediately"
    ],
    correct: 1,
    explanation: "Waiting 48 hours allows emotional adrenaline to cool down, enabling you to objectively assess whether an item is truly needed."
  }
];

let currentQuizIdx = 0;
let userQuizScore = 0;

function initBudgetBasicsQuiz() {
  renderQuizQuestion(currentQuizIdx);

  const btnNext = document.getElementById('btnNextQuizQuestion');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      currentQuizIdx++;
      if (currentQuizIdx < BUDGETING_KNOWLEDGE_QUESTIONS.length) {
        renderQuizQuestion(currentQuizIdx);
      } else {
        showQuizCompletion();
      }
    });
  }

  const btnRestart = document.getElementById('btnRestartQuiz');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      currentQuizIdx = 0;
      userQuizScore = 0;
      document.getElementById('quizResultCard')?.classList.add('d-none');
      document.getElementById('quizActiveCard')?.classList.remove('d-none');
      renderQuizQuestion(0);
    });
  }
}

function renderQuizQuestion(idx) {
  const q = BUDGETING_KNOWLEDGE_QUESTIONS[idx];
  const qTitle = document.getElementById('quizQuestionTitle');
  const qIndexText = document.getElementById('quizQuestionCounter');
  const optionsContainer = document.getElementById('quizOptionsContainer');
  const feedbackBox = document.getElementById('quizExplanationBox');
  const btnNext = document.getElementById('btnNextQuizQuestion');

  if (!qTitle || !optionsContainer) return;

  if (qIndexText) qIndexText.textContent = `Question ${idx + 1} of ${BUDGETING_KNOWLEDGE_QUESTIONS.length}`;
  qTitle.textContent = q.question;

  if (feedbackBox) feedbackBox.classList.add('d-none');
  if (btnNext) btnNext.disabled = true;

  optionsContainer.innerHTML = q.options.map((opt, optIdx) => `
    <button class="btn text-start w-100 p-3 mb-2 rounded-3 quiz-opt-btn" onclick="selectQuizAnswer(${idx}, ${optIdx}, this)">
      <span class="badge me-2">${String.fromCharCode(65 + optIdx)}</span> ${opt}
    </button>
  `).join('');
}

window.selectQuizAnswer = function(qIdx, selectedOptIdx, btnEl) {
  const q = BUDGETING_KNOWLEDGE_QUESTIONS[qIdx];
  const allBtns = document.querySelectorAll('.quiz-opt-btn');
  allBtns.forEach(b => {
    b.disabled = true;
    b.style.pointerEvents = 'none';
  });

  const feedbackBox = document.getElementById('quizExplanationBox');
  const btnNext = document.getElementById('btnNextQuizQuestion');

  if (selectedOptIdx === q.correct) {
    userQuizScore++;
    btnEl.classList.add('quiz-opt-correct', 'btn-success', 'text-white');
    if (feedbackBox) {
      feedbackBox.className = 'p-3 mt-3 rounded-3 bg-success-subtle text-success border border-success-subtle';
      feedbackBox.innerHTML = `<strong><i class="bi bi-check-circle-fill me-1"></i> Correct!</strong> ${q.explanation}`;
      feedbackBox.classList.remove('d-none');
    }
  } else {
    btnEl.classList.add('quiz-opt-wrong', 'btn-danger', 'text-white');
    allBtns[q.correct].classList.add('quiz-opt-correct', 'btn-success', 'text-white');
    if (feedbackBox) {
      feedbackBox.className = 'p-3 mt-3 rounded-3 bg-danger-subtle text-danger border border-danger-subtle';
      feedbackBox.innerHTML = `<strong><i class="bi bi-x-circle-fill me-1"></i> Not quite.</strong> ${q.explanation}`;
      feedbackBox.classList.remove('d-none');
    }
  }

  if (btnNext) btnNext.disabled = false;
};

function showQuizCompletion() {
  document.getElementById('quizActiveCard')?.classList.add('d-none');
  const resultCard = document.getElementById('quizResultCard');
  const scoreText = document.getElementById('quizFinalScore');
  const badgeText = document.getElementById('quizBadgeResult');

  if (resultCard) resultCard.classList.remove('d-none');
  if (scoreText) scoreText.textContent = `${userQuizScore} / ${BUDGETING_KNOWLEDGE_QUESTIONS.length}`;

  if (badgeText) {
    if (userQuizScore === BUDGETING_KNOWLEDGE_QUESTIONS.length) {
      badgeText.innerHTML = `<span class="badge bg-success p-2 fs-6">🏆 Budgeting Master! Excellent score!</span>`;
    } else {
      badgeText.innerHTML = `<span class="badge bg-warning text-dark p-2 fs-6">🐝 Great effort! Review the guides and try again!</span>`;
    }
  }
}

/* ==========================================================================
   2. Needs vs. Wants Interactive Classification Game (SRS Module 2)
   ========================================================================== */
let nvwScore = 0;
let nvwCompletedCount = 0;

window.initNeedsVsWantsQuiz = function() {
  const container = document.getElementById('needsVsWantsGrid');
  if (!container || !BB_STATE.sampleData || !BB_STATE.sampleData.needsVsWantsItems) return;

  const items = BB_STATE.sampleData.needsVsWantsItems;
  nvwScore = 0;
  nvwCompletedCount = 0;
  updateNvwScoreDisplay(items.length);

  container.innerHTML = items.map((item, idx) => `
    <div class="col-md-6 col-lg-3">
      <div class="nvw-card h-100 d-flex flex-column" id="nvw-card-${item.id}">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="badge bg-secondary-subtle text-secondary small">${item.category}</span>
          <span class="fw-bold text-primary nvw-item-cost" data-base-cost="${item.cost}">${formatMoney(item.cost)}</span>
        </div>
        <div class="text-center my-2">
          <div class="feature-icon-box mx-auto icon-orange">
            <i class="bi ${item.icon}"></i>
          </div>
          <h6 class="fw-bold fs-6 mb-1">${item.title}</h6>
        </div>
        <div class="mt-auto">
          <div class="nvw-btn-group" id="nvw-actions-${item.id}">
            <button class="btn-need-choice" onclick="classifyNvwItem('${item.id}', true)">
              <i class="bi bi-shield-check me-1"></i> Need
            </button>
            <button class="btn-want-choice" onclick="classifyNvwItem('${item.id}', false)">
              <i class="bi bi-heart me-1"></i> Want
            </button>
          </div>
          <div class="nvw-feedback" id="nvw-feedback-${item.id}"></div>
        </div>
      </div>
    </div>
  `).join('');
};

// Listen to currency changes to refresh Module 2 Needs vs Wants prices
window.addEventListener('currencyChanged', () => {
  document.querySelectorAll('.nvw-item-cost').forEach(el => {
    const baseCost = parseFloat(el.getAttribute('data-base-cost')) || 0;
    el.textContent = formatMoney(baseCost);
  });
});

window.classifyNvwItem = function(itemId, userChoseNeed) {
  const items = BB_STATE.sampleData?.needsVsWantsItems || [];
  const item = items.find(x => x.id === itemId);
  if (!item) return;

  const feedbackEl = document.getElementById(`nvw-feedback-${itemId}`);
  const actionsEl = document.getElementById(`nvw-actions-${itemId}`);
  const cardEl = document.getElementById(`nvw-card-${itemId}`);

  if (!feedbackEl || !actionsEl) return;

  actionsEl.style.display = 'none'; // disable further clicks
  nvwCompletedCount++;

  const isCorrect = (userChoseNeed === item.isNeed);
  if (isCorrect) {
    nvwScore++;
    feedbackEl.className = 'nvw-feedback correct';
    feedbackEl.innerHTML = `
      <strong><i class="bi bi-check-circle-fill me-1"></i> Correct!</strong> This is a <strong>${item.isNeed ? 'Need' : 'Want'}</strong>.
      <p class="mb-0 mt-1 small">${item.explanation}</p>
    `;
    if (cardEl) cardEl.style.borderColor = '#10B981';
  } else {
    feedbackEl.className = 'nvw-feedback incorrect';
    feedbackEl.innerHTML = `
      <strong><i class="bi bi-info-circle-fill me-1"></i> Actually, it's a ${item.isNeed ? 'Need' : 'Want'}!</strong>
      <p class="mb-0 mt-1 small">${item.explanation}</p>
    `;
    if (cardEl) cardEl.style.borderColor = '#EF4444';
  }

  updateNvwScoreDisplay(items.length);
};

function updateNvwScoreDisplay(total) {
  const scoreEl = document.getElementById('nvwScoreTally');
  if (scoreEl) {
    scoreEl.textContent = `Score: ${nvwScore} / ${nvwCompletedCount} Completed (${total} Total)`;
  }
}
