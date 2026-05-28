# Luckysheet jQuery 使用全面分析

> 基于 `src/` 目录的完整代码扫描，统计日期：2026-05-28

## 概览

| 指标 | 数值 |
|------|------|
| 使用 jQuery 的源文件数（不含 plugins） | ~95 |
| jQuery 相关调用总次数 | ~5,500+ |
| 涉及的 jQuery API 类别 | 9 大类 |
| 依赖的 jQuery 插件 | 4 个（spectrum、mousewheel、sPage、jquery-ui） |

---

## 1. DOM 选择

### 1.1 `$(selector)` — CSS 选择器查询

**使用次数**：~2,657 次（含 plugins 目录）

**使用文件列表**（按使用频次排序，Top 20）：

| 文件 | 次数 |
|------|------|
| `controllers/keyboard.js` | 131 |
| `controllers/resize.js` | 104 |
| `controllers/imageCtrl.js` | 102 |
| `controllers/searchReplace.js` | 85 |
| `controllers/postil.js` | 84 |
| `controllers/sheetBar.js` | 83 |
| `controllers/alternateformat/dialog.js` | 121 |
| `controllers/alternateformat/alternateformatObj.js` | 125 |
| `controllers/ifFormulaGenerator.js` | 117 |
| `controllers/freezen/scrollAdapt.js` | 155 |
| `controllers/filter/filterActions.js` | 53 |
| `controllers/handler/cellEventsSub/handleCellMousedown.js` | 49 |
| `global/formula/rangeSelect.js` | 47 |
| `global/tooltip.js` | 53 |
| `controllers/rowColumnOperation/rowHeaderEvents/initColHeaderEvents.js` | 59 |
| `controllers/rowColumnOperation/rowHeaderEvents/initRowHeaderEvents.js` | 54 |
| `controllers/rowColumnOperation/rowHeaderEvents/initResizeEvents.js` | 49 |
| `controllers/handler/documentMousemoveSub/mouseRender.js` | 51 |
| `global/api/sheet.js` | 30 |
| `controllers/handler/documentMouseup.js` | 42 |

**原生替代方案**：
- `$(selector)` → `document.querySelector(selector)` （单个元素）
- `$(selector)` → `document.querySelectorAll(selector)` （多个元素）
- `$(selector)` 后跟链式调用 → 需要封装轻量 DOM 辅助类

**迁移难度**：**中**

**特殊注意事项**：
- `$(selector)` 返回 jQuery 对象（类数组），不是 DOM 元素，需逐处确认是否需要 `[0]` 取原生元素
- 大量代码依赖 jQuery 的隐式迭代（对集合中所有元素执行操作），原生 API 需要显式循环
- `$(window)`、`$(document)`、`$("body")` 等特殊选择器需单独处理

### 1.2 `$(element)` — 包装原生 DOM 元素

**使用次数**：约 200+ 次（与 `$(selector)` 合并统计中）

**典型用法**：
```javascript
// 将原生事件对象中的 target 包装为 jQuery 对象
$(event.target).hasClass("luckysheet-mousedown-cancel")
$(event.target).closest(".luckysheet-input-box")
$(this).index()
$(this).parents(".parmBox")
```

**原生替代方案**：
- `$(element).hasClass(cls)` → `element.classList.contains(cls)`
- `$(element).closest(sel)` → `element.closest(sel)`
- 直接使用原生 DOM 元素，无需包装

**迁移难度**：**低**

### 1.3 `$(htmlString)` — 从 HTML 字符串创建元素

**使用次数**：约 5 次

**使用文件列表**：
- `global/formula/rangeSelect.js` — `$(function_str).insertAfter(...)`
- `controllers/selection/htmlTableBuilder.js` — 构建剪贴板 HTML
- `utils/dialogUtils.js` — 创建对话框 HTML

**原生替代方案**：
```javascript
// jQuery 方式
$(htmlString)

// 原生方式
function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}
```

**迁移难度**：**低**

---

## 2. DOM 操作

### 2.1 总览

| API | 使用次数 | 涉及文件数 |
|-----|---------|-----------|
| `.css()` | ~713 | 81 |
| `.append()` | ~120 | 40+ |
| `.html()` | ~80 | 30+ |
| `.show()` | ~60 | 25+ |
| `.hide()` | ~90 | 30+ |
| `.val()` | ~50 | 20+ |
| `.attr()` | ~100 | 35+ |
| `.addClass()` | ~60 | 25+ |
| `.removeClass()` | ~40 | 20+ |
| `.removeAttr()` | ~20 | 8 |
| `.text()` | ~15 | 10 |
| `.empty()` | ~10 | 8 |
| `.remove()` | ~30 | 15 |
| `.prepend()` | ~5 | 3 |
| `.prop()` | ~10 | 5 |
| `.toggleClass()` | ~3 | 2 |

