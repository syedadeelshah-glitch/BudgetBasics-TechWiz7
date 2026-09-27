/**
 * BudgetBasics - NextGen BudgetBee
 * Main Application Orchestrator
 * Techwiz 7 - Category 1 (Web Innovation Unleashed)
 */

// Global State
const BB_STATE = {
  currentCurrency: '$',
  currencyRate: 1.0,
  theme: 'light',
  visitorCount: 14892,
  sampleData: null,
  tipsData: null
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initPagePreloader();
  initTheme();
  initVisitorCounter();
  initLiveClock();
  initCurrencySelector();
  loadDataFiles();
  initSearchAndFilter();
  initInfographicsGallery();
  initContactAndFeedback();
  initSubscriptionAuditor();
  initBackToTop();
  initGuidedTour();
  initModularPrinting();
  initNavbarScrollState();
  initMobileNavbarAutoClose();
  initCursorBeeFollower();
  initScrollReveal();
});

/* ==========================================================================
   0. Page Preloader & Application Bootstrap
   ========================================================================== */
function initPagePreloader() {
  const preloader = document.getElementById('page-preloader');
  if (!preloader) return;

  const maskRect = document.getElementById('preloaderMaskRect');
  const activePath = document.getElementById('preloaderSnakeActive');
  const snakeHead = document.getElementById('preloaderSnakeHead');
  const percentText = document.getElementById('preloaderPercent');
  const stepText = document.getElementById('preloaderStepText');

  let totalLength = 328;
  if (activePath && activePath.getTotalLength) {
    try {
      totalLength = activePath.getTotalLength() || 328;
    } catch(e) {}
  }

  const milestones = [
    { at: 0, text: "Initializing BudgetBasics workspace..." },
    { at: 28, text: "Calibrating 50-30-20 financial engine..." },
    { at: 62, text: "Loading interactive student budget guides..." },
    { at: 86, text: "Activating NextGen BudgetBee AI..." },
    { at: 100, text: "Welcome to BudgetBasics!" }
  ];

  let currentVal = 0;
  const startTime = performance.now();
  const totalDuration = 1000; // ms for swift, smooth initialization

  function updateStatus(val) {
    if (!stepText) return;
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (val >= milestones[i].at) {
        if (stepText.textContent !== milestones[i].text) {
          stepText.style.opacity = '0.5';
          setTimeout(() => {
            stepText.textContent = milestones[i].text;
            stepText.style.opacity = '1';
          }, 80);
        }
        break;
      }
    }
  }

  function tick(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(1, elapsed / totalDuration);
    // Smooth ease-out cubic curve
    const eased = 1 - Math.pow(1 - progress, 3);
    currentVal = Math.min(100, Math.floor(eased * 100));

    // Update 1.5px dashed snake line mask width
    if (maskRect) {
      maskRect.setAttribute('width', (8 + (currentVal / 100) * 328).toFixed(1));
    }

    // Update tracing snake arrow position and tangent rotation
    if (snakeHead && activePath && activePath.getPointAtLength) {
      try {
        const dist = (currentVal / 100) * totalLength;
        const pt = activePath.getPointAtLength(dist);
        const ptNext = activePath.getPointAtLength(Math.min(totalLength, dist + 1));
        const angleRad = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x);
        const angleDeg = (angleRad * 180) / Math.PI;
        snakeHead.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) rotate(${angleDeg.toFixed(1)})`);
      } catch(e) {}
    }

    if (percentText) percentText.textContent = `${currentVal}%`;
    updateStatus(currentVal);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(dismissPreloader, 180);
    }
  }

  function dismissPreloader() {
    if (!preloader || preloader.classList.contains('preloader-dismiss')) return;
    preloader.classList.add('preloader-dismiss');
    document.body.classList.remove('preloader-active');

    setTimeout(() => {
      preloader.style.display = 'none';
      preloader.setAttribute('aria-hidden', 'true');
    }, 600);
  }

  // Safety fallback in case browser delays or background tab throttling
  setTimeout(dismissPreloader, 2600);

  requestAnimationFrame(tick);
}

/* ==========================================================================
   1. Theme Management (Light / Dark Mode with Persistence)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('bb_theme') || 'light';
  applyTheme(savedTheme);

  document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-bs-theme', theme);
  BB_STATE.theme = theme;
  localStorage.setItem('bb_theme', theme);
  
  document.querySelectorAll('.btn-theme-toggle i').forEach(icon => {
    if (theme === 'dark') {
      icon.className = 'bi bi-sun-fill text-warning';
    } else {
      icon.className = 'bi bi-moon-stars-fill';
    }
  });

  // Dynamically update Chart.js donut graph border & legend colors
  if (typeof window.updateBudgetChartTheme === 'function') {
    window.updateBudgetChartTheme();
  }
}

window.handleFooterSubscribe = function() {
  const emailInput = document.getElementById('footerSubscribeEmail');
  const val = emailInput ? emailInput.value.trim() : '';
  if (!val || !val.includes('@')) {
    if (typeof showToastAlert === 'function') {
      showToastAlert('Invalid Email', 'Please enter a valid student campus email address.');
    } else {
      alert('Please enter a valid campus email address.');
    }
    return;
  }
  if (typeof showToastAlert === 'function') {
    showToastAlert('Subscribed!', 'You are enrolled to receive weekly student budget hacks.');
  }
  if (emailInput) emailInput.value = '';
};

/* ==========================================================================
   2. Real-time Digital Clock & Visitor Counter
   ========================================================================== */
function initLiveClock() {
  const clockEl = document.getElementById('liveClockDisplay');
  const dateEl = document.getElementById('liveDateDisplay');

  function updateTime() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

function initVisitorCounter() {
  const storedVisitors = localStorage.getItem('bb_visitors');
  let count = storedVisitors ? parseInt(storedVisitors, 10) : 14892;
  
  // Increment visit if first time in session
  if (!sessionStorage.getItem('bb_visited_session')) {
    count += Math.floor(Math.random() * 3) + 1;
    localStorage.setItem('bb_visitors', count);
    sessionStorage.setItem('bb_visited_session', 'true');
  }

  const counterEl = document.getElementById('visitorCounter');
  if (counterEl) {
    counterEl.textContent = count.toLocaleString();
  }
}

/* ==========================================================================
   3. Multi-Currency Formatter System
   ========================================================================== */
function initCurrencySelector() {
  const select = document.getElementById('currencySelector');
  if (!select) return;

  select.addEventListener('change', (e) => {
    BB_STATE.currentCurrency = e.target.value;
    // Dispatch custom event to notify all modules
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: e.target.value } }));
    updateAllCurrencyDisplays();
  });
}

function formatMoney(amount) {
  const sym = BB_STATE.currentCurrency || '$';
  const sep = (sym.length > 1 || sym.endsWith('.')) ? ' ' : '';
  return `${sym}${sep}${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateAllCurrencyDisplays() {
  document.querySelectorAll('[data-currency-symbol]').forEach(el => {
    el.textContent = BB_STATE.currentCurrency;
  });
}

window.navigateToSectionFromChatbot = function(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return false;

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const cardOrWrap = target.querySelector('.calc-card, .feature-card, .card, .invoice-card, .table-responsive') || target;
  if (cardOrWrap) {
    cardOrWrap.classList.add('chatbot-highlight-pulse');
    setTimeout(() => cardOrWrap.classList.remove('chatbot-highlight-pulse'), 2500);
  }
  return true;
};

/* ==========================================================================
   4. Load External JSON Data (Tips, Quotes, Sample Data)
   ========================================================================== */
async function loadDataFiles() {
  try {
    const [tipsRes, sampleRes, infoRes] = await Promise.all([
      fetch('data/budget-tips.json'),
      fetch('data/sample-data.json'),
      fetch('data/infographics.json')
    ]);

    if (tipsRes.ok) {
      BB_STATE.tipsData = await tipsRes.json();
      renderMoneyMistakes(BB_STATE.tipsData.moneyMistakes);
      renderQuickFacts(BB_STATE.tipsData.quickFacts);
      initFinancialTicker();
    }

    if (infoRes && infoRes.ok) {
      BB_STATE.infographics = await infoRes.json();
      activeInfographics = [...BB_STATE.infographics];
      renderInfographics(activeInfographics);
    }

    if (sampleRes.ok) {
      BB_STATE.sampleData = await sampleRes.json();
      // Initialize dependent modules
      if (typeof window.initSampleBudgetGuide === 'function') window.initSampleBudgetGuide();
      if (typeof window.initNeedsVsWantsQuiz === 'function') window.initNeedsVsWantsQuiz();
      if (typeof window.initExpensePlanner === 'function') window.initExpensePlanner();
      if (typeof window.initInvoiceModule === 'function') window.initInvoiceModule();
    }
  } catch (err) {
    console.warn('Notice: Running in local file mode or serverless environment. Loading localized fallback datasets.', err);
    loadFallbackData();
  }
}

function loadFallbackData() {
  // Built-in resilient dataset for offline/file-protocol evaluation
  BB_STATE.tipsData = {
    tickerTips: [
      "💡 Tip of the Day: Track small $3–$5 daily expenses—they easily sum up to $1,500+ every school year!",
      "🐝 BudgetBee Rule: Allocate 50% for Needs, 30% for Wants, and 20% for Savings.",
      "🚀 Emergency Fund Goal: Strive to keep $300 to $500 aside for surprise laptop or phone emergencies.",
      "📱 Subscription Check: Cancel recurring streaming trials before the 30-day grace period lapses.",
      "🎓 Student Advantage: Use your academic .edu email to unlock up to 60% discounts on software and tech.",
      "🛡️ 24-Hour Cool-off: Wait a full day before purchasing anything outside your pre-planned budget."
    ],
    quotes: [
      { quote: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" }
    ],
    quickFacts: [
      { title: "College Dining Reality", fact: "Students who meal prep at home 4 days a week save $160 per month compared to eating out." },
      { title: "Textbook Savings", fact: "Renting digital e-books saves students up to 70% compared to purchasing new hardcover editions." },
      { title: "Ghost Subscriptions", fact: "Over 42% of young adults pay for at least one streaming or app subscription they forgot existed." },
      { title: "The Power of Compounding", fact: "Saving just $50 a month starting at age 19 can grow to over $120,000 by retirement." }
    ],
    moneyMistakes: [
      {
        id: "impulse_buying",
        title: "Impulse Buying Under Peer Pressure",
        icon: "bi-bag-x",
        scenario: "Marcus goes to the mall with friends to study, but gets persuaded to purchase a $90 designer hoodie on sale that wasn't planned.",
        impact: "Leaves insufficient funds for the month's internet bill and meal plan.",
        action: "Adopt the 48-Hour Waiting Rule: Leave items in your cart for 2 days. If the urge fades, you saved money.",
        badge: "Common Mistake #1"
      },
      {
        id: "ghost_subs",
        title: "Unmonitored 'Ghost' Subscriptions",
        icon: "bi-credit-card-2-front",
        scenario: "Sarah signed up for three 14-day free trials (cloud gaming, fitness app, 4K streaming) and forgot to cancel.",
        impact: "Silently drains $38 each month from her debit card without her noticing for 5 consecutive months.",
        action: "Set a calendar reminder for 2 days before any free trial ends, or use a pre-paid virtual card.",
        badge: "Silent Drainer #2"
      },
      {
        id: "ignoring_micro",
        title: "Ignoring Small Daily Micro-Expenses",
        icon: "bi-cup-hot",
        scenario: "Leo buys a $4.50 specialty boba tea and a $2.50 campus canteen pastry every single weekday.",
        impact: "$7 per school day totals $140 per month—enough to cover an entire semester’s textbook rental.",
        action: "Carry a refillable thermal mug and prepare snacks at dorm or home before heading to campus.",
        badge: "The Latte Factor #3"
      },
      {
        id: "no_plan",
        title: "Spending Without a Clear Spending Plan",
        icon: "bi-clipboard-x",
        scenario: "A student receives a $600 semester stipend and spends freely in the first 2 weeks, leaving only $80 for the remaining 6 weeks.",
        impact: "Stressful scrambles for money, relying on expensive emergency borrowing or credit cards.",
        action: "Divide stipends by the number of weeks in the term, and establish a weekly allowance ceiling.",
        badge: "Discipline Trap #4"
      }
    ]
  };

  BB_STATE.sampleData = {
    sampleStudentBudget: {
      monthlyIncome: 1200.00
    },
    needsVsWantsItems: [
      { id: "item-1", title: "Monthly Dorm Rent / Shared Accommodation", cost: 400.00, category: "Housing", icon: "bi-house-heart", isNeed: true, explanation: "Shelter is an indisputable primary human need. Keeping a stable living environment ensures academic focus and safety." },
      { id: "item-2", title: "Daily Specialty Café Caramel Macchiato", cost: 5.50, category: "Dining", icon: "bi-cup-straw", isNeed: false, explanation: "Caffeine is nice, but $5.50 espresso drinks are a luxury Want. You can brew coffee in a dorm mug for under $0.40." },
      { id: "item-3", title: "Semester Core Engineering / Math Textbook", cost: 85.00, category: "Education", icon: "bi-book-half", isNeed: true, explanation: "Required course learning material directly impacts your academic grades and degree completion." },
      { id: "item-4", title: "Premium Multi-Platform 4K Video Streaming Bundle", cost: 22.00, category: "Entertainment", icon: "bi-tv", isNeed: false, explanation: "Entertainment is good for mental breaks, but top-tier 4K streaming is a discretionary Want." },
      { id: "item-5", title: "Monthly Public Bus / Subway Student Transit Card", cost: 45.00, category: "Transport", icon: "bi-bus-front", isNeed: true, explanation: "Commuting to classes, exam halls, and internship sites is an essential obligation." },
      { id: "item-6", title: "Limited Edition Designer Sneakers", cost: 180.00, category: "Fashion", icon: "bi-tags", isNeed: false, explanation: "Footwear for protection is a need, but expensive collectors' sneakers are a luxury want." },
      { id: "item-7", title: "Essential Prescription Medication & Allergy Pills", cost: 30.00, category: "Healthcare", icon: "bi-capsule", isNeed: true, explanation: "Health and physical well-being always take top priority in your budget." },
      { id: "item-8", title: "Video Game Battle Pass & In-Game Weapon Skins", cost: 35.00, category: "Gaming", icon: "bi-controller", isNeed: false, explanation: "In-game cosmetics have no real-world utility and represent impulsive discretionary spending." }
    ],
    initialExpenses: [
      { id: "exp-101", date: "2026-09-01", category: "Education", description: "Semester Lab Manual & Stationery", amount: 42.50 },
      { id: "exp-102", date: "2026-09-03", category: "Food", description: "Weekly Bulk Dorm Groceries & Fruit", amount: 68.00 },
      { id: "exp-103", date: "2026-09-05", category: "Transport", description: "Monthly Student Metro Pass Recharge", amount: 45.00 },
      { id: "exp-104", date: "2026-09-08", category: "Utilities", description: "Mobile Prepaid 5G Plan", amount: 25.00 },
      { id: "exp-105", date: "2026-09-12", category: "Entertainment", description: "Campus Cinema Night with Study Group", amount: 16.00 },
      { id: "exp-106", date: "2026-09-15", category: "Food", description: "Dorm Room Snack & Coffee Refill", amount: 22.00 }
    ],
    initialInvoices: [
      {
        invoiceNumber: "INV-BB-2026-001",
        invoiceDate: "2026-09-01",
        studentName: "Alex Carter",
        studentId: "AP-TECH-7890",
        academicTerm: "Fall Semester 2026",
        totalIncome: 1200.00,
        totalExpenses: 985.00,
        plannedSavings: 215.00,
        notes: "Fall semester allowance planning with focus on creating $500 laptop emergency fund.",
        items: [
          { category: "Needs", description: "Campus Shared Dormitory Rent", amount: 420.00 },
          { category: "Needs", description: "Monthly Grocery & Pantry Essentials", amount: 230.00 },
          { category: "Needs", description: "Student Metro Transit Card", amount: 65.00 },
          { category: "Needs", description: "Mobile Plan & Cloud Storage", amount: 35.00 },
          { category: "Needs", description: "Course Books & Printing Quota", amount: 50.00 },
          { category: "Wants", description: "Dining Out & Study Snacks", amount: 90.00 },
          { category: "Wants", description: "Music & Software Subscriptions", amount: 25.00 },
          { category: "Savings", description: "Emergency Safety Net Allocation", amount: 70.00 }
        ]
      },
      {
        invoiceNumber: "INV-BB-2026-002",
        invoiceDate: "2026-09-10",
        studentName: "Sophia Chen",
        studentId: "AP-TECH-6521",
        academicTerm: "Fall Semester 2026",
        totalIncome: 950.00,
        totalExpenses: 760.00,
        plannedSavings: 190.00,
        notes: "Strict 50-30-20 adherence following Techwiz financial literacy workshop guidelines.",
        items: [
          { category: "Needs", description: "Apartment Utilities & Rent Share", amount: 380.00 },
          { category: "Needs", description: "Meal Prep & Nutritious Staples", amount: 180.00 },
          { category: "Needs", description: "Bus Commute Tickets", amount: 40.00 },
          { category: "Wants", description: "Weekend Social Gatherings", amount: 110.00 },
          { category: "Wants", description: "Digital Subscriptions & Gaming", amount: 50.00 },
          { category: "Savings", description: "20% Automatic Savings Deposit", amount: 190.00 }
        ]
      }
    ]
  };

  renderMoneyMistakes(BB_STATE.tipsData.moneyMistakes);
  renderQuickFacts(BB_STATE.tipsData.quickFacts);
  activeInfographics = [...DEFAULT_INFOGRAPHICS];
  renderInfographics(activeInfographics);

  if (typeof window.initNeedsVsWantsQuiz === 'function') window.initNeedsVsWantsQuiz();
  if (typeof window.initExpensePlanner === 'function') window.initExpensePlanner();
  if (typeof window.initInvoiceModule === 'function') window.initInvoiceModule();
}

/* ==========================================================================
   5. Money Mistakes & Subscription Audit Render
   ========================================================================== */

function renderMoneyMistakes(mistakes) {
  const container = document.getElementById('mistakesAccordion');
  if (!container || !mistakes) return;

  container.innerHTML = mistakes.map((item, idx) => `
    <div class="accordion-item mb-3 border rounded-3 overflow-hidden shadow-sm">
      <h2 class="accordion-header" id="heading-${item.id}">
        <button class="accordion-button ${idx === 0 ? '' : 'collapsed'} fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${item.id}">
          <span class="badge bg-danger-subtle text-danger me-3"><i class="bi ${item.icon} me-1"></i> ${item.badge}</span>
          ${item.title}
        </button>
      </h2>
      <div id="collapse-${item.id}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" data-bs-parent="#mistakesAccordion">
        <div class="accordion-body">
          <div class="p-3 bg-light rounded-3 mb-2">
            <strong class="text-dark"><i class="bi bi-person-exclamation me-1 text-primary"></i> Realistic Scenario:</strong>
            <p class="mb-0 text-secondary mt-1">${item.scenario}</p>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-6">
              <div class="p-2 border border-danger-subtle rounded-3 bg-danger-subtle text-danger small">
                <strong><i class="bi bi-exclamation-triangle-fill me-1"></i> Cost Impact:</strong> ${item.impact}
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-2 border border-success-subtle rounded-3 bg-success-subtle text-success small">
                <strong><i class="bi bi-check-circle-fill me-1"></i> Corrective Action:</strong> ${item.action}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderQuickFacts(facts) {
  const container = document.getElementById('quickFactsContainer');
  if (!container || !facts) return;

  container.innerHTML = facts.map(f => `
    <div class="col-md-6 col-lg-3">
      <div class="p-3 bg-body border rounded-4 shadow-sm h-100">
        <span class="badge bg-warning-subtle text-dark mb-2"><i class="bi bi-lightbulb-fill text-warning me-1"></i> Fact</span>
        <h6 class="fw-bold mb-1">${f.title}</h6>
        <p class="small text-muted mb-0">${f.fact}</p>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   6. Live Global Search, Sort, and Filter Module
   ========================================================================== */
function initSearchAndFilter() {
  const searchInput = document.getElementById('globalSearchInput');

  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value.trim());
    }
  });

  const searchBtn = document.getElementById('btnGlobalSearch');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      performSearch(searchInput.value.trim());
    });
  }

  // Quick tag chips
  document.querySelectorAll('.search-tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-tag');
      searchInput.value = query;
      performSearch(query);
    });
  });
}

