# Luckysheet 项目架构问题深度分析

## 一、总体概况

Luckysheet 是一个基于 Canvas 渲染的在线电子表格库，核心代码约 **30,000+ 行 JavaScript**，分布在 `src/` 下的 6 个主要目录中。项目存在 **设计混乱、功能耦合、代码重复** 等系统性问题，可归纳为以下 7 大类。

---

## 二、问题一：上帝对象/模块 —— 职责严重过载

### 2.1 三大"上帝文件"

| 文件 | 行数 | 导出数 | 依赖数 | 核心问题 |
|------|------|--------|--------|----------|
| `src/global/api.js` | **6595** | ~100个函数 | 42 | 承担几乎所有对外API，混合了单元格、选区、Sheet、冻结、条件格式等完全不相关的领域 |
| `src/global/formula.js` | **6161** | 96个方法 | 25 | 同时负责公式解析、编辑器UI交互、计算调度、链管理、XSS处理 |
| `src/controllers/handler.js` | **5903** | 1个巨型函数 | 42 | 所有鼠标/键盘事件处理在一个5900行的闭包函数内，无法独立测试 |

这三个文件合计 **18,659 行**，占项目核心代码的绝大部分。

### 2.2 上帝对象

| 对象 | 所在文件 | 属性/方法数 | 问题 |
|------|---------|------------|------|
| `Store` | `src/store/index.js` | 70+属性 | 全局可变单例，UI状态、业务数据、缓存、定时器全部混在一起 |
| `luckysheetformula` | `src/global/formula.js` | 96个方法 | 公式计算+UI交互+数据管理混合 |
| `luckysheet` | `src/core.js` | 30+方法 | API入口+配置分发+方法混入 |

---

## 三、问题二：全局可变状态滥用 —— 最根本的架构缺陷

### 3.1 Store 成为"万能垃圾桶"

`src/store/index.js` 是一个包含 **70+ 属性** 的全局可变单例，被 **66 个文件** 导入使用，其中 **37 个文件** 直接对其赋值（共 392 次赋值操作）。

Store 中混合了完全不同关注点的状态：

- **UI 布局**：`toolbarHeight`、`rowHeaderWidth`、`cellmainWidth`
- **业务数据**：`flowdata`、`luckysheetfile`、`config`
- **交互状态**：`luckysheet_select_save`、`luckysheet_copy_save`
- **渲染缓存**：`measureTextCache`、`cellOverflowMapCache`
- **定时器引用**：`jfcountfuncTimeout`、`jfautoscrollTimeout`

**没有任何 getter/setter 或访问控制**，任何模块都可以 `Store.xxx = yyy`。

### 3.2 多个并行状态容器

除了 Store，还有至少 **8 个全局可变对象** 持有状态：

| 对象 | 所在文件 | 状态类型 |
|------|---------|---------|
| `luckysheetConfigsetting` | `src/controllers/luckysheetConfigsetting.js` | 配置 |
| `luckysheetFreezen` | `src/controllers/freezen.js` | 冻结 |
| `imageCtrl` | `src/controllers/imageCtrl.js` | 图片 |
| `sheetmanage` | `src/controllers/sheetmanage.js` | Sheet管理 |
| `editor` | `src/global/editor.js` | 编辑器 |
| `formula` | `src/global/formula.js` | 公式引擎(30+可变属性) |
| `menuButton` | `src/controllers/menuButton.js` | 菜单按钮 |
| `selection` | `src/controllers/selection.js` | 选区/剪贴板 |

### 3.3 window 全局变量污染

公式引擎通过 `window` 全局变量传递计算上下文，用于 `new Function()` 动态执行：

- `window.luckysheetCurrentRow`
- `window.luckysheetCurrentColumn`
- `window.luckysheetCurrentFunction`
- `window.luckysheetCurrentIndex`
- `window.luckysheet_getcelldata_cache`
- `window.luckysheet_compareWith`
- `window.luckysheet_getarraydata`
- `window.luckysheet_getcelldata`
- `window.luckysheet_parseData`
- `window.luckysheet_getValue`
- `window.luckysheet_function`
- ... 等十余个