### 2.2 `.css()` — 获取/设置样式

**使用次数**：~713 次（含 plugins，源码约 400+ 次）

**使用文件列表**（Top 15）：

| 文件 | 次数 |
|------|------|
| `controllers/conditionformat/dialog/index.js` | 48 |
| `controllers/freezen/scrollAdapt.js` | 20 |
| `controllers/handler/documentMouseup.js` | 20 |
| `controllers/resize.js` | 24 |
| `controllers/imageCtrl.js` | 18 |
| `controllers/handler/documentMousemove.js` | 18 |
| `global/tooltip.js` | 26 |
| `controllers/ifFormulaGenerator.js` | 24 |
| `controllers/updateCell.js` | 12 |
| `controllers/postil.js` | 15 |
| `controllers/filter/filterMenuEvents.js` | 11 |
| `controllers/alternateformat/alternateformatObj.js` | 12 |
| `controllers/alternateformat/dialog.js` | 12 |
| `utils/domUtils.js` | 11 |
| `controllers/handler/documentMousemoveSub/mouseRender.js` | 36 |

**典型用法**：
```javascript
// 设置单个样式
$("#luckysheet-input-box").css("top", top)

// 设置多个样式（对象形式）
$("#luckysheet-input-box").removeAttr("style").css({
    top: top,
    left: left,
    width: width,
    height: height
})

// 获取计算样式
parseInt($("#luckysheet-input-box").css("top"))
```

**原生替代方案**：
```javascript
// 设置单个样式
element.style.top = top

// 设置多个样式
Object.assign(element.style, { top, left, width, height })

// 获取计算样式
getComputedStyle(element).top
parseInt(getComputedStyle(element).top)
```

**迁移难度**：**低**

**特殊注意事项**：
- jQuery `.css()` 可自动处理驼峰/连字符命名转换（如 `font-size` ↔ `fontSize`），原生 API 使用 `style` 属性时需用驼峰命名
- jQuery `.css()` 获取样式时返回计算值，原生 `element.style.xxx` 只返回内联样式，需用 `getComputedStyle()` 获取计算值
- `parseInt($("#el").css("top"))` 模式在代码中频繁出现

### 2.3 `.append()` — 追加子元素

**使用次数**：~120 次

**使用文件列表**：
- `utils/dialogUtils.js` — `$("body").append(html)`
- `utils/domUtils.js` — `$("#luckysheet-cell-main").append(...)`
- `global/createdom.js` — 创建 DOM 结构
- `controllers/menuButton/toolbarInit/*.js` — 所有工具栏初始化
- `controllers/filter/createFilterOptions.js`
- `controllers/alternateformat/*.js`

**原生替代方案**：
```javascript
// jQuery
$("body").append(html)
$("#container").append(element)

// 原生
document.body.insertAdjacentHTML('beforeend', html)
container.appendChild(element)
container.append(element) // 支持字符串和 DOMString
```

**迁移难度**：**低**

### 2.4 `.show()` / `.hide()` — 显示/隐藏元素

**使用次数**：~150 次

**使用文件列表**：
- `utils/domUtils.js` — `showModalMask()` / `hideModalMask()`
- `controllers/menuButton/toolbarInit/*.js` — 工具栏菜单显示/隐藏
- `controllers/filter/*.js` — 筛选面板
- `controllers/searchReplace.js`
- `controllers/postil.js`

**原生替代方案**：
```javascript
// jQuery
$("#el").show()
$("#el").hide()

// 原生（简单方式）
element.style.display = ''     // show - 恢复默认
element.style.display = 'none' // hide

// 更安全的方式（记住原始 display 值）
element.hidden = true  // hide
element.hidden = false // show
```

**迁移难度**：**低**

**特殊注意事项**：
- jQuery `.show()` 会记住元素原来的 `display` 值，原生 `style.display = ''` 可恢复 CSS 定义的默认值，但可能不等于原始值
- 代码中大量使用 `$menuButton.hide()` / `$menuButton.show()` 模式控制菜单可见性

### 2.5 `.attr()` / `.removeAttr()` — 属性操作