function performSearch(query) {
  if (!query) return;

  const resultsBody = document.getElementById('searchResultsContent');
  const resultsCount = document.getElementById('searchResultsCount');
  const queryStr = query.toLowerCase();

  const searchableIndex = [
    { title: "50-30-20 Rule Budgeting", category: "Framework", link: "#calculator-50-30-20", snippet: "Split your monthly allowance: 50% for Needs, 30% for Wants, and 20% for Savings." },
    { title: "Needs vs. Wants Decision Tree", category: "Mindset", link: "#needs-vs-wants", snippet: "Use the 48-hour cool-off rule to distinguish urgent living needs from impulse wants." },
    { title: "Savings Goals & Timelines", category: "Calculator", link: "#savings-goals", snippet: "Set a target fund, monthly contribution, and estimate completion months." },
    { title: "Student Expense Planner Table", category: "Tool", link: "#expense-planner", snippet: "Log daily college expenses across food, books, transport, and utilities." },
    { title: "Unused Ghost Subscriptions", category: "Money Mistake", link: "#money-mistakes", snippet: "Cancel streaming trials and unused campus gym apps draining recurring funds." },
    { title: "Student Monthly Budget Plan & Printable PDF", category: "Planning Tool", link: "#budget-invoice", snippet: "Create formal printable student monthly budget plans and financial summary sheets." },
    { title: "BudgetBee Voice AI Chatbot Assistant", category: "AI Assistant", link: "javascript:void(0)", snippet: "Speech-to-text and text-to-speech voice assistant in bottom-right corner for instant student budgeting guidance." }
  ];

  const matches = searchableIndex.filter(item => 
    item.title.toLowerCase().includes(queryStr) || 
    item.snippet.toLowerCase().includes(queryStr) ||
    item.category.toLowerCase().includes(queryStr)
  );

  if (resultsCount) resultsCount.textContent = `${matches.length} result(s) found for "${query}"`;

  if (matches.length > 0) {
    resultsBody.innerHTML = matches.map(m => `
      <div class="p-3 border rounded-3 mb-2 bg-light hover-lift">
        <span class="badge bg-primary-subtle text-primary mb-1">${m.category}</span>
        <h6 class="fw-bold mb-1"><a href="${m.link}" onclick="const inst = bootstrap.Modal.getInstance(document.getElementById('searchModal')); if(inst) inst.hide(); if('${m.category}' === 'AI Assistant' && typeof toggleFloatingChatbot === 'function') toggleFloatingChatbot(true);">${m.title}</a></h6>
        <p class="small text-muted mb-0">${m.snippet}</p>
      </div>
    `).join('');
  } else {
    resultsBody.innerHTML = `
      <div class="text-center py-4">
        <i class="bi bi-question-circle text-muted display-4"></i>
        <p class="text-muted mt-2">No matching learning content found for <strong>"${query}"</strong>.</p>
        <p class="small text-secondary">Try searching for keywords like: <em>savings, 50-30-20, needs, invoice, calculator, mistake</em>.</p>
      </div>
    `;
  }

  const modalEl = document.getElementById('searchModal');
  if (modalEl && !modalEl.classList.contains('show')) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

/* ==========================================================================
   8. Feedback & Contact Us Validation (Client-Side Safe)
   ========================================================================== */
function initContactAndFeedback() {
  const contactForm = document.getElementById('contactUsForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        e.stopPropagation();
        contactForm.classList.add('was-validated');
        return;
      }

      showToastAlert('Message Sent Successfully!', 'Thank you for contacting BudgetBasics. We will reply to your student email shortly.');
      contactForm.reset();
      contactForm.classList.remove('was-validated');
    });
  }

  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!feedbackForm.checkValidity()) {
        e.stopPropagation();
        feedbackForm.classList.add('was-validated');
        return;
      }

      showToastAlert('Feedback Received!', 'Your feedback helps us make BudgetBasics even more empowering for college students across the globe.');
      feedbackForm.reset();
      feedbackForm.classList.remove('was-validated');
    });
  }

  // Star Rating Input
  const stars = document.querySelectorAll('.star-rating-select i');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-value'), 10);
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-value'), 10);
        if (sVal <= val) {
          s.classList.remove('bi-star');
          s.classList.add('bi-star-fill', 'text-warning');
        } else {
          s.classList.remove('bi-star-fill', 'text-warning');
          s.classList.add('bi-star');
        }
      });
      const hiddenInput = document.getElementById('feedbackRatingValue');
      if (hiddenInput) hiddenInput.value = val;
    });
  });
}

