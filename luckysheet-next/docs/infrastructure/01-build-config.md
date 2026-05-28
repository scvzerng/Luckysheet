# 构建配置设计

> 本文档定义 `luckysheet-next` 模块的构建、类型检查、测试及开发服务器配置方案。
> 新模块与旧模块（`src/`）在同一仓库中共存，通过独立配置实现互不干扰。

---

## 1. Vite 配置

### 1.1 配置文件：`vite.config.next.ts`

新模块使用独立的 Vite 配置文件，与旧模块的 [vite.config.js](file:///d:/gitee/Luckysheet/vite.config.js) 完全解耦。

```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [],

    resolve: {
      alias: {
        '@next': resolve(__dirname, 'luckysheet-next/src'),
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
        entry: resolve(__dirname, 'luckysheet-next/src/index.ts'),
        name: 'LuckysheetNext',
        formats: ['es', 'umd'],
        fileName: (format) => `luckysheet-next.${format}.js`,
      },

      rollupOptions: {
        external: [],
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'style-next.css'
            }
            return 'assets/[name]-[hash][extname]'
          },
          exports: 'named',
          globals: {},
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
      outDir: resolve(__dirname, 'dist-next'),
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
  }
})
```

### 1.2 关键设计决策

| 决策点 | 旧模块 (`src/`) | 新模块 (`luckysheet-next/`) | 说明 |
|--------|-----------------|---------------------------|------|
| 入口文件 | `src/index.js` | `luckysheet-next/src/index.ts` | 新模块使用 TypeScript |
| 输出格式 | ES + UMD | ES + UMD | 保持一致 |
| 输出目录 | `dist/` | `dist-next/` | 产物隔离 |
| CSS 文件名 | `style.css` | `style-next.css` | 避免覆盖 |
| jQuery 注入 | `@rollup/plugin-inject` | **不使用** | 新模块零 jQuery 依赖 |
| 开发端口 | 3000 | 3001 | 并行开发 |
| 构建目标 | ES2015 | ES2020 | 新模块面向现代浏览器 |
| 路径别名 | `@` → `src/` | `@next` → `luckysheet-next/src/` | 避免别名冲突 |

### 1.3 与旧模块的差异说明

**不使用 `@rollup/plugin-inject`**：旧模块通过 inject 插件将 `$` 和 `jQuery` 自动注入到每个 JS 文件中，新模块完全移除这一机制。所有 DOM 操作使用原生 API 或自封装的工具函数。

**不依赖 jQuery UI CSS**：旧模块依赖 `jquery-ui.min.css` 和 `jquery-ui.theme.min.css`，新模块使用自包含的 CSS 方案，所有样式通过 CSS Modules 或独立 CSS 文件管理。

**构建目标提升至 ES2020**：新模块不需要兼容旧浏览器，可以利用 `Optional Chaining`、`Nullish Coalescing`、`BigInt`、`globalThis` 等现代特性。

---

## 2. TypeScript 配置

### 2.1 配置文件：`tsconfig.next.json`

新模块使用独立的 TypeScript 配置，开启严格模式，与旧模块的 [tsconfig.json](file:///d:/gitee/Luckysheet/tsconfig.json) 互不影响。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationDir": "./dist-next/types",
    "emitDeclarationOnly": true,
    "baseUrl": ".",
    "paths": {
      "@next/*": ["luckysheet-next/src/*"]
    },
    "types": []
  },
  "include": ["luckysheet-next/src/**/*"],
  "exclude": [
    "node_modules",
    "dist-next",
    "luckysheet-next/src/**/*.spec.ts",
    "luckysheet-next/src/**/*.test.ts"
  ]
}
```

### 2.2 与旧模块 TypeScript 配置对比

| 配置项 | 旧模块 | 新模块 | 说明 |
|--------|--------|--------|------|
| `strict` | `false` | `true` | 新模块全量严格模式 |
| `noImplicitAny` | `false` | `true` | 禁止隐式 any |
| `noImplicitThis` | 未设置 | `true` | 禁止隐式 this |
| `noImplicitReturns` | 未设置 | `true` | 函数所有路径必须返回 |
| `noUncheckedIndexedAccess` | 未设置 | `true` | 索引访问返回 `T \| undefined` |
| `target` | `ES2015` | `ES2020` | 现代浏览器目标 |
| `lib` | `ES2015` | `ES2020` | 使用更新的类型定义 |
| `allowJs` | `true` | 未设置（默认 `false`） | 新模块纯 TypeScript |
| `checkJs` | `false` | 未设置 | 新模块无 JS 文件 |
| `paths` | `@/*` → `src/*` | `@next/*` → `luckysheet-next/src/*` | 路径别名隔离 |
| `types` | `jquery`, `jquery-ui`, `spectrum` | `[]` | 无 jQuery 类型依赖 |
| `include` | `src/**/*` | `luckysheet-next/src/**/*` | 范围隔离 |

### 2.3 严格模式迁移注意事项

开启 `strict: true` 后，以下模式需要显式处理：

```typescript
// ❌ 隐式 any - 不允许
function handle(data) { }

