# 交替颜色模块（AlternateFormat）迁移文档

> 本文档为 Luckysheet 交替颜色模块从旧架构（jQuery + 全局Store + 对象字面量）迁移到新架构（TypeScript + 类继承 + 原生DOM）的完整指南。

---

## 目录

1. [模块总览](#1-模块总览)
2. [源文件逐一分析](#2-源文件逐一分析)
3. [新架构对应位置](#3-新架构对应位置)
4. [迁移映射表](#4-迁移映射表)
5. [测试用例](#5-测试用例)
6. [外部依赖方](#6-外部依赖方)

---

## 1. 模块总览

### 1.1 旧架构文件清单

| 文件路径 | 行数 | 核心职责 |
|---------|------|---------|
| `src/controllers/alternateformat/index.js` | 3 | 模块入口，重新导出子模块 |
| `src/controllers/alternateformat/alternateformatObj.js` | 929 | 旧版主对象（含所有方法），已被拆分 |
| `src/controllers/alternateformat/compute.js` | 142 | 计算引擎，根据规则生成computeMap |
| `src/controllers/alternateformat/compute.test.js` | - | compute模块单元测试 |
| `src/controllers/alternateformat/dialog.js` | 680 | 对话框UI逻辑（初始化、事件绑定、颜色选择） |
| `src/controllers/alternateformat/presetData.js` | 148 | 24种预设颜色模板数据 |
| `src/controllers/alternateformat/presetData.test.js` | - | presetData模块单元测试 |
| `src/controllers/alternateformat/ruleManager.js` | 280 | 规则管理（增删改查、历史记录） |
| `src/controllers/alternateformat.js` | 1 | 旧入口代理，转发到alternateformat/index.js |

### 1.2 旧架构核心问题

1. **对象字面量混入**：`alternateformatObj.js` 是一个929行的巨型对象，所有方法通过 `this` 互相引用
2. **jQuery重度依赖**：对话框模块大量使用 `$(selector)` DOM操作、`$(document).off().on()` 事件委托、`$.extend` 深拷贝、spectrum颜色选择器
3. **全局Store直访**：直接读写 `Store.luckysheet_select_save`、`Store.currentSheetIndex`、`Store.jfundo/jfredo`
4. **computeMap键为字符串**：`r + "_" + c` 作为键，无法利用TypeScript类型系统
5. **HTML模板硬编码**：对话框HTML以字符串拼接方式写在JS中
6. **新旧代码并存**：`alternateformatObj.js`（旧）和 `dialog.js` + `ruleManager.js`（新拆分）同时存在

---

## 2. 源文件逐一分析

### 2.1 index.js

**文件路径**: `src/controllers/alternateformat/index.js`

**功能描述**: 模块入口文件，重新导出子模块。

**导出**:
```js
export { default } from "./alternateformatObj";
export { FixedModelColor } from "./presetData";
export { checksAF, compute, getComputeMap } from "./compute";
```

**依赖**: 无外部依赖

**jQuery使用**: 无

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `default` (alternateformat对象) | `AlternateFormatService` 单例实例 |
| `FixedModelColor` | `ALTERNATE_FORMAT_PRESETS: AlternateFormatPreset[]` (常量) |
| `checksAF` | `ComputeMap.get(r, c): CellAlternateResult \| null` |
| `compute` | `ComputeEngine.compute(rules): ComputeMap` |
| `getComputeMap` | `AlternateFormatService.getComputeMap(): ComputeMap` |

---

### 2.2 compute.js

**文件路径**: `src/controllers/alternateformat/compute.js`（142行）

**功能描述**: 计算引擎。接收交替颜色规则数组，根据页眉/页脚/奇偶行设置，为每个单元格计算前景色和背景色。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `checksAF(r, c, computeMap)` | 检查单元格(r,c)是否有交替颜色计算结果 |
| `compute(obj)` | 遍历规则数组，按hasRowHeader/hasRowFooter计算每个单元格颜色 |
| `getComputeMap()` | 获取当前工作表的computeMap |

**依赖**:
| 导入 | 来源 |
|------|------|
| `Store` | `../../store` |
| `getCurrentFile` | `../../utils/storeAccess.js` |

**jQuery使用**: 无

**关键逻辑**:

`compute()` 根据4种组合计算单元格颜色：

| 组合 | 页眉行 | 中间行 | 页脚行 |
|------|--------|--------|--------|
| hasRowHeader && hasRowFooter | `format.head` | 奇偶交替 `format.one/format.two` | `format.foot` |
| hasRowHeader | `format.head` | 奇偶交替 `format.one/format.two` | 无 |
| hasRowFooter | 奇偶交替 `format.one/format.two` | 无 | `format.foot` |
| 都无 | 奇偶交替 `format.one/format.two` | 无 | 无 |

**computeMap写入格式**:
```js
computeMap[r + "_" + c] = [fc, bc]; // [前景色, 背景色]
```

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `checksAF(r, c, computeMap)` | `ComputeMap.get(r, c): CellAlternateResult \| null` |
| `compute(obj)` | `ComputeEngine.compute(rules): ComputeMap` |
| `getComputeMap()` | `AlternateFormatService.getComputeMap(): ComputeMap` |

**测试用例**:

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| compute空规则 | `compute([])` | `{}` |
| compute null | `compute(null)` | `{}` |
| checksAF有结果 | `checksAF(0, 0, {"0_0": ["#000","#fff"]})` | `["#000","#fff"]` |
| checksAF无结果 | `checksAF(5, 5, {"0_0": ["#000","#fff"]})` | `null` |
| 有页眉 | `compute([{cellrange:{row:[0,3],column:[0,1]}, format:obj, hasRowHeader:true, hasRowFooter:false}])` | 第0行使用head颜色，1-3行奇偶交替 |
| 有页脚 | `compute([{cellrange:{row:[0,3],column:[0,1]}, format:obj, hasRowHeader:false, hasRowFooter:true}])` | 第3行使用foot颜色，0-2行奇偶交替 |

---

### 2.3 presetData.js

**文件路径**: `src/controllers/alternateformat/presetData.js`（148行）

**功能描述**: 24种预设交替颜色模板数据。每种模板包含4组颜色：head（页眉）、one（奇数行）、two（偶数行）、foot（页脚），每组颜色包含fc（前景色）和bc（背景色）。

**导出**:
```js
export { FixedModelColor };
```

**数据结构**:
```js
FixedModelColor = [
  {
    "head": { "fc": "#000", "bc": "#bfbdbe" },
    "one":  { "fc": "#000", "bc": "#ffffff" },
    "two":  { "fc": "#000", "bc": "#f8f3f7" },
    "foot": { "fc": "#000", "bc": "#dde2de" }
  },
  // ... 共24种预设
]
```

**依赖**: 无

**jQuery使用**: 无

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `FixedModelColor` | `ALTERNATE_FORMAT_PRESETS: AlternateFormatPreset[]` (常量) |

---

### 2.4 ruleManager.js

**文件路径**: `src/controllers/alternateformat/ruleManager.js`（280行）

**功能描述**: 规则管理模块。负责范围映射、规则存在性检查、格式索引查找、规则新增/更新、历史记录管理和刷新触发。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getRangeMap(row, column)` | 将行列范围转为 `r_c` 键的映射对象 |
| `rangeIsExists(range, index)` | 检查范围是否与已有规则重叠 |
| `getIndexByFormat(format)` | 根据格式查找预设/自定义模板索引 |
| `getFormatByIndex(modelfocusIndex)` | 根据索引获取格式对象 |
| `newRule(cellrange, modelfocusIndex)` | 新增交替颜色规则 |
| `update(modelfocusIndex, rangefocus)` | 更新已有规则 |
| `ref(historyRules, currentRules)` | 保存undo/redo记录并刷新表格 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `Store` | `../../store` |
| `getRangetxt` | `../../methods/get` |
| `getCurrentFile` | `../../utils/storeAccess.js` |
| `isEditMode` | `../../global/validate` |
| `tooltip` | `../../global/tooltip` |
| `luckysheetrefreshgrid` | `../../global/refresh` |
| `FixedModelColor` | `./presetData` |
| `checksAF, getComputeMap, compute` | `./compute` |

**jQuery使用**:

| 行号 | jQuery API | 用途 |
|------|-----------|------|
| L31 | `$.extend(true, [], ...)` | 深拷贝规则数组 |
| L152 | `$.extend(true, [], ...)` | 深拷贝规则数组（历史快照） |
| L167 | `$.extend(true, [], ...)` | 深拷贝规则数组（当前快照） |
| L180 | `$("#...").data("index")` | 读取DOM数据属性 |
| L183 | `$("#... input").val().trim()` | 读取输入框值 |
| L212-213 | `$("#...").is(":checked")` | 检查复选框状态 |
| L237 | `$.extend(true, [], ...)` | 深拷贝规则数组 |

**ref()函数undo/redo数据结构**:
```js
Store.jfredo.push({
  "type": "updateAF",
  "sheetIndex": Store.currentSheetIndex,
  "data": { "historyRules": [...], "currentRules": [...] }
});
```

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `getRangeMap(row, column)` | `RangeUtils.toCellMap(row, column): Map<string, number>` |
| `rangeIsExists(range, index)` | `RuleManager.isRangeOverlapping(range, excludeIndex?): [boolean, number \| null]` |
| `getIndexByFormat(format)` | `TemplateRegistry.findIndex(format): number \| null` |
| `getFormatByIndex(modelfocusIndex)` | `TemplateRegistry.getFormat(index): AlternateFormatPreset` |
| `newRule(cellrange, modelfocusIndex)` | `RuleManager.addRule(cellrange, templateIndex): void` |
| `update(modelfocusIndex, rangefocus)` | `RuleManager.updateRule(templateIndex): void` |
| `ref(historyRules, currentRules)` | `HistoryManager.commitAndRefresh(history, current): void` |

---

### 2.5 dialog.js

**文件路径**: `src/controllers/alternateformat/dialog.js`（680行）

**功能描述**: 对话框UI模块。负责交替颜色设置对话框的初始化、事件绑定、模板渲染、颜色选择、范围选择等所有UI交互逻辑。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getModelBox(hasRowHeader, hasRowFooter)` | 生成预设/自定义模板列表HTML |
| `init()` | 初始化对话框，绑定所有事件 |
| `perfect()` | 编辑已有规则时填充对话框 |
| `checkboxChange(hasRowHeader, hasRowFooter)` | 页眉/页脚复选框变化处理 |
| `modelboxOn()` | 高亮选中的模板 |
| `modelToningColor()` | 根据选中模板更新调色板显示 |
| `addCustomModel(format)` | 添加自定义颜色模板 |
| `colorSelectDialog(currenColor, colorType, source)` | 弹出颜色选择对话框 |
| `rangeDialog(value)` | 弹出范围选择对话框 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `Store` | `../../store` |
| `locale` | `../../locale/locale` |
| `getRangetxt` | `../../methods/get` |
| `getCurrentFile` | `../../utils/storeAccess.js` |
| `replaceHtml` | `../../utils/util` |
| `luckysheetAlternateformatHtml, modelHTML` | `../constant` |
| `luckysheetsizeauto` | `../resize` |
| `selectHightlightShow` | `../select` |
| `FixedModelColor` | `./presetData` |
| `getRangeMap, rangeIsExists, ...` | `./ruleManager` |
| `checksAF, getComputeMap, compute` | `./compute` |

**jQuery使用**（极多，仅列关键API）:

| 行号范围 | jQuery API | 用途 |
|---------|-----------|------|
| L16-17 | `$("#...").empty()` | 清空模板列表 |
| L62,109 | `$("#...").append(html)` | 插入模板HTML |
| L117-118 | `$("body").append(html)`, `$("#...").remove()` | 创建/移除对话框 |
| L122-129 | `$("#...").click(fn)` | 绑定关闭按钮事件 |
| L128-166 | `$(document).off("ns").on("ns", selector, fn)` | 事件委托（输入框、范围选择、页眉页脚等） |
| L218 | `$(this).index()`, `$(this).parents().attr("id")` | 获取模板索引 |
| L236-246 | `$(this).closest()`, `$(this).find().hasClass()` | 判断颜色类型 |
| L267-413 | `$("#...").css()`, `$("#...").data()`, `$.extend()` | 颜色确认后更新DOM和数据 |
| L416-444 | `$(this).data("index")`, `$.extend()`, `$("#...").hide()` | 移除交替颜色 |
| L482-497 | `$("#...").prop("checked")`, `$("#...").show()/hide()` | 复选框状态和显示控制 |
| L506-515 | `$("#... .modelbox").removeClass("on")`, `$("#...").eq(i).addClass("on")` | 模板选中高亮 |
| L524-545 | `$("#...").css()`, `$("#...").data()` | 调色板颜色更新 |
| L574-581 | `$("body").append(replaceHtml(...))` | 创建颜色选择对话框 |
| L590-601 | `$(window).width/height()`, `$(document).scrollLeft/Top()`, `$(...).css()` | 对话框定位 |
| L596-638 | `$(...).spectrum({...})` | 初始化spectrum颜色选择器 |
| L657-667 | 同上 | 创建范围选择对话框并定位 |

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `getModelBox(hasRowHeader, hasRowFooter)` | `AlternateFormatDialog.renderTemplateList(hasRowHeader, hasRowFooter): string` |
| `init()` | `AlternateFormatDialogController.init(): void` |
| `perfect()` | `AlternateFormatDialogController.editExistingRule(): void` |
| `checkboxChange(hasRowHeader, hasRowFooter)` | `AlternateFormatDialogController.onHeaderFooterChange(hasRowHeader, hasRowFooter): void` |
| `modelboxOn()` | `AlternateFormatDialogController.highlightTemplate(): void` |
| `modelToningColor()` | `AlternateFormatDialogController.updateColorPalette(): void` |
| `addCustomModel(format)` | `TemplateRegistry.addCustom(format): void` |
| `colorSelectDialog(currenColor, colorType, source)` | `ColorSelectDialog.show(currentColor, colorType, source): void` |
| `rangeDialog(value)` | `RangeSelectDialog.show(value): void` |

---

### 2.6 alternateformatObj.js（旧版主对象）

**文件路径**: `src/controllers/alternateformat/alternateformatObj.js`（929行）

**功能描述**: 旧版主对象，包含所有交替颜色功能。已被拆分为 `dialog.js` + `ruleManager.js` + `compute.js`，但此文件仍作为默认导出使用。

**关键属性**:

| 属性 | 类型 | 说明 |
|------|------|------|
| `rangefocus` | boolean | 范围输入框是否聚焦 |
| `modelfocusIndex` | number \| null | 当前选中的模板索引 |
| `FixedModelColor` | Array | 预设颜色模板引用 |

**方法列表**（与dialog.js + ruleManager.js重复）:

| 方法 | 功能 | 对应新文件 |
|------|------|-----------|
| `getModelBox()` | 渲染模板列表 | dialog.js |
| `init()` | 初始化对话框 | dialog.js |
| `perfect()` | 编辑已有规则 | dialog.js |
| `checkboxChange()` | 复选框变化 | dialog.js |
| `modelboxOn()` | 模板高亮 | dialog.js |
| `modelToningColor()` | 调色板更新 | dialog.js |
| `addCustomModel()` | 添加自定义模板 | dialog.js |
| `colorSelectDialog()` | 颜色选择对话框 | dialog.js |
| `rangeDialog()` | 范围选择对话框 | dialog.js |
| `rangeIsExists()` | 范围重叠检查 | ruleManager.js |
| `getRangeMap()` | 范围映射 | ruleManager.js |
| `getIndexByFormat()` | 格式索引查找 | ruleManager.js |
| `getFormatByIndex()` | 索引获取格式 | ruleManager.js |
| `new()` | 新增规则 | ruleManager.js |
| `update()` | 更新规则 | ruleManager.js |
| `ref()` | 刷新表格 | ruleManager.js |

**迁移说明**: 此文件应在迁移完成后删除，所有功能已拆分到对应子模块。

---

### 2.7 alternateformat.js（旧入口代理）

**文件路径**: `src/controllers/alternateformat.js`（1行）

**功能描述**: 旧入口代理，转发到 `alternateformat/index.js`。

```js
export { default } from "./alternateformat/index";
```

**迁移说明**: 此文件应在迁移完成后删除，导入路径直接指向新架构。

---

## 3. 新架构对应位置

```
src/
  alternateformat/
    AlternateFormatService.ts          # 主服务类（替代index.js + alternateformatObj.js）
    ComputeEngine.ts                   # 计算引擎（替代compute.js）
    ComputeMap.ts                      # ComputeMap数据结构
    RuleManager.ts                     # 规则管理（替代ruleManager.js）
    TemplateRegistry.ts                # 模板注册表（预设+自定义模板管理）
    HistoryManager.ts                  # 历史记录管理
    constants.ts                       # 静态数据（替代presetData.js）
    types.ts                           # TypeScript接口定义
    dialog/
      AlternateFormatDialogController.ts  # 对话框控制器（替代dialog.js）
      ColorSelectDialog.ts               # 颜色选择对话框
      RangeSelectDialog.ts               # 范围选择对话框
      templates/                         # 对话框HTML模板
        alternateFormatDialog.tpl.ts
        colorSelectDialog.tpl.ts
        rangeSelectDialog.tpl.ts
```

---

## 4. 迁移映射表

### 4.1 函数级映射

| 旧函数 | 新类.方法 |
|--------|----------|
| `checksAF(r, c, computeMap)` | `ComputeMap.get(r, c): CellAlternateResult \| null` |
| `compute(obj)` | `ComputeEngine.compute(rules): ComputeMap` |
| `getComputeMap()` | `AlternateFormatService.getComputeMap(): ComputeMap` |
| `getRangeMap(row, column)` | `RangeUtils.toCellMap(row, column): Map<string, number>` |
| `rangeIsExists(range, index)` | `RuleManager.isRangeOverlapping(range, excludeIndex?): [boolean, number \| null]` |
| `getIndexByFormat(format)` | `TemplateRegistry.findIndex(format): number \| null` |
| `getFormatByIndex(index)` | `TemplateRegistry.getFormat(index): AlternateFormatPreset` |
| `newRule(cellrange, index)` | `RuleManager.addRule(cellrange, templateIndex): void` |
| `update(index, focus)` | `RuleManager.updateRule(templateIndex): void` |
| `ref(history, current)` | `HistoryManager.commitAndRefresh(history, current): void` |
| `getModelBox(header, footer)` | `AlternateFormatDialog.renderTemplateList(header, footer): string` |
| `init()` | `AlternateFormatDialogController.init(): void` |
| `perfect()` | `AlternateFormatDialogController.editExistingRule(): void` |
| `checkboxChange(header, footer)` | `AlternateFormatDialogController.onHeaderFooterChange(header, footer): void` |
| `modelboxOn()` | `AlternateFormatDialogController.highlightTemplate(): void` |
| `modelToningColor()` | `AlternateFormatDialogController.updateColorPalette(): void` |
| `addCustomModel(format)` | `TemplateRegistry.addCustom(format): void` |
| `colorSelectDialog(color, type, src)` | `ColorSelectDialog.show(color, type, src): void` |
| `rangeDialog(value)` | `RangeSelectDialog.show(value): void` |

### 4.2 数据结构映射

| 旧结构 | 新结构 |
|--------|--------|
| `computeMap["r_c"] = [fc, bc]` | `ComputeMap.set(r, c, { foregroundColor: fc, backgroundColor: bc })` |
| `FixedModelColor` (数组) | `ALTERNATE_FORMAT_PRESETS: AlternateFormatPreset[]` |
| `file.luckysheet_alternateformat_save` | `RuleManager.rules: AFRule[]` |
| `file.luckysheet_alternateformat_save_modelCustom` | `TemplateRegistry.customTemplates: AlternateFormatPreset[]` |

---

## 5. 测试用例

### 5.1 ComputeEngine

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 空规则 | `compute([])` | `{}` |
| null规则 | `compute(null)` | `{}` |
| 无页眉页脚 | 规则 `hasRowHeader:false, hasRowFooter:false` | 奇偶行交替 one/two |
| 有页眉 | 规则 `hasRowHeader:true` | 第0行用head颜色 |
| 有页脚 | 规则 `hasRowFooter:true` | 最后一行用foot颜色 |
| 页眉+页脚 | 规则两者都true | 第0行head，最后一行foot，中间奇偶交替 |
| 单行范围 | `row:[0,0]` | 仅一行，按页眉处理 |

### 5.2 RuleManager

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 范围不重叠 | 新范围与已有规则无交集 | `isRangeOverlapping` 返回 `[false, null]` |
| 范围重叠 | 新范围与已有规则有交集 | `isRangeOverlapping` 返回 `[true, index]` |
| 新增规则 | 有效cellrange | 规则数组长度+1 |
| 更新规则 | 修改已有规则 | 对应索引规则被更新 |
| 删除规则 | 移除最后一条 | 规则数组为空 |

### 5.3 TemplateRegistry

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 预设模板查找 | 匹配的format对象 | 返回0-23的索引 |
| 自定义模板查找 | 匹配的自定义format | 返回24+的索引 |
| 无匹配 | 不匹配的format | 返回null |
| 添加自定义 | 新format | customTemplates长度+1 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `global/draw/drawMain.js` | `getComputeMap()`, `checksAF()` | 绘制时获取交替颜色计算结果 |
| `global/draw/cellRender.js` | `checksAF(r, c, computeMap)` | 渲染单元格时应用交替颜色 |
| `global/api/conditionFormat.js` | 间接引用 | 条件格式API |
| `controllers/controlHistory.js` | `ref()` | 历史记录（undo/redo）中触发刷新 |
| `controllers/menuButton/toolbarInit/initFreezen.js` | 间接引用 | 工具栏冻结按钮 |
| `controllers/handler/globalEvents.js` | `init()` | 全局事件中初始化交替颜色 |
| `controllers/menuButton/styleRead.js` | `getComputeMap()`, `checksAF()` | 读取单元格样式 |
| `controllers/handler/rightClickButtons.js` | `getComputeMap()`, `checksAF()` | 右键菜单中检查交替颜色 |