function showToastAlert(title, message) {
  const toastEl = document.getElementById('appToast');
  if (!toastEl) {
    alert(`${title}\n${message}`);
    return;
  }
  const titleEl = document.getElementById('toastTitle');
  const bodyEl = document.getElementById('toastBody');
  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.textContent = message;

  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();
}

/* ==========================================================================
   9. Back to Top Button Listener
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('btnBackToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   10. Ghost Subscription Interactive Auditor
   ========================================================================== */
function initSubscriptionAuditor() {
  const checkboxes = document.querySelectorAll('.sub-audit-check');
  const annualEl = document.getElementById('subAuditAnnualCost');

  function calculateSubscriptionDrain() {
    let monthlyTotal = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) {
        monthlyTotal += parseFloat(cb.value) || 0;
      }
    });
    const annualTotal = monthlyTotal * 12;
    if (annualEl) {
      annualEl.textContent = `${formatMoney(annualTotal)} / yr`;
    }
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', calculateSubscriptionDrain);
  });

  window.addEventListener('currencyChanged', calculateSubscriptionDrain);
  calculateSubscriptionDrain();
}

// Global exposure
window.formatMoney = formatMoney;
window.showToastAlert = showToastAlert;

/* ==========================================================================
   11. Live Financial Tips & Quotes Ticker
   ========================================================================== */
