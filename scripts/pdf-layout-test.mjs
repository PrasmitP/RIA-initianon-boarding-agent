// Layout smoke-test for markdownToPdf: captures every text draw and verifies
// rows advance (no overlapping list items). Run: npx tsx scripts/pdf-layout-test.mjs
import { jsPDF } from 'jspdf';

const draws = [];
const makeInstrumentedDoc = () => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const orig = doc.text.bind(doc);
  doc.text = (text, x, y, ...rest) => {
    if (typeof x === 'number' && typeof y === 'number') {
      draws.push({ text: String(text), x: Math.round(x), y: Math.round(y) });
    }
    return orig(text, x, y, ...rest);
  };
  return doc;
};

const { renderMarkdownToDoc } = await import('../src/app/lib/markdownToPdf.ts');

// Probe to confirm capture works.
renderMarkdownToDoc('# Probe\n\nhello world', makeInstrumentedDoc());
console.log('probe draw count:', draws.length);
draws.length = 0;

const md = `# FINANCIAL GOALS BRIEF
Client: Ali | Age 21

## RETIREMENT PLANNING ANALYSIS

| Metric | Value |
| --- | --- |
| Years to Retirement | 44 |
| Target Annual Income | $80,000 |

**Key Insight:** A 44-year horizon provides significant compounding.

## GOAL SUMMARY & STRATEGIES

**Priority 1: First Home Purchase (3-5 years | $800,000)**
- **Strategy:** High-yield savings / money market accounts
- **Risk:** Aggressive savings rate may squeeze other goals

**Priority 2: Children's Education (10+ years | $200,000)**
- **Strategy:** 529 college savings plans
  - Tax-deferred growth
  - State tax deductions possible
- **Benefit:** Long runway

## STRATEGIC RECOMMENDATIONS

1. Establish priority sequence
2. Maximize tax efficiency
3. Review annually
`;

renderMarkdownToDoc(md, makeInstrumentedDoc());

// Group draws into visual rows by y.
const rows = [];
for (const d of draws) {
  const last = rows[rows.length - 1];
  if (last && Math.abs(last.y - d.y) <= 1) last.items.push(d.text);
  else rows.push({ y: d.y, items: [d.text] });
}

console.log('--- rows (y : text) ---');
for (const r of rows) console.log(String(r.y).padStart(4), ':', r.items.join(' '));

// Assertions
let ok = true;
for (let i = 1; i < rows.length; i++) {
  if (rows[i].y < rows[i - 1].y) {
    // allowed only on a page break (y jumps back to top ~62)
    if (rows[i].y > 80) {
      console.error(`FAIL: row ${i} y=${rows[i].y} went up from ${rows[i - 1].y} (not a page break)`);
      ok = false;
    }
  }
  if (rows[i].y === rows[i - 1].y) {
    console.error(`FAIL: rows ${i - 1} and ${i} share y=${rows[i].y} (overlap)`);
    ok = false;
  }
}

// Specifically: the two "Strategy"/"Risk" bullets under Priority 1 must be on different rows.
const strategyRow = rows.findIndex((r) => r.items.join(' ').includes('Strategy'));
const riskRow = rows.findIndex((r) => r.items.join(' ').includes('Risk'));
if (strategyRow !== -1 && riskRow !== -1 && rows[strategyRow].y === rows[riskRow].y) {
  console.error('FAIL: Strategy and Risk bullets overlap on the same row');
  ok = false;
}

console.log(ok ? '\nPASS: no overlapping rows detected' : '\nTEST FAILED');
process.exit(ok ? 0 : 1);