这导致：**无法支持多实例**、**存在安全风险**、**严重污染全局命名空间**。

### 3.4 数据同步隐患

`Store.flowdata` 和 `Store.luckysheetfile[index].data` 保存相同引用，但 `Store.config` 和 `file.config` 需要手动同步。在 `src/global/refresh.js` 中可以看到：

```javascript
Store.flowdata = data;
editor.webWorkerFlowDataCache(Store.flowdata);
file.data = Store.flowdata;  // 手动同步！
```

这种不一致的模式极易导致数据不同步 bug。

---

## 四、问题三：循环依赖

发现以下循环依赖链：

```
select.js ──→ api.js (refreshMenuButtonFocus)
api.js ──→ select.js (selectHightlightShow, selectIsOverlap)

listener.js ──→ api.js (toJson)
api.js ──→ (间接) core.js ──→ listener.js

method.js ──→ formula.js
formula.js ──→ method.js (createHookFunction)
```

循环依赖导致模块初始化顺序不确定，某些导入在运行时可能为 `undefined`。

---

## 五、问题四：命名混乱与功能碎片化

### 5.1 命名极具误导性

| 文件 | 名字暗示 | 实际职责 | 建议 |
|------|---------|---------|------|
| `src/controllers/selection.js` | "选区" | **剪贴板操作**(复制/粘贴/剪切) | → `clipboard.js` |
| `src/controllers/select.js` | "选择" | **选区视觉渲染**(高亮框) | → `selectionHighlight.js` |
| `src/controllers/sheetMove.js` | "Sheet移动/排序" | **单元格键盘导航**(方向键移动光标) | → `cellNavigation.js` |
| `src/controllers/sheetSearch.js` | "Sheet搜索" | **二分查找工具函数**(行列位置查找) | → `binarySearch.js` |

### 5.2 同一功能分散在多个文件

**Sheet 管理**分散在 4 个文件中：

| 文件 | 行数 | 职责 |
|------|------|------|
| `src/controllers/sheetmanage.js` | 2073 | Sheet CRUD + 数据转换 + 参数恢复 |
| `src/controllers/sheetBar.js` | 535 | 底部标签栏 UI |
| `src/controllers/sheetMove.js` | 1990 | 键盘导航(与Sheet管理无关) |
| `src/controllers/sheetSearch.js` | 80 | 二分搜索工具 |

**公式处理**分散在 5 个文件中：

| 文件 | 行数 | 职责 |
|------|------|------|
| `src/global/formula.js` | 6161 | 解析+UI+计算+链管理 |
| `src/function/func.js` | 1967 | 运算符+单元格引用 |
| `src/function/functionImplementation.js` | 27922 | 400+函数实现 |
| `src/function/functionlist.js` | 38 | 函数注册表 |
| `src/function/luckysheet_function.js` | 11 | 旧版函数挂载(应删除) |

### 5.3 API 层三套风格并存

| 风格 | 文件 | 位置 | 模式 |
|------|------|------|------|
| 对象式 | `src/global/method.js` | `src/global/` | `method.xxx()` |
| 函数式(get/set) | `src/methods/get.js` / `src/methods/set.js` | `src/methods/` | 独立函数 |
| 导出函数式 | `src/global/api.js` | `src/global/` | 100+个命名导出 |

三者做的是同类事情（Store 访问层 / 公共 API），却放在不同位置、使用不同风格。

---

## 六、问题五：代码重复

### 6.1 Store 默认值重复定义

`src/store/index.js` 和 `src/global/method.js` 的 `defaultConfig.defaultStore` 包含 **完全相同的 70+ 属性定义**（约 150 行），用于 `destroy()` 时重置。极易不同步。

### 6.2 条件格式与交替颜色重复模式

`src/controllers/conditionformat.js` 和 `src/controllers/alternateformat.js` 共享相同的设计模式（规则存储 → 计算 → 检查 → 渲染刷新），`ref()`、`getComputeMap()`、`checksXX()` 等方法实现高度相似，属于"复制-粘贴"式代码，没有抽象公共基类。

### 6.3 handler.js 重复导入

`src/controllers/handler.js` 中同一模块被导入两次：

