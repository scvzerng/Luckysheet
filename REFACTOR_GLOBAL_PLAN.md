# Luckysheet 全局对象消除重构计划

> 目标：消除项目中的全局对象依赖，将隐式耦合转为显式依赖，提升代码可测试性、可维护性和可复用性。
> 原则：每个阶段完成后必须通过 Vite 构建验证 + 功能回归测试，确保不破坏原有功能。

---

## 现状分析

### 全局对象全景

| 全局对象 | 定义位置 | 属性/方法数 | 被导入文件数 | 严重程度 |
|----------|---------|------------|------------|---------|
| **Store** | `store/index.js` | 57 字段 | 100+ | 🔴 最高 |
| **formula** | `global/formula/index.js` | ~30属性 + ~60方法 | 100+ | 🔴 高 |
| **editor** | `global/editor.js` | 3属性 + 5方法 | 100+ | 🟡 中 |
| **method** | `global/method.js` | 6方法 | 68 | 🟡 中 |
| **luckysheetConfigsetting** | `controllers/luckysheetConfigsetting.js` | 大量配置 | 91 | 🟡 中 |
| **menuButton** | `controllers/menuButton/` | 大量方法 | 100+ | 🟡 中 |
| **sheetmanage** | `controllers/sheetmanage/` | 大量方法 | 78 | 🟡 中 |
| **tooltip** | `global/tooltip.js` | 少量方法 | 100+ | 🟢 低 |
| **window.$** | `index.js` 挂载 | - | 100+ (2014处调用) | 🔴 高 |
| **luckysheet** | `core.js` | 公共API | 7 (35处) | 🟢 低 |

### 核心问题

1. **Store 是"上帝对象"**：57 个字段混杂 6 个不同关注域，100+ 文件共享同一个可变对象
2. **formula 子模块合并为单对象**：16 个子模块通过 `...spread` 合并，命名冲突风险高
3. **循环依赖网**：Store ↔ editor ↔ formula ↔ menuButton ↔ sheetmanage 互相引用
4. **jQuery 全局化**：2014 处直接使用 `$()`，全部依赖 `window.$`
5. **隐式全局变量**：约 40+ 处函数内未声明变量
6. **method.destroy() 强耦合**：需知道 4 个全局对象的所有默认值

---

## 重构计划

### Phase 1: Store 拆分 — 按关注域分解上帝对象

**目标**：将 57 字段的 Store 拆分为 7 个领域 Store，通过 re-export 保持向后兼容。

**步骤**：

#### 1.1 创建领域 Store 子模块

在 `src/store/` 目录下创建：

