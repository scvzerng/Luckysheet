# API模块迁移文档

> 本文档为 Luckysheet API模块从旧架构迁移到新架构的完整指南。API模块是面向外部开发者的公共接口层。

---

## 1. 模块总览

| 文件路径 | 核心职责 |
|---------|---------|
| `src/global/api/index.js` | API入口，导出所有公开API |
| `src/global/api/rangeRead.js` | 范围读取API（getCellValue等） |
| `src/global/api/cellOperation.js` | 单元格操作API（setCellValue等） |
| `src/global/api/sheet.js` | 工作表API（getSheet等） |
| `src/global/api/selection.js` | 选区API（getRange等） |
| `src/global/api/format.js` | 格式API（setCellFormat等） |
| `src/global/api/merge.js` | 合并API（mergeCells等） |
| `src/global/api/rowColumn.js` | 行列API（insertRow等） |
| `src/global/api/freeze.js` | 冻结API（setHorizontalFrozen等） |
| `src/global/api/filter.js` | 筛选API（setRangeFilter等） |
| `src/global/api/alternateFormat.js` | 交替颜色API |
| `src/global/api/conditionFormat.js` | 条件格式API |
| `src/global/api/dataVerification.js` | 数据验证API |
| `src/global/api/searchReplace.js` | 搜索替换API |
| `src/global/api/chart.js` | 图表API |
| `src/global/api/print.js` | 打印API |
| `src/global/api/comment.js` | 批注API |
| `src/global/api/image.js` | 图片API |
| `src/global/api/data.js` | 数据API（loadData等） |
| `src/global/api/common.js` | 通用API（destroy等） |
| `src/core.js` | 核心入口（初始化、API挂载） |
| `src/index.js` | 包入口（导出luckysheet对象和API） |

---

## 2. 源文件逐一分析

### 2.1 global/api/index.js

**功能描述**: API入口，导出所有公开API函数。

**导出**:
```js
export { getCellValue, getCellValues } from './rangeRead';
export { setCellValue, setCellValues } from './cellOperation';
export { getSheet, getAllSheets, setSheetActive } from './sheet';
export { getRange, getRangeValue, setRangeShow } from './selection';
export { setCellFormat } from './format';
export { mergeCells, unmergeCells, getCellsByMerge } from './merge';
export { insertRow, insertColumn, deleteRow, deleteColumn } from './rowColumn';
export { setHorizontalFrozen, setVerticalFrozen } from './freeze';
export { setRangeFilter } from './filter';
export { setAlternateFormat, removeAlternateFormat } from './alternateFormat';
export { setConditionFormat, removeConditionFormat } from './conditionFormat';
// ... 更多API
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| 所有API函数 | `LuckysheetAPI` 类的静态方法 |

---

### 2.2 rangeRead.js

**功能描述**: 范围读取API。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getCellValue(row, col, options)` | 获取单元格值 |
| `getCellValues(range)` | 获取范围值 |

**依赖**: Store, formula

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `getCellValue(row, col, options)` | `CellAPI.getValue(row, col, options): CellValue` |
| `getCellValues(range)` | `CellAPI.getValues(range): CellValue[][]` |

---

### 2.3 cellOperation.js

**功能描述**: 单元格操作API。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `setCellValue(row, col, value, options)` | 设置单元格值 |
| `setCellValues(values, range)` | 批量设置单元格值 |
| `clearCell(row, col)` | 清空单元格 |
| `deleteCell(row, col, type)` | 删除单元格 |

**依赖**: Store, formula, luckysheetrefreshgrid

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `setCellValue(row, col, value, options)` | `CellAPI.setValue(row, col, value, options): void` |
| `setCellValues(values, range)` | `CellAPI.setValues(values, range): void` |
| `clearCell(row, col)` | `CellAPI.clear(row, col): void` |
| `deleteCell(row, col, type)` | `CellAPI.delete(row, col, type): void` |

---

### 2.4 sheet.js

**功能描述**: 工作表API。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getSheet(index)` | 获取工作表 |
| `getAllSheets()` | 获取所有工作表 |
| `setSheetActive(index)` | 设置活跃工作表 |
| `addSheet(options)` | 添加工作表 |
| `deleteSheet(index)` | 删除工作表 |
| `setSheetName(name)` | 设置工作表名称 |

**依赖**: Store, sheetmanage

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `getSheet(index)` | `SheetAPI.get(index): SheetFile` |
| `getAllSheets()` | `SheetAPI.getAll(): SheetFile[]` |
| `setSheetActive(index)` | `SheetAPI.setActive(index): void` |
| `addSheet(options)` | `SheetAPI.add(options): void` |
| `deleteSheet(index)` | `SheetAPI.delete(index): void` |

---

### 2.5 selection.js

**功能描述**: 选区API。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getRange()` | 获取当前选区 |
| `getRangeValue(options)` | 获取选区值 |
| `setRangeShow(range, options)` | 设置选区显示 |

**依赖**: Store, selection

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `getRange()` | `SelectionAPI.getRange(): CellRange[]` |
| `getRangeValue(options)` | `SelectionAPI.getRangeValue(options): CellValue[][]` |
| `setRangeShow(range, options)` | `SelectionAPI.setRangeShow(range, options): void` |

---

### 2.6 format.js

**功能描述**: 格式API。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `setCellFormat(row, col, attr, value)` | 设置单元格格式 |

