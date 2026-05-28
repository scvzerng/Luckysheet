# DDD 重构迁移路线图

> 本文档定义 Luckysheet DDD 重构的分阶段迁移计划，从基础设施搭建到逐步替换旧模块。
> 每个阶段均可独立验证和回滚，确保迁移过程安全可控。

---

## 总览

| 阶段 | 名称 | 预估时间 | 核心目标 |
|------|------|----------|----------|
| Phase 0 | 基础设施搭建 | 1-2 天 | 创建目录结构、构建/测试/类型检查配置 |
| Phase 1 | 领域层 | 1-2 周 | 值对象、聚合根、策略模式、领域服务 |
| Phase 2 | 基础设施层 | 1 周 | 仓库适配器、渲染适配器、jQuery 替代工具 |
| Phase 3 | 应用层 | 1 周 | 应用服务、API 兼容层 |
| Phase 4 | UI 层 - 条件格式 | 1-2 周 | 对话框组件、事件处理、集成测试 |
| Phase 5 | 其他模块 | 持续进行 | 交替颜色、公式引擎、选区/剪贴板等 |

---

## Phase 0：基础设施搭建（1-2 天）

### 具体任务清单

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| 0.1 | 创建 `luckysheet-next/` 目录结构 | P0 | 0.5h |
| 0.2 | 创建 `vite.config.next.ts` | P0 | 1h |
| 0.3 | 创建 `tsconfig.next.json` | P0 | 0.5h |
| 0.4 | 创建 `vitest.config.next.ts` | P0 | 0.5h |
| 0.5 | 创建 `luckysheet-next/vitest.setup.ts` | P0 | 0.5h |
| 0.6 | 创建 `luckysheet-next/index.html` | P0 | 0.5h |
| 0.7 | 创建 `luckysheet-next/src/index.ts` 入口文件 | P0 | 0.5h |
| 0.8 | 更新 `package.json` 添加 `dev:next` 等脚本 | P0 | 0.5h |
| 0.9 | 更新 `.gitignore` 添加 `dist-next/` 和 `coverage-next/` | P1 | 0.1h |
| 0.10 | 验证：`npm run dev:next` 可启动 | P0 | 0.5h |
| 0.11 | 验证：`npm run build:next` 可构建 | P0 | 0.5h |
| 0.12 | 验证：`npm run typecheck:next` 可通过 | P0 | 0.5h |
| 0.13 | 验证：`npm run test:next` 可运行 | P0 | 0.5h |

### 交付物

- [ ] `luckysheet-next/` 目录结构完整
- [ ] `vite.config.next.ts` 配置文件
- [ ] `tsconfig.next.json` 配置文件
- [ ] `vitest.config.next.ts` 配置文件
- [ ] `luckysheet-next/vitest.setup.ts` 测试 setup
- [ ] `luckysheet-next/index.html` 开发页面
- [ ] `luckysheet-next/src/index.ts` 入口文件
- [ ] `package.json` 新增脚本可正常运行

### 验收标准

1. `npm run dev:next` 在端口 3001 启动开发服务器，页面可访问
2. `npm run build:next` 生成 `dist-next/luckysheet-next.es.js` 和 `dist-next/luckysheet-next.umd.js`
3. `npm run typecheck:next` 无类型错误
4. `npm run test:next` 可运行（即使无测试用例）
5. 旧模块 `npm run dev` 和新模块 `npm run dev:next` 可同时运行

### 风险点

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Vite 配置冲突 | 新旧模块配置互相干扰 | 使用独立配置文件，输出目录隔离 |
| TypeScript 严格模式报错 | 无法通过类型检查 | Phase 0 仅创建空入口，不涉及复杂类型 |
| 端口冲突 | 开发服务器无法启动 | 新模块使用 3001 端口，与旧模块 3000 错开 |

---

## Phase 1：领域层（1-2 周）

