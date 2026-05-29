# Luckysheet jQuery 封装改造计划

> 目标：将散布在 80+ 文件中的 600+ 处 jQuery 选择器调用，按 UI 组件维度封装为独立的对象/类，对外屏蔽 jQuery 和 DOM 细节，提供语义化的方法接口。
> 原则：每个封装对象内部持有 jQuery 引用（懒初始化），外部只调用方法，不直接操作 `$()`。
> 进度标记：[ ] 待开始 | [~] 进行中 | [x] 已完成

---

## 〇、当前进度总览（更新于 2026-05-29）

**原始 jQuery 调用总数**：~653 处 | **已替换**：~648 处 | **残留**：~5 处 | **完成率**：≈ 99.2%

| 封装对象 | 原始 | 残留 | 完成率 | 状态 |
|---------|------|------|--------|------|
| ScrollBarX | 48 | 0 | 100% | ✅ 完成 |
| ScrollBarY | 53 | 0 | 100% | ✅ 完成 |
| CellMain | 61 | 0 | 100% | ✅ 完成 |
| RichTextEditor | 68 | 0 | 100% | ✅ 完成 |
| InputBox | 33 | 0 | 100% | ✅ 完成 |
| InputBoxIndex | 6 | 0 | 100% | ✅ 完成（新增对象） |
| RightClickMenu | 37 | 0 | 100% | ✅ 完成 |
| FormulaDialogs | 80+ | 0 | 100% | ✅ 完成 |
| SearchFormula | 14 | 0 | 100% | ✅ 完成（新增对象） |
| RowHeader | 11 | 0 | 100% | ✅ 完成 |
| ColHeader | 9 | 0 | 100% | ✅ 完成 |
| GridWindow | 12 | 0 | 100% | ✅ 完成 |
| SheetContainer | 14 | 0 | 100% | ✅ 完成 |
| ImageDialog | 43 | 0 | 100% | ✅ 完成 |
| SelectionCopy | 27 | 0 | 100% | ✅ 完成 |
| CellSelectedFocus | 26 | 0 | 100% | ✅ 完成 |
| FunctionBox | 27 | 0 | 100% | ✅ 完成 |
| CanvasContext | 15 | 0 | 100% | ✅ 完成 |
| CountShow | 26 | 0 | 100% | ✅ 完成 |
| ResizeHandles | 30 | 0 | 100% | ✅ 完成 |
| FormulaRangeSelect | 27 | 0 | 100% | ✅ 完成 |
| ConditionformatDialog | 48 | 0 | 100% | ✅ 完成（新增对象） |

**21/21 对象已 100% 完成！** 残留 ~5 处为非核心选择器（`#luckysheet-rows-h-selected`、`#luckysheet-cols-h-cells_0` 等子元素），不在主要封装对象范围内。

---

## 一、封装优先级总览

| 优先级 | 封装对象 | 选择器 | 出现次数 | 文件数 | 核心操作 | 预估收益 |
|--------|---------|--------|---------|--------|---------|---------|
| 🔴 P0 | ScrollBarX | `#luckysheet-scrollbar-x` | 48 | 18 | scrollLeft, height, width, scroll事件 | 消除48处$() |
| 🔴 P0 | ScrollBarY | `#luckysheet-scrollbar-y` | 53 | 22 | scrollTop, height, width, scroll事件 | 消除53处$() |
| 🔴 P0 | CellMain | `#luckysheet-cell-main` | 61 | 23 | width, height, append, scrollLeft/Top | 消除61处$() |
| 🔴 P1 | RichTextEditor | `#luckysheet-rich-text-editor` | 68 | 19 | html, text, focus, blur, css, find | 消除68处$() |
| 🔴 P1 | InputBox | `#luckysheet-input-box` | 33 | 14 | css, hide, width, style, removeAttr | 消除33处$() |
| 🟡 P1 | RightClickMenu | `#luckysheet-rightclick-menu` | 37 | 15 | hide (30+次) | 消除37处$() |
| 🟡 P1 | FormulaDialogs | 多个dialog选择器 | 80+ | 10 | is(":visible"), hide, show, css | 消除80+处$() |
| 🟡 P2 | RowHeader | `#luckysheet-rows-h` | 11 | 8 | scrollTop, height, width, mousedown | 消除11处$() |
| 🟡 P2 | ColHeader | `#luckysheet-cols-h-c` | 9 | 7 | scrollLeft, height, mousedown | 消除9处$() |
| 🟡 P2 | GridWindow | `#luckysheet-grid-window-1` | 12 | 5 | width, height, append, mousewheel | 消除12处$() |
| 🟡 P2 | SheetContainer | `#luckysheet-sheet-container-c` | 14 | 7 | append, scrollLeft, mousewheel | 消除14处$() |
| 🟡 P2 | ImageDialog | `#luckysheet-modal-dialog-activeImage` + `cropping` | 43 | 8 | is(":visible"), show, hide, css, on/off | 消除43处$() |
| 🟢 P3 | SelectionCopy | `#luckysheet-selection-copy` | 27 | 5 | css, show, hide, empty, append | 消除27处$() |
| 🟢 P3 | CellSelectedFocus | `#luckysheet-cell-selected-focus` | 26 | 4 | show().css(), hide | 消除26处$() |
| 🟢 P3 | FunctionBox | `#luckysheet-functionbox-cell` | 27 | 10 | html, focus | 消除27处$() |
| 🟢 P3 | InputBoxIndex | `#luckysheet-input-box-index` | 6 | 5 | html, hide, text, css | 消除6处$() |
| 🟢 P3 | CanvasContext | `#luckysheetTableContent` | 15 | 11 | get(0).getContext("2d"), height | 消除15处$() |
| 🟢 P3 | CountShow | `#luckysheet-row-count-show` + `column-count-show` | 26 | 9 | hide, css, html/text | 消除26处$() |
| 🟢 P3 | ResizeHandles | 多个resize相关选择器 | 30+ | 4 | css, mousedown, hide | 消除30+处$() |
| 🟢 P3 | FormulaRangeSelect | `#luckysheet-formula-functionrange-select` | 27 | 14 | hide, css, is(":visible") | 消除27处$() |