```javascript
import formula from "../global/formula"
import luckysheetformula from "../global/formula"  // 完全相同的模块！
```

---

## 七、问题六：缺乏抽象层

### 7.1 无统一事件系统

Hook 系统仅支持**单回调**，不支持多监听器，且仅用于外部用户回调，**内部模块之间没有任何事件通知机制**。

### 7.2 无响应式更新

状态变更后必须**手动调用**刷新函数（`jfrefreshgrid`、`jfrefreshgridall`、`jfrefreshgrid_rhcw`、`luckysheetrefreshgrid` 等），没有自动的响应式绑定。容易遗漏刷新调用，性能优化也困难。

### 7.3 渲染与业务混合

`src/global/draw.js` 的 `luckysheetDrawMain()` 函数（约 720 行）在渲染循环中直接调用 `conditionformat.checksCF()`、`alternateformat.checksAF()`、`menuButton.checkstatus()` 等业务逻辑，渲染层与业务层没有解耦。

---

## 八、问题七：destroy() 不可靠

`src/global/method.js` 中的 `destroy()` 方法只重置了 Store、formula、sheetmanage、imageCtrl 四个对象，但 `luckysheetConfigsetting`、`luckysheetFreezen`、`menuButton`、`selection` 等对象的状态**并未重置**，可能导致重新创建实例时出现残留状态。

---

## 九、问题严重程度总览

| 问题 | 严重程度 | 影响范围 | 修复难度 |
|------|---------|---------|---------|
| 全局可变状态(Store)滥用 | 🔴 极高 | 全项目 | 高 |
| 上帝文件(api/formula/handler) | 🔴 极高 | 全项目 | 高 |
| 循环依赖 | 🟠 高 | 模块间 | 中 |
| window全局变量污染 | 🟠 高 | 公式引擎 | 中 |
| 命名混乱/误导 | 🟠 高 | 可维护性 | 低 |
| API层三套风格 | 🟡 中 | API一致性 | 中 |
| 代码重复(Store默认值等) | 🟡 中 | 可维护性 | 低 |
| 条件格式/交替颜色重复模式 | 🟡 中 | 可维护性 | 中 |
| 缺乏响应式更新 | 🟡 中 | 性能/正确性 | 高 |
| destroy()不完整 | 🟡 中 | 多实例/重载 | 低 |
| 渲染与业务混合 | 🟢 低 | 可测试性 | 中 |

---

## 十、重构建议方向

### 10.1 拆分 Store

按关注点拆分为多个独立的状态 Store：

- `uiStore`：布局/尺寸/缩放/UI状态
- `dataStore`：flowdata/config/单元格数据
- `selectionStore`：选区状态/复制粘贴
- `chartStore`：图表相关状态

引入 getter/setter 封装，监控状态变化并触发自动更新。

### 10.2 拆分上帝文件

**api.js (6595行) → 按领域拆分为：**
- `cellAPI.js`：单元格读写操作
- `sheetAPI.js`：Sheet增删改查
- `rangeAPI.js`：选区操作
- `formatAPI.js`：格式设置
- `freezeAPI.js`：冻结操作

**formula.js (6161行) → 拆分为：**
- `formulaParser.js`：公式字符串解析
- `formulaEditor.js`：公式编辑器UI交互
- `formulaCalcChain.js`：公式依赖链管理
- `formulaCalcEngine.js`：公式计算执行

**handler.js (5903行) → 按事件类型拆分：**
- `mouseHandler.js`：鼠标事件
- `keyboardHandler.js`：键盘事件
- `dragHandler.js`：拖拽事件

### 10.3 统一 API 层

合并 `method.js`、`get.js`、`set.js` 为统一的 API 层，采用一致的函数式风格，放在 `src/methods/` 目录下：

```javascript
// 统一为函数式风格
export const getSheetIndex = () => Store.currentSheetIndex;
export const setConfig = (cfg) => { Store.config = cfg; };
```

### 10.4 消除 window 全局变量

将公式计算上下文通过闭包或参数传递：

```javascript
// 改为
const calcContext = { currentRow, currentCol, currentFunction };
formula.evaluate(expr, calcContext);
```

