/**
 * BudgetBasics - NextGen BudgetBee
 * Financial Calculators: 50-30-20 Rule & Savings Goals Simulator
 * Techwiz 7 - Category 1 (Web Innovation Unleashed)
 */

let budgetChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  init503020Calculator();
  initSavingsGoalSimulator();

  // Listen to currency changes to refresh labels
  window.addEventListener('currencyChanged', () => {
    recalculate503020();
    recalculateSavingsGoal();
  });

  // Listen to theme mutations to update chart borders seamlessly in dark mode
  if (typeof MutationObserver !== 'undefined') {
    const themeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme' || m.attributeName === 'data-bs-theme') {
          if (typeof updateBudgetChartTheme === 'function') {
            updateBudgetChartTheme();
          }
        }
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true });
  }
});

/* ==========================================================================
   1. 50-30-20 Interactive Budget Module (SRS Requirement 3)
   ========================================================================== */
function init503020Calculator() {
  const incomeInput = document.getElementById('calcIncomeInput');
  const btnCalculate = document.getElementById('btnCalculate503020');
  const customSplitToggle = document.getElementById('toggleCustomSplit');
  const splitRatioSelect = document.getElementById('budgetSplitRatioSelect');

  if (incomeInput) {
    incomeInput.addEventListener('input', () => {
      clearCalcErrors();
      recalculate503020();
    });
  }

  if (splitRatioSelect) {
    splitRatioSelect.addEventListener('change', () => {
      recalculate503020();
    });
  }

  if (btnCalculate) {
    btnCalculate.addEventListener('click', (e) => {
      e.preventDefault();
      recalculate503020();
    });
  }

  // Pre-seed default run
  recalculate503020();
}

function clearCalcErrors() {
  const errorBox = document.getElementById('calcErrorAlert');
  if (errorBox) errorBox.classList.add('d-none');
}

function showCalcError(msg) {
  const errorBox = document.getElementById('calcErrorAlert');
  if (errorBox) {
    errorBox.textContent = msg;
    errorBox.classList.remove('d-none');
  }
}

function recalculate503020() {
  const incomeInput = document.getElementById('calcIncomeInput');
  if (!incomeInput) return;

  const rawVal = incomeInput.value.trim();
  const income = parseFloat(rawVal);

  if (isNaN(income) || income <= 0) {
    if (rawVal !== '') {
      showCalcError('Please enter a valid, positive monthly income or allowance figure.');
    }
    return;
  }
  clearCalcErrors();

  // Check split ratio
  const ratioSelect = document.getElementById('budgetSplitRatioSelect');
  let ratio = ratioSelect ? ratioSelect.value : '50-30-20';
  let pNeeds = 0.50, pWants = 0.30, pSavings = 0.20;

  if (ratio === '60-25-15') {
    pNeeds = 0.60; pWants = 0.25; pSavings = 0.15;
  } else if (ratio === '70-20-10') {
    pNeeds = 0.70; pWants = 0.20; pSavings = 0.10;
  }

  const needsAmount = income * pNeeds;
  const wantsAmount = income * pWants;
  const savingsAmount = income * pSavings;

  // Weekly breakdown
  const weeklyNeeds = needsAmount / 4.33;
  const weeklyWants = wantsAmount / 4.33;
  const weeklySavings = savingsAmount / 4.33;

  // Update DOM labels
  const needsLabel = document.getElementById('resultNeedsAmount');
  const wantsLabel = document.getElementById('resultWantsAmount');
  const savingsLabel = document.getElementById('resultSavingsAmount');

  if (needsLabel) needsLabel.textContent = formatMoney(needsAmount);
  if (wantsLabel) wantsLabel.textContent = formatMoney(wantsAmount);
  if (savingsLabel) savingsLabel.textContent = formatMoney(savingsAmount);

  // Update Weekly helper labels
  const wkNeeds = document.getElementById('weeklyNeedsAmount');
  const wkWants = document.getElementById('weeklyWantsAmount');
  const wkSavings = document.getElementById('weeklySavingsAmount');
  if (wkNeeds) wkNeeds.textContent = `~ ${formatMoney(weeklyNeeds)} / week`;
  if (wkWants) wkWants.textContent = `~ ${formatMoney(weeklyWants)} / week`;
  if (wkSavings) wkSavings.textContent = `~ ${formatMoney(weeklySavings)} / week`;

  // Update Progress Bars
  const pBarNeeds = document.getElementById('calcBarNeeds');
  const pBarWants = document.getElementById('calcBarWants');
  const pBarSavings = document.getElementById('calcBarSavings');
  if (pBarNeeds) pBarNeeds.style.width = `${Math.round(pNeeds * 100)}%`;
  if (pBarWants) pBarWants.style.width = `${Math.round(pWants * 100)}%`;
  if (pBarSavings) pBarSavings.style.width = `${Math.round(pSavings * 100)}%`;

  // Render/Update Chart.js Donut
  renderBudgetChart(needsAmount, wantsAmount, savingsAmount, [
    `Needs (${Math.round(pNeeds * 100)}%)`,
    `Wants (${Math.round(pWants * 100)}%)`,
    `Savings (${Math.round(pSavings * 100)}%)`
  ]);
}

function getChartThemeColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    borderColor: isDark ? '#152030' : '#FFFFFF',
    legendTextColor: isDark ? '#CBD5E1' : '#475569',
    tooltipBg: isDark ? '#1E293B' : '#0F172A',
    tooltipBorder: isDark ? '#334155' : 'transparent',
    isDark
  };
}

function updateBudgetChartTheme() {
  if (!budgetChartInstance) return;
  const theme = getChartThemeColors();
  budgetChartInstance.data.datasets[0].borderColor = theme.borderColor;
  if (budgetChartInstance.options.plugins && budgetChartInstance.options.plugins.legend) {
    budgetChartInstance.options.plugins.legend.labels.color = theme.legendTextColor;
  }
  if (budgetChartInstance.options.plugins && budgetChartInstance.options.plugins.tooltip) {
    budgetChartInstance.options.plugins.tooltip.backgroundColor = theme.tooltipBg;
    budgetChartInstance.options.plugins.tooltip.borderColor = theme.tooltipBorder;
    budgetChartInstance.options.plugins.tooltip.borderWidth = theme.isDark ? 1 : 0;
  }
  budgetChartInstance.update();
}
window.updateBudgetChartTheme = updateBudgetChartTheme;

function renderBudgetChart(needs, wants, savings, labels) {
  const canvas = document.getElementById('budgetDonutChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const theme = getChartThemeColors();

  if (budgetChartInstance) {
    budgetChartInstance.data.datasets[0].data = [needs, wants, savings];
    budgetChartInstance.data.labels = labels;
    budgetChartInstance.data.datasets[0].borderColor = theme.borderColor;
    if (budgetChartInstance.options.plugins && budgetChartInstance.options.plugins.legend) {
      budgetChartInstance.options.plugins.legend.labels.color = theme.legendTextColor;
    }
    budgetChartInstance.update();
    return;
  }

  budgetChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: [needs, wants, savings],
        backgroundColor: ['#3B82F6', '#FF5B22', '#10B981'],
        borderWidth: 3,
        borderColor: theme.borderColor,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: theme.legendTextColor,
            font: { family: 'Plus Jakarta Sans', weight: '600', size: 12 },
            padding: 18
          }
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          borderColor: theme.tooltipBorder,
          borderWidth: theme.isDark ? 1 : 0,
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          callbacks: {
            label: function(context) {
              return ` ${context.label}: ${formatMoney(context.raw)}`;
            }
          }
        }
      },
      cutout: '72%',
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
}

/* ==========================================================================
   2. Savings Goals Simulator (SRS Requirement 4)
   ========================================================================== */
