# jQuery DOM 替换完整指南

> 本文档提供每个 jQuery DOM API 的原生替代方案，以及一个轻量级 DOM 辅助工具类设计。

---

## 1. 选择器替换

### 1.1 `$(selector)` → 原生查询

| jQuery | 原生替代 | 返回类型 | 说明 |
|--------|---------|---------|------|
| `$(selector)` | `document.querySelector(selector)` | `Element \| null` | 获取第一个匹配元素 |
| `$(selector)` | `document.querySelectorAll(selector)` | `NodeListOf<Element>` | 获取所有匹配元素 |
| `$(element)` | 直接使用 `element` | `Element` | 无需包装 |
| `$(htmlString)` | `createElementFromHTML(htmlString)` | `Element` | 需自定义辅助函数 |
| `$("body")` | `document.body` | `HTMLBodyElement` | 直接引用 |
| `$(document)` | `document` | `Document` | 直接引用 |
| `$(window)` | `window` | `Window` | 直接引用 |

### 1.2 从 HTML 字符串创建元素

```typescript
function createElementFromHTML(htmlString: string): Element {
  const template = document.createElement('template');
  template.innerHTML = htmlString.trim();
  return template.content.firstChild as Element;
}

// 处理多个元素
function createElementsFromHTML(htmlString: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = htmlString.trim();
  return template.content;
}
```

**代码库中的使用场景**：
- `utils/dialogUtils.js` — `$("body").append(html)` → `document.body.insertAdjacentHTML('beforeend', html)`
- `global/formula/rangeSelect.js` — `$(function_str).insertAfter(...)` → `createElementFromHTML(function_str)`

---

## 2. DOM 操作替换

### 2.1 内容操作

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.html()` | `element.innerHTML` | 获取内部 HTML |
| `.html(content)` | `element.innerHTML = content` | 设置内部 HTML |
| `.text()` | `element.textContent` | 获取文本内容 |
| `.text(content)` | `element.textContent = content` | 设置文本内容 |
| `.val()` | `element.value` | 获取表单值 |
| `.val(value)` | `element.value = value` | 设置表单值 |

**迁移示例**：

```javascript
// jQuery
let text = $("#input").val();
$("#input").val("new value");
let content = $("#el").html();
$("#el").html("<span>new</span>");

// 原生
let text = (document.querySelector("#input") as HTMLInputElement).value;
(document.querySelector("#input") as HTMLInputElement).value = "new value";
let content = document.querySelector("#el")!.innerHTML;
document.querySelector("#el")!.innerHTML = "<span>new</span>";
```

### 2.2 属性操作

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.attr(name)` | `element.getAttribute(name)` | 获取属性 |
| `.attr(name, value)` | `element.setAttribute(name, value)` | 设置属性 |
| `.removeAttr(name)` | `element.removeAttribute(name)` | 移除属性 |
| `.prop(name)` | `element[name]` | 获取 DOM 属性 |
| `.prop(name, value)` | `element[name] = value` | 设置 DOM 属性 |
| `.data(key)` | `element.dataset[key]` | 获取 data-* 属性 |
| `.data(key, value)` | `element.dataset[key] = value` | 设置 data-* 属性 |

**迁移示例**：

```javascript
// jQuery
let editable = $cur.attr("contenteditable");
$("#icon").attr("color", color);
$("#input-box").removeAttr("style");

// 原生
let editable = element.getAttribute("contenteditable");
document.querySelector("#icon")!.setAttribute("color", color);
document.querySelector("#input-box")!.removeAttribute("style");
```

**特殊注意**：`attr` vs `prop` 的区别

```javascript
// jQuery 区分 attr 和 prop
$("#cb").attr("checked")   // 返回 "checked" 或 undefined
$("#cb").prop("checked")   // 返回 true 或 false

// 原生
cb.getAttribute("checked") // 返回 "checked" 或 null
cb.checked                 // 返回 true 或 false（推荐）
```

### 2.3 CSS 类操作

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.addClass(className)` | `element.classList.add(className)` | 添加类 |
| `.addClass("a b")` | `element.classList.add("a", "b")` | 添加多个类 |
| `.removeClass(className)` | `element.classList.remove(className)` | 移除类 |
| `.removeClass("a b")` | `element.classList.remove("a", "b")` | 移除多个类 |
| `.toggleClass(className)` | `element.classList.toggle(className)` | 切换类 |
| `.hasClass(className)` | `element.classList.contains(className)` | 检测类 |

**迁移示例**：

```javascript
// jQuery — 链式调用
$icon.removeAttr("class").addClass("luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-align-" + value);

