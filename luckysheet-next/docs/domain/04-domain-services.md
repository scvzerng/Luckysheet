# Luckysheet 领域服务设计

> 本文档定义了 Luckysheet DDD 重构中所有领域服务的接口、依赖关系和使用示例。
> 领域服务封装不属于任何实体或值对象的业务逻辑，是无状态的操作。

---

## 一、领域服务总览

| 服务 | 职责 | 对应旧代码 |
|------|------|-----------|
| ComputeEngine | 条件格式计算引擎 | `conditionformat/compute.js` + `computeSub/*.js` |
| FormulaEngine | 公式解析与计算 | `global/formula/*.js` + `function/*.js` |
| CellValueResolver | 单元格值解析 | `global/getdata.js` 中的 `getcellvalue`、`valueShowEs` |
| RangeSplitter | 范围拆分 | `conditionformat/rangeSplit.js` 中的 `CFSplitRange` |
| ColorInterpolator | 颜色插值计算 | `conditionformat/compute.js` 中的 `getcolorGradation` |
| StatisticsCalculator | 统计计算 | `computeDataBar/ColorGradation/Icons` 中的 min/max/sum/count |
| UndoRedoManager | 撤销重做管理 | `controlHistory.js` |

---

## 二、ComputeEngine — 条件格式计算引擎

### 2.1 接口定义

```typescript
interface IComputeEngine {
  compute(sheet: Sheet): ComputeResult;
  computeRule(rule: ConditionRule, cells: CellMatrix): PartialComputeResult;
  getComputeResult(sheetId: SheetId): ComputeResult | null;
  getCellStyle(sheetId: SheetId, position: CellPosition): ComputedStyle | null;
  invalidateCache(sheetId: SheetId): void;
  invalidateCacheForRange(sheetId: SheetId, range: CellRange): void;
}
```

### 2.2 类型定义

```typescript
interface ComputeResult {
  readonly sheetId: SheetId;
  readonly entries: ReadonlyMap<string, ComputedStyle>;
  get(position: CellPosition): ComputedStyle | null;
}

interface PartialComputeResult {
  readonly ruleId: ConditionRuleId;
  readonly entries: Map<string, ComputedStyle>;
}

interface ComputedStyle {
  textColor?: string;
  cellColor?: string;
  dataBar?: DataBarInfo;
  icons?: IconInfo;
}
```

### 2.3 依赖关系

```
ComputeEngine
├── IConditionStrategy (条件策略)
├── IFormatStrategy (格式策略)
├── StatisticsCalculator (统计计算)
├── ColorInterpolator (颜色插值)
└── CellValueResolver (值解析)
```

### 2.4 实现示例

```typescript
class ComputeEngine implements IComputeEngine {
  private cache: Map<SheetId, ComputeResult> = new Map();

  constructor(
    private statisticsCalculator: StatisticsCalculator,
    private colorInterpolator: ColorInterpolator,
    private cellValueResolver: CellValueResolver,
  ) {}

  compute(sheet: Sheet): ComputeResult {
    const entries = new Map<string, ComputedStyle>();

    for (const rule of sheet.conditionRules) {
      if (!rule.enabled) continue;

      const partial = this.computeRule(rule, sheet.cells);
      for (const [key, style] of partial.entries) {
        const existing = entries.get(key);
        entries.set(key, existing ? { ...existing, ...style } : { ...style });
      }
    }

    const result: ComputeResult = {
      sheetId: sheet.id,
      entries,
      get(position: CellPosition): ComputedStyle | null {
        return entries.get(`${position.row}_${position.col}`) ?? null;
      },
    };

    this.cache.set(sheet.id, result);
    return result;
  }

  computeRule(rule: ConditionRule, cells: CellMatrix): PartialComputeResult {
    const entries = new Map<string, ComputedStyle>();
    const context = this.createEvaluationContext(rule, cells);

    for (const range of rule.cellRanges) {
      for (const pos of range.iterate()) {
        const cell = cells.get(pos);
        if (!cell || cell.isEmpty()) continue;

        if (rule.conditionStrategy.evaluate(cell, context)) {
          const style = rule.formatStrategy.computeStyle(cell, context);
          if (style) {
            const key = `${pos.row}_${pos.col}`;
            entries.set(key, style);
          }
        }
      }
    }

    return { ruleId: rule.id, entries };
  }

  getComputeResult(sheetId: SheetId): ComputeResult | null {
    return this.cache.get(sheetId) ?? null;
  }

  getCellStyle(sheetId: SheetId, position: CellPosition): ComputedStyle | null {
    const result = this.cache.get(sheetId);
    return result?.get(position) ?? null;
  }

  invalidateCache(sheetId: SheetId): void {
    this.cache.delete(sheetId);
  }

  invalidateCacheForRange(sheetId: SheetId, range: CellRange): void {
    const result = this.cache.get(sheetId);
    if (!result) return;
    range.forEach(pos => {
      result.entries.delete(`${pos.row}_${pos.col}`);
    });
  }

  private createEvaluationContext(rule: ConditionRule, cells: CellMatrix): EvaluationContext {
    const allCells: Cell[] = [];
    for (const range of rule.cellRanges) {
      range.forEach(pos => {
        const cell = cells.get(pos);
        if (cell && !cell.isEmpty()) allCells.push(cell);
      });
    }
    const stats = this.statisticsCalculator.calculate(allCells);

    return {
      getCell: (pos: CellPosition) => cells.get(pos),
      evaluateFormula: (formula: string, basePos: CellPosition) => {
        return false;
      },
      getValueCounts: () => {
        const counts = new Map<CellValue, number>();
        for (const cell of allCells) {
          counts.set(cell.value, (counts.get(cell.value) ?? 0) + 1);
        }
        return counts;
      },
      getStatistics: () => stats,
    };
  }
}
```

