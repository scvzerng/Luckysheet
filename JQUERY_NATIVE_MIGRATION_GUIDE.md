# jQuery → 原生 JS 渐进式迁移指南

> 本文档是 Luckysheet 项目从 jQuery 迁移到原生现代 JS 的完整指南。
> 核心原则：**渐进式、可回退、不破坏现有功能**。

---

## 一、现状概览

| 指标 | 数值 |
|------|------|
| jQuery 相关调用总数 | ~1,382 处 |
| 涉及文件数 | ~100 个 |
| `$.extend()` 调用 | 376 处 / 76 文件 |
| `$(this)` 调用 | 656 处 / 79 文件 |
| UI 封装层完成率 | 99.2%（21 个封装对象） |
| jQuery 插件 | 1 个（jquery.sPage） |
| Deferred/Promise | 0（无需迁移） |
| 动画方法 | ~10 处（极少） |

---

## 二、jQuery 对象 vs 原生 DOM 的关键差异

### 2.1 jQuery 对象的本质

```js
// jQuery 对象是一个类数组，包含匹配的 DOM 元素
const $el = $('#my-id');
// $el 是 jQuery 对象，不是 DOM 元素
// $el[0] 才是原生 DOM 元素
// $el.length 是匹配元素数量（0 表示未找到）
```

### 2.2 核心差异对照

| 特性 | jQuery | 原生 JS |
|------|--------|---------|
| 选择元素 | `$('#id')` 返回 jQuery 对象 | `document.querySelector('#id')` 返回 Element 或 null |
| 多元素选择 | `$('.cls')` 返回 jQuery 集合 | `document.querySelectorAll('.cls')` 返回 NodeList |
| 空结果 | 返回空 jQuery 对象（`length=0`） | 返回 `null`（querySelector）或空 NodeList |
| 链式调用 | 所有方法返回 jQuery 对象 | 原生方法不返回元素本身，需手动 return this |
| `.css()` | getter/setter 二合一 | `getComputedStyle()` / `element.style.prop` |
| `.show()/.hide()` | 管理 `display` 属性 | `element.style.display = ''/ 'none'` |
| `.width()/.height()` | 返回计算后的尺寸 | `element.offsetWidth` / `element.clientHeight` 等 |
| `.scrollLeft()/.scrollTop()` | getter/setter 二合一 | `element.scrollLeft` / `element.scrollTop` 属性 |
| `.find()` | 返回 jQuery 对象 | `element.querySelectorAll()` 返回 NodeList |
| `.on()` | 支持事件委托 | `addEventListener`，委托需手动实现 |
| `.is(':visible')` | jQuery 伪选择器 | 需检查 `offsetWidth > 0 && offsetHeight > 0` |
| `.data()` | 内部缓存系统 | `element.dataset` 或 `getAttribute('data-')` |
| `.val()` | getter/setter 二合一 | `element.value` 属性 |
| `.closest()` | 返回 jQuery 对象 | `element.closest()` 返回 Element 或 null |
| `.siblings()` | 返回 jQuery 对象 | 需手动过滤父元素的子节点 |

---

## 三、完整迁移映射表

### 3.1 选择器

| jQuery | 原生 JS | 备注 |
|--------|---------|------|
| `$('#id')` | `document.getElementById('id')` | 最常用，原生更快 |
| `$('.class')` | `document.querySelectorAll('.class')` | 返回 NodeList |
| `$('tag')` | `document.getElementsByTagName('tag')` | 返回 HTMLCollection |
| `$(selector)` | `document.querySelector(selector)` | 返回第一个匹配 |
| `$(selector, context)` | `context.querySelector(selector)` | 限定范围 |
| `$(this)` | `this` / `event.currentTarget` | 事件回调中 |
| `$(htmlString)` | `createElementFromHTML(htmlString)` | 需工具函数 |
| `$(document)` | `document` | 直接使用 |
| `$(window)` | `window` | 直接使用 |

### 3.2 DOM 操作 — 属性与内容

