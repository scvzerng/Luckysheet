# jQuery 对象特性与迁移陷阱

> ⚠️ **关键文档** — 本文档记录了所有 jQuery 对象的特殊行为，这些是迁移过程中最容易引入 Bug 的地方。

---

## 1. jQuery 对象 vs 原生 DOM 元素

### 1.1 核心问题

`$(selector)` 返回的是 **jQuery 对象**（类数组），而不是 DOM 元素。这是迁移中最常见的 Bug 来源。

```javascript
// jQuery 对象是类数组
const $el = $("#myElement");
console.log($el.length);     // 1
console.log($el[0]);         // 原生 DOM 元素
console.log($el.get(0));     // 原生 DOM 元素（同上）

// 错误：将 jQuery 对象当作 DOM 元素使用
$el.addEventListener("click", handler);  // ❌ TypeError
$el[0].addEventListener("click", handler); // ✅
```

### 1.2 代码库中的具体实例

#### 实例1：`utils/domUtils.js` — 返回 jQuery 对象

```javascript
// 当前代码
export function getScrollPosition() {
    let cellMain = $("#luckysheet-cell-main");  // 返回 jQuery 对象
    return {
        scrollTop: cellMain.scrollTop(),   // jQuery 方法
        scrollLeft: cellMain.scrollLeft()  // jQuery 方法
    };
}
```

**迁移方案**：

```typescript
export function getScrollPosition() {
    const cellMain = document.querySelector("#luckysheet-cell-main") as HTMLElement;
    return {
        scrollTop: cellMain.scrollTop,   // 原生属性
        scrollLeft: cellMain.scrollLeft  // 原生属性
    };
}
```

#### 实例2：`utils/dialogUtils.js` — 返回 jQuery 对象给调用者

```javascript
// 当前代码
export function createDialog(options) {
    // ...
    $("body").append(html);
    return $("#" + options.id);  // 返回 jQuery 对象！
}
```

**问题**：调用者可能将返回值当作 DOM 元素或 jQuery 对象使用，需要检查所有调用点。

**迁移方案**：

```typescript
export function createDialog(options: DialogOptions): HTMLElement {
    document.body.insertAdjacentHTML('beforeend', html);
    return document.querySelector(`#${options.id}`)!;  // 返回原生元素
}
```

#### 实例3：`utils/eventUtils.js` — 接受 string 或 jQuery 对象

```javascript
// 当前代码
export function bindNamespacedEvent(selector, event, namespace, handler, filter) {
    let $el = (typeof selector === 'string') ? $(selector) : selector;  // 可能传入 jQuery 对象
    let eventStr = event + "." + namespace;
    $el.off(eventStr);
    if (filter) {
        $el.on(eventStr, filter, handler);
    } else {
        $el.on(eventStr, handler);
    }
}
```

**迁移方案**：

```typescript
type EventTargetLike = string | Element | HTMLElement;

export function bindNamespacedEvent(
    target: EventTargetLike,
    event: string,
    namespace: string,
    handler: EventListener,
    filter?: string
): void {
    const element = typeof target === 'string'
        ? document.querySelector(target)!
        : target;
    // 使用 AbortController 管理命名空间事件
    // ...
}
```

#### 实例4：`[0]` 访问模式 — 代码库中约 83 处

| 文件 | 代码 | 说明 |
|------|------|------|
| `controllers/postil.js` | `$("#luckysheet-postil-show_...")[0]` | 获取原生元素 |
| `controllers/resize.js` | `$("#luckysheet-cell-main")[0]` | 获取原生元素 |
| `controllers/updateCell.js` | `$("#luckysheet-input-box")[0]` | 获取原生元素 |
| `controllers/imageCtrl.js` | `$("#luckysheet-modal-dialog-activeImage")[0]` | 获取原生元素 |
| `global/draw/drawTitle.js` | `$("#luckysheet-rows-h")[0]` | 获取 canvas 上下文 |
| `global/draw/drawMain.js` | `$("#luckysheetTableContent")[0]` | 获取 canvas 上下文 |
| `controllers/freezen/scrollAdapt.js` | `$("#luckysheet-cell-main")[0]` | 获取原生元素 |
| `controllers/formulaBar.js` | `$("#luckysheet-rich-text-editor")[0]` | 获取原生元素 |

**迁移方案**：所有 `[0]` 访问替换为 `document.querySelector()` 直接获取原生元素。

---

## 2. jQuery 集合方法 vs 原生方法

### 2.1 `.each()` — 回调参数顺序不同

```javascript
// jQuery .each() — (index, element)
$(".item").each(function(index, element) {
    console.log(index, element);
});