**使用次数**：~120 次

**典型用法**：
```javascript
// 读取属性
$cur.attr("contenteditable")
$("#luckysheet-icon-text-color").attr("color")

// 设置属性
$("#luckysheet-icon-text-color").attr("color", color)
$icon.removeAttr("class").addClass(...)
```

**原生替代方案**：
```javascript
element.getAttribute('contenteditable')
element.setAttribute('color', color)
element.removeAttribute('style')
```

**迁移难度**：**低**

**特殊注意事项**：
- `.removeAttr("class").addClass(...)` 是常见的链式调用模式，需拆分为两步
- jQuery `.attr()` 对布尔属性（checked、disabled）的行为与 `.prop()` 不同，需注意区分

### 2.6 `.val()` — 获取/设置表单值

**使用次数**：~50 次

**使用文件列表**：
- `controllers/conditionformat/dialog/*.js` — 条件格式对话框输入
- `controllers/menuButton/toolbarInit/initTextColor.js`
- `controllers/menuButton/toolbarInit/initCellColor.js`
- `controllers/searchReplace.js`

**原生替代方案**：
```javascript
// jQuery
$("#input").val()
$("#input").val("new value")

// 原生
inputElement.value
inputElement.value = "new value"
```

**迁移难度**：**低**

### 2.7 `.addClass()` / `.removeClass()` / `.hasClass()` / `.toggleClass()`

**使用次数**：~160 次

**典型用法**：
```javascript
$(event.target).hasClass("luckysheet-mousedown-cancel")
$icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img ...")
$("#el").removeClass("on").addClass("on")
```

**原生替代方案**：
```javascript
element.classList.contains('className')
element.classList.add('class1', 'class2')
element.classList.remove('class1', 'class2')
element.classList.toggle('className')
```

**迁移难度**：**低**

### 2.8 `.html()` / `.text()`

**使用次数**：~95 次

**原生替代方案**：
```javascript
// jQuery
$("#el").html()     // → element.innerHTML
$("#el").html(str)  // → element.innerHTML = str
$("#el").text()     // → element.textContent
$("#el").text(str)  // → element.textContent = str
```

**迁移难度**：**低**

### 2.9 `.remove()` / `.empty()`

**使用次数**：~40 次

**原生替代方案**：
```javascript
element.remove()          // 对应 jQuery .remove()
element.innerHTML = ''    // 对应 jQuery .empty()
while (element.firstChild) element.removeChild(element.firstChild) // 更安全的 empty
```

**迁移难度**：**低**

---

## 3. 事件处理

### 3.1 总览

| API | 使用次数 | 涉及文件数 |
|-----|---------|-----------|
| `.on()` | ~200 | 60+ |
| `.off()` | ~30 | 15+ |
| `.click()` | ~80 | 30+ |
| `.mousedown()` | ~40 | 15+ |
| `.mouseup()` | ~30 | 10+ |
| `.mousemove()` | ~20 | 8 |
| `.keydown()` | ~25 | 10+ |
| `.keyup()` | ~10 | 5 |
| `.dblclick()` | ~5 | 3 |
| `.scroll()` | ~5 | 3 |
| `.bind()` / `.unbind()` | ~5 | 3 |
| `.trigger()` | ~5 | 3 |
| `.change()` | ~5 | 3 |
| `.focus()` / `.blur()` | ~5 | 3 |

### 3.2 `.on()` / `.off()` — 事件绑定/解绑

**使用次数**：~230 次

**使用文件列表**（Top 10）：

| 文件 | 次数 |
|------|------|
| `controllers/filter/filterCheckboxEvents.js` | 69 |
| `controllers/alternateformat/alternateformatObj.js` | 27 |
| `controllers/alternateformat/dialog.js` | 27 |
| `controllers/conditionformat/dialog/initRuleTypeEvents.js` | 42 |
| `controllers/conditionformat/dialog/initRangeAndCloseEvents.js` | 12 |
| `controllers/conditionformat/dialog/initAdminRuleEvents.js` | 14 |
| `controllers/insertFormula.js` | 41 |
| `controllers/inlineString.js` | 21 |
| `controllers/filter/filterActions.js` | 34 |
| `controllers/freezen/scrollAdapt.js` | 81 |

**典型用法**：
```javascript
// 基本绑定
$("#el").on("click", handler)

// 命名空间事件
$el.on("click.myNamespace", handler)
$el.off("click.myNamespace")

// 事件委托
$el.on("click", ".child-selector", handler)

// 多事件绑定
$el.on("mousedown mouseup", handler)
```

