import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import {
  Thought,
  AudioJournal,
  Conversation,
  MediaItem,
  SiteSettings,
  AppearanceSettings,
  ConversationStatus,
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'lucifer.db');

// Singleton connection to prevent multiple connections in dev hot-reloads
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    initDb(dbInstance);
  }
  return dbInstance;
}

export const defaultSiteSettings: SiteSettings = {
  website_name: "A Quiet Space",
  owner_name: "Lucifer",
  short_bio: "A personal space for unhurried reflections, recorded notes, and one-on-one conversations.",
  profile_image: "/uploads/profile-avatar.svg",
  logo: "",
  email: "lucifer@quietcorner.space",
  whatsapp: "+1 (555) 019-2834",
  phone: "+1 (555) 019-2834",
  social_x: "https://x.com",
  social_instagram: "https://instagram.com",
  social_substack: "https://substack.com",
  footer_text: "A space for thoughts, conversations, and honest reflection.",
  seo_title: "A Quiet Space — Personal Thoughts & Conversations",
  seo_description: "A thoughtful personal journal and private space to reflect, listen to audio notes, and reach out for honest conversations.",
  favicon: "/favicon.ico",

  hero_heading: "Some thoughts are easier to understand when you talk them through.",
  hero_description: "A space for thoughts, conversations, and honest reflection. Read through my journal, listen in on voice reflections, or reach out when you need a quiet ear.",
  hero_primary_cta_text: "Read my thoughts",
  hero_primary_cta_link: "/thoughts",
  hero_secondary_cta_text: "Let's talk",
  hero_secondary_cta_link: "/talk",
  hero_image: "/uploads/cover-thought-1.svg",
  hero_show_image: "true",

  intro_heading: "Why this space exists",
  intro_text: "Sometimes we don't need an immediate answer. We just need a place to slow down, put our thoughts into words, and look at them differently without noise or judgment.",

  section_thoughts_title: "Recent Thoughts",
  section_thoughts_desc: "Essays and short notes on life, stillness, and trying to understand things.",

  section_audio_title: "Audio Journal",
  section_audio_desc: "Unedited voice memos and quiet spoken reflections recorded along the way.",

  section_talk_title: "Something on your mind?",
  section_talk_desc: "You don't need to have everything figured out before reaching out. If you're carrying a problem or just need someone to think through it with, my door is open.",

  show_hero: "true",
  show_intro: "true",
  show_thoughts: "true",
  show_audio: "true",
  show_talk: "true",
};

export const defaultAppearanceSettings: AppearanceSettings = {
  preset: "warm-editorial",
  mode: "system",
  accent_color: "#A35C4A",
  bg_color: "#FAF7F2",
  text_color: "#2C2723",
  bg_image: "",
  bg_position: "center",
  bg_size: "cover",
  bg_overlay: "0",
  font_heading: "serif-editorial",
  font_body: "sans-clean",
  spacing: "normal",
  button_style: "slightly-rounded",
  border_style: "minimal",
};

