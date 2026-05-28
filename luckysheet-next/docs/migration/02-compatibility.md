# 兼容性策略

> 本文档定义 `luckysheet-next` 模块与旧模块之间的兼容性策略，确保迁移过程中新旧代码可以共存，
> 用户可以渐进式切换到新实现，且每个阶段均可安全回滚。

---

## 1. API 兼容层

### 1.1 设计原则

新模块导出与旧模块完全相同的函数签名，确保调用方无需修改代码即可切换实现。

```
调用方代码
    │
    ▼
┌──────────────────┐     Feature flag = false     ┌──────────────────┐
│                  │ ──────────────────────────────► │  旧模块实现       │
│  API 兼容层       │                                │  (src/)          │
│                  │ ──────────────────────────────► │  新模块实现       │
└──────────────────┘     Feature flag = true        │  (luckysheet-next/)│
                                                └──────────────────┘
```

### 1.2 条件格式 API 对照

旧模块 API 定义在 [global/api/conditionFormat.js](file:///d:/gitee/Luckysheet/src/global/api/conditionFormat.js)，新模块需保持签名一致：

| 旧 API | 签名 | 新 API（兼容层） | 说明 |
|--------|------|-----------------|------|
| `luckysheet.setConditionFormat` | `(type, options)` → `void` | 完全一致 | 设置条件格式 |
| `luckysheet.getConditionFormat` | `()` → `object[]` | 完全一致 | 获取所有条件格式规则 |
| `luckysheet.deleteConditionFormat` | `(ruleId)` → `void` | 完全一致 | 删除指定条件格式规则 |

### 1.3 兼容层实现

```typescript
type ConditionFormatAPI = {
  setConditionFormat(type: string, options: Record<string, unknown>): void
  getConditionFormat(): Record<string, unknown>[]
  deleteConditionFormat(ruleId: string): void
}

class ConditionFormatCompatLayer implements ConditionFormatAPI {
  private legacyImpl: ConditionFormatAPI
  private nextImpl: ConditionFormatAPI
  private featureFlag: () => boolean

  constructor(
    legacyImpl: ConditionFormatAPI,
    nextImpl: ConditionFormatAPI,
    featureFlag: () => boolean
  ) {
    this.legacyImpl = legacyImpl
    this.nextImpl = nextImpl
    this.featureFlag = featureFlag
  }

  setConditionFormat(type: string, options: Record<string, unknown>): void {
    if (this.featureFlag()) {
      this.nextImpl.setConditionFormat(type, options)
    } else {
      this.legacyImpl.setConditionFormat(type, options)
    }
  }

  getConditionFormat(): Record<string, unknown>[] {
    if (this.featureFlag()) {
      return this.nextImpl.getConditionFormat()
    }
    return this.legacyImpl.getConditionFormat()
  }

  deleteConditionFormat(ruleId: string): void {
    if (this.featureFlag()) {
      this.nextImpl.deleteConditionFormat(ruleId)
    } else {
      this.legacyImpl.deleteConditionFormat(ruleId)
    }
  }
}
```

### 1.4 全局 API 挂载

新模块通过兼容层替换全局 `luckysheet` 对象上的方法：

```typescript
function installCompatLayer(config: LuckysheetConfig): void {
  const flag = () => config.useNextConditionFormat ?? false

  const compat = new ConditionFormatCompatLayer(
    new LegacyConditionFormatAPI(),
    new NextConditionFormatAPI(),
    flag
  )

  window.luckysheet.setConditionFormat = compat.setConditionFormat.bind(compat)
  window.luckysheet.getConditionFormat = compat.getConditionFormat.bind(compat)
  window.luckysheet.deleteConditionFormat = compat.deleteConditionFormat.bind(compat)
}
```

---

## 2. 数据格式兼容

### 2.1 条件格式规则数据格式

旧模块中条件格式规则存储在 Store 的 `luckysheet_conditionformat_save` 数组中，每条规则格式如下：

```json
{
  "type": "default",
  "cellrange": [
    {
      "row": [0, 10],
      "column": [0, 5]
    }
  ],
  "format": {
    "textColor": "#9C0006",
    "cellColor": "#FFC7CE"
  },
  "conditionName": "greaterThan",
  "conditionRange": [],
  "conditionValue": [10]
}
```

新模块的 `ConditionRule.toRaw()` 必须生成完全相同结构的 JSON：

```typescript
class ConditionRule {
  toRaw(): Record<string, unknown> {
    return {
      type: this.strategyType,
      cellrange: this.ranges.map((r) => ({
        row: [r.startRow, r.endRow],
        column: [r.startCol, r.endCol],
      })),
      format: this.formatToRaw(),
      conditionName: this.conditionName,
      conditionRange: this.conditionRangeToRaw(),
      conditionValue: this.conditionValue,
    }
  }

  static fromRaw(raw: Record<string, unknown>): ConditionRule {
    return ConditionRuleFactory.create(raw)
  }
}
```

### 2.2 各类型规则的数据格式对照

#### 突出显示单元格（default）

| 字段 | 旧模块值 | 新模块映射 |
|------|----------|-----------|
| `type` | `"default"` | `HighlightCellStrategy.type` |
| `conditionName` | `"greaterThan"` / `"lessThan"` / `"between"` / `"equal"` / `"textContains"` / ... | `conditionName` 属性 |
| `conditionValue` | `[10]` / `[5, 20]` / `["text"]` | `conditionValue` 属性 |
| `format.textColor` | `"#9C0006"` | `style.textColor` |
| `format.cellColor` | `"#FFC7CE"` | `style.backgroundColor` |

#### 项目选区（default）

| 字段 | 旧模块值 | 新模块映射 |
|------|----------|-----------|
| `type` | `"default"` | `TopRankStrategy.type` |
| `conditionName` | `"top10"` / `"top10%"` / `"bottom10"` / `"bottom10%"` | `conditionName` 属性 |
| `conditionValue` | `[10]` | `rankValue` 属性 |

#### 重复值（default）

| 字段 | 旧模块值 | 新模块映射 |
|------|----------|-----------|
| `type` | `"default"` | `DuplicateValueStrategy.type` |
| `conditionName` | `"duplicateValue"` / `"uniqueValue"` | `conditionName` 属性 |

#### 色阶（colorGradation）

| 字段 | 旧模块值 | 新模块映射 |
|------|----------|-----------|
| `type` | `"colorGradation"` | `ColorScaleStrategy.type` |
| `format.minColor` | `"#F8696B"` | `minColor` |
| `format.midColor` | `"#FFEB84"` | `midColor`（三色渐变时有值） |
| `format.maxColor` | `"#63BE7B"` | `maxColor` |

#### 数据条（dataBar）

| 字段 | 旧模块值 | 新模块映射 |
|------|----------|-----------|
| `type` | `"dataBar"` | `DataBarStrategy.type` |
| `format.minType` | `"num"` / `"percent"` / `"min"` | `minType` |
| `format.maxType` | `"num"` / `"percent"` / `"max"` | `maxType` |
| `format.minValue` | `0` | `minValue` |
| `format.maxValue` | `100` | `maxValue` |
| `format.barColor` | `"#638EC6"` | `barColor` |
| `format.len` | `"1"` | `len` |

#### 图标集（icons）

| 字段 | 旧模块值 | 新模块映射 |
|------|----------|-----------|
| `type` | `"icons"` | `IconSetStrategy.type` |
| `format.iconType` | `"3arrows"` / `"3trafficLight"` / ... | `iconType` |
| `format.iconShowType` | `"3"` / `"4"` / `"5"` | `iconCount` |
| `format.leftMin` | `[0, 33, 67]` | `thresholds` |
| `format.leftMax` | `[33, 67, 100]` | `thresholds`（上限） |

### 2.3 序列化兼容性测试

```typescript
describe('ConditionRule serialization compatibility', () => {
  const fixtures: Record<string, unknown>[] = loadFixturesFromOldModule()

  fixtures.forEach((raw, index) => {
    it(`should round-trip fixture #${index}`, () => {
      const rule = ConditionRule.fromRaw(raw)
      const output = rule.toRaw()
      expect(output).toEqual(raw)
    })
  })

  it('should produce identical JSON for highlight cell rule', () => {
    const rule = ConditionRuleFactory.createHighlightCell({
      ranges: [CellRange.fromCoords(0, 0, 10, 5)],
      conditionName: 'greaterThan',
      conditionValue: [10],
      textColor: '#9C0006',
      cellColor: '#FFC7CE',
    })
    const raw = rule.toRaw()
    expect(raw.type).toBe('default')
    expect(raw.conditionName).toBe('greaterThan')
    expect(raw.conditionValue).toEqual([10])
    expect(raw.format.textColor).toBe('#9C0006')
    expect(raw.format.cellColor).toBe('#FFC7CE')
  })
})
```

---

## 3. computeMap 兼容

### 3.1 旧模块 computeMap 结构

旧模块 [conditionformat/compute.js](file:///d:/gitee/Luckysheet/src/controllers/conditionformat/compute.js) 的 `computeMap` 是一个二维数组，存储每个单元格的条件格式计算结果：

```javascript
computeMap[row][col] = {
  textColor: "#9C0006",
  cellColor: "#FFC7CE"
}
```

或对于色阶/数据条：

```javascript
computeMap[row][col] = {
  textColor: computedColor,
  cellColor: computedColor,
  dataBar: { value: 0.75, color: "#638EC6" },
  icons: { iconIndex: 2, iconType: "3arrows" }
}
```

### 3.2 新模块 ComputeResult

```typescript
class ComputeResult {
  constructor(
    public readonly textColor?: string,
    public readonly cellColor?: string,
    public readonly dataBar?: { value: number; color: string },
    public readonly icons?: { iconIndex: number; iconType: string }
  ) {}