| jQuery | 原生 JS | 备注 |
|--------|---------|------|
| `.html()` | `.innerHTML` | |
| `.html(value)` | `.innerHTML = value` | |
| `.text()` | `.textContent` | |
| `.text(value)` | `.textContent = value` | |
| `.val()` | `.value` | |
| `.val(value)` | `.value = value` | |
| `.attr(name)` | `.getAttribute(name)` | |
| `.attr(name, value)` | `.setAttribute(name, value)` | |
| `.removeAttr(name)` | `.removeAttribute(name)` | |
| `.prop(name)` | `element[name]` | 如 `.prop('checked')` → `element.checked` |
| `.prop(name, value)` | `element[name] = value` | |
| `.data(key)` | `.dataset[key]` 或 `.getAttribute('data-key')` | jQuery 的 data 有缓存，dataset 无缓存 |

### 3.3 DOM 操作 — 样式

| jQuery | 原生 JS | 备注 |
|--------|---------|------|
| `.css(prop)` | `getComputedStyle(el)[prop]` | 获取计算样式 |
| `.css(prop, value)` | `el.style[prop] = value` | 设置行内样式 |
| `.css({prop1: val1, prop2: val2})` | `Object.assign(el.style, {prop1: val1})` | 批量设置 |
| `.addClass(cls)` | `el.classList.add(cls)` | |
| `.removeClass(cls)` | `el.classList.remove(cls)` | |
| `.toggleClass(cls)` | `el.classList.toggle(cls)` | |
| `.hasClass(cls)` | `el.classList.contains(cls)` | |
| `.show()` | `el.style.display = ''` | 恢复默认显示 |
| `.hide()` | `el.style.display = 'none'` | 隐藏 |
| `.is(':visible')` | `el.offsetWidth > 0 && el.offsetHeight > 0` | 可见性检测 |
| `.is(':hidden')` | `el.offsetWidth === 0 \|\| el.offsetHeight === 0` | |
| `.is(selector)` | `el.matches(selector)` | CSS 选择器匹配 |

### 3.4 DOM 操作 — 尺寸与位置

| jQuery | 原生 JS | 备注 |
|--------|---------|------|
| `.width()` | `el.clientWidth` | 不含边框 |
| `.width(value)` | `el.style.width = value + 'px'` | |
| `.height()` | `el.clientHeight` | 不含边框 |
| `.height(value)` | `el.style.height = value + 'px'` | |
| `.outerWidth()` | `el.offsetWidth` | 含边框 |
| `.outerHeight()` | `el.offsetHeight` | 含边框 |
| `.innerWidth()` | `el.clientWidth` | |
| `.innerHeight()` | `el.clientHeight` | |
| `.offset()` | `{top: el.offsetTop, left: el.offsetLeft}` | 相对定位父级 |
| `.position()` | `{top: el.offsetTop, left: el.offsetLeft}` | |
| `.scrollTop()` | `el.scrollTop` | |
| `.scrollTop(value)` | `el.scrollTop = value` | |
| `.scrollLeft()` | `el.scrollLeft` | |
| `.scrollLeft(value)` | `el.scrollLeft = value` | |
| `$(window).width()` | `window.innerWidth` | |
| `$(window).height()` | `window.innerHeight` | |
| `$(document).scrollTop()` | `document.documentElement.scrollTop` | |

### 3.5 DOM 操作 — 结构操作

