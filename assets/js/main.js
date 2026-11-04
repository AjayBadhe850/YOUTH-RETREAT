/**
 * Wesley Church Palliwada - Main JavaScript
 * Handles Opening Screen (2 seconds), Navigation, and Global UI
 */

(function () {
  'use strict';

  // 1. Opening Screen (Splash Screen) Controller — Exactly 2 Seconds
  var splash = document.getElementById('opening-screen');
  if (splash) {
    var SPLASH_SESSION_KEY = 'wcp_retreat_splash_seen';
    var hasSeenSplash = sessionStorage.getItem(SPLASH_SESSION_KEY);

    if (hasSeenSplash) {
      splash.style.display = 'none';
      splash.remove();
    } else {
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var displayDuration = prefersReducedMotion ? 400 : 2000; // Exactly 2 seconds

      document.body.style.overflow = 'hidden';

      setTimeout(function () {
        splash.classList.add('fade-out');
        document.body.style.overflow = '';
        sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');

        setTimeout(function () {
          if (splash && splash.parentNode) {
            splash.parentNode.removeChild(splash);
          }
        }, 450);
      }, displayDuration);
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

      feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var overall = (document.getElementById('feedback-overall') ? document.getElementById('feedback-overall').value : '').trim();
        var feelingDetails = (document.getElementById('feedback-feelings') ? document.getElementById('feedback-feelings').value : '').trim();
        var testimony = (document.getElementById('feedback-testimony') ? document.getElementById('feedback-testimony').value : '').trim();
        var suggestions = (document.getElementById('feedback-improvements') ? document.getElementById('feedback-improvements').value : '').trim();

        var selectedFeelings = [];
        var checkedPills = feedbackForm.querySelectorAll('input[name="feelings"]:checked');
        checkedPills.forEach(function (pill) {
          selectedFeelings.push(pill.value);
        });

        // Basic front-end validation for required sections
        if (!overall || !testimony || !suggestions) {
          alert('Please fill in all required sections (Overall Feedback, Testimony, and Improvements).');
          return;
        }

        var submitBtn = document.getElementById('feedback-submit-btn');
        var originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending to Google Sheets...';
        }

        var successAlert = document.getElementById('feedback-success-message');

        // Formulate timestamp
        var now = new Date();
        var timestamp = now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0') + ' ' +
          String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0') + ':' +
          String(now.getSeconds()).padStart(2, '0');

        // Build URL encoded parameters supporting both Google Sheet column names and Apps Script parameters
        var params = new URLSearchParams();
        params.append('overall', overall);
        params.append('overallFeedback', overall);
        params.append('Overall Feedback', overall);

        params.append('feelings', JSON.stringify(selectedFeelings));
        params.append('selectedFeelings', JSON.stringify(selectedFeelings));
        params.append('Selected Feelings', selectedFeelings.join(', '));

        params.append('feelingDetails', feelingDetails);
        params.append('Feeling Details', feelingDetails);
        params.append('details', feelingDetails);

        params.append('testimony', testimony);
        params.append('Testimony', testimony);

        params.append('suggestions', suggestions);
        params.append('improvementSuggestions', suggestions);
        params.append('Improvement Suggestions', suggestions);
        params.append('improvements', suggestions);

        params.append('timestamp', timestamp);
        params.append('Timestamp', timestamp);

        fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        })
        .then(function () {
          if (successAlert) {
            successAlert.classList.remove('d-none');
            successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          feedbackForm.reset();
          var checkboxes = feedbackForm.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(function (chk) { chk.checked = false; });
        })
        .catch(function (err) {
          console.warn('Feedback send notice:', err);
          if (successAlert) {
            successAlert.classList.remove('d-none');
            successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          feedbackForm.reset();
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        });
      });
    }
  });
})();