// 原生 — 拆分为两步
icon.removeAttribute("class");
icon.classList.add("luckysheet-icon-img-container", "luckysheet-icon-img", `luckysheet-icon-align-${value}`);
```

### 2.4 样式操作

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.css(prop)` | `getComputedStyle(element).prop` | 获取计算样式 |
| `.css(prop, value)` | `element.style.prop = value` | 设置内联样式 |
| `.css({prop1: val1, prop2: val2})` | `Object.assign(element.style, {prop1: val1, prop2: val2})` | 批量设置 |
| `.show()` | `element.style.display = ''` | 显示元素 |
| `.hide()` | `element.style.display = 'none'` | 隐藏元素 |

**迁移示例**：

```javascript
// jQuery — 获取样式
parseInt($("#luckysheet-input-box").css("top"))

// 原生
parseInt(getComputedStyle(document.querySelector("#luckysheet-input-box")!).top)

// jQuery — 批量设置样式
$("#luckysheet-input-box").removeAttr("style").css({
    top: top + "px",
    left: left + "px",
    width: width + "px",
    height: height + "px"
});

// 原生
const el = document.querySelector("#luckysheet-input-box")!;
el.removeAttribute("style");
Object.assign(el.style, {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`
});
```

**CSS 属性名映射**：

| jQuery / CSS | 原生 style 属性 |
|-------------|----------------|
| `font-size` | `fontSize` |
| `background-color` | `backgroundColor` |
| `border-bottom-color` | `borderBottomColor` |
| `z-index` | `zIndex` |
| `margin-left` | `marginLeft` |
| `white-space` | `whiteSpace` |

### 2.5 DOM 插入/删除

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.append(content)` | `element.append(content)` | 追加到末尾 |
| `.prepend(content)` | `element.prepend(content)` | 插入到开头 |
| `.before(content)` | `element.before(content)` | 前面插入 |
| `.after(content)` | `element.after(content)` | 后面插入 |
| `.remove()` | `element.remove()` | 移除元素 |
| `.empty()` | `element.innerHTML = ''` | 清空内容 |
| `.appendTo(target)` | `target.append(element)` | 追加到目标 |
| `.insertAfter(target)` | `target.after(element)` | 插入到目标后面 |
| `.insertBefore(target)` | `target.before(element)` | 插入到目标前面 |
| `.replaceWith(content)` | `element.replaceWith(content)` | 替换元素 |
| `.clone()` | `element.cloneNode(true)` | 深克隆 |

**迁移示例**：

```javascript
// jQuery
$("body").append(menu);
$menuItem.appendTo($menu);

// 原生
document.body.append(menuElement);
menuElement.append(menuItemElement);

// jQuery — HTML 字符串追加
$("body").append('<div id="dialog">...</div>');

// 原生 — HTML 字符串追加
document.body.insertAdjacentHTML('beforeend', '<div id="dialog">...</div>');
```

---

## 3. DOM 遍历替换

### 3.1 向上遍历

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.parent()` | `element.parentElement` | 直接父元素 |
| `.parents(selector)` | 自定义向上查找 | 所有匹配祖先 |
| `.closest(selector)` | `element.closest(selector)` | 最近匹配祖先 |
| `.offsetParent()` | `element.offsetParent` | 定位父元素 |

**`parents()` 的原生实现**：

```typescript
function parents(element: Element, selector?: string): Element[] {
  const result: Element[] = [];
  let current = element.parentElement;
  while (current) {
    if (!selector || current.matches(selector)) {
      result.push(current);
    }
    current = current.parentElement;
  }
  return result;
}
```

### 3.2 向下遍历

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.children()` | `element.children` | 直接子元素 |
| `.children(selector)` | `Array.from(element.children).filter(c => c.matches(selector))` | 筛选子元素 |
| `.find(selector)` | `element.querySelectorAll(selector)` | 所有后代 |
| `.first()` | `element.firstElementChild` 或 `element.querySelector(...)` | 第一个 |
| `.last()` | `element.lastElementChild` | 最后一个 |
| `.eq(index)` | `element.children[index]` | 按索引取 |