而非挂载到 window。

### 10.5 引入事件总线

实现发布/订阅模式，解耦模块间通信：

```javascript
EventBus.on('cell:update', handler);
EventBus.emit('cell:update', { row, col, value });
```

### 10.6 支持多实例

将 Store 从全局单例改为实例化对象：

```javascript
class LuckysheetInstance {
  constructor() {
    this.store = new Store();
    this.api = new API(this.store);
  }
}
```

### 10.7 修正命名

| 原名 | 新名 |
|------|------|
| `selection.js` | `clipboard.js` |
| `select.js` | `selectionHighlight.js` |
| `sheetMove.js` | `cellNavigation.js` |
| `sheetSearch.js` | `binarySearch.js` |

---

## 十一、总结

Luckysheet 项目的核心架构问题可以一句话概括：

> **全局可变状态(Store)滥用是万恶之源，它导致了模块间的隐式耦合，进而催生了上帝文件、循环依赖、命名混乱等一系列衍生问题。**

如果要重构，建议从 Store 的拆分和封装入手，这是解决其他问题的基础。整个项目需要一次系统性的架构重构，而非局部修补。

---

## 十二、大文件拆分方案评估

### 12.1 方案概述

**拆分策略**：在目标文件同级目录创建同名目录，将原文件按功能分类拆分到目录中，通过 `index.js` 统一导出。

**拆分目标**：所有超过 1000 行的核心业务文件（不含 `locale/` 数据文件和 `demoData/` 示例数据文件）。

### 12.2 需要拆分的大文件清单

| 文件 | 行数 | 导出类型 | 拆分优先级 |
|------|------|---------|-----------|
| `function/functionImplementation.js` | **23,004** | default (对象) | P1 |
| `function/functionListDescriptor.js` | **9,117** | default (对象) | P1 |
| `global/api.js` | **5,551** | 100个命名导出 | P1 |
| `global/formula.js` | **5,398** | default (luckysheetformula对象, 96方法) | P1 |
| `controllers/handler.js` | **4,979** | default (函数) | P1 |
| `controllers/menuButton.js` | **4,692** | 待分析 | P2 |
| `controllers/conditionformat.js` | **3,483** | 28个方法 | P2 |
| `controllers/dropCell.js` | **2,391** | 待分析 | P2 |
| `controllers/rowColumnOperation.js` | **2,126** | 待分析 | P2 |
| `global/extend.js` | **2,092** | 待分析 | P2 |
| `controllers/sparkline.js` | **2,062** | 待分析 | P2 |
| `global/format.js` | **1,940** | 待分析 | P2 |
| `global/draw.js` | **1,869** | 多个命名导出 | P2 |
| `controllers/sheetmanage.js` | **1,756** | 待分析 | P2 |
| `controllers/sheetMove.js` | **1,737** | 待分析 | P2 |
| `controllers/freezen.js` | **1,705** | 待分析 | P2 |
| `controllers/selection.js` | **1,703** | 待分析 | P2 |
| `function/func.js` | **1,649** | 待分析 | P2 |
| `controllers/filter.js` | **1,604** | 待分析 | P2 |
| `controllers/constant.js` | **1,464** | 待分析 | P3 |
| `global/getRowlen.js` | **1,427** | 待分析 | P3 |
| `controllers/moreFormat.js` | **1,181** | 待分析 | P3 |
| `controllers/alternateformat.js` | **1,089** | 待分析 | P3 |
| `controllers/matrixOperation.js` | **1,086** | 待分析 | P3 |
| `global/refresh.js` | **1,054** | 待分析 | P3 |

**P1**：必须立即拆分，规模太大无法维护
**P2**：建议拆分，职责较多但尚可管理
**P3**：可选拆分，接近阈值

### 12.3 api.js 详细拆分方案（示例）

#### 12.3.1 函数分类

