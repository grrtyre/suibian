const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html', 'utf8');

// 1) JS syntax check (main inline script)
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let syntaxOk = true;
scripts.forEach((code, i) => {
  try { new vm.Script(code); console.log('SCRIPT', i, 'OK (' + code.length + ' chars)'); }
  catch (e) { syntaxOk = false; console.log('SCRIPT', i, 'SYNTAX ERROR:', e.message); }
});

// 2) collect defined ids
const definedIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));

// 3) collect referenced ids via $("x") and getElementById("x")
const refs = new Set();
for (const m of html.matchAll(/\$\(\s*"([^"]+)"\s*\)/g)) refs.add(m[1]);
for (const m of html.matchAll(/getElementById\(\s*"([^"]+)"\s*\)/g)) refs.add(m[1]);

const missing = [...refs].filter(id => !definedIds.has(id));
console.log('defined ids:', definedIds.size, '| referenced ids:', refs.size, '| MISSING:', missing.length);
if (missing.length) console.log('  missing ->', missing.join(', '));

// 4) nav buttons vs panels
const navBtns = [...html.matchAll(/<button data-tab="([^"]+)"/g)].map(m => m[1]);
const panels = [...html.matchAll(/<section class="panel" id="([^"]+)"/g)].map(m => m[1]);
console.log('nav buttons:', navBtns.length, '| panels:', panels.length);
const navSet = new Set(navBtns), panelSet = new Set(panels);
const navNoPanel = navBtns.filter(t => !panelSet.has(t));
const panelNoNav = panels.filter(t => !navSet.has(t));
console.log('nav without panel:', navNoPanel, '| panel without nav:', panelNoNav);

// 5) TAB_KW keys vs nav data-tab
const kwBlock = html.match(/const TAB_KW\s*=\s*\{([\s\S]*?)\n  \};/);
let kwKeys = [];
if (kwBlock) kwKeys = [...kwBlock[1].matchAll(/(\w+)\s*:/g)].map(m => m[1]);
const kwSet = new Set(kwKeys);
const navNoKw = navBtns.filter(t => !kwSet.has(t));
console.log('TAB_KW keys:', kwKeys.length, '| nav without keyword:', navNoKw);

// 6) doctype / closing tags
console.log('has DOCTYPE:', /^<!DOCTYPE html>/i.test(html.trim()) || /<!doctype html>/i.test(html));
console.log('has </html>:', /<\/html>\s*$/.test(html.trim()) || html.includes('</html>'));
console.log('cp panel present:', html.includes('id="cp"'));
console.log('cp handler present:', html.includes('function drawCp'));

console.log(syntaxOk && missing.length === 0 && navNoPanel.length === 0 && panelNoNav.length === 0 && navNoKw.length === 0 ? '\n=== ALL CHECKS PASSED ===' : '\n=== CHECKS FAILED ===');
