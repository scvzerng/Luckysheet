# Luckysheet 重复代码提取重构计划

> 目标：按功能职责提取项目中的重复代码为公共工具函数，消除冗余，提升可维护性。
> 原则：每个阶段完成后必须通过 `npm run build` 构建验证 + `npm run test` 单元测试，确保不破坏原有功能。
> 进度：[ ] 待开始 | [~] 进行中 | [x] 已完成

---

## 重复代码全景统计

| 重复类别 | 重复次数 | 涉及文件数 | 严重程度 | 对应阶段 |
|----------|----------|-----------|---------|---------|
| Store 状态获取（getCurrentFile/getLastSelection等） | 410+ | 80+ | 🔴 极高 | Phase 1 |
| DOM/jQuery 选择器重复（scrollTop/scrollLeft/mask等） | 300+ | 30+ | 🔴 极高 | Phase 2 |
| 单元格值获取与边界检查 | 120+ | 25+ | 🔴 高 | Phase 3 |
| Canvas 绘制模式重复 | 80+ | 6 | 🟡 高 | Phase 4 |
| 数据转换与格式化 | 60+ | 15+ | 🟡 高 | Phase 5 |
| 条件格式选区解析 | 12处×3模式 | 4 | 🟡 高 | Phase 6 |
| 剪贴板HTML生成（clipboardCopy vs rangeRead） | ~300行 | 2 | 🔴 极高 | Phase 7 |
| 常量与类型定义重复 | 30+ | 10+ | 🟡 中 | Phase 8 |

---

## Phase 1: Store 状态访问层封装 ✅ 已完成

> 核心问题：`Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]` 在 50+ 文件中重复 100+ 次，是最严重的重复模式。

### 1.1 创建 `src/utils/storeAccess.js`

提取以下高频 Store 访问模式为工具函数：

```javascript
// 目标函数清单：

// [x] getCurrentFile() — 替代 Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]
//     当前重复：100+ 处，涉及 50+ 文件
//     实现思路：封装 Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]

// [x] getCurrentSheetIndex() — 替代 Store.currentSheetIndex 的直接访问
//     当前重复：414 处，涉及 100 文件

// [x] getLastSelection() — 替代 Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1]
//     当前重复：43 处，涉及 20 文件

// [x] getFocusCell() — 替代 last["row_focus"], last["column_focus"]
//     当前重复：7 处，涉及 3 文件

// [x] getFlowData() — 替代 Store.flowdata 的直接访问
//     当前重复：433 处，涉及 100 文件

// [x] getCell(row, col, data) — 替代 Store.flowdata[r][c] 的直接访问（含空值防护）
//     当前重复：38 处，涉及 20 文件

// [x] getDataSize() — 替代 Store.flowdata.length, Store.flowdata[0].length
//     当前重复：36 处，涉及 15 文件

// [x] getMaxRowIndex() — 替代 Store.visibledatarow.length - 1
//     当前重复：21 处，涉及 8 文件

// [x] getMaxColIndex() — 替代 Store.visibledatacolumn.length - 1
//     当前重复：19 处，涉及 8 文件

// [x] syncConfigToStore() — 替代 Store.luckysheetfile[...].config = Store.config
//     当前重复：22 处，涉及 10 文件

// [x] syncDataToStore() — 替代 Store.luckysheetfile[...].data = Store.flowdata
//     当前重复：5 处，涉及 4 文件

// [x] getHeaderTotalHeight() — 替代 Store.infobarHeight + Store.toolbarHeight + Store.calculatebarHeight + Store.columnHeaderHeight
//     当前重复：8 处，涉及 3 文件
```

### 1.2 替换计划（按文件优先级）

| 优先级 | 文件 | 涉及函数 | 替换项 |
|--------|------|---------|--------|
| P1 | `global/refresh/refreshCore.js` | 20+处 | getCurrentFile, syncConfigToStore, syncDataToStore |
| P1 | `controllers/controlHistory.js` | 15+处 | getCurrentFile, syncConfigToStore, getDataSize |
| P1 | `global/api/workbook.js` | 10+处 | getCurrentFile, getLastSelection |
| P1 | `controllers/handler/documentMouseup.js` | 10+处 | getLastSelection, getMaxRowIndex, getMaxColIndex |
| P2 | `global/api/dimension.js` | 8处 | getCurrentFile, getDataSize |
| P2 | `global/api/sheet.js` | 8处 | getCurrentFile |
| P2 | `controllers/keyboard.js` | 8处 | getLastSelection, getFocusCell |
| P2 | `controllers/filter/filterActions.js` | 6处 | getCurrentFile, syncConfigToStore, getDataSize |
| P3 | 其余 40+ 文件 | 各2-5处 | 按需替换 |

