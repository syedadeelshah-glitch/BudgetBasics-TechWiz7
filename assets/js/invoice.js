/**
 * BudgetBasics - NextGen BudgetBee
 * Student Monthly Budget Plan & Printable PDF Generator
 * Techwiz 7 - Category 1 (Web Innovation Unleashed)
 */

let invoiceItems = [];
let recentInvoices = [];

window.initInvoiceModule = function() {
  loadRecentInvoices();
  initDefaultInvoiceItems();
  bindInvoiceEvents();
  renderInvoicePreview();
  renderRecentInvoicesList();

  window.addEventListener('currencyChanged', () => {
    renderInvoiceItemsInputs();
    renderInvoicePreview();
    renderRecentInvoicesList();
  });
};

function loadRecentInvoices() {
  const saved = localStorage.getItem('bb_saved_budget_plans') || localStorage.getItem('bb_recent_invoices');
  if (saved) {
    try {
      recentInvoices = JSON.parse(saved);
      return;
    } catch(e){}
  }

  // Pre-seed from sample-data.json if available
  if (BB_STATE.sampleData && BB_STATE.sampleData.initialInvoices) {
    recentInvoices = BB_STATE.sampleData.initialInvoices.map(inv => ({
      ...inv,
      invoiceNumber: inv.invoiceNumber.replace('INV-', 'PLAN-')
    }));
    localStorage.setItem('bb_saved_budget_plans', JSON.stringify(recentInvoices));
  } else {
    recentInvoices = [
      {
        invoiceNumber: "PLAN-BB-2026-001",
        invoiceDate: "2026-09-01",
        studentName: "Alex Carter",
        studentId: "AP-TECH-7890",
        academicTerm: "Fall Semester 2026",
        totalIncome: 1200.00,
        totalExpenses: 985.00,
        plannedSavings: 215.00,
        notes: "Fall term budget allocation for dorm living and emergency buffer.",
        items: [
          { category: "Needs", description: "Campus Accommodation / Room Rent", amount: 420.00 },
          { category: "Needs", description: "Monthly Groceries & Meal Plan", amount: 230.00 },
          { category: "Needs", description: "Student Metro & Commute Transit", amount: 65.00 },
          { category: "Wants", description: "Weekend Social & Dining Out", amount: 120.00 },
          { category: "Savings", description: "Emergency Buffer & Goal Savings", amount: 150.00 }
        ]
      }
    ];
    localStorage.setItem('bb_saved_budget_plans', JSON.stringify(recentInvoices));
  }
}

function initDefaultInvoiceItems() {
  invoiceItems = [
    { description: "Campus Accommodation / Room Rent", category: "Needs", amount: 420.00 },
    { description: "Monthly Groceries & Meal Plan", category: "Needs", amount: 230.00 },
    { description: "Student Metro & Commute Transit", category: "Needs", amount: 65.00 },
    { description: "Weekend Social & Dining Out", category: "Wants", amount: 120.00 },
    { description: "Emergency Buffer & Goal Savings", category: "Savings", amount: 150.00 }
  ];

  renderInvoiceItemsInputs();
}

function bindInvoiceEvents() {
  const btnAddItem = document.getElementById('btnAddInvoiceItem');
  if (btnAddItem) {
    btnAddItem.addEventListener('click', () => {
      invoiceItems.push({ description: "New Budget Item", category: "Needs", amount: 50.00 });
      renderInvoiceItemsInputs();
      renderInvoicePreview();
    });
  }

  const btnPrint = document.getElementById('btnPrintInvoice');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  const btnSaveToRecent = document.getElementById('btnSaveCurrentInvoice');
  if (btnSaveToRecent) {
    btnSaveToRecent.addEventListener('click', saveCurrentInvoiceToHistory);
  }

  const btnNewInvoice = document.getElementById('btnCreateNewInvoice');
  if (btnNewInvoice) {
    btnNewInvoice.addEventListener('click', createBrandNewInvoiceForm);
  }

  // Live input change listeners
  const liveInputs = ['invStudentName', 'invStudentId', 'invTerm', 'invTotalIncome', 'invNotes'];
  liveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', renderInvoicePreview);
    }
  });
}