---

## 三、FormulaEngine — 公式解析与计算

### 3.1 接口定义

```typescript
interface IFormulaEngine {
  parse(expression: string): FormulaAST;
  evaluate(expression: string, context: FormulaEvaluationContext): CellValue | ErrorValue;
  evaluateAll(sheet: Sheet): Map<CellPosition, CellValue | ErrorValue>;
  buildCalcChain(sheets: ReadonlyMap<SheetId, Sheet>): CalcChain;
  recalculateAffected(
    changedPosition: CellPosition,
    sheetId: SheetId,
    calcChain: CalcChain,
  ): Map<CellPosition, CellValue | ErrorValue>;
  extractDependencies(expression: string): CellPosition[];
  validateFormula(expression: string): FormulaValidationResult;
  addFunction(name: string, fn: IFunction): void;
  getFunction(name: string): IFunction | undefined;
}
```

### 3.2 类型定义

```typescript
interface FormulaEvaluationContext {
  getCell(position: CellPosition, sheetId?: SheetId): Cell | null;
  getRange(range: CellRange, sheetId?: SheetId): (Cell | null)[][];
  getCurrentPosition(): CellPosition;
  getCurrentSheetId(): SheetId;
  resolveName(name: string): CellPosition | CellRange | null;
}

interface FormulaValidationResult {
  valid: boolean;
  error?: string;
  errorPosition?: number;
}

interface IFunction {
  readonly name: string;
  readonly category: FunctionCategory;
  readonly description: string;
  readonly parameterCount: number | [number, number];
  evaluate(args: CellValue[], context: FormulaEvaluationContext): CellValue | ErrorValue;
}

enum FunctionCategory {
  Math = 'math',
  Statistical = 'statistical',
  Text = 'text',
  Date = 'date',
  Financial = 'financial',
  Lookup = 'lookup',
  Engineering = 'engineering',
  Logical = 'logical',
  Information = 'information',
  Database = 'database',
  Array = 'array',
}
```

### 3.3 依赖关系

```
FormulaEngine
├── IFunction[] (函数注册表)
├── CellValueResolver (值解析)
├── CalcChain (计算链)
└── IEventBus (发布 CellValueChangedEvent)
```

### 3.4 使用示例

```typescript
const formulaEngine = new FormulaEngine();

const result = formulaEngine.evaluate('=SUM(A1:A10)', {
  getCell: (pos) => sheet.getCell(pos),
  getRange: (range) => sheet.cells.getRange(range),
  getCurrentPosition: () => CellPosition.create(0, 0),
  getCurrentSheetId: () => sheet.id,
  resolveName: () => null,
});

const validation = formulaEngine.validateFormula('=SUM(A1:A10)');
if (!validation.valid) {
  console.error('公式错误:', validation.error);
}

const deps = formulaEngine.extractDependencies('=A1+B2*C3');
```

---

## 四、CellValueResolver — 单元格值解析

### 4.1 接口定义

```typescript
interface ICellValueResolver {
  resolve(cell: Cell | null): CellValue;
  resolveDisplayValue(cell: Cell | null): string;
  resolveRealValue(cell: Cell | null): CellValue;
  resolveNumericValue(cell: Cell | null): number | null;
  isNumericCell(cell: Cell): boolean;
  isErrorValue(value: CellValue): boolean;
  parseInputValue(input: string, existingCell: Cell | null): ParsedInput;
}
```