// ✅ 显式类型
function handle(data: IConditionRule): void { }

// ❌ 可能未定义的索引访问
const item = arr[0];
item.name;

// ✅ 安全访问
const item = arr[0];
if (item) {
  item.name;
}

// ❌ 隐式 this
function onClick(this: HTMLElement) { }

// ✅ 显式 this 或箭头函数
const onClick = (): void => { }
```

---

## 3. Vitest 配置

### 3.1 配置文件：`vitest.config.next.ts`

新模块使用独立的测试配置，与旧模块的 [vitest.config.js](file:///d:/gitee/Luckysheet/vitest.config.js) 分离。

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['luckysheet-next/src/**/*.spec.ts'],
    setupFiles: ['./luckysheet-next/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['luckysheet-next/src/**/*.ts'],
      exclude: [
        'luckysheet-next/src/**/*.spec.ts',
        'luckysheet-next/src/**/*.d.ts',
        'luckysheet-next/src/index.ts',
        'luckysheet-next/src/types/**',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      reportsDirectory: './coverage-next',
    },
    typecheck: {
      enabled: true,
    },
  },
  resolve: {
    alias: {
      '@next': resolve(__dirname, 'luckysheet-next/src'),
    },
  },
})
```

### 3.2 测试文件约定

| 约定 | 说明 |
|------|------|
| 文件位置 | 与源文件同目录，使用 `.spec.ts` 后缀 |
| 命名规范 | `{filename}.spec.ts`，如 `condition-rule.spec.ts` |
| 测试结构 | `describe` → `it` 嵌套，每个 `describe` 对应一个类/模块 |
| Mock 策略 | 不 mock jQuery（因为不使用），仅 mock 外部依赖 |
| 断言风格 | 使用 `expect` + `vi` 全局 API |

### 3.3 测试 Setup 文件：`luckysheet-next/vitest.setup.ts`

