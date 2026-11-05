/**
 * Wesley Church Palliwada - Songs and Lyrics Module
 * Features:
 * - Reads songs from data/songs.json
 * - Filters only published songs (is_published: true)
 * - Live search by title and lyrics
 * - Filter by language (All, Telugu, English, Hindi, Other)
 * - Expand / Collapse long lyrics
 * - Copy lyrics to clipboard with visual feedback
 */

(function () {
  'use strict';

  var isSubPage = window.location.pathname.includes('/pages/');
  var dataPrefix = isSubPage ? '../data/' : 'data/';

  var allSongs = [];
  var activeLanguage = 'All';
  var searchQuery = '';

  document.addEventListener('DOMContentLoaded', function () {
    var songsContainer = document.getElementById('songs-list-container');
    var previewContainer = document.getElementById('preview-songs-container');

    if (!songsContainer && !previewContainer) return;

    fetch(dataPrefix + 'songs.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (songs) {
        if (!Array.isArray(songs)) return;

        // Filter only published songs and sort by display_order
        allSongs = songs.filter(function (s) {
          return s.is_published === true;
        }).sort(function (a, b) {
          return (a.display_order || 0) - (b.display_order || 0);
        });

        // If on homepage preview
        if (previewContainer) {
          renderPreviewSongs(previewContainer, allSongs.slice(0, 4));
        }

        // If on full songs page
        if (songsContainer) {
          initSongsPage(songsContainer);
        }
      })
      .catch(function (err) {
        console.warn('Could not load songs.json:', err);
      });
  });

  function initSongsPage(container) {
    var searchInput = document.getElementById('song-search-input');
    var filterButtons = document.querySelectorAll('[data-lang-filter]');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = this.value.toLowerCase().trim();
        renderFilteredSongs(container);
      });
    }

    if (filterButtons) {
      filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          filterButtons.forEach(function (b) { b.classList.remove('active', 'btn-wcp-primary'); b.classList.add('btn-outline-secondary'); });
          this.classList.add('active', 'btn-wcp-primary');
          this.classList.remove('btn-outline-secondary');

          activeLanguage = this.getAttribute('data-lang-filter') || 'All';
          renderFilteredSongs(container);
        });
      });
    }

    renderFilteredSongs(container);
  }

  function renderFilteredSongs(container) {
    var filtered = allSongs.filter(function (song) {
      var matchesLang = (activeLanguage === 'All') || (song.language === activeLanguage);
      var titleText = (song.title || '').toLowerCase();
      var lyricsText = (song.lyrics || '').toLowerCase();
      var translitText = (song.transliteration || '').toLowerCase();
      var matchesSearch = !searchQuery || titleText.includes(searchQuery) || lyricsText.includes(searchQuery) || translitText.includes(searchQuery);
      return matchesLang && matchesSearch;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center py-5">' +
          '<div class="wcp-card p-5 max-w-500 mx-auto">' +
            '<i class="bi bi-music-note-slash fs-1 text-muted d-block mb-3"></i>' +
            '<h4 class="fw-bold text-forest">No Songs Found</h4>' +
            '<p class="text-secondary mb-0">Try searching with different keywords or switch language filters.</p>' +
          '</div>' +
        '</div>';
      return;
    }

    filtered.forEach(function (song) {
      var col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4 mb-4';

      var card = document.createElement('div');
      card.className = 'song-card';

      var langBadge = '<span class="badge bg-secondary-subtle text-dark">' + escapeHTML(song.language || 'Song') + '</span>';
      var catBadge = song.category
        ? '<span class="badge bg-success-subtle text-success">' + escapeHTML(song.category) + '</span>'
        : '';

      var lyricsId = 'lyrics-' + song.id;

      card.innerHTML =
        '<div class="d-flex justify-content-between align-items-center mb-2">' +
          '<div>' + langBadge + ' ' + catBadge + '</div>' +
          '<button class="btn btn-sm btn-copy-lyrics" data-copy-id="' + lyricsId + '" title="Copy lyrics to clipboard">' +
            '<i class="bi bi-clipboard me-1"></i> Copy' +
          '</button>' +
        '</div>' +
        '<h4 class="fw-bold text-forest mb-2">' + escapeHTML(song.title) + '</h4>' +
        '<div class="song-lyrics-container collapsed" id="' + lyricsId + '">' +
          escapeHTML(song.lyrics || '') +
        '</div>' +
        '<div class="mt-3 text-end">' +
          '<button class="btn btn-sm btn-outline-success btn-toggle-lyrics" data-target-id="' + lyricsId + '">' +
            '<i class="bi bi-chevron-down me-1"></i> Read Full Lyrics' +
          '</button>' +
        '</div>';

      col.appendChild(card);
      container.appendChild(col);
    });

    attachDynamicHandlers(container);
  }

  function renderPreviewSongs(container, items) {
    container.innerHTML = '';
    var row = document.createElement('div');
    row.className = 'row g-4';

    items.forEach(function (song) {
      var col = document.createElement('div');
      col.className = 'col-md-6 col-lg-3';

      col.innerHTML =
        '<div class="song-card">' +
          '<div class="d-flex justify-content-between align-items-center mb-2">' +
            '<span class="badge bg-secondary-subtle text-dark">' + escapeHTML(song.language || 'Song') + '</span>' +
            '<span class="badge bg-warning-subtle text-dark">' + escapeHTML(song.category || 'Worship') + '</span>' +
          '</div>' +
          '<h5 class="fw-bold mb-2 text-forest">' + escapeHTML(song.title) + '</h5>' +
          '<div class="small text-muted flex-grow-1" style="max-height: 110px; overflow: hidden; white-space: pre-line;">' +
            escapeHTML(truncateLines(song.lyrics || '', 4)) +
          '</div>' +
          '<div class="mt-3">' +
            '<a href="pages/songs.html" class="btn btn-sm btn-wcp-forest w-100">' +
              '<i class="bi bi-file-text me-1"></i> Read Lyrics' +
            '</a>' +
          '</div>' +
        '</div>';

      row.appendChild(col);
    });

    container.appendChild(row);
  }

  function attachDynamicHandlers(container) {
    // Expand / Collapse Lyrics
    container.querySelectorAll('.btn-toggle-lyrics').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = this.getAttribute('data-target-id');
        var lyricsEl = document.getElementById(targetId);
        if (!lyricsEl) return;

        if (lyricsEl.classList.contains('collapsed')) {
          lyricsEl.classList.remove('collapsed');
          lyricsEl.classList.add('expanded');
          this.innerHTML = '<i class="bi bi-chevron-up me-1"></i> Show Less';
        } else {
          lyricsEl.classList.remove('expanded');
          lyricsEl.classList.add('collapsed');
          this.innerHTML = '<i class="bi bi-chevron-down me-1"></i> Read Full Lyrics';
        }
      });
    });

    // Copy Lyrics to Clipboard
    container.querySelectorAll('.btn-copy-lyrics').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var copyId = this.getAttribute('data-copy-id');
        var lyricsEl = document.getElementById(copyId);
        if (!lyricsEl) return;

        var textToCopy = lyricsEl.textContent.trim();
        var originalHTML = this.innerHTML;
        var buttonElement = this;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(function () {
            buttonElement.innerHTML = '<i class="bi bi-check2 text-success me-1"></i> Copied!';
            setTimeout(function () {
              buttonElement.innerHTML = originalHTML;
            }, 2000);
          }).catch(function () {
            fallbackCopy(textToCopy, buttonElement, originalHTML);
          });
        } else {
          fallbackCopy(textToCopy, buttonElement, originalHTML);
        }
      });
    });
  }

  function fallbackCopy(text, btn, originalHTML) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      btn.innerHTML = '<i class="bi bi-check2 text-success me-1"></i> Copied!';
      setTimeout(function () { btn.innerHTML = originalHTML; }, 2000);
    } catch (err) {
      console.warn('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function truncateLines(text, count) {
    var lines = text.split('\n');
    return lines.slice(0, count).join('\n') + '...';
  }
})();