// 原生 forEach — (element, index)
document.querySelectorAll(".item").forEach((element, index) => {
    console.log(index, element);
});
```

**代码库中的具体实例**：

| 文件 | 代码 |
|------|------|
| `controllers/freezen/scrollAdapt.js:409` | `$.each(images, function(i) { ... })` |
| `controllers/filter/filterCheckboxEvents.js` | 多处 `.each(function(index, e) { ... })` |
| `controllers/alternateformat/alternateformatObj.js` | `.each(function() { ... })` |

**迁移注意**：
- jQuery `.each()` 中 `this` 指向当前元素，原生 `forEach` 中无 `this`
- jQuery `.each()` 中 `element` 是原生 DOM 元素，不是 jQuery 对象
- jQuery `.each()` 返回原始 jQuery 对象（支持链式调用），`forEach` 返回 `undefined`

### 2.2 `.map()` — 返回类型不同

```javascript
// jQuery .map() — 返回 jQuery 对象
const result = $(".item").map(function(index, element) {
    return element.id;
});
// result 是 jQuery 对象，需用 .get() 转为数组
const arr = result.get();

// 原生 .map() — 返回数组
const arr = Array.from(document.querySelectorAll(".item")).map((element, index) => {
    return element.id;
});
```

### 2.3 `.filter()` — 返回类型不同

```javascript
// jQuery .filter() — 返回 jQuery 对象
const $filtered = $(".item").filter(".active");
$filtered.addClass("highlight");  // 可以继续链式调用

// 原生 .filter() — 返回数组
const filtered = Array.from(document.querySelectorAll(".item"))
    .filter(el => el.classList.contains("active"));
filtered.forEach(el => el.classList.add("highlight"));
```

---

## 3. `$.extend(true, [], obj)` 深拷贝

### 3.1 核心问题

`$.extend()` 是代码库中使用最频繁的 jQuery 工具函数（376 次），其中 90%+ 是深拷贝模式。

```javascript
// 最常见模式：深拷贝对象
let cfg = $.extend(true, {}, Store.config);

// 深拷贝数组
let cdformat = $.extend(true, [], file.luckysheet_conditionformat_save);

// 深拷贝并合并
let fileH = $.extend(true, [], Store.luckysheetfile);
```

### 3.2 代码库中的具体实例

| 文件 | 代码 | 用途 |
|------|------|------|
| `controllers/dropCell/core/index.js:36` | `$.extend(true, {}, Store.config)` | 深拷贝配置 |
| `controllers/dropCell/core/index.js:284` | `$.extend(true, [], file[...])` | 深拷贝条件格式 |
| `global/api/conditionFormat.js:181-492` | `$.extend(true, [], Store.luckysheetfile)` | 深拷贝文件列表（7处） |
| `global/refresh/refreshOperation.js:78-87` | `$.extend(true, {}, Store.config)` 等 | 深拷贝保存操作数据 |
| `global/sort.js:219,310` | `$.extend(true, {}, Store.config)` | 深拷贝配置 |
| `controllers/controlHistory.js` | `$.extend(true, {}, ...)` | 深拷贝历史状态（12处） |
| `global/refresh/refreshCore.js` | `$.extend(true, {}, ...)` | 深拷贝核心刷新数据（25处） |
| `global/formula/dependency.js` | `$.extend(true, [], ...)` | 深拷贝公式依赖（21处） |
| `global/formula/formulaParser.js` | `$.extend(true, [], ...)` | 深拷贝公式解析器（17处） |
| `controllers/selection/clipboardCutPaste.js` | `$.extend(true, [], ...)` | 深拷贝剪贴板数据（17处） |
| `global/api/rangeOperation.js` | `$.extend(true, [], ...)` | 深拷贝范围操作数据（24处） |

### 3.3 `$.extend` 的特殊行为

```javascript
// 1. 深拷贝时，数组会被完全替换，不是合并
$.extend(true, { arr: [1, 2, 3] }, { arr: [4, 5] })
// 结果: { arr: [4, 5] }  — 不是 [4, 5, 3]

