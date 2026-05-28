# Luckysheet 重复代码提取重构计划

> 目标：按功能职责提取项目中的重复代码为公共工具函数，消除冗余，提升可维护性。
> 原则：每个阶段完成后必须通过 `npm run build` 构建验证 + `npm run test` 单元测试，确保不破坏原有功能。
> 进度标记：[ ] 待开始 | [~] 进行中 | [x] 已完成

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

## Phase 1: Store 状态访问层封装 [~] 工具函数已创建，部分调用点已替换

> 核心问题：`Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]` 在 50+ 文件中重复 100+ 次，是最严重的重复模式。

### 1.1 创建 `src/utils/storeAccess.js` ✅ 已完成

提取以下高频 Store 访问模式为工具函数：

```javascript
// [x] getCurrentFile() — 替代 Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]
// [x] getCurrentSheetOrder() — 替代 Store.currentSheetIndex 的直接访问
// [x] getLastSelection() — 替代 Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1]
// [x] getFocusCell() — 替代 last["row_focus"], last["column_focus"]
// [x] getFlowData() — 替代 Store.flowdata 的直接访问
// [x] getCell(row, col, data) — 替代 Store.flowdata[r][c] 的直接访问（含空值防护）
// [x] getDataSize() — 替代 Store.flowdata.length, Store.flowdata[0].length
// [x] getMaxRowIndex() — 替代 Store.visibledatarow.length - 1
// [x] getMaxColIndex() — 替代 Store.visibledatacolumn.length - 1
// [x] syncConfigToStore() — 替代 Store.luckysheetfile[...].config = Store.config
// [x] syncDataToStore() — 替代 Store.luckysheetfile[...].data = Store.flowdata
// [x] getHeaderTotalHeight() — 替代 Store.infobarHeight + Store.toolbarHeight + ...
```

### 1.2 替换进度

**当前状态**：`storeAccess.js` 已被 73 个文件直接导入使用，但旧模式仍有大量残留。

| 旧模式 | 残留次数 | 残留文件数 | 主要残留文件 |
|--------|---------|-----------|-------------|
| `Store.luckysheetfile[getSheetIndex` | 51 | 17 | controlHistory.js(16), refreshOperation.js(8), border.js(4), freezeCore.js(3) |

| 优先级 | 文件 | 涉及函数 | 替换项 | 状态 |
|--------|------|---------|--------|------|
| P1 | `controllers/controlHistory.js` | 16处 | getCurrentFile, syncConfigToStore | [ ] |
| P1 | `global/refresh/refreshOperation.js` | 8处 | getCurrentFile, syncConfigToStore | [ ] |
| P1 | `global/border.js` | 4处 | getCurrentFile | [ ] |
| P1 | `controllers/freezen/freezeCore.js` | 3处 | getCurrentFile | [ ] |
| P2 | 其余 13 个文件 | 各1-2处 | 按需替换 | [ ] |

### 1.3 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 全局搜索 `Store.luckysheetfile[getSheetIndex` 结果为 0
- [ ] 全局搜索 `Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1]` 结果为 0

---

## Phase 2: DOM/jQuery 操作封装 [~] 工具函数已创建，部分调用点已替换

> 核心问题：`$("#luckysheet-cell-main")` 出现约 100 次，`$("#luckysheet-modal-dialog-mask")` 出现 71 次，大量重复的滚动位置获取和对话框操作。

### 2.1 创建 `src/utils/domUtils.js` ✅ 已完成

