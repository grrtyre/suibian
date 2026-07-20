// headless harness for the injected regex module
global.QUOTES = [];
global.BADGES = [];
global.bumpUsage = () => {};
global.playDing = () => {};
global.toast = (m) => { console.log("TOAST:", m); };
function fakeEl() {
  return {
    value: "", innerHTML: "", textContent: "",
    dataset: {}, classList: { toggle(){}, contains(){ return false; }, add(){}, remove(){} },
    addEventListener(){}, querySelectorAll(){ return []; }
  };
}
const els = {};
function $(id){ if(!els[id]) els[id] = fakeEl(); return els[id]; }
global.$ = $;
global.document = { getElementById: $, querySelectorAll: () => [], querySelector: () => fakeEl() };

const fs = require("fs");
let rxMod = fs.readFileSync("rx_module.js", "utf8");

const testcode = `
// ---- exercise ----
$("rxPat").value = "(\\\\w+)@(\\\\w+\\\\.\\\\w+)";
$("rxText").value = "alice@example.com 与 bob@test.org；备用 admin@suibian.io。";
rxTest(false);
console.log("RESULT_HTML_LEN:", $("rxResult").innerHTML.length);
console.log("MATCHES_HTML_LEN:", $("rxMatches").innerHTML.length);
console.log("COUNT:", $("rxCount").textContent);
console.log("HAS_MARK:", $("rxResult").innerHTML.indexOf("<mark>") >= 0);
console.log("GROUPS_SHOWN:", $("rxMatches").innerHTML.indexOf("$1:") >= 0);
$("rxRepl").value = "$1 AT $2";
rxReplace();
console.log("REPLACE_OUT:", JSON.stringify($("rxReplaceOut").value));
// invalid regex
$("rxPat").value = "([";
rxTest(false);
console.log("ERR_HTML:", $("rxResult").innerHTML.slice(0, 30));
// empty pattern
$("rxPat").value = "";
$("rxText").value = "hello";
rxTest(false);
console.log("EMPTY_PAT_HTML_LEN:", $("rxResult").innerHTML.length);
// flags
console.log("FLAGS_DEFAULT:", JSON.stringify(rxReadFlags()));
// zero-length match safety (anchor)
$("rxPat").value = "^";
$("rxText").value = "abc";
rxTest(false);
console.log("ZEROWIDTH_COUNT:", $("rxCount").textContent);
console.log("QUOTES_PUSHED:", QUOTES.length, "BADGES_PUSHED:", BADGES.length);
console.log("ALL_RX_TESTS_DONE");
`;
eval(rxMod + testcode);
