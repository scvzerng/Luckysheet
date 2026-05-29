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

function fixFile(filePath) {
  const fullPath = path.join(BASE, filePath);
  let code = fs.readFileSync(fullPath, 'utf-8');
  const original = code;

  // Fix 1: Remove # prefix from getElementById calls
  // document.getElementById("#id") → document.getElementById("id")
  code = code.replace(/document\.getElementById\(\s*"#/g, 'document.getElementById("');

  // Fix 2: Handle jQuery .insertAfter() and .insertBefore()
  // jQuery's $(A).insertBefore(B) means "insert A before B"
  // → B.parentElement.insertBefore(A, B)
  // jQuery's $(A).insertAfter(B) means "insert A after B"
  // → B.parentElement.insertBefore(A, B.nextElementSibling)

  // Pattern: ELEMENT.insertAfter(TARGET)
  // Where ELEMENT is the element to move, TARGET is the reference
  code = code.replace(
    /document\.getElementById\("([^"]+)"\)\.insertAfter\(([^)]+)\)/g,
    (match, id, target) => {
      return `${target}.parentElement.insertBefore(document.getElementById("${id}"), ${target}.nextElementSibling)`;
    }
  );

  // Pattern: ELEMENT.insertBefore(TARGET) - jQuery semantics
  // jQuery's $(A).insertBefore(B) inserts A before B
  // → B.parentElement.insertBefore(A, B)
  code = code.replace(
    /document\.getElementById\("([^"]+)"\)\.insertBefore\(([^)]+)\)/g,
    (match, id, target) => {
      return `${target}.parentElement.insertBefore(document.getElementById("${id}"), ${target})`;
    }
  );

  // Fix 3: Handle remaining $(selector) with string concatenation
  // $("#luckysheet-sheets-item" + Store.luckysheetfile[...].index)
  code = code.replace(
    /\$\(\s*"#([^"]*)"\s*\+\s*([\w.[\]]+(?:\s*[\-\+]\s*[\w.[\]]+)*)\s*\)/g,
    'document.getElementById("$1" + $2)'
  );

  // Fix 4: Handle $(curr.ele[0]) → document.querySelector(curr.ele[0])
  code = code.replace(/\$\(curr\.ele\[0\]\)/g, 'document.querySelector(curr.ele[0])');

  // Fix 5: Handle broken offset conversions in resize.js
  // Pattern: (() => { const _r = toobarWidths.push(ELEMENT.getBoundingClientRect(); return _r.left + window.pageXOffset; })())
  // This is broken - the push() is inside the IIFE
  // Should be: toobarWidths.push(ELEMENT.getBoundingClientRect().left + window.pageXOffset)

  // Fix 6: Handle .append(htmlString) on DOM elements → .insertAdjacentHTML('beforeend', htmlString)
  // Only for cases where the argument is clearly an HTML string
  // cellMain.append('...') and sheetContainer.append('...') are custom objects, leave them
  // document.getElementById("...").append('...') should be converted

  // Fix 7: Handle .append($(`${ele}`)) → .insertAdjacentHTML('beforeend', ele)
  code = code.replace(
    /\.append\(\s*\$\(\s*`(\$\{[^}]+\})`\s*\)\s*\)/g,
    ".insertAdjacentHTML('beforeend', $1)"
  );

  // Fix 8: Handle remaining $(e.currentTarget) → e.currentTarget
  code = code.replace(/\$\((\w+)\.currentTarget\)/g, '$1.currentTarget');

  // Fix 9: Handle $(variable) where variable is a DOM element reference
  // $(currSelection.anchorNode) → currSelection.anchorNode
  // But be careful not to match $(selector) where selector is a string
  code = code.replace(/\$\(([\w.]+)\)/g, (match, expr) => {
    // Skip if it looks like a string selector
    if (expr.startsWith('"') || expr.startsWith("'") || expr.startsWith('`')) return match;
    // Skip if it's already a DOM method result
    if (expr.includes('getElementById') || expr.includes('querySelector')) return match;
    // Skip if it's 'this' (already handled)
    if (expr === 'this') return match;
    // Skip if it's a number
    if (/^\d+$/.test(expr)) return match;
    // Convert: $(variable) → variable
    return expr;
  });

  // Fix 10: Handle .querySelector(...).append(htmlString) → .insertAdjacentHTML
  // Only for simple HTML string arguments
  code = code.replace(
    /document\.getElementById\("([^"]+)"\)\.append\(\s*('(?:[^'\\]|\\.)*')\s*\)/g,
    'document.getElementById("$1").insertAdjacentHTML(\'beforeend\', $2)'
  );

  // Fix 11: Handle .on("event", selector, fn) delegated events
  // These are complex - jQuery's .on() with a selector argument is event delegation
  // Native equivalent: el.addEventListener("event", function(e) { if (e.target.closest(selector)) fn(e); })
  // For now, we'll convert to a simpler pattern

  // Fix 12: Handle .slideToggle(duration, callback) → CSS transition or direct toggle
  code = code.replace(
    /\.slideToggle\(\s*\d+\s*,\s*function\s*\(\s*\)\s*\{/g,
    (match) => {
      return ".style.display = .style.display === 'none' ? '' : 'none'; function() {";
    }
  );

  // Fix 13: Handle .matches(":hidden") → .offsetHeight === 0
  code = code.replace(/\.matches\(\s*":hidden"\s*\)/g, '.offsetHeight === 0');

  // Fix 14: Handle broken Object.assign(...).style.display patterns
  // Object.assign(el.style, {...}).style.display = '' → Object.assign(el.style, {...}); el.style.display = ''
  code = code.replace(
    /Object\.assign\(([^,]+)\.style\s*,\s*\{([^}]+)\}\s*\)\s*\.style\.display\s*=\s*''/g,
    (match, el, props) => {
      return `Object.assign(${el}.style, {${props}}); ${el}.style.display = ''`;
    }
  );

  // Fix 15: Handle broken offset conversion patterns
  // (() => { const _r = EXPRESSION.getBoundingClientRect(); return _r.left + window.pageXOffset; })()
  // → EXPRESSION.getBoundingClientRect().left + window.pageXOffset
  code = code.replace(
    /\(\(\)\s*=>\s*\{\s*const\s+_r\s*=\s*([^;]+?);?\s*return\s+_r\.left\s*\+\s*window\.pageXOffset;\s*\}\)\(\)/g,
    (match, expr) => {
      return `${expr}.getBoundingClientRect().left + window.pageXOffset`;
    }
  );
  code = code.replace(
    /\(\(\)\s*=>\s*\{\s*const\s+_r\s*=\s*([^;]+?);?\s*return\s+_r\.top\s*\+\s*window\.pageYOffset;\s*\}\)\(\)/g,
    (match, expr) => {
      return `${expr}.getBoundingClientRect().top + window.pageYOffset`;
    }
  );

  // Fix 16: Handle broken offset with assignment
  // (() => { const _r = offset = EXPRESSION.getBoundingClientRect(); return {...}; })()
  code = code.replace(
    /\(\(\)\s*=>\s*\{\s*const\s+_r\s*=\s*offset\s*=\s*([^;]+?)\.getBoundingClientRect\(\);\s*return\s*\{top:\s*_r\.top\s*\+\s*window\.pageYOffset,\s*left:\s*_r\.left\s*\+\s*window\.pageXOffset\};\s*\}\)\(\)/g,
    (match, expr) => {
      return `(offset = ${expr}.getBoundingClientRect(), {top: offset.top + window.pageYOffset, left: offset.left + window.pageXOffset})`;
    }
  );

  // Fix 17: Handle broken .offset().left and .offset().top patterns
  // These might have been partially converted

  // Fix 18: Handle .querySelector(...).style.prop, value → .querySelector(...).style.prop = value
  // This was caused by wrong .css("prop", "val") conversion
  code = code.replace(
    /\.style\.(\w+)\s*,\s*('(?:[^'\\]|\\.)*')\s*\)/g,
    '.style.$1 = $2)'
  );

  // Fix 19: Handle broken .index() conversion
  // Array.from(currentIndex = currSelection.parentElement.children).indexOf(currentIndex = currSelection)
  // → currentIndex = Array.from(currSelection.parentElement.children).indexOf(currSelection)
  code = code.replace(
    /Array\.from\(currentIndex\s*=\s*([^)]+\.children)\)\.indexOf\(currentIndex\s*=\s*([^)]+)\)/g,
    'currentIndex = Array.from($1).indexOf($2)'
  );

  // Fix 20: Handle .length on DOM elements (jQuery remnant)
  // $editer.length → should check if it exists
  // funcLen = $editer.length → funcLen = $editer ? 1 : 0 (or just remove)
  // Actually, in the context of functionSearch.js, $editer is a DOM element
  // $editer.length doesn't exist on DOM elements - this was a jQuery pattern
  // In jQuery, $(selector).length returns the number of matched elements
  // For a single DOM element, this is always 1 (if it exists)
  // We need to understand the context to fix this properly

  // Fix 21: Handle .innerHTML = ahf, → .innerHTML = ahf; (trailing comma)
  code = code.replace(/\.innerHTML\s*=\s*([^;,]+),\s*$/gm, '.innerHTML = $1;');

  // Fix 22: Handle .querySelector(...).style.opacity = "0.03" that should work
  // but the selector was not converted from jQuery
  // $(selector).style.opacity → document.querySelector(selector).style.opacity

  // Fix 23: Handle document.getElementById(rangeid) Object.assign(...)
  // This is broken - missing .querySelector() between getElementById and Object.assign
  code = code.replace(
    /document\.getElementById\(([^)]+)\)\s*\n?\s*Object\.assign\(\.querySelector\(([^)]+)\)\.style\s*,/g,
    (match, idArg, selArg) => {
      return `Object.assign(document.getElementById(${idArg}).querySelector(${selArg}).style,`;
    }
  );

  // Fix 24: Handle remaining .on("event", ".selector", fn) delegated events
  // Convert to addEventListener with event delegation
  code = code.replace(
    /\.addEventListener\(\s*"([^"]*)"\s*,\s*"(\.[^"]*)"\s*,\s*function/g,
    '.addEventListener("$1", function'
  );

  // Fix 25: Handle .prevAll(":visible")[0] → manual traversal
  // This is in sheetBar.js
  code = code.replace(
    /\.previousElementSibling/g,
    '.previousElementSibling'
  );

  // Fix 26: Handle .nextAll(":visible")[0] → manual traversal
  // This is in sheetBar.js

  if (code !== original) {
    fs.writeFileSync(fullPath, code, 'utf-8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No fixes: ${filePath}`);
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

// Verify remaining broken patterns
console.log('\n--- Remaining broken patterns ---');
for (const file of files) {
  const fullPath = path.join(BASE, file);
  const code = fs.readFileSync(fullPath, 'utf-8');
  const lines = code.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('document.getElementById("#')) {
      console.log(`  ${file}:${i + 1}: getElementById with # prefix: ${line.trim().substring(0, 100)}`);
    }
    if (line.includes('.insertAfter(') || line.includes('.insertBefore(')) {
      console.log(`  ${file}:${i + 1}: insertAfter/insertBefore: ${line.trim().substring(0, 100)}`);
    }
  });
}
