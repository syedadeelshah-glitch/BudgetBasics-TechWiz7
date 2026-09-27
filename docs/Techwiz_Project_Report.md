# Techwiz 7 - Aptech World Tech Championship
## Category 1: Web Innovation Unleashed
### Project Name: **BudgetBasics**
### Team Name: **Tech Hunters**
### Theme: **NextGen BudgetBee**
### Version: 2.0.0
---

## 1. Project Overview & Team Information

BudgetBasics (NextGen BudgetBee) is an advanced, client-side Single Page Application (SPA) created by **Team Tech Hunters** to educate students and young adults on the foundational principles of personal budgeting, saving, and financial discipline. Built strictly in compliance with the Techwiz 7 SRS requirements and modern web engineering guidelines, it delivers an ultra-smooth, responsive, and private financial planning experience.

### 1.1 Development Team Roster & Roles
- **Muhammad Adeel Shah** — *Team Lead & Full-Stack Architect*
  - Overall system architecture, state orchestration, modular printing engine, and performance optimization.
- **Ghulam Mustafa** — *Financial Logic & Calculator Specialist*
  - Core financial mathematics, 50-30-20 algorithms, savings timelines, inflation buffers, and expense tracking formulas.
- **Mohsin Shah** — *UI/UX & Interaction Designer*
  - Neo-fintech design system, dark/light theme tokens, sinuous snake & bee scroll tracer, Central Voice Studio visualizer orb, and micro-interactions.
- **Makhdoom Afzal Shahid** — *Financial Research & QA Specialist*
  - Student budgeting research, infographic content curation, money mistake heuristics, and cross-browser quality assurance.

### 1.2 Official Contact & Inquiries
- **Helpline Phone Numbers:** `+92 (21) 111-278-324` / `+92 300 8274190`
- **Support & Feedback Email:** `info@aglsm.com`
- **Academic Context:** Aptech World Tech Championship (Techwiz 7)

---

## 2. Problem Definition & Project Necessity

Managing personal finances during university or college is a pivotal life skill that defines long-term financial independence. Most students handle allowances, stipends, or wages without prior financial education or practical tools.

Key challenges addressed by BudgetBasics:
1. **Cognitive Distraction & Visual Clutter:** Standard tools either overload students with complex accounting jargon or lack engaging visuals. BudgetBasics solves this with concise micro-copy, animated tips, and interactive cards.
2. **Difficulty Distinguishing Needs vs. Wants:** Students succumb to impulse spending. BudgetBasics introduces an interactive 8-card Sorter and the 48-Hour Cool-Off Matrix.
3. **Tedious Manual Calculations:** Spreadsheets are cumbersome on mobile devices. BudgetBasics provides instant 50-30-20 donut calculations, adaptive ratio presets, and goal timeline estimators.
4. **Silent Cash Leaks ("Ghost Subscriptions"):** Unused streaming trials silently drain student savings. BudgetBasics features an interactive Ghost Subscription Auditor.
5. **Absence of Official Financial Documents:** Students lack certified expense blueprints for guardians or scholarships. BudgetBasics includes a multi-format modular print engine and certified invoice generator.
6. **Accessibility & Hands-Free Interaction:** Hands-busy students can use the Central Voice Assistant Studio with speech recognition (STT) and voice synthesis (TTS) to navigate and calculate budgets hands-free.

---

## 3. System Architecture & Information Flow

BudgetBasics is architected as an offline-first, 100% client-side SPA. No user financial data is transmitted to external servers, strictly preserving student data privacy.

```
                                  [ Client Browser (SPA) ]
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      │                                      │                                      │
[ Presentation & UI Layer ]          [ Business Logic Layer ]             [ Local Data Engine ]
• Bootstrap 5.3 + Responsive Grid    • app.js (State, Tour, Ticker, Nav)  • data/chatbot-faq.json
• Neo-fintech Theme System (CSS)     • calculator.js (50-30-20 & Goals)   • data/budget-tips.json
• Plus Jakarta Sans & JetBrains Mono • expense-planner.js (Session Log)   • data/sample-data.json
• Chart.js Donut Visualizations      • chatbot.js (Voice AI, STT & TTS)   • data/infographics.json
• Sinuous Snake & Bee Tracer SVG     • invoice.js (Blueprint & Invoices)  • localStorage / Session
• Central Voice Studio Orb & Waves   • scroll-snake.js (SVG Math)
```