| jQuery | 原生 JS | 备注 |
|--------|---------|------|
| `.append(child)` | `el.appendChild(child)` | |
| `.append(htmlString)` | `el.insertAdjacentHTML('beforeend', html)` | |
| `.prepend(child)` | `el.prepend(child)` | |
| `.prepend(htmlString)` | `el.insertAdjacentHTML('afterbegin', html)` | |
| `.before(content)` | `el.insertAdjacentHTML('beforebegin', html)` | |
| `.after(content)` | `el.insertAdjacentHTML('afterend', html)` | |
| `.appendTo(target)` | `target.appendChild(el)` | |
| `.remove()` | `el.remove()` | |
| `.empty()` | `el.innerHTML = ''` | |
| `.clone()` | `el.cloneNode(true)` | |
| `.replaceWith(newEl)` | `el.replaceWith(newEl)` | |
| `.parent()` | `el.parentElement` | |
| `.children()` | `el.children` | |
| `.siblings()` | `[...el.parentElement.children].filter(c => c !== el)` | |
| `.next()` | `el.nextElementSibling` | |
| `.prev()` | `el.previousElementSibling` | |
| `.closest(selector)` | `el.closest(selector)` | |
| `.find(selector)` | `el.querySelectorAll(selector)` | |
| `.filter(selector)` | `[...nodeList].filter(el => el.matches(selector))` | |
| `.not(selector)` | `[...nodeList].filter(el => !el.matches(selector))` | |
| `.eq(index)` | `nodeList[index]` | |
| `.get(index)` | `jqueryObj[index]` | 获取原生元素 |
| `.index()` | `[...el.parentElement.children].indexOf(el)` | |
| `.each(fn)` | `nodeList.forEach(fn)` 或 `for...of` | |
| `.map(fn)` | `[...nodeList].map(fn)` | |
| `.is(selector)` | `el.matches(selector)` | |

### 3.6 事件绑定

| jQuery | 原生 JS | 备注 |
|--------|---------|------|
| `.on(event, handler)` | `el.addEventListener(event, handler)` | |
| `.on(event, selector, handler)` | 事件委托（见下方实现） | 需手动实现 |
| `.off(event, handler)` | `el.removeEventListener(event, handler)` | |
| `.off(event)` | 需保存引用才能移除 | 无对应直接方法 |
| `.click(handler)` | `el.addEventListener('click', handler)` | |
| `.mousedown(handler)` | `el.addEventListener('mousedown', handler)` | |
| `.mouseup(handler)` | `el.addEventListener('mouseup', handler)` | |
| `.keydown(handler)` | `el.addEventListener('keydown', handler)` | |
| `.keyup(handler)` | `el.addEventListener('keyup', handler)` | |
| `.focus(handler)` | `el.addEventListener('focus', handler)` | |
| `.blur(handler)` | `el.addEventListener('blur', handler)` | |
| `.scroll(handler)` | `el.addEventListener('scroll', handler)` | |
| `.dblclick(handler)` | `el.addEventListener('dblclick', handler)` | |
| `.change(handler)` | `el.addEventListener('change', handler)` | |
| `.hover(enterFn, leaveFn)` | `mouseenter` + `mouseleave` | |
| `.trigger(event)` | `el.dispatchEvent(new Event(event))` | |
| `.one(event, handler)` | `{ once: true }` 选项 | `el.addEventListener(event, handler, { once: true })` |

**事件委托原生实现**：

```js
function delegate(parentEl, eventType, selector, handler) {
    parentEl.addEventListener(eventType, function(e) {
        const target = e.target.closest(selector);
        if (target && parentEl.contains(target)) {
            handler.call(target, e);
        }
    });
}
```

### 3.7 工具函数

| jQuery | 原生 JS | 备注 |
|--------|---------|------|
| `$.extend(target, source)` | `Object.assign(target, source)` | 浅拷贝 |
| `$.extend(true, target, source)` | 深合并工具函数（见 domNative.js） | 需自定义 |
| `$.each(array, fn)` | `array.forEach(fn)` | |
| `$.each(obj, fn)` | `Object.entries(obj).forEach(fn)` | |
| `$.inArray(val, arr)` | `arr.indexOf(val)` | |
| `$.isArray(val)` | `Array.isArray(val)` | |
| `$.isFunction(val)` | `typeof val === 'function'` | |
| `$.isNumeric(val)` | `!isNaN(parseFloat(val)) && isFinite(val)` | |
| `$.trim(str)` | `str.trim()` | |
| `$.type(val)` | `typeof val`（不完全等价） | |
| `$.isEmptyObject(obj)` | `Object.keys(obj).length === 0` | |
| `$.isPlainObject(obj)` | `Object.prototype.toString.call(obj) === '[object Object]'` | |
| `$.parseJSON(str)` | `JSON.parse(str)` | |
| `$.contains(parent, child)` | `parent.contains(child)` | |
| `$.proxy(fn, context)` | `fn.bind(context)` | |