| 类别 | 函数列表 | 建议文件名 |
|------|---------|-----------|
| **单元格操作** | `getCellValue`, `setCellValue`, `clearCell`, `deleteCell` | `cellOperation.js` |
| **查找替换** | `find`, `replace` | `searchReplace.js` |
| **编辑模式** | `exitEditMode`, `enterEditMode` | `editMode.js` |
| **冻结操作** | `frozenFirstRow`, `frozenFirstColumn`, `frozenRowRange`, `frozenColumnRange`, `cancelFrozen`, `setHorizontalFrozen`, `setVerticalFrozen`, `setBothFrozen` | `freeze.js` |
| **行列操作** | `insertRowOrColumn`, `insertRowBottomOrColumnRight`, `insertRow`, `insertRowBottom`, `insertColumn`, `insertColumnRight`, `deleteRowOrColumn`, `deleteRow`, `deleteColumn`, `hideRowOrColumn`, `showRowOrColumn`, `hideRow`, `showRow`, `hideColumn`, `showColumn` | `rowColumn.js` |
| **尺寸操作** | `setRowHeight`, `setColumnWidth`, `getRowHeight`, `getColumnWidth`, `getDefaultRowHeight`, `getDefaultColWidth` | `dimension.js` |
| **选区读取** | `getRange`, `getRangeWithFlatten`, `getRangeValuesWithFlatte`, `getRangeAxis`, `getRangeValue`, `getRangeHtml`, `getRangeArray`, `getRangeJson`, `getRangeDiagonal`, `getRangeBoolean`, `getRangeByTxt`, `getTxtByRange` | `rangeRead.js` |
| **选区写入** | `setRangeShow`, `setRangeValue`, `setSingleRangeFormat`, `cancelRangeMerge` | `rangeWrite.js` |
| **范围操作** | `setRangeFilter`, `setRangeMerge`, `setRangeSort`, `setRangeSortMulti`, `clearRange`, `deleteRange` | `rangeOperation.js` |
| **条件格式** | `setRangeConditionalFormatDefault`, `setRangeConditionalFormat`, `deleteRangeConditionalFormat` | `conditionFormat.js` |
| **矩阵操作** | `matrixOperation`, `matrixCalculation` | `matrix.js` |
| **Sheet操作** | `setSheetAdd`, `setSheetDelete`, `setSheetCopy`, `setSheetHide`, `setSheetShow`, `setSheetActive`, `setSheetName`, `setSheetColor`, `setSheetMove`, `setSheetOrder`, `setSheetZoom` | `sheet.js` |
| **图片操作** | `insertImage`, `deleteImage`, `getImageOption` | `image.js` |
| **数据转换** | `transToCellData`, `transToData` | `dataTransform.js` |
| **工具函数** | `showGridLines`, `hideGridLines`, `refresh`, `scroll`, `resize`, `getScreenshot`, `setWorkbookName`, `getWorkbookName`, `undo`, `redo`, `getAllSheets`, `getAllChartsBase64`, `getSheet`, `getSheetData`, `getConfig`, `setConfig`, `getLuckysheetfile`, `toJson`, `changLang` | `util.js` |

#### 12.3.2 拆分后的目录结构

```
src/global/api/               # 原 api.js
├── index.js                  # 统一导出入口
├── cellOperation.js          # 单元格操作 (4函数)
├── searchReplace.js          # 查找替换 (2函数)
├── editMode.js               # 编辑模式 (2函数)
├── freeze.js                 # 冻结操作 (8函数)
├── rowColumn.js              # 行列操作 (15函数)
├── dimension.js              # 尺寸操作 (6函数)
├── rangeRead.js              # 选区读取 (12函数)
├── rangeWrite.js             # 选区写入 (4函数)
├── rangeOperation.js         # 范围操作 (7函数)
├── conditionFormat.js        # 条件格式 (3函数)
├── matrix.js                 # 矩阵操作 (2函数)
├── sheet.js                  # Sheet操作 (11函数)
├── image.js                  # 图片操作 (3函数)
├── dataTransform.js          # 数据转换 (2函数)
└── util.js                   # 工具函数 (17函数)
```

#### 12.3.3 index.js 导出示例

