/**
 * BudgetBasics - NextGen BudgetBee
 * Interactive Expense Planner Demonstration Module (SRS Module 5)
 * Techwiz 7 - Category 1 (Web Innovation Unleashed)
 */

let activeExpenses = [];
let editingExpenseId = null;

window.initExpensePlanner = function() {
  // Pre-seed with initial sample data from JSON or default
  if (BB_STATE.sampleData && BB_STATE.sampleData.initialExpenses) {
    activeExpenses = [...BB_STATE.sampleData.initialExpenses];
  } else {
    activeExpenses = [
      { id: 'exp_1', date: '2026-09-01', category: 'Education', description: 'Semester Textbooks & Lab Kit', amount: 45.00 },
      { id: 'exp_2', date: '2026-09-04', category: 'Food', description: 'Dorm Groceries & Oats', amount: 65.00 },
      { id: 'exp_3', date: '2026-09-06', category: 'Transport', description: 'Student Metro Card Recharge', amount: 40.00 }
    ];
  }

  // Set default date to today in the input form
  const dateInput = document.getElementById('expenseDateInput');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Form submission
  const expenseForm = document.getElementById('expenseEntryForm');
  if (expenseForm) {
    expenseForm.addEventListener('submit', handleExpenseSubmit);
  }

  // Allowance input change
  const allowanceInput = document.getElementById('plannerAllowanceInput');
  if (allowanceInput) {
    allowanceInput.addEventListener('input', updatePlannerCalculations);
  }

  // Reset to sample button
  const btnResetSample = document.getElementById('btnResetSampleExpenses');
  if (btnResetSample) {
    btnResetSample.addEventListener('click', () => {
      if (BB_STATE.sampleData && BB_STATE.sampleData.initialExpenses) {
        activeExpenses = [...BB_STATE.sampleData.initialExpenses];
      }
      renderExpenseTable();
      showToastAlert('Reset Complete', 'Loaded original student expense sample entries.');
    });
  }

  // Listen to currency change
  window.addEventListener('currencyChanged', () => {
    renderExpenseTable();
    updatePlannerCalculations();
  });

  renderExpenseTable();
  updatePlannerCalculations();
};

function handleExpenseSubmit(e) {
  e.preventDefault();

  const dateInput = document.getElementById('expenseDateInput');
  const catInput = document.getElementById('expenseCategoryInput');
  const descInput = document.getElementById('expenseDescInput');
  const amountInput = document.getElementById('expenseAmountInput');
  const errorBox = document.getElementById('expenseFormError');

  const date = dateInput.value;
  const category = catInput.value;
  const description = descInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (!date || !category || !description || isNaN(amount) || amount <= 0) {
    if (errorBox) {
      errorBox.textContent = 'Please fill out all fields with a valid expense amount.';
      errorBox.classList.remove('d-none');
    }
    return;
  }

  if (errorBox) errorBox.classList.add('d-none');

  if (editingExpenseId) {
    // Update existing
    const idx = activeExpenses.findIndex(x => x.id === editingExpenseId);
    if (idx !== -1) {
      activeExpenses[idx] = { id: editingExpenseId, date, category, description, amount };
      showToastAlert('Expense Updated', `Updated entry: ${description}`);
    }
    editingExpenseId = null;
    document.getElementById('btnSaveExpense').innerHTML = '<i class="bi bi-plus-circle me-1"></i> Add Expense';
  } else {
    // Add new
    const newEntry = {
      id: 'exp_' + Date.now(),
      date,
      category,
      description,
      amount
    };
    activeExpenses.unshift(newEntry);
    showToastAlert('Expense Added', `Added ${formatMoney(amount)} for ${description}`);
  }

  // Clear inputs (keep date)
  descInput.value = '';
  amountInput.value = '';
  catInput.selectedIndex = 0;

  renderExpenseTable();
  updatePlannerCalculations();
}

