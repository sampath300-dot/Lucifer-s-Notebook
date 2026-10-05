# A Quiet Space — Personal Thought & Conversation Platform

A production-ready personal platform designed with a calm, human, and editorial aesthetic. Built for reading essays and reflections, listening to unedited voice notes, and reaching out privately when someone wants to talk through something.

---

## Features

### Public Website
- **Home (`/`)**:
  - Hero section with editable headline, copy, CTA buttons, and optional balanced image.
  - Purpose statement / introductory reflection.
  - Recent published thoughts in an editorial list layout.
  - Audio journal section with clean, unobtrusive player (not styled like Spotify).
  - One-on-one conversation invite section.
  - Calm, restrained footer.
- **Thoughts (`/thoughts`)**:
  - Full archive of published writings with category filtering and real-time search.
  - Clean reading layout without marketing cards or distracting popups.
- **Individual Thought (`/thoughts/[slug]`)**:
  - Distraction-free reading experience, reading time estimates, categories, tags, and related thoughts.
- **Audio Journal (`/audio`)**:
  - Dedicated page for spoken notes and voice reflections.
  - Accessible audio player with play/pause, seek scrubber, ±10s skip, speed adjustment (1x, 1.25x, 1.5x), and volume/mute controls.
- **Let's Talk (`/talk`)**:
  - Human, welcoming conversation form (Preferred format: Chat / Voice call / Not sure yet; Preferred contact: WhatsApp / Email / Phone).
  - Client-side and server-side validation with honeypot spam protection.
  - Secure private submission storage in SQLite.

### Admin CMS Dashboard (`/admin`)
- **Dashboard Overview**: Summary stats (published thoughts, audio recordings, new conversations) and recent activity.
- **Thought Management (`/admin/thoughts`)**:
  - Create, edit, and delete thoughts.
  - Simple WYSIWYG rich-text editor (no HTML or Markdown required).
  - Save drafts, publish/unpublish, categorize, tag, and set cover images.
- **Audio Management (`/admin/audio`)**:
  - Upload persistent audio files (MP3, WAV, M4A, OGG).
  - Add title, description, recording date, and optional cover image.
  - Automatic duration detection.
- **Conversation Requests (`/admin/conversations`)**:
  - View all private inquiries with filter by status (`New`, `Contacted`, `Completed`, `Archived`).
  - Update status and record private owner notes.
  - One-click CSV export.
- **Media Library (`/admin/media`)**:
  - Upload and reuse images and audio recordings.
  - Integrated media picker across all admin forms.
- **Controlled Appearance Customization (`/admin/appearance`)**:
  - 4 Curated presets: **Warm Editorial**, **Minimal Light**, **Dark Journal**, and **Soft Neutral**.
  - Background controls: Color and custom image textures with position, sizing, and overlay opacity slider.
  - Accent color picker with contrast preservation.
  - Curated typography pairings for headings and body.
  - Section spacing (Compact, Normal, Spacious), button shapes, and card border styles.
  - **Real-time Live Preview** of changes before saving.
- **Site & Homepage Settings (`/admin/settings`)**:
  - Website name, owner bio, avatar, contact channels, social links, and SEO metadata.
  - Homepage text, section titles, and section visibility toggles.

---

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4 with dynamic CSS variables
- **Database**: SQLite via `better-sqlite3` (stored in `data/lucifer.db`, auto-migrated & seeded)
- **Authentication**: Stateless signed session cookies via `jose` and `bcryptjs`
- **Icons**: `lucide-react`

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Start
```bash
npm run build
npm start
```

---

## Default Admin Credentials
- **URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Username**: `admin`
- **Password**: `admin123`

---

## Running Verification Tests
To run the automated end-to-end integration test suite covering all public and admin workflows:
```bash
node tests/verify-all.mjs
```
