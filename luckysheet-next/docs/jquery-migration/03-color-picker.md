# Spectrum 颜色选择器替换方案

> 本文档分析当前 spectrum-colorpicker 的使用情况，并提供零 jQuery 依赖的替换方案。

---

## 1. 当前 Spectrum 使用分析

### 1.1 使用统计

| 操作 | 次数 | 文件数 |
|------|------|--------|
| `.spectrum({options})` 初始化 | 10 | 7 |
| `.spectrum("get")` 获取颜色 | 14 | 5 |
| `.spectrum("set", color)` 设置颜色 | 9 | 3 |
| **总计** | **33** | **10** |

### 1.2 使用文件详细列表

#### 初始化（`.spectrum({options})`）

| 文件 | 选择器 | 用途 | flat 模式 |
|------|--------|------|-----------|
| `initTextColor.js` | `#${menuButtonId} .luckysheet-color-selected` | 文字颜色 | ✅ |
| `initCellColor.js` | `#${menuButtonId} .luckysheet-color-selected` | 单元格背景色 | ✅ |
| `initBorder.js` | `#${subcolormenuid} .luckysheet-color-selected` | 边框颜色 | ❌ |
| `sheetBar.js` | `#luckysheetsheetconfigcolorur` | 工作表标签颜色 | ❌ |
| `imageCtrl.js` | `#luckysheet-imageCtrl-colorSelect-dialog .colorshowbox` | 图片边框颜色 | ❌ |
| `alternateformatObj.js` | `#luckysheet-alternateformat-colorSelect-dialog .colorshowbox` | 交替格式颜色 | ❌ |
| `dialog.js` | `#luckysheet-alternateformat-colorSelect-dialog .colorshowbox` | 交替格式对话框 | ❌ |
| `conditionformat/dialog/index.js` | `.luckysheet-conditionformat-config-color` | 条件格式颜色 | ❌ |

#### 获取颜色（`.spectrum("get")`）

| 文件 | 选择器 | 转换方法 | 用途 |
|------|--------|---------|------|
| `initConditionDialogEvents.js` | `#textcolorshow` | `.toHexString()` | 获取文字颜色 |
| `initConditionDialogEvents.js` | `#cellcolorshow` | `.toHexString()` | 获取背景色 |
| `initNewRuleEvents.js` | `.dataBarBox .luckysheet-conditionformat-config-color` | `.toHexString()` | 数据条颜色 |
| `initNewRuleEvents.js` | `.colorGradationBox .maxVal .luckysheet-conditionformat-config-color` | `.toRgbString()` | 渐变最大值颜色 |
| `initNewRuleEvents.js` | `.colorGradationBox .midVal .luckysheet-conditionformat-config-color` | `.toRgbString()` | 渐变中间值颜色 |
| `initNewRuleEvents.js` | `.colorGradationBox .minVal .luckysheet-conditionformat-config-color` | `.toRgbString()` | 渐变最小值颜色 |
| `initNewRuleEvents.js` | `#textcolorshow` | `.toHexString()` | 文字颜色 |
| `initNewRuleEvents.js` | `#cellcolorshow` | `.toHexString()` | 背景色 |
| `initEditRuleEvents.js` | 同 `initNewRuleEvents.js` | 同上 | 编辑规则 |
| `conditionformat/dialog/index.js` | 多个选择器 | `.spectrum("set", color)` | 设置颜色 |

#### 设置颜色（`.spectrum("set", color)`）

| 文件 | 选择器 | 设置值 | 用途 |
|------|--------|--------|------|
| `initBorder.js` | `$input` | `"#000"` | 重置边框颜色 |
| `initCellColor.js` | `$input` | `"#ffffff"` | 重置背景色 |
| `initCellColor.js` | `$input` | `$input.val()` | 应用用户选择 |
| `initTextColor.js` | `$input` | `"#000000"` | 重置文字颜色 |
| `initTextColor.js` | `$input` | `$input.val()` | 应用用户选择 |
| `sheetBar.js` | `#luckysheetsheetconfigcolorur` | `sheet.color` | 设置工作表颜色 |
| `conditionformat/dialog/index.js` | 多个选择器 | 规则颜色 | 编辑时回填 |