```javascript
// src/global/api/index.js
export * from './cellOperation.js';
export * from './searchReplace.js';
export * from './editMode.js';
export * from './freeze.js';
export * from './rowColumn.js';
export * from './dimension.js';
export * from './rangeRead.js';
export * from './rangeWrite.js';
export * from './rangeOperation.js';
export * from './conditionFormat.js';
export * from './matrix.js';
export * from './sheet.js';
export * from './image.js';
export * from './dataTransform.js';
export * from './util.js';
```

### 12.4 可行性评估

| 评估项 | 评分 | 说明 |
|--------|------|------|
| **技术可行性** | ⭐⭐⭐⭐⭐ 高 | ES6 模块化天然支持目录拆分，静态导入/导出分析简单 |
| **业务风险** | ⭐⭐ 中 | api.js 和 formula.js 内部函数相互调用，拆分时需确保 import 路径正确 |
| **测试难度** | ⭐⭐⭐ 中 | 100个函数需确保全部正确导出，建议使用自动化测试验证 |
| **维护成本** | ⭐⭐⭐ 中 | 拆分后需同步更新所有外部引用，工作量约 200+ 处 |
| **收益预期** | ⭐⭐⭐⭐⭐ 高 | 拆分后单文件平均 300-500 行，可大幅提升可维护性 |

**综合评分：⭐⭐⭐⭐ (4/5)**

### 12.5 潜在风险及应对

#### 风险 1：循环依赖
**描述**：api.js 导入 select.js (`selectHightlightShow`, `selectIsOverlap`)，select.js 又导入 api.js (`refreshMenuButtonFocus`)，形成循环依赖。

**影响**：拆分后循环依赖可能加剧，因为子文件可能引入其他子文件形成新的循环。

**应对**：
- 拆分前先绘制依赖图，识别所有循环
- 将共同依赖抽取到独立的 `common.js` 或 `shared.js`
- 使用 `import()` 动态导入打破循环（但会影响 tree-shaking）

#### 风险 2：命名冲突
**描述**：不同类别的函数可能有相同名称。

**应对**：
- 制定命名规范：`{类别}_{函数名}`（如 `cell_getValue`）
- 或按类别使用命名空间对象

#### 风险 3：默认导出文件拆分困难
**描述**：`formula.js`（default export `luckysheetformula` 对象）和 `handler.js`（default export 函数）不是简单的函数列表，拆分需要将对象属性或函数内部逻辑重组。

**应对**：
- `formula.js`：将 96 个方法按职责分组到多个文件，最后在 `index.js` 合并回对象
  ```javascript
  // formula/error.js
  export const error = { v: "#VALUE!", n: "#NAME?", ... };
  export function errorInfo() { ... }
  export function errorParamCheck() { ... }
  
  // formula/calculation.js
  export function execFunctionGroup() { ... }
  export function execfunction() { ... }
  
  // formula/index.js
  import * as error from './error.js';
  import * as calculation from './calculation.js';
  // ... 其他模块
  
  export default { ...error, ...calculation, ... };
  ```
- `handler.js`：无法按函数拆分，只能按事件类型（鼠标/键盘/拖拽）拆分到不同文件，然后在入口函数中依次调用

#### 风险 4：第三方依赖注入困难
**描述**：原文件顶部的 import 语句被所有函数共享，拆分后每个子文件可能需要重复相同的 import。

**应对**：
- 创建 `dependencies.js` 统一导入所有依赖
- 各子文件从 `dependencies.js` 再导出
- 或使用 webpack 的 `ProvidePlugin` 自动注入

```javascript
// api/dependencies.js
import Store from "../store";
import tooltip from "./tooltip";
// ... 所有 api.js 顶部导入的模块
export { Store, tooltip, ... };

// api/cellOperation.js
import { Store, tooltip } from './dependencies.js';
// 使用依赖
```

#### 风险 5：外部引用更新
**描述**：项目中约 200+ 处引用了 api.js 中的函数，拆分后需要全部更新为从 `api/` 目录导入。

**影响**：这是最大的工作量风险。

**应对**：
- 拆分初期保留原 `api.js` 作为重导出入口（向后兼容）
- 逐步将外部引用迁移到新的 `api/` 路径
- 最终移除 `api.js` 的重导出

```javascript
// api.js (过渡期重导出)
export * from './api/index.js';
```