### 3.8 AJAX

| jQuery | 原生 JS | 备注 |
|--------|---------|------|
| `$.ajax(options)` | `fetch(url, options)` | |
| `$.get(url)` | `fetch(url)` | |
| `$.post(url, data)` | `fetch(url, {method:'POST', body})` | |
| `$.getJSON(url)` | `fetch(url).then(r => r.json())` | |

### 3.9 动画

| jQuery | 原生 JS | 备注 |
|--------|---------|------|
| `.fadeIn()` | `el.style.opacity = 0; el.style.transition = 'opacity 0.3s'; el.style.opacity = 1` | CSS transition |
| `.fadeOut()` | 同上，反向 | |
| `.slideDown()` | `el.style.height = '0'; el.style.overflow = 'hidden'; el.style.transition = 'height 0.3s'; el.style.height = el.scrollHeight + 'px'` | |
| `.slideUp()` | 同上，反向 | |
| `.animate(props, duration)` | `el.animate(keyframes, options)` | Web Animations API |

---

## 四、迁移策略：四阶段渐进式方案

### 阶段 1：创建原生 DOM 工具层（风险：低）✅ 已完成

**目标**：创建 `src/utils/domNative.js`，提供与 jQuery 兼容的 API，内部使用原生 JS 实现。

**产出**：
- `DomNative` 类：包装单个 DOM 元素，提供 `.css()`, `.show()`, `.hide()`, `.find()` 等方法
- `$$()` 函数：选择器函数，返回 `DomNative` 实例
- `deepMerge()` / `extend()` 函数：替代 `$.extend(true, ...)`
- 事件委托工具函数（内置于 `DomNative.on()` 中）

**关键设计决策**：
- `jquery-bridge.js` **保持不变**（仍导出真正的 jQuery），为未迁移文件服务
- 已迁移的 UI 文件**直接从 `domNative.js` 导入**，不再经过 `jquery-bridge.js`
- 两套系统**并行运行**，互不干扰
- `vite.config.js` 的 inject 插件 exclude 列表中添加了 `domNative.js`

### 阶段 2：迁移 UI 封装层（风险：中低）✅ 已完成

**目标**：将 `src/ui/` 下的 21 个封装对象从 jQuery 切换到 `DomNative`。

**已完成的迁移**：
- 所有 21 个 UI 文件已将 `import $ from '../jquery-bridge.js'` 替换为 `import { $$ } from '../utils/domNative.js'`
- 内部 `$(selector)` 替换为 `$$(selector)`
- `.el` getter 返回 `DomNative` 实例而非 jQuery 对象
- 惰性初始化检查从 `.length === 0` 改为 `.exists()` / `.containsInBody()`
- jQuery 的 `.end()` 链式回退已拆分为独立步骤
- 多元素选择器（如 `$("#a, #b")`）改用 `document.querySelectorAll()` + `forEach()`

**注意事项**：
- `.find()` 方法现在返回原生 `NodeList`（而非 jQuery 对象），调用方需适配
- `.el` getter 返回 `DomNative` 实例，外部代码如需原生元素可用 `.el[0]` 或 `.el.nativeElement`

### 阶段 3：迁移控制器和全局模块（风险：中高）

**目标**：将 `src/controllers/` 和 `src/global/` 中的直接 jQuery 调用替换为原生 JS。

**重点子任务**：
1. **`$.extend()` 替换**（376 处）→ `Object.assign()` 或 `deepMerge()`
2. **`$(this)` 替换**（656 处）→ `this` 或 `event.currentTarget`
3. **事件绑定替换** → `addEventListener`
4. **DOM 操作替换** → 原生 API
5. **`$.inArray()` 替换**（81 处）→ `Array.indexOf()`
6. **`$.each()` 替换**（75 处）→ `forEach()`

### 阶段 4：清理与移除 jQuery（风险：低）

**目标**：完全移除 jQuery 依赖。

