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

function fixFile(filePath) {
  const fullPath = path.join(BASE, filePath);
  let code = fs.readFileSync(fullPath, 'utf-8');
  const original = code;

  // Fix 1: Replace "&& Object.assign(el.style, {...})" with proper Object.assign
  // Pattern: ELEMENT && Object.assign(el.style, {...})
  // Should be: Object.assign(ELEMENT.style, {...})
  code = code.replace(/(\S.*?)\s*&&\s*Object\.assign\(el\.style\s*,\s*/g, (match, prefix) => {
    return `Object.assign(${prefix.trim()}.style, `;
  });

  // Fix 2: Replace "&& {top: el.getBoundingClientRect()...}" with proper offset
  // Pattern: ELEMENT && {top: el.getBoundingClientRect().top + window.pageYOffset, left: el.getBoundingClientRect().left + window.pageXOffset}
  // Should be: (() => { const r = ELEMENT.getBoundingClientRect(); return {top: r.top + window.pageYOffset, left: r.left + window.pageXOffset}; })()
  // But simpler: just use ELEMENT.getBoundingClientRect() directly
  code = code.replace(
    /(\S.*?)\s*&&\s*\{top:\s*el\.getBoundingClientRect\(\)\.top\s*\+\s*window\.pageYOffset,\s*left:\s*el\.getBoundingClientRect\(\)\.left\s*\+\s*window\.pageXOffset\}/g,
    (match, prefix) => {
      const el = prefix.trim();
      return `(() => { const _r = ${el}.getBoundingClientRect(); return {top: _r.top + window.pageYOffset, left: _r.left + window.pageXOffset}; })()`;
    }
  );

  // Fix 3: Replace "&& {top: el.offsetTop, left: el.offsetLeft}" with proper position
  code = code.replace(
    /(\S.*?)\s*&&\s*\{top:\s*el\.offsetTop,\s*left:\s*el\.offsetLeft\}/g,
    (match, prefix) => {
      const el = prefix.trim();
      return `{top: ${el}.offsetTop, left: ${el}.offsetLeft}`;
    }
  );

  // Fix 4: Replace "&& Array.from(el.parentElement.children).indexOf(el)" with proper index
  code = code.replace(
    /(\S.*?)\s*&&\s*Array\.from\(el\.parentElement\.children\)\.indexOf\(el\)/g,
    (match, prefix) => {
      const el = prefix.trim();
      return `Array.from(${el}.parentElement.children).indexOf(${el})`;
    }
  );

  // Fix 5: Replace "&& Array.from(el.parentElement.children).filter(s => s !== el)" with proper siblings
  code = code.replace(
    /(\S.*?)\s*&&\s*Array\.from\(el\.parentElement\.children\)\.filter\(s\s*=>\s*s\s*!==\s*el\)/g,
    (match, prefix) => {
      const el = prefix.trim();
      return `Array.from(${el}.parentElement.children).filter(s => s !== ${el})`;
    }
  );

  // Fix 6: Replace "&& Object.assign(el.dataset, {...})" with proper dataset assignment
  code = code.replace(
    /(\S.*?)\s*&&\s*Object\.assign\(el\.dataset\s*,\s*/g,
    (match, prefix) => {
      return `Object.assign(${prefix.trim()}.dataset, `;
    }
  );

  // Fix 7: Handle dynamic selectors with string concatenation
  // $("#" + Store.container) → document.getElementById(Store.container)
  code = code.replace(/\$\(\s*"#"\s*\+\s*([\w.]+)\s*\)/g, 'document.getElementById($1)');

  // $("#luckysheet-sheets-item" + index) → document.getElementById("luckysheet-sheets-item" + index)
  code = code.replace(/\$\(\s*"([^"]*)"\s*\+\s*([\w.]+)\s*\)/g, 'document.getElementById("$1" + $2)');
  code = code.replace(/\$\(\s*'([^']*)'\s*\+\s*([\w.]+)\s*\)/g, "document.getElementById('$1' + $2)");

  // $("#luckysheet-postil-show_"+ r +"_"+ c) → document.getElementById("luckysheet-postil-show_"+ r +"_"+ c)
  code = code.replace(/\$\(\s*"([^"]*"_"\s*\+\s*[\w.]+\s*\+\s*"_"\s*\+\s*[\w.]+)\s*\)/g,
    'document.getElementById("$1")');

  // More general: $("#prefix" + var + "suffix" + var2) patterns
  // Handle: $("string" + expr) → document.getElementById("string" + expr) for simple cases
  // For compound selectors with spaces, use querySelector
  code = code.replace(/\$\(\s*"([^"]*"\s*\+[\s\w."+_-]+)\s*\)/g, (match, sel) => {
    if (sel.includes(' ') || sel.includes('.') || sel.includes('>')) {
      return `document.querySelector("${sel}")`;
    }
    return `document.getElementById("${sel}")`;
  });

  // Fix 8: Handle $(e.currentTarget) → e.currentTarget
  code = code.replace(/\$\((\w+)\.currentTarget\)/g, '$1.currentTarget');

  // Fix 9: Handle $(currSelection.anchorNode) → currSelection.anchorNode
  code = code.replace(/\$\(([\w.]+)\)/g, (match, expr) => {
    if (expr === 'this' || expr.includes('.target') || expr.includes('currentTarget')) return match;
    return expr;
  });

  // Fix 10: Handle .hover(fn1, fn2) → addEventListener mouseenter/mouseleave
  // Pattern: .hover(function(){...}, function(){...})
  // This is complex - we'll handle the simple case
  code = code.replace(
    /\.hover\(\s*function\s*\(\s*\)\s*\{\s*([^}]+)\}\s*,\s*function\s*\(\s*\)\s*\{\s*([^}]+)\}\s*\)/g,
    (match, fn1Body, fn2Body) => {
      return `.addEventListener("mouseenter", function() {${fn1Body}});\n    el.addEventListener("mouseleave", function() {${fn2Body}})`;
    }
  );

  // Fix 11: Handle .each(function(i, e){...}) on querySelectorAll results
  // Pattern: ELEMENT.each(function(i, e){...})
  code = code.replace(
    /\.each\(\s*function\s*\(\s*(\w*)\s*,\s*(\w*)\s*\)\s*\{/g,
    '.forEach(function($2) {'
  );
  code = code.replace(
    /\.each\(\s*function\s*\(\s*(\w*)\s*\)\s*\{/g,
    '.forEach(function($1) {'
  );

  // Fix 12: Handle .insertBefore(target) - jQuery's insertBefore inserts the element before target
  // $(el).insertBefore(target) → target.parentElement.insertBefore(el, target)
  // This is complex because we need to know both el and target
  // We'll handle specific patterns

  // Fix 13: Handle .insertAfter(target) - jQuery's insertAfter inserts the element after target
  // $(el).insertAfter(target) → target.parentElement.insertBefore(el, target.nextElementSibling)

  // Fix 14: Handle $(html) for creating elements
  // Pattern: $(html).method() where html is a variable containing HTML string
  code = code.replace(/\$\(\s*(\w+)\s*\)\.insertAfter\(\s*([^)]+)\s*\)/g,
    (match, htmlVar, target) => {
      return `${target}.insertAdjacentHTML('afterend', ${htmlVar})`;
    });
  code = code.replace(/\$\(\s*(\w+)\s*\)\.insertBefore\(\s*([^)]+)\s*\)/g,
    (match, htmlVar, target) => {
      return `${target}.insertAdjacentHTML('beforebegin', ${htmlVar})`;
    });

  // Fix 15: Handle .append($(`${ele}`)) → .insertAdjacentHTML('beforeend', ele)
  code = code.replace(/\.append\(\s*\$\(\s*`(\$\{[^}]+\})`\s*\)\s*\)/g,
    ".insertAdjacentHTML('beforeend', $1)");
  code = code.replace(/\.append\(\s*\$\(\s*`([^`]*)`\s*\)\s*\)/g,
    ".insertAdjacentHTML('beforeend', `$1`)");

  // Fix 16: Handle remaining $(selector) with template literals
  code = code.replace(/\$\(\s*`([^`]*)`\s*\)/g, (match, sel) => {
    if (sel.includes(' ') || sel.includes('.') || sel.includes('>')) {
      return `document.querySelector(\`${sel}\`)`;
    }
    if (sel.startsWith('#')) {
      const id = sel.substring(1);
      if (!id.includes('${')) {
        return `document.getElementById("${id}")`;
      }
    }
    return `document.querySelector(\`${sel}\`)`;
  });

  // Fix 17: Handle .append(html) where html contains HTML string
  // Already handled in first pass, but fix cases with template expressions

  // Fix 18: Handle $("#" + id).querySelector(...) → document.getElementById(id).querySelector(...)
  // These should already work after Fix 7

  // Fix 19: Handle .offset().left and .offset().top patterns
  code = code.replace(
    /\(\(\)\s*=>\s*\{\s*const\s*_r\s*=\s*([^;]+);\s*return\s*\{top:\s*_r\.top\s*\+\s*window\.pageYOffset,\s*left:\s*_r\.left\s*\+\s*window\.pageXOffset\};\s*\}\)\(\)\.left/g,
    (match, elExpr) => {
      return `(() => { const _r = ${elExpr}; return _r.left + window.pageXOffset; })()`;
    }
  );
  code = code.replace(
    /\(\(\)\s*=>\s*\{\s*const\s*_r\s*=\s*([^;]+);\s*return\s*\{top:\s*_r\.top\s*\+\s*window\.pageYOffset,\s*left:\s*_r\.left\s*\+\s*window\.pageXOffset\};\s*\}\)\(\)\.top/g,
    (match, elExpr) => {
      return `(() => { const _r = ${elExpr}; return _r.top + window.pageYOffset; })()`;
    }
  );

  // Fix 20: Handle .querySelector(...).style.display = 'none' that was wrongly converted
  // from .find(...).hide() - these should be fine

  // Fix 21: Handle $(e).getAttribute("id") → e.getAttribute("id")
  code = code.replace(/\$\((\w+)\)\.getAttribute/g, '$1.getAttribute');

  // Fix 22: Handle remaining .on("event", selector, fn) delegated events
  // These are handled by onNS/offNS in the codebase, so they should be left as-is

  // Fix 23: Handle .querySelector(...).height(...).width(...) - wrong conversion
  // .height(v) and .width(v) are setters in jQuery
  code = code.replace(/\.height\(\s*([^)]+)\s*\)/g, (match, val) => {
    const v = val.trim();
    if (v.includes('(') || v.includes('.') || v.includes('+') || v.includes('-') || /^\d/.test(v)) {
      return `.style.height = ${v} + 'px'`;
    }
    return match;
  });
  code = code.replace(/\.width\(\s*([^)]+)\s*\)/g, (match, val) => {
    const v = val.trim();
    if (v.includes('(') || v.includes('.') || v.includes('+') || v.includes('-') || /^\d/.test(v)) {
      return `.style.width = ${v} + 'px'`;
    }
    return match;
  });

  // Fix 24: Handle $("#" + id).classList.add/remove patterns (already converted selectors)
  // These should work after Fix 7

  // Fix 25: Handle $("#" + id).querySelector(...) patterns
  // These should work after Fix 7

  // Fix 26: Handle $("#" + id).remove() patterns
  // These should work after Fix 7

  // Fix 27: Handle $("#" + id).append(html) patterns
  // After Fix 7, $("#" + id) is converted to document.getElementById(id)
  // Then .append(html) should be .insertAdjacentHTML('beforeend', html)

  // Fix 28: Handle $("#" + id).insertBefore/insertAfter patterns
  // These need special handling

  // Fix 29: Handle .querySelector(...).style.prop, value patterns (wrong comma)
  // Some conversions produced .style.display, 'none' instead of .style.display = 'none'
  code = code.replace(/\.style\.(\w+)\s*,\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\d+|[\w.]+)/g,
    '.style.$1 = $2');

  // Fix 30: Handle .querySelector(...).style.bottom, Store.statisticBarHeight
  code = code.replace(
    /\.style\.(\w+)\s*,\s*(Store\.\w+)/g,
    '.style.$1 = $2'
  );

  // Fix 31: Handle .style.top, expression patterns
  code = code.replace(
    /\.style\.(\w+)\s*,\s*([^\n;=]+?)(\s*;|\s*$)/gm,
    (match, prop, val, ending) => {
      if (val.includes('=')) return match;
      return `.style.${prop} = ${val.trim()}${ending}`;
    }
  );

  if (code !== original) {
    fs.writeFileSync(fullPath, code, 'utf-8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No fixes needed: ${filePath}`);
  }
}

for (const file of files) {
  try {
    fixFile(file);
  } catch (e) {
    console.error(`Error fixing ${file}:`, e.message);
  }
}

// Verify remaining jQuery calls
console.log('\n--- Remaining jQuery calls ---');
for (const file of files) {
  const fullPath = path.join(BASE, file);
  const code = fs.readFileSync(fullPath, 'utf-8');
  const lines = code.split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) return;
    const cleaned = line.replace(/\$\$/g, '');
    if (/\$\(/.test(cleaned)) {
      console.log(`  ${file}:${i + 1}: ${line.trim().substring(0, 120)}`);
    }
  });
}