---

## 4. Complete Module Directory (SRS Modules 1 to 11)

### Module 1: Budgeting Fundamentals & Concepts
- Clear explanation of income, fixed expenses (rent, tuition), variable expenses (dining, entertainment), and savings.
- Interactive 4-question Knowledge Check quiz with instant feedback and score badge.
- Dynamic "Did You Know?" Quick Facts container highlighting student money statistics.

### Module 2: Needs vs. Wants Interactive Sorter
- 8 realistic student expense cards (Hostel Rent, Boba Tea, Textbooks, Designer Sneakers, etc.).
- Instant color-coded classification feedback.
- Interactive 48-Hour Decision Matrix guiding impulse control.

### Module 3: 50-30-20 Rule Calculator & Donut Chart
- Automatic allocation into 50% Needs, 30% Wants, and 20% Savings.
- Adaptive ratio presets for student realities:
  - 50-30-20 (Standard Balanced)
  - 60-25-15 (High Campus Rent)
  - 70-20-10 (Tight Budget Survival)
- Real-time weekly spending caps breakdown.
- Dynamic Chart.js interactive donut chart.
- **Dedicated Print Button** generating a clean, certified 50-30-20 Budget Statement.

### Module 4: Savings Goals Simulator
- Simulates target goal timelines based on monthly contributions.
- Automatic milestone projections (25%, 50%, 75%, 100%).
- Real-time milestone dates and encouraging tips.
- **Dedicated Print Button** generating a Savings Goal Roadmap document.

### Module 5: Session Expense Planner
- Interactive table for logging expenses (Date, Category, Description, Amount).
- Add, edit, and delete temporary transaction entries with zero page reload.
- Real-time total expense and remaining balance calculation with over-budget warning badges.
- **Dedicated Print Button** producing a clean Session Expense Log Statement.

### Module 6: Common Money Mistakes & Ghost Subscription Auditor
- Interactive accordion covering the 6 most common student financial pitfalls (Impulse buying, skipping emergency funds, lifestyle inflation).
- Ghost Subscription Auditor: Interactive checklist calculating monthly and annual costs of recurring entertainment and software trials.

### Module 7: Infographics & Visual Learning Gallery
- Comprehensive visual gallery with category filtering:
  - All Visuals
  - Budgeting Rules
  - Money Habits
  - Student Survival
- High-resolution modal lightbox with zoom preview, key takeaways, and direct download option.

### Module 8: Central Voice Assistant Studio (BudgetBee AI)
- High-tech Siri / JARVIS style Central Voice Studio modal.
- Multi-state visualizer orb: Idle pulse, Green listening pulse, and Amber speaking pulse.
- Real-time soundwave bar animations responsive to speech state.
- Automated voice self-introduction when opening the studio.
- Speech-to-Text (STT) via Web Speech API (`webkitSpeechRecognition`).
- Text-to-Speech (TTS) via Web Speech Synthesis (`SpeechSynthesisUtterance`) with mute/unmute control.
- Natural language number parsing supporting spoken numbers ("fifty thousands", "50 000", "50k").
- Full UI control: Navigating sections, calculating budgets, setting goals, switching currencies, toggling themes, and opening blueprints.
- Clickable voice command cheat-sheet chips for instant testing.
- Persistent floating companion chatbot widget at bottom-right for uninterrupted page navigation.

### Module 9: Certified Budget Invoice & Blueprint Generator
- Generates official certified budget statements with student name, academic term, and categorized line items.
- Dedicated multi-format print engine (`@media print`) rendering A4-ready documents.
- LocalStorage persistence with sample pre-seeded invoices and one-click re-printing.

### Module 10: About Us & Development Team Directory
- Comprehensive company story, mission, and vision.
- Detailed team grid honoring all 4 project members with color-coded role badges.
- Official helpline telephone numbers and contact details.
- Validated Contact and Feedback forms with client-side regex checks.
- Interactive Site Map Flow modal diagram.