const SAVINGS_TIPS_LIBRARY = [
  "🚀 Great pace! Automating transfers on the day your allowance arrives guarantees steady progress.",
  "💡 Skipping one takeout coffee a week frees up an extra $20/month for this goal!",
  "🛡️ Keep this goal in a designated high-yield student account so you aren't tempted to spend it.",
  "🎯 Celebrate reaching 50% milestone with a free study treat with friends!",
  "🐝 'Small daily drops fill the honey hive.' Consistency beats sporadic large deposits."
];

function initSavingsGoalSimulator() {
  const nameInput = document.getElementById('goalNameInput');
  const targetInput = document.getElementById('goalTargetInput');
  const currentInput = document.getElementById('goalCurrentInput');
  const monthlyInput = document.getElementById('goalMonthlyInput');
  const btnCalculate = document.getElementById('btnCalculateGoal');
  const btnSaveGoal = document.getElementById('btnSaveGoal');

  const inputs = [targetInput, currentInput, monthlyInput];
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', recalculateSavingsGoal);
    }
  });

  if (btnCalculate) {
    btnCalculate.addEventListener('click', (e) => {
      e.preventDefault();
      recalculateSavingsGoal();
    });
  }

  if (btnSaveGoal) {
    btnSaveGoal.addEventListener('click', saveGoalToHistory);
  }

  // Preset buttons
  document.querySelectorAll('.btn-goal-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const gName = btn.getAttribute('data-goal-name');
      const gTarget = btn.getAttribute('data-goal-target');
      const gCurrent = btn.getAttribute('data-goal-current');
      const gMonthly = btn.getAttribute('data-goal-monthly');

      if (nameInput) nameInput.value = gName;
      if (targetInput) targetInput.value = gTarget;
      if (currentInput) currentInput.value = gCurrent;
      if (monthlyInput) monthlyInput.value = gMonthly;

      recalculateSavingsGoal();
    });
  });

  // Initial calculation
  recalculateSavingsGoal();
  renderSavedGoalsList();
}

