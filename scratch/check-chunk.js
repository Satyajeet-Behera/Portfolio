const fs = require('fs');
const files = fs.readdirSync('.next/static/chunks');
const f = files.find(x => x.startsWith('839-'));
if (f) {
  const content = fs.readFileSync('.next/static/chunks/' + f, 'utf8');
  console.log('File:', f, 'Length:', content.length);
  const regex = /node_modules\/([^/]+)/g;
  const set = new Set();
  let m;
  while ((m = regex.exec(content)) !== null) {
    set.add(m[1]);
  }
  console.log('Modules in chunk:', Array.from(set));
}