### Module 11: Interactive Guided Tour & Financial Ticker Bar
- 5-step guided onboarding tour with spotlight backdrop and step-by-step navigation highlighting key app features.
- Live Financial Tips & Quotes Ticker Bar at the top of the page with auto-rotation, pause, and manual controls.

---

## 5. Visual Innovations & Aesthetics

1. **Sinuous Snake & Bee Scrollbar Tracer:**
   - SVG sine-wave path along the right margin tracking page scroll progress.
   - Sinuous snake arrow with dynamic head rotation.
   - **Animated BudgetBee Mascot flying ahead of the snake head**, creating an engaging visual chase dynamic.
   - Clearly marked "START" launch pad and "GOAL" trophy at the finish line.
2. **Crystal-Clear Opening Experience:**
   - Smooth preloader animation with immediate crisp page rendering upon dismiss (zero lingering blur).
3. **Atmospheric Neo-Fintech Canvas:**
   - Subtle dotted grid background panel with floating geometric currency elements ($ , Rs , € , £).
   - Fluid dark/light theme switching with WCAG AA compliant color contrast.
4. **Universal Multi-Currency Engine:**
   - Real-time switching between USD ($), PKR (Rs.), EUR (€), and GBP (£) across all calculators, cards, and printed documents.

---

## 6. Data Flow Diagrams (DFD)

### 6.1 DFD Level 0 (Context Diagram)
```
  [ Student / User ] ──( Financial Allowance & Goals )──> [ BudgetBasics System ]
  [ Student / User ] <──( 50-30-20 Breakdown & Chart )─── [ BudgetBasics System ]
  [ Student / User ] <──( Certified Print Statements )─── [ BudgetBasics System ]
  [ Student / User ] <───( Voice Assistant Guidance )──── [ BudgetBasics System ]
```

### 6.2 DFD Level 1 (Modular Data Flow)
```
[ User Action / Speech ]
    ├──> (Module 1: Basics & Quiz) ──────> [ Knowledge Score & Tips ]
    ├──> (Module 2: Needs vs Wants) ─────> [ 48-Hour Decision Matrix ]
    ├──> (Module 3: 50-30-20 Engine) ────> [ Donut Chart & Printable Statement ]
    ├──> (Module 4: Savings Simulator) ──> [ Milestone Dates & Goal Roadmap ]
    ├──> (Module 5: Expense Planner) ────> [ Session Log & Printable Ledger ]
    ├──> (Module 6: Subscription Audit) ─> [ Annual Cost Leak Calculation ]
    ├──> (Module 7: Infographics) ───────> [ High-Res Lightbox & Visual Insights ]
    ├──> (Module 8: Voice Studio AI) ────> [ Natural Speech Parsing & Direct UI Control ]
    └──> (Module 9: Invoice Engine) ─────> [ Certified Budget Blueprint (PDF/Print) ]
```

---

## 7. Mandatory Execution Instructions

Because BudgetBasics loads structured JSON datasets via browser `fetch()`, run the application using a local static HTTP server to prevent `file://` CORS restrictions:

### Option A: Using Python (Recommended)
```bash
cd BudgetBasics
python -m http.server 8000
```
Open **`http://localhost:8000`** in Google Chrome or Microsoft Edge.

### Option B: Using Node.js
```bash
cd BudgetBasics
npx serve .
```

### Option C: Using VS Code
Right-click `index.html` and select **"Open with Live Server"**.

---

## 8. Summary of Quality & Standards Compliance
- **Lighthouse Performance:** Optimized static assets, zero heavy server frameworks, fast FCP.
- **Accessibility:** WCAG 2.1 AA compliant colors, tab-navigable buttons, and ARIA labels.
- **Cross-Browser Verification:** Fully tested on Chrome, Edge, Firefox, and Safari.
- **Client-Side Privacy:** Zero telemetry or cloud database logging of student finances.

*Copyright © 2026 Aptech. All Rights Reserved. Built for Techwiz 7.*
