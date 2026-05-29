# jQuery → 原生 JS 逐选择器迁移计划

> 核心原则：**不做封装，逐选择器直接等效替换**。
> 每个选择器的每次调用都列出精确的原生 JS 等效代码。
> 进度以选择器为维度，每替换完一个选择器可独立验证。

---

## 迁移批次与优先级

| 批次 | 选择器模式 | 调用次数 | 风险 | 说明 |
|------|-----------|---------|------|------|
| P0 | `$(window)` / `$(document)` | ~260 | 低 | 纯取值/事件，无 jQuery 特殊行为 |
| P0 | `$.trim()` | 73 | 低 | 直接替换为 `.trim()` |
| P0 | `$.extend(true, ...)` | 376 | 中 | 深拷贝需注意函数/特殊对象 |
| P1 | `$("body")` | 99 | 低 | 主要是 `.append()` |
| P1 | `$.each()` / `$.inArray()` / `$.ajax()` | 4 | 低 | 极少使用 |
| P2 | `$("#id")` — 简单取值/设置 | ~400 | 低 | `.val()`, `.html()`, `.text()` 等 |
| P2 | `$("#id")` — CSS/显示操作 | ~300 | 中 | `.css()`, `.show()`, `.hide()` |
| P2 | `$("#id")` — 事件绑定 | ~200 | 中 | `.on()`, `.off()`, `.click()` 等 |
| P2 | `$("#id")` — 尺寸位置 | ~100 | 中 | `.width()`, `.offset()` 等 |
| P2 | `$("#id")` — DOM 结构 | ~128 | 中 | `.append()`, `.find()`, `.remove()` 等 |
| P3 | `$(this)` | 395 | 高 | 事件回调中，需逐个分析链式调用 |
| P3 | `$(".class")` | 13 | 中 | 多元素操作 |
| P3 | `$('html')` 元素创建 | 11 | 中 | 需用 `insertAdjacentHTML` 或 `createElement` |

---

## P0-1: `$(window)` — 103处

### 等效替换规则

| jQuery | 原生 JS | 注意事项 |
|--------|---------|---------|
| `$(window).width()` | `window.innerWidth` | jQuery 不含滚动条，innerWidth 含滚动条。如需精确匹配用 `document.documentElement.clientWidth` |
| `$(window).height()` | `window.innerHeight` | 同上，精确匹配用 `document.documentElement.clientHeight` |
| `$(window).resize(fn)` | `window.addEventListener('resize', fn)` | |
| `$(window).scrollLeft()` | `window.pageXOffset` 或 `document.documentElement.scrollLeft` | |
| `$(window).scrollTop()` | `window.pageYOffset` 或 `document.documentElement.scrollTop` | |

### 具体替换示例

```js
// 替换前
let winw = $(window).width(), winh = $(window).height();

// 替换后
let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
```

```js
// 替换前
$(window).resize(function() { ... });

// 替换后
window.addEventListener('resize', function() { ... });
```

### 涉及文件

- `src/ui/rightClickMenu.js` (1处)
- `src/controllers/conditionformat/dialog/index.js` (8处)
- `src/controllers/insertFormula.js` (3处)
- `src/controllers/updateCell.js` (2处)
- `src/controllers/ifFormulaGenerator.js` (4处)
- `src/controllers/hyperlinkCtrl.js` (2处)
- `src/global/formula/rangeSelect.js` (2处)
- `src/controllers/handler/documentMousemoveSub/mouseRender.js` (4处)
- `src/global/formula/functionSearch.js` (2处)
- `src/utils/domUtils.js` (2处)
- `src/controllers/imageCtrl.js` (1处)
- `src/controllers/handler/documentMouseup.js` (4处)
- `src/controllers/handler/documentMousemove.js` (2处)
- `src/controllers/filter/filterOptionClick.js` (2处)
- `src/controllers/dropCell/ui.js` (2处)
- `src/controllers/alternateformat/alternateformatObj.js` (2处)
- `src/controllers/alternateformat/dialog.js` (2处)
- `src/controllers/filter/filterColorEvents.js` (1处)
- `src/controllers/filter/filterMenuEvents.js` (2处)
- `src/utils/utilSub/uiUtils.js` (2处)
- `src/utils/utilSub/reactiveUtils.js` (2处)
- `src/global/tooltip.js` (3处)
- `src/controllers/splitColumn.js` (1处)
- `src/controllers/searchReplace.js` (2处)
- `src/controllers/moreFormat/formatDialog.js` (1处)
- `src/controllers/orderBy.js` (1处)
- `src/controllers/locationCell.js` (1处)
- `src/controllers/handler/cellEvents.js` (1处)

---

## P0-2: `$(document)` — 158处

### 等效替换规则

| jQuery | 原生 JS | 注意事项 |
|--------|---------|---------|
| `$(document).scrollLeft()` | `document.documentElement.scrollLeft` | |
| `$(document).scrollTop()` | `document.documentElement.scrollTop` | |
| `$(document).on("click.ns", "selector", handler)` | `document.addEventListener("click", function(e) { const t = e.target.closest("selector"); if(t) handler.call(t, e); })` | 事件委托需手动实现 |
| `$(document).off("click.ns")` | 需保存 handler 引用后 `document.removeEventListener("click", savedHandler)` | **关键难点**：jQuery 命名空间事件无原生等价物 |
| `$(document).off(".luckysheetEvent")` | 需逐个移除所有已注册的 handler | 需维护 handler 注册表 |

### 事件命名空间问题（核心难点）

jQuery 的 `.on("click.CFeditorConditionRule", ...)` 和 `.off("click.CFeditorConditionRule")` 使用了**命名空间**，原生 JS 没有此功能。

**替换方案**：维护一个全局事件注册表

```js
// 在全局创建事件注册表
const _eventRegistry = new Map();

function onNamespaced(target, eventNs, selector, handler) {
    const [event, namespace] = eventNs.split('.');
    const delegateHandler = selector ? function(e) {
        const t = e.target.closest(selector);
        if (t && target.contains(t)) handler.call(t, e);
    } : handler;
    const key = namespace || event;
    if (!_eventRegistry.has(key)) _eventRegistry.set(key, []);
    const entry = { event, original: handler, delegate: delegateHandler, target };
    _eventRegistry.get(key).push(entry);
    target.addEventListener(event, delegateHandler);
}

function offNamespaced(namespace) {
    if (!_eventRegistry.has(namespace)) return;
    const entries = _eventRegistry.get(namespace);
    entries.forEach(({ event, delegate, target }) => {
        target.removeEventListener(event, delegate);
    });
    _eventRegistry.delete(namespace);
}
```

### 涉及文件

- `src/controllers/conditionformat/dialog/initEditRuleEvents.js` (3处)
- `src/controllers/conditionformat/dialog/initNewRuleEvents.js` (3处)
- `src/controllers/conditionformat/dialog/initRangeAndCloseEvents.js` (5处)
- `src/controllers/conditionformat/dialog/initAdminRuleEvents.js` (7处)
- `src/controllers/conditionformat/dialog/initConditionDialogEvents.js` (3处)
- `src/controllers/handler/globalEvents.js` (3处)
- `src/controllers/handler/documentMouseup.js` (1处)
- `src/controllers/handler/documentMousemove.js` (1处)
- `src/controllers/handler/pasteEvent.js` (1处)
- `src/controllers/mobile.js` (2处)
- `src/global/method.js` (1处 — 全局事件清理)
- `src/controllers/searchReplace.js` (9处)
- `src/controllers/hyperlinkCtrl.js` (2处)
- `src/controllers/imageCtrl.js` (1处)
- `src/controllers/alternateformat/alternateformatObj.js` (17处)
- `src/controllers/splitColumn.js` (3处)
- `src/controllers/moreFormat/formatDialog.js` (2处)
- `src/controllers/locationCell.js` (2处)
- `src/controllers/dropCell/ui.js` (1处)
- `src/controllers/zoom.js` (3处)
- `src/controllers/filter/filterCheckboxEvents.js` (5处)
- `src/controllers/conditionformat/dialog/initRuleTypeEvents.js` (5处)
- `src/controllers/conditionformat/dialog/index.js` (8处 scrollLeft/scrollTop)
- `src/controllers/insertFormula.js` (3处 scrollLeft/scrollTop)
- `src/controllers/ifFormulaGenerator.js` (4处 scrollLeft/scrollTop)
- `src/controllers/hyperlinkCtrl.js` (2处 scrollLeft/scrollTop)
- `src/controllers/imageCtrl.js` (1处 scrollLeft/scrollTop)
- `src/utils/utilSub/reactiveUtils.js` (2处 scrollLeft/scrollTop)
- `src/global/tooltip.js` (3处 scrollLeft/scrollTop)
- `src/controllers/splitColumn.js` (1处 scrollLeft/scrollTop)
- `src/controllers/searchReplace.js` (2处 scrollLeft/scrollTop)
- `src/controllers/moreFormat/formatDialog.js` (1处 scrollLeft/scrollTop)
- `src/controllers/orderBy.js` (1处 scrollLeft/scrollTop)
- `src/controllers/locationCell.js` (1处 scrollLeft/scrollTop)

---

## P0-3: `$.trim()` — 73处

### 等效替换规则

| jQuery | 原生 JS |
|--------|---------|
| `$.trim(str)` | `str.trim()` |

**注意**：`$.trim(null)` 返回 `""`，而 `null.trim()` 会报错。需确保参数非 null。

### 涉及文件

- `src/global/formula/dependency.js` (21处)
- `src/global/formula/formulaParser.js` (17处)
- `src/global/formula/formulaString.js` (9处)
- `src/global/formula/rangeHighlight.js` (5处)
- `src/global/formula/rangeSelect.js` (6处)
- `src/global/formula/formulaExec.js` (3处)
- `src/controllers/insertFormula.js` (3处)
- `src/global/formula/functionSearch.js` (2处)
- `src/controllers/handler/pasteEvent.js` (2处)
- `src/global/api/workbook.js` (1处)
- `src/function/functionImplementation/logical.js` (2处)
- `src/controllers/sheetmanage/sheetDataUtils.js` (1处)
- `src/controllers/handler/freezeButtons.js` (1处)

---

## P0-4: `$.extend()` — 376处

### 等效替换规则

| jQuery | 原生 JS | 注意事项 |
|--------|---------|---------|
| `$.extend(true, {}, obj)` | `structuredClone(obj)` | **推荐**：现代浏览器支持，能正确处理 Date/RegExp/Map/Set 等 |
| `$.extend(true, [], arr)` | `structuredClone(arr)` | 同上 |
| `$.extend(true, target, source)` | 深合并函数（见下方） | `structuredClone` 只能克隆，不能合并 |
| `$.extend({}, a, b)` | `Object.assign({}, a, b)` | 浅合并 |
| `$.extend(target, source)` | `Object.assign(target, source)` | 浅合并，修改 target |

### 深合并函数

```js
function deepMerge(target, ...sources) {
    for (const source of sources) {
        if (source === null || typeof source !== 'object') continue;
        for (const key of Object.keys(source)) {
            const tv = target[key], sv = source[key];
            if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
                if (tv && typeof tv === 'object' && !Array.isArray(tv)) {
                    deepMerge(tv, sv);
                } else {
                    target[key] = deepMerge({}, sv);
                }
            } else {
                target[key] = sv;
            }
        }
    }
    return target;
}
```

### 涉及文件（76个）

高频文件（>10处）：
- `src/global/refresh/refreshCore.js` (25处)
- `src/global/api/rangeOperation.js` (24处)
- `src/controllers/selection/clipboardCutPaste.js` (17处)
- `src/controllers/handler/documentMouseup.js` (15处)
- `src/controllers/dropCell/fillStrategy.js` (13处)
- `src/global/refresh/refreshOperation.js` (13处)
- `src/controllers/controlHistory.js` (12处)
- `src/controllers/alternateformat/alternateformatObj.js` (11处)