**依赖**: Store, menuButton, luckysheetrefreshgrid

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `setCellFormat(row, col, attr, value)` | `FormatAPI.setCellFormat(row, col, attr, value): void` |

---

### 2.7 merge.js

**功能描述**: 合并API。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `mergeCells(range, type)` | 合并单元格 |
| `unmergeCells(range)` | 取消合并 |
| `getCellsByMerge(range)` | 获取合并区域内的单元格 |

**依赖**: Store, menuButton

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `mergeCells(range, type)` | `MergeAPI.merge(range, type): void` |
| `unmergeCells(range)` | `MergeAPI.unmerge(range): void` |
| `getCellsByMerge(range)` | `MergeAPI.getCellsByMerge(range): CellRange[]` |

---

### 2.8 rowColumn.js

**功能描述**: 行列API。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `insertRow(row, count)` | 插入行 |
| `insertColumn(col, count)` | 插入列 |
| `deleteRow(row, count)` | 删除行 |
| `deleteColumn(col, count)` | 删除列 |

**依赖**: Store, rowColumnOperation

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `insertRow(row, count)` | `RowColumnAPI.insertRow(row, count): void` |
| `insertColumn(col, count)` | `RowColumnAPI.insertColumn(col, count): void` |
| `deleteRow(row, count)` | `RowColumnAPI.deleteRow(row, count): void` |
| `deleteColumn(col, count)` | `RowColumnAPI.deleteColumn(col, count): void` |

---

### 2.9 core.js

**功能描述**: 核心入口。初始化Luckysheet，挂载API到全局对象。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `luckysheet.create(settings)` | 创建Luckysheet实例 |
| `luckysheet.destroy()` | 销毁实例 |

**依赖**: 所有模块

**jQuery使用**: `$(selector).append()`, `$.extend()` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `luckysheet.create(settings)` | `LuckysheetApplication.create(settings): void` |
| `luckysheet.destroy()` | `LuckysheetApplication.destroy(): void` |

---

### 2.10 index.js

**功能描述**: 包入口。导出luckysheet全局对象。

**导出**:
```js
export { luckysheet };
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `luckysheet` (全局对象) | `LuckysheetApplication` 类实例 |

---

## 3. 新架构对应位置

```
src/
  api/
    LuckysheetAPI.ts                   # API总入口
    CellAPI.ts                         # 单元格API
    SheetAPI.ts                        # 工作表API
    SelectionAPI.ts                    # 选区API
    FormatAPI.ts                       # 格式API
    MergeAPI.ts                        # 合并API
    RowColumnAPI.ts                    # 行列API
    FreezeAPI.ts                       # 冻结API
    FilterAPI.ts                       # 筛选API
    AlternateFormatAPI.ts              # 交替颜色API
    ConditionFormatAPI.ts              # 条件格式API
    DataVerificationAPI.ts             # 数据验证API
    SearchReplaceAPI.ts                # 搜索替换API
    ChartAPI.ts                        # 图表API
    PrintAPI.ts                        # 打印API
    CommentAPI.ts                      # 批注API
    ImageAPI.ts                        # 图片API
    DataAPI.ts                         # 数据API
    CommonAPI.ts                       # 通用API
    types.ts                           # TypeScript接口定义
  LuckysheetApplication.ts             # 应用入口（替代core.js + index.js）
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `getCellValue(row, col, options)` | `CellAPI.getValue(row, col, options): CellValue` |
| `setCellValue(row, col, value, options)` | `CellAPI.setValue(row, col, value, options): void` |
| `getSheet(index)` | `SheetAPI.get(index): SheetFile` |
| `getAllSheets()` | `SheetAPI.getAll(): SheetFile[]` |
| `setSheetActive(index)` | `SheetAPI.setActive(index): void` |
| `getRange()` | `SelectionAPI.getRange(): CellRange[]` |
| `setCellFormat(row, col, attr, value)` | `FormatAPI.setCellFormat(row, col, attr, value): void` |
| `mergeCells(range, type)` | `MergeAPI.merge(range, type): void` |
| `insertRow(row, count)` | `RowColumnAPI.insertRow(row, count): void` |
| `setHorizontalFrozen(row)` | `FreezeAPI.freezeRow(row): void` |
| `setRangeFilter(range)` | `FilterAPI.setRange(range): void` |
| `luckysheet.create(settings)` | `LuckysheetApplication.create(settings): void` |
| `luckysheet.destroy()` | `LuckysheetApplication.destroy(): void` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 获取单元格值 | getCellValue(0, 0) | 返回A1的值 |
| 设置单元格值 | setCellValue(0, 0, "hello") | A1值变为"hello" |
| 获取工作表 | getSheet(0) | 返回第一个工作表 |
| 切换工作表 | setSheetActive(1) | 当前工作表切换 |
| 获取选区 | getRange() | 返回当前选区范围 |
| 设置格式 | setCellFormat(0, 0, "bl", 1) | A1变为粗体 |
| 合并单元格 | mergeCells([{row:[0,1],column:[0,1]}]) | 合并A1:B2 |
| 插入行 | insertRow(2, 3) | 在第2行插入3行 |
| 冻结行 | setHorizontalFrozen(3) | 前3行冻结 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| 外部开发者 | 所有API | 通过API操作表格 |
| `src/index.js` | `luckysheet` 全局对象 | 包入口导出 |
| 单元测试 | 所有API | 集成测试 |