### 4.3 类型定义

```typescript
interface ParsedInput {
  value: CellValue;
  displayValue: string;
  typeInfo: CellTypeInfo;
  formula: string | null;
}
```

### 4.4 依赖关系

```
CellValueResolver
├── CellFormat (格式化服务，对应 genarate/update 函数)
└── (无其他领域服务依赖)
```

### 4.5 实现示例

```typescript
class CellValueResolver implements ICellValueResolver {
  resolve(cell: Cell | null): CellValue {
    if (cell === null || cell.isEmpty()) return null;
    return cell.value;
  }

  resolveDisplayValue(cell: Cell | null): string {
    if (cell === null || cell.isEmpty()) return '';
    if (cell.displayValue !== '') return cell.displayValue;
    if (cell.value === null) return '';
    return String(cell.value);
  }

  resolveRealValue(cell: Cell | null): CellValue {
    if (cell === null || cell.isEmpty()) return null;
    if (cell.isFormula() && cell.value !== null) {
      return cell.value;
    }
    return cell.value;
  }

  resolveNumericValue(cell: Cell | null): number | null {
    if (cell === null || cell.isEmpty()) return null;
    if (typeof cell.value === 'number') return cell.value;
    if (typeof cell.value === 'boolean') return cell.value ? 1 : 0;
    if (typeof cell.value === 'string') {
      const num = Number(cell.value);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  isNumericCell(cell: Cell): boolean {
    return cell.typeInfo.type === CellType.Number;
  }

  isErrorValue(value: CellValue): boolean {
    if (typeof value !== 'string') return false;
    return /^#(DIV\/0!|N\/A|NAME\?|NULL!|NUM!|REF!|VALUE!|GETTING_DATA!)$/.test(value);
  }

  parseInputValue(input: string, existingCell: Cell | null): ParsedInput {
    if (input.startsWith('=')) {
      return {
        value: null,
        displayValue: input,
        typeInfo: { type: CellType.Number, format: 'General' },
        formula: input,
      };
    }

    const trimmed = input.trim();
    if (trimmed === '') {
      return {
        value: null,
        displayValue: '',
        typeInfo: { type: CellType.Text, format: 'General' },
        formula: null,
      };
    }

    const num = Number(trimmed);
    if (!isNaN(num) && trimmed !== '') {
      return {
        value: num,
        displayValue: trimmed,
        typeInfo: { type: CellType.Number, format: 'General' },
        formula: null,
      };
    }

    if (trimmed.toLowerCase() === 'true' || trimmed.toLowerCase() === 'false') {
      return {
        value: trimmed.toLowerCase() === 'true',
        displayValue: trimmed.toUpperCase(),
        typeInfo: { type: CellType.Boolean, format: 'General' },
        formula: null,
      };
    }

    return {
      value: trimmed,
      displayValue: trimmed,
      typeInfo: { type: CellType.Text, format: 'General' },
      formula: null,
    };
  }
}
```

### 4.6 旧代码统一映射

本服务统一了旧代码中分散的多个值获取函数：

| 旧函数 | 位置 | 新方法 |
|--------|------|--------|
| `getcellvalue(r, c, data)` | `global/getdata.js` | `resolve(cell)` |
| `getCellValue(r, c)` | `global/api.js` | `resolve(cell)` |
| `getRealCellValue(r, c)` | `global/api.js` | `resolveRealValue(cell)` |
| `valueShowEs(r, c)` | `global/api.js` | `resolveDisplayValue(cell)` |
| `isRealNum(v)` | `global/validate.js` | `isNumericCell(cell)` |
| `valueIsError(v)` | `global/validate.js` | `isErrorValue(value)` |

---

## 五、RangeSplitter — 范围拆分

### 5.1 接口定义

```typescript
interface IRangeSplitter {
  split(
    sourceRange: CellRange,
    conditionRange: CellRange,
    targetRange: CellRange,
    splitType: RangeSplitType,
  ): CellRange[];
  splitAllParts(
    sourceRange: CellRange,
    conditionRange: CellRange,
    targetRange: CellRange,
  ): CellRange[];
  splitRestPart(
    sourceRange: CellRange,
    conditionRange: CellRange,
    targetRange: CellRange,
  ): CellRange[];
  splitOperatePart(
    sourceRange: CellRange,
    conditionRange: CellRange,
    targetRange: CellRange,
  ): CellRange[];
  findAffectedRules(
    sheetId: SheetId,
    operationRange: CellRange,
    rules: ConditionRule[],
  ): ConditionRule[];
}
```