### 1.3 统一配置模式

所有 spectrum 实例共享高度一致的配置：

```javascript
{
    showPalette: true,           // 显示色板
    showPaletteOnly: true,       // 仅显示色板（点击展开自定义）
    preferredFormat: "hex",      // 首选格式
    clickoutFiresChange: false,  // 点击外部不触发 change
    showInitial: true,           // 显示初始颜色
    showInput: true,             // 显示输入框
    flat: true/false,            // 内联/弹出模式
    hideAfterPaletteSelect: true,// 选择色板后自动隐藏
    showSelectionPalette: true,  // 显示用户历史选择
    maxPaletteSize: 8,           // 每行最多8色
    maxSelectionSize: 8,         // 历史最多8色
    togglePaletteOnly: true,     // 仅显示切换按钮
    togglePaletteMoreText: "自定义",
    togglePaletteLessText: "收起",
    cancelText: locale_button.cancel,
    chooseText: locale_button.confirm,
    clearText: locale_toolbar.clearText,
    noColorSelectedText: locale_toolbar.noColorSelectedText,
    localStorageKey: "spectrum.xxx" + gridKey,
    palette: [/* 标准8x8色板 */],
    change: function(color) {
        color = color.toHexString();
        // 更新 UI
    }
}
```

**标准色板**（8x8）：

```
#000  #444  #666  #999  #ccc  #eee  #f3f3f3  #fff
#f00  #f90  #ff0  #0f0  #0ff  #00f  #90f     #f0f
#f4cccc  #fce5cd  #fff2cc  #d9ead3  #d0e0e3  #cfe2f3  #d9d2e9  #ead1dc
#ea9999  #f9cb9c  #ffe599  #b6d7a8  #a2c4c9  #9fc5e8  #b4a7d6  #d5a6bd
#e06666  #f6b26b  #ffd966  #93c47d  #76a5af  #6fa8dc  #8e7cc3  #c27ba0
#c00     #e69138  #f1c232  #6aa84f  #45818e  #3d85c6  #674ea7  #a64d79
#900     #b45f06  #bf9000  #38761d  #134f5c  #0b5394  #351c75  #741b47
#600     #783f04  #7f6000  #274e13  #0c343d  #073763  #20124d  #4c1130
```

---

## 2. 替换方案对比

### 2.1 方案对比表

| 特性 | Spectrum (当前) | @simonwep/pickr | 自定义组件 |
|------|----------------|-----------------|-----------|
| jQuery 依赖 | ✅ 必须 | ❌ 无 | ❌ 无 |
| 包大小 | ~40KB (min) | ~8KB (min+gzip) | ~3-5KB |
| 色板模式 | ✅ | ✅ | ✅ |
| 自定义色板 | ✅ | ✅ | ✅ |
| HEX 输入 | ✅ | ✅ | ✅ |
| 历史颜色 | ✅ (localStorage) | ✅ | 需实现 |
| 弹出/内联 | ✅ | ✅ | ✅ |
| TypeScript | ❌ | ✅ | ✅ |
| 主题定制 | 有限 | ✅ CSS 变量 | ✅ 完全控制 |
| 维护状态 | 已停止维护 | 活跃 | 自维护 |
| 无障碍性 | 一般 | 较好 | 需实现 |

### 2.2 推荐方案：@simonwep/pickr

**推荐理由**：
1. 零 jQuery 依赖，完全独立
2. API 设计与 spectrum 相似，迁移成本低
3. 支持色板模式（`palette`），与当前使用模式匹配
4. 活跃维护，TypeScript 支持
5. 轻量，gzip 后仅 ~8KB

---

## 3. @simonwep/pickr 集成方案

### 3.1 安装

```bash
npm install @simonwep/pickr
```

### 3.2 TypeScript 接口设计

```typescript
import Pickr from '@simonwep/pickr';
import type { Options as PickrOptions } from '@simonwep/pickr';

export interface LuckysheetColorPickerOptions {
  el: string | Element;
  color?: string;
  flat?: boolean;
  palette?: string[][];
  localStorageKey?: string;
  onChange?: (color: string | null) => void;
  locale?: {
    cancel?: string;
    confirm?: string;
    customColor?: string;
    collapse?: string;
    clearText?: string;
    noColorSelectedText?: string;
  };
}

export interface ILuckysheetColorPicker {
  get(): string | null;
  set(color: string): void;
  destroy(): void;
  show(): void;
  hide(): void;
}
```

