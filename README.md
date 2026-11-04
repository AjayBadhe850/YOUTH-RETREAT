# WESLEY CHURCH PALLIWADA — YOUTH RETREAT WEBSITE

> **Church Name:** Wesley Church Palliwada  
> **Tagline / Opening:** PRAISE THE LORD  
> **Location:** Palliwada Village, Ramannapeta Mandal, Yadadri Bhuvanagiri District, Telangana, India  
> **PIN Code:** 508113  
> **Event:** One-Day Youth Retreat  
> **Architecture:** Pure Static Website (Zero Backend, Zero Database, Zero User-Data Collection)

---

## 1. Project Overview

A complete, beautiful, modern, mobile-first static website built for **Wesley Church Palliwada** for their upcoming One-Day Youth Retreat.

The website provides visitors and attendees with church information, retreat guidelines, the event schedule timeline, and worship songs with multilingual lyrics (Telugu, English, and Hindi).

All editable content is decoupled into simple, easily maintainable JSON files located in the `data/` folder, allowing church organisers to update schedules, dates, and songs without modifying complex HTML or JavaScript.

---

## 2. Technology Stack (Strict Free Static Architecture)

| Component | Technology | Implementation Details |
|---|---|---|
| Frontend Structure | HTML5 | Semantic, accessible, mobile-first markup |
| Styling & Theme | CSS3 | Custom typography, church color palette, animations |
| UI Framework | Bootstrap 5.3.3 | Loaded via CDN; responsive grid, cards, navbar |
| Icons | Bootstrap Icons 1.11.3 | Loaded via CDN; church, music, and clock icons |
| Typography | Google Fonts | *Cinzel* (headings) & *Plus Jakarta Sans* (body) |
| Interactions | Vanilla JavaScript | Splash screen, dynamic content binding, search & filter |
| Content Storage | Local JSON Files | `data/church.json`, `retreat.json`, `schedule.json`, `songs.json` |
| Hosting Target | Render Static Site | Zero-cost static site hosting with instant deployment |
| Source Control | Git & GitHub | Connected for automatic static deployment |

### Strict Boundary Adherence
- **Zero Backend**: No Node.js, Python/Django/Flask, PHP, or server-side runtimes.
- **Zero Database**: No PostgreSQL, MySQL, SQLite, MongoDB, or Supabase.
- **Zero User Data**: No forms, no participant registration, no tracking, no cookies.
- **Zero Paid Services**: 100% free hosting and CDN dependencies.

---

## 3. Visual Identity & Color System

- **Forest Green (`#173B2B`)**: Primary church branding, navigation, and primary headings.
- **Muted Gold (`#C7A45A`)**: Accents, highlight borders, buttons, and badges.
- **Warm Ivory (`#F8F5ED`)**: Soft, welcoming background tone.
- **Soft White (`#FFFFFF`)**: Card surfaces, containers, and readable contrast areas.
- **Light Sage (`#E8EEE8`)**: Subtle section backgrounds, tags, and icons.
- **Dark Charcoal (`#222222`)**: High-contrast body text for optimal readability.

---

## 4. Key Website Features

1. **Two-Second Opening Screen ("PRAISE THE LORD")**:
   - Displays a full-screen devotional greeting: **PRAISE THE LORD** and **WESLEY CHURCH PALLIWADA**.
   - Exactly 2.0-second display duration followed by a smooth CSS fade-out.
   - Preserves state using `sessionStorage` so visitors are not interrupted when navigating between pages.
   - Respects `prefers-reduced-motion` media queries for accessibility.

2. **Public Website Pages**:
   - `index.html` (Home Page): Welcoming hero section, theme scripture (*1 Timothy 4:12*), highlights, schedule preview (`#preview-schedule-container`), featured songs preview (`#preview-songs-container`), church location details, and footer.
   - `pages/about.html` (About Church): Church identity, history, pastoral welcome, core spiritual pillars, and official location breakdown (Palliwada, Ramannapeta Mandal, Yadadri Bhuvanagiri, Telangana – 508113).
   - `pages/retreat.html` (Retreat Information): Theme meditation, schedule facts, retreat highlights, and attendee guidelines (Bible, notebook, pen, punctuality, reverence).
   - `pages/schedule.html` (Programme Schedule): Sequential timeline rendered dynamically from `data/schedule.json`, sorted by `display_order`, with time intervals, session descriptions, and browser print layout.
   - `pages/songs.html` (Worship Songs & Lyrics): Multilingual songbook (Telugu, English, Hindi) with real-time live search, language filter buttons, expandable lyrics, and 1-click clipboard copying.