### 5.2 类型定义

```typescript
enum RangeSplitType {
  AllPart = 'allPart',
  RestPart = 'restPart',
  OperatePart = 'operatePart',
}
```

### 5.3 依赖关系

```
RangeSplitter
└── CellRange (值对象)
```

### 5.4 实现示例

```typescript
class RangeSplitter implements IRangeSplitter {
  split(
    sourceRange: CellRange,
    conditionRange: CellRange,
    targetRange: CellRange,
    splitType: RangeSplitType,
  ): CellRange[] {
    const offsetRow = targetRange.startRow - conditionRange.startRow;
    const offsetCol = targetRange.startCol - conditionRange.startCol;

    const r1 = sourceRange.startRow;
    const r2 = sourceRange.endRow;
    const c1 = sourceRange.startCol;
    const c2 = sourceRange.endCol;

    const cr1 = conditionRange.startRow;
    const cr2 = conditionRange.endRow;
    const cc1 = conditionRange.startCol;
    const cc2 = conditionRange.endCol;

    const isSourceInsideCondition =
      r1 >= cr1 && r2 <= cr2 && c1 >= cc1 && c2 <= cc2;

    if (isSourceInsideCondition) {
      return this.splitFullyContained(
        r1, r2, c1, c2, cr1, cr2, cc1, cc2,
        offsetRow, offsetCol, splitType,
      );
    }

    const rowOverlap = r1 <= cr2 && r2 >= cr1;
    const colOverlap = c1 <= cc2 && c2 >= cc1;

    if (!rowOverlap || !colOverlap) {
      return this.splitNoOverlap(r1, r2, c1, c2, splitType);
    }

    return this.splitPartialOverlap(
      r1, r2, c1, c2, cr1, cr2, cc1, cc2,
      offsetRow, offsetCol, splitType,
    );
  }

  splitAllParts(
    sourceRange: CellRange,
    conditionRange: CellRange,
    targetRange: CellRange,
  ): CellRange[] {
    return this.split(sourceRange, conditionRange, targetRange, RangeSplitType.AllPart);
  }

  splitRestPart(
    sourceRange: CellRange,
    conditionRange: CellRange,
    targetRange: CellRange,
  ): CellRange[] {
    return this.split(sourceRange, conditionRange, targetRange, RangeSplitType.RestPart);
  }

  splitOperatePart(
    sourceRange: CellRange,
    conditionRange: CellRange,
    targetRange: CellRange,
  ): CellRange[] {
    return this.split(sourceRange, conditionRange, targetRange, RangeSplitType.OperatePart);
  }

  findAffectedRules(
    sheetId: SheetId,
    operationRange: CellRange,
    rules: ConditionRule[],
  ): ConditionRule[] {
    const affected: ConditionRule[] = [];
    for (const rule of rules) {
      for (const ruleRange of rule.cellRanges) {
        if (operationRange.overlaps(ruleRange)) {
          affected.push(rule);
          break;
        }
      }
    }
    return affected;
  }

  private splitFullyContained(
    r1: number, r2: number, c1: number, c2: number,
    cr1: number, cr2: number, cc1: number, cc2: number,
    offsetRow: number, offsetCol: number,
    splitType: RangeSplitType,
  ): CellRange[] {
    if (splitType === RangeSplitType.OperatePart) {
      return [CellRange.create(
        r1 + offsetRow, r2 + offsetRow,
        c1 + offsetCol, c2 + offsetCol,
      )];
    }
    if (splitType === RangeSplitType.RestPart) {
      return [];
    }
    return [CellRange.create(
      r1 + offsetRow, r2 + offsetRow,
      c1 + offsetCol, c2 + offsetCol,
    )];
  }

  private splitNoOverlap(
    r1: number, r2: number, c1: number, c2: number,
    splitType: RangeSplitType,
  ): CellRange[] {
    if (splitType === RangeSplitType.OperatePart) {
      return [];
    }
    return [CellRange.create(r1, r2, c1, c2)];
  }

  private splitPartialOverlap(
    r1: number, r2: number, c1: number, c2: number,
    cr1: number, cr2: number, cc1: number, cc2: number,
    offsetRow: number, offsetCol: number,
    splitType: RangeSplitType,
  ): CellRange[] {
    const restParts: CellRange[] = [];
    const operateParts: CellRange[] = [];

    const overlapR1 = Math.max(r1, cr1);
    const overlapR2 = Math.min(r2, cr2);
    const overlapC1 = Math.max(c1, cc1);
    const overlapC2 = Math.min(c2, cc2);

    if (r1 < overlapR1) {
      restParts.push(CellRange.create(r1, overlapR1 - 1, c1, c2));
    }
    if (r2 > overlapR2) {
      restParts.push(CellRange.create(overlapR2 + 1, r2, c1, c2));
    }
    if (c1 < overlapC1) {
      restParts.push(CellRange.create(overlapR1, overlapR2, c1, overlapC1 - 1));
    }
    if (c2 > overlapC2) {
      restParts.push(CellRange.create(overlapR1, overlapR2, overlapC2 + 1, c2));
    }

    operateParts.push(CellRange.create(
      overlapR1 + offsetRow, overlapR2 + offsetRow,
      overlapC1 + offsetCol, overlapC2 + offsetCol,
    ));

    switch (splitType) {
      case RangeSplitType.AllPart:
        return [...restParts, ...operateParts];
      case RangeSplitType.RestPart:
        return restParts;
      case RangeSplitType.OperatePart:
        return operateParts;
    }
  }
}
```