let tickerInterval = null;
let currentTickerIdx = 0;
let isTickerPaused = false;
let tickerItems = [];

function initFinancialTicker() {
  const container = document.getElementById('financialTickerBar');
  if (!container) return;

  const defaultTips = [
    "💡 Tip: Track small $3–$5 daily expenses—they easily sum up to $1,500+ every school year!",
    "🐝 50-30-20 Rule: 50% for Needs, 30% for Wants, and 20% automated Savings cushion.",
    "🛡️ 48-Hour Protocol: Wait 2 full days before buying non-essential items to kill impulse urges.",
    "📱 Subscription Audit: Cancel recurring free trials before the 14-day grace period ends.",
    "🎓 Student Advantage: Use your academic email to unlock up to 60% discounts on software.",
    "💬 Quote: 'Do not save what is left after spending, but spend what is left after saving.' — Warren Buffett"
  ];

  if (BB_STATE.tipsData && BB_STATE.tipsData.tickerTips) {
    tickerItems = [...BB_STATE.tipsData.tickerTips];
    if (BB_STATE.tipsData.quotes && BB_STATE.tipsData.quotes.length > 0) {
      tickerItems.push(`💬 Quote: "${BB_STATE.tipsData.quotes[0].quote}" — ${BB_STATE.tipsData.quotes[0].author}`);
    }
  } else {
    tickerItems = defaultTips;
  }

  const contentSpan = document.getElementById('tickerContentSpan');
  const btnPrev = document.getElementById('btnTickerPrev');
  const btnNext = document.getElementById('btnTickerNext');
  const btnToggle = document.getElementById('btnTickerToggle');

  function renderTickerItem(idx) {
    if (!contentSpan) return;
    contentSpan.style.opacity = '0';
    setTimeout(() => {
      contentSpan.textContent = tickerItems[idx % tickerItems.length];
      contentSpan.style.opacity = '1';
    }, 150);
  }

  renderTickerItem(0);

  function nextTip() {
    currentTickerIdx = (currentTickerIdx + 1) % tickerItems.length;
    renderTickerItem(currentTickerIdx);
  }

  function prevTip() {
    currentTickerIdx = (currentTickerIdx - 1 + tickerItems.length) % tickerItems.length;
    renderTickerItem(currentTickerIdx);
  }

  if (btnNext) btnNext.addEventListener('click', nextTip);
  if (btnPrev) btnPrev.addEventListener('click', prevTip);

  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      isTickerPaused = !isTickerPaused;
      const icon = btnToggle.querySelector('i');
      if (isTickerPaused) {
        if (icon) icon.className = 'bi bi-play-fill';
        clearInterval(tickerInterval);
      } else {
        if (icon) icon.className = 'bi bi-pause-fill';
        tickerInterval = setInterval(nextTip, 4500);
      }
    });
  }

  clearInterval(tickerInterval);
  tickerInterval = setInterval(nextTip, 4500);
}