---

## P1-1: `$("body")` — 99处

### 等效替换规则

| jQuery | 原生 JS |
|--------|---------|
| `$("body").append(html)` | `document.body.insertAdjacentHTML('beforeend', html)` |
| `$("body").after(html)` | `document.body.insertAdjacentHTML('afterend', html)` |
| `$("body .luckysheet-cols-menu").hide()` | `document.querySelectorAll("body .luckysheet-cols-menu").forEach(el => el.style.display = 'none')` |
| `$("body > .luckysheet-cols-menu").remove()` | `document.querySelectorAll("body > .luckysheet-cols-menu").forEach(el => el.remove())` |
| `$("body").scrollTop()` | `document.documentElement.scrollTop` |
| `$("body").scrollLeft()` | `document.documentElement.scrollLeft` |
| `.appendTo($("body"))` | `document.body.appendChild(el)` |

### 涉及文件

- `src/controllers/conditionformat/dialog/index.js` (8处 append)
- `src/controllers/insertFormula.js` (4处 append)
- `src/controllers/ifFormulaGenerator.js` (4处 append)
- `src/controllers/hyperlinkCtrl.js` (1处 append)
- `src/global/formula/functionSearch.js` (2处 append/after)
- `src/controllers/imageCtrl.js` (2处 append)
- `src/controllers/resize.js` (1处 append, 2处 scrollTop/scrollLeft)
- `src/global/tooltip.js` (5处 append)
- `src/global/createdom.js` (7处 append)
- `src/controllers/splitColumn.js` (1处 append)
- `src/controllers/searchReplace.js` (1处 append)
- `src/controllers/moreFormat/formatDialog.js` (1处 append)
- `src/controllers/orderBy.js` (1处 append)
- `src/controllers/locationCell.js` (1处 append)
- `src/controllers/dropCell/ui.js` (1处 append)
- `src/controllers/alternateformat/alternateformatObj.js` (3处 append)
- `src/controllers/alternateformat/dialog.js` (3处 append)
- `src/controllers/menuButton/toolbarInit/*.js` (18处 append)
- `src/utils/dialogUtils.js` (3处 append)
- `src/controllers/filter/filterColorEvents.js` (1处 append)
- `src/controllers/matrixOperation/*.js` (25处 hide)
- `src/controllers/filter/filterOptionClick.js` (1处 hide)
- `src/global/method.js` (1处 remove)
- `src/global/cursorPos.js` (1处 hide)
- `src/controllers/menuButton/sizeUtils.js` (1处 appendTo)
- `src/controllers/menuButton/formatStatus.js` (4处 — 疑似Bug，缺少#号)

---

## P1-2: `$.each()` / `$.inArray()` / `$.ajax()` — 4处

### 等效替换规则

| jQuery | 原生 JS |
|--------|---------|
| `$.each(arr, function(i, item) {...})` | `arr.forEach(function(item, i) {...})` — 注意参数顺序反转 |
| `$.inArray(val, arr)` | `arr.indexOf(val)` |
| `$.ajax({url, type, data, success, error})` | `fetch(url, {method, body}).then().catch()` |

---

## P2: `$("#id")` — 1128处

### 按方法分类的等效替换规则

#### `.val()` — 获取/设置表单值

| jQuery | 原生 JS |
|--------|---------|
| `$("#id").val()` | `document.getElementById("id").value` |
| `$("#id").val("text")` | `document.getElementById("id").value = "text"` |

#### `.html()` / `.text()`

| jQuery | 原生 JS |
|--------|---------|
| `$("#id").html()` | `document.getElementById("id").innerHTML` |
| `$("#id").html(content)` | `document.getElementById("id").innerHTML = content` |
| `$("#id").text()` | `document.getElementById("id").textContent` |
| `$("#id").text(content)` | `document.getElementById("id").textContent = content` |

#### `.css()` — 样式操作

| jQuery | 原生 JS | 注意事项 |
|--------|---------|---------|
| `$("#id").css("prop")` | `getComputedStyle(document.getElementById("id")).prop` | jQuery 返回计算样式 |
| `$("#id").css("prop", "val")` | `document.getElementById("id").style.prop = "val"` | |
| `$("#id").css({p1: v1, p2: v2})` | `Object.assign(document.getElementById("id").style, {p1: v1, p2: v2})` | |

#### `.show()` / `.hide()`

| jQuery | 原生 JS | 注意事项 |
|--------|---------|---------|
| `$("#id").show()` | `el.style.display = ''` | jQuery 会恢复之前的 display 值 |
| `$("#id").hide()` | `el.style.display = 'none'` | |

**jQuery `.show()` 的特殊行为**：如果元素之前是 `display: inline`，`.hide()` 后再 `.show()` 会恢复为 `inline`，而不是 `block`。

**替换方案**：在 Luckysheet 中，绝大多数 `.show()` 场景都是恢复默认 display（`style.display = ''`），这足够了。如有特殊情况，需在 `hide()` 时保存旧值。

#### `.is(":visible")` / `.is(":checked")`

| jQuery | 原生 JS |
|--------|---------|
| `$("#id").is(":visible")` | `el.offsetWidth > 0 && el.offsetHeight > 0` |
| `$("#id").is(":checked")` | `el.checked` |
| `$("#id").is(".className")` | `el.classList.contains("className")` |
| `$("#id").is("selector")` | `el.matches("selector")` |

#### `.attr()` / `.prop()` / `.data()`

| jQuery | 原生 JS |
|--------|---------|
| `$("#id").attr("name")` | `el.getAttribute("name")` |
| `$("#id").attr("name", "val")` | `el.setAttribute("name", "val")` |
| `$("#id").attr({n1: v1, n2: v2})` | 逐个 `el.setAttribute(n1, v1); el.setAttribute(n2, v2)` |
| `$("#id").prop("checked")` | `el.checked` |
| `$("#id").data("key")` | `el.dataset.key` |

**注意**：jQuery `.data()` 有内部缓存机制，与 `dataset` 不完全等价。在 Luckysheet 中，`.data()` 主要用于读取 `data-*` 属性，`dataset` 可满足需求。

#### `.addClass()` / `.removeClass()` / `.hasClass()`

| jQuery | 原生 JS |
|--------|---------|
| `$("#id").addClass("cls")` | `el.classList.add("cls")` |
| `$("#id").removeClass("cls")` | `el.classList.remove("cls")` |
| `$("#id").hasClass("cls")` | `el.classList.contains("cls")` |

#### `.width()` / `.height()` / `.outerWidth()` / `.offset()`

| jQuery | 原生 JS | 注意事项 |
|--------|---------|---------|
| `$("#id").width()` | `Math.round(el.getBoundingClientRect().width)` | **必须用 getBoundingClientRect**，不能用 clientWidth |
| `$("#id").height()` | `Math.round(el.getBoundingClientRect().height)` | 同上 |
| `$("#id").outerWidth()` | `el.offsetWidth` | |
| `$("#id").offset()` | `{top: el.getBoundingClientRect().top + window.pageYOffset, left: el.getBoundingClientRect().left + window.pageXOffset}` | |
| `$("#id").position()` | `{top: el.offsetTop, left: el.offsetLeft}` | |

**关键**：jQuery `.width()` 不含 padding 和 border，使用 `getBoundingClientRect().width` 最接近。`clientWidth` 含 padding，在某些场景下值不同。

#### `.scrollTop()` / `.scrollLeft()`

| jQuery | 原生 JS |
|--------|---------|
| `$("#id").scrollTop()` | `el.scrollTop` |
| `$("#id").scrollTop(val)` | `el.scrollTop = val` |
| `$("#id").scrollLeft()` | `el.scrollLeft` |
| `$("#id").scrollLeft(val)` | `el.scrollLeft = val` |

#### `.append()` / `.remove()` / `.empty()`

| jQuery | 原生 JS |
|--------|---------|
| `$("#id").append(html)` | `el.insertAdjacentHTML('beforeend', html)` |
| `$("#id").append(domNode)` | `el.appendChild(domNode)` |
| `$("#id").remove()` | `el.remove()` |
| `$("#id").empty()` | `el.innerHTML = ''` |

#### `.find()` / `.closest()` / `.parent()`

| jQuery | 原生 JS | 注意事项 |
|--------|---------|---------|
| `$("#id").find("selector")` | `el.querySelectorAll("selector")` | 返回 NodeList，不是 jQuery 对象 |
| `$("#id").closest("selector")` | `el.closest("selector")` | 返回 Element 或 null |
| `$("#id").parent()` | `el.parentElement` | |

**关键**：`.find()` 返回的 NodeList 后面如果还有链式调用（如 `.find().css()`），需要拆分为多步。

#### `.on()` / `.off()` / `.click()`

| jQuery | 原生 JS |
|--------|---------|
| `$("#id").click(fn)` | `el.addEventListener('click', fn)` |
| `$("#id").click()` | `el.click()` |
| `$("#id").on("event", fn)` | `el.addEventListener("event", fn)` |
| `$("#id").on("event", "selector", fn)` | 事件委托（见 P0-2） |
| `$("#id").off("event", fn)` | `el.removeEventListener("event", fn)` |

#### `.siblings()` / `.next()` / `.prev()`

| jQuery | 原生 JS |
|--------|---------|
| `$(this).siblings()` | `Array.from(el.parentElement.children).filter(c => c !== el)` |
| `$(this).siblings(".cls")` | `Array.from(el.parentElement.children).filter(c => c !== el && c.matches(".cls"))` |
| `$(this).next()` | `el.nextElementSibling` |
| `$(this).prev()` | `el.previousElementSibling` |

#### `.end()` — jQuery 链式回退

| jQuery | 原生 JS |
|--------|---------|
| `$("#id").find(".cls").css(...).end().append(...)` | 拆分为两步：`el.querySelectorAll(".cls").forEach(...); el.insertAdjacentHTML(...)` |

**`.end()` 无原生等价物**，必须拆分链式调用。

#### 多选择器 `$("#a, #b")`

| jQuery | 原生 JS |
|--------|---------|
| `$("#a, #b").css("cursor", "default")` | `document.querySelectorAll("#a, #b").forEach(el => el.style.cursor = "default")` |

---

## P3-1: `$(this)` — 395处

### 等效替换规则

| jQuery | 原生 JS | 注意事项 |
|--------|---------|---------|
| `$(this)` | `this` 或 `e.currentTarget` | 在事件回调中 `this` 就是 DOM 元素 |
| `$(this).val()` | `this.value` | |
| `$(this).attr("name")` | `this.getAttribute("name")` | |
| `$(this).data("key")` | `this.dataset.key` | |
| `$(this).hasClass("cls")` | `this.classList.contains("cls")` | |
| `$(this).addClass("cls")` | `this.classList.add("cls")` | |
| `$(this).removeClass("cls")` | `this.classList.remove("cls")` | |
| `$(this).css("prop", "val")` | `this.style.prop = "val"` | |
| `$(this).css("prop")` | `getComputedStyle(this).prop` | |
| `$(this).offset()` | `{top: this.getBoundingClientRect().top + window.pageYOffset, left: this.getBoundingClientRect().left + window.pageXOffset}` | |
| `$(this).outerWidth()` | `this.offsetWidth` | |
| `$(this).width()` | `Math.round(this.getBoundingClientRect().width)` | |
| `$(this).position()` | `{top: this.offsetTop, left: this.offsetLeft}` | |
| `$(this).parents(".cls")` | `this.closest(".cls")` | `parents` 找所有祖先，`closest` 只找最近一个 |
| `$(this).closest(".cls")` | `this.closest(".cls")` | |
| `$(this).find("selector")` | `this.querySelectorAll("selector")` | |
| `$(this).siblings()` | `Array.from(this.parentElement.children).filter(c => c !== this)` | |
| `$(this).next()` | `this.nextElementSibling` | |
| `$(this).prev()` | `this.previousElementSibling` | |
| `$(this).index()` | `Array.from(this.parentElement.children).indexOf(this)` | |
| `$(this)[0]` | `this` | jQuery 对象转原生元素 |
| `$(this).text()` | `this.textContent` | |
| `$(this).text("val")` | `this.textContent = "val"` | |
| `$(this).html("val")` | `this.innerHTML = "val"` | |
| `$(this).is(":checked")` | `this.checked` | |
| `$(this).is(":visible")` | `this.offsetWidth > 0 && this.offsetHeight > 0` | |

**关键**：`$(this).parents(".cls")` 返回**所有**匹配的祖先元素，而 `this.closest(".cls")` 只返回**最近**一个。在 Luckysheet 中，`.parents()` 的调用几乎都是 `.parents(".cls").attr("id")` 或 `.parents(".cls").find(...)` 这种只需要最近匹配的场景，可以用 `.closest()` 替代。

---

## P3-2: `$(".class")` — 13处

### 等效替换规则

| jQuery | 原生 JS |
|--------|---------|
| `$(".cls").css("prop", "val")` | `document.querySelectorAll(".cls").forEach(el => el.style.prop = "val")` |
| `$(".cls").on("event", fn)` | `document.querySelectorAll(".cls").forEach(el => el.addEventListener("event", fn))` |
| `$(".cls").is(":visible")` | `Array.from(document.querySelectorAll(".cls")).some(el => el.offsetWidth > 0)` |
| `$(".cls").length > 0` | `document.querySelectorAll(".cls").length > 0` |
| `$(".cls").hover(enter, leave)` | `document.querySelectorAll(".cls").forEach(el => { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); })` |

---

## P3-3: `$('html string')` 元素创建 — 11处

### 等效替换规则

| jQuery | 原生 JS |
|--------|---------|
| `$('<div class="x">...</div>').appendTo(target)` | `target.insertAdjacentHTML('beforeend', '<div class="x">...</div>')` |
| `$('<canvas/>').attr({width: w, height: h}).appendTo(target)` | `const c = document.createElement('canvas'); c.width = w; c.height = h; target.appendChild(c)` |
| `$('<a></a>').attr("href", url).appendTo("body")` | `const a = document.createElement('a'); a.href = url; document.body.appendChild(a)` |

---

## 迁移执行顺序

### 第 1 步：创建最小工具函数（不是封装层）

在 `src/utils/migrationHelpers.js` 中创建仅用于处理 jQuery 特殊行为的工具：

```js
// 1. 命名空间事件注册表（替代 jQuery event namespaces）
const _nsHandlers = new Map();
export function onNS(target, eventNs, selector, handler) { ... }
export function offNS(namespace) { ... }

// 2. 深合并（替代 $.extend(true, target, source)）
export function deepMerge(target, ...sources) { ... }
```

### 第 2 步：按选择器逐个替换

按 P0 → P1 → P2 → P3 顺序，每替换完一个选择器模式就构建验证。

### 第 3 步：移除 jQuery 依赖

1. 替换 `jquery.sPage` 插件
2. 移除 `jquery-bridge.js` / `jquery-init.js`
3. 从 `package.json` 移除 `jquery`
4. 从 `vite.config.js` 移除 `@rollup/plugin-inject`
5. 移除 `window.jQuery` / `window.$`

---

## 已知 Bug（迁移时顺便修复）

1. **[formatStatus.js:74,90,106,122]** — `$("luckysheet-icon-align")` 缺少 `#` 号，应为 `$("#luckysheet-icon-align")`
2. **[conditionformat/index.js:454]** — `attr("data-top", $(e).find("div").attr("data-leftmin"))` 应为 `attr("data-top", $(e).find("div").attr("data-top"))`
3. **[filterColorEvents.js:131]** — `$("#luckysheet-filter-orderby-color-submenu").end()` 无前置遍历方法，`.end()` 返回空 jQuery 对象，可能是 bug

---

## 附录 A：链式调用拆解方案

> **核心原则**：jQuery 链式调用依赖其"内部栈"机制——每次 `.find()` / `.filter()` / `.siblings()` 等遍历方法都会将前一个集合压栈，`.end()` 弹栈回退。原生 JS 没有此机制，**必须拆分为独立的变量和步骤**。
>
> **迁移策略**：每个链式调用拆解后，用 `const` 缓存中间 DOM 引用，避免重复查询。

### A1. `.find().css().end()` 模式（44处）

这是项目中最频繁的链式回溯模式。jQuery 的 `.end()` 回退到上一个 `.find()` 之前的 jQuery 对象，原生 JS 无此概念，必须拆分。

**模式 A：对话框初始化 — `find().css().end()` 后续取尺寸（21处）**

```js
// jQuery 原代码
let $t = $("#id").find(".luckysheet-modal-dialog-content").css("min-width", 300).end();
let myh = $t.outerHeight(), myw = $t.outerWidth();

// 原生 JS 替换
const dialog = document.getElementById("id");
dialog.querySelector(".luckysheet-modal-dialog-content").style.minWidth = '300px';
const myh = dialog.offsetHeight, myw = dialog.offsetWidth;
```

**涉及文件**：tooltip.js(3), conditionformat/index.js(8), insertFormula.js(1), hyperlinkCtrl.js(1), splitColumn.js(1), formatDialog.js(1), locationCell.js(1), imageCtrl.js(1), alternateformatObj.js(1), dialog.js(1), reactiveUtils.js(1), searchReplace.js(1)

**模式 B：双子元素操作 — `find(A).css().end().find(B).css()`（8处）**

```js
// jQuery 原代码
$("#luckysheet-freezebar-vertical")
    .find(".luckysheet-freezebar-vertical-handle").css({ "height": h }).end()
    .find(".luckysheet-freezebar-vertical-drop").css({ "height": h });

// 原生 JS 替换
const bar = document.getElementById("luckysheet-freezebar-vertical");
bar.querySelector(".luckysheet-freezebar-vertical-handle").style.height = h + 'px';
bar.querySelector(".luckysheet-freezebar-vertical-drop").style.height = h + 'px';
```

**涉及文件**：resize.js(2), freezeCore.js(4), selectionDrag.js(2), documentMouseup.js(1), handleCellMousedown.js(1)

**模式 C：三子元素操作 — `find(A).css().end().find(B).css().end().find(C).css()`（3处）**

```js
// jQuery 原代码
$("#luckysheet-cell-selected").css({...})
    .find(".luckysheet-cs-draghandle").css("display", "block").end()
    .find(".luckysheet-cs-fillhandle").css("display", "none").end()
    .find(".luckysheet-cs-touchhandle").css("display", "block");

// 原生 JS 替换
const cellSelected = document.getElementById("luckysheet-cell-selected");
Object.assign(cellSelected.style, {...});
cellSelected.querySelector(".luckysheet-cs-draghandle").style.display = 'block';
cellSelected.querySelector(".luckysheet-cs-fillhandle").style.display = 'none';
cellSelected.querySelector(".luckysheet-cs-touchhandle").style.display = 'block';
```

**涉及文件**：select.js(1), mobile.js(1)

**模式 D：动态ID + `.data()` + 多次 `find().css().end()`（2处）**

```js
// jQuery 原代码
$("#" + rangeid)
    .data("range", cellrange)
    .find(".luckysheet-copy").css({ background: color }).end()
    .find(".luckysheet-highlight").css({ background: color }).end()
    .find(".luckysheet-selection-copy-hc").css({ background: color });

// 原生 JS 替换
const el = document.getElementById(rangeid);
el.dataset.range = JSON.stringify(cellrange);
el.querySelector(".luckysheet-copy").style.background = color;
el.querySelector(".luckysheet-highlight").style.background = color;
el.querySelector(".luckysheet-selection-copy-hc").style.background = color;
```

**涉及文件**：rangeHighlight.js(2)

**模式 E：`.find().remove().end().prepend().show()`（1处）**

```js
// jQuery 原代码
this.el.find(".luckysheet-input-box-index-sheettxt").remove().end().prepend(sheetName).show();

// 原生 JS 替换
const el = this.el;
const old = el.querySelector(".luckysheet-input-box-index-sheettxt");
if (old) old.remove();
el.insertAdjacentHTML('afterbegin', sheetName);
el.style.display = '';
```

**涉及文件**：inputBoxIndex.js(1)

### A2. `.addClass("on").siblings().removeClass("on")` Tab 切换模式（13处）

**特殊效果**：jQuery `.siblings()` 返回所有兄弟元素的 jQuery 集合，后续 `.removeClass()` 隐式迭代作用于每个兄弟。原生 JS 需要显式遍历 `parentElement.children`。

```js
// jQuery 原代码
$(this).addClass("on").siblings().removeClass("on");

// 原生 JS 替换
this.classList.add("on");
for (const sibling of this.parentElement.children) {
    if (sibling !== this) sibling.classList.remove("on");
}
```

**变体：带选择器参数的 `.siblings()`**

```js
// jQuery 原代码
$(this).siblings("input").attr("id");
$(this).siblings("input").val();
$(this).siblings("input[type='checkbox']").is(":checked");
$(this).siblings(".subbox").find("input:checkbox").removeAttr("disabled");

// 原生 JS 替换
this.parentElement.querySelector("input").id;
this.parentElement.querySelector("input").value;
this.parentElement.querySelector("input[type='checkbox']").checked;
this.parentElement.querySelector(".subbox").querySelectorAll("input[type='checkbox']")
    .forEach(cb => cb.removeAttribute("disabled"));
```

**涉及文件**：initAdminRuleEvents.js(1), insertFormula.js(1), formatDialog.js(1), initRuleTypeEvents.js(1), searchReplace.js(5), conditionformat/index.js(2), initRangeAndCloseEvents.js(2), splitColumn.js(1), locationCell.js(2), filterActions.js(3), filterColorEvents.js(1)

### A3. `.show().siblings().hide()` 条件格式类型切换（3处）

**特殊效果**：`.show()` 在当前元素上恢复 display，`.siblings().hide()` 隐式迭代隐藏所有兄弟。原生 JS 需要显式遍历。

```js
// jQuery 原代码
$(this).parents(".dialog").find("." + type + "Box").show().siblings().hide();

// 原生 JS 替换
const dialog = this.closest(".dialog");
const targetBox = dialog.querySelector("." + type + "Box");
targetBox.style.display = '';
for (const sibling of targetBox.parentElement.children) {
    if (sibling !== targetBox) sibling.style.display = 'none';
}
```

**涉及文件**：initRuleTypeEvents.js(1), conditionformat/index.js(2)

### A4. `.val().css().keydown().bind()` 多步设置（1处）

```js
// jQuery 原代码
$("#luckysheet_info_detail_input").val(title).css("width", w).keydown(fn1).bind('input propertychange', fn2);

// 原生 JS 替换
const input = document.getElementById("luckysheet_info_detail_input");
input.value = title;
input.style.width = w + 'px';
input.addEventListener('keydown', fn1);
input.addEventListener('input', fn2);
// 注意：'propertychange' 是 IE 特有事件，现代浏览器不需要
```

**涉及文件**：keyboard.js(1)

### A5. `.find("span").text(txt).end().show()` 先改子元素再显示父元素（1处）

```js
// jQuery 原代码
$("#luckysheet-cell-loading").find("span").text(txt).end().show();

// 原生 JS 替换
const loading = document.getElementById("luckysheet-cell-loading");
loading.querySelector("span").textContent = txt;
loading.style.display = '';
```

**涉及文件**：loading.js(1)

### A6. `.find().find()` 嵌套查找（2处）

**特殊效果**：两次 `.find()` 嵌套，第二次在第一次的结果中查找。原生 JS 用 `querySelector` 的后代选择器一步完成。

```js
// jQuery 原代码
$obj.find(".luckysheet-cols-menuitem").find("span.icon").html("");
$obj.find(".luckysheet-cols-menuitem[itemvalue='" + value + "']").find("span.icon").html('<i class="fa fa-check"></i>');

// 原生 JS 替换
obj.querySelectorAll(".luckysheet-cols-menuitem span.icon").forEach(el => el.innerHTML = "");
const target = obj.querySelector(".luckysheet-cols-menuitem[itemvalue='" + value + "'] span.icon");
if (target) target.innerHTML = '<i class="fa fa-check"></i>';
```

**涉及文件**：menuUtils.js(2)

### A7. `.closest().find()` 向上再向下查找（16处）

**特殊效果**：从事件触发元素向上找到容器，再向下查找目标元素。这是事件委托回调中的典型模式。原生 JS 用 `closest()` + `querySelector()` 等效替换，但**必须缓存中间结果**避免重复 DOM 遍历。

```js
// jQuery 原代码（重复3次 closest + find）
$(this).closest(".luckysheet-postil-show").find(".luckysheet-postil-dialog-resize").show();
$(this).closest(".luckysheet-postil-show").find(".arrowCanvas").css("z-index", 200);
$(this).closest(".luckysheet-postil-show").find(".luckysheet-postil-show-main").css("z-index", 200);

// 原生 JS 替换（缓存容器引用）
const postilShow = this.closest(".luckysheet-postil-show");
postilShow.querySelector(".luckysheet-postil-dialog-resize").style.display = '';
postilShow.querySelector(".arrowCanvas").style.zIndex = '200';
postilShow.querySelector(".luckysheet-postil-show-main").style.zIndex = '200';
```

**变体：`.closest()` + `.find()` + 伪选择器组合**

```js
// jQuery 原代码
let $monthDay = $(e).closest(".dayList").find(".day:visible");
let $yearDay = $(e).closest(".monthList").find(".day:visible");

// 原生 JS 替换（:visible 需要后过滤）
const dayList = e.closest(".dayList");
const monthDays = Array.from(dayList.querySelectorAll(".day")).filter(el => el.offsetWidth > 0);
const monthList = e.closest(".monthList");
const yearDays = Array.from(monthList.querySelectorAll(".day")).filter(el => el.offsetWidth > 0);
```

**涉及文件**：postil.js(6), filterActions.js(8), initRowColWidthEvents.js(1), sheetBar.js(1)

### A8. `.eq().show().css()` / `.eq().val()` 索引选择链（92处）

**特殊效果**：`.eq(N)` 从 jQuery 集合中选取第 N 个元素，返回新的 jQuery 对象，后续方法只作用于该元素。原生 JS 用 `querySelectorAll()[N]` 或 `children[N]` 替代。

**模式 A：`.eq(N)` 后续链式操作**

```js
// jQuery 原代码
$input.eq(0).val($t.data("byconditionvalue1"));
$input.eq(1).val($t.data("byconditionvalue2"));
$("#luckysheet-filter-menu .luckysheet-filter-selected-input").eq(0).show().find("input").val(val);

// 原生 JS 替换
const inputs = document.querySelectorAll("#luckysheet-filter-menu input");
inputs[0].value = t.dataset.byconditionvalue1;
inputs[1].value = t.dataset.byconditionvalue2;
const selectedInput = document.querySelectorAll(".luckysheet-filter-selected-input")[0];
selectedInput.style.display = '';
selectedInput.querySelector("input").value = val;
```

**模式 B：`.find().eq().find()` 嵌套索引查找**

```js
// jQuery 原代码
formulaDialogs.searchParm.find(".parmBox").eq(parmIndex).find(".txt input").focus();
$obj.find(".luckysheet-cols-menuitem").eq(0).find("span.icon").html(checkIcon);

// 原生 JS 替换
const parmBoxes = document.querySelectorAll(".parmBox");
parmBoxes[parmIndex].querySelector(".txt input").focus();
obj.querySelectorAll(".luckysheet-cols-menuitem")[0].querySelector("span.icon").innerHTML = checkIcon;
```

**模式 C：`.prevAll(":visible").eq(0)` / `.nextAll(":visible").eq(0)` 复合遍历**

```js
// jQuery 原代码
luckysheetcurrentSheetitem.insertBefore(luckysheetcurrentSheetitem.prevAll(":visible").eq(0));
luckysheetcurrentSheetitem.insertAfter(luckysheetcurrentSheetitem.nextAll(":visible").eq(0));

// 原生 JS 替换
let prevVisible = luckysheetcurrentSheetitem;
while ((prevVisible = prevVisible.previousElementSibling)) {
    if (prevVisible.offsetWidth > 0) break;
}
if (prevVisible) luckysheetcurrentSheetitem.parentElement.insertBefore(luckysheetcurrentSheetitem, prevVisible);

let nextVisible = luckysheetcurrentSheetitem;
while ((nextVisible = nextVisible.nextElementSibling)) {
    if (nextVisible.offsetWidth > 0) break;
}
if (nextVisible) luckysheetcurrentSheetitem.parentElement.insertBefore(luckysheetcurrentSheetitem, nextVisible.nextElementSibling);
```

**涉及文件**：filterOptionClick.js(4), insertFormula.js(6), menuUtils.js(1), conditionformat/ruleManager.js(1), formatDialog.js(1), sheetVisibility.js(2), sheetBar.js(4), scrollAdapt.js(8), functionSearch.js(4), rangeHighlight.js(2), rangeSelect.js(2), handleCellMousedown.js(2), formulaBar.js(2), alternateformatObj.js(1), dialog.js(1), initRuleTypeEvents.js(1), labelFilterOptionState.js(1)

### A9. `.appendTo().attr().css()` 元素创建链（17处）

**特殊效果**：`$(htmlString)` 创建 jQuery 对象后，通过链式调用设置属性和样式，最后 `.appendTo()` 插入 DOM。原生 JS 需要拆分为创建、设置、插入三步。

**模式 A：`$("<canvas/>")` 创建 + 属性设置 + 插入**

```js
// jQuery 原代码
let c = $("<canvas/>").appendTo(gridWindow.el).attr({
    "id": id,
    "width": Math.ceil(width * Store.devicePixelRatio),
    "height": Math.ceil(height * Store.devicePixelRatio)
}).css({
    "position": "absolute",
    "left": left, "top": top,
    "width": width, "height": height,
});

// 原生 JS 替换
const canvas = document.createElement("canvas");
canvas.id = id;
canvas.width = Math.ceil(width * Store.devicePixelRatio);
canvas.height = Math.ceil(height * Store.devicePixelRatio);
Object.assign(canvas.style, {
    position: "absolute",
    left: left + "px", top: top + "px",
    width: width + "px", height: height + "px",
});
gridWindow.el.appendChild(canvas);
```

**模式 B：`$("<a></a>")` 创建 + 属性 + 插入 + 原生操作**

```js
// jQuery 原代码
let $a = $("<a></a>").attr("href", imgurl).attr("download", "luckysheet.png").appendTo("body");
$a[0].click();
$a.remove();

// 原生 JS 替换
const a = document.createElement("a");
a.href = imgurl;
a.download = "luckysheet.png";
document.body.appendChild(a);
a.click();
a.remove();
```

**模式 C：`$("<font></font>")` 创建 + 条件样式 + 提取 outerHTML**

```js
// jQuery 原代码
var font = $("<font></font>");
val.fs && font.css("font-size", val.fs + "pt");
val.bl && font.css("font-weight", "bold");
val.it && font.css("font-style", "italic");
val.un && font.css("text-decoration", "underline");
val.fc && font.css("color", val.fc);
if (val.cl) { font.append("<s>" + item + "</s>"); }
else { font.text(item); }
return font[0].outerHTML;

// 原生 JS 替换
const font = document.createElement("font");
if (val.fs) font.style.fontSize = val.fs + "pt";
if (val.bl) font.style.fontWeight = "bold";
if (val.it) font.style.fontStyle = "italic";
if (val.un) font.style.textDecoration = "underline";
if (val.fc) font.style.color = val.fc;
if (val.cl) {
    const s = document.createElement("s");
    s.textContent = item;
    font.appendChild(s);
} else {
    font.textContent = item;
}
return font.outerHTML;
```

**模式 D：HTML 字符串直接 `.appendTo()`**

```js
// jQuery 原代码
$('<div class="listBox" name="'+ functionlist[i].n +'"><span>'+ functionlist[i].n +'</span><span>'+ functionlist[i].a +'</span></div>')
    .appendTo(searchFormula.find("#formulaTypeList"));

// 原生 JS 替换
document.querySelector("#formulaTypeList").insertAdjacentHTML('beforeend',
    '<div class="listBox" name="'+ functionlist[i].n +'"><span>'+ functionlist[i].n +'</span><span>'+ functionlist[i].a +'</span></div>'
);
```

**涉及文件**：freezeCanvas.js(1), tooltip.js(1), workbook.js(1), htmlTableBuilder.js(1), sizeUtils.js(1), insertFormula.js(4), postil.js(5), searchReplace.js(1), dropCell/ui.js(1), gridWindow.js(1), cellMain.js(1)

### A10. `.clone().css().attr()` 克隆链（1处）

**特殊效果**：`.clone()` 深克隆 DOM 元素（含子元素和事件），返回新的 jQuery 对象。原生 `cloneNode(true)` 只克隆 DOM 结构不含事件。

```js
// jQuery 原代码
let $itemclone = $item.clone().css("visibility", "hidden").attr("id", "luckysheet-sheets-item-clone");

// 原生 JS 替换
const itemclone = item.cloneNode(true);
itemclone.style.visibility = "hidden";
itemclone.id = "luckysheet-sheets-item-clone";
```

**注意**：如果原始元素上有通过 jQuery `.on()` 绑定的事件，`cloneNode(true)` 不会复制。但 Luckysheet 中此场景是纯视觉克隆，不涉及事件复制。

**涉及文件**：sheetBar.js(1)

### A11. `.not().each()` / `.filter()` 排除过滤链（12处）

**特殊效果**：`.not()` 从 jQuery 集合中排除元素，`.filter()` 保留匹配元素。两者都返回新的 jQuery 对象。原生 JS 用 `Array.from().filter()` 替代。

**模式 A：`.not(this).each()` 排除当前元素**

```js
// jQuery 原代码
$("#... .luckysheet-filter-options").not(this).each(function () { ... });

// 原生 JS 替换
document.querySelectorAll(".luckysheet-filter-options").forEach(el => {
    if (el !== this) { ... }
});
```

**模式 B：`.not(jQuery查询结果)` 排除动态元素**

```js
// jQuery 原代码
$(".filter-options").not($(".filter-options").eq(idx).get(0)).each(function() { ... });

// 原生 JS 替换
const allOptions = document.querySelectorAll(".filter-options");
const excludeEl = allOptions[idx];
Array.from(allOptions).filter(el => el !== excludeEl).forEach(el => { ... });
```

**模式 C：`.filter("[class*='sp-palette']")` 属性包含选择器**

```js
// jQuery 原代码
$(event.target).filter("[class*='sp-palette']").length == 0

// 原生 JS 替换
!event.target.matches("[class*='sp-palette']")
```

**模式 D：`find("> canvas").not(selector).remove()` 子元素过滤**

```js
// jQuery 原代码
this.el.find("> canvas").not(selector).remove();

// 原生 JS 替换
Array.from(this.el.querySelectorAll(":scope > canvas"))
    .filter(el => !el.matches(selector))
    .forEach(el => el.remove());
```

**涉及文件**：filterOptionClick.js(1), filterColorEvents.js(2), filterActions.js(2), cursorPos.js(4), gridWindow.js(1), scrollAdapt.js(2)

### A12. `.show().find().css()` 显示后操作子元素（8处）

**特殊效果**：先 `.show()` 使元素可见（确保 `getBoundingClientRect` 返回正确值），再 `.find()` 操作子元素。原生 JS 中 `display: none` 的元素尺寸为 0，某些场景需要先显示再设置子元素样式。

```js
// jQuery 原代码
$("#luckysheet-freezebar-vertical").show().find(".luckysheet-freezebar-vertical-handle").css({
    "cursor": "ns-resize", "left": left
});

// 原生 JS 替换
const bar = document.getElementById("luckysheet-freezebar-vertical");
bar.style.display = '';
bar.querySelector(".luckysheet-freezebar-vertical-handle").style.cursor = 'ns-resize';
bar.querySelector(".luckysheet-freezebar-vertical-handle").style.left = left + 'px';
```

**变体：`.show().find().css()` 对多个子元素操作**

```js
// jQuery 原代码（scrollAdapt.js）
$(e).show().find(".luckysheet-postil-show-main").css("top", postil_top + offTop);
$(e).show().find(".arrowCanvas").css("top", size[1] + offTop);

// 原生 JS 替换
e.style.display = '';
e.querySelector(".luckysheet-postil-show-main").style.top = (postil_top + offTop) + 'px';
e.querySelector(".arrowCanvas").style.top = (size[1] + offTop) + 'px';
```

**涉及文件**：freezeCore.js(4), scrollAdapt.js(4)

### A13. `.css({...}).show()` 先定位再显示（~100处）

**特殊效果**：这是项目中最常见的对话框/菜单显示模式。先通过 `.css()` 设置位置和尺寸，再 `.show()` 显示。这样做可以避免元素在设置位置之前短暂闪烁在错误位置。原生 JS 同样需要先设置样式再改变 display。

```js
// jQuery 原代码
$("#luckysheet-info").css({ left: left + "px", top: top + "px" }).show();
$("#luckysheet-sort-dialog").css({ left: left, top: top }).show();

// 原生 JS 替换
const info = document.getElementById("luckysheet-info");
info.style.left = left + "px";
info.style.top = top + "px";
info.style.display = '';

// 或使用 Object.assign 批量设置
const dialog = document.getElementById("luckysheet-sort-dialog");
Object.assign(dialog.style, { left: left + "px", top: top + "px" });
dialog.style.display = '';
```

**变体：`.show().css({...})` 先显示再定位**

```js
// jQuery 原代码
$(".cell-date-picker").show().css({ width: w, height: h, left: l, top: t });

// 原生 JS 替换
const picker = document.querySelector(".cell-date-picker");
picker.style.display = '';
Object.assign(picker.style, { width: w + "px", height: h + "px", left: l + "px", top: t + "px" });
```

**涉及文件**：tooltip.js(3), uiUtils.js(1), rightClickMenu.js(1), splitColumn.js(1), formatDialog.js(1), orderBy.js(1), locationCell.js(1), filterColorEvents.js(1), filterMenuEvents.js(1), sheetBar.js(1), imageCtrl.js(1), cellDatePickerCtrl.js(1), scrollAdapt.js(8), cellSelectedFocus.js(1), searchReplace.js(1), hyperlinkCtrl.js(1), insertFormula.js(1), alternateformatObj.js(2), dialog.js(2)

### A14. `.off("ns").on("ns", ...)` 命名空间事件重绑定（~100处）

**特殊效果**：这是项目中所有对话框事件绑定的统一模式。先 `.off()` 解绑同命名空间的旧事件，再 `.on()` 绑定新事件，防止重复绑定。原生 JS 必须通过事件注册表实现此行为。

```js
// jQuery 原代码
$(document).off("click.CFeditorConditionRule").on("click.CFeditorConditionRule", "#editorConditionRule", function () { ... });

// 原生 JS 替换（使用迁移工具函数）
offNS("CFeditorConditionRule");
onNS(document, "click.CFeditorConditionRule", "#editorConditionRule", function () { ... });
```

**项目中的命名空间清单**：

| 模块 | 命名空间前缀 | 文件 |
|------|-------------|------|
| 条件格式-编辑规则 | `CFeditorConditionRule`, `CFeditorConditionRuleConfirm`, `CFeditorConditionRuleClose` | initEditRuleEvents.js |
| 条件格式-新建规则 | `CFnewConditionRule`, `CFnewConditionRuleConfirm`, `CFnewConditionRuleClose` | initNewRuleEvents.js |
| 条件格式-管理规则 | `CFchooseSheet`, `CFadministerRuleItem`, `CFadministerRuleConfirm`, `CFadministerRuleClose`, `CFadministerRuleFa`, `CFmultiRangeConfirm`, `CFmultiRangeClose` | initAdminRuleEvents.js |
| 条件格式-范围选择 | `CFrangeFaTable`, `CFsingleRangeConfirm`, `CFsingleRangeClose`, `CFmodalDialogTitleClose`, `CFinfoDialogClose` | initRangeAndCloseEvents.js |
| 条件格式-对话框 | `CFdeleteConditionRule`, `CFdefault`, `CFicons` | initConditionDialogEvents.js |
| 条件格式-规则类型 | `CFnewEditorRuleType1`, `CFnewEditorRuleType2`, `CFiconsShowbox`, `CFiconsLi` | initRuleTypeEvents.js |
| 公式插入 | `fxSFLI`, `fxFormulaTS`, `fxListbox`, `fxFormulaCf`, `fxParamInput`, `fxParamI`, `fxParamCf`, `fxParamSelectCf` | insertFormula.js |
| IF公式生成器 | `IFcompareValue`, `IFsingRange`, `IFmultiRange`, `IFcreateBtn`, `IFconfirmBtn` | ifFormulaGenerator.js |
| 超链接控制 | `linkType`, `confirm` | hyperlinkCtrl.js |
| 图片控制 | `radio`, `checkbox`, `borderWidth`, `borderRadius`, `borderStyle`, `color`, `selectColorConfirm`, `active`, `move`, `resize`, `croppingEnter`, `croppingExit`, `cropChange`, `restore`, `delete` | imageCtrl.js |
| 批注 | `showPs`, `resize`, `move` | postil.js |
| 分列 | `SPCcheckbox`, `SPCinptext`, `SPCconfirm` | splitColumn.js |
| 查找替换 | `SRtabBoxspan`, `SRsearchInput`, `SRsearchNextBtn`, `SRsearchAllBtn`, `SRsearchAllboxItem`, `SRreplaceBtn`, `SRreplaceAllBtn` | searchReplace.js |
| 交替颜色 | `AFrangeInput`, `AFrangeIcon`, `AFrDCf`, `AFrDCl`, `AFrDTitle`, `AFrowHeader`, `AFrowFooter`, `AFmodelbox`, `AFselectColor` | alternateformatObj.js |
| 更多格式 | `moreFormatConfirm` | formatDialog.js |
| 定位单元格 | `locationCellConfirm` | locationCell.js |
| 全局事件 | `luckysheetEvent` | globalEvents.js |
| 数据填充 | `dCtypeList` | dropCell/ui.js |

### A15. `.find().eq().find()` 嵌套索引查找（6处）

**特殊效果**：先 `.find()` 获取集合，再 `.eq()` 选取特定项，最后再 `.find()` 在该项中查找子元素。原生 JS 用 `querySelectorAll()[N].querySelector()` 替代。

```js
// jQuery 原代码
formulaDialogs.searchParm.find(".parmBox").eq(parmIndex).find(".txt input").focus();
formulaDialogs.searchParm.find(".parmBox").eq(index).find(".val").text(" = {"+ txtArr.join(",") +"}");

// 原生 JS 替换
const parmBoxes = document.querySelectorAll(".parmBox");
const targetBox = parmBoxes[parmIndex];
targetBox.querySelector(".txt input").focus();
parmBoxes[index].querySelector(".val").textContent = " = {" + txtArr.join(",") + "}";
```

**涉及文件**：insertFormula.js(3), menuUtils.js(1), filterOptionClick.js(1), pasteEvent.js(1)

### A16. `.addClass().data().html()` 多属性设置链（2处）

**特殊效果**：在同一元素上连续设置类名、数据和内容。原生 JS 需要拆分为独立语句。

```js
// jQuery 原代码
$(this).removeClass("luckysheet-filter-options-active").data("byconditiontype", type)
    .data("byconditionvalue1", v1).data("byconditionvalue2", v2).html(txt);

// 原生 JS 替换
this.classList.remove("luckysheet-filter-options-active");
this.dataset.byconditiontype = type;
this.dataset.byconditionvalue1 = v1;
this.dataset.byconditionvalue2 = v2;
this.innerHTML = txt;
```

**涉及文件**：labelFilterOptionState.js(1), filterOptionClick.js(1)

---

## 附录 B：混合选择器特殊效果与解决方案

> **核心原则**：jQuery 选择器和方法之间存在大量"隐式行为"——隐式迭代、null 安全、类型自动转换等。迁移到原生 JS 时，这些隐式行为必须显式处理，否则会导致运行时错误或行为不一致。

### B1. `$(this).parents("#dialog").find(".input").val()` — 向上再向下查找（19处）

**特殊效果**：从事件触发元素向上找到对话框容器，再向下查找表单元素。这是事件委托回调中的典型模式。

**原生 JS 解决方案**：用 `closest()` 替代 `parents()`，缓存结果避免重复查找。

```js
// jQuery 原代码（重复3次查找）
let len = $(this).parents("#dialog").find(".model").attr("data-len");
let leftMin = $(this).parents("#dialog").find(".model").attr("data-leftmin");
let top = $(this).parents("#dialog").find(".model").attr("data-top");

// 原生 JS 替换（缓存中间结果）
const dialog = this.closest("#dialog");
const model = dialog.querySelector(".model");
const len = model.dataset.len;
const leftMin = model.dataset.leftmin;
const top = model.dataset.top;
```

**涉及文件**：initEditRuleEvents.js(3), initNewRuleEvents.js(3), insertFormula.js(4), alternateformatObj.js(2), dialog.js(2), initRuleTypeEvents.js(6), formatDialog.js(1), initRangeAndCloseEvents.js(3), initAdminRuleEvents.js(2)

### B2. `$(event.target)` 重复包装同一元素（~20处）

**特殊效果**：同一 `event.target` 被多次 `$()` 包装，每次都创建新的 jQuery 对象。这不仅浪费性能，还使代码难以理解。原生 JS 中 `event.target` 本身就是 DOM 元素，可以直接使用。

```js
// jQuery 原代码（keyboard.js — 单行3次包装）
if (isModalMaskVisible() || $(event.target).hasClass("luckysheet-mousedown-cancel") ||
    $(event.target).hasClass("sp-input") ||
    (isInputBoxActive() && $(event.target).closest(".luckysheet-input-box").length > 0 && ...))

// 原生 JS 替换
const target = event.target;
if (isModalMaskVisible() || target.classList.contains("luckysheet-mousedown-cancel") ||
    target.classList.contains("sp-input") ||
    (isInputBoxActive() && target.closest(".luckysheet-input-box") !== null && ...))
```

**变体：`$(this)` 和 `$(e.target)` 同时包装**

```js
// jQuery 原代码（sheetBar.js）
let $t = $(this), $cur = $(e.target), $item = $cur.closest(".luckysheet-sheets-item");

// 原生 JS 替换
const t = this, cur = e.target, item = cur.closest(".luckysheet-sheets-item");
```

**涉及文件**：keyboard.js(8+), cursorPos.js(1), globalEvents.js(1), sheetBar.js(1)

### B3. `$(e)` 在 `.each()` 中重复包装 + 重复查找（5处）

**特殊效果**：`.each()` 回调中的 `e` 已经是原生 DOM 元素，但被反复 `$(e)` 包装和 `.find()` 查找。

```js
// jQuery 原代码（8次 find）
$(".iconsBox li").each(function(i, e) {
    if ($(e).find("div").attr("data-len") == len && $(e).find("div").attr("data-leftmin") == l) {
        $(".model").css("background-position", $(e).find("div").css("background-position"));
        $(".model").attr("data-len", $(e).find("div").attr("data-len"));
        $(".model").attr("data-leftmin", $(e).find("div").attr("data-leftmin"));
        $(".model").attr("data-top", $(e).find("div").attr("data-leftmin")); // bug!
        $(".model").attr("title", $(e).find("div").attr("title"));
    }
});

// 原生 JS 替换（缓存中间结果）
document.querySelectorAll(".iconsBox li").forEach(li => {
    const div = li.querySelector("div");
    if (div.dataset.len == len && div.dataset.leftmin == l) {
        const model = document.querySelector(".model");
        model.style.backgroundPosition = getComputedStyle(div).backgroundPosition;
        model.dataset.len = div.dataset.len;
        model.dataset.leftmin = div.dataset.leftmin;
        model.dataset.top = div.dataset.top; // 修复 bug
        model.setAttribute("title", div.getAttribute("title"));
    }
});
```

**涉及文件**：conditionformat/index.js(1), ifFormulaGenerator.js(1), orderBy.js(1), filterActions.js(1), filterCheckboxEvents.js(1)

### B4. `$("#id").add(selector).on()` — 组合多元素绑定事件（3处）

**特殊效果**：`.add()` 将新元素加入当前 jQuery 集合，后续方法作用于所有元素。原生 JS 没有集合合并操作，需要显式遍历。

```js
// jQuery 原代码
inputBox.el.click(fn1).add("#" + Store.container).on("keydown", fn2);

// 原生 JS 替换
inputBox.el.addEventListener('click', fn1);
const container = document.getElementById(Store.container);
[inputBox.el, container].forEach(el => el.addEventListener('keydown', fn2));
```

**变体：`.add()` 合并选择器字符串**

```js
// jQuery 原代码
$("#" + Store.container).add("input.luckysheet-mousedown-cancel").keydown(fn);

// 原生 JS 替换
const container = document.getElementById(Store.container);
const inputs = document.querySelectorAll("input.luckysheet-mousedown-cancel");
[container, ...inputs].forEach(el => el.addEventListener('keydown', fn));
```

**涉及文件**：keyboard.js(3)

### B5. 动态ID选择器 `$("#" + variable)` — 同一动态ID重复查询（50+处）

**特殊效果**：由变量拼接的 ID 选择器，在同一函数内经常被重复构建和查询。jQuery 每次都执行完整的 DOM 查询，而原生 JS 可以缓存 `getElementById` 结果。

```js
// jQuery 原代码（postil.js 中 15+ 次重复）
if ($("#luckysheet-postil-show_" + r + "_" + c).length > 0) {
    $("#luckysheet-postil-show_" + r + "_" + c).remove();
}
// ... 其他函数中
let ctx = $("#luckysheet-postil-show_" + r + "_" + c + " .arrowCanvas").get(0).getContext("2d");
$("#luckysheet-postil-show_" + r + "_" + c + " .formulaInputFocus").focus();

// 原生 JS 替换（缓存变量）
const postilId = "luckysheet-postil-show_" + r + "_" + c;
const postilEl = document.getElementById(postilId);
if (postilEl) {
    postilEl.remove();
}
// ... 其他函数中
const postilEl = document.getElementById(postilId);
if (postilEl) {
    postilEl.querySelector(".arrowCanvas").getContext("2d");
    postilEl.querySelector(".formulaInputFocus").focus();
}
```

**涉及文件**：postil.js(15+), imageCtrl.js(3), resize.js(15+), keyboard.js(5), updateCell.js(2), sheetBar.js(3), method.js(2), createdom.js(1), sheetLayout.js(1), domUtils.js(1), filterActions.js(3), filterColorEvents.js(2), scrollAdapt.js(2), formulaBar.js(2), rangeHighlight.js(2), rangeSelect.js(2), conditionformat/index.js(3)

### B6. `$(nativeElement).closest(jQueryObj)` — 原生元素与 jQuery 对象混合比较（2处）

**特殊效果**：`$(span).closest(inputBox.el)` 中 `inputBox.el` 是 jQuery 对象，`.closest()` 接受 jQuery 对象作为选择器。原生 `closest()` 只接受 CSS 选择器字符串。

```js
// jQuery 原代码
let box = $(span).closest(inputBox.el).get(0);

// 原生 JS 替换
// inputBox.el 是 jQuery 对象，需要获取其选择器或 DOM 元素
let box = span.closest('#luckysheet-input-box');
// 或如果 inputBox.el[0] 是已知 DOM 元素，直接比较
let box = span.closest(inputBox.el[0].tagName.toLowerCase());
```

**涉及文件**：inlineString.js(2)

### B7. `$($item.toArray().reverse()).each()` — 反转遍历（2处）

**特殊效果**：将 jQuery 集合转为数组、反转、再包装为 jQuery 对象遍历。原生 JS 直接用 `Array.from().reverse().forEach()` 即可。

```js
// jQuery 原代码
$($item.toArray().reverse()).each(function(i, e) {
    let val = $(e).find(".input").val().trim();
});

// 原生 JS 替换
const items = Array.from(document.querySelectorAll(selector)).reverse();
items.forEach(e => {
    const val = e.querySelector(".input").value.trim();
});
```

**涉及文件**：ifFormulaGenerator.js(1), orderBy.js(1)

### B8. `.not()` 内嵌复杂选择器表达式（2处）

**特殊效果**：`.not()` 的参数本身是一个 jQuery 查询链的结果。

```js
// jQuery 原代码
$(".filter-options").not($(".filter-options").eq(idx).get(0)).each(function() { ... });

// 原生 JS 替换
const allOptions = document.querySelectorAll(".filter-options");
const excludeEl = allOptions[idx];
Array.from(allOptions).filter(el => el !== excludeEl).forEach(el => { ... });
```

**涉及文件**：filterActions.js(1), filterColorEvents.js(1)

### B9. `:visible` / `:checked` / `:selected` / `:radio` 伪选择器在 `querySelectorAll` 中（20+处）

**特殊效果**：jQuery 伪选择器不是标准 CSS，原生 `querySelectorAll` 不支持。直接传入会抛出语法错误。

| jQuery 伪选择器 | 原生 JS 替换 | 说明 |
|----------------|-------------|------|
| `:visible` | 先 `querySelectorAll` 再 `filter(el => el.offsetWidth > 0)` | `offsetWidth > 0` 检测元素是否在布局中占据空间 |
| `:checked` | `querySelectorAll("input").filter(el => el.checked)` | 适用于 checkbox/radio |
| `:selected` | `querySelectorAll("option").filter(el => el.selected)` | 适用于 `<option>` 元素 |
| `:radio` | `querySelectorAll('input[type="radio"]')` | 等效属性选择器 |
| `:eq(N)` | `querySelectorAll(selector)[N]` | 直接索引访问 |
| `:first` | `querySelector(selector)` | querySelector 返回第一个匹配 |
| `:last` | `querySelectorAll(selector)` 取最后一个 | 无直接等价物 |
| `:header` | `querySelectorAll("h1,h2,h3,h4,h5,h6")` | 等效标签选择器组合 |

**涉及文件**：sheetBar.js(2), sheetLayout.js(1), initEditRuleEvents.js(2), initNewRuleEvents.js(2), filterCheckboxEvents.js(2), locationCell.js(1), searchReplace.js(3), keyboard.js(2), conditionformat/index.js(3)

### B10. `$(document).off(".namespace")` — 命名空间批量解绑（1处）

**特殊效果**：`$(document).off(".luckysheetEvent")` 一次性移除所有 `xxx.luckysheetEvent` 命名空间的事件。原生 JS 没有命名空间概念，必须逐个移除。

```js
// jQuery 原代码
$(document).off(".luckysheetEvent");

// 原生 JS 替换（需要事件注册表支持）
offNS("luckysheetEvent"); // 使用迁移工具函数
```

**涉及文件**：method.js(1)

### B11. `.is(jQueryObject)` — jQuery 对象作为 `.is()` 参数（4处）

**特殊效果**：jQuery 的 `.is()` 方法可以接受另一个 jQuery 对象作为参数，比较 DOM 元素引用。原生 `Element.matches()` 只接受 CSS 选择器字符串，不支持元素引用比较。

```js
// jQuery 原代码（rangeHighlight.js）
} else if (anchor.is(richTextEditor.el) || anchor.is(functionBox.el)) {

// 原生 JS 替换（比较 DOM 元素引用）
} else if (anchor[0] === richTextEditor.el[0] || anchor[0] === functionBox.el[0]) {
// 或如果已迁移为原生元素：
} else if (anchor === richTextEditor.el || anchor === functionBox.el) {
```

**涉及文件**：rangeHighlight.js(2), rangeSelect.js(2)

### B12. `.prevAll(":visible").eq(0)` / `.nextAll(":visible").eq(0)` 复合遍历（2处）

**特殊效果**：`.prevAll()` / `.nextAll()` 返回所有前/后兄弟元素（逆序/正序），加上 `:visible` 过滤和 `.eq(0)` 取第一个。原生 JS 需要手动遍历兄弟链。

```js
// jQuery 原代码
luckysheetcurrentSheetitem.prevAll(":visible").eq(0)
luckysheetcurrentSheetitem.nextAll(":visible").eq(0)

// 原生 JS 替换
function prevVisibleSibling(el) {
    let sibling = el.previousElementSibling;
    while (sibling) {
        if (sibling.offsetWidth > 0) return sibling;
        sibling = sibling.previousElementSibling;
    }
    return null;
}
function nextVisibleSibling(el) {
    let sibling = el.nextElementSibling;
    while (sibling) {
        if (sibling.offsetWidth > 0) return sibling;
        sibling = sibling.nextElementSibling;
    }
    return null;
}
```

**涉及文件**：sheetBar.js(2)

### B13. `.find("option:selected").val()` — 伪选择器 + find 组合（5处）

**特殊效果**：在 `<select>` 元素内查找选中的 `<option>`。`:selected` 是 jQuery 伪选择器，原生 JS 用 `select.value` 或 `select.selectedIndex` 替代。

```js
// jQuery 原代码
$(this).find("option:selected").val();
searchFormula.find("#formulaTypeSelect option:selected").val();

// 原生 JS 替换
this.value;  // <select>.value 直接返回选中项的值
document.getElementById("formulaTypeSelect").value;
```

**涉及文件**：initRuleTypeEvents.js(1), ifFormulaGenerator.js(2), initEditRuleEvents.js(1), insertFormula.js(1)

### B14. `.find("input:radio:checked")` / `.find("input:checkbox:checked")` — 复合伪选择器（4处）

**特殊效果**：多个 jQuery 伪选择器组合使用，原生 `querySelectorAll` 均不支持。需要转换为等效的 CSS 属性选择器 + JS 过滤。

```js
// jQuery 原代码
$(this).find('input:radio:checked').val();
$("#luckysheet-splitColumn-dialog .box input[type='checkbox']:checked").each(function(i, e){
let $checkbox = $radio.siblings(".subbox").find("input:checkbox:checked");

// 原生 JS 替换
this.querySelector('input[type="radio"]:checked').value;
document.querySelectorAll("#luckysheet-splitColumn-dialog .box input[type='checkbox']:checked")
    .forEach((e, i) => { ... });
radio.closest(".subbox").querySelectorAll("input[type='checkbox']:checked");
```

**注意**：`:checked` 是标准 CSS 伪类，`querySelectorAll` 支持！只有 `:radio` 不是标准的，需替换为 `input[type="radio"]`。

**涉及文件**：orderBy.js(1), splitColumn.js(1), locationCell.js(1), filterActions.js(1)

### B15. `.find(".day:visible")` — 可见性伪选择器 + find（3处）

**特殊效果**：在 `.find()` 中使用 `:visible` 伪选择器，这在原生 JS 中完全不支持。必须先查询所有匹配元素，再手动过滤可见元素。

```js
// jQuery 原代码
let $monthDay = $(e).closest(".dayList").find(".day:visible");
let $yearDay = $(e).closest(".monthList").find(".day:visible");

// 原生 JS 替换
const dayList = e.closest(".dayList");
const visibleDays = Array.from(dayList.querySelectorAll(".day")).filter(el => el.offsetWidth > 0);
const monthList = e.closest(".monthList");
const visibleYearDays = Array.from(monthList.querySelectorAll(".day")).filter(el => el.offsetWidth > 0);
```

**涉及文件**：filterActions.js(3)

### B16. `.filter("[class*='sp-palette']")` — 属性包含选择器（4处）

**特殊效果**：jQuery `.filter()` 接受 CSS 属性选择器对集合进行过滤。原生 JS 中 `Element.matches()` 支持标准 CSS 选择器，可以直接使用。

```js
// jQuery 原代码
$(event.target).filter("[class*='sp-palette']").length == 0
$(event.target).filter("[class*='sp-thumb']").length == 0
$(event.target).filter("[class*='sp-']").length == 0

// 原生 JS 替换
!event.target.matches("[class*='sp-palette']")
!event.target.matches("[class*='sp-thumb']")
!event.target.matches("[class*='sp-']")
```

**涉及文件**：cursorPos.js(4)

### B17. `.data()` 内部缓存 vs `dataset` 行为差异（~10处关键差异）

**特殊效果**：jQuery `.data()` 有内部缓存机制，与 `dataset` 存在三个关键差异：

| 行为 | jQuery `.data()` | 原生 `dataset` | 影响 |
|------|-----------------|---------------|------|
| 读取来源 | 先查内部缓存，再查 `data-*` 属性 | 只读 `data-*` 属性 | `.data("key")` 可能读到之前通过 `.data("key", val)` 设置但未写回 DOM 的值 |
| 类型转换 | 自动尝试 JSON 解析数字/布尔/对象 | 始终返回字符串 | `.data("count")` 对 `data-count="5"` 返回数字 `5`，`dataset.count` 返回 `"5"` |
| 写入目标 | 只写内部缓存，不修改 DOM 属性 | 直接修改 DOM 属性 | `.data("key", val)` 后 `attr("data-key")` 看不到变化 |

```js
// jQuery 原代码
el.data("range", cellrange);  // 写入 jQuery 内部缓存
el.data("range");              // 从 jQuery 内部缓存读取（可能是对象）

// 原生 JS 替换方案 1：使用 dataset（仅支持字符串）
el.dataset.range = JSON.stringify(cellrange);  // 必须序列化
JSON.parse(el.dataset.range);                   // 读取时反序列化

// 原生 JS 替换方案 2：使用 WeakMap（支持任意类型，不修改 DOM）
const _dataCache = new WeakMap();
_dataCache.set(el, { range: cellrange });  // 写入
_dataCache.get(el).range;                   // 读取（原始对象引用）
```

**涉及文件**：rangeHighlight.js(2), sheetBar.js(2), filterMenuEvents.js(1), alternateformatObj.js(2), filterOptionClick.js(3), labelFilterOptionState.js(1), sheetVisibility.js(1), inputBoxIndex.js(1)

### B18. `.val().trim()` 对可能不存在的元素调用 — null 安全隐患（5+处）

**特殊效果**：jQuery 对不存在的元素调用 `.val()` 返回 `undefined`，后续 `.trim()` 会抛出 TypeError。但 jQuery 的链式调用在空集合上会静默跳过，所以如果写成 `$("#id").val()` 而不是 `$("#id").val().trim()`，不会报错。问题出在将 `.val()` 的返回值直接链式调用原生方法。

```js
// jQuery 原代码（危险！元素不存在时 .val() 返回 undefined，.trim() 报错）
let v1 = $("#luckysheet-editorConditionRule-dialog #conditionVal input").val().trim();

// 原生 JS 替换（安全写法）
const input = document.querySelector("#luckysheet-editorConditionRule-dialog #conditionVal input");
const v1 = input ? input.value.trim() : "";
```

**涉及文件**：initEditRuleEvents.js(2), initNewRuleEvents.js(2), hyperlinkCtrl.js(1)

### B19. `.not(this).each()` — 排除当前元素（2处）

**特殊效果**：`.not(this)` 从 jQuery 集合中排除当前元素（DOM 引用比较）。原生 JS 用 `!==` 比较即可。

```js
// jQuery 原代码
$("#... .luckysheet-filter-options").not(this).each(function () { ... });

// 原生 JS 替换
document.querySelectorAll(".luckysheet-filter-options").forEach(el => {
    if (el !== this) { ... }
});
```

**涉及文件**：filterOptionClick.js(1), filterColorEvents.js(1)

### B20. `$(htmlString)` 创建后 `.get(0)` / `[0]` 转原生（6处）

**特殊效果**：用 jQuery 创建临时 DOM 元素用于生成 HTML 字符串或获取原生元素，最终不需要 jQuery 对象本身。

```js
// jQuery 原代码（htmlTableBuilder.js — 创建临时元素生成 HTML）
var font = $("<font></font>");
val.fs && font.css("font-size", val.fs + "pt");
val.bl && font.css("font-weight", "bold");
return font[0].outerHTML;

// 原生 JS 替换
const font = document.createElement("font");
if (val.fs) font.style.fontSize = val.fs + "pt";
if (val.bl) font.style.fontWeight = "bold";
return font.outerHTML;
```

```js
// jQuery 原代码（workbook.js — 创建 canvas 获取 2D 上下文）
let newCanvas = $("<canvas>").attr({ width: w, height: h }).css({ width: cw, height: ch });
let ctx = newCanvas.get(0).getContext("2d");

// 原生 JS 替换
const canvas = document.createElement("canvas");
canvas.width = w;
canvas.height = h;
canvas.style.width = cw + "px";
canvas.style.height = ch + "px";
const ctx = canvas.getContext("2d");
```

**涉及文件**：htmlTableBuilder.js(1), workbook.js(1), drawMain.js(2), postil.js(1), initBorder.js(1)

---

## 附录 C：迁移工具函数设计

### C1. 命名空间事件注册表

```js
const _nsHandlers = new Map();

function onNS(target, eventNs, selector, handler) {
    const [event, namespace] = eventNs.split('.');
    const delegateHandler = selector
        ? function(e) {
            const t = e.target.closest(selector);
            if (t && target.contains(t)) handler.call(t, e);
        }
        : handler;
    const key = namespace || event;
    if (!_nsHandlers.has(key)) _nsHandlers.set(key, []);
    _nsHandlers.get(key).push({ event, original: handler, delegate: delegateHandler, target });
    target.addEventListener(event, delegateHandler);
}

function offNS(namespace) {
    if (!_nsHandlers.has(namespace)) return;
    _nsHandlers.get(namespace).forEach(({ event, delegate, target }) => {
        target.removeEventListener(event, delegate);
    });
    _nsHandlers.delete(namespace);
}
```

### C2. 深合并函数

```js
function deepMerge(target, ...sources) {
    for (const source of sources) {
        if (source === null || typeof source !== 'object') continue;
        for (const key of Object.keys(source)) {
            const tv = target[key], sv = source[key];
            if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
                if (tv && typeof tv === 'object' && !Array.isArray(tv)) {
                    deepMerge(tv, sv);
                } else {
                    target[key] = deepMerge({}, sv);
                }
            } else {
                target[key] = sv;
            }
        }
    }
    return target;
}
```

### C3. 可见性过滤辅助

```js
function filterVisible(nodeList) {
    return Array.from(nodeList).filter(el => el.offsetWidth > 0 && el.offsetHeight > 0);
}
```

---

## 附录 D：jQuery vs 原生 JS 核心行为差异对照表

> **这是迁移中最容易出问题的部分**。jQuery 和原生 JS 在看似等效的 API 下存在大量隐式行为差异，不了解这些差异会导致运行时错误或视觉 bug。

### D1. Null 安全行为

| 场景 | jQuery 行为 | 原生 JS 行为 | 迁移方案 |
|------|-----------|------------|---------|
| `$("#nonexistent").css("color", "red")` | 静默无操作 | `null.style.color = "red"` → TypeError | `const el = document.getElementById("id"); if (el) el.style.color = "red";` |
| `$("#nonexistent").val()` | 返回 `undefined` | `null.value` → TypeError | `const el = document.getElementById("id"); const val = el ? el.value : undefined;` |
| `$("#nonexistent").show()` | 静默无操作 | `null.style.display = ''` → TypeError | 先判空 |
| `$(".nonexistent").each(fn)` | 不执行回调 | `NodeList.forEach` 对空列表不执行 | 行为一致，无需特殊处理 |
| `$("#nonexistent").length` | 返回 `0` | `document.getElementById()` 返回 `null` | 用 `!== null` 或可选链 `?.` |

### D2. 隐式迭代

| 场景 | jQuery 行为 | 原生 JS 行为 | 迁移方案 |
|------|-----------|------------|---------|
| `$(".cls").css("color", "red")` | 自动对所有匹配元素设置 | `querySelector(".cls").style.color` 只设置第一个 | `querySelectorAll(".cls").forEach(el => el.style.color = "red")` |
| `$(".cls").on("click", fn)` | 自动对所有匹配元素绑定 | `querySelector(".cls").addEventListener` 只绑第一个 | `querySelectorAll(".cls").forEach(el => el.addEventListener("click", fn))` |
| `$(".cls").addClass("on")` | 自动对所有匹配元素添加类 | 同上 | `querySelectorAll(".cls").forEach(el => el.classList.add("on"))` |

### D3. 返回值类型差异

| 方法 | jQuery 返回 | 原生 JS 返回 | 影响 |
|------|-----------|------------|------|
| `$("#id").css("width")` | 字符串 `"100px"` | `getComputedStyle(el).width` → `"100px"` | 一致 |
| `$("#id").width()` | 数字 `100` | `getBoundingClientRect().width` → `100.5` | jQuery 取整，原生可能返回小数 |
| `$("#id").offset()` | `{top: Number, left: Number}` | 需手动计算 `getBoundingClientRect() + pageXOffset` | 原生需组合计算 |
| `$("#id").position()` | `{top: Number, left: Number}` | `{top: el.offsetTop, left: el.offsetLeft}` | 含义不同：jQuery 相对于 offsetParent，原生相对于 offsetParent |
| `$("#id").val()` | 字符串或数组(multi-select) | `el.value` 字符串 | multi-select 需特殊处理 |
| `$("#id").html()` | 字符串 | `el.innerHTML` 字符串 | 一致 |
| `$("#id").text()` | 字符串（递归所有子节点） | `el.textContent` 字符串 | 一致 |

### D4. `.css()` getter 行为

| 场景 | jQuery 行为 | 原生 JS 行为 | 迁移方案 |
|------|-----------|------------|---------|
| `el.css("width")` | 返回计算样式（无论是否内联设置） | `el.style.width` 只返回内联样式 | 用 `getComputedStyle(el).width` |
| `el.css("display")` | 返回计算后的 display 值 | `el.style.display` 可能返回 `""` | 用 `getComputedStyle(el).display` |
| `el.css(["width", "height"])` | 返回 `{width: "100px", height: "50px"}` | 无等价 API | 分别调用 `getComputedStyle` |

### D5. `.width()` / `.height()` 计算方式

| 方法 | jQuery 计算 | 原生等价 | 差异说明 |
|------|-----------|---------|---------|
| `.width()` | `Math.round(el.getBoundingClientRect().width)` | `el.getBoundingClientRect().width` | jQuery 会取整，原生返回浮点数 |
| `.innerWidth()` | `el.clientWidth` | `el.clientWidth` | 一致（含 padding，不含 border） |
| `.outerWidth()` | `el.offsetWidth` | `el.offsetWidth` | 一致（含 padding + border） |
| `.outerWidth(true)` | `el.offsetWidth + computed margin` | 需手动加 `getComputedStyle` margin | jQuery 含 margin |

**关键差异**：`clientWidth` 含 padding，`getBoundingClientRect().width` 含 padding + border。jQuery `.width()` 不含 padding 和 border，最接近 `getBoundingClientRect().width - borderLeft - borderRight`。但在 Luckysheet 中，canvas 元素的 border 为 0，所以 `getBoundingClientRect().width` 与 jQuery `.width()` 等效。

### D6. `.show()` / `.hide()` 行为

| 场景 | jQuery 行为 | 原生 JS 行为 | 迁移方案 |
|------|-----------|------------|---------|
| `.hide()` | 设置 `display: none` 并记住旧值 | `el.style.display = 'none'` | 一致 |
| `.show()` | 恢复之前的 display 值 | `el.style.display = ''` 恢复为 CSS 默认 | **差异！** 如果元素默认 `display: inline`，jQuery 恢复为 `inline`，原生恢复为 CSS 默认值 |
| `.toggle()` | 切换显示/隐藏 | 无等价 | `el.style.display = el.style.display === 'none' ? '' : 'none'` |

**Luckysheet 中的实际情况**：所有被 `.show()`/`.hide()` 控制的元素，其 CSS 默认 display 值与 jQuery 记住的值一致（都是 `block` 或 `""`），所以 `style.display = ''` 足够。

### D7. `.data()` 缓存机制

详见 B17 节。核心差异：
- jQuery `.data("key", val)` 写入内部缓存，不修改 DOM
- 原生 `el.dataset.key = val` 修改 DOM 属性
- jQuery `.data("key")` 自动类型转换（`"5"` → `5`）
- 原生 `el.dataset.key` 始终返回字符串

### D8. 事件对象差异

| 属性/方法 | jQuery 事件 | 原生事件 | 迁移方案 |
|----------|-----------|---------|---------|
| `e.preventDefault()` | 有 | 有 | 一致 |
| `e.stopPropagation()` | 有 | 有 | 一致 |
| `e.stopImmediatePropagation()` | 有 | 有 | 一致 |
| `e.which` | 标准化为键码 | 无（用 `e.key` 或 `e.code`） | `e.which` → `e.key` 或 `e.keyCode` |
| `e.pageX` / `e.pageY` | 有 | 有 | 一致 |
| `e.delegateTarget` | 事件委托的容器元素 | 无 | 需手动通过闭包或 `e.currentTarget` |
| `return false` | 等同 `preventDefault + stopPropagation` | 只阻止默认行为 | 需显式调用两个方法 |

### D9. `.val()` 返回值

| 元素类型 | jQuery `.val()` | 原生 `.value` | 差异 |
|---------|----------------|-------------|------|
| `<input type="text">` | 字符串 | 字符串 | 一致 |
| `<input type="checkbox">` | `"on"` 或 `value` 属性值 | `"on"` 或 `value` 属性值 | 一致 |
| `<select multiple>` | 数组 `["v1", "v2"]` | 字符串（仅第一个选中项） | **差异！** 需 `Array.from(select.selectedOptions).map(o => o.value)` |
| `<textarea>` | 字符串 | 字符串 | 一致 |

### D10. `.trigger()` vs `dispatchEvent()`

```js
// jQuery 原代码
$(element).trigger('click');

// 原生 JS 替换
element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
```

**注意**：`dispatchEvent` 不会触发浏览器默认行为（如导航、提交），jQuery 的 `.trigger()` 也不会。但 `el.click()` 会触发默认行为。

**涉及文件**：keyboard.js(1)

---

## 附录 E：Null 安全与错误处理策略

> **这是迁移中最容易被忽视但最容易导致运行时崩溃的问题**。jQuery 的 null 安全行为使得代码中大量存在"不检查元素是否存在就调用方法"的模式，迁移到原生 JS 后这些地方都会抛出 TypeError。

### E1. 元素不存在时的行为差异

```js
// jQuery：安全，不报错
$("#nonexistent").css("color", "red");   // 静默无操作
$("#nonexistent").val();                  // 返回 undefined
$("#nonexistent").show();                 // 静默无操作
$("#nonexistent").on("click", fn);        // 静默无操作

// 原生 JS：不安全，抛出 TypeError
document.getElementById("nonexistent").style.color = "red";   // TypeError: Cannot read properties of null
document.getElementById("nonexistent").value;                  // TypeError
document.getElementById("nonexistent").style.display = '';     // TypeError
document.getElementById("nonexistent").addEventListener(...);   // TypeError
```

### E2. 安全访问模式

**模式 A：先获取再判断（推荐）**

```js
const el = document.getElementById("id");
if (el) {
    el.style.color = "red";
}
```

**模式 B：可选链（适用于取值场景）**

```js
const value = document.getElementById("id")?.value;
const width = document.getElementById("id")?.getBoundingClientRect().width;
```

**模式 C：短路赋值（适用于设置场景）**

```js
const el = document.getElementById("id");
el && (el.style.color = "red");
```

**模式 D：`querySelector` 返回 null（与 `getElementById` 一致）**

```js
const el = document.querySelector(".cls");
if (el) {
    el.classList.add("on");
}
```

### E3. UI 组件惰性加载模式迁移

项目中 `src/ui/` 下的组件大量使用"惰性加载 + `.length` 检查"模式缓存 jQuery 引用：

```js
// jQuery 原代码（selectionCopy.js）
get el() {
    if (!this._el || this._el.length === 0) this._el = $("#luckysheet-selection-copy");
    return this._el;
}
isVisible() { return this.el.is(":visible"); }

// 原生 JS 替换
get el() {
    if (!this._el || !document.body.contains(this._el)) {
        this._el = document.getElementById("luckysheet-selection-copy");
    }
    return this._el;
}
isVisible() { return this.el && this.el.offsetWidth > 0; }
```

**关键差异**：
- jQuery `.length === 0` 检查集合是否为空
- 原生 JS `getElementById` 返回 `null`，用 `!== null` 检查
- jQuery `el.closest("body").length === 0` 检查元素是否仍在 DOM 中
- 原生 JS `document.body.contains(el)` 检查元素是否仍在 DOM 中

**涉及文件**：selectionCopy.js, canvasContext.js, sheetContainer.js, formulaDialogs.js, inputBox.js, functionBox.js, imageDialog.js, formulaRangeSelect.js, countShow.js, searchFormula.js, conditionformatDialog.js, cellSelectedFocus.js, gridWindow.js, cellMain.js

### E4. `.length` 检查迁移

| jQuery 模式 | 原生 JS 替换 | 说明 |
|------------|------------|------|
| `$("#id").length > 0` | `document.getElementById("id") !== null` | ID 选择器 |
| `$(".cls").length > 0` | `document.querySelector(".cls") !== null` | 类选择器 |
| `$(selector).length === 0` | `document.querySelector(selector) === null` | 不存在检查 |
| `el.find(".cls").length > 0` | `el.querySelector(".cls") !== null` | 子元素存在检查 |
| `el.closest(".cls").length > 0` | `el.closest(".cls") !== null` | 祖先存在检查 |
| `el.siblings().length` | `el.parentElement.children.length - 1` | 兄弟数量 |

### E5. `.get(0)` / `[0]` 转原生元素迁移

项目中大量使用 `.get(0)` 或 `[0]` 从 jQuery 对象提取原生 DOM 元素，主要用于：
1. 获取 Canvas 2D 上下文：`el.get(0).getContext("2d")`
2. 访问原生 `style` 属性：`el.get(0).style.cssText`
3. 获取 `scrollWidth` / `scrollHeight`
4. 传给需要原生 DOM 元素的函数

迁移后，如果 `el` 已经是原生 DOM 元素，直接去掉 `.get(0)` / `[0]` 即可：

```js
// jQuery 原代码
let ctx = canvasEl.get(0).getContext("2d");
let scrollW = container.get(0).scrollWidth;

// 原生 JS 替换
let ctx = canvasEl.getContext("2d");
let scrollW = container.scrollWidth;
```

**涉及文件**：canvasContext.js(3), inputBox.js(3), postil.js(1), drawMain.js(2), workbook.js(2), initBorder.js(2), rangeSelect.js(2), cursorManager.js(1), resize.js(2), sheetContainer.js(1), functionBox.js(1), handleCellMousedown.js(1), ruleManager.js(1), updateCell.js(1)

### E6. `.index()` 获取索引迁移（13处）

```js
// jQuery 原代码
let index = $(this).index();
let index = $(".ruleTypeItem.on").index();

// 原生 JS 替换
let index = Array.from(this.parentElement.children).indexOf(this);
let index = Array.from(document.querySelector(".ruleTypeItem.on").parentElement.children)
    .indexOf(document.querySelector(".ruleTypeItem.on"));
```

**涉及文件**：initEditRuleEvents.js(1), initNewRuleEvents.js(1), insertFormula.js(2), handleCellMousedown.js(1), initColHeaderEvents.js(1), initRowHeaderEvents.js(1), functionSearch.js(1), formulaBar.js(1), alternateformatObj.js(1), dialog.js(1), initRuleTypeEvents.js(1)

---

## 附录 F：迁移风险评估与验证清单

### F1. 高风险迁移点

| 风险点 | 原因 | 验证方法 |
|-------|------|---------|
| `.width()` / `.height()` 替换 | `clientWidth` 含 padding，`getBoundingClientRect()` 含 border，jQuery 取整 | 对比 canvas 尺寸是否正确 |
| `.show()` 替换 | CSS 默认 display 可能与 jQuery 记住的不同 | 隐藏再显示后检查布局 |
| `.data()` 替换 | 内部缓存 vs dataset，类型转换差异 | 检查 `data-*` 属性读写是否正确 |
| `.end()` 拆分 | 拆分后变量引用可能指向错误元素 | 逐步调试确认每个 querySelector 目标正确 |
| 命名空间事件 | `offNS` 必须正确匹配 `onNS` 注册的 handler | 触发事件后检查是否重复绑定 |
| `:visible` 伪选择器 | `offsetWidth > 0` 在 `display: none` 的父元素下行为不同 | 隐藏父元素后检查子元素可见性判断 |
| Null 安全 | 原生 JS 对 null 调用方法会崩溃 | 在对话框未打开时触发相关代码 |

### F2. 每批次验证步骤

1. **P0 验证**：页面加载后检查控制台无报错，窗口 resize 后布局正确
2. **P1 验证**：对话框打开/关闭正常，body 下的菜单显示正确
3. **P2 验证**：所有表单输入/输出正确，CSS 操作视觉效果一致，事件绑定/解绑正确
4. **P3 验证**：`$(this)` 相关的交互（点击、拖拽、选择）全部正常，链式调用拆分后行为一致