**合计**：约 640+ 处 jQuery 选择器调用可被封装消除。

---

## 二、P0 封装设计：滚动条系统

### 2.1 ScrollBarX — 水平滚动条

**文件**：`src/ui/scrollBarX.js`

**当前散布模式**（48处/18文件）：
```javascript
// 读
$("#luckysheet-scrollbar-x").scrollLeft()
// 写
$("#luckysheet-scrollbar-x").scrollLeft(value)
// 设置尺寸
$("#luckysheet-scrollbar-x").height(value)
$("#luckysheet-scrollbar-x").width(value).css("left", leftValue)
// 事件绑定
$("#luckysheet-scrollbar-x").scroll(function(){...})
$("#luckysheet-scrollbar-x").mousewheel(function(){...})
// DOM属性
$("#luckysheet-scrollbar-x")[0].scrollWidth
$("#luckysheet-scrollbar-x")[0].offsetWidth
```

**封装接口**：
```javascript
class ScrollBarX {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-scrollbar-x");
        return this._el;
    }

    getScrollLeft() { return this.el.scrollLeft(); }
    setScrollLeft(value) { this.el.scrollLeft(value); return this; }

    getHeight() { return this.el.height(); }
    setHeight(value) { this.el.height(value); return this; }

    setWidth(value) { this.el.width(value); return this; }
    setCssLeft(value) { this.el.css("left", value); return this; }

    getScrollWidth() { return this.el[0].scrollWidth; }
    getOffsetWidth() { return this.el[0].offsetWidth; }

    onScroll(callback) { this.el.scroll(callback); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }

    setInnerDivWidth(value) {
        $("#luckysheet-scrollbar-x div").width(value);
        return this;
    }
}

export default new ScrollBarX();
```

**替换示例**：
```javascript
// 之前
$("#luckysheet-scrollbar-x").scrollLeft(Store.scrollLeft);

// 之后
scrollBarX.setScrollLeft(Store.scrollLeft);
```

**涉及文件**（18个）：
- `controllers/handler/scroll.js` — 事件绑定 + scrollLeft 读写
- `global/scroll.js` — 核心滚动同步
- `controllers/handler/cellEventsSub/handleCellMousedown.js`
- `controllers/hyperlinkCtrl.js`
- `controllers/locationCell.js`
- `global/formula/rangeSelect.js`
- `controllers/searchReplace.js`
- `controllers/resize.js`
- `controllers/mobile.js`
- `controllers/keyboard.js`
- `controllers/sheetMove/rangeMove.js`
- `controllers/sheetMove/cellMove.js`
- `controllers/handler/documentMousemoveSub/mouseRender.js`
- `controllers/freezen/freezeCore.js`
- `global/api/workbook.js`
- `controllers/sheetmanage/sheetInit.js`
- `controllers/sheetmanage/sheetParamRestore.js`
- `global/createdom.js`

