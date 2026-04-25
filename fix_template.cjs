const fs = require('fs');
let c = fs.readFileSync('src/components/idc/FieldPool.vue', 'utf8');
// The file uses a smart quote ' (U+2019) instead of backtick ` for the template literal closing
const old = ':class="`fp-zone-dot--${getFieldZone(field)}\'"';
const rep = ':class="\'fp-zone-dot--\' + getFieldZone(field)"';
if (c.includes(old)) {
  c = c.replace(old, rep);
  fs.writeFileSync('src/components/idc/FieldPool.vue', c);
  console.log('replaced');
} else {
  console.log('not found');
  // Find the exact bytes
  const idx = c.indexOf('fp-zone-dot--');
  if (idx >= 0) {
    const chunk = c.substring(idx - 10, idx + 60);
    console.log('chunk:', JSON.stringify(chunk));
  }
}
