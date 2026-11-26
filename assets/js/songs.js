/**
 * CSI • Diocese of Karimnagar • Aler Group - Christmas Songs & Lyrics Module
 * Features:
 * - Reads songs from data/songs.json
 * - Filters only published songs (is_published: true)
 * - Homepage horizontal swipeable song directory with clickable song numbers (001 - 017)
 * - Full songs page with live search, language filter, quick-jump numbers, and URL hash support
 * - Expand / Collapse full lyrics inline and copy lyrics to clipboard
 */

(function () {
  'use strict';

  var isSubPage = window.location.pathname.includes('/pages/');
  var dataPrefix = isSubPage ? '../data/' : 'data/';

  var allSongs = [];
  var activeLanguage = 'All';
  var searchQuery = '';
  var activeSwipeIndex = 0;

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

        // Homepage swipeable all-songs directory
        if (previewContainer) {
          renderHomeSwipeSongs(previewContainer, allSongs);
        }

        // Full songs page
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
    var numbersNav = document.getElementById('song-page-numbers-nav');

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
          setFilterButtonState(filterButtons, this);
          activeLanguage = this.getAttribute('data-lang-filter') || 'All';
          renderFilteredSongs(container);
        });
      });
    }

    if (numbersNav) {
      renderNumberButtons(numbersNav, allSongs, function (song) {
        // Ensure target song is visible even if filtered/searched out
        var isVisible = document.getElementById('song-card-' + song.id);
        if (!isVisible) {
          activeLanguage = 'All';
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          if (filterButtons && filterButtons.length > 0) {
            setFilterButtonState(filterButtons, filterButtons[0]);
          }
          renderFilteredSongs(container);
        }

        setActiveNumberButton(numbersNav, song.id);
        scrollToFullPageSong(song.id);
      });
    }

    renderFilteredSongs(container);

    // Handle direct deep links like pages/songs.html#007
    if (window.location.hash) {
      var hashId = window.location.hash.replace('#', '').replace('song-', '');
      if (hashId) {
        if (numbersNav) setActiveNumberButton(numbersNav, hashId);
        setTimeout(function () {
          scrollToFullPageSong(hashId);
        }, 120);
      }
    }
  }

  function setFilterButtonState(filterButtons, activeBtn) {
    filterButtons.forEach(function (b) {
      b.classList.remove('active', 'btn-wcp-primary');
      b.classList.add('btn-outline-secondary');
    });
    activeBtn.classList.add('active', 'btn-wcp-primary');
    activeBtn.classList.remove('btn-outline-secondary');
  }

  function scrollToFullPageSong(songId) {
    var colEl = document.getElementById('song-card-' + songId);
    if (!colEl) return;

    colEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    var cardEl = colEl.querySelector('.song-card');
    if (cardEl) {
      triggerSpotlight(cardEl);
      var lyricsEl = document.getElementById('lyrics-' + songId);
      var toggleBtn = colEl.querySelector('.btn-toggle-lyrics');
      if (lyricsEl && lyricsEl.classList.contains('collapsed') && toggleBtn) {
        toggleLyricsBlock(lyricsEl, toggleBtn);
      }
    }
  }

  function renderFilteredSongs(container) {
    var filtered = allSongs.filter(function (song) {
      var matchesLang = (activeLanguage === 'All') || (song.language === activeLanguage);
      var titleText = (song.title || '').toLowerCase();
      var lyricsText = (song.lyrics || '').toLowerCase();
      var translitText = ((song.alternateTitle || song.transliteration) || '').toLowerCase();
      var numText = (song.number || '').toLowerCase();
      var matchesSearch = !searchQuery ||
        titleText.includes(searchQuery) ||
        lyricsText.includes(searchQuery) ||
        translitText.includes(searchQuery) ||
        numText.includes(searchQuery);
      return matchesLang && matchesSearch;
    });

    var countBadge = document.getElementById('song-count-badge');
    if (countBadge) {
      countBadge.textContent = 'Showing ' + filtered.length + ' of ' + allSongs.length + ' Songs';
    }

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center py-5">' +
          '<div class="wcp-card p-5 max-w-500 mx-auto">' +
            '<i class="bi bi-music-note-slash fs-1 text-muted d-block mb-3"></i>' +
            '<h4 class="fw-bold text-forest">No Songs Found</h4>' +
            '<p class="text-secondary mb-0">Try searching with different keywords or select "All Songs" filter.</p>' +
          '</div>' +
        '</div>';
      return;
    }

    filtered.forEach(function (song) {
      var col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4 mb-4';
      col.id = 'song-card-' + song.id;

      var card = buildSongCard(song, 'lyrics-' + song.id, false);
      col.appendChild(card);
      container.appendChild(col);
    });

    attachDynamicHandlers(container);

    if (window.wcpTriggerScrollReveal) {
      setTimeout(window.wcpTriggerScrollReveal, 50);
    }
  }

  function renderHomeSwipeSongs(container, items) {
    if (!items || items.length === 0) return;

    var numbersNav = document.getElementById('song-numbers-nav');
    var prevBtn = document.getElementById('song-swipe-prev');
    var nextBtn = document.getElementById('song-swipe-next');
    var indicator = document.getElementById('song-active-indicator');

    container.innerHTML = '';
    var track = document.createElement('div');
    track.className = 'song-swipe-track';
    track.id = 'home-songs-track';

    items.forEach(function (song, index) {
      var slide = document.createElement('div');
      slide.className = 'song-swipe-slide';
      slide.id = 'home-song-' + song.id;
      slide.setAttribute('data-song-id', song.id);
      slide.setAttribute('data-song-index', String(index));

      var card = buildSongCard(song, 'home-lyrics-' + song.id, true);
      slide.appendChild(card);
      track.appendChild(slide);
    });

    container.appendChild(track);
    attachDynamicHandlers(container);
    attachDragToSwipe(track);

    var isProgrammaticScroll = false;
    var scrollLockTimer = null;

    function updateActiveUi(index) {
      if (index < 0 || index >= items.length) return;
      activeSwipeIndex = index;
      var song = items[index];
      if (numbersNav) {
        setActiveNumberButton(numbersNav, song.id);
      }
      if (indicator) {
        indicator.textContent = (song.number || song.id) + ' / ' + String(items.length).padStart(3, '0');
      }
    }

    function swipeToIndex(index) {
      if (index < 0) index = 0;
      if (index >= items.length) index = items.length - 1;

      var song = items[index];
      var slide = track.querySelector('[data-song-id="' + song.id + '"]');
      if (!slide) return;

      updateActiveUi(index);

      isProgrammaticScroll = true;
      if (scrollLockTimer) clearTimeout(scrollLockTimer);
      scrollLockTimer = setTimeout(function () {
        isProgrammaticScroll = false;
      }, 650);

      // Compute horizontal target offset inside track (centered on mobile, start-aligned on wider viewports)
      var isMobile = window.innerWidth < 768;
      var targetLeft = isMobile
        ? slide.offsetLeft - Math.max(0, (track.clientWidth - slide.offsetWidth) / 2)
        : slide.offsetLeft - 2;

      var maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      if (targetLeft < 0) targetLeft = 0;
      if (targetLeft > maxScroll) targetLeft = maxScroll;

      track.scrollTo({
        left: targetLeft,
        behavior: 'smooth'
      });

      var cardEl = slide.querySelector('.song-card');
      if (cardEl) triggerSpotlight(cardEl);
    }

    if (numbersNav) {
      renderNumberButtons(numbersNav, items, function (song, idx) {
        swipeToIndex(idx);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        var nextIdx = activeSwipeIndex > 0 ? activeSwipeIndex - 1 : items.length - 1;
        swipeToIndex(nextIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var nextIdx = activeSwipeIndex < items.length - 1 ? activeSwipeIndex + 1 : 0;
        swipeToIndex(nextIdx);
      });
    }

    // Keep number badge synced when user swipes manually with touch / scrollbar
    var scrollSyncTimer = null;
    track.addEventListener('scroll', function () {
      if (isProgrammaticScroll) return;
      if (scrollSyncTimer) clearTimeout(scrollSyncTimer);
      scrollSyncTimer = setTimeout(function () {
        var isMobile = window.innerWidth < 768;
        var refPoint = isMobile
          ? track.scrollLeft + track.clientWidth / 2
          : track.scrollLeft + 24;

        var slides = track.querySelectorAll('.song-swipe-slide');
        var closestIdx = 0;
        var minDist = Infinity;

        slides.forEach(function (slide, idx) {
          var slidePoint = isMobile
            ? slide.offsetLeft + slide.offsetWidth / 2
            : slide.offsetLeft;
          var dist = Math.abs(slidePoint - refPoint);
          if (dist < minDist) {
            minDist = dist;
            closestIdx = idx;
          }
        });

        updateActiveUi(closestIdx);
      }, 90);
    }, { passive: true });

    // Initialize state to song 001
    updateActiveUi(0);

    if (window.wcpTriggerScrollReveal) {
      setTimeout(window.wcpTriggerScrollReveal, 50);
    }
  }

  function buildSongCard(song, lyricsDomId, includeFullPageLink) {
    var card = document.createElement('div');
    card.className = 'song-card h-100 d-flex flex-column shadow-sm border border-light';

    var numberBadge = '<span class="badge bg-warning-subtle text-dark border border-warning me-1">#' + escapeHTML(song.number || song.id) + '</span>';
    var langBadge = '<span class="badge bg-secondary-subtle text-dark me-1">' + escapeHTML(song.language || 'Song') + '</span>';
    var catBadge = song.category
      ? '<span class="badge bg-success-subtle text-success">' + escapeHTML(song.category) + '</span>'
      : '';

    var alternateTitleHtml = song.alternateTitle
      ? '<div class="small text-secondary fst-italic mb-2" style="font-size: 0.82rem;"><i class="bi bi-music-note me-1 text-gold"></i>' + escapeHTML(song.alternateTitle) + '</div>'
      : '';

    var fullLinkHtml = includeFullPageLink
      ? '<a href="pages/songs.html#' + escapeHTML(song.id) + '" class="btn btn-sm btn-link text-decoration-none text-forest fw-semibold p-0" title="Open on full page">' +
          '<i class="bi bi-box-arrow-up-right"></i>' +
        '</a>'
      : '';

    card.innerHTML =
      '<div class="d-flex justify-content-between align-items-start gap-2 mb-2">' +
        '<div class="d-flex flex-wrap gap-1 align-items-center">' + numberBadge + langBadge + catBadge + '</div>' +
        '<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill btn-copy-lyrics flex-shrink-0" data-copy-id="' + escapeHTML(lyricsDomId) + '" title="Copy lyrics to clipboard">' +
          '<i class="bi bi-clipboard me-1"></i> Copy' +
        '</button>' +
      '</div>' +
      '<h4 class="fw-bold text-forest mb-1" style="font-size: 1.12rem; line-height: 1.35;">' + escapeHTML(song.title) + '</h4>' +
      alternateTitleHtml +
      '<div class="song-lyrics-container collapsed flex-grow-1" id="' + escapeHTML(lyricsDomId) + '">' +
        escapeHTML(song.lyrics || '') +
      '</div>' +
      '<div class="mt-3 d-flex justify-content-between align-items-center gap-2">' +
        fullLinkHtml +
        '<button type="button" class="btn btn-sm btn-wcp-outline rounded-pill btn-toggle-lyrics ms-auto" data-target-id="' + escapeHTML(lyricsDomId) + '">' +
          '<i class="bi bi-chevron-down me-1"></i> Read Full Song' +
        '</button>' +
      '</div>';

    return card;
  }

  function renderNumberButtons(navContainer, items, onSelect) {
    navContainer.innerHTML = '';
    items.forEach(function (song, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'song-num-btn' + (index === 0 ? ' active' : '');
      btn.setAttribute('data-song-id', song.id);
      btn.setAttribute('title', (song.number || song.id) + ' — ' + (song.title || ''));
      btn.textContent = song.number || song.id;

      btn.addEventListener('click', function () {
        onSelect(song, index);
      });

      navContainer.appendChild(btn);
    });
  }

  function setActiveNumberButton(navContainer, songId) {
    navContainer.querySelectorAll('.song-num-btn').forEach(function (btn) {
      if (btn.getAttribute('data-song-id') === String(songId)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function triggerSpotlight(cardEl) {
    cardEl.classList.remove('song-card-highlight');
    void cardEl.offsetWidth;
    cardEl.classList.add('song-card-highlight');
  }

  function toggleLyricsBlock(lyricsEl, toggleBtn) {
    if (lyricsEl.classList.contains('collapsed')) {
      lyricsEl.classList.remove('collapsed');
      lyricsEl.classList.add('expanded');
      toggleBtn.innerHTML = '<i class="bi bi-chevron-up me-1"></i> Show Less';
    } else {
      lyricsEl.classList.remove('expanded');
      lyricsEl.classList.add('collapsed');
      toggleBtn.innerHTML = '<i class="bi bi-chevron-down me-1"></i> Read Full Song';
    }
  }

  function attachDragToSwipe(track) {
    var isDown = false;
    var startX = 0;
    var startScrollLeft = 0;
    var hasDragged = false;

    track.addEventListener('mousedown', function (e) {
      if (e.target.closest('button, a, .song-lyrics-container.expanded')) return;
      isDown = true;
      hasDragged = false;
      startX = e.pageX;
      startScrollLeft = track.scrollLeft;
    });

    window.addEventListener('mouseup', function () {
      isDown = false;
      if (hasDragged) {
        setTimeout(function () { hasDragged = false; }, 50);
      }
    });

    track.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      var delta = e.pageX - startX;
      if (Math.abs(delta) > 6) {
        hasDragged = true;
        e.preventDefault();
        track.scrollLeft = startScrollLeft - delta * 1.25;
      }
    });
  }

  function attachDynamicHandlers(container) {
    // Expand / Collapse
    container.querySelectorAll('.btn-toggle-lyrics').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = this.getAttribute('data-target-id');
        var lyricsEl = document.getElementById(targetId);
        if (!lyricsEl) return;
        toggleLyricsBlock(lyricsEl, this);
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
})();