---

## 5. Project Directory Structure

```text
YOUTH RETREAT/
├── index.html                  # Main Landing Page with 2s Splash Screen
├── README.md                   # Complete Project Documentation & Deployment Guide
├── .gitignore                  # Git Ignore configuration
├── pages/
│   ├── about.html              # Church Profile & Village Address (PIN 508113)
│   ├── retreat.html            # Theme, Scripture & Attendee Guidelines
│   ├── schedule.html           # Full Programme Timeline
│   └── songs.html              # Worship Songbook with Live Search & Filters
├── data/
│   ├── church.json             # Church Name, Village, Mandal, District, PIN
│   ├── retreat.json            # Theme, Scripture Verse, Timings, Guidelines
│   ├── schedule.json           # Chronological Timeline of Sessions & Speakers
│   └── songs.json              # Multilingual Songs (Telugu, English, Hindi)
└── assets/
    ├── css/
    │   ├── style.css           # Custom Palette, Typography, Cards, Timeline
    │   └── responsive.css      # Mobile-First Breakpoints & Print Layout
    └── js/
        ├── main.js             # Splash Screen (2s) & Mobile Navbar Controller
        ├── content.js          # Dynamic JSON Data-Binding for Church & Retreat
        ├── schedule.js         # Timeline Renderer & Display Order Sorter
        └── songs.js            # Live Search, Language Filter & Clipboard Copy
```

---

## 6. How Organisers Update Content (JSON Decoupling)

Church organisers do not need to edit HTML or JavaScript. To change content:

1. **Change Church or Address Details:**
   Edit `data/church.json`. Update fields like `welcome_message`, `church_introduction`, or `helpline_placeholder`.

2. **Update Retreat Dates or Theme:**
   Edit `data/retreat.json`. Update `date`, `timings`, `venue`, or `scripture_verse`.

3. **Add or Modify Schedule Sessions:**
   Edit `data/schedule.json`. Add a new item object with `title`, `start_time`, `end_time`, `speaker_activity`, `description`, and `display_order`.

4. **Add or Edit Worship Songs:**
   Edit `data/songs.json`. Add or edit a song with `title`, `language` (`Telugu`, `English`, `Hindi`), `category`, `lyrics`, and `is_published: true`.

---

## 7. Local Testing & Verification

Because this is a pure static website with `fetch()` calls to local JSON files, test using any local HTTP web server (browsers restrict `fetch()` on `file://` protocols for security):

### Option A: Using Python built-in server (Recommended)
```bash
# In the project root directory:
python -m http.server 8000
```
Open your browser at: [http://localhost:8000](http://localhost:8000)

### Option B: Using VS Code Live Server extension
Right-click `index.html` and click **"Open with Live Server"**.

---

## 8. Deployment to Render (Render Static Site)

Render provides free hosting for static sites with global CDN distribution and SSL.

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Complete static website for Wesley Church Palliwada Youth Retreat"
   git push origin main
   ```

2. **Create New Static Site on Render:**
   - Log in to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** > **Static Site**.
   - Connect your GitHub repository (`YOUTH RETREAT`).

3. **Configure Settings:**
   - **Name:** `wesley-church-palliwada` (or any custom name)
   - **Branch:** `main`
   - **Build Command:** *(Leave blank)*
   - **Publish Directory:** `.` *(a single dot represents the project root)*

4. **Deploy:**
   - Click **Create Static Site**.
   - Render deploys in under 30 seconds and assigns an HTTPS URL (e.g., `https://wesley-church-palliwada.onrender.com`).

---

## 9. Contact & Church Details

- **Church:** Wesley Church Palliwada
- **Village:** Palliwada
- **Mandal:** Ramannapeta
- **District:** Yadadri Bhuvanagiri
- **State:** Telangana, India
- **PIN Code:** 508113
- **Devotional Motto:** *Praise The Lord*
