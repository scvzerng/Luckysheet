# Luckysheet 领域事件设计

> 本文档定义了 Luckysheet DDD 重构中所有领域事件。
> 领域事件用于解耦聚合间的通信，实现最终一致性。

---

## 一、事件基础设施

### 1.1 基础事件接口

```typescript
interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly aggregateType: string;
}

interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

interface IEventBus {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: DomainEventHandler<T>): void;
  unsubscribe<T extends DomainEvent>(eventType: string, handler: DomainEventHandler<T>): void;
}
```

### 1.2 事件命名规范

- 过去时态：表示已发生的事实（如 `CellValueChanged`、`RuleAdded`）
- 格式：`[名词][动词过去式]Event`
- 事件载荷使用只读属性

---

## 二、条件格式事件

### 2.1 RuleAddedEvent（条件规则已添加）

| 属性 | 值 |
|------|-----|
| **事件名** | `RuleAddedEvent` |
| **eventType** | `conditionRule.added` |
| **生产者** | Sheet 聚合根（`addConditionRule` 方法） |
| **触发时机** | 向 Sheet 添加新的条件格式规则后 |

**载荷类型：**

```typescript
interface RuleAddedEvent extends DomainEvent {
  readonly eventType: 'conditionRule.added';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly rule: ConditionRule;
    readonly ruleIndex: number;
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| ComputeEngine | 重新计算条件格式，更新 ComputeResult |
| UndoRedoManager | 记录历史条目（类型 `updateCF`） |
| CellRenderer | 标记受影响范围为脏，触发重绘 |

**副作用：**

1. 条件格式计算结果更新
2. 撤销栈压入历史记录
3. 受影响单元格重新渲染

---

### 2.2 RuleDeletedEvent（条件规则已删除）

| 属性 | 值 |
|------|-----|
| **事件名** | `RuleDeletedEvent` |
| **eventType** | `conditionRule.deleted` |
| **生产者** | Sheet 聚合根（`removeConditionRule` 方法） |
| **触发时机** | 从 Sheet 删除条件格式规则后 |

**载荷类型：**

```typescript
interface RuleDeletedEvent extends DomainEvent {
  readonly eventType: 'conditionRule.deleted';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly ruleId: ConditionRuleId;
    readonly ruleIndex: number;
    readonly deletedRule: ConditionRule;
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| ComputeEngine | 移除该规则的计算结果，重新计算 |
| UndoRedoManager | 记录历史条目 |
| CellRenderer | 标记受影响范围为脏，触发重绘 |

**副作用：**

1. 该规则对应的 ComputeResult 条目被清除
2. 受影响单元格恢复原始样式
3. 撤销栈压入历史记录

---

### 2.3 RuleUpdatedEvent（条件规则已更新）

| 属性 | 值 |
|------|-----|
| **事件名** | `RuleUpdatedEvent` |
| **eventType** | `conditionRule.updated` |
| **生产者** | Sheet 聚合根（`updateConditionRule` 方法） |
| **触发时机** | 修改条件格式规则的条件策略、格式策略或应用范围后 |

**载荷类型：**

```typescript
interface RuleUpdatedEvent extends DomainEvent {
  readonly eventType: 'conditionRule.updated';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly ruleId: ConditionRuleId;
    readonly ruleIndex: number;
    readonly previousRule: ConditionRule;
    readonly currentRule: ConditionRule;
    readonly changedFields: ReadonlyArray<'conditionStrategy' | 'formatStrategy' | 'cellRanges' | 'priority' | 'enabled'>;
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| ComputeEngine | 重新计算该规则，合并更新 ComputeResult |
| UndoRedoManager | 记录历史条目 |
| CellRenderer | 标记新旧范围均为脏，触发重绘 |

**副作用：**

1. 旧范围和新范围的 ComputeResult 均需更新
2. 撤销栈压入历史记录
3. 旧范围和新范围单元格均需重新渲染

---

## 三、工作表事件

### 3.1 SheetCreatedEvent（工作表已创建）

| 属性 | 值 |
|------|-----|
| **事件名** | `SheetCreatedEvent` |
| **eventType** | `sheet.created` |
| **生产者** | Workbook 聚合根（`addSheet` 方法） |
| **触发时机** | 创建新的工作表后 |

**载荷类型：**

```typescript
interface SheetCreatedEvent extends DomainEvent {
  readonly eventType: 'sheet.created';
  readonly payload: {
    readonly workbookId: WorkbookId;
    readonly sheetId: SheetId;
    readonly sheetName: string;
    readonly sheetIndex: number;
    readonly sheet: Sheet;
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| UndoRedoManager | 记录历史条目（类型 `addSheet`） |
| SheetTabUI | 添加工作表标签页 |
| SheetCache | 注册新 Sheet 到缓存 |

**副作用：**

1. 工作表标签栏新增标签
2. 撤销栈压入历史记录
3. Sheet 缓存更新

---

### 3.2 SheetDeletedEvent（工作表已删除）

| 属性 | 值 |
|------|-----|
| **事件名** | `SheetDeletedEvent` |
| **eventType** | `sheet.deleted` |
| **生产者** | Workbook 聚合根（`removeSheet` 方法） |
| **触发时机** | 删除工作表后 |

**载荷类型：**

```typescript
interface SheetDeletedEvent extends DomainEvent {
  readonly eventType: 'sheet.deleted';
  readonly payload: {
    readonly workbookId: WorkbookId;
    readonly sheetId: SheetId;
    readonly sheetName: string;
    readonly sheetIndex: number;
    readonly deletedSheet: Sheet;
    readonly previousActiveSheetId: SheetId;
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| UndoRedoManager | 记录历史条目（类型 `deleteSheet`） |
| SheetTabUI | 移除工作表标签页 |
| FormulaEngine | 清除引用该 Sheet 的公式依赖 |
| SheetCache | 从缓存中移除 |

**副作用：**

1. 工作表标签栏移除标签
2. 活动工作表切换到相邻工作表
3. 引用该 Sheet 的公式标记为 `#REF!` 错误
4. 撤销栈压入历史记录

---

### 3.3 SheetSwitchedEvent（工作表已切换）

| 属性 | 值 |
|------|-----|
| **事件名** | `SheetSwitchedEvent` |
| **eventType** | `sheet.switched` |
| **生产者** | Workbook 聚合根（`switchSheet` 方法） |
| **触发时机** | 切换活动工作表后 |

**载荷类型：**

```typescript
interface SheetSwitchedEvent extends DomainEvent {
  readonly eventType: 'sheet.switched';
  readonly payload: {
    readonly workbookId: WorkbookId;
    readonly previousSheetId: SheetId;
    readonly currentSheetId: SheetId;
    readonly previousSelection: Selection;
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| CellRenderer | 清空画布，渲染新 Sheet |
| ComputeEngine | 重新计算新 Sheet 的条件格式 |
| FormulaBar | 更新公式栏显示 |
| SelectionManager | 恢复目标 Sheet 的选区 |

**副作用：**

1. 画布完全重绘
2. 条件格式和交替颜色重新计算
3. 公式栏显示当前活动单元格的公式
4. 选区恢复到目标 Sheet 上次的状态
5. 冻结状态切换

---

## 四、单元格事件

### 4.1 CellValueChangedEvent（单元格值已变更）

| 属性 | 值 |
|------|-----|
| **事件名** | `CellValueChangedEvent` |
| **eventType** | `cell.valueChanged` |
| **生产者** | Sheet 聚合根（`setCellValue`、`setCellFormula`、`clearCell` 方法） |
| **触发时机** | 单元格的值发生变更后 |

**载荷类型：**

```typescript
interface CellValueChangedEvent extends DomainEvent {
  readonly eventType: 'cell.valueChanged';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly position: CellPosition;
    readonly previousValue: CellValue;
    readonly currentValue: CellValue;
    readonly previousDisplayValue: string;
    readonly currentDisplayValue: string;
    readonly previousFormula: string | null;
    readonly currentFormula: string | null;
    readonly changeSource: CellValueChangeSource;
  };
}

enum CellValueChangeSource {
  UserInput = 'userInput',
  FormulaCalculation = 'formulaCalculation',
  Paste = 'paste',
  DropFill = 'dropFill',
  Delete = 'delete',
  UndoRedo = 'undoRedo',
  API = 'api',
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| FormulaEngine | 检查 CalcChain，重新计算依赖该单元格的公式 |
| ComputeEngine | 重新计算受影响的条件格式规则 |
| UndoRedoManager | 记录历史条目（类型 `datachange` 或 `rangechange`） |
| CellRenderer | 标记该单元格为脏，触发重绘 |
| FilterManager | 如果该单元格在筛选范围内，重新评估筛选条件 |

**副作用：**

1. 依赖公式链式重算
2. 条件格式重新计算
3. 撤销栈压入历史记录
4. 单元格重绘
5. 可能触发筛选行隐藏/显示变化

---

## 五、选区事件

### 5.1 SelectionChangedEvent（选区已变更）

| 属性 | 值 |
|------|-----|
| **事件名** | `SelectionChangedEvent` |
| **eventType** | `selection.changed` |
| **生产者** | Sheet 聚合根（`setSelection` 方法） |
| **触发时机** | 用户选区发生变化后 |

**载荷类型：**

```typescript
interface SelectionChangedEvent extends DomainEvent {
  readonly eventType: 'selection.changed';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly previousSelection: Selection;
    readonly currentSelection: Selection;
    readonly changeReason: SelectionChangeReason;
  };
}

enum SelectionChangeReason {
  MouseClick = 'mouseClick',
  Keyboard = 'keyboard',
  Drag = 'drag',
  API = 'api',
  UndoRedo = 'undoRedo',
  SheetSwitch = 'sheetSwitch',
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| SelectionHighlight | 更新选区高亮渲染 |
| FormulaBar | 更新公式栏显示（活动单元格内容） |
| Toolbar | 更新工具栏状态（对齐、字体、颜色等） |
| StatusBar | 更新状态栏统计信息（求和、计数、平均值） |
| NameBox | 更新名称框显示（如 `A1`、`B3:D10`） |

**副作用：**

1. 选区高亮框重绘
2. 公式栏内容更新
3. 工具栏按钮状态同步
4. 状态栏统计信息更新
5. 名称框显示更新

---

## 六、格式事件

### 6.1 FormatAppliedEvent（格式已应用）

| 属性 | 值 |
|------|-----|
| **事件名** | `FormatAppliedEvent` |
| **eventType** | `format.applied` |
| **生产者** | Sheet 聚合根（样式修改方法） |
| **触发时机** | 对单元格或范围应用格式后（包括字体、颜色、对齐、边框、数字格式等） |

**载荷类型：**

```typescript
interface FormatAppliedEvent extends DomainEvent {
  readonly eventType: 'format.applied';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly ranges: CellRange[];
    readonly formatType: FormatType;
    readonly previousStyle: CellStyle[];
    readonly currentStyle: CellStyle[];
  };
}

enum FormatType {
  Font = 'font',
  FontSize = 'fontSize',
  FontColor = 'fontColor',
  BackgroundColor = 'backgroundColor',
  Bold = 'bold',
  Italic = 'italic',
  Strikethrough = 'strikethrough',
  Underline = 'underline',
  HorizontalAlign = 'horizontalAlign',
  VerticalAlign = 'verticalAlign',
  Border = 'border',
  NumberFormat = 'numberFormat',
  TextWrap = 'textWrap',
  Rotation = 'rotation',
  Merge = 'merge',
  PaintFormat = 'paintFormat',
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| UndoRedoManager | 记录历史条目 |
| CellRenderer | 标记受影响范围为脏，触发重绘 |
| Toolbar | 更新工具栏状态 |

**副作用：**

1. 受影响单元格重新渲染
2. 撤销栈压入历史记录
3. 工具栏状态同步

---

## 七、撤销重做事件

### 7.1 UndoEvent（已撤销）

| 属性 | 值 |
|------|-----|
| **事件名** | `UndoEvent` |
| **eventType** | `undoRedo.undo` |
| **生产者** | UndoRedoManager 领域服务 |
| **触发时机** | 执行撤销操作后 |

**载荷类型：**

```typescript
interface UndoEvent extends DomainEvent {
  readonly eventType: 'undoRedo.undo';
  readonly payload: {
    readonly workbookId: WorkbookId;
    readonly sheetId: SheetId;
    readonly historyEntry: HistoryEntry;
    readonly restoredData: Cell[][];
    readonly restoredConfig: SheetConfig;
    readonly restoredSelection: Selection;
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| CellRenderer | 重绘受影响区域 |
| FormulaEngine | 重新计算受影响公式 |
| ComputeEngine | 重新计算条件格式 |
| Toolbar | 更新工具栏状态 |

**副作用：**

1. 数据恢复到之前状态
2. 公式链式重算
3. 条件格式重新计算
4. 界面重绘
5. 重做栈压入条目

---

### 7.2 RedoEvent（已重做）

| 属性 | 值 |
|------|-----|
| **事件名** | `RedoEvent` |
| **eventType** | `undoRedo.redo` |
| **生产者** | UndoRedoManager 领域服务 |
| **触发时机** | 执行重做操作后 |

**载荷类型：**

```typescript
interface RedoEvent extends DomainEvent {
  readonly eventType: 'undoRedo.redo';
  readonly payload: {
    readonly workbookId: WorkbookId;
    readonly sheetId: SheetId;
    readonly historyEntry: HistoryEntry;
    readonly appliedData: Cell[][];
    readonly appliedConfig: SheetConfig;
    readonly appliedSelection: Selection;
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| CellRenderer | 重绘受影响区域 |
| FormulaEngine | 重新计算受影响公式 |
| ComputeEngine | 重新计算条件格式 |
| Toolbar | 更新工具栏状态 |

**副作用：**

1. 数据恢复到之后状态
2. 公式链式重算
3. 条件格式重新计算
4. 界面重绘
5. 撤销栈压入条目

---

## 八、筛选事件

### 8.1 FilterAppliedEvent（筛选已应用）

| 属性 | 值 |
|------|-----|
| **事件名** | `FilterAppliedEvent` |
| **eventType** | `filter.applied` |
| **生产者** | Sheet 聚合根（`setFilter` 方法） |
| **触发时机** | 应用或修改筛选条件后 |

**载荷类型：**

```typescript
interface FilterAppliedEvent extends DomainEvent {
  readonly eventType: 'filter.applied';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly filterState: FilterState;
    readonly previousFilterState: FilterState | null;
    readonly hiddenRows: ReadonlySet<number>;
    readonly affectedRange: CellRange;
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| UndoRedoManager | 记录历史条目（类型 `datachangeAll_filter`） |
| CellRenderer | 重绘受影响行 |
| RowManager | 更新行隐藏状态 |
| ScrollManager | 调整滚动位置 |

**副作用：**

1. 不满足条件的行被隐藏
2. 撤销栈压入历史记录
3. 行号标签更新
4. 滚动条调整

---

## 九、冻结事件

### 9.1 FreezeChangedEvent（冻结已变更）

| 属性 | 值 |
|------|-----|
| **事件名** | `FreezeChangedEvent` |
| **eventType** | `freeze.changed` |
| **生产者** | Sheet 聚合根（`setFreeze`、`clearFreeze` 方法） |
| **触发时机** | 修改冻结状态后 |

**载荷类型：**

```typescript
interface FreezeChangedEvent extends DomainEvent {
  readonly eventType: 'freeze.changed';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly previousFreezeState: FreezeState | null;
    readonly currentFreezeState: FreezeState | null;
    readonly changeType: FreezeChangeType;
  };
}

enum FreezeChangeType {
  FreezeRow = 'freezeRow',
  FreezeColumn = 'freezeColumn',
  FreezeBoth = 'freezeBoth',
  Unfreeze = 'unfreeze',
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| CellRenderer | 重新绘制冻结分割线和冻结区域 |
| ScrollManager | 调整滚动逻辑以适应冻结 |
| FreezeBarUI | 更新冻结栏位置 |

**副作用：**

1. 冻结区域独立渲染
2. 滚动逻辑调整（冻结区域不随滚动移动）
3. 冻结栏 UI 更新

---

## 十、行列事件

### 10.1 RowColumnInsertedEvent（行列已插入）

| 属性 | 值 |
|------|-----|
| **事件名** | `RowColumnInsertedEvent` |
| **eventType** | `rowColumn.inserted` |
| **生产者** | Sheet 聚合根（`insertRow`、`insertColumn` 方法） |
| **触发时机** | 插入行或列后 |

**载荷类型：**

```typescript
interface RowColumnInsertedEvent extends DomainEvent {
  readonly eventType: 'rowColumn.inserted';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly dimension: 'row' | 'column';
    readonly index: number;
    readonly count: number;
    readonly affectedFormulas: Formula[];
    readonly affectedConditionRules: ConditionRule[];
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| FormulaEngine | 更新公式中的单元格引用偏移 |
| ComputeEngine | 更新条件格式规则的范围 |
| UndoRedoManager | 记录历史条目（类型 `addRC`） |
| CellRenderer | 重绘整个表格 |
| FilterManager | 更新筛选范围 |

**副作用：**

1. 公式引用自动偏移
2. 条件格式范围自动偏移
3. 撤销栈压入历史记录
4. 全表重绘

---

### 10.2 RowColumnDeletedEvent（行列已删除）

| 属性 | 值 |
|------|-----|
| **事件名** | `RowColumnDeletedEvent` |
| **eventType** | `rowColumn.deleted` |
| **生产者** | Sheet 聚合根（`deleteRow`、`deleteColumn` 方法） |
| **触发时机** | 删除行或列后 |

**载荷类型：**

```typescript
interface RowColumnDeletedEvent extends DomainEvent {
  readonly eventType: 'rowColumn.deleted';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly dimension: 'row' | 'column';
    readonly index: number;
    readonly count: number;
    readonly deletedData: Cell[][];
    readonly affectedFormulas: Formula[];
    readonly affectedConditionRules: ConditionRule[];
    readonly splitRules: ConditionRule[];
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| FormulaEngine | 更新公式引用，被删引用标记为 `#REF!` |
| ComputeEngine | 拆分/调整条件格式规则范围（CFSplitRange） |
| UndoRedoManager | 记录历史条目（类型 `delRC`） |
| CellRenderer | 重绘整个表格 |
| FilterManager | 更新或移除筛选 |

**副作用：**

1. 公式引用更新或标记错误
2. 条件格式规则范围拆分（CFSplitRange 逻辑）
3. 撤销栈压入历史记录
4. 全表重绘

---

## 十一、合并事件

### 11.1 MergeChangedEvent（合并已变更）

| 属性 | 值 |
|------|-----|
| **事件名** | `MergeChangedEvent` |
| **eventType** | `merge.changed` |
| **生产者** | Sheet 聚合根（`mergeCells`、`unmergeCells` 方法） |
| **触发时机** | 合并或取消合并单元格后 |

**载荷类型：**

```typescript
interface MergeChangedEvent extends DomainEvent {
  readonly eventType: 'merge.changed';
  readonly payload: {
    readonly sheetId: SheetId;
    readonly range: CellRange;
    readonly changeType: 'merge' | 'unmerge';
    readonly previousMergeInfo: MergeInfo | null;
    readonly currentMergeInfo: MergeInfo | null;
    readonly previousCells: (Cell | null)[][];
  };
}
```

**消费者：**

| 消费者 | 处理逻辑 |
|--------|---------|
| UndoRedoManager | 记录历史条目（类型 `mergeChange`） |
| CellRenderer | 重绘受影响区域 |
| FormulaEngine | 更新公式引用 |

**副作用：**

1. 合并/取消合并的单元格数据调整
2. 撤销栈压入历史记录
3. 受影响区域重绘

---

## 十二、事件流转总览

```
用户操作
  │
  ▼
Sheet 聚合根方法
  │
  ├── 发布领域事件 ──────────────────────────┐
  │                                          │
  ▼                                          ▼
修改聚合内部状态                          EventBus
  │                                          │
  │                              ┌───────────┼───────────┐
  │                              ▼           ▼           ▼
  │                         FormulaEngine  ComputeEngine  UndoRedoManager
  │                              │           │           │
  │                              ▼           ▼           │
  │                         重算公式    重算条件格式      │
  │                              │           │           │
  │                              ▼           ▼           │
  │                         发布新的      发布新的        │
  │                         CellValue    ComputeResult   │
  │                         ChangedEvent  事件           │
  │                              │           │           │
  └──────────────────────────────┴───────────┘           │
                              │                          │
                              ▼                          │
                        CellRenderer ◄───────────────────┘
                              │
                              ▼
                        Canvas 重绘
```

---

## 十三、事件订阅关系矩阵

| 事件 | FormulaEngine | ComputeEngine | UndoRedoManager | CellRenderer | FilterManager | ScrollManager | Toolbar | FormulaBar |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| RuleAddedEvent | | ✅ | ✅ | ✅ | | | | |
| RuleDeletedEvent | | ✅ | ✅ | ✅ | | | | |
| RuleUpdatedEvent | | ✅ | ✅ | ✅ | | | | |
| SheetCreatedEvent | | | ✅ | | | | | |
| SheetDeletedEvent | ✅ | | ✅ | | | | | |
| SheetSwitchedEvent | | ✅ | | ✅ | | ✅ | ✅ | ✅ |
| CellValueChangedEvent | ✅ | ✅ | ✅ | ✅ | ✅ | | | ✅ |
| SelectionChangedEvent | | | | ✅ | | | ✅ | ✅ |
| FormatAppliedEvent | | | ✅ | ✅ | | | ✅ | |
| UndoEvent | ✅ | ✅ | | ✅ | | | ✅ | |
| RedoEvent | ✅ | ✅ | | ✅ | | | ✅ | |
| FilterAppliedEvent | | | ✅ | ✅ | | ✅ | | |
| FreezeChangedEvent | | | | ✅ | | ✅ | | |
| RowColumnInsertedEvent | ✅ | ✅ | ✅ | ✅ | ✅ | | | |
| RowColumnDeletedEvent | ✅ | ✅ | ✅ | ✅ | ✅ | | | |
| MergeChangedEvent | ✅ | | ✅ | ✅ | | | | |