**原生替代方案**：
```javascript
// 基本绑定
element.addEventListener('click', handler)

// 命名空间事件 — 原生不支持，需自行实现
// 方案1：使用 AbortController
const controller = new AbortController();
element.addEventListener('click', handler, { signal: controller.signal });
controller.abort(); // 解绑

// 方案2：使用自定义事件管理器
// 方案3：记录 handler 引用，直接 removeEventListener

// 事件委托
element.addEventListener('click', (e) => {
  if (e.target.closest('.child-selector')) {
    handler(e);
  }
})
```

**迁移难度**：**中**

**特殊注意事项**：
- **命名空间事件** 是最大的迁移难点。代码中大量使用 `event.namespace` 模式（如 `click.conditionformat`），原生 API 不支持
- `utils/eventUtils.js` 已封装了 `bindNamespacedEvent` / `unbindNamespacedEvent`，迁移时需重新设计
- 事件委托模式 `$(parent).on(event, selector, handler)` 需改为 `parent.addEventListener` + `e.target.closest()`

### 3.3 快捷事件方法 `.click()` / `.mousedown()` 等

**使用次数**：~200 次

**原生替代方案**：
```javascript
// jQuery
$("#el").click(handler)

// 原生
element.addEventListener('click', handler)
```

**迁移难度**：**低**

### 3.4 `.trigger()` — 触发事件

**使用次数**：~5 次

**原生替代方案**：
```javascript
// jQuery
$("#el").trigger("click")

// 原生
element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
element.dispatchEvent(new CustomEvent('customEvent', { detail: data, bubbles: true }))
```

**迁移难度**：**低**

---

## 4. AJAX

### 4.1 总览

| API | 使用次数 | 涉及文件数 |
|-----|---------|-----------|
| `$.post()` | 13 | 6 |
| `$.ajax()` | 3 | 3 |
| `$.get()` | 0 | 0 |

### 4.2 使用文件列表

| 文件 | API | 用途 |
|------|-----|------|
| `core.js` | `$.post()` | 加载工作表数据 |
| `global/method.js` | `$.ajax()` / `$.post()` | 通用保存/加载方法 |
| `controllers/sheetmanage/sheetInit.js` | `$.post()` | 初始化加载工作表 |
| `controllers/sheetmanage/sheetSwitch.js` | `$.post()` | 切换工作表加载 |
| `controllers/menuButton/toolbarInit/initConditionformat.js` | `$.post()` | 条件格式远程数据 |
| `function/functionImplementation/localeCn.js` | `$.post()` × 6 | 股票数据接口 |
| `function/functionImplementation/dataMining.js` | `$.post()` × 3 | 数据挖掘接口 |
| `demoData/getTargetData.js` | `$.ajax()` | 演示数据加载 |

**原生替代方案**：
```javascript
// jQuery
$.post(url, data, callback)
$.ajax({ url, method: 'POST', data, success, error })

// 原生 fetch
async function post(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data)
  });
  return response.json();
}
```

**迁移难度**：**低**

**特殊注意事项**：
- `$.post()` 默认使用 `application/x-www-form-urlencoded` 格式，`fetch` 需手动设置
- `localeCn.js` 中的股票接口调用是业务逻辑，可能需要保留或重构为独立服务
- 需注意回调到 Promise/async-await 的转换

---

## 5. 工具函数

### 5.1 总览

| API | 使用次数 | 涉及文件数 |
|-----|---------|-----------|
| `$.extend()` | 376 | 76 |
| `$.inArray()` | 2 | 1 |
| `$.each()` | 1 | 1 |
| `$.trim()` | 0 | 0 |
| `$.isArray()` | 0 | 0 |
| `$.isFunction()` | 0 | 0 |
| `$.isNumeric()` | 2 | 1 |
| `$.isEmptyObject()` | 0 | 0 |
| `$.isPlainObject()` | 0 | 0 |
| `$.type()` | 0 | 0 |

### 5.2 `$.extend()` — 对象合并/深拷贝

**使用次数**：376 次（最频繁使用的 jQuery 工具函数）

**使用文件列表**（Top 15）：

