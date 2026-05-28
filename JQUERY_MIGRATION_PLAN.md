# Luckysheet jQuery 迁移计划与进度追踪

> 创建日期：2026-05-28
> 状态：📋 计划中 | 🔄 进行中 | ✅ 已完成 | ⏸️ 暂停 | ❌ 取消

---

## 一、项目 jQuery 依赖现状总览

| 指标 | 数值 |
|------|------|
| 使用 jQuery 的源码文件 | **~90+** 个（不含第三方库） |
| jQuery 引用总次数 | **~2670** 处 |
| jQuery 操作类别 | **9 大类** |
| 依赖的 jQuery 第三方插件 | **3 个**（spectrum、mousewheel、sPage） |
| jQuery UI | **打包但未使用**（冗余依赖） |

### 各类别使用占比

```
DOM 选择器查询 ($())    ████████████████████████████  ~42%  (1991)
CSS/属性操作            ████████████████             ~24%  (1147)
事件绑定/处理           ██████████                   ~16%  (758)
DOM 操作 (增删改)       ████████                     ~13%  (617)
工具方法                ███████                      ~11%  (541)
尺寸/位置               █                            ~2%   (84)
遍历/筛选               █                            ~1%   (44)
jQuery 插件调用         █                            ~1%   (28+44)
AJAX 请求               ▏                            ~0.3% (16)
动画效果                (无使用)                      0%
```

---

## 二、jQuery 使用分类与替换方案速查表

### 1. `$.extend(true, {}, obj)` — 深拷贝（200+ 处）⚠️ 最高优先级

**特殊性**：`$.extend(true, {}, source)` 是项目中最核心的 jQuery 依赖，用于撤销/重做系统的状态快照、配置克隆、数据备份。深拷贝行为需完全一致——包括对嵌套对象、数组的递归拷贝，但不拷贝原型链上的属性。