### 3.3 同级遍历

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.next()` | `element.nextElementSibling` | 下一个兄弟 |
| `.prev()` | `element.previousElementSibling` | 上一个兄弟 |
| `.siblings()` | `Array.from(element.parentElement.children).filter(c => c !== element)` | 所有兄弟 |
| `.nextAll()` | 自定义实现 | 后面所有兄弟 |
| `.prevAll()` | 自定义实现 | 前面所有兄弟 |

### 3.4 筛选

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.filter(selector)` | `Array.from(list).filter(el => el.matches(selector))` | 筛选 |
| `.not(selector)` | `Array.from(list).filter(el => !el.matches(selector))` | 排除 |
| `.is(selector)` | `element.matches(selector)` | 匹配检测 |
| `.is(":visible")` | `isVisible(element)` | 可见性检测 |
| `.is(":checked")` | `element.checked` | 选中检测 |
| `.is(":selected")` | `element.selected` | 选中检测 |
| `.index()` | `Array.from(element.parentElement.children).indexOf(element)` | 获取索引 |
| `.has(selector)` | `element.querySelector(selector) !== null` | 包含检测 |

**可见性检测工具函数**：

```typescript
function isVisible(element: Element): boolean {
  return element.checkVisibility({
    checkOpacity: true,
    checkVisibilityCSS: true,
    checkContentVisibility: true,
  });
}

// 兼容方案
function isVisibleLegacy(element: Element): boolean {
  return !!(element as HTMLElement).offsetWidth ||
         !!(element as HTMLElement).offsetHeight ||
         (element as HTMLElement).getClientRects().length > 0;
}
```

---

## 4. 事件处理替换

### 4.1 基本事件绑定

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.on(event, handler)` | `element.addEventListener(event, handler)` | 绑定事件 |
| `.off(event, handler)` | `element.removeEventListener(event, handler)` | 解绑事件 |
| `.on(event, selector, handler)` | 事件委托（见下方） | 委托绑定 |
| `.one(event, handler)` | `element.addEventListener(event, handler, { once: true })` | 一次性绑定 |
| `.trigger(event)` | `element.dispatchEvent(new Event(event, {bubbles: true}))` | 触发事件 |
| `.click(handler)` | `element.addEventListener('click', handler)` | 快捷绑定 |

### 4.2 事件委托

```javascript
// jQuery
$(parent).on("click", ".child-selector", handler);

// 原生
parent.addEventListener("click", (event) => {
  const target = event.target.closest(".child-selector");
  if (target && parent.contains(target)) {
    handler.call(target, event);
  }
});
```

### 4.3 命名空间事件

jQuery 支持事件命名空间（如 `click.myNamespace`），原生不支持。推荐使用 `AbortController` 方案：

```typescript
class NamespacedEventManager {
  private controllers = new Map<string, AbortController>();

  on(
    element: EventTarget,
    event: string,
    namespace: string,
    handler: EventListener,
    selector?: string
  ): void {
    const key = `${event}.${namespace}`;
    const controller = new AbortController();

    const wrappedHandler: EventListener = selector
      ? (e) => {
          const target = (e.target as Element).closest(selector);
          if (target && (element as Element).contains(target)) {
            handler.call(target, e);
          }
        }
      : handler;

    element.addEventListener(event, wrappedHandler, {
      signal: controller.signal,
    });

    this.controllers.set(key, controller);
  }