**步骤**：
1. 替换 `jquery.sPage` 插件为原生分页实现
2. 移除 `jquery-bridge.js` 和 `jquery-init.js`
3. 从 `package.json` 移除 `jquery` 依赖
4. 从 `vite.config.js` 移除 `@rollup/plugin-inject` 配置
5. 移除 `window.jQuery` 和 `window.$` 全局变量
6. 清理所有残留的 jQuery 引用

---

## 五、DomNative 工具类设计

### 5.1 设计原则

1. **API 兼容**：方法签名与 jQuery 保持一致，降低迁移成本
2. **单元素优先**：UI 封装层绝大多数场景只操作单个元素，`DomNative` 包装单个 Element
3. **链式调用**：setter 方法返回 `this`，保持链式风格
4. **空安全**：当元素不存在时，方法静默返回（与 jQuery 空对象行为一致）
5. **不泄漏**：`.find()` 返回原生 NodeList 或数组，不返回 jQuery 对象

### 5.2 核心 API

```js
class DomNative {
    constructor(element)           // 包装原生 Element
    static $(selector)             // 选择器，返回 DomNative 实例
    get [0]()                      // 兼容 jQuery 的 [0] 访问
    get length()                   // 兼容 jQuery 的 length

    // 样式
    css(prop)                      // getter: 返回计算样式
    css(prop, value)               // setter: 设置行内样式
    css(props)                     // setter: 批量设置
    addClass(cls)                  // 添加类名
    removeClass(cls)               // 移除类名
    toggleClass(cls)               // 切换类名
    hasClass(cls)                  // 检查类名
    show()                         // 显示元素
    hide()                         // 隐藏元素
    is(selector)                   // 匹配选择器（含 ':visible'/'hidden'）

    // 内容
    html()                         // getter
    html(value)                    // setter
    text()                         // getter
    text(value)                    // setter
    val()                          // getter
    val(value)                     // setter

    // 属性
    attr(name)                     // getter
    attr(name, value)              // setter
    removeAttr(name)               // 移除属性
    prop(name)                     // getter
    prop(name, value)              // setter
    data(key)                      // getter (dataset)

    // 尺寸位置
    width()                        // clientWidth
    width(value)                   // setter
    height()                       // clientHeight
    height(value)                  // setter
    outerWidth()                   // offsetWidth
    outerHeight()                  // offsetHeight
    offset()                       // {top, left}
    position()                     // {top, left}
    scrollTop()                    // getter
    scrollTop(value)               // setter
    scrollLeft()                   // getter
    scrollLeft(value)              // setter

    // 结构
    append(child)                  // 追加子元素
    appendTo(parent)               // 追加到父元素
    prepend(child)                 // 前置子元素
    after(content)                 // 在后面插入
    before(content)                // 在前面插入
    remove()                       // 移除元素
    empty()                        // 清空内容
    clone()                        // 克隆元素

    // 遍历
    find(selector)                 // 返回 NodeList
    closest(selector)              // 返回 Element | null
    parent()                       // 返回 Element | null
    children()                     // 返回 HTMLCollection
    siblings()                     // 返回 Element[]
    next()                         // 返回 Element | null
    prev()                         // 返回 Element | null
    filter(selector)               // 过滤
    not(selector)                  // 排除
    eq(index)                      // 返回 DomNative | null
    get(index)                     // 返回 Element | null
    index()                        // 返回在兄弟中的索引
    each(fn)                       // 遍历（单元素时 fn(el, 0)）

    // 事件
    on(event, handler)             // 绑定事件
    on(event, selector, handler)   // 事件委托
    off(event, handler)            // 移除事件
    one(event, handler)            // 一次性事件
    trigger(event)                 // 触发事件
    click(handler?)                // 快捷事件
    mousedown(handler?)            // 快捷事件
    mouseup(handler?)              // 快捷事件
    keydown(handler?)              // 快捷事件
    keyup(handler?)                // 快捷事件
    focus(handler?)                // 快捷事件
    blur(handler?)                 // 快捷事件
    scroll(handler?)               // 快捷事件
    dblclick(handler?)             // 快捷事件
    change(handler?)               // 快捷事件
    mouseenter(handler)            // 快捷事件
    mouseleave(handler)            // 快捷事件
    mousewheel(handler)            // 鼠标滚轮（使用 wheel 事件）
}

// 工具函数
function $$(selector, context)     // 返回 DomNative 实例
function deepMerge(target, ...sources) // 替代 $.extend(true, ...)
function delegate(el, event, selector, handler) // 事件委托
```