function initDb(db: Database.Database) {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Thoughts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS thoughts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image TEXT,
      category TEXT NOT NULL DEFAULT 'Reflections',
      tags TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'published',
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Audio Journals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audio_journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      duration TEXT NOT NULL DEFAULT '0:00',
      cover_image TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Conversations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      preferred_format TEXT NOT NULL,
      contact_method TEXT NOT NULL,
      contact_info TEXT NOT NULL,
      additional_context TEXT,
      status TEXT NOT NULL DEFAULT 'New',
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Media table
  db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Site Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Appearance Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appearance_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default admin if missing
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCheck.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    db.prepare('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)').run(
      'admin',
      hash,
      new Date().toISOString()
    );
  }

  // Seed site settings if missing
  const siteSettingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
  if (siteSettingsCount.count === 0) {
    const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    for (const [key, val] of Object.entries(defaultSiteSettings)) {
      insertSetting.run(key, val);
    }
  }

  // Seed appearance settings if missing
  const appearanceCount = db.prepare('SELECT COUNT(*) as count FROM appearance_settings').get() as { count: number };
  if (appearanceCount.count === 0) {
    const insertAppearance = db.prepare('INSERT INTO appearance_settings (key, value) VALUES (?, ?)');
    for (const [key, val] of Object.entries(defaultAppearanceSettings)) {
      insertAppearance.run(key, val);
    }
  }

  // Seed sample thoughts if empty
  const thoughtsCount = db.prepare('SELECT COUNT(*) as count FROM thoughts').get() as { count: number };
  if (thoughtsCount.count === 0) {
    const insertThought = db.prepare(`
      INSERT INTO thoughts (title, slug, excerpt, content, cover_image, category, tags, status, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertThought.run(
      'The Quiet Between Our Thoughts',
      'the-quiet-between-our-thoughts',
      'We often rush to fill silence because stillness feels like emptiness. But silence is rarely empty; it is simply unhurried.',
      `<h2>The Urge to Fill the Space</h2>
<p>In our ordinary days, silence feels almost like a technical failure. We reach for headphones the moment we step outside, queue up podcasts while we cook, and check our screens at every red light. We have organized our lives so that no two thoughts can collide without a layer of commentary buffering the space between them.</p>

<p>Yet when you talk with someone who is genuinely listening, something strange happens. They do not interrupt with advice. They do not rush to match your story with their own. They let the sentence breathe. In that small pocket of silence, you often find what you actually meant to say.</p>

<blockquote>"We do not always need solutions. Sometimes we just need enough room to hear ourselves speak the truth without feeling judged for how messy it sounds."</blockquote>

<h2>Learning to Sit with What Is Unfinished</h2>
<p>Most of the things that burden us are not solved in a single flash of insight. They are worked through slowly, like walking through tall grass in the morning dew. You don't have to conquer the field; you just need to keep taking honest steps.</p>

<p>If you're carrying something you haven't yet found the right words for, that is okay. You don't need a polished thesis to begin a conversation. Starting with 'I'm not sure, but it feels like this' is more than enough.</p>`,
      '/uploads/cover-thought-1.svg',
      'Reflections',
      'Stillness, Listening, Mindset',
      'published',
      new Date(Date.now() - 86400000 * 3).toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    );

    insertThought.run(
      'Conversations We Avoid Having',
      'conversations-we-avoid-having',
      'The things that matter most often live behind the first sentence we are too hesitant to speak.',
      `<h2>The Weight of Unspoken Words</h2>
<p>Almost everyone carries a conversation they have been postponing. It might be an apology that has grown cold with time. It might be an admission that we are exhausted, or confused, or that the path we chose two years ago is no longer where we want to go.</p>

<p>We avoid these conversations because we convince ourselves that bringing them to light will break something. We forget that carrying them in secret is already wearing us down.</p>

<h2>Lowering the Threshold</h2>
<p>A conversation does not need to be a confrontation. It can simply be a gentle check-in. When we give each other permission to speak without needing to defend ourselves, the heavy fog begins to lift.</p>

<p>That is what this platform is for: a quiet, respectful place where you can say the thing that has been sitting in your chest without worrying about performance or expectations.</p>`,
      '/uploads/cover-thought-2.svg',
      'Honesty',
      'Relationships, Communication, Courage',
      'published',
      new Date(Date.now() - 86400000 * 7).toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    );

    insertThought.run(
      'Notes on Patience and Becoming',
      'notes-on-patience-and-becoming',
      'We cannot demand clarity from ourselves before we have lived through the questions.',
      `<h2>The Myth of the Straight Line</h2>
<p>There is a quiet cruelty in expecting our lives to proceed in neat, measurable increments. Trees do not grow with the urgency of a quarterly review; they spend half the year consolidating their roots beneath the frozen earth.</p>

<p>When you feel stuck, it rarely means you have stopped moving. More often, it means you are processing experiences faster than your conscious mind can organize them.</p>

<p>Give yourself the grace of a rough draft. You do not need to be finished to be worthy of conversation, understanding, and care.</p>`,
      '/uploads/cover-thought-3.svg',
      'Growth',
      'Patience, Self-awareness, Time',
      'published',
      new Date(Date.now() - 86400000 * 14).toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  // Seed sample audio journals if empty
  const audioCount = db.prepare('SELECT COUNT(*) as count FROM audio_journals').get() as { count: number };
  if (audioCount.count === 0) {
    const insertAudio = db.prepare(`
      INSERT INTO audio_journals (title, description, audio_url, duration, cover_image, status, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudio.run(
      'Late Evening Musings on Stillness',
      'A short voice reflection recorded after a rainy walk. Thinking about why letting go of certainty feels so difficult, and why that is completely natural.',
      '/uploads/sample-audio-journal-1.wav',
      '0:12',
      '/uploads/cover-thought-1.svg',
      'published',
      new Date(Date.now() - 86400000 * 2).toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    );

    insertAudio.run(
      'On Speaking What Is Difficult',
      'A candid audio note on why saying "I need help" or "I am unsure" is often the hardest sentence, and how a listening ear changes everything.',
      '/uploads/sample-audio-journal-2.wav',
      '0:15',
      '/uploads/cover-thought-2.svg',
      'published',
      new Date(Date.now() - 86400000 * 5).toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  // Seed a sample conversation submission if empty
  const conversationCount = db.prepare('SELECT COUNT(*) as count FROM conversations').get() as { count: number };
  if (conversationCount.count === 0) {
    const insertConv = db.prepare(`
      INSERT INTO conversations (name, content, preferred_format, contact_method, contact_info, additional_context, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertConv.run(
      'Elena Vance',
      'I have been feeling stuck in a career transition and feeling like nobody around me really understands the disorientation. I read your thought on patience and it resonated. Would love to have a short voice call or chat to talk it through.',
      'Voice call',
      'Email',
      'elena.vance@example.com',
      'Available mostly on weekday evenings.',
      'New',
      'Reached out after reading "Notes on Patience and Becoming".',
      new Date(Date.now() - 3600000 * 4).toISOString()
    );
  }

  // Seed sample media items if empty
  const mediaCount = db.prepare('SELECT COUNT(*) as count FROM media').get() as { count: number };
  if (mediaCount.count === 0) {
    const insertMedia = db.prepare(`
      INSERT INTO media (filename, original_name, mime_type, size, url, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    insertMedia.run('cover-thought-1.svg', 'cover-thought-1.svg', 'image/svg+xml', 1024, '/uploads/cover-thought-1.svg', now);
    insertMedia.run('cover-thought-2.svg', 'cover-thought-2.svg', 'image/svg+xml', 1024, '/uploads/cover-thought-2.svg', now);
    insertMedia.run('cover-thought-3.svg', 'cover-thought-3.svg', 'image/svg+xml', 1024, '/uploads/cover-thought-3.svg', now);
    insertMedia.run('profile-avatar.svg', 'profile-avatar.svg', 'image/svg+xml', 1024, '/uploads/profile-avatar.svg', now);
    insertMedia.run('sample-audio-journal-1.wav', 'sample-audio-journal-1.wav', 'audio/wav', 1058444, '/uploads/sample-audio-journal-1.wav', now);
    insertMedia.run('sample-audio-journal-2.wav', 'sample-audio-journal-2.wav', 'audio/wav', 1323044, '/uploads/sample-audio-journal-2.wav', now);
  }
}

// ==========================================
// DB HELPER FUNCTIONS
// ==========================================

export function getSiteSettings(): SiteSettings {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[];
  const settings = { ...defaultSiteSettings };
  for (const row of rows) {
    if (row.key in settings) {
      (settings as any)[row.key] = row.value;
    }
  }
  return settings;
}

export function updateSiteSettings(settings: Partial<SiteSettings>): void {
  const db = getDb();
  const updateStmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  const transaction = db.transaction((entries: [string, string][]) => {
    for (const [k, v] of entries) {
      updateStmt.run(k, String(v ?? ''));
    }
  });
  transaction(Object.entries(settings));
}

export function getAppearanceSettings(): AppearanceSettings {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM appearance_settings').all() as { key: string; value: string }[];
  const settings = { ...defaultAppearanceSettings };
  for (const row of rows) {
    if (row.key in settings) {
      (settings as any)[row.key] = row.value;
    }
  }
  return settings;
}

export function updateAppearanceSettings(settings: Partial<AppearanceSettings>): void {
  const db = getDb();
  const updateStmt = db.prepare('INSERT OR REPLACE INTO appearance_settings (key, value) VALUES (?, ?)');
  const transaction = db.transaction((entries: [string, string][]) => {
    for (const [k, v] of entries) {
      updateStmt.run(k, String(v ?? ''));
    }
  });
  transaction(Object.entries(settings));
}

// Thoughts
export function getThoughts(includeDrafts = false): Thought[] {
  const db = getDb();
  if (includeDrafts) {
    return db.prepare('SELECT * FROM thoughts ORDER BY published_at DESC').all() as Thought[];
  }
  return db.prepare("SELECT * FROM thoughts WHERE status = 'published' ORDER BY published_at DESC").all() as Thought[];
}

export function getThoughtBySlug(slug: string, includeDrafts = false): Thought | null {
  const db = getDb();
  if (includeDrafts) {
    return (db.prepare('SELECT * FROM thoughts WHERE slug = ?').get(slug) as Thought) || null;
  }
  return (db.prepare("SELECT * FROM thoughts WHERE slug = ? AND status = 'published'").get(slug) as Thought) || null;
}

export function getThoughtById(id: number): Thought | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM thoughts WHERE id = ?').get(id) as Thought) || null;
}

export function createThought(thought: Omit<Thought, 'id' | 'created_at' | 'updated_at'>): Thought {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO thoughts (title, slug, excerpt, content, cover_image, category, tags, status, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    thought.title,
    thought.slug,
    thought.excerpt,
    thought.content,
    thought.cover_image,
    thought.category,
    thought.tags,
    thought.status,
    thought.published_at || now,
    now,
    now
  );
  return getThoughtById(Number(result.lastInsertRowid))!;
}

export function updateThought(id: number, thought: Partial<Thought>): Thought | null {
  const db = getDb();
  const current = getThoughtById(id);
  if (!current) return null;

  const updated = { ...current, ...thought, updated_at: new Date().toISOString() };
  db.prepare(`
    UPDATE thoughts
    SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, category = ?, tags = ?, status = ?, published_at = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updated.title,
    updated.slug,
    updated.excerpt,
    updated.content,
    updated.cover_image,
    updated.category,
    updated.tags,
    updated.status,
    updated.published_at,
    updated.updated_at,
    id
  );
  return getThoughtById(id);
}

export function deleteThought(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM thoughts WHERE id = ?').run(id);
  return result.changes > 0;
}

// Audio Journals
export function getAudioJournals(includeDrafts = false): AudioJournal[] {
  const db = getDb();
  if (includeDrafts) {
    return db.prepare('SELECT * FROM audio_journals ORDER BY published_at DESC').all() as AudioJournal[];
  }
  return db.prepare("SELECT * FROM audio_journals WHERE status = 'published' ORDER BY published_at DESC").all() as AudioJournal[];
}

export function getAudioJournalById(id: number): AudioJournal | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM audio_journals WHERE id = ?').get(id) as AudioJournal) || null;
}

export function createAudioJournal(audio: Omit<AudioJournal, 'id' | 'created_at' | 'updated_at'>): AudioJournal {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO audio_journals (title, description, audio_url, duration, cover_image, status, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    audio.title,
    audio.description,
    audio.audio_url,
    audio.duration || '0:00',
    audio.cover_image,
    audio.status,
    audio.published_at || now,
    now,
    now
  );
  return getAudioJournalById(Number(result.lastInsertRowid))!;
}

export function updateAudioJournal(id: number, audio: Partial<AudioJournal>): AudioJournal | null {
  const db = getDb();
  const current = getAudioJournalById(id);
  if (!current) return null;

  const updated = { ...current, ...audio, updated_at: new Date().toISOString() };
  db.prepare(`
    UPDATE audio_journals
    SET title = ?, description = ?, audio_url = ?, duration = ?, cover_image = ?, status = ?, published_at = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updated.title,
    updated.description,
    updated.audio_url,
    updated.duration,
    updated.cover_image,
    updated.status,
    updated.published_at,
    updated.updated_at,
    id
  );
  return getAudioJournalById(id);
}

export function deleteAudioJournal(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM audio_journals WHERE id = ?').run(id);
  return result.changes > 0;
}

// Conversations
export function getConversations(statusFilter?: ConversationStatus): Conversation[] {
  const db = getDb();
  if (statusFilter) {
    return db.prepare('SELECT * FROM conversations WHERE status = ? ORDER BY created_at DESC').all(statusFilter) as Conversation[];
  }
  return db.prepare('SELECT * FROM conversations ORDER BY created_at DESC').all() as Conversation[];
}

export function getConversationById(id: number): Conversation | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as Conversation) || null;
}

export function createConversation(conv: Omit<Conversation, 'id' | 'created_at' | 'status' | 'notes'>): Conversation {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO conversations (name, content, preferred_format, contact_method, contact_info, additional_context, status, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'New', '', ?)
  `).run(
    conv.name,
    conv.content,
    conv.preferred_format,
    conv.contact_method,
    conv.contact_info,
    conv.additional_context || null,
    now
  );
  return getConversationById(Number(result.lastInsertRowid))!;
}

export function updateConversationStatus(id: number, status: ConversationStatus, notes?: string): Conversation | null {
  const db = getDb();
  if (notes !== undefined) {
    db.prepare('UPDATE conversations SET status = ?, notes = ? WHERE id = ?').run(status, notes, id);
  } else {
    db.prepare('UPDATE conversations SET status = ? WHERE id = ?').run(status, id);
  }
  return getConversationById(id);
}

export function deleteConversation(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
  return result.changes > 0;
}

// Media
export function getMediaList(): MediaItem[] {
  const db = getDb();
  return db.prepare('SELECT * FROM media ORDER BY created_at DESC').all() as MediaItem[];
}

export function addMediaItem(item: Omit<MediaItem, 'id' | 'created_at'>): MediaItem {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO media (filename, original_name, mime_type, size, url, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    item.filename,
    item.original_name,
    item.mime_type,
    item.size,
    item.url,
    now
  );
  return (db.prepare('SELECT * FROM media WHERE id = ?').get(result.lastInsertRowid) as MediaItem);
}

export function deleteMediaItem(id: number): boolean {
  const db = getDb();
  const item = db.prepare('SELECT * FROM media WHERE id = ?').get(id) as MediaItem | undefined;
  if (item) {
    const filePath = path.join(process.cwd(), 'public', item.url);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to unlink file:', err);
      }
    }
  }
  const result = db.prepare('DELETE FROM media WHERE id = ?').run(id);
  return result.changes > 0;
}

// Dashboard statistics
export function getDashboardStats() {
  const db = getDb();
  const publishedThoughts = db.prepare("SELECT COUNT(*) as count FROM thoughts WHERE status = 'published'").get() as { count: number };
  const totalThoughts = db.prepare("SELECT COUNT(*) as count FROM thoughts").get() as { count: number };
  const publishedAudio = db.prepare("SELECT COUNT(*) as count FROM audio_journals WHERE status = 'published'").get() as { count: number };
  const newConversations = db.prepare("SELECT COUNT(*) as count FROM conversations WHERE status = 'New'").get() as { count: number };
  const totalConversations = db.prepare("SELECT COUNT(*) as count FROM conversations").get() as { count: number };
  const recentConversations = db.prepare("SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5").all() as Conversation[];
  const recentThoughts = db.prepare("SELECT * FROM thoughts ORDER BY created_at DESC LIMIT 5").all() as Thought[];

  return {
    publishedThoughts: publishedThoughts.count,
    totalThoughts: totalThoughts.count,
    publishedAudio: publishedAudio.count,
    newConversations: newConversations.count,
    totalConversations: totalConversations.count,
    recentConversations,
    recentThoughts,
  };
}