  off(event: string, namespace: string): void {
    const key = `${event}.${namespace}`;
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  offAll(namespace: string): void {
    for (const [key, controller] of this.controllers) {
      if (key.endsWith(`.${namespace}`)) {
        controller.abort();
        this.controllers.delete(key);
      }
    }
  }
}
```

### 4.4 jQuery 事件对象 vs 原生事件对象

| jQuery 事件属性 | 原生事件属性 | 说明 |
|---------------|-------------|------|
| `event.which` | `event.key` / `event.code` | 按键码 |
| `event.preventDefault()` | `event.preventDefault()` | 阻止默认行为 |
| `event.stopPropagation()` | `event.stopPropagation()` | 阻止冒泡 |
| `event.target` | `event.target` | 事件源 |
| `event.currentTarget` | `event.currentTarget` | 当前处理元素 |
| `event.pageX` | `event.pageX` | 页面 X 坐标 |
| `event.pageY` | `event.pageY` | 页面 Y 坐标 |
| `event.delegateTarget` | 无直接对应 | 委托元素 |
| `event.data` | 闭包传递 | 附加数据 |
| `event.namespace` | 无直接对应 | 命名空间 |

**按键码迁移**：

```javascript
// jQuery
if (event.which === 13) { ... }  // Enter
if (event.which === 27) { ... }  // Escape

// 原生（推荐使用 key）
if (event.key === 'Enter') { ... }
if (event.key === 'Escape') { ... }

// 或使用 code（物理键位）
if (event.code === 'Enter') { ... }
```

---

## 5. 尺寸/位置替换

### 5.1 尺寸获取

| jQuery | 原生替代 | 包含 |
|--------|---------|------|
| `.width()` | `element.getBoundingClientRect().width` 或 `element.clientWidth - padding` | content |
| `.height()` | `element.getBoundingClientRect().height` 或 `element.clientHeight - padding` | content |
| `.innerWidth()` | `element.clientWidth` | content + padding |
| `.innerHeight()` | `element.clientHeight` | content + padding |
| `.outerWidth()` | `element.offsetWidth` | content + padding + border |
| `.outerWidth(true)` | `element.offsetWidth + marginLeft + marginRight` | + margin |
| `.outerHeight()` | `element.offsetHeight` | content + padding + border |
| `.outerHeight(true)` | `element.offsetHeight + marginTop + marginBottom` | + margin |

**精确 content 宽度**：

```typescript
function getContentWidth(element: Element): number {
  const computed = getComputedStyle(element);
  const paddingX =
    parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
  return element.clientWidth - paddingX;
}

function getContentHeight(element: Element): number {
  const computed = getComputedStyle(element);
  const paddingY =
    parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
  return element.clientHeight - paddingY;
}
```

### 5.2 位置获取

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `.offset()` | `getOffset(element)` | 相对于文档 |
| `.position()` | `element.offsetTop` / `element.offsetLeft` | 相对于定位父元素 |
| `.scrollTop()` | `element.scrollTop` | 垂直滚动位置 |
| `.scrollLeft()` | `element.scrollLeft` | 水平滚动位置 |
| `.scrollTop(val)` | `element.scrollTop = val` | 设置垂直滚动 |
| `.scrollLeft(val)` | `element.scrollLeft = val` | 设置水平滚动 |

```typescript
function getOffset(element: Element): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  };
}
```

### 5.3 窗口尺寸

| jQuery | 原生替代 |
|--------|---------|
| `$(window).width()` | `window.innerWidth` |
| `$(window).height()` | `window.innerHeight` |
| `$(document).width()` | `document.documentElement.scrollWidth` |
| `$(document).height()` | `document.documentElement.scrollHeight` |

---

## 6. 工具函数替换

### 6.1 `$.extend()` → 深拷贝/合并

```typescript
// 深拷贝 — 最常见用法：$.extend(true, {}, obj)
// 方案1：structuredClone（推荐，现代浏览器支持）
const clone = structuredClone(original);

// 方案2：自定义 deepMerge（支持函数等特殊值）
function deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
  const result = structuredClone(target);
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
        result[key] = deepMerge({ ...targetVal }, sourceVal);
      } else {
        (result as Record<string, unknown>)[key as string] = structuredClone(sourceVal);
      }
    }
  }
  return result;
}
```

### 6.2 其他工具函数

| jQuery | 原生替代 | 说明 |
|--------|---------|------|
| `$.extend(true, {}, obj)` | `structuredClone(obj)` | 深拷贝 |
| `$.extend(target, source)` | `Object.assign(target, source)` | 浅合并 |
| `$.inArray(val, arr)` | `arr.indexOf(val)` 或 `arr.includes(val)` | 数组查找 |
| `$.each(arr, fn)` | `arr.forEach(fn)` | 数组遍历 |
| `$.each(obj, fn)` | `Object.entries(obj).forEach(fn)` | 对象遍历 |
| `$.trim(str)` | `str.trim()` | 去空白 |
| `$.isArray(val)` | `Array.isArray(val)` | 数组判断 |
| `$.isFunction(val)` | `typeof val === 'function'` | 函数判断 |
| `$.isNumeric(val)` | `typeof val === 'number' && !isNaN(val) && isFinite(val)` | 数值判断 |
| `$.isEmptyObject(obj)` | `Object.keys(obj).length === 0` | 空对象判断 |
| `$.isPlainObject(obj)` | `Object.prototype.toString.call(obj) === '[object Object]'` | 纯对象判断 |
| `$.type(val)` | `typeof val` / `Array.isArray(val)` | 类型判断 |
| `$.proxy(fn, context)` | `fn.bind(context)` | 绑定上下文 |
| `$.parseJSON(str)` | `JSON.parse(str)` | 解析 JSON |
| `$.now()` | `Date.now()` | 当前时间戳 |
| `$.contains(parent, child)` | `parent.contains(child)` | 包含检测 |
| `$.noop` | `() => {}` | 空函数 |

---

## 7. 动画替换

### 7.1 fadeIn / fadeOut

```typescript
function fadeIn(element: HTMLElement, duration = 400): Promise<void> {
  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.display = '';
    element.style.transition = `opacity ${duration}ms`;
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
    element.addEventListener(
      'transitionend',
      () => {
        element.style.transition = '';
        resolve();
      },
      { once: true }
    );
  });
}