新模块不需要 mock jQuery（旧模块的 [vitest.setup.js](file:///d:/gitee/Luckysheet/vitest.setup.js) 大量 mock 了 jQuery 和 Canvas）。新模块的 setup 仅需：

```typescript
import { vi } from 'vitest'

class MockCanvas {
  constructor() {
    this.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: [] })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({ data: [] })),
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
      measureText: vi.fn(() => ({ width: 0 })),
      rect: vi.fn(),
      clip: vi.fn(),
      font: '',
      fillStyle: '',
      strokeStyle: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
      lineWidth: 1,
      lineCap: '',
      lineJoin: '',
    }))
    this.width = 0
    this.height = 0
    this.style = {}
    this.toDataURL = vi.fn(() => '')
    this.addEventListener = vi.fn()
    this.removeEventListener = vi.fn()
  }
}

HTMLCanvasElement.prototype.getContext = function () {
  if (!this._context) {
    this._context = new MockCanvas().getContext()
  }
  return this._context
}
```

### 3.4 覆盖率目标

新模块要求 **80%** 的覆盖率门槛，覆盖维度包括：

- **branches**: 80% — 分支覆盖
- **functions**: 80% — 函数覆盖
- **lines**: 80% — 行覆盖
- **statements**: 80% — 语句覆盖

覆盖率报告输出到 `coverage-next/` 目录，与旧模块的 `coverage/` 隔离。

---

## 4. package.json Scripts

### 4.1 新增脚本

在现有 [package.json](file:///d:/gitee/Luckysheet/package.json) 的 `scripts` 中新增以下条目：

```json
{
  "scripts": {
    "dev:next": "vite --config vite.config.next.ts",
    "build:next": "vite build --config vite.config.next.ts",
    "test:next": "vitest run --config vitest.config.next.ts",
    "test:next:watch": "vitest --config vitest.config.next.ts",
    "test:next:coverage": "vitest run --config vitest.config.next.ts --coverage",
    "typecheck:next": "tsc --noEmit -p tsconfig.next.json"
  }
}
```

### 4.2 完整脚本对照表

| 脚本 | 旧模块 | 新模块 | 说明 |
|------|--------|--------|------|
| 开发服务器 | `npm run dev` (端口 3000) | `npm run dev:next` (端口 3001) | 并行开发 |
| 构建 | `npm run build` | `npm run build:next` | 产物隔离 |
| 测试 | `npm run test` | `npm run test:next` | 独立测试配置 |
| 测试监听 | `npm run test:watch` | `npm run test:next:watch` | 独立监听 |
| 覆盖率 | `npm run test:coverage` | `npm run test:next:coverage` | 独立覆盖率 |
| 类型检查 | `npm run typecheck` | `npm run typecheck:next` | 不同 tsconfig |
| 代码检查 | `npm run lint` | 复用 `npm run lint`（需配置路径） | ESLint 共享 |
| 格式化 | `npm run format` | 复用 `npm run format` | Prettier 共享 |

### 4.3 并行开发工作流

```bash
# 终端 1：启动旧模块开发服务器
npm run dev

# 终端 2：启动新模块开发服务器
npm run dev:next

# 终端 3：运行新模块测试（监听模式）
npm run test:next:watch

# 终端 4：运行新模块类型检查（监听模式）
npm run typecheck:next -- --watch
```

---

## 5. 开发用 HTML 页面

### 5.1 文件：`luckysheet-next/index.html`

新模块使用独立的开发 HTML 页面，不依赖旧模块的 [index.html](file:///d:/gitee/Luckysheet/src/index.html)。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Luckysheet Next - Dev</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #app { width: 100%; height: 100vh; }
    .dev-info {
      position: fixed; top: 8px; right: 8px; z-index: 9999;
      padding: 4px 12px; background: #4CAF50; color: white;
      border-radius: 4px; font-size: 12px; opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="dev-info">luckysheet-next (port 3001)</div>
  <div id="app"></div>
  <script type="module" src="./src/index.ts"></script>
</body>
</html>
```

### 5.2 Vite 开发服务器配置

在 `vite.config.next.ts` 中添加 `root` 配置，使开发服务器以 `luckysheet-next/` 为根目录：

```typescript
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    root: isDev ? resolve(__dirname, 'luckysheet-next') : undefined,

    // ... 其余配置
  }
})
```

这样 Vite 会自动加载 `luckysheet-next/index.html` 作为入口页面。

---

## 6. 目录结构总览

```
luckysheet-next/
├── docs/                          # 文档
│   ├── infrastructure/
│   │   ├── 01-build-config.md     # 本文档
│   │   └── 02-plugin-system.md    # 插件系统设计
│   └── migration/
│       ├── 01-roadmap.md          # 迁移路线图
│       └── 02-compatibility.md    # 兼容性策略
├── src/
│   ├── index.ts                   # 模块入口
│   ├── domain/                    # 领域层
│   ├── application/               # 应用层
│   ├── infrastructure/            # 基础设施层
│   └── ui/                        # UI 层
├── index.html                     # 开发用 HTML
├── vitest.setup.ts                # 测试 setup
└── ...
```

项目根目录新增文件：

```
d:/gitee/Luckysheet/
├── vite.config.next.ts            # 新模块 Vite 配置
├── tsconfig.next.json             # 新模块 TypeScript 配置
├── vitest.config.next.ts          # 新模块 Vitest 配置
├── dist-next/                     # 新模块构建产物（gitignore）
├── coverage-next/                 # 新模块覆盖率报告（gitignore）
└── ...（原有文件不变）
```

---

## 7. .gitignore 更新

在现有 `.gitignore` 中追加：

```
# luckysheet-next
dist-next/
coverage-next/
```

---

## 8. 依赖管理

### 8.1 新模块所需的新增依赖

```json
{
  "devDependencies": {
    "vitest": "^4.1.7"
  }
}
```

新模块不引入任何新的运行时依赖。Vitest 已在现有项目中安装，无需重复添加。

### 8.2 不再需要的依赖

以下旧模块依赖在新模块中不再使用：

| 依赖 | 旧模块用途 | 新模块替代方案 |
|------|-----------|--------------|
| `jquery` (peer) | DOM 操作、事件、AJAX | 原生 DOM API |
| `jquery-mousewheel` | 鼠标滚轮事件 | `WheelEvent` 原生 API |
| `spectrum-colorpicker` | 颜色选择器 | 自研轻量组件 |
| `@rollup/plugin-inject` | jQuery 自动注入 | 不需要 |

---

## 9. 构建验证清单

配置完成后，依次验证以下项目：

- [ ] `npm run dev:next` 能在端口 3001 启动开发服务器
- [ ] `npm run build:next` 能生成 `dist-next/luckysheet-next.es.js` 和 `dist-next/luckysheet-next.umd.js`
- [ ] `npm run typecheck:next` 能通过类型检查（无错误）
- [ ] `npm run test:next` 能运行测试（即使测试用例为空也应通过）
- [ ] `npm run dev` 和 `npm run dev:next` 能同时运行互不干扰
- [ ] 旧模块的 `npm run build` 不受新模块配置影响