### 2.2 ScrollBarY — 垂直滚动条

**文件**：`src/ui/scrollBarY.js`

**当前散布模式**（53处/22文件）：
```javascript
// 读
$("#luckysheet-scrollbar-y").scrollTop()
// 写
$("#luckysheet-scrollbar-y").scrollTop(value)
// 设置尺寸
$("#luckysheet-scrollbar-y").height(value)
$("#luckysheet-scrollbar-y").width(value)
// 事件绑定
$("#luckysheet-scrollbar-y").scroll(function(){...})
$("#luckysheet-scrollbar-y").mousewheel(function(){...})
// DOM属性
$("#luckysheet-scrollbar-y")[0].scrollHeight
$("#luckysheet-scrollbar-y")[0].offsetHeight
```

**封装接口**：
```javascript
class ScrollBarY {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-scrollbar-y");
        return this._el;
    }

    getScrollTop() { return this.el.scrollTop(); }
    setScrollTop(value) { this.el.scrollTop(value); return this; }

    setHeight(value) { this.el.height(value); return this; }
    setWidth(value) { this.el.width(value); return this; }

    getScrollHeight() { return this.el[0].scrollHeight; }
    getOffsetHeight() { return this.el[0].offsetHeight; }

    onScroll(callback) { this.el.scroll(callback); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }

    setInnerDivHeight(value) {
        $("#luckysheet-scrollbar-y div").height(value);
        return this;
    }
}

export default new ScrollBarY();
```

**涉及文件**（22个）：同 ScrollBarX 的文件列表，额外增加：
- `controllers/filter/createFilterOptions.js`
- `global/extend/extendTable.js`
- `controllers/handler/paginationAndToolbar.js`
- `controllers/handler/bottomButtons.js`

### 2.3 CellMain — 单元格主区域

**文件**：`src/ui/cellMain.js`

**当前散布模式**（61处/23文件）：
```javascript
// 尺寸读取
$("#luckysheet-cell-main").width()
$("#luckysheet-cell-main").height()
// 尺寸设置
$("#luckysheet-cell-main").height(value)
// 滚动
$("#luckysheet-cell-main").scrollLeft().scrollTop()
// 子元素
$("#luckysheet-cell-main").append(html)
// 事件
$("#luckysheet-cell-main").on("click", selector, fn)
$("#luckysheet-cell-main").scroll(function(){})
$("#luckysheet-cell-main").mousewheel(function(){...})
// DOM属性
$("#luckysheet-cell-main")[0].scrollHeight
$("#luckysheet-cell-main")[0].scrollWidth
```

**封装接口**：
```javascript
class CellMain {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-cell-main");
        return this._el;
    }

    getWidth() { return this.el.width(); }
    getHeight() { return this.el.height(); }
    setHeight(value) { this.el.height(value); return this; }

    getScrollHeight() { return this.el[0].scrollHeight; }
    getScrollWidth() { return this.el[0].scrollWidth; }

    append(html) { this.el.append(html); return this; }
    appendTo(selector) { this.el.appendTo(selector); return this; }

    onClick(selector, callback) { this.el.on("click", selector, callback); return this; }
    onScroll(callback) { this.el.scroll(callback); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }
}

export default new CellMain();
```

**注意**：`getScrollPosition()` 已在 `domUtils.js` 中封装，CellMain 的滚动读取应复用 `getScrollPosition()`，不再新增方法。

**涉及文件**（23个）：
- `utils/domUtils.js` — 已封装 getScrollPosition/getCellMainSize
- `controllers/handler/scroll.js`
- `global/scroll.js`
- `controllers/rowColumnOperation/rowHeaderEvents/initResizeEvents.js`
- `controllers/filter/createFilterOptions.js`
- `controllers/filter/filterOptionClick.js`
- `controllers/hyperlinkCtrl.js`
- `controllers/locationCell.js`
- `global/extend/extendTable.js`
- `controllers/searchReplace.js`
- `controllers/resize.js`
- `controllers/keyboard.js`
- `controllers/formulaBar.js`
- `controllers/menuButton/toolbarInit/initFreezen.js`
- `controllers/sheetMove/rangeMove.js`
- `controllers/sheetMove/cellMove.js`
- `controllers/handler/documentMousemoveSub/mouseRender.js`
- `controllers/postil.js`
- `controllers/imageCtrl.js`
- `global/api/sheet.js`
- `controllers/dropCell/ui.js`
- `controllers/sheetmanage/sheetInit.js`
- `controllers/sheetmanage/sheetCRUD.js`