  toObject(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    if (this.textColor !== undefined) result.textColor = this.textColor
    if (this.cellColor !== undefined) result.cellColor = this.cellColor
    if (this.dataBar !== undefined) result.dataBar = this.dataBar
    if (this.icons !== undefined) result.icons = this.icons
    return result
  }
}
```

### 3.3 ComputeEngine 兼容性

```typescript
class ComputeEngine {
  compute(rules: ConditionRule[], cellData: CellValue[][]): ComputeResult[][] {
    const computeMap: ComputeResult[][] = []

    for (let r = 0; r < cellData.length; r++) {
      computeMap[r] = []
      for (let c = 0; c < cellData[r].length; c++) {
        computeMap[r][c] = this.computeCell(rules, cellData[r][c], r, c)
      }
    }

    return computeMap
  }

  toComputeMap(results: ComputeResult[][]): Record<string, unknown>[][] {
    return results.map((row) => row.map((result) => result.toObject()))
  }
}
```

### 3.4 computeMap 兼容性测试

```typescript
describe('ComputeEngine compatibility', () => {
  it('should produce same computeMap as old module for highlight cell', () => {
    const rules = [ConditionRuleFactory.createHighlightCell({
      ranges: [CellRange.fromCoords(0, 0, 4, 4)],
      conditionName: 'greaterThan',
      conditionValue: [50],
      textColor: '#9C0006',
      cellColor: '#FFC7CE',
    })]

    const cellData = createTestData()
    const engine = new ComputeEngine()
    const results = engine.compute(rules, cellData)
    const computeMap = engine.toComputeMap(results)

    const oldComputeMap = runOldCompute(rules, cellData)

    for (let r = 0; r < cellData.length; r++) {
      for (let c = 0; c < cellData[r].length; c++) {
        expect(computeMap[r][c]).toEqual(oldComputeMap[r][c])
      }
    }
  })
})
```

---

## 4. 渐进式迁移

### 4.1 共存架构

新旧模块在运行时共存，通过 Feature flag 控制使用哪套实现：

```
┌─────────────────────────────────────────────────────────────┐
│                      用户代码                                │
│                  luckysheet.setConditionFormat()             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API 兼容层                                │
│              (根据 Feature flag 路由)                        │
└───────────┬─────────────────────────────┬───────────────────┘
            │                             │
     flag = false                   flag = true
            │                             │
            ▼                             ▼