| 文件 | 次数 |
|------|------|
| `global/refresh/refreshCore.js` | 25 |
| `global/refresh/refreshOperation.js` | 13 |
| `global/formula/dependency.js` | 21 |
| `global/formula/formulaParser.js` | 17 |
| `global/formula/formulaString.js` | 9 |
| `global/extend/deleteTable.js` | 9 |
| `global/extend/extendTable.js` | 7 |
| `controllers/dropCell/fillStrategy.js` | 13 |
| `controllers/controlHistory.js` | 12 |
| `controllers/alternateformat/alternateformatObj.js` | 11 |
| `global/extend/deleteCell.js` | 7 |
| `global/api/rangeOperation.js` | 24 |
| `controllers/selection/clipboardCutPaste.js` | 17 |
| `controllers/handler/documentMouseup.js` | 15 |
| `global/api/workbook.js` | 6 |

**典型用法**：
```javascript
// 深拷贝对象
let cfg = $.extend(true, {}, Store.config)

// 深拷贝数组
let cdformat = $.extend(true, [], file.luckysheet_conditionformat_save)

// 深拷贝并合并
let fileH = $.extend(true, [], Store.luckysheetfile)
```

**原生替代方案**：
```javascript
// 浅拷贝
Object.assign({}, source)

// 深拷贝（现代浏览器）
structuredClone(source)

// 深拷贝（兼容方案）
JSON.parse(JSON.stringify(source))  // 不支持函数、undefined、循环引用

// 自定义 deepMerge 函数（支持函数等特殊值）
function deepMerge(target, ...sources) { ... }
```

**迁移难度**：**中**

**特殊注意事项**：
- `$.extend(true, {}, obj)` 是代码中最常见的深拷贝模式，占 `$.extend` 使用的 90%+
- `structuredClone()` 是最佳替代方案，但不支持函数和 DOM 节点
- 部分场景中 `$.extend` 用于合并配置对象，需区分深拷贝和浅合并
- `$.extend(true, [], array)` 对数组的深拷贝需确认是否可用 `structuredClone` 替代

### 5.3 `$.inArray()` — 数组查找

**使用次数**：2 次

**使用文件**：
- `controllers/conditionformat/computeSub/computeDefault.js`

**原生替代方案**：
```javascript
// jQuery
$.inArray(value, array) > -1

// 原生
array.indexOf(value) > -1
array.includes(value)  // 更语义化
```

**迁移难度**：**低**

### 5.4 `$.each()` — 遍历

**使用次数**：1 次

**使用文件**：
- `controllers/freezen/scrollAdapt.js`

**原生替代方案**：
```javascript
// jQuery
$.each(array, function(index, value) { ... })

// 原生
array.forEach((value, index) => { ... })
for (const [index, value] of array.entries()) { ... }
```

**迁移难度**：**低**

### 5.5 `$.isNumeric()` — 数值判断

**使用次数**：2 次

**使用文件**：
- `controllers/conditionformat/computeSub/computeDefault.js`

**原生替代方案**：
```javascript
// jQuery
$.isNumeric(value)

// 原生
function isNumeric(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}
// 或
Number.isFinite(Number(value))
```

**迁移难度**：**低**

---

## 6. 动画

### 6.1 总览

| API | 使用次数 | 涉及文件数 |
|-----|---------|-----------|
| `.fadeIn()` | 2 | 1 |
| `.fadeOut()` | 2 | 2 |
| `.slideUp()` | 2 | 1 |
| `.slideDown()` | 1 | 1 |

### 6.2 使用文件列表

| 文件 | API | 用途 |
|------|-----|------|
| `global/tooltip.js` | `.fadeIn()` / `.fadeOut()` | 弹出提示框动画 |
| `controllers/menuButton/paintFormat.js` | `.fadeOut()` | 格式刷提示消失 |
| `controllers/filter/filterMenuEvents.js` | `.slideUp()` / `.slideDown()` | 筛选菜单折叠/展开 |

**原生替代方案**：
```javascript
// fadeIn
element.style.opacity = '0';
element.style.display = '';
element.style.transition = 'opacity 300ms';
requestAnimationFrame(() => element.style.opacity = '1');

// fadeOut
element.style.transition = 'opacity 300ms';
element.style.opacity = '0';
element.addEventListener('transitionend', () => element.style.display = 'none', { once: true });

// slideDown
element.style.height = '0';
element.style.overflow = 'hidden';
element.style.display = '';
element.style.transition = 'height 200ms';
element.style.height = element.scrollHeight + 'px';

// slideUp
element.style.transition = 'height 200ms';
element.style.height = '0';
element.addEventListener('transitionend', () => element.style.display = 'none', { once: true });
```