// 2. 深拷贝时，对象会被递归合并
$.extend(true, { a: { x: 1, y: 2 } }, { a: { x: 10 } })
// 结果: { a: { x: 10, y: 2 } }  — y 被保留

// 3. null 和 undefined 会被覆盖
$.extend(true, { a: 1 }, { a: null })
// 结果: { a: null }

// 4. 函数引用会被保留（不克隆）
const fn = () => {};
$.extend(true, { fn }, { fn: null })
// 结果: { fn: null }
```

### 3.4 迁移方案

```typescript
// 方案1：structuredClone（推荐，覆盖 95% 场景）
const clone = structuredClone(original);

// 方案2：JSON 序列化（不支持函数、undefined、循环引用）
const clone = JSON.parse(JSON.stringify(original));

// 方案3：自定义 deepMerge（支持函数等特殊值）
function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target };
  for (const source of sources) {
    for (const key of Object.keys(source) as (keyof T)[]) {
      const sourceVal = source[key];
      const targetVal = result[key];

      if (
        sourceVal !== null &&
        typeof sourceVal === 'object' &&
        !Array.isArray(sourceVal) &&
        targetVal !== null &&
        typeof targetVal === 'object' &&
        !Array.isArray(targetVal)
      ) {
        result[key] = deepMerge(
          { ...targetVal } as any,
          sourceVal as any
        );
      } else if (Array.isArray(sourceVal)) {
        (result as any)[key] = structuredClone(sourceVal);
      } else {
        (result as any)[key] = sourceVal;
      }
    }
  }
  return result;
}
```

### 3.5 迁移注意事项

| 场景 | `$.extend` 行为 | `structuredClone` 行为 | 是否兼容 |
|------|-----------------|----------------------|---------|
| 深拷贝纯对象 | ✅ | ✅ | ✅ |
| 深拷贝数组 | ✅ | ✅ | ✅ |
| 深拷贝嵌套对象 | ✅ 递归合并 | ❌ 完全替换 | ⚠️ 需注意 |
| 包含函数 | ✅ 保留引用 | ❌ 抛出错误 | ❌ 不兼容 |
| 包含 undefined | ✅ 保留 | ❌ 忽略（JSON） | ⚠️ 需注意 |
| 循环引用 | ✅ 处理 | ❌ 抛出错误 | ❌ 不兼容 |
| DOM 节点 | ✅ 保留引用 | ❌ 抛出错误 | ❌ 不兼容 |

**关键**：代码中 `$.extend(true, {}, Store.config)` 等用法拷贝的是纯数据对象（配置、状态），不含函数或 DOM 节点，`structuredClone` 可以安全替代。但需逐处确认。

---

## 4. jQuery 事件对象 vs 原生事件对象

### 4.1 差异对照表

| 属性/方法 | jQuery Event | 原生 Event | 说明 |
|----------|-------------|-----------|------|
| `event.target` | ✅ | ✅ | 相同 |
| `event.currentTarget` | ✅ | ✅ | 相同 |
| `event.preventDefault()` | ✅ | ✅ | 相同 |
| `event.stopPropagation()` | ✅ | ✅ | 相同 |
| `event.stopImmediatePropagation()` | ✅ | ✅ | 相同 |
| `event.type` | ✅ | ✅ | 相同 |
| `event.which` | ✅ | ❌ | jQuery 标准化的按键码 |
| `event.keyCode` | ✅ (已废弃) | ✅ (已废弃) | 使用 `event.key` 替代 |
| `event.pageX` | ✅ | ✅ | 相同 |
| `event.pageY` | ✅ | ✅ | 相同 |
| `event.metaKey` | ✅ | ✅ | 相同 |
| `event.delegateTarget` | ✅ | ❌ | 委托元素 |
| `event.namespace` | ✅ | ❌ | 命名空间 |
| `event.data` | ✅ | ❌ | 附加数据 |
| `event.isDefaultPrevented()` | ✅ | ❌ | 使用 `event.defaultPrevented` |
| `event.isPropagationStopped()` | ✅ | ❌ | 无直接对应 |
| `event.originalEvent` | ✅ | ❌ | 原生事件 |
| `event.result` | ✅ | ❌ | 上一个处理器返回值 |

### 4.2 `event.which` 迁移

```javascript
// jQuery — event.which 标准化了 keyCode 和 charCode
if (event.which === 13) { ... }  // Enter
if (event.which === 27) { ... }  // Escape
if (event.which === 9)  { ... }  // Tab