function renderInvoiceItemsInputs() {
  const container = document.getElementById('invoiceItemsFormList');
  if (!container) return;

  container.innerHTML = invoiceItems.map((item, idx) => `
    <div class="invoice-item-row row g-2 align-items-center mb-1.5 p-1.5 border rounded-3 bg-light">
      <div class="col-md-5 col-12">
        <input type="text" class="form-control form-control-sm py-1" placeholder="Allocation item..." value="${item.description}" oninput="updateInvoiceItem(${idx}, 'description', this.value)">
      </div>
      <div class="col-md-3 col-6">
        <select class="form-select form-select-sm py-1" onchange="updateInvoiceItem(${idx}, 'category', this.value)">
          <option value="Needs" ${item.category === 'Needs' ? 'selected' : ''}>Needs (50%)</option>
          <option value="Wants" ${item.category === 'Wants' ? 'selected' : ''}>Wants (30%)</option>
          <option value="Savings" ${item.category === 'Savings' ? 'selected' : ''}>Savings (20%)</option>
        </select>
      </div>
      <div class="col-md-3 col-4">
        <div class="input-group input-group-sm">
          <span class="input-group-text py-0 px-1 text-muted small">${BB_STATE.currentCurrency}</span>
          <input type="number" step="0.01" class="form-control py-1 px-1.5" value="${item.amount}" oninput="updateInvoiceItem(${idx}, 'amount', this.value)">
        </div>
      </div>
      <div class="col-md-1 col-2 text-end">
        <button type="button" class="btn btn-sm btn-link text-danger p-0 border-0" onclick="removeInvoiceItem(${idx})" title="Remove item">
          <i class="bi bi-x-circle-fill fs-5"></i>
        </button>
      </div>
    </div>
  `).join('');
}

window.updateInvoiceItem = function(idx, key, value) {
  if (!invoiceItems[idx]) return;
  if (key === 'amount') {
    invoiceItems[idx][key] = parseFloat(value) || 0;
  } else {
    invoiceItems[idx][key] = value;
  }
  renderInvoicePreview();
};

window.removeInvoiceItem = function(idx) {
  invoiceItems.splice(idx, 1);
  renderInvoiceItemsInputs();
  renderInvoicePreview();
};

