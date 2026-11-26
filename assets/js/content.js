/**
 * CSI • Diocese of Karimnagar • Aler Group
 * Youth Christmas Celebration 2026 — Content Loader
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

  function renderInvitedBy(invitedList) {
    if (!Array.isArray(invitedList) || invitedList.length === 0) return;

    var cardListEl = document.getElementById('countdown-invited-by-list');
    if (cardListEl) {
      cardListEl.textContent = '';
      invitedList.forEach(function (entry) {
        var row = document.createElement('div');
        var nameStrong = document.createElement('strong');
        nameStrong.textContent = entry.name || '';
        var desigSpan = document.createElement('span');
        desigSpan.className = 'text-muted';
        desigSpan.textContent = ' \u2013 ' + (entry.designation || '');
        row.appendChild(nameStrong);
        row.appendChild(desigSpan);
        cardListEl.appendChild(row);
      });
    }
  }

  function renderOrganisedBy(items) {
    if (!Array.isArray(items) || items.length === 0) return;
    applyContent('[data-retreat="organisers_short"]', items.join(', '));
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
        if (church.organising_church_name) {
          applyContent('[data-church="organising_church_name"]', church.organising_church_name);
        }
        if (church.organising_church_location) {
          applyContent('[data-church="organising_church_location"]', church.organising_church_location);
        }
        if (church.organised_by) {
          renderOrganisedBy(church.organised_by);
        }
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
        if (retreat.guest_speaker && retreat.guest_speaker.name) {
          applyContent('[data-retreat="guest_speaker"]', retreat.guest_speaker.name);
        }
        if (retreat.invited_by) {
          renderInvitedBy(retreat.invited_by);
        }
        if (retreat.organising_church) {
          if (retreat.organising_church.church_name) {
            applyContent('[data-church="organising_church_name"]', retreat.organising_church.church_name);
          }
          if (retreat.organising_church.location) {
            applyContent('[data-church="organising_church_location"]', retreat.organising_church.location);
          }
          if (retreat.organising_church.organised_by) {
            renderOrganisedBy(retreat.organising_church.organised_by);
          }
        }
      }
    });
  });
})();