/* ==========================================================================
   12. Infographics & Learning Gallery
   ========================================================================== */
const DEFAULT_INFOGRAPHICS = [
  {
    id: "info-1",
    title: "The Golden 50-30-20 Student Split",
    category: "budgeting",
    badge: "Core Framework",
    caption: "How to structure an allowance or starter salary into Needs (50%), Wants (30%), and Savings (20%).",
    altText: "Donut graphic dividing 50% for essentials, 30% for entertainment, and 20% for rainy day savings.",
    image: "assets/images/info-50-30-20.svg",
    keyTakeaways: [
      "50% covers shelter, groceries, transit, and course texts",
      "30% preserves happiness and social life without guilt",
      "20% guarantees financial security and emergency preparedness"
    ]
  },
  {
    id: "info-2",
    title: "Needs vs. Wants Decision Tree",
    category: "habits",
    badge: "Mindset Tool",
    caption: "A 4-step flowchart to pause and evaluate impulse purchases before swiping your card.",
    altText: "Flowchart diagram evaluating: Can I live without it? Do I already own something similar?",
    image: "assets/images/info-needs-wants.svg",
    keyTakeaways: [
      "Step 1: Is this essential for safety, health, or education?",
      "Step 2: Can I postpone this by 48 hours?",
      "Step 3: If bought, will it cause stress before month-end?",
      "Step 4: Only buy if planned in the 30% wants bucket"
    ]
  },
  {
    id: "info-3",
    title: "The Student Monthly Budget Flow",
    category: "budgeting",
    badge: "Cashflow Guide",
    caption: "Visual path of student cashflow from allowance deposit to bills, daily essentials, and savings vault.",
    altText: "Cash flow diagram tracing allowance income to fixed bills, variable envelopes, and savings.",
    image: "assets/images/info-budget-flow.svg",
    keyTakeaways: [
      "Direct deposit allowance on Day 1",
      "Automate 15-20% straight into separate savings account",
      "Pay fixed hostel rent and utility commitments",
      "Divide remainder into weekly variable cash envelopes"
    ]
  },
  {
    id: "info-4",
    title: "The 30-Day College Money Saving Challenge",
    category: "saving",
    badge: "Action Plan",
    caption: "30 actionable daily micro-challenges to save over $200 in a single month on campus.",
    altText: "Grid calendar showing 30 daily frugal micro-actions.",
    image: "assets/images/info-challenge.svg",
    keyTakeaways: [
      "Week 1: Audit digital subscriptions and eliminate ghost apps",
      "Week 2: Meal-prep 4 days and host dorm movie nights",
      "Week 3: Swap books with peers and use campus student discounts",
      "Week 4: Zero-spend weekend challenge"
    ]
  },
  {
    id: "info-5",
    title: "The Latte Factor Micro-Spend Reality",
    category: "habits",
    badge: "Spending Trap",
    caption: "Visualizing how a daily $4.50 specialty drink adds up to over $1,600 per school year.",
    altText: "Bar chart comparing 1 cup of gourmet coffee over days, months, and 4 college years totaling $6,400.",
    image: "assets/images/info-latte-factor.svg",
    keyTakeaways: [
      "1 Day: $4.50 (seems negligible)",
      "1 Month: $135.00 (covers half a month of groceries)",
      "1 Year: $1,620.00 (covers a high-end laptop or summer trip)",
      "4 College Years: $6,480.00 (life-changing seed fund)"
    ]
  }
];

let activeInfographics = [...DEFAULT_INFOGRAPHICS];

function initInfographicsGallery() {
  const container = document.getElementById('infographicsGrid');
  if (!container) return;

  renderInfographics(activeInfographics);

  // Filter Buttons
  const filterBtns = document.querySelectorAll('#infographicFilterTabs .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';
      if (filter === 'all') {
        renderInfographics(activeInfographics, 'all');
      } else {
        const filtered = activeInfographics.filter(x => x.category === filter);
        renderInfographics(filtered, filter);
      }
    });
  });
}