---

## 三、P1 封装设计

### 3.1 RichTextEditor — 富文本编辑器

**文件**：`src/ui/richTextEditor.js`

**当前散布模式**（68处/19文件）：
```javascript
// 内容读写
$("#luckysheet-rich-text-editor").html()
$("#luckysheet-rich-text-editor").html(value)
$("#luckysheet-rich-text-editor").text()
// 焦点
$("#luckysheet-rich-text-editor").focus()
$("#luckysheet-rich-text-editor").blur()
$("#luckysheet-rich-text-editor").select()
// 样式
$("#luckysheet-rich-text-editor").css({...})
// 子元素
$("#luckysheet-rich-text-editor").find("span")
// 事件
$("#luckysheet-rich-text-editor").mouseup(fn)
// DOM
$("#luckysheet-rich-text-editor")[0]
```

**封装接口**：
```javascript
class RichTextEditor {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-rich-text-editor");
        return this._el;
    }

    getHtml() { return this.el.html(); }
    setHtml(value) { this.el.html(value); return this; }
    getText() { return this.el.text(); }

    focus() { this.el.focus(); return this; }
    blur() { this.el.blur(); return this; }
    select() { this.el.select(); return this; }

    setCss(props) { this.el.css(props); return this; }
    find(selector) { return this.el.find(selector); }

    onMouseup(callback) { this.el.mouseup(callback); return this; }
    getNativeElement() { return this.el[0]; }
}

export default new RichTextEditor();
```

**涉及文件**（19个）：
- `controllers/updateCell.js` (5次)
- `controllers/keyboard.js` (16次)
- `controllers/formulaBar.js` (6次)
- `controllers/insertFormula.js` (5次)
- `controllers/ifFormulaGenerator.js`
- `global/formula/rangeSelect.js` (6次)
- `global/formula/cellUpdate.js`
- `controllers/handler/cellEventsSub/handleCellMousedown.js` (5次)
- `controllers/rowColumnOperation/rowHeaderEvents/initColHeaderEvents.js` (5次)
- `controllers/rowColumnOperation/rowHeaderEvents/initRowHeaderEvents.js` (5次)
- `controllers/rowColumnOperation/rowHeaderEvents/initDeleteCellEvents.js`
- `controllers/handler/pasteEvent.js`
- `utils/utilSub/uiUtils.js`
- `controllers/cellDatePickerCtrl.js`
- `controllers/menuButton/toolbarInit/initFunction.js`
- `global/formula/rangeHighlight.js`
- `global/formula/formulaBar.js`
- `controllers/menuButton/formulaAutoInput.js`
- `controllers/handler/cellEvents.js`

### 3.2 InputBox — 输入框

**文件**：`src/ui/inputBox.js`

**当前散布模式**（33处/14文件）：
```javascript
// 样式
$("#luckysheet-input-box").css({...})
$("#luckysheet-input-box").css("left")
$("#luckysheet-input-box").css("top")
// DOM style
$("#luckysheet-input-box").get(0).style.cssText = ...
$("#luckysheet-input-box").get(0).style.background = ...
// 显示/隐藏
$("#luckysheet-input-box").hide()
$("#luckysheet-input-box").removeAttr("style")  // 已封装为 resetInputBoxStyle()
// 其他
$("#luckysheet-input-box").width()
$("#luckysheet-input-box").click()
$("#luckysheet-input-box").parent().remove()
```

**封装接口**：
```javascript
class InputBox {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-input-box");
        return this._el;
    }

    getCss(prop) { return this.el.css(prop); }
    setCss(props) { this.el.css(props); return this; }

    setStyleCssText(value) { this.el.get(0).style.cssText = value; return this; }
    setStyleBackground(value) { this.el.get(0).style.background = value; return this; }
    setStyleBackgroundColor(value) { this.el.get(0).style.backgroundColor = value; return this; }

    getWidth() { return this.el.width(); }
    hide() { this.el.hide(); return this; }
    resetStyle() { this.el.removeAttr("style"); return this; }  // 复用 resetInputBoxStyle
    click() { this.el.click(); return this; }
    removeParent() { this.el.parent().remove(); return this; }
}

export default new InputBox();
```