┌───────────────────────┐     ┌───────────────────────────────┐
│   旧模块实现           │     │   新模块实现                   │
│   (src/)              │     │   (luckysheet-next/)          │
│                       │     │                               │
│   - conditionformat/  │     │   - ConditionFormatPlugin     │
│   - jQuery UI 对话框   │     │   - 原生 DOM 对话框            │
│   - Store 直接访问     │     │   - Repository 适配器         │
└───────────┬───────────┘     └───────────────┬───────────────┘
            │                                 │
            ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    共享 Store                                │
│              (luckysheet_conditionformat_save)               │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 共存约束

1. **数据不冲突**：新旧模块读写同一份 Store 数据，但不会同时写入
2. **渲染不冲突**：同一时刻只有一套条件格式渲染逻辑生效
3. **事件不冲突**：Feature flag 关闭时，新模块不监听任何事件
4. **API 不冲突**：兼容层确保同一 API 调用只路由到一套实现

### 4.3 迁移步骤

```
步骤 1：部署新模块代码（Feature flag 默认关闭）
    │
    ▼
步骤 2：内部测试环境开启 Feature flag，验证新模块行为
    │
    ▼
步骤 3：部分用户开启 Feature flag（灰度发布）
    │
    ▼
步骤 4：全量开启 Feature flag
    │
    ▼
步骤 5：移除旧模块代码（下一版本）
```

