# Luckysheet 聚合、实体与值对象设计

> 本文档定义了 Luckysheet DDD 重构中所有聚合根、实体和值对象的设计。
> 遵循聚合边界原则：聚合内的修改必须通过聚合根进行，跨聚合的修改通过领域事件协调。

---

## 一、聚合总览

| 聚合 | 聚合根 | 类型 | 说明 |
|------|--------|------|------|
| Workbook | Workbook | 聚合根 | 工作簿，顶层容器 |
| Sheet | Sheet | 聚合根 | 工作表，独立的数据网格 |
| ConditionRule | ConditionRule | 聚合根 | 条件格式规则 |
| Formula | Formula | 聚合根 | 公式及其依赖链 |

---

## 二、Workbook 聚合

### 2.1 聚合根：Workbook

```typescript
interface IWorkbook {
  readonly id: WorkbookId;
  readonly sheets: ReadonlyMap<SheetId, Sheet>;
  activeSheetId: SheetId;
  globalConfig: GlobalConfig;
  undoRedoManager: UndoRedoManager;
  clipboard: Clipboard | null;

  getSheet(sheetId: SheetId): Sheet | undefined;
  addSheet(sheet: Sheet): void;
  removeSheet(sheetId: SheetId): void;
  switchSheet(sheetId: SheetId): void;
  getActiveSheet(): Sheet;
}
```

### 2.2 包含的实体和值对象

| 名称 | 类型 | 说明 |
|------|------|------|
| `Sheet` | 聚合根（内部引用） | Workbook 持有 Sheet 的引用，Sheet 是独立聚合根 |
| `GlobalConfig` | 值对象 | 全局配置 |
| `Clipboard` | 值对象 | 剪贴板状态 |
| `WorkbookId` | 值对象 | 工作簿唯一标识 |

### 2.3 值对象定义

```typescript
type WorkbookId = string;

interface GlobalConfig {
  defaultRowNum: number;
  defaultColumnNum: number;
  defaultRowHeight: number;
  defaultColumnWidth: number;
  showGridLines: boolean;
  devicePixelRatio: number;
  fontList: FontInfo[];
  defaultFontSize: number;
  defaultCellStyle: CellStyle;
}

interface Clipboard {
  sourceSheetId: SheetId;
  sourceRanges: CellRange[];
  data: Cell[][][];
  isCut: boolean;
}

interface FontInfo {
  fontName: string;
  label: string;
}
```

### 2.4 不变式 (Invariants)

1. **至少一个 Sheet**：Workbook 始终包含至少一个 Sheet，不允许删除最后一个 Sheet
2. **唯一 SheetId**：每个 Sheet 在 Workbook 内有唯一标识
3. **活动 Sheet 有效**：`activeSheetId` 必须指向一个存在的 Sheet
4. **剪贴板一致性**：`clipboard` 的 `sourceSheetId` 必须指向一个存在的 Sheet（当剪贴板非空时）

### 2.5 工厂方法

```typescript
class Workbook {
  static create(options?: Partial<GlobalConfig>): Workbook;
  static fromJSON(json: WorkbookJSON): Workbook;
  static createWithSingleSheet(sheetName?: string): Workbook;
}
```

### 2.6 仓储接口

```typescript
interface IWorkbookRepository {
  save(workbook: Workbook): Promise<void>;
  load(id: WorkbookId): Promise<Workbook | null>;
  delete(id: WorkbookId): Promise<void>;
}
```

---

## 三、Sheet 聚合

### 3.1 聚合根：Sheet

```typescript
interface ISheet {
  readonly id: SheetId;
  readonly name: string;
  cells: CellMatrix;
  config: SheetConfig;
  selection: Selection;
  conditionRules: ConditionRule[];
  alternateFormatRules: AlternateFormatRule[];
  filterState: FilterState | null;
  freezeState: FreezeState | null;
  calcChain: CalcChain;
  dynamicArrays: DynamicArray[];
  images: SheetImage[];
  zoomRatio: number;
  visibility: SheetVisibility;

  getCell(position: CellPosition): Cell | null;
  setCell(position: CellPosition, cell: Cell): void;
  setCellValue(position: CellPosition, value: CellValue): void;
  setCellFormula(position: CellPosition, formula: string): void;
  clearCell(position: CellPosition): void;
  mergeCells(range: CellRange): void;
  unmergeCells(range: CellRange): void;
  addConditionRule(rule: ConditionRule): void;
  removeConditionRule(ruleId: ConditionRuleId): void;
  updateConditionRule(ruleId: ConditionRuleId, update: Partial<ConditionRule>): void;
  addAlternateFormatRule(rule: AlternateFormatRule): void;
  removeAlternateFormatRule(ruleId: string): void;
  setFilter(state: FilterState): void;
  clearFilter(): void;
  setFreeze(state: FreezeState): void;
  clearFreeze(): void;
  insertRow(index: number, count: number): void;
  insertColumn(index: number, count: number): void;
  deleteRow(index: number, count: number): void;
  deleteColumn(index: number, count: number): void;
  setSelection(selection: Selection): void;
}
```

