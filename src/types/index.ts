export interface Thought {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: string;
  tags: string;
  status: 'published' | 'draft';
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface AudioJournal {
  id: number;
  title: string;
  description: string;
  audio_url: string;
  duration: string;
  cover_image: string | null;
  status: 'published' | 'draft';
  published_at: string;
  created_at: string;
  updated_at: string;
}

export type ConversationStatus = 'New' | 'Contacted' | 'Completed' | 'Archived';
export type PreferredFormat = 'Chat' | 'Voice call' | 'Not sure yet';
export type ContactMethod = 'WhatsApp' | 'Email' | 'Phone';

export interface Conversation {
  id: number;
  name: string;
  content: string;
  preferred_format: PreferredFormat;
  contact_method: ContactMethod;
  contact_info: string;
  additional_context: string | null;
  status: ConversationStatus;
  notes: string | null;
  created_at: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  created_at: string;
}

export interface SiteSettings {
  website_name: string;
  owner_name: string;
  short_bio: string;
  profile_image: string;
  logo: string;
  email: string;
  whatsapp: string;
  phone: string;
  social_x: string;
  social_instagram: string;
  social_substack: string;
  footer_text: string;
  seo_title: string;
  seo_description: string;
  favicon: string;

  // Homepage content
  hero_heading: string;
  hero_description: string;
  hero_primary_cta_text: string;
  hero_primary_cta_link: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_link: string;
  hero_image: string;
  hero_show_image: string; // 'true' | 'false'

  intro_heading: string;
  intro_text: string;

  section_thoughts_title: string;
  section_thoughts_desc: string;

  section_audio_title: string;
  section_audio_desc: string;

  section_talk_title: string;
  section_talk_desc: string;

  // Visibility toggles
  show_hero: string; // 'true' | 'false'
  show_intro: string; // 'true' | 'false'
  show_thoughts: string; // 'true' | 'false'
  show_audio: string; // 'true' | 'false'
  show_talk: string; // 'true' | 'false'
}

export type ThemePreset = 'warm-editorial' | 'minimal-light' | 'dark-journal' | 'soft-neutral';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SectionSpacing = 'compact' | 'normal' | 'spacious';
export type ButtonStyle = 'simple' | 'slightly-rounded' | 'rounded';
export type BorderStyle = 'minimal' | 'subtle';

export interface AppearanceSettings {
  preset: ThemePreset;
  mode: ThemeMode;
  accent_color: string;
  bg_color: string;
  text_color: string;
  bg_image: string;
  bg_position: string;
  bg_size: string;
  bg_overlay: string; // opacity 0 - 80%
  font_heading: string;
  font_body: string;
  spacing: SectionSpacing;
  button_style: ButtonStyle;
  border_style: BorderStyle;
}
