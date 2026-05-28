# 02-技术选型与规范

> 本文档定义 Luckysheet DDD 重构工程的技术选型、配置规范与开发约定。所有选型遵循"依赖最小化"原则，优先选择零 jQuery 依赖、体积小、TypeScript 友好的方案。

---

## 1. TypeScript

### 1.1 为什么选择 TypeScript

| 理由 | 说明 |
|------|------|
| **类型安全** | 当前 JS 代码中大量隐式 `any`，Store 57 个字段无类型约束，重构必须引入类型系统 |
| **重构友好** | DDD 重构涉及大量接口定义（Port/Adapter），TypeScript 的 interface/type 是天然表达 |
| **IDE 支持** | 自动补全、重构、跳转定义大幅提升开发效率 |
| **渐进迁移** | TypeScript 允许 JS/TS 混合，可逐步迁移 |

### 1.2 Strict 模式配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,

    "declaration": true,
    "declarationDir": "./dist/types",
    "emitDeclarationOnly": true,
    "sourceMap": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 1.3 关键 strict 选项说明

| 选项 | 作用 | 对现有代码的影响 |
|------|------|----------------|
| `strictNullChecks` | `null`/`undefined` 不能赋值给其他类型 | 现有代码大量 `Store.flowdata[r][c]` 无空值检查，需添加 `?` 和 `!` |
| `noImplicitAny` | 禁止隐式 `any` | 现有代码中函数参数大多无类型注解，需逐一补充 |
| `noUncheckedIndexedAccess` | 数组/对象索引访问返回 `T \| undefined` | `flowdata[r][c]` 返回 `Cell \| undefined`，需空值检查 |
| `strictPropertyInitialization` | 类属性必须初始化 | 领域实体的属性必须声明时初始化或在构造函数中赋值 |
| `noUnusedLocals` / `noUnusedParameters` | 禁止未使用的变量和参数 | 清理现有代码中的死代码 |

### 1.4 渐进式迁移策略

由于 strict 模式对现有 JS 代码影响极大，采用渐进式策略：

1. **新代码**：全部使用 TypeScript strict 模式
2. **迁移代码**：迁移时同步转为 TypeScript，补充类型注解
3. **未迁移代码**：保持 JS，通过 `allowJs: true` 兼容
4. **类型声明**：为未迁移的 JS 模块编写 `.d.ts` 声明文件

```json
// 渐进式配置：新模块 strict，旧模块宽松
{
  "compilerOptions": {
    "strict": false,
    "allowJs": true
  },
  "include": ["src/**/*.ts", "src/**/*.js"]
}
```

当所有代码迁移完成后，再启用全局 `strict: true`。

---

## 2. 构建工具：Vite

### 2.1 为什么选择 Vite

| 对比项 | Vite | Webpack | Rollup |
|--------|------|---------|--------|
| 开发启动速度 | 极快（ESM 原生） | 慢（全量打包） | 不支持 HMR |
| HMR 速度 | 极快（模块级） | 慢（依赖图级） | 不支持 |
| Tree-shaking | 内置（Rollup） | 需配置 | 原生支持 |
| 库模式 | 支持 | 需配置 | 原生支持 |
| 当前项目 | 已在使用 | 未使用 | 未使用 |

当前项目已使用 Vite（`vite.config.js`），重构工程继续使用 Vite，但需要独立配置。

### 2.2 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
      }),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },

    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'luckysheet',
        formats: ['es', 'umd'],
        fileName: (format) => `luckysheet.${format}.js`,
      },

      rollupOptions: {
        external: [],
        output: {
          globals: {},
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'style.css';
            }
            return 'assets/[name]-[hash][extname]';
          },
          exports: 'named',
        },
      },

      target: 'es2020',
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
        },
      },
      cssCodeSplit: false,
    },

    server: {
      port: 3001,
      open: true,
      cors: true,
    },

    preview: {
      port: 4001,
      open: true,
    },
  };
});
```

### 2.3 与旧项目的构建隔离

| 配置项 | 旧项目 (`src/`) | 新项目 (`luckysheet-next/src/`) |
|--------|-----------------|-------------------------------|
| 入口文件 | `src/index.js` | `luckysheet-next/src/index.ts` |
| 开发端口 | 3000 | 3001 |
| TypeScript | `strict: false` | `strict: true`（渐进） |
| jQuery 注入 | `@rollup/plugin-inject` 全局注入 | 不注入 |
| 输出格式 | ES + UMD | ES + UMD |
| 外部依赖 | `jquery` 作为 peerDependency | 无外部依赖 |

### 2.4 开发脚本配置

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "build:watch": "vite build --watch",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts --fix",
    "lint:check": "eslint src --ext .ts",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 3. CSS 方案

### 3.1 方案选择

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **CSS Modules** | 局部作用域、TypeScript 类型安全、与组件绑定 | 需要构建工具支持 | ✅ 组件级样式 |
| **Vanilla CSS** | 简单、无依赖、性能好 | 全局作用域、命名冲突风险 | ✅ 全局样式 |
| **CSS-in-JS** | 动态样式、类型安全 | 运行时开销、Bundle 体积增大 | ❌ 不选择 |
| **Tailwind CSS** | 快速开发、一致性好 | 类名冗长、与 Canvas 渲染无关 | ❌ 不选择 |
| **jQuery UI CSS** | 当前使用 | 依赖 jQuery、体积大、样式过时 | ❌ 必须移除 |

### 3.2 CSS 架构

```
styles/
├── base/                    # 全局基础样式
│   ├── reset.css            # CSS Reset
│   ├── variables.css        # CSS 自定义属性（颜色、字号、间距）
│   ├── typography.css       # 字体相关
│   └── animations.css       # 全局动画
├── components/              # 组件样式（CSS Modules）
│   ├── Toolbar.module.css
│   ├── SheetBar.module.css
│   ├── FormulaBar.module.css
│   ├── ContextMenu.module.css
│   ├── Dialog.module.css
│   └── FilterMenu.module.css
└── canvas/                  # Canvas 相关样式
    ├── grid-container.css   # 网格容器布局
    └── scrollbars.css       # 滚动条样式
```

### 3.3 CSS 自定义属性

```css
/* styles/base/variables.css */
:root {
  --ls-color-primary: #0188fb;
  --ls-color-primary-light: #e8f3ff;
  --ls-color-border: #d4d4d4;
  --ls-color-bg: #ffffff;
  --ls-color-bg-alt: #f5f5f5;
  --ls-color-text: #333333;
  --ls-color-text-secondary: #666666;
  --ls-color-text-muted: #999999;
  --ls-color-error: #ff4d4f;
  --ls-color-success: #52c41a;
  --ls-color-warning: #faad14;

  --ls-font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  --ls-font-size-sm: 12px;
  --ls-font-size-base: 13px;
  --ls-font-size-lg: 14px;

  --ls-spacing-xs: 4px;
  --ls-spacing-sm: 8px;
  --ls-spacing-md: 12px;
  --ls-spacing-lg: 16px;

  --ls-border-radius-sm: 2px;
  --ls-border-radius-md: 4px;
  --ls-border-radius-lg: 8px;

  --ls-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --ls-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --ls-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  --ls-z-index-dropdown: 1000;
  --ls-z-index-modal: 2000;
  --ls-z-index-tooltip: 3000;
}
```

### 3.4 jQuery UI CSS 移除计划

当前项目引入了以下 jQuery UI 相关 CSS：

| 文件 | 用途 | 替代方案 |
|------|------|---------|
| `plugins/jquery-ui.min.css` | jQuery UI 对话框/排序/拖拽样式 | 自定义 Dialog.module.css |
| `plugins/jquery-ui.theme.min.css` | jQuery UI 主题 | CSS 自定义属性 |
| `plugins/css/spectrum.min.css` | 颜色选择器样式 | @simonwep/pickr 自带样式 |

---

## 4. 颜色选择器替代

### 4.1 当前方案

当前使用 `spectrum-colorpicker`（jQuery 插件），存在以下问题：

- 依赖 jQuery（`$.fn.spectrum`）
- 不支持 TypeScript
- 不再积极维护（最后更新 2018 年）
- CSS 样式与 jQuery UI 主题耦合

### 4.2 替代方案对比

| 方案 | 体积 | jQuery 依赖 | TypeScript | 自定义能力 | 维护状态 |
|------|------|------------|-----------|-----------|---------|
| **@simonwep/pickr** | ~8KB gzip | ❌ 无 | ✅ 内置 | 高（主题/布局/组件） | 活跃 |
| **vanilla-picker** | ~3KB gzip | ❌ 无 | ❌ 需 @types | 中 | 低频维护 |
| **自定义实现** | ~2KB | ❌ 无 | ✅ 原生 | 完全可控 | 自维护 |
| **colortranslator** | ~2KB | ❌ 无 | ✅ 内置 | 低（仅颜色转换） | 活跃 |

### 4.3 推荐方案：@simonwep/pickr

**推荐理由**：

1. **零 jQuery 依赖**：纯原生 JS 实现
2. **TypeScript 支持**：内置类型声明
3. **功能完整**：支持 HEX/RGB/HSL/CMYK，支持透明度，支持预设色板
4. **高度可定制**：可自定义布局（色轮/色条/输入框），可自定义主题
5. **体积可控**：核心 ~8KB gzip，远小于 spectrum + jQuery UI
6. **活跃维护**：GitHub 6k+ stars，持续更新

**集成方式**：

```typescript
// infrastructure/adapters/ColorPickerAdapter.ts
import Pickr from '@simonwep/pickr';
import '@simonwep/pickr/dist/themes/nano.min.css';