```javascript
// [x] getScrollPosition() — 替代 $("#luckysheet-cell-main").scrollTop()/scrollLeft()
// [x] getCellMainSize() — 替代 $("#luckysheet-cell-main").height()/width()
// [x] getScrollAndSize() — 合并上面两个，一次获取
// [x] getMousePositionWithScroll(mouse) — 替代 mouse[0] + scrollLeft, mouse[1] + scrollTop
// [x] isInputBoxActive() — 替代 parseInt($("#luckysheet-input-box").css("top")) > 0
// [x] resetInputBoxStyle() — 替代 $("#luckysheet-input-box").removeAttr("style")
// [x] showModalMask() — 替代 $("#luckysheet-modal-dialog-mask").show()
// [x] hideModalMask() — 替代 $("#luckysheet-modal-dialog-mask").hide()
// [x] isModalMaskVisible() — 替代 $("#luckysheet-modal-dialog-mask").is(":visible")
// [x] isImageEditing() — 替代 $("#luckysheet-modal-dialog-activeImage").is(":visible") || ...
// [x] isFormulaDialogVisible() — 替代 $("#luckysheet-singleRange-dialog").is(":visible") || ...
// [x] checkMenuOverflow(tlen, userlen, menuleft) — 替代菜单溢出检测
// [x] createSelectionSetDiv(index) — 替代选区集 div 创建
// [x] getWindowSize() — 替代 $(window).width()/height()
```

### 2.2 创建 `src/utils/dialogUtils.js` ✅ 已完成

```javascript
// [x] createDialog(options) — 替代 $("body").append(replaceHtml(modelHTML, {...}))
// [x] createToolbarMenu(menu, submenu) — 替代 $("body").append(menu/submenu)
```

### 2.3 创建 `src/utils/eventUtils.js` ✅ 已完成

```javascript
// [x] bindNamespacedEvent(selector, event, namespace, filter, handler)
// [x] unbindNamespacedEvent(selector, event, namespace)
```

### 2.4 替换进度

**当前状态**：`domUtils.js` 已被 25 个文件直接导入使用。`dialogUtils.js` 和 `eventUtils.js` 仅通过 `util.js` 中转导出，业务代码未直接导入。

| 旧模式 | 残留次数 | 残留文件 | 说明 |
|--------|---------|---------|------|
| `parseInt($("#luckysheet-input-box").css("top"))` | 3 | sheetBar.js, scroll.js, getdata.js(注释) | 其中2处需读取具体top值，`isInputBoxActive()` 抽象不够覆盖 |

| 优先级 | 文件/目录 | 替换项 | 状态 |
|--------|----------|--------|------|
| P1 | `controllers/keyboard.js` | isInputBoxActive, isFormulaDialogVisible, isModalMaskVisible | [ ] |
| P1 | `controllers/imageCtrl.js` | getScrollPosition, showModalMask, hideModalMask | [ ] |
| P1 | `controllers/menuButton/toolbarInit/*.js` (18个文件) | checkMenuOverflow, createToolbarMenu | [ ] |
| P2 | `controllers/selection/clipboardCopy.js` | getScrollPosition | [ ] |
| P2 | `global/draw/drawMain.js`, `drawTitle.js` | getScrollPosition | [ ] |
| P2 | `controllers/handler/documentMousemove.js`, `documentMouseup.js` | getMousePositionWithScroll | [ ] |
| P3 | 其余 20+ 文件 | 按需替换 | [ ] |

### 2.5 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 全局搜索 `parseInt($("#luckysheet-input-box").css("top"))` 结果为 0
- [ ] 全局搜索 `tlen > userlen && tlen + menuleft > $("#" + Store.container).width()` 结果为 0

---

## Phase 3: 单元格数据访问与边界检查封装 [~] 工具函数已创建，调用点替换不足

> 核心问题：行隐藏检查 17 处、列隐藏检查 10 处、单元格空值检查 35 处、合并单元格判断 13 处，全部内联重复。

### 3.1 扩展 `src/utils/utilSub/rangeUtils.js` ✅ 已完成

```javascript
// [x] isRowHidden(r, config) — 替代 Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null
// [x] isColHidden(c, config) — 替代 Store.config["colhidden"] != null && Store.config["colhidden"][c] != null
// [x] isCellValid(data, r, c) — 替代 data[r] != null && data[r][c] != null
// [x] isMergeCell(cell) — 替代 getObjType(cell) == "object" && "mc" in cell && cell.mc.rs != null
// [x] getCellDisplayValue(r, c, data) — 统一 getcellvalue/getCellValue/getRealCellValue/valueShowEs
// [x] iterateCellRange(cellrange, callback, options) — 替代条件格式中的行列遍历循环
```

