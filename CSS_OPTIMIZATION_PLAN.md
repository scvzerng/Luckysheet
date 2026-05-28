# CSS 打包体积优化计划

## 现状

| 产物 | 原始大小 | Gzip 后 |
|------|---------|---------|
| `style.css` | 4,455 kB | 2,274 kB |
| `luckysheet.umd.js` | 2,239 kB | 516 kB |
| `luckysheet.es.js` | 4,166 kB | 642 kB |

## 问题分析

style.css 4,455 kB 中，**base64 内联数据占 ~95%**：

| 组成部分 | 估算大小 | 占比 |
|----------|----------|------|
| Font Awesome 字体（base64 内联） | ~3,200 kB | ~72% |
| iconfont 字体（base64 内联） | ~150 kB | ~3% |
| Base64 图片 | ~15 kB | <1% |
| Font Awesome CSS 文本 | ~70 kB | ~2% |
| Luckysheet 核心 CSS | ~110 kB | ~2% |
| flatpickr + 其他 | ~20 kB | <1% |

### 根因

1. **字体文件全部 base64 内联**：Vite 默认将小文件内联，但 Font Awesome 字体文件较大，全部内联导致 CSS 膨胀
2. **冗余字体格式全量内联**：Font Awesome 包含 woff2 + TTF 两种格式，iconfont 包含 woff2/woff/TTF/EOT/SVG 五种格式，全部被内联
3. **Font Awesome 全量导入**：`all.min.css` 导入了全部 ~2,000 个图标定义和 4 个字族（solid/regular/brands/v4-shims）
4. **v4-shims 冗余**：`all.min.css` 包含 Font Awesome v4 兼容层，额外增加字体和 CSS
5. **无 CSS Tree-shaking**：Font Awesome 图标类通过 CSS 类名引用，无法被构建工具自动 tree-shake
6. **废弃字体格式**：iconfont.css 引用了 EOT（IE 专用）和 SVG（iOS 4.1-）等过时格式

## 优化方案

### P0：字体外置而非内联（预估减少 ~3,000 kB）

修改 `vite.config.js`，设置 `build.assetsInlineLimit` 为 0 或合理阈值（如 4096），让字体文件作为独立资源加载而非 base64 内联到 CSS。

```js
// vite.config.js
build: {
    assetsInlineLimit: 0, // 或 4096（4KB 以下内联，以上外置）
}
```

**风险**：低。字体文件独立加载是标准做法，浏览器会缓存。

### P1：仅保留 woff2 格式（预估减少 ~1,500 kB）

#### 1a. Font Awesome 仅导入 woff2 字族

替换 `src/index.js` 中的：
```js
import '@fortawesome/fontawesome-free/css/all.min.css'
```
为按需导入，或创建自定义 CSS 仅引用 woff2 格式。

#### 1b. iconfont.css 精简格式

修改 `src/assets/iconfont/iconfont.css`，移除 EOT/SVG/TTF 引用，仅保留 woff2：
```css
@font-face {
    font-family: "iconfont";
    src: url("data:font/woff2;base64,...") format("woff2");
}
```

**风险**：低。woff2 浏览器支持率 >97%（IE 除外，但 IE 已停止支持）。

### P2：Font Awesome 按需导入（预估减少 ~50 kB CSS 文本）

#### 方案 A：仅导入需要的模块

```js
// 替换 all.min.css
import '@fortawesome/fontawesome-free/css/solid.min.css'
import '@fortawesome/fontawesome-free/css/regular.min.css'
// 不需要 brands 和 v4-shims
```

#### 方案 B：使用 JS 版本按需引入（更彻底）

```js
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faSearch, faBold, faItalic } from '@fortawesome/free-solid-svg-icons'

library.add(faSearch, faBold, faItalic)
dom.watch()
```

**风险**：中。需要扫描所有使用的图标类名，确保不遗漏。

### P3：移除 v4-shims（预估减少 ~30 kB）

如果不需要 FA4 图标名兼容性，改用不含 v4-shims 的导入方式。

**风险**：低。需要确认没有使用 FA4 风格的图标类名（如 `fa-search` 替代 `fas fa-search`）。

## 执行优先级

| 优先级 | 方案 | 预估减少 | 风险 | 工作量 |
|--------|------|---------|------|--------|
| P0 | 字体外置 | ~3,000 kB | 低 | 改 1 行配置 |
| P1 | 仅保留 woff2 | ~1,500 kB | 低 | 改 2 个文件 |
| P2 | FA 按需导入 | ~50 kB | 中 | 需扫描图标使用 |
| P3 | 移除 v4-shims | ~30 kB | 低 | 改 1 行导入 |

## 预期效果

执行 P0+P1 后：
- style.css 从 4,455 kB → ~500 kB（CSS 文本）
- 字体文件独立输出为 .woff2 资源（~800 kB，可被浏览器缓存）
- Gzip 后 CSS 从 2,274 kB → ~100 kB
