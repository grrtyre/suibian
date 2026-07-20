/* ===== 正则测试器 regex ===== */
  const RX_PRESETS = [
    { name: "邮箱", pat: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", flags: "g" },
    { name: "手机号", pat: "1[3-9]\\d{9}", flags: "g" },
    { name: "URL", pat: "https?://[\\w.-]+(?:/[\\w./?=&#%+-]*)?", flags: "gi" },
    { name: "身份证", pat: "\\d{17}[\\dXx]", flags: "g" },
    { name: "中文", pat: "[\\u4e00-\\u9fa5]+", flags: "g" },
    { name: "整数", pat: "-?\\d+", flags: "g" },
    { name: "日期", pat: "\\d{4}-\\d{2}-\\d{2}", flags: "g" },
    { name: "十六进制色", pat: "#[0-9a-fA-F]{3,8}", flags: "gi" }
  ];
  function rxEsc(x) { return (x == null ? "" : String(x)).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[m]; }); }
  function rxReadFlags() { var f = ""; document.querySelectorAll("#rxFlags .rx-flag.on").forEach(function (b) { f += b.dataset.f; }); return f; }
  function rxHighlight(text, re) {
    var flags = re.flags.indexOf("g") >= 0 ? re.flags : re.flags + "g";
    var gre = new RegExp(re.source, flags), out = "", last = 0, m, guard = 0;
    while ((m = gre.exec(text)) !== null) {
      out += rxEsc(text.slice(last, m.index));
      if (m[0].length) out += "<mark>" + rxEsc(m[0]) + "</mark>";
      else out += '<mark class="z">∅</mark>';
      last = m.index + m[0].length;
      if (m.index === gre.lastIndex) gre.lastIndex++;
      if (++guard > 200000) break;
    }
    out += rxEsc(text.slice(last));
    return out;
  }
  function rxCollect(text, re) {
    var flags = re.flags.indexOf("g") >= 0 ? re.flags : re.flags + "g";
    var gre = new RegExp(re.source, flags), arr = [], m, guard = 0;
    while ((m = gre.exec(text)) !== null) {
      arr.push({ index: m.index, len: m[0].length, val: m[0], groups: m.slice(1) });
      if (m.index === gre.lastIndex) gre.lastIndex++;
      if (++guard > 200000) break;
    }
    return arr;
  }
  function rxTest(count) {
    var pat = $("rxPat").value, flags = rxReadFlags(), text = $("rxText").value, res = $("rxResult"), box = $("rxMatches");
    if (!pat) { res.innerHTML = rxEsc(text) || '<span class="rx-empty">输入正则即可开始测试…</span>'; box.innerHTML = ""; $("rxCount").textContent = "0"; return; }
    var re;
    try { re = new RegExp(pat, flags); } catch (e) { res.innerHTML = '<span class="rx-err">⚠️ 正则语法错误：' + rxEsc(e.message) + "</span>"; box.innerHTML = ""; $("rxCount").textContent = "0"; return; }
    res.innerHTML = rxHighlight(text, re) || '<span class="rx-empty">（文本为空，没有可匹配的内容）</span>';
    var ms = rxCollect(text, re), html = "";
    for (var i = 0; i < Math.min(ms.length, 300); i++) {
      var mm = ms[i], g = "";
      if (mm.groups.length) { for (var j = 0; j < mm.groups.length; j++) { var gv = mm.groups[j]; g += '<span class="rx-g">$' + (j + 1) + ": " + (gv === undefined ? "(未捕获)" : rxEsc(gv || "")) + "</span>"; } }
      html += '<div class="rx-mitem"><b>#' + (i + 1) + '</b> <span class="rx-pos">@' + mm.index + (mm.len ? ("–" + (mm.index + mm.len)) : "") + '</span> <code>' + (mm.len ? rxEsc(mm.val) : "∅") + "</code>" + g + "</div>";
    }
    if (ms.length > 300) html += '<div class="rx-mitem rx-empty">…还有 ' + (ms.length - 300) + " 处匹配</div>";
    box.innerHTML = html || '<div class="rx-empty">没有任何匹配 🤔</div>';
    $("rxCount").textContent = String(ms.length);
    if (count) { bumpUsage("regex"); playDing(); }
  }
  function rxReplace() {
    var pat = $("rxPat").value, flags = rxReadFlags(), text = $("rxText").value, repl = $("rxRepl").value;
    if (!pat) { toast("先写个正则再替换～"); return; }
    var re;
    try { re = new RegExp(pat, flags.indexOf("g") >= 0 ? flags : flags + "g"); } catch (e) { toast("正则语法错误：" + e.message); return; }
    $("rxReplaceOut").value = text.replace(re, repl);
  }
  function rxBind() {
    var presets = $("rxPresets");
    presets.innerHTML = RX_PRESETS.map(function (p, i) { return '<button class="chip" data-i="' + i + '" type="button">' + p.name + "</button>"; }).join("");
    presets.querySelectorAll(".chip").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = RX_PRESETS[+b.dataset.i];
        $("rxPat").value = p.pat;
        document.querySelectorAll("#rxFlags .rx-flag").forEach(function (x) { x.classList.toggle("on", p.flags.indexOf(x.dataset.f) >= 0); });
        rxTest(false);
      });
    });
    document.querySelectorAll("#rxFlags .rx-flag").forEach(function (b) { b.addEventListener("click", function () { b.classList.toggle("on"); rxTest(false); }); });
    var run = $("rxRun"); if (run) run.addEventListener("click", function () { rxTest(true); });
    var clr = $("rxClear"); if (clr) clr.addEventListener("click", function () { $("rxPat").value = ""; $("rxText").value = ""; $("rxRepl").value = ""; $("rxReplaceOut").value = ""; rxTest(false); toast("已清空"); });
    var rep = $("rxReplace"); if (rep) rep.addEventListener("click", rxReplace);
    var cpy = $("rxCopyRep"); if (cpy) cpy.addEventListener("click", function () {
      var t = $("rxReplaceOut").value;
      if (!t) { toast("还没有替换结果"); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast("已复制替换结果 📋"); }, function () { toast("复制失败，请手动选择"); });
      else toast("当前环境不支持自动复制");
    });
    var pat = $("rxPat"), txt = $("rxText");
    if (pat) pat.addEventListener("input", function () { rxTest(false); });
    if (txt) txt.addEventListener("input", function () { rxTest(false); });
    rxTest(false);
  }
  function regexLoad() { rxTest(false); }
  QUOTES.push(
    "正则不是咒语，是把「我要找的东西」翻译成机器听得懂的暗号。",
    "一条写对的正则，顶你手动翻一百页文档。",
    "匹配不到别急着改文本，多半是正则自己还没说清楚。",
    "括号（capture）是你的捕手：不想要的别套括号，想要的记得留位置。",
    "贪婪（greedy）是默认脾气，想让它见好就收，就在量词后加个 ?。",
    "测试正则最好的办法，不是脑补，是把真实文本丢进去跑一遍。",
    "替换里的 $1、$2，是把抓到的第几组内容原样还回去。",
    "正则解决的是「模式」，不是「语义」——它认得出邮箱长相，分不清真假。",
    "flag 是开关：g 找全部、i 不挑剔大小写、m 把每行当开头。",
    "写正则如写规则：先把要的画清楚，再决定哪些可以随便。"
  );
  BADGES.push(
    { emoji: "🔤", name: "正则新手", desc: "用过 1 次正则测试器", test: (u) => (u.regex || 0) >= 1 },
    { emoji: "🧠", name: "正则大师", desc: "累计使用正则测试器 20 次", test: (u) => (u.regex || 0) >= 20 }
  );