# 渲染模块（Rendering）迁移文档

> 本文档为 Luckysheet 渲染模块从旧架构迁移到新架构的完整指南。渲染模块是系统的核心可视化层，负责Canvas绘制、文本测量和刷新管理。

---

## 1. 模块总览

### 1.1 旧架构文件清单

#### global/draw/（Canvas绘制）

| 文件路径 | 核心职责 |
|---------|---------|
| `src/global/draw/index.js` | 模块入口，重新导出5个子模块 |
| `src/global/draw/drawMain.js` | 主Canvas绘制（单元格、网格线、选区） |
| `src/global/draw/drawTitle.js` | 行列标题绘制 |
| `src/global/draw/cellRender.js` | 单元格渲染（背景、边框、内容） |
| `src/global/draw/cellTextRender.js` | 单元格文本渲染 |
| `src/global/draw/cellOverflow.js` | 单元格溢出处理 |
| `src/global/draw/drawUtils.js` | 绘制工具函数 |

#### global/getRowlen/（行高计算与文本测量）

| 文件路径 | 核心职责 |
|---------|---------|
| `src/global/getRowlen/index.js` | 模块入口，重新导出6个函数 |
| `src/global/getRowlen/rowlenUtils.js` | 行高计算工具 |
| `src/global/getRowlen/getCellTextInfo.js` | 单元格文本信息计算 |
| `src/global/getRowlen/getCellTextSplitArr.js` | 文本分割数组 |
| `src/global/getRowlen/getMeasureText.js` | 文本测量 |
| `src/global/getRowlen/isSupportBoundingBox.js` | BoundingBox支持检测 |
| `src/global/getRowlen/drawLineInfo.js` | 绘制线信息 |

#### global/refresh/（刷新管理）

| 文件路径 | 核心职责 |
|---------|---------|
| `src/global/refresh/index.js` | 模块入口，重新导出3组函数 |
| `src/global/refresh/refreshCore.js` | 核心刷新逻辑（数据变更后刷新） |
| `src/global/refresh/refreshCore.test.js` | 核心刷新单元测试 |
| `src/global/refresh/refreshCanvas.js` | Canvas刷新 |
| `src/global/refresh/refreshOperation.js` | 刷新操作（行列增删、粘贴等） |
| `src/global/refresh/refreshState.js` | 刷新状态管理 |

### 1.2 旧架构核心问题

1. **Canvas操作与业务逻辑混合**：drawMain.js 同时处理绘制逻辑和数据读取
2. **全局Store直访**：大量直接读写 `Store.flowdata`、`Store.visibledatarow` 等
3. **刷新链路复杂**：refreshCore.js 包含大量条件分支，根据不同操作类型执行不同刷新逻辑
4. **文本测量依赖Canvas**：getMeasureText.js 直接操作Canvas context
5. **无类型安全**：所有绘制参数为裸对象

---

## 2. 源文件逐一分析

### 2.1 draw/index.js

**导出**:
```js
export { luckysheetDrawgridRowTitle, luckysheetDrawgridColumnTitle } from './drawTitle.js';
export { luckysheetDrawMain } from './drawMain.js';
export { getCellOverflowMap, cellOverflow_trace, cellOverflow_colIn, cellOverflowRender } from './cellOverflow.js';
export { cellTextRender } from './cellTextRender.js';
export { nullCellRender, cellRender } from './cellRender.js';
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `luckysheetDrawMain` | `CanvasRenderer.drawMain(): void` |
| `luckysheetDrawgridRowTitle` | `CanvasRenderer.drawRowTitle(): void` |
| `luckysheetDrawgridColumnTitle` | `CanvasRenderer.drawColumnTitle(): void` |
| `cellRender` | `CellRenderer.render(ctx, cell, bounds): void` |
| `cellTextRender` | `CellTextRenderer.render(ctx, text, bounds): void` |
| `getCellOverflowMap` | `CellOverflowManager.getMap(): OverflowMap` |

---

### 2.2 draw/drawMain.js

**功能描述**: 主Canvas绘制。绘制整个表格的可见区域，包括网格线、单元格内容、选区框等。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `luckysheetDrawMain(scrollWidth, scrollHeight)` | 主Canvas绘制 |

**依赖**: Store, conditionformat, alternateformat, cellRender, cellTextRender, cellOverflow, drawUtils

**jQuery使用**: 无（纯Canvas操作）

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `luckysheetDrawMain(scrollW, scrollH)` | `CanvasRenderer.drawMain(scrollW, scrollH): void` |

---

### 2.3 draw/drawTitle.js

**功能描述**: 行列标题绘制。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `luckysheetDrawgridRowTitle(scrollHeight)` | 绘制行标题 |
| `luckysheetDrawgridColumnTitle(scrollWidth)` | 绘制列标题 |

**依赖**: Store

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `luckysheetDrawgridRowTitle(scrollH)` | `CanvasRenderer.drawRowTitle(scrollH): void` |
| `luckysheetDrawgridColumnTitle(scrollW)` | `CanvasRenderer.drawColumnTitle(scrollW): void` |

---

### 2.4 draw/cellRender.js

**功能描述**: 单元格渲染。绘制单元格的背景色、边框和条件格式效果。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `nullCellRender(ctx, cell, w, h)` | 渲染空单元格 |
| `cellRender(ctx, cell, w, h)` | 渲染有内容的单元格 |

**依赖**: Store, conditionformat, alternateformat

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `nullCellRender(ctx, cell, w, h)` | `CellRenderer.renderNull(ctx, cell, bounds): void` |
| `cellRender(ctx, cell, w, h)` | `CellRenderer.render(ctx, cell, bounds): void` |

---

### 2.5 getRowlen/index.js

**导出**:
```js
export { rowlenByRange, computeRowlenByContent, computeCellWidth, computeColWidthByContent, computeRowlenArr } from './rowlenUtils';
export { getCellTextSplitArr } from './getCellTextSplitArr';
export { getMeasureText } from './getMeasureText';
export { isSupportBoundingBox } from './isSupportBoundingBox';
export { getCellTextInfo } from './getCellTextInfo';
export { drawLineInfo } from './drawLineInfo';
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `rowlenByRange` | `RowHeightCalculator.byRange(...): number[]` |
| `computeRowlenByContent` | `RowHeightCalculator.byContent(...): number` |
| `computeCellWidth` | `ColumnWidthCalculator.cellWidth(...): number` |
| `computeColWidthByContent` | `ColumnWidthCalculator.byContent(...): number` |
| `computeRowlenArr` | `RowHeightCalculator.computeArr(...): number[]` |
| `getCellTextInfo` | `TextMeasurer.getCellTextInfo(...): TextInfo` |
| `getMeasureText` | `TextMeasurer.measure(...): TextMetrics` |

---

### 2.6 refresh/index.js

**导出**:
```js
export { jfrefreshgrid, jfrefreshgridall, jfrefreshrange, ... } from "./refreshCore";
export { jfrefreshgrid_adRC, jfrefreshgrid_deleteCell, jfrefreshgrid_pastcut } from "./refreshOperation";
export { luckysheetrefreshgrid, jfrefreshgrid_rhcw } from "./refreshCanvas";
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `jfrefreshgrid` | `RefreshService.refreshGrid(data, range, params): void` |
| `jfrefreshgridall` | `RefreshService.refreshAll(...): void` |
| `jfrefreshrange` | `RefreshService.refreshRange(data, range, cdformat): void` |
| `luckysheetrefreshgrid` | `RefreshService.refreshCanvas(): void` |
| `jfrefreshgrid_rhcw` | `RefreshService.refreshRowColHeightWidth(...): void` |
| `jfrefreshgrid_adRC` | `RefreshService.refreshAddDeleteRC(...): void` |
| `jfrefreshgrid_deleteCell` | `RefreshService.refreshDeleteCell(...): void` |
| `jfrefreshgrid_pastcut` | `RefreshService.refreshPasteCut(...): void` |

---

### 2.7 refresh/refreshCore.js

**功能描述**: 核心刷新逻辑。数据变更后执行完整的刷新流程：更新Store、重算公式、重绘Canvas、保存undo/redo。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `jfrefreshgrid(data, range, params)` | 刷新网格（最常用的刷新入口） |
| `jfrefreshgridall(colLen, rowLen, data, config, range, ctrlType, ctrlValue, cdformat)` | 全量刷新 |
| `jfrefreshrange(data, range, cdformat)` | 范围刷新 |
| `runExecFunction(range)` | 执行公式重算 |

**依赖**: Store, formula, conditionformat, alternateformat, sheetmanage, cleargridelement

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `jfrefreshgrid(data, range, params)` | `RefreshService.refreshGrid(data, range, params): void` |
| `jfrefreshgridall(...)` | `RefreshService.refreshAll(...): void` |
| `jfrefreshrange(data, range, cdformat)` | `RefreshService.refreshRange(data, range, cdformat): void` |
| `runExecFunction(range)` | `RefreshService.runCalculation(range): void` |

---

## 3. 新架构对应位置

```
src/
  rendering/
    CanvasRenderer.ts                 # Canvas渲染器（替代draw/）
    CellRenderer.ts                   # 单元格渲染
    CellTextRenderer.ts               # 文本渲染
    CellOverflowManager.ts            # 溢出管理
    RowHeightCalculator.ts            # 行高计算（替代getRowlen/）
    ColumnWidthCalculator.ts          # 列宽计算
    TextMeasurer.ts                   # 文本测量
    RefreshService.ts                 # 刷新服务（替代refresh/）
    types.ts                          # TypeScript接口定义
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `luckysheetDrawMain(scrollW, scrollH)` | `CanvasRenderer.drawMain(scrollW, scrollH): void` |
| `luckysheetDrawgridRowTitle(scrollH)` | `CanvasRenderer.drawRowTitle(scrollH): void` |
| `luckysheetDrawgridColumnTitle(scrollW)` | `CanvasRenderer.drawColumnTitle(scrollW): void` |
| `cellRender(ctx, cell, w, h)` | `CellRenderer.render(ctx, cell, bounds): void` |
| `cellTextRender(ctx, text, bounds)` | `CellTextRenderer.render(ctx, text, bounds): void` |
| `rowlenByRange(...)` | `RowHeightCalculator.byRange(...): number[]` |
| `computeRowlenByContent(...)` | `RowHeightCalculator.byContent(...): number` |
| `getCellTextInfo(...)` | `TextMeasurer.getCellTextInfo(...): TextInfo` |
| `jfrefreshgrid(data, range, params)` | `RefreshService.refreshGrid(data, range, params): void` |
| `jfrefreshgridall(...)` | `RefreshService.refreshAll(...): void` |
| `luckysheetrefreshgrid()` | `RefreshService.refreshCanvas(): void` |
| `jfrefreshgrid_adRC(...)` | `RefreshService.refreshAddDeleteRC(...): void` |
| `jfrefreshgrid_rhcw(...)` | `RefreshService.refreshRowColHeightWidth(...): void` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 主Canvas绘制 | 有效滚动位置 | Canvas正确绘制可见区域 |
| 行标题绘制 | 有效滚动位置 | 行号正确显示 |
| 列标题绘制 | 有效滚动位置 | 列标正确显示 |
| 行高计算 | 有换行文本的单元格 | 返回正确行高 |
| 文本测量 | "Hello World" | 返回正确的宽度和高度 |
| 刷新网格 | 修改数据后调用 | Canvas更新，公式重算 |
| 全量刷新 | 行列增删后调用 | 整个表格重新计算和绘制 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `controllers/handler/scroll.js` | `luckysheetDrawMain()` | 滚动时重绘 |
| `controllers/controlHistory.js` | `jfrefreshgrid()`, `jfrefreshgridall()` 等 | 历史记录刷新 |
| `controllers/selection/clipboardPaste.js` | `jfrefreshgrid()` | 粘贴后刷新 |
| `controllers/updateCell.js` | `luckysheetrefreshgrid()` | 编辑后刷新 |
| `controllers/rowColumnOperation/` | `jfrefreshgrid_adRC()`, `jfrefreshgrid_rhcw()` | 行列操作后刷新 |
| `controllers/alternateformat/` | `luckysheetrefreshgrid()` | 交替颜色变更后刷新 |
| `controllers/conditionformat/` | `luckysheetrefreshgrid()` | 条件格式变更后刷新 |
| `controllers/filter/` | `jfrefreshgrid_rhcw()` | 筛选后刷新 |
| `controllers/freezen/` | `luckysheetDrawMain()` | 冻结时重绘 |
