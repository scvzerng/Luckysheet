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

// Check for remaining jQuery patterns
const jqueryPatterns = [
  [/\$\(/g, '$('],
  [/\.find\(\s*"/g, '.find("'],
  [/\.css\(/g, '.css('],
  [/\.val\(\)/g, '.val()'],
  [/\.html\(\)/g, '.html()'],
  [/\.text\(\)/g, '.text()'],
  [/\.show\(\)/g, '.show()'],
  [/\.hide\(\)/g, '.hide()'],
  [/\.addClass\(/g, '.addClass('],
  [/\.removeClass\(/g, '.removeClass('],
  [/\.hasClass\(/g, '.hasClass('],
  [/\.attr\(/g, '.attr('],
  [/\.removeAttr\(/g, '.removeAttr('],
  [/\.parent\(\)/g, '.parent()'],
  [/\.parents\(/g, '.parents('],
  [/\.next\(\)/g, '.next()'],
  [/\.prev\(\)/g, '.prev()'],
  [/\.siblings\(\)/g, '.siblings()'],
  [/\.outerWidth\(\)/g, '.outerWidth()'],
  [/\.outerHeight\(\)/g, '.outerHeight()'],
  [/\.append\(/g, '.append('],
  [/\.prepend\(/g, '.prepend('],
  [/\.empty\(\)/g, '.empty()'],
  [/\.clone\(\)/g, '.clone()'],
  [/\.is\(/g, '.is('],
  [/\.index\(\)/g, '.index()'],
  [/\.eq\(/g, '.eq('],
  [/\.get\(0\)/g, '.get(0)'],
  [/\.prop\(/g, '.prop('],
  [/\.on\(/g, '.on('],
  [/\.off\(/g, '.off('],
  [/\.click\(/g, '.click('],
  [/\.keydown\(/g, '.keydown('],
  [/\.change\(/g, '.change('],
  [/\.trigger\(/g, '.trigger('],
  [/\.bind\(/g, '.bind('],
  [/\.unbind\(/g, '.unbind('],
  [/\.hover\(/g, '.hover('],
  [/\.each\(/g, '.each('],
  [/\.end\(\)/g, '.end()'],
  [/\.not\(/g, '.not('],
  [/\.data\(/g, '.data('],
  [/\.offset\(\)/g, '.offset()'],
  [/\.position\(\)/g, '.position()'],
  [/\.insertAfter\(/g, '.insertAfter('],
  [/\.insertBefore\(/g, '.insertBefore('],
  [/\.slideToggle\(/g, '.slideToggle('],
  [/\.slideUp\(/g, '.slideUp('],
  [/\.slideDown\(/g, '.slideDown('],
  [/\.width\(\)/g, '.width()'],
  [/\.height\(\)/g, '.height()'],
  [/\.scrollTop\(\)/g, '.scrollTop()'],
  [/\.scrollLeft\(\)/g, '.scrollLeft()'],
];

let totalIssues = 0;

for (const file of files) {
  const fullPath = path.join(BASE, file);
  const code = fs.readFileSync(fullPath, 'utf-8');
  const lines = code.split('\n');
  let fileIssues = 0;

  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) return;

    for (const [pattern, name] of jqueryPatterns) {
      // Reset regex lastIndex
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        // Skip false positives
        if (name === '$(' && line.includes('$$(')) continue;
        if (name === '$(' && line.includes('match(/\\$')) continue;
        if (name === '.append(' && line.includes('sheetContainer.append')) continue;
        if (name === '.append(' && line.includes('cellMain.append')) continue;
        if (name === '.append(' && line.includes('gridWindow.append')) continue;
        if (name === '.append(' && line.includes('selectionCopy.append')) continue;
        if (name === '.append(' && line.includes('.insertAdjacentHTML')) continue;
        if (name === '.find(' && line.includes('querySelector')) continue;
        if (name === '.data(' && line.includes('dataset.')) continue;
        if (name === '.is(' && line.includes('matches(')) continue;
        if (name === '.on(' && line.includes('addEventListener')) continue;
        if (name === '.off(' && line.includes('removeEventListener')) continue;
        if (name === '.click(' && line.includes('addEventListener')) continue;
        if (name === '.keydown(' && line.includes('addEventListener')) continue;
        if (name === '.change(' && line.includes('addEventListener')) continue;
        if (name === '.width()' && line.includes('offsetWidth')) continue;
        if (name === '.height()' && line.includes('offsetHeight')) continue;
        if (name === '.show()' && line.includes("style.display = ''")) continue;
        if (name === '.hide()' && line.includes("style.display = 'none'")) continue;
        if (name === '.val()' && line.includes('.value')) continue;
        if (name === '.html()' && line.includes('.innerHTML')) continue;
        if (name === '.text()' && line.includes('.textContent')) continue;
        if (name === '.find(' && line.includes('conditionformatDialog')) continue;
        if (name === '.find(' && line.includes('formulaDialogs')) continue;
        if (name === '.find(' && line.includes('richTextEditor.find')) continue;
        if (name === '.append(' && line.includes('cellMain.append')) continue;

        console.log(`  ${file}:${i + 1}: ${name} → ${line.trim().substring(0, 100)}`);
        fileIssues++;
        totalIssues++;
      }
    }
  });

  if (fileIssues === 0) {
    // Check for jQuery imports
    if (code.includes('jquery-bridge')) {
      console.log(`  ${file}: HAS JQUERY IMPORT (no jQuery usage)`);
    }
  }
}

console.log(`\nTotal issues found: ${totalIssues}`);
