import assert from 'assert';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- STARTING COMPLETE WORKFLOW VERIFICATION ---');

  // 1. Open homepage
  console.log('1. Testing Homepage GET / ...');
  let res = await fetch(`${BASE_URL}/`);
  assert.strictEqual(res.status, 200, 'Homepage should return 200 OK');
  let html = await res.text();
  assert(html.includes('Some thoughts are easier to understand'), 'Hero heading found on homepage');
  assert(html.includes('Audio Journal'), 'Audio journal section found on homepage');
  assert(html.includes("Let's talk"), "Let's talk CTA found on homepage");
  assert(html.includes("wa.me/917385314784"), 'WhatsApp link found in footer');
  console.log('✓ Homepage loaded successfully');

  // 2. Navigate to Thoughts
  console.log('2. Testing Thoughts archive GET /thoughts ...');
  res = await fetch(`${BASE_URL}/thoughts`);
  assert.strictEqual(res.status, 200, 'Thoughts page should return 200 OK');
  html = await res.text();
  assert(html.includes('Thoughts'), 'Thoughts title found');
  assert(html.includes('The Quiet Between Our Thoughts'), 'Seeded thought title found');
  console.log('✓ Thoughts archive loaded successfully');

  // 3. Open a thought
  console.log('3. Testing Individual Thought GET /thoughts/the-quiet-between-our-thoughts ...');
  res = await fetch(`${BASE_URL}/thoughts/the-quiet-between-our-thoughts`);
  assert.strictEqual(res.status, 200, 'Individual thought should return 200 OK');
  html = await res.text();
  assert(html.includes('The Urge to Fill the Space'), 'Article content found');
  assert(html.includes('Did this bring something to mind?'), 'Article reflection CTA found');
  console.log('✓ Individual thought page loaded successfully');

  // 4. Navigate to Audio Journal
  console.log('4. Testing Audio Journal GET /audio ...');
  res = await fetch(`${BASE_URL}/audio`);
  assert.strictEqual(res.status, 200, 'Audio journal page should return 200 OK');
  html = await res.text();
  assert(html.includes('Late Evening Musings on Stillness'), 'Audio entry title found');
  console.log('✓ Audio journal page loaded successfully');

  // 5. Play an audio file (verify audio file accessible and valid WAV format)
  console.log('5. Testing Audio file GET /uploads/sample-audio-journal-1.wav ...');
  res = await fetch(`${BASE_URL}/uploads/sample-audio-journal-1.wav`);
  assert.strictEqual(res.status, 200, 'Audio asset should return 200 OK');
  const audioBuf = await res.arrayBuffer();
  assert(audioBuf.byteLength > 1000, 'Audio file has audio data');
  console.log(`✓ Audio file served properly (${audioBuf.byteLength} bytes)`);

  // 6. Navigate to Let's Talk
  console.log("6. Testing Let's Talk GET /talk ...");
  res = await fetch(`${BASE_URL}/talk`);
  assert.strictEqual(res.status, 200, "Let's talk page should return 200 OK");
  html = await res.text();
  assert(html.includes("What would you like me to call you?"), 'Form fields rendered');
  assert(html.includes("+91 73853 14784"), 'Configured WhatsApp number rendered on /talk');
  assert(html.includes("wa.me/917385314784"), 'Configured wa.me deep link rendered on /talk');
  console.log("✓ Let's talk page loaded successfully with WhatsApp integration");

  // 7 & 8. Test form submission validation and success
  console.log('7. Testing Form validation (empty required fields)...');
  res = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', content: '', contact_info: '' }),
  });
  assert.strictEqual(res.status, 400, 'Empty submission should fail validation with 400');
  let data = await res.json();
  assert(data.error, 'Validation error returned');
  console.log('✓ Validation correctly rejected empty fields:', data.error);

  console.log('8. Testing Valid Form submission...');
  res = await fetch(`${BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Maya Lin',
      content: 'I have been wondering how to approach a conversation with an estranged family member.',
      preferred_format: 'Chat',
      contact_method: 'WhatsApp',
      contact_info: '+1 (555) 234-5678',
      additional_context: 'Best reached in the afternoons.',
    }),
  });
  assert.strictEqual(res.status, 201, 'Valid submission returns 201 Created');
  data = await res.json();
  assert.strictEqual(data.message, "Thank you for reaching out. I'll get back to you soon.", 'Confirmation message verified');
  const createdConvId = data.id;
  console.log('✓ Submission confirmed and saved with ID:', createdConvId);

  // 9. Verify Security: Unauthenticated access to admin endpoints
  console.log('9. Testing Security: Unauthenticated access blocked...');
  res = await fetch(`${BASE_URL}/api/stats`);
  assert.strictEqual(res.status, 401, 'Unauthenticated stats request blocked with 401');
  res = await fetch(`${BASE_URL}/api/thoughts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked', content: 'Malicious' }),
  });
  assert.strictEqual(res.status, 401, 'Unauthenticated post creation blocked with 401');
  console.log('✓ Protected endpoints reject unauthenticated access');

  // 10. Admin Login
  console.log('10. Testing Admin login POST /api/auth/login ...');
  res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  assert.strictEqual(res.status, 200, 'Login succeeded');
  const setCookie = res.headers.get('set-cookie');
  assert(setCookie && setCookie.includes('lucifer_session='), 'Session cookie returned');
  const cookieHeader = setCookie.split(';')[0];
  console.log('✓ Admin authenticated successfully, session cookie acquired');

  // 11. Dashboard Stats
  console.log('11. Testing Dashboard Stats GET /api/stats ...');
  res = await fetch(`${BASE_URL}/api/stats`, {
    headers: { Cookie: cookieHeader },
  });
  assert.strictEqual(res.status, 200, 'Stats returned');
  data = await res.json();
  assert(data.publishedThoughts >= 3, 'Stats show published thoughts');
  assert(data.newConversations >= 2, 'Stats show new conversations count');
  console.log('✓ Dashboard stats verified:', data.publishedThoughts, 'thoughts,', data.newConversations, 'conversations');

  // 12. Create Thought
  console.log('12. Testing Create Thought POST /api/thoughts ...');
  res = await fetch(`${BASE_URL}/api/thoughts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      title: 'The Architecture of Gentle Days',
      slug: `the-architecture-of-gentle-days-${Date.now()}`,
      excerpt: 'How we protect the hours that allow us to reflect.',
      content: '<h2>Slow Mornings</h2><p>When you start without rushing, the whole day carries a different quality.</p>',
      category: 'Solitude',
      tags: 'Peace, Routine, Reflection',
      status: 'published',
    }),
  });
  assert.strictEqual(res.status, 201, 'Thought created with 201');
  const newThought = await res.json();
  assert.strictEqual(newThought.title, 'The Architecture of Gentle Days');
  console.log('✓ Created thought with ID:', newThought.id);

  // 13. Edit Thought & Unpublish
  console.log('13. Testing Edit Thought PUT /api/thoughts/[id] ...');
  res = await fetch(`${BASE_URL}/api/thoughts/${newThought.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      excerpt: 'Updated excerpt on preserving quiet hours.',
      status: 'draft',
    }),
  });
  assert.strictEqual(res.status, 200, 'Thought updated');
  data = await res.json();
  assert.strictEqual(data.status, 'draft', 'Thought status changed to draft');
  console.log('✓ Successfully toggled thought status to draft');

  // 14. Upload Media File
  console.log('14. Testing Media upload POST /api/media/upload ...');
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileContent = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="#A35C4A"/></svg>';
  const multipartBody = 
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="test-upload-art.svg"\r\n` +
    `Content-Type: image/svg+xml\r\n\r\n` +
    `${fileContent}\r\n` +
    `--${boundary}--\r\n`;

  res = await fetch(`${BASE_URL}/api/media/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: cookieHeader,
    },
    body: multipartBody,
  });
  assert.strictEqual(res.status, 201, 'Media upload returns 201');
  const uploadedMedia = await res.json();
  assert(uploadedMedia.url.startsWith('/uploads/'), 'Uploaded media has public URL');
  console.log('✓ Uploaded media item:', uploadedMedia.url);

  // 15. Upload Audio Journal
  console.log('15. Testing Upload Audio Journal POST /api/audio ...');
  res = await fetch(`${BASE_URL}/api/audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      title: 'A Walk in the Woods',
      description: 'Listening to rain on oak leaves.',
      audio_url: '/uploads/sample-audio-journal-1.wav',
      duration: '0:12',
      status: 'published',
    }),
  });
  assert.strictEqual(res.status, 201, 'Audio journal created');
  const newAudio = await res.json();
  console.log('✓ Created audio journal entry with ID:', newAudio.id);

  // 16. Edit Audio Journal
  console.log('16. Testing Edit Audio Journal PUT /api/audio/[id] ...');
  res = await fetch(`${BASE_URL}/api/audio/${newAudio.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      description: 'Updated description: Listening to late afternoon rain.',
    }),
  });
  assert.strictEqual(res.status, 200, 'Audio journal updated');
  data = await res.json();
  assert.strictEqual(data.description, 'Updated description: Listening to late afternoon rain.');
  console.log('✓ Audio journal edited successfully');

  // 17. View Conversation & Change Status
  console.log('17. Testing Update Conversation status PATCH /api/conversations/[id] ...');
  res = await fetch(`${BASE_URL}/api/conversations/${createdConvId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      status: 'Contacted',
      notes: 'Sent WhatsApp intro message on Oct 5.',
    }),
  });
  assert.strictEqual(res.status, 200, 'Conversation status updated');
  data = await res.json();
  assert.strictEqual(data.status, 'Contacted');
  assert.strictEqual(data.notes, 'Sent WhatsApp intro message on Oct 5.');
  console.log('✓ Conversation status and private notes updated');

  // 18. CSV Export
  console.log('18. Testing Conversations CSV Export GET /api/conversations/export ...');
  res = await fetch(`${BASE_URL}/api/conversations/export`, {
    headers: { Cookie: cookieHeader },
  });
  assert.strictEqual(res.status, 200, 'CSV export returns 200');
  const csvText = await res.text();
  assert(csvText.includes('Maya Lin'), 'CSV contains submitted name');
  assert(csvText.includes('WhatsApp'), 'CSV contains contact method');
  console.log('✓ CSV export generated successfully');

  // 19. Change Homepage Content & Settings
  console.log('19. Testing Change Homepage Settings PUT /api/settings ...');
  res = await fetch(`${BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      hero_heading: 'A sanctuary for honest words and quiet thinking.',
      website_name: "Lucifer's Notebook",
    }),
  });
  assert.strictEqual(res.status, 200, 'Settings updated');
  data = await res.json();
  assert.strictEqual(data.hero_heading, 'A sanctuary for honest words and quiet thinking.');
  console.log('✓ Homepage hero heading and website name updated');

  // 20. Change Appearance Settings & Preset
  console.log('20. Testing Change Appearance PUT /api/appearance ...');
  res = await fetch(`${BASE_URL}/api/appearance`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      preset: 'soft-neutral',
      accent_color: '#526650',
      button_style: 'rounded',
      spacing: 'spacious',
    }),
  });
  assert.strictEqual(res.status, 200, 'Appearance updated');
  data = await res.json();
  assert.strictEqual(data.preset, 'soft-neutral');
  assert.strictEqual(data.accent_color, '#526650');
  console.log('✓ Appearance preset changed to soft-neutral with sage accent');

  // 21. Verify Persistence on Public Site
  console.log('21. Verifying that changes persist when public homepage is re-fetched...');
  res = await fetch(`${BASE_URL}/`);
  html = await res.text();
  assert(html.includes('A sanctuary for honest words and quiet thinking.'), 'Updated hero heading rendered on homepage');
  assert(html.includes("Lucifer's Notebook"), 'Updated website name rendered in header');
  assert(html.includes('#526650'), 'Updated theme accent color rendered in style');
  console.log('✓ Verified: All changes persist and render properly on the live website!');

  console.log('==================================================');
  console.log('ALL 21 VERIFICATION TESTS PASSED WITH 100% SUCCESS');
  console.log('==================================================');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
