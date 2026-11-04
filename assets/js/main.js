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

    // 4. Anonymous Feedback Form Handler
    var feedbackForm = document.getElementById('anonymous-feedback-form');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var successAlert = document.getElementById('feedback-success-message');
        if (successAlert) {
          successAlert.classList.remove('d-none');
          successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        feedbackForm.reset();
        var starInputs = feedbackForm.querySelectorAll('input[name="rating"]');
        starInputs.forEach(function (radio) { radio.checked = false; });
      });
    }
  });
})();