### 具体任务清单

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| **值对象** | | | |
| 1.1 | 实现 `Cell` 值对象 | P0 | 2h |
| 1.2 | 实现 `CellRange` 值对象 | P0 | 2h |
| 1.3 | 实现 `CellStyle` 值对象 | P0 | 1h |
| 1.4 | 实现 `CellValue` 值对象（区分数字/文本/公式/错误） | P0 | 2h |
| 1.5 | 实现 `Color` 值对象（RGB/HSL 转换、校验） | P1 | 1h |
| **聚合根** | | | |
| 1.6 | 实现 `ConditionRule` 聚合根 | P0 | 4h |
| 1.7 | 实现 `ConditionRule` 工厂方法 | P0 | 2h |
| 1.8 | 实现 `ConditionRule.toRaw()` / `ConditionRule.fromRaw()` 序列化 | P0 | 2h |
| **条件格式策略** | | | |
| 1.9 | 实现 `IConditionStrategy` 接口 | P0 | 1h |
| 1.10 | 实现 `HighlightCellStrategy`（大于/小于/等于/介于/文本包含） | P0 | 3h |
| 1.11 | 实现 `TopRankStrategy`（前 N 项/后 N 项/前 N%/后 N%） | P0 | 2h |
| 1.12 | 实现 `DuplicateValueStrategy`（重复值/唯一值） | P0 | 2h |
| 1.13 | 实现 `ColorScaleStrategy`（双色/三色渐变） | P0 | 3h |
| 1.14 | 实现 `DataBarStrategy`（渐变/实心数据条） | P0 | 3h |
| 1.15 | 实现 `IconSetStrategy`（3/4/5 箭头、交通灯等图标集） | P0 | 3h |
| **格式策略** | | | |
| 1.16 | 实现 `IFormatStrategy` 接口 | P1 | 1h |
| 1.17 | 实现 `NumberFormatStrategy` | P1 | 2h |
| 1.18 | 实现 `DateFormatStrategy` | P1 | 1h |
| 1.19 | 实现 `CurrencyFormatStrategy` | P1 | 1h |
| 1.20 | 实现 `PercentageFormatStrategy` | P1 | 1h |
| **领域服务** | | | |
| 1.21 | 实现 `ComputeEngine` 领域服务 | P0 | 4h |
| 1.22 | 实现 `ComputeResult` 值对象 | P0 | 2h |
| 1.23 | 实现 `RulePriorityService`（规则优先级排序） | P1 | 1h |
| **单元测试** | | | |
| 1.24 | `Cell` 值对象测试 | P0 | 1h |
| 1.25 | `CellRange` 值对象测试 | P0 | 1h |
| 1.26 | `ConditionRule` 聚合根测试 | P0 | 2h |
| 1.27 | 各策略单元测试（6 个策略 × 1h） | P0 | 6h |
| 1.28 | `ComputeEngine` 领域服务测试 | P0 | 2h |
| 1.29 | 序列化/反序列化兼容性测试 | P0 | 2h |

### 交付物

- [ ] `luckysheet-next/src/domain/` 目录下所有值对象、聚合根、策略
- [ ] 每个领域对象的单元测试，覆盖率 ≥ 80%
- [ ] 领域对象与旧模块数据格式的序列化兼容性验证

### 验收标准