export class ColorPickerAdapter {
  private pickr: Pickr | null = null;

  create(container: HTMLElement, options: ColorPickerOptions): Pickr {
    this.pickr = new Pickr({
      el: container,
      theme: 'nano',
      default: options.defaultColor ?? '#000000',
      swatches: options.swatches ?? [
        '#000000', '#333333', '#666666', '#999999',
        '#ff0000', '#ff6600', '#ffcc00', '#33cc00',
        '#0099ff', '#6633ff', '#cc00ff', '#ff0066',
      ],
      components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          clear: true,
          save: true,
        },
      },
      i18n: {
        'btn:save': options.saveLabel ?? '确定',
        'btn:clear': options.clearLabel ?? '清除',
      },
    });

    this.pickr.on('save', (color: Pickr.HSVaColor) => {
      options.onSave?.(color.toHEXA().toString());
    });

    return this.pickr;
  }

  destroy(): void {
    this.pickr?.destroyAndRemove();
    this.pickr = null;
  }
}
```

### 4.4 备选方案：自定义实现

如果需要更精细的控制或更小的体积，可基于原生 `<input type="color">` + 自定义色板面板实现：

```typescript
// 自定义颜色选择器核心逻辑
export class SimpleColorPicker {
  private container: HTMLElement;
  private input: HTMLInputElement;
  private swatches: HTMLElement[];

  constructor(container: HTMLElement, options: ColorPickerOptions) {
    this.container = container;
    this.input = document.createElement('input');
    this.input.type = 'color';
    this.input.value = options.defaultColor ?? '#000000';
    this.input.addEventListener('input', (e) => {
      options.onChange?.((e.target as HTMLInputElement).value);
    });
    this.container.appendChild(this.input);
    this.renderSwatches(options.swatches ?? DEFAULT_SWATCHES);
  }

  private renderSwatches(colors: string[]): void {
    const panel = document.createElement('div');
    panel.className = 'ls-color-swatches';
    colors.forEach((color) => {
      const swatch = document.createElement('div');
      swatch.className = 'ls-color-swatch';
      swatch.style.backgroundColor = color;
      swatch.addEventListener('click', () => {
        this.input.value = color;
        this.options.onChange?.(color);
      });
      panel.appendChild(swatch);
    });
    this.container.appendChild(panel);
  }
}
```

---

## 5. 日期选择器

### 5.1 当前方案

当前使用 `flatpickr`，这是一个优秀的纯 JS 日期选择器，**无 jQuery 依赖**。

### 5.2 继续使用 flatpickr

| 特性 | flatpickr | 说明 |
|------|-----------|------|
| jQuery 依赖 | ❌ 无 | 纯原生 JS |
| 体积 | ~6KB gzip | 轻量 |
| TypeScript | ✅ @types/flatpickr | 社区类型声明 |
| 国际化 | ✅ 内置 | 已使用中文本地化 |
| 主题 | ✅ 多主题 | 当前使用 light 主题 |
| 自定义 | ✅ 高 | 插件/钩子/格式化 |

**无需替换**，直接在新工程中继续使用。

### 5.3 封装为适配器

```typescript
// infrastructure/adapters/DatePickerAdapter.ts
import flatpickr from 'flatpickr';
import { Mandarin } from 'flatpickr/dist/l10n/zh.js';

export class DatePickerAdapter {
  private instance: flatpickr.Instance | null = null;

  create(inputElement: HTMLElement, options: DatePickerOptions): flatpickr.Instance {
    const locale = options.locale === 'zh' ? Mandarin.zh : undefined;

    this.instance = flatpickr(inputElement, {
      locale,
      dateFormat: options.dateFormat ?? 'Y-m-d',
      enableTime: options.enableTime ?? false,
      onChange: (selectedDates: Date[]) => {
        options.onChange?.(selectedDates[0]);
      },
    });

    return this.instance;
  }

  destroy(): void {
    this.instance?.destroy();
    this.instance = null;
  }
}
```

---

## 6. 测试框架：Vitest

### 6.1 为什么选择 Vitest

| 对比项 | Vitest | Jest |
|--------|--------|------|
| Vite 集成 | 原生支持 | 需要额外配置 |
| 配置复用 | 共享 vite.config.ts 的 alias/plugin | 独立配置 |
| 速度 | 极快（ESM 原生、智能 watch） | 较慢 |
| TypeScript | 原生支持 | 需要 ts-jest 或 @swc/jest |
| 当前项目 | 已在使用 | 未使用 |

### 6.2 Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'src/**/*.test.ts',
      'tests/**/*.test.ts',
    ],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**/*.ts', 'src/application/**/*.ts'],
      exclude: [
        'src/domain/**/events/**',
        'src/domain/**/ports/**',
        'src/**/*.d.ts',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    typecheck: {
      enabled: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

### 6.3 测试策略

| 测试类型 | 位置 | 目标 | 运行频率 |
|---------|------|------|---------|
| **单元测试** | `tests/unit/` | 领域实体、值对象、领域服务、工具函数 | 每次提交 |
| **集成测试** | `tests/integration/` | 应用服务、仓储、适配器、事件总线 | 每次提交 |
| **E2E 测试** | `tests/e2e/` | 完整用户操作流程 | 每日/发布前 |
| **视觉回归测试** | `tests/visual/` | Canvas 渲染结果对比 | 发布前 |

### 6.4 测试示例

```typescript
// tests/unit/domain/cell/Cell.test.ts
import { describe, it, expect } from 'vitest';
import { Cell } from '@/domain/cell/Cell';
import { CellType } from '@/domain/cell/CellType';
import { CellStyle } from '@/domain/cell/CellStyle';

describe('Cell', () => {
  describe('setValue', () => {
    it('should update value and emit CellValueChanged event', () => {
      const cell = Cell.create(0, 0, { v: 'hello', m: 'hello' });
      const events = cell.setValue('world');

      expect(cell.value).toBe('world');
      expect(cell.displayValue).toBe('world');
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('CellValueChanged');
    });
  });

  describe('setStyle', () => {
    it('should update style and emit CellStyleChanged event', () => {
      const cell = Cell.create(0, 0);
      const style = new CellStyle({ bg: '#ff0000', fc: '#000000' });
      const events = cell.setStyle(style);

      expect(cell.style?.bg).toBe('#ff0000');
      expect(events[0].type).toBe('CellStyleChanged');
    });
  });
});
```

### 6.5 测试环境 Setup

```typescript
// tests/setup.ts
import { vi } from 'vitest';