| 子模块 | 文件 | 包含字段 |
|--------|------|---------|
| **StoreConfig** | `store/configStore.js` | `defaultcolumnNum`, `defaultrowNum`, `defaultcollen`, `defaultrowlen`, `defaultFontSize`, `defaultCell`, `fullscreenmode`, `devicePixelRatio`, `rowHeaderWidth`, `columnHeaderHeight`, `cellMainSrollBarSize`, `sheetBarHeight`, `statisticBarHeight`, `asyncLoad`, `fontList` |
| **StoreData** | `store/dataStore.js` | `container`, `loadingObj`, `luckysheetfile`, `currentSheetIndex`, `calculateSheetIndex`, `flowdata`, `config`, `lang`, `functionList`, `luckysheet_function` |
| **StoreLayout** | `store/layoutStore.js` | `visibledatarow`, `visibledatacolumn`, `visibledatacolumn_unique`, `visibledatarow_unique`, `ch_width`, `rh_height`, `cellmainWidth`, `cellmainHeight`, `toolbarHeight`, `infobarHeight`, `calculatebarHeight`, `luckysheetTableContentHW`, `zoomRatio`, `showGridLines` |
| **StoreSelection** | `store/selectionStore.js` | `luckysheet_select_status`, `luckysheet_select_save`, `luckysheet_selection_range`, `luckysheet_copy_save`, `luckysheet_paste_iscut`, `luckysheetCellUpdate`, `luckysheet_shiftpositon` |
| **StoreRowCol** | `store/rowColStore.js` | `luckysheet_rows_selected_status`, `luckysheet_cols_selected_status`, `luckysheet_rows_change_size`, `luckysheet_rows_change_size_start`, `luckysheet_cols_change_size`, `luckysheet_cols_change_size_start`, `luckysheet_cols_dbclick_timeout`, `luckysheet_cols_dbclick_times` |
| **StoreUI** | `store/uiStore.js` | `luckysheet_sheet_move_status`, `luckysheet_sheet_move_data`, `luckysheet_scroll_status`, `luckysheet_model_move_state`, `luckysheet_model_xy`, `luckysheet_model_move_obj`, `luckysheet_cell_selected_move`, `luckysheet_cell_selected_move_index`, `luckysheet_cell_selected_extend`, `luckysheet_cell_selected_extend_index`, `luckysheet_cell_selected_extend_time`, `zIndex` |
| **StoreCache** | `store/cacheStore.js` | `filterchage`, `luckysheet_filter_save`, `luckysheetisrefreshdetail`, `luckysheetisrefreshtheme`, `iscopyself`, `orderbyindex`, `clearjfundo`, `jfundo`, `jfredo`, `scrollRefreshSwitch`, `measureTextCache`, `measureTextCellInfoCache`, `measureTextCacheTimeOut`, `cellOverflowMapCache`, `inlineStringEditCache`, `inlineStringEditRange`, `currentSheetView`, `conditionFormatCells`, `jfcountfuncTimeout`, `jfautoscrollTimeout`, `toobarObject` |

#### 1.2 修改 `store/index.js` 为聚合导出

```javascript
// store/index.js — 向后兼容的聚合导出
import StoreConfig from './configStore';
import StoreData from './dataStore';
import StoreLayout from './layoutStore';
import StoreSelection from './selectionStore';
import StoreRowCol from './rowColStore';
import StoreUI from './uiStore';
import StoreCache from './cacheStore';

// 向后兼容：合并为单一对象
const Store = { ...StoreConfig, ...StoreData, ...StoreLayout, ...StoreSelection, ...StoreRowCol, ...StoreUI, ...StoreCache };
export default Store;

// 同时导出子模块，供新代码按需导入
export { StoreConfig, StoreData, StoreLayout, StoreSelection, StoreRowCol, StoreUI, StoreCache };
```

#### 1.3 逐步迁移消费者

- 搜索所有 `import Store from` 的文件
- 按文件逐一改为 `import { StoreSelection, StoreLayout } from` 按需导入
- 每迁移 10 个文件后运行构建验证

**验证方式**：
- `npx vite build` 构建通过
- 运行 dev server，测试：选区操作、行列调整、冻结、滚动、格式设置

**预计影响文件**：100+ 个

---

### Phase 2: Formula 模块独立导出

**目标**：不再将 16 个子模块合并为单一对象，改为各自独立导出，消费者按需导入。

**步骤**：

#### 2.1 修改 `formula/index.js` 为命名导出

```javascript
// 之前：合并为单一对象
// const luckysheetformula = { ...error, ...dataRead, ... };
// export default luckysheetformula;

// 之后：独立命名导出
export { error, errorInfo, errorParamCheck } from './error';
export { getPureValueByData, readCellDataToOneArray, getValueByFuncData, classlist } from './dataRead';
export { xssDeal, ltGtSignDeal } from './xss';
export { isWildcard, isCompareOperator, acompareb, compareParams, parseDecimal } from './compare';
export { iscelldata, iscellformat, getcellrange, getRangeArray, getRangeArrayTwo, cellOffset, parseDatetoNum } from './cellRange';
export { functionCopy, isfreezonFuc, setfreezonFuc, functionStrChange, ... } from './formulaString';
// ... 其他子模块同理

// 向后兼容：仍然导出合并对象
import * as luckysheetformula from './index';
export { luckysheetformula };
export default luckysheetformula;
```

