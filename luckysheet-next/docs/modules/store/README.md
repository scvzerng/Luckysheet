# 状态管理模块（Store）迁移文档

> 本文档为 Luckysheet 状态管理模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

| 文件路径 | 核心职责 |
|---------|---------|
| `src/store/index.js` | 全局Store对象定义（100+属性） |
| `src/utils/storeAccess.js` | Store访问工具（getCurrentFile等） |
| `src/config.js` | 全局配置常量 |

---

## 2. 源文件逐一分析

### 2.1 store/index.js

**功能描述**: 全局Store对象。包含Luckysheet运行时的所有状态，是整个应用的状态中心。

**核心属性分类**:

#### 工作表数据

| 属性 | 类型 | 说明 |
|------|------|------|
| `flowdata` | `CellValue[][]` | 当前工作表数据 |
| `luckysheetfile` | `SheetFile[]` | 所有工作表文件 |
| `currentSheetIndex` | `string` | 当前工作表索引 |
| `visibledatarow` | `number[]` | 可见行位置数组 |
| `visibledatacolumn` | `number[]` | 可见列位置数组 |

#### 选区状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `luckysheet_select_save` | `Selection[]` | 当前选区 |
| `luckysheet_copy_save` | `CopyData` | 复制数据 |
| `luckysheet_paste_iscut` | `boolean` | 是否为剪切粘贴 |

#### 历史记录

| 属性 | 类型 | 说明 |
|------|------|------|
| `jfundo` | `HistoryAction[]` | undo栈 |
| `jfredo` | `HistoryAction[]` | redo栈 |

#### 配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `config` | `SheetConfig` | 当前工作表配置（行高、列宽、合并、隐藏等） |
| `defaultcolumnNum` | `number` | 默认列数 |
| `defaultrowNum` | `number` | 默认行数 |

#### 格式规则

| 属性 | 类型 | 说明 |
|------|------|------|
| `luckysheet_filter_save` | `FilterSave` | 筛选状态 |
| `luckysheet_alternateformat_save` | `AFRule[]` | 交替颜色规则 |

#### UI状态

| 属性 | 类型 | 说明 |
|------|------|------|
| `luckysheetCellUpdate` | `number[]` | 当前编辑单元格 [r, c] |
| `luckysheet_shiftpositon` | `ShiftPosition` | Shift选区位置 |
| `isEditMode` | `boolean` | 是否为编辑模式 |

**迁移映射表**:

| 旧属性 | 新架构 |
|--------|--------|
| `flowdata` | `SheetState.currentData: CellValue[][]` |
| `luckysheetfile` | `WorkbookState.sheets: SheetFile[]` |
| `currentSheetIndex` | `WorkbookState.activeSheetIndex: string` |
| `visibledatarow` | `LayoutState.visibleRowPositions: number[]` |
| `visibledatacolumn` | `LayoutState.visibleColumnPositions: number[]` |
| `luckysheet_select_save` | `SelectionState.selections: Selection[]` |
| `luckysheet_copy_save` | `ClipboardState.copyData: CopyData` |
| `jfundo` | `HistoryState.undoStack: HistoryAction[]` |
| `jfredo` | `HistoryState.redoStack: HistoryAction[]` |
| `config` | `SheetState.config: SheetConfig` |

---

### 2.2 utils/storeAccess.js

**功能描述**: Store访问工具。提供类型安全的Store访问方法，替代直接属性访问。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getCurrentFile()` | 获取当前工作表文件对象 |
| `getSheetFile(index)` | 获取指定工作表文件对象 |
| `getCurrentConfig()` | 获取当前工作表配置 |
| `getFlowdata()` | 获取当前工作表数据 |

**依赖**: Store

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `getCurrentFile()` | `WorkbookState.getActiveSheet(): SheetFile` |
| `getSheetFile(index)` | `WorkbookState.getSheet(index): SheetFile` |
| `getCurrentConfig()` | `SheetState.getConfig(): SheetConfig` |
| `getFlowdata()` | `SheetState.getCurrentData(): CellValue[][]` |

---

### 2.3 config.js

**功能描述**: 全局配置常量。

**核心常量**:

| 常量 | 值 | 说明 |
|------|---|------|
| `defaultrowNum` | 84 | 默认行数 |
| `defaultcolumnNum` | 60 | 默认列数 |
| `defaultrowlen` | 19 | 默认行高 |
| `defaultcollen` | 73 | 默认列宽 |
| `fontSizeList` | [...] | 字号列表 |
| `fontList` | [...] | 字体列表 |

**迁移映射表**:

| 旧常量 | 新架构 |
|--------|--------|
| `defaultrowNum` | `DEFAULT_CONFIG.ROW_COUNT` |
| `defaultcolumnNum` | `DEFAULT_CONFIG.COLUMN_COUNT` |
| `defaultrowlen` | `DEFAULT_CONFIG.ROW_HEIGHT` |
| `defaultcollen` | `DEFAULT_CONFIG.COLUMN_WIDTH` |
| `fontSizeList` | `FONT_CONFIG.SIZE_LIST` |
| `fontList` | `FONT_CONFIG.FAMILY_LIST` |

---

## 3. 新架构对应位置

```
src/
  store/
    StoreManager.ts                    # 主Store管理器
    WorkbookState.ts                   # 工作簿状态
    SheetState.ts                      # 工作表状态
    SelectionState.ts                  # 选区状态
    ClipboardState.ts                  # 剪贴板状态
    HistoryState.ts                    # 历史记录状态
    LayoutState.ts                     # 布局状态
    UIState.ts                         # UI状态
    constants.ts                       # 全局常量（替代config.js）
    types.ts                           # TypeScript接口定义
```

---

## 4. 迁移映射表

### 4.1 属性映射

| 旧属性 | 新类.属性 |
|--------|----------|
| `Store.flowdata` | `SheetState.currentData` |
| `Store.luckysheetfile` | `WorkbookState.sheets` |
| `Store.currentSheetIndex` | `WorkbookState.activeSheetIndex` |
| `Store.visibledatarow` | `LayoutState.visibleRowPositions` |
| `Store.visibledatacolumn` | `LayoutState.visibleColumnPositions` |
| `Store.luckysheet_select_save` | `SelectionState.selections` |
| `Store.luckysheet_copy_save` | `ClipboardState.copyData` |
| `Store.jfundo` | `HistoryState.undoStack` |
| `Store.jfredo` | `HistoryState.redoStack` |
| `Store.config` | `SheetState.config` |
| `Store.luckysheet_filter_save` | `SheetState.filterSave` |
| `Store.luckysheetCellUpdate` | `UIState.editingCell` |
| `Store.isEditMode` | `UIState.isEditMode` |

### 4.2 方法映射

| 旧函数 | 新类.方法 |
|--------|----------|
| `getCurrentFile()` | `WorkbookState.getActiveSheet(): SheetFile` |
| `getSheetFile(index)` | `WorkbookState.getSheet(index): SheetFile` |
| `getCurrentConfig()` | `SheetState.getConfig(): SheetConfig` |
| `getFlowdata()` | `SheetState.getCurrentData(): CellValue[][]` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 获取当前工作表 | getCurrentFile() | 返回当前活跃的SheetFile |
| 切换工作表 | 设置activeSheetIndex | getActiveSheet()返回新工作表 |
| 读写选区 | 设置selections | SelectionState.selections正确更新 |
| 读写历史 | push/pop undo栈 | HistoryState.undoStack正确更新 |
| 获取配置 | getConfig() | 返回当前工作表的SheetConfig |

---

## 6. 外部依赖方

**此模块被几乎所有其他模块依赖**，是最底层的模块。主要依赖方包括：

| 模块 | 依赖的属性/方法 |
|------|---------------|
| `formula` | `flowdata`, `currentSheetIndex`, `luckysheetfile` |
| `selection` | `luckysheet_select_save`, `luckysheet_copy_save` |
| `handler` | `luckysheetCellUpdate`, `isEditMode` |
| `rendering` | `flowdata`, `visibledatarow`, `visibledatacolumn` |
| `filter` | `luckysheet_filter_save`, `config` |
| `freezen` | `freezenhorizontaldata`, `freezenverticaldata` |
| `alternateformat` | `luckysheet_alternateformat_save` |
| `conditionformat` | `luckysheetfile` |
| `undo` | `jfundo`, `jfredo` |