---

## 六、ColorInterpolator — 颜色插值计算

### 6.1 接口定义

```typescript
interface IColorInterpolator {
  interpolate(color1: string, color2: string, min: number, max: number, value: number): string;
  interpolateThreeColors(
    color1: string, color2: string, color3: string,
    min: number, mid: number, max: number,
    value: number,
  ): string;
  parseRGB(colorString: string): RGB;
  toRGBString(rgb: RGB): string;
}
```

### 6.2 类型定义

```typescript
interface RGB {
  r: number;
  g: number;
  b: number;
}
```

### 6.3 依赖关系

```
ColorInterpolator
└── (无其他领域服务依赖)
```

### 6.4 实现示例

```typescript
class ColorInterpolator implements IColorInterpolator {
  interpolate(
    color1: string, color2: string,
    min: number, max: number, value: number,
  ): string {
    const rgb1 = this.parseRGB(color1);
    const rgb2 = this.parseRGB(color2);

    if (max === min) return this.toRGBString(rgb1);

    const ratio = (value - min) / (max - min);
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);

    return this.toRGBString({ r, g, b });
  }

  interpolateThreeColors(
    color1: string, color2: string, color3: string,
    min: number, mid: number, max: number,
    value: number,
  ): string {
    if (value <= mid) {
      return this.interpolate(color3, color2, min, mid, value);
    } else {
      return this.interpolate(color2, color1, mid, max, value);
    }
  }

  parseRGB(colorString: string): RGB {
    if (colorString.startsWith('#')) {
      const hex = colorString.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }

    const match = colorString.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    }

    return { r: 0, g: 0, b: 0 };
  }

  toRGBString(rgb: RGB): string {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }
}
```

---

## 七、StatisticsCalculator — 统计计算

### 7.1 接口定义

```typescript
interface IStatisticsCalculator {
  calculate(cells: Cell[]): StatisticsResult;
  min(cells: Cell[]): number | null;
  max(cells: Cell[]): number | null;
  sum(cells: Cell[]): number;
  average(cells: Cell[]): number;
  count(cells: Cell[]): number;
  countNumbers(cells: Cell[]): number;
  median(cells: Cell[]): number | null;
  standardDeviation(cells: Cell[]): number | null;
  percentile(cells: Cell[], p: number): number | null;
  topN(cells: Cell[], n: number): Cell[];
  bottomN(cells: Cell[], n: number): Cell[];
  topNPercent(cells: Cell[], percent: number): Cell[];
  bottomNPercent(cells: Cell[], percent: number): Cell[];
  findDuplicates(cells: Cell[]): Map<CellValue, Cell[]>;
  findUniques(cells: Cell[]): Map<CellValue, Cell[]>;
}
```

### 7.2 类型定义

```typescript
interface StatisticsResult {
  min: number;
  max: number;
  sum: number;
  average: number;
  count: number;
  countNumbers: number;
}
```

### 7.3 依赖关系

```
StatisticsCalculator
└── CellValueResolver (值解析，判断数值类型)
```

### 7.4 实现示例