// Mock Canvas API for jsdom
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
  putImageData: vi.fn(),
  createImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  font: '',
  fillStyle: '',
  strokeStyle: '',
  textAlign: '',
  textBaseline: '',
  globalAlpha: 1,
  globalCompositeOperation: '',
  lineWidth: 1,
  lineCap: '',
  lineJoin: '',
  shadowBlur: 0,
  shadowColor: '',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
});

// Mock getComputedStyle
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
  const style = originalGetComputedStyle(elt, pseudoElt);
  return new Proxy(style, {
    get(target, prop) {
      if (prop === 'getPropertyValue') {
        return (name: string) => {
          return target.getPropertyValue(name) || '';
        };
      }
      return (target as any)[prop];
    },
  });
};
```

---

## 7. 无 jQuery 策略

### 7.1 核心原则

**新代码中禁止引入任何 jQuery 依赖。** 所有 DOM 操作使用原生 API 或项目封装的 DOM 适配器。

### 7.2 jQuery 用法替代对照表

| jQuery 用法 | 原生替代 | 说明 |
|-------------|---------|------|
| `$(selector)` | `document.querySelector(selector)` | 单元素选择 |
| `$(selector).each(fn)` | `document.querySelectorAll(selector).forEach(fn)` | 遍历 |
| `$(el).find(selector)` | `el.querySelector(selector)` | 子元素查找 |
| `$(el).closest(selector)` | `el.closest(selector)` | 最近祖先 |
| `$(el).html(content)` | `el.innerHTML = content` | 设置 HTML |
| `$(el).text(content)` | `el.textContent = content` | 设置文本 |
| `$(el).val()` | `(el as HTMLInputElement).value` | 获取值 |
| `$(el).addClass(cls)` | `el.classList.add(cls)` | 添加类 |
| `$(el).removeClass(cls)` | `el.classList.remove(cls)` | 移除类 |
| `$(el).toggleClass(cls)` | `el.classList.toggle(cls)` | 切换类 |
| `$(el).hasClass(cls)` | `el.classList.contains(cls)` | 判断类 |
| `$(el).css(prop, val)` | `el.style[prop] = val` | 设置样式 |
| `$(el).css(prop)` | `getComputedStyle(el)[prop]` | 获取样式 |
| `$(el).show()` | `el.style.display = ''` | 显示 |
| `$(el).hide()` | `el.style.display = 'none'` | 隐藏 |
| `$(el).is(':visible')` | `el.offsetParent !== null` | 是否可见 |
| `$(el).on(event, fn)` | `el.addEventListener(event, fn)` | 绑定事件 |
| `$(el).off(event, fn)` | `el.removeEventListener(event, fn)` | 解绑事件 |
| `$(el).trigger(event)` | `el.dispatchEvent(new Event(event))` | 触发事件 |
| `$(el).append(child)` | `el.appendChild(child)` | 追加子元素 |
| `$(el).remove()` | `el.remove()` | 移除元素 |
| `$(el).attr(name, val)` | `el.setAttribute(name, val)` | 设置属性 |
| `$(el).attr(name)` | `el.getAttribute(name)` | 获取属性 |
| `$(el).data(key, val)` | `(el.dataset[key] = val)` | 数据属性 |
| `$(el).width()` | `el.offsetWidth` | 获取宽度 |
| `$(el).height()` | `el.offsetHeight` | 获取高度 |
| `$(el).offset()` | `el.getBoundingClientRect()` | 获取偏移 |
| `$(el).scrollTop()` | `el.scrollTop` | 获取滚动位置 |
| `$(el).scrollTop(val)` | `el.scrollTop = val` | 设置滚动位置 |
| `$.extend(a, b)` | `{ ...a, ...b }` | 对象合并 |
| `$.isArray(val)` | `Array.isArray(val)` | 数组判断 |
| `$.isFunction(val)` | `typeof val === 'function'` | 函数判断 |
| `$.trim(str)` | `str.trim()` | 去除空白 |
| `$.inArray(val, arr)` | `arr.indexOf(val)` | 查找索引 |
| `$(document).ready(fn)` | `document.addEventListener('DOMContentLoaded', fn)` | DOM 就绪 |
| `$(el).animate(props, speed)` | `el.animate(props, { duration: speed })` | Web Animations API |

### 7.3 DOM 适配器封装

对于高频 DOM 操作，封装为 DOM 适配器，提供统一的、类型安全的接口：

```typescript
// infrastructure/adapters/DOMAdapter.ts
export class DOMAdapter {
  static query(selector: string, parent: Element | Document = document): Element | null {
    return parent.querySelector(selector);
  }