---

## 六、迁移注意事项

### 6.1 jQuery `.css()` 的特殊行为

```js
// jQuery .css() 获取计算样式，包括样式表中的值
$('#el').css('display')  // → 'block'（即使行内样式没设置）

// 原生 JS 需要区分
el.style.display         // → '' （行内样式，可能为空）
getComputedStyle(el).display // → 'block' （计算样式）
```

**迁移方案**：`DomNative.css()` getter 使用 `getComputedStyle()`，与 jQuery 行为一致。

### 6.2 jQuery `.show()/.hide()` 的特殊行为

```js
// jQuery .hide() 会记住之前的 display 值，.show() 恢复
// 原生 JS 直接设置 display: none / ''
```

**迁移方案**：`DomNative` 在 `.hide()` 时保存旧 display 值到 `data-orig-display`，`.show()` 时恢复。

### 6.3 jQuery `.width()/.height()` 的特殊行为

```js
// jQuery .width() 返回不含 padding/border 的宽度
$('#el').width()   // → 内容宽度
// 原生 JS
el.clientWidth     // → 内容 + padding
el.offsetWidth     // → 内容 + padding + border
```

**迁移方案**：`DomNative.width()` 使用 `el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) - parseFloat(getComputedStyle(el).paddingRight)` 精确匹配 jQuery 行为。但在 Luckysheet 中，大多数场景 `clientWidth` 已足够，可简化。

### 6.4 jQuery `.on()` 事件委托

```js
// jQuery 支持事件委托
$('#parent').on('click', '.child', handler)

// 原生 JS 需要手动实现
parent.addEventListener('click', (e) => {
    const target = e.target.closest('.child');
    if (target && parent.contains(target)) {
        handler.call(target, e);
    }
});
```

### 6.5 jQuery `.data()` 的缓存机制

```js
// jQuery .data() 有内部缓存，不等于 data-* 属性
$('#el').data('key')  // 先查缓存，再查 data-key 属性
$('#el').data('key', 'val')  // 存入缓存，不修改 DOM

// 原生 JS
el.dataset.key       // 直接读写 data-key 属性
```

**迁移方案**：在 Luckysheet 中，`.data()` 主要用于读取 `data-*` 属性，使用 `dataset` 即可满足需求。

### 6.6 `$(this)` 在事件回调中的含义

```js
// jQuery
$('.btn').click(function() {
    $(this).addClass('active');  // this 指向触发事件的 DOM 元素
});

// 原生 JS
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.classList.add('active');  // this 同样指向 DOM 元素
        // 或使用箭头函数 + e.currentTarget
    });
});
```

### 6.7 `@rollup/plugin-inject` 的影响

当前构建配置会自动将所有文件中的裸 `$` 和 `jQuery` 替换为 `import $ from 'jquery'`。这意味着：
- 迁移过程中，已替换的文件中不能出现裸 `$`，否则仍会被注入 jQuery
- 需要在 `vite.config.js` 的 `inject` 配置中逐步排除已迁移的文件

---

## 七、迁移检查清单

每个文件迁移完成后，需验证：

- [ ] 所有 `import $ from '../jquery-bridge.js'` 已移除
- [ ] 所有 `$(selector)` 已替换为原生 API 或 `$$()`
- [ ] 所有 `$.extend()` 已替换为 `Object.assign()` 或 `deepMerge()`
- [ ] 所有 `$.inArray()` 已替换为 `Array.indexOf()`
- [ ] 所有 `$.each()` 已替换为 `forEach()`
- [ ] 事件绑定使用 `addEventListener`
- [ ] 无裸 `$` 或 `jQuery` 引用残留
- [ ] 功能测试通过
