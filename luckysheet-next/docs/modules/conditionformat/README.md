# 条件格式模块（ConditionFormat）迁移文档

> 本文档为 Luckysheet 条件格式模块从旧架构（jQuery + 全局Store + 对象字面量）迁移到新架构（TypeScript + 类继承 + 原生DOM）的完整指南。文档覆盖每一个源文件、每一个函数、每一个依赖关系，确保仅凭此文档即可完成整个模块的实现。

---

## 目录

1. [模块总览](#1-模块总览)
2. [源文件逐一分析](#2-源文件逐一分析)
   - [2.1 index.js](#21-indexjs)
   - [2.2 compute.js](#22-computejs)
   - [2.3 computeSub/computeDefault.js](#23-computesubcomputedefaultjs)
   - [2.4 computeSub/computeDataBar.js](#24-computesubcomputedatabarjs)
   - [2.5 computeSub/computeColorGradation.js](#25-computesubcomputecolorgradationjs)
   - [2.6 computeSub/computeIcons.js](#26-computesubcomputeiconsjs)
   - [2.7 ruleManager.js](#27-rulemanagerjs)
   - [2.8 rangeParser.js](#28-rangeparserjs)
   - [2.9 rangeSplit.js](#29-rangesplitjs)
   - [2.10 utils.js](#210-utilsjs)
   - [2.11 data.js](#211-datajs)
   - [2.12 dialog/index.js](#212-dialogindexjs)
   - [2.13 dialog/initAdminRuleEvents.js](#213-dialoginitadminruleeventsjs)
   - [2.14 dialog/initConditionDialogEvents.js](#214-dialoginitconditiondialogeventsjs)
   - [2.15 dialog/initEditRuleEvents.js](#215-dialoginiteditruleeventsjs)
   - [2.16 dialog/initNewRuleEvents.js](#216-dialoginitnewruleeventsjs)
   - [2.17 dialog/initRangeAndCloseEvents.js](#217-dialoginitrangeandcloseeventsjs)
   - [2.18 dialog/initRuleTypeEvents.js](#218-dialoginitruletypeeventsjs)
   - [2.19 global/api/conditionFormat.js](#219-globalapiconditionformatjs)
3. [条件类型策略映射表](#3-条件类型策略映射表)
4. [规则类型策略映射表](#4-规则类型策略映射表)
5. [图标格式数据映射表](#5-图标格式数据映射表)
6. [外部依赖方列表](#6-外部依赖方列表)
7. [computeMap数据结构变更说明](#7-computemap数据结构变更说明)
8. [对话框迁移方案](#8-对话框迁移方案)
9. [新架构目录结构](#9-新架构目录结构)
10. [TypeScript接口定义](#10-typescript接口定义)

---

## 1. 模块总览

### 1.1 旧架构文件清单

| 文件路径 | 行数 | 核心职责 |
|---------|------|---------|
| `src/controllers/conditionformat/index.js` | 17 | 模块入口，合并所有子模块 |
| `src/controllers/conditionformat/compute.js` | 69 | 计算引擎入口，分发到4种计算子模块 |
| `src/controllers/conditionformat/computeSub/computeDefault.js` | 434 | 12种默认条件类型计算 |
| `src/controllers/conditionformat/computeSub/computeDataBar.js` | 128 | 数据条计算 |
| `src/controllers/conditionformat/computeSub/computeColorGradation.js` | 129 | 色阶计算 |
| `src/controllers/conditionformat/computeSub/computeIcons.js` | 301 | 图标集计算 |
| `src/controllers/conditionformat/ruleManager.js` | 240 | 规则管理（增删改查+历史记录） |
| `src/controllers/conditionformat/rangeParser.js` | 35 | 条件范围解析 |
| `src/controllers/conditionformat/rangeSplit.js` | 554 | 范围拆分（拖拽/复制粘贴时） |
| `src/controllers/conditionformat/utils.js` | 43 | 工具函数（范围文本转换） |
| `src/controllers/conditionformat/data.js` | 110 | 静态数据（数据条/色阶预设列表） |
| `src/controllers/conditionformat/dialog.js` | 1 | 对话框入口代理 |
| `src/controllers/conditionformat/dialog/index.js` | 787 | 对话框DOM构建+初始化 |
| `src/controllers/conditionformat/dialog/initAdminRuleEvents.js` | 102 | 管理规则对话框事件 |
| `src/controllers/conditionformat/dialog/initConditionDialogEvents.js` | 142 | 条件格式确认/图标选择事件 |
| `src/controllers/conditionformat/dialog/initEditRuleEvents.js` | 235 | 编辑规则对话框事件 |
| `src/controllers/conditionformat/dialog/initNewRuleEvents.js` | 267 | 新建规则对话框事件 |
| `src/controllers/conditionformat/dialog/initRangeAndCloseEvents.js` | 140 | 范围选择+关闭按钮事件 |
| `src/controllers/conditionformat/dialog/initRuleTypeEvents.js` | 56 | 规则类型切换事件 |
| `src/global/api/conditionFormat.js` | 505 | 公开API（3个导出函数） |

### 1.2 旧架构核心问题

1. **对象字面量混入**：`index.js` 通过展开运算符 `...` 合并6个子模块，所有方法混入同一个对象，无类型安全
2. **`_this` 传递**：所有子模块函数接收 `_this` 参数来访问主对象方法，形成隐式依赖
3. **jQuery重度依赖**：对话框模块大量使用jQuery DOM操作、事件委托、`$.extend`深拷贝、`$.inArray`
4. **全局Store直访**：直接读写 `Store.luckysheetfile`、`Store.luckysheet_select_save` 等
5. **computeMap键为字符串**：`r + "_" + c` 作为键，无法利用TypeScript类型系统
6. **HTML模板硬编码**：对话框HTML以字符串拼接方式写在JS中

---

## 2. 源文件逐一分析

### 2.1 index.js

**文件路径**: `src/controllers/conditionformat/index.js`

**功能描述**: 模块入口文件，通过对象展开将6个子模块合并为一个统一的 `conditionformat` 对象导出。

**导出**:
```js
export default conditionformat; // 包含所有子模块方法的对象
```

**依赖**:
| 导入 | 来源 |
|------|------|
| `dialogModule` | `./dialog.js` |
| `computeModule` | `./compute.js` |
| `ruleManagerModule` | `./ruleManager.js` |
| `rangeSplitModule` | `./rangeSplit.js` |
| `utilsModule` | `./utils.js` |
| `dataModule` | `./data.js` |

**jQuery使用**: 无

**新架构对应**: `ConditionFormatService` 类，通过依赖注入整合各子系统

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `conditionformat` (整个对象) | `ConditionFormatService` 单例实例 |

---

### 2.2 compute.js

**文件路径**: `src/controllers/conditionformat/compute.js`

**功能描述**: 计算引擎入口。接收规则数组，按 `type` 字段分发到4种计算子模块（dataBar / colorGradation / icons / default），返回 `computeMap`。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `compute(ruleArr, d)` | 遍历规则数组，按type分发计算，返回computeMap |
| `getComputeMap(sheetIndex?)` | 获取指定工作表（默认当前）的computeMap |
| `checksCF(r, c, computeMap)` | 检查单元格(r,c)是否有条件格式计算结果 |
| `getcolorGradation(color1, color2, value1, value2, value)` | 两色RGB线性插值 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `getSheetIndex` | `../../methods/get` |
| `Store` | `../../store` |
| `computeDataBar` | `./computeSub/computeDataBar.js` |
| `computeColorGradation` | `./computeSub/computeColorGradation.js` |
| `computeIcons` | `./computeSub/computeIcons.js` |
| `computeDefault` | `./computeSub/computeDefault.js` |

**jQuery使用**: 无

**关键逻辑**:
- `compute()` 中按 `type` 字段分发：`"dataBar"` → `computeDataBar`，`"colorGradation"` → `computeColorGradation`，`"icons"` → `computeIcons`，其余 → `computeDefault`
- `getComputeMap()` 从 `Store.luckysheetfile[index]` 读取 `luckysheet_conditionformat_save` 和 `data`
- `checksCF()` 使用 `r + "_" + c` 字符串键查找 computeMap
- `getcolorGradation()` 解析 `rgb(r, g, b)` 字符串进行线性插值

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `compute(ruleArr, d)` | `ComputeEngine.compute(ruleArr, data): ComputeMap` |
| `getComputeMap(sheetIndex?)` | `ConditionFormatService.getComputeMap(sheetIndex?): ComputeMap` |
| `checksCF(r, c, computeMap)` | `ComputeMap.get(r, c): CellComputeResult \| null` |
| `getcolorGradation(color1, color2, value1, value2, value)` | `ColorUtils.interpolateRgb(color1, color2, value1, value2, value): string` |

**测试用例**:

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| compute空规则 | `compute([], data)` | `{}` |
| compute null规则 | `compute(null, data)` | `undefined` |
| getComputeMap无数据 | sheetIndex指向data=null的工作表 | `null` |
| checksCF有结果 | `checksCF(0, 0, {"0_0": {textColor:"#f00"}})` | `{textColor:"#f00"}` |
| checksCF无结果 | `checksCF(5, 5, {"0_0": {textColor:"#f00"}})` | `null` |
| getcolorGradation | `getcolorGradation("rgb(255,0,0)", "rgb(0,0,255)", 0, 100, 50)` | `"rgb(128, 0, 128)"` |

---

### 2.3 computeSub/computeDefault.js

**文件路径**: `src/controllers/conditionformat/computeSub/computeDefault.js`（434行）

**功能描述**: 处理12种默认条件类型的计算逻辑。遍历cellrange中的每个单元格，根据条件名称判断是否符合条件，符合则写入computeMap。

**导出函数**:
```js
export function computeDefault(_this, computeMap, type, cellrange, format, ruleArr, i, d)
```

**参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `_this` | object | conditionformat主对象引用（用于调用`getcolorGradation`） |
| `computeMap` | object | 计算结果映射表 |
| `type` | string | 规则类型（此处始终为"default"） |
| `cellrange` | Array | 应用范围数组 |
| `format` | object | `{textColor, cellColor}` |
| `ruleArr` | Array | 完整规则数组 |
| `i` | number | 当前规则索引 |
| `d` | Array[][] | 二维单元格数据 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `genarate` | `../../../global/format` |
| `formula` | `../../../global/formula` |
| `getcellvalue` | `../../../global/getdata` |
| `isRealNull` | `../../../global/validate` |
| `getObjType` | `../../../utils/util` |

**jQuery使用**:
- 第379行：`$.inArray(conditionValue0, [0, 'asc', '0'])` 和 `$.inArray(conditionValue0, [1, '1', 'desc'])` — 用于 `sort` 条件类型判断排序方向

**12种条件类型详细逻辑**:

| # | conditionName | 行号范围 | 条件判断逻辑 | conditionValue |
|---|---------------|---------|-------------|----------------|
| 1 | `greaterThan` | L22-79 | `cell.v > conditionValue0` | `[value]` |
| 2 | `lessThan` | L22-79 | `cell.v < conditionValue0` | `[value]` |
| 3 | `equal` | L22-79 | `cell.v == conditionValue0` | `[value]` |
| 4 | `textContains` | L22-79 | `cell.v.toString().indexOf(conditionValue0) != -1` | `[text]` |
| 5 | `betweenness` | L80-116 | `cell.v >= vSmall && cell.v <= vBig`（自动比较大小） | `[value1, value2]` |
| 6 | `occurrenceDate` | L117-153 | `cell.ct.t == "d"` 且 `cellVal >= dSmall && cellVal <= dBig` | `[dateRange]` |
| 7 | `duplicateValue` | L154-203 | `conditionValue0=="0"` 重复值 / `"1"` 唯一值 | `["0"或"1"]` |
| 8 | `top10` | L204-264 | 排序后取前N项 | `[N]` |
| 9 | `top10%` | L204-264 | 排序后取前N%项 | `[N]` |
| 10 | `last10` | L204-264 | 排序后取后N项 | `[N]` |
| 11 | `last10%` | L204-264 | 排序后取后N%项 | `[N]` |
| 12 | `AboveAverage` | L265-321 | `cellVal > averageNum` | `["AboveAverage"]` |
| 13 | `SubAverage` | L265-321 | `cellVal < averageNum` | `["SubAverage"]` |
| 14 | `regExp` | L323-356 | `new RegExp(conditionValue0).test(cell.v)`，conditionValue1控制正/反匹配 | `[pattern, matchFlag?]` |
| 15 | `sort` | L357-391 | 升序时`cell.v > cellAbove.v` / 降序时`cell.v < cellAbove.v` | `[direction]` |
| 16 | `formula` | L392-431 | 用formula引擎执行公式，结果为truthy则匹配 | `[formulaExpr]` |

> 注：虽然常称"12种"，但实际代码中有16个分支（含regExp、sort、formula）。其中 `top10`/`top10%`/`last10`/`last10%` 和 `AboveAverage`/`SubAverage` 共享同一代码块。

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `computeDefault(...)` | `DefaultConditionStrategy` 基类 + 16个具体Strategy子类 |

**测试用例**:

| 条件类型 | 输入数据 | 条件值 | 预期结果 |
|---------|---------|--------|---------|
| greaterThan | `[{v:5}, {v:10}, {v:15}]` | `[10]` | 只有v=15的单元格被标记 |
| lessThan | `[{v:5}, {v:10}, {v:15}]` | `[10]` | 只有v=5的单元格被标记 |
| equal | `[{v:5}, {v:10}]` | `[10]` | 只有v=10的单元格被标记 |
| textContains | `[{v:"hello"}, {v:"world"}]` | `["ell"]` | 只有v="hello"被标记 |
| betweenness | `[{v:1}, {v:5}, {v:10}]` | `[3, 8]` | 只有v=5被标记 |
| occurrenceDate | `[{v:44927, ct:{t:"d"}}]` | `["2023-01-01-2023-12-31"]` | 在日期范围内的单元格被标记 |
| duplicateValue(0) | `[{v:1}, {v:1}, {v:2}]` | `["0"]` | v=1的两个单元格被标记 |
| duplicateValue(1) | `[{v:1}, {v:1}, {v:2}]` | `["1"]` | 只有v=2被标记 |
| top10 | `[{v:i} for i in 1..20]` | `[5]` | v=20,19,18,17,16被标记 |
| AboveAverage | `[{v:10}, {v:20}, {v:30}]` | `["AboveAverage"]` | v=20,30被标记（均值20） |
| regExp | `[{v:"abc"}, {v:"123"}]` | `["\\d+"]` | v="123"被标记 |
| sort(asc) | `[{v:1}, {v:3}, {v:2}]` | `[0]` | v=2被标记（3>2破坏升序） |
| formula | 任意 | `["=A1>5"]` | 公式结果为true的单元格被标记 |

---

### 2.4 computeSub/computeDataBar.js

**文件路径**: `src/controllers/conditionformat/computeSub/computeDataBar.js`（128行）

**功能描述**: 计算数据条格式。遍历范围找出最大值和最小值，然后为每个数值型单元格计算数据条长度比例。支持正数和负数两种情况。

**导出函数**:
```js
export function computeDataBar(_this, computeMap, type, cellrange, format, ruleArr, i, d)
```

**依赖**:
| 导入 | 来源 |
|------|------|
| `getObjType` | `../../../utils/util` |

**jQuery使用**: 无

**关键逻辑**:

1. **第一遍扫描**：找出cellrange中所有数值型单元格的最大值(max)和最小值(min)
2. **有负数时**：
   - `plusLen = Math.round(max / (max - min) * 10) / 10` — 正数占比
   - `minusLen = Math.round(Math.abs(min) / (max - min) * 10) / 10` — 负数占比
   - 负数单元格：`valueLen = Math.round(Math.abs(parseInt(cell.v)) / Math.abs(min) * 100) / 100`
   - 正数单元格：`valueLen = Math.round(parseInt(cell.v) / max * 100) / 100`
3. **全正数时**：
   - `plusLen = 1`
   - `valueLen = max==0 ? 1 : Math.round(parseInt(cell.v) / max * 100) / 100`

**computeMap写入格式**:

负数单元格：
```js
computeMap[r + "_" + c] = {
  "dataBar": {
    "valueType": "minus",
    "minusLen": minusLen,
    "valueLen": valueLen,
    "format": format  // 如 ["#638ec6", "#ffffff"]
  }
}
```

正数单元格：
```js
computeMap[r + "_" + c] = {
  "dataBar": {
    "valueType": "plus",
    "plusLen": plusLen,
    "minusLen": minusLen,  // 仅在有负数时存在
    "valueLen": valueLen,
    "format": format
  }
}
```

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `computeDataBar(...)` | `DataBarComputeStrategy.compute(ctx, rule, data): void` |

**测试用例**:

| 场景 | 数据 | 预期 |
|------|------|------|
| 全正数 | [10, 20, 30] | plusLen=1, valueLen分别为0.33, 0.67, 1.0 |
| 有负数 | [-10, 0, 20] | plusLen=0.7, minusLen=0.3 |
| 全零 | [0, 0, 0] | max=0, valueLen=1 |
| 空范围 | 无数值型单元格 | computeMap不变 |

---

### 2.5 computeSub/computeColorGradation.js

**文件路径**: `src/controllers/conditionformat/computeSub/computeColorGradation.js`（129行）

**功能描述**: 计算色阶格式。找出范围中的最大值、最小值和平均值，根据format数组长度决定两色或三色色阶，为每个数值型单元格计算渐变颜色。

**导出函数**:
```js
export function computeColorGradation(_this, computeMap, type, cellrange, format, ruleArr, i, d)
```

**依赖**:
| 导入 | 来源 |
|------|------|
| `getObjType` | `../../../utils/util` |

**jQuery使用**: 无（但通过 `_this.getcolorGradation()` 间接使用compute.js中的方法）

**关键逻辑**:

1. **第一遍扫描**：计算max、min、sum、count
2. **三色色阶**（format.length == 3）：
   - `avg = Math.floor(sum / count)`
   - 值==min → `format[2]`（最小值色）
   - min < 值 < avg → `getcolorGradation(format[2], format[1], min, avg, 值)`
   - 值==avg → `format[1]`（中间值色）
   - avg < 值 < max → `getcolorGradation(format[1], format[0], avg, max, 值)`
   - 值==max → `format[0]`（最大值色）
3. **两色色阶**（format.length == 2）：
   - 值==min → `format[1]`
   - min < 值 < max → `getcolorGradation(format[1], format[0], min, max, 值)`
   - 值==max → `format[0]`

**computeMap写入格式**:
```js
computeMap[r + "_" + c] = {
  "cellColor": "rgb(r, g, b)"  // 计算后的颜色
}
```

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `computeColorGradation(...)` | `ColorGradationComputeStrategy.compute(ctx, rule, data): void` |

**测试用例**:

| 场景 | format | 数据 | 预期 |
|------|--------|------|------|
| 三色色阶 | `["rgb(99,190,123)", "rgb(255,235,132)", "rgb(248,105,107)"]` | [1, 5, 10] | min→红, avg→黄, max→绿 |
| 两色色阶 | `["rgb(99,190,123)", "rgb(248,105,107)"]` | [1, 10] | min→红, max→绿 |
| 单值 | 三色 | [5, 5, 5] | 全部为format[1]（中间色） |

---

### 2.6 computeSub/computeIcons.js

**文件路径**: `src/controllers/conditionformat/computeSub/computeIcons.js`（301行）

**功能描述**: 计算图标集格式。根据format中的len（3/4/5）将数值范围等分为对应区间，为每个数值型单元格分配对应的图标位置（left/top偏移）。

**导出函数**:
```js
export function computeIcons(_this, computeMap, type, cellrange, format, ruleArr, i, d)
```

**参数说明**:
- `format.len`: 图标数量（3/4/5）
- `format.leftMin`: 图标集左偏移基准（0或5）
- `format.top`: 图标集行偏移（0-11）

**依赖**:
| 导入 | 来源 |
|------|------|
| `getObjType` | `../../../utils/util` |

**jQuery使用**: 无

**关键逻辑**:

1. 扫描max/min
2. `a = Math.floor((max - min + 1) / len)` — 每段长度
3. `b = (max - min + 1) % len` — 余数
4. 根据余数b的值决定分段方式（b==2, b==3, b==4, else）
5. len==3时：3个区间 [v1, v2, v3]，图标偏移 leftMin+2, leftMin+1, leftMin
6. len==4时：4个区间，图标偏移 leftMin+3, leftMin+2, leftMin+1, leftMin
7. len==5时：5个区间，图标偏移 leftMin+4, leftMin+3, leftMin+2, leftMin+1, leftMin

**computeMap写入格式**:
```js
computeMap[r + "_" + c] = {
  "icons": {
    "left": leftMin + offset,  // 图标在精灵图中的列偏移
    "top": top                  // 图标在精灵图中的行偏移
  }
}
```

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `computeIcons(...)` | `IconsComputeStrategy.compute(ctx, rule, data): void` |

**测试用例**:

| 场景 | len | 数据 | 预期 |
|------|-----|------|------|
| 3图标 | 3 | [1,2,3,4,5,6] | v1=[1,2], v2=[3,4], v3=[5,6] |
| 5图标 | 5 | [1..10] | 5个区间各2个值 |
| 单值 | 3 | [5,5,5] | 所有单元格同一图标 |

---

### 2.7 ruleManager.js

**文件路径**: `src/controllers/conditionformat/ruleManager.js`（240行）

**功能描述**: 规则管理模块。负责规则列表渲染、规则名称生成、规则增删、历史记录管理和刷新触发。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getConditionRuleList(index)` | 渲染管理规则对话框中的规则列表DOM |
| `getConditionRuleName(conditionName, conditionRange, conditionValue)` | 根据条件类型生成规则显示名称 |
| `updateItem(type, cellrange, format)` | 添加新规则或删除所有规则（type=="delSheet"） |
| `getHistoryRules(fileH)` | 从文件快照提取所有工作表的条件格式规则（用于undo） |
| `getCurrentRules(fileC)` | 从当前文件提取所有工作表的条件格式规则（用于redo） |
| `ref(historyRules, currentRules)` | 保存undo/redo记录并刷新表格 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `getSheetIndex` | `../../methods/get` |
| `chatatABC` | `../../utils/util` |
| `luckysheetrefreshgrid` | `../../global/refresh` |
| `luckysheet_CFiconsImg` | `../constant` |
| `locale` | `../../locale/locale` |
| `Store` | `../../store` |

**jQuery使用**:

| 行号 | jQuery API | 用途 |
|------|-----------|------|
| L12 | `$("#...").empty()` | 清空规则列表容器 |
| L54 | `$("#...").prepend(itemHtml)` | 插入规则项DOM |
| L56 | `$("#... canvas").each(fn)` | 遍历canvas元素绘制预览 |
| L57 | `$(this).closest(".item").attr("data-item")` | 获取规则索引 |
| L60 | `$(this).get(0).getContext("2d")` | 获取canvas 2D上下文 |
| L119 | `$("#... .item").eq(0).addClass("on")` | 默认选中第一项 |
| L182 | `$.extend(true, [], Store.luckysheetfile)` | 深拷贝文件快照 |
| L199 | `$.extend(true, [], Store.luckysheetfile)` | 深拷贝文件快照 |

**getConditionRuleName返回值映射**:

| conditionName | 返回格式 |
|---------------|---------|
| greaterThan | `"单元格值 > v"` |
| lessThan | `"单元格值 < v"` |
| betweenness | `"单元格值 介于 v 与 v2 之间"` |
| equal | `"单元格值 = v"` |
| textContains | `"单元格值包含 =v"` |
| occurrenceDate | `conditionValue` 原值 |
| duplicateValue(0) | `"重复值"` |
| duplicateValue(1) | `"唯一值"` |
| top10 | `"前 v 项"` |
| top10% | `"前 v% 项"` |
| last10 | `"后 v 项"` |
| last10% | `"后 v% 项"` |
| AboveAverage | `"高于平均值"` |
| SubAverage | `"低于平均值"` |
| formula | `"公式: =v"` |

**ref()函数undo/redo数据结构**:
```js
Store.jfredo.push({
  "type": "updateCF",
  "data": {
    "historyRules": [{sheetIndex, luckysheet_conditionformat_save}, ...],
    "currentRules": [{sheetIndex, luckysheet_conditionformat_save}, ...]
  }
});
```

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `getConditionRuleList(index)` | `RuleManager.renderRuleList(sheetIndex): RuleListItem[]` |
| `getConditionRuleName(...)` | `RuleNamer.getDisplayName(conditionName, conditionRange, conditionValue): string` |
| `updateItem(type, cellrange, format)` | `RuleManager.addRule(type, cellrange, format): void` |
| `getHistoryRules(fileH)` | `HistoryManager.snapshotRules(files): RuleSnapshot[]` |
| `getCurrentRules(fileC)` | `HistoryManager.currentRules(files): RuleSnapshot[]` |
| `ref(historyRules, currentRules)` | `HistoryManager.commitAndRefresh(history, current): void` |

**测试用例**:

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| getConditionRuleName greaterThan | `("greaterThan", [], [10])` | `"单元格值 > 10"` |
| getConditionRuleName betweenness | `("betweenness", [], [5, 10])` | `"单元格值 介于 5 与 10 之间"` |
| getConditionRuleName formula | `("formula", [], ["=A1>5"])` | `"公式: =A1>5"` |
| updateItem添加规则 | `("dataBar", [{row:[0,2],column:[0,2]}], ["#638ec6"])` | 规则数组长度+1 |
| updateItem删除 | `("delSheet", null, null)` | 规则数组为空 |

---

### 2.8 rangeParser.js

**文件路径**: `src/controllers/conditionformat/rangeParser.js`（35行）

**功能描述**: 解析条件值输入，支持单元格引用和直接数值两种方式。如果输入是有效的单元格地址，则提取该单元格的值作为条件值；否则将输入本身作为条件值。

**导出函数**:
```js
export function parseConditionRange(rangeText, _this, conditionformat_Text, options = {})
```

**参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `rangeText` | string | 用户输入的条件值文本 |
| `_this` | object | conditionformat主对象（调用`getRangeByTxt`和`infoDialog`） |
| `conditionformat_Text` | object | 国际化文本 |
| `options.data` | Array[][] | 单元格数据（默认Store.flowdata） |
| `options.allowNonNumeric` | boolean | 是否允许非数字输入（默认false） |

**返回值**: `{ conditionRange: Array, conditionValue: Array } | null`

**依赖**:
| 导入 | 来源 |
|------|------|
| `Store` | `../../store/index.js` |
| `getcellvalue` | `../../global/getdata.js` |

**jQuery使用**: 无

**关键逻辑**:
1. 调用 `_this.getRangeByTxt(rangeText)` 解析为范围数组
2. 如果解析出多个范围 → 报错"只能选择单个单元格"
3. 如果解析出1个范围且为单个单元格 → 提取单元格值，记录conditionRange和conditionValue
4. 如果解析出0个范围：
   - 输入为空或（不允许非数字且isNaN） → 报错
   - 否则直接使用输入文本作为conditionValue

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `parseConditionRange(...)` | `ConditionRangeParser.parse(text, i18n, options): ParseResult \| null` |

**测试用例**:

| 输入 | allowNonNumeric | 预期 |
|------|----------------|------|
| `"A1"` (A1=10) | false | `{conditionRange:[{row:[0,0],column:[0,0]}], conditionValue:[10]}` |
| `"10"` | false | `{conditionRange:[], conditionValue:["10"]}` |
| `"abc"` | false | `null`（报错） |
| `"abc"` | true | `{conditionRange:[], conditionValue:["abc"]}` |
| `"A1:B2"` | false | `null`（报错多单元格） |
| `""` | false | `null`（报错） |

---

### 2.9 rangeSplit.js

**文件路径**: `src/controllers/conditionformat/rangeSplit.js`（554行）

**功能描述**: 条件格式范围拆分模块。在拖拽、复制粘贴等操作时，需要将条件格式的应用范围与操作范围进行交叉计算，拆分为"操作部分"和"剩余部分"。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `CFSplitRange(range1, range2, range3, type)` | 拆分条件格式范围 |
| `getCFPartRange(sheetIndex, range1, range2)` | 获取与指定范围重叠的条件格式规则 |

**CFSplitRange参数说明**:
| 参数 | 说明 |
|------|------|
| `range1` | 条件格式的某个cellrange项 |
| `range2` | 条件格式应用范围的基准范围 |
| `range3` | 操作目标范围（拖拽目标） |
| `type` | `"allPart"` / `"restPart"` / `"operatePart"` |

**CFSplitRange的16种空间关系**:

| # | 空间关系 | 描述 |
|---|---------|------|
| 1 | range1完全在range2内 | 选区包含条件格式范围全部 |
| 2 | range1上边在range2内，下边超出 | 行贯穿上部分 |
| 3 | range1下边在range2内，上边超出 | 行贯穿下部分 |
| 4 | range1上下都超出range2 | 行贯穿中间部分 |
| 5 | range1左边在range2内，右边超出 | 列贯穿左部分 |
| 6 | range1右边在range2内，左边超出 | 列贯穿右部分 |
| 7 | range1左右都超出range2 | 列贯穿中间部分 |
| 8 | range1左上角在range2内 | 包含左上角 |
| 9 | range1右上角在range2内 | 包含右上角 |
| 10 | range1左下角在range2内 | 包含左下角 |
| 11 | range1右下角在range2内 | 包含右下角 |
| 12 | range1行贯穿且左列在range2内 | 左中间部分 |
| 13 | range1行贯穿且右列在range2内 | 右中间部分 |
| 14 | range1列贯穿且上行在range2内 | 上中间部分 |
| 15 | range1列贯穿且下行在range2内 | 下中间部分 |
| 16 | range1完全包含range2 | 正中间部分 |
| 17 | range1与range2无交集 | 在范围之外 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `getSheetIndex` | `../../methods/get` |
| `Store` | `../../store` |

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `CFSplitRange(range1, range2, range3, type)` | `RangeSplitter.split(range, cfBase, target, partType): CellRange[]` |
| `getCFPartRange(sheetIndex, range1, range2)` | `RangeSplitter.getOverlappingRules(sheetIndex, range): CFRule[]` |

**测试用例**:

| 场景 | range1 | range2 | range3 | type | 预期 |
|------|--------|--------|--------|------|------|
| 完全包含 | [0,5]x[0,5] | [0,5]x[0,5] | [3,8]x[3,8] | allPart | 操作部分+剩余部分 |
| 无交集 | [0,2]x[0,2] | [0,5]x[0,5] | [6,8]x[6,8] | restPart | 原range1 |
| 无交集 | [0,2]x[0,2] | [0,5]x[0,5] | [6,8]x[6,8] | operatePart | `[]` |

---

### 2.10 utils.js

**文件路径**: `src/controllers/conditionformat/utils.js`（43行）

**功能描述**: 工具函数模块，提供范围对象与文本表示之间的双向转换。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getTxtByRange(range)` | 将范围对象数组转换为文本表示（如"A1:B3,C1:D5"） |
| `getRangeByTxt(txt)` | 将文本表示解析为范围对象数组 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `getRangetxt` | `../../methods/get` |
| `formula` | `../../global/formula` |
| `Store` | `../../store` |

**jQuery使用**: 无

**关键逻辑**:
- `getTxtByRange`: 遍历range数组，对每个range调用 `getRangetxt()` 获取文本，用逗号连接
- `getRangeByTxt`: 按逗号分割文本，对每段调用 `formula.iscelldata()` 验证后调用 `formula.getcellrange()` 解析

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `getTxtByRange(range)` | `RangeUtils.toText(ranges: CellRange[]): string` |
| `getRangeByTxt(txt)` | `RangeUtils.fromText(text: string): CellRange[]` |

**测试用例**:

| 函数 | 输入 | 预期输出 |
|------|------|---------|
| getTxtByRange | `[{row:[0,2],column:[0,0]}]` | `"A1:A3"` |
| getTxtByRange | `[{row:[0,2],column:[0,0]}, {row:[0,0],column:[2,2]}]` | `"A1:A3,C1:C1"` |
| getRangeByTxt | `"A1:B3"` | `[{row:[0,2],column:[0,1]}]` |
| getRangeByTxt | `"A1:B3,C1:D5"` | `[{row:[0,2],column:[0,1]}, {row:[0,4],column:[2,3]}]` |
| getRangeByTxt | `"invalid"` | `[]` |

---

### 2.11 data.js

**文件路径**: `src/controllers/conditionformat/data.js`（110行）

**功能描述**: 静态预设数据模块，包含数据条和色阶的预设颜色列表。

**导出**:
```js
export default {
  fileClone: [],           // 文件深拷贝（管理规则时使用）
  editorRule: null,        // 当前编辑的规则
  selectRange: [],         // 选区范围（对话框选择范围时）
  selectStatus: false,     // 是否处于范围选择状态
  dataBarList: [...],      // 12种数据条预设
  colorGradationList: [...] // 12种色阶预设
}
```

**dataBarList（12项）**:

| 索引 | format | 描述 |
|------|--------|------|
| 0 | `["#638ec6", "#ffffff"]` | 蓝-白渐变 |
| 1 | `["#63c384", "#ffffff"]` | 绿-白渐变 |
| 2 | `["#ff555a", "#ffffff"]` | 红-白渐变 |
| 3 | `["#ffb628", "#ffffff"]` | 橙-白渐变 |
| 4 | `["#008aef", "#ffffff"]` | 浅蓝-白渐变 |
| 5 | `["#d6007b", "#ffffff"]` | 紫-白渐变 |
| 6 | `["#638ec6"]` | 蓝色实心 |
| 7 | `["#63c384"]` | 绿色实心 |
| 8 | `["#ff555a"]` | 红色实心 |
| 9 | `["#ffb628"]` | 橙色实心 |
| 10 | `["#008aef"]` | 浅蓝色实心 |
| 11 | `["#d6007b"]` | 紫色实心 |

**colorGradationList（12项）**:

| 索引 | format | 描述 |
|------|--------|------|
| 0 | `["rgb(99,190,123)", "rgb(255,235,132)", "rgb(248,105,107)"]` | 绿-黄-红 |
| 1 | `["rgb(248,105,107)", "rgb(255,235,132)", "rgb(99,190,123)"]` | 红-黄-绿 |
| 2 | `["rgb(99,190,123)", "rgb(252,252,255)", "rgb(248,105,107)"]` | 绿-白-红 |
| 3 | `["rgb(248,105,107)", "rgb(252,252,255)", "rgb(99,190,123)"]` | 红-白-绿 |
| 4 | `["rgb(90,138,198)", "rgb(252,252,255)", "rgb(248,105,107)"]` | 蓝-白-红 |
| 5 | `["rgb(248,105,107)", "rgb(252,252,255)", "rgb(90,138,198)"]` | 红-白-蓝 |
| 6 | `["rgb(252,252,255)", "rgb(248,105,107)"]` | 白-红 |
| 7 | `["rgb(248,105,107)", "rgb(252,252,255)"]` | 红-白 |
| 8 | `["rgb(99,190,123)", "rgb(252,252,255)"]` | 绿-白 |
| 9 | `["rgb(252,252,255)", "rgb(99,190,123)"]` | 白-绿 |
| 10 | `["rgb(99,190,123)", "rgb(255,235,132)"]` | 绿-黄 |
| 11 | `["rgb(255,235,132)", "rgb(99,190,123)"]` | 黄-绿 |

**迁移映射表**:

| 旧属性 | 新架构 |
|--------|--------|
| `fileClone` | `ConditionFormatService.fileClone: SheetFile[]` |
| `editorRule` | `ConditionFormatService.editorRule: EditorRuleState` |
| `selectRange` | `ConditionFormatService.selectRange: SelectionRange[]` |
| `selectStatus` | `ConditionFormatService.selectStatus: boolean` |
| `dataBarList` | `DATA_BAR_PRESETS: DataBarPreset[]` (常量) |
| `colorGradationList` | `COLOR_GRADATION_PRESETS: ColorGradationPreset[]` (常量) |

---

### 2.12 dialog/index.js

**文件路径**: `src/controllers/conditionformat/dialog/index.js`（787行）

**功能描述**: 对话框模块核心。负责所有条件格式相关对话框的DOM构建、初始化和辅助方法。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `ruleTypeHtml()` | 生成6种规则类型的HTML模板 |
| `textCellColorHtml()` | 生成文本颜色/单元格颜色选择器HTML |
| `init()` | 初始化所有对话框事件绑定 |
| `singleRangeDialog(source, value)` | 弹出单单元格选择对话框 |
| `multiRangeDialog(dataItem, value)` | 弹出多范围选择对话框 |
| `conditionformatDialog(title, content)` | 弹出条件格式设置对话框 |
| `CFiconsDialog()` | 弹出图标集选择对话框 |
| `administerRuleDialog()` | 弹出管理规则对话框 |
| `newConditionRuleDialog(source)` | 弹出新建规则对话框 |
| `editorConditionRuleDialog()` | 弹出编辑规则对话框 |
| `infoDialog(title, content)` | 弹出信息提示对话框 |
| `getRuleExplain(index)` | 根据规则类型索引生成规则说明HTML |
| `colorSelectInit()` | 初始化spectrum颜色选择器 |
| `daterangeInit(id)` | 初始化flatpickr日期范围选择器 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `getRangetxt` | `../../../methods/get` |
| `replaceHtml` | `../../../utils/util` |
| `modelHTML` | `../../constant` |
| `selectionCopyShow` | `../../select` |
| `luckysheetConfigsetting` | `../../luckysheetConfigsetting` |
| `locale` | `../../../locale/locale` |
| `Store` | `../../../store` |
| `dayjs` | `dayjs` |
| `initAdminRuleEvents` | `./initAdminRuleEvents.js` |
| `initNewRuleEvents` | `./initNewRuleEvents.js` |
| `initEditRuleEvents` | `./initEditRuleEvents.js` |
| `initRuleTypeEvents` | `./initRuleTypeEvents.js` |
| `initConditionDialogEvents` | `./initConditionDialogEvents.js` |
| `initRangeAndCloseEvents` | `./initRangeAndCloseEvents.js` |

**jQuery使用**（极多，仅列关键API）:

| 行号范围 | jQuery API | 用途 |
|---------|-----------|------|
| L73-95 | `$("body").append()`, `$(...).css()`, `$(window).width/height()`, `$(document).scrollLeft/Top()` | 创建+定位singleRangeDialog |
| L97-122 | 同上 | 创建+定位multiRangeDialog |
| L124-153 | 同上 + `$("#...").show()`, `$("#...").remove()` | 创建+定位conditionformatDialog |
| L155-233 | 同上 | 创建+定位CFiconsDialog |
| L234-294 | 同上 + `$("#... option:selected").val()` | 创建+定位administerRuleDialog |
| L296-331 | 同上 | 创建+定位newConditionRuleDialog |
| L333-513 | 同上 + `.spectrum("set", ...)`, `.addClass()`, `.siblings()`, `.find()`, `.each()`, `.attr()`, `.val()`, `.hide()`, `.show()` | 创建+定位+填充editorConditionRuleDialog |
| L515-536 | 同上 | 创建+定位infoDialog |
| L719-749 | `$(".luckysheet-conditionformat-config-color").spectrum({...})` | 初始化spectrum颜色选择器 |
| L751-784 | `$('.ranges_1 ul').remove()`, `$('#'+id).find('#daterange-btn').flatpickr({...})` | 初始化flatpickr日期选择器 |

**getRuleExplain的6种规则类型索引**:

| index | 规则类型 | 包含的子类型 |
|-------|---------|-------------|
| 0 | 基于各自值设置所有单元格格式 | dataBar / colorGradation / icons |
| 1 | 包含以下内容的单元格格式 | number(大于/小于/介于/等于) / text(包含) / date(发生日期) |
| 2 | 排名靠前或靠后的数值 | top / last |
| 3 | 高于或低于平均值 | AboveAverage / SubAverage |
| 4 | 唯一值或重复值 | 0(重复) / 1(唯一) |
| 5 | 使用公式确定 | formula |

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `ruleTypeHtml()` | `DialogTemplates.ruleTypeItems(): string` |
| `textCellColorHtml()` | `DialogTemplates.textCellColor(): string` |
| `init()` | `ConditionFormatDialogController.init(): void` |
| `singleRangeDialog(source, value)` | `SingleRangeDialog.show(source, value): void` |
| `multiRangeDialog(dataItem, value)` | `MultiRangeDialog.show(dataItem, value): void` |
| `conditionformatDialog(title, content)` | `ConditionDialog.show(title, content): void` |
| `CFiconsDialog()` | `IconsDialog.show(): void` |
| `administerRuleDialog()` | `AdminRuleDialog.show(): void` |
| `newConditionRuleDialog(source)` | `NewRuleDialog.show(source): void` |
| `editorConditionRuleDialog()` | `EditRuleDialog.show(): void` |
| `infoDialog(title, content)` | `InfoDialog.show(title, content): void` |
| `getRuleExplain(index)` | `DialogTemplates.ruleExplain(index): string` |
| `colorSelectInit()` | `ColorPickerService.init(container): void` |
| `daterangeInit(id)` | `DatePickerService.init(containerId): void` |

---

### 2.13 dialog/initAdminRuleEvents.js

**文件路径**: `src/controllers/conditionformat/dialog/initAdminRuleEvents.js`（102行）

**功能描述**: 管理规则对话框的事件绑定。包含切换工作表、选中规则项、确认保存、关闭、修改应用范围等事件。

**导出函数**:
```js
export function initAdminRuleEvents(_this)
```

**绑定的事件列表**:

| 事件命名空间 | 选择器 | 事件 | 功能 |
|-------------|--------|------|------|
| `change.CFchooseSheet` | `#... .chooseSheet` | change | 切换工作表，重新加载规则列表 |
| `click.CFadministerRuleItem` | `#... .ruleList .listBox .item` | click | 选中规则项（高亮） |
| `click.CFadministerRuleConfirm` | `#...-confirm` | click | 确认保存所有修改 |
| `click.CFadministerRuleClose` | `#...-close` | click | 关闭对话框，放弃修改 |
| `click.CFadministerRuleFa` | `#... .item .fa-table` | click | 修改规则应用范围 |
| `click.CFmultiRangeConfirm` | `#luckysheet-multiRange-dialog-confirm` | click | 确认范围选择 |
| `click.CFmultiRangeClose` | `#luckysheet-multiRange-dialog-close` | click | 取消范围选择 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `getSheetIndex` | `../../../methods/get` |
| `Store` | `../../../store` |
| `selectionCopyShow` | `../../select` |
| `sheetmanage` | `../../sheetmanage` |

**jQuery使用**:

| 行号 | API | 用途 |
|------|-----|------|
| L8 | `$(document).off().on()` | 事件委托 |
| L13 | `$(this).addClass().siblings().removeClass()` | 切换选中样式 |
| L17 | `$.extend(true, [], ...)` | 深拷贝 |
| L33-34 | `$("#...").hide()` | 隐藏对话框 |
| L42-43 | `$(this).parents().hide()` | 隐藏父对话框 |
| L47 | `$(this).siblings("input").val()` | 获取范围文本 |

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `initAdminRuleEvents(_this)` | `AdminRuleDialog.bindEvents(): void` |

---

### 2.14 dialog/initConditionDialogEvents.js

**文件路径**: `src/controllers/conditionformat/dialog/initConditionDialogEvents.js`（142行）

**功能描述**: 条件格式确认对话框和图标集选择对话框的事件绑定。

**导出函数**:
```js
export function initConditionDialogEvents(_this)
```

**绑定的事件列表**:

| 事件命名空间 | 选择器 | 事件 | 功能 |
|-------------|--------|------|------|
| `click.CFdeleteConditionRule` | `#deleteConditionRule` | click | 删除选中的规则 |
| `click.CFdefault` | `#luckysheet-conditionformat-dialog-confirm` | click | 确认条件格式设置 |
| `click.CFicons` | `#luckysheet-CFicons-dialog .item` | click | 选择图标集 |

**CFdefault确认事件的详细逻辑**:

1. 从DOM读取 `conditionName`
2. 根据 `conditionName` 分支解析条件值：
   - `greaterThan/lessThan/equal/textContains` → `parseConditionRange(v)`
   - `betweenness` → `parseConditionRange(v1)` + `parseConditionRange(v2)`
   - `occurrenceDate` → 读取日期选择器值
   - `duplicateValue` → 读取下拉选项值
   - `top10/top10%/last10/last10%` → 验证整数1-1000
   - `AboveAverage/SubAverage` → 推入条件名
3. 读取颜色选择器值（spectrum）
4. 构建规则对象并保存
5. 调用 `ref()` 刷新

**依赖**:
| 导入 | 来源 |
|------|------|
| `parseConditionRange` | `../rangeParser.js` |
| `getSheetIndex` | `../../../methods/get` |
| `getCurrentFile` | `../../../utils/storeAccess.js` |
| `Store` | `../../../store` |
| `locale` | `../../../locale/locale` |

**jQuery使用**:

| 行号 | API | 用途 |
|------|-----|------|
| L10 | `$(document).off().on()` | 事件委托 |
| L11 | `$("#... option:selected").val()` | 获取选中工作表 |
| L20 | `$("#...").attr("data-itemvalue")` | 获取条件名 |
| L28 | `$("#...").val().trim()` | 获取条件值 |
| L86-87 | `$("#checkTextColor").is(":checked")` | 检查复选框 |
| L87 | `$("#textcolorshow").spectrum("get").toHexString()` | 获取颜色值 |
| L99 | `$.extend(true, [], ...)` | 深拷贝 |
| L105 | `$.extend(true, [], ...)` | 深拷贝 |
| L117 | `$.extend(true, [], ...)` | 深拷贝 |
| L124-125 | `$("#...").hide()` | 隐藏对话框 |
| L133 | `$.extend(true, [], ...)` | 深拷贝 |

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `initConditionDialogEvents(_this)` | `ConditionDialog.bindEvents(): void` |

---

### 2.15 dialog/initEditRuleEvents.js

**文件路径**: `src/controllers/conditionformat/dialog/initEditRuleEvents.js`（235行）

**功能描述**: 编辑规则对话框的事件绑定。包含打开编辑对话框、确认编辑、取消编辑等事件。

**导出函数**:
```js
export function initEditRuleEvents(_this)
```

**绑定的事件列表**:

| 事件命名空间 | 选择器 | 事件 | 功能 |
|-------------|--------|------|------|
| `click.CFeditorConditionRule` | `#editorConditionRule` | click | 打开编辑规则对话框 |
| `click.CFeditorConditionRuleConfirm` | `#luckysheet-editorConditionRule-dialog-confirm` | click | 确认编辑 |
| `click.CFeditorConditionRuleClose` | `#luckysheet-editorConditionRule-dialog-close` | click | 取消编辑 |

**确认编辑的详细逻辑**:

与新建规则类似，但：
1. 从 `_this.editorRule` 读取当前编辑的规则
2. 保留原有的 `cellrange`
3. 修改 `_this.fileClone` 中的对应规则（而非直接修改Store）
4. 确认后重新渲染管理规则对话框

**依赖**:
| 导入 | 来源 |
|------|------|
| `getSheetIndex` | `../../../methods/get` |
| `parseConditionRange` | `../rangeParser.js` |
| `locale` | `../../../locale/locale` |

**jQuery使用**: 大量DOM读写，与initNewRuleEvents类似

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `initEditRuleEvents(_this)` | `EditRuleDialog.bindEvents(): void` |

---

### 2.16 dialog/initNewRuleEvents.js

**文件路径**: `src/controllers/conditionformat/dialog/initNewRuleEvents.js`（267行）

**功能描述**: 新建规则对话框的事件绑定。包含打开新建对话框、确认新建、取消新建等事件。

**导出函数**:
```js
export function initNewRuleEvents(_this)
```

**绑定的事件列表**:

| 事件命名空间 | 选择器 | 事件 | 功能 |
|-------------|--------|------|------|
| `click.CFnewConditionRule` | `#newConditionRule` | click | 打开新建规则对话框 |
| `click.CFnewConditionRuleConfirm` | `#luckysheet-newConditionRule-dialog-confirm` | click | 确认新建规则 |
| `click.CFnewConditionRuleClose` | `#luckysheet-newConditionRule-dialog-close` | click | 取消新建 |

**确认新建的详细逻辑**:

1. 读取规则类型索引 `index` 和子类型 `type1`/`type2`
2. index==0 时：根据type1构建dataBar/colorGradation/icons规则
3. index==1-5 时：根据type1解析conditionName、conditionRange、conditionValue，构建default规则
4. 根据 `source` 决定保存方式：
   - `source==0`：直接保存到Store（从工具栏快捷入口）
   - `source==1`：暂存到fileClone（从管理规则对话框入口）
5. 调用 `ref()` 刷新或重新渲染管理规则对话框

**依赖**:
| 导入 | 来源 |
|------|------|
| `parseConditionRange` | `../rangeParser.js` |
| `tooltip` | `../../../global/tooltip` |
| `isEditMode` | `../../../global/validate` |
| `getSheetIndex` | `../../../methods/get` |
| `getCurrentFile` | `../../../utils/storeAccess.js` |
| `Store` | `../../../store` |
| `locale` | `../../../locale/locale` |

**jQuery使用**:

| 行号 | API | 用途 |
|------|-----|------|
| L32 | `$(this).parents().find().spectrum("get").toHexString()` | 获取数据条颜色 |
| L42 | `$.extend(true, [], Store.luckysheet_select_save)` | 深拷贝选区 |
| L47-49 | `.spectrum("get").toRgbString()` | 获取色阶RGB颜色 |
| L64-66 | `.attr("data-len/data-leftmin/data-top")` | 获取图标集参数 |
| L87-88 | `$("#... input").val().trim()` | 获取条件值 |
| L147,153 | `$("#... #isPercent").is(":selected")` | 检查百分比选项 |
| L195-196 | `$("#... #checkTextColor").is(":checked")` + `.spectrum("get")` | 获取文本颜色 |
| L227,234 | `$.extend(true, [], ...)` | 深拷贝 |

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `initNewRuleEvents(_this)` | `NewRuleDialog.bindEvents(): void` |

---

### 2.17 dialog/initRangeAndCloseEvents.js

**文件路径**: `src/controllers/conditionformat/dialog/initRangeAndCloseEvents.js`（140行）

**功能描述**: 范围选择和关闭按钮的事件绑定。处理单元格选择对话框的确认/取消，以及各对话框右上角关闭按钮的逻辑。

**导出函数**:
```js
export function initRangeAndCloseEvents(_this)
```

**绑定的事件列表**:

| 事件 | 选择器 | 功能 |
|------|--------|------|
| click | `.range .fa-table` | 打开单元格选择对话框 |
| click | `#luckysheet-singleRange-dialog-confirm` | 确认单元格选择 |
| click | `#luckysheet-singleRange-dialog-close` | 取消单元格选择 |
| click | `.luckysheet-modal-dialog-title-close` | 对话框右上角关闭 |
| click | `#luckysheet-conditionformat-info-dialog-close` | 关闭信息提示 |

**source编码规则**:

| source值 | 含义 |
|----------|------|
| `0_1` | conditionformatDialog的条件值1 |
| `0_2` | conditionformatDialog的条件值2 |
| `1_0` | newConditionRuleDialog的公式条件 |
| `1_1` | newConditionRuleDialog的条件值1 |
| `1_2` | newConditionRuleDialog的条件值2 |
| `2_0` | editorConditionRuleDialog的公式条件 |
| `2_1` | editorConditionRuleDialog的条件值1 |
| `2_2` | editorConditionRuleDialog的条件值2 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `selectionCopyShow` | `../../select` |

**jQuery使用**: 大量 `$(document).on()`, `$(this).parents()`, `$("#...").show()/hide()`, `$(this).attr()`, `$(this).siblings().val()`

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `initRangeAndCloseEvents(_this)` | `RangeSelectionController.bindEvents(): void` |

---

### 2.18 dialog/initRuleTypeEvents.js

**文件路径**: `src/controllers/conditionformat/dialog/initRuleTypeEvents.js`（56行）

**功能描述**: 新建/编辑规则对话框中规则类型切换的事件绑定。

**导出函数**:
```js
export function initRuleTypeEvents(_this)
```

**绑定的事件列表**:

| 事件命名空间 | 选择器 | 事件 | 功能 |
|-------------|--------|------|------|
| `click.CFnewEditorRuleItem` | `.luckysheet-newEditorRule-dialog .ruleTypeItem` | click | 切换规则类型，重新渲染规则说明 |
| `change.CFnewEditorRuleType1` | `.luckysheet-newEditorRule-dialog #type1` | change | 切换子类型（dataBar/colorGradation/icons/number/text/date），显示对应面板 |
| `change.CFnewEditorRuleType2` | `.luckysheet-newEditorRule-dialog #type2` | change | 切换二级子类型（三色/两色色阶、大于/小于/介于/等于等） |
| `click.CFiconsShowbox` | `.luckysheet-newEditorRule-dialog .iconsBox .showbox` | click | 展开/收起图标选择列表 |
| `click.CFiconsLi` | `.luckysheet-newEditorRule-dialog .iconsBox li` | click | 选择图标，更新showbox显示 |

**依赖**: 无外部依赖

**jQuery使用**: `$(document).off().on()`, `$(this).addClass().siblings().removeClass()`, `$(this).index()`, `$(this).parents().find().html()`, `$(this).find("option:selected").val()`, `.show()/.hide()/.toggle()`, `.css("background-position")`, `.attr()`

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `initRuleTypeEvents(_this)` | `RuleTypeSelector.bindEvents(): void` |

---

### 2.19 global/api/conditionFormat.js

**文件路径**: `src/global/api/conditionFormat.js`（505行）

**功能描述**: 条件格式的公开API模块，提供3个导出函数供外部调用。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `setRangeConditionalFormatDefault(conditionName, conditionValue, options?)` | 设置默认条件格式规则 |
| `setRangeConditionalFormat(type, options?)` | 设置数据条/色阶/图标集规则 |
| `deleteRangeConditionalFormat(itemIndex, options?)` | 删除指定索引的条件格式规则 |

**setRangeConditionalFormatDefault参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `conditionName` | string | 条件名称（14种之一） |
| `conditionValue` | Array | 条件值数组 |
| `options.format` | object | `{textColor, cellColor}` |
| `options.cellrange` | Array/string | 应用范围 |
| `options.order` | number | 工作表顺序 |
| `options.success` | Function | 成功回调 |

**支持的conditionName值**:
`greaterThan`, `lessThan`, `betweenness`, `equal`, `textContains`, `occurrenceDate`, `duplicateValue`, `top10`, `top10%`, `last10`, `last10%`, `AboveAverage`, `SubAverage`, `regExp`, `sort`

**setRangeConditionalFormat参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | string | `"dataBar"` / `"colorGradation"` / `"icons"` |
| `options.format` | Array/object | 格式配置 |
| `options.cellrange` | Array/string | 应用范围 |
| `options.order` | number | 工作表顺序 |
| `options.success` | Function | 成功回调 |

**deleteRangeConditionalFormat参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `itemIndex` | number | 规则索引 |
| `options.order` | number | 工作表顺序 |
| `options.success` | Function | 成功回调 |

**依赖**:
| 导入 | 来源 |
|------|------|
| `conditionformat` | `../../controllers/conditionformat` |
| `parseConditionRange` | `../../controllers/conditionformat/rangeParser.js` |
| `sheetmanage` | `../../controllers/sheetmanage` |
| `locale` | `../../locale/locale` |
| `Store` | `../../store` |
| `getObjType` | `../../utils/util` |
| `getCurrentSheetOrder` | `../../utils/storeAccess.js` |
| `diff`, `isdatetime` | `../datecontroll` |
| `tooltip` | `../tooltip` |
| `isRealNum` | `../validate` |
| `dayjs` | `dayjs` |

**jQuery使用**:

| 行号 | API | 用途 |
|------|-----|------|
| L181 | `$.extend(true, [], Store.luckysheetfile)` | 深拷贝 |
| L189 | `$.extend(true, [], Store.luckysheetfile)` | 深拷贝 |
| L437 | `$.extend(true, [], Store.luckysheetfile)` | 深拷贝 |
| L445 | `$.extend(true, [], Store.luckysheetfile)` | 深拷贝 |
| L474 | `$.extend(true, [], file.luckysheet_conditionformat_save)` | 深拷贝 |
| L486 | `$.extend(true, [], Store.luckysheetfile)` | 深拷贝 |
| L492 | `$.extend(true, [], Store.luckysheetfile)` | 深拷贝 |

**迁移映射表**:

| 旧函数 | 新架构 |
|--------|--------|
| `setRangeConditionalFormatDefault(...)` | `ConditionFormatAPI.setDefaultRule(conditionName, conditionValue, options): void` |
| `setRangeConditionalFormat(type, options)` | `ConditionFormatAPI.setVisualRule(type, options): void` |
| `deleteRangeConditionalFormat(itemIndex, options)` | `ConditionFormatAPI.deleteRule(itemIndex, options): CFRule \| undefined` |

**测试用例**:

| API | 输入 | 预期 |
|-----|------|------|
| setRangeConditionalFormatDefault | `("greaterThan", [10], {format:{textColor:"#f00",cellColor:"#ffc7ce"}})` | 新增一条greaterThan规则 |
| setRangeConditionalFormatDefault | `("invalid", [10])` | tooltip提示参数无效 |
| setRangeConditionalFormat | `("dataBar", {format:["#638ec6","#ffffff"]})` | 新增一条dataBar规则 |
| setRangeConditionalFormat | `("icons", {format:"threeWayArrowMultiColor"})` | format被转换为`{len:3,leftMin:0,top:0}` |
| setRangeConditionalFormat | `("invalid", {})` | tooltip提示参数无效 |
| deleteRangeConditionalFormat | `(0, {order:0})` | 删除第一条规则，返回被删除的规则 |
| deleteRangeConditionalFormat | `(999)` | tooltip提示索引无效 |

---

## 3. 条件类型策略映射表

将 `computeDefault.js` 中的16个条件分支拆分为独立的Strategy类，遵循策略模式。

| # | conditionName | Strategy类 | 父类 | 核心判断方法 |
|---|---------------|-----------|------|-------------|
| 1 | `greaterThan` | `GreaterThanStrategy` | `CellValueStrategy` | `evaluate(cell, value): cell.v > value[0]` |
| 2 | `lessThan` | `LessThanStrategy` | `CellValueStrategy` | `evaluate(cell, value): cell.v < value[0]` |
| 3 | `equal` | `EqualStrategy` | `CellValueStrategy` | `evaluate(cell, value): cell.v == value[0]` |
| 4 | `textContains` | `TextContainsStrategy` | `CellValueStrategy` | `evaluate(cell, value): cell.v.toString().includes(value[0])` |
| 5 | `betweenness` | `BetweennessStrategy` | `CellValueStrategy` | `evaluate(cell, value): cell.v >= min(v1,v2) && cell.v <= max(v1,v2)` |
| 6 | `occurrenceDate` | `OccurrenceDateStrategy` | `CellValueStrategy` | `evaluate(cell, value): cell.ct.t=="d" && cellVal in [dSmall, dBig]` |
| 7 | `duplicateValue` | `DuplicateValueStrategy` | `RangeAggregateStrategy` | `evaluate(cells, value): value=="0"?重复:唯一` |
| 8 | `top10` | `TopNStrategy` | `RankingStrategy` | `evaluate(cells, value): 排序取前N项` |
| 9 | `top10%` | `TopPercentStrategy` | `RankingStrategy` | `evaluate(cells, value): 排序取前N%项` |
| 10 | `last10` | `BottomNStrategy` | `RankingStrategy` | `evaluate(cells, value): 排序取后N项` |
| 11 | `last10%` | `BottomPercentStrategy` | `RankingStrategy` | `evaluate(cells, value): 排序取后N%项` |
| 12 | `AboveAverage` | `AboveAverageStrategy` | `AverageStrategy` | `evaluate(cells, value): cellVal > avg` |
| 13 | `SubAverage` | `SubAverageStrategy` | `AverageStrategy` | `evaluate(cells, value): cellVal < avg` |
| 14 | `regExp` | `RegExpStrategy` | `CellValueStrategy` | `evaluate(cell, value): new RegExp(value[0]).test(cell.v)` |
| 15 | `sort` | `SortOrderStrategy` | `CellValueStrategy` | `evaluate(cell, value): 检查与上行值的排序关系` |
| 16 | `formula` | `FormulaStrategy` | `CellValueStrategy` | `evaluate(cell, value): formula.execfunction() == true` |

**Strategy基类设计**:

```typescript
abstract class ConditionStrategy {
  abstract readonly conditionName: string;
  abstract evaluate(ctx: ComputeContext, cell: CellObject, conditionValue: any[], cellrange: CellRange[], d: CellData[][]): boolean;
  getFormat(format: DefaultFormat): CellComputeResult {
    return { textColor: format.textColor, cellColor: format.cellColor };
  }
}

class ConditionStrategyRegistry {
  private strategies: Map<string, ConditionStrategy>;
  get(name: string): ConditionStrategy;
  register(strategy: ConditionStrategy): void;
}
```

---

## 4. 规则类型策略映射表

4种规则类型（`type`字段）对应4种计算策略。

| type值 | ComputeStrategy类 | 核心方法 | computeMap写入字段 |
|--------|-------------------|---------|-------------------|
| `"default"` | `DefaultComputeStrategy` | `compute(ctx, rule, data)` | `textColor`, `cellColor` |
| `"dataBar"` | `DataBarComputeStrategy` | `compute(ctx, rule, data)` | `dataBar: {valueType, plusLen, minusLen, valueLen, format}` |
| `"colorGradation"` | `ColorGradationComputeStrategy` | `compute(ctx, rule, data)` | `cellColor` (RGB插值) |
| `"icons"` | `IconsComputeStrategy` | `compute(ctx, rule, data)` | `icons: {left, top}` |

**ComputeStrategy基类设计**:

```typescript
abstract class ComputeStrategy {
  abstract readonly type: string;
  abstract compute(ctx: ComputeContext, rule: CFRule, data: CellData[][]): void;
}

class ComputeStrategyRegistry {
  private strategies: Map<string, ComputeStrategy>;
  get(type: string): ComputeStrategy;
}
```

**ComputeEngine**:

```typescript
class ComputeEngine {
  constructor(private strategyRegistry: ComputeStrategyRegistry) {}
  compute(rules: CFRule[], data: CellData[][]): ComputeMap {
    const map = new ComputeMap();
    for (const rule of rules) {
      const strategy = this.strategyRegistry.get(rule.type);
      strategy.compute(map, rule, data);
    }
    return map;
  }
}
```

---

## 5. 图标格式数据映射表

20种图标集格式，从API字符串名映射到精灵图坐标参数。

| # | API名称(format字符串) | len | leftMin | top | 中文名 |
|---|----------------------|-----|---------|-----|--------|
| 1 | `threeWayArrowMultiColor` | 3 | 0 | 0 | 三向箭头（彩色） |
| 2 | `threeTriangles` | 3 | 0 | 1 | 三个三角形 |
| 3 | `fourWayArrowMultiColor` | 4 | 0 | 2 | 四向箭头（彩色） |
| 4 | `fiveWayArrowMultiColor` | 5 | 0 | 3 | 五向箭头（彩色） |
| 5 | `threeWayArrowGrayColor` | 3 | 5 | 0 | 三向箭头（灰色） |
| 6 | `fourWayArrowGrayColor` | 4 | 5 | 1 | 四向箭头（灰色） |
| 7 | `fiveWayArrowGrayColor` | 5 | 5 | 2 | 五向箭头（灰色） |
| 8 | `threeColorTrafficLightRimless` | 3 | 0 | 4 | 三色交通灯（无边框） |
| 9 | `threeSigns` | 3 | 0 | 5 | 三个标志 |
| 10 | `greenRedBlackGradient` | 4 | 0 | 6 | 绿红黑渐变 |
| 11 | `threeColorTrafficLightBordered` | 3 | 5 | 4 | 三色交通灯（有边框） |
| 12 | `fourColorTrafficLight` | 4 | 5 | 5 | 四色交通灯 |
| 13 | `threeSymbolsCircled` | 3 | 0 | 7 | 三个符号（带圈） |
| 14 | `tricolorFlag` | 3 | 0 | 8 | 三色旗 |
| 15 | `threeSymbolsnoCircle` | 3 | 5 | 7 | 三个符号（无圈） |
| 16 | `threeStars` | 3 | 0 | 9 | 三颗星 |
| 17 | `fiveQuadrantDiagram` | 5 | 0 | 10 | 五象限图 |
| 18 | `fiveBoxes` | 5 | 0 | 11 | 五个方框 |
| 19 | `grade4` | 4 | 5 | 9 | 四等级 |
| 20 | `grade5` | 5 | 5 | 10 | 五等级 |

**TypeScript常量定义**:

```typescript
const ICON_FORMAT_MAP: Record<string, IconsFormat> = {
  threeWayArrowMultiColor: { len: 3, leftMin: 0, top: 0 },
  threeTriangles: { len: 3, leftMin: 0, top: 1 },
  fourWayArrowMultiColor: { len: 4, leftMin: 0, top: 2 },
  fiveWayArrowMultiColor: { len: 5, leftMin: 0, top: 3 },
  threeWayArrowGrayColor: { len: 3, leftMin: 5, top: 0 },
  fourWayArrowGrayColor: { len: 4, leftMin: 5, top: 1 },
  fiveWayArrowGrayColor: { len: 5, leftMin: 5, top: 2 },
  threeColorTrafficLightRimless: { len: 3, leftMin: 0, top: 4 },
  threeSigns: { len: 3, leftMin: 0, top: 5 },
  greenRedBlackGradient: { len: 4, leftMin: 0, top: 6 },
  threeColorTrafficLightBordered: { len: 3, leftMin: 5, top: 4 },
  fourColorTrafficLight: { len: 4, leftMin: 5, top: 5 },
  threeSymbolsCircled: { len: 3, leftMin: 0, top: 7 },
  tricolorFlag: { len: 3, leftMin: 0, top: 8 },
  threeSymbolsnoCircle: { len: 3, leftMin: 5, top: 7 },
  threeStars: { len: 3, leftMin: 0, top: 9 },
  fiveQuadrantDiagram: { len: 5, leftMin: 0, top: 10 },
  fiveBoxes: { len: 5, leftMin: 0, top: 11 },
  grade4: { len: 4, leftMin: 5, top: 9 },
  grade5: { len: 5, leftMin: 5, top: 10 },
};
```

---

## 6. 外部依赖方列表

以下模块引用了conditionformat的API，迁移时需同步更新导入路径。

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `global/draw/drawMain.js` | `getComputeMap()` | 绘制时获取条件格式计算结果 |
| `global/draw/cellRender.js` | `checksCF(r, c, computeMap)` | 渲染单元格时应用条件格式样式 |
| `global/draw/cellOverflow.js` | `checksCF(r, c, computeMap)` | 溢出单元格渲染时检查条件格式 |
| `global/api/conditionFormat.js` | `infoDialog()`, `getRangeByTxt()`, `getHistoryRules()`, `getCurrentRules()`, `ref()` | 公开API内部实现 |
| `global/api/rangeRead.js` | `getComputeMap(sheetIndex)`, `checksCF(r, c, computeMap)` | 读取范围时检查条件格式 |
| `global/api/util.js` | `getRangeByTxt(txt)`, `getTxtByRange(range)` | 工具API |
| `global/api/editMode.js` | `$("#luckysheet-conditionformat-dialog").is(":visible")` | 编辑模式判断 |
| `global/refresh/refreshOperation.js` | 直接读写 `file.luckysheet_conditionformat_save` | 刷新操作中的条件格式保存/恢复 |
| `global/refresh/refreshCore.js` | 直接读写 `file.luckysheet_conditionformat_save` | 核心刷新中的条件格式保存/恢复 |
| `global/extend/deleteCell.js` | 直接读写 `file.luckysheet_conditionformat_save` | 删除单元格时调整条件格式范围 |
| `global/extend/deleteTable.js` | 直接读写 `file.luckysheet_conditionformat_save` | 删除表格时调整条件格式范围 |
| `global/extend/extendTable.js` | 直接读写 `file.luckysheet_conditionformat_save` | 扩展表格时调整条件格式范围 |
| `controllers/dropCell/core/index.js` | `CFSplitRange()` | 拖拽单元格时拆分条件格式范围 |
| `controllers/filter/filterColorEvents.js` | `getComputeMap()`, `checksCF(r, c, computeMap)` | 筛选颜色事件中检查条件格式 |
| `controllers/keyboard.js` | `getComputeMap()`, `checksCF(r, c, computeMap)` | 键盘事件中检查条件格式 |
| `controllers/menuButton/toolbarInit/initConditionformat.js` | `CFiconsDialog()`, `init()`, `newConditionRuleDialog()`, `fileClone`, `administerRuleDialog()`, `textCellColorHtml()`, `conditionformatDialog()`, `dataBarList`, `colorGradationList`, `updateItem()`, `getRangeByTxt()` | 工具栏条件格式按钮初始化 |
| `controllers/menuButton/styleRead.js` | `getComputeMap()`, `checksCF(r, c, computeMap)` | 读取单元格样式 |
| `controllers/handler/cellEventsSub/handleCellMousedown.js` | `selectStatus`, `selectRange`, `getTxtByRange()` | 鼠标按下时处理条件格式范围选择 |
| `controllers/handler/cellEventsSub/handleCellDblclick.js` | `$("#luckysheet-conditionformat-dialog").is(":visible")` | 双击时判断对话框可见性 |
| `controllers/handler/documentMousemoveSub/mouseRender.js` | `selectStatus`, `selectRange`, `getTxtByRange()` | 鼠标移动时处理条件格式范围选择 |
| `controllers/handler/documentMouseup.js` | `CFSplitRange()` | 鼠标释放时拆分条件格式范围 |
| `controllers/handler/rightClickButtons.js` | `getComputeMap()`, `checksCF(r, c, computeMap)` | 右键菜单中检查条件格式 |
| `controllers/handler/globalEvents.js` | `$("#luckysheet-conditionformat-dialog").show()` | 全局事件中显示条件格式对话框 |
| `controllers/updateCell.js` | `getComputeMap()`, `checksCF(r, c, computeMap)` | 更新单元格时检查条件格式 |
| `controllers/controlHistory.js` | `ref()` | 历史记录（undo/redo）中触发刷新 |
| `controllers/selection/clipboardCutPaste.js` | `CFSplitRange()` | 剪切粘贴时拆分条件格式范围 |
| `controllers/selection/clipboardPaintModel.js` | `CFSplitRange()` | 格式刷时拆分条件格式范围 |
| `controllers/selection/clipboardCopyPaste.js` | `CFSplitRange()` | 复制粘贴时拆分条件格式范围 |
| `controllers/locationCell.js` | `compute(ruleArr, data)` | 定位单元格时计算条件格式 |
| `controllers/toolbar.js` | 间接引用 | 工具栏集成 |

---

## 7. computeMap数据结构变更说明

### 7.1 旧数据结构

```js
// 键为 "r_c" 字符串，值为对象
computeMap = {
  "0_0": { textColor: "#9c0006", cellColor: "#ffc7ce" },           // default类型
  "1_2": { dataBar: { valueType: "plus", plusLen: 1, valueLen: 0.67, format: [...] } }, // dataBar类型
  "3_4": { cellColor: "rgb(128, 0, 128)" },                        // colorGradation类型
  "5_6": { icons: { left: 2, top: 3 } },                           // icons类型
  "7_8": { textColor: "#f00", cellColor: "#ff0", dataBar: {...} }, // 多规则叠加
}
```

### 7.2 新数据结构

```typescript
class ComputeMap {
  private data: Map<string, CellComputeResult>;

  get(r: number, c: number): CellComputeResult | null;
  set(r: number, c: number, result: Partial<CellComputeResult>): void;
  merge(r: number, c: number, partial: Partial<CellComputeResult>): void;
  clear(): void;
  entries(): IterableIterator<[string, CellComputeResult]>;
}

interface CellComputeResult {
  textColor?: string | null;      // default类型
  cellColor?: string | null;      // default/colorGradation类型
  dataBar?: DataBarResult;        // dataBar类型
  icons?: IconsResult;            // icons类型
}

interface DataBarResult {
  valueType: "plus" | "minus";
  plusLen?: number;
  minusLen?: number;
  valueLen: number;
  format: string[];
}

interface IconsResult {
  left: number;
  top: number;
}
```

### 7.3 关键变更

| 变更点 | 旧 | 新 |
|--------|-----|-----|
| 键类型 | `string` (`"r_c"`) | `Map<string, ...>` 内部使用，对外暴露 `get(r, c)` |
| 合并逻辑 | 手动 `if (key in map) { map[key].field = val } else { map[key] = {field: val} }` | `ComputeMap.merge(r, c, partial)` 自动合并 |
| 类型安全 | 无 | `CellComputeResult` 接口约束 |
| 空值处理 | 直接赋值 `null` | `textColor?: string | null` 可选字段 |

---

## 8. 对话框迁移方案

### 8.1 迁移策略：jQuery DOM → 原生DOM + 模板

**核心原则**：
1. 所有 `$("body").append(htmlString)` 改为模板渲染 + 原生DOM挂载
2. 所有 `$(document).off().on()` 改为 `addEventListener` + 事件控制器
3. 所有 `$.extend(true, [], obj)` 改为 `structuredClone()` 或自定义深拷贝
4. 所有 `$.inArray()` 改为 `Array.includes()` 或 `Array.indexOf()`
5. spectrum颜色选择器保留（或替换为等价原生方案）
6. flatpickr日期选择器保留

### 8.2 对话框类设计

```typescript
abstract class ConditionFormatDialog {
  protected container: HTMLElement;
  protected visible: boolean = false;

  abstract render(): string;
  abstract bindEvents(): void;

  show(): void {
    this.container = createElementFromHTML(this.render());
    document.body.appendChild(this.container);
    this.bindEvents();
    this.position();
    this.visible = true;
  }

  hide(): void {
    this.container.remove();
    this.visible = false;
  }

  protected position(): void {
    const rect = this.container.getBoundingClientRect();
    this.container.style.left = `${(window.innerWidth - rect.width) / 2}px`;
    this.container.style.top = `${(window.innerHeight - rect.height) / 3}px`;
  }
}
```

### 8.3 各对话框迁移映射

| 旧对话框ID | 新类 | 模板文件 |
|-----------|------|---------|
| `luckysheet-singleRange-dialog` | `SingleRangeDialog` | `singleRangeDialog.tpl.ts` |
| `luckysheet-multiRange-dialog` | `MultiRangeDialog` | `multiRangeDialog.tpl.ts` |
| `luckysheet-conditionformat-dialog` | `ConditionDialog` | `conditionDialog.tpl.ts` |
| `luckysheet-CFicons-dialog` | `IconsDialog` | `iconsDialog.tpl.ts` |
| `luckysheet-administerRule-dialog` | `AdminRuleDialog` | `adminRuleDialog.tpl.ts` |
| `luckysheet-newConditionRule-dialog` | `NewRuleDialog` | `newRuleDialog.tpl.ts` |
| `luckysheet-editorConditionRule-dialog` | `EditRuleDialog` | `editRuleDialog.tpl.ts` |
| `luckysheet-conditionformat-info-dialog` | `InfoDialog` | `infoDialog.tpl.ts` |

### 8.4 事件绑定迁移对照

| 旧方式 | 新方式 |
|--------|--------|
| `$(document).off("click.ns").on("click.ns", selector, fn)` | `container.querySelector(selector).addEventListener("click", fn)` |
| `$(this).addClass("on").siblings().removeClass("on")` | `event.target.classList.add("on"); siblings.forEach(el => el.classList.remove("on"))` |
| `$(this).val()` | `(event.target as HTMLInputElement).value` |
| `$(this).attr("data-item")` | `(event.target as HTMLElement).dataset.item` |
| `$(this).parents("#id").hide()` | `findAncestor(event.target, "#id").style.display = "none"` |
| `$(this).find("input").val()` | `container.querySelector("input").value` |
| `$.extend(true, [], obj)` | `structuredClone(obj)` |
| `$.inArray(val, arr) > -1` | `arr.includes(val)` |
| `$(this).is(":checked")` | `(event.target as HTMLInputElement).checked` |
| `$(this).is(":visible")` | `container.offsetParent !== null` |
| `$(this).spectrum("get").toHexString()` | `colorPickerService.getValue(element).toHex()` |

### 8.5 颜色选择器迁移

旧代码使用spectrum jQuery插件：
```js
$(".luckysheet-conditionformat-config-color").spectrum({
  showPalette: true,
  showPaletteOnly: true,
  // ...
});
```

迁移方案：
1. **方案A**：保留spectrum，但改为非jQuery调用方式（spectrum支持原生JS）
2. **方案B**：替换为原生 `<input type="color">` + 自定义调色板面板
3. **推荐方案A**，最小化迁移风险

### 8.6 日期选择器迁移

旧代码使用flatpickr：
```js
daterangeBtn.flatpickr({ mode: "range", onChange: ... });
```

迁移方案：flatpickr本身不依赖jQuery，可直接保留，仅将jQuery选择器改为原生DOM获取。

---

## 9. 新架构目录结构

```
src/
  conditionformat/
    ConditionFormatService.ts          # 主服务类（替代index.js）
    ComputeEngine.ts                   # 计算引擎（替代compute.js）
    ComputeMap.ts                      # ComputeMap数据结构
    RuleManager.ts                     # 规则管理（替代ruleManager.js）
    HistoryManager.ts                  # 历史记录管理
    RangeSplitter.ts                   # 范围拆分（替代rangeSplit.js）
    RangeUtils.ts                      # 范围工具（替代utils.js）
    ConditionRangeParser.ts            # 条件范围解析（替代rangeParser.js）
    ColorUtils.ts                      # 颜色工具（getcolorGradation等）
    constants.ts                       # 静态数据（替代data.js）
    types.ts                           # TypeScript接口定义
    strategies/
      ConditionStrategy.ts             # 条件策略基类
      ConditionStrategyRegistry.ts     # 策略注册表
      ComputeStrategy.ts               # 计算策略基类
      ComputeStrategyRegistry.ts       # 计算策略注册表
      conditions/
        GreaterThanStrategy.ts
        LessThanStrategy.ts
        EqualStrategy.ts
        TextContainsStrategy.ts
        BetweennessStrategy.ts
        OccurrenceDateStrategy.ts
        DuplicateValueStrategy.ts
        TopNStrategy.ts
        TopPercentStrategy.ts
        BottomNStrategy.ts
        BottomPercentStrategy.ts
        AboveAverageStrategy.ts
        SubAverageStrategy.ts
        RegExpStrategy.ts
        SortOrderStrategy.ts
        FormulaStrategy.ts
      compute/
        DefaultComputeStrategy.ts      # 替代computeDefault.js
        DataBarComputeStrategy.ts      # 替代computeDataBar.js
        ColorGradationComputeStrategy.ts # 替代computeColorGradation.js
        IconsComputeStrategy.ts        # 替代computeIcons.js
    dialog/
      ConditionFormatDialogBase.ts     # 对话框基类
      AdminRuleDialog.ts              # 管理规则对话框
      NewRuleDialog.ts                # 新建规则对话框
      EditRuleDialog.ts               # 编辑规则对话框
      ConditionDialog.ts              # 条件格式设置对话框
      IconsDialog.ts                  # 图标集选择对话框
      SingleRangeDialog.ts            # 单元格选择对话框
      MultiRangeDialog.ts             # 范围选择对话框
      InfoDialog.ts                   # 信息提示对话框
      templates/                      # 对话框HTML模板
        adminRuleDialog.tpl.ts
        newRuleDialog.tpl.ts
        editRuleDialog.tpl.ts
        conditionDialog.tpl.ts
        iconsDialog.tpl.ts
        singleRangeDialog.tpl.ts
        multiRangeDialog.tpl.ts
        infoDialog.tpl.ts
        ruleTypeItems.tpl.ts
        textCellColor.tpl.ts
        ruleExplain/                  # 各规则类型说明模板
          index0.tpl.ts               # 基于各自值
          index1.tpl.ts               # 包含内容的单元格
          index2.tpl.ts               # 排名靠前/后
          index3.tpl.ts               # 高于/低于平均
          index4.tpl.ts               # 重复/唯一值
          index5.tpl.ts               # 公式
    api/
      ConditionFormatAPI.ts           # 公开API（替代conditionFormat.js）
```

---

## 10. TypeScript接口定义

```typescript
interface CellRange {
  row: [number, number];
  column: [number, number];
}

interface DefaultFormat {
  textColor: string | null;
  cellColor: string | null;
}

interface DataBarFormat {
  len?: never;
  leftMin?: never;
  top?: never;
  [index: number]: string;  // 数组格式: ["#638ec6", "#ffffff"] 或 ["#638ec6"]
}

interface ColorGradationFormat {
  [index: number]: string;  // 2色或3色: ["rgb(...)","rgb(...)"] 或 ["rgb(...)","rgb(...)","rgb(...)"]
}

interface IconsFormat {
  len: number;      // 3, 4, 5
  leftMin: number;  // 0 或 5
  top: number;      // 0-11
}

type CFRuleFormat = DefaultFormat | string[] | IconsFormat;

interface CFRule {
  type: "default" | "dataBar" | "colorGradation" | "icons";
  cellrange: CellRange[];
  format: CFRuleFormat;
  conditionName?: string;       // 仅type=="default"时存在
  conditionRange?: (CellRange | null)[];  // 仅type=="default"时存在
  conditionValue?: any[];       // 仅type=="default"时存在
}

interface CellComputeResult {
  textColor?: string | null;
  cellColor?: string | null;
  dataBar?: {
    valueType: "plus" | "minus";
    plusLen?: number;
    minusLen?: number;
    valueLen: number;
    format: string[];
  };
  icons?: {
    left: number;
    top: number;
  };
}

interface RuleSnapshot {
  sheetIndex: string;
  luckysheet_conditionformat_save: CFRule[] | null;
}

interface EditorRuleState {
  sheetIndex: string;
  itemIndex: number;
  data: CFRule;
}

interface DataBarPreset {
  format: string[];
}

interface ColorGradationPreset {
  format: string[];
}

interface ParseConditionRangeResult {
  conditionRange: CellRange[];
  conditionValue: any[];
}

interface ComputeContext {
  computeMap: ComputeMap;
  getColorGradation: (c1: string, c2: string, v1: number, v2: number, v: number) => string;
}
```

---

## 附录A：jQuery API替换速查表

| jQuery API | 原生替代 |
|-----------|---------|
| `$(selector)` | `document.querySelector(selector)` |
| `$(selector).val()` | `element.value` |
| `$(selector).val(v)` | `element.value = v` |
| `$(selector).attr(name)` | `element.getAttribute(name)` |
| `$(selector).attr(name, val)` | `element.setAttribute(name, val)` |
| `$(selector).data(name)` | `element.dataset[name]` |
| `$(selector).addClass(c)` | `element.classList.add(c)` |
| `$(selector).removeClass(c)` | `element.classList.remove(c)` |
| `$(selector).hasClass(c)` | `element.classList.contains(c)` |
| `$(selector).show()` | `element.style.display = ""` |
| `$(selector).hide()` | `element.style.display = "none"` |
| `$(selector).toggle()` | `element.style.display = element.style.display === "none" ? "" : "none"` |
| `$(selector).empty()` | `element.innerHTML = ""` |
| `$(selector).prepend(html)` | `element.insertAdjacentHTML("afterbegin", html)` |
| `$(selector).append(html)` | `element.insertAdjacentHTML("beforeend", html)` |
| `$(selector).remove()` | `element.remove()` |
| `$(selector).css(prop)` | `getComputedStyle(element)[prop]` |
| `$(selector).css(prop, val)` | `element.style[prop] = val` |
| `$(selector).find(sel)` | `element.querySelector(sel)` |
| `$(selector).closest(sel)` | `element.closest(sel)` |
| `$(selector).siblings()` | `Array.from(element.parentElement.children).filter(el => el !== element)` |
| `$(selector).parents(sel)` | `element.closest(sel)` |
| `$(selector).eq(i)` | `elements[i]` |
| `$(selector).each(fn)` | `elements.forEach(fn)` |
| `$(selector).is(":checked")` | `element.checked` |
| `$(selector).is(":visible")` | `element.offsetParent !== null` |
| `$(selector).index()` | `Array.from(element.parentElement.children).indexOf(element)` |
| `$(selector).outerHeight()` | `element.offsetHeight` |
| `$(selector).outerWidth()` | `element.offsetWidth` |
| `$(document).on(event, sel, fn)` | `document.addEventListener(event, fn)` + 事件委托 |
| `$(document).off(event)` | `document.removeEventListener(event, fn)` |
| `$.extend(true, [], obj)` | `structuredClone(obj)` |
| `$.inArray(val, arr)` | `arr.indexOf(val)` 或 `arr.includes(val)` |
| `$(window).width()` | `window.innerWidth` |
| `$(window).height()` | `window.innerHeight` |
| `$(document).scrollLeft()` | `document.documentElement.scrollLeft` |
| `$(document).scrollTop()` | `document.documentElement.scrollTop` |
| `$("body").append(html)` | `document.body.insertAdjacentHTML("beforeend", html)` |

---

## 附录B：$.extend(true, [], ...) 替换清单

以下位置使用了 `$.extend` 进行深拷贝，迁移时需替换为 `structuredClone()`：

| 文件 | 行号 | 用途 |
|------|------|------|
| `ruleManager.js` | L182 | 深拷贝Store.luckysheetfile（历史快照） |
| `ruleManager.js` | L199 | 深拷贝Store.luckysheetfile（当前快照） |
| `initConditionDialogEvents.js` | L99 | 深拷贝Store.luckysheetfile |
| `initConditionDialogEvents.js` | L105 | 深拷贝Store.luckysheet_select_save |
| `initConditionDialogEvents.js` | L117 | 深拷贝Store.luckysheetfile |
| `initConditionDialogEvents.js` | L133 | 深拷贝Store.luckysheet_select_save |
| `initNewRuleEvents.js` | L42 | 深拷贝Store.luckysheet_select_save |
| `initNewRuleEvents.js` | L59 | 深拷贝Store.luckysheet_select_save |
| `initNewRuleEvents.js` | L74 | 深拷贝Store.luckysheet_select_save |
| `initNewRuleEvents.js` | L212 | 深拷贝Store.luckysheet_select_save |
| `initNewRuleEvents.js` | L227 | 深拷贝Store.luckysheetfile |
| `initNewRuleEvents.js` | L234 | 深拷贝Store.luckysheetfile |
| `initEditRuleEvents.js` | L17 | 深拷贝Store.luckysheetfile |
| `initEditRuleEvents.js` | L21 | 深拷贝_this.fileClone |
| `initEditRuleEvents.js` | L26 | 深拷贝Store.luckysheetfile |
| `conditionFormat.js` (API) | L181 | 深拷贝Store.luckysheetfile |
| `conditionFormat.js` (API) | L189 | 深拷贝Store.luckysheetfile |
| `conditionFormat.js` (API) | L437 | 深拷贝Store.luckysheetfile |
| `conditionFormat.js` (API) | L445 | 深拷贝Store.luckysheetfile |
| `conditionFormat.js` (API) | L474 | 深拷贝file.luckysheet_conditionformat_save |
| `conditionFormat.js` (API) | L486 | 深拷贝Store.luckysheetfile |
| `conditionFormat.js` (API) | L492 | 深拷贝Store.luckysheetfile |

---

## 附录C：$.inArray 替换清单

| 文件 | 行号 | 旧代码 | 新代码 |
|------|------|--------|--------|
| `computeDefault.js` | L379 | `$.inArray(conditionValue0, [0, 'asc', '0']) > -1` | `[0, 'asc', '0'].includes(conditionValue0)` |
| `computeDefault.js` | L379 | `$.inArray(conditionValue0, [1, '1', 'desc']) > -1` | `[1, '1', 'desc'].includes(conditionValue0)` |