---

## 5. Feature Flag 机制

### 5.1 配置项定义

在 Luckysheet 初始化配置中新增 Feature flag 选项：

```typescript
interface LuckysheetConfig {
  // ... 原有配置

  useNextConditionFormat?: boolean
  useNextAlternateFormat?: boolean
  useNextFilter?: boolean
  useNextFormula?: boolean
  useNextSelection?: boolean
}
```

### 5.2 Feature Flag 注册表

```typescript
class FeatureFlagRegistry {
  private flags: Map<string, boolean> = new Map()

  static readonly FLAGS = {
    CONDITION_FORMAT: 'useNextConditionFormat',
    ALTERNATE_FORMAT: 'useNextAlternateFormat',
    FILTER: 'useNextFilter',
    FORMULA: 'useNextFormula',
    SELECTION: 'useNextSelection',
  } as const

  constructor(config: Partial<LuckysheetConfig>) {
    this.flags.set(FeatureFlagRegistry.FLAGS.CONDITION_FORMAT, config.useNextConditionFormat ?? false)
    this.flags.set(FeatureFlagRegistry.FLAGS.ALTERNATE_FORMAT, config.useNextAlternateFormat ?? false)
    this.flags.set(FeatureFlagRegistry.FLAGS.FILTER, config.useNextFilter ?? false)
    this.flags.set(FeatureFlagRegistry.FLAGS.FORMULA, config.useNextFormula ?? false)
    this.flags.set(FeatureFlagRegistry.FLAGS.SELECTION, config.useNextSelection ?? false)
  }

  isEnabled(flag: string): boolean {
    return this.flags.get(flag) ?? false
  }

  enable(flag: string): void {
    this.flags.set(flag, true)
  }

  disable(flag: string): void {
    this.flags.set(flag, false)
  }
}
```

### 5.3 运行时切换

Feature flag 支持运行时动态切换，无需重新加载页面：

```typescript
const flags = new FeatureFlagRegistry(config)

// 运行时切换
flags.enable(FeatureFlagRegistry.FLAGS.CONDITION_FORMAT)

// 兼容层自动感知
const compat = new ConditionFormatCompatLayer(
  legacyImpl,
  nextImpl,
  () => flags.isEnabled(FeatureFlagRegistry.FLAGS.CONDITION_FORMAT)
)
```