function fadeOut(element: HTMLElement, duration = 400): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '0';
    element.addEventListener(
      'transitionend',
      () => {
        element.style.display = 'none';
        element.style.transition = '';
        resolve();
      },
      { once: true }
    );
  });
}
```

### 7.2 slideUp / slideDown

```typescript
function slideDown(element: HTMLElement, duration = 200): Promise<void> {
  return new Promise((resolve) => {
    element.style.display = '';
    element.style.overflow = 'hidden';
    const height = element.scrollHeight;
    element.style.height = '0';
    element.style.transition = `height ${duration}ms`;
    requestAnimationFrame(() => {
      element.style.height = `${height}px`;
    });
    element.addEventListener(
      'transitionend',
      () => {
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
        resolve();
      },
      { once: true }
    );
  });
}

function slideUp(element: HTMLElement, duration = 200): Promise<void> {
  return new Promise((resolve) => {
    element.style.overflow = 'hidden';
    element.style.height = `${element.scrollHeight}px`;
    element.style.transition = `height ${duration}ms`;
    requestAnimationFrame(() => {
      element.style.height = '0';
    });
    element.addEventListener(
      'transitionend',
      () => {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
        resolve();
      },
      { once: true }
    );
  });
}
```

---

## 8. 轻量级 DOM 辅助工具类

以下 TypeScript 实现提供了 jQuery 风格的链式调用便利性，但完全基于原生 DOM API，无 jQuery 依赖。

```typescript
type DOMSelector = string | Element | HTMLElement | null;

class Dom {
  private elements: Element[];

  constructor(selector: DOMSelector) {
    if (selector === null || selector === undefined) {
      this.elements = [];
    } else if (typeof selector === 'string') {
      this.elements = Array.from(document.querySelectorAll(selector));
    } else if (selector instanceof Element) {
      this.elements = [selector];
    } else {
      this.elements = [];
    }
  }

  static $(selector: DOMSelector): Dom {
    return new Dom(selector);
  }

  get length(): number {
    return this.elements.length;
  }

  get(index: number = 0): Element | undefined {
    return this.elements[index];
  }

  first(): Element | undefined {
    return this.elements[0];
  }

  last(): Element | undefined {
    return this.elements[this.elements.length - 1];
  }

  each(callback: (element: Element, index: number) => void): this {
    this.elements.forEach(callback);
    return this;
  }

  // --- 内容操作 ---

  html(content?: string): string | this {
    if (content === undefined) {
      return this.elements[0]?.innerHTML ?? '';
    }
    this.elements.forEach((el) => (el.innerHTML = content));
    return this;
  }

  text(content?: string): string | this {
    if (content === undefined) {
      return this.elements[0]?.textContent ?? '';
    }
    this.elements.forEach((el) => (el.textContent = content));
    return this;
  }

  val(value?: string): string | this {
    if (value === undefined) {
      return (this.elements[0] as HTMLInputElement)?.value ?? '';
    }
    this.elements.forEach((el) => ((el as HTMLInputElement).value = value));
    return this;
  }

  // --- 属性操作 ---

