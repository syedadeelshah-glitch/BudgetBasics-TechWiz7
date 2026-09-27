======================================================================
BUDGETBASICS - NEXTGEN BUDGETBEE
TECHWIZ 7: APTECH WORLD TECH CHAMPIONSHIP
Category 1: Web Innovation Unleashed
Version: 2.0.0
Team Name: Tech Hunters
Author / Project Team:
  - Muhammad Adeel Shah (Team Lead & Full-Stack Architect)
  - Ghulam Mustafa (Financial Logic & Calculator Specialist)
  - Mohsin Shah (UI/UX & Interaction Designer)
  - Makhdoom Afzal Shahid (Financial Research & QA Specialist)
Helpline Phone Numbers: +92 (21) 111-278-324 / +92 300 8274190
Support Email: info@aglsm.com
======================================================================

1. PROJECT OVERVIEW
----------------------------------------------------------------------
BudgetBasics is an interactive educational Single Page Application (SPA)
designed to equip students and young adults with essential personal
budgeting skills. It implements all SRS functional requirements:
- Module 1: Budgeting Fundamentals & Concepts with Interactive Quiz
- Module 2: Needs vs. Wants Interactive Sorter & 48-Hour Decision Matrix
- Module 3: 50-30-20 Rule Calculator with interactive Chart.js donut chart,
            adaptive student presets, and dedicated Print Statement button
- Module 4: Savings Goals Simulator with milestone estimators & Print Roadmap
- Module 5: Session Expense Planner with table add/edit/delete, balance
            health monitoring, and dedicated Print Statement button
- Module 6: Money Mistakes Accordion and Ghost Subscription Auditor
- Module 7: Infographics & Visual Learning Gallery with category filter
            and high-resolution Lightbox modal
- Module 8: Central Voice Assistant Studio (Siri/JARVIS style visualizer orb,
            soundwave animation, voice self-introduction, STT Speech-to-Text,
            TTS Text-to-Speech, hands-free UI control, voice command chips)
- Module 9: Certified Budget Blueprint & Recent Invoices Management with
            clean @media print support and local storage persistence
- Module 10: About Us, Team Directory, and validated Contact/Feedback forms
- Module 11: Interactive 5-Step Guided Tour & Live Financial Ticker Bar
- Multi-currency switcher (USD, PKR, EUR, GBP)
- Real-time digital clock and visitor counter
- Dark/light mode toggle with WCAG accessible contrast
- Sinuous Snake & Bee scroll tracer (snake chasing animated bee mascot)
- Razor-sharp opening experience without blur

2. PROJECT STRUCTURE
----------------------------------------------------------------------
BudgetBasics/
├── index.html                   # Primary Single Page Application
├── assets/
│   ├── css/
│   │   ├── style.css            # Custom neo-fintech stylesheet & print styles
│   │   └── responsive.css       # Mobile & tablet media queries
│   ├── js/
│   │   ├── app.js               # State, Tour, Ticker, Infographics, Print
│   │   ├── calculator.js        # 50-30-20 & Savings goals simulators
│   │   ├── quiz.js              # Knowledge check & Needs vs Wants sorter
│   │   ├── expense-planner.js   # Interactive expense planner table
│   │   ├── chatbot.js           # Voice Studio AI assistant with STT & TTS
│   │   ├── scroll-snake.js      # Sinuous snake & bee scroll tracer
│   │   └── invoice.js           # Budget Invoice generator & Recent Invoices
│   └── images/                  # High quality vector SVGs & mockups
├── data/
│   ├── chatbot-faq.json         # Chatbot FAQ database
│   ├── budget-tips.json         # Ticker tips, quotes & money mistakes
│   ├── sample-data.json         # Realistic student test data & sample budget
│   └── infographics.json        # Infographic metadata and visual takeaways
└── docs/
    ├── Techwiz_Project_Report.md # Formal SRS documentation and DFDs
    └── ReadMe.txt               # This submission file

3. ASSUMPTIONS & DESIGN CONSTRAINTS
----------------------------------------------------------------------
1. 100% client-side SPA without external backend storage, ensuring absolute
   student financial privacy.
2. Invoices and session expenses are managed via JavaScript memory and
   HTML5 localStorage.
3. Voice STT uses standard browser SpeechRecognition. When mic permission
   is not granted or unsupported, it gracefully provides keyboard fallback.
4. Voice TTS uses standard browser SpeechSynthesis with an audio mute/unmute
   toggle and self-introduction greeting upon opening the Voice Studio.

4. MANDATORY INSTALLATION & EXECUTION INSTRUCTIONS
----------------------------------------------------------------------
Because BudgetBasics loads JSON data files using modern browser fetch(),
please run the application using a local web server to avoid browser
local file CORS restrictions:

Using Python (Recommended):
  1. Open terminal / command prompt.
  2. Navigate into the BudgetBasics folder:
     cd BudgetBasics
  3. Start a server:
     python -m http.server 8000
  4. Open in any browser:
     http://localhost:8000

Using VS Code:
  Right-click index.html and select "Open with Live Server".

Using Node.js:
  npx serve .
======================================================================
Copyright (c) 2026 Aptech. All Rights Reserved.