**替换方案**：使用 [klona](https://github.com/lukeed/klona)（仅 240B~501B gzip，零依赖，ESM 原生支持）

```javascript
// 安装：npm install klona

// 深拷贝 — 替换 $.extend(true, {}, source)
import { klona } from 'klona';
const clone = klona(source);

// 浅拷贝合并 — 替换 $.extend({}, defaults, options)
$.extend({}, defaults, options)  →  { ...defaults, ...options }
```

**为什么选 klona 而非 lodash**：

| 对比项 | klona | lodash.cloneDeep |
|--------|-------|------------------|
| gzip 体积 | **240B~501B** | **~24KB** |
| 依赖 | 零依赖 | 依赖整个 lodash 内部模块 |
| ESM 支持 | ✅ 原生 | ❌ 需 lodash-es |
| 性能 | 与 rfdc 接近，远超 lodash | 较慢（基准测试 ~46K ops/s vs klona ~221K ops/s） |
| 类型支持 | JSON/Date/RegExp/Map/Set/TypedArray | 全类型 |

**klona 版本选择**：

| 版本 | gzip 大小 | 能力 | 适用场景 |
|------|----------|------|---------|
| `klona/json` | 240B | 仅 JSON 类型（String/Number/Array/Object/null） | 纯数据对象 |
| `klona/lite` | 354B | + Date、RegExp、自定义 class | 含日期/正则的对象 |
| `klona` | 451B | + Map、Set、TypedArray、DataView、ArrayBuffer | 含集合类型的对象 |
| `klona/full` | 501B | + Symbol 属性、非枚举属性 | 完整覆盖 |

**推荐**：使用 `klona`（默认版本，451B），覆盖项目中的所有数据类型（对象、数组、可能的 Date 等）。

**迁移映射**：

```javascript
// $.extend(true, {}, source) — 深拷贝
$.extend(true, {}, Store.config)         →  klona(Store.config)
$.extend(true, [], file.calcChain)       →  klona(file.calcChain)

// $.extend({}, defaults, options) — 浅拷贝合并
$.extend({}, defaults, options)          →  { ...defaults, ...options }

// $.extend(true, {}, defaultCfg, userCfg) — 深度合并（极少使用，需单独处理）
// 如有深度合并需求，可使用 klona + 手动合并：
const merged = { ...klona(defaultCfg), ...klona(userCfg) };
```

**风险**：klona 不拷贝函数属性。需审计项目中的 `$.extend` 目标对象是否包含函数，如有极少数场景需保留 `$.extend` 或自定义处理。

---

### 2. 事件绑定 `.on()/.off()` — 事件委托（153+ 处）⚠️ 高优先级

**特殊性**：项目大量使用三种模式：

**模式 A — 命名空间事件**（先 off 再 on 防重复绑定）：

```javascript
// jQuery:
$(document).off("click.CFdeleteConditionRule")
    .on("click.CFdeleteConditionRule", "#deleteConditionRule", function () { ... });

// 替换方案：封装事件委托工具
const delegatedHandlers = new Map();

function onDelegate(root, event, selector, namespace, handler) {
    const key = `${event}.${namespace}`;
    offDelegate(root, event, namespace);
    const wrapper = (e) => {
        const target = e.target.closest(selector);
        if (target) handler.call(target, e);
    };
    root.addEventListener(event, wrapper);
    delegatedHandlers.set(key, { wrapper, root });
}

function offDelegate(root, event, namespace) {
    const key = `${event}.${namespace}`;
    const record = delegatedHandlers.get(key);
    if (record) {
        record.root.removeEventListener(event, record.wrapper);
        delegatedHandlers.delete(key);
    }
}
```

**模式 B — 委托事件**：

```javascript
// jQuery:
$("#luckysheet-sheet-area").on("mousedown", "div.luckysheet-sheets-item", function (e) { ... });

// 原生替换：
document.getElementById("luckysheet-sheet-area").addEventListener("mousedown", (e) => {
    const target = e.target.closest("div.luckysheet-sheets-item");
    if (!target) return;
    // handler logic, this → target
});
```

**模式 C — 直接绑定**：

```javascript
// jQuery:
$("#myBtn").on("click", handler);

// 原生替换：
document.getElementById("myBtn").addEventListener("click", handler);
```

---

### 3. `.css()` — 样式操作（200+ 处）

**特殊性**：
- **隐式迭代**：对匹配的所有元素设置样式
- **驼峰/连字符自动转换**：`"background-color"` 和 `"backgroundColor"` 都支持
- **对象参数**：`.css({left: '10px', top: '20px'})`
- **getter 返回计算样式**：`.css('display')` 等价于 `getComputedStyle(el).display`

```javascript
// jQuery → 原生
$("#id").css("left", "10px")            → el.style.left = "10px"
$("#id").css({ left: "10px", top: "20px" }) → Object.assign(el.style, { left: "10px", top: "20px" })
let w = $("#id").css("width")           → getComputedStyle(el).width
$(".class").css("left", "10px")         → document.querySelectorAll(".class").forEach(el => el.style.left = "10px")
```

---

### 4. `.show()/.hide()` — 显示隐藏（200+ 处）

**特殊性**：jQuery 的 `.show()/.hide()` 会记住元素之前的 `display` 值，`.show()` 时恢复到原始 display。但本项目中大部分用法是简单切换，不依赖此特性。

```javascript
// jQuery → 原生
el.show()    → el.style.display = ''       // 恢复 CSS 默认值
el.hide()    → el.style.display = 'none'
// 或使用 HTML5 hidden 属性：
el.hide()    → el.hidden = true
el.show()    → el.hidden = false
```

---

### 5. `.addClass()/.removeClass()/.hasClass()/.toggleClass()` — 类操作（100+ 处）

```javascript
// jQuery → 原生
el.addClass("foo")        → el.classList.add("foo")
el.removeClass("foo")     → el.classList.remove("foo")
el.hasClass("foo")        → el.classList.contains("foo")
el.toggleClass("foo")     → el.classList.toggle("foo")
// 隐式迭代：
$(".class").addClass("active") → document.querySelectorAll(".class").forEach(el => el.classList.add("active"))
```

---

### 6. `.attr()/.prop()/.val()/.html()/.text()` — 属性与内容（100+ 处）

```javascript
// jQuery → 原生
el.attr("id")             → el.getAttribute("id")
el.attr("id", "foo")      → el.setAttribute("id", "foo")
el.removeAttr("id")       → el.removeAttribute("id")
el.prop("checked")        → el.checked
el.prop("checked", true)  → el.checked = true
el.val()                  → el.value
el.val("foo")             → el.value = "foo"
el.html()                 → el.innerHTML
el.html("<b>foo</b>")     → el.innerHTML = "<b>foo</b>"
el.text()                 → el.textContent
el.text("foo")            → el.textContent = "foo"
```

---

### 7. `.is()` — 状态检测（30+ 处）⚠️ 需特别注意伪选择器

**特殊性**：`.is(":visible")` 是最复杂的替换点，`:visible` 不是标准 CSS 选择器。

```javascript
// 封装工具函数
function isVisible(el) {
    return !!(el.offsetParent || el.offsetWidth || el.offsetHeight);
}

// jQuery → 原生
el.is(":visible")    → isVisible(el)
el.is(":hidden")     → !isVisible(el)
el.is(":checked")    → el.checked
el.is(":selected")   → el.selected
el.is(".foo")        → el.matches(".foo")
el.is(":last-child") → el.matches(":last-child")
```

---

### 8. `.find()/.closest()/.parent()/.siblings()/.next()/.prev()` — DOM 遍历（100+ 处）

```javascript
// jQuery → 原生
el.find(".child")         → el.querySelector(".child") / el.querySelectorAll(".child")
el.closest(".parent")     → el.closest(".parent")
el.parent()               → el.parentElement
el.parents(".foo")        → 自定义向上遍历函数
el.siblings()             → Array.from(el.parentElement.children).filter(c => c !== el)
el.next()                 → el.nextElementSibling
el.prev()                 → el.previousElementSibling
el.eq(0)                  → nodeList[0]
el.first()                → nodeList[0]
el.last()                 → nodeList[nodeList.length - 1]
```

---

### 9. `.append()/.remove()/.empty()/.prepend()` — DOM 创建/修改（100+ 处）

```javascript
// jQuery → 原生
el.append(html)           → el.insertAdjacentHTML('beforeend', html)
el.prepend(html)          → el.insertAdjacentHTML('afterbegin', html)
el.after(html)            → el.insertAdjacentHTML('afterend', html)
el.remove()               → el.remove()
el.empty()                → el.innerHTML = ''
$(htmlString).appendTo($target) → $target.insertAdjacentHTML('beforeend', htmlString)
```

---

### 10. `.scrollTop()/.scrollLeft()/.width()/.height()/.offset()` — 尺寸位置（130+ 处）

```javascript
// jQuery → 原生
el.scrollTop()            → el.scrollTop
el.scrollTop(100)         → el.scrollTop = 100
el.scrollLeft()           → el.scrollLeft
el.scrollLeft(100)        → el.scrollLeft = 100
el.width()                → el.clientWidth / getBoundingClientRect().width
el.height()               → el.clientHeight / getBoundingClientRect().height
el.outerWidth()           → el.offsetWidth
el.outerHeight()          → el.offsetHeight
el.offset()               → { top: el.getBoundingClientRect().top + window.scrollY, left: el.getBoundingClientRect().left + window.scrollX }
el.position()             → { top: el.offsetTop, left: el.offsetLeft }
```

---

### 11. `.data()` — 数据存储（71 处）

**特殊性**：
1. 自动将 `data-foo-bar` 转为驼峰 `fooBar`
2. 数据存储在内部缓存中，不写入 DOM 属性（读取时先看缓存，再看 `data-*` 属性）

```javascript
// 方案 A（推荐简单值）：使用 dataset
el.data("key")            → el.dataset.key
el.data("key", "value")   → el.dataset.key = "value"

// 方案 B（复杂对象值）：使用 WeakMap
const dataStore = new WeakMap();
function getData(el, key) {
    const data = dataStore.get(el) || {};
    return data[key];
}
function setData(el, key, value) {
    const data = dataStore.get(el) || {};
    data[key] = value;
    dataStore.set(el, data);
}
```

---

### 12. `.end()` — 链式回退（49 处）⚠️ 高难度

**特殊性**：`.end()` 回退到前一个 jQuery 选择集，无原生等价物。必须将链拆解为多步操作。

```javascript
// jQuery:
$("#id").find(".child1").css("x", "1").end().find(".child2").css("y", "2");

// 原生替换：
const el = document.getElementById("id");
el.querySelector(".child1").style.x = "1";
el.querySelector(".child2").style.y = "2";
```

---

### 13. AJAX — `$.post()/$.ajax()`（16 处）

```javascript
// jQuery:
$.post(url, data, callback);

// fetch 替换：
async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data)
    });
    return response.text();
}

// $.ajax 替换：
const response = await fetch(url, {
    method: 'POST',
    headers: { "x-auth-token": token, "Content-Type": dataType },
    body: JSON.stringify(param)
});
const data = await response.json();
```

---

### 14. 颜色选择器 — 完全自研替换 spectrum（37 处 / 9 文件）

**策略**：不使用任何第三方颜色选择器库，根据项目实际使用的功能完全自研一个轻量颜色选择器组件。spectrum 在项目中仅使用了其色板模式的极小子集，完全可以自行实现。

#### 14.1 项目中 spectrum 实际使用的功能分析

项目中 spectrum 以 **3 种视觉形态** 存在：

**形态 A — 内嵌色板模式**（6 处，工具栏边框色/背景色/文字色 + 图片控制/交替格式）：
- `flat: true` + `showPaletteOnly: true` + `togglePaletteOnly: true`
- 初始显示 8×8 预设色板网格
- 底部"自定义颜色"按钮，点击展开 HSV 选择器
- 选择颜色后自动收起（`hideAfterPaletteSelect: true`）
- 部分场景隐藏确认/取消按钮（`showButtons: false`），使用 `move` 回调实时预览
- 部分场景显示按钮，使用 `change` 回调确认选择

**形态 B — 完整选择器模式**（1 处，Sheet 标签颜色）：
- `flat: true`，无 `showPaletteOnly`
- 色板 + HSV 选择器同时可见
- 选择后不自动隐藏（`hideAfterPaletteSelect: false`）
- 使用 10 列色板 + ECharts 图表色行

**形态 C — 下拉色板模式**（1 处，条件格式）：
- 非 flat（下拉弹出），`showPaletteOnly: true`
- 点击输入框弹出仅色板面板

**核心 API 使用**：
- `spectrum({ ...config })` — 初始化
- `spectrum("get").toHexString()` — 获取 HEX 颜色值（12 处）
- `spectrum("get").toRgbString()` — 获取 RGB 颜色值（6 处，仅色阶场景）
- `spectrum("set", color)` — 编程设置颜色（9 处）
- `change` 回调 — 确认选择时触发（6 处）
- `move` 回调 — 拖动时实时触发（3 处）
- `localStorageKey` — 持久化最近使用色（8 处）

**色板数据**：
- 标准 8×8 色板（7 处使用，与 Google Sheets 默认色板一致）
- Sheet 标签专用色板（1 处，10 列 + ECharts 图表色）

#### 14.2 自研颜色选择器设计

**文件位置**：`src/components/ColorPicker/`

```
src/components/ColorPicker/
├── index.js          — 入口，导出 createColorPicker
├── ColorPicker.js    — 核心逻辑类
├── PaletteView.js    — 色板网格视图
├── CustomView.js     — HSV 自定义选择器视图
├── colorUtils.js     — 颜色转换工具（HEX/RGB/HSV 互转）
└── colorPicker.css   — 样式
```

**API 设计**（与 spectrum 对齐，便于平滑迁移）：

```javascript
import { createColorPicker } from '@/components/ColorPicker';

// 初始化 — 与 spectrum 配置兼容
const picker = createColorPicker(element, {
    color: '#000000',                    // 初始颜色
    flat: true,                          // 内嵌模式
    showPaletteOnly: true,               // 仅显示色板
    togglePaletteOnly: true,             // 显示"自定义/收起"切换
    hideAfterPaletteSelect: true,        // 选色后自动收起
    showButtons: true,                   // 显示确认/取消按钮
    showInput: true,                     // 显示颜色输入框
    showInitial: true,                   // 显示初始颜色预览
    palette: [ [...] ],                  // 预设色板
    localStorageKey: 'spectrum.xxx',     // 最近使用色持久化 key
    maxPaletteSize: 8,                   // 最近使用色最大数量
    preferredFormat: 'hex',              // 首选格式
    change: function(color) {},          // 确认选择回调
    move: function(color) {},            // 实时拖动回调
});

// 编程 API — 与 spectrum 对齐
picker.get('hex');                       // → "#ff0000"（等价 spectrum("get").toHexString()）
picker.get('rgb');                        // → "rgb(255, 0, 0)"（等价 spectrum("get").toRgbString()）
picker.set('#ff0000');                    // 编程设置颜色（等价 spectrum("set", color)）
picker.destroy();                         // 销毁实例
```

**colorUtils.js 核心工具**：

```javascript
// HEX ↔ RGB ↔ HSV 互转
export function hexToRgb(hex) { ... }
export function rgbToHex(r, g, b) { ... }
export function rgbToHsv(r, g, b) { ... }
export function hsvToRgb(h, s, v) { ... }
export function hexToHsv(hex) { ... }
export function hsvToHex(h, s, v) { ... }

// 颜色对象（兼容 spectrum 的 .toHexString() / .toRgbString()）
export class Color {
    constructor(hex) { this.hex = hex; }
    toHexString() { return this.hex; }
    toRgbString() { const {r,g,b} = hexToRgb(this.hex); return `rgb(${r}, ${g}, ${b})`; }
}
```

**PaletteView.js — 色板网格**：

```javascript
// 渲染 8×8 色板网格
// 每个色块是一个 div，点击触发选择
// 底部渲染"最近使用色"行（从 localStorage 读取）
// 底部渲染"自定义颜色"切换按钮
export function createPaletteView(container, palette, recentColors, onSelect, onToggleCustom) {
    // 生成色板 HTML
    // 绑定点击事件
    // 返回 { updateRecent(color), destroy() }
}
```

**CustomView.js — HSV 自定义选择器**：

```javascript
// 包含：
// 1. 色相-饱和度面板（方形渐变区域，水平=饱和度，垂直=明度）
// 2. 色相滑条（水平彩虹条）
// 3. 颜色输入框（HEX 值）
// 4. 初始颜色/当前颜色对比预览
// 5. 确认/取消按钮（可选）
export function createCustomView(container, initialColor, onMove, onChange, onCancel, options) {
    // 使用 Canvas 绘制 HSV 渐变
    // 绑定鼠标拖动事件
    // 返回 { setColor(hex), destroy() }
}
```

**ColorPicker.js — 核心控制器**：

```javascript
export class ColorPicker {
    constructor(element, options) {
        this.el = element;
        this.options = options;
        this.currentColor = options.color || '#000000';
        this.recentColors = this._loadRecent();

        if (options.flat) {
            this._renderFlat();
        } else {
            this._renderDropdown();
        }
    }

    _renderFlat() {
        // 直接在 element 内渲染
        if (this.options.showPaletteOnly) {
            this.paletteView = createPaletteView(this.el, this.options.palette, this.recentColors,
                (color) => this._onPaletteSelect(color),
                () => this._toggleCustom()
            );
        }
        // 自定义区域初始隐藏
        this.customContainer = document.createElement('div');
        this.customContainer.style.display = 'none';
        this.el.appendChild(this.customContainer);
    }

    _onPaletteSelect(color) {
        this.currentColor = color;
        this._saveRecent(color);
        if (this.options.hideAfterPaletteSelect && this.customView) {
            this.customContainer.style.display = 'none';
            this.paletteView?.show();
        }
        if (this.options.change) this.options.change(new Color(color));
    }

    _toggleCustom() {
        if (this.customContainer.style.display === 'none') {
            this.paletteView?.hide();
            this.customContainer.style.display = '';
            if (!this.customView) {
                this.customView = createCustomView(
                    this.customContainer, this.currentColor,
                    (color) => { this.currentColor = color; if (this.options.move) this.options.move(new Color(color)); },
                    (color) => { this.currentColor = color; this._saveRecent(color); if (this.options.change) this.options.change(new Color(color)); },
                    () => { this.customContainer.style.display = 'none'; this.paletteView?.show(); },
                    { showButtons: this.options.showButtons, showInput: this.options.showInput, showInitial: this.options.showInitial }
                );
            } else {
                this.customView.setColor(this.currentColor);
            }
        } else {
            this.customContainer.style.display = 'none';
            this.paletteView?.show();
        }
    }

    get(format = 'hex') {
        const color = new Color(this.currentColor);
        return format === 'rgb' ? color.toRgbString() : color.toHexString();
    }

    set(color) { this.currentColor = color; this.customView?.setColor(color); }
    destroy() { this.el.innerHTML = ''; }

    _loadRecent() { try { return JSON.parse(localStorage.getItem(this.options.localStorageKey)) || []; } catch { return []; } }
    _saveRecent(color) { ... }
}
```

#### 14.3 标准 8×8 色板数据

```javascript
export const STANDARD_PALETTE = [
    ['#000', '#444', '#666', '#999', '#ccc', '#eee', '#f3f3f3', '#fff'],
    ['#f00', '#f90', '#ff0', '#0f0', '#0ff', '#00f', '#90f', '#f0f'],
    ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'],
    ['#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
    ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0'],
    ['#c00', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
    ['#900', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
    ['#600', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130'],
];

export const SHEET_TAB_PALETTE = [
    ['rgb(0,0,0)', 'rgb(67,67,67)', 'rgb(102,102,102)', 'rgb(204,204,204)', 'rgb(217,217,217)', 'rgb(255,255,255)'],
    ['rgb(152,0,0)', 'rgb(255,0,0)', 'rgb(255,153,0)', 'rgb(255,255,0)', 'rgb(0,255,0)', 'rgb(0,255,255)', 'rgb(74,134,232)', 'rgb(0,0,255)', 'rgb(153,0,255)', 'rgb(255,0,255)'],
    // ... 完整色板数据
];
```

#### 14.4 迁移映射

```javascript
// spectrum 初始化 → createColorPicker
$(el).spectrum({ showPalette: true, showPaletteOnly: true, ... })
→  createColorPicker(el, { showPaletteOnly: true, ... })

// spectrum("get").toHexString() → picker.get('hex')
$(el).spectrum("get").toHexString()
→  picker.get('hex')

// spectrum("get").toRgbString() → picker.get('rgb')
$(el).spectrum("get").toRgbString()
→  picker.get('rgb')

// spectrum("set", color) → picker.set(color)
$(el).spectrum("set", "#ff0000")
→  picker.set("#ff0000")
```

#### 14.5 需要管理的 picker 实例

由于 spectrum 将实例绑定在 DOM 元素上（可通过 `$el.spectrum("get")` 随时获取），自研方案需要维护实例引用。推荐使用 WeakMap：

```javascript
const pickerInstances = new WeakMap();

function initPicker(el, options) {
    const picker = createColorPicker(el, options);
    pickerInstances.set(el, picker);
    return picker;
}

function getPicker(el) {
    return pickerInstances.get(el);
}
```

---

### 15. 其他 jQuery 插件替换

| 插件 | 使用量 | 替换方案 |
|------|--------|---------|
| **jquery-mousewheel** | 5 处 / 1 文件 | 替换为原生 `wheel` 事件 |
| **jquery.sPage** | 1 处 / 1 文件 | 替换为轻量分页组件或自行实现 |
| **jQuery UI** | 0 处（冗余） | 直接移除，无需替换 |

---

### 15. 其他零散 API

| jQuery API | 使用量 | 替换方案 |
|-----------|--------|---------|
| `$.each(obj, fn)` | 1 | `Object.entries(obj).forEach()` |
| `$.inArray(val, arr)` | 1 | `arr.includes(val)` |
| `.hover(enterFn, leaveFn)` | 11 | `mouseenter` + `mouseleave` |
| `.trigger('click')` | 2 | `el.dispatchEvent(new MouseEvent('click'))` |
| `.bind('input propertychange', fn)` | 1 | `el.addEventListener('input', fn)` |
| `.fadeIn()/.fadeOut()` | 3 | CSS `transition: opacity` + JS 切换 |
| `.slideUp()/.slideDown()/.slideToggle()` | ~6 | CSS `transition: max-height` + JS 切换 |
| `$(htmlString)` 创建元素 | 8 | `document.createRange().createContextualFragment(html)` |
| `.length` 检查存在 | 25 | `document.querySelector(selector) !== null` |
| `.each()` 集合迭代 | 29 | `nodeList.forEach()` |
| `$(sel)[0]` / `.get(0)` | 42 | `document.querySelector(selector)` |

---

## 三、迁移阶段与进度追踪

### 阶段 0：准备工作

- [ ] 0.1 创建 DOM 适配工具库 `src/utils/domAdapter.js`
- [ ] 0.2 添加 ESLint 规则禁止新增 jQuery 使用
- [ ] 0.3 移除 jQuery UI（冗余依赖，未被使用）
- [ ] 0.4 审计 `$.extend` 目标对象是否包含函数/DOM节点等不可 `structuredClone` 的类型

**进度**：📋 计划中

---

### 阶段 1：替换 `$.extend`（200+ 处，~30 文件）

- [ ] 1.1 安装 klona：`npm install klona`
- [ ] 1.2 创建 `src/utils/extend.js`，基于 klona 封装 `deepClone` 和 `merge` 函数
- [ ] 1.3 替换 `$.extend(true, {}, ...)` 为 `klona()`
- [ ] 1.4 替换 `$.extend({}, ...)` 为 `{...spread}` 或 `Object.assign()`
- [ ] 1.5 验证撤销/重做功能正常

**涉及文件**：

| 文件 | 状态 | 备注 |
|------|------|------|
| `src/global/refresh/refreshOperation.js` | ⬜ 未开始 | 撤销/重做核心 |
| `src/controllers/controlHistory.js` | ⬜ 未开始 | 历史记录 |
| `src/controllers/handler/documentMouseup.js` | ⬜ 未开始 | |
| `src/controllers/menuButton/formatUpdate.js` | ⬜ 未开始 | |
| `src/global/api/conditionFormat.js` | ⬜ 未开始 | |
| `src/controllers/imageCtrl.js` | ⬜ 未开始 | |
| `src/controllers/searchReplace.js` | ⬜ 未开始 | |
| `src/controllers/select.js` | ⬜ 未开始 | |
| `src/controllers/keyboard.js` | ⬜ 未开始 | |
| `src/global/api/rangeRead.js` | ⬜ 未开始 | |
| `src/global/sort.js` | ⬜ 未开始 | |
| `src/controllers/dropCell/core/index.js` | ⬜ 未开始 | |
| `src/controllers/handler/documentMousemoveSub/mouseRender.js` | ⬜ 未开始 | |
| `src/controllers/alternateformat/alternateformatObj.js` | ⬜ 未开始 | |
| `src/controllers/conditionformat/dialog/index.js` | ⬜ 未开始 | |
| `src/global/refresh/refreshCore.js` | ⬜ 未开始 | |
| `src/global/formula/formulaParser.js` | ⬜ 未开始 | |
| `src/global/dependency.js` | ⬜ 未开始 | |
| `src/controllers/selection/clipboardCutPaste.js` | ⬜ 未开始 | |
| `src/global/api/rangeOperation.js` | ⬜ 未开始 | |
| `src/global/extend/extendTable.js` | ⬜ 未开始 | |
| `src/global/refresh/refreshCanvas.js` | ⬜ 未开始 | |
| `src/controllers/rowColumnOperation/deleteTable.js` | ⬜ 未开始 | |
| `src/global/fillStrategy.js` | ⬜ 未开始 | |
| `src/global/formula/formulaString.js` | ⬜ 未开始 | |
| `src/controllers/filter/filterActions.js` | ⬜ 未开始 | |
| `src/controllers/sheetmanage/sheetLayout.js` | ⬜ 未开始 | |
| `src/controllers/sheetmanage/sheetParamRestore.js` | ⬜ 未开始 | |
| `src/global/method.js` | ⬜ 未开始 | |
| `src/global/rhchInit.js` | ⬜ 未开始 | |

**进度**：📋 计划中

---

### 阶段 2：替换 AJAX 调用（16 处，~6 文件）

- [ ] 2.1 创建 `src/utils/http.js`，基于 `fetch` 封装 `post`/`ajax` 方法
- [ ] 2.2 替换 `src/core.js` 中的 `$.post()`
- [ ] 2.3 替换 `src/global/method.js` 中的 `$.post()` 和 `$.ajax()`
- [ ] 2.4 替换 `src/controllers/sheetmanage/sheetInit.js` 中的 `$.post()`
- [ ] 2.5 替换 `src/controllers/sheetmanage/sheetSwitch.js` 中的 `$.post()`
- [ ] 2.6 替换 `src/function/functionImplementation/localeCn.js` 中的 `$.post()`（6 处）
- [ ] 2.7 替换 `src/function/functionImplementation/dataMining.js` 中的 `$.post()`（3 处）
- [ ] 2.8 替换 `src/demoData/getTargetData.js` 中的 `$.ajax()`

**进度**：📋 计划中

---

### 阶段 3：替换 jQuery 插件（43 处）

#### 3.1 替换 jquery-mousewheel（5 处，1 文件）

- [ ] 3.1.1 使用原生 `wheel` 事件替换 `src/controllers/handler/scroll.js` 中的 5 处调用

#### 3.2 自研颜色选择器替换 spectrum（37 处，9 文件）

- [x] 3.2.1 创建 `src/components/ColorPicker/` 目录结构
- [x] 3.2.2 实现 `colorUtils.js`（HEX/RGB/HSV 互转 + Color 类）
- [x] 3.2.3 实现 `PaletteView.js`（色板网格视图 + 最近使用色 + 自定义切换按钮）
- [x] 3.2.4 实现 `CustomView.js`（HSV 选择器：饱和度-明度面板 + 色相滑条 + 输入框 + 按钮）
- [x] 3.2.5 实现 `ColorPicker.js`（核心控制器：flat/dropdown 模式 + 实例管理）
- [x] 3.2.6 实现 `colorPicker.css`（样式，与现有 spectrum 视觉效果一致）
- [x] 3.2.7 替换 `src/controllers/menuButton/toolbarInit/initBorder.js` 中的 spectrum 调用
- [x] 3.2.8 替换 `src/controllers/menuButton/toolbarInit/initCellColor.js` 中的 spectrum 调用
- [x] 3.2.9 替换 `src/controllers/menuButton/toolbarInit/initTextColor.js` 中的 spectrum 调用
- [x] 3.2.10 替换 `src/controllers/sheetBar.js` 中的 spectrum 调用
- [x] 3.2.11 替换 `src/controllers/imageCtrl.js` 中的 spectrum 调用
- [x] 3.2.12 替换 `src/controllers/alternateformat/alternateformatObj.js` 中的 spectrum 调用
- [x] 3.2.13 替换 `src/controllers/alternateformat/dialog.js` 中的 spectrum 调用
- [x] 3.2.14 替换 `src/controllers/conditionformat/dialog/index.js` 中的 spectrum 调用
- [x] 3.2.15 替换 `src/controllers/conditionformat/dialog/initConditionDialogEvents.js` 中的 spectrum("get") 调用
- [x] 3.2.16 替换 `src/controllers/conditionformat/dialog/initNewRuleEvents.js` 中的 spectrum("get") 调用
- [x] 3.2.17 替换 `src/controllers/conditionformat/dialog/initEditRuleEvents.js` 中的 spectrum("get") 调用

#### 3.3 替换 sPage 分页（1 处，1 文件）

- [ ] 3.3.1 替换 `src/global/api/util.js` 中的 `sPage()` 调用

**进度**：📋 计划中

---

### 阶段 4：替换 DOM 操作和遍历（~800 处，~90 文件）

#### 4.1 `src/utils/` 工具函数（4 文件，~22 处）

- [ ] 4.1.1 `src/utils/domUtils.js`（16 处）
- [ ] 4.1.2 `src/utils/dialogUtils.js`（4 处）
- [ ] 4.1.3 `src/utils/eventUtils.js`（2 处）
- [ ] 4.1.4 `src/utils/utilSub/reactiveUtils.js`

#### 4.2 `src/global/api/` API 层（10 文件，~60 处）

- [ ] 4.2.1 `src/global/api/sheet.js`（30 处）
- [ ] 4.2.2 `src/global/api/rangeWrite.js`（6 处）
- [ ] 4.2.3 `src/global/api/workbook.js`（8 处）
- [ ] 4.2.4 `src/global/api/editMode.js`（8 处）
- [ ] 4.2.5 `src/global/api/util.js`（4 处）
- [ ] 4.2.6 `src/global/api/image.js`（3 处）
- [ ] 4.2.7 `src/global/api/rangeOperation.js`（2 处）
- [ ] 4.2.8 `src/global/api/conditionFormat.js`
- [ ] 4.2.9 `src/global/api/rangeRead.js`
- [ ] 4.2.10 `src/global/api/dropdown.js`

#### 4.3 `src/global/` 全局模块（非 API，~15 文件，~150 处）

- [ ] 4.3.1 `src/global/tooltip.js`（53 处）
- [ ] 4.3.2 `src/global/scroll.js`（15 处）
- [ ] 4.3.3 `src/global/refresh/refreshCanvas.js`（14 处）
- [ ] 4.3.4 `src/global/createdom.js`（14 处）
- [ ] 4.3.5 `src/global/formula/rangeSelect.js`（47 处）
- [ ] 4.3.6 `src/global/formula/functionSearch.js`（42 处）
- [ ] 4.3.7 `src/global/formula/cellUpdate.js`（10 处）
- [ ] 4.3.8 `src/global/formula/rangeHighlight.js`（8 处）
- [ ] 4.3.9 `src/global/formula/formulaBar.js`（9 处）
- [ ] 4.3.10 `src/global/formula/refreshButton.js`（5 处）
- [ ] 4.3.11 `src/global/extend/extendTable.js`（8 处）
- [ ] 4.3.12 `src/global/method.js`（11 处）
- [ ] 4.3.13 `src/global/draw/drawTitle.js`（4 处）
- [ ] 4.3.14 `src/global/draw/drawMain.js`（4 处）
- [ ] 4.3.15 `src/global/loading.js`
- [ ] 4.3.16 `src/global/rhchInit.js`（3 处）
- [ ] 4.3.17 `src/global/location.js`（1 处）
- [ ] 4.3.18 `src/global/dynamicArray.js`（2 处）
- [ ] 4.3.19 `src/global/getRowlen/rowlenUtils.js`（3 处）
- [ ] 4.3.20 `src/global/format.js`（1 处）
- [ ] 4.3.21 `src/global/count.js`（1 处）
- [ ] 4.3.22 `src/global/getdata.js`（1 处）

#### 4.4 `src/controllers/menuButton/` 工具栏（~15 文件，~200 处）

- [ ] 4.4.1 `src/controllers/menuButton/toolbarInit/initBorder.js`（35 处）
- [ ] 4.4.2 `src/controllers/menuButton/toolbarInit/initCellColor.js`（20 处）
- [ ] 4.4.3 `src/controllers/menuButton/toolbarInit/initTextColor.js`（19 处）
- [ ] 4.4.4 `src/controllers/menuButton/toolbarInit/initFreezen.js`（21 处）
- [ ] 4.4.5 `src/controllers/menuButton/toolbarInit/initConditionformat.js`（26 处）
- [ ] 4.4.6 `src/controllers/menuButton/toolbarInit/initFontSize.js`（14 处）
- [ ] 4.4.7 `src/controllers/menuButton/toolbarInit/initMoreFormat.js`（14 处）
- [ ] 4.4.8 `src/controllers/menuButton/toolbarInit/initAutofilter.js`（13 处）
- [ ] 4.4.9 `src/controllers/menuButton/toolbarInit/initFunction.js`（13 处）
- [ ] 4.4.10 `src/controllers/menuButton/toolbarInit/initMerge.js`（10 处）
- [ ] 4.4.11 `src/controllers/menuButton/toolbarInit/initRotation.js`（10 处）
- [ ] 4.4.12 `src/controllers/menuButton/toolbarInit/initSearchReplace.js`（10 处）
- [ ] 4.4.13 `src/controllers/menuButton/toolbarInit/initTextWrap.js`（10 处）
- [ ] 4.4.14 `src/controllers/menuButton/toolbarInit/initFontFamily.js`（10 处）
- [ ] 4.4.15 `src/controllers/menuButton/toolbarInit/initPostil.js`（9 处）
- [ ] 4.4.16 `src/controllers/menuButton/toolbarInit/initPrint.js`（9 处）
- [ ] 4.4.17 `src/controllers/menuButton/toolbarInit/initValign.js`（12 处）
- [ ] 4.4.18 `src/controllers/menuButton/toolbarInit/initAlign.js`（12 处）
- [ ] 4.4.19 `src/controllers/menuButton/toolbarInit/initPaintFormat.js`（4 处）
- [ ] 4.4.20 `src/controllers/menuButton/formatUpdate.js`（1 处）
- [ ] 4.4.21 `src/controllers/menuButton/paintFormat.js`
- [ ] 4.4.22 `src/controllers/menuButton/sizeUtils.js`

#### 4.5 `src/controllers/filter/` 筛选（6 文件，~120 处）

- [ ] 4.5.1 `src/controllers/filter/filterActions.js`（53 处）
- [ ] 4.5.2 `src/controllers/filter/filterColorEvents.js`（28 处）
- [ ] 4.5.3 `src/controllers/filter/createFilterOptions.js`（8 处）
- [ ] 4.5.4 `src/controllers/filter/labelFilterOptionState.js`
- [ ] 4.5.5 `src/controllers/filter/filterMenuEvents.js`
- [ ] 4.5.6 `src/controllers/filter/filterCheckboxEvents.js`

#### 4.6 `src/controllers/conditionformat/` 条件格式（~8 文件，~200 处）

- [ ] 4.6.1 `src/controllers/conditionformat/dialog/initConditionDialogEvents.js`（23 处）
- [ ] 4.6.2 `src/controllers/conditionformat/dialog/initNewRuleEvents.js`（37 处）
- [ ] 4.6.3 `src/controllers/conditionformat/dialog/initEditRuleEvents.js`（34 处）
- [ ] 4.6.4 `src/controllers/conditionformat/dialog/index.js`
- [ ] 4.6.5 `src/controllers/conditionformat/dialog/initAdminRuleEvents.js`
- [ ] 4.6.6 `src/controllers/conditionformat/dialog/initRangeAndCloseEvents.js`
- [ ] 4.6.7 `src/controllers/conditionformat/dialog/initRuleTypeEvents.js`
- [ ] 4.6.8 `src/controllers/conditionformat/ruleManager.js`（4 处）
- [ ] 4.6.9 `src/controllers/conditionformat/computeSub/computeDefault.js`（1 处 $.inArray）

#### 4.7 `src/controllers/freezen/` 冻结（3 文件，~200 处）

- [ ] 4.7.1 `src/controllers/freezen/scrollAdapt.js`（155 处）
- [ ] 4.7.2 `src/controllers/freezen/freezeCore.js`（45 处）
- [ ] 4.7.3 `src/controllers/freezen/initialFreeze.js`

#### 4.8 `src/controllers/handler/` 事件处理（~10 文件，~250 处）

- [ ] 4.8.1 `src/controllers/handler/globalEvents.js`（22 处）
- [ ] 4.8.2 `src/controllers/handler/documentMouseup.js`（42 处）
- [ ] 4.8.3 `src/controllers/handler/documentMousemoveSub/mouseRender.js`（51 处）
- [ ] 4.8.4 `src/controllers/handler/cellEventsSub/handleCellMousedown.js`（49 处）
- [ ] 4.8.5 `src/controllers/handler/cellEventsSub/handleCellDblclick.js`（14 处）
- [ ] 4.8.6 `src/controllers/handler/pasteEvent.js`（13 处）
- [ ] 4.8.7 `src/controllers/handler/rightClickButtons.js`（15 处）
- [ ] 4.8.8 `src/controllers/handler/scroll.js`（15 处）
- [ ] 4.8.9 `src/controllers/handler/initialOperation.js`
- [ ] 4.8.10 `src/controllers/handler/overlay.js`

#### 4.9 `src/controllers/` 其他控制器（~15 文件，~400 处）

- [ ] 4.9.1 `src/controllers/keyboard.js`（131 处）— 最重文件
- [ ] 4.9.2 `src/controllers/alternateformat/alternateformatObj.js`（125 处）
- [ ] 4.9.3 `src/controllers/alternateformat/dialog.js`（121 处）
- [ ] 4.9.4 `src/controllers/ifFormulaGenerator.js`（117 处）
- [ ] 4.9.5 `src/controllers/imageCtrl.js`（102 处）
- [ ] 4.9.6 `src/controllers/resize.js`（104 处）
- [ ] 4.9.7 `src/controllers/searchReplace.js`（85 处）
- [ ] 4.9.8 `src/controllers/postil.js`（84 处）
- [ ] 4.9.9 `src/controllers/sheetBar.js`（83 处）
- [ ] 4.9.10 `src/controllers/formulaBar.js`（56 处）
- [ ] 4.9.11 `src/controllers/select.js`（22 处）
- [ ] 4.9.12 `src/controllers/updateCell.js`（31 处）
- [ ] 4.9.13 `src/controllers/hyperlinkCtrl.js`（39 处）
- [ ] 4.9.14 `src/controllers/zoom.js`（19 处）
- [ ] 4.9.15 `src/controllers/mobile.js`（12 处）
- [ ] 4.9.16 `src/controllers/splitColumn.js`
- [ ] 4.9.17 `src/controllers/controlHistory.js`（24 处）
- [ ] 4.9.18 `src/controllers/rowColumnOperation/rowHeaderEvents/initColHeaderEvents.js`（59 处）
- [ ] 4.9.19 `src/controllers/rowColumnOperation/rowHeaderEvents/initResizeEvents.js`（49 处）
- [ ] 4.9.20 `src/controllers/rowColumnOperation/rowHeaderEvents/initRowHeaderEvents.js`（54 处）
- [ ] 4.9.21 `src/controllers/rowColumnOperation/rowHeaderEvents/initDeleteCellEvents.js`（15 处）
- [ ] 4.9.22 `src/controllers/rowColumnOperation/rowHeaderEvents/initHideShowEvents.js`（4 处）
- [ ] 4.9.23 `src/controllers/rowColumnOperation/rowHeaderEvents/initRowColWidthEvents.js`（5 处）
- [ ] 4.9.24 `src/controllers/sheetmanage/sheetLayout.js`（25 处）
- [ ] 4.9.25 `src/controllers/sheetmanage/sheetParamRestore.js`（23 处）
- [ ] 4.9.26 `src/controllers/sheetmanage/sheetInit.js`（8 处）
- [ ] 4.9.27 `src/controllers/sheetmanage/sheetVisibility.js`（3 处）
- [ ] 4.9.28 `src/controllers/sheetMove/rangeMove.js`（18 处）
- [ ] 4.9.29 `src/controllers/sheetMove/cellMove.js`（18 处）
- [ ] 4.9.30 `src/controllers/selection/clipboardCopy.js`（4 处）
- [ ] 4.9.31 `src/controllers/selection/htmlTableBuilder.js`（2 处）
- [ ] 4.9.32 `src/controllers/selection/clipboardPaste.js`（1 处）

**进度**：📋 计划中

---

### 阶段 5：替换事件系统（153+ 处）

- [ ] 5.1 扩展 `src/utils/eventUtils.js`，实现命名空间事件管理器
- [ ] 5.2 替换 `$(document).off("namespace").on("namespace", "selector", handler)` 模式
- [ ] 5.3 替换直接绑定 `.on("event", handler)` 为 `addEventListener`
- [ ] 5.4 替换 `.hover()` 为 `mouseenter/mouseleave`（11 处）
- [ ] 5.5 替换 `.trigger()` 为 `dispatchEvent()`（2 处）
- [ ] 5.6 替换 `.bind()` 为 `addEventListener`（1 处）

**进度**：📋 计划中

---

### 阶段 6：替换 `.data()` 存储（71 处）

- [ ] 6.1 审计所有 `.data()` 调用存储的数据类型
- [ ] 6.2 简单字符串/数字值 → 使用 `dataset`
- [ ] 6.3 复杂对象值 → 使用 `WeakMap` 适配层
- [ ] 6.4 逐文件替换

**进度**：📋 计划中

---

### 阶段 7：清理与验证

- [ ] 7.1 从 `package.json` 移除 `jquery`、`jquery-mousewheel`、`spectrum-colorpicker` 依赖
- [ ] 7.2 从 `vite.config.js` 移除 `@rollup/plugin-inject` 配置
- [ ] 7.3 从 `src/index.js` 移除 `window.jQuery = jQuery` 和 `window.$ = jQuery`
- [ ] 7.4 删除 `src/jquery-bridge.js` 和 `src/jquery-init.js`
- [ ] 7.5 删除 `src/plugins/js/` 下的 jQuery 插件文件
- [ ] 7.6 全量回归测试
- [ ] 7.7 性能基准测试对比

**进度**：📋 计划中

---

## 四、关键风险与注意事项

### ⚠️ 高风险项

| 风险 | 说明 | 缓解措施 |
|------|------|---------|
| **`$.extend` 深拷贝行为差异** | klona 不支持函数拷贝 | 先审计所有 `$.extend` 目标对象是否含函数，如有极少数场景需自定义处理 |
| **`.end()` 链式回退** | 无原生等价物，重构量大 | 逐个链拆解，保存中间变量，配合代码审查 |
| **`:visible` 伪选择器** | 非标准 CSS，`querySelector` 不支持 | 封装 `isVisible()` 工具函数 |
| **事件命名空间** | `addEventListener` 不支持命名空间 | 自实现事件管理器，用 Map 记录 handler 引用 |
| **spectrum 自研替换** | 需实现 HSV 选择器、色板、localStorage 持久化 | 按形态分步实现，先色板后自定义选择器 |
| **隐式迭代** | jQuery 自动对集合操作，原生需显式遍历 | 使用适配函数返回数组，支持链式 |

### 💡 最佳实践

1. **不要逐行替换**：按模块/文件整体替换，确保逻辑完整性
2. **先写测试再迁移**：对关键功能（撤销/重做、单元格编辑、筛选）先补充 E2E 测试
3. **保持 Git 历史清晰**：每个阶段一个 PR，便于 review 和回滚
4. **性能验证**：原生 DOM 操作理论上更快，但需验证大量 `querySelectorAll` 的性能
5. **兼容性**：`structuredClone`、`closest()`、`classList` 等需 IE11+ 不支持，如需兼容需加 polyfill

---

## 五、迁移优先级矩阵

```
高影响 ┃ $.extend (200+)    │ .on/.off (153+)    │ .css (200+)
       │ ⚠️ 核心逻辑依赖    │ ⚠️ 事件系统基础    │ 📦 工作量最大
───────╂────────────────────┼────────────────────┼────────────────
中影响 ┃ .show/.hide (200+) │ .data (71)         │ 插件 (43)
       │ 📦 简单但量大      │ ⚠️ 需分析数据类型  │ ⚠️ 需选替代方案
───────╂────────────────────┼────────────────────┼────────────────
低影响 ┃ AJAX (16)          │ .end (49)          │ 伪选择器 (80+)
       │ ✅ 集中易替换      │ ⚠️ 需重构链式调用  │ ✅ 封装工具函数
```

**推荐执行顺序**：`$.extend` → AJAX → 插件 → `.show/.hide` + `.css` → 事件系统 → `.data` → `.end` + 链式调用 → 清理

---

## 六、变更日志

| 日期 | 阶段 | 变更内容 |
|------|------|---------|
| 2026-05-28 | - | 创建迁移计划文档 |
| 2026-05-28 | 阶段1 | 深拷贝方案从 lodash 改为 klona（451B gzip，零依赖） |
| 2026-05-28 | 阶段3 | 颜色选择器方案从第三方库替换改为完全自研，含完整架构设计 |
| 2026-05-28 | 阶段3 | ✅ 完成自研 ColorPicker 组件实现 + 全部 9 文件 37 处 spectrum 调用替换，构建验证通过 |