// 原生 — 使用 event.key（推荐）
if (event.key === 'Enter') { ... }
if (event.key === 'Escape') { ... }
if (event.key === 'Tab') { ... }

// 或使用 event.code（物理键位，不受输入法影响）
if (event.code === 'Enter') { ... }
```

**代码库中的具体实例**：

`controllers/keyboard.js` 中大量使用 `event.which` 和 `keycode` 常量：

```javascript
// 当前代码
if (kcode != keycode.ENTER && kcode != keycode.TAB && ...)
```

**迁移方案**：

```typescript
// 使用 key 常量
if (event.key !== 'Enter' && event.key !== 'Tab' && ...)
```

### 4.3 `event.delegateTarget` 迁移

```javascript
// jQuery 事件委托
$(parent).on("click", ".child", function(event) {
    console.log(event.delegateTarget);  // 指向 parent
});

// 原生 — 通过闭包或 event.currentTarget
parent.addEventListener("click", (event) => {
    const target = event.target.closest(".child");
    if (target && parent.contains(target)) {
        // parent 就是 delegateTarget
        handler.call(target, event);
    }
});
```

### 4.4 `event.data` 迁移

```javascript
// jQuery — 通过 event.data 传递数据
$(".item").on("click", { index: i }, function(event) {
    console.log(event.data.index);
});

// 原生 — 通过闭包传递
items.forEach((item, i) => {
    item.addEventListener("click", (event) => {
        console.log(i);
    });
});
```

---

## 5. `$(htmlString)` 创建 DOM 元素

### 5.1 核心问题

jQuery 可以从 HTML 字符串直接创建 DOM 元素，原生 API 需要使用 `template` 或 `innerHTML`。

```javascript
// jQuery
const $el = $('<div class="my-class"><span>text</span></div>');
$el.appendTo("body");

// 原生 — 使用 template（推荐，不会触发图片加载等副作用）
function createElementFromHTML(html: string): Element {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild as Element;
}