function recalculateSavingsGoal() {
  const targetInput = document.getElementById('goalTargetInput');
  const currentInput = document.getElementById('goalCurrentInput');
  const monthlyInput = document.getElementById('goalMonthlyInput');
  const errorBox = document.getElementById('goalErrorAlert');

  if (!targetInput || !currentInput || !monthlyInput) return;

  const target = parseFloat(targetInput.value);
  const current = parseFloat(currentInput.value) || 0;
  const monthly = parseFloat(monthlyInput.value);

  if (isNaN(target) || target <= 0) {
    if (errorBox) {
      errorBox.textContent = 'Please enter a valid target goal amount (greater than zero).';
      errorBox.classList.remove('d-none');
    }
    return;
  }

  if (isNaN(monthly) || monthly <= 0) {
    if (errorBox) {
      errorBox.textContent = 'Please specify how much you can contribute per month.';
      errorBox.classList.remove('d-none');
    }
    return;
  }

  if (current < 0) {
    if (errorBox) {
      errorBox.textContent = 'Current savings cannot be negative.';
      errorBox.classList.remove('d-none');
    }
    return;
  }

  if (errorBox) errorBox.classList.add('d-none');

  // Calculations
  const remaining = Math.max(0, target - current);
  const percentage = Math.min(100, Math.round((current / target) * 100));

  let primaryTimeline = '';
  let breakdownTimeline = '';
  let dateEstimateText = '';
  let totalMonths = 0;

  if (remaining <= 0) {
    primaryTimeline = 'Goal Achieved! 🎉';
    breakdownTimeline = 'Target 100% Funded • 0 Days Needed';
    dateEstimateText = 'Ready today!';
  } else {
    const rawMonths = remaining / monthly;
    const totalDays = Math.max(1, Math.round(rawMonths * 30.4375));
    const totalWeeks = Math.max(1, Math.round(totalDays / 7));
    totalMonths = Math.max(1, Math.ceil(rawMonths));

    // Target Date Estimator
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + totalDays);

    const dateFormatted = targetDate.toLocaleDateString([], {
      month: 'long',
      year: 'numeric'
    });

    if (rawMonths >= 12) {
      // Greater than or equal to 12 months: express in Years and Months
      let years = Math.floor(rawMonths / 12);
      let remMonths = Math.round(rawMonths % 12);
      if (remMonths === 12) {
        years += 1;
        remMonths = 0;
      }

      if (years > 0 && remMonths > 0) {
        primaryTimeline = `${years} Year${years > 1 ? 's' : ''} ${remMonths} Month${remMonths > 1 ? 's' : ''}`;
      } else {
        primaryTimeline = `${years} Year${years > 1 ? 's' : ''}`;
      }
      breakdownTimeline = `${totalMonths} Months • ~${totalWeeks} Weeks • ~${totalDays} Days`;
      const decimalYears = (totalDays / 365.25).toFixed(1);
      dateEstimateText = `Estimated Target: ${dateFormatted} (~${decimalYears} yrs)`;
    } else if (rawMonths >= 1) {
      // 1 to 11 months
      primaryTimeline = `${totalMonths} Month${totalMonths > 1 ? 's' : ''}`;
      breakdownTimeline = `~${totalWeeks} Weeks • ~${totalDays} Days`;
      dateEstimateText = `Estimated Target: ${dateFormatted} (~${totalWeeks} wks)`;
    } else {
      // Less than 1 month!
      if (totalDays <= 7) {
        primaryTimeline = `${totalDays} Day${totalDays === 1 ? '' : 's'}`;
        breakdownTimeline = `Under 1 week • ~${totalDays} Days`;
      } else {
        primaryTimeline = `${totalWeeks} Week${totalWeeks === 1 ? '' : 's'}`;
        breakdownTimeline = `~${totalDays} Days (${Math.round(rawMonths * 100)}% of month)`;
      }
      dateEstimateText = `Estimated Target: ${dateFormatted} (Short term)`;
    }
  }

  // Update UI Elements
  const remainingEl = document.getElementById('goalRemainingDisplay');
  const monthsEl = document.getElementById('goalMonthsDisplay');
  const breakdownEl = document.getElementById('goalTimelineBreakdown');
  const progressEl = document.getElementById('goalProgressBar');
  const percentTextEl = document.getElementById('goalPercentText');
  const dateEstimateEl = document.getElementById('goalDateEstimate');
  const tipEl = document.getElementById('goalTipText');

  if (remainingEl) remainingEl.textContent = formatMoney(remaining);
  if (monthsEl) monthsEl.textContent = primaryTimeline;
  if (breakdownEl) breakdownEl.textContent = breakdownTimeline;
  if (progressEl) {
    progressEl.style.width = `${percentage}%`;
    progressEl.setAttribute('aria-valuenow', percentage);
  }
  if (percentTextEl) percentTextEl.textContent = `${percentage}%`;
  if (dateEstimateEl) dateEstimateEl.textContent = dateEstimateText;

  // Display rotating encouraging tip
  if (tipEl) {
    const tipIndex = Math.max(0, totalMonths) % SAVINGS_TIPS_LIBRARY.length;
    tipEl.textContent = SAVINGS_TIPS_LIBRARY[tipIndex];
  }
}

// Global integration helpers for Chatbot UI Control
window.recalculate503020 = recalculate503020;
window.recalculateSavingsGoal = recalculateSavingsGoal;

window.calculateBudgetFromChatbot = function(income) {
  const incomeInput = document.getElementById('calcIncomeInput');
  if (incomeInput) {
    incomeInput.value = income;
    recalculate503020();
  }
  const section = document.getElementById('calculator-50-30-20');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const card = section.querySelector('.calc-card');
    if (card) {
      card.classList.add('chatbot-highlight-pulse');
      setTimeout(() => card.classList.remove('chatbot-highlight-pulse'), 2500);
    }
  }

  const ratioSelect = document.getElementById('budgetSplitRatioSelect');
  let ratio = ratioSelect ? ratioSelect.value : '50-30-20';
  let pNeeds = 0.50, pWants = 0.30, pSavings = 0.20;
  if (ratio === '60-25-15') { pNeeds = 0.60; pWants = 0.25; pSavings = 0.15; }
  else if (ratio === '70-20-10') { pNeeds = 0.70; pWants = 0.20; pSavings = 0.10; }

  return {
    income: income,
    needs: income * pNeeds,
    wants: income * pWants,
    savings: income * pSavings,
    weeklyNeeds: (income * pNeeds) / 4.33,
    weeklyWants: (income * pWants) / 4.33,
    weeklySavings: (income * pSavings) / 4.33
  };
};

