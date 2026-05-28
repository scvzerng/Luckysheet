# 行列操作模块（RowColumnOperation）迁移文档

> 本文档为 Luckysheet 行列操作模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/rowColumnOperation/index.js` | 模块入口 |
| `src/controllers/rowColumnOperation/deleteRowCol.js` | 删除行列 |
| `src/controllers/rowColumnOperation/rowHeaderEvents.js` | 行标题事件入口 |
| `src/controllers/rowColumnOperation/rowHeaderEvents/index.js` | 行标题事件子模块入口 |
| `src/controllers/rowColumnOperation/rowHeaderEvents/initAddRowColEvents.js` | 增加行列事件 |
| `src/controllers/rowColumnOperation/rowHeaderEvents/initColHeaderEvents.js` | 列标题事件 |
| `src/controllers/rowColumnOperation/rowHeaderEvents/initDeleteCellEvents.js` | 删除单元格事件 |
| `src/controllers/rowColumnOperation/rowHeaderEvents/initDeleteRowColEvents.js` | 删除行列事件 |
| `src/controllers/rowColumnOperation/rowHeaderEvents/initHideShowEvents.js` | 隐藏/显示行列事件 |
| `src/controllers/rowColumnOperation/rowHeaderEvents/initResizeEvents.js` | 调整大小事件 |
| `src/controllers/rowColumnOperation/rowHeaderEvents/initRowColWidthEvents.js` | 行列宽度事件 |
| `src/controllers/rowColumnOperation/rowHeaderEvents/initRowHeaderEvents.js` | 行标题事件 |

---

## 2. 源文件逐一分析

### 2.1 index.js

**导出**:
```js
export { rowColumnOperationInitial } from './rowHeaderEvents/index.js';
export { deleteRows, deleteColumns } from './deleteRowCol.js';
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `rowColumnOperationInitial` | `RowColumnOperationService.initialize(): void` |
| `deleteRows` | `RowColumnCRUDService.deleteRows(...): void` |
| `deleteColumns` | `RowColumnCRUDService.deleteColumns(...): void` |

---

### 2.2 deleteRowCol.js

**功能描述**: 删除行列操作。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `deleteRows(rowIndex, count)` | 删除行 |
| `deleteColumns(colIndex, count)` | 删除列 |

**依赖**: Store, formula, luckysheetrefreshgrid

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `deleteRows(rowIndex, count)` | `RowColumnCRUDService.deleteRows(rowIndex, count): void` |
| `deleteColumns(colIndex, count)` | `RowColumnCRUDService.deleteColumns(colIndex, count): void` |

---

### 2.3 rowHeaderEvents/（7个事件初始化文件）

**功能描述**: 行列标题栏的各种事件处理。

**通用模式**: 使用 `$(document).on()` 绑定事件

**迁移映射表**:

| 旧文件 | 新类 |
|--------|------|
| `initAddRowColEvents.js` | `RowColumnEventHandler.initAddEvents(): void` |
| `initColHeaderEvents.js` | `RowColumnEventHandler.initColHeaderEvents(): void` |
| `initDeleteCellEvents.js` | `RowColumnEventHandler.initDeleteCellEvents(): void` |
| `initDeleteRowColEvents.js` | `RowColumnEventHandler.initDeleteRowColEvents(): void` |
| `initHideShowEvents.js` | `RowColumnEventHandler.initHideShowEvents(): void` |
| `initResizeEvents.js` | `RowColumnEventHandler.initResizeEvents(): void` |
| `initRowColWidthEvents.js` | `RowColumnEventHandler.initWidthEvents(): void` |
| `initRowHeaderEvents.js` | `RowColumnEventHandler.initRowHeaderEvents(): void` |

---

## 3. 新架构对应位置

```
src/
  rowcolumnoperation/
    RowColumnOperationService.ts       # 主服务类
    RowColumnCRUDService.ts            # 增删操作
    RowColumnEventHandler.ts           # 事件处理
    types.ts
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `rowColumnOperationInitial()` | `RowColumnOperationService.initialize(): void` |
| `deleteRows(rowIndex, count)` | `RowColumnCRUDService.deleteRows(rowIndex, count): void` |
| `deleteColumns(colIndex, count)` | `RowColumnCRUDService.deleteColumns(colIndex, count): void` |
| 各init函数 | `RowColumnEventHandler.initialize(): void` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 删除行 | deleteRows(2, 1) | 第2行被删除，下方行上移 |
| 删除列 | deleteColumns(3, 2) | 第3-4列被删除 |
| 隐藏行 | 隐藏第2行 | 第2行不可见 |
| 调整行高 | 拖拽行边界 | 行高更新 |
| 调整列宽 | 拖拽列边界 | 列宽更新 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `src/core.js` | `rowColumnOperationInitial()` | 应用初始化 |
| `controllers/controlHistory.js` | 间接引用 | 历史记录 |
| `controllers/handler/rightClickButtons.js` | `deleteRows()`, `deleteColumns()` | 右键菜单 |