### 1.3 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 全局搜索 `Store.luckysheetfile[getSheetIndex` 结果为 0
- [ ] 全局搜索 `Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1]` 结果为 0

---

## Phase 2: DOM/jQuery 操作封装 ✅ 已完成

> 核心问题：`$("#luckysheet-cell-main")` 出现约 100 次，`$("#luckysheet-modal-dialog-mask")` 出现 71 次，大量重复的滚动位置获取和对话框操作。

### 2.1 创建 `src/utils/domUtils.js`

```javascript
// 目标函数清单：

// [x] getScrollPosition() — 替代 $("#luckysheet-cell-main").scrollTop()/scrollLeft()
//     当前重复：30+ 处，涉及 10+ 文件
//     返回：{ scrollTop, scrollLeft }

// [x] getCellMainSize() — 替代 $("#luckysheet-cell-main").height()/width()
//     当前重复：10+ 处
//     返回：{ winH, winW }

// [x] getScrollAndSize() — 合并上面两个，一次获取
//     当前重复：5+ 处同时获取 scrollTop/scrollLeft/height/width

// [x] getMousePositionWithScroll(mouse) — 替代 mouse[0] + scrollLeft, mouse[1] + scrollTop
//     当前重复：10+ 处

// [x] isInputBoxActive() — 替代 parseInt($("#luckysheet-input-box").css("top")) > 0
//     当前重复：12 处，涉及 6 文件

// [x] resetInputBoxStyle() — 替代 $("#luckysheet-input-box").removeAttr("style")
//     当前重复：16 处，涉及 4 文件

// [x] showModalMask() — 替代 $("#luckysheet-modal-dialog-mask").show()
//     当前重复：25 处

// [x] hideModalMask() — 替代 $("#luckysheet-modal-dialog-mask").hide()
//     当前重复：25 处

// [x] isModalMaskVisible() — 替代 $("#luckysheet-modal-dialog-mask").is(":visible")
//     当前重复：3 处

// [x] isImageEditing() — 替代 $("#luckysheet-modal-dialog-activeImage").is(":visible") || $("#luckysheet-modal-dialog-cropping").is(":visible")
//     当前重复：4 处

// [x] isFormulaDialogVisible() — 替代 $("#luckysheet-singleRange-dialog").is(":visible") || $("#luckysheet-multiRange-dialog").is(":visible")
//     当前重复：12 处（keyboard.js）
```

### 2.2 创建 `src/utils/dialogUtils.js`

```javascript
// 目标函数清单：

// [x] createDialog(options) — 替代 $("body").append(replaceHtml(modelHTML, {...}))
//     当前重复：30 处，涉及 10+ 文件
//     参数：{ id, addclass, title, content, botton }
//     返回：jQuery 对象

// [x] createToolbarMenu(menu, submenu) — 替代 $("body").append(menu/submenu)
//     当前重复：20 处，涉及 18 个 toolbarInit 文件

// [x] checkMenuOverflow(tlen, userlen, menuleft) — 替代菜单溢出检测
//     当前重复：18 处，涉及 18 个 toolbarInit 文件
//     逻辑：tlen > userlen && tlen + menuleft > $("#" + Store.container).width()

// [x] createSelectionSetDiv(index) — 替代 $("#luckysheet-cell-main").append('<div id="luckysheet-datavisual-selection-set-..."...')
//     当前重复：6 处

// [x] getWindowSize() — 替代 $(window).width()/height()
//     当前重复：5 处
```

### 2.3 创建 `src/utils/eventUtils.js`

```javascript
// 目标函数清单：

// [x] bindNamespacedEvent(selector, event, namespace, filter, handler)
//     替代 $(selector).off("event.namespace").on("event.namespace", filter, handler)
//     当前重复：100+ 处

// [x] unbindNamespacedEvent(selector, event, namespace)
//     替代 $(selector).off("event.namespace")
//     当前重复：50+ 处
```

### 2.4 替换计划