function renderInfographics(list, explicitFilter) {
  const container = document.getElementById('infographicsGrid');
  if (!container) return;

  const currentFilter = explicitFilter || (document.querySelector('#infographicFilterTabs .filter-btn.active')?.getAttribute('data-filter')) || 'all';
  const displayList = (currentFilter !== 'all' && list === activeInfographics)
    ? activeInfographics.filter(x => x.category === currentFilter)
    : list;

  const imageMap = {
    'info-1': 'assets/images/info-50-30-20.svg',
    'info-2': 'assets/images/info-needs-wants.svg',
    'info-3': 'assets/images/info-budget-flow.svg',
    'info-4': 'assets/images/info-challenge.svg',
    'info-5': 'assets/images/info-latte-factor.svg'
  };

  if (!displayList || displayList.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <p class="text-muted small">No infographics found for this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = displayList.map(item => {
    const imgSrc = item.image || imageMap[item.id] || 'assets/images/info-50-30-20.svg';
    const takeawaysHtml = (item.keyTakeaways || []).slice(0, 2).map(t => `
      <div class="infographic-takeaway-item">
        <i class="bi bi-check-circle-fill"></i>
        <span>${t}</span>
      </div>
    `).join('');

    return `
      <div class="col-md-6 col-lg-4">
        <div class="infographic-card h-100">
          <div class="infographic-preview-wrap" style="cursor: pointer;" onclick="openInfographicModal('${item.id}')">
            <img src="${imgSrc}" alt="${item.altText || item.title}" class="infographic-img" loading="lazy">
          </div>
          <div class="infographic-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-primary-subtle text-primary small">${item.badge || 'Framework'}</span>
              <span class="small text-muted text-uppercase" style="font-size: 0.72rem;">${item.category}</span>
            </div>
            <h5 class="fw-bold mb-2 fs-6">${item.title}</h5>
            <p class="small text-muted mb-3 flex-grow-1">${item.caption}</p>
            <div class="mb-3">${takeawaysHtml}</div>
            <button class="btn btn-sm btn-outline-soft w-100 rounded-pill" onclick="openInfographicModal('${item.id}')">
              <i class="bi bi-arrows-fullscreen me-1"></i> View Full Graphic
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openInfographicModal = function(id) {
  const item = activeInfographics.find(x => x.id === id) || DEFAULT_INFOGRAPHICS.find(x => x.id === id);
  if (!item) return;

  const imageMap = {
    'info-1': 'assets/images/info-50-30-20.svg',
    'info-2': 'assets/images/info-needs-wants.svg',
    'info-3': 'assets/images/info-budget-flow.svg',
    'info-4': 'assets/images/info-challenge.svg',
    'info-5': 'assets/images/info-latte-factor.svg'
  };

  const modalEl = document.getElementById('infographicModal');
  if (!modalEl) return;

  document.getElementById('infoModalTitle').textContent = item.title;
  document.getElementById('infoModalBadge').textContent = item.badge || item.category;
  document.getElementById('infoModalCaption').textContent = item.caption;

  const modalImg = document.getElementById('infoModalImg');
  if (modalImg) {
    modalImg.src = item.image || imageMap[item.id] || 'assets/images/info-50-30-20.svg';
    modalImg.alt = item.altText || item.title;
  }

  const takeawaysContainer = document.getElementById('infoModalTakeaways');
  if (takeawaysContainer && item.keyTakeaways) {
    takeawaysContainer.innerHTML = item.keyTakeaways.map(t => `
      <li class="d-flex align-items-start gap-2">
        <i class="bi bi-arrow-right-circle-fill text-warning mt-1"></i>
        <span>${t}</span>
      </li>
    `).join('');
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

/* ==========================================================================
   13. Interactive 5-Step Guided Tour Engine
   ========================================================================= */
const TOUR_STEPS = [
  {
    targetId: 'mainNavbar',
    title: 'Welcome to BudgetBasics!',
    content: 'BudgetBasics is an educational student finance Single Page Application built for Techwiz 7 by Team Tech Hunters (Aptech Rahim Yar Khan Center). Switch currencies and themes seamlessly.',
    placement: 'bottom'
  },
  {
    targetId: 'budgeting-basics',
    title: 'Module 1: Budgeting Basics',
    content: 'Master Income, Fixed Expenses, and Variable Outflows with crisp concept cards, student samples, and an interactive Knowledge Check quiz.',
    placement: 'top'
  },
  {
    targetId: 'calculator-50-30-20',
    title: 'Module 3: 50-30-20 Calculator',
    content: 'Enter your monthly allowance to calculate the suggested 50% Needs, 30% Wants, and 20% Savings split with a real-time Chart.js Donut chart and weekly spending caps.',
    placement: 'top'
  },
  {
    targetId: 'savings-goals',
    title: 'Module 4: Savings Goals Simulator',
    content: 'Set targets for emergency cushions or laptop replacements. Calculate completion dates and click "Print Roadmap" to get a certified physical milestone plan.',
    placement: 'top'
  },
  {
    targetId: 'expense-planner',
    title: 'Module 5: Student Expense Planner',
    content: 'Log and categorize daily campus spending on transit, food, and utilities with live budget health status and printable audit statements.',
    placement: 'top'
  },
  {
    targetId: 'infographics-gallery',
    title: 'Module 7: Infographics Gallery',
    content: 'Filter visual guides on cash flow, the latte factor micro-spending trap, and 30-day savings challenges to build long-term discipline.',
    placement: 'top'
  },
  {
    targetId: 'btnOpenVoiceStudioNav',
    title: 'NextGen BudgetBee Voice AI Studio',
    content: 'Speak commands like "Calculate budget of 1500" or "Set laptop goal for 800". Our voice engine controls the UI in real time with Speech-to-Text and Speech Synthesis!',
    placement: 'bottom'
  }
];

let currentTourStep = 0;

function positionTourPopover(targetEl, card) {
  if (!card) return;
  const cardWidth = 360;
  const cardHeight = card.offsetHeight || 220;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    let top;

    // Smart vertical positioning:
    // If target height exceeds 55% of viewport height (like full section on Step 2),
    // dock the popover card at the bottom center of the viewport so it is 100% visible!
    if (rect.height > vh * 0.55) {
      top = vh - cardHeight - 24;
    } else if (rect.bottom + cardHeight + 20 <= vh) {
      top = rect.bottom + 16;
    } else if (rect.top - cardHeight - 20 >= 75) {
      top = rect.top - cardHeight - 16;
    } else {
      top = vh - cardHeight - 24;
    }

    let left = rect.left + (rect.width / 2) - (cardWidth / 2);
    left = Math.max(16, Math.min(vw - cardWidth - 16, left));
    top = Math.max(75, Math.min(vh - cardHeight - 16, top));

    card.style.top = `${top}px`;
    card.style.left = `${left}px`;
  } else {
    card.style.top = `${Math.max(80, (vh - cardHeight) / 2)}px`;
    card.style.left = `${Math.max(16, (vw - cardWidth) / 2)}px`;
  }
}

function handleTourReposition() {
  const overlay = document.getElementById('guidedTourOverlay');
  const card = document.getElementById('tourPopoverCard');
  if (!overlay || !overlay.classList.contains('active') || !card) return;
  const step = TOUR_STEPS[currentTourStep];
  if (step) {
    let targetEl = document.getElementById(step.targetId);
    if (step.targetId === 'btnOpenVoiceStudioNav' && (window.innerWidth < 992 || !targetEl || targetEl.offsetParent === null)) {
      targetEl = document.getElementById('btnMobileVoiceTrigger') || 
                 document.getElementById('floatingChatLauncher');
    }
    positionTourPopover(targetEl, card);
  }
}

function initGuidedTour() {
  const btnStartNav = document.getElementById('btnStartTourNav');
  const btnNext = document.getElementById('btnTourNext');
  const btnPrev = document.getElementById('btnTourPrev');
  const btnSkip = document.getElementById('btnTourSkip');

  if (btnStartNav) {
    btnStartNav.addEventListener('click', () => {
      startGuidedTour();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentTourStep < TOUR_STEPS.length - 1) {
        currentTourStep++;
        renderTourStep(currentTourStep);
      } else {
        finishGuidedTour();
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentTourStep > 0) {
        currentTourStep--;
        renderTourStep(currentTourStep);
      }
    });
  }

  if (btnSkip) {
    btnSkip.addEventListener('click', finishGuidedTour);
  }

  // Trigger tour on first visit if never completed
  if (!localStorage.getItem('bb_tour_completed')) {
    setTimeout(() => {
      if (!document.body.classList.contains('preloader-active')) {
        startGuidedTour();
      }
    }, 2800);
  }
}

function startGuidedTour() {
  currentTourStep = 0;
  const overlay = document.getElementById('guidedTourOverlay');
  const card = document.getElementById('tourPopoverCard');
  if (overlay) overlay.classList.add('active');
  if (card) card.classList.add('active');
  window.addEventListener('resize', handleTourReposition);
  window.addEventListener('scroll', handleTourReposition, { passive: true });
  renderTourStep(0);
}

function renderTourStep(stepIdx) {
  const step = TOUR_STEPS[stepIdx];
  if (!step) return;

  // Clear previous target highlight and elevated navbar
  document.querySelectorAll('.tour-highlight-target').forEach(el => el.classList.remove('tour-highlight-target'));
  const navbarEl = document.getElementById('mainNavbar');
  if (navbarEl) navbarEl.classList.remove('tour-elevate-navbar');

  let targetEl = document.getElementById(step.targetId);
  // On mobile/tablet screens where desktop navbar button is hidden, fallback to mobile header mic button or floating launcher
  if (step.targetId === 'btnOpenVoiceStudioNav') {
    if (window.innerWidth < 992 || !targetEl || targetEl.offsetParent === null) {
      targetEl = document.getElementById('btnMobileVoiceTrigger') || 
                 document.getElementById('floatingChatLauncher');
    }
  }

  // If target element is inside mainNavbar or is mainNavbar, elevate mainNavbar z-index!
  if (targetEl && (targetEl.id === 'mainNavbar' || targetEl.closest('#mainNavbar'))) {
    if (navbarEl) navbarEl.classList.add('tour-elevate-navbar');
  }

  const card = document.getElementById('tourPopoverCard');
  const stepBadge = document.getElementById('tourStepBadge');
  const stepTitle = document.getElementById('tourStepTitle');
  const stepContent = document.getElementById('tourStepContent');
  const btnPrev = document.getElementById('btnTourPrev');
  const btnNext = document.getElementById('btnTourNext');

  if (stepBadge) stepBadge.textContent = `Step ${stepIdx + 1} of ${TOUR_STEPS.length}`;
  if (stepTitle) stepTitle.textContent = step.title;
  if (stepContent) stepContent.textContent = step.content;

  if (btnPrev) {
    btnPrev.style.visibility = stepIdx === 0 ? 'hidden' : 'visible';
  }
  if (btnNext) {
    btnNext.innerHTML = stepIdx === TOUR_STEPS.length - 1 ? 'Finish 🎉' : 'Next <i class="bi bi-chevron-right ms-1"></i>';
  }

  if (targetEl) {
    targetEl.classList.add('tour-highlight-target');
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    positionTourPopover(targetEl, card);
    // Re-verify position after smooth scroll completes so popover is always 100% visible
    setTimeout(() => positionTourPopover(targetEl, card), 350);
    setTimeout(() => positionTourPopover(targetEl, card), 650);
  } else if (card) {
    positionTourPopover(null, card);
  }
}

function finishGuidedTour() {
  const overlay = document.getElementById('guidedTourOverlay');
  const card = document.getElementById('tourPopoverCard');
  if (overlay) overlay.classList.remove('active');
  if (card) card.classList.remove('active');
  window.removeEventListener('resize', handleTourReposition);
  window.removeEventListener('scroll', handleTourReposition);
  document.querySelectorAll('.tour-highlight-target').forEach(el => el.classList.remove('tour-highlight-target'));
  const navbarEl = document.getElementById('mainNavbar');
  if (navbarEl) navbarEl.classList.remove('tour-elevate-navbar');
  localStorage.setItem('bb_tour_completed', 'true');
  showToastAlert('Tour Completed!', 'You are ready to master your personal student finances with BudgetBasics!');
}

/* ==========================================================================
   14. Universal Modular Printing Engine
   ========================================================================= */
function initModularPrinting() {
  // 1. Budget 50-30-20 Statement Print Button
  const btnPrintBudget = document.getElementById('btnPrintBudget503020');
  if (btnPrintBudget) {
    btnPrintBudget.addEventListener('click', (e) => {
      e.preventDefault();
      const incomeInput = document.getElementById('calcIncomeInput');
      const rawIncome = incomeInput ? parseFloat(incomeInput.value) || 1200 : 1200;
      
      const ratioSelect = document.getElementById('budgetSplitRatioSelect');
      let ratioVal = ratioSelect ? ratioSelect.value : '50-30-20';
      let pNeeds = 0.50, pWants = 0.30, pSavings = 0.20;
      let ratioText = "50% Needs / 30% Wants / 20% Savings";

      if (ratioVal === '60-25-15') {
        pNeeds = 0.60; pWants = 0.25; pSavings = 0.15;
        ratioText = "60% Needs / 25% Wants / 15% Savings";
      } else if (ratioVal === '70-20-10') {
        pNeeds = 0.70; pWants = 0.20; pSavings = 0.10;
        ratioText = "70% Needs / 20% Wants / 10% Savings";
      }

      const needsAmt = rawIncome * pNeeds;
      const wantsAmt = rawIncome * pWants;
      const savingsAmt = rawIncome * pSavings;

      const wkNeeds = needsAmt / 4.33;
      const wkWants = wantsAmt / 4.33;
      const wkSavings = savingsAmt / 4.33;

      const dyNeeds = needsAmt / 30.4375;
      const dyWants = wantsAmt / 30.4375;
      const dySavings = savingsAmt / 30.4375;

      const dateStr = new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

      const setText = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
      };

      setText('printBudgetDate', dateStr);
      setText('printBudgetDocId', `BB-STMT-503020-${Date.now().toString().slice(-6)}`);
      setText('printBudgetIncome', formatMoney(rawIncome));
      setText('printBudgetRatio', ratioText);

      setText('printNeedsVal', formatMoney(needsAmt));
      setText('printWantsVal', formatMoney(wantsAmt));
      setText('printSavingsVal', formatMoney(savingsAmt));

      setText('printNeedsValTable', formatMoney(needsAmt));
      setText('printWantsValTable', formatMoney(wantsAmt));
      setText('printSavingsValTable', formatMoney(savingsAmt));

      setText('printNeedsWeekly', `~${formatMoney(wkNeeds)} / week`);
      setText('printWantsWeekly', `~${formatMoney(wkWants)} / week`);
      setText('printSavingsWeekly', `~${formatMoney(wkSavings)} / week`);

      setText('printNeedsWeeklyTable', `~${formatMoney(wkNeeds)} / wk`);
      setText('printWantsWeeklyTable', `~${formatMoney(wkWants)} / wk`);
      setText('printSavingsWeeklyTable', `~${formatMoney(wkSavings)} / wk`);

      setText('printNeedsDaily', `~${formatMoney(dyNeeds)} / day`);
      setText('printWantsDaily', `~${formatMoney(dyWants)} / day`);
      setText('printSavingsDaily', `~${formatMoney(dySavings)} / day`);

      printModularDocument('budget', 'printableBudgetSheet');
    });
  }

  // 2. Savings Goal Roadmap Certificate Print Button
  const btnPrintGoal = document.getElementById('btnPrintSavingsGoal');
  if (btnPrintGoal) {
    btnPrintGoal.addEventListener('click', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('goalNameInput');
      const targetInput = document.getElementById('goalTargetInput');
      const currentInput = document.getElementById('goalCurrentInput');
      const monthlyInput = document.getElementById('goalMonthlyInput');

      const gName = nameInput ? nameInput.value.trim() || 'Emergency Safety Fund' : 'Emergency Safety Fund';
      const gTarget = targetInput ? parseFloat(targetInput.value) || 500 : 500;
      const gCurrent = currentInput ? parseFloat(currentInput.value) || 0 : 0;
      const gMonthly = monthlyInput ? parseFloat(monthlyInput.value) || 70 : 70;

      const remaining = Math.max(0, gTarget - gCurrent);
      const percentage = Math.min(100, Math.round((gCurrent / gTarget) * 100));

      const timelineText = document.getElementById('goalMonthsDisplay')?.textContent || '5 Months';
      const breakdownText = document.getElementById('goalTimelineBreakdown')?.textContent || '~22 Weeks • ~152 Days';
      const dateEstText = document.getElementById('goalDateEstimate')?.textContent || 'Estimated Target: February 2027';
      const dateStr = new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

      const setText = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
      };

      setText('printCertDate', dateStr);
      setText('printCertSerial', `CERT-BB-GOAL-${Date.now().toString().slice(-6)}`);
      setText('printGoalName', gName);
      setText('printGoalTarget', formatMoney(gTarget));
      setText('printGoalCurrent', formatMoney(gCurrent));
      setText('printGoalRemaining', formatMoney(remaining));
      setText('printGoalMonthly', formatMoney(gMonthly));
      setText('printGoalTimeline', timelineText);
      setText('printGoalBreakdown', breakdownText);
      setText('printGoalDate', dateEstText);
      setText('printGoalPercent', `${percentage}% Complete`);

      const bar = document.getElementById('printGoalBar');
      if (bar) bar.style.width = `${percentage}%`;

      printModularDocument('goal', 'printableGoalRoadmap');
    });
  }

  // 3. Expense Planner Session Statement Print Button
  const btnPrintExp = document.getElementById('btnPrintExpenseLog');
  if (btnPrintExp) {
    btnPrintExp.addEventListener('click', (e) => {
      e.preventDefault();
      const budget = document.getElementById('plannerAllowanceInput')?.value || '1200';
      const spent = document.getElementById('plannerTotalSpentDisplay')?.textContent || '$0.00';
      const rem = document.getElementById('plannerRemainingDisplay')?.textContent || '$1,200.00';

      document.getElementById('printExpBudget').textContent = formatMoney(budget);
      document.getElementById('printExpSpent').textContent = spent;
      document.getElementById('printExpRemaining').textContent = rem;

      const tbodySource = document.getElementById('expenseTableBody');
      const tbodyTarget = document.getElementById('printExpTableBody');
      if (tbodySource && tbodyTarget) {
        tbodyTarget.innerHTML = '';
        const rows = tbodySource.querySelectorAll('tr');
        rows.forEach(r => {
          const cells = r.querySelectorAll('td');
          if (cells.length >= 4) {
            tbodyTarget.innerHTML += `
              <tr>
                <td>${cells[0].textContent}</td>
                <td>${cells[1].textContent}</td>
                <td>${cells[2].textContent}</td>
                <td class="text-end fw-bold">${cells[3].textContent}</td>
              </tr>
            `;
          }
        });
      }

      printModularDocument('planner', 'printableExpenseStatement');
    });
  }
}

function printModularDocument(mode, elementId) {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  document.body.setAttribute('data-print-mode', mode);
  el.classList.remove('d-none');

  // Let browser layout engine compute print geometry cleanly before opening dialog
  setTimeout(() => {
    window.print();
  }, 120);

  const cleanup = () => {
    document.body.removeAttribute('data-print-mode');
    el.classList.add('d-none');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup, { once: true });
  setTimeout(cleanup, 6000); // 6-second fallback to prevent premature restoration
}

window.printModularDocument = printModularDocument;
window.renderInfographics = renderInfographics;
window.initFinancialTicker = initFinancialTicker;

/* ==========================================================================
   15. Navbar Sticky Scroll State Manager
   ========================================================================== */
function initNavbarScrollState() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;
  
  const handleScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   15.1 Mobile Navbar Auto-Close on Item Navigation Click
   ========================================================================== */
function initMobileNavbarAutoClose() {
  const navbarCollapse = document.getElementById('navbarContent');
  if (!navbarCollapse) return;

  // Listen to all navigable links (nav-links that are not dropdown toggles, all dropdown-items, and action buttons)
  const navTargets = navbarCollapse.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item, .navbar-actions-wrap a, .navbar-actions-wrap button');

  navTargets.forEach(el => {
    el.addEventListener('click', () => {
      // If clicking inside dropdown-toggle itself, let bootstrap toggle dropdown
      if (el.classList.contains('dropdown-toggle')) return;

      // Close mobile collapse if open on small/tablet screens (< 1200px)
      if (window.innerWidth < 1200 && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse, { toggle: false });
        bsCollapse.hide();
      }
    });
  });
}

/* ==========================================================================
   16. Interactive Bee Cursor Follower
   ========================================================================== */
function initCursorBeeFollower() {
  const follower = document.getElementById('cursorBeeFollower');
  // Skip on touch screens or devices without fine cursor pointing
  if (!follower || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mouseX = -100, mouseY = -100;
  let beeX = -100, beeY = -100;
  let currentAngle = 0;
  let isBeeRunning = false;

  function animateBee() {
    const dx = mouseX - beeX;
    const dy = mouseY - beeY;
    const dist = Math.hypot(dx, dy);

    // If mouse has stopped moving and bee has caught up, sleep to conserve CPU/GPU
    if (dist < 0.8) {
      isBeeRunning = false;
      return;
    }

    // Spring lerp
    beeX += dx * 0.14;
    beeY += dy * 0.14;

    if (dist > 1.2) {
      const targetAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
      let diff = (targetAngle - currentAngle) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      currentAngle += diff * 0.18;
    }

    follower.style.transform = `translate3d(${beeX - 22}px, ${beeY - 22}px, 0) rotate(${currentAngle}deg)`;
    requestAnimationFrame(animateBee);
  }

  function wakeBee() {
    if (!isBeeRunning) {
      isBeeRunning = true;
      requestAnimationFrame(animateBee);
    }
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!follower.classList.contains('active')) {
      follower.classList.add('active');
      beeX = mouseX;
      beeY = mouseY;
    }
    wakeBee();
  }, { passive: true });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .calc-card, .btn-primary-gradient, .clickable, .team-card, .infographic-card')) {
      follower.classList.add('hovering');
    } else {
      follower.classList.remove('hovering');
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    follower.classList.remove('active');
  });
}

/* ==========================================================================
   17. Scroll Reveal Observer (Ahead-of-Viewport Activation)
   ========================================================================== */
function initScrollReveal() {
  if (typeof IntersectionObserver === 'undefined') return;

  // Reveal interactive cards ahead of the viewport; sections remain permanently visible
  const targets = document.querySelectorAll('.calc-card, .concept-card, .team-card, .infographic-card, .interactive-quiz-card');
  targets.forEach(el => el.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');

        // Trigger Chart.js donut animation if present
        if (entry.target.querySelector('#budgetDonutChart') && window.budgetChartInstance) {
          window.budgetChartInstance.render();
        }

        // Unobserve immediately once revealed to eliminate scroll overhead
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '120px 0px 50px 0px' });

  targets.forEach(el => observer.observe(el));
}