```typescript
class StatisticsCalculator implements IStatisticsCalculator {
  constructor(private valueResolver: CellValueResolver) {}

  calculate(cells: Cell[]): StatisticsResult {
    const numericCells = cells.filter(c => this.valueResolver.isNumericCell(c) && c.value !== null);
    const values = numericCells.map(c => c.value as number);

    if (values.length === 0) {
      return { min: 0, max: 0, sum: 0, average: 0, count: cells.length, countNumbers: 0 };
    }

    const sum = values.reduce((acc, v) => acc + v, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      min,
      max,
      sum,
      average: sum / values.length,
      count: cells.length,
      countNumbers: values.length,
    };
  }

  min(cells: Cell[]): number | null {
    const values = this.getNumericValues(cells);
    return values.length > 0 ? Math.min(...values) : null;
  }

  max(cells: Cell[]): number | null {
    const values = this.getNumericValues(cells);
    return values.length > 0 ? Math.max(...values) : null;
  }

  sum(cells: Cell[]): number {
    return this.getNumericValues(cells).reduce((acc, v) => acc + v, 0);
  }

  average(cells: Cell[]): number {
    const values = this.getNumericValues(cells);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  count(cells: Cell[]): number {
    return cells.filter(c => !c.isEmpty()).length;
  }

  countNumbers(cells: Cell[]): number {
    return this.getNumericValues(cells).length;
  }

  median(cells: Cell[]): number | null {
    const values = this.getNumericValues(cells).sort((a, b) => a - b);
    if (values.length === 0) return null;
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  }

  standardDeviation(cells: Cell[]): number | null {
    const values = this.getNumericValues(cells);
    if (values.length < 2) return null;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
  }

  percentile(cells: Cell[], p: number): number | null {
    const values = this.getNumericValues(cells).sort((a, b) => a - b);
    if (values.length === 0) return null;
    const index = (p / 100) * (values.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return values[lower];
    return values[lower] + (index - lower) * (values[upper] - values[lower]);
  }

  topN(cells: Cell[], n: number): Cell[] {
    const numericCells = cells.filter(c => this.valueResolver.isNumericCell(c));
    return numericCells.sort((a, b) => (b.value as number) - (a.value as number)).slice(0, n);
  }

  bottomN(cells: Cell[], n: number): Cell[] {
    const numericCells = cells.filter(c => this.valueResolver.isNumericCell(c));
    return numericCells.sort((a, b) => (a.value as number) - (b.value as number)).slice(0, n);
  }

  topNPercent(cells: Cell[], percent: number): Cell[] {
    const numericCells = cells.filter(c => this.valueResolver.isNumericCell(c));
    const n = Math.ceil(numericCells.length * percent / 100);
    return numericCells.sort((a, b) => (b.value as number) - (a.value as number)).slice(0, n);
  }

  bottomNPercent(cells: Cell[], percent: number): Cell[] {
    const numericCells = cells.filter(c => this.valueResolver.isNumericCell(c));
    const n = Math.ceil(numericCells.length * percent / 100);
    return numericCells.sort((a, b) => (a.value as number) - (b.value as number)).slice(0, n);
  }

  findDuplicates(cells: Cell[]): Map<CellValue, Cell[]> {
    const valueMap = new Map<CellValue, Cell[]>();
    for (const cell of cells) {
      if (cell.isEmpty()) continue;
      const existing = valueMap.get(cell.value) ?? [];
      existing.push(cell);
      valueMap.set(cell.value, existing);
    }
    const duplicates = new Map<CellValue, Cell[]>();
    for (const [value, cellList] of valueMap) {
      if (cellList.length > 1) {
        duplicates.set(value, cellList);
      }
    }
    return duplicates;
  }

  findUniques(cells: Cell[]): Map<CellValue, Cell[]> {
    const valueMap = new Map<CellValue, Cell[]>();
    for (const cell of cells) {
      if (cell.isEmpty()) continue;
      const existing = valueMap.get(cell.value) ?? [];
      existing.push(cell);
      valueMap.set(cell.value, existing);
    }
    const uniques = new Map<CellValue, Cell[]>();
    for (const [value, cellList] of valueMap) {
      if (cellList.length === 1) {
        uniques.set(value, cellList);
      }
    }
    return uniques;
  }

  private getNumericValues(cells: Cell[]): number[] {
    return cells
      .filter(c => this.valueResolver.isNumericCell(c) && c.value !== null)
      .map(c => c.value as number);
  }
}
```

---

## 八、UndoRedoManager — 撤销重做管理

### 8.1 接口定义

```typescript
interface IUndoRedoManager {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly undoCount: number;
  readonly redoCount: number;

  push(entry: HistoryEntry): void;
  undo(): HistoryEntry | null;
  redo(): HistoryEntry | null;
  clear(): void;
  clearRedo(): void;
  beginBatch(): void;
  endBatch(): void;
  suspend(): void;
  resume(): void;
}
```

### 8.2 类型定义