### 12.6 分类标准建议

#### 12.6.1 按业务领域分类（推荐）

适用于职责明确的大文件（如 api.js）：

| 领域 | 划分依据 | 示例 |
|------|---------|------|
| 单元格 | 对单个单元格的操作 | getCellValue, setCellValue |
| 选区 | 对单元格范围的操作 | getRangeValue, setRangeMerge |
| Sheet | 对工作表的操作 | setSheetAdd, setSheetDelete |
| 行列 | 对行或列的操作 | insertRow, deleteColumn |
| 格式化 | 样式和格式相关 | setCellFormat, setRangeConditionalFormat |

#### 12.6.2 按字母顺序分类（不推荐）

适用于函数数量极多且无明显领域边界的情况。缺点是分类毫无业务意义。

#### 12.6.3 按代码行数均分（不推荐）

简单按行数切割，不考虑业务逻辑。缺点是破坏业务内聚性。

### 12.7 文件命名规范

| 规范 | 正确示例 | 错误示例 |
|------|---------|---------|
| 使用 kebab-case | `cellOperation.js` | `cell_operation.js` |
| 使用名词（非动词） | `cellOperation.js` | `operateCell.js` |
| 避免通用名称 | `util.js`, `helper.js` | `common.js` |
| 统一前缀（如适用） | `rangeRead.js`, `rangeWrite.js` | `getRange.js`, `setRange.js` |

### 12.8 测试策略

#### 阶段一：验证导出完整性
```javascript
// test/apiExports.test.js
import * as api from './api/index.js';

const expectedExports = [
  'getCellValue', 'setCellValue', 'clearCell', ...
  // 全部100个函数名
];

test.each(expectedExports)('exports %s', (fnName) => {
  expect(api[fnName]).toBeDefined();
  expect(typeof api[fnName]).toBe('function');
});
```

#### 阶段二：验证功能一致性
确保拆分后的函数行为与原文件完全一致，建议：
- 逐函数对比原文件和拆分后的函数实现
- 使用 diff 工具检测差异
- 对关键函数（如 `setCellValue`, `getRangeValue`）编写单元测试

#### 阶段三：集成测试
验证整个 Luckysheet 初始化和基本操作流程不受影响。

### 12.9 拆分实施步骤

**第一步：依赖分析**
1. 绘制所有大文件的函数依赖图
2. 识别循环依赖
3. 确定分类方案

**第二步：创建目录结构**
```bash
# 为每个大文件创建对应的目录
mkdir src/global/api
mkdir src/global/formula
mkdir src/controllers/handler
# ...
```

**第三步：创建过渡层**
```javascript
# 原 api.js 改为重导出（保持外部引用兼容）
export * from './api/index.js';
```

**第四步：拆分函数到子文件**
- 按分类将函数复制到对应的子文件
- 保留完整的 JSDoc 注释
- 确保 import 语句正确

**第五步：更新外部引用**
- 使用 IDE 的 "Find and Replace" 功能
- 替换模式：`from './global/api'` → `from './global/api/index.js'`

**第六步：验证测试**
- 运行单元测试
- 运行集成测试
- 手动功能测试

**第七步：移除过渡层**
- 删除原文件
- 确认所有引用已更新

**第八步：重复迭代**
- 下一个大文件重复以上步骤

### 12.10 总结与建议

| 维度 | 结论 |
|------|------|
| **方案可行性** | ✅ 可行，ES6 模块化天然支持，无技术障碍 |
| **推荐优先级** | P1: api.js, formula.js, handler.js, functionImplementation.js |
| **最大风险** | 外部引用更新（200+ 处）和循环依赖处理 |
| **建议拆分阈值** | 单一文件超过 1500 行即需要拆分 |
| **预期收益** | 大幅提升可维护性，强制理清业务边界，降低重构难度 |
| **是否值得** | ✅ 非常值得，这是系统性重构的基础工程 |

**最终建议**：采用"先拆分 api.js 作为标杆，制定完整的分类规范和文件命名规范，再逐步推广到其他大文件"的策略。拆分过程中保持原文件作为重导出入口，确保项目始终可运行。