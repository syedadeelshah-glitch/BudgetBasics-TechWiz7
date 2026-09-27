/**
 * BudgetBasics - NextGen BudgetBee
 * AI Financial Chatbot Assistant with Full UI Control, Natural Language Number Parsing,
 * Multi-Turn Dialog Management, and Real-Time Interest-Based Suggestions.
 * Techwiz 7 - Category 1 (Web Innovation Unleashed)
 */

class BudgetBeeChatbot {
  constructor() {
    this.faqData = null;
    this.isRecording = false;
    this.isStartingRecognition = false;
    this.isVoiceEnabled = true;
    this.recognition = null;
    this.synth = window.speechSynthesis || null;
    this.selectedVoice = null;
    this.isTyping = false;
    this.pendingAction = null; // Multi-turn dialog context
    this.activeInterests = ['budget_calc', 'savings_goals', 'invoice_print']; // Working interests tracker

    // Consolidated Floating Assistant Elements (Bottom-Right)
    this.floatingChatLauncher = document.getElementById('floatingChatLauncher');
    this.floatingChatWindow = document.getElementById('floatingChatWindow');
    this.chatLauncherIcon = document.getElementById('chatLauncherIcon');
    this.launcherVoiceBars = document.getElementById('launcherVoiceBars');
    this.launcherVoicePulse = document.getElementById('launcherVoicePulse');
    this.launcherPillHint = document.getElementById('launcherPillHint');
    this.btnToggleAllTimeListening = document.getElementById('btnToggleAllTimeListening');
    this.iconAllTimeListening = document.getElementById('iconAllTimeListening');
    this.textAllTimeListening = document.getElementById('textAllTimeListening');
    this.botStatusText = document.getElementById('botStatusText');

    this.isAutoMicEnabled = localStorage.getItem('bb_auto_mic') !== 'false';
    this.wasVoiceTriggered = false;

    // Support both in-page and floating bottom-right instances
    this.messagesContainers = [
      document.getElementById('chatbotMessages'),
      document.getElementById('chatbotMessagesFloating')
    ].filter(Boolean);

    this.inputFields = [
      document.getElementById('chatInput'),
      document.getElementById('chatInputFloating')
    ].filter(Boolean);

    this.sendBtns = [
      document.getElementById('btnSendChat'),
      document.getElementById('btnSendChatFloating')
    ].filter(Boolean);

    this.micBtns = [
      document.getElementById('btnVoiceMic'),
      document.getElementById('btnVoiceMicFloating')
    ].filter(Boolean);

    this.ttsToggleBtns = [
      document.getElementById('btnToggleTts'),
      document.getElementById('btnToggleTtsFloating')
    ].filter(Boolean);

    this.init();
  }

  async init() {
    await this.loadFaqData();
    this.setupSpeechRecognition();
    this.setupVoiceSynthesis();
    this.bindEvents();
    this.trackRealtimeScrollInterests();
    this.renderInitialGreeting();
  }

  async loadFaqData() {
    try {
      const response = await fetch('data/chatbot-faq.json');
      if (response.ok) {
        this.faqData = await response.json();
      }
    } catch (err) {
      console.warn('Unable to load external chatbot-faq.json, using built-in intents fallback.', err);
    }
  }

  setupSpeechRecognition() {
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.micBtns.forEach(btn => {
        btn.title = "Speech-to-Text not supported in this browser version";
      });
      if (this.voiceStatusHint) {
        this.voiceStatusHint.textContent = 'Voice input not supported in this browser version. Use text input.';
      }
      return null;
    }

