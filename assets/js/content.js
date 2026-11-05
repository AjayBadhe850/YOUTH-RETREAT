/**
 * Wesley Church Palliwada - Content Loader
 * Dynamically loads and binds data from data/church.json and data/retreat.json
 */

(function () {
  'use strict';

  // Determine root path prefix depending on if page is in root or pages/
  var isSubPage = window.location.pathname.includes('/pages/');
  var dataPrefix = isSubPage ? '../data/' : 'data/';

  function fetchJSON(url, callback) {
    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP error ' + response.status + ' loading ' + url);
        }
        return response.json();
      })
      .then(function (data) {
        callback(null, data);
      })
      .catch(function (err) {
        console.warn('Could not load ' + url + ':', err);
        callback(err, null);
      });
  }

  function applyContent(selector, text) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (el) {
      el.textContent = text;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 1. Load Church Details
    fetchJSON(dataPrefix + 'church.json', function (err, church) {
      if (!err && church) {
        applyContent('[data-church="name"]', church.church_name);
        applyContent('[data-church="tagline"]', church.tagline);
        applyContent('[data-church="address"]', church.full_address);
        applyContent('[data-church="pin"]', church.pin_code);
        applyContent('[data-church="welcome_heading"]', church.welcome_heading);
        applyContent('[data-church="welcome_message"]', church.welcome_message);
        applyContent('[data-church="introduction"]', church.church_introduction);
        applyContent('[data-church="helpline"]', church.helpline_placeholder);
        applyContent('[data-church="motto"]', church.motto);
        applyContent('[data-church="organisation"]', church.organisation);
        applyContent('[data-church="diocese"]', church.diocese);
        applyContent('[data-church="group"]', church.group);
        applyContent('[data-church="pastorate"]', church.pastorate);
        applyContent('[data-church="venue"]', church.venue);
      }
    });

    // 2. Load Retreat Details
    fetchJSON(dataPrefix + 'retreat.json', function (err, retreat) {
      if (!err && retreat) {
        applyContent('[data-retreat="title"]', retreat.title);
        applyContent('[data-retreat="theme"]', retreat.theme);
        applyContent('[data-retreat="verse"]', retreat.scripture_verse);
        applyContent('[data-retreat="date"]', retreat.date);
        applyContent('[data-retreat="timings"]', retreat.timings);
        applyContent('[data-retreat="venue"]', retreat.venue);
        applyContent('[data-retreat="lunch"]', retreat.lunch);
        applyContent('[data-retreat="motto"]', retreat.motto);
        applyContent('[data-retreat="organisers"]', retreat.organisers);
        applyContent('[data-retreat="introduction"]', retreat.introduction);
        applyContent('[data-retreat="overview"]', retreat.programme_overview);
      }
    });
  });
})();