### 3.3 封装实现

```typescript
import Pickr from '@simonwep/pickr';
import '@simonwep/pickr/dist/themes/classic.min.css';

const DEFAULT_PALETTE = [
  ['#000', '#444', '#666', '#999', '#ccc', '#eee', '#f3f3f3', '#fff'],
  ['#f00', '#f90', '#ff0', '#0f0', '#0ff', '#00f', '#90f', '#f0f'],
  ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'],
  ['#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
  ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0'],
  ['#c00', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
  ['#900', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
  ['#600', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130'],
];

export class LuckysheetColorPicker implements ILuckysheetColorPicker {
  private pickr: Pickr;
  private onChangeCallback?: (color: string | null) => void;

  constructor(options: LuckysheetColorPickerOptions) {
    const el = typeof options.el === 'string'
      ? document.querySelector(options.el)
      : options.el;

    if (!el) {
      throw new Error(`Color picker element not found: ${options.el}`);
    }

    this.onChangeCallback = options.onChange;

    const pickrOptions: Partial<PickrOptions> = {
      el: el as HTMLElement,
      theme: 'classic',
      default: options.color || '#000',
      defaultRepresentation: 'HEX',
      position: 'bottom-start',
      closeWithKey: 'Escape',
      comparison: true,
      useAsButton: false,
      padding: 8,

      components: {
        palette: true,
        preview: true,
        opacity: false,
        hue: true,

        interaction: {
          hex: true,
          rgba: false,
          hsla: false,
          hsva: false,
          cmyk: false,
          input: true,
          clear: true,
          save: true,
        },
      },

      strings: {
        save: options.locale?.confirm || '确认',
        clear: options.locale?.clearText || '清除',
        cancel: options.locale?.cancel || '取消',
      },

      swatches: (options.palette || DEFAULT_PALETTE).flat(),
    };

    this.pickr = new Pickr(pickrOptions);

    this.pickr.on('change', (color: Pickr.HSVaColor) => {
      if (this.onChangeCallback) {
        this.onChangeCallback(color.toHEX().toString());
      }
    });

    this.pickr.on('save', (color: Pickr.HSVaColor | null) => {
      if (this.onChangeCallback) {
        this.onChangeCallback(color ? color.toHEX().toString() : null);
      }
    });

    this.pickr.on('clear', () => {
      if (this.onChangeCallback) {
        this.onChangeCallback(null);
      }
    });

    if (options.flat) {
      this.pickr.show();
    }
  }

  get(): string | null {
    const color = this.pickr.getColor();
    return color ? color.toHEX().toString() : null;
  }

  getAsRgb(): string | null {
    const color = this.pickr.getColor();
    return color ? color.toRGBA().toString() : null;
  }

  set(color: string): void {
    this.pickr.setColor(color);
  }

  show(): void {
    this.pickr.show();
  }

  hide(): void {
    this.pickr.hide();
  }

  destroy(): void {
    this.pickr.destroy();
  }

  on(event: string, callback: (color: string | null) => void): void {
    if (event === 'change') {
      this.onChangeCallback = callback;
    }
  }
}
```

### 3.4 工厂函数

```typescript
let gridKey = '';

export function setGridKey(key: string): void {
  gridKey = key;
}

export function createTextColorPicker(
  el: string | Element,
  onChange: (color: string | null) => void
): ILuckysheetColorPicker {
  return new LuckysheetColorPicker({
    el,
    color: '#000',
    flat: true,
    localStorageKey: `luckysheet.textcolor.${gridKey}`,
    onChange,
  });
}

export function createCellColorPicker(
  el: string | Element,
  onChange: (color: string | null) => void
): ILuckysheetColorPicker {
  return new LuckysheetColorPicker({
    el,
    color: '#fff',
    flat: true,
    localStorageKey: `luckysheet.bgcolor.${gridKey}`,
    onChange,
  });
}

export function createBorderColorPicker(
  el: string | Element,
  onChange: (color: string | null) => void
): ILuckysheetColorPicker {
  return new LuckysheetColorPicker({
    el,
    color: '#000',
    flat: false,
    localStorageKey: `luckysheet.bordercolor.${gridKey}`,
    onChange,
  });
}

export function createConditionFormatColorPicker(
  el: string | Element,
  onChange: (color: string | null) => void
): ILuckysheetColorPicker {
  return new LuckysheetColorPicker({
    el,
    flat: false,
    localStorageKey: `luckysheet.conditionformat.${gridKey}`,
    onChange,
  });
}
```

