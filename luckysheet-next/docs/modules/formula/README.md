# 公式模块（Formula）迁移文档

> 本文档为 Luckysheet 公式模块从旧架构迁移到新架构的完整指南。公式模块是系统中最复杂的模块之一，涵盖公式解析、计算引擎、函数库和UI交互。

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

#### global/formula/（公式核心引擎）

| 文件路径 | 核心职责 |
|---------|---------|
| `src/global/formula/index.js` | 模块入口，合并15个子模块 |
| `src/global/formula/error.js` | 错误类型定义（#VALUE!, #REF!等） |
| `src/global/formula/dataRead.js` | 数据读取（从flowdata获取单元格值） |
| `src/global/formula/xss.js` | XSS防护（公式字符串过滤） |
| `src/global/formula/compare.js` | 比较运算符处理 |
| `src/global/formula/cellRange.js` | 单元格范围解析与操作 |
| `src/global/formula/formulaString.js` | 公式字符串处理（提取函数名、参数等） |
| `src/global/formula/formulaParser.js` | 公式解析器（递归下降解析） |
| `src/global/formula/calcChain.js` | 计算链管理（依赖关系） |
| `src/global/formula/dependency.js` | 依赖分析和拓扑排序 |
| `src/global/formula/formulaExec.js` | 公式执行引擎 |
| `src/global/formula/formulaBar.js` | 公式栏UI交互 |
| `src/global/formula/functionSearch.js` | 函数搜索与自动补全 |
| `src/global/formula/rangeSelect.js` | 范围选择（鼠标拖拽选区） |
| `src/global/formula/rangeHighlight.js` | 范围高亮显示 |
| `src/global/formula/cursorManager.js` | 光标管理（编辑器光标位置） |
| `src/global/formula/cellUpdate.js` | 单元格更新（公式计算后写回） |
| `src/global/formula/refreshButton.js` | 刷新按钮逻辑 |

#### function/（函数库实现）

| 文件路径 | 核心职责 |
|---------|---------|
| `src/function/func.js` | 函数工具入口（getCellData、compareWith等） |
| `src/function/func/index.js` | 函数工具子模块入口 |
| `src/function/func/arrayCalcUtils.js` | 数组计算工具 |
| `src/function/func/compareHelpers.js` | 比较辅助函数 |
| `src/function/func/compareWith.js` | 比较运算实现 |
| `src/function/func/getCellData.js` | 获取单元格数据 |
| `src/function/func/opAddSubMod.js` | 加减取模运算 |
| `src/function/func/opComparison.js` | 比较运算符 |
| `src/function/func/opConcat.js` | 字符串连接运算 |
| `src/function/func/opDivide.js` | 除法运算 |
| `src/function/func/opMultiply.js` | 乘法运算 |
| `src/function/func/opPower.js` | 幂运算 |
| `src/function/func/parseDataUtils.js` | 数据解析工具 |
| `src/function/func/referenceUtils.js` | 引用工具 |
| `src/function/functionImplementation.js` | 函数实现入口 |
| `src/function/functionImplementation/index.js` | 函数实现子模块入口 |
| `src/function/functionImplementation/math.js` | 数学函数汇总 |
| `src/function/functionImplementation/statistical.js` | 统计函数汇总 |
| `src/function/functionImplementation/date.js` | 日期函数汇总 |
| `src/function/functionImplementation/lookup.js` | 查找引用函数汇总 |
| `src/function/functionImplementation/logical.js` | 逻辑函数汇总 |
| `src/function/functionImplementation/text.js` | 文本函数汇总 |
| `src/function/functionImplementation/information.js` | 信息函数汇总 |
| `src/function/functionImplementation/engineering.js` | 工程函数汇总 |
| `src/function/functionImplementation/financial.js` | 财务函数汇总 |
| `src/function/functionImplementation/database.js` | 数据库函数汇总 |
| `src/function/functionImplementation/conditionalAgg.js` | 条件聚合函数 |
| `src/function/functionImplementation/dataMining.js` | 数据挖掘函数 |
| `src/function/functionImplementation/dynamicArray.js` | 动态数组函数 |
| `src/function/functionImplementation/arrayMatrix.js` | 数组矩阵函数 |
| `src/function/functionImplementation/extension.js` | 扩展函数 |
| `src/function/functionImplementation/localeCn.js` | 中文本地化函数 |
| `src/function/functionImplementation/math/mathBasic.js` | 基础数学函数实现 |
| `src/function/functionImplementation/math/mathTrigonometric.js` | 三角函数实现 |
| `src/function/functionImplementation/statistical/statisticalBasic.js` | 基础统计函数实现 |
| `src/function/functionImplementation/statistical/statisticalDistribution.js` | 分布函数实现 |
| `src/function/functionImplementation/statistical/statisticalRanking.js` | 排名函数实现 |
| `src/function/functionImplementation/statistical/statisticalRegression.js` | 回归函数实现 |
| `src/function/functionImplementation/date/dateCalculation.js` | 日期计算函数 |
| `src/function/functionImplementation/date/dateCreation.js` | 日期创建函数 |
| `src/function/functionImplementation/date/dateExtraction.js` | 日期提取函数 |
| `src/function/functionImplementation/lookup/lookupReference.js` | 查找引用函数 |
| `src/function/functionImplementation/lookup/lookupSearch.js` | 搜索函数 |
| `src/function/functionImplementation/engineering/engineeringComplex.js` | 复数工程函数 |
| `src/function/functionImplementation/engineering/engineeringConversion.js` | 转换工程函数 |
| `src/function/functionImplementation/financial/financialBond.js` | 债券财务函数 |
| `src/function/functionImplementation/financial/financialCashflow.js` | 现金流财务函数 |
| `src/function/functionImplementation/financial/financialDepreciation.js` | 折旧财务函数 |
| `src/function/functionImplementation/text/textManipulation.js` | 文本操作函数 |
| `src/function/functionImplementation/text/textSearch.js` | 文本搜索函数 |
| `src/function/functionImplementation/text/textTransform.js` | 文本转换函数 |
| `src/function/functionListDescriptor.js` | 函数列表描述入口 |
| `src/function/functionListDescriptor/index.js` | 函数列表描述子模块入口 |
| `src/function/functionlist.js` | 函数列表初始化 |
| `src/function/getLocalizedFunctionList.js` | 获取本地化函数列表 |
| `src/function/luckysheet_function.js` | 旧版函数对象（兼容） |
| `src/function/matrix_methods.js` | 矩阵方法 |

#### 控制器层

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/formulaBar.js` | 公式栏初始化和事件绑定 |
| `src/controllers/insertFormula.js` | 插入函数对话框 |
| `src/controllers/ifFormulaGenerator.js` | IF公式生成器 |

### 1.2 旧架构核心问题

1. **巨型对象混入**：`formula` 对象通过展开运算符合并15个子模块，方法数超过100个
2. **循环依赖**：formula模块与多个控制器模块存在循环引用
3. **jQuery重度依赖**：公式栏、函数搜索、范围选择等大量使用jQuery
4. **全局Store直访**：直接读写 `Store.flowdata`、`Store.luckysheetfile` 等
5. **函数实现扁平化**：所有函数实现通过单一对象注册，无类型安全
6. **eval使用**：部分公式解析使用 `new Function()` 动态执行

---

## 2. 源文件逐一分析

### 2.1 global/formula/index.js

**功能描述**: 公式模块入口，合并15个子模块为统一的 `luckysheetformula` 对象。

**导出**:
```js
export default luckysheetformula; // 包含所有子模块方法的对象
```

**依赖**: error, dataRead, xss, compare, cellRange, formulaString, formulaParser, calcChain, dependency, formulaExec, formulaBar, functionSearch, rangeSelect, rangeHighlight, cursorManager, cellUpdate, refreshButton

**jQuery使用**: 间接使用（通过子模块）

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `luckysheetformula` (整个对象) | `FormulaService` 单例实例 |

---

### 2.2 global/formula/error.js

**功能描述**: 定义公式错误类型常量。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `isFormulaError(value)` | 判断值是否为公式错误 |
| `getErrorType(error)` | 获取错误类型名称 |

**错误类型**: `#VALUE!`, `#REF!`, `#NAME?`, `#N/A`, `#DIV/0!`, `#NULL!`, `#NUM!`

**依赖**: 无

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `isFormulaError(value)` | `FormulaError.isError(value): boolean` |
| `getErrorType(error)` | `FormulaError.getType(error): FormulaErrorType` |

---

### 2.3 global/formula/formulaParser.js

**功能描述**: 公式解析器。将公式字符串解析为AST（抽象语法树），支持运算符优先级、函数调用、单元格引用等。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `formulaParse(formulaStr)` | 解析公式字符串为AST |
| `isFunctionHTML(name)` | 判断是否为函数名 |

**依赖**: formulaString, cellRange, Store

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `formulaParse(formulaStr)` | `FormulaParser.parse(formulaStr): FormulaAST` |
| `isFunctionHTML(name)` | `FunctionRegistry.isRegistered(name): boolean` |

---

### 2.4 global/formula/calcChain.js

**功能描述**: 计算链管理。维护单元格之间的依赖关系，确保公式按正确顺序计算。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `insertUpdateFunctionGroup(r, c, i)` | 插入或更新函数组 |
| `delFunctionGroup(r, c, i)` | 删除函数组 |
| `insertUpdateChangeCell(r, c, index)` | 插入或更新变更单元格 |
| `execFunctionGroup()` | 执行函数组计算 |

**依赖**: Store, formulaExec

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `insertUpdateFunctionGroup(r, c, i)` | `CalcChain.insertOrUpdate(r, c, sheetIndex): void` |
| `delFunctionGroup(r, c, i)` | `CalcChain.remove(r, c, sheetIndex): void` |
| `execFunctionGroup()` | `CalcChain.executeAll(): void` |

---

### 2.5 global/formula/formulaExec.js

**功能描述**: 公式执行引擎。执行解析后的公式，处理函数调用、运算符计算和单元格引用。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `execfunction(formulaStr, r, c)` | 执行公式字符串 |
| `execFunctionPost(formulaStr, r, c, index)` | 执行公式后处理 |
| `calcSpecialFormula(type, data)` | 计算特殊公式类型 |

**依赖**: formulaParser, calcChain, functionImplementation, Store

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `execfunction(formulaStr, r, c)` | `FormulaExecutor.execute(formulaStr, r, c): CellValue` |
| `execFunctionPost(...)` | `FormulaExecutor.executePost(formulaStr, r, c, index): void` |

---

### 2.6 global/formula/formulaBar.js

**功能描述**: 公式栏UI交互。处理公式栏输入、光标位置、范围选择等。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `fucntionboxshow(r, c)` | 在公式栏显示单元格内容 |
| `rangeResizeTo` | 当前范围调整目标元素 |
| `rangeSetValue(val)` | 设置公式栏值 |

**依赖**: Store, cursorManager

**jQuery使用**: 大量 `$("#luckysheet-functionbox-cell")` 操作

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `fucntionboxshow(r, c)` | `FormulaBarController.showCell(r, c): void` |
| `rangeSetValue(val)` | `FormulaBarController.setValue(val): void` |

---

### 2.7 global/formula/functionSearch.js

**功能描述**: 函数搜索与自动补全。根据用户输入搜索匹配的函数名，显示下拉列表。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `searchFunction(searchText)` | 搜索匹配的函数 |
| `searchFunctionHTML(list)` | 生成搜索结果HTML |

**依赖**: Store.functionlist

**jQuery使用**: `$("#luckysheet-formula-search-c")` DOM操作

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `searchFunction(searchText)` | `FunctionSearchService.search(text): FunctionDescriptor[]` |
| `searchFunctionHTML(list)` | `FunctionSearchService.renderResults(list): string` |

---

### 2.8 function/func.js（函数工具）

**功能描述**: 函数工具入口，提供单元格数据获取、比较运算、数组计算等基础能力。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `luckysheet_getcelldata(txt)` | 获取单元格数据 |
| `luckysheet_getValue(value)` | 获取单元格值 |
| `luckysheet_compareWith(...)` | 比较运算 |
| `luckysheet_getarraydata(...)` | 获取数组数据 |
| `luckysheet_parseData(...)` | 解析数据 |
| `luckysheet_indirect_check(...)` | INDIRECT函数检查 |
| `luckysheet_offset_check(...)` | OFFSET函数检查 |
| `luckysheet_calcADPMM(...)` | ADPMM计算 |
| `luckysheet_getSpecialReference(...)` | 获取特殊引用 |

**依赖**: func子模块

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `luckysheet_getcelldata(txt)` | `CellDataReader.getCellData(txt): CellValue` |
| `luckysheet_getValue(value)` | `CellDataReader.getValue(value): PrimitiveValue` |
| `luckysheet_compareWith(...)` | `CompareHelper.compareWith(...): CompareResult` |
| `luckysheet_indirect_check(...)` | `ReferenceHelper.checkIndirect(...): CellRange` |
| `luckysheet_offset_check(...)` | `ReferenceHelper.checkOffset(...): CellRange` |

---

### 2.9 function/functionImplementation/（函数实现）

**功能描述**: 各类函数的具体实现。按类别分为数学、统计、日期、查找、逻辑、文本、信息、工程、财务、数据库等。

**函数分类统计**:

| 类别 | 文件 | 大致函数数量 |
|------|------|------------|
| 数学 | mathBasic.js, mathTrigonometric.js | ~50 |
| 统计 | statisticalBasic.js, statisticalDistribution.js, statisticalRanking.js, statisticalRegression.js | ~40 |
| 日期 | dateCalculation.js, dateCreation.js, dateExtraction.js | ~20 |
| 查找 | lookupReference.js, lookupSearch.js | ~15 |
| 逻辑 | logical.js | ~10 |
| 文本 | textManipulation.js, textSearch.js, textTransform.js | ~30 |
| 信息 | information.js | ~15 |
| 工程 | engineeringComplex.js, engineeringConversion.js | ~30 |
| 财务 | financialBond.js, financialCashflow.js, financialDepreciation.js | ~30 |
| 数据库 | database.js | ~5 |
| 条件聚合 | conditionalAgg.js | ~5 |
| 数组矩阵 | arrayMatrix.js | ~10 |
| 动态数组 | dynamicArray.js | ~5 |
| 扩展 | extension.js | ~5 |

**迁移映射表**:

| 旧结构 | 新架构 |
|--------|--------|
| 函数实现对象（扁平注册） | `FunctionRegistry` + 各 `IFunctionImplementation` 类 |
| `functionImplementation.math.SUM` | `MathFunction.SUM` 类实现 `IFunctionImplementation` |
| `functionImplementation.statistical.AVERAGE` | `StatisticalFunction.AVERAGE` 类实现 `IFunctionImplementation` |

---

### 2.10 controllers/formulaBar.js

**功能描述**: 公式栏控制器。初始化公式栏事件，处理键盘输入和焦点切换。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `formulaBarInitial()` | 初始化公式栏事件 |

**依赖**: updateCell, keycode, sheetMove, insertFormula, formula, locale, Store

**jQuery使用**: `$("#luckysheet-functionbox-cell").focus()`, `.keydown()`, `$(document).on()` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `formulaBarInitial()` | `FormulaBarController.initialize(): void` |

---

### 2.11 controllers/insertFormula.js

**功能描述**: 插入函数对话框。提供函数搜索、分类浏览和参数输入功能。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `init()` | 初始化插入函数对话框 |
| `formulaListByType(type)` | 按类型筛选函数列表 |

**依赖**: formula, modelHTML, locale, Store

**jQuery使用**: 大量 `$(document).off().on()` 事件委托，`$(selector).append()` DOM操作

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `init()` | `InsertFormulaDialog.initialize(): void` |
| `formulaListByType(type)` | `InsertFormulaDialog.filterByType(type): FunctionDescriptor[]` |

---

### 2.12 controllers/ifFormulaGenerator.js

**功能描述**: IF公式生成器。提供可视化界面帮助用户构建IF嵌套公式。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `init()` | 初始化IF公式生成器 |
| `generateFormula()` | 生成IF公式字符串 |

**依赖**: formula, modelHTML, locale, Store

**jQuery使用**: 大量DOM操作和事件绑定

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `init()` | `IfFormulaGeneratorDialog.initialize(): void` |
| `generateFormula()` | `IfFormulaGeneratorDialog.generate(): string` |

---

## 3. 新架构对应位置

```
src/
  formula/
    FormulaService.ts                   # 主服务类
    FormulaParser.ts                    # 公式解析器
    FormulaExecutor.ts                  # 公式执行引擎
    CalcChain.ts                        # 计算链管理
    FormulaError.ts                     # 错误类型定义
    DependencyAnalyzer.ts               # 依赖分析
    FormulaBarController.ts             # 公式栏控制器
    FunctionSearchService.ts            # 函数搜索服务
    RangeSelector.ts                    # 范围选择器
    RangeHighlighter.ts                 # 范围高亮器
    CursorManager.ts                    # 光标管理
    CellUpdater.ts                      # 单元格更新器
    XSSFilter.ts                        # XSS过滤
    CompareOperator.ts                  # 比较运算符
    CellRangeParser.ts                  # 单元格范围解析
    FormulaStringUtils.ts               # 公式字符串工具
    types.ts                            # TypeScript接口定义
    functions/
      FunctionRegistry.ts               # 函数注册表
      IFunctionImplementation.ts        # 函数实现接口
      CellDataReader.ts                 # 单元格数据读取
      CompareHelper.ts                  # 比较辅助
      ReferenceHelper.ts                # 引用辅助
      ArrayCalcUtils.ts                 # 数组计算工具
      ParseDataUtils.ts                 # 数据解析工具
      math/
        MathBasic.ts                    # 基础数学函数
        MathTrigonometric.ts            # 三角函数
      statistical/
        StatisticalBasic.ts             # 基础统计函数
        StatisticalDistribution.ts      # 分布函数
        StatisticalRanking.ts           # 排名函数
        StatisticalRegression.ts        # 回归函数
      date/
        DateCalculation.ts              # 日期计算
        DateCreation.ts                 # 日期创建
        DateExtraction.ts               # 日期提取
      lookup/
        LookupReference.ts              # 查找引用
        LookupSearch.ts                 # 搜索函数
      text/
        TextManipulation.ts             # 文本操作
        TextSearch.ts                   # 文本搜索
        TextTransform.ts                # 文本转换
      logical/
        LogicalFunctions.ts             # 逻辑函数
      information/
        InformationFunctions.ts         # 信息函数
      engineering/
        EngineeringComplex.ts           # 复数工程
        EngineeringConversion.ts        # 转换工程
      financial/
        FinancialBond.ts                # 债券函数
        FinancialCashflow.ts            # 现金流函数
        FinancialDepreciation.ts        # 折旧函数
      database/
        DatabaseFunctions.ts            # 数据库函数
      ConditionalAgg.ts                 # 条件聚合
      ArrayMatrix.ts                    # 数组矩阵
      DynamicArray.ts                   # 动态数组
      ExtensionFunctions.ts             # 扩展函数
    dialog/
      InsertFormulaDialog.ts            # 插入函数对话框
      IfFormulaGeneratorDialog.ts       # IF公式生成器对话框
      templates/                        # 对话框模板
```

---

## 4. 迁移映射表

### 4.1 核心引擎映射

| 旧函数 | 新类.方法 |
|--------|----------|
| `execfunction(formulaStr, r, c)` | `FormulaExecutor.execute(formulaStr, r, c): CellValue` |
| `execFunctionGroup()` | `CalcChain.executeAll(): void` |
| `formulaParse(formulaStr)` | `FormulaParser.parse(formulaStr): FormulaAST` |
| `insertUpdateFunctionGroup(r, c, i)` | `CalcChain.insertOrUpdate(r, c, sheetIndex): void` |
| `delFunctionGroup(r, c, i)` | `CalcChain.remove(r, c, sheetIndex): void` |
| `isFormulaError(value)` | `FormulaError.isError(value): boolean` |

### 4.2 UI交互映射

| 旧函数 | 新类.方法 |
|--------|----------|
| `fucntionboxshow(r, c)` | `FormulaBarController.showCell(r, c): void` |
| `rangeSetValue(val)` | `FormulaBarController.setValue(val): void` |
| `searchFunction(text)` | `FunctionSearchService.search(text): FunctionDescriptor[]` |
| `formulaBarInitial()` | `FormulaBarController.initialize(): void` |
| `insertFormula.init()` | `InsertFormulaDialog.initialize(): void` |
| `ifFormulaGenerator.init()` | `IfFormulaGeneratorDialog.initialize(): void` |

### 4.3 函数工具映射

| 旧函数 | 新类.方法 |
|--------|----------|
| `luckysheet_getcelldata(txt)` | `CellDataReader.getCellData(txt): CellValue` |
| `luckysheet_compareWith(...)` | `CompareHelper.compareWith(...): CompareResult` |
| `luckysheet_indirect_check(...)` | `ReferenceHelper.checkIndirect(...): CellRange` |
| `luckysheet_offset_check(...)` | `ReferenceHelper.checkOffset(...): CellRange` |

---

## 5. 测试用例

### 5.1 FormulaParser

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 简单公式 | `"=1+2"` | AST: Add(1, 2) |
| 函数调用 | `"=SUM(A1:A3)"` | AST: Call("SUM", [Range(A1, A3)]) |
| 嵌套函数 | `"=IF(A1>0,SUM(B1:B3),0)"` | AST: Call("IF", [Gt(A1,0), Call("SUM",[Range(B1,B3)]), 0]) |
| 跨表引用 | `"=Sheet2!A1"` | AST: SheetRef("Sheet2", A1) |
| 错误公式 | `"=SUM("` | 抛出解析错误 |

### 5.2 FormulaExecutor

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 简单计算 | `"=1+2"` | `3` |
| 函数计算 | `"=SUM(1,2,3)"` | `6` |
| 单元格引用 | `"=A1+B1"` (A1=1, B1=2) | `3` |
| 错误传播 | `"=1/0"` | `#DIV/0!` |
| 循环引用 | A1引用B1, B1引用A1 | `#CIRCULAR!` |

### 5.3 CalcChain

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 添加依赖 | A1=SUM(B1:B3) | B1,B2,B3 → A1 |
| 删除依赖 | 删除A1公式 | 移除B1,B2,B3 → A1 |
| 拓扑排序 | A1→B1→C1 | 计算顺序: C1, B1, A1 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `controllers/keyboard.js` | `execFunctionGroup()`, `fucntionboxshow()` | 键盘事件中执行公式 |
| `controllers/updateCell.js` | `execfunction()`, `updatecell()` | 单元格编辑完成时计算公式 |
| `controllers/handler/cellEvents.js` | `fucntionboxshow()`, `rangeSelect` | 单元格事件中更新公式栏 |
| `controllers/controlHistory.js` | `execFunctionGroup()`, `delFunctionGroup()` | 历史记录中重算公式 |
| `controllers/selection/clipboardPaste.js` | `insertUpdateFunctionGroup()` | 粘贴时更新公式依赖 |
| `global/refresh/refreshCore.js` | `execFunctionGroup()` | 刷新时重算公式 |
| `global/draw/drawMain.js` | 间接引用 | 绘制时读取公式计算结果 |
| `global/api/rangeRead.js` | `iscelldata()`, `getcellrange()` | API中解析范围 |
| `global/api/cellOperation.js` | `execfunction()` | API中执行公式 |
| `controllers/dropCell/core/index.js` | `execFunctionGroup()` | 拖拽填充后重算 |
| `controllers/rowColumnOperation/` | `insertUpdateFunctionGroup()` | 行列操作后更新公式 |
| `controllers/filter/` | `execFunctionGroup()` | 筛选后重算 |