**迁移难度**：**低**

**特殊注意事项**：
- 动画使用量极少，可考虑使用 CSS 动画类替代
- `.fadeOut()` 的回调函数模式需改为 `transitionend` 事件监听

---

## 7. jQuery UI

### 7.1 总览

| API | 使用次数 | 涉及文件数 |
|-----|---------|-----------|
| `.draggable()` | 0 | 0 |
| `.resizable()` | 0 | 0 |
| `.sortable()` | 0 | 0 |
| `.dialog()` | 0 | 0 |

**说明**：jQuery UI 库（`plugins/js/jquery-ui.min.js`）虽然被引入，但在业务代码中**未直接使用** `.draggable()`、`.resizable()`、`.sortable()`、`.dialog()` 等 jQuery UI 组件方法。jQuery UI 主要作为 spectrum 插件的依赖存在。

**迁移难度**：**低**（仅需移除依赖，无需替换功能）

**特殊注意事项**：
- 移除 jQuery UI 后，需确认 spectrum 插件是否仍能正常工作
- 如果 spectrum 被替换为无 jQuery 依赖的方案，jQuery UI 可完全移除

---

## 8. Spectrum 颜色选择器

### 8.1 总览

| API | 使用次数 | 涉及文件数 |
|-----|---------|-----------|
| `.spectrum({options})` — 初始化 | 10 | 7 |
| `.spectrum("get")` — 获取颜色 | 14 | 5 |
| `.spectrum("set", color)` — 设置颜色 | 9 | 3 |

### 8.2 使用文件列表

| 文件 | 初始化 | get | set | 用途 |
|------|--------|-----|-----|------|
| `controllers/menuButton/toolbarInit/initTextColor.js` | 1 | 0 | 2 | 文字颜色选择 |
| `controllers/menuButton/toolbarInit/initCellColor.js` | 1 | 0 | 2 | 单元格背景色选择 |
| `controllers/menuButton/toolbarInit/initBorder.js` | 1 | 0 | 1 | 边框颜色选择 |
| `controllers/sheetBar.js` | 1 | 0 | 1 | 工作表标签颜色 |
| `controllers/imageCtrl.js` | 1 | 0 | 0 | 图片边框颜色 |
| `controllers/alternateformat/alternateformatObj.js` | 1 | 0 | 0 | 交替格式颜色 |
| `controllers/alternateformat/dialog.js` | 1 | 0 | 0 | 交替格式对话框颜色 |
| `controllers/conditionformat/dialog/index.js` | 1 | 4 | 0 | 条件格式颜色初始化 |
| `controllers/conditionformat/dialog/initConditionDialogEvents.js` | 0 | 2 | 0 | 条件格式获取颜色 |
| `controllers/conditionformat/dialog/initNewRuleEvents.js` | 0 | 5 | 0 | 新建规则获取颜色 |
| `controllers/conditionformat/dialog/initEditRuleEvents.js` | 0 | 4 | 0 | 编辑规则获取颜色 |

### 8.3 初始化配置模式

所有 spectrum 实例使用高度一致的配置：

```javascript
$(".luckysheet-color-selected").spectrum({
    showPalette: true,
    showPaletteOnly: true,
    preferredFormat: "hex",
    clickoutFiresChange: false,
    showInitial: true,
    showInput: true,
    flat: true,           // 部分使用
    hideAfterPaletteSelect: true,
    showSelectionPalette: true,
    maxPaletteSize: 8,
    maxSelectionSize: 8,
    cancelText: locale_button.cancel,
    chooseText: locale_button.confirm,
    togglePaletteMoreText: locale_toolbar.customColor,
    togglePaletteLessText: locale_toolbar.collapse,
    togglePaletteOnly: true,
    clearText: locale_toolbar.clearText,
    noColorSelectedText: locale_toolbar.noColorSelectedText,
    localStorageKey: "spectrum.textcolor" + gridKey,
    palette: [/* 标准 8x8 色板 */],
    change: function(color) {
        color = color.toHexString();
        // 更新 UI 和数据
    }
});
```

**迁移难度**：**高**

**特殊注意事项**：
- spectrum 是 jQuery 插件，强依赖 jQuery 和 jQuery UI
- 所有颜色选择器共享相同的色板配置
- 使用了 `localStorageKey` 实现用户自定义颜色持久化
- `change` 回调中的 `color.toHexString()` / `color.toRgbString()` 是 spectrum 特有 API
- 需要替换为无 jQuery 依赖的颜色选择器组件

