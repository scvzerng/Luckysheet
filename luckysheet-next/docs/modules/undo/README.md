# 撤销/重做模块（Undo）迁移文档

> 本文档为 Luckysheet 撤销/重做模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/controlHistory.js` | 历史记录控制器（undo/redo核心） |
| `src/global/refresh/refreshCore.js` | 刷新核心（含undo/redo刷新逻辑） |

---

## 2. 源文件逐一分析

### 2.1 controlHistory.js

**功能描述**: 历史记录控制器。管理undo/redo栈，支持多种操作类型的历史记录。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `controlHistory(obj)` | 记录历史操作 |
| `undo()` | 执行撤销 |
| `redo()` | 执行重做 |

**操作类型**:

| type值 | 操作 |
|--------|------|
| `updateCell` | 单元格更新 |
| `deleteCell` | 删除单元格 |
| `pasteCut` | 剪切粘贴 |
| `addRow` | 增加行 |
| `addColumn` | 增加列 |
| `deleteRow` | 删除行 |
| `deleteColumn` | 删除列 |
| `mergeCell` | 合并单元格 |
| `unmergeCell` | 取消合并 |
| `updateAF` | 更新交替颜色 |
| `updateCF` | 更新条件格式 |
| `addSheet` | 增加工作表 |
| `deleteSheet` | 删除工作表 |
| `sheetName` | 工作表重命名 |
| `hideSheet` | 隐藏工作表 |
| `showSheet` | 显示工作表 |
| `sortFilter` | 排序筛选 |
| `resizeRowCol` | 调整行列大小 |
| `frozen` | 冻结 |
| `dataVerification` | 数据验证 |

**依赖**: Store, sheetmanage, formula, conditionformat, alternateformat, selection, luckysheetrefreshgrid

**jQuery使用**: `$.extend()` 深拷贝

**数据结构**:
```js
Store.jfundo = []; // undo栈
Store.jfredo = []; // redo栈

// 历史记录项
{
    type: "updateCell",
    sheetIndex: "sheet_01",
    data: { ... },        // 操作数据（因类型而异）
    curdata: { ... },     // 当前状态
    srcdata: { ... },     // 源状态
    config: { ... },      // 配置快照
    config2: { ... },     // 配置快照2
    cdformat: { ... },    // 条件格式快照
    af: { ... },          // 交替颜色快照
}
```

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `controlHistory(obj)` | `HistoryService.record(action): void` |
| `undo()` | `HistoryService.undo(): void` |
| `redo()` | `HistoryService.redo(): void` |

---

### 2.2 refreshCore.js（undo/redo相关部分）

**功能描述**: 刷新核心中与undo/redo相关的逻辑。根据操作类型执行不同的刷新策略。

**关键函数**:

| 函数签名 | 功能 |
|---------|------|
| `jfrefreshgrid(data, range, params)` | 通用刷新（含undo/redo数据恢复） |
| `jfrefreshgridall(...)` | 全量刷新（含undo/redo数据恢复） |

**undo/redo恢复逻辑**:

undo时根据type恢复数据：
- `updateCell`: 恢复单元格数据和格式
- `addRow/deleteRow`: 恢复行数据和配置
- `addColumn/deleteColumn`: 恢复列数据和配置
- `mergeCell/unmergeCell`: 恢复合并状态
- `updateAF/updateCF`: 恢复格式规则
- `addSheet/deleteSheet`: 恢复工作表

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| undo恢复逻辑 | `HistoryRestorer.restore(action): void` |
| redo恢复逻辑 | `HistoryRestorer.reapply(action): void` |

---

## 3. 新架构对应位置

```
src/
  undo/
    HistoryService.ts                  # 主服务类（替代controlHistory.js）
    HistoryRestorer.ts                 # 历史恢复器（按type分发恢复逻辑）
    HistoryAction.ts                   # 操作类型定义
    types.ts                           # TypeScript接口定义
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `controlHistory(obj)` | `HistoryService.record(action): void` |
| `undo()` | `HistoryService.undo(): void` |
| `redo()` | `HistoryService.redo(): void` |
| undo恢复逻辑（按type分发） | `HistoryRestorer.restore(action): void` |
| redo恢复逻辑（按type分发） | `HistoryRestorer.reapply(action): void` |

**操作类型映射**:

| 旧type字符串 | 新枚举值 |
|-------------|---------|
| `"updateCell"` | `HistoryActionType.UPDATE_CELL` |
| `"deleteCell"` | `HistoryActionType.DELETE_CELL` |
| `"pasteCut"` | `HistoryActionType.PASTE_CUT` |
| `"addRow"` | `HistoryActionType.ADD_ROW` |
| `"addColumn"` | `HistoryActionType.ADD_COLUMN` |
| `"deleteRow"` | `HistoryActionType.DELETE_ROW` |
| `"deleteColumn"` | `HistoryActionType.DELETE_COLUMN` |
| `"mergeCell"` | `HistoryActionType.MERGE_CELL` |
| `"updateAF"` | `HistoryActionType.UPDATE_ALTERNATE_FORMAT` |
| `"updateCF"` | `HistoryActionType.UPDATE_CONDITION_FORMAT` |
| `"addSheet"` | `HistoryActionType.ADD_SHEET` |
| `"deleteSheet"` | `HistoryActionType.DELETE_SHEET` |
| `"sortFilter"` | `HistoryActionType.SORT_FILTER` |
| `"resizeRowCol"` | `HistoryActionType.RESIZE_ROW_COL` |
| `"frozen"` | `HistoryActionType.FROZEN` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 记录操作 | 修改单元格 | jfundo栈+1 |
| 撤销 | 修改后undo | 数据恢复到修改前 |
| 重做 | undo后redo | 数据恢复到修改后 |
| 连续撤销 | 3次修改后3次undo | 数据恢复到初始状态 |
| 边界：空栈 | 无操作时undo | 不执行任何操作 |
| 新操作清空redo | undo后新操作 | jfredo栈清空 |
| 多类型操作 | 混合操作类型 | 每种类型正确恢复 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `controllers/keyboard.js` | `undo()`, `redo()` | Ctrl+Z/Y快捷键 |
| `controllers/handler/bottomButtons.js` | `undo()`, `redo()` | 底部按钮 |
| `controllers/listener.js` | `Store.jfundo/jfredo` | 监听undo/redo状态 |
| `controllers/updateCell.js` | `controlHistory()` | 编辑后记录历史 |
| `controllers/selection/clipboardPaste.js` | `controlHistory()` | 粘贴后记录历史 |
| `controllers/rowColumnOperation/` | `controlHistory()` | 行列操作后记录历史 |
| `controllers/alternateformat/` | `controlHistory()` | 交替颜色变更后记录历史 |
| `controllers/conditionformat/` | `controlHistory()` | 条件格式变更后记录历史 |
| `controllers/sheetmanage/` | `controlHistory()` | 工作表操作后记录历史 |
| `controllers/filter/` | `controlHistory()` | 筛选后记录历史 |