### 3.2 统一单元格值获取函数 [ ] 未开始

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

### 3.3 替换进度

**当前状态**：`rangeUtils.js` 仅通过 `util.js` 中转导出，业务代码未直接导入。旧模式仍有残留。

| 旧模式 | 残留次数 | 残留文件 | 说明 |
|--------|---------|---------|------|
| `Store.config["rowhidden"]` | 7 | controlHistory.js(4), refreshOperation.js(1), filterActions.js(1) | 部分为写操作，`isRowHidden()` 仅覆盖读操作 |

| 优先级 | 文件 | 替换项 | 状态 |
|--------|------|--------|------|
| P1 | `controllers/conditionformat/computeSub/*.js` (4个文件) | iterateCellRange, isRowHidden | [ ] |
| P1 | `controllers/matrixOperation/matrixCleanOperation.js` | isCellValid | [ ] |
| P1 | `global/api/matrix.js` | isCellValid | [ ] |
| P2 | `controllers/selection/clipboardCopy.js` | isRowHidden, isColHidden, isMergeCell | [ ] |
| P2 | `global/draw/drawMain.js` | isRowHidden, isColHidden, isCellValid | [ ] |
| P2 | `global/api/rangeRead.js` | isRowHidden, isColHidden | [ ] |
| P3 | 其余 15+ 文件 | 按需替换 | [ ] |

### 3.4 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 全局搜索 `Store.config["rowhidden"] != null && Store.config["rowhidden"]` 结果为 0
- [ ] 全局搜索 `getRealCellValue` 仅在 `getCellDisplayValue` 内部调用
- [ ] 全局搜索 `valueShowEs` 结果为 0

---

## Phase 4: Canvas 绘制模式封装 [~] 工具函数已创建，部分调用点已替换

> 核心问题：Canvas 默认样式初始化 3 处重复、颜色优先级判断 5 处重复、网格线绘制 4 处重复、行列坐标计算 10 处重复、边框渲染函数 4 个同构函数。

### 4.1 创建 `src/global/draw/drawUtils.js` ✅ 已完成

```javascript
// [x] initCanvasDefaults(ctx) — 替代 ctx.font/textBaseline/fillStyle 初始化
// [x] getCellTextColor(r, c, checksAF, checksCF, cell) — 替代文字颜色优先级判断
// [x] getCellBgColor(r, c, checksAF, checksCF) — 替代背景颜色优先级判断
// [x] drawGridLine(ctx, type, x1, y1, x2, y2) — 替代网格线绘制
// [x] drawCommentMark(ctx, end_c, start_r, offsetLeft, offsetTop, ps_w, ps_h) — 替代批注三角绘制
// [x] drawDataBarRect(ctx, points, strokeColor) — 替代 DataBar 矩形描边
// [x] createGradientFill(ctx, x1, y1, x2, y2, colorStops) — 替代渐变创建
// [x] drawBorder(ctx, direction, style, color, ...) — 合并4个边框渲染函数为1个
// [x] getRowStartEnd(r, scrollHeight) — 替代行坐标计算
// [x] getColStartEnd(c, scrollWidth) — 替代列坐标计算
// [x] calcCellSize(...) — 替代 cellsize 计算
// [x] fireCellRenderHook(hookType, cell, params) — 替代 cellRenderBefore/After 钩子调用
// [x] resetCanvasStroke(ctx) — 替代 ctx.lineWidth=1; ctx.strokeStyle=...
```

### 4.2 替换进度

**当前状态**：`drawUtils.js` 已被 3 个文件直接导入使用（cellRender.js, drawMain.js, drawTitle.js）。

| 优先级 | 文件 | 替换项 | 状态 |
|--------|------|--------|------|
| P1 | `global/draw/cellRender.js` | 全部 12 个函数 | [~] 部分完成 |
| P1 | `global/draw/drawMain.js` | initCanvasDefaults, drawBorder, getRowStartEnd, getColStartEnd | [~] 部分完成 |
| P2 | `global/draw/drawTitle.js` | initCanvasDefaults, getRowStartEnd, getColStartEnd, resetCanvasStroke | [~] 部分完成 |
| P2 | `global/draw/cellOverflow.js` | getCellTextColor, getRowStartEnd, getColStartEnd | [ ] |
| P3 | `controllers/conditionformat/ruleManager.js` | createGradientFill, drawDataBarRect | [ ] |

### 4.3 潜在 Bug 修复

在重构过程中需同步修复以下发现的问题：

- [ ] **cellOverflow.js 缺少 `[Red]` 格式判断**：文字颜色设置缺少 `cell.ct.fa.indexOf("[Red]")` 的红色判断，cellRender.js 中有此逻辑
- [ ] **cellsize 计算差异**：nullCellRender 第4项是 `borderfix[3] - 1`，cellRender 是 `borderfix[3] + 1`，需确认是否有意为之
- [ ] **批注三角标记坐标差异**：nullCellRender 使用 `end_c + offsetLeft - 1 - ps_w`，cellRender 使用 `end_c + offsetLeft - ps_w`，差一个像素

### 4.4 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 视觉回归测试：打开电子表格，确认网格线、单元格背景、文字颜色、批注标记、DataBar 渲染正常

---

## Phase 5: 数据转换与格式化封装 [~] 工具函数已创建，部分调用点已替换

> 核心问题：error 常量 3 处重复定义、深拷贝 3 种方式并存、浮点精度修正 8 处重复、科学计数法格式化 5 处重复、排序比较逻辑 4 处重复。

### 5.1 统一 error 常量 [ ] 未开始

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
4. 抽取错误类型数组为常量 `ERROR_TYPES`

### 5.2 创建 `src/utils/utilSub/objectUtils.js` ✅ 已完成

```javascript
// [x] deepClone(obj) — 统一深拷贝
// [x] roundPrecision(val, digits = 9) — 替代 Math.round(val * 1000000000) / 1000000000
// [x] isInfinite(val) — 替代 val == Infinity || val == -Infinity
// [x] formatNumericCell(cell, genarate) — 替代科学计数法格式化逻辑
```

### 5.3 创建 `src/utils/utilSub/compareUtils.js` ✅ 已完成

```javascript
// [x] compareValues(x, y, order = "asc") — 统一排序比较逻辑
```

### 5.4 扩展 `src/utils/utilSub/dateTimeUtils.js` ✅ 已完成

```javascript
// [x] formatDate(date) — 替代 dayjs(date).format("YYYY-MM-DD")
// [x] isValidDate(date) — 替代 !dayjs(date).isValid()
// [x] getNowDateTime() — 重构为使用 dayjs 替代手动拼接
```

### 5.5 扩展 `src/utils/utilSub/stringUtils.js` ✅ 已完成

```javascript
// [x] stripQuotes(str) — 替代 .replace(/"/g, "").replace(/'/g, "")
// [x] isBlankString(val) — 替代 val == null || val.replace(/\s/g, "") == ""
```

### 5.6 抽取常量 ✅ 已完成

```javascript
// [x] GENERAL_NUMBER_CT = { fa: "General", t: "n" } — 在 src/utils/constants.js
// [x] ERROR_TYPES = [...] — 在 src/utils/constants.js
```

### 5.7 替换进度

**当前状态**：`objectUtils.js`、`compareUtils.js` 仅通过 `util.js` 中转导出，业务代码未直接导入。`constants.js` 已被 5 个文件直接导入。