---

## 9. 其他 jQuery 插件

### 9.1 jQuery Mousewheel

**使用次数**：5 次

**使用文件**：
- `controllers/handler/scroll.js` — 5 处

**典型用法**：
```javascript
$("#luckysheet-sheet-container-c").mousewheel(function(event, delta) {
    let scrollNum = event.deltaFactor < 40 ? 1 : event.deltaFactor < 80 ? 2 : 3;
    let scrollLeft = $(this).scrollLeft();
    // ... 滚动逻辑
    event.preventDefault();
});
```

**原生替代方案**：
```javascript
element.addEventListener('wheel', (event) => {
    event.preventDefault();
    const delta = -event.deltaY;
    // ... 滚动逻辑
}, { passive: false });
```

**迁移难度**：**低**

**特殊注意事项**：
- jQuery mousewheel 的 `delta` 参数与原生 `wheel` 事件的 `deltaY` 方向相反
- `event.deltaFactor` 在原生 API 中没有对应，需根据 `deltaMode` 计算
- 原生 `wheel` 事件已得到所有现代浏览器支持

### 9.2 jQuery sPage 分页插件

**使用次数**：1 次

**使用文件**：
- `global/api/util.js` — `pagerInit()` 函数

**典型用法**：
```javascript
$("#luckysheet-bottom-pager").sPage({
    page: config.pageIndex,
    total: config.total,
    pageSize: config.pageSize,
    showTotal: config.showTotal,
    showSkip: config.showSkip,
    showPN: config.showPN,
    prevPage: prevPage,
    nextPage: nextPage,
    totalTxt: total + config.total,
    backFun: function(page) {
        page.pageIndex = page.page;
        method.createHookFunction("onTogglePager", page);
    }
});
```

**原生替代方案**：
- 自定义轻量分页组件
- 或使用无依赖的分页库

**迁移难度**：**中**

---

## 10. jQuery 遍历/筛选方法

### 10.1 总览

| API | 使用次数 | 涉及文件数 |
|-----|---------|-----------|
| `.find()` | ~300 | 60+ |
| `.closest()` | ~30 | 15+ |
| `.parent()` / `.parents()` | ~50 | 20+ |
| `.children()` | ~20 | 10+ |
| `.siblings()` | ~15 | 8 |
| `.next()` / `.prev()` | ~10 | 5 |
| `.index()` | 12 | 8 |
| `.is()` | ~30 | 15+ |
| `.hasClass()` | ~30 | 15+ |
| `.filter()` | ~15 | 8 |
| `.first()` / `.last()` | ~5 | 3 |
| `.eq()` | ~3 | 2 |

### 10.2 `.find()` — 后代查找

**使用次数**：~300 次

**原生替代方案**：
```javascript
// jQuery
$(parent).find(".child")

// 原生
parent.querySelector(".child")      // 单个
parent.querySelectorAll(".child")   // 多个
```

**迁移难度**：**低**

### 10.3 `.closest()` — 向上查找最近祖先

**使用次数**：~30 次

**原生替代方案**：
```javascript
// jQuery
$(element).closest(".parent-class")

// 原生
element.closest(".parent-class")  // 所有现代浏览器支持
```

**迁移难度**：**低**

### 10.4 `.is()` — 匹配检测

**使用次数**：~30 次

**典型用法**：
```javascript
// 伪类选择器检测
$("#el").is(":visible")
$("#el").is(":checked")
$("#el").is(":selected")

// 类名检测
$(event.target).hasClass("className")
```

**原生替代方案**：
```javascript
// :visible
element.offsetHeight > 0 || element.offsetWidth > 0
// 或
element.checkVisibility()

// :checked
element.checked

// :selected
element.selected

// 类名
element.matches('.className')
element.classList.contains('className')
```

**迁移难度**：**中**

**特殊注意事项**：
- `.is(":visible")` 在代码中使用频繁（~20 次），需封装为工具函数
- `.is(":checked")` 和 `.is(":selected")` 可直接用属性检测

### 10.5 `.index()` — 获取元素索引

**使用次数**：12 次

