/**
 * CSI • Diocese of Karimnagar • Aler Group
 * Youth Christmas Celebration 2026 — Main JavaScript
 * Handles Christmas Welcome Screen (3.8 seconds), Navigation, Form Submission, Countdown & Scroll Reveal
 */

(function () {
  'use strict';

  // 1. Christmas Greeting Welcome Screen Controller — 3.8 Seconds Auto-Transition
  var splash = document.getElementById('opening-screen');
  if (splash) {
    var SPLASH_SESSION_KEY = 'wcp_xmas_greeting_2026_v2';
    var hasSeenSplash = sessionStorage.getItem(SPLASH_SESSION_KEY);

    if (hasSeenSplash) {
      splash.style.display = 'none';
      splash.remove();
    } else {
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var displayDuration = prefersReducedMotion ? 500 : 3800; // 3.8 seconds festive greeting
      var isDismissed = false;

      document.body.style.overflow = 'hidden';

      var dismissSplash = function () {
        if (isDismissed) return;
        isDismissed = true;
        splash.classList.add('fade-out');
        document.body.style.overflow = '';
        sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');

        setTimeout(function () {
          if (splash && splash.parentNode) {
            splash.parentNode.removeChild(splash);
          }
        }, 500);
      };

      var autoTimer = setTimeout(dismissSplash, displayDuration);

      splash.addEventListener('click', function () {
        clearTimeout(autoTimer);
        dismissSplash();
      });
    }
  }

  // 2. Mobile Navbar Collapse on Click
  document.addEventListener('DOMContentLoaded', function () {
    var navLinks = document.querySelectorAll('.wcp-navbar .nav-link');
    var navCollapse = document.getElementById('wcpNav');

    if (navCollapse && window.bootstrap) {
      var bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse, { toggle: false });
      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          if (window.innerWidth < 992 && navCollapse.classList.contains('show')) {
            bsCollapse.hide();
          }
        });
      });
    }

    // Sticky Navbar Seamless Transition on Scroll
    var navbarEl = document.querySelector('.wcp-navbar');
    if (navbarEl) {
      var updateNavScroll = function () {
        if (window.scrollY > 40) {
          navbarEl.classList.add('is-scrolled');
        } else {
          navbarEl.classList.remove('is-scrolled');
        }
      };
      updateNavScroll();
      window.addEventListener('scroll', updateNavScroll, { passive: true });
    }

    // 3. Highlight Active Navigation Link
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    var activeLinks = document.querySelectorAll('.wcp-navbar .nav-link');
    activeLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var linkFile = href.split('/').pop();
      if (linkFile === currentPath || (currentPath === '' && linkFile === 'index.html')) {
        link.classList.add('active');
      }
    });

    // 4. Anonymous Feedback Form Handler (Connected to Google Sheets Web App)
    var feedbackForm = document.getElementById('anonymous-feedback-form');
    if (feedbackForm) {
      var GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtlf_64x9DkSoiq5BZU8KMzrinM6r6XDGnabwmZPx4gAWVNGL7A2oIRdDwnLycTzxMbg/exec';
      var isSubmitting = false;

      feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return;

        var overallInput = document.getElementById('feedback-overall');
        var feelingsDetailsInput = document.getElementById('feedback-feelings');
        var testimonyInput = document.getElementById('feedback-testimony');
        var suggestionsInput = document.getElementById('feedback-improvements');

        var overall = (overallInput ? overallInput.value : '').trim();
        var feelingDetails = (feelingsDetailsInput ? feelingsDetailsInput.value : '').trim();
        var testimony = (testimonyInput ? testimonyInput.value : '').trim();
        var suggestions = (suggestionsInput ? suggestionsInput.value : '').trim();

        var selectedFeelings = [];
        var checkedPills = feedbackForm.querySelectorAll('input[name="feelings"]:checked');
        checkedPills.forEach(function (pill) {
          selectedFeelings.push(pill.value);
        });

        var successAlert = document.getElementById('feedback-success-message');
        var errorAlert = document.getElementById('feedback-error-message');
        var errorText = document.getElementById('feedback-error-text');

        // Hide previous messages
        if (successAlert) successAlert.classList.add('d-none');
        if (errorAlert) errorAlert.classList.add('d-none');

        // Front-end validation for required sections
        if (!overall) {
          showFormError('Please enter your Overall Feedback in Section 1.');
          if (overallInput) overallInput.focus();
          return;
        }
        if (!testimony) {
          showFormError('Please share your Testimony in Section 3.');
          if (testimonyInput) testimonyInput.focus();
          return;
        }
        if (!suggestions) {
          showFormError('Please share what you would like us to improve in Section 4.');
          if (suggestionsInput) suggestionsInput.focus();
          return;
        }

        function showFormError(msg) {
          if (errorAlert) {
            if (errorText) errorText.textContent = msg;
            errorAlert.classList.remove('d-none');
            errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            alert(msg);
          }
        }

        var submitBtn = document.getElementById('feedback-submit-btn');
        var originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending feedback...';
        }
        isSubmitting = true;

        // Formulate readable timestamp
        var now = new Date();
        var timestamp = now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0') + ' ' +
          String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0') + ':' +
          String(now.getSeconds()).padStart(2, '0');

        // Build URLSearchParams with both lowerCamelCase and title casing
        var params = new URLSearchParams();
        params.append('overall', overall);
        params.append('Overall Feedback', overall);
        params.append('feelings', JSON.stringify(selectedFeelings));
        params.append('Selected Feelings', selectedFeelings.join(', '));
        params.append('feelingDetails', feelingDetails);
        params.append('Feeling Details', feelingDetails);
        params.append('testimony', testimony);
        params.append('Testimony', testimony);
        params.append('suggestions', suggestions);
        params.append('Improvement Suggestions', suggestions);
        params.append('timestamp', timestamp);
        params.append('Timestamp', timestamp);

        fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: params.toString()
        })
        .then(function (res) {
          if (!res.ok) {
            throw new Error('Server returned HTTP ' + res.status);
          }
          return res.text();
        })
        .then(function (text) {
          var trimmed = (text || '').trim();
          if (trimmed === 'Success') {
            // Confirmed storage in Google Sheets
            if (errorAlert) errorAlert.classList.add('d-none');
            if (successAlert) {
              successAlert.classList.remove('d-none');
              successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            // Only reset form upon confirmed storage
            feedbackForm.reset();
            var checkboxes = feedbackForm.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(function (chk) { chk.checked = false; });
          } else {
            // Server returned an error like "Required fields are missing" or "Invalid feelings"
            throw new Error(trimmed || 'Unexpected response from Google Apps Script');
          }
        })
        .catch(function (err) {
          console.error('Feedback submission error:', err);
          if (successAlert) successAlert.classList.add('d-none');
          showFormError('Unable to save feedback to Google Sheets (' + (err.message || 'Network error') + '). Your responses have been kept below. Please check your connection and click Submit again.');
          // Form is intentionally NOT reset here so the visitor never loses their entered text
        })
        .finally(function () {
          isSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        });
      });
    }

    // 5. Event Countdown Timer (Target: 5 December 2026, 9:30 AM Asia/Kolkata)
    function initCountdown() {
      var countdownExists = document.getElementById('countdown-days') || document.querySelector('[data-countdown="days"]');
      if (!countdownExists) return;

      // 5 December 2026, 9:30 AM IST (Asia/Kolkata, UTC+05:30)
      var targetDate = new Date('2026-12-05T09:30:00+05:30').getTime();

      function updateCountdown() {
        var now = new Date().getTime();
        var diff = targetDate - now;

        if (diff <= 0) {
          setAllCountdown('00', '00', '00', '00');
          var statusEls = document.querySelectorAll('.countdown-status-text');
          statusEls.forEach(function (el) { el.textContent = 'Youth Christmas Celebration is Live Today! Merry Christmas!'; });
          return;
        }

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setAllCountdown(
          String(days).padStart(2, '0'),
          String(hours).padStart(2, '0'),
          String(minutes).padStart(2, '0'),
          String(seconds).padStart(2, '0')
        );
      }

      function setAllCountdown(d, h, m, s) {
        setVal('days', d);
        setVal('hours', h);
        setVal('minutes', m);
        setVal('seconds', s);
      }

      function setVal(type, val) {
        var idEl = document.getElementById('countdown-' + type);
        if (idEl) idEl.textContent = val;
        var dataEls = document.querySelectorAll('[data-countdown="' + type + '"]');
        dataEls.forEach(function (el) {
          el.textContent = val;
        });
      }

      updateCountdown();
      setInterval(updateCountdown, 1000);
    }

    initCountdown();

    // 6. Scroll Reveal Motion Controller (Intersection Observer)
    function initScrollReveal() {
      var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var targets = document.querySelectorAll('.reveal-on-scroll, .wcp-card, .timeline-card, .song-card, .section-tag, .hero-verse-box');

      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        targets.forEach(function (el) {
          el.classList.add('revealed');
        });
        return;
      }

      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
      });

      targets.forEach(function (el) {
        if (!el.classList.contains('reveal-on-scroll')) {
          el.classList.add('reveal-on-scroll');
        }
        observer.observe(el);
      });
    }

    window.wcpTriggerScrollReveal = initScrollReveal;
    initScrollReveal();
  });
})();

