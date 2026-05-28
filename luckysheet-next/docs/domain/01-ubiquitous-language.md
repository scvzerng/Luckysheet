# Luckysheet 统一语言词汇表 (Ubiquitous Language)

> 本文档定义了 Luckysheet 电子表格领域驱动设计（DDD）重构项目中使用的统一语言。
> 所有团队成员在讨论、代码和文档中必须使用这些术语的精确定义。

---

## 一、核心结构术语

### 1. Workbook（工作簿）

| 属性 | 值 |
|------|-----|
| **中文名** | 工作簿 |
| **英文名** | Workbook |
| **定义** | 电子表格应用的顶层容器，包含一个或多个工作表（Sheet），以及全局配置、撤销/重做栈等。一个 Workbook 实例对应用户打开的一个完整电子表格文档。 |
| **旧代码表现** | `Store.luckysheetfile` 数组（包含所有 Sheet 数据），`Store` 全局对象作为隐式 Workbook 上下文 |
| **新代码类型** | `Workbook` 聚合根类，实现 `IWorkbook` 接口 |

### 2. Sheet（工作表）

| 属性 | 值 |
|------|-----|
| **中文名** | 工作表 |
| **英文名** | Sheet |
| **定义** | 工作簿中的一个独立表格页面，包含单元格数据网格、列配置、行配置、条件格式规则、交替颜色规则、筛选状态、冻结状态等。每个 Sheet 有唯一的索引标识。 |
| **旧代码表现** | `Store.luckysheetfile[index]` 对象，包含 `data`（二维数组）、`config`、`luckysheet_conditionformat_save`、`luckysheet_alternateformat_save`、`calcChain`、`filter`、`frozen` 等属性 |
| **新代码类型** | `Sheet` 聚合根类，实现 `ISheet` 接口 |

### 3. Cell（单元格）

| 属性 | 值 |
|------|-----|
| **中文名** | 单元格 |
| **英文名** | Cell |
| **定义** | 工作表网格中由行号和列号唯一确定的位置，包含原始值、显示值、类型信息、样式、格式、公式等。单元格是电子表格中最基本的数据载体。 |
| **旧代码表现** | `Store.flowdata[r][c]` 或 `d[r][c]`，是一个普通对象，包含 `v`（原始值）、`m`（显示值）、`ct`（单元格类型）、`bg`（背景色）、`fc`（字体色）、`bl`（粗体）、`ff`（字体）、`fs`（字号）、`ht`（水平对齐）、`vt`（垂直对齐）、`f`（公式）、`mc`（合并信息）等属性；`null` 表示空单元格 |
| **新代码类型** | `Cell` 实体类，实现 `ICell` 接口 |

### 4. Row（行）

| 属性 | 值 |
|------|-----|
| **中文名** | 行 |
| **英文名** | Row |
| **定义** | 工作表中水平方向的一排单元格，由行号（从 0 开始的整数）标识。行具有可配置的高度，可以被隐藏或显示。 |
| **旧代码表现** | `Store.config.rowlen`（行高映射）、`Store.config.rowhidden`（行隐藏映射）、`Store.visibledatarow`（可见行累积高度数组） |
| **新代码类型** | `RowConfig` 值对象，包含在 `SheetConfig` 中 |

### 5. Column（列）

| 属性 | 值 |
|------|-----|
| **中文名** | 列 |
| **英文名** | Column |
| **定义** | 工作表中垂直方向的一列单元格，由列号（从 0 开始的整数）标识。列具有可配置的宽度，可以被隐藏或显示。 |
| **旧代码表现** | `Store.config.columnlen`（列宽映射）、`Store.config.colhidden`（列隐藏映射）、`Store.visibledatacolumn`（可见列累积宽度数组） |
| **新代码类型** | `ColumnConfig` 值对象，包含在 `SheetConfig` 中 |

### 6. CellRange（单元格范围）

| 属性 | 值 |
|------|-----|
| **中文名** | 单元格范围 |
| **英文名** | CellRange |
| **定义** | 由行范围和列范围确定的矩形区域。一个范围由 `{row: [startRow, endRow], column: [startCol, endCol]}` 定义，其中 start 和 end 均为闭区间。多个不连续的矩形区域组成一个选区。 |
| **旧代码表现** | `{row: [r1, r2], column: [c1, c2]}` 普通对象，广泛用于 `Store.luckysheet_select_save`、条件格式的 `cellrange`、筛选范围等 |
| **新代码类型** | `CellRange` 值对象类，实现 `ICellRange` 接口 |

---

## 二、单元格值与类型术语

### 7. CellValue（单元格值）

| 属性 | 值 |
|------|-----|
| **中文名** | 单元格值 |
| **英文名** | CellValue |
| **定义** | 单元格中存储的原始数据值，可以是数字、字符串、布尔值或错误值。这是参与公式计算和条件判断的基础值。 |
| **旧代码表现** | `cell.v`（原始值），`cell.m`（显示/格式化后的值），`cell.w`（另一种显示值） |
| **新代码类型** | `CellValue` 类型别名：`number | string | boolean | null | ErrorValue` |

### 8. CellType（单元格类型）

| 属性 | 值 |
|------|-----|
| **中文名** | 单元格类型 |
| **英文名** | CellType |
| **定义** | 描述单元格值的数据类型，包括数字（number）、文本（text）、日期（date）、布尔（boolean）和公式（formula）。类型信息影响值的解析、格式化和计算方式。 |
| **旧代码表现** | `cell.ct`（CellType 对象），包含 `fa`（格式字符串 format string）和 `t`（类型标识，如 `"n"` 数字、`"s"` 字符串/文本、`"d"` 日期、`"b"` 布尔） |
| **新代码类型** | `CellType` 枚举：`Number | Text | Date | Boolean | Formula`，以及 `CellTypeInfo` 值对象（包含 `type: CellType` 和 `format: string`） |

### 9. CellFormat（单元格格式）

| 属性 | 值 |
|------|-----|
| **中文名** | 单元格格式 |
| **英文名** | CellFormat |
| **定义** | 定义单元格值的显示格式规则，如数字精度、千分位、百分比、货币、日期格式等。格式字符串遵循 Excel/SSF 格式规范。 |
| **旧代码表现** | `cell.ct.fa`（格式字符串，如 `"0.00"`、`"#,##0"`、`"0%"`、`"m/d/yy"` 等），`genarate()` 函数（`src/global/format.js`）负责根据格式字符串生成显示值 |
| **新代码类型** | `CellFormat` 值对象，包含 `formatString: string` 属性 |

---

## 三、样式术语

### 10. CellStyle（单元格样式）

| 属性 | 值 |
|------|-----|
| **中文名** | 单元格样式 |
| **英文名** | CellStyle |
| **定义** | 单元格的视觉呈现属性集合，包括字体、字号、颜色、对齐方式、边框、背景色、文字旋转、自动换行等。样式不参与计算，仅影响渲染。 |
| **旧代码表现** | Cell 对象上的扁平属性：`bg`（背景色）、`fc`（字体颜色）、`ff`（字体族）、`fs`（字号）、`bl`（粗体 0/1）、`it`（斜体 0/1）、`ht`（水平对齐 0左/1中/2右）、`vt`（垂直对齐 0中/1上/2下）、`cl`（删除线）、`un`（下划线）、`rt`（旋转角度）、`tb`（自动换行） |
| **新代码类型** | `CellStyle` 值对象，实现 `ICellStyle` 接口 |

### 11. MergeCell（合并单元格）

| 属性 | 值 |
|------|-----|
| **中文名** | 合并单元格 |
| **英文名** | MergeCell |
| **定义** | 将多个相邻单元格合并为一个逻辑单元格。合并后只有左上角单元格保留值和样式，其余单元格标记为合并从属。 |
| **旧代码表现** | `cell.mc`（merge cell 对象），包含 `r`（主单元格行号）、`c`（主单元格列号）、`rs`（合并行数）、`cs`（合并列数）；`Store.config.merge` 存储所有合并信息 |
| **新代码类型** | `MergeInfo` 值对象，实现 `IMergeInfo` 接口 |

---

## 四、公式与计算术语

### 12. Formula（公式）

| 属性 | 值 |
|------|-----|
| **中文名** | 公式 |
| **英文名** | Formula |
| **定义** | 以 `=` 开头的表达式，用于动态计算单元格的值。公式可以引用其他单元格、调用内置函数、进行算术运算和逻辑判断。 |
| **旧代码表现** | `cell.f`（公式字符串，如 `"=SUM(A1:A10)"`），`formulaParser.js` 负责解析，`formulaExec.js` 负责执行 |
| **新代码类型** | `Formula` 实体类，实现 `IFormula` 接口 |

### 13. Function（函数）

| 属性 | 值 |
|------|-----|
| **中文名** | 函数 |
| **英文名** | Function |
| **定义** | 公式中可调用的内置计算操作，如 SUM、AVERAGE、IF、VLOOKUP 等。每个函数有名称、参数签名和计算逻辑。 |
| **旧代码表现** | `src/function/functionImplementation/` 目录下按类别组织的函数实现（math、statistical、text、date、financial、lookup、engineering、logical、information 等），`luckysheet_function` 对象存储函数注册表 |
| **新代码类型** | `IFunction` 接口，各函数实现此接口 |

### 14. CalcChain（计算链）

| 属性 | 值 |
|------|-----|
| **中文名** | 计算链 |
| **英文名** | CalcChain |
| **定义** | 记录所有包含公式的单元格及其依赖关系的有序列表。当单元格值变化时，通过计算链确定需要重新计算的公式单元格，保证计算顺序的正确性。 |
| **旧代码表现** | `file.calcChain` 数组，每个元素为 `{r, c, index, func}` 对象；`calcChain.js`（`src/global/formula/calcChain.js`）管理增删改查 |
| **新代码类型** | `CalcChain` 实体类，实现 `ICalcChain` 接口 |

### 15. ComputeResult（计算结果）

| 属性 | 值 |
|------|-----|
| **中文名** | 计算结果 |
| **英文名** | ComputeResult |
| **定义** | 条件格式或公式计算后产生的结果映射，以 `"row_col"` 为键，记录每个单元格应应用的格式效果（如数据条、色阶颜色、图标集位置、文本色/背景色等）。 |
| **旧代码表现** | `computeMap` 对象（`compute.js` 中返回），键为 `"r_c"` 格式字符串，值为包含 `dataBar`、`cellColor`、`textColor`、`icons` 等属性的对象；`Store.conditionFormatCells` 缓存条件格式计算结果 |
| **新代码类型** | `ComputeResult` 类型：`Map<CellPosition, ComputedStyle>` |

---

## 五、选区与交互术语

### 16. Selection（选区）

| 属性 | 值 |
|------|-----|
| **中文名** | 选区 |
| **英文名** | Selection |
| **定义** | 用户当前选中的单元格区域集合，包含一个或多个 CellRange。选区有活动单元格（active cell）概念，用于标识当前输入焦点。 |
| **旧代码表现** | `Store.luckysheet_select_save`（选区数组，每个元素为 `{row:[r1,r2], column:[c1,c2]}`），`Store.luckysheet_selection_range`（多选区辅助） |
| **新代码类型** | `Selection` 值对象，实现 `ISelection` 接口 |

### 17. Clipboard（剪贴板）

| 属性 | 值 |
|------|-----|
| **中文名** | 剪贴板 |
| **英文名** | Clipboard |
| **定义** | 用于复制、剪切和粘贴操作的临时数据存储。剪贴板保存源单元格的数据、样式和范围信息，支持跨 Sheet 粘贴。 |
| **旧代码表现** | `Store.luckysheet_copy_save`（复制数据对象），`Store.luckysheet_paste_iscut`（是否为剪切操作标志） |
| **新代码类型** | `Clipboard` 值对象，实现 `IClipboard` 接口 |

### 18. DropFill（下拉填充）

| 属性 | 值 |
|------|-----|
| **中文名** | 下拉填充 |
| **英文名** | DropFill |
| **定义** | 用户通过拖拽单元格右下角填充柄来扩展数据的交互操作。根据填充策略（复制、序列、仅格式、仅值等）生成填充数据。 |
| **旧代码表现** | `src/controllers/dropCell/` 模块，`fillStrategy.js` 定义各种填充策略（FillCopy、FillSeries、FillExtendNumber 等），`typeDetector.js` 检测数据类型 |
| **新代码类型** | `DropFillOperation` 值对象，`FillStrategy` 枚举 |

### 19. MatrixOperation（矩阵操作）

| 属性 | 值 |
|------|-----|
| **中文名** | 矩阵操作 |
| **英文名** | MatrixOperation |
| **定义** | 对选区数据进行批量变换操作，包括转置、翻转（上下/左右）、矩阵计算、格式刷复制、清除等。 |
| **旧代码表现** | `src/controllers/matrixOperation/` 模块，包含 `matrixFlipOperation.js`（翻转）、`matrixCalcOperation.js`（计算）、`matrixCleanOperation.js`（清除）、`copyFormatOperation.js`（格式复制） |
| **新代码类型** | `MatrixOperation` 领域服务 |

---

## 六、条件格式术语

### 20. ConditionalFormat（条件格式）

| 属性 | 值 |
|------|-----|
| **中文名** | 条件格式 |
| **英文名** | ConditionalFormat |
| **定义** | 根据单元格值或公式结果自动应用格式的规则集合。条件格式是 Sheet 级别的功能，包含多条规则，按优先级顺序应用。 |
| **旧代码表现** | `file.luckysheet_conditionformat_save` 数组，每条规则为 `{type, cellrange, format, conditionName, conditionRange, conditionValue}` 对象；`src/controllers/conditionformat/` 模块 |
| **新代码类型** | `ConditionalFormat` 聚合，包含 `ConditionRule[]` |

### 21. ConditionRule（条件规则）

| 属性 | 值 |
|------|-----|
| **中文名** | 条件规则 |
| **英文名** | ConditionRule |
| **定义** | 一条具体的条件格式规则，定义了条件判断策略（何时触发）和格式应用策略（如何显示），以及规则的应用范围。 |
| **旧代码表现** | `luckysheet_conditionformat_save` 数组中的单个元素，包含 `type`（规则类型）、`cellrange`（应用范围）、`format`（格式定义）、`conditionName`（条件名）、`conditionValue`（条件值） |
| **新代码类型** | `ConditionRule` 聚合根，实现 `IConditionRule` 接口 |

### 22. ConditionStrategy（条件策略）

| 属性 | 值 |
|------|-----|
| **中文名** | 条件策略 |
| **英文名** | ConditionStrategy |
| **定义** | 条件规则中判断单元格是否满足条件的逻辑。包括：大于、小于、等于、介于、文本包含、发生日期、重复值、前 N 项、前 N%、后 N 项、后 N%、高于平均、低于平均、自定义公式等。 |
| **旧代码表现** | `ruleArr[i].conditionName` 字符串，取值如 `"greaterThan"`、`"lessThan"`、`"equal"`、`"betweenness"`、`"textContains"`、`"occurrenceDate"`、`"duplicateValue"`、`"top10"`、`"top10%"`、`"last10"`、`"last10%"`、`"AboveAverage"`、`"SubAverage"`、`"formula"`；`computeDefault.js` 中通过 if-else 分支实现 |
| **新代码类型** | `IConditionStrategy` 接口，各策略实现此接口（策略模式） |

### 23. FormatStrategy（格式策略）

| 属性 | 值 |
|------|-----|
| **中文名** | 格式策略 |
| **英文名** | FormatStrategy |
| **定义** | 条件规则中决定如何格式化满足条件的单元格的逻辑。包括：默认格式（文本色+背景色）、数据条、色阶、图标集。 |
| **旧代码表现** | `ruleArr[i].type` 字段，取值 `"dataBar"`、`"colorGradation"`、`"icons"` 或其他（默认）；`compute.js` 中根据 type 分发到 `computeDataBar`、`computeColorGradation`、`computeIcons`、`computeDefault` |
| **新代码类型** | `IFormatStrategy` 接口，各策略实现此接口（策略模式） |

### 24. DataBar（数据条）

| 属性 | 值 |
|------|-----|
| **中文名** | 数据条 |
| **英文名** | DataBar |
| **定义** | 条件格式的一种可视化策略，在单元格内绘制水平条形图，长度与单元格数值成正比。支持正负值双向显示和渐变色。 |
| **旧代码表现** | `computeDataBar.js` 计算数据条参数（`valueType`、`plusLen`、`minusLen`、`valueLen`、`format`），`dataBarList` 预设数据条样式 |
| **新代码类型** | `DataBarStrategy` 类，实现 `IFormatStrategy` |

### 25. ColorGradation（色阶）

| 属性 | 值 |
|------|-----|
| **中文名** | 色阶 |
| **英文名** | ColorGradation |
| **定义** | 条件格式的一种可视化策略，根据单元格值在最小值和最大值之间的位置，在两种或三种颜色之间进行插值，为单元格背景着色。 |
| **旧代码表现** | `computeColorGradation.js` 计算色阶颜色，`colorGradationList` 预设色阶样式，`getcolorGradation()` 方法进行颜色插值 |
| **新代码类型** | `ColorGradationStrategy` 类，实现 `IFormatStrategy` |

### 26. IconSet（图标集）

| 属性 | 值 |
|------|-----|
| **中文名** | 图标集 |
| **英文名** | IconSet |
| **定义** | 条件格式的一种可视化策略，根据单元格值所在区间在单元格内显示对应图标（如箭头、交通灯、星级等）。 |
| **旧代码表现** | `computeIcons.js` 计算图标位置（`left`、`top`），`format.len`（图标数量）、`format.leftMin`、`format.top` 定义图标集参数，`luckysheet_CFiconsImg` 为图标精灵图 |
| **新代码类型** | `IconSetStrategy` 类，实现 `IFormatStrategy` |

---

## 七、交替颜色术语

### 27. AlternateFormat（交替颜色）

| 属性 | 值 |
|------|-----|
| **中文名** | 交替颜色 |
| **英文名** | AlternateFormat |
| **定义** | 按行交替应用不同颜色方案的格式规则，用于增强表格可读性。支持页眉行、页脚行和奇偶行不同配色。 |
| **旧代码表现** | `file.luckysheet_alternateformat_save` 数组，每条规则包含 `cellrange`、`format`（含 `head`、`one`、`two`、`foot` 颜色配置）、`hasRowHeader`、`hasRowFooter`；`src/controllers/alternateformat/` 模块 |
| **新代码类型** | `AlternateFormatRule` 值对象，实现 `IAlternateFormatRule` 接口 |

---

## 八、筛选与冻结术语

### 28. Filter（筛选）

| 属性 | 值 |
|------|-----|
| **中文名** | 筛选 |
| **英文名** | Filter |
| **定义** | 对指定范围的列进行条件筛选，隐藏不满足条件的行。筛选状态包含筛选范围、各列的筛选条件和隐藏行信息。 |
| **旧代码表现** | `Store.luckysheet_filter_save`（筛选范围 `{row:[], column:[]}`），`Store.config.rowhidden`（隐藏行映射），`src/controllers/filter/` 模块管理筛选 UI 和逻辑 |
| **新代码类型** | `FilterState` 值对象，实现 `IFilterState` 接口 |

### 29. FreezePane（冻结窗格）

| 属性 | 值 |
|------|-----|
| **中文名** | 冻结窗格 |
| **英文名** | FreezePane |
| **定义** | 将工作表的指定行和/或列固定在视口顶部或左侧，滚动时冻结区域保持不动。支持冻结首行、首列和自定义位置冻结。 |
| **旧代码表现** | `file.freezen` / `file.frozen` 对象（含 `horizontal` 和 `vertical` 属性），`Store.freezenhorizontaldata` / `Store.freezenverticaldata`；`src/controllers/freezen/` 模块 |
| **新代码类型** | `FreezeState` 值对象，实现 `IFreezeState` 接口 |

---

## 九、渲染术语

### 30. CellRender（单元格渲染）

| 属性 | 值 |
|------|-----|
| **中文名** | 单元格渲染 |
| **英文名** | CellRender |
| **定义** | 将单元格数据、样式和计算结果（条件格式、交替颜色）转换为 Canvas 绘制指令的过程。渲染包括背景色填充、文本绘制、边框绘制、数据条绘制、图标绘制等。 |
| **旧代码表现** | `src/global/draw/cellRender.js` 中的 `nullCellRender` 和 `cellRender` 函数，`cellTextRender.js` 处理文本渲染，`drawMain.js` 编排整体绘制流程 |
| **新代码类型** | `CellRenderer` 应用服务，协调各渲染策略 |

---

## 十、撤销/重做术语

### 31. UndoRedo（撤销重做）

| 属性 | 值 |
|------|-----|
| **中文名** | 撤销重做 |
| **英文名** | UndoRedo |
| **定义** | 记录操作历史并支持回退和重做的机制。每次修改操作生成一个历史记录项，包含操作前后的数据快照，支持按序撤销和重做。 |
| **旧代码表现** | `Store.jfundo`（撤销栈数组）、`Store.jfredo`（重做栈数组）、`Store.clearjfundo`（是否记录标志），`controlHistory.js` 实现撤销/重做逻辑，历史项包含 `type`（操作类型）、`data`/`curdata`（当前/之前数据）、`range`、`config` 等 |
| **新代码类型** | `UndoRedoManager` 领域服务，`HistoryEntry` 值对象 |

---

## 十一、辅助术语

### 32. CellPosition（单元格位置）

| 属性 | 值 |
|------|-----|
| **中文名** | 单元格位置 |
| **英文名** | CellPosition |
| **定义** | 单元格在工作表中的坐标，由行号和列号组成。 |
| **旧代码表现** | `r`（行号）和 `c`（列号）两个独立变量，或 `"r_c"` 格式字符串作为 Map 键 |
| **新代码类型** | `CellPosition` 值对象：`{ row: number; col: number }` |

### 33. SheetConfig（工作表配置）

| 属性 | 值 |
|------|-----|
| **中文名** | 工作表配置 |
| **英文名** | SheetConfig |
| **定义** | 工作表级别的配置信息，包括行高、列宽、隐藏行列、合并单元格信息、边框信息等。 |
| **旧代码表现** | `Store.config` / `file.config` 对象，包含 `rowlen`、`columnlen`、`rowhidden`、`colhidden`、`merge`、`borderInfo` 等属性 |
| **新代码类型** | `SheetConfig` 值对象，实现 `ISheetConfig` 接口 |

### 34. DisplayValue（显示值）

| 属性 | 值 |
|------|-----|
| **中文名** | 显示值 |
| **英文名** | DisplayValue |
| **定义** | 单元格值经过格式化后用于界面显示的字符串。与原始值不同，显示值可能包含千分位分隔符、百分比符号、日期格式化等。 |
| **旧代码表现** | `cell.m`（显示值/格式化值），`cell.w`（另一种显示值），`genarate()` 函数根据 `ct.fa` 格式字符串生成 |
| **新代码类型** | `displayValue: string`（Cell 实体的属性） |

### 35. ErrorValue（错误值）

| 属性 | 值 |
|------|-----|
| **中文名** | 错误值 |
| **英文名** | ErrorValue |
| **定义** | 公式计算产生的错误结果，如 `#DIV/0!`、`#N/A`、`#NAME?`、`#NULL!`、`#NUM!`、`#REF!`、`#VALUE!` 等。 |
| **旧代码表现** | 字符串形式的错误值，`valueIsError()` 函数（`src/global/validate.js`）判断是否为错误值 |
| **新代码类型** | `ErrorValue` 枚举类型 |

### 36. DynamicArray（动态数组）

| 属性 | 值 |
|------|-----|
| **中文名** | 动态数组 |
| **英文名** | DynamicArray |
| **定义** | 公式计算产生的溢出结果，一个公式的结果可以自动填充到相邻单元格。动态数组有源单元格位置和结果数据。 |
| **旧代码表现** | `file.dynamicArray` 数组、`file.dynamicArray_compute` 计算结果映射，`dynamicArrayCompute()` 函数生成计算结果 |
| **新代码类型** | `DynamicArray` 值对象 |

### 37. BorderInfo（边框信息）

| 属性 | 值 |
|------|-----|
| **中文名** | 边框信息 |
| **英文名** | BorderInfo |
| **定义** | 单元格或范围的边框样式配置，包括边框类型（全边框/外边框/内边框/自定义）、边框样式（细线/粗线/虚线等）和颜色。 |
| **旧代码表现** | `Store.config.borderInfo` 数组，每个元素包含 `rangeType`、`borderType`、`color`、`style`、`range` 等 |
| **新代码类型** | `BorderInfo` 值对象 |

### 38. Hyperlink（超链接）

| 属性 | 值 |
|------|-----|
| **中文名** | 超链接 |
| **英文名** | Hyperlink |
| **定义** | 单元格中嵌入的链接，可以指向外部 URL 或工作簿内的其他位置。 |
| **旧代码表现** | `file.hyperlink` 对象，`hyperlinkCtrl.js` 管理超链接 |
| **新代码类型** | `Hyperlink` 值对象 |

### 39. Postil（批注）

| 属性 | 值 |
|------|-----|
| **中文名** | 批注 |
| **英文名** | Postil / Comment |
| **定义** | 附加在单元格上的注释信息，包含文本内容和大小位置，以浮层形式显示。 |
| **旧代码表现** | `cell.ps`（postil 对象），包含 `value`（批注文本）、`left`、`top`、`width`、`height`；`postil.js` 管理批注 |
| **新代码类型** | `Comment` 值对象 |

### 40. Image（图片）

| 属性 | 值 |
|------|-----|
| **中文名** | 图片 |
| **英文名** | Image |
| **定义** | 嵌入在工作表中的图片元素，有位置、大小和裁剪信息。 |
| **旧代码表现** | `file.images` 对象，`imageCtrl.js` 管理图片 |
| **新代码类型** | `SheetImage` 值对象 |

### 41. DataValidation（数据验证）

| 属性 | 值 |
|------|-----|
| **中文名** | 数据验证 |
| **英文名** | DataValidation |
| **定义** | 限制单元格可输入数据范围和类型的规则，如数字范围、下拉列表、日期范围等。 |
| **旧代码表现** | `file.dataVerification` 对象，`validate.js` 提供验证逻辑 |
| **新代码类型** | `DataValidation` 值对象 |

### 42. InlineString（内联字符串）

| 属性 | 值 |
|------|-----|
| **中文名** | 内联字符串 |
| **英文名** | InlineString |
| **定义** | 单元格中包含富文本格式（多种样式混合）的字符串内容，每个片段可以有不同的字体、颜色等样式。 |
| **旧代码表现** | `cell.ct.t === "inlineStr"`，`cell.ct.s` 数组（每个元素包含 `v` 文本和样式属性），`inlineString.js` 管理内联字符串 |
| **新代码类型** | `InlineString` 值对象 |

### 43. ZoomRatio（缩放比例）

| 属性 | 值 |
|------|-----|
| **中文名** | 缩放比例 |
| **英文名** | ZoomRatio |
| **定义** | 工作表的显示缩放比例，影响所有渲染尺寸。 |
| **旧代码表现** | `Store.zoomRatio`（默认 1），`zoom.js` 管理缩放 |
| **新代码类型** | `zoomRatio: number`（Sheet 实体的属性） |

---

## 十二、术语关系图

```
Workbook
├── Sheet[] (聚合根)
│   ├── Cell[][] (实体)
│   │   ├── CellValue (值)
│   │   ├── CellTypeInfo (类型+格式)
│   │   ├── CellStyle (样式)
│   │   ├── MergeInfo (合并信息)
│   │   ├── Formula (公式)
│   │   ├── Comment (批注)
│   │   └── Hyperlink (超链接)
│   ├── SheetConfig (配置)
│   │   ├── RowConfig[] (行配置)
│   │   ├── ColumnConfig[] (列配置)
│   │   ├── MergeInfo{} (合并信息)
│   │   └── BorderInfo[] (边框信息)
│   ├── ConditionRule[] (条件规则)
│   │   ├── IConditionStrategy (条件策略)
│   │   ├── IFormatStrategy (格式策略)
│   │   │   ├── DataBarStrategy
│   │   │   ├── ColorGradationStrategy
│   │   │   ├── IconSetStrategy
│   │   │   └── DefaultFormatStrategy
│   │   └── CellRange[] (应用范围)
│   ├── AlternateFormatRule[] (交替颜色规则)
│   ├── FilterState (筛选状态)
│   ├── FreezeState (冻结状态)
│   ├── CalcChain (计算链)
│   ├── DynamicArray[] (动态数组)
│   └── SheetImage[] (图片)
├── UndoRedoManager
│   ├── HistoryEntry[] (undo 栈)
│   └── HistoryEntry[] (redo 栈)
└── GlobalConfig (全局配置)
```

---

## 十三、旧代码到新代码的映射速查

| 旧代码概念 | 新代码概念 | 说明 |
|-----------|-----------|------|
| `Store.luckysheetfile` | `Workbook.sheets` | 从全局数组变为聚合根属性 |
| `Store.flowdata` | `Sheet.cells` | 从全局二维数组变为聚合根属性 |
| `Store.config` | `Sheet.config` | 从全局对象变为聚合根属性 |
| `Store.luckysheet_select_save` | `Sheet.selection` | 从全局数组变为值对象 |
| `Store.luckysheet_copy_save` | `Workbook.clipboard` | 从全局对象变为值对象 |
| `Store.jfundo` / `Store.jfredo` | `UndoRedoManager` | 从全局数组变为领域服务 |
| `Store.currentSheetIndex` | `Workbook.activeSheetIndex` | 从全局变量变为聚合根属性 |
| `cell.v` | `Cell.value` | 原始值 |
| `cell.m` | `Cell.displayValue` | 显示值 |
| `cell.ct` | `Cell.typeInfo` | 类型信息 |
| `cell.ct.fa` | `Cell.typeInfo.format` | 格式字符串 |
| `cell.ct.t` | `Cell.typeInfo.type` | 类型标识 |
| `cell.f` | `Cell.formula` | 公式 |
| `cell.mc` | `Cell.mergeInfo` | 合并信息 |
| `cell.bg` / `cell.fc` / ... | `Cell.style.bg` / `Cell.style.fc` / ... | 样式属性归入样式对象 |
| `file.luckysheet_conditionformat_save` | `Sheet.conditionRules` | 条件格式规则 |
| `file.luckysheet_alternateformat_save` | `Sheet.alternateFormatRules` | 交替颜色规则 |
| `file.calcChain` | `Sheet.calcChain` | 计算链 |
| `file.frozen` / `file.freezen` | `Sheet.freezeState` | 冻结状态 |
| `computeMap` | `ComputeResult` | 计算结果映射 |
| `CFSplitRange()` | `RangeSplitter.split()` | 范围拆分 |
| `getcolorGradation()` | `ColorInterpolator.interpolate()` | 颜色插值 |
| `getcellvalue()` / `getCellValue()` / `valueShowEs()` | `CellValueResolver.resolve()` | 统一值解析 |
