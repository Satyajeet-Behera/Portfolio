const fs = require('fs');
const d = JSON.parse(fs.readFileSync('scratch/phase3-lh-desktop.json', 'utf8'));
for (const a of d.categories.seo.auditRefs) {
  const audit = d.audits[a.id];
  if (audit && audit.score !== 1) {
    console.log(`${a.id}: score=${audit.score}, title=${audit.title}`);
  }
}