| 优先级 | 文件 | 替换项 | 状态 |
|--------|------|--------|------|
| P1 | `global/validate.js`, `global/formula/error.js`, `global/func_methods.js` | 统一 error 常量 | [ ] |
| P1 | `controllers/dropCell/core/index.js` | formatNumericCell, roundPrecision, isInfinite, GENERAL_NUMBER_CT | [ ] |
| P1 | `global/sort.js` | compareValues | [ ] |
| P2 | `function/functionImplementation/financial/financialBond.js` | isValidDate | [ ] |
| P2 | `function/functionImplementation/localeCn.js` | formatDate | [ ] |
| P2 | `global/setdata.js` | formatNumericCell, GENERAL_NUMBER_CT | [ ] |
| P3 | 其余 20+ 文件 | deepClone, 按需替换 | [ ] |

### 5.8 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 全局搜索 `JSON.parse(JSON.stringify(` 结果显著减少
- [ ] 全局搜索 `Math.round.*1000000000` 结果为 0
- [ ] error 常量仅在一处定义

---

## Phase 6: 条件格式选区解析封装 ✅ 工具函数已创建，调用点已替换

> 核心问题：4 个文件中存在几乎逐行相同的"条件值选区解析"代码块，每处约 30-50 行，且每处内部重复 3 次。

### 6.1 创建 `src/controllers/conditionformat/rangeParser.js` ✅ 已完成

```javascript
// [x] parseConditionRange(rangeText, _this, conditionformat_Text) — 替代选区解析逻辑
// [x] validateConditionValue(value, _this, conditionformat_Text) — 替代值验证逻辑
```

### 6.2 替换进度

**当前状态**：`rangeParser.js` 已被 4 个目标文件直接导入使用，替换已完成。

| 文件 | 状态 |
|------|------|
| `controllers/conditionformat/dialog/initEditRuleEvents.js` | [x] 已替换 |
| `controllers/conditionformat/dialog/initNewRuleEvents.js` | [x] 已替换 |
| `controllers/conditionformat/dialog/initConditionDialogEvents.js` | [x] 已替换 |
| `global/api/conditionFormat.js` | [x] 已替换 |

### 6.3 验证标准

- [x] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 条件格式新建/编辑规则功能正常

---

## Phase 7: 剪贴板HTML生成去重 [~] 工具函数已创建，部分调用点已替换

> 核心问题：`clipboardCopy.js` 与 `rangeRead.js` 之间约 300 行近乎逐行重复，是最严重的跨文件重复。

### 7.1 创建 `src/controllers/selection/htmlTableBuilder.js` ✅ 已完成

```javascript
// [x] buildHtmlTable(data, range, options) — 生成HTML表格字符串
// [x] getCellHtmlValue(r, c, data) — 获取单元格的HTML显示值
// [x] getCellBorderStyle(r, c, borderInfoCompute, selection) — 获取单元格边框CSS
// [x] getMergedCellBorderStyle(r, c, mc, borderInfoCompute, selection) — 获取合并区域边框CSS
// [x] voteBorderStyle(direction, borderInfoCompute, r, c, rowlen, collen) — 边框投票
// [x] applyVoteResult(voteObj, rowlen, selection) — 应用投票结果
// [x] dataToJsonObject(data) — 复制为JSON（有标题）
// [x] dataToJsonNoHeaderObject(data) — 复制为JSON（无标题）
```

### 7.2 替换进度

**当前状态**：`htmlTableBuilder.js` 已被 2 个文件直接导入使用（clipboardCopy.js, rangeRead.js）。

| 优先级 | 文件 | 替换项 | 状态 |
|--------|------|--------|------|
| P1 | `controllers/selection/clipboardCopy.js` | buildHtmlTable, getCellHtmlValue, getCellBorderStyle, getMergedCellBorderStyle | [~] 部分完成 |
| P1 | `global/api/rangeRead.js` | 同上 | [~] 部分完成 |
| P2 | `controllers/matrixOperation/copyFormatOperation.js` | dataToJsonObject, dataToJsonNoHeaderObject | [ ] |

### 7.3 验证标准

