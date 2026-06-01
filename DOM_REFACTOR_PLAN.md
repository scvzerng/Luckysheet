# Luckysheet 命名重构计划

本文档包含两部分：
1. DOM ID/类名重构
2. 变量名/函数名重构

---

# 第一部分：DOM 命名重构

## 一、命名问题分析

### 1.1 不一致的命名风格

| 当前命名 | 引用次数 | 问题 | 建议改进 |
|---------|---------|------|---------|
| `luckysheet-cols-h-c` | 30 | 缩写不直观，`h-c` 含义不明 | `luckysheet-col-header` |
| `luckysheet-rows-h` | 40 | 缩写 `h` 不直观 | `luckysheet-row-header` |
| `luckysheet-cell-main` | 9 | 与实际功能不符（是交互层，不是单元格） | `luckysheet-grid-body` |
| `luckysheet-grid-window-1` | 4 | 数字后缀无意义 | `luckysheet-grid-viewport` |
| `luckysheet-left-top` | 7 | 描述性不足 | `luckysheet-corner-cell` |

### 1.2 混合命名风格（驼峰 + 下划线）

| 当前命名 | 引用次数 | 问题 | 建议改进 |
|---------|---------|------|---------|
| `luckysheetcoltable_0` | 1 | 驼峰 + 下划线混合 | `luckysheet-col-table` |
| `luckysheetrowHeader_0` | 2 | 驼峰 + 下划线混合 | `luckysheet-row-header-content` |
| `luckysheet-sheettable_0` | 4 | 下划线后缀无意义 | `luckysheet-sheet-table` |

### 1.3 语义不清

| 当前命名 | 引用次数 | 问题 | 建议改进 |
|---------|---------|------|---------|
| `luckysheet-wa-editor` | 18 | `wa` 含义不明（work-area?） | `luckysheet-toolbar` |
| `luckysheet-wa-calculate` | 27 | `wa` 含义不明 | `luckysheet-formula-bar` |
| `luckysheet_info_detail` | 50 | 下划线风格不一致 | `luckysheet-sheet-info` |
| `luckysheet-helpbox` | 10 | 不是帮助框，是公式输入框 | `luckysheet-formula-input` |
| `luckysheet-functionbox` | 14 | 与上面重复，实际是函数编辑区 | `luckysheet-function-input` |

---

## 二、DOM 命名映射表

| 旧 ID/类名 | 新 ID/类名 | 说明 |
|-------|-------|------|
| `luckysheet-cols-h-c` | `luckysheet-col-header` | 列标题容器 |
| `luckysheet-rows-h` | `luckysheet-row-header` | 行标题容器 |
| `luckysheet-cell-main` | `luckysheet-grid-body` | 网格主体（交互层） |
| `luckysheet-grid-window-1` | `luckysheet-grid-viewport` | 网格视口 |
| `luckysheet-left-top` | `luckysheet-corner-cell` | 左上角单元格 |
| `luckysheet-wa-editor` | `luckysheet-toolbar` | 工具栏 |
| `luckysheet-wa-calculate` | `luckysheet-formula-bar` | 公式栏 |
| `luckysheet_info_detail` | `luckysheet-sheet-info` | Sheet 信息栏 |
| `luckysheet-helpbox` | `luckysheet-formula-input` | 公式输入框 |
| `luckysheet-functionbox` | `luckysheet-function-input` | 函数输入框 |
| `luckysheetcoltable_0` | `luckysheet-col-table` | 列表格 |
| `luckysheetrowHeader_0` | `luckysheet-row-header-content` | 行标题内容 |
| `luckysheet-sheettable_0` | `luckysheet-sheet-table` | Sheet 表格 |

---

# 第二部分：变量名与函数名重构

## 一、Store 变量命名问题

### 1.1 缩写不清晰