### 3.2 包含的实体和值对象

| 名称 | 类型 | 说明 |
|------|------|------|
| `Cell` | 实体 | 单元格，由 CellPosition 唯一标识 |
| `CellMatrix` | 值对象 | 单元格二维矩阵，提供按行列访问 |
| `SheetConfig` | 值对象 | 行高、列宽、隐藏、合并、边框等配置 |
| `Selection` | 值对象 | 当前选区 |
| `ConditionRule` | 聚合根（内部引用） | 条件格式规则，独立聚合根 |
| `AlternateFormatRule` | 值对象 | 交替颜色规则 |
| `FilterState` | 值对象 | 筛选状态 |
| `FreezeState` | 值对象 | 冻结状态 |
| `CalcChain` | 实体 | 计算链 |
| `DynamicArray` | 值对象 | 动态数组 |
| `SheetImage` | 值对象 | 工作表图片 |
| `SheetId` | 值对象 | 工作表唯一标识 |

### 3.3 值对象定义

#### CellMatrix

```typescript
interface CellMatrix {
  get(position: CellPosition): Cell | null;
  set(position: CellPosition, cell: Cell | null): void;
  getRange(range: CellRange): (Cell | null)[][];
  getRowCount(): number;
  getColumnCount(row: number): number;
  ensureSize(rows: number, cols: number): void;
  toPlainArray(): (Cell | null)[][];
  static fromPlainArray(data: (Cell | null)[][]): CellMatrix;
}
```

#### SheetConfig

```typescript
interface SheetConfig {
  rowHeights: Map<number, number>;
  columnWidths: Map<number, number>;
  hiddenRows: Set<number>;
  hiddenColumns: Set<number>;
  merges: Map<string, MergeInfo>;
  borders: BorderInfo[];
}
```

#### Selection

```typescript
interface Selection {
  ranges: CellRange[];
  activeCell: CellPosition;
  highlightState: SelectionHighlightState;
}

enum SelectionHighlightState {
  None = 'none',
  SingleCell = 'singleCell',
  Range = 'range',
  MultiRange = 'multiRange',
  RowHeader = 'rowHeader',
  ColumnHeader = 'columnHeader',
}
```

#### AlternateFormatRule

```typescript
interface AlternateFormatRule {
  readonly id: string;
  cellRange: CellRange;
  format: AlternateFormatStyle;
  hasRowHeader: boolean;
  hasRowFooter: boolean;
}

interface AlternateFormatStyle {
  head: ColorPair;
  one: ColorPair;
  two: ColorPair;
  foot: ColorPair;
}

interface ColorPair {
  fc: string;
  bc: string;
}
```

#### FilterState

```typescript
interface FilterState {
  range: CellRange;
  columns: FilterColumn[];
  hiddenRows: Set<number>;
}

interface FilterColumn {
  columnIndex: number;
  conditions: FilterCondition[];
}

interface FilterCondition {
  type: FilterConditionType;
  value?: string | number;
  values?: (string | number)[];
}

enum FilterConditionType {
  None = 'none',
  Value = 'value',
  Color = 'color',
  Custom = 'custom',
}
```

#### FreezeState

```typescript
interface FreezeState {
  horizontal: FreezeInfo | null;
  vertical: FreezeInfo | null;
}

interface FreezeInfo {
  freezeIndex: number;
  freezeOffset: number;
}
```

#### DynamicArray

```typescript
interface DynamicArray {
  sourcePosition: CellPosition;
  formula: string;
  data: CellValue[][];
  sheetId: SheetId;
}
```

#### SheetImage

```typescript
interface SheetImage {
  readonly id: string;
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  cropLeft: number;
  cropTop: number;
  cropWidth: number;
  cropHeight: number;
}
```

### 3.4 不变式 (Invariants)

1. **单元格位置唯一**：每个 CellPosition 在 CellMatrix 中最多对应一个 Cell
2. **合并单元格一致性**：合并区域的主单元格必须存在，从属单元格的 `mergeInfo` 必须指向有效的主单元格
3. **选区范围有效**：Selection 中的所有 CellRange 必须在有效行列范围内
4. **条件规则 ID 唯一**：同一 Sheet 内的 ConditionRule 具有唯一 ID
5. **筛选范围有效**：FilterState 的 range 必须在有效行列范围内
6. **冻结索引有效**：FreezeState 的 freezeIndex 必须 >= 0
7. **行列索引非负**：所有行列索引必须 >= 0

### 3.5 工厂方法

```typescript
class Sheet {
  static create(name: string, rows?: number, cols?: number): Sheet;
  static fromJSON(json: SheetJSON): Sheet;
  static createDefault(): Sheet;
}
```

### 3.6 仓储接口

```typescript
interface ISheetRepository {
  save(sheet: Sheet): Promise<void>;
  load(id: SheetId): Promise<Sheet | null>;
  delete(id: SheetId): Promise<void>;
  findByWorkbook(workbookId: WorkbookId): Promise<Sheet[]>;
}
```

---

## 四、Cell 实体

### 4.1 实体定义

```typescript
interface ICell {
  readonly position: CellPosition;
  value: CellValue;
  displayValue: string;
  typeInfo: CellTypeInfo;
  style: CellStyle;
  formula: string | null;
  mergeInfo: MergeInfo | null;
  comment: Comment | null;
  hyperlink: Hyperlink | null;
  borderInfo: BorderInfo | null;

  isEmpty(): boolean;
  isNumeric(): boolean;
  isText(): boolean;
  isDate(): boolean;
  isBoolean(): boolean;
  isFormula(): boolean;
  isError(): boolean;
  clone(): Cell;
}
```

### 4.2 值对象定义

#### CellPosition

```typescript
interface CellPosition {
  readonly row: number;
  readonly col: number;

  equals(other: CellPosition): boolean;
  toString(): string;
  static fromString(key: string): CellPosition;
  static create(row: number, col: number): CellPosition;
}
```

#### CellValue

```typescript
type CellValue = number | string | boolean | null;
```

#### CellTypeInfo

```typescript
interface CellTypeInfo {
  type: CellType;
  format: string;

  static GENERAL_NUMBER: CellTypeInfo;
  static GENERAL_TEXT: CellTypeInfo;
}

enum CellType {
  Number = 'n',
  Text = 's',
  Date = 'd',
  Boolean = 'b',
  InlineString = 'inlineStr',
}
```

#### CellStyle

```typescript
interface CellStyle {
  bg: string | null;
  fc: string;
  ff: number | string;
  fs: number;
  bl: number;
  it: number;
  ht: HorizontalAlign;
  vt: VerticalAlign;
  cl: number;
  un: number;
  rt: number;
  tb: TextWrap;
  tbWidth: number | null;
}

enum HorizontalAlign {
  Left = 0,
  Center = 1,
  Right = 2,
}

enum VerticalAlign {
  Middle = 0,
  Top = 1,
  Bottom = 2,
}

enum TextWrap {
  Overflow = 0,
  Wrap = 1,
  Clip = 2,
}
```

#### MergeInfo

```typescript
interface MergeInfo {
  readonly masterRow: number;
  readonly masterCol: number;
  readonly rowSpan: number;
  readonly colSpan: number;

  isMaster(position: CellPosition): boolean;
  contains(position: CellPosition): boolean;
  toRange(): CellRange;
}
```

#### Comment

```typescript
interface Comment {
  value: string;
  left: number;
  top: number;
  width: number;
  height: number;
  isShow: boolean;
}
```

#### Hyperlink

```typescript
interface Hyperlink {
  display: string;
  linkAddress: string;
  tooltip: string;
}
```

#### BorderInfo

```typescript
interface BorderInfo {
  rangeType: BorderRangeType;
  borderType: BorderType;
  color: string;
  style: BorderStyle;
  range: CellRange[];
}

enum BorderRangeType {
  Range = 'range',
  Cell = 'cell',
}

enum BorderType {
  All = 'border-all',
  Outer = 'border-outside',
  Inner = 'border-inside',
  Horizontal = 'border-horizontal',
  Vertical = 'border-vertical',
  Left = 'border-left',
  Right = 'border-right',
  Top = 'border-top',
  Bottom = 'border-bottom',
  None = 'border-none',
}

enum BorderStyle {
  Thin = 1,
  Medium = 2,
  Thick = 3,
  Dashed = 4,
  Dotted = 5,
  Double = 6,
}
```

### 4.3 不变式 (Invariants)

1. **值与类型一致**：`value` 的实际类型应与 `typeInfo.type` 一致（Number 类型对应 number 值等）
2. **公式单元格有公式**：当 `typeInfo.type === CellType.Formula` 时，`formula` 不为 null
3. **合并从属无值**：如果 `mergeInfo` 指示当前单元格不是主单元格，则 `value` 应为 null
4. **位置不可变**：`position` 一旦创建不可修改

### 4.4 工厂方法

```typescript
class Cell {
  static create(position: CellPosition, value: CellValue): Cell;
  static createEmpty(position: CellPosition): Cell;
  static createWithFormula(position: CellPosition, formula: string): Cell;
  static fromLegacyFormat(position: CellPosition, legacyCell: LegacyCellObject): Cell;
  static defaultCell(position: CellPosition): Cell;
}
```

---

## 五、CellRange 值对象

### 5.1 定义

```typescript
interface ICellRange {
  readonly row: readonly [number, number];
  readonly column: readonly [number, number];

  get startRow(): number;
  get endRow(): number;
  get startCol(): number;
  get endCol(): number;
  get rowCount(): number;
  get colCount(): number;
  get cellCount(): number;

  contains(position: CellPosition): boolean;
  containsRange(other: CellRange): boolean;
  overlaps(other: CellRange): boolean;
  isAdjacentTo(other: CellRange): boolean;
  equals(other: CellRange): boolean;
  intersect(other: CellRange): CellRange | null;
  subtract(other: CellRange): CellRange[];
  offset(rowOffset: number, colOffset: number): CellRange;
  expand(rows: number, cols: number): CellRange;
  forEach(callback: (position: CellPosition) => void): void;
  *iterate(): Generator<CellPosition>;
  toA1Notation(): string;
  static fromA1Notation(notation: string): CellRange;
  static single(row: number, col: number): CellRange;
  static create(rowStart: number, rowEnd: number, colStart: number, colEnd: number): CellRange;
}
```

### 5.2 不变式 (Invariants)

1. **行范围有效**：`row[0] >= 0 && row[1] >= row[0]`
2. **列范围有效**：`column[0] >= 0 && column[1] >= column[0]`
3. **不可变性**：CellRange 一旦创建不可修改，所有操作返回新实例

### 5.3 使用示例

```typescript
const range = CellRange.create(0, 10, 0, 5);

range.forEach(pos => {
  const cell = sheet.getCell(pos);
});

const subRanges = range.subtract(CellRange.create(3, 7, 1, 4));

const offsetRange = range.offset(5, 3);

const a1 = range.toA1Notation();
```

---

## 六、ConditionRule 聚合

### 6.1 聚合根：ConditionRule

```typescript
interface IConditionRule {
  readonly id: ConditionRuleId;
  type: ConditionRuleType;
  conditionStrategy: IConditionStrategy;
  formatStrategy: IFormatStrategy;
  cellRanges: CellRange[];
  priority: number;
  enabled: boolean;

  evaluate(cell: Cell, context: EvaluationContext): boolean;
  computeFormat(cell: Cell, context: EvaluationContext): ComputedStyle | null;
  containsRange(range: CellRange): boolean;
  splitByRange(operationRange: CellRange, targetRange: CellRange, splitType: RangeSplitType): ConditionRule[];
}

type ConditionRuleId = string;

enum ConditionRuleType {
  DataBar = 'dataBar',
  ColorGradation = 'colorGradation',
  Icons = 'icons',
  Default = 'default',
}

enum RangeSplitType {
  AllPart = 'allPart',
  RestPart = 'restPart',
  OperatePart = 'operatePart',
}
```

### 6.2 包含的实体和值对象

| 名称 | 类型 | 说明 |
|------|------|------|
| `IConditionStrategy` | 策略接口 | 条件判断策略 |
| `IFormatStrategy` | 策略接口 | 格式应用策略 |
| `CellRange[]` | 值对象 | 规则应用范围 |
| `ComputedStyle` | 值对象 | 计算后的样式结果 |

### 6.3 条件策略接口

```typescript
interface IConditionStrategy {
  readonly name: ConditionName;
  evaluate(cell: Cell, context: EvaluationContext): boolean;
}

enum ConditionName {
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
  Equal = 'equal',
  Between = 'betweenness',
  TextContains = 'textContains',
  OccurrenceDate = 'occurrenceDate',
  DuplicateValue = 'duplicateValue',
  Top10 = 'top10',
  Top10Percent = 'top10%',
  Last10 = 'last10',
  Last10Percent = 'last10%',
  AboveAverage = 'AboveAverage',
  BelowAverage = 'SubAverage',
  Formula = 'formula',
}
```

#### 具体条件策略实现

```typescript
class GreaterThanStrategy implements IConditionStrategy {
  readonly name = ConditionName.GreaterThan;
  constructor(private threshold: number | CellPosition) {}

  evaluate(cell: Cell, context: EvaluationContext): boolean {
    const thresholdValue = this.resolveThreshold(context);
    return cell.isNumeric() && (cell.value as number) > thresholdValue;
  }

  private resolveThreshold(context: EvaluationContext): number {
    if (typeof this.threshold === 'number') return this.threshold;
    const refCell = context.getCell(this.threshold);
    return refCell?.value as number ?? 0;
  }
}

class BetweenStrategy implements IConditionStrategy {
  readonly name = ConditionName.Between;
  constructor(
    private min: number | CellPosition,
    private max: number | CellPosition
  ) {}

  evaluate(cell: Cell, context: EvaluationContext): boolean {
    if (!cell.isNumeric()) return false;
    const v = cell.value as number;
    const minVal = this.resolveValue(this.min, context);
    const maxVal = this.resolveValue(this.max, context);
    return v >= minVal && v <= maxVal;
  }

  private resolveValue(val: number | CellPosition, ctx: EvaluationContext): number {
    if (typeof val === 'number') return val;
    return ctx.getCell(val)?.value as number ?? 0;
  }
}

class FormulaStrategy implements IConditionStrategy {
  readonly name = ConditionName.Formula;
  constructor(private formulaExpression: string) {}

  evaluate(cell: Cell, context: EvaluationContext): boolean {
    return context.evaluateFormula(this.formulaExpression, cell.position);
  }
}

class DuplicateValueStrategy implements IConditionStrategy {
  readonly name = ConditionName.DuplicateValue;
  constructor(private isDuplicate: boolean) {}

  evaluate(cell: Cell, context: EvaluationContext): boolean {
    const valueCounts = context.getValueCounts(cell.position);
    const count = valueCounts.get(cell.value) ?? 0;
    return this.isDuplicate ? count > 1 : count === 1;
  }
}

class AboveAverageStrategy implements IConditionStrategy {
  readonly name = ConditionName.AboveAverage;

  evaluate(cell: Cell, context: EvaluationContext): boolean {
    if (!cell.isNumeric()) return false;
    const stats = context.getStatistics();
    return (cell.value as number) > stats.average;
  }
}
```

### 6.4 格式策略接口

```typescript
interface IFormatStrategy {
  computeStyle(cell: Cell, context: EvaluationContext): ComputedStyle | null;
}

interface ComputedStyle {
  textColor?: string;
  cellColor?: string;
  dataBar?: DataBarInfo;
  icons?: IconInfo;
}

interface DataBarInfo {
  valueType: 'plus' | 'minus';
  plusLen?: number;
  minusLen?: number;
  valueLen: number;
  format: string[];
}

interface IconInfo {
  left: number;
  top: number;
}

interface EvaluationContext {
  getCell(position: CellPosition): Cell | null;
  evaluateFormula(formula: string, basePosition: CellPosition): boolean;
  getValueCounts(withinRange: CellPosition): Map<CellValue, number>;
  getStatistics(): StatisticsResult;
}

interface StatisticsResult {
  min: number;
  max: number;
  sum: number;
  average: number;
  count: number;
}
```

#### 具体格式策略实现

```typescript
class DataBarStrategy implements IFormatStrategy {
  constructor(private format: string[]) {}

  computeStyle(cell: Cell, context: EvaluationContext): ComputedStyle | null {
    if (!cell.isNumeric()) return null;
    const stats = context.getStatistics();
    const value = cell.value as number;

    if (stats.min < 0) {
      const plusLen = Math.round(stats.max / (stats.max - stats.min) * 10) / 10;
      const minusLen = Math.round(Math.abs(stats.min) / (stats.max - stats.min) * 10) / 10;
      if (value < 0) {
        const valueLen = Math.round(Math.abs(value) / Math.abs(stats.min) * 100) / 100;
        return { dataBar: { valueType: 'minus', minusLen, valueLen, format: this.format } };
      } else {
        const valueLen = Math.round(value / stats.max * 100) / 100;
        return { dataBar: { valueType: 'plus', plusLen, minusLen, valueLen, format: this.format } };
      }
    } else {
      const valueLen = stats.max === stats.min ? 1 : Math.round(value / stats.max * 100) / 100;
      return { dataBar: { valueType: 'plus', plusLen: 1, valueLen, format: this.format } };
    }
  }
}

class ColorGradationStrategy implements IFormatStrategy {
  constructor(private colors: string[]) {}

  computeStyle(cell: Cell, context: EvaluationContext): ComputedStyle | null {
    if (!cell.isNumeric()) return null;
    const stats = context.getStatistics();
    const value = cell.value as number;
    const interpolator = new ColorInterpolator(this.colors, stats.min, stats.max);
    const color = interpolator.getColor(value);
    return { cellColor: color };
  }
}

class IconSetStrategy implements IFormatStrategy {
  constructor(private config: IconSetConfig) {}

  computeStyle(cell: Cell, context: EvaluationContext): ComputedStyle | null {
    if (!cell.isNumeric()) return null;
    const stats = context.getStatistics();
    const value = cell.value as number;
    const iconPosition = this.calculateIconPosition(value, stats.min, stats.max);
    return { icons: iconPosition };
  }

  private calculateIconPosition(value: number, min: number, max: number): IconInfo {
    const len = this.config.len;
    const a = Math.floor((max - min + 1) / len);
    const b = (max - min + 1) % len;
    const ranges = this.buildRanges(min, max, len, a, b);
    for (let i = 0; i < ranges.length; i++) {
      if (value >= ranges[i][0] && value <= ranges[i][1]) {
        return { left: this.config.leftMin + (len - 1 - i), top: this.config.top };
      }
    }
    return { left: this.config.leftMin, top: this.config.top };
  }

  private buildRanges(min: number, max: number, len: number, a: number, b: number): number[][] {
    const ranges: number[][] = [];
    let current = min;
    for (let i = 0; i < len; i++) {
      const size = a + (i < b ? 1 : 0);
      ranges.push([current, current + size - 1]);
      current += size;
    }
    return ranges;
  }
}

interface IconSetConfig {
  len: number;
  leftMin: number;
  top: number;
}

class DefaultFormatStrategy implements IFormatStrategy {
  constructor(private textColor?: string, private cellColor?: string) {}

  computeStyle(_cell: Cell, _context: EvaluationContext): ComputedStyle | null {
    const result: ComputedStyle = {};
    if (this.textColor) result.textColor = this.textColor;
    if (this.cellColor) result.cellColor = this.cellColor;
    return result;
  }
}
```

### 6.5 不变式 (Invariants)

1. **应用范围非空**：`cellRanges` 至少包含一个 CellRange
2. **策略一致性**：`type` 与 `formatStrategy` 的类型必须匹配（DataBar 对应 DataBarStrategy 等）
3. **优先级唯一**：同一 Sheet 内的 ConditionRule 优先级不重复
4. **ID 唯一**：每个 ConditionRule 有全局唯一 ID

### 6.6 工厂方法

```typescript
class ConditionRule {
  static createDataBar(cellRanges: CellRange[], format: string[]): ConditionRule;
  static createColorGradation(cellRanges: CellRange[], colors: string[]): ConditionRule;
  static createIconSet(cellRanges: CellRange[], config: IconSetConfig): ConditionRule;
  static createGreaterThan(cellRanges: CellRange[], threshold: number, textColor?: string, cellColor?: string): ConditionRule;
  static createLessThan(cellRanges: CellRange[], threshold: number, textColor?: string, cellColor?: string): ConditionRule;
  static createBetween(cellRanges: CellRange[], min: number, max: number, textColor?: string, cellColor?: string): ConditionRule;
  static createFormula(cellRanges: CellRange[], formula: string, textColor?: string, cellColor?: string): ConditionRule;
  static fromLegacyFormat(legacyRule: LegacyConditionRule): ConditionRule;
}
```

### 6.7 仓储接口

```typescript
interface IConditionRuleRepository {
  save(rule: ConditionRule): Promise<void>;
  load(id: ConditionRuleId): Promise<ConditionRule | null>;
  findBySheet(sheetId: SheetId): Promise<ConditionRule[]>;
  delete(id: ConditionRuleId): Promise<void>;
}
```

---

## 七、Formula 聚合

### 7.1 聚合根：Formula

```typescript
interface IFormula {
  readonly id: FormulaId;
  expression: string;
  position: CellPosition;
  sheetId: SheetId;
  dependencies: CellPosition[];
  result: CellValue | ErrorValue;
  calcChainEntry: CalcChainEntry | null;

  parse(): FormulaAST;
  evaluate(context: FormulaEvaluationContext): CellValue | ErrorValue;
  updateDependencies(newDependencies: CellPosition[]): void;
  updateResult(result: CellValue | ErrorValue): void;
  dependsOn(position: CellPosition): boolean;
  hasCircularDependency(): boolean;
}

type FormulaId = string;
```

### 7.2 包含的实体和值对象

| 名称 | 类型 | 说明 |
|------|------|------|
| `CalcChainEntry` | 值对象 | 计算链条目 |
| `FormulaAST` | 值对象 | 公式抽象语法树 |
| `CellPosition` | 值对象 | 公式所在位置 |
| `CellPosition[]` | 值对象列表 | 依赖的单元格位置 |

### 7.3 值对象定义

#### CalcChainEntry

```typescript
interface CalcChainEntry {
  position: CellPosition;
  sheetId: SheetId;
  formula: string | null;
  level: number;
}

interface CalcChain {
  entries: CalcChainEntry[];

  add(entry: CalcChainEntry): void;
  remove(position: CellPosition, sheetId: SheetId): void;
  getDependents(position: CellPosition): CalcChainEntry[];
  getDependencies(position: CellPosition): CalcChainEntry[];
  sortByDependency(): CalcChainEntry[];
  insertOrUpdate(position: CellPosition, sheetId: SheetId): void;
}
```

#### FormulaAST

```typescript
type FormulaAST = ASTNode;

type ASTNode =
  | { type: 'literal'; value: CellValue }
  | { type: 'cellRef'; position: CellPosition; sheetId?: SheetId }
  | { type: 'rangeRef'; start: CellPosition; end: CellPosition; sheetId?: SheetId }
  | { type: 'functionCall'; name: string; args: ASTNode[] }
  | { type: 'binaryOp'; operator: string; left: ASTNode; right: ASTNode }
  | { type: 'unaryOp'; operator: string; operand: ASTNode };
```

### 7.4 不变式 (Invariants)

1. **表达式以 = 开头**：`expression` 必须以 `=` 开头
2. **位置有效**：`position` 必须在有效行列范围内
3. **无循环依赖**：公式不能直接或间接依赖自身
4. **依赖完整**：`dependencies` 必须包含表达式中引用的所有单元格位置

### 7.5 工厂方法

```typescript
class Formula {
  static create(position: CellPosition, sheetId: SheetId, expression: string): Formula;
  static fromCalcChainEntry(entry: CalcChainEntry, expression: string): Formula;
}
```

### 7.6 仓储接口

```typescript
interface IFormulaRepository {
  save(formula: Formula): Promise<void>;
  load(id: FormulaId): Promise<Formula | null>;
  findByPosition(position: CellPosition, sheetId: SheetId): Promise<Formula | null>;
  findDependents(position: CellPosition, sheetId: SheetId): Promise<Formula[]>;
  delete(id: FormulaId): Promise<void>;
}
```

---

## 八、Selection 值对象

### 8.1 定义

```typescript
interface ISelection {
  ranges: CellRange[];
  activeCell: CellPosition;

  get primaryRange(): CellRange | null;
  get isSingleCell(): boolean;
  get isMultiRange(): boolean;
  get isRowSelection(): boolean;
  get isColumnSelection(): boolean;

  addRange(range: CellRange): Selection;
  removeRange(index: number): Selection;
  setActiveCell(position: CellPosition): Selection;
  clear(): Selection;
  moveTo(position: CellPosition): Selection;
  expandTo(position: CellPosition): Selection;
  selectAll(maxRow: number, maxCol: number): Selection;
  selectRow(row: number): Selection;
  selectColumn(col: number): Selection;
  intersects(range: CellRange): boolean;
}
```

### 8.2 不变式 (Invariants)

1. **至少一个范围**：Selection 始终包含至少一个 CellRange
2. **活动单元格在范围内**：`activeCell` 必须在 `ranges[0]` 内
3. **范围不重复**：ranges 中不应有完全相同的 CellRange

### 8.3 工厂方法

```typescript
class Selection {
  static createSingle(row: number, col: number): Selection;
  static createRange(range: CellRange): Selection;
  static createMultiRange(ranges: CellRange[], activeCell: CellPosition): Selection;
  static createRowSelection(row: number, maxCol: number): Selection;
  static createColumnSelection(col: number, maxRow: number): Selection;
  static fromLegacySelectSave(selectSave: LegacySelectSave[]): Selection;
}
```

---

## 九、聚合间关系图

```
┌─────────────────────────────────────────────────────────┐
│                      Workbook 聚合                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Sheet 1  │  │ Sheet 2  │  │ Sheet N  │  (引用关系)   │
│  └────┬─────┘  └──────────┘  └──────────┘              │
│       │                                                  │
│  ┌────┴──────────────────────────────────────────────┐  │
│  │              Sheet 聚合                            │  │
│  │                                                    │  │
│  │  ┌─────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │CellMatrix│  │ConditionRule[]│  │AlternateFmt[]│  │  │
│  │  │         │  │              │  │             │  │  │
│  │  │ Cell[][]│  │ ┌──────────┐ │  │             │  │  │
│  │  │         │  │ │Condition│ │  │             │  │  │
│  │  └─────────┘  │ │Strategy │ │  └─────────────┘  │  │
│  │               │ └──────────┘ │                    │  │
│  │  ┌─────────┐  │ ┌──────────┐ │  ┌─────────────┐  │  │
│  │  │Selection│  │ │Format   │ │  │FilterState  │  │  │
│  │  └─────────┘  │ │Strategy │ │  └─────────────┘  │  │
│  │               │ └──────────┘ │                    │  │
│  │  ┌─────────┐  └──────────────┘  ┌─────────────┐  │  │
│  │  │CalcChain│                     │FreezeState  │  │  │
│  │  └─────────┘                     └─────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────┐                         │
│  │UndoRedoManager│  │Clipboard│                          │
│  └──────────────┘  └──────────┘                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         ConditionRule 聚合（独立）        │
│                                         │
│  ┌────────────────┐  ┌───────────────┐  │
│  │IConditionStrategy│  │IFormatStrategy│  │
│  │  - GreaterThan  │  │  - DataBar    │  │
│  │  - LessThan     │  │  - ColorGrad │  │
│  │  - Between      │  │  - IconSet   │  │
│  │  - Formula      │  │  - Default   │  │
│  │  - Duplicate    │  └───────────────┘  │
│  │  - Average      │                     │
│  └────────────────┘  ┌───────────────┐  │
│                       │CellRange[]    │  │
│                       └───────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          Formula 聚合（独立）             │
│                                         │
│  ┌──────────┐  ┌─────────────────────┐  │
│  │expression│  │dependencies: Pos[]  │  │
│  └──────────┘  └─────────────────────┘  │
│  ┌──────────┐  ┌─────────────────────┐  │
│  │  result  │  │  CalcChainEntry     │  │
│  └──────────┘  └─────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 十、聚合边界与修改规则

### 10.1 跨聚合修改规则

| 操作 | 发起方 | 协调方式 | 说明 |
|------|--------|---------|------|
| 修改单元格值 | Sheet | 领域事件 `CellValueChangedEvent` | Formula 聚合监听并重新计算 |
| 添加条件规则 | Sheet | 直接修改 | ConditionRule 是 Sheet 的内部聚合 |
| 删除行列 | Sheet | 领域事件 `RowColumnChangedEvent` | 通知 Formula 更新依赖、通知 ConditionRule 更新范围 |
| 切换工作表 | Workbook | 直接修改 | 更新 `activeSheetId` |
| 复制粘贴 | Workbook → Sheet | 通过 Clipboard 值对象 | 先写入剪贴板，再从剪贴板读取写入目标 Sheet |

### 10.2 聚合一致性保证

1. **聚合内强一致性**：同一聚合内的修改必须保证不变式
2. **聚合间最终一致性**：跨聚合的修改通过领域事件异步协调
3. **事务边界**：每个聚合是一个事务边界，不跨聚合开事务
4. **引用方式**：聚合间通过 ID 引用，不持有其他聚合根的直接引用