#### 2.2 逐步迁移消费者

- 搜索所有 `import formula from` 的文件
- 改为 `import { updatecell, functionCopy } from` 按需导入
- 优先迁移 `controllers/` 下的文件（它们通常只用到 2-3 个方法）

#### 2.3 清理子模块的重复 import

当前 16 个子模块都复制了相同的 38 行 import 语句，但各自只用到其中几个。按需精简每个子模块的 import。

**验证方式**：
- `npx vite build` 构建通过
- 测试：公式输入、公式计算、公式栏交互、函数搜索

**预计影响文件**：100+ 个

---

### Phase 3: 消除隐式全局变量

**目标**：所有变量必须显式声明，消除 `window.xxx` 污染。

**步骤**：

#### 3.1 启用严格模式

在每个入口文件顶部添加 `'use strict';`，或在 `vite.config.js` 中配置 `esbuild: { strict: 'implicit' }`。

#### 3.2 修复未声明变量

扫描所有函数体内的赋值语句，添加 `let`/`const` 声明。典型修复：

```javascript
// 之前
function xxx(options = {}) {
    sheetObject = {};      // 隐式全局
    order = lastOrder;     // 隐式全局
}

// 之后
function xxx(options = {}) {
    let sheetObject = {};
    let order = lastOrder;
}
```

#### 3.3 消除 `window.luckysheet_getcelldata_cache`

将公式计算缓存从 `window` 移到 `StoreCache` 或 formula 模块内部：

```javascript
// 之前：refreshCore.js
window.luckysheet_getcelldata_cache = null;

// 之后：移到 StoreCache 或 formula 内部
StoreCache.luckysheet_getcelldata_cache = null;
```

**验证方式**：
- `npx vite build` 构建通过
- 浏览器控制台无 `ReferenceError` 或 `TypeError`
- 测试：公式计算、条件格式、数据验证

**预计影响文件**：40+ 个

---

### Phase 4: jQuery 显式导入

**目标**：消除对 `window.$` 的隐式依赖，改为显式 `import $ from 'jquery'`。

**步骤**：

#### 4.1 统一 jQuery 导入方式

删除 `index.js` 中的 `window.jQuery = jQuery; window.$ = jQuery;`，改为在每个使用 jQuery 的文件顶部显式导入：

```javascript
import $ from 'jquery';
```

#### 4.2 批量添加 import

使用脚本自动在所有使用 `$()` 或 `$.xxx` 的文件顶部添加 `import $ from 'jquery';`。

#### 4.3 清理 `jquery-bridge.js`

删除 `jquery-bridge.js`，统一使用 npm 包导入。

**验证方式**：
- `npx vite build` 构建通过
- 测试：所有 DOM 操作（选区、右键菜单、工具栏、Sheet 标签页）

**预计影响文件**：100+ 个（2014 处调用）

---

### Phase 5: luckysheet API 对象重构

**目标**：将 `luckysheet` 从全局对象改为模块化 API，消除内部模块对 `luckysheet.xxx` 的反向依赖。

**步骤**：

#### 5.1 消除内部模块对 `luckysheet` 的引用

| 文件 | 当前代码 | 修改为 |
|------|---------|--------|
| `workbook.js` | `luckysheet.create(options)` | `import { create } from '../../core'` |
| `dataRead.js` | `luckysheet.mask.getValueByFormat(...)` | `import mask from '...'` 直接导入 |
| `sheetInit.js` | `luckysheetConfigsetting.beforeCreateDom(luckysheet)` | 传递必要的配置对象而非整个 luckysheet |

#### 5.2 将 `luckysheet` 对象改为命名导出集合

```javascript
// core.js
export { create, destroy, getluckysheetfile, ... } from './global/api';
// 不再需要 let luckysheet = {}; luckysheet.create = ... 这种模式
```

#### 5.3 UMD 入口兼容

