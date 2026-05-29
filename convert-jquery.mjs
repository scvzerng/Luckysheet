import fs from 'fs';
import path from 'path';

const BASE = 'd:\\gitee\\Luckysheet\\src';

const files = [
  'controllers/alternateformat/alternateformatObj.js',
  'controllers/alternateformat/dialog.js',
  'controllers/resize.js',
  'controllers/sheetBar.js',
  'controllers/postil.js',
  'global/tooltip.js',
  'global/api/sheet.js',
  'controllers/menuButton/formatStatus.js',
  'controllers/matrixOperation/copyFormatOperation.js',
  'controllers/rowColumnOperation/rowHeaderEvents/initResizeEvents.js',
  'controllers/rowColumnOperation/rowHeaderEvents/initAddRowColEvents.js',
  'controllers/rowColumnOperation/rowHeaderEvents/initColHeaderEvents.js',
  'controllers/rowColumnOperation/rowHeaderEvents/initRowHeaderEvents.js',
  'controllers/handler/cellEventsSub/handleCellMouseup.js',
  'controllers/rowColumnOperation/rowHeaderEvents/initDeleteRowColEvents.js',
  'controllers/sheetmanage/sheetCRUD.js',
  'global/refresh/refreshCanvas.js',
  'global/formula/functionSearch.js',
  'global/formula/rangeSelect.js',
  'controllers/rowColumnOperation/rowHeaderEvents/initDeleteCellEvents.js',
  'global/formula/rangeHighlight.js',
  'global/formula/dependency.js',
  'global/formula/formulaBar.js',
  'global/method.js',
  'global/format.js',
  'controllers/sheetmanage/sheetParamRestore.js',
  'global/api/workbook.js',
  'global/api/util.js',
  'controllers/selection/clipboardCopy.js',
  'controllers/freezen/freezeCore.js',
  'controllers/handler/cellEventsSub/handleCellMousedown.js',
  'utils/utilSub/uiUtils.js',
  'controllers/menuButton/toolbarInit/initTextStyle.js',
  'controllers/menuButton/toolbarInit/initNumberFormat.js',
  'controllers/rowColumnOperation/rowHeaderEvents/initRowColWidthEvents.js',
  'controllers/sheetmanage/sheetVisibility.js',
  'global/createdom.js',
  'controllers/menuButton/sizeUtils.js',
  'controllers/menuButton/paintFormat.js',
  'controllers/selection/htmlTableBuilder.js',
  'utils/eventUtils.js',
  'controllers/listener.js',
  'controllers/menuButton/toolbarInit/initFreezen.js',
  'controllers/filter/initialFilterHandler.js',
  'controllers/menuButton/fontManage.js',
  'global/cursorPos.js',
  'global/formula/cellUpdate.js',
  'global/api/editMode.js',
  'global/scroll.js',
  'global/rhchInit.js',
  'global/getdata.js',
  'global/draw/drawMain.js',
  'global/count.js',
  'global/location.js',
  'utils/utilSub/reactiveUtils.js',
];