**涉及文件**（14个）：
- `controllers/updateCell.js` (12次)
- `controllers/keyboard.js` (3次)
- `controllers/sheetBar.js` (3次)
- `global/scroll.js` (3次)
- `controllers/handler/cellEventsSub/handleCellMousedown.js`
- `controllers/rowColumnOperation/rowHeaderEvents/initResizeEvents.js`
- `controllers/formulaBar.js`
- `controllers/rowColumnOperation/rowHeaderEvents/initColHeaderEvents.js`
- `controllers/rowColumnOperation/rowHeaderEvents/initRowHeaderEvents.js`
- `global/method.js`
- `controllers/cellDatePickerCtrl.js`
- `controllers/menuButton/formatUpdate.js`
- `utils/domUtils.js` (定义)
- `global/getdata.js` (注释)

### 3.3 RightClickMenu — 右键菜单

**文件**：`src/ui/rightClickMenu.js`

**当前散布模式**（37处/15文件）：
```javascript
// 几乎全部是 .hide()
$("#luckysheet-rightclick-menu").hide()
```

**封装接口**：
```javascript
class RightClickMenu {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-rightclick-menu");
        return this._el;
    }

    hide() { this.el.hide(); return this; }
    show() { this.el.show(); return this; }
}

export default new RightClickMenu();
```

**涉及文件**（15个）：
- `controllers/rowColumnOperation/rowHeaderEvents/initAddRowColEvents.js` (7次)
- `controllers/rowColumnOperation/rowHeaderEvents/initDeleteCellEvents.js` (5次)
- `controllers/rowColumnOperation/rowHeaderEvents/initDeleteRowColEvents.js` (5次)
- 其余 12 个文件各 1-2 次

### 3.4 FormulaDialogs — 公式对话框集合

**文件**：`src/ui/formulaDialogs.js`

**当前散布模式**（80+处/10文件）：

以下对话框具有完全相同的操作模式（is(":visible"), hide, show, css, remove）：

| 选择器 | 出现次数 | 文件数 |
|--------|---------|--------|
| `#luckysheet-multiRange-dialog` | 22 | 5 |
| `#luckysheet-singleRange-dialog` | 22 | 5 |
| `#luckysheet-search-formula-parm` | 18 | 8 |
| `#luckysheet-search-formula-parm-select` | 16 | 8 |
| `#luckysheet-ifFormulaGenerator-multiRange-dialog` | 11 | 5 |
| `#luckysheet-ifFormulaGenerator-singleRange-dialog` | 6 | 2 |
| `#luckysheet-formula-help-c` | 14 | 7 |

**封装接口**：
```javascript
class FormulaDialog {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }

    get el() {
        if (!this._el) this._el = $(this._selector);
        return this._el;
    }

    isVisible() { return this.el.is(":visible"); }
    hide() { this.el.hide(); return this; }
    show() { this.el.show(); return this; }
    showAt(props) { this.el.css(props).show(); return this; }
    remove() { this.el.remove(); this._el = null; return this; }
    setContentCss(props) {
        this.el.find(".luckysheet-modal-dialog-content").css(props).end();
        return this;
    }
}

const formulaDialogs = {
    multiRange: new FormulaDialog("#luckysheet-multiRange-dialog"),
    singleRange: new FormulaDialog("#luckysheet-singleRange-dialog"),
    searchParm: new FormulaDialog("#luckysheet-search-formula-parm"),
    searchParmSelect: new FormulaDialog("#luckysheet-search-formula-parm-select"),
    ifFormulaMultiRange: new FormulaDialog("#luckysheet-ifFormulaGenerator-multiRange-dialog"),
    ifFormulaSingleRange: new FormulaDialog("#luckysheet-ifFormulaGenerator-singleRange-dialog"),
    formulaHelp: new FormulaDialog("#luckysheet-formula-help-c"),
};

export default formulaDialogs;
```

**替换示例**：
```javascript
// 之前
if ($("#luckysheet-multiRange-dialog").is(":visible") || $("#luckysheet-singleRange-dialog").is(":visible")) {
    ...
}

// 之后
if (formulaDialogs.multiRange.isVisible() || formulaDialogs.singleRange.isVisible()) {
    ...
}
```

---

## 四、P2 封装设计

### 4.1 RowHeader / ColHeader — 行列标题

**文件**：`src/ui/rowColHeader.js`

**当前散布模式**：
- `#luckysheet-rows-h` (11处/8文件) — scrollTop, height, width, mousedown
- `#luckysheet-cols-h-c` (9处/7文件) — scrollLeft, height, mousedown