---

## 4. Spectrum API → Pickr API 迁移映射

### 4.1 初始化映射

| Spectrum | Pickr | 说明 |
|----------|-------|------|
| `showPalette: true` | `components.palette: true` | 显示色板 |
| `showPaletteOnly: true` | 自定义 CSS 隐藏其他面板 | 仅色板模式 |
| `preferredFormat: "hex"` | `defaultRepresentation: 'HEX'` | 默认格式 |
| `clickoutFiresChange: false` | 不监听 `changestop`，仅监听 `save` | 点击外部行为 |
| `showInitial: true` | `comparison: true` | 显示初始颜色 |
| `showInput: true` | `components.interaction.input: true` | 显示输入框 |
| `flat: true` | 创建后调用 `.show()` | 内联模式 |
| `hideAfterPaletteSelect: true` | 自定义事件监听 | 选择后隐藏 |
| `showSelectionPalette: true` | Pickr 默认支持 | 历史颜色 |
| `maxPaletteSize: 8` | CSS 控制 | 每行色数 |
| `maxSelectionSize: 8` | 自定义实现 | 历史数量 |
| `togglePaletteOnly: true` | 自定义 UI | 仅切换按钮 |
| `togglePaletteMoreText` | `strings.save` / 自定义 | 展开文字 |
| `togglePaletteLessText` | 自定义 | 收起文字 |
| `cancelText` | `strings.cancel` | 取消文字 |
| `chooseText` | `strings.save` | 确认文字 |
| `clearText` | `strings.clear` | 清除文字 |
| `localStorageKey` | 自定义实现 | 本地存储键 |
| `palette: [[...]]` | `swatches: [...]` (扁平化) | 色板 |
| `change: function(color)` | `on('change', ...)` / `on('save', ...)` | 变更回调 |

### 4.2 方法映射

| Spectrum | Pickr | 说明 |
|----------|-------|------|
| `.spectrum("get")` | `.pickr.getColor()` | 获取颜色对象 |
| `.spectrum("get").toHexString()` | `.pickr.getColor().toHEX().toString()` | 获取 HEX 字符串 |
| `.spectrum("get").toRgbString()` | `.pickr.getColor().toRGBA().toString()` | 获取 RGB 字符串 |
| `.spectrum("set", color)` | `.pickr.setColor(color)` | 设置颜色 |
| `.spectrum("destroy")` | `.pickr.destroy()` | 销毁实例 |
| `.spectrum("show")` | `.pickr.show()` | 显示选择器 |
| `.spectrum("hide")` | `.pickr.hide()` | 隐藏选择器 |
| `.spectrum("enable")` | `.pickr.enable()` | 启用 |
| `.spectrum("disable")` | `.pickr.disable()` | 禁用 |

### 4.3 颜色对象映射

| Spectrum | Pickr | 说明 |
|----------|-------|------|
| `color.toHexString()` | `color.toHEX().toString()` | HEX 格式 |
| `color.toRgbString()` | `color.toRGBA().toString()` | RGB 格式 |
| `color.toHslString()` | `color.toHSLA().toString()` | HSL 格式 |
| `color != null` | `color !== null` | 空值检测 |

---

## 5. 具体迁移示例

### 5.1 文字颜色选择器（initTextColor.js）

**迁移前**：