// 原生 — 使用 innerHTML（简单但可能有副作用）
function createElementFromHTML(html: string): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstElementChild as HTMLElement;
}
```

### 5.2 代码库中的具体实例

| 文件 | 代码 | 说明 |
|------|------|------|
| `global/formula/rangeSelect.js:287` | `$(function_str).insertAfter(...)` | 从 HTML 字符串创建公式元素 |
| `utils/dialogUtils.js` | `$("body").append(html)` | 创建对话框 HTML |
| `controllers/menuButton/toolbarInit/*.js` | `$("body").append(menu)` | 创建工具栏菜单 HTML |

**迁移方案**：

```typescript
// dialogUtils.js 迁移
export function createDialog(options: DialogOptions): HTMLElement {
    let html = modelHTML;
    for (const key in options) {
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), options[key]);
    }
    document.body.insertAdjacentHTML('beforeend', html);
    return document.querySelector(`#${options.id}`)!;
}

// rangeSelect.js 迁移
const el = createElementFromHTML(function_str);
target.after(el);
```

---

## 6. 链式调用模式

### 6.1 核心问题

jQuery 方法返回 jQuery 对象，支持链式调用。原生 DOM 方法通常返回 `undefined` 或其他值，不支持链式。

```javascript
// jQuery 链式调用
$("#el")
    .addClass("active")
    .css("color", "red")
    .show()
    .on("click", handler);

// 原生 — 需要拆分为独立语句
const el = document.querySelector("#el")!;
el.classList.add("active");
el.style.color = "red";
el.style.display = '';
el.addEventListener("click", handler);
```

### 6.2 代码库中的链式调用实例

#### 实例1：`removeAttr("class").addClass(...)` 模式

```javascript
// 当前代码 — 约 20 处
$icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-" + itemvalue + iconfontObject[itemvalue]);
```

**迁移方案**：

```typescript
icon.removeAttribute("class");
icon.classList.add(
    "luckysheet-icon-img-container",
    "luckysheet-icon-img",
    `luckysheet-icon-align-${itemvalue}${iconfontObject[itemvalue]}`
);
```

**涉及文件**：
- `controllers/menuButton/toolbarInit/initAlign.js:59`
- `controllers/menuButton/toolbarInit/initBorder.js:287`
- `controllers/menuButton/toolbarInit/initRotation.js:65`
- `controllers/menuButton/toolbarInit/initTextWrap.js:51`
- `controllers/menuButton/toolbarInit/initValign.js:59`

#### 实例2：`removeAttr("style").css({...})` 模式

```javascript
// 当前代码 — 约 20 处
$("#luckysheet-input-box").removeAttr("style").css({
    top: top,
    left: left,
    width: width,
    height: height
});
```

**迁移方案**：

```typescript
const inputBox = document.querySelector("#luckysheet-input-box") as HTMLElement;
inputBox.removeAttribute("style");
Object.assign(inputBox.style, {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`
});
```

**涉及文件**：
- `controllers/sheetBar.js` — 8 处
- `controllers/updateCell.js:77`
- `controllers/controlHistory.js` — 3 处
- `utils/domUtils.js:42`

#### 实例3：`.css({...}).fadeIn()` 模式

```javascript
// 当前代码
$("#luckysheetpopover").css(pcss).fadeIn();
```

**迁移方案**：

```typescript
const popover = document.querySelector("#luckysheetpopover") as HTMLElement;
Object.assign(popover.style, pcss);
fadeIn(popover);
```

**涉及文件**：
- `global/tooltip.js:241`

### 6.3 链式调用迁移策略

1. **逐行拆分**：将链式调用拆分为独立语句（最安全，推荐）
2. **使用 Dom 辅助类**：保留链式调用风格（见 02-dom-replacement.md）
3. **混合策略**：简单操作直接拆分，复杂操作使用辅助类

---

## 7. `$(document).ready()` → `DOMContentLoaded`

### 7.1 差异

```javascript
// jQuery
$(document).ready(function() { ... });
$(function() { ... });

// 原生
document.addEventListener('DOMContentLoaded', () => { ... });

// 如果 DOM 已加载完成
if (document.readyState !== 'loading') {
    // 直接执行
} else {
    document.addEventListener('DOMContentLoaded', handler);
}
```

### 7.2 代码库中的实例

| 文件 | 代码 |
|------|------|
| `global/formula/rangeSelect.js:287` | `$(function_str).insertAfter(...)` — 不是 `$(document).ready`，而是从 HTML 创建元素 |

**注意**：代码库中仅 1 处使用 `$(function(){})` 语法，且实际是创建元素而非 ready 回调。`$(document).ready()` 在代码库中未使用。

---

## 8. `$.proxy()` → `Function.prototype.bind()`

### 8.1 差异

```javascript
// jQuery
$.proxy(fn, context)
$.proxy(context, "methodName")

// 原生
fn.bind(context)
context.methodName.bind(context)
```

### 8.2 代码库中的实例

代码库中未使用 `$.proxy()`，无需迁移。

---

## 9. `.is()` 伪选择器

### 9.1 核心问题

jQuery 的 `.is()` 方法支持 CSS 伪选择器（如 `:visible`、`:checked`、`:selected`），原生 `element.matches()` 不支持。

```javascript
// jQuery
$("#el").is(":visible")    // ✅ 支持
$("#el").is(":checked")    // ✅ 支持
$("#el").is(":selected")   // ✅ 支持
$("#el").is(":hidden")     // ✅ 支持
$("#el").is(":first-child") // ✅ 支持（标准 CSS 选择器）

// 原生
element.matches(":visible")    // ❌ 不支持
element.matches(":checked")    // ❌ 不支持（非标准 CSS）
element.matches(":first-child") // ✅ 支持（标准 CSS 选择器）
```

### 9.2 代码库中的具体实例

#### `:visible` 伪选择器（~20 处）

| 文件 | 代码 |
|------|------|
| `utils/domUtils.js:54` | `$("#luckysheet-modal-dialog-mask").is(":visible")` |
| `utils/domUtils.js:58` | `$("#luckysheet-modal-dialog-activeImage").is(":visible")` |
| `utils/domUtils.js:62` | `$("#luckysheet-singleRange-dialog").is(":visible")` |
| `controllers/keyboard.js:38` | `$("#luckysheet-formula-search-c").is(":visible")` |
| `controllers/keyboard.js:60` | `$("#luckysheet-formula-functionrange-select").is(":visible")` |
| `controllers/keyboard.js:279` | `$("#luckysheet-modal-dialog-mask").is(":visible")` |
| `controllers/keyboard.js:324` | `$("#luckysheet-modal-dialog-mask").is(":visible")` |
| `controllers/keyboard.js:338` | `$("#luckysheet-formula-search-c").is(":visible")` |
| `controllers/keyboard.js:353` | `$("#luckysheet-search-formula-parm").is(":visible")` |
| `controllers/keyboard.js:357` | `$("#luckysheet-search-formula-parm-select").is(":visible")` |
| `controllers/keyboard.js:391` | `$("#luckysheet-conditionformat-dialog").is(":visible")` |
| `controllers/keyboard.js:394` | `$("#luckysheet-cell-selected").is(":visible")` |
| `controllers/keyboard.js:820-844` | `$("#luckysheet-singleRange-dialog").is(":visible")` 等 |

**迁移方案**：

```typescript
// 封装可见性检测工具函数
function isVisible(el: HTMLElement): boolean {
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
}

// 或使用现代 API（Chrome 105+）
function isVisible(el: Element): boolean {
    return el.checkVisibility({
        checkOpacity: true,
        checkVisibilityCSS: true,
    });
}

// 使用示例
// jQuery: if ($("#luckysheet-modal-dialog-mask").is(":visible"))
// 原生:
const mask = document.querySelector("#luckysheet-modal-dialog-mask") as HTMLElement;
if (isVisible(mask)) { ... }
```

#### `:checked` 伪选择器（~10 处）

| 文件 | 代码 |
|------|------|
| `controllers/conditionformat/dialog/initConditionDialogEvents.js:86` | `$("#checkTextColor").is(":checked")` |
| `controllers/conditionformat/dialog/initConditionDialogEvents.js:92` | `$("#checkCellColor").is(":checked")` |
| `controllers/conditionformat/dialog/initNewRuleEvents.js:195,201` | `$("#checkTextColor").is(":checked")` |
| `controllers/conditionformat/dialog/initEditRuleEvents.js:192,198` | `$("#checkTextColor").is(":checked")` |
| `controllers/filter/filterColorEvents.js:171` | `$(e).find("input[type='checkbox']").is(":checked")` |

**迁移方案**：

```typescript
// jQuery
if ($("#checkTextColor").is(":checked"))

// 原生
if ((document.querySelector("#checkTextColor") as HTMLInputElement).checked)
```

#### `:selected` 伪选择器（~4 处）

| 文件 | 代码 |
|------|------|
| `controllers/conditionformat/dialog/initNewRuleEvents.js:147,153` | `$("#isPercent").is(":selected")` |
| `controllers/conditionformat/dialog/initEditRuleEvents.js:143,149` | `$("#isPercent").is(":selected")` |

**迁移方案**：

```typescript
// jQuery
if ($("#isPercent").is(":selected"))

// 原生
if ((document.querySelector("#isPercent") as HTMLOptionElement).selected)
```

---

## 10. `.removeAttr("style")` 特殊行为

### 10.1 核心问题

jQuery `.removeAttr("style")` 会移除整个 `style` 属性，等同于 `element.removeAttribute("style")`。但代码中经常紧跟 `.css({...})` 重新设置样式，这种模式需要特别注意。

```javascript
// jQuery — 先清除所有内联样式，再设置新样式
$("#luckysheet-input-box").removeAttr("style").css({
    top: top + "px",
    left: left + "px"
});

// 原生 — 等价写法
const el = document.querySelector("#luckysheet-input-box") as HTMLElement;
el.removeAttribute("style");
el.style.top = `${top}px`;
el.style.left = `${left}px`;
```

### 10.2 代码库中的高频模式

`$("#luckysheet-input-box").removeAttr("style")` 在代码库中出现约 15 次：

| 文件 | 行号 |
|------|------|
| `controllers/sheetBar.js` | 142, 346, 352, 361, 370, 394, 399, 414, 426, 524 |
| `utils/domUtils.js` | 42 |
| `controllers/updateCell.js` | 77 |
| `controllers/controlHistory.js` | 277, 295, 575 |

**迁移建议**：封装为工具函数

```typescript
function resetElementStyle(el: HTMLElement, styles: Record<string, string>): void {
    el.removeAttribute("style");
    Object.assign(el.style, styles);
}

// 使用
resetElementStyle(inputBox, {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
});
```

---

## 11. 隐式迭代

### 11.1 核心问题

jQuery 方法会自动对集合中的所有元素执行操作（隐式迭代），原生 API 需要显式循环。

```javascript
// jQuery — 隐式迭代
$(".item").addClass("active");  // 所有 .item 都添加 active 类
$(".item").css("color", "red"); // 所有 .item 都设置颜色

// 原生 — 需要显式循环
document.querySelectorAll(".item").forEach(el => {
    el.classList.add("active");
});
document.querySelectorAll(".item").forEach((el) => {
    (el as HTMLElement).style.color = "red";
});
```

### 11.2 代码库中的实例

```javascript
// controllers/filter/filterCheckboxEvents.js — 对多个元素操作
$(e).find("input[type='checkbox']").each(function() {
    if ($(this).is(":checked")) { ... }
});

// 迁移后
e.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    if ((checkbox as HTMLInputElement).checked) { ... }
});
```

---

## 12. jQuery `$(this)` 在事件处理器中

### 12.1 核心问题

在 jQuery 事件处理器中，`this` 指向当前 DOM 元素，`$(this)` 将其包装为 jQuery 对象。在原生 `addEventListener` 中，`this` 同样指向当前元素，但箭头函数中 `this` 不会绑定。

```javascript
// jQuery
$(".item").click(function() {
    $(this).addClass("active");  // this 是 DOM 元素
    let index = $(this).index();
});

// 原生 — 普通函数
document.querySelectorAll(".item").forEach(item => {
    item.addEventListener("click", function() {
        this.classList.add("active");  // this 是 DOM 元素
        let index = Array.from(this.parentElement!.children).indexOf(this);
    });
});

// 原生 — 箭头函数（注意 this 不同！）
document.querySelectorAll(".item").forEach(item => {
    item.addEventListener("click", (e) => {
        e.currentTarget.classList.add("active");  // 不能用 this
        // 或
        item.classList.add("active");  // 通过闭包引用
    });
});
```

### 12.2 代码库中的实例

| 文件 | 代码 | 说明 |
|------|------|------|
| `controllers/alternateformat/alternateformatObj.js:219` | `let index = $(this).index()` | 获取当前元素索引 |
| `controllers/alternateformat/dialog.js:215` | `let index = $(this).index()` | 获取当前元素索引 |
| `controllers/conditionformat/dialog/initRuleTypeEvents.js:7` | `let index = $(this).index()` | 获取当前元素索引 |
| `controllers/insertFormula.js:67,129` | `$(this).parents(".parmBox").index()` | 获取父元素索引 |
| `controllers/handler/globalEvents.js:97` | `if ($(this).hasClass("disabled"))` | 检测当前元素类名 |

**迁移方案**：

```typescript
// $(this).index() → 使用事件委托
parent.addEventListener("click", (e) => {
    const target = e.target.closest("[data-rule-type]");
    if (!target) return;
    const index = Array.from(parent.children).indexOf(target);
});

// $(this).hasClass("disabled") →
element.addEventListener("click", function() {
    if (this.classList.contains("disabled")) return;
});
```

---

## 13. `.closest()` 返回空集合 vs `null`

### 13.1 核心问题

```javascript
// jQuery — .closest() 返回 jQuery 对象（可能为空集合）
const $result = $(element).closest(".parent");
if ($result.length > 0) { ... }  // 检查是否找到
$result.addClass("found");  // 空集合也不会报错（隐式迭代）

// 原生 — .closest() 返回 Element 或 null
const result = element.closest(".parent");
if (result !== null) { ... }  // 检查是否找到
result?.classList.add("found");  // 必须做 null 检查
```

### 13.2 代码库中的实例

```javascript
// controllers/keyboard.js:279
$(event.target).closest(".luckysheet-input-box").length > 0

// 迁移后
event.target.closest(".luckysheet-input-box") !== null
```

**关键差异**：jQuery 空集合操作不会报错，原生 `null` 操作会抛出 TypeError。迁移时必须添加 null 检查。

---

## 14. 完整迁移检查清单

### 14.1 必须检查的模式

- [ ] `$(selector)` 返回值是否被当作 DOM 元素使用
- [ ] `$(selector)[0]` 或 `.get(0)` 是否需要替换为 `querySelector`
- [ ] `.each(function(index, element))` 参数顺序是否正确
- [ ] `.map()` 返回值是否需要 `.get()` 转换
- [ ] `$.extend(true, {}, obj)` 是否包含函数/DOM 节点
- [ ] `event.which` 是否替换为 `event.key`
- [ ] `$(htmlString)` 是否替换为 `createElementFromHTML`
- [ ] 链式调用是否拆分为独立语句
- [ ] `.is(":visible")` 是否替换为 `isVisible()` 函数
- [ ] `.is(":checked")` 是否替换为 `.checked` 属性
- [ ] `.removeAttr("style").css({...})` 是否拆分为两步
- [ ] 隐式迭代是否替换为显式 `forEach`
- [ ] `$(this)` 是否替换为 `this` 或 `e.currentTarget`
- [ ] `.closest()` 返回值是否做了 null 检查
- [ ] jQuery 空集合操作是否替换为 null 安全操作
- [ ] `$(document).ready()` 是否替换为 `DOMContentLoaded`
- [ ] `$.proxy()` 是否替换为 `.bind()`
- [ ] 事件命名空间是否使用 `AbortController` 管理
- [ ] 事件委托是否使用 `e.target.closest()` 模式
- [ ] `event.delegateTarget` 是否有替代方案
- [ ] `event.data` 是否通过闭包传递

### 14.2 高风险文件

以下文件 jQuery 使用密度最高，迁移时需格外注意：

| 文件 | jQuery 调用数 | 风险等级 | 主要关注点 |
|------|-------------|---------|-----------|
| `controllers/keyboard.js` | 131 | 🔴 极高 | `:visible` 检测、`event.which`、`$(this)` |
| `controllers/resize.js` | 104 | 🔴 极高 | 链式调用、尺寸方法、`[0]` 访问 |
| `controllers/imageCtrl.js` | 102 | 🔴 极高 | 链式调用、spectrum、尺寸方法 |
| `controllers/searchReplace.js` | 85 | 🟡 高 | DOM 操作、事件绑定 |
| `controllers/postil.js` | 84 | 🟡 高 | `[0]` 访问、DOM 操作 |
| `controllers/sheetBar.js` | 83 | 🟡 高 | `removeAttr("style")` 链式调用 |
| `controllers/freezen/scrollAdapt.js` | 155 | 🔴 极高 | `$.extend`、DOM 操作、滚动方法 |
| `controllers/alternateformat/alternateformatObj.js` | 125 | 🟡 高 | `$.extend`、spectrum、DOM 操作 |
| `controllers/alternateformat/dialog.js` | 121 | 🟡 高 | `$.extend`、spectrum、DOM 操作 |
| `controllers/ifFormulaGenerator.js` | 117 | 🟡 高 | DOM 遍历、事件绑定 |
| `controllers/filter/filterActions.js` | 53 | 🟡 高 | `$.extend`、DOM 操作 |
| `controllers/filter/filterCheckboxEvents.js` | ~80 | 🟡 高 | `.each()`、`:checked`、事件委托 |
| `global/refresh/refreshCore.js` | ~25 | 🟡 高 | `$.extend` 深拷贝 |
| `global/formula/dependency.js` | ~21 | 🟡 高 | `$.extend` 深拷贝 |