### 5.4 使用示例

```javascript
// 初始化时开启新条件格式
luckysheet.create({
  container: 'luckysheet',
  data: sheetData,
  useNextConditionFormat: true,  // 开启新模块条件格式
})

// 运行时切换
luckysheet.enableFeature('useNextConditionFormat')   // 切换到新模块
luckysheet.disableFeature('useNextConditionFormat')  // 切换回旧模块
```

---

## 6. 回滚计划

### 6.1 回滚原则

1. **每个阶段可独立回滚**：回滚某阶段不影响其他阶段
2. **回滚不丢失数据**：Store 中的数据在新旧模块间通用
3. **回滚即时生效**：关闭 Feature flag 即可回滚，无需重启
4. **回滚可逆**：回滚后可再次开启新模块

### 6.2 各阶段回滚方案

| 阶段 | 回滚触发条件 | 回滚操作 | 回滚验证 |
|------|-------------|----------|----------|
| Phase 0 | 构建配置异常 | 删除 `luckysheet-next/` 和根目录配置文件 | 旧模块 `npm run dev` 正常 |
| Phase 1 | 领域对象设计不合理 | 删除 `luckysheet-next/src/domain/` | 无影响，旧模块不依赖 |
| Phase 2 | 适配器与旧 Store 不兼容 | 删除 `luckysheet-next/src/infrastructure/` | 无影响，适配器未接入 |
| Phase 3 | API 兼容层行为不一致 | 删除 `luckysheet-next/src/application/` | 无影响，兼容层未激活 |
| Phase 4 | 新条件格式功能异常 | 关闭 `useNextConditionFormat` flag | 旧模块条件格式功能正常 |
| Phase 5 | 各子模块异常 | 关闭对应 Feature flag | 仅影响回滚的模块 |

### 6.3 紧急回滚流程

```
1. 发现新模块异常
2. 调用 luckysheet.disableFeature('useNextConditionFormat')
3. 验证旧模块功能正常
4. 记录异常信息，修复后重新开启
```

### 6.4 数据安全保证

新旧模块共享 Store 数据，回滚时数据不会丢失：

```typescript
// 新模块写入的数据，旧模块也能读取
// 因为 ConditionRule.toRaw() 生成的格式与旧模块一致
const rule = ConditionRule.fromRaw(oldStoreData)
const raw = rule.toRaw()
// raw 与 oldStoreData 结构完全一致，旧模块可直接使用
```

---

## 7. 兼容性测试矩阵

### 7.1 测试维度

| 维度 | 旧模块 | 新模块 | 共存 |
|------|--------|--------|------|
| API 调用 | ✅ | ✅ | ✅ |
| 数据格式 | ✅ | ✅ | ✅ |
| computeMap | ✅ | ✅ | ✅ |
| 渲染效果 | ✅ | ✅ | ✅ |
| 撤销重做 | ✅ | ✅ | ✅ |
| 对话框交互 | ✅ | ✅ | N/A |
| 性能 | 基准 | 对比 | 对比 |

### 7.2 兼容性测试用例