```javascript
$("#" + menuButtonId).find(".luckysheet-color-selected").spectrum({
    showPalette: true,
    showPaletteOnly: true,
    preferredFormat: "hex",
    clickoutFiresChange: false,
    showInitial: true,
    showInput: true,
    flat: true,
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
    color: luckysheetConfigsetting.defaultTextColor,
    noColorSelectedText: locale_toolbar.noColorSelectedText,
    localStorageKey: "spectrum.textcolor" + luckysheetConfigsetting.gridKey,
    palette: [/* ... */],
    change: function (color) {
        let $input = $(this);
        if (color != null) {
            color = color.toHexString();
        } else {
            color = "#000";
        }
        $("#luckysheet-icon-text-color .text-color-bar").css("background-color", color);
        $("#luckysheet-icon-text-color").attr("color", color);
        let d = editor.deepCopyFlowData(Store.flowdata);
        _this.updateFormat(d, "fc", color);
        $menuButton.hide();
        luckysheetContainerFocus();
    }
});
```

**迁移后**：

```typescript
const colorPicker = new LuckysheetColorPicker({
    el: document.querySelector(`#${menuButtonId} .luckysheet-color-selected`)!,
    color: luckysheetConfigsetting.defaultTextColor,
    flat: true,
    localStorageKey: `luckysheet.textcolor.${luckysheetConfigsetting.gridKey}`,
    onChange: (color) => {
        const finalColor = color ?? '#000';
        const textColorBar = document.querySelector(
            '#luckysheet-icon-text-color .text-color-bar'
        ) as HTMLElement;
        textColorBar.style.backgroundColor = finalColor;
        document.querySelector('#luckysheet-icon-text-color')!
            .setAttribute('color', finalColor);
        const d = editor.deepCopyFlowData(Store.flowdata);
        _this.updateFormat(d, 'fc', finalColor);
        menuButton.style.display = 'none';
        luckysheetContainerFocus();
    },
});
```

### 5.2 条件格式颜色获取（initNewRuleEvents.js）

**迁移前**：

```javascript
let color = $(this).parents("#luckysheet-newConditionRule-dialog")
    .find(".dataBarBox .luckysheet-conditionformat-config-color")
    .spectrum("get").toHexString();
```

**迁移后**：

```typescript
const dialog = (event.target as Element).closest('#luckysheet-newConditionRule-dialog');
const colorPickerEl = dialog!.querySelector(
    '.dataBarBox .luckysheet-conditionformat-config-color'
);
const color = colorPickerManager.get(colorPickerEl!)?.get() ?? '#000';
```

### 5.3 条件格式颜色设置（conditionformat/dialog/index.js）

**迁移前**：

```javascript
$("#luckysheet-editorConditionRule-dialog .dataBarBox .luckysheet-conditionformat-config-color")
    .spectrum("set", ruleFormat[0]);
```

**迁移后**：

```typescript
const el = document.querySelector(
    '#luckysheet-editorConditionRule-dialog .dataBarBox .luckysheet-conditionformat-config-color'
);
colorPickerManager.get(el!)?.set(ruleFormat[0]);
```

---

## 6. 颜色选择器管理器

由于多个颜色选择器实例需要统一管理（获取/设置/销毁），设计一个管理器：

```typescript
class ColorPickerManager {
  private instances = new WeakMap<Element, ILuckysheetColorPicker>();

  create(options: LuckysheetColorPickerOptions): ILuckysheetColorPicker {
    const el = typeof options.el === 'string'
      ? document.querySelector(options.el)
      : options.el;

    if (!el) {
      throw new Error(`Color picker element not found: ${options.el}`);
    }

    const existing = this.instances.get(el);
    if (existing) {
      existing.destroy();
    }

    const picker = new LuckysheetColorPicker(options);
    this.instances.set(el, picker);
    return picker;
  }

  get(el: Element | string): ILuckysheetColorPicker | undefined {
    const element = typeof el === 'string' ? document.querySelector(el) : el;
    if (!element) return undefined;
    return this.instances.get(element);
  }

  destroy(el: Element | string): void {
    const element = typeof el === 'string' ? document.querySelector(el) : el;
    if (!element) return;
    const picker = this.instances.get(element);
    if (picker) {
      picker.destroy();
      this.instances.delete(element);
    }
  }

  destroyAll(): void {
    for (const [, picker] of this.instances) {
      picker.destroy();
    }
    this.instances = new WeakMap();
  }
}