在 `index.js` 中，将命名导出组装为 UMD 全局对象，确保外部用户仍可通过 `luckysheet.create()` 调用：

```javascript
import * as luckysheet from './core';
export default luckysheet;
// UMD 打包后自动挂载到 window.luckysheet
```

**验证方式**：
- `npx vite build` 构建通过
- 测试：外部 HTML 页面通过 `luckysheet.create()` 初始化
- 测试：ESM 模块通过 `import { create } from 'luckysheet'` 导入

**预计影响文件**：7 个

---

### Phase 6: method.js 职责拆分

**目标**：将 method.js 的 6 个方法按职责拆分为独立模块。

**步骤**：

#### 6.1 创建子模块

| 子模块 | 文件 | 包含方法 |
|--------|------|---------|
| **dataLoader** | `global/method/dataLoader.js` | `addDataAjax`, `reload` |
| **sheetCleaner** | `global/method/sheetCleaner.js` | `clearSheetByIndex`, `clear` |
| **appLifecycle** | `global/method/appLifecycle.js` | `destroy` |
| **hookManager** | `global/method/hookManager.js` | `createHookFunction` |

#### 6.2 重构 `destroy` 方法

当前 `destroy` 需要知道 4 个全局对象的所有默认值。改为每个全局对象自提供 `reset()` 方法：

```javascript
// store/index.js
export function resetStore() { Object.assign(Store, defaultStoreValues); }

// formula/index.js
export function resetFormula() { Object.assign(luckysheetformula, defaultFormulaValues); }

// appLifecycle.js
import { resetStore } from '../../store';
import { resetFormula } from '../formula';
export function destroy() {
    resetStore();
    resetFormula();
    // ...
}
```

**验证方式**：
- `npx vite build` 构建通过
- 测试：`luckysheet.destroy()` 后重新 `create()` 能正常工作

**预计影响文件**：68 个

---

## 执行优先级与时间线

| 阶段 | 优先级 | 风险 | 影响文件数 | 依赖 |
|------|--------|------|-----------|------|
| **Phase 1**: Store 拆分 | 🔴 最高 | 中 | 100+ | 无 |
| **Phase 3**: 隐式全局变量 | 🔴 高 | 低 | 40+ | 无 |
| **Phase 2**: Formula 独立导出 | 🟡 中 | 中 | 100+ | Phase 1 |
| **Phase 4**: jQuery 显式导入 | 🟡 中 | 低 | 100+ | 无 |
| **Phase 6**: method 拆分 | 🟢 低 | 低 | 68 | Phase 1 |
| **Phase 5**: luckysheet API | 🟢 低 | 低 | 7 | Phase 1, 2 |

**建议执行顺序**：Phase 3 → Phase 1 → Phase 4 → Phase 2 → Phase 6 → Phase 5

理由：
- Phase 3 风险最低、收益最高，可以立即改善代码质量
- Phase 1 是后续所有 Phase 的基础
- Phase 4 可以并行进行
- Phase 5 和 6 依赖前面的成果

---

## 验证清单

每个 Phase 完成后，必须通过以下验证：

### 构建验证
- [ ] `npx vite build` 无错误通过
- [ ] 输出文件大小无异常增长（<5% 波动）

### 功能回归测试
- [ ] 页面加载和初始化
- [ ] 单元格选区（单击、拖拽、Shift 选区）
- [ ] 工具栏操作（加粗、斜体、颜色、字号）
- [ ] 公式输入和计算
- [ ] 冻结行/列
- [ ] 右键菜单
- [ ] Sheet 标签页操作（新增、删除、重命名）
- [ ] 复制粘贴
- [ ] 行列调整（拖拽行高/列宽）
- [ ] 条件格式
- [ ] 图片插入和拖拽
- [ ] 撤销/重做

### 代码质量验证
- [ ] 无新增 `window.xxx` 全局变量
- [ ] 无隐式全局变量（严格模式检查）
- [ ] 无循环依赖警告
- [ ] ESLint 检查通过（如有配置）
