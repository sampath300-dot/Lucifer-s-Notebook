import type { Metadata } from 'next';
import './globals.css';
import { getSiteSettings, getAppearanceSettings } from '@/lib/db';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  return {
    title: settings.seo_title || `${settings.website_name} — Thoughts & Conversations`,
    description: settings.seo_description || settings.short_bio,
    icons: {
      icon: settings.favicon || '/favicon.ico',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = getSiteSettings();
  const appearanceSettings = getAppearanceSettings();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans">
        <ThemeWrapper initialAppearance={appearanceSettings}>
          <Navbar websiteName={siteSettings.website_name} logoUrl={siteSettings.logo} />
          <main className="flex-1 w-full flex flex-col">
            {children}
          </main>
          <Footer
            websiteName={siteSettings.website_name}
            ownerName={siteSettings.owner_name}
            footerText={siteSettings.footer_text}
            socialX={siteSettings.social_x}
            socialInstagram={siteSettings.social_instagram}
            socialSubstack={siteSettings.social_substack}
          />
        </ThemeWrapper>
      </body>
    </html>
  );
}
