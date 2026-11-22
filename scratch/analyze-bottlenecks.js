const fs = require('fs');
const path = require('path');

const desktop = JSON.parse(fs.readFileSync('scratch/phase5-baseline-desktop.json', 'utf8'));
const mobile = JSON.parse(fs.readFileSync('scratch/phase5-baseline-mobile.json', 'utf8'));

function analyze(report, name) {
  console.log(`\n=== BOTTLENECK ANALYSIS: ${name.toUpperCase()} ===`);
  const audits = report.audits;

  // 1. Long tasks / main thread work
  const bootup = audits['bootup-time'];
  if (bootup && bootup.details && bootup.details.items) {
    console.log('\nTop CPU Execution / Bootup Times:');
    bootup.details.items.slice(0, 5).forEach((item) => {
      console.log(`  - ${item.url || 'eval'}: Total ${Math.round(item.total)}ms, Script ${Math.round(item.scripting)}ms`);
    });
  }

  const mainthread = audits['mainthread-work-breakdown'];
  if (mainthread && mainthread.details && mainthread.details.items) {
    console.log('\nMain Thread Work Breakdown:');
    mainthread.details.items.slice(0, 5).forEach((item) => {
      console.log(`  - ${item.groupLabel}: ${Math.round(item.duration)}ms`);
    });
  }

  // 2. Accessibility deductions (to get 95 -> 100)
  console.log('\nAccessibility Issues:');
  Object.keys(audits).forEach((key) => {
    const a = audits[key];
    if (report.categories.accessibility.auditRefs.some((ref) => ref.id === key) && a.score !== 1 && a.score !== null) {
      console.log(`  - [${key}] ${a.title}: ${a.explanation || a.displayValue || ''}`);
      if (a.details && a.details.items) {
        a.details.items.slice(0, 3).forEach((item) => {
          console.log(`      Node: ${item.node ? item.node.snippet : JSON.stringify(item)}`);
        });
      }
    }
  });

  // 3. Render blocking resources
  const rb = audits['render-blocking-resources'];
  if (rb && rb.details && rb.details.items) {
    console.log('\nRender Blocking Resources:');
    rb.details.items.forEach((item) => console.log(`  - ${item.url} (${item.wastedMs}ms)`));
  }
}

analyze(desktop, 'desktop');
analyze(mobile, 'mobile');