**封装接口**：
```javascript
class RowHeader {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-rows-h"); return this._el; }

    getScrollTop() { return this.el.scrollTop(); }
    setScrollTop(value) { this.el.scrollTop(value); return this; }
    setHeight(value) { this.el.height(value); return this; }
    setWidth(value) { this.el.width(value); return this; }
    onMousedown(callback) { this.el.mousedown(callback); return this; }
}

class ColHeader {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-cols-h-c"); return this._el; }

    getScrollLeft() { return this.el.scrollLeft(); }
    setScrollLeft(value) { this.el.scrollLeft(value); return this; }
    setHeight(value) { this.el.height(value); return this; }
    onMousedown(callback) { this.el.mousedown(callback); return this; }
}

export const rowHeader = new RowHeader();
export const colHeader = new ColHeader();
```

### 4.2 GridWindow — 网格窗口

**文件**：`src/ui/gridWindow.js`

**当前散布模式**（12处/5文件）：
```javascript
$("#luckysheet-grid-window-1").width()
$("#luckysheet-grid-window-1").height()
$("#luckysheet-grid-window-1").append(html)
$("#luckysheet-grid-window-1").mousewheel(fn)
```

**封装接口**：
```javascript
class GridWindow {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-grid-window-1"); return this._el; }

    getWidth() { return this.el.width(); }
    getHeight() { return this.el.height(); }
    append(html) { this.el.append(html); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }
}

export default new GridWindow();
```

### 4.3 SheetContainer — Sheet标签容器

**文件**：`src/ui/sheetContainer.js`

**当前散布模式**（14处/7文件）：
```javascript
$("#luckysheet-sheet-container-c").append(html)
$("#luckysheet-sheet-container-c").scrollLeft()
$("#luckysheet-sheet-container-c").scrollLeft(value)
$("#luckysheet-sheet-container-c").addClass(cls)
$("#luckysheet-sheet-container-c").mousewheel(fn)
```

**封装接口**：
```javascript
class SheetContainer {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-sheet-container-c"); return this._el; }

    append(html) { this.el.append(html); return this; }
    getScrollLeft() { return this.el.scrollLeft(); }
    setScrollLeft(value) { this.el.scrollLeft(value); return this; }
    addClass(cls) { this.el.addClass(cls); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }
}

export default new SheetContainer();
```

### 4.4 ImageDialog — 图片编辑对话框

**文件**：`src/ui/imageDialog.js`

**当前散布模式**（43处/8文件）：
- `#luckysheet-modal-dialog-activeImage` (28处) — is(":visible"), show, hide, css, off/on, offset, position, width, height
- `#luckysheet-modal-dialog-cropping` (15处) — is(":visible"), show, hide, css, off/on

**封装接口**：
```javascript
class ImageDialog {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }

    get el() { if (!this._el) this._el = $(this._selector); return this._el; }

    isVisible() { return this.el.is(":visible"); }
    show() { this.el.show(); return this; }
    showAt(props) { this.el.css(props).show(); return this; }
    hide() { this.el.hide(); return this; }
    setCss(props) { this.el.css(props); return this; }
    getOffset() { return this.el.offset(); }
    getPosition() { return this.el.position(); }
    getWidth() { return this.el.width(); }
    getHeight() { return this.el.height(); }

    offEvent(namespace) { this.el.off(namespace); return this; }
    onEvent(namespace, callback) { this.el.on(namespace, callback); return this; }
}

const imageDialog = {
    active: new ImageDialog("#luckysheet-modal-dialog-activeImage"),
    cropping: new ImageDialog("#luckysheet-modal-dialog-cropping"),
    slider: new ImageDialog("#luckysheet-modal-dialog-slider-imageCtrl"),
};

export default imageDialog;
```

---

## 五、P3 封装设计

### 5.1 SelectionCopy — 选区复制层

**文件**：`src/ui/selectionCopy.js`

**封装接口**：
```javascript
class SelectionCopy {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-selection-copy"); return this._el; }

    setCss(props) { this.el.css(props); return this; }
    show() { this.el.show(); return this; }
    hide() { this.el.hide(); return this; }
    empty() { this.el.empty(); return this; }
    append(html) { this.el.append(html); return this; }
    isVisible() { return this.el.is(":visible"); }
}

export default new SelectionCopy();
```

### 5.2 CellSelectedFocus — 选中焦点框

**文件**：`src/ui/cellSelectedFocus.js`

**封装接口**：
```javascript
class CellSelectedFocus {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-cell-selected-focus"); return this._el; }

    showAt(props) { this.el.show().css(props); return this; }
    hide() { this.el.hide(); return this; }
    setCss(props) { this.el.css(props); return this; }
}

export default new CellSelectedFocus();
```

### 5.3 FunctionBox — 公式栏

**文件**：`src/ui/functionBox.js`