export const colorPickerManager = new ColorPickerManager();
```

---

## 7. CSS 考虑事项

### 7.1 移除 Spectrum CSS 依赖

Spectrum 引入了以下 CSS 依赖：
- `spectrum.css` — 颜色选择器核心样式
- `jquery-ui.css` — jQuery UI 主题（spectrum 部分依赖）
- `sp-input` 类名 — spectrum 输入框样式

迁移后需：
1. 移除 `spectrum.css` 引用
2. 移除 `jquery-ui.css` 引用
3. 移除代码中对 `sp-input` 类名的引用（如 `keyboard.js` 中的 `$(event.target).hasClass("sp-input")`）

### 7.2 Pickr 主题定制

Pickr 支持通过 CSS 变量自定义主题：

```css
:root {
  --pcr-font: inherit;
  --pcr-radius: 2px;
  --pcr-color: #000;
  --pcr-bg: #fff;
  --pcr-border-color: #ccc;
  --pcr-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
}

/* 色板网格布局调整 */
.pcr-swatches > .pcr-swatch {
  width: calc(100% / 8);
  height: 24px;
}

/* 匹配 Luckysheet 风格 */
.pickr .pcr-button {
  border: 1px solid #ccc;
  border-radius: 2px;
}
```

### 7.3 Flat 模式样式

Spectrum 的 `flat: true` 模式将颜色选择器直接嵌入页面。Pickr 需要额外处理：

```css
/* flat 模式：隐藏 Pickr 的触发按钮 */
.luckysheet-color-picker-flat .pcr-button {
  display: none;
}

/* flat 模式：直接显示选择面板 */
.luckysheet-color-picker-flat .pcr-app {
  position: static;
  display: block;
  box-shadow: none;
  border: 1px solid #ddd;
}
```

---

## 8. localStorage 兼容性

Spectrum 使用 `localStorageKey` 将用户自定义颜色保存到 localStorage。迁移时需兼容现有数据：

```typescript
function migrateSpectrumLocalStorage(
  oldKey: string,
  newKey: string
): void {
  const oldData = localStorage.getItem(oldKey);
  if (oldData) {
    try {
      const parsed = JSON.parse(oldData);
      // Spectrum 存储格式: { "0": "#color1", "1": "#color2", ... }
      const colors = Object.values(parsed) as string[];
      localStorage.setItem(newKey, JSON.stringify(colors));
    } catch {
      // 忽略解析错误
    }
  }
}

// 迁移示例
migrateSpectrumLocalStorage(
  'spectrum.textcolor' + gridKey,
  'luckysheet.textcolor.' + gridKey
);
```

---

## 9. 迁移检查清单

- [ ] 安装 `@simonwep/pickr` 依赖
- [ ] 创建 `LuckysheetColorPicker` 封装类
- [ ] 创建 `ColorPickerManager` 管理器
- [ ] 迁移 `initTextColor.js` 中的 spectrum 初始化和回调
- [ ] 迁移 `initCellColor.js` 中的 spectrum 初始化和回调
- [ ] 迁移 `initBorder.js` 中的 spectrum 初始化和回调
- [ ] 迁移 `sheetBar.js` 中的 spectrum 初始化和回调
- [ ] 迁移 `imageCtrl.js` 中的 spectrum 初始化和回调
- [ ] 迁移 `alternateformatObj.js` 中的 spectrum 初始化和回调
- [ ] 迁移 `dialog.js` 中的 spectrum 初始化和回调
- [ ] 迁移 `conditionformat/dialog/index.js` 中的 spectrum 初始化
- [ ] 迁移 `initConditionDialogEvents.js` 中的 `.spectrum("get")` 调用
- [ ] 迁移 `initNewRuleEvents.js` 中的 `.spectrum("get")` 调用
- [ ] 迁移 `initEditRuleEvents.js` 中的 `.spectrum("get")` 调用
- [ ] 移除 `spectrum.min.js` 插件文件引用
- [ ] 移除 `spectrum.css` 样式引用
- [ ] 移除代码中对 `sp-input` 类名的引用
- [ ] 移除 jQuery UI CSS 依赖（如果无其他用途）
- [ ] 添加 Pickr 主题 CSS
- [ ] 迁移 localStorage 数据
- [ ] 测试所有颜色选择器功能
