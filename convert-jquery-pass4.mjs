import fs from 'fs';
import path from 'path';

const BASE = 'd:\\gitee\\Luckysheet\\src';

const files = [
  'controllers/resize.js',
  'controllers/sheetBar.js',
  'global/tooltip.js',
  'global/api/sheet.js',
  'controllers/menuButton/formatStatus.js',
  'controllers/rowColumnOperation/rowHeaderEvents/initColHeaderEvents.js',
  'controllers/rowColumnOperation/rowHeaderEvents/initRowHeaderEvents.js',
  'controllers/sheetmanage/sheetCRUD.js',
  'global/formula/rangeHighlight.js',
  'global/api/workbook.js',
  'controllers/handler/cellEventsSub/handleCellMousedown.js',
  'global/createdom.js',
  'controllers/selection/htmlTableBuilder.js',
  'utils/eventUtils.js',
  'controllers/filter/initialFilterHandler.js',
  'utils/utilSub/reactiveUtils.js',
];

function fixFile(filePath) {
  const fullPath = path.join(BASE, filePath);
  let code = fs.readFileSync(fullPath, 'utf-8');
  const original = code;

  // Fix .append(htmlString) → .insertAdjacentHTML('beforeend', htmlString) on DOM elements
  // document.getElementById("...").append(html) → .insertAdjacentHTML
  code = code.replace(
    /document\.getElementById\(([^)]+)\)\.append\(\s*([^)]+)\s*\)/g,
    (match, idArg, htmlArg) => {
      return `document.getElementById(${idArg}).insertAdjacentHTML('beforeend', ${htmlArg.trim()})`;
    }
  );

  // Fix .css("prop") getter → getComputedStyle(el).prop or el.style.prop
  // For inline style reads, use el.style.prop
  // For computed style reads, use getComputedStyle(el).prop
  // parseInt($input.css("top")) → parseInt(getComputedStyle($input).top)
  code = code.replace(
    /parseInt\(([^)]+?)\.css\(\s*"([^"]+)"\s*\)\)/g,
    (match, el, prop) => {
      const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return `parseInt(getComputedStyle(${el}).${camelProp})`;
    }
  );

  // .querySelector("...").css("prop") → getComputedStyle(el).prop
  code = code.replace(
    /(\w+)\.css\(\s*"([^"]+)"\s*\)/g,
    (match, el, prop) => {
      const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return `getComputedStyle(${el}).${camelProp}`;
    }
  );

  // Fix .removeAttribute("class").addClass("...") → .className = "..."
  code = code.replace(
    /\.removeAttribute\("class"\)\.classList\.add\(\s*"([^"]+)"\s*\)/g,
    (match, classes) => {
      return `.className = "${classes}"`;
    }
  );

  // Fix .is(selector) → .matches(selector) on DOM elements
  code = code.replace(
    /(\w+)\.is\(([^)]+)\)/g,
    (match, el, sel) => {
      return `${el}.matches(${sel})`;
    }
  );

  // Fix $("<canvas>").attr({...}) → document.createElement("canvas") with property assignment
  code = code.replace(
    /document\.querySelector\(\s*"<canvas>"\s*\)\.setAttribute\(\s*\{([^}]+)\}\s*\)/g,
    (match, props) => {
      return `Object.assign(document.createElement("canvas"), {${props}})`;
    }
  );

  // Fix .fadeIn() → .style.display = ''
  code = code.replace(/\.fadeIn\(\)/g, ".style.display = ''");

  // Fix font.append("<s>" + item + "</s>") → font.insertAdjacentHTML('beforeend', ...)
  code = code.replace(
    /(\w+)\.append\(\s*"<s>" \+ (\w+) \+ "<\/s>"\s*\)/g,
    (match, el, item) => {
      return `${el}.insertAdjacentHTML('beforeend', "<s>" + ${item} + "<\/s>")`;
    }
  );

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

console.log('\nDone!');
