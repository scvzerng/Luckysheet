# 剪贴板模块（Clipboard）迁移文档

> 本文档为 Luckysheet 剪贴板模块从旧架构迁移到新架构的完整指南。剪贴板模块从selection模块中独立出来，专注于复制/粘贴/剪切/格式刷功能。

---

## 1. 模块总览

### 1.1 旧架构文件清单

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/selection/clipboardCopy.js` | 复制功能（Ctrl+C） |
| `src/controllers/selection/clipboardPaste.js` | 粘贴功能（Ctrl+V） |
| `src/controllers/selection/clipboardCutPaste.js` | 剪切粘贴功能 |
| `src/controllers/selection/clipboardCopyPaste.js` | 复制粘贴协同处理 |
| `src/controllers/selection/clipboardPaintModel.js` | 格式刷功能 |
| `src/controllers/selection/htmlTableBuilder.js` | HTML表格构建器 |

### 1.2 旧架构核心问题

1. **与selection模块耦合**：剪贴板功能混在selection模块中
2. **jQuery重度依赖**：DOM操作、`$.extend`深拷贝
3. **全局Store直访**：直接读写 `Store.luckysheet_copy_save`、`Store.luckysheet_paste_iscut`
4. **条件格式范围拆分**：粘贴时需要处理条件格式的范围拆分

---

## 2. 源文件逐一分析

### 2.1 clipboardCopy.js

**功能描述**: 复制功能。将选区数据复制到内部存储和系统剪贴板。

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

### 2.2 clipboardPaste.js

**功能描述**: 粘贴功能。从系统剪贴板或内部存储读取数据，写入目标区域。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `paste(event)` | 执行粘贴操作 |
| `pasteHandler(data, range)` | 处理粘贴数据写入 |

**依赖**: Store, formula, conditionformat, alternateformat, menuButton, CFSplitRange

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `paste(event)` | `ClipboardService.paste(event): void` |
| `pasteHandler(data, range)` | `ClipboardService.pasteHandler(data, range): void` |

---

### 2.3 clipboardCutPaste.js

**功能描述**: 剪切粘贴。剪切后粘贴时清除源区域数据。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `cutPaste(event)` | 执行剪切粘贴 |

**依赖**: Store, conditionformat, alternateformat, CFSplitRange

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `cutPaste(event)` | `ClipboardService.cutPaste(event): void` |

---

### 2.4 clipboardCopyPaste.js

**功能描述**: 复制粘贴协同处理。处理跨工作表复制粘贴。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `copyPaste(sourceRange, targetRange)` | 执行跨表复制粘贴 |

**依赖**: Store, conditionformat, alternateformat, CFSplitRange

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `copyPaste(source, target)` | `ClipboardService.copyPaste(source, target): void` |

---

### 2.5 clipboardPaintModel.js

**功能描述**: 格式刷。仅复制格式（不含值）应用到目标区域。

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

### 2.6 htmlTableBuilder.js

**功能描述**: HTML表格构建器。将选区数据构建为HTML表格，用于复制到外部应用。

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

## 3. 新架构对应位置

```
src/
  clipboard/
    ClipboardService.ts                # 主服务类
    HtmlTableBuilder.ts                # HTML表格构建器
    types.ts                           # TypeScript接口定义
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

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 复制 | Ctrl+C | Store.luckysheet_copy_save被设置 |
| 粘贴文本 | 粘贴"hello" | 目标单元格值为"hello" |
| 粘贴HTML | 粘贴HTML表格 | 正确解析并写入 |
| 剪切粘贴 | Ctrl+X后Ctrl+V | 源区域清空，目标区域有数据 |
| 格式刷 | 选择源格式后应用到目标 | 目标格式与源一致，值不变 |
| HTML构建 | 3x3数据 | 生成table标签的HTML字符串 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `controllers/handler/pasteEvent.js` | `paste()` | 粘贴事件处理 |
| `controllers/handler/globalEvents.js` | `copy()` | 全局复制事件 |
| `controllers/menuButton/paintFormat.js` | `paintModel()` | 格式刷操作 |
| `controllers/controlHistory.js` | 间接引用 | 历史记录 |