1. 所有值对象不可变，通过构造函数创建
2. `ConditionRule.toRaw()` 输出的 JSON 与旧模块 [conditionformat/data.js](file:///d:/gitee/Luckysheet/src/controllers/conditionformat/data.js) 中的数据格式一致
3. `ComputeEngine` 的计算结果与旧模块 [conditionformat/compute.js](file:///d:/gitee/Luckysheet/src/controllers/conditionformat/compute.js) 的 `computeMap` 输出一致
4. 所有 6 种条件格式策略均通过单元测试
5. `npm run typecheck:next` 无错误
6. `npm run test:next:coverage` 覆盖率 ≥ 80%

### 风险点

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 旧模块数据格式理解偏差 | 序列化不兼容 | 先用旧模块导出真实数据作为测试 fixture |
| 条件格式策略逻辑复杂 | 某些策略实现困难 | 逐个策略迁移，优先实现高优先级策略 |
| `ComputeEngine` 性能 | 大量单元格计算慢 | 先保证正确性，后续优化性能 |
| `CellValue` 类型设计 | 类型覆盖不全 | 参考旧模块 `cellflow.js` 中的单元格类型定义 |

---

## Phase 2：基础设施层（1 周）

### 具体任务清单

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| **仓库适配器** | | | |
| 2.1 | 实现 `IRuleRepository` 接口 | P0 | 1h |
| 2.2 | 实现 `StoreRuleRepository`（适配旧 Store） | P0 | 3h |
| 2.3 | 实现 `InMemoryRuleRepository`（测试用） | P1 | 1h |
| **UndoRedo 适配器** | | | |
| 2.4 | 实现 `IUndoRedoAdapter` 接口 | P0 | 1h |
| 2.5 | 实现 `StoreUndoRedoAdapter` | P0 | 2h |
| **渲染适配器** | | | |
| 2.6 | 实现 `IRenderAdapter` 接口 | P0 | 1h |
| 2.7 | 实现 `CanvasRenderAdapter` | P0 | 3h |
| **DOM 工具** | | | |
| 2.8 | 实现 `dom.ts` — 基础 DOM 操作（查询、创建、样式） | P0 | 3h |
| 2.9 | 实现 `event.ts` — 事件绑定/解绑/委托 | P0 | 2h |
| 2.10 | 实现 `dialog.ts` — 对话框基础工具 | P1 | 2h |
| 2.11 | 实现 `color-picker.ts` — 颜色选择器组件 | P1 | 4h |
| **Store 适配** | | | |
| 2.12 | 实现 `IStore` 接口 | P0 | 1h |
| 2.13 | 实现 `StoreAdapter`（桥接旧 [store/index.js](file:///d:/gitee/Luckysheet/src/store/index.js)） | P0 | 3h |
| **测试** | | | |
| 2.14 | 仓库适配器测试 | P0 | 2h |
| 2.15 | DOM 工具测试 | P0 | 2h |
| 2.16 | 渲染适配器测试 | P1 | 2h |

### 交付物

- [ ] `luckysheet-next/src/infrastructure/` 目录下所有适配器
- [ ] jQuery 替代 DOM 工具库
- [ ] 颜色选择器组件（替代 spectrum-colorpicker）
- [ ] 适配器单元测试

### 验收标准

1. `StoreRuleRepository` 能正确读写旧 Store 中的条件格式数据
2. `StoreUndoRedoAdapter` 能与旧模块的撤销重做机制协同工作
3. `CanvasRenderAdapter` 能在 Canvas 上绘制条件格式效果
4. DOM 工具库覆盖 jQuery 在条件格式模块中的所有用法
5. 颜色选择器组件功能与旧模块的 spectrum 一致
6. 所有适配器通过单元测试

### 风险点

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 旧 Store 结构复杂 | 适配器实现困难 | 先梳理旧 Store 的条件格式相关字段 |
| Canvas 渲染与旧模块不一致 | 视觉差异 | 逐像素对比测试 |
| 颜色选择器功能不完整 | 用户体验降级 | 先实现核心功能，高级功能后续迭代 |
| DOM 工具遗漏 jQuery 用法 | 迁移时发现缺失 | 提前扫描旧模块所有 jQuery 调用 |

---

## Phase 3：应用层（1 周）

### 具体任务清单

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| **应用服务** | | | |
| 3.1 | 实现 `ConditionFormatService` | P0 | 4h |
| 3.2 | 实现添加规则用例 | P0 | 2h |
| 3.3 | 实现删除规则用例 | P0 | 1h |
| 3.4 | 实现更新规则用例 | P0 | 2h |
| 3.5 | 实现清除规则用例 | P0 | 1h |
| 3.6 | 实现条件格式计算用例 | P0 | 3h |
| **命令总线** | | | |
| 3.7 | 实现 `ICommandBus` 接口 | P0 | 1h |
| 3.8 | 实现 `CommandBus` | P0 | 2h |
| **API 兼容层** | | | |
| 3.9 | 实现 `luckysheet.setConditionFormat()` 兼容 API | P0 | 2h |
| 3.10 | 实现 `luckysheet.getConditionFormat()` 兼容 API | P0 | 1h |
| 3.11 | 实现 `luckysheet.deleteConditionFormat()` 兼容 API | P0 | 1h |
| 3.12 | 兼容层与旧 API 行为对比测试 | P0 | 2h |
| **测试** | | | |
| 3.13 | `ConditionFormatService` 单元测试 | P0 | 3h |
| 3.14 | `CommandBus` 单元测试 | P0 | 1h |
| 3.15 | API 兼容层集成测试 | P0 | 2h |

### 交付物

- [ ] `luckysheet-next/src/application/` 目录下所有应用服务
- [ ] `CommandBus` 实现
- [ ] API 兼容层（与旧模块 API 签名一致）
- [ ] 应用服务和 API 兼容层测试

### 验收标准

1. `ConditionFormatService` 能完成规则的增删改查和计算
2. `CommandBus` 支持命令执行和撤销
3. API 兼容层的函数签名与旧模块 [global/api/conditionFormat.js](file:///d:/gitee/Luckysheet/src/global/api/conditionFormat.js) 一致
4. 通过 API 兼容层调用的行为结果与旧模块一致
5. 所有应用服务测试通过

### 风险点

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 旧 API 行为理解偏差 | 兼容层行为不一致 | 以旧模块实际行为为准，编写对比测试 |
| CommandBus 与旧 UndoRedo 冲突 | 撤销重做异常 | Phase 2 的 UndoRedoAdapter 负责桥接 |
| 条件格式计算性能 | 大数据量下计算慢 | 先保证正确性，后续引入增量计算 |

---

## Phase 4：UI 层 - 条件格式（1-2 周）

### 具体任务清单

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| **对话框组件** | | | |
| 4.1 | 实现 `ConditionFormatDialog` 主对话框 | P0 | 4h |
| 4.2 | 实现 `RuleTypeSelector` 规则类型选择器 | P0 | 2h |
| 4.3 | 实现 `RuleEditor` 规则编辑器 | P0 | 4h |
| 4.4 | 实现 `RangeSelector` 范围选择器 | P0 | 2h |
| 4.5 | 实现 `ColorScaleEditor` 色阶编辑器 | P1 | 2h |
| 4.6 | 实现 `DataBarEditor` 数据条编辑器 | P1 | 2h |
| 4.7 | 实现 `IconSetEditor` 图标集编辑器 | P1 | 2h |
| **事件处理** | | | |
| 4.8 | 实现条件格式工具栏按钮事件 | P0 | 2h |
| 4.9 | 实现对话框交互事件 | P0 | 3h |
| 4.10 | 实现规则应用/取消事件 | P0 | 2h |
| **渲染集成** | | | |
| 4.11 | 条件格式渲染与主 Canvas 渲染循环集成 | P0 | 3h |
| 4.12 | 条件格式与单元格样式叠加渲染 | P1 | 2h |
| **集成测试** | | | |
| 4.13 | 对话框交互集成测试 | P0 | 3h |
| 4.14 | 端到端条件格式流程测试 | P0 | 4h |
| 4.15 | 与旧模块视觉对比测试 | P1 | 2h |

### 交付物

- [ ] `luckysheet-next/src/ui/` 目录下所有对话框组件
- [ ] 事件处理器
- [ ] 渲染集成代码
- [ ] 集成测试和端到端测试

### 验收标准

1. 条件格式对话框可通过工具栏按钮打开
2. 所有 6 种条件格式类型可通过对话框配置和应用
3. 应用条件格式后，Canvas 渲染效果与旧模块视觉一致
4. 条件格式的增删改操作支持撤销重做
5. 新旧模块可同时运行，条件格式功能互不干扰
6. 集成测试覆盖主要用户流程

### 风险点

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 对话框样式与旧模块不一致 | 用户体验割裂 | 参考旧模块 CSS，保持视觉一致 |
| Canvas 渲染集成复杂 | 渲染时序问题 | 使用 `render:before` 事件钩子 |
| 范围选择器交互复杂 | 选区交互实现困难 | 先实现基本功能，逐步完善 |
| 旧模块全局状态污染 | 新旧模块状态冲突 | Feature flag 隔离，详见兼容性文档 |

---

## Phase 5：其他模块（持续进行）

### 5.1 交替颜色模块

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| 5.1.1 | 实现 `AlternateFormatRule` 聚合根 | P1 | 2h |
| 5.1.2 | 实现 `AlternateFormatStrategy` | P1 | 2h |
| 5.1.3 | 实现 `AlternateFormatService` | P1 | 3h |
| 5.1.4 | 实现交替颜色对话框 | P1 | 4h |
| 5.1.5 | 迁移 [alternateformat/](file:///d:/gitee/Luckysheet/src/controllers/alternateformat) 模块 | P1 | 3h |

**交付物**：`AlternateFormatPlugin` 完整实现

**验收标准**：交替颜色功能与旧模块行为一致

**风险点**：交替颜色与条件格式可能存在渲染优先级冲突

### 5.2 公式引擎

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| 5.2.1 | 重构 [function/](file:///d:/gitee/Luckysheet/src/function) 为 TypeScript | P2 | 2-3 周 |
| 5.2.2 | 实现 `FormulaEngine` 领域服务 | P2 | 1 周 |
| 5.2.3 | 实现公式依赖图 | P2 | 1 周 |
| 5.2.4 | 公式函数迁移（逐步替换） | P2 | 持续 |

**交付物**：`FormulaPlugin` 核心实现

**验收标准**：公式计算结果与旧模块一致

**风险点**：公式函数数量庞大（200+），迁移工作量大

### 5.3 选区与剪贴板

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| 5.3.1 | 实现 `Selection` 领域模型 | P2 | 3h |
| 5.3.2 | 实现 `ClipboardService` | P2 | 4h |
| 5.3.3 | 迁移 [selection/](file:///d:/gitee/Luckysheet/src/controllers/selection) 模块 | P2 | 1 周 |

**交付物**：`SelectionPlugin` 和 `ClipboardPlugin` 实现

**验收标准**：选区操作和剪贴板功能与旧模块一致

**风险点**：剪贴板涉及浏览器安全策略，跨浏览器兼容性需充分测试

### 5.4 筛选模块

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| 5.4.1 | 实现 `FilterRule` 聚合根 | P1 | 2h |
| 5.4.2 | 实现 `FilterService` | P1 | 3h |
| 5.4.3 | 迁移 [filter/](file:///d:/gitee/Luckysheet/src/controllers/filter) 模块 | P1 | 1 周 |

**交付物**：`FilterPlugin` 完整实现

**验收标准**：筛选功能与旧模块一致

**风险点**：筛选 UI 交互复杂，下拉菜单实现需仔细处理

### 5.5 冻结窗格

| # | 任务 | 优先级 | 预估时间 |
|---|------|--------|----------|
| 5.5.1 | 实现 `FreezeConfig` 值对象 | P2 | 1h |
| 5.5.2 | 实现 `FreezeService` | P2 | 3h |
| 5.5.3 | 迁移 [freezen/](file:///d:/gitee/Luckysheet/src/controllers/freezen) 模块 | P2 | 1 周 |

**交付物**：`FreezePlugin` 实现

**验收标准**：冻结窗格功能与旧模块一致

**风险点**：冻结涉及 Canvas 分区渲染，实现复杂度高

---

## 阶段依赖关系

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
  │                                              │
  │                                              ▼
  └──────────────────────────────────────► Phase 5（可并行）
```

- Phase 0 是所有后续阶段的前置条件
- Phase 1-4 是条件格式模块的完整迁移路径
- Phase 5 可在 Phase 4 完成后启动，也可在 Phase 1 完成后与 Phase 2-4 并行启动部分模块

---

## 里程碑时间线

```
Week 1        Week 2        Week 3        Week 4        Week 5        Week 6
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ Phase 0     │ Phase 1     │ Phase 1     │ Phase 2     │ Phase 3     │
│ (2天)       │ (开始)      │ (完成)      │             │             │
│             │             │             │             │ Phase 4     │
│             │             │             │             │ (开始)      │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│             │             │             │             │ Phase 5     │
│             │             │             │             │ (交替颜色)  │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
```

---

## 回滚策略

每个阶段均可独立回滚，具体策略如下：

| 阶段 | 回滚方式 | 影响 |
|------|----------|------|
| Phase 0 | 删除 `luckysheet-next/` 目录和根目录配置文件 | 无影响，旧模块不受影响 |
| Phase 1 | 删除 `luckysheet-next/src/domain/` 目录 | 无影响，领域层不与旧模块交互 |
| Phase 2 | 删除 `luckysheet-next/src/infrastructure/` 目录 | 无影响，适配器不修改旧模块 |
| Phase 3 | 删除 `luckysheet-next/src/application/` 目录 | 无影响，应用层不修改旧模块 |
| Phase 4 | 关闭 Feature flag，回退到旧模块条件格式 | 需确保 Feature flag 机制正常 |
| Phase 5 | 逐模块回滚，关闭对应 Feature flag | 仅影响回滚的模块 |

**关键原则**：新模块代码始终在 `luckysheet-next/` 目录内，不修改 `src/` 目录中的任何文件，因此回滚成本极低。
