/**
 * Wesley Church Palliwada - Schedule Loader
 * Loads, sorts by display_order, and renders timeline items from data/schedule.json
 */

(function () {
  'use strict';

  var isSubPage = window.location.pathname.includes('/pages/');
  var dataPrefix = isSubPage ? '../data/' : 'data/';

  document.addEventListener('DOMContentLoaded', function () {
    var fullContainer = document.getElementById('full-schedule-container');
    var previewContainer = document.getElementById('preview-schedule-container');

    if (!fullContainer && !previewContainer) return;

    fetch(dataPrefix + 'schedule.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (items) {
        if (!Array.isArray(items) || items.length === 0) {
          showEmptyState(fullContainer || previewContainer);
          return;
        }

        // Sort ascending by display_order
        items.sort(function (a, b) {
          return (a.display_order || 0) - (b.display_order || 0);
        });

        // Render full timeline
        if (fullContainer) {
          renderFullTimeline(fullContainer, items);
        }

        // Render preview (first 4 items on homepage)
        if (previewContainer) {
          renderPreviewCards(previewContainer, items.slice(0, 4));
        }
      })
      .catch(function (err) {
        console.warn('Could not load schedule.json:', err);
        showEmptyState(fullContainer || previewContainer);
      });
  });

  function renderFullTimeline(container, items) {
    container.innerHTML = '';
    var timelineWrap = document.createElement('div');
    timelineWrap.className = 'schedule-timeline';

    items.forEach(function (item) {
      if (!item.title) return;

      var itemEl = document.createElement('div');
      itemEl.className = 'timeline-item';

      var dot = document.createElement('div');
      dot.className = 'timeline-dot';

      var card = document.createElement('div');
      card.className = 'timeline-card';

      var timeText = item.start_time || '';
      if (item.end_time) {
        timeText += ' – ' + item.end_time;
      }

      var speakerHtml = item.speaker_activity
        ? '<span class="badge bg-light text-forest border"><i class="bi bi-person-badge me-1"></i> ' + escapeHTML(item.speaker_activity) + '</span>'
        : '';

      var descHtml = item.description
        ? '<p class="text-secondary mb-0 mt-2" style="white-space: pre-line;">' + escapeHTML(item.description) + '</p>'
        : '';

      card.innerHTML =
        '<div class="d-flex flex-wrap justify-content-between align-items-center mb-1">' +
          '<span class="timeline-time"><i class="bi bi-clock me-1"></i> ' + escapeHTML(timeText) + '</span>' +
          speakerHtml +
        '</div>' +
        '<h4 class="fw-bold text-forest mb-1">' + escapeHTML(item.title) + '</h4>' +
        descHtml;

      itemEl.appendChild(dot);
      itemEl.appendChild(card);
      timelineWrap.appendChild(itemEl);
    });

    container.appendChild(timelineWrap);
  }

  function renderPreviewCards(container, items) {
    container.innerHTML = '';
    var row = document.createElement('div');
    row.className = 'row g-4 justify-content-center';

    items.forEach(function (item) {
      var col = document.createElement('div');
      col.className = 'col-md-6 col-lg-3';

      var timeText = item.start_time || '';
      if (item.end_time) timeText += ' – ' + item.end_time;

      var speakerHtml = item.speaker_activity
        ? '<div class="text-muted small mb-2"><i class="bi bi-person-fill text-gold"></i> ' + escapeHTML(item.speaker_activity) + '</div>'
        : '';

      col.innerHTML =
        '<div class="wcp-card h-100 text-center">' +
          '<span class="timeline-time mb-2"><i class="bi bi-clock me-1"></i> ' + escapeHTML(timeText) + '</span>' +
          '<h5 class="fw-bold mb-2">' + escapeHTML(item.title) + '</h5>' +
          speakerHtml +
          '<p class="small text-secondary mb-0">' + escapeHTML(truncate(item.description || '', 15)) + '</p>' +
        '</div>';

      row.appendChild(col);
    });

    container.appendChild(row);
  }

  function showEmptyState(container) {
    if (!container) return;
    container.innerHTML =
      '<div class="wcp-card text-center p-5">' +
        '<i class="bi bi-calendar-x fs-1 text-muted d-block mb-3"></i>' +
        '<h4 class="fw-bold text-forest">Schedule Information Being Finalised</h4>' +
        '<p class="text-secondary max-w-500 mx-auto mb-0">' +
          'The complete timeline of sessions, timings, and speakers will be updated soon by church organisers.' +
        '</p>' +
      '</div>';
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function truncate(str, wordCount) {
    var words = str.split(/\s+/);
    if (words.length <= wordCount) return str;
    return words.slice(0, wordCount).join(' ') + '...';
  }
})();