```typescript
interface HistoryEntry {
  readonly id: string;
  readonly type: HistoryEntryType;
  readonly sheetId: SheetId;
  readonly timestamp: Date;
  readonly data: HistoryData;
  readonly currentData: HistoryData;
  readonly range: CellRange[];
  readonly config: SheetConfig;
  readonly currentConfig: SheetConfig;
}

type HistoryEntryType =
  | 'datachange'
  | 'rangechange'
  | 'datachangeAll'
  | 'pasteCut'
  | 'resize'
  | 'cellRowChange'
  | 'addRC'
  | 'delRC'
  | 'deleteCell'
  | 'extend'
  | 'dele'
  | 'showHidRows'
  | 'showHidCols'
  | 'mergeChange'
  | 'updateCF'
  | 'updateAF'
  | 'borderChange'
  | 'addSheet'
  | 'deleteSheet'
  | 'copySheet'
  | 'sheetName'
  | 'sheetColor'
  | 'postil'
  | 'imageCtrl'
  | 'zoomChange'
  | 'updateHyperlink'
  | 'datachangeAll_filter'
  | 'datachangeAll_filter_clear'
  | 'filtershow';

interface HistoryData {
  cells: (Cell | null)[][];
  conditionRules?: ConditionRule[];
  alternateFormatRules?: AlternateFormatRule[];
  calcChain?: CalcChainEntry[];
  filterState?: FilterState | null;
  freezeState?: FreezeState | null;
  hyperlink?: Record<string, Hyperlink>;
  dynamicArray?: DynamicArray[];
}
```

### 8.3 依赖关系

```
UndoRedoManager
├── IEventBus (发布 UndoEvent / RedoEvent)
└── (无其他领域服务依赖)
```

### 8.4 实现示例

```typescript
class UndoRedoManager implements IUndoRedoManager {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private isSuspended = false;
  private isBatching = false;
  private batchEntries: HistoryEntry[] = [];
  private maxStackSize = 100;

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  get undoCount(): number {
    return this.undoStack.length;
  }

  get redoCount(): number {
    return this.redoStack.length;
  }

  push(entry: HistoryEntry): void {
    if (this.isSuspended) return;

    if (this.isBatching) {
      this.batchEntries.push(entry);
      return;
    }

    this.undoStack.push(entry);
    this.redoStack = [];

    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
  }

  undo(): HistoryEntry | null {
    if (this.undoStack.length === 0) return null;

    const entry = this.undoStack.pop()!;
    this.redoStack.push(entry);
    return entry;
  }

  redo(): HistoryEntry | null {
    if (this.redoStack.length === 0) return null;

    const entry = this.redoStack.pop()!;
    this.undoStack.push(entry);
    return entry;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  clearRedo(): void {
    this.redoStack = [];
  }

  beginBatch(): void {
    this.isBatching = true;
    this.batchEntries = [];
  }

  endBatch(): void {
    this.isBatching = false;
    if (this.batchEntries.length > 0) {
      const batchEntry = this.mergeBatchEntries(this.batchEntries);
      this.push(batchEntry);
      this.batchEntries = [];
    }
  }

  suspend(): void {
    this.isSuspended = true;
  }

  resume(): void {
    this.isSuspended = false;
  }

  private mergeBatchEntries(entries: HistoryEntry[]): HistoryEntry {
    if (entries.length === 1) return entries[0];

    const first = entries[0];
    const last = entries[entries.length - 1];

    return {
      id: `batch-${first.id}`,
      type: first.type,
      sheetId: first.sheetId,
      timestamp: first.timestamp,
      data: first.data,
      currentData: last.currentData,
      range: [...new Set(entries.flatMap(e => e.range))],
      config: first.config,
      currentConfig: last.currentConfig,
    };
  }
}
```

---

## 九、服务依赖关系图

```
                    ┌──────────────────┐
                    │   FormulaEngine  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ CellValueResolver │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼──────┐ ┌────▼──────────┐ ┌─▼──────────────────┐
    │ ComputeEngine  │ │ Statistics    │ │ UndoRedoManager    │
    │                │ │ Calculator    │ │                    │
    └───────┬────────┘ └──────┬────────┘ └────────────────────┘
            │                 │
    ┌───────▼────────┐ ┌─────▼──────────┐
    │ RangeSplitter  │ │ Color          │
    │                │ │ Interpolator   │
    └────────────────┘ └────────────────┘
```

---

## 十、服务注册与依赖注入

### 10.1 服务容器