function renderInvoicePreview() {
  const sName = document.getElementById('invStudentName')?.value.trim() || 'Alex Carter';
  const sId = document.getElementById('invStudentId')?.value.trim() || 'AP-TECH-7890';
  const sTerm = document.getElementById('invTerm')?.value.trim() || 'Fall Semester 2026';
  const totalIncome = parseFloat(document.getElementById('invTotalIncome')?.value) || 1200.00;
  const sNotes = document.getElementById('invNotes')?.value.trim() || 'Student monthly budget blueprint created via BudgetBasics NextGen BudgetBee.';

  // DOM Elements in preview
  const prevNum = document.getElementById('prevInvoiceNumber');
  const prevDate = document.getElementById('prevInvoiceDate');
  const prevName = document.getElementById('prevStudentName');
  const prevId = document.getElementById('prevStudentId');
  const prevTerm = document.getElementById('prevAcademicTerm');
  const prevNotes = document.getElementById('prevInvoiceNotes');
  const tbody = document.getElementById('prevInvoiceTableBody');

  if (prevNum && !prevNum.textContent.includes('PLAN-') && !prevNum.textContent.includes('INV-')) {
    prevNum.textContent = 'PLAN-BB-2026-' + Math.floor(100 + Math.random() * 900);
  }
  if (prevDate) {
    prevDate.textContent = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (prevName) prevName.textContent = sName;
  if (prevId) prevId.textContent = sId;
  if (prevTerm) prevTerm.textContent = sTerm;
  if (prevNotes) prevNotes.textContent = sNotes;

  let totalExpenses = 0;
  let needsSum = 0;
  let wantsSum = 0;
  let savingsSum = 0;

  if (tbody) {
    tbody.innerHTML = invoiceItems.map((item, i) => {
      totalExpenses += item.amount;
      if (item.category === 'Needs') needsSum += item.amount;
      else if (item.category === 'Wants') wantsSum += item.amount;
      else savingsSum += item.amount;

      let badgeClass = 'bg-primary-subtle text-primary';
      if (item.category === 'Wants') badgeClass = 'bg-warning-subtle text-warning-emphasis';
      if (item.category === 'Savings') badgeClass = 'bg-success-subtle text-success';

      return `
        <tr>
          <td class="text-muted small">${i + 1}</td>
          <td class="fw-semibold">${item.description}</td>
          <td><span class="badge ${badgeClass} rounded-pill">${item.category}</span></td>
          <td class="text-end fw-bold">${formatMoney(item.amount)}</td>
        </tr>
      `;
    }).join('');
  }

  const plannedSavings = Math.max(0, totalIncome - totalExpenses);

  // Update Summary Totals
  const prevIncome = document.getElementById('prevTotalIncome');
  const prevExpenses = document.getElementById('prevTotalExpenses');
  const prevSavings = document.getElementById('prevPlannedSavings');
  const prevNeedsPct = document.getElementById('prevNeedsPct');
  const prevWantsPct = document.getElementById('prevWantsPct');

  if (prevIncome) prevIncome.textContent = formatMoney(totalIncome);
  if (prevExpenses) prevExpenses.textContent = formatMoney(totalExpenses);
  if (prevSavings) prevSavings.textContent = formatMoney(plannedSavings);

  if (prevNeedsPct && totalIncome > 0) {
    prevNeedsPct.textContent = `${Math.round((needsSum / totalIncome) * 100)}%`;
  }
  if (prevWantsPct && totalIncome > 0) {
    prevWantsPct.textContent = `${Math.round((wantsSum / totalIncome) * 100)}%`;
  }
}

function saveCurrentInvoiceToHistory() {
  const invNumber = document.getElementById('prevInvoiceNumber')?.textContent || ('PLAN-BB-2026-' + Math.floor(100 + Math.random() * 900));
  const sName = document.getElementById('invStudentName')?.value.trim() || 'Alex Carter';
  const sId = document.getElementById('invStudentId')?.value.trim() || 'AP-TECH-7890';
  const sTerm = document.getElementById('invTerm')?.value.trim() || 'Fall Semester 2026';
  const totalIncome = parseFloat(document.getElementById('invTotalIncome')?.value) || 1200.00;
  const sNotes = document.getElementById('invNotes')?.value.trim() || 'Student monthly budget plan.';
  const totalExpenses = invoiceItems.reduce((acc, curr) => acc + curr.amount, 0);

  const newPlanRecord = {
    invoiceNumber: invNumber,
    invoiceDate: new Date().toISOString().split('T')[0],
    studentName: sName,
    studentId: sId,
    academicTerm: sTerm,
    totalIncome: totalIncome,
    totalExpenses: totalExpenses,
    plannedSavings: Math.max(0, totalIncome - totalExpenses),
    notes: sNotes,
    items: JSON.parse(JSON.stringify(invoiceItems))
  };

  // Add to top of list, prevent duplicate IDs
  recentInvoices = recentInvoices.filter(x => x.invoiceNumber !== invNumber);
  recentInvoices.unshift(newPlanRecord);
  localStorage.setItem('bb_saved_budget_plans', JSON.stringify(recentInvoices));
  localStorage.setItem('bb_recent_invoices', JSON.stringify(recentInvoices));

  renderRecentInvoicesList();
  showToastAlert('Budget Plan Saved!', `Plan ${invNumber} saved to your Saved Budget Plans.`);
}

function renderRecentInvoicesList() {
  const container = document.getElementById('recentInvoicesContainer');
  const countBadge = document.getElementById('recentInvoicesCountBadge');
  if (!container) return;

  if (countBadge) countBadge.textContent = recentInvoices.length === 1 ? '1 Plan' : `${recentInvoices.length} Plans`;

  if (recentInvoices.length === 0) {
    container.innerHTML = `
      <div class="text-center py-3 text-muted">
        <i class="bi bi-file-earmark-text fs-3"></i>
        <p class="mt-1 mb-0 small">No saved student budget plans yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = recentInvoices.map((inv, idx) => `
    <div class="saved-plan-item p-2 mb-2 border rounded-3 bg-body shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <div class="d-flex align-items-center gap-2 overflow-hidden">
          <span class="badge bg-dark" style="font-size: 0.72rem;">${inv.invoiceNumber}</span>
          <strong class="small text-truncate" style="max-width: 140px;">${inv.studentName}</strong>
        </div>
        <span class="small text-muted" style="font-size: 0.74rem;">${inv.invoiceDate}</span>
      </div>
      <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
        <span class="text-truncate" style="max-width: 150px; font-size: 0.78rem;">${inv.academicTerm}</span>
        <span style="font-size: 0.78rem;">In: <strong class="text-primary">${formatMoney(inv.totalIncome)}</strong> | Out: <strong class="text-danger">${formatMoney(inv.totalExpenses)}</strong></span>
      </div>
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-primary py-0 px-2 rounded-pill small flex-grow-1" onclick="loadInvoiceIntoGenerator(${idx})" title="Load plan into editor">
          <i class="bi bi-pencil-square me-1"></i> Load
        </button>
        <button class="btn btn-sm btn-outline-success py-0 px-2 rounded-pill small" onclick="quickPrintRecentInvoice(${idx})" title="Print this budget plan">
          <i class="bi bi-printer"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill small" onclick="deleteRecentInvoice(${idx})" title="Delete plan">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

window.loadInvoiceIntoGenerator = function(idx) {
  const inv = recentInvoices[idx];
  if (!inv) return;

  const prevNum = document.getElementById('prevInvoiceNumber');
  if (prevNum) prevNum.textContent = inv.invoiceNumber;
  if (document.getElementById('invStudentName')) document.getElementById('invStudentName').value = inv.studentName;
  if (document.getElementById('invStudentId')) document.getElementById('invStudentId').value = inv.studentId || '';
  if (document.getElementById('invTerm')) document.getElementById('invTerm').value = inv.academicTerm;
  if (document.getElementById('invTotalIncome')) document.getElementById('invTotalIncome').value = inv.totalIncome;
  if (document.getElementById('invNotes')) document.getElementById('invNotes').value = inv.notes;

  invoiceItems = JSON.parse(JSON.stringify(inv.items || []));
  renderInvoiceItemsInputs();
  renderInvoicePreview();

  // Smooth scroll into preview
  document.getElementById('printableInvoice')?.scrollIntoView({ behavior: 'smooth' });
  showToastAlert('Budget Plan Loaded', `Loaded ${inv.invoiceNumber} for ${inv.studentName}.`);
};

window.quickPrintRecentInvoice = function(idx) {
  window.loadInvoiceIntoGenerator(idx);
  setTimeout(() => {
    window.print();
  }, 400);
};

window.deleteRecentInvoice = function(idx) {
  const inv = recentInvoices[idx];
  recentInvoices.splice(idx, 1);
  localStorage.setItem('bb_saved_budget_plans', JSON.stringify(recentInvoices));
  localStorage.setItem('bb_recent_invoices', JSON.stringify(recentInvoices));
  renderRecentInvoicesList();
  showToastAlert('Plan Deleted', `Removed ${inv.invoiceNumber} from saved plans.`);
};

function createBrandNewInvoiceForm() {
  const prevNum = document.getElementById('prevInvoiceNumber');
  if (prevNum) prevNum.textContent = 'PLAN-BB-2026-' + Math.floor(100 + Math.random() * 900);
  if (document.getElementById('invStudentName')) document.getElementById('invStudentName').value = '';
  if (document.getElementById('invNotes')) document.getElementById('invNotes').value = '';
  invoiceItems = [
    { description: "Campus Accommodation / Room Rent", category: "Needs", amount: 350.00 },
    { description: "Meal Plan & Grocery Staples", category: "Needs", amount: 200.00 },
    { description: "College Books & Course Supplies", category: "Needs", amount: 50.00 }
  ];
  renderInvoiceItemsInputs();
  renderInvoicePreview();
  showToastAlert('New Budget Plan Draft', 'Blank budget sheet prepared. Enter your allocations.');
}

// Global Chatbot Integration Helpers for Budget Blueprint Generation & Printing
window.generateBudgetPlanFromChatbot = function(studentName, income, printImmediately) {
  const name = studentName || document.getElementById('invStudentName')?.value || 'Student Learner';
  const inc = parseFloat(income) || parseFloat(document.getElementById('invTotalIncome')?.value) || 1200;

  if (document.getElementById('invStudentName')) document.getElementById('invStudentName').value = name;
  if (document.getElementById('invTotalIncome')) document.getElementById('invTotalIncome').value = inc;

  const prevNum = document.getElementById('prevInvoiceNumber');
  if (prevNum && (!prevNum.textContent || prevNum.textContent.includes('001'))) {
    prevNum.textContent = 'PLAN-BB-2026-' + Math.floor(100 + Math.random() * 900);
  }

  // Generate proportional line items according to 50-30-20 framework
  invoiceItems = [
    { description: "Campus Accommodation / Room Rent", category: "Needs", amount: Math.round(inc * 0.30) },
    { description: "Essential Groceries & Meal Plan", category: "Needs", amount: Math.round(inc * 0.15) },
    { description: "Student Metro & Commute Transit", category: "Needs", amount: Math.round(inc * 0.05) },
    { description: "Dining Out & Campus Social Outings", category: "Wants", amount: Math.round(inc * 0.20) },
    { description: "Digital Tools & Learning Subscriptions", category: "Wants", amount: Math.round(inc * 0.10) },
    { description: "20% Emergency Fund / Future Goal", category: "Savings", amount: Math.round(inc * 0.20) }
  ];

  renderInvoiceItemsInputs();
  renderInvoicePreview();

  const invoiceSec = document.getElementById('budget-invoice');
  if (invoiceSec) {
    invoiceSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const card = document.getElementById('printableInvoice');
    if (card) {
      card.classList.add('chatbot-highlight-pulse');
      setTimeout(() => card.classList.remove('chatbot-highlight-pulse'), 2500);
    }
  }

  if (printImmediately) {
    setTimeout(() => {
      window.print();
    }, 700);
  }

  return {
    studentName: name,
    income: inc,
    expenses: invoiceItems.reduce((acc, x) => acc + (parseFloat(x.amount) || 0), 0)
  };
};

window.printInvoiceFromChatbot = function() {
  const invoiceSec = document.getElementById('budget-invoice');
  if (invoiceSec) {
    invoiceSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const card = document.getElementById('printableInvoice');
    if (card) {
      card.classList.add('chatbot-highlight-pulse');
      setTimeout(() => card.classList.remove('chatbot-highlight-pulse'), 2500);
    }
  }
  setTimeout(() => {
    window.print();
  }, 600);
};