| 当前命名 | 问题 | 建议改进 |
|---------|------|---------|
| `ch_width` | `ch` 含义不明（column header?） | `colHeaderWidth` |
| `rh_height` | `rh` 含义不明（row header?） | `rowHeaderHeight` |
| `flowdata` | 含义不清 | `sheetData` |
| `jfcountfuncTimeout` | `jf` 前缀含义不明 | `functionCountTimeout` |
| `jfautoscrollTimeout` | `jf` 前缀含义不明 | `autoScrollTimeout` |
| `jfundo` / `jfredo` | `jf` 前缀含义不明 | `undoStack` / `redoStack` |

### 1.2 命名冗余

| 当前命名 | 问题 | 建议改进 |
|---------|------|---------|
| `luckysheet_select_save` | `luckysheet` 前缀冗余 | `selections` |
| `luckysheet_filter_save` | `luckysheet` 前缀冗余 | `filterState` |
| `luckysheet_select_status` | `luckysheet` 前缀冗余 | `isSelecting` |
| `luckysheet_copy_save` | `luckysheet` 前缀冗余 | `copyState` |
| `luckysheet_sheet_move_status` | 命名过长 | `isSheetMoving` |
| `luckysheet_scroll_status` | 命名过长 | `isScrolling` |
| `luckysheet_rows_selected_status` | 命名过长 | `isRowHeaderSelected` |
| `luckysheet_cols_selected_status` | 命名过长 | `isColHeaderSelected` |

### 1.3 风格不一致

| 当前命名 | 问题 | 建议改进 |
|---------|------|---------|
| `cellmainWidth` | 驼峰但语义不清 | `gridBodyWidth` |
| `cellmainHeight` | 驼峰但语义不清 | `gridBodyHeight` |
| `defaultcolumnNum` | 驼峰风格 | `defaultColumnCount` |
| `defaultrowNum` | 驼峰风格 | `defaultRowCount` |
| `defaultcollen` | 全小写，风格不一致 | `defaultColumnWidth` |
| `defaultrowlen` | 全小写，风格不一致 | `defaultRowHeight` |

---

## 二、函数命名问题

### 2.1 全小写无驼峰

| 当前命名 | 问题 | 建议改进 |
|---------|------|---------|
| `luckysheetscrollevent` | 全小写，无驼峰 | `handleScrollEvent` |
| `luckysheetrefreshgrid` | 全小写，无驼峰 | `refreshGrid` |
| `luckysheetcreatedom` | 全小写，无驼峰 | `createDom` |
| `luckysheetsizeauto` | 全小写，无驼峰 | `autoResize` |
| `luckysheetupdateCell` | 前缀冗余 | `updateCell` |
| `luckysheetactiveCell` | 前缀冗余 | `activateCell` |

### 2.2 缩写不清晰

| 当前命名 | 问题 | 建议改进 |
|---------|------|---------|
| `rhchInit` | `rhch` 含义不明 | `initRowColHeader` |
| `getrangeseleciton` | 拼写错误 + 全小写 | `getRangeSelection` |
| `luckysheet_count_show` | 下划线风格不一致 | `showCountIndicator` |

### 2.3 前缀冗余

| 当前命名 | 问题 | 建议改进 |
|---------|------|---------|
| `luckysheetDrawMain` | `luckysheet` 前缀冗余 | `drawMain` |
| `luckysheetDrawgridRowTitle` | 前缀冗余 + 大小写不一致 | `drawRowTitle` |
| `luckysheetDrawgridColumnTitle` | 前缀冗余 + 大小写不一致 | `drawColumnTitle` |
| `luckysheetMoveEndCell` | 前缀冗余 | `moveToEndCell` |
| `luckysheetMoveHighlightCell` | 前缀冗余 | `moveHighlightCell` |
| `luckysheetextendtable` | 前缀冗余 + 全小写 | `extendTable` |
| `luckysheetdeletetable` | 前缀冗余 + 全小写 | `deleteTable` |
| `luckysheetDeleteCell` | 前缀冗余 | `deleteCells` |

---

## 三、局部变量命名问题

### 3.1 单字母变量（高频出现）