  attr(name: string, value?: string): string | null | this {
    if (value === undefined) {
      return this.elements[0]?.getAttribute(name) ?? null;
    }
    this.elements.forEach((el) => el.setAttribute(name, value));
    return this;
  }

  removeAttr(name: string): this {
    this.elements.forEach((el) => el.removeAttribute(name));
    return this;
  }

  prop(name: string, value?: unknown): unknown | this {
    if (value === undefined) {
      return (this.elements[0] as any)?.[name];
    }
    this.elements.forEach((el) => ((el as any)[name] = value));
    return this;
  }

  data(key: string, value?: string): string | undefined | this {
    if (value === undefined) {
      return this.elements[0]?.dataset[key];
    }
    this.elements.forEach((el) => (el.dataset[key] = value));
    return this;
  }

  // --- CSS 类操作 ---

  addClass(...classNames: string[]): this {
    this.elements.forEach((el) => el.classList.add(...classNames));
    return this;
  }

  removeClass(...classNames: string[]): this {
    this.elements.forEach((el) => el.classList.remove(...classNames));
    return this;
  }

  toggleClass(className: string, force?: boolean): this {
    this.elements.forEach((el) => el.classList.toggle(className, force));
    return this;
  }

  hasClass(className: string): boolean {
    return this.elements.some((el) => el.classList.contains(className));
  }

  // --- 样式操作 ---

  css(prop: string): string;
  css(props: Record<string, string>): this;
  css(prop: string, value: string): this;
  css(propOrProps: string | Record<string, string>, value?: string): string | this {
    if (typeof propOrProps === 'string') {
      if (value === undefined) {
        return this.elements[0]
          ? getComputedStyle(this.elements[0])[propOrProps as any]
          : '';
      }
      this.elements.forEach((el) => ((el as HTMLElement).style[propOrProps as any] = value));
      return this;
    }
    this.elements.forEach((el) => {
      Object.assign((el as HTMLElement).style, propOrProps);
    });
    return this;
  }

  show(): this {
    this.elements.forEach((el) => ((el as HTMLElement).style.display = ''));
    return this;
  }

  hide(): this {
    this.elements.forEach((el) => ((el as HTMLElement).style.display = 'none'));
    return this;
  }

  // --- DOM 遍历 ---

  find(selector: string): Dom {
    const result: Element[] = [];
    this.elements.forEach((el) => {
      result.push(...el.querySelectorAll(selector));
    });
    const dom = new Dom(null as any);
    dom.elements = result;
    return dom;
  }

  closest(selector: string): Dom {
    const result = this.elements[0]?.closest(selector);
    const dom = new Dom(null as any);
    dom.elements = result ? [result] : [];
    return dom;
  }

  parent(): Dom {
    const result = this.elements[0]?.parentElement;
    const dom = new Dom(null as any);
    dom.elements = result ? [result] : [];
    return dom;
  }

  parents(selector: string): Dom {
    const result: Element[] = [];
    let current = this.elements[0]?.parentElement;
    while (current) {
      if (current.matches(selector)) {
        result.push(current);
      }
      current = current.parentElement;
    }
    const dom = new Dom(null as any);
    dom.elements = result;
    return dom;
  }

  children(selector?: string): Dom {
    const result: Element[] = [];
    this.elements.forEach((el) => {
      const children = Array.from(el.children);
      if (selector) {
        result.push(...children.filter((c) => c.matches(selector)));
      } else {
        result.push(...children);
      }
    });
    const dom = new Dom(null as any);
    dom.elements = result;
    return dom;
  }

  siblings(selector?: string): Dom {
    const result: Element[] = [];
    this.elements.forEach((el) => {
      const siblings = Array.from(el.parentElement!.children).filter(
        (c) => c !== el
      );
      if (selector) {
        result.push(...siblings.filter((s) => s.matches(selector)));
      } else {
        result.push(...siblings);
      }
    });
    const dom = new Dom(null as any);
    dom.elements = result;
    return dom;
  }

  next(): Dom {
    const result = this.elements[0]?.nextElementSibling;
    const dom = new Dom(null as any);
    dom.elements = result ? [result] : [];
    return dom;
  }

  prev(): Dom {
    const result = this.elements[0]?.previousElementSibling;
    const dom = new Dom(null as any);
    dom.elements = result ? [result] : [];
    return dom;
  }