```typescript
interface IServiceContainer {
  register<T>(key: string, factory: (container: IServiceContainer) => T): void;
  resolve<T>(key: string): T;
}

class DomainServiceContainer implements IServiceContainer {
  private factories = new Map<string, (container: IServiceContainer) => unknown>();
  private instances = new Map<string, unknown>();

  register<T>(key: string, factory: (container: IServiceContainer) => T): void {
    this.factories.set(key, factory);
  }

  resolve<T>(key: string): T {
    if (this.instances.has(key)) {
      return this.instances.get(key) as T;
    }

    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Service not registered: ${key}`);
    }

    const instance = factory(this);
    this.instances.set(key, instance);
    return instance as T;
  }
}
```

### 10.2 服务注册

```typescript
function registerDomainServices(container: IServiceContainer): void {
  container.register<IColorInterpolator>('ColorInterpolator', () => new ColorInterpolator());

  container.register<ICellValueResolver>('CellValueResolver', () => new CellValueResolver());

  container.register<IStatisticsCalculator>('StatisticsCalculator', (c) =>
    new StatisticsCalculator(c.resolve<CellValueResolver>('CellValueResolver'))
  );

  container.register<IRangeSplitter>('RangeSplitter', () => new RangeSplitter());

  container.register<IComputeEngine>('ComputeEngine', (c) =>
    new ComputeEngine(
      c.resolve<StatisticsCalculator>('StatisticsCalculator'),
      c.resolve<ColorInterpolator>('ColorInterpolator'),
      c.resolve<CellValueResolver>('CellValueResolver'),
    )
  );

  container.register<IFormulaEngine>('FormulaEngine', (c) =>
    new FormulaEngine(
      c.resolve<CellValueResolver>('CellValueResolver'),
    )
  );

  container.register<IUndoRedoManager>('UndoRedoManager', () => new UndoRedoManager());
}
```

### 10.3 使用示例

```typescript
const container = new DomainServiceContainer();
registerDomainServices(container);

const computeEngine = container.resolve<IComputeEngine>('ComputeEngine');
const formulaEngine = container.resolve<IFormulaEngine>('FormulaEngine');
const undoRedoManager = container.resolve<IUndoRedoManager>('UndoRedoManager');

const result = computeEngine.compute(sheet);
const cellStyle = computeEngine.getCellStyle(sheet.id, CellPosition.create(0, 0));
```

---

## 十一、旧代码到新服务的迁移映射

| 旧代码位置 | 旧函数/模块 | 新服务 | 新方法 |
|-----------|------------|--------|--------|
| `conditionformat/compute.js` | `compute()` | ComputeEngine | `compute(sheet)` |
| `conditionformat/compute.js` | `getComputeMap()` | ComputeEngine | `getComputeResult(sheetId)` |
| `conditionformat/compute.js` | `checksCF()` | ComputeEngine | `getCellStyle(sheetId, position)` |
| `conditionformat/computeSub/computeDataBar.js` | `computeDataBar()` | DataBarStrategy | `computeStyle(cell, context)` |
| `conditionformat/computeSub/computeColorGradation.js` | `computeColorGradation()` | ColorGradationStrategy | `computeStyle(cell, context)` |
| `conditionformat/computeSub/computeIcons.js` | `computeIcons()` | IconSetStrategy | `computeStyle(cell, context)` |
| `conditionformat/computeSub/computeDefault.js` | `computeDefault()` | DefaultFormatStrategy | `computeStyle(cell, context)` |
| `conditionformat/rangeSplit.js` | `CFSplitRange()` | RangeSplitter | `split(source, condition, target, type)` |
| `conditionformat/rangeSplit.js` | `getCFPartRange()` | RangeSplitter | `findAffectedRules(sheetId, range, rules)` |
| `conditionformat/compute.js` | `getcolorGradation()` | ColorInterpolator | `interpolate(c1, c2, min, max, value)` |
| `global/getdata.js` | `getcellvalue()` | CellValueResolver | `resolve(cell)` |
| `global/validate.js` | `isRealNum()` | CellValueResolver | `isNumericCell(cell)` |
| `global/validate.js` | `valueIsError()` | CellValueResolver | `isErrorValue(value)` |
| `global/formula/formulaParser.js` | `parse()` | FormulaEngine | `parse(expression)` |
| `global/formula/formulaExec.js` | `execFunction()` | FormulaEngine | `evaluate(expression, context)` |
| `global/formula/calcChain.js` | `addFunctionGroup()` | FormulaEngine | `buildCalcChain(sheets)` |
| `controlHistory.js` | `undo()` | UndoRedoManager | `undo()` |
| `controlHistory.js` | `redo()` | UndoRedoManager | `redo()` |
| `Store.jfundo` / `Store.jfredo` | 全局数组 | UndoRedoManager | 内部栈 |