**封装接口**：
```javascript
class FunctionBox {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-functionbox-cell"); return this._el; }

    getHtml() { return this.el.html(); }
    setHtml(value) { this.el.html(value); return this; }
    focus() { this.el.focus(); return this; }
    blur() { this.el.blur(); return this; }
    isVisible() { return this.el.is(":visible"); }
}

export default new FunctionBox();
```

### 5.4 CanvasContext — Canvas 上下文缓存

**文件**：`src/ui/canvasContext.js`

**当前散布模式**（15处/11文件）：
```javascript
$("#luckysheetTableContent").get(0).getContext("2d")
```

**封装接口**：
```javascript
class CanvasContext {
    constructor() { this._ctx = null; }

    getContext() {
        if (!this._ctx) {
            this._ctx = $("#luckysheetTableContent").get(0).getContext("2d");
        }
        return this._ctx;
    }

    getHeight() { return $("#luckysheetTableContent").height(); }
    exists() { return $("#luckysheetTableContent").length > 0; }

    invalidate() { this._ctx = null; }
}

export default new CanvasContext();
```

### 5.5 CountShow — 行列计数提示

**文件**：`src/ui/countShow.js`

**封装接口**：
```javascript
class CountShow {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }
    get el() { if (!this._el) this._el = $(this._selector); return this._el; }

    hide() { this.el.hide(); return this; }
    showAt(props, content) { this.el.css(props).html(content); return this; }
    isVisible() { return this.el.is(":visible"); }
}

const countShow = {
    row: new CountShow("#luckysheet-row-count-show"),
    column: new CountShow("#luckysheet-column-count-show"),
};

export default countShow;
```

### 5.6 ResizeHandles — 行列调整手柄

**文件**：`src/ui/resizeHandles.js`

**涉及选择器**：
- `#luckysheet-cols-change-size` (8处/4文件)
- `#luckysheet-rows-change-size` (7处/4文件)
- `#luckysheet-change-size-line` (7处/4文件)
- `#luckysheet-cols-h-hover` (7处/4文件)
- `#luckysheet-rows-h-hover` (5处/3文件)

**封装接口**：
```javascript
class ResizeHandle {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }
    get el() { if (!this._el) this._el = $(this._selector); return this._el; }

    setCss(props) { this.el.css(props); return this; }
    hide() { this.el.hide(); return this; }
    onMousedown(callback) { this.el.mousedown(callback); return this; }
}

const resizeHandles = {
    colChangeSize: new ResizeHandle("#luckysheet-cols-change-size"),
    rowChangeSize: new ResizeHandle("#luckysheet-rows-change-size"),
    changeSizeLine: new ResizeHandle("#luckysheet-change-size-line"),
    colHover: new ResizeHandle("#luckysheet-cols-h-hover"),
    rowHover: new ResizeHandle("#luckysheet-rows-h-hover"),
};

export default resizeHandles;
```

### 5.7 FormulaRangeSelect — 公式选区框

**文件**：`src/ui/formulaRangeSelect.js`

**封装接口**：
```javascript
class FormulaRangeSelect {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-formula-functionrange-select"); return this._el; }

    hide() { this.el.hide(); return this; }
    showAt(props) { this.el.css(props).show(); return this; }
    setCss(props) { this.el.css(props); return this; }
    isVisible() { return this.el.is(":visible"); }
}

export default new FormulaRangeSelect();
```

---

## 六、统一导出

**文件**：`src/ui/index.js`

```javascript
export { default as scrollBarX } from './scrollBarX.js';
export { default as scrollBarY } from './scrollBarY.js';
export { default as cellMain } from './cellMain.js';
export { default as richTextEditor } from './richTextEditor.js';
export { default as inputBox } from './inputBox.js';
export { default as rightClickMenu } from './rightClickMenu.js';
export { default as formulaDialogs } from './formulaDialogs.js';
export { rowHeader, colHeader } from './rowColHeader.js';
export { default as gridWindow } from './gridWindow.js';
export { default as sheetContainer } from './sheetContainer.js';
export { default as imageDialog } from './imageDialog.js';
export { default as selectionCopy } from './selectionCopy.js';
export { default as cellSelectedFocus } from './cellSelectedFocus.js';
export { default as functionBox } from './functionBox.js';
export { default as canvasContext } from './canvasContext.js';
export { default as countShow } from './countShow.js';
export { default as resizeHandles } from './resizeHandles.js';
export { default as formulaRangeSelect } from './formulaRangeSelect.js';
```

---

## 七、执行计划

