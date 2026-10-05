'use client';

import React, { useState } from 'react';
import { PreferredFormat, ContactMethod } from '@/types';
import { Send, CheckCircle2, MessageSquare, PhoneCall, HelpCircle, Mail, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/utils';

interface TalkClientProps {
  whatsappNumber?: string;
  email?: string;
}

export function TalkClient({ whatsappNumber = "+91 73853 14784", email }: TalkClientProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [preferredFormat, setPreferredFormat] = useState<PreferredFormat>('Chat');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('Email');
  const [contactInfo, setContactInfo] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [botField, setBotField] = useState(''); // Honeypot spam trap

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const directWhatsAppUrl = getWhatsAppLink(whatsappNumber, 'Hello, I reached out through your website.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please share your name or what you would like to be called.');
      return;
    }
    if (!content.trim()) {
      setError("Please share what's on your mind.");
      return;
    }
    if (!contactInfo.trim()) {
      setError('Please share your contact details so I can reply.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          content,
          preferred_format: preferredFormat,
          contact_method: contactMethod,
          contact_info: contactInfo,
          additional_context: additionalContext,
          website_url_check: botField,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch {
      setError('A connection error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full py-10 sm:py-20">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="border-b border-[var(--theme-border)]/60 pb-6 sm:pb-8 mb-8 sm:mb-10 text-left">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--theme-text)]">
            Let&apos;s talk
          </h1>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base lg:text-lg text-[var(--theme-secondary)] leading-relaxed">
            If there&apos;s something you&apos;re struggling with, thinking about, or simply want to talk through, you can tell me about it here.
          </p>

          {/* Aesthetically minimal direct WhatsApp helper callout */}
          {whatsappNumber && (
            <div className="mt-5 pt-4 border-t border-[var(--theme-border)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[var(--theme-secondary)]">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-[var(--theme-accent)] shrink-0" />
                <span>Prefer to reach out directly? Message on WhatsApp:</span>
              </span>
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[var(--theme-accent)] hover:underline self-start sm:self-auto py-1"
              >
                <span>{whatsappNumber}</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {submitted ? (
          <div className="p-7 sm:p-12 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] text-center space-y-4 sm:space-y-5 animate-in fade-in duration-300">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--theme-accent)]/15 text-[var(--theme-accent)]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-[var(--theme-text)]">
              Thank you for reaching out.
            </h2>
            <p className="text-sm sm:text-base text-[var(--theme-secondary)] max-w-md mx-auto leading-relaxed">
              I have received your note and will get back to you soon through your preferred contact method ({contactMethod}).
            </p>

            {contactMethod === 'WhatsApp' && (
              <div className="pt-2">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--theme-accent)] hover:underline py-1.5 px-3 rounded border border-[var(--theme-border)] bg-[var(--theme-bg)]"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Or start chat directly on WhatsApp ({whatsappNumber})</span>
                </a>
              </div>
            )}

            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setContent('');
                  setContactInfo('');
                  setAdditionalContext('');
                }}
                className="text-xs font-medium text-[var(--theme-accent)] underline cursor-pointer py-2 min-h-[44px] inline-flex items-center"
              >
                Send another message
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
            {/* Honeypot hidden input */}
            <input
              type="text"
              name="website_url_check"
              value={botField}
              onChange={(e) => setBotField(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {error && (
              <div className="p-3.5 rounded-md border border-red-200 bg-red-50 text-xs sm:text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Field 1: Name / preferred name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-[var(--theme-text)]">
                Name / preferred name <span className="text-[var(--theme-accent)]">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What would you like me to call you?"
                className="w-full px-3.5 py-3 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] placeholder-[var(--theme-secondary)]/50 text-base focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] transition-shadow min-h-[46px]"
              />
            </div>

            {/* Field 2: What would you like to talk about? */}
            <div className="space-y-1.5">
              <label htmlFor="content" className="block text-xs sm:text-sm font-medium text-[var(--theme-text)]">
                What would you like to talk about? <span className="text-[var(--theme-accent)]">*</span>
              </label>
              <textarea
                id="content"
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell me what's on your mind..."
                className="w-full px-3.5 py-3 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] placeholder-[var(--theme-secondary)]/50 text-base focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] transition-shadow resize-y"
              />
            </div>

            {/* Field 3: Preferred format */}
            <div className="space-y-2">
              <span className="block text-xs sm:text-sm font-medium text-[var(--theme-text)]">
                Preferred format
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'Chat', label: 'Chat', icon: MessageSquare },
                    { id: 'Voice call', label: 'Voice call', icon: PhoneCall },
                    { id: 'Not sure yet', label: 'Not sure', icon: HelpCircle },
                  ] as const
                ).map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = preferredFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setPreferredFormat(fmt.id)}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-2 py-3 rounded-md border text-xs sm:text-sm font-medium transition-all cursor-pointer min-h-[46px] ${
                        isSelected
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)] text-white shadow-none'
                          : 'border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)]'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-center">{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 4: Preferred contact method */}
            <div className="space-y-2">
              <span className="block text-xs sm:text-sm font-medium text-[var(--theme-text)]">
                Preferred contact method
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'Email', label: 'Email', icon: Mail },
                    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle },
                    { id: 'Phone', label: 'Phone', icon: Phone },
                  ] as const
                ).map((method) => {
                  const Icon = method.icon;
                  const isSelected = contactMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setContactMethod(method.id)}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-2 py-3 rounded-md border text-xs sm:text-sm font-medium transition-all cursor-pointer min-h-[46px] ${
                        isSelected
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)] text-white shadow-none'
                          : 'border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)]'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-center">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 5: Contact information */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="contact_info" className="block text-xs sm:text-sm font-medium text-[var(--theme-text)]">
                  Contact information <span className="text-[var(--theme-accent)]">*</span>
                </label>
                {contactMethod === 'WhatsApp' && whatsappNumber && (
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[var(--theme-accent)] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Or chat now with {whatsappNumber}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </div>
              <input
                id="contact_info"
                type="text"
                required
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder={
                  contactMethod === 'Email'
                    ? 'your.email@example.com'
                    : contactMethod === 'WhatsApp'
                    ? 'Your WhatsApp number with country code'
                    : 'Your phone number'
                }
                className="w-full px-3.5 py-3 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] placeholder-[var(--theme-secondary)]/50 text-base focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] transition-shadow min-h-[46px]"
              />
            </div>

            {/* Field 6: Optional additional context */}
            <div className="space-y-1.5">
              <label htmlFor="additional_context" className="block text-xs sm:text-sm font-medium text-[var(--theme-text)]">
                Optional additional context
              </label>
              <textarea
                id="additional_context"
                rows={3}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Anything else you'd like me to know?"
                className="w-full px-3.5 py-2.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] placeholder-[var(--theme-secondary)]/50 text-base focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] transition-shadow resize-y"
              />
            </div>

            {/* Gentle comforting helper text */}
            <p className="font-serif text-xs sm:text-sm italic text-[var(--theme-secondary)] leading-relaxed">
              &ldquo;You don&apos;t need to have the right words. Just start wherever feels natural.&rdquo;
            </p>

            {/* Submit button - full width on mobile */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:py-3 text-sm font-medium bg-[var(--theme-accent)] text-white rounded-md hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-none min-h-[48px]"
              >
                <Send className="mr-2 h-4 w-4" />
                <span>{submitting ? 'Sending...' : 'Send message'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
