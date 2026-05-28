# 工具栏按钮模块（MenuButton）迁移文档

> 本文档为 Luckysheet 工具栏按钮模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

### 1.1 旧架构文件清单

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/menuButton/index.js` | 模块入口，合并12个子模块 |
| `src/controllers/menuButton/templates.js` | 工具栏HTML模板 |
| `src/controllers/menuButton/paintFormat.js` | 格式刷逻辑 |
| `src/controllers/menuButton/toolbarInit.js` | 工具栏初始化入口 |
| `src/controllers/menuButton/toolbarInit/index.js` | 工具栏初始化子模块入口 |
| `src/controllers/menuButton/toolbarInit/initAlign.js` | 对齐按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initAutofilter.js` | 自动筛选按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initBorder.js` | 边框按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initCellColor.js` | 单元格颜色按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initConditionformat.js` | 条件格式按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initFontFamily.js` | 字体选择初始化 |
| `src/controllers/menuButton/toolbarInit/initFontSize.js` | 字号选择初始化 |
| `src/controllers/menuButton/toolbarInit/initFreezen.js` | 冻结按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initFunction.js` | 函数按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initMerge.js` | 合并单元格按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initMoreFormat.js` | 更多格式按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initNumberFormat.js` | 数字格式按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initPaintFormat.js` | 格式刷按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initPostil.js` | 批注按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initPrint.js` | 打印按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initRotation.js` | 旋转按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initSearchReplace.js` | 搜索替换按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initTextColor.js` | 文本颜色按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initTextStyle.js` | 文本样式按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initTextWrap.js` | 自动换行按钮初始化 |
| `src/controllers/menuButton/toolbarInit/initValign.js` | 垂直对齐按钮初始化 |
| `src/controllers/menuButton/formatUpdate.js` | 格式更新（应用格式到单元格） |
| `src/controllers/menuButton/formatStatus.js` | 格式状态读取（从单元格读取当前格式） |
| `src/controllers/menuButton/borderUtils.js` | 边框工具函数 |
| `src/controllers/menuButton/mergeCalc.js` | 合并单元格计算 |
| `src/controllers/menuButton/formulaAutoInput.js` | 公式自动输入 |
| `src/controllers/menuButton/sizeUtils.js` | 尺寸工具函数 |
| `src/controllers/menuButton/styleRead.js` | 样式读取 |
| `src/controllers/menuButton/fontManage.js` | 字体管理 |
| `src/controllers/menuButton/menuUtils.js` | 菜单工具函数 |

### 1.2 旧架构核心问题

1. **对象字面量混入**：12个子模块通过展开运算符合并
2. **jQuery重度依赖**：所有工具栏按钮使用jQuery UI（下拉菜单、颜色选择器等）
3. **spectrum颜色选择器**：依赖jQuery版spectrum插件
4. **工具栏初始化分散**：20个独立的init函数

---

## 2. 源文件逐一分析

### 2.1 menuButton/index.js