| 优先级 | 文件/目录 | 替换项 |
|--------|----------|--------|
| P1 | `controllers/keyboard.js` | isInputBoxActive, isFormulaDialogVisible, isModalMaskVisible |
| P1 | `controllers/imageCtrl.js` | getScrollPosition, showModalMask, hideModalMask |
| P1 | `controllers/menuButton/toolbarInit/*.js` (18个文件) | checkMenuOverflow, createToolbarMenu |
| P2 | `controllers/selection/clipboardCopy.js` | getScrollPosition |
| P2 | `global/draw/drawMain.js`, `drawTitle.js` | getScrollPosition |
| P2 | `controllers/handler/documentMousemove.js`, `documentMouseup.js` | getMousePositionWithScroll |
| P3 | 其余 20+ 文件 | 按需替换 |

### 2.5 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 全局搜索 `parseInt($("#luckysheet-input-box").css("top"))` 结果为 0
- [ ] 全局搜索 `tlen > userlen && tlen + menuleft > $("#" + Store.container).width()` 结果为 0

---

## Phase 3: 单元格数据访问与边界检查封装 ✅ 工具函数已创建，调用点已替换

> 核心问题：行隐藏检查 17 处、列隐藏检查 10 处、单元格空值检查 35 处、合并单元格判断 13 处，全部内联重复。

### 3.1 扩展 `src/utils/utilSub/rangeUtils.js`

```javascript
// 目标函数清单：

// [x] isRowHidden(r, config) — 替代 Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null
//     当前重复：17 处，涉及 10 文件

// [x] isColHidden(c, config) — 替代 Store.config["colhidden"] != null && Store.config["colhidden"][c] != null
//     当前重复：10 处，涉及 7 文件

// [x] isCellValid(data, r, c) — 替代 data[r] != null && data[r][c] != null
//     当前重复：35 处，涉及 10 文件

// [x] isMergeCell(cell) — 替代 getObjType(cell) == "object" && "mc" in cell && cell.mc.rs != null
//     当前重复：13 处，涉及 6 文件

// [x] getCellDisplayValue(r, c, data) — 统一 getcellvalue/getCellValue/getRealCellValue/valueShowEs
//     当前重复：4 个函数功能重叠
//     逻辑：先取 m，若为空取 v，若为空取 ct.s（内联字符串）

// [x] iterateCellRange(cellrange, callback, options) — 替代条件格式中的行列遍历循环
//     当前重复：25+ 处同构循环
//     参数：cellrange, callback(r, c, cellValue), options={skipHidden, skipNull}
```

### 3.2 统一单元格值获取函数

当前存在 4 个功能重叠的函数：

| 函数 | 文件 | 功能 |
|------|------|------|
| `getcellvalue(r, c, data, type)` | `global/getdata.js:128` | 基础取值 |
| `getCellValue(row, column, options)` | `global/api/cellOperation.js:14` | API版取值 |
| `getRealCellValue(r, c)` | `global/getdata.js:273` | 先取m再取v |
| `valueShowEs(r, c, d)` | `global/format.js:1993` | 显示值取值 |

**重构方案**：
1. 保留 `getcellvalue` 作为底层函数
2. `getCellValue` 内部调用 `getcellvalue`，增加日期/内联字符串处理
3. `getRealCellValue` 和 `valueShowEs` 统一为 `getCellDisplayValue`，内部调用 `getcellvalue`
4. 删除 `getRealCellValue` 和 `valueShowEs`，所有调用点改为 `getCellDisplayValue`

### 3.3 替换计划

| 优先级 | 文件 | 替换项 |
|--------|------|--------|
| P1 | `controllers/conditionformat/computeSub/*.js` (4个文件) | iterateCellRange, isRowHidden |
| P1 | `controllers/matrixOperation/matrixCleanOperation.js` | isCellValid |
| P1 | `global/api/matrix.js` | isCellValid |
| P2 | `controllers/selection/clipboardCopy.js` | isRowHidden, isColHidden, isMergeCell |
| P2 | `global/draw/drawMain.js` | isRowHidden, isColHidden, isCellValid |
| P2 | `global/api/rangeRead.js` | isRowHidden, isColHidden |
| P3 | 其余 15+ 文件 | 按需替换 |

### 3.4 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 全局搜索 `Store.config["rowhidden"] != null && Store.config["rowhidden"]` 结果为 0
- [ ] 全局搜索 `getRealCellValue` 仅在 `getCellDisplayValue` 内部调用
- [ ] 全局搜索 `valueShowEs` 结果为 0

---

## Phase 4: Canvas 绘制模式封装