function renderExpenseTable() {
  const tbody = document.getElementById('expenseTableBody');
  const countEl = document.getElementById('expenseTotalEntriesCount');
  if (!tbody) return;

  if (countEl) countEl.textContent = `${activeExpenses.length} entries`;

  if (activeExpenses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-muted">
          <i class="bi bi-receipt text-secondary display-6"></i>
          <p class="mt-2 mb-0">No expenses recorded yet. Use the form above to add an expense!</p>
        </td>
      </tr>
    `;
    return;
  }

  // Category Icon and Color helper
  const catStyles = {
    Food: { icon: 'bi-cup-hot', badge: 'bg-warning-subtle text-warning-emphasis' },
    Transport: { icon: 'bi-bus-front', badge: 'bg-info-subtle text-info-emphasis' },
    Education: { icon: 'bi-book', badge: 'bg-primary-subtle text-primary-emphasis' },
    Entertainment: { icon: 'bi-controller', badge: 'bg-danger-subtle text-danger-emphasis' },
    Shopping: { icon: 'bi-bag', badge: 'bg-secondary-subtle text-secondary-emphasis' },
    Utilities: { icon: 'bi-lightning', badge: 'bg-warning-subtle text-dark' },
    Miscellaneous: { icon: 'bi-three-dots', badge: 'bg-light text-dark border' }
  };

  tbody.innerHTML = activeExpenses.map(item => {
    const style = catStyles[item.category] || catStyles.Miscellaneous;
    return `
      <tr>
        <td class="text-muted small">${item.date}</td>
        <td>
          <span class="badge ${style.badge} rounded-pill px-2 py-1">
            <i class="bi ${style.icon} me-1"></i> ${item.category}
          </span>
        </td>
        <td class="fw-semibold">${item.description}</td>
        <td class="fw-bold text-danger text-end">-${formatMoney(item.amount)}</td>
        <td class="text-end text-nowrap">
          <div class="d-inline-flex align-items-center gap-1 justify-content-end">
            <button class="btn btn-sm btn-outline-secondary btn-table-action" title="Edit" onclick="editExpense('${item.id}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-table-action" title="Remove" onclick="deleteExpense('${item.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.editExpense = function(id) {
  const item = activeExpenses.find(x => x.id === id);
  if (!item) return;

  editingExpenseId = id;
  document.getElementById('expenseDateInput').value = item.date;
  document.getElementById('expenseCategoryInput').value = item.category;
  document.getElementById('expenseDescInput').value = item.description;
  document.getElementById('expenseAmountInput').value = item.amount;

  const btnSave = document.getElementById('btnSaveExpense');
  if (btnSave) {
    btnSave.innerHTML = '<i class="bi bi-check-lg me-1"></i> Update Entry';
    btnSave.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

window.deleteExpense = function(id) {
  activeExpenses = activeExpenses.filter(x => x.id !== id);
  renderExpenseTable();
  updatePlannerCalculations();
  showToastAlert('Expense Removed', 'Entry removed from current session.');
};

function updatePlannerCalculations() {
  const allowanceInput = document.getElementById('plannerAllowanceInput');
  const allowance = parseFloat(allowanceInput ? allowanceInput.value : 1200) || 1200;

  const totalSpent = activeExpenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = allowance - totalSpent;
  const percentUsed = allowance > 0 ? Math.min(100, Math.round((totalSpent / allowance) * 100)) : 0;

  const totalSpentEl = document.getElementById('plannerTotalSpentDisplay');
  const remainingEl = document.getElementById('plannerRemainingDisplay');
  const progressEl = document.getElementById('plannerProgressBar');
  const badgeStatus = document.getElementById('plannerHealthBadge');

  if (totalSpentEl) totalSpentEl.textContent = formatMoney(totalSpent);
  if (remainingEl) remainingEl.textContent = formatMoney(remaining);

  if (progressEl) {
    progressEl.style.width = `${percentUsed}%`;
    if (percentUsed > 90) {
      progressEl.className = 'progress-bar bg-danger';
    } else if (percentUsed > 70) {
      progressEl.className = 'progress-bar bg-warning';
    } else {
      progressEl.className = 'progress-bar bg-success';
    }
  }

  if (badgeStatus) {
    if (remaining < 0) {
      badgeStatus.className = 'badge bg-danger p-2';
      badgeStatus.innerHTML = '<i class="bi bi-exclamation-octagon-fill me-1"></i> Over Budget Warning!';
    } else if (remaining < allowance * 0.15) {
      badgeStatus.className = 'badge bg-warning text-dark p-2';
      badgeStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1"></i> Running Low on Allowance';
    } else {
      badgeStatus.className = 'badge bg-success p-2';
      badgeStatus.innerHTML = '<i class="bi bi-shield-check me-1"></i> Healthy Budget Balance';
    }
  }
}
