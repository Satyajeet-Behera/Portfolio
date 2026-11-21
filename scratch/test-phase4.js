const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

function post(url, payload) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString),
        },
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(responseData) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: responseData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('--- Phase 04 Endpoint Verification ---');

  // 1. Homepage
  const home = await get('http://localhost:3000/');
  console.log('Homepage status:', home.statusCode);
  const homeChecks = [
    'My Projects',
    "Let's Talk About Some Great Ideas",
    'My Long-Term Goal',
    "Let's Connect",
    'Voxel Craft',
    'TaskMate AI',
    'Rolls-Royce Experience',
    'Rolex Deepsea Experience',
    'AEROJEET Drone',
    'Vibe',
    'Magix',
    '8074783962',
    '_raja__577',
    'iq218satya@gmail.com',
  ];
  for (const check of homeChecks) {
    const found = home.body.includes(check);
    console.log(`Homepage contains "${check}": ${found ? '✓ YES' : '✗ NO'}`);
  }

  // 2. Blog Index
  const blog = await get('http://localhost:3000/blog');
  console.log('\nBlog Index status:', blog.statusCode);
  const blogChecks = [
    'Engineering Log & Insights',
    'Engineering Magix: Building an Autonomous Personal AI Assistant from Scratch',
    'The Discipline of Sub-20',
    'Building Voxel Craft',
  ];
  for (const check of blogChecks) {
    const found = blog.body.includes(check);
    console.log(`Blog index contains "${check}": ${found ? '✓ YES' : '✗ NO'}`);
  }

  // 3. Blog Single Post
  const singlePost = await get('http://localhost:3000/blog/building-magix-autonomous-ai-assistant');
  console.log('\nBlog Post status:', singlePost.statusCode);
  const singleChecks = [
    'Engineering Magix',
    'The Core Architectural Pillars',
    'Perception Engine',
    'Cognitive Orchestrator',
    'AudioStreamBridge',
    'BlogPosting',
  ];
  for (const check of singleChecks) {
    const found = singlePost.body.includes(check);
    console.log(`Single post contains "${check}": ${found ? '✓ YES' : '✗ NO'}`);
  }

  // 4. RSS Feed
  const feed = await get('http://localhost:3000/feed.xml');
  console.log('\nRSS Feed status:', feed.statusCode);
  console.log('RSS Feed Content-Type:', feed.headers['content-type']);
  console.log('RSS contains <rss version="2.0">:', feed.body.includes('<rss version="2.0"'));
  console.log('RSS contains posts:', feed.body.includes('<item>'));

  // 5. Sitemap
  const sitemap = await get('http://localhost:3000/sitemap.xml');
  console.log('\nSitemap status:', sitemap.statusCode);
  console.log('Sitemap contains /blog:', sitemap.body.includes('/blog'));
  console.log('Sitemap contains /blog/building-magix-autonomous-ai-assistant:', sitemap.body.includes('building-magix-autonomous-ai-assistant'));

  // 6. Contact Form API Validation
  console.log('\n--- Contact Form API Tests ---');
  // Validation failure test
  const invalidRes = await post('http://localhost:3000/api/contact', {
    name: 'A',
    phone: '123',
    email: 'not-an-email',
    message: 'short',
  });
  console.log('Invalid payload status:', invalidRes.statusCode);
  console.log('Invalid payload error response:', invalidRes.body);

  // Honeypot test
  const botRes = await post('http://localhost:3000/api/contact', {
    name: 'Spam Bot',
    phone: '+1234567890',
    email: 'bot@spam.com',
    message: 'Buy cheap crypto now fast quick',
    botCheck: 'i am a bot',
  });
  console.log('Honeypot trap status:', botRes.statusCode);
  console.log('Honeypot trap response:', botRes.body);

  // Valid payload test (note: RESEND_API_KEY is not set in development, so expect graceful status 503 or 200 with delivery info)
  const validRes = await post('http://localhost:3000/api/contact', {
    name: 'Satyajeet Collaborator',
    phone: '+91 80747 83962',
    email: 'collab@example.com',
    message: 'Hello Satyajeet, this is a test message regarding an AI agent collaboration project.',
    botCheck: '',
  });
  console.log('Valid submission status:', validRes.statusCode);
  console.log('Valid submission response:', validRes.body);

  console.log('\nAll automated tests completed.');
}

runTests().catch(console.error);