**导出**:
```js
const menuButton = {
    ...templatesModule, ...paintFormatModule, ...toolbarInitModule,
    ...formatUpdateModule, ...formatStatusModule, ...borderUtilsModule,
    ...mergeCalcModule, ...formulaAutoInputModule, ...sizeUtilsModule,
    ...styleReadModule, ...fontManageModule, ...menuUtilsModule,
};
export default menuButton;
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `menuButton` (整个对象) | `ToolbarService` 单例实例 |

---

### 2.2 menuButton/formatUpdate.js

**功能描述**: 格式更新。将用户选择的格式应用到选区单元格。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `updateFormat(attr, value)` | 更新指定格式属性 |

**依赖**: Store, formula, luckysheetrefreshgrid

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `updateFormat(attr, value)` | `FormatService.apply(attr, value): void` |

---

### 2.3 menuButton/formatStatus.js

**功能描述**: 格式状态读取。从当前选区读取格式状态，更新工具栏按钮状态。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `readFormatStatus()` | 读取当前格式状态 |

**依赖**: Store, conditionformat, alternateformat

**jQuery使用**: `$(selector).addClass/removeClass()`, `$(selector).val()` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `readFormatStatus()` | `FormatStatusService.read(): FormatStatus` |

---

### 2.4 menuButton/mergeCalc.js

**功能描述**: 合并单元格计算。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `mergeborer(data, r, c)` | 计算合并单元格边界 |
| `mergeMove(data, r, c)` | 计算合并单元格移动 |

**依赖**: Store

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `mergeborer(data, r, c)` | `MergeCalculator.getBorders(data, r, c): MergeBounds` |
| `mergeMove(data, r, c)` | `MergeCalculator.getMoveTarget(data, r, c): CellRange` |

---

### 2.5 menuButton/toolbarInit/（20个初始化文件）

**功能描述**: 各工具栏按钮的初始化。每个文件负责一个或一组按钮的事件绑定和UI初始化。

**通用模式**:
- 使用 `$(document).on("click", selector, fn)` 绑定事件
- 使用 `$(selector).spectrum()` 初始化颜色选择器
- 使用jQuery UI创建下拉菜单

**迁移映射表**:

| 旧文件 | 新类 |
|--------|------|
| `initAlign.js` | `AlignButton.initialize(): void` |
| `initAutofilter.js` | `AutoFilterButton.initialize(): void` |
| `initBorder.js` | `BorderButton.initialize(): void` |
| `initCellColor.js` | `CellColorButton.initialize(): void` |
| `initConditionformat.js` | `ConditionFormatButton.initialize(): void` |
| `initFontFamily.js` | `FontFamilySelect.initialize(): void` |
| `initFontSize.js` | `FontSizeSelect.initialize(): void` |
| `initFreezen.js` | `FreezeButton.initialize(): void` |
| `initFunction.js` | `FunctionButton.initialize(): void` |
| `initMerge.js` | `MergeButton.initialize(): void` |
| `initMoreFormat.js` | `MoreFormatButton.initialize(): void` |
| `initNumberFormat.js` | `NumberFormatButton.initialize(): void` |
| `initPaintFormat.js` | `PaintFormatButton.initialize(): void` |
| `initTextColor.js` | `TextColorButton.initialize(): void` |
| `initTextStyle.js` | `TextStyleButton.initialize(): void` |

---

## 3. 新架构对应位置

```
src/
  toolbar/
    ToolbarService.ts                  # 主服务类
    FormatService.ts                   # 格式应用服务
    FormatStatusService.ts             # 格式状态读取
    MergeCalculator.ts                 # 合并计算
    FontManager.ts                     # 字体管理
    buttons/                           # 各按钮控制器
      AlignButton.ts
      AutoFilterButton.ts
      BorderButton.ts
      CellColorButton.ts
      ConditionFormatButton.ts
      FontFamilySelect.ts
      FontSizeSelect.ts
      FreezeButton.ts
      FunctionButton.ts
      MergeButton.ts
      MoreFormatButton.ts
      NumberFormatButton.ts
      PaintFormatButton.ts
      TextColorButton.ts
      TextStyleButton.ts
    types.ts                           # TypeScript接口定义
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `updateFormat(attr, value)` | `FormatService.apply(attr, value): void` |
| `readFormatStatus()` | `FormatStatusService.read(): FormatStatus` |
| `mergeborer(data, r, c)` | `MergeCalculator.getBorders(data, r, c): MergeBounds` |
| `mergeMove(data, r, c)` | `MergeCalculator.getMoveTarget(data, r, c): CellRange` |
| `toolbarInit()` | `ToolbarService.initialize(): void` |
| 各init函数 | 各Button类 `.initialize(): void` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 应用粗体 | 选择单元格后点击粗体 | 单元格bl属性变为1 |
| 应用颜色 | 选择单元格后选择颜色 | 单元格fc/bc属性更新 |
| 合并单元格 | 选择范围后点击合并 | config.merge更新 |
| 读取格式 | 选中已设置格式的单元格 | 工具栏状态正确反映 |
| 格式刷 | 源格式应用到目标 | 目标格式与源一致 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `controllers/select.js` | `mergeborer()` | 选区高亮时处理合并单元格 |
| `controllers/handler/cellEvents.js` | `readFormatStatus()` | 单元格选中时更新工具栏 |
| `controllers/keyboard.js` | `readFormatStatus()` | 键盘移动后更新工具栏 |
| `controllers/updateCell.js` | `readFormatStatus()` | 编辑完成后更新工具栏 |
| `global/api/` | `updateFormat()`, `readFormatStatus()` | 公开API |
