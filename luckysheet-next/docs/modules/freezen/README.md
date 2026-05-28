# 冻结模块（Freezen）迁移文档

> 本文档为 Luckysheet 冻结模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

### 1.1 旧架构文件清单

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/freezen/index.js` | 模块入口，合并5个子模块 |
| `src/controllers/freezen/freezeCore.js` | 冻结核心逻辑（行列冻结计算） |
| `src/controllers/freezen/freezeConfig.js` | 冻结配置管理 |
| `src/controllers/freezen/freezeCanvas.js` | 冻结Canvas绘制 |
| `src/controllers/freezen/scrollAdapt.js` | 滚动适配（冻结时滚动偏移） |
| `src/controllers/freezen/windowSize.js` | 窗口大小变化处理 |

### 1.2 旧架构核心问题

1. **对象字面量混入**：5个子模块通过展开运算符合并
2. **冻结状态存储在对象属性上**：`freezenhorizontaldata`、`freezenverticaldata` 直接挂在对象上
3. **jQuery依赖**：窗口大小变化、滚动事件使用jQuery
4. **Canvas操作分散**：冻结Canvas绘制逻辑分散在多个方法中

---

## 2. 源文件逐一分析

### 2.1 freezen/index.js

**导出**:
```js
const luckysheetFreezen = {
    ...freezeCoreModule,
    ...freezeConfigModule,
    ...freezeCanvasModule,
    ...scrollAdaptModule,
    ...windowSizeModule,
};
export default luckysheetFreezen;
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `luckysheetFreezen` (整个对象) | `FreezenService` 单例实例 |

---

### 2.2 freezen/freezeCore.js

**功能描述**: 冻结核心逻辑。计算冻结行列的偏移量、冻结范围等。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `freezenHorizontal(row, store)` | 冻结行 |
| `freezenVertical(col, store)` | 冻结列 |
| `cancelFreezenHorizontal()` | 取消行冻结 |
| `cancelFreezenVertical()` | 取消列冻结 |

**依赖**: Store

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `freezenHorizontal(row)` | `FreezenService.freezeRow(row): void` |
| `freezenVertical(col)` | `FreezenService.freezeColumn(col): void` |
| `cancelFreezenHorizontal()` | `FreezenService.unfreezeRow(): void` |
| `cancelFreezenVertical()` | `FreezenService.unfreezeColumn(): void` |

---

### 2.3 freezen/freezeCanvas.js

**功能描述**: 冻结Canvas绘制。在冻结状态下绘制冻结区域的Canvas内容。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `freezenHorizontalCanvas()` | 绘制行冻结Canvas |
| `freezenVerticalCanvas()` | 绘制列冻结Canvas |

**依赖**: Store, draw

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `freezenHorizontalCanvas()` | `FreezenRenderer.renderRowFreeze(): void` |
| `freezenVerticalCanvas()` | `FreezenRenderer.renderColumnFreeze(): void` |

---

### 2.4 freezen/scrollAdapt.js

**功能描述**: 滚动适配。在冻结状态下处理滚动偏移，确保冻结区域固定。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `scrollAdapt()` | 滚动适配计算 |

**依赖**: Store

**jQuery使用**: `$(selector).scrollLeft()/scrollTop()`

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `scrollAdapt()` | `FreezenScrollAdapter.adapt(): void` |

---

### 2.5 freezen/windowSize.js

**功能描述**: 窗口大小变化处理。在窗口resize时重新计算冻结区域。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `windowSizeOnChange()` | 窗口大小变化处理 |

**依赖**: Store

**jQuery使用**: `$(window).on("resize")`

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `windowSizeOnChange()` | `FreezenResizeHandler.handleResize(): void` |

---

## 3. 新架构对应位置

```
src/
  freezen/
    FreezenService.ts                 # 主服务类
    FreezenRenderer.ts                # 冻结Canvas渲染
    FreezenScrollAdapter.ts           # 滚动适配
    FreezenResizeHandler.ts           # 窗口大小变化处理
    types.ts                          # TypeScript接口定义
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `freezenHorizontal(row)` | `FreezenService.freezeRow(row): void` |
| `freezenVertical(col)` | `FreezenService.freezeColumn(col): void` |
| `cancelFreezenHorizontal()` | `FreezenService.unfreezeRow(): void` |
| `cancelFreezenVertical()` | `FreezenService.unfreezeColumn(): void` |
| `freezenHorizontalCanvas()` | `FreezenRenderer.renderRowFreeze(): void` |
| `freezenVerticalCanvas()` | `FreezenRenderer.renderColumnFreeze(): void` |
| `scrollAdapt()` | `FreezenScrollAdapter.adapt(): void` |
| `windowSizeOnChange()` | `FreezenResizeHandler.handleResize(): void` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 冻结行 | freezeRow(3) | 前3行固定，滚动时不移动 |
| 冻结列 | freezeColumn(2) | 前2列固定 |
| 取消冻结 | unfreezeRow() | 行冻结取消 |
| 同时冻结行列 | freezeRow(3) + freezeColumn(2) | 左上角3x2区域固定 |
| 滚动适配 | 冻结后滚动 | 冻结区域不随滚动移动 |
| 窗口resize | 窗口大小变化 | 冻结区域重新计算 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `controllers/handler/scroll.js` | `scrollAdapt()` | 滚动事件 |
| `controllers/handler/freezeButtons.js` | `freezenHorizontal()`, `freezenVertical()` | 冻结按钮 |
| `controllers/updateCell.js` | `freezenverticaldata` | 编辑器定位 |
| `controllers/selection/clipboardPaste.js` | 间接引用 | 粘贴时冻结适配 |
| `global/draw/drawMain.js` | `freezenHorizontalCanvas()`, `freezenVerticalCanvas()` | Canvas绘制 |
| `global/refresh/refreshCanvas.js` | 间接引用 | 刷新Canvas |
