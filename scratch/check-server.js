const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Has intelligence:', data.includes('intelligence'));
    console.log('Has magix:', data.includes('magix'));
  });
}).on('error', (e) => console.error('Connection error:', e.message));