window.setSavingsGoalFromChatbot = function(name, target, current, monthly) {
  const nameInput = document.getElementById('goalNameInput');
  const targetInput = document.getElementById('goalTargetInput');
  const currentInput = document.getElementById('goalCurrentInput');
  const monthlyInput = document.getElementById('goalMonthlyInput');

  if (name && nameInput) nameInput.value = name;
  if (target && targetInput) targetInput.value = target;
  if (current !== undefined && currentInput) currentInput.value = current;
  if (monthly && monthlyInput) monthlyInput.value = monthly;

  recalculateSavingsGoal();

  const section = document.getElementById('savings-goals');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const card = section.querySelector('.calc-card');
    if (card) {
      card.classList.add('chatbot-highlight-pulse');
      setTimeout(() => card.classList.remove('chatbot-highlight-pulse'), 2500);
    }
  }

  return {
    name: nameInput?.value,
    target: parseFloat(targetInput?.value) || 0,
    current: parseFloat(currentInput?.value) || 0,
    monthly: parseFloat(monthlyInput?.value) || 0,
    timeline: document.getElementById('goalMonthsDisplay')?.textContent,
    breakdown: document.getElementById('goalTimelineBreakdown')?.textContent
  };
};

function saveGoalToHistory() {
  const name = document.getElementById('goalNameInput')?.value.trim() || 'My Student Goal';
  const target = parseFloat(document.getElementById('goalTargetInput')?.value) || 0;
  const current = parseFloat(document.getElementById('goalCurrentInput')?.value) || 0;
  const monthly = parseFloat(document.getElementById('goalMonthlyInput')?.value) || 0;

  if (target <= 0 || monthly <= 0) {
    showToastAlert('Goal Incomplete', 'Please fill valid amounts before saving your goal.');
    return;
  }

  const newGoal = {
    id: 'goal_' + Date.now(),
    name,
    target,
    current,
    monthly,
    percentage: Math.min(100, Math.round((current / target) * 100))
  };

  const stored = JSON.parse(localStorage.getItem('bb_saved_goals') || '[]');
  stored.unshift(newGoal);
  localStorage.setItem('bb_saved_goals', JSON.stringify(stored.slice(0, 4)));

  renderSavedGoalsList();
  showToastAlert('Goal Saved!', `"${name}" has been recorded into your active student goals.`);
}

function renderSavedGoalsList() {
  const container = document.getElementById('savedGoalsContainer');
  if (!container) return;

  const defaultPresets = [
    { id: 'def_1', name: 'Semester Laptop Replacement', target: 800, current: 350, monthly: 90, percentage: 44 },
    { id: 'def_2', name: 'Starter Emergency Cushion', target: 400, current: 240, monthly: 80, percentage: 60 }
  ];

  const stored = JSON.parse(localStorage.getItem('bb_saved_goals') || 'null') || defaultPresets;

  container.innerHTML = stored.map(g => `
    <div class="p-3 border rounded-3 mb-2 bg-light d-flex justify-content-between align-items-center">
      <div>
        <h6 class="fw-bold mb-1 fs-6">${g.name}</h6>
        <div class="small text-muted">Target: ${formatMoney(g.target)} | Saved: ${formatMoney(g.current)} (${g.percentage}%)</div>
      </div>
      <div class="text-end">
        <span class="badge ${g.percentage >= 100 ? 'bg-success' : 'bg-primary'}">${g.percentage}%</span>
      </div>
    </div>
  `).join('');
}