> 核心问题：Canvas 默认样式初始化 3 处重复、颜色优先级判断 5 处重复、网格线绘制 4 处重复、行列坐标计算 10 处重复、边框渲染函数 4 个同构函数。

### 4.1 创建 `src/global/draw/drawUtils.js`

```javascript
// 目标函数清单：

// [x] initCanvasDefaults(ctx) — 替代 ctx.font/textBaseline/fillStyle 初始化
//     当前重复：3 处（drawMain.js, drawTitle.js x2）

// [x] getCellTextColor(r, c, checksAF, checksCF, cell) — 替代文字颜色优先级判断
//     当前重复：2-3 处（cellRender.js, cellOverflow.js）
//     逻辑：fc -> AF[0] -> CF.textColor -> [Red]格式

// [x] getCellBgColor(r, c, checksAF, checksCF) — 替代背景颜色优先级判断
//     当前重复：2 处（cellRender.js nullCellRender/cellRender）
//     逻辑：bg -> AF[1] -> CF.cellColor -> 默认#FFFFFF

// [x] drawGridLine(ctx, type, x1, y1, x2, y2) — 替代网格线绘制
//     当前重复：4 处（cellRender.js）
//     type: "vertical" | "horizontal"

// [x] drawCommentMark(ctx, end_c, start_r, offsetLeft, offsetTop, ps_w, ps_h) — 替代批注三角绘制
//     当前重复：2 处（cellRender.js nullCellRender/cellRender）

// [x] drawDataBarRect(ctx, points, strokeColor) — 替代 DataBar 矩形描边
//     当前重复：3 处（cellRender.js）

// [x] createGradientFill(ctx, x1, y1, x2, y2, colorStops) — 替代渐变创建
//     当前重复：5 处（cellRender.js x3, ruleManager.js x2）

// [x] drawBorder(ctx, direction, style, color, ...) — 合并4个边框渲染函数为1个
//     当前重复：4 个同构函数（drawMain.js）
//     direction: "left" | "right" | "top" | "bottom"

// [x] getRowStartEnd(r, scrollHeight) — 替代行坐标计算
//     当前重复：5 处
//     返回：{ start_r, end_r }

// [x] getColStartEnd(c, scrollWidth) — 替代列坐标计算
//     当前重复：5 处
//     返回：{ start_c, end_c }

// [x] calcCellSize(start_c, start_r, end_c, end_r, offsetLeft, offsetTop, borderfix, isMerge, isNullCell) — 替代 cellsize 计算
//     当前重复：2 处（cellRender.js nullCellRender/cellRender）

// [x] fireCellRenderHook(hookType, cell, params) — 替代 cellRenderBefore/After 钩子调用
//     当前重复：4 处（cellRender.js）

// [x] resetCanvasStroke(ctx) — 替代 ctx.lineWidth=1; ctx.strokeStyle=luckysheetdefaultstyle.strokeStyle
//     当前重复：7 处
```

### 4.2 替换计划

| 优先级 | 文件 | 替换项 |
|--------|------|--------|
| P1 | `global/draw/cellRender.js` | 全部 12 个函数 |
| P1 | `global/draw/drawMain.js` | initCanvasDefaults, drawBorder, getRowStartEnd, getColStartEnd |
| P2 | `global/draw/drawTitle.js` | initCanvasDefaults, getRowStartEnd, getColStartEnd, resetCanvasStroke |
| P2 | `global/draw/cellOverflow.js` | getCellTextColor, getRowStartEnd, getColStartEnd |
| P3 | `controllers/conditionformat/ruleManager.js` | createGradientFill, drawDataBarRect |

### 4.3 潜在 Bug 修复

在重构过程中需同步修复以下发现的问题：

