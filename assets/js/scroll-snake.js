/**
 * BudgetBasics - NextGen BudgetBee
 * Interactive Sinuous Snake Scroll Tracing Engine
 * Techwiz 7 - Category 1 (Web Innovation Unleashed)
 *
 * Implements a dynamic waving snake arrow line that tracks scrollbar progress,
 * rendering a traced dotted curve with a rotating arrow head marker and live progress bubble.
 */

(function() {
  'use strict';

  let tracerEl = null;
  let trackPathEl = null;
  let activePathEl = null;
  let maskPathEl = null;
  let arrowHeadEl = null;
  let beeMascotEl = null;
  let startPadEl = null;
  let finishGoalEl = null;
  let bubbleEl = null;
  let totalLength = 0;
  let scrollTimeout = null;
  let isTicking = false;

  // Background Document Snake elements
  let bgSnakeSvg = null;
  let bgTrackPath = null;
  let bgActivePath = null;
  let bgMaskPath = null;
  let bgTotalLength = 0;

  function initSnakeTracer() {
    tracerEl = document.getElementById('scrollSnakeTracer');
    if (!tracerEl) return;

    trackPathEl = document.getElementById('snakeTrackPath');
    activePathEl = document.getElementById('snakeActivePath');
    maskPathEl = document.getElementById('snakeMaskPath');
    arrowHeadEl = document.getElementById('snakeArrowHead');
    beeMascotEl = document.getElementById('snakeBeeMascot');
    startPadEl = document.getElementById('snakeStartPad');
    finishGoalEl = document.getElementById('snakeFinishGoal');
    bubbleEl = document.getElementById('snakeScrollBubble');

    bgSnakeSvg = document.getElementById('bgDocSnakeSvg');
    bgTrackPath = document.getElementById('bgDocSnakePath');
    bgActivePath = document.getElementById('bgDocSnakeActive');
    bgMaskPath = document.getElementById('bgDocSnakeMaskPath');

    tracerEl.classList.add('is-scrolling');

    buildSnakePaths();
    bindEvents();
    updateSnakeProgress();
  }

  function buildSnakePaths() {
    if (!tracerEl || !trackPathEl) return;

    const rect = tracerEl.getBoundingClientRect();
    const H = Math.max(150, rect.height || (window.innerHeight - 170));
    const isMobile = window.innerWidth < 768;
    const W = isMobile ? 32 : 46;
    const x0 = W / 2;
    const amplitude = isMobile ? 7 : 12;
    const wavelength = isMobile ? 65 : 82;
    const step = 4;

    // Generate mathematical sine wave path
    let d = `M ${x0.toFixed(1)} 0`;
    let lastX = x0;
    for (let y = step; y <= H; y += step) {
      const angle = (2 * Math.PI * y) / wavelength;
      const x = x0 + amplitude * Math.sin(angle);
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      lastX = x;
    }

    // Set path data on track, active line, and mask
    trackPathEl.setAttribute('d', d);
    if (activePathEl) activePathEl.setAttribute('d', d);
    if (maskPathEl) maskPathEl.setAttribute('d', d);

    // Position Start Pad and Finish Goal
    if (startPadEl) startPadEl.setAttribute('transform', `translate(${x0.toFixed(1)}, 6)`);
    if (finishGoalEl) finishGoalEl.setAttribute('transform', `translate(${lastX.toFixed(1)}, ${(H - 6).toFixed(1)})`);

    // Compute total length and initialize mask
    try {
      totalLength = trackPathEl.getTotalLength();
      if (maskPathEl && totalLength > 0) {
        maskPathEl.style.strokeDasharray = `${totalLength} ${totalLength}`;
        maskPathEl.style.strokeDashoffset = `${totalLength}`;
      }
    } catch (e) {
      totalLength = H * 1.08;
    }

    // Build Background Ambient Document Wave if available
    buildBackgroundDocSnake();
  }

  function buildBackgroundDocSnake() {
    if (!bgSnakeSvg || !bgTrackPath) return;

    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    bgSnakeSvg.style.height = `${docHeight}px`;
    const winWidth = window.innerWidth;
    const wavelength = 360;
    const amplitude = Math.min(60, winWidth * 0.05);
    const centerX = winWidth > 992 ? winWidth * 0.92 : winWidth * 0.94;
    const step = 20;

    let bgD = `M ${centerX.toFixed(1)} 0`;
    for (let y = step; y <= docHeight; y += step) {
      const angle = (2 * Math.PI * y) / wavelength;
      const x = centerX + amplitude * Math.sin(angle);
      bgD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }

    bgTrackPath.setAttribute('d', bgD);
    if (bgActivePath) bgActivePath.setAttribute('d', bgD);
    if (bgMaskPath) bgMaskPath.setAttribute('d', bgD);

    try {
      bgTotalLength = bgTrackPath.getTotalLength();
      if (bgMaskPath && bgTotalLength > 0) {
        bgMaskPath.style.strokeDasharray = `${bgTotalLength} ${bgTotalLength}`;
        bgMaskPath.style.strokeDashoffset = `${bgTotalLength}`;
      }
    } catch(e) {
      bgTotalLength = docHeight;
    }
  }

  function updateSnakeProgress() {
    if (!trackPathEl || totalLength <= 0) return;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
    const currentLength = progress * totalLength;

    // 1. Reveal active dotted snake line via SVG mask
    if (maskPathEl) {
      maskPathEl.style.strokeDashoffset = Math.max(0, totalLength - currentLength);
    }

    // 2. Position Arrow Head & Animated Bee Mascot along sine wave
    try {
      const pt = trackPathEl.getPointAtLength(currentLength);
      const delta = 3;
      const forwardLength = Math.min(totalLength, currentLength + delta);
      const backwardLength = Math.max(0, currentLength - delta);
      const ptNext = trackPathEl.getPointAtLength(forwardLength);
      const ptPrev = trackPathEl.getPointAtLength(backwardLength);

      const dx = ptNext.x - ptPrev.x;
      const dy = ptNext.y - ptPrev.y;
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI - 90;

      // Position glowing arrow head right at current scroll length
      if (arrowHeadEl) {
        arrowHeadEl.setAttribute(
          'transform',
          `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) rotate(${angleDeg.toFixed(1)})`
        );
      }

      // Position animated Bee Mascot slightly ahead along the curve (Snake chasing Bee!)
      if (beeMascotEl) {
        const beeLeadDistance = Math.min(22, totalLength * 0.06);
        const beeTargetLength = Math.min(totalLength, currentLength + beeLeadDistance);
        const ptBee = trackPathEl.getPointAtLength(beeTargetLength);
        const ptBeeNext = trackPathEl.getPointAtLength(Math.min(totalLength, beeTargetLength + delta));
        const beeDx = ptBeeNext.x - ptBee.x;
        const beeDy = ptBeeNext.y - ptBee.y;
        const beeAngleDeg = (Math.atan2(beeDy, beeDx) * 180) / Math.PI - 90;

        beeMascotEl.setAttribute(
          'transform',
          `translate(${ptBee.x.toFixed(1)}, ${ptBee.y.toFixed(1)}) rotate(${beeAngleDeg.toFixed(1)})`
        );
      }

      // 3. Update Progress Bubble
      if (bubbleEl) {
        bubbleEl.textContent = `${Math.round(progress * 100)}%`;
        bubbleEl.style.top = `${pt.y.toFixed(1)}px`;
      }
    } catch (err) {
      // Fallback in case of SVG query error
    }

    // 4. Update Background Ambient Snake Wave if present
    if (bgMaskPath && bgTotalLength > 0) {
      const bgCurrent = progress * bgTotalLength;
      bgMaskPath.style.strokeDashoffset = Math.max(0, bgTotalLength - bgCurrent);
    }

    isTicking = false;
  }

  function onScroll() {
    if (tracerEl) {
      tracerEl.classList.add('is-scrolling');
    }

    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateSnakeProgress();
      });
      isTicking = true;
    }
  }

  let isDragging = false;

  function scrollToClientY(clientY, smooth) {
    if (!tracerEl) return;
    const rect = tracerEl.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const progress = Math.min(1, Math.max(0, offsetY / Math.max(1, rect.height)));
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const targetScrollY = progress * maxScroll;

    window.scrollTo({
      top: targetScrollY,
      behavior: smooth ? 'smooth' : 'auto'
    });

    updateSnakeProgress();
  }

  function bindEvents() {
    window.addEventListener('scroll', onScroll, { passive: true });

    if (tracerEl) {
      // Mouse down to begin dragging or clicking
      tracerEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        tracerEl.classList.add('is-dragging', 'is-scrolling');
        scrollToClientY(e.clientY, false);
      });

      // Touch start for mobile / touch devices
      tracerEl.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          isDragging = true;
          tracerEl.classList.add('is-dragging', 'is-scrolling');
          scrollToClientY(e.touches[0].clientY, false);
        }
      }, { passive: true });

      // Click on tracer lane to smooth-scroll
      tracerEl.addEventListener('click', (e) => {
        scrollToClientY(e.clientY, true);
      });
    }

    // Window MouseMove: enables continuous dragging even when mouse wanders outside the narrow tracer
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      scrollToClientY(e.clientY, false);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (tracerEl) {
          tracerEl.classList.remove('is-dragging');
        }
      }
    });

    // Window TouchMove & TouchEnd
    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches.length > 0) {
        scrollToClientY(e.touches[0].clientY, false);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        if (tracerEl) {
          tracerEl.classList.remove('is-dragging');
        }
      }
    });

    // Debounced resize handler
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildSnakePaths();
        updateSnakeProgress();
      }, 150);
    });
  }

  // Self-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnakeTracer);
  } else {
    initSnakeTracer();
  }

  // Re-verify after full window load for any asynchronous image/font layout shifts
  window.addEventListener('load', () => {
    setTimeout(() => {
      buildSnakePaths();
      updateSnakeProgress();
    }, 300);
  });

  window.recalcSnakeTracer = function() {
    buildSnakePaths();
    updateSnakeProgress();
  };
})();