**使用文件列表**：
- `controllers/conditionformat/dialog/initNewRuleEvents.js`
- `controllers/conditionformat/dialog/initEditRuleEvents.js`
- `controllers/conditionformat/dialog/initRuleTypeEvents.js`
- `controllers/rowColumnOperation/rowHeaderEvents/initRowHeaderEvents.js`
- `controllers/rowColumnOperation/rowHeaderEvents/initColHeaderEvents.js`
- `controllers/handler/cellEventsSub/handleCellMousedown.js`
- `controllers/alternateformat/alternateformatObj.js`
- `controllers/alternateformat/dialog.js`
- `global/formula/functionSearch.js`
- `global/formula/formulaBar.js`
- `controllers/insertFormula.js`

**原生替代方案**：
```javascript
// jQuery
$(element).index()

// 原生
Array.from(element.parentElement.children).indexOf(element)
// 或
[...element.parentElement.children].indexOf(element)
```

**迁移难度**：**低**

---

## 11. 尺寸/位置方法

### 11.1 总览

| API | 使用次数 | 涉及文件数 |
|-----|---------|-----------|
| `.width()` / `.height()` | ~80 | 30+ |
| `.scrollTop()` / `.scrollLeft()` | ~60 | 20+ |
| `.offset()` | ~20 | 10+ |
| `.outerWidth()` / `.outerHeight()` | ~15 | 8 |
| `.innerWidth()` / `.innerHeight()` | ~5 | 3 |
| `.position()` | ~3 | 2 |

### 11.2 `.width()` / `.height()`

**原生替代方案**：
```javascript
// jQuery
$(el).width()   // content width
$(el).height()  // content height

// 原生
el.clientWidth   // content + padding (类似 innerWidth)
el.clientHeight
el.offsetWidth   // content + padding + border (类似 outerWidth)
el.offsetHeight
el.getBoundingClientRect().width  // 精确浮点宽度
el.getBoundingClientRect().height
```

**迁移难度**：**中**

**特殊注意事项**：
- jQuery `.width()` 返回 content 宽度（不含 padding/border），原生没有直接对应
- `el.clientWidth` 包含 padding，不完全等价
- 需要逐处确认使用场景，选择合适的原生 API

### 11.3 `.scrollTop()` / `.scrollLeft()`

**原生替代方案**：
```javascript
// jQuery — 获取
$(el).scrollTop()
$(el).scrollLeft()

// 原生 — 获取
el.scrollTop
el.scrollLeft

// jQuery — 设置
$(el).scrollTop(value)
$(el).scrollLeft(value)

// 原生 — 设置
el.scrollTop = value
el.scrollLeft = value
```

**迁移难度**：**低**

### 11.4 `.offset()`

**原生替代方案**：
```javascript
// jQuery
$(el).offset()  // → { top, left } 相对于文档

// 原生
el.getBoundingClientRect()  // → { top, left, ... } 相对于视口
// 相对于文档需加上滚动偏移
{
  top: el.getBoundingClientRect().top + window.scrollY,
  left: el.getBoundingClientRect().left + window.scrollX
}
```

**迁移难度**：**低**

---

## 12. 迁移优先级建议

### 第一阶段（低难度，高收益）
1. **`$.extend()` → `structuredClone()` / 自定义 `deepMerge`** — 使用最频繁，替换后可大幅减少 jQuery 依赖
2. **`.css()` → `element.style`** — 使用最频繁的 DOM 操作
3. **`.show()` / `.hide()` → `element.style.display`** — 简单直接
4. **`.val()` / `.html()` / `.text()` → 原生属性** — 一对一映射
5. **`.addClass()` / `.removeClass()` / `.hasClass()` → `classList`** — 一对一映射
6. **`.attr()` / `.removeAttr()` → `getAttribute` / `setAttribute`** — 一对一映射

### 第二阶段（中难度）
7. **`.on()` / `.off()` → `addEventListener` / `removeEventListener`** — 需处理命名空间和事件委托
8. **`.find()` / `.closest()` / `.parent()` → 原生 DOM 遍历** — 需处理返回值差异
9. **`.width()` / `.height()` / `.offset()` → 原生尺寸 API** — 需注意语义差异
10. **`$.post()` / `$.ajax()` → `fetch()`** — 需处理回调到 Promise 的转换
11. **`.is(":visible")` → 自定义可见性检测** — 需封装工具函数

### 第三阶段（高难度）
12. **Spectrum 颜色选择器替换** — 需选择替代组件并适配 API
13. **jQuery mousewheel → 原生 wheel 事件** — 需处理 delta 方向差异
14. **jQuery sPage → 自定义分页组件** — 需重新实现
15. **移除 jQuery/jQuery UI 依赖** — 最终目标