  index(): number {
    const el = this.elements[0];
    if (!el?.parentElement) return -1;
    return Array.from(el.parentElement.children).indexOf(el);
  }

  // --- 筛选 ---

  is(selector: string): boolean {
    return this.elements[0]?.matches(selector) ?? false;
  }

  isVisible(): boolean {
    const el = this.elements[0] as HTMLElement;
    if (!el) return false;
    return el.offsetWidth > 0 || el.offsetHeight > 0;
  }

  filter(selector: string): Dom {
    const dom = new Dom(null as any);
    dom.elements = this.elements.filter((el) => el.matches(selector));
    return dom;
  }

  not(selector: string): Dom {
    const dom = new Dom(null as any);
    dom.elements = this.elements.filter((el) => !el.matches(selector));
    return dom;
  }

  // --- DOM 操作 ---

  append(child: string | Element | Dom): this {
    this.elements.forEach((el) => {
      if (typeof child === 'string') {
        el.insertAdjacentHTML('beforeend', child);
      } else if (child instanceof Dom) {
        child.elements.forEach((c) => el.appendChild(c.cloneNode(true)));
      } else {
        el.appendChild(child.cloneNode(true));
      }
    });
    return this;
  }

  prepend(child: string | Element | Dom): this {
    this.elements.forEach((el) => {
      if (typeof child === 'string') {
        el.insertAdjacentHTML('afterbegin', child);
      } else if (child instanceof Dom) {
        child.elements.forEach((c) => el.prepend(c.cloneNode(true)));
      } else {
        el.prepend(child.cloneNode(true));
      }
    });
    return this;
  }

  remove(): this {
    this.elements.forEach((el) => el.remove());
    return this;
  }

  empty(): this {
    this.elements.forEach((el) => (el.innerHTML = ''));
    return this;
  }

  clone(deep = true): Dom {
    const dom = new Dom(null as any);
    dom.elements = this.elements.map((el) => el.cloneNode(deep) as Element);
    return dom;
  }

  // --- 事件 ---

  on(event: string, handler: EventListener, options?: AddEventListenerOptions): this {
    this.elements.forEach((el) => el.addEventListener(event, handler, options));
    return this;
  }

  off(event: string, handler: EventListener, options?: EventListenerOptions): this {
    this.elements.forEach((el) => el.removeEventListener(event, handler, options));
    return this;
  }

  once(event: string, handler: EventListener): this {
    this.elements.forEach((el) =>
      el.addEventListener(event, handler, { once: true })
    );
    return this;
  }

  trigger(event: string, detail?: unknown): this {
    this.elements.forEach((el) => {
      const customEvent = detail !== undefined
        ? new CustomEvent(event, { detail, bubbles: true })
        : new Event(event, { bubbles: true });
      el.dispatchEvent(customEvent);
    });
    return this;
  }

  // --- 尺寸/位置 ---

  width(): number {
    const el = this.elements[0] as HTMLElement;
    if (!el) return 0;
    return el.getBoundingClientRect().width;
  }

  height(): number {
    const el = this.elements[0] as HTMLElement;
    if (!el) return 0;
    return el.getBoundingClientRect().height;
  }

  outerWidth(includeMargin = false): number {
    const el = this.elements[0] as HTMLElement;
    if (!el) return 0;
    let width = el.offsetWidth;
    if (includeMargin) {
      const style = getComputedStyle(el);
      width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    }
    return width;
  }

  outerHeight(includeMargin = false): number {
    const el = this.elements[0] as HTMLElement;
    if (!el) return 0;
    let height = el.offsetHeight;
    if (includeMargin) {
      const style = getComputedStyle(el);
      height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }
    return height;
  }