| 变量 | 出现场景 | 建议改进 |
|------|---------|---------|
| `t` | 临时变量、target | `target` / `element` / `item` |
| `e` | 事件对象 | `event` |
| `a` | 数组、临时变量 | `arr` / `result` / `items` |
| `s` | 字符串、临时变量 | `str` / `text` / `value` |
| `n` | 数字、数量 | `count` / `num` / `total` |
| `r` | 返回值、矩形 | `result` / `rect` |

### 3.2 常见缩写变量

| 当前命名 | 问题 | 建议改进 |
|---------|------|---------|
| `st` | start 缩写 | `start` / `startIndex` |
| `ed` | end 缩写 | `end` / `endIndex` |
| `len` | length 缩写 | `length` / `count` |
| `idx` | index 缩写 | `index` |
| `arr` | array 缩写 | 可接受，但建议用更具体的名称 |
| `obj` | object 缩写 | 用更具体的类型名称 |
| `val` | value 缩写 | `value` |
| `txt` | text 缩写 | `text` |
| `str` | string 缩写 | 可接受 |
| `num` | number 缩写 | `number` / `count` |
| `pos` | position 缩写 | `position` |
| `cur` | current 缩写 | `current` |
| `prev` | previous 缩写 | 可接受 |
| `next` | next 缩写 | 可接受 |

---

## 四、命名规范建议

### 4.1 变量命名规范

```
// 布尔值：is/has/should 前缀
isSelecting
hasFilter
shouldRefresh

// 数组：复数形式或 List 后缀
selections
rowList

// 对象：单数形式，语义清晰
cellStyle
sheetConfig

// 数字：count/size/width/height/length 后缀
rowCount
gridWidth

// DOM 元素：element/el 后缀或 $ 前缀
cellElement
$container

// 事件处理器：handle/on 前缀
handleClick
onScroll
```

### 4.2 函数命名规范

```
// 获取：get 前缀
getSelection()
getCellData()

// 设置：set 前缀
setSelection()
setCellValue()

// 创建：create 前缀
createDom()
createCanvas()

// 更新：update 前缀
updateCell()
refreshGrid()

// 删除：delete/remove 前缀
deleteRow()
removeSelection()

// 检查：is/has/can 前缀
isSelected()
hasFilter()
canEdit()

// 事件处理：handle/on 前缀
handleMouseDown()
onScroll()
```

---

## 五、涉及文件清单

### 5.1 Store 文件

| 文件 | 需修改项 |
|------|---------|
| `src/store/index.js` | 约 40 个变量名 |

### 5.2 核心函数文件

| 文件 | 需修改项 |
|------|---------|
| `src/global/rhchInit.js` | 函数名 `rhchInit` |
| `src/global/scroll.js` | 函数名 `luckysheetscrollevent` |
| `src/global/createdom.js` | 函数名 `luckysheetcreatedom` |
| `src/global/refresh/refreshCanvas.js` | 函数名 `luckysheetrefreshgrid` |
| `src/controllers/resize.js` | 函数名 `luckysheetsizeauto` |
| `src/controllers/updateCell.js` | 函数名 `luckysheetupdateCell` |
| `src/global/draw/drawMain.js` | 函数名 `luckysheetDrawMain` |
| `src/global/draw/drawTitle.js` | 函数名 `luckysheetDrawgridRowTitle` 等 |

### 5.3 局部变量修改（按优先级）

**高优先级**（单字母变量，影响可读性）：
- `src/controllers/filter/filterMenuEvents.js` - 多处 `t`, `e`
- `src/global/formula/dependency.js` - 多处 `t`, `s`, `arr`
- `src/plugins/js/sPage.js` - 多处 `t`, `e`, `a`, `s`, `n`

**中优先级**（缩写变量）：
- 约 50 个文件中的 `st`, `ed`, `len`, `idx`, `val`, `txt` 等

---

## 六、执行计划

### 阶段 A：Store 变量重构

**优先级：最高** - Store 是全局状态中心

1. 修改 `src/store/index.js`
   - 重命名所有变量
   - 预计修改：40 处

2. 全局搜索替换所有 Store 变量引用
   - 预计修改：200+ 处

### 阶段 B：核心函数重命名

**优先级：高**

1. 重命名导出函数
2. 更新所有 import 和调用
   - 预计修改：50 处