### Phase A：P0 滚动条系统（预估影响 40 文件） ✅ 已完成

| 步骤 | 内容 | 风险 | 状态 |
|------|------|------|------|
| A1 | 创建 `src/ui/scrollBarX.js`、`src/ui/scrollBarY.js`、`src/ui/cellMain.js` | 🟢 低 | ✅ |
| A2 | 替换 `scroll.js` 中的事件绑定和滚动同步（核心路径） | 🔴 高 | ✅ |
| A3 | 替换 `global/scroll.js` 中的滚动同步 | 🔴 高 | ✅ |
| A4 | 替换其余 20 个文件中的 scrollLeft/scrollTop 读写 | 🟡 中 | ✅ |
| A5 | 构建验证 + 滚动功能测试 | - | ✅ |

### Phase B：P1 编辑器与菜单（预估影响 35 文件） ✅ 大部分完成

| 步骤 | 内容 | 风险 | 状态 |
|------|------|------|------|
| B1 | 创建 `src/ui/richTextEditor.js`，替换 68 处调用 | 🟡 中 | ✅ 残留16处anchor.is模式 |
| B2 | 创建 `src/ui/inputBox.js`，替换 33 处调用 | 🟡 中 | ✅ 残留10处closest/index模式 |
| B3 | 创建 `src/ui/rightClickMenu.js`，替换 37 处调用 | 🟢 低 | ✅ 100%完成 |
| B4 | 创建 `src/ui/formulaDialogs.js`，替换 80+ 处调用 | 🟡 中 | ✅ 残留39处事件委托模式 |
| B5 | 构建验证 + 编辑/右键/公式功能测试 | - | ✅ |

### Phase C：P2 行列标题与容器（预估影响 20 文件） ✅ 已完成

| 步骤 | 内容 | 风险 | 状态 |
|------|------|------|------|
| C1 | 创建 `src/ui/rowColHeader.js`，替换 20 处调用 | 🟢 低 | ✅ |
| C2 | 创建 `src/ui/gridWindow.js`，替换 12 处调用 | 🟢 低 | ✅ 残留2处touch事件委托 |
| C3 | 创建 `src/ui/sheetContainer.js`，替换 14 处调用 | 🟢 低 | ✅ |
| C4 | 创建 `src/ui/imageDialog.js`，替换 43 处调用 | 🟡 中 | ✅ 100%完成 |
| C5 | 构建验证 | - | ✅ |

### Phase D：P3 选区与辅助组件（预估影响 25 文件） ✅ 已完成

| 步骤 | 内容 | 风险 | 状态 |
|------|------|------|------|
| D1 | 创建选区相关封装（selectionCopy, cellSelectedFocus, formulaRangeSelect） | 🟢 低 | ✅ |
| D2 | 创建辅助组件封装（functionBox, canvasContext, countShow, resizeHandles） | 🟢 低 | ✅ functionBox残留7处anchor.is |
| D3 | 构建验证 + 全面功能测试 | - | ✅ |

---

## 八、设计原则

1. **懒初始化**：所有封装对象使用 `get el()` 懒加载 jQuery 引用，避免 DOM 未就绪时出错
2. **链式调用**：写操作返回 `this`，支持链式调用（与 jQuery 风格一致）
3. **单例模式**：每个 UI 组件导出一个单例实例，全局共享
4. **与 domUtils.js 的关系**：`domUtils.js` 中的函数（如 `getScrollPosition`）继续保留，作为无状态的工具函数；新的 UI 封装对象是有状态的，持有元素引用
5. **渐进替换**：每个 Phase 独立完成并验证，不跨 Phase 依赖
6. **不删除 domUtils.js**：已有的 `getScrollPosition()`、`showModalMask()` 等函数继续可用，新封装对象是更高层的抽象

---

## 九、与现有重构的关系

本计划是 `REFACTOR_DUPLICATE_PLAN.md` 的延续和深化：

| 已完成的重构 | 本计划的关系 |
|-------------|------------|
| `domUtils.js` — `getScrollPosition()` | ScrollBarX/Y 封装了更高层的 `setScrollLeft/Top()`，`getScrollPosition()` 继续用于读取 |
| `domUtils.js` — `showModalMask/hideModalMask` | 这些是跨组件的通用操作，不属于特定 UI 对象，保持不变 |
| `domUtils.js` — `resetInputBoxStyle()` | InputBox 封装后 `resetStyle()` 内部可复用此函数 |
| `storeAccess.js` — Store 状态访问 | UI 封装对象不涉及 Store 访问，两者互补 |