  offset(): { top: number; left: number } {
    const el = this.elements[0] as HTMLElement;
    if (!el) return { top: 0, left: 0 };
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    };
  }

  scrollTop(value?: number): number | this {
    const el = this.elements[0] as HTMLElement;
    if (!el) return 0;
    if (value === undefined) return el.scrollTop;
    el.scrollTop = value;
    return this;
  }

  scrollLeft(value?: number): number | this {
    const el = this.elements[0] as HTMLElement;
    if (!el) return 0;
    if (value === undefined) return el.scrollLeft;
    el.scrollLeft = value;
    return this;
  }

  // --- 静态工具方法 ---

  static extend(deep: boolean, target: any, ...sources: any[]): any {
    if (!deep) {
      return Object.assign(target, ...sources);
    }
    return deepMerge(target, ...sources);
  }

  static inArray(value: unknown, array: unknown[]): number {
    return array.indexOf(value);
  }

  static isArray(value: unknown): boolean {
    return Array.isArray(value);
  }

  static isFunction(value: unknown): boolean {
    return typeof value === 'function';
  }

  static isNumeric(value: unknown): boolean {
    return typeof value === 'number' && !isNaN(value as number) && isFinite(value as number);
  }

  static trim(str: string): string {
    return str.trim();
  }

  static each<T>(
    collection: T[] | Record<string, T>,
    callback: (indexOrKey: number | string, value: T) => boolean | void
  ): void {
    if (Array.isArray(collection)) {
      collection.forEach((value, index) => callback(index, value));
    } else {
      Object.entries(collection).forEach(([key, value]) => callback(key, value));
    }
  }

  static proxy(fn: Function, context: unknown): Function {
    return fn.bind(context);
  }

  static contains(parent: Element, child: Element): boolean {
    return parent.contains(child);
  }

  static now(): number {
    return Date.now();
  }
}

// 导出便捷函数
const $ = Dom.$;

export { Dom, $ };
export default $;
```

### 使用示例

```typescript
// jQuery 风格
$('#luckysheet-cell-main').css('top', '100px').show();

// 获取原生元素
const el = $('#my-element').get(0);

// 链式调用
$('.menu-item').addClass('active').siblings().removeClass('active');

// 事件绑定
$('#button').on('click', (e) => {
  console.log('clicked', e.target);
});

// 工具函数
const clone = $.extend(true, {}, originalObject);
const index = $.inArray(value, array);
```

---

## 9. AJAX 替换

### 9.1 `$.post()` → `fetch()`

```typescript
async function post<T = any>(
  url: string,
  data: Record<string, unknown>,
  callback?: (data: T) => void
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(data as Record<string, string>),
  });
  const result = await response.json();
  callback?.(result);
  return result;
}
```

### 9.2 `$.ajax()` → `fetch()`

```typescript
interface AjaxOptions {
  url: string;
  method?: string;
  data?: Record<string, unknown>;
  contentType?: string;
  success?: (data: any) => void;
  error?: (xhr: any, status: string, error: string) => void;
  async?: boolean;
}

async function ajax(options: AjaxOptions): Promise<any> {
  try {
    const init: RequestInit = {
      method: options.method || 'GET',
      headers: {},
    };

    if (options.data) {
      if (options.method === 'POST') {
        init.headers = {
          'Content-Type':
            options.contentType || 'application/x-www-form-urlencoded',
        };
        init.body = new URLSearchParams(
          options.data as Record<string, string>
        );
      } else {
        const params = new URLSearchParams(
          options.data as Record<string, string>
        );
        options.url += `?${params.toString()}`;
      }
    }

    const response = await fetch(options.url, init);
    const result = await response.json();
    options.success?.(result);
    return result;
  } catch (error) {
    options.error?.(null, 'error', String(error));
    throw error;
  }
}
```

---

## 10. 迁移检查清单

迁移每个文件时，按以下清单逐项检查：

- [ ] 所有 `$(selector)` 替换为 `document.querySelector` / `document.querySelectorAll`
- [ ] 所有 `.css()` 替换为 `element.style` / `getComputedStyle`
- [ ] 所有 `.show()` / `.hide()` 替换为 `element.style.display`
- [ ] 所有 `.on()` / `.off()` 替换为 `addEventListener` / `removeEventListener`
- [ ] 命名空间事件使用 `AbortController` 或自定义管理器
- [ ] 事件委托使用 `e.target.closest()` 模式
- [ ] 所有 `$.extend(true, {}, obj)` 替换为 `structuredClone` 或 `deepMerge`
- [ ] 所有 `.is(":visible")` 替换为自定义 `isVisible` 函数
- [ ] 所有 `.width()` / `.height()` 确认使用正确的原生 API
- [ ] 所有 `$.post()` / `$.ajax()` 替换为 `fetch`
- [ ] jQuery 对象的 `[0]` 访问不再需要
- [ ] 链式调用拆分为独立语句或使用 Dom 辅助类
- [ ] `.removeAttr("class").addClass(...)` 拆分为两步
