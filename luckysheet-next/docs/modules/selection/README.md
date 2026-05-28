# 选区模块（Selection）迁移文档

> 本文档为 Luckysheet 选区模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

### 1.1 旧架构文件清单

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/selection/index.js` | 模块入口，合并6个子模块 |
| `src/controllers/selection/clipboardCopy.js` | 复制功能（Ctrl+C） |
| `src/controllers/selection/clipboardCopyPaste.js` | 复制粘贴功能 |
| `src/controllers/selection/clipboardCutPaste.js` | 剪切粘贴功能 |
| `src/controllers/selection/clipboardPaintModel.js` | 格式刷功能 |
| `src/controllers/selection/clipboardPaste.js` | 粘贴功能（Ctrl+V） |
| `src/controllers/selection/htmlTableBuilder.js` | HTML表格构建器 |
| `src/controllers/selection/utils.js` | 选区工具函数 |
| `src/controllers/select.js` | 选区高亮显示、标题栏、选区重叠检测 |
| `src/controllers/selection.js` | 旧入口代理 |

### 1.2 旧架构核心问题

1. **对象字面量混入**：`index.js` 通过展开运算符合并6个子模块
2. **jQuery重度依赖**：大量DOM操作、事件绑定、`$.extend`深拷贝
3. **全局Store直访**：直接读写 `Store.luckysheet_select_save`、`Store.luckysheet_copy_save` 等
4. **选区高亮与数据混合**：select.js 同时处理UI渲染和数据操作

---

## 2. 源文件逐一分析

### 2.1 selection/index.js

**功能描述**: 模块入口，合并6个子模块为统一的 `selection` 对象。

**导出**:
```js
export default selection; // 包含所有子模块方法的对象
```

**依赖**: clipboardCopy, clipboardPaste, clipboardCutPaste, clipboardCopyPaste, clipboardPaintModel, utils

**jQuery使用**: 间接使用

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `selection` (整个对象) | `SelectionService` 单例实例 |

---

### 2.2 selection/clipboardCopy.js

**功能描述**: 复制功能实现。处理Ctrl+C复制选区数据到剪贴板，支持纯文本和HTML格式。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `copy(event)` | 执行复制操作 |

**依赖**: Store, htmlTableBuilder, selectionCopyShow

**jQuery使用**: `$(selector).css()`, `$(selector).show()/hide()`

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `copy(event)` | `ClipboardService.copy(event): void` |

---

### 2.3 selection/clipboardPaste.js

**功能描述**: 粘贴功能实现。处理Ctrl+V从剪贴板粘贴数据，支持纯文本、HTML和内部格式。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `paste(event)` | 执行粘贴操作 |
| `pasteHandler(data, range)` | 处理粘贴数据 |

**依赖**: Store, formula, conditionformat, alternateformat, menuButton

**jQuery使用**: 大量DOM操作和数据读写

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `paste(event)` | `ClipboardService.paste(event): void` |
| `pasteHandler(data, range)` | `ClipboardService.pasteHandler(data, range): void` |

---

### 2.4 selection/clipboardCutPaste.js

**功能描述**: 剪切粘贴功能实现。处理Ctrl+X剪切后粘贴，需要清除源区域数据。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `cutPaste(event)` | 执行剪切粘贴操作 |

**依赖**: Store, conditionformat, alternateformat, CFSplitRange

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `cutPaste(event)` | `ClipboardService.cutPaste(event): void` |

---

### 2.5 selection/clipboardCopyPaste.js

**功能描述**: 复制粘贴协同处理。处理跨工作表复制粘贴和特殊粘贴选项。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `copyPaste(sourceRange, targetRange)` | 执行复制粘贴 |

**依赖**: Store, conditionformat, alternateformat

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `copyPaste(source, target)` | `ClipboardService.copyPaste(source, target): void` |

---

### 2.6 selection/clipboardPaintModel.js

**功能描述**: 格式刷功能实现。复制源区域的格式并应用到目标区域。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `paintModel(sourceRange, targetRange)` | 执行格式刷 |

**依赖**: Store, conditionformat, alternateformat, CFSplitRange

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `paintModel(source, target)` | `ClipboardService.paintFormat(source, target): void` |

---

### 2.7 selection/htmlTableBuilder.js

**功能描述**: HTML表格构建器。将选区数据构建为HTML表格字符串，用于复制到外部应用。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `buildHTMLTable(range, data)` | 构建HTML表格字符串 |

**依赖**: Store, getcellvalue

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `buildHTMLTable(range, data)` | `HtmlTableBuilder.build(range, data): string` |

---

### 2.8 selection/utils.js

**功能描述**: 选区工具函数。提供选区相关的辅助方法。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getSelectionRange()` | 获取当前选区范围 |
| `isSelectionOverlap(range1, range2)` | 判断选区是否重叠 |

**依赖**: Store

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `getSelectionRange()` | `SelectionUtils.getCurrentRange(): CellRange[]` |
| `isSelectionOverlap(r1, r2)` | `SelectionUtils.isOverlap(r1, r2): boolean` |

---

### 2.9 select.js

**功能描述**: 选区高亮显示模块。处理选区的视觉呈现，包括选区框、行列标题高亮、选区行列数显示等。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `seletedHighlistByindex(id, r1, r2, c1, c2)` | 按索引高亮选区 |
| `selectHightlightShow(isRestore)` | 设置选区高亮显示 |
| `selectIsOverlap(range)` | 检查选区是否重叠 |
| `selectionCopyShow(range)` | 显示复制选区虚线框 |
| `luckysheet_count_show(left, top, w, h, rows, cols)` | 显示选区行列数 |
| `selectHelpboxFill()` | 填充左上角范围显示 |

**依赖**: menuButton, formula, dynamicArray, browser, getRangetxt, Store

**jQuery使用**: 大量 `$("#luckysheet-cell-selected-boxs")` 操作，`$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `selectHightlightShow(isRestore)` | `SelectionRenderer.highlight(isRestore): void` |
| `selectIsOverlap(range)` | `SelectionUtils.isOverlap(range): boolean` |
| `selectionCopyShow(range)` | `SelectionRenderer.showCopyBorder(range): void` |
| `luckysheet_count_show(...)` | `SelectionRenderer.showCountInfo(...): void` |
| `selectHelpboxFill()` | `SelectionRenderer.fillHelpBox(): void` |

---

## 3. 新架构对应位置

```
src/
  selection/
    SelectionService.ts               # 主服务类
    SelectionRenderer.ts              # 选区渲染（高亮、边框、计数）
    SelectionUtils.ts                 # 选区工具函数
    ClipboardService.ts               # 剪贴板服务（复制/粘贴/剪切/格式刷）
    HtmlTableBuilder.ts               # HTML表格构建器
    types.ts                          # TypeScript接口定义
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `copy(event)` | `ClipboardService.copy(event): void` |
| `paste(event)` | `ClipboardService.paste(event): void` |
| `pasteHandler(data, range)` | `ClipboardService.pasteHandler(data, range): void` |
| `cutPaste(event)` | `ClipboardService.cutPaste(event): void` |
| `copyPaste(source, target)` | `ClipboardService.copyPaste(source, target): void` |
| `paintModel(source, target)` | `ClipboardService.paintFormat(source, target): void` |
| `buildHTMLTable(range, data)` | `HtmlTableBuilder.build(range, data): string` |
| `selectHightlightShow(isRestore)` | `SelectionRenderer.highlight(isRestore): void` |
| `selectionCopyShow(range)` | `SelectionRenderer.showCopyBorder(range): void` |
| `selectIsOverlap(range)` | `SelectionUtils.isOverlap(range): boolean` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 复制选区 | Ctrl+C | Store.luckysheet_copy_save 被设置 |
| 粘贴文本 | 粘贴"hello" | 目标单元格值为"hello" |
| 剪切粘贴 | Ctrl+X后Ctrl+V | 源区域清空，目标区域有数据 |
| 格式刷 | 选择源格式后应用到目标 | 目标区域格式与源一致 |
| 选区高亮 | 设置选区 | 对应DOM元素显示高亮框 |
| 选区重叠 | 两个重叠范围 | `isOverlap` 返回 true |
| HTML表格构建 | 3x3数据 | 生成包含table标签的HTML字符串 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `controllers/handler/cellEvents.js` | `selectHightlightShow()` | 单元格事件中更新选区 |
| `controllers/handler/selectionDrag.js` | `selectHightlightShow()` | 拖拽选区 |
| `controllers/keyboard.js` | `selectHightlightShow()` | 键盘移动选区 |
| `controllers/controlHistory.js` | `selectHightlightShow()` | 历史记录中恢复选区 |
| `controllers/updateCell.js` | `selectionCopyShow()` | 编辑单元格时 |
| `controllers/menuButton/paintFormat.js` | `paintModel()` | 格式刷操作 |
| `global/draw/drawMain.js` | 间接引用 | 绘制时读取选区信息 |