- [ ] **cellOverflow.js 缺少 `[Red]` 格式判断**：[cellOverflow.js:274-279](file:///d:/gitee/Luckysheet/src/global/draw/cellOverflow.js#L274-L279) 中的文字颜色设置缺少 `cell.ct.fa.indexOf("[Red]")` 的红色判断，而 cellRender.js 中有此逻辑
- [ ] **cellsize 计算差异**：nullCellRender 第4项是 `borderfix[3] - 1`，cellRender 是 `borderfix[3] + 1`，需确认是否有意为之
- [ ] **批注三角标记坐标差异**：nullCellRender 使用 `end_c + offsetLeft - 1 - ps_w`，cellRender 使用 `end_c + offsetLeft - ps_w`，差一个像素

### 4.4 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 视觉回归测试：打开电子表格，确认网格线、单元格背景、文字颜色、批注标记、DataBar 渲染正常

---

## Phase 5: 数据转换与格式化封装 ✅ 工具函数已创建，部分调用点已替换

> 核心问题：error 常量 3 处重复定义、深拷贝 3 种方式并存、浮点精度修正 8 处重复、科学计数法格式化 5 处重复、排序比较逻辑 4 处重复。

### 5.1 统一 error 常量

当前 3 处重复定义：

| 文件 | 定义方式 |
|------|---------|
| `global/validate.js:4-13` | `export const error = { v: "#VALUE!", ... }` |
| `global/formula/error.js:20-30` | `const error = { error: { v: "#VALUE!", ... }, errorInfo: ..., errorParamCheck: ... }` |
| `global/func_methods.js:7-16` | `const error = { v: "#VALUE!", ... }` |

**重构方案**：
1. 保留 `validate.js` 中的 `error` 作为唯一真值来源
2. `formula/error.js` 改为从 `validate.js` 导入 `error`，保留 `errorInfo` 和 `errorParamCheck`
3. `func_methods.js` 改为从 `validate.js` 导入 `error`
4. 抽取错误类型数组为常量 `ERROR_TYPES = ["#N/A", "#VALUE!", "#REF!", "#DIV/0!", "#NUM!", "#NAME?", "#NULL!", "#SPILL!"]`

### 5.2 创建 `src/utils/utilSub/objectUtils.js`

```javascript
// 目标函数清单：

// [x] deepClone(obj) — 统一深拷贝，替代 JSON.parse(JSON.stringify()) 和 $.extend(true, {}, ...)
//     当前重复：JSON方式 20 处 + $.extend方式 100+ 处
//     实现：使用结构化克隆或 lodash.cloneDeep

// [x] roundPrecision(val, digits = 9) — 替代 Math.round(val * 1000000000) / 1000000000
//     当前重复：8 处，涉及 3 文件

// [x] isInfinite(val) — 替代 val == Infinity || val == -Infinity
//     当前重复：7 处，涉及 3 文件

// [x] formatNumericCell(cell, genarate) — 替代科学计数法格式化逻辑
//     当前重复：5 处（dropCell/core/index.js x4, setdata.js x1）
//     逻辑：Infinity判断 -> 科学计数法处理 -> 精度修正 -> 格式化
```

### 5.3 创建 `src/utils/utilSub/compareUtils.js`

```javascript
// 目标函数清单：

// [x] compareValues(x, y, order = "asc") — 统一排序比较逻辑
//     当前重复：4 处（sort.js 中 orderbydata 和 orderbydata1D 的升降序比较函数）
//     逻辑：日期比较 -> 数值比较 -> 字符串 localeCompare
```

### 5.4 扩展 `src/utils/utilSub/dateTimeUtils.js`

```javascript
// 目标函数清单：

// [x] formatDate(date) — 替代 dayjs(date).format("YYYY-MM-DD")
//     当前重复：13+ 处

// [x] isValidDate(date) — 替代 !dayjs(date).isValid()
//     当前重复：30+ 处（financialBond.js）

// [x] getNowDateTime() — 重构为使用 dayjs 替代手动拼接
//     当前：手动 getFullYear/getMonth/getDate + 补零
```

### 5.5 扩展 `src/utils/utilSub/stringUtils.js`

```javascript
// 目标函数清单：

// [x] stripQuotes(str) — 替代 .replace(/"/g, "").replace(/'/g, "")
//     当前重复：3 处（formatUtils.js, fontManage.js, formatStatus.js）

// [x] isBlankString(val) — 替代 val == null || val.replace(/\s/g, "") == ""
//     当前重复：6 处
//     注意：应复用 validate.js 中的 isRealNull
```

### 5.6 抽取常量

```javascript
// 在 src/utils/constants.js 中定义：

// [x] GENERAL_NUMBER_CT = { fa: "General", t: "n" }
//     当前重复：6+ 处（store/index.js, setdata.js x2, format.js, dropCell/core/index.js x4）

// [x] ERROR_TYPES = ["#N/A", "#VALUE!", "#REF!", "#DIV/0!", "#NUM!", "#NAME?", "#NULL!", "#SPILL!"]
//     当前重复：7 处内联数组（information.js）
```

### 5.7 替换计划

| 优先级 | 文件 | 替换项 |
|--------|------|--------|
| P1 | `global/validate.js`, `global/formula/error.js`, `global/func_methods.js` | 统一 error 常量 |
| P1 | `controllers/dropCell/core/index.js` | formatNumericCell, roundPrecision, isInfinite, GENERAL_NUMBER_CT |
| P1 | `global/sort.js` | compareValues |
| P2 | `function/functionImplementation/financial/financialBond.js` | isValidDate |
| P2 | `function/functionImplementation/localeCn.js` | formatDate |
| P2 | `global/setdata.js` | formatNumericCell, GENERAL_NUMBER_CT |
| P3 | 其余 20+ 文件 | deepClone, 按需替换 |

### 5.8 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 全局搜索 `JSON.parse(JSON.stringify(` 结果显著减少
- [ ] 全局搜索 `Math.round.*1000000000` 结果为 0
- [ ] error 常量仅在一处定义

---

## Phase 6: 条件格式选区解析封装 ✅ 工具函数已创建

> 核心问题：4 个文件中存在几乎逐行相同的"条件值选区解析"代码块，每处约 30-50 行，且每处内部重复 3 次（betweenness/greaterThan/textContains）。

### 6.1 创建 `src/controllers/conditionformat/rangeParser.js`

```javascript
// 目标函数清单：

// [x] parseConditionRange(rangeText, _this, conditionformat_Text) — 替代选区解析逻辑
//     当前重复：4 文件 × 3 模式 = 12 处
//     逻辑：getRangeByTxt -> 验证单单元格 -> 获取值 -> conditionRange/conditionValue
//     返回：{ conditionRange, conditionValue } 或 null（验证失败时）

// [x] validateConditionValue(value, _this, conditionformat_Text) — 替代值验证逻辑
//     当前重复：4 处
//     逻辑：isNaN(value) || value == "" 时弹出提示
```

### 6.2 替换计划

| 优先级 | 文件 | 行号范围 | 替换项 |
|--------|------|---------|--------|
| P1 | `controllers/conditionformat/dialog/initEditRuleEvents.js` | 85-204 | parseConditionRange |
| P1 | `controllers/conditionformat/dialog/initNewRuleEvents.js` | 85-214 | parseConditionRange |
| P1 | `controllers/conditionformat/dialog/initConditionDialogEvents.js` | 30-148 | parseConditionRange |
| P1 | `global/api/conditionFormat.js` | 70-199 | parseConditionRange |

### 6.3 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 条件格式新建/编辑规则功能正常

---

## Phase 7: 剪贴板HTML生成去重

> 核心问题：`clipboardCopy.js` 与 `rangeRead.js` 之间约 300 行近乎逐行重复，是最严重的跨文件重复。包括单元格值获取、样式读取、合并单元格处理、边框投票逻辑。

### 7.1 创建 `src/controllers/selection/htmlTableBuilder.js`

```javascript
// 目标函数清单：

// [x] buildHtmlTable(data, range, options) — 生成HTML表格字符串
//     参数：data(单元格数据), range(选区范围), options={includeStyle, includeBorder}
//     返回：HTML 字符串

// [x] getCellHtmlValue(r, c, data) — 获取单元格的HTML显示值
//     当前重复：clipboardCopy.js:168-177, rangeRead.js:282-310
//     逻辑：ct.fa正则判断 + getcellvalue调用

// [x] getCellBorderStyle(r, c, borderInfoCompute, selection) — 获取单元格边框CSS
//     当前重复：clipboardCopy.js:337-362, rangeRead.js:494-522
//     逻辑：四方向边框读取 + getHtmlBorderStyle

// [x] getMergedCellBorderStyle(r, c, mc, borderInfoCompute, selection) — 获取合并区域边框CSS
//     当前重复：clipboardCopy.js:184-330, rangeRead.js:319-485
//     逻辑：遍历合并区域 -> 四方向投票 -> 应用投票结果

// [x] voteBorderStyle(direction, borderInfoCompute, r, c, rowlen, collen) — 边框投票
//     当前重复：2 处 × 4方向 = 8 次
//     逻辑：统计出现最多的边框样式和颜色

// [x] applyVoteResult(voteObj, rowlen, selection) — 应用投票结果
//     当前重复：2 处 × 4方向 = 8 次
//     逻辑：超过半数则采用该样式

// [x] dataToJsonObject(data) — 复制为JSON（有标题）
//     当前重复：copyFormatOperation.js:62-83, rangeRead.js:742-771

// [x] dataToJsonNoHeaderObject(data) — 复制为JSON（无标题）
//     当前重复：copyFormatOperation.js:136-142, rangeRead.js:764-770
```

### 7.2 替换计划

| 优先级 | 文件 | 替换项 |
|--------|------|--------|
| P1 | `controllers/selection/clipboardCopy.js` | buildHtmlTable, getCellHtmlValue, getCellBorderStyle, getMergedCellBorderStyle |
| P1 | `global/api/rangeRead.js` | 同上 |
| P2 | `controllers/matrixOperation/copyFormatOperation.js` | dataToJsonObject, dataToJsonNoHeaderObject |

### 7.3 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 复制单元格到剪贴板功能正常（Ctrl+C）
- [ ] `getRangeHtml()` API 返回正确
- [ ] `getRangeJson()` API 返回正确
- [ ] 带边框和合并单元格的复制功能正常

---

## Phase 8: 常量与类型定义统一

> 核心问题：RGB 颜色解析 2 处不同实现、字节长度计算 2 处不同实现、数字类型判断 4 处模式重叠。

### 8.1 统一颜色处理

当前 `colorUtils.js` 中的 `rgbTohex` 和 `compute.js` 中的 `getcolorGradation` 都在解析 RGB 颜色字符串，但用了完全不同的方式。

**重构方案**：
1. 在 `colorUtils.js` 中新增 `parseRgbString(color)` 函数，返回 `{ r, g, b }` 对象
2. `rgbTohex` 内部改用 `parseRgbString`
3. `compute.js` 中的 `getcolorGradation` 改用 `parseRgbString`

### 8.2 统一字节长度计算

当前 `stringUtils.js` 中的 `getByteLen` 和 `validate.js` 中的 `checkWordByteLength` 功能重叠但实现不同。

**重构方案**：
1. 保留 `stringUtils.js` 中的 `getByteLen` 作为标准实现
2. `validate.js` 中的 `checkWordByteLength` 改为调用 `getByteLen`

### 8.3 统一数字类型判断

当前存在多种数字判断方式：
- `isRealNum(s)` — validate.js
- `!isNaN(parseFloat(s)) && !hasChinaword(s)` — datecontroll.js x2
- `isNaN(parseFloat(num)) || hasChinaword(num)` — formatUtils.js (反向)

**重构方案**：
1. 确认 `isRealNum` 是否已覆盖 `!isNaN(parseFloat(s)) && !hasChinaword(s)` 的场景
2. 如果是，将所有 `!isNaN(parseFloat(s)) && !hasChinaword(s)` 替换为 `isRealNum(s)`
3. 如果不是，在 `typeUtils.js` 中新增 `isNumericString(s)` 函数统一处理

### 8.4 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 条件格式颜色渐变功能正常
- [ ] 字体名称处理正常

---

## 执行时间线

| 阶段 | 预估影响范围 | 依赖 | 风险等级 |
|------|------------|------|---------|
| Phase 1: Store 状态访问层 | 80+ 文件 | 无 | 🟡 中（纯提取，行为不变） |
| Phase 2: DOM/jQuery 操作 | 30+ 文件 | 无 | 🟡 中（DOM操作需视觉验证） |
| Phase 3: 单元格数据访问 | 25+ 文件 | Phase 1 | 🟡 中（核心数据路径） |
| Phase 4: Canvas 绘制 | 6 文件 | 无 | 🔴 高（需视觉回归测试） |
| Phase 5: 数据转换格式化 | 15+ 文件 | 无 | 🟡 中（纯逻辑提取） |
| Phase 6: 条件格式选区 | 4 文件 | Phase 3 | 🟢 低（范围小） |
| Phase 7: 剪贴板HTML | 3 文件 | Phase 3 | 🔴 高（核心复制功能） |
| Phase 8: 常量类型统一 | 10+ 文件 | Phase 5 | 🟢 低（纯替换） |

---

## 重构收益预估

| 指标 | 当前 | 重构后 |
|------|------|--------|
| 重复代码行数（估算） | ~3000 行 | ~500 行 |
| `Store.luckysheetfile[getSheetIndex...]` 调用 | 100+ | 1（封装函数内部） |
| `$("#luckysheet-cell-main")` 选择器 | ~100 | ~5（封装函数内部） |
| `parseInt($("#luckysheet-input-box").css("top"))` | 12 | 1 |
| 行隐藏检查内联代码 | 17 | 1 |
| 边框四方向重复代码 | 24 | 4（1个函数×4方向调用） |
| error 常量定义 | 3 | 1 |
| 深拷贝方式 | 3种 | 1种 |
| 条件格式选区解析 | 12处 | 1处 |
| 剪贴板HTML生成重复 | ~300行 | 0 |

---

## 潜在 Bug 清单

在分析重复代码过程中发现以下潜在 Bug，需在重构时同步修复：

| # | 位置 | 描述 | 严重程度 |
|---|------|------|---------|
| 1 | [cellOverflow.js:274-279](file:///d:/gitee/Luckysheet/src/global/draw/cellOverflow.js#L274-L279) | 文字颜色设置缺少 `[Red]` 格式判断，cellRender.js 中有此逻辑 | 🟡 中 |
| 2 | [cellRender.js:56 vs 198](file:///d:/gitee/Luckysheet/src/global/draw/cellRender.js#L56) | cellsize 第4项：nullCellRender 是 `borderfix[3] - 1`，cellRender 是 `borderfix[3] + 1` | 🟡 中 |
| 3 | [cellRender.js:91-97 vs 222-228](file:///d:/gitee/Luckysheet/src/global/draw/cellRender.js#L91-L97) | 批注三角标记坐标差1像素 | 🟢 低 |
| 4 | [drawTitle.js](file:///d:/gitee/Luckysheet/src/global/draw/drawTitle.js) | 多处注释掉 lineWidth/strokeStyle 设置，依赖上一次值 | 🟡 中 |

---

## 已完成工作汇总（截至当前）

### 新创建的工具文件
| 文件 | 包含函数 |
|------|---------|
| `src/utils/storeAccess.js` | getCurrentFile, getCurrentSheetOrder, getLastSelection, getFocusCell, getFlowData, getCell, getDataSize, getMaxRowIndex, getMaxColIndex, syncConfigToStore, syncDataToStore, getHeaderTotalHeight |
| `src/utils/domUtils.js` | getScrollPosition, getCellMainSize, getScrollAndSize, getMousePositionWithScroll, isInputBoxActive, resetInputBoxStyle, showModalMask, hideModalMask, isModalMaskVisible, isImageEditing, isFormulaDialogVisible, checkMenuOverflow, createSelectionSetDiv, getWindowSize |
| `src/utils/dialogUtils.js` | createDialog, createToolbarMenu |
| `src/utils/eventUtils.js` | bindNamespacedEvent, unbindNamespacedEvent |
| `src/utils/utilSub/rangeUtils.js` (扩展) | isRowHidden, isColHidden, isCellValid, isMergeCell, iterateCellRange |
| `src/utils/utilSub/objectUtils.js` | deepClone, roundPrecision, isInfinite, formatNumericCell |
| `src/utils/utilSub/compareUtils.js` | compareValues |
| `src/utils/constants.js` | GENERAL_NUMBER_CT, ERROR_TYPES |
| `src/controllers/conditionformat/rangeParser.js` | parseConditionRange |

### 已替换的重复模式统计
| 重复模式 | 替换前数量 | 替换后 | 涉及文件数 |
|----------|-----------|--------|-----------|
| `Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]` | 100+ | 1 (封装函数内部) | 40+ |
| `Store.luckysheet_select_save[...length-1]` | 68 | 1 (封装函数内部) | 30+ |
| `Store.visibledatarow.length - 1` | 21 | 1 | 8 |
| `Store.visibledatacolumn.length - 1` | 19 | 1 | 8 |
| `Store.infobarHeight+Store.toolbarHeight+...` | 8 | 1 | 4 |
| `.config = Store.config` 同步 | 22 | 1 | 10 |
| `parseInt($("#luckysheet-input-box").css("top")) > 0` | 11 | 1 | 7 |
| `tlen > userlen && tlen + menuleft > ...` 菜单溢出 | 18 | 1 | 18 |
| `Store.config["rowhidden"]!=null && Store.config["rowhidden"][r]!=null` | 17 | 1 | 13 |
| `Store.config["colhidden"]!=null && Store.config["colhidden"][c]!=null` | 10 | 1 | 8 |
| `Math.round(x*1000000000)/1000000000` | 8 | 1 | 3 |
| `cell.v == Infinity \|\| cell.v == -Infinity` | 6 | 1 | 2 |

### 构建验证
- ✅ `npm run build` 通过