    // Clean up any existing recognition instance and remove its listeners
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        this.isRecording = true;
        this.isStartingRecognition = false;
        this.wasVoiceTriggered = true;
        this.updateMicUiRecording();
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.wasVoiceTriggered = true;
        this.inputFields.forEach(input => {
          input.value = transcript;
        });
        if (this.voiceTranscriptCard) {
          this.voiceTranscriptCard.innerHTML = `<span class="text-white"><i class="bi bi-person-fill text-warning me-1"></i> <strong>You:</strong> "${transcript}"</span>`;
        }
        this.stopSpeechRecognition(false);
        setTimeout(() => this.handleSendMessage(transcript), 350);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        this.isRecording = false;
        this.isStartingRecognition = false;
        this.updateMicUiStopped();
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          if (this.voiceStatusHint) {
            this.voiceStatusHint.textContent = 'Voice input paused. Click mic to retry.';
          }
        }
      };

      recognition.onend = () => {
        this.isRecording = false;
        this.isStartingRecognition = false;
        this.updateMicUiStopped();
      };

      this.recognition = recognition;
      return recognition;
    } catch (err) {
      console.error('Error creating SpeechRecognition instance:', err);
      return null;
    }
  }

  startSpeechRecognition() {
    if (this.isRecording || this.isStartingRecognition) return;

    // Immediately stop/cancel assistant speech synthesis so mic doesn't catch bot audio
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }

    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) return;

    this.isStartingRecognition = true;
    this.wasVoiceTriggered = true;

    try {
      this.recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed. Re-initializing instance...', err);
      this.initRecognition();
      try {
        if (this.recognition) {
          this.recognition.start();
        }
      } catch (err2) {
        console.error('Speech recognition retry failed:', err2);
        this.isStartingRecognition = false;
        this.isRecording = false;
        this.updateMicUiStopped();
      }
    }
  }

  stopSpeechRecognition(forceAbort = true) {
    this.isRecording = false;
    this.isStartingRecognition = false;
    this.updateMicUiStopped();

    if (this.recognition) {
      try {
        if (forceAbort) {
          this.recognition.abort();
        } else {
          this.recognition.stop();
        }
      } catch (e) {
        try { this.recognition.abort(); } catch (e2) {}
      }
    }
  }

  toggleSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (typeof showToastAlert === 'function') {
        showToastAlert('Voice STT Note', 'Your browser does not currently support the Web Speech API. Please use keyboard input.');
      }
      return;
    }

    if (this.isRecording || this.isStartingRecognition) {
      // User clicked stop: abort immediately to release microphone hardware with zero hang
      this.stopSpeechRecognition(true);
      // Re-initialize recognition right away to guarantee a fresh, responsive instance for the next click
      this.initRecognition();
    } else {
      // User clicked start
      this.startSpeechRecognition();
    }
  }

  setLauncherSpeakingState(isSpeaking, customHint) {
    if (!this.floatingChatLauncher) return;
    if (isSpeaking) {
      this.floatingChatLauncher.classList.add('is-speaking');
      this.floatingChatLauncher.classList.remove('is-listening');
      if (this.chatLauncherIcon) this.chatLauncherIcon.style.display = 'none';
      if (this.launcherVoiceBars) this.launcherVoiceBars.style.display = 'flex';
      if (this.launcherPillHint) {
        this.launcherPillHint.textContent = customHint || 'BudgetBee Speaking... 🔊';
      }
    } else {
      this.floatingChatLauncher.classList.remove('is-speaking');
      if (this.chatLauncherIcon) this.chatLauncherIcon.style.display = '';
      if (this.launcherVoiceBars) this.launcherVoiceBars.style.display = 'none';
      if (this.launcherPillHint) {
        this.launcherPillHint.textContent = 'Ask BudgetBee 🐝';
      }
    }
  }

  setLauncherListeningState(isListening) {
    if (!this.floatingChatLauncher) return;
    if (isListening) {
      this.floatingChatLauncher.classList.add('is-listening');
      this.floatingChatLauncher.classList.remove('is-speaking');
      if (this.launcherPillHint) {
        this.launcherPillHint.textContent = 'Listening to you... 🎙️';
      }
    } else {
      this.floatingChatLauncher.classList.remove('is-listening');
      if (!this.floatingChatLauncher.classList.contains('is-speaking') && this.launcherPillHint) {
        this.launcherPillHint.textContent = 'Ask BudgetBee 🐝';
      }
    }
  }

  updateMicUiRecording() {
    this.isRecording = true;
    this.micBtns.forEach(btn => {
      btn.classList.add('recording');
      btn.title = "Listening to your voice... Click to Stop";
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = 'bi bi-stop-circle-fill text-danger fs-5';
      }
    });
    this.setLauncherListeningState(true);
    if (this.botStatusText) {
      this.botStatusText.innerHTML = '<span class="spinner-grow spinner-grow-sm text-danger" style="width: 6px; height: 6px;"></span> Listening...';
    }
  }

  updateMicUiStopped() {
    this.isRecording = false;
    this.micBtns.forEach(btn => {
      btn.classList.remove('recording');
      btn.title = "Click to ask with your voice (Microphone)";
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = 'bi bi-mic-fill fs-5';
      }
    });
    this.setLauncherListeningState(false);
    if (this.botStatusText && (!this.synth || !this.synth.speaking)) {
      this.botStatusText.innerHTML = '<span class="spinner-grow spinner-grow-sm text-success" style="width: 6px; height: 6px;"></span> Active & Voice Enabled';
    }
  }

  setupVoiceSynthesis() {
    if (!this.synth) return;
    const populateVoices = () => {
      const voices = this.synth.getVoices();
      this.selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Female'))) || voices[0];
    };
    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoices;
    }
  }

  speak(text) {
    if (!this.synth || !this.isVoiceEnabled) {
      if (this.isAutoMicEnabled && this.wasVoiceTriggered) {
        setTimeout(() => {
          if (!this.isRecording) {
            this.startSpeechRecognition();
          }
        }, 600);
      }
      return;
    }
    const cleanText = text.replace(/[*_#`~•]/g, '');
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.rate = 1.02;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      this.setLauncherSpeakingState(true);
      if (this.botStatusText) {
        this.botStatusText.innerHTML = '<span class="spinner-grow spinner-grow-sm text-warning" style="width: 6px; height: 6px;"></span> Speaking...';
      }
    };

    utterance.onend = () => {
      this.setLauncherSpeakingState(false);
      if (this.botStatusText && !this.isRecording) {
        this.botStatusText.innerHTML = '<span class="spinner-grow spinner-grow-sm text-success" style="width: 6px; height: 6px;"></span> Active & Voice Enabled';
      }
      // Continuous Voice Auto-Mic Continuation (All-Time Listening)
      if (this.isAutoMicEnabled) {
        setTimeout(() => {
          if (!this.isRecording && (!this.synth || !this.synth.speaking)) {
            this.startSpeechRecognition();
          }
        }, 550);
      }
      this.wasVoiceTriggered = false;
    };

    utterance.onerror = () => {
      this.setLauncherSpeakingState(false);
      if (this.botStatusText && !this.isRecording) {
        this.botStatusText.innerHTML = '<span class="spinner-grow spinner-grow-sm text-success" style="width: 6px; height: 6px;"></span> Active & Voice Enabled';
      }
      this.wasVoiceTriggered = false;
    };

    this.synth.speak(utterance);
  }

  bindEvents() {
    // Send Buttons
    this.sendBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleSendMessage());
    });

    // Enter Key on Inputs
    this.inputFields.forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSendMessage(input.value);
        }
      });
    });

    // Voice Mic Buttons
    this.micBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleSpeechRecognition();
      });
    });

    // TTS Toggle Buttons
    this.ttsToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.isVoiceEnabled = !this.isVoiceEnabled;
        this.updateTtsToggleButtons();
      });
    });

    // All-Time / Continuous Listening Button on Floating Window Header
    if (this.btnToggleAllTimeListening) {
      this.updateAllTimeListeningUi();
      this.btnToggleAllTimeListening.addEventListener('click', () => {
        this.isAutoMicEnabled = !this.isAutoMicEnabled;
        localStorage.setItem('bb_auto_mic', this.isAutoMicEnabled ? 'true' : 'false');
        this.updateAllTimeListeningUi();
        if (typeof showToastAlert === 'function') {
          showToastAlert(
            'All-Time Listening',
            this.isAutoMicEnabled ? 'Continuous Voice ON: Microphone will automatically listen after assistant responses.' : 'Continuous Voice OFF.'
          );
        }
        if (this.isAutoMicEnabled && !this.isRecording && (!this.synth || !this.synth.speaking)) {
          this.startSpeechRecognition();
        }
      });
    }

    // Quick Voice & Topic Prompts Strip (.quick-chip)
    const quickChips = document.querySelectorAll('.quick-chip');
    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-query') || chip.textContent.trim();
        this.handleSendMessage(cmd);
      });
    });
  }

  updateAllTimeListeningUi() {
    if (!this.btnToggleAllTimeListening) return;
    if (this.isAutoMicEnabled) {
      if (this.iconAllTimeListening) this.iconAllTimeListening.className = 'bi bi-arrow-repeat text-warning';
      if (this.textAllTimeListening) this.textAllTimeListening.textContent = 'Auto-Mic: ON';
      this.btnToggleAllTimeListening.title = 'Continuous Listening: ON (Auto re-arms mic after speaking)';
    } else {
      if (this.iconAllTimeListening) this.iconAllTimeListening.className = 'bi bi-arrow-repeat text-white-50';
      if (this.textAllTimeListening) this.textAllTimeListening.textContent = 'Auto-Mic: OFF';
      this.btnToggleAllTimeListening.title = 'Continuous Listening: OFF (Click to enable auto-mic)';
    }
  }

  autoMinimizeChatbotIfOpen() {
    if (typeof window.toggleFloatingChatbot === 'function') {
      window.toggleFloatingChatbot(false);
    }
  }

  updateTtsToggleButtons() {
    this.ttsToggleBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (this.isVoiceEnabled) {
        if (icon) icon.className = 'bi bi-volume-up-fill fs-6';
        btn.classList.remove('btn-outline-secondary', 'btn-secondary', 'btn-outline-light');
        if (btn.id === 'btnToggleTtsModal') {
          btn.classList.add('btn-warning');
        } else {
          btn.classList.add('btn-primary-gradient');
        }
        btn.title = 'Voice Output: ON (Click to mute)';
      } else {
        if (icon) icon.className = 'bi bi-volume-mute-fill fs-6';
        btn.classList.remove('btn-primary-gradient', 'btn-warning');
        if (btn.id === 'btnToggleTtsModal') {
          btn.classList.add('btn-outline-light');
        } else {
          btn.classList.add('btn-outline-secondary');
        }
        btn.title = 'Voice Output: MUTED (Click to activate)';
        if (this.synth) this.synth.cancel();
      }
    });

    if (this.ttsStatusTextModal) {
      this.ttsStatusTextModal.textContent = this.isVoiceEnabled ? 'Audio ON' : 'Audio MUTED';
    }

    if (this.isVoiceEnabled && typeof showToastAlert === 'function') {
      showToastAlert('Voice Output Enabled', 'BudgetBee AI will speak responses out loud.');
    }
  }

  trackRealtimeScrollInterests() {
    // Dynamically adjust user interests based on active page viewport section
    let scrollTimeout = null;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const sections = [
          { id: 'calculator-50-30-20', interest: 'budget_calc' },
          { id: 'savings-goals', interest: 'savings_goals' },
          { id: 'money-mistakes', interest: 'avoid_mistakes' },
          { id: 'budget-invoice', interest: 'invoice_print' },
          { id: 'needs-vs-wants', interest: 'needs_wants' },
          { id: 'about-and-contact', interest: 'about' }
        ];

        const vhMiddle = window.innerHeight / 2;
        for (const s of sections) {
          const el = document.getElementById(s.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= vhMiddle && rect.bottom >= vhMiddle) {
              this.recordInterest(s.interest);
              break;
            }
          }
        }
      }, 300);
    }, { passive: true });
  }

  recordInterest(interestKey) {
    if (!interestKey) return;
    this.activeInterests = this.activeInterests.filter(x => x !== interestKey);
    this.activeInterests.unshift(interestKey);
    if (this.activeInterests.length > 5) {
      this.activeInterests.pop();
    }
  }

  renderInitialGreeting() {
    const sym = (window.BB_STATE && window.BB_STATE.currentCurrency) || 'Rs.';
    const greeting = "Hello! I am **BudgetBee AI**, your personal student finance pilot! 🐝\n\nI can **control the entire application** for you in real-time:\n• *'Calculate budget of 50000'* (handles *fifty thousands*, *50 000*, *50k*)\n• *'Generate an invoice and print it'*\n• *'Go to About section'*, *'Go to Savings Goals'*, or *'Go to Basics'*\n• *'Switch currency to PKR'* or *'Toggle dark mode'*\n\nHow can I help you manage your student finances today?";
    const suggestions = this.getWorkingInterestSuggestions();
    this.appendBotMessage(greeting, suggestions, false);
  }

  handleSendMessage(overrideText) {
    if (this.isTyping) return;
    let text = overrideText;
    if (!text) {
      for (const input of this.inputFields) {
        if (input.value.trim()) {
          text = input.value.trim();
          break;
        }
      }
    }
    if (!text) return;

    this.inputFields.forEach(input => input.value = '');
    this.appendUserMessage(text);
    this.processQuery(text);
  }

  appendUserMessage(text) {
    this.messagesContainers.forEach(container => {
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble user';
      bubble.textContent = text;
      container.appendChild(bubble);
    });
    if (this.voiceTranscriptCard) {
      this.voiceTranscriptCard.innerHTML = `<span class="text-white"><i class="bi bi-person-fill text-warning me-1"></i> <strong>You:</strong> "${text}"</span>`;
    }
    this.scrollToBottom();
  }

  // =========================================================================
  // Robust Number & Text Exception Parser
  // Handles: "50 000", "50,000", "50k", "fifty thousands", "one lakh", etc.
  // =========================================================================
  parseSpokenOrTextNumber(inputStr) {
    if (!inputStr) return null;
    const str = inputStr.toLowerCase().trim();

    // 1. Regex for numbers with spaces, commas, or k/m/thousand suffix
    // Examples: "50 000", "50,000", "50000", "50k", "50 k", "rs. 50 000", "pkr 60000"
    const digitMatch = str.match(/(?:rs\.?|pkr|\$|€|£)?\s*(\d[\d\s,]*\.?\d*)\s*(k|thousand|thousands|lac|lacs|lakh|lakhs|m|million|millions)?\b/i);
    if (digitMatch && digitMatch[1]) {
      const cleanDigits = digitMatch[1].replace(/[\s,]/g, '');
      let val = parseFloat(cleanDigits);
      if (!isNaN(val)) {
        const suf = (digitMatch[2] || '').toLowerCase();
        if (suf === 'k' || suf.startsWith('thousand')) val *= 1000;
        else if (suf.startsWith('lac') || suf.startsWith('lakh')) val *= 100000;
        else if (suf.startsWith('million')) val *= 1000000;
        if (val > 0) return Math.round(val);
      }
    }

    // 2. English text word numbers
    // Examples: "fifty thousand", "fifty thousands", "twenty five thousand", "one lakh", "five thousand"
    const wordsMap = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
      'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
      'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
      'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
    };

    const scaleMap = {
      'hundred': 100,
      'thousand': 1000,
      'thousands': 1000,
      'k': 1000,
      'lakh': 100000,
      'lakhs': 100000,
      'lac': 100000,
      'lacs': 100000,
      'million': 1000000,
      'millions': 1000000
    };

    const tokens = str.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
    let total = 0;
    let current = 0;
    let foundWord = false;

    for (const tok of tokens) {
      if (wordsMap[tok] !== undefined) {
        current += wordsMap[tok];
        foundWord = true;
      } else if (tok === 'hundred') {
        current = (current === 0 ? 1 : current) * 100;
        foundWord = true;
      } else if (scaleMap[tok] !== undefined) {
        current = (current === 0 ? 1 : current) * scaleMap[tok];
        total += current;
        current = 0;
        foundWord = true;
      }
    }
    total += current;

    if (foundWord && total > 0) {
      return total;
    }

    return null;
  }

  // =========================================================================
  // Process Query: Pending Action Check -> UI Control -> FAQ Match -> Suggestions
  // =========================================================================
  processQuery(rawText) {
    // Normalize query text: map "versus" and "vs." to standard "vs"
    const query = rawText.toLowerCase().trim()
      .replace(/\bversus\b/gi, 'vs')
      .replace(/\bvs\.\b/gi, 'vs')
      .replace(/\s+/g, ' ');

    // Show typing indicator
    const placeholders = [];
    this.messagesContainers.forEach(container => {
      const indicator = document.createElement('div');
      indicator.className = 'chat-bubble bot typing-placeholder';
      indicator.innerHTML = '<span class="spinner-grow spinner-grow-sm text-primary me-2"></span> BudgetBee is processing...';
      container.appendChild(indicator);
      placeholders.push(indicator);
    });
    this.scrollToBottom();

    this.isTyping = true;

    setTimeout(() => {
      placeholders.forEach(el => el.remove());
      this.isTyping = false;

      // 1. Check Multi-turn Pending Dialog Actions
      if (this.pendingAction) {
        const handledPending = this.handlePendingAction(query, rawText);
        if (handledPending) return;
      }

      // 2. Check UI Control Commands
      const handledUiControl = this.handleUiControlCommand(query, rawText);
      if (handledUiControl) return;

      // 3. Check FAQ Knowledge Base
      this.handleFaqIntent(query);
    }, 500);
  }

  // =========================================================================
  // Multi-Turn Pending Action Handler
  // =========================================================================
  handlePendingAction(query, rawText) {
    const action = this.pendingAction;

    // Cancellation check
    if (/^(cancel|stop|nevermind|back|quit|exit)$/i.test(query)) {
      this.pendingAction = null;
      this.appendBotMessage("Action cancelled. How else can I assist your budgeting?", this.getWorkingInterestSuggestions(), true);
      return true;
    }

    // Action A: Calculate Budget (User was asked for amount)
    if (action.type === 'calculate_budget') {
      const amount = this.parseSpokenOrTextNumber(query);
      if (amount && amount > 0) {
        this.pendingAction = null;
        this.executeBudgetCalculation(amount);
        return true;
      } else {
        const sym = (window.BB_STATE && window.BB_STATE.currentCurrency) || 'Rs.';
        this.appendBotMessage(`Please provide a valid monthly amount to calculate the 50-30-20 budget (e.g., **50000**, **fifty thousands**, or **50k**):`, [
          `50,000`, `30,000`, `75,000`, `Cancel`
        ], true);
        return true;
      }
    }

    // Action B: Generate Invoice & Print (User was asked for details)
    if (action.type === 'generate_invoice') {
      const amount = this.parseSpokenOrTextNumber(query);
      if (amount && amount > 0) {
        const nameMatch = rawText.match(/([a-zA-Z\s]+)[,\s]+(?:\d|fifty|thirty|twenty|one)/i);
        const studentName = nameMatch ? nameMatch[1].trim() : (action.studentName || 'Student Learner');
        this.pendingAction = null;
        this.executeGenerateInvoice(studentName, amount, action.printImmediately);
        return true;
      } else if (query.includes('print current') || query.includes('current blueprint')) {
        this.pendingAction = null;
        if (typeof window.printInvoiceFromChatbot === 'function') {
          window.printInvoiceFromChatbot();
        }
        this.appendBotMessage("🖨️ **Printing Current Budget Blueprint!** Your browser print dialog is open.", this.getWorkingInterestSuggestions(), true);
        return true;
      } else {
        this.appendBotMessage(`Please provide your monthly budget amount so I can generate your printable blueprint (e.g., *Alex, 50000* or *50k*):`, [
          `Student, 50000`, `Alex, 75000`, `Print current blueprint`, `Cancel`
        ], true);
        return true;
      }
    }

    // Action C: Set Savings Goal (User was asked for target)
    if (action.type === 'set_goal') {
      const amount = this.parseSpokenOrTextNumber(query);
      if (amount && amount > 0) {
        let goalName = "Campus Milestone";
        if (/laptop|macbook/i.test(query)) goalName = "Campus Laptop Upgrade";
        else if (/emergency|safety/i.test(query)) goalName = "Emergency Safety Fund";
        else if (/trip|travel/i.test(query)) goalName = "Semester Break Trip";
        else if (/bike|transport/i.test(query)) goalName = "Campus Commute Vehicle";

        this.pendingAction = null;
        this.executeSetGoal(goalName, amount);
        return true;
      } else {
        this.appendBotMessage(`Please specify your goal target amount (e.g., *Laptop 80000* or *Emergency 40000*):`, [
          `Laptop 80000`, `Emergency 40000`, `Semester Trip 25000`, `Cancel`
        ], true);
        return true;
      }
    }

    return false;
  }

  // =========================================================================
  // Direct UI Control Commands
  // =========================================================================
  handleUiControlCommand(query, rawText) {
    // 1. Navigation Commands ("go to about", "go to savings goals", etc.)
    const navMap = [
      { triggers: ['about', 'about us', 'contact', 'feedback', 'vision', 'mission'], section: 'about-and-contact', name: 'About BudgetBasics & Feedback' },
      { triggers: ['basics', 'budgeting basics', 'fixed expense', 'variable expense', 'module 1'], section: 'budgeting-basics', name: 'Module 1: Budgeting Basics' },
      { triggers: ['needs vs wants', 'needs and wants', 'needs wants', 'needs versus wants', 'quiz', 'game', 'module 2'], section: 'needs-vs-wants', name: 'Module 2: Needs vs Wants' },
      { triggers: ['50-30-20', '50 30 20', 'calculator', 'module 3', 'split rule'], section: 'calculator-50-30-20', name: 'Module 3: 50-30-20 Calculator' },
      { triggers: ['savings goal', 'savings goals', 'set goal', 'set goals', 'timeline', 'simulator', 'module 4', 'goals'], section: 'savings-goals', name: 'Module 4: Savings Goals Simulator' },
      { triggers: ['expense planner', 'planner', 'table', 'spending log', 'module 5'], section: 'expense-planner', name: 'Module 5: Expense Planner' },
      { triggers: ['money mistakes', 'mistakes', 'ghost subscription', 'subscriptions', 'module 6', 'latte factor'], section: 'money-mistakes', name: 'Module 6: Money Mistakes & Audit' },
      { triggers: ['invoice', 'budget plan', 'printable', 'blueprint', 'pdf', 'module 7', 'generator'], section: 'budget-invoice', name: 'Module 7: Printable Budget Blueprint' }
    ];

    // Check specific navigation requests
    if (query.startsWith('go to') || query.startsWith('show') || query.startsWith('open') || query.startsWith('navigate') || query.includes('section')) {
      for (const item of navMap) {
        if (item.triggers.some(t => query.includes(t))) {
          // If query also specifies calculate/print/generate, let specialized handlers handle it
          if (!query.includes('calculate') && !query.includes('print') && !query.includes('generate')) {
            if (typeof window.navigateToSectionFromChatbot === 'function') {
              window.navigateToSectionFromChatbot(item.section);
            }
            if (this.wasVoiceTriggered) {
              this.autoMinimizeChatbotIfOpen();
              this.setLauncherSpeakingState(true, `Navigated to ${item.name}`);
            }
            this.recordInterest(item.section);
            this.appendBotMessage(`📍 Navigated your screen directly to **${item.name}**!`, this.getWorkingInterestSuggestions(), true);
            return true;
          }
        }
      }
    }

    // Sitemap Modal command
    if (/sitemap|site map|flow diagram/i.test(query)) {
      const modalEl = document.getElementById('sitemapModal');
      if (modalEl && typeof bootstrap !== 'undefined') {
        if (this.wasVoiceTriggered) {
          this.autoMinimizeChatbotIfOpen();
          this.setLauncherSpeakingState(true, 'Opening Site Map');
        }
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
        this.appendBotMessage("🗺️ Opened the **BudgetBasics Site Map Flow** modal! Explore the complete learning journey.", [
          "Go to 50-30-20 Calculator", "Go to Savings Goals", "Print Budget Blueprint"
        ], true);
        return true;
      }
    }

    // 2. Theme Toggle Commands
    if (/dark mode|enable dark|night mode|switch to dark/i.test(query)) {
      if (typeof applyTheme === 'function') applyTheme('dark');
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Dark mode activated');
      }
      this.appendBotMessage("🌙 **Dark Mode Activated!** Soft, dark-theme friendly styling is now active.", this.getWorkingInterestSuggestions(), true);
      return true;
    }
    if (/light mode|enable light|day mode|switch to light/i.test(query)) {
      if (typeof applyTheme === 'function') applyTheme('light');
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Light mode activated');
      }
      this.appendBotMessage("☀️ **Light Mode Activated!** Switched to daytime SaaS theme.", this.getWorkingInterestSuggestions(), true);
      return true;
    }
    if (/toggle theme|switch theme/i.test(query)) {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const targetTheme = current === 'dark' ? 'light' : 'dark';
      if (typeof applyTheme === 'function') applyTheme(targetTheme);
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, `Theme: ${targetTheme}`);
      }
      this.appendBotMessage(`🎨 Theme toggled to **${targetTheme.toUpperCase()}**!`, this.getWorkingInterestSuggestions(), true);
      return true;
    }

    // 3. Multi-Currency Switching Commands (Handling PKR requirement)
    if (/switch (?:currency )?to pkr|currency pkr|set (?:currency )?to pkr|\bpkr\b/i.test(query)) {
      this.setAppCurrency('Rs.');
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Switched to PKR (Rs.)');
      }
      this.appendBotMessage("🇵🇰 Switched active currency to **Pakistani Rupee (PKR - Rs.)**! All calculators, item cost cards, and printable blueprints now use **Rs.**", [
        "Calculate budget of 50000", "Set laptop goal 75000", "Generate & print invoice"
      ], true);
      return true;
    }
    if (/switch (?:currency )?to usd|currency usd|set (?:currency )?to usd|\busd\b|\$/i.test(query)) {
      this.setAppCurrency('$');
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Switched to USD ($)');
      }
      this.appendBotMessage("💵 Switched active currency to **US Dollar ($)**!", [
        "Calculate budget of 1200", "Set emergency fund 500", "Switch to PKR"
      ], true);
      return true;
    }
    if (/switch (?:currency )?to eur|currency eur|\beur\b|euro/i.test(query)) {
      this.setAppCurrency('€');
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Switched to Euro (€)');
      }
      this.appendBotMessage("💶 Switched active currency to **Euro (€)**!", this.getWorkingInterestSuggestions(), true);
      return true;
    }
    if (/switch (?:currency )?to gbp|currency gbp|\bgbp\b|pound/i.test(query)) {
      this.setAppCurrency('£');
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Switched to Pound (£)');
      }
      this.appendBotMessage("💷 Switched active currency to **British Pound (£)**!", this.getWorkingInterestSuggestions(), true);
      return true;
    }

    // 4. Budget Creation & Calculation Commands ("create budget", "make budget", "calculate budget of 50000", "split 50000", "50-30-20 of 1200", etc.)
    if (/(?:calculate|split|create|make|build|plan|prepare|start)\s+(?:(?:a\s+|my\s+)?budget|(?:the\s+)?50[- ]30[- ]20)|\b(?:budget\s+of|allocation\s+for|split\s+\d+|calculate\s+\d+)\b/i.test(query)) {
      const amount = this.parseSpokenOrTextNumber(query);
      if (amount && amount > 0) {
        this.executeBudgetCalculation(amount);
        return true;
      } else {
        if (typeof window.navigateToSectionFromChatbot === 'function') {
          window.navigateToSectionFromChatbot('calculator-50-30-20');
        }
        if (this.wasVoiceTriggered) {
          this.autoMinimizeChatbotIfOpen();
          this.setLauncherSpeakingState(true, 'Ready to build budget');
        }
        this.pendingAction = { type: 'calculate_budget' };
        const sym = (window.BB_STATE && window.BB_STATE.currentCurrency) || 'Rs.';
        const isPkr = sym === 'Rs.';
        this.appendBotMessage(
          "I'm ready to calculate and build your personalized **50-30-20 Budget**! 💰\n\n" +
          "**What is your monthly allowance or net income?**\n" +
          "*(You can type or say amounts like 50000, 30000, 1200, fifty thousand, or 50k)*",
          isPkr ? [`50,000`, `30,000`, `75,000`, `100,000`] : [`1,200`, `800`, `1,500`, `2,000`],
          true
        );
        return true;
      }
    }

    // 5. Invoice Generation & Printing Commands
    // Handles: "print invoice of 1200", "print invoice of Alex 50000", "print invoice", "print blueprint", "generate invoice of 50000", "invoice of 1200", etc.
    if (/(?:print|generate|create|make|export)\s+(?:an?\s+)?(?:invoice|blueprint|budget\s+plan|pdf)\b|\b(?:invoice|blueprint|budget\s+plan)\s+of\b|^print\s+(?:an?\s+)?(?:invoice|blueprint|budget\s+plan)|^print$/i.test(query)) {
      const amount = this.parseSpokenOrTextNumber(query);
      const isPrint = /print|pdf/i.test(query);

      // Extract student name if specified (e.g., "print invoice of Alex 50000", "invoice for John 35000")
      let studentName = null;
      const nameMatch = rawText.match(/(?:of|for)\s+([a-zA-Z]+)(?:\s+(?:for|of|\d|fifty|thirty|twenty|forty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine|ten|rs|\$))/i)
        || rawText.match(/(?:of|for)\s+([a-zA-Z]{3,20})\b/i);

      if (nameMatch && nameMatch[1]) {
        const candidate = nameMatch[1].trim();
        const stopWords = ['a', 'an', 'the', 'my', 'our', 'new', 'current', 'blueprint', 'invoice', 'plan', 'student', 'budget', 'all', 'now'];
        if (!stopWords.includes(candidate.toLowerCase())) {
          studentName = candidate.charAt(0).toUpperCase() + candidate.slice(1);
        }
      }
      if (!studentName) {
        studentName = document.getElementById('invStudentName')?.value || 'Student Learner';
      }

      // Case A: Amount provided in command -> immediate blueprint generation (and print if requested)
      if (amount && amount > 0) {
        this.executeGenerateInvoice(studentName, amount, isPrint);
        return true;
      }

      // Case B: User specified "of" or "for" (e.g., "print invoice of...", "invoice of...") without a parsed amount
      if (/\b(?:of|for)\b/i.test(query)) {
        this.pendingAction = { type: 'generate_invoice', studentName, printImmediately: isPrint };
        const sym = (window.BB_STATE && window.BB_STATE.currentCurrency) || 'Rs.';
        const isPkr = sym === 'Rs.';
        this.appendBotMessage(
          `Please provide the monthly budget amount for ${studentName}'s printable blueprint (e.g., **${isPkr ? '50000' : '1200'}**, or **${isPkr ? 'Alex 50000' : 'Alex 1200'}**):`,
          isPkr ? [`${studentName}, 50000`, `${studentName}, 75000`, `Print current blueprint`, `Cancel`]
                : [`${studentName}, 1200`, `${studentName}, 1500`, `Print current blueprint`, `Cancel`],
          true
        );
        return true;
      }

      // Case C: Print command without amount -> print current blueprint on page
      if (isPrint) {
        if (typeof window.printInvoiceFromChatbot === 'function') {
          window.printInvoiceFromChatbot();
        }
        if (this.wasVoiceTriggered) {
          this.autoMinimizeChatbotIfOpen();
          this.setLauncherSpeakingState(true, 'Printing Blueprint 🖨️');
        }
        this.recordInterest('invoice_print');
        this.appendBotMessage("🖨️ **Print & PDF Export Triggered!**\n\nI have navigated to your **Printable Budget Blueprint** and opened the browser print dialog. Select **'Save as PDF'** to store an offline copy.", [
          "Generate new budget plan", "Calculate 50,000 budget", "Go to Savings Goals"
        ], true);
        return true;
      }

      // Case D: Generate without amount -> prompt user
      this.pendingAction = { type: 'generate_invoice', studentName, printImmediately: false };
      this.appendBotMessage("I can generate your **Certified Student Budget Blueprint**! 📋\n\n**Please provide your name and monthly budget amount**\n*(e.g., type 'Alex 50000' or simply '50000')*", [
        `Student, 50000`, `Alex, 75000`, `Print current blueprint`
      ], true);
      return true;
    }

    // 6. Savings Goal Simulation Command
    // Handles: "set goals", "set goal", "set a goal", "set savings goals", "set goal for laptop 80000", "save for trip 25000", "savings goals", etc.
    if (/(?:set|create|plan|start|simulate|make)\s+(?:a\s+|my\s+)?(?:savings\s+)?goals?\b|\b(?:savings\s+goals?|save\s+for|goal\s+for)\b/i.test(query)) {
      const amount = this.parseSpokenOrTextNumber(query);
      if (amount && amount > 0) {
        let goalName = "Campus Milestone";
        if (/laptop|macbook|computer/i.test(query)) goalName = "Campus Laptop Upgrade";
        else if (/emergency|safety|buffer/i.test(query)) goalName = "Emergency Safety Fund";
        else if (/trip|travel|vacation|tour/i.test(query)) goalName = "Semester Break Trip";
        else if (/phone|mobile|iphone/i.test(query)) goalName = "Phone Replacement";
        else if (/bike|motorcycle|scooter|commute|car/i.test(query)) goalName = "Campus Commute Vehicle";
        else if (/tuition|semester|fees/i.test(query)) goalName = "Semester Tuition Reserve";
        else {
          const customMatch = rawText.match(/(?:goal\s+(?:for|of|to)|save\s+for)\s+([a-zA-Z\s]{2,25}?)(?:\s+(?:for|of|to)?\s*(?:\d|fifty|thirty|twenty|forty|one|two|three|rs|\$))/i);
          if (customMatch && customMatch[1]) {
            const rawName = customMatch[1].trim();
            if (!/^(a|my|the|new|some)$/i.test(rawName)) {
              goalName = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
          }
        }

        this.executeSetGoal(goalName, amount);
        return true;
      } else {
        if (typeof window.navigateToSectionFromChatbot === 'function') {
          window.navigateToSectionFromChatbot('savings-goals');
        }
        if (this.wasVoiceTriggered) {
          this.autoMinimizeChatbotIfOpen();
          this.setLauncherSpeakingState(true, 'Configuring Savings Goal');
        }
        this.pendingAction = { type: 'set_goal' };
        const sym = (window.BB_STATE && window.BB_STATE.currentCurrency) || 'Rs.';
        const isPkr = sym === 'Rs.';
        this.appendBotMessage(
          "Let's configure your personal savings goal! 🎯\n\n" +
          "**What is your goal name and target amount?**\n" +
          `*(e.g., '${isPkr ? 'Laptop 80000' : 'Laptop 1200'}' or '${isPkr ? 'Emergency 40000' : 'Emergency 500'}')*`,
          isPkr ? [`Laptop 80000`, `Emergency 40000`, `Semester Trip 25000`, `Cancel`]
                : [`Laptop 1200`, `Emergency Fund 500`, `Semester Trip 350`, `Cancel`],
          true
        );
        return true;
      }
    }

    // 7. FAQs Hub / Directory Command
    // Handles: "faqs", "faq", "frequently asked questions", "common questions", "top faqs", "show faqs", etc.
    if (/^(?:show\s+|view\s+|open\s+|what\s+are\s+the\s+)?(?:faqs?|frequently\s+asked\s+questions|common\s+questions|top\s+faqs|all\s+faqs)(?:\s+list)?$/i.test(query) || query === 'faq' || query === 'faqs') {
      this.recordInterest('budget_calc');
      this.appendBotMessage(
        "📚 **Frequently Asked Questions (FAQs) — Student Finance Hub:**\n\n" +
        "Here are the most common questions student learners ask BudgetBee:\n\n" +
        "1. **Needs vs. Wants**: How to separate true essentials from comfort spending.\n" +
        "2. **50-30-20 Rule**: How to allocate monthly allowances across categories.\n" +
        "3. **Avoid Overspending**: Using the 48-Hour Waiting Rule & subscription audits.\n" +
        "4. **The Latte Factor**: How micro daily purchases add up to thousands.\n" +
        "5. **Start Saving**: Building a student emergency safety fund ($300–$500).\n" +
        "6. **Tight Allowance**: Flexible 70-20-10 ratios & student discount perks.\n\n" +
        "💡 *Click any suggestion chip below to get the immediate, detailed answer:*",
        [
          "What is a need vs want?",
          "Explain the 50-30-20 rule",
          "How do I avoid overspending?",
          "What is the Latte Factor?",
          "How to start saving?",
          "Audit ghost subscriptions"
        ],
        true
      );
      return true;
    }

    // 8. Needs vs Wants Direct Intent (Normalizes "versus" to "vs")
    if (/(?:what\s+is\s+)?(?:a\s+)?needs?\s+(?:vs|versus|and)\s+wants?/i.test(query) || /difference\s+between\s+needs?\s+(?:vs|versus|and)\s+wants?/i.test(query)) {
      if (typeof window.navigateToSectionFromChatbot === 'function') {
        window.navigateToSectionFromChatbot('needs-vs-wants');
      }
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Needs vs Wants');
      }
      this.recordInterest('needs_wants');
      this.appendBotMessage(
        "⚖️ **Needs vs. Wants — The Foundation of Budgeting:**\n\n" +
        "• **Needs (Essential Survival & Academics)**: Rent/dorm fees, essential groceries, public transit, course tuition, required books, and urgent healthcare. Without these, your life or studies pause.\n\n" +
        "• **Wants (Comfort & Lifestyle)**: Café lattes, food delivery apps, new gaming titles, impulse fashion, and paid streaming tiers. These are enjoyable, but optional.\n\n" +
        "💡 *Golden Rule*: When allowance is tight, preserve Needs first, cap Wants at 30%, and use the **48-Hour Waiting Rule** before buying any want!",
        [
          "Take Needs vs Wants Quiz",
          "Explain 48-Hour Waiting Rule",
          "Calculate 50-30-20 budget",
          "What is the Latte Factor?"
        ],
        true
      );
      return true;
    }

    // 9. 50-30-20 Rule Direct Intent
    if (/(?:what\s+is\s+|explain\s+)?(?:the\s+)?50[- ]30[- ]20(?:\s+rule)?/i.test(query) && !/(?:calculate|split|budget\s+of)/i.test(query)) {
      if (typeof window.navigateToSectionFromChatbot === 'function') {
        window.navigateToSectionFromChatbot('calculator-50-30-20');
      }
      this.recordInterest('budget_calc');
      this.appendBotMessage(
        "📊 **The 50-30-20 Budgeting Rule:**\n\n" +
        "The gold-standard financial allocation framework for students and young adults:\n\n" +
        "• **50% Needs**: Essential living costs (dorm/rent, groceries, transit, utilities).\n" +
        "• **30% Wants**: Discretionary lifestyle spending (cafés, streaming, hobbies, outings).\n" +
        "• **20% Savings**: Emergency safety fund, debt payoff, or future gadget goals.\n\n" +
        "💡 *Interactive Calculator*: Enter your monthly income below to see your personalized dollar/rupee split live!",
        [
          "Calculate budget of 50000",
          "Calculate budget of 1200",
          "What if I have low income?",
          "Set a Savings Goal"
        ],
        true
      );
      return true;
    }

    // 10. Problem Solving: How Can I Manage My Budgets?
    if (/how (?:can i|to|do i) manage (?:my )?budgets?|manage (?:my )?budgets?|budget management/i.test(query)) {
      this.recordInterest('budget_calc');
      this.appendBotMessage("📋 **Step-by-Step Student Budget Management Blueprint:**\n\n1. **Calculate Net Monthly Inflow**: Sum up allowances, scholarships, campus stipends, and gifts.\n2. **Apply the 50-30-20 Rule**: Cap Needs at 50%, Wants at 30%, and immediately lock in 20% to savings.\n3. **Weekly Bucketing**: Divide your 30% discretionary wants into 4 weekly envelopes (~$75–$90/week). When the week's cash is out, pause until next Monday!\n4. **Audit Weekly**: Spend 5 minutes every Sunday night checking your spending against your budget.\n5. **Generate a Blueprint**: Use our on-page **Printable Budget Blueprint** to create and print a certified monthly plan!", [
        "Calculate budget of 1200", "How can I manage my expenses?", "How to cut down expenses?", "Print budget blueprint"
      ], true);
      return true;
    }

    // 11. Problem Solving: How Can I Manage My Expenses?
    if (/how (?:can i|to|do i) manage (?:my )?expenses?|manage (?:my )?expenses?|expense control|track expenses/i.test(query)) {
      this.recordInterest('expense_planner');
      this.appendBotMessage("📊 **How to Master & Manage Your Expenses:**\n\n1. **Categorize in Real-Time**: Group costs into Fixed (rent, tuition), Variable Essentials (groceries, transport), and Discretionary (cafés, outings).\n2. **Use the On-Page Expense Planner**: Log every purchase in our **Module 5: Expense Planner** table to see your exact remaining balance live.\n3. **Eliminate Micro-Leaks**: Target the **Latte Factor**—pack snacks and carry a refillable water flask.\n4. **Deploy the 48-Hour Waiting Rule**: Pause on all non-essential items over $25 for two full days.\n5. **Automate Fixed Payments**: Pay rent and utilities on day 1 so you only spend what is truly disposable.", [
        "How to cut down expenses?", "What is the Latte Factor?", "Open Expense Planner", "Avoid overspending"
      ], true);
      return true;
    }

    // 12. Problem Solving: How to Cut Down Expenses?
    if (/how to cut down expenses|cut down expenses|reduce expenses|how to reduce expenses|cut costs|lower spending|spend less/i.test(query)) {
      this.recordInterest('avoid_mistakes');
      this.appendBotMessage("✂️ **Top 6 Ways Students Can Cut Down Expenses Fast:**\n\n1. **Kill Dormant Subscriptions**: Cancel streaming apps or gym tiers unused for 14 days (saves $25–$50/mo).\n2. **Campus Meal Prepping**: Cooking oatmeal, lentils, and batch pasta cuts food spending by 50% compared to campus canteen food.\n3. **Free Textbooks**: Borrow from library reserves or buy senior editions at 70% off.\n4. **Student IDs Everywhere**: Claim 10%–50% tech discounts on Spotify, GitHub, Apple, and city transit.\n5. **Second-Hand First**: Buy dorm furniture, winter coats, and calculators used rather than brand new.\n6. **Walk or Bike Short Campus Distances**: Eliminate ride-share surge charges.", [
        "Running out of money before month end?", "Audit ghost subscriptions", "Grocery hacks", "Calculate budget of 1200"
      ], true);
      return true;
    }

    // 13. Problem Solving: Running Out of Money Before Month-End
    if (/running out of money|broke before month end|ran out of money|no money left|money runs out|end of month broke|broke student/i.test(query)) {
      this.recordInterest('budget_calc');
      this.appendBotMessage("🚨 **Emergency Survival Protocol When Running Out of Money Before Month-End:**\n\n1. **Emergency Freeze on Wants**: Put a 100% pause on eating out, takeaways, paid gaming, and paid rides immediately.\n2. **Campus Food Pantry & Meal Hacks**: Use university student pantry resources, dorm rice/lentils staples, and bulk eggs.\n3. **Switch to Weekly Allowance Envelopes**: If you get a lump sum, divide it by 4 weeks and only unlock one week's allowance at a time.\n4. **Run a Zero-Spend Weekend**: Challenge yourself to 48 hours of reading, campus gym, and free student club events.\n5. **Audit Bank Micro-Fees**: Ensure your student bank account has zero monthly maintenance fees and overdraft protection.", [
        "How can I manage my budgets?", "How to cut down expenses?", "What is an emergency fund?", "Set emergency fund 500"
      ], true);
      return true;
    }

    // 11. Problem Solving: Peer Pressure & FOMO Spending
    if (/peer pressure|friends spend too much|fomo spending|social pressure|eating out with friends|say no to friends/i.test(query)) {
      this.recordInterest('needs_wants');
      this.appendBotMessage("👥 **How to Handle Peer Pressure & Social Spending in College:**\n\n1. **Suggest Free/Low-Cost Alternatives**: Instead of pricey bistros, suggest campus picnics, dorm cooking sessions, or movie nights.\n2. **The Honest Script**: Use the phrase: *'I am saving for a major milestone (like a laptop/trip), so I am staying within my weekly cap this week.'* Friends will respect your ambition!\n3. **Eat Before You Go**: Eat a light meal at the hostel before joining friends at a café, then just order tea or a small drink.\n4. **Never Split Evenly on Unequal Orders**: Politely ask for separate checks or only pay for what you ordered.\n5. **Remember Your Goals**: A 2-hour hangout isn't worth 2 weeks of financial stress before finals.", [
        "Explain 48-Hour Waiting Rule", "What is a need vs want?", "Set a Savings Goal", "How can I manage my budgets?"
      ], true);
      return true;
    }

    // 12. Ghost Subscriptions Audit
    if (/audit ghost|ghost subscription|unused subscription|check subscription|cancel subscription/i.test(query)) {
      if (typeof window.navigateToSectionFromChatbot === 'function') {
        window.navigateToSectionFromChatbot('money-mistakes');
      }
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Auditing Subscriptions');
      }
      this.recordInterest('avoid_mistakes');
      this.appendBotMessage("👻 **Ghost Subscriptions Audited & Uncovered!**\n\nI have navigated you to **Module 6: Common Money Mistakes & Subscription Audit**.\n\n• **The Danger**: 82% of students pay for recurring streaming apps or cloud storage they haven't opened in 30 days.\n• **Action Protocol**: Check your payment method statements once a month. Cancel anything you haven't used in 14 days—you can always re-subscribe later!\n• **Annual Savings**: Canceling two $12/month dormant subscriptions saves **$288 each school year**!", [
        "What is the Latte Factor?", "Explain 48-Hour Waiting Rule", "Calculate budget of 1200", "Generate Budget Blueprint"
      ], true);
      return true;
    }

    // 13. 48-Hour Waiting Rule
    if (/48-hour|48 hour|24-hour|24 hour|waiting rule|impulse rule|impulse delay|48-hour protocol/i.test(query)) {
      this.recordInterest('needs_wants');
      this.appendBotMessage("⏳ **The 48-Hour Waiting Rule (Impulse Buster):**\n\nWhenever you feel an impulsive craving for an unplanned 'want' (like trending sneakers, gaming accessories, or daily takeout):\n\n1. **Pause & Wishlist**: Add it to a wishlist instead of immediate checkout.\n2. **Wait 48 Hours**: Sleep on it for two full days to clear dopamine.\n3. **Assess**: If the craving is still genuine after 48 hours and fits within your 30% Wants bucket, proceed guilt-free!\n\n💡 *Fact*: Over 70% of impulse buying urges disappear completely within 48 hours!", [
        "What is a need vs want?", "What is the Latte Factor?", "Calculate 50-30-20 budget", "Audit ghost subscriptions"
      ], true);
      return true;
    }

    // 14. The Latte Factor
    if (/latte factor|daily coffee|micro expense|small expenses/i.test(query)) {
      this.recordInterest('avoid_mistakes');
      this.appendBotMessage("☕ **The 'Latte Factor' Phenomenon:**\n\nPopularised by financial authors, the Latte Factor demonstrates how tiny, unconscious everyday expenses drain thousands from student pockets:\n\n• **Daily $4.50 Café Latte / Energy Drink** = ~$135 / month = **$1,620 per academic year**!\n• **Alternative**: Brewing your own coffee or tea at home costs ~$0.30 a cup.\n• **Compound Power**: Redirecting that $135/month into a high-yield student savings vault builds **$6,480+ across 4 years of college**!", [
        "Smart grocery hacks", "How to start saving?", "Calculate budget of 1200", "Avoid common money mistakes"
      ], true);
      return true;
    }

    // 15. How to Start Saving / Setting Goals
    if (/how to (?:start )?sav|start saving|how to set savings goals|how to save/i.test(query)) {
      this.recordInterest('savings_goals');
      this.appendBotMessage("🎯 **How to Start Saving as a Student:**\n\n1. **Pay Yourself First**: Transfer 10%–20% to a separate savings pocket immediately upon receiving allowance.\n2. **Build an Emergency Vault**: Target a beginner safety cushion of $300–$500 (or Rs. 25,000–Rs. 40,000) for surprise phone repairs or transit issues.\n3. **Use the Savings Simulator**: Use our on-page **Module 4: Savings Goals Simulator** to set milestones and generate a physical roadmap!\n4. **Automate**: Treat savings as an unbreakable recurring bill rather than leftovers.", [
        "Set emergency fund 500", "Set laptop goal 80000", "Explain the 50-30-20 rule", "Go to Savings Goals"
      ], true);
      return true;
    }

    // 16. Low Income / Tight Allowance
    if (/low income|tight budget|not enough money|small allowance|stipend tight/i.test(query)) {
      this.recordInterest('budget_calc');
      this.appendBotMessage("💡 **Budgeting with a Tight or Low Student Allowance:**\n\nIf the classic 50-30-20 ratio feels tight, customize the proportions to fit your reality:\n\n• **70-20-10 Split**: 70% Essentials (Rent/food/transit), 20% Wants, 10% Savings.\n• **Every Penny Counts**: Even saving $5 or Rs. 500 per week builds unbreakable lifelong money discipline.\n• **Use Campus Perks**: Tap university WiFi, subsidized dorm dining, second-hand books, and free student software licenses!", [
        "Student discounts & tech perks", "Grocery hacks", "Calculate budget of 50000", "Explain 48-Hour Waiting Rule"
      ], true);
      return true;
    }

    // 17. Student Textbook Savings
    if (/textbook|textbooks|save on books|academic books|course texts/i.test(query)) {
      this.recordInterest('avoid_mistakes');
      this.appendBotMessage("📚 **Proven Student Textbook Savings Hacks:**\n\n1. **Campus Library Reserves**: Most professors place required reading on 2-hour library reserve—scan chapters for free!\n2. **Buy Older Editions**: 95% of content in an 8th edition is identical to the 9th edition, at an 80% discount.\n3. **Digital Rentals**: Renting eBooks on Kindle or VitalSource is up to 65% cheaper than physical copies.\n4. **Peer Exchange**: Buy directly from seniors on campus forums or student groups!", [
        "Student discounts & tech perks", "Avoid overspending", "Calculate budget of 1200"
      ], true);
      return true;
    }

    // 18. Infographics Exploration
    if (/explore infographics|infographic|infographics|visual guide/i.test(query)) {
      if (typeof window.navigateToSectionFromChatbot === 'function') {
        window.navigateToSectionFromChatbot('infographics-gallery');
      }
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Infographics Gallery');
      }
      this.recordInterest('budget_calc');
      this.appendBotMessage("📊 **Module 7: Visual Financial Infographics Gallery!**\n\nI have navigated you to our interactive infographics gallery. You can study:\n• **Budgeting**: Cash flow & 50-30-20 visual breakdowns\n• **Saving**: The Latte Factor & 30-Day student challenges\n• **Spending**: Ghost subscription leak timelines & 48-hour protocol\n\nClick any infographic card to open the high-resolution study modal with key takeaways!", [
        "Filter budgeting infographics", "Filter saving infographics", "Calculate 50-30-20", "Print budget blueprint"
      ], true);
      return true;
    }

    // 19. Interactive Guided Tour Command
    if (/^(?:start|take|begin|show|open)?\s*(?:the\s*)?(?:guided\s*)?tour$/i.test(query) || query === 'tour') {
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Starting Tour 🚀');
      }
      if (typeof window.startGuidedTour === 'function') {
        window.startGuidedTour();
      }
      this.appendBotMessage("🚀 **Starting Interactive Guided Tour!** Follow the glowing spotlight cards to explore all modules of BudgetBasics.", [
        "What is 50-30-20?", "Calculate budget of 1200", "Print budget blueprint"
      ], true);
      return true;
    }

    // 20. Quiz & Knowledge Check Navigation / Retake Command
    if (/quiz|knowledge check|test knowledge|retake quiz|start quiz/i.test(query)) {
      if (typeof window.navigateToSectionFromChatbot === 'function') {
        window.navigateToSectionFromChatbot('needs-vs-wants');
      }
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Starting Quiz 🎯');
      }
      const restartBtn = document.getElementById('btnRestartQuiz');
      if (restartBtn && !restartBtn.closest('#quizResultCard')?.classList.contains('d-none')) {
        restartBtn.click();
      }
      this.appendBotMessage("🎯 **Knowledge Check Activated!** Test your spending instincts and 48-Hour decision skills in **Module 2: Needs vs. Wants**.", [
        "What is a need vs want?", "48-Hour Protocol", "Calculate 50-30-20"
      ], true);
      return true;
    }

    // 21. Student Grocery & Meal Prep Hacks
    if (/grocery|groceries|meal prep|campus food|save on food|food tips|canteen/i.test(query)) {
      this.appendBotMessage("🥦 **Smart Student Grocery & Nutrition Hacks:**\n\n1. **Wholesale Staples**: Eggs, oats, brown lentils, and rice give massive nutrition for under $2.50 a day.\n2. **The Full Stomach Rule**: Never grocery shop while hungry—it statistically spikes junk food cart size by 45%!\n3. **Batch Cook with Roommates**: Shared pasta bakes, lentil dahls, or chicken fajitas cut dorm grocery budgets in half.\n4. **Thermal Water & Tea Mug**: Bringing your own brew saves over $140 every school month!", [
        "What is the latte factor?", "Roommate expense sharing", "Calculate budget of 1200"
      ], true);
      return true;
    }

    // 22. Roommate Expense Sharing Protocol
    if (/roommate|roommates|split rent|hostel|split bills|shared expense/i.test(query)) {
      this.appendBotMessage("🤝 **Roommate & Shared Hostel Protocol:**\n\n• **Fixed Costs First**: Pay shared rent, gas, and WiFi on Day 1 to avoid awkward reminders.\n• **Pooled Essentials Fund**: Each member chips in $10 for shared paper towels, dish soap, and spices.\n• **Transparent Log**: Use our on-page **Expense Planner** table to maintain transparent accounts.\n• **Print a Statement**: Print an official **Budget Blueprint** anytime to keep everyone aligned!", [
        "Print budget blueprint", "Grocery hacks", "Emergency fund tips"
      ], true);
      return true;
    }

    // 23. Student Emergency Fund Cushion
    if (/emergency fund|safety buffer|cushion|rainy day|safety fund/i.test(query)) {
      const sym = (window.BB_STATE && window.BB_STATE.currentCurrency) || '$';
      this.appendBotMessage(`🛡️ **Student Emergency Fund Blueprint:**\n\n• **Starter Safety Target**: Strive to hold **${sym}300 to ${sym}500** in a separate savings vault.\n• **Why You Need It**: Protects against unexpected phone screen cracks, emergency dorm travel, or lost transit passes without taking high-interest loans.\n• **Golden Rule**: Treat this money as invisible unless an actual health or safety emergency occurs!`, [
        `Set emergency fund 500`, "50-30-20 rule", "How to avoid overspending"
      ], true);
      return true;
    }

    // 24. Student Discounts & Tech Perks
    if (/student discount|discounts|deals|campus deals|unidays|edu email/i.test(query)) {
      this.appendBotMessage("🎓 **High-Value Student Discounts to Claim:**\n\n• **GitHub Student Pack**: Free GitHub Pro, domain names, Canva Pro, and $100 cloud credits.\n• **Software Essentials**: Notion Plus (100% Free), Figma Pro (Free), Spotify Student + Hulu (50% off).\n• **Hardware**: 10% educational discounts at Apple, Dell, and Samsung with student ID.\n• **Rule of Thumb**: Always ask *'Do you offer a student discount?'* whenever purchasing academic supplies!", [
        "Avoid overspending", "Grocery hacks", "Calculate budget of 1200"
      ], true);
      return true;
    }

    // 25. Meet Creators / Team Tech Hunters
    if (/who made|who created|creators|team|tech hunters|about team/i.test(query)) {
      if (typeof window.navigateToSectionFromChatbot === 'function') {
        window.navigateToSectionFromChatbot('about-and-contact');
      }
      if (this.wasVoiceTriggered) {
        this.autoMinimizeChatbotIfOpen();
        this.setLauncherSpeakingState(true, 'Team Tech Hunters');
      }
      this.appendBotMessage("🏆 **Meet Team 'Tech Hunters' (Aptech Techwiz 7):**\n\n• **Muhammad Adeel Shah**: Lead Full-Stack Architect & AI Engineer\n• **Ghulam Mustafa**: Financial Logic & Calculator Specialist\n• **Mohsin Shah**: UI/UX & Interaction Designer\n• **Makhdoom Afzal Shahid**: Financial Research & QA Specialist\n\n📍 **Learning Center**: Aptech Rahim Yar Khan Center, Punjab, Pakistan\nBuilt for **Aptech Techwiz 7 — Category 1: Web Innovation Unleashed**!", [
        "Go to About section", "Start guided tour", "Calculate budget of 1200"
      ], true);
      return true;
    }

    return false;
  }

  // =========================================================================
  // Action Executors
  // =========================================================================
  executeBudgetCalculation(amount) {
    if (typeof window.calculateBudgetFromChatbot !== 'function') return;

    if (this.wasVoiceTriggered) {
      this.autoMinimizeChatbotIfOpen();
      this.setLauncherSpeakingState(true, 'Budget Calculated! 💰');
    }
    const res = window.calculateBudgetFromChatbot(amount);
    this.recordInterest('budget_calc');

    const fmt = (val) => typeof formatMoney === 'function' ? formatMoney(val) : `${val}`;

    const reply = `✨ **50-30-20 Budget Calculated for ${fmt(res.income)}!**\n\n` +
      `• **Needs (50%)**: ${fmt(res.needs)} *(~${fmt(res.weeklyNeeds)} / week)*\n` +
      `• **Wants (30%)**: ${fmt(res.wants)} *(~${fmt(res.weeklyWants)} / week)*\n` +
      `• **Savings (20%)**: ${fmt(res.savings)} *(~${fmt(res.weeklySavings)} / week)*\n\n` +
      `📍 *I have navigated you to **Module 3: 50-30-20 Calculator** and refreshed the visual allocation donut chart in real time!*`;

    const suggestions = [
      `Generate invoice and print for ${amount}`,
      `Set goal for ${Math.round(res.savings)}`,
      `Go to Needs vs Wants`,
      `Audit Ghost Subscriptions`
    ];

    this.appendBotMessage(reply, suggestions, true);
  }

  executeGenerateInvoice(studentName, amount, printImmediately) {
    if (typeof window.generateBudgetPlanFromChatbot !== 'function') return;

    if (this.wasVoiceTriggered) {
      this.autoMinimizeChatbotIfOpen();
      this.setLauncherSpeakingState(true, 'Blueprint Generated! 📋');
    }
    const plan = window.generateBudgetPlanFromChatbot(studentName, amount, printImmediately);
    this.recordInterest('invoice_print');

    const fmt = (val) => typeof formatMoney === 'function' ? formatMoney(val) : `${val}`;

    const reply = `📋 **Certified Student Budget Blueprint Generated!**\n\n` +
      `• **Student**: ${plan.studentName}\n` +
      `• **Monthly Income**: ${fmt(plan.income)}\n` +
      `• **Framework Adherence**: 50% Needs, 30% Wants, 20% Savings\n\n` +
      `📍 *Navigated to **Module 7: Budget Blueprint**.* ${printImmediately ? '🖨️ *Print dialog has been activated! Select "Save as PDF" to save an offline copy.*' : 'You can review and click **Print Blueprint (PDF)** whenever you are ready.'}`;

    const suggestions = [
      `Print blueprint now`,
      `Calculate budget of 50000`,
      `Set Savings Goal`,
      `Go to Expense Planner`
    ];

    this.appendBotMessage(reply, suggestions, true);
  }

  executeSetGoal(goalName, targetAmount) {
    if (typeof window.setSavingsGoalFromChatbot !== 'function') return;

    if (this.wasVoiceTriggered) {
      this.autoMinimizeChatbotIfOpen();
      this.setLauncherSpeakingState(true, 'Goal Configured! 🎯');
    }
    // Monthly contribution heuristic: ~15% to 20% of target or reasonable rate
    const monthly = Math.max(50, Math.round(targetAmount * 0.15));
    const goalRes = window.setSavingsGoalFromChatbot(goalName, targetAmount, 0, monthly);
    this.recordInterest('savings_goals');

    const fmt = (val) => typeof formatMoney === 'function' ? formatMoney(val) : `${val}`;

    const reply = `🎯 **Savings Goal Configured for ${goalName}!**\n\n` +
      `• **Target Amount**: ${fmt(targetAmount)}\n` +
      `• **Monthly Contribution**: ${fmt(monthly)}\n` +
      `• **Estimated Timeline**: **${goalRes.timeline}** *(${goalRes.breakdown})*\n\n` +
      `📍 *I've navigated you to **Module 4: Savings Goals Simulator** with timeline progress metrics updated!*`;

    const suggestions = [
      `Calculate 50-30-20 budget`,
      `Audit ghost subscriptions`,
      `Generate Budget Blueprint`,
      `Go to Expense Planner`
    ];

    this.appendBotMessage(reply, suggestions, true);
  }

  setAppCurrency(currencySymbol) {
    const sel = document.getElementById('currencySelector');
    if (sel) {
      sel.value = currencySymbol;
      sel.dispatchEvent(new Event('change'));
    }
  }

  // =========================================================================
  // Knowledge Base FAQ Fallback
  // =========================================================================
  handleFaqIntent(query) {
    const cleanQuery = query.toLowerCase().replace(/[?"'“”.,!]/g, '').trim();
    let matchedIntent = null;
    let highestScore = 0;

    if (this.faqData && this.faqData.intents) {
      // 1. Direct or substring phrase check
      for (const intent of this.faqData.intents) {
        for (const kw of intent.keywords) {
          const cleanKw = kw.toLowerCase().replace(/[?"'“”.,!]/g, '').trim();
          if (cleanQuery === cleanKw || cleanQuery.startsWith(cleanKw) || cleanQuery.endsWith(cleanKw)) {
            this.recordInterest(intent.id);
            this.appendBotMessage(intent.response, intent.suggestions, true);
            return;
          }
        }
      }

      // 2. Keyword score matching
      for (const intent of this.faqData.intents) {
        let score = 0;
        for (const kw of intent.keywords) {
          const cleanKw = kw.toLowerCase().replace(/[?"'“”.,!]/g, '').trim();
          if (cleanQuery.includes(cleanKw)) {
            score += cleanKw.length * 2;
          }
        }
        if (score > highestScore) {
          highestScore = score;
          matchedIntent = intent;
        }
      }
    }

    if (matchedIntent && highestScore > 0) {
      this.recordInterest(matchedIntent.id);
      this.appendBotMessage(matchedIntent.response, matchedIntent.suggestions, true);
    } else {
      const fallback = this.faqData?.fallback || {
        response: "I specialize in interactive student personal budgeting! You can ask me to calculate a budget, simulate savings goals, generate and print budget blueprints, or explain the 50-30-20 rule.",
        suggestions: this.getWorkingInterestSuggestions()
      };
      this.appendBotMessage(fallback.response, fallback.suggestions, true);
    }
  }

  // =========================================================================
  // Dynamic Real-Time Working Interests & Contextual Suggestions
  // =========================================================================
  getWorkingInterestSuggestions() {
    const sym = (window.BB_STATE && window.BB_STATE.currentCurrency) || 'Rs.';
    const isPkr = sym === 'Rs.';

    const topInterest = this.activeInterests[0] || 'budget_calc';

    switch (topInterest) {
      case 'budget_calc':
        return isPkr ? [
          "Calculate budget of 50000",
          "Generate an invoice and print it",
          "Set laptop goal 80000",
          "Go to Needs vs Wants"
        ] : [
          "Calculate budget of 1200",
          "Generate an invoice and print it",
          "Set emergency fund 500",
          "Switch currency to PKR"
        ];

      case 'invoice_print':
        return [
          "Print current blueprint",
          isPkr ? "Calculate budget of 60000" : "Calculate budget of 1500",
          "Go to Savings Goals",
          "View Site Map Flow"
        ];

      case 'savings_goals':
        return isPkr ? [
          "Set emergency safety fund 40000",
          "Calculate budget of 50000",
          "Audit ghost subscriptions",
          "Generate Budget Blueprint"
        ] : [
          "Set emergency fund 500",
          "Calculate budget of 1200",
          "Audit ghost subscriptions",
          "Switch to PKR (Rs.)"
        ];

      case 'avoid_mistakes':
        return [
          "Audit ghost subscriptions",
          "Explain 48-Hour Waiting Rule",
          "What is the Latte Factor?",
          isPkr ? "Calculate budget of 50000" : "Calculate budget of 1200"
        ];

      case 'needs_wants':
        return [
          "What is a need vs want?",
          "Explain 50-30-20 rule",
          isPkr ? "Calculate budget of 50000" : "Calculate budget of 1200",
          "Go to Savings Goals"
        ];

      default:
        return [
          isPkr ? "Calculate budget of 50000" : "Calculate budget of 1200",
          "Generate an invoice and print it",
          "Go to About section",
          isPkr ? "Toggle Dark Mode" : "Switch to PKR (Rs.)"
        ];
    }
  }

  // =========================================================================
  // Rendering & Markdown Helpers
  // =========================================================================
  appendBotMessage(markdownText, suggestions = [], shouldSpeak = true) {
    const bubbles = [];
    this.messagesContainers.forEach(container => {
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble bot';
      container.appendChild(bubble);
      bubbles.push(bubble);
    });

    const formattedHtml = this.parseSimpleMarkdown(markdownText);
    const plainText = markdownText;
    let charIndex = 0;
    const speed = 10;

    const typeWriter = () => {
      if (charIndex < plainText.length) {
        const slice = plainText.substring(0, charIndex + 1);
        bubbles.forEach(b => b.textContent = slice);
        charIndex += 4;
        this.scrollToBottom();
        setTimeout(typeWriter, speed);
      } else {
        bubbles.forEach(b => {
          b.innerHTML = formattedHtml;
          this.renderBubbleActions(b, plainText);
          this.renderSuggestions(b, suggestions);
        });
        this.scrollToBottom();
        if (shouldSpeak) {
          this.speak(markdownText);
        }
      }
    };

    typeWriter();
  }

  renderBubbleActions(container, textToSpeak) {
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'chat-bubble-actions';

    const btnSpeak = document.createElement('button');
    btnSpeak.type = 'button';
    btnSpeak.className = 'btn-bubble-speak';
    btnSpeak.title = 'Speak this response aloud';
    btnSpeak.innerHTML = '<i class="bi bi-volume-up-fill"></i> <span>Speak Aloud</span>';

    btnSpeak.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.synth && this.synth.speaking) {
        this.synth.cancel();
        btnSpeak.classList.remove('is-speaking');
        btnSpeak.querySelector('span').textContent = 'Speak Aloud';
      } else {
        btnSpeak.classList.add('is-speaking');
        btnSpeak.querySelector('span').textContent = 'Speaking...';
        this.speak(textToSpeak);
        const checkDone = setInterval(() => {
          if (!this.synth || !this.synth.speaking) {
            btnSpeak.classList.remove('is-speaking');
            btnSpeak.querySelector('span').textContent = 'Speak Aloud';
            clearInterval(checkDone);
          }
        }, 250);
      }
    });

    actionsWrapper.appendChild(btnSpeak);
    container.appendChild(actionsWrapper);
  }

  renderSuggestions(container, suggestions) {
    if (!suggestions || !suggestions.length) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-suggestions';

    suggestions.forEach(s => {
      const chip = document.createElement('span');
      chip.className = 'suggestion-chip';
      chip.textContent = s;
      chip.onclick = () => {
        this.handleSendMessage(s);
      };
      wrapper.appendChild(chip);
    });

    container.appendChild(wrapper);
  }

  parseSimpleMarkdown(text) {
    return text
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•\s*(.*?)(?=<br>|$)/g, '<div class="d-flex align-items-start mt-1"><i class="bi bi-arrow-right-short text-primary fs-5 me-1"></i><span>$1</span></div>');
  }

  scrollToBottom() {
    this.messagesContainers.forEach(container => {
      container.scrollTop = container.scrollHeight;
    });
  }
}

// Global floating chatbot toggle
window.toggleFloatingChatbot = function(forceOpen) {
  const windowEl = document.getElementById('floatingChatWindow');
  const launcherIcon = document.getElementById('chatLauncherIcon');
  if (!windowEl) return;

  const isOpen = windowEl.classList.contains('active');
  const shouldOpen = (forceOpen !== undefined) ? forceOpen : !isOpen;

  if (shouldOpen) {
    windowEl.classList.add('active');
    if (launcherIcon) launcherIcon.className = 'bi bi-x-lg';
    setTimeout(() => {
      document.getElementById('chatInputFloating')?.focus();
    }, 150);
  } else {
    windowEl.classList.remove('active');
    if (launcherIcon) launcherIcon.className = 'bi bi-chat-dots-fill';
  }
};

// Global Voice Studio / Voice trigger helper
window.openChatbotWithVoice = function() {
  window.toggleFloatingChatbot(true);
  if (window.budgetBeeAssistant) {
    setTimeout(() => {
      window.budgetBeeAssistant.startSpeechRecognition();
    }, 250);
  }
};

window.minimizeVoiceStudioToWidget = function() {
  window.toggleFloatingChatbot(false);
};

window.restoreVoiceStudioFromWidget = function() {
  window.toggleFloatingChatbot(true);
};

document.addEventListener('DOMContentLoaded', () => {
  window.budgetBeeAssistant = new BudgetBeeChatbot();
});