### 阶段 C：局部变量优化

**优先级：中**

1. 单字母变量 → 语义化名称
2. 缩写变量 → 完整单词
   - 预计修改：300+ 处

### 阶段 D：验证与测试

1. 运行构建 `npm run build`
2. 启动开发服务器 `npm run dev`
3. 完整功能测试

---

## 七、风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Store 变量遗漏 | 运行时错误 | 全局搜索每个旧变量名 |
| 函数名遗漏 | 构建失败 | TypeScript/ESLint 检查未定义引用 |
| 变量作用域冲突 | 逻辑错误 | 逐个函数检查，确保不引入冲突 |

---

## 八、预计工作量

| 阶段 | 文件数 | 修改处数 | 预计时间 |
|------|--------|---------|---------|
| 阶段 A | 50+ | 240+ | 60 分钟 |
| 阶段 B | 20+ | 50+ | 20 分钟 |
| 阶段 C | 50+ | 300+ | 90 分钟 |
| 阶段 D | - | - | 20 分钟 |
| **合计** | **100+** | **600+** | **190 分钟** |

---

## 九、执行策略

**重要原则**：不使用批量处理，按元素逐个处理。每个元素处理完成后，验证构建并提交。

### 处理流程（以单个元素为例）

```
元素：luckysheet-cols-h-c → luckysheet-col-header

1. 修改模板定义（gridTemplate.js）
2. 修改所有 JS 文件中的引用
3. 修改所有 CSS 文件中的引用
4. 运行 npm run build 验证
5. git commit -m "refactor: rename luckysheet-cols-h-c to luckysheet-col-header"
6. 继续下一个元素
```

### DOM 重构执行顺序（按元素）

| 序号 | 旧命名 | 新命名 | 预计引用数 |
|------|--------|--------|-----------|
| 1 | `luckysheet-cols-h-c` | `luckysheet-col-header` | 30 |
| 2 | `luckysheet-rows-h` | `luckysheet-row-header` | 40 |
| 3 | `luckysheet-cell-main` | `luckysheet-grid-body` | 9 |
| 4 | `luckysheet-grid-window-1` | `luckysheet-grid-viewport` | 4 |
| 5 | `luckysheet-left-top` | `luckysheet-corner-cell` | 7 |
| 6 | `luckysheet-wa-editor` | `luckysheet-toolbar` | 18 |
| 7 | `luckysheet-wa-calculate` | `luckysheet-formula-bar` | 27 |
| 8 | `luckysheet_info_detail` | `luckysheet-sheet-info` | 50 |
| 9 | `luckysheet-helpbox` | `luckysheet-formula-input` | 10 |
| 10 | `luckysheet-functionbox` | `luckysheet-function-input` | 14 |
| 11 | `luckysheetcoltable_0` | `luckysheet-col-table` | 1 |
| 12 | `luckysheetrowHeader_0` | `luckysheet-row-header-content` | 2 |
| 13 | `luckysheet-sheettable_0` | `luckysheet-sheet-table` | 4 |

### 变量重构执行顺序（按变量）

| 序号 | 旧命名 | 新命名 | 预计引用数 |
|------|--------|--------|-----------|
| 1 | `Store.ch_width` | `Store.colHeaderWidth` | 20+ |
| 2 | `Store.rh_height` | `Store.rowHeaderHeight` | 20+ |
| 3 | `Store.flowdata` | `Store.sheetData` | 100+ |
| ... | ... | ... | ... |

---

## 十、执行确认

请确认以下事项后开始执行：

- [ ] 已阅读并理解本计划
- [ ] 已备份代码或创建新分支
- [ ] 同意按元素逐个处理（不使用批量处理）
- [ ] 同意每个元素处理完成后进行 git commit

**建议**：由于变量名/函数名重构涉及范围广、风险高，建议：
1. 先完成 DOM 命名重构（第一部分）
2. 验证无问题后，再进行变量名/函数名重构（第二部分）

**确认方式**：回复"开始执行 DOM 重构"或"开始执行变量重构"开始对应部分。