- [ ] `npm run build` 通过
- [ ] `npm run test` 通过
- [ ] 复制单元格到剪贴板功能正常（Ctrl+C）
- [ ] `getRangeHtml()` API 返回正确
- [ ] `getRangeJson()` API 返回正确
- [ ] 带边框和合并单元格的复制功能正常

---

## Phase 8: 常量与类型定义统一 [ ] 未开始

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

## 潜在 Bug 清单

在分析重复代码过程中发现以下潜在 Bug，需在重构时同步修复：

| # | 位置 | 描述 | 严重程度 |
|---|------|------|---------|
| 1 | cellOverflow.js | 文字颜色设置缺少 `[Red]` 格式判断，cellRender.js 中有此逻辑 | 🟡 中 |
| 2 | cellRender.js | cellsize 第4项：nullCellRender 是 `borderfix[3] - 1`，cellRender 是 `borderfix[3] + 1` | 🟡 中 |
| 3 | cellRender.js | 批注三角标记坐标差1像素 | 🟢 低 |
| 4 | drawTitle.js | 多处注释掉 lineWidth/strokeStyle 设置，依赖上一次值 | 🟡 中 |

---

## 已完成工作汇总

### 新创建的工具文件

| 文件 | 包含函数 | 被业务代码直接导入数 |
|------|---------|-------------------|
| `src/utils/storeAccess.js` | getCurrentFile, getCurrentSheetOrder, getLastSelection, getFocusCell, getFlowData, getCell, getDataSize, getMaxRowIndex, getMaxColIndex, syncConfigToStore, syncDataToStore, getHeaderTotalHeight | 73 个文件 |
| `src/utils/domUtils.js` | getScrollPosition, getCellMainSize, getScrollAndSize, getMousePositionWithScroll, isInputBoxActive, resetInputBoxStyle, showModalMask, hideModalMask, isModalMaskVisible, isImageEditing, isFormulaDialogVisible, checkMenuOverflow, createSelectionSetDiv, getWindowSize | 25 个文件 |
| `src/utils/dialogUtils.js` | createDialog, createToolbarMenu | 仅 util.js 中转 |
| `src/utils/eventUtils.js` | bindNamespacedEvent, unbindNamespacedEvent | 仅 util.js 中转 |
| `src/utils/utilSub/rangeUtils.js` | isRowHidden, isColHidden, isCellValid, isMergeCell, iterateCellRange | 仅 util.js 中转 |
| `src/utils/utilSub/objectUtils.js` | deepClone, roundPrecision, isInfinite, formatNumericCell | 仅 util.js 中转 |
| `src/utils/utilSub/compareUtils.js` | compareValues | 仅 util.js 中转 |
| `src/utils/constants.js` | GENERAL_NUMBER_CT, ERROR_TYPES | 5 个文件 |
| `src/controllers/conditionformat/rangeParser.js` | parseConditionRange | 4 个文件 |
| `src/controllers/selection/htmlTableBuilder.js` | buildHtmlTable, getCellHtmlValue, getCellBorderStyle, getMergedCellBorderStyle, dataToJsonObject, dataToJsonNoHeaderObject | 2 个文件 |
| `src/global/draw/drawUtils.js` | initCanvasDefaults, getCellTextColor, getCellBgColor, drawGridLine, resetCanvasStroke, getRowStartEnd, getColStartEnd, drawBorder | 3 个文件 |

### 旧模式残留统计（实际验证结果）

| 旧模式 | 残留次数 | 残留文件数 | 主要残留文件 |
|--------|---------|-----------|-------------|
| `Store.luckysheetfile[getSheetIndex` | 51 | 17 | controlHistory.js(16), refreshOperation.js(8), border.js(4) |
| `parseInt($("#luckysheet-input-box").css("top"))` | 3 | 3 | sheetBar.js, scroll.js |
| `Store.config["rowhidden"]` | 7 | 4 | controlHistory.js(4), refreshOperation.js(1) |

### 构建验证
- ✅ `npm run build` 通过