```typescript
describe('Compatibility: Old vs New', () => {
  describe('API compatibility', () => {
    it('setConditionFormat produces same Store data', async () => {
      const oldStore = await runWithOldModule(() => {
        luckysheet.setConditionFormat('greaterThan', { value: 10, textColor: '#9C0006' })
      })
      const newStore = await runWithNewModule(() => {
        luckysheet.setConditionFormat('greaterThan', { value: 10, textColor: '#9C0006' })
      })
      expect(newStore).toEqual(oldStore)
    })
  })

  describe('Data format compatibility', () => {
    it('ConditionRule.toRaw() matches old format', () => {
      const oldData = loadFixture('condition-format-highlight.json')
      const rule = ConditionRule.fromRaw(oldData)
      expect(rule.toRaw()).toEqual(oldData)
    })
  })

  describe('computeMap compatibility', () => {
    it('new ComputeEngine produces same result as old compute()', () => {
      const rules = loadRulesFromStore()
      const cellData = loadCellData()
      const oldResult = runOldCompute(rules, cellData)
      const newResult = new ComputeEngine().compute(rules, cellData)
      expect(new ComputeEngine().toComputeMap(newResult)).toEqual(oldResult)
    })
  })

  describe('Rendering compatibility', () => {
    it('new renderer produces same visual output', async () => {
      const oldCanvas = await renderWithOldModule()
      const newCanvas = await renderWithNewModule()
      const diff = pixelDiff(oldCanvas, newCanvas)
      expect(diff).toBeLessThan(0.01) // 允许 1% 像素差异
    })
  })

  describe('Undo/Redo compatibility', () => {
    it('undo after new module operation restores old state', () => {
      enableNewModule()
      luckysheet.setConditionFormat('greaterThan', { value: 10 })
      luckysheet.undo()
      expect(getStoreData()).toEqual(originalStoreData)
    })
  })
})
```

### 7.3 视觉对比测试

使用像素级对比验证渲染一致性：

```typescript
describe('Visual regression', () => {
  const scenarios = [
    { name: 'highlight-cell-greaterThan', rule: { type: 'greaterThan', value: 10 } },
    { name: 'color-scale-3color', rule: { type: 'colorGradation', min: '#F8696B', mid: '#FFEB84', max: '#63BE7B' } },
    { name: 'data-bar', rule: { type: 'dataBar', color: '#638EC6' } },
    { name: 'icon-set-3arrows', rule: { type: 'icons', iconType: '3arrows' } },
  ]

  scenarios.forEach(({ name, rule }) => {
    it(`should render ${name} identically to old module`, async () => {
      const oldSnapshot = await captureOldModuleRendering(rule)
      const newSnapshot = await captureNewModuleRendering(rule)
      const diffRatio = compareImages(oldSnapshot, newSnapshot)
      expect(diffRatio).toBeLessThan(0.01)
    })
  })
})
```

---

## 8. 迁移检查清单

每个模块迁移完成后，需逐项验证：

### 8.1 功能完整性

- [ ] 所有旧 API 均有对应的新实现
- [ ] 所有条件格式类型均可正确配置
- [ ] 条件格式计算结果与旧模块一致
- [ ] 条件格式渲染效果与旧模块一致
- [ ] 撤销重做功能正常

### 8.2 数据兼容性

- [ ] `ConditionRule.toRaw()` 输出与旧格式一致
- [ ] `ConditionRule.fromRaw()` 可解析旧格式数据
- [ ] `ComputeResult.toObject()` 输出与旧 computeMap 一致
- [ ] Store 中的数据新旧模块均可读写

### 8.3 性能

- [ ] 新模块条件格式计算速度不低于旧模块
- [ ] 新模块渲染速度不低于旧模块
- [ ] 大数据量（10万单元格）下无明显性能退化

### 8.4 用户体验

- [ ] 对话框外观与旧模块一致
- [ ] 对话框交互流程与旧模块一致
- [ ] Feature flag 切换无感知（无需刷新页面）

---

## 9. 已知兼容性风险

| 风险 | 影响 | 缓解措施 | 状态 |
|------|------|----------|------|
| 旧模块使用 jQuery UI 对话框，新模块使用原生 DOM | 对话框外观可能不一致 | 参考旧模块 CSS 精确复刻样式 | 待验证 |
| 旧模块 `computeMap` 是全局变量 | 新模块无法直接访问 | 通过 Store 适配器桥接 | 已设计 |
| 旧模块条件格式与交替颜色共享渲染逻辑 | 新模块独立渲染可能遗漏 | 渲染优先级与旧模块保持一致 | 待验证 |
| 旧模块使用 `spectrum` 颜色选择器 | 新模块自研组件功能可能不完整 | 先实现核心功能，逐步补全 | 待开发 |
| 旧模块事件通过 jQuery `.trigger()` 触发 | 新模块 EventBus 不兼容 | 兼容层桥接两套事件系统 | 已设计 |