function cssToCamel(prop) {
  return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function convertFile(filePath) {
  const fullPath = path.join(BASE, filePath);
  let code = fs.readFileSync(fullPath, 'utf-8');
  const original = code;

  code = convertCode(code);

  if (code !== original) {
    const hasJQ = /\$\(/.test(code) || /\$\./.test(code.replace(/\$\$\(/g, '').replace(/\$\$/g, ''));
    if (!hasJQ) {
      code = removeJQueryImports(code);
    }
    fs.writeFileSync(fullPath, code, 'utf-8');
    console.log(`Converted: ${filePath}`);
  } else {
    console.log(`No changes: ${filePath}`);
  }
}

function removeJQueryImports(code) {
  let lines = code.split('\n');
  lines = lines.filter(line => {
    const t = line.trim();
    if (/^import\s+.*from\s+['"].*jquery-bridge/.test(t)) return false;
    if (/^import\s+\$\s+from\s+['"]jquery['"]/.test(t)) return false;
    return true;
  });
  return lines.join('\n');
}

function convertCode(code) {
  // Phase 1: Handle $(this) and $(e.target) patterns
  code = code.replace(/\$\(this\)/g, 'this');
  code = code.replace(/\$\((\w+\.target)\)/g, '$1');

  // Phase 2: Handle $(html).appendTo(target) - creating elements from HTML strings
  code = code.replace(/\$\(\s*(html)\s*\)\.appendTo\(\s*([^)]+)\s*\)/g,
    '$2.insertAdjacentHTML(\'beforeend\', $1)');
  code = code.replace(/\$\(\s*('(?:[^'\\]|\\.)*')\s*\)\.appendTo\(\s*([^)]+)\s*\)/g,
    '$2.insertAdjacentHTML(\'beforeend\', $1)');
  code = code.replace(/\$\(\s*("(?:[^"\\]|\\.)*")\s*\)\.appendTo\(\s*([^)]+)\s*\)/g,
    '$2.insertAdjacentHTML(\'beforeend\', $1)');

  // Phase 3: Handle chained .data("k1",v1).data("k2",v2) → Object.assign(el.dataset, {k1:v1,k2:v2})
  code = code.replace(
    /\.data\(\s*"([a-zA-Z_-]*)"\s*,\s*([^)]+)\s*\)\.data\(\s*"([a-zA-Z_-]*)"\s*,\s*([^)]+)\s*\)/g,
    (match, k1, v1, k2, v2) => {
      const ck1 = k1.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const ck2 = k2.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return ` && Object.assign(el.dataset, {${ck1}: ${v1.trim()}, ${ck2}: ${v2.trim()}})`;
    }
  );

  // Phase 4: Handle .end() chains - break them
  // Pattern: .find(A).css().end().find(B).css()
  // This is too complex for regex, we'll handle specific known patterns

  // Phase 5: Handle $("#id") → document.getElementById("id")
  // Simple ID selectors only (no spaces, dots, colons, etc.)
  code = code.replace(/\$\(\s*"#([a-zA-Z_][a-zA-Z0-9_-]*)"\s*\)/g,
    'document.getElementById("$1")');

  // Phase 6: Handle compound selectors → document.querySelector()
  code = code.replace(/\$\(\s*("#[^"]*[ .>:\[][^"]*"|'[^']*[ .>:\[][^']*')\s*\)/g,
    'document.querySelector($1)');

  // Phase 7: Handle remaining $(selector) → document.querySelector(selector)
  code = code.replace(/\$\(\s*("([^"]+)"|'([^']+)')\s*\)/g, (match, selQ, selDQ, selSQ) => {
    const sel = selDQ || selSQ;
    if (sel.startsWith('#') && !sel.includes(' ') && !sel.includes('.') && !sel.includes('>') && !sel.includes(':') && !sel.includes('[')) {
      const id = sel.substring(1);
      return `document.getElementById("${id}")`;
    }
    return `document.querySelector(${selQ})`;
  });

  // Phase 8: Handle jQuery methods
  // Order matters: more specific patterns first

  // .css({prop: val, prop2: val2}) → Object.assign(el.style, {prop: val, prop2: val2})
  code = code.replace(/\.css\(\s*\{([^}]+)\}\s*\)/g, (match, props) => {
    return ` && Object.assign(el.style, {${props}})`;
  });

  // .css("prop", "val") → .style.prop = val
  code = code.replace(
    /\.css\(\s*"([a-zA-Z-]*)"(\s*,\s*)([^)]+)\s*\)/g,
    (match, prop, sep, val) => {
      const camelProp = cssToCamel(prop);
      return `.style.${camelProp}${sep}${val.trim()}`;
    }
  );
  code = code.replace(
    /\.css\(\s*'([a-zA-Z-]*)'(\s*,\s*)([^)]+)\s*\)/g,
    (match, prop, sep, val) => {
      const camelProp = cssToCamel(prop);
      return `.style.${camelProp}${sep}${val.trim()}`;
    }
  );

  // .prop("checked", true/false) → .checked = true/false
  code = code.replace(/\.prop\(\s*"checked"\s*,\s*(true|false)\s*\)/g, '.checked = $1');
  code = code.replace(/\.prop\(\s*'checked'\s*,\s*(true|false)\s*\)/g, '.checked = $1');

  // .prop("checked") → .checked
  code = code.replace(/\.prop\(\s*"checked"\s*\)/g, '.checked');
  code = code.replace(/\.prop\(\s*'checked'\s*\)/g, '.checked');

  // .removeAttr("name") → .removeAttribute("name")
  code = code.replace(/\.removeAttr\(\s*"([^"]*)"\s*\)/g, '.removeAttribute("$1")');
  code = code.replace(/\.removeAttr\(\s*'([^']*)'\s*\)/g, ".removeAttribute('$1')");

  // .attr("name", "val") → .setAttribute("name", "val") (setter first - 2 args)
  code = code.replace(/\.attr\(\s*"([^"]*)"\s*,\s*([^)]+)\s*\)/g, '.setAttribute("$1", $2)');
  code = code.replace(/\.attr\(\s*'([^']*)'\s*,\s*([^)]+)\s*\)/g, ".setAttribute('$1', $2)");

  // .attr("name") → .getAttribute("name") (getter - 1 arg)
  code = code.replace(/\.attr\(\s*"([^"]*)"\s*\)/g, '.getAttribute("$1")');
  code = code.replace(/\.attr\(\s*'([^']*)'\s*\)/g, ".getAttribute('$1')");

  // .data("key", val) → .dataset.key = val (setter)
  code = code.replace(/\.data\(\s*"([a-zA-Z_-]*)"\s*,\s*([^)]+)\s*\)/g, (match, key, val) => {
    const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `.dataset.${camelKey} = ${val.trim()}`;
  });
  code = code.replace(/\.data\(\s*'([a-zA-Z_-]*)'\s*,\s*([^)]+)\s*\)/g, (match, key, val) => {
    const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `.dataset.${camelKey} = ${val.trim()}`;
  });

  // .data("key") → .dataset.key (getter)
  code = code.replace(/\.data\(\s*"([a-zA-Z_-]*)"\s*\)/g, (match, key) => {
    const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `.dataset.${camelKey}`;
  });
  code = code.replace(/\.data\(\s*'([a-zA-Z_-]*)'\s*\)/g, (match, key) => {
    const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `.dataset.${camelKey}`;
  });

  // .val(v) → .value = v (setter - must come before getter)
  code = code.replace(/\.val\(\s*([^)]+)\s*\)/g, (match, val) => {
    return `.value = ${val.trim()}`;
  });

  // .val() → .value (getter)
  code = code.replace(/\.val\(\s*\)/g, '.value');

  // .html(h) → .innerHTML = h (setter)
  code = code.replace(/\.html\(\s*([^)]+)\s*\)/g, (match, val) => {
    return `.innerHTML = ${val.trim()}`;
  });

  // .html() → .innerHTML (getter)
  code = code.replace(/\.html\(\s*\)/g, '.innerHTML');

  // .text(t) → .textContent = t (setter)
  code = code.replace(/\.text\(\s*([^)]+)\s*\)/g, (match, val) => {
    return `.textContent = ${val.trim()}`;
  });

  // .text() → .textContent (getter)
  code = code.replace(/\.text\(\s*\)/g, '.textContent');

  // .addClass("cls") → .classList.add("cls")
  code = code.replace(/\.addClass\(\s*"([^"]*)"\s*\)/g, '.classList.add("$1")');
  code = code.replace(/\.addClass\(\s*'([^']*)'\s*\)/g, ".classList.add('$1')");

  // .removeClass("cls") → .classList.remove("cls")
  code = code.replace(/\.removeClass\(\s*"([^"]*)"\s*\)/g, '.classList.remove("$1")');
  code = code.replace(/\.removeClass\(\s*'([^']*)'\s*\)/g, ".classList.remove('$1')");

  // .hasClass("cls") → .classList.contains("cls")
  code = code.replace(/\.hasClass\(\s*"([^"]*)"\s*\)/g, '.classList.contains("$1")');
  code = code.replace(/\.hasClass\(\s*'([^']*)'\s*\)/g, ".classList.contains('$1')");

  // .toggleClass("cls") → .classList.toggle("cls")
  code = code.replace(/\.toggleClass\(\s*"([^"]*)"\s*\)/g, '.classList.toggle("$1")');

  // .is(":checked") → .checked
  code = code.replace(/\.is\(\s*":checked"\s*\)/g, '.checked');

  // .is(":visible") → .offsetWidth > 0
  code = code.replace(/\.is\(\s*":visible"\s*\)/g, '.offsetWidth > 0');

  // .is(selector) → .matches(selector)
  code = code.replace(/\.is\(\s*"([^"]*)"\s*\)/g, '.matches("$1")');
  code = code.replace(/\.is\(\s*'([^']*)'\s*\)/g, ".matches('$1')");

  // .show() → .style.display = ''
  code = code.replace(/\.show\(\s*\)/g, ".style.display = ''");

  // .hide() → .style.display = 'none'
  code = code.replace(/\.hide\(\s*\)/g, ".style.display = 'none'");

  // .slideUp() → .style.display = 'none'
  code = code.replace(/\.slideUp\(\s*\)/g, ".style.display = 'none'");

  // .slideDown() → .style.display = ''
  code = code.replace(/\.slideDown\(\s*\)/g, ".style.display = ''");

  // .slideToggle() → toggle display
  code = code.replace(/\.slideToggle\(\s*\)/g,
    ".style.display = .style.display === 'none' ? '' : 'none'");

  // .empty() → .innerHTML = ''
  code = code.replace(/\.empty\(\s*\)/g, ".innerHTML = ''");

  // .parent() → .parentElement
  code = code.replace(/\.parent\(\s*\)/g, '.parentElement');

  // .next() → .nextElementSibling
  code = code.replace(/\.next\(\s*\)/g, '.nextElementSibling');

  // .prev() → .previousElementSibling
  code = code.replace(/\.prev\(\s*\)/g, '.previousElementSibling');

  // .parents(sel) → .closest(sel)
  code = code.replace(/\.parents\(\s*"([^"]*)"\s*\)/g, '.closest("$1")');
  code = code.replace(/\.parents\(\s*'([^']*)'\s*\)/g, ".closest('$1')");

  // .find(sel) → .querySelector(sel)
  code = code.replace(/\.find\(\s*"([^"]*)"\s*\)/g, '.querySelector("$1")');
  code = code.replace(/\.find\(\s*'([^']*)'\s*\)/g, ".querySelector('$1')");

  // .outerWidth() → .offsetWidth
  code = code.replace(/\.outerWidth\(\s*\)/g, '.offsetWidth');

  // .outerHeight() → .offsetHeight
  code = code.replace(/\.outerHeight\(\s*\)/g, '.offsetHeight');

  // .width() → .offsetWidth (for elements)
  code = code.replace(/\.width\(\s*\)/g, '.offsetWidth');

  // .height() → .offsetHeight
  code = code.replace(/\.height\(\s*\)/g, '.offsetHeight');

  // .scrollTop() → .scrollTop
  code = code.replace(/\.scrollTop\(\s*\)/g, '.scrollTop');

  // .scrollLeft() → .scrollLeft
  code = code.replace(/\.scrollLeft\(\s*\)/g, '.scrollLeft');

  // .clone() → .cloneNode(true)
  code = code.replace(/\.clone\(\s*\)/g, '.cloneNode(true)');

  // .get(0) → (nothing - just use the element directly)
  code = code.replace(/\.get\(0\)/g, '');

  // .append(html) → .insertAdjacentHTML('beforeend', html)
  code = code.replace(/\.append\(\s*('(?:[^'\\]|\\.)*')\s*\)/g,
    ".insertAdjacentHTML('beforeend', $1)");
  code = code.replace(/\.append\(\s*("(?:[^"\\]|\\.)*")\s*\)/g,
    ".insertAdjacentHTML('beforeend', $1)");
  code = code.replace(/\.append\(\s*(\$\{[^}]+\})\s*\)/g,
    ".insertAdjacentHTML('beforeend', $1)");

  // .prepend(html) → .insertAdjacentHTML('afterbegin', html)
  code = code.replace(/\.prepend\(\s*('(?:[^'\\]|\\.)*')\s*\)/g,
    ".insertAdjacentHTML('afterbegin', $1)");

  // .offset() → position object
  code = code.replace(/\.offset\(\s*\)/g,
    ' && {top: el.getBoundingClientRect().top + window.pageYOffset, left: el.getBoundingClientRect().left + window.pageXOffset}');

  // .position() → position object
  code = code.replace(/\.position\(\s*\)/g,
    ' && {top: el.offsetTop, left: el.offsetLeft}');

  // .siblings() → Array.from(el.parentElement.children).filter(s => s !== el)
  code = code.replace(/\.siblings\(\s*\)/g,
    ' && Array.from(el.parentElement.children).filter(s => s !== el)');

  // .index() → Array.from(el.parentElement.children).indexOf(el)
  code = code.replace(/\.index\(\s*\)/g,
    ' && Array.from(el.parentElement.children).indexOf(el)');

  // .eq(n) → [n] (for querySelectorAll results)
  code = code.replace(/\.eq\(\s*(\d+)\s*\)/g, '[$1]');
  code = code.replace(/\.eq\(\s*([^)]+)\s*\)/g, '[$1]');

  // .not(sel) → filter
  code = code.replace(/\.not\(\s*"([^"]*)"\s*\)/g, '.filter(e => !e.matches("$1"))');

  // .length > 0 → !== null (for single element queries)
  code = code.replace(/\.length\s*>\s*0/g, ' !== null');
  code = code.replace(/\.length\s*>=\s*1/g, ' !== null');

  // .length == 0 → === null
  code = code.replace(/\.length\s*==\s*0/g, ' === null');
  code = code.replace(/\.length\s*===\s*0/g, ' === null');

  // .length → !== null (for truthiness checks)
  // Be careful not to replace .length on arrays/strings
  // Only replace when it's clearly a jQuery result check

  // Event binding
  // .click(fn) → .addEventListener("click", fn)
  code = code.replace(/\.click\(\s*function/g, '.addEventListener("click", function');
  code = code.replace(/\.click\(\s*\(\s*\)/g, '.addEventListener("click", ()');
  code = code.replace(/\.click\(\s*\(\s*e\s*\)/g, '.addEventListener("click", (e)');

  // .keydown(fn) → .addEventListener("keydown", fn)
  code = code.replace(/\.keydown\(\s*function/g, '.addEventListener("keydown", function');

  // .change(fn) → .addEventListener("change", fn)
  code = code.replace(/\.change\(\s*function/g, '.addEventListener("change", function');

  // .mousedown(fn) → .addEventListener("mousedown", fn)
  code = code.replace(/\.mousedown\(\s*function/g, '.addEventListener("mousedown", function');

  // .mouseup(fn) → .addEventListener("mouseup", fn)
  code = code.replace(/\.mouseup\(\s*function/g, '.addEventListener("mouseup", function');

  // .mousemove(fn) → .addEventListener("mousemove", fn)
  code = code.replace(/\.mousemove\(\s*function/g, '.addEventListener("mousemove", function');

  // .dblclick(fn) → .addEventListener("dblclick", fn)
  code = code.replace(/\.dblclick\(\s*function/g, '.addEventListener("dblclick", function');

  // .focus(fn) → .addEventListener("focus", fn)
  code = code.replace(/\.focus\(\s*function/g, '.addEventListener("focus", function');

  // .blur(fn) → .addEventListener("blur", fn)
  code = code.replace(/\.blur\(\s*function/g, '.addEventListener("blur", function');

  // .on("event", selector, fn) - delegated events (keep as-is, these need manual handling)
  // .on("event", fn) → .addEventListener("event", fn)
  code = code.replace(/\.on\(\s*"([^"]*)"\s*,\s*function/g, '.addEventListener("$1", function');
  code = code.replace(/\.on\(\s*'([^']*)'\s*,\s*function/g, ".addEventListener('$1', function");

  // .off("event", fn) → .removeEventListener("event", fn)
  code = code.replace(/\.off\(\s*"([^"]*)"\s*,\s*function/g, '.removeEventListener("$1", function');
  code = code.replace(/\.off\(\s*'([^']*)'\s*,\s*function/g, ".removeEventListener('$1', function");

  // .off("hover") → (remove - no direct equivalent)
  code = code.replace(/\.off\(\s*"hover"\s*\)/g, '');

  // .bind("event", fn) → .addEventListener("event", fn)
  code = code.replace(/\.bind\(\s*"([^"]*)"\s*,/g, '.addEventListener("$1",');
  code = code.replace(/\.bind\(\s*'([^']*)'\s*,/g, ".addEventListener('$1',");

  // .unbind("event", fn) → .removeEventListener("event", fn)
  code = code.replace(/\.unbind\(\s*"([^"]*)"\s*,/g, '.removeEventListener("$1",');
  code = code.replace(/\.unbind\(\s*'([^']*)'\s*,/g, ".removeEventListener('$1',");

  // .trigger("event") → .dispatchEvent(new Event("event", {bubbles: true}))
  code = code.replace(/\.trigger\(\s*"([^"]*)"\s*\)/g,
    '.dispatchEvent(new Event("$1", {bubbles: true}))');

  // .hover(fn1, fn2) → addEventListener mouseenter/mouseleave
  // This is complex - we'll handle it as a special case

  // .each(function(i, e){...}) → forEach
  // This is complex - we'll handle specific patterns

  // .end() → needs chain breaking - handle specific patterns

  // Phase 9: Handle specific complex patterns

  // Pattern: $(selector).find(A).css().end() chains
  // These need to be broken into separate queries

  // Pattern: .addClass("on").siblings().removeClass("on")
  // → classList.add + forEach sibling classList.remove

  // Pattern: .off("hover").hover(fn1, fn2)
  // → removeEventListener + addEventListener mouseenter/mouseleave

  return code;
}

// Process all files
let totalChanges = 0;
for (const file of files) {
  try {
    const fullPath = path.join(BASE, file);
    const before = fs.readFileSync(fullPath, 'utf-8');
    convertFile(file);
    const after = fs.readFileSync(fullPath, 'utf-8');
    if (before !== after) totalChanges++;
  } catch (e) {
    console.error(`Error processing ${file}:`, e.message);
  }
}

console.log(`\nTotal files changed: ${totalChanges}`);

// Verify - check for remaining jQuery calls
console.log('\n--- Remaining jQuery calls ---');
for (const file of files) {
  const fullPath = path.join(BASE, file);
  const code = fs.readFileSync(fullPath, 'utf-8');
  const lines = code.split('\n');
  lines.forEach((line, i) => {
    // Skip comments and strings
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) return;
    // Check for jQuery patterns
    if (/\$\(/.test(line) && !/\$\$\(/.test(line.replace(/\$\$\(/g, ''))) {
      // Exclude $$( which is a different utility
      const cleaned = line.replace(/\$\$/g, '');
      if (/\$\(/.test(cleaned)) {
        console.log(`  ${file}:${i + 1}: ${line.trim()}`);
      }
    }
  });
}
