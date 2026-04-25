const fs = require('fs');
let c = fs.readFileSync('src/components/idc/FieldPool.vue', 'utf8');
const old = ':class="`fp-zone-dot--${getFieldZone(field)}`"';
const rep = ':class="\'fp-zone-dot--\' + getFieldZone(field)"';
if (c.includes(old)) {
  c = c.replace(old, rep);
  fs.writeFileSync('src/components/idc/FieldPool.vue', c);
  console.log('replaced');
} else {
  console.log('not found');
  const lines = c.split('\n');
  lines.forEach((l, i) => { if (l.includes('fp-zone-dot--')) console.log(i+1, l); });
}