  static queryAll(selector: string, parent: Element | Document = document): Element[] {
    return Array.from(parent.querySelectorAll(selector));
  }

  static create(tag: string, attrs?: Record<string, string>, children?: (Element | string)[]): HTMLElement {
    const el = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
          el.className = value;
        } else if (key.startsWith('data-')) {
          el.setAttribute(key, value);
        } else {
          (el as any)[key] = value;
        }
      });
    }
    if (children) {
      children.forEach((child) => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else {
          el.appendChild(child);
        }
      });
    }
    return el;
  }

  static show(el: HTMLElement): void {
    el.style.display = '';
  }

  static hide(el: HTMLElement): void {
    el.style.display = 'none';
  }

  static isVisible(el: HTMLElement): boolean {
    return el.offsetParent !== null;
  }

  static getScrollPosition(el: HTMLElement): { scrollTop: number; scrollLeft: number } {
    return { scrollTop: el.scrollTop, scrollLeft: el.scrollLeft };
  }

  static setScrollPosition(el: HTMLElement, top?: number, left?: number): void {
    if (top !== undefined) el.scrollTop = top;
    if (left !== undefined) el.scrollLeft = left;
  }

  static getSize(el: HTMLElement): { width: number; height: number } {
    return { width: el.offsetWidth, height: el.offsetHeight };
  }

  static getOffset(el: HTMLElement): { top: number; left: number } {
    const rect = el.getBoundingClientRect();
    return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
  }
}
```

---

## 8. 依赖最小化原则

### 8.1 核心规则

| 规则 | 说明 |
|------|------|
| **零 jQuery 依赖** | 新代码禁止引入 jQuery |
| **零 jQuery UI 依赖** | 对话框/拖拽/排序使用原生实现或轻量替代 |
| **零 spectrum 依赖** | 颜色选择器使用 @simonwep/pickr 或自定义实现 |
| **优先内置** | 能用原生 API 实现的，不引入第三方库 |
| **体积敏感** | 新增依赖需评估 gzip 体积，单库不超过 10KB |
| **TypeScript 优先** | 新增依赖必须有 TypeScript 类型声明（内置或 @types） |

### 8.2 依赖审计

当前项目依赖清单及迁移决策：

| 依赖 | 当前版本 | 体积 (gzip) | jQuery 依赖 | 迁移决策 |
|------|---------|-------------|------------|---------|
| `@fortawesome/fontawesome-free` | ^6.5.1 | ~30KB | ❌ | ✅ 保留（图标方案） |
| `clipboard-polyfill` | ^2.8.1 | ~3KB | ❌ | ✅ 保留（剪贴板兼容） |
| `crypto-js` | ^4.2.0 | ~15KB | ❌ | ⚠️ 评估：考虑 Web Crypto API 替代 |
| `dayjs` | ^1.11.10 | ~2KB | ❌ | ✅ 保留（日期处理） |
| `escape-html` | ^1.0.3 | ~0.5KB | ❌ | ✅ 保留（XSS 防护） |
| `flatpickr` | ^4.6.13 | ~6KB | ❌ | ✅ 保留（日期选择器） |
| `html2canvas` | ^1.4.1 | ~40KB | ❌ | ⚠️ 评估：仅截图功能使用，考虑按需加载 |
| `jquery-mousewheel` | ^3.1.13 | ~1KB | ✅ | ❌ 移除：使用 wheel 事件替代 |
| `jstat` | ^1.9.6 | ~30KB | ❌ | ✅ 保留（统计函数依赖） |
| `localforage` | ^1.10.0 | ~8KB | ❌ | ✅ 保留（本地存储） |
| `numeral` | ^2.0.6 | ~5KB | ❌ | ⚠️ 评估：考虑 Intl.NumberFormat 替代 |
| `pako` | ^2.1.0 | ~30KB | ❌ | ✅ 保留（压缩/解压） |
| `spectrum-colorpicker` | ^1.8.1 | ~5KB | ✅ | ❌ 移除：使用 @simonwep/pickr 替代 |
| `uuid` | ^9.0.0 | ~2KB | ❌ | ⚠️ 评估：考虑 crypto.randomUUID() 替代 |
| `jquery` (peer) | >=2.2.4 | ~30KB | — | ❌ 移除：不再作为 peerDependency |

### 8.3 新增依赖

| 依赖 | 用途 | 体积 (gzip) | 替代对象 |
|------|------|-------------|---------|
| `@simonwep/pickr` | 颜色选择器 | ~8KB | spectrum-colorpicker |

---

## 9. 代码规范

### 9.1 ESLint 配置

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
    }],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'no-restricted-imports': ['error', {
      patterns: ['jquery', '*/jquery*'],
    }],
  },
};
```

### 9.2 Prettier 配置

```json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 9.3 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `cell-renderer.ts`、`formula-engine.ts` |
| 类名 | PascalCase | `Cell`、`FormulaEngine`、`CellRepository` |
| 接口名 | PascalCase（不加 I 前缀） | `CellRepositoryPort`、`EventBus` |
| 函数/方法 | camelCase | `setCellValue()`、`calculateFormula()` |
| 常量 | SCREAMING_SNAKE_CASE | `GENERAL_NUMBER_CT`、`ERROR_TYPES` |
| 枚举 | PascalCase（枚举名 + 成员） | `RuleType.ColorScale` |
| 事件名 | PascalCase + 后缀 | `CellValueChanged`、`SheetAdded` |
| 命令名 | PascalCase + Command 后缀 | `SetCellValueCommand` |
| 查询名 | PascalCase + Query 后缀 | `GetCellValueQuery` |
| DTO 名 | PascalCase + DTO 后缀 | `CellDTO`、`SheetDTO` |
| CSS 类名 | ls- 前缀 + kebab-case | `ls-grid-container`、`ls-toolbar` |
| CSS Module | camelCase | `toolbarContainer`、`sheetBar` |

### 9.4 模块导入规范

```typescript
// ✅ 推荐：使用 @ 别名
import { Cell } from '@/domain/cell/Cell';
import { CellRepositoryPort } from '@/domain/cell/ports/CellRepositoryPort';
import { DOMAdapter } from '@/infrastructure/adapters/DOMAdapter';

// ✅ 推荐：类型导入使用 type 关键字
import type { CellStyle } from '@/domain/cell/CellStyle';

// ❌ 禁止：相对路径跨层引用
import { Cell } from '../../../domain/cell/Cell';

// ❌ 禁止：导入 jQuery
import $ from 'jquery';

// ❌ 禁止：导入 spectrum
import 'spectrum-colorpicker';
```

---

## 10. 开发环境配置

### 10.1 推荐开发工具

| 工具 | 用途 | 说明 |
|------|------|------|
| VS Code | 编辑器 | 推荐 ESLint、Prettier、TypeScript 插件 |
| Chrome DevTools | 调试 | Canvas 检查、Performance 分析 |
| React DevTools | 不适用 | 本项目不使用 React |
| Vitest UI | 测试 | `vitest --ui` 启动可视化测试面板 |

### 10.2 VS Code 推荐配置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.eol": "\n"
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 10.3 Git Hooks

```bash
# 使用 simple-git-hooks + lint-staged
npm install -D simple-git-hooks lint-staged
```

```json
// package.json
{
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged",
    "commit-msg": "npx commitlint --edit $1"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,md}": [
      "prettier --write"
    ]
  }
}
```
