# 01-总体架构设计

> 本文档定义 Luckysheet DDD 重构工程的总体架构，包括限界上下文划分、分层架构、依赖规则、插件化架构与目录结构设计。

---

## 1. 现状问题分析

### 1.1 当前架构特征

当前 Luckysheet 采用典型的单体脚本架构，存在以下核心问题：

| 问题 | 表现 | 严重程度 |
|------|------|---------|
| **上帝对象 Store** | 57 个字段混杂 6 个不同关注域，100+ 文件共享同一个可变对象 | 🔴 极高 |
| **全局函数式编程** | `formula`、`editor`、`method` 等全局对象包含 30-60 个方法，100+ 文件直接引用 | 🔴 极高 |
| **jQuery 强耦合** | 2014 处直接使用 `$()`，依赖 `window.$` 全局注入 | 🔴 高 |
| **循环依赖网** | Store ↔ editor ↔ formula ↔ menuButton ↔ sheetmanage 互相引用 | 🔴 高 |
| **隐式全局变量** | 约 40+ 处函数内未声明变量，污染 `window` 命名空间 | 🟡 中 |
| **职责不清** | `controllers/` 下模块同时包含 DOM 操作、业务逻辑、状态管理 | 🟡 中 |

### 1.2 当前目录结构问题

```
src/
├── controllers/          # 职责混杂：DOM + 业务 + 状态
│   ├── conditionformat/  # 条件格式（含 DOM 对话框）
│   ├── handler/          # 事件处理（含 DOM 操作）
│   ├── menuButton/       # 工具栏（含 18 个子初始化文件）
│   └── ...
├── global/               # 全局对象集合
│   ├── api/              # 公共 API（但内部依赖全局对象）
│   ├── draw/             # 渲染（但混入业务逻辑）
│   ├── formula/          # 公式（16 个子模块合并为单对象）
│   └── ...
├── function/             # 公式函数库（结构相对清晰）
├── store/                # 单一 Store 文件，57 个字段
├── utils/                # 工具函数（部分已重构）
└── plugins/              # 第三方库（含 jQuery UI、spectrum）
```

核心问题：**没有分层**，所有代码处于同一抽象层级，任何模块都可以访问和修改任何状态。

---

## 2. 限界上下文划分

基于对现有代码的领域分析，将 Luckysheet 划分为以下 5 个限界上下文（Bounded Context）：

### 2.1 上下文地图

```
┌─────────────────────────────────────────────────────────────┐
│                    Luckysheet 限界上下文地图                    │
│                                                             │
│  ┌───────────────┐    ┌───────────────┐                     │
│  │   Core Domain │    │  Rendering    │                     │
│  │   核心域       │◄───│   渲染上下文   │                     │
│  │               │    │               │                     │
│  │  Cell 聚合    │    │  Canvas 管线  │                     │
│  │  Sheet 聚合   │    │  绘制策略     │                     │
│  │  Formula 聚合 │    │  坐标计算     │                     │
│  │  CondFormat   │    └───────┬───────┘                     │
│  │   聚合        │            │                             │
│  └───────┬───────┘            │                             │
│          │                    │                             │
│          ▼                    ▼                             │
│  ┌───────────────┐    ┌───────────────┐                     │
│  │  Interaction  │    │  Management   │                     │
│  │  交互上下文    │    │  管理上下文    │                     │
│  │               │    │               │                     │
│  │  事件处理     │    │  Sheet CRUD   │                     │
│  │  选区管理     │    │  撤销/重做    │                     │
│  │  剪贴板       │    │  配置管理     │                     │
│  │  拖拽填充     │    │               │                     │
│  └───────┬───────┘    └───────┬───────┘                     │
│          │                    │                             │
│          ▼                    ▼                             │
│  ┌─────────────────────────────────────┐                   │
│  │       Infrastructure               │                   │
│  │       基础设施上下文                  │                   │
│  │                                     │                   │
│  │  Store 适配器  │  DOM 适配器        │                   │
│  │  插件系统      │  事件总线          │                   │
│  │  Canvas 工厂   │  本地存储          │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 各限界上下文详解

#### 2.2.1 Core Domain — 核心域

核心域是 Luckysheet 的业务核心，包含电子表格最本质的领域逻辑。**纯 TypeScript，零外部依赖**。

| 聚合 | 职责 | 对应现有代码 |
|------|------|-------------|
| **Cell 聚合** | 单元格数据模型、值对象（CellType, CellStyle, CellBorder）、合并单元格、数据验证 | `Store.flowdata`、`global/getdata.js`、`global/setdata.js`、`global/format.js` |
| **Sheet 聚合** | 工作表数据结构、行列配置、可见性、排序状态 | `Store.luckysheetfile`、`controllers/sheetmanage/sheetData.js` |
| **Formula 聚合** | 公式解析、执行引擎、依赖链计算、循环引用检测、函数库 | `global/formula/`、`function/` |
| **ConditionalFormat 聚合** | 条件格式规则管理、规则计算（颜色渐变/数据条/图标集/默认规则） | `controllers/conditionformat/` |

**核心域的关键约束**：
- 不依赖任何 DOM API（无 `document`、`window`）
- 不依赖任何外部库（无 jQuery、无 Canvas）
- 不依赖其他上下文（通过领域事件通信）
- 所有状态变更通过领域事件通知外部

#### 2.2.2 Rendering Context — 渲染上下文

渲染上下文负责将核心域的单元格数据绘制到 Canvas 上。

| 子模块 | 职责 | 对应现有代码 |
|--------|------|-------------|
| **Canvas 管线** | Canvas 上下文管理、双缓冲、设备像素比适配 | `global/draw/drawMain.js` |
| **单元格渲染** | 单元格背景、文字、边框、批注标记绘制 | `global/draw/cellRender.js`、`cellTextRender.js` |
| **行列标题** | 行号列号绘制、选中高亮、调整大小手柄 | `global/draw/drawTitle.js` |
| **溢出处理** | 单元格文字溢出计算与裁剪 | `global/draw/cellOverflow.js` |
| **坐标计算** | 可视区域行列索引计算、滚动偏移 | `global/getRowlen/` |
| **刷新策略** | 增量刷新、全量刷新、冻结区域刷新 | `global/refresh/` |

**渲染上下文的关键约束**：
- 依赖核心域的只读接口（查询单元格数据、样式）
- 不修改核心域状态
- 通过观察核心域领域事件触发重绘

#### 2.2.3 Interaction Context — 交互上下文

交互上下文处理所有用户输入事件，将其转化为对核心域的操作命令。

| 子模块 | 职责 | 对应现有代码 |
|--------|------|-------------|
| **事件处理** | 鼠标/键盘事件分发与处理 | `controllers/handler/` |
| **选区管理** | 选区状态、多选、Shift 选区、选区高亮 | `Store.luckysheet_select_save`、`controllers/select.js` |
| **剪贴板** | 复制/剪切/粘贴、HTML 生成、外部粘贴解析 | `controllers/selection/` |
| **拖拽填充** | 拖拽填充手柄、填充策略 | `controllers/dropCell/` |
| **筛选交互** | 筛选菜单、筛选条件设置 | `controllers/filter/` |
| **行列操作** | 行列增删、调整大小、隐藏/显示 | `controllers/rowColumnOperation/` |
| **右键菜单** | 上下文菜单构建与响应 | `controllers/handler/contextMenu.js` |

**交互上下文的关键约束**：
- 通过应用服务层操作核心域（不直接修改聚合）
- DOM 操作通过 DOM 适配器（不直接使用 jQuery 或原生 DOM）
- 事件处理与业务逻辑分离

#### 2.2.4 Management Context — 管理上下文

管理上下文负责工作簿级别的生命周期管理。

| 子模块 | 职责 | 对应现有代码 |
|--------|------|-------------|
| **Sheet CRUD** | 新增/删除/重命名/复制/排序工作表 | `controllers/sheetmanage/sheetCRUD.js` |
| **撤销/重做** | 操作历史栈、命令快照 | `Store.jfundo/jfredo`、`controllers/controlHistory.js` |
| **配置管理** | 工具栏/信息栏/Sheet 栏显示配置 | `controllers/luckysheetConfigsetting.js` |
| **冻结管理** | 冻结行列配置与状态 | `controllers/freezen/` |
| **工作簿生命周期** | 初始化、销毁、数据加载 | `core.js`、`global/method.js` |

**管理上下文的关键约束**：
- 协调多个聚合的操作（如删除 Sheet 需要同时操作 Sheet 聚合和 Formula 聚合）
- 撤销/重做通过命令模式实现

#### 2.2.5 Infrastructure Context — 基础设施上下文

基础设施上下文提供技术实现细节，隔离外部依赖。

| 子模块 | 职责 | 对应现有代码 |
|--------|------|-------------|
| **Store 适配器** | 响应式状态管理、持久化 | `store/index.js` → 拆分为 7 个子 Store |
| **DOM 适配器** | DOM 查询/操作封装、事件绑定 | `utils/domUtils.js`、`utils/dialogUtils.js` |
| **插件系统** | 插件注册、生命周期管理 | `Store.plugins`、`luckysheetConfigsetting.plugins` |
| **事件总线** | 领域事件发布/订阅 | 新增 |
| **Canvas 工厂** | Canvas 元素创建、上下文获取 | `global/cleargridelement.js`、`global/createdom.js` |
| **本地存储** | IndexedDB/localStorage 封装 | `plugins/js/localforage.min.js` |

---

## 3. 分层架构

### 3.1 四层架构

```
┌─────────────────────────────────────────────────────┐
│                 Presentation Layer                   │
│              表现层（最外层，依赖所有内层）              │
│                                                     │
│  UI 组件  │  Canvas 渲染  │  事件处理器  │  样式      │
├─────────────────────────────────────────────────────┤
│                Application Layer                     │
│              应用层（编排领域对象）                     │
│                                                     │
│  应用服务  │  用例  │  DTO  │  命令/查询              │
├─────────────────────────────────────────────────────┤
│                 Domain Layer                         │
│              领域层（核心业务逻辑，零外部依赖）          │
│                                                     │
│  实体  │  值对象  │  聚合根  │  领域服务  │  领域事件  │
├─────────────────────────────────────────────────────┤
│              Infrastructure Layer                    │
│              基础设施层（技术实现细节）                  │
│                                                     │
│  仓储  │  适配器  │  外部服务封装  │  插件宿主          │
└─────────────────────────────────────────────────────┘
```

### 3.2 各层职责与规范

#### Domain Layer — 领域层

**核心原则：纯 TypeScript，零外部依赖，不依赖任何外层。**

| 概念 | 说明 | 示例 |
|------|------|------|
| **实体（Entity）** | 有唯一标识的可变对象 | `Cell`（由 row+col 标识）、`Sheet`（由 index 标识）、`ConditionalRule`（由 id 标识） |
| **值对象（Value Object）** | 不可变的值描述 | `CellType`（fa+t）、`CellStyle`（bg+fc+ff+fs+...）、`CellBorder`、`Range`（row+column）、`CellPosition`（row+col） |
| **聚合根（Aggregate Root）** | 一致性边界入口 | `Workbook`（管理 Sheet 集合）、`Sheet`（管理 Cell 集合）、`FormulaEngine`（管理公式依赖图） |
| **领域服务（Domain Service）** | 不属于任何实体的业务逻辑 | `CalculationService`（公式计算）、`FormatComputeService`（条件格式计算） |
| **领域事件（Domain Event）** | 领域内发生的事实 | `CellValueChanged`、`SheetAdded`、`FormulaRecalculated` |

领域层目录结构：

```
domain/
├── cell/
│   ├── Cell.ts                    # 实体
│   ├── CellType.ts                # 值对象
│   ├── CellStyle.ts               # 值对象
│   ├── CellBorder.ts              # 值对象
│   ├── MergeInfo.ts               # 值对象
│   └── events/
│       ├── CellValueChanged.ts
│       └── CellStyleChanged.ts
├── sheet/
│   ├── Sheet.ts                   # 聚合根
│   ├── SheetConfig.ts             # 值对象
│   ├── RowConfig.ts               # 值对象
│   ├── ColumnConfig.ts            # 值对象
│   └── events/
│       ├── SheetAdded.ts
│       ├── SheetRemoved.ts
│       └── SheetActivated.ts
├── formula/
│   ├── FormulaEngine.ts           # 聚合根
│   ├── FormulaAST.ts              # 值对象
│   ├── DependencyGraph.ts         # 实体
│   ├── CalcChain.ts               # 实体
│   └── events/
│       ├── FormulaRecalculated.ts
│       └── CircularReferenceDetected.ts
├── conditionformat/
│   ├── ConditionalRule.ts         # 实体
│   ├── RuleType.ts                # 值对象（枚举）
│   ├── ColorScaleRule.ts          # 值对象
│   ├── DataBarRule.ts             # 值对象
│   ├── IconSetRule.ts             # 值对象
│   └── events/
│       └── ConditionalFormatApplied.ts
├── shared/
│   ├── Range.ts                   # 值对象（共享）
│   ├── Position.ts                # 值对象（共享）
│   └── DomainEvent.ts            # 基础事件类
└── services/
    ├── CalculationService.ts      # 公式计算领域服务
    └── FormatComputeService.ts    # 条件格式计算领域服务
```

#### Application Layer — 应用层

**核心原则：编排领域对象，不包含业务逻辑。**

| 概念 | 说明 | 示例 |
|------|------|------|
| **应用服务** | 用例的入口，协调领域对象完成业务流程 | `CellApplicationService`、`SheetApplicationService`、`FormulaApplicationService` |
| **命令（Command）** | 表达写操作的意图 | `SetCellValueCommand`、`AddSheetCommand`、`ApplyConditionalFormatCommand` |
| **查询（Query）** | 表达读操作的意图 | `GetCellValueQuery`、`GetSheetDataQuery` |
| **DTO** | 跨层数据传输对象 | `CellDTO`、`SheetDTO`、`ConditionalRuleDTO` |

应用层目录结构：

```
application/
├── cell/
│   ├── CellApplicationService.ts
│   ├── commands/
│   │   ├── SetCellValueCommand.ts
│   │   ├── SetCellStyleCommand.ts
│   │   └── MergeCellsCommand.ts
│   ├── queries/
│   │   ├── GetCellValueQuery.ts
│   │   └── GetCellDisplayStyleQuery.ts
│   └── dto/
│       └── CellDTO.ts
├── sheet/
│   ├── SheetApplicationService.ts
│   ├── commands/
│   │   ├── AddSheetCommand.ts
│   │   ├── RemoveSheetCommand.ts
│   │   └── SwitchSheetCommand.ts
│   └── dto/
│       └── SheetDTO.ts
├── formula/
│   ├── FormulaApplicationService.ts
│   ├── commands/
│   │   ├── SetCellFormulaCommand.ts
│   │   └── RecalculateCommand.ts
│   └── queries/
│       └── GetFormulaResultQuery.ts
├── conditionformat/
│   ├── ConditionalFormatApplicationService.ts
│   ├── commands/
│   │   ├── AddRuleCommand.ts
│   │   ├── UpdateRuleCommand.ts
│   │   └── DeleteRuleCommand.ts
│   └── queries/
│       └── GetAppliedFormatsQuery.ts
└── selection/
    ├── SelectionApplicationService.ts
    ├── commands/
    │   ├── SetSelectionCommand.ts
    │   └── CopyPasteCommand.ts
    └── dto/
        └── SelectionDTO.ts
```

#### Infrastructure Layer — 基础设施层

**核心原则：为领域层和应用层提供技术实现，实现接口反转。**

| 概念 | 说明 | 示例 |
|------|------|------|
| **仓储（Repository）** | 领域对象的持久化 | `CellRepository`（读写 flowdata）、`SheetRepository`（读写 luckysheetfile） |
| **适配器（Adapter）** | 外部依赖的封装 | `DOMAdapter`、`CanvasAdapter`、`ClipboardAdapter` |
| **事件总线** | 领域事件的发布/订阅实现 | `EventBus` |
| **插件宿主** | 插件注册与生命周期管理 | `PluginHost` |

基础设施层目录结构：

```
infrastructure/
├── persistence/
│   ├── CellRepository.ts          # flowdata 读写
│   ├── SheetRepository.ts         # luckysheetfile 读写
│   └── FormulaRepository.ts       # 公式链持久化
├── adapters/
│   ├── DOMAdapter.ts              # DOM 操作封装（替代 jQuery）
│   ├── CanvasAdapter.ts           # Canvas 操作封装
│   ├── ClipboardAdapter.ts        # 剪贴板操作封装
│   └── StorageAdapter.ts          # 本地存储封装
├── events/
│   └── EventBus.ts                # 领域事件总线实现
├── plugins/
│   ├── PluginHost.ts              # 插件宿主
│   ├── PluginRegistry.ts          # 插件注册表
│   └── PluginLifecycle.ts         # 插件生命周期
└── store/
    ├── ReactiveStore.ts           # 响应式状态管理
    ├── SheetStore.ts              # Sheet 状态
    ├── SelectionStore.ts          # 选区状态
    ├── LayoutStore.ts             # 布局状态
    └── UIStore.ts                 # UI 状态
```

#### Presentation Layer — 表现层

**核心原则：只负责 UI 展示和用户交互，不包含业务逻辑。**

| 概念 | 说明 | 示例 |
|------|------|------|
| **Canvas 渲染器** | 将领域数据绘制到 Canvas | `CellRenderer`、`HeaderRenderer`、`GridRenderer` |
| **事件处理器** | 将 DOM 事件转化为应用层命令 | `MouseHandler`、`KeyboardHandler`、`ScrollHandler` |
| **UI 组件** | 工具栏、Sheet 标签栏、公式栏、右键菜单 | `Toolbar`、`SheetBar`、`FormulaBar`、`ContextMenu` |
| **样式管理** | CSS Modules / CSS 文件 | 各组件样式 |

表现层目录结构：

```
presentation/
├── canvas/
│   ├── CanvasRenderer.ts          # Canvas 渲染主入口
│   ├── CellRenderer.ts            # 单元格渲染
│   ├── HeaderRenderer.ts          # 行列标题渲染
│   ├── GridRenderer.ts            # 网格线渲染
│   ├── SelectionRenderer.ts       # 选区高亮渲染
│   └── FreezeRenderer.ts          # 冻结区域渲染
├── handlers/
│   ├── MouseHandler.ts            # 鼠标事件处理
│   ├── KeyboardHandler.ts         # 键盘事件处理
│   ├── ScrollHandler.ts           # 滚动事件处理
│   ├── ResizeHandler.ts           # 行列调整处理
│   └── DragHandler.ts             # 拖拽处理
├── components/
│   ├── Toolbar/
│   │   ├── Toolbar.ts
│   │   └── Toolbar.css
│   ├── SheetBar/
│   │   ├── SheetBar.ts
│   │   └── SheetBar.css
│   ├── FormulaBar/
│   │   ├── FormulaBar.ts
│   │   └── FormulaBar.css
│   ├── ContextMenu/
│   │   ├── ContextMenu.ts
│   │   └── ContextMenu.css
│   ├── Dialog/
│   │   ├── Dialog.ts
│   │   └── Dialog.css
│   └── FilterMenu/
│       ├── FilterMenu.ts
│       └── FilterMenu.css
└── styles/
    ├── base.css
    ├── grid.css
    ├── toolbar.css
    └── dialog.css
```

---

## 4. 依赖规则

### 4.1 依赖方向

依赖只能从外层指向内层，**领域层不依赖任何外层**：

```
Presentation → Application → Domain
Infrastructure → Application → Domain
Infrastructure → Domain (实现领域层定义的接口)
```

严格规则：

| 规则 | 说明 |
|------|------|
| Domain 不依赖 Application | 领域层不知道应用服务的存在 |
| Domain 不依赖 Infrastructure | 领域层通过接口（Port）定义需求，基础设施层实现接口 |
| Domain 不依赖 Presentation | 领域层不知道任何 UI 组件 |
| Application 不依赖 Presentation | 应用层不知道 UI 如何展示 |
| Application 不依赖 Infrastructure 具体实现 | 应用层通过接口与基础设施交互 |
| Infrastructure 实现 Domain 定义的接口 | 依赖反转（DIP） |

### 4.2 接口反转示例

```typescript
// domain/cell/ports/CellRepositoryPort.ts — 领域层定义接口
export interface CellRepositoryPort {
  getCell(row: number, col: number): Cell | null;
  setCell(row: number, col: number, cell: Cell): void;
  getRange(range: Range): Cell[][];
}

// infrastructure/persistence/CellRepository.ts — 基础设施层实现
import { CellRepositoryPort } from '@/domain/cell/ports/CellRepositoryPort';

export class CellRepository implements CellRepositoryPort {
  getCell(row: number, col: number): Cell | null {
    // 从 flowdata 读取
  }
  setCell(row: number, col: number, cell: Cell): void {
    // 写入 flowdata
  }
  getRange(range: Range): Cell[][] {
    // 读取范围数据
  }
}
```

### 4.3 跨上下文通信

限界上下文之间通过以下方式通信：

| 通信方式 | 适用场景 | 说明 |
|---------|---------|------|
| **领域事件** | 异步通知 | 核心域发布事件，其他上下文订阅 |
| **应用服务调用** | 同步操作 | 交互上下文调用核心域的应用服务 |
| **查询接口** | 只读数据获取 | 渲染上下文查询核心域的只读接口 |

领域事件流转示例：

```
[交互上下文] 用户修改单元格值
    │
    ▼
[应用层] CellApplicationService.setCellValue()
    │
    ▼
[核心域] Cell.setValue() → 发布 CellValueChanged 事件
    │
    ├──▶ [渲染上下文] 订阅 CellValueChanged → 触发重绘
    ├──▶ [核心域] FormulaEngine 订阅 → 重新计算依赖公式
    └──▶ [管理上下文] UndoManager 订阅 → 记录操作历史
```

---

## 5. 插件化架构

### 5.1 设计目标

将条件格式、交替格式、公式函数库等可扩展功能设计为插件，实现：

- **核心引擎精简**：只包含单元格、工作表、公式引擎等核心功能
- **按需加载**：插件可延迟加载，减小初始包体积
- **可扩展**：第三方可开发自定义插件
- **可替换**：内置插件可被自定义实现替换

### 5.2 插件分类

| 插件类型 | 说明 | 示例 |
|---------|------|------|
| **内置插件** | 随核心引擎一起发布，但可禁用 | 条件格式、交替格式、筛选、冻结 |
| **函数库插件** | 扩展公式函数 | 财务函数、统计函数、工程函数、自定义函数 |
| **渲染插件** | 扩展渲染能力 | 条件格式渲染器（颜色渐变/数据条/图标集） |
| **交互插件** | 扩展交互能力 | 拖拽填充、矩阵操作 |
| **第三方插件** | 外部开发者提供 | 自定义格式规则、自定义函数 |

### 5.3 插件接口定义

```typescript
// infrastructure/plugins/PluginInterface.ts

export interface LuckysheetPlugin {
  readonly name: string;
  readonly version: string;
  readonly dependencies?: string[];

  install(context: PluginContext): void;
  activate?(): void;
  deactivate?(): void;
  uninstall(): void;
}

export interface PluginContext {
  eventBus: EventBus;
  store: ReactiveStore;
  commandBus: CommandBus;
  queryBus: QueryBus;
  registerRenderer(name: string, renderer: RendererFactory): void;
  registerFunction(namespace: string, functions: Record<string, FunctionDefinition>): void;
  registerCommand(commandType: string, handler: CommandHandler): void;
  registerEventHandler(eventType: string, handler: EventHandler): void;
}
```

### 5.4 插件注册流程

```
1. 用户调用 luckysheet.create({ plugins: [ConditionalFormatPlugin, AlternateFormatPlugin] })
2. PluginHost.install(plugin) 依次调用每个插件的 install()
3. 插件在 install() 中注册：
   - 条件格式插件 → registerRenderer('conditionFormat', CFRendererFactory)
   - 条件格式插件 → registerCommand('addConditionalRule', AddRuleHandler)
   - 公式函数插件 → registerFunction('financial', financialFunctions)
4. 插件通过 eventBus 订阅领域事件
5. 核心引擎初始化完成后，调用 activate()
```

### 5.5 内置插件清单

| 插件名 | 注册内容 | 对应现有代码 |
|--------|---------|-------------|
| `ConditionalFormatPlugin` | 渲染器 + 命令 + 事件处理 + 对话框 | `controllers/conditionformat/` |
| `AlternateFormatPlugin` | 渲染器 + 命令 + 对话框 | `controllers/alternateformat/` |
| `FilterPlugin` | 命令 + 事件处理 + 筛选菜单 | `controllers/filter/` |
| `FreezePlugin` | 渲染器 + 命令 + 配置 | `controllers/freezen/` |
| `DropCellPlugin` | 命令 + 填充策略 | `controllers/dropCell/` |
| `MatrixOperationPlugin` | 命令 | `controllers/matrixOperation/` |
| `FinancialFunctionsPlugin` | 函数注册 | `function/functionImplementation/financial/` |
| `StatisticalFunctionsPlugin` | 函数注册 | `function/functionImplementation/statistical/` |
| `DateFunctionsPlugin` | 函数注册 | `function/functionImplementation/date/` |
| `EngineeringFunctionsPlugin` | 函数注册 | `function/functionImplementation/engineering/` |
| `LookupFunctionsPlugin` | 函数注册 | `function/functionImplementation/lookup/` |
| `MathFunctionsPlugin` | 函数注册 | `function/functionImplementation/math/` |
| `TextFunctionsPlugin` | 函数注册 | `function/functionImplementation/text/` |

---

## 6. 目录结构设计

### 6.1 新工程 `luckysheet-next/src/` 完整目录结构

```
luckysheet-next/
├── docs/                              # 重构工程文档
├── public/                            # 静态资源
├── src/
│   ├── domain/                        # 领域层
│   │   ├── cell/                      # 单元格聚合
│   │   │   ├── Cell.ts
│   │   │   ├── CellType.ts
│   │   │   ├── CellStyle.ts
│   │   │   ├── CellBorder.ts
│   │   │   ├── MergeInfo.ts
│   │   │   ├── ports/
│   │   │   │   └── CellRepositoryPort.ts
│   │   │   └── events/
│   │   │       ├── CellValueChanged.ts
│   │   │       └── CellStyleChanged.ts
│   │   ├── sheet/                     # 工作表聚合
│   │   │   ├── Sheet.ts
│   │   │   ├── SheetConfig.ts
│   │   │   ├── RowConfig.ts
│   │   │   ├── ColumnConfig.ts
│   │   │   ├── ports/
│   │   │   │   └── SheetRepositoryPort.ts
│   │   │   └── events/
│   │   │       ├── SheetAdded.ts
│   │   │       ├── SheetRemoved.ts
│   │   │       └── SheetActivated.ts
│   │   ├── formula/                   # 公式聚合
│   │   │   ├── FormulaEngine.ts
│   │   │   ├── FormulaAST.ts
│   │   │   ├── DependencyGraph.ts
│   │   │   ├── CalcChain.ts
│   │   │   ├── FormulaError.ts
│   │   │   ├── ports/
│   │   │   │   └── FormulaRepositoryPort.ts
│   │   │   └── events/
│   │   │       ├── FormulaRecalculated.ts
│   │   │       └── CircularReferenceDetected.ts
│   │   ├── conditionformat/           # 条件格式聚合
│   │   │   ├── ConditionalRule.ts
│   │   │   ├── RuleType.ts
│   │   │   ├── ColorScaleRule.ts
│   │   │   ├── DataBarRule.ts
│   │   │   ├── IconSetRule.ts
│   │   │   ├── DefaultRule.ts
│   │   │   └── events/
│   │   │       └── ConditionalFormatApplied.ts
│   │   ├── shared/                    # 共享值对象
│   │   │   ├── Range.ts
│   │   │   ├── Position.ts
│   │   │   └── DomainEvent.ts
│   │   └── services/                  # 领域服务
│   │       ├── CalculationService.ts
│   │       └── FormatComputeService.ts
│   │
│   ├── application/                   # 应用层
│   │   ├── cell/
│   │   │   ├── CellApplicationService.ts
│   │   │   ├── commands/
│   │   │   ├── queries/
│   │   │   └── dto/
│   │   ├── sheet/
│   │   │   ├── SheetApplicationService.ts
│   │   │   ├── commands/
│   │   │   └── dto/
│   │   ├── formula/
│   │   │   ├── FormulaApplicationService.ts
│   │   │   ├── commands/
│   │   │   └── queries/
│   │   ├── conditionformat/
│   │   │   ├── ConditionalFormatApplicationService.ts
│   │   │   ├── commands/
│   │   │   └── queries/
│   │   └── selection/
│   │       ├── SelectionApplicationService.ts
│   │       ├── commands/
│   │       └── dto/
│   │
│   ├── infrastructure/                # 基础设施层
│   │   ├── persistence/
│   │   │   ├── CellRepository.ts
│   │   │   ├── SheetRepository.ts
│   │   │   └── FormulaRepository.ts
│   │   ├── adapters/
│   │   │   ├── DOMAdapter.ts
│   │   │   ├── CanvasAdapter.ts
│   │   │   ├── ClipboardAdapter.ts
│   │   │   └── StorageAdapter.ts
│   │   ├── events/
│   │   │   └── EventBus.ts
│   │   ├── plugins/
│   │   │   ├── PluginHost.ts
│   │   │   ├── PluginRegistry.ts
│   │   │   └── PluginLifecycle.ts
│   │   └── store/
│   │       ├── ReactiveStore.ts
│   │       ├── SheetStore.ts
│   │       ├── SelectionStore.ts
│   │       ├── LayoutStore.ts
│   │       └── UIStore.ts
│   │
│   ├── presentation/                  # 表现层
│   │   ├── canvas/
│   │   │   ├── CanvasRenderer.ts
│   │   │   ├── CellRenderer.ts
│   │   │   ├── HeaderRenderer.ts
│   │   │   ├── GridRenderer.ts
│   │   │   ├── SelectionRenderer.ts
│   │   │   └── FreezeRenderer.ts
│   │   ├── handlers/
│   │   │   ├── MouseHandler.ts
│   │   │   ├── KeyboardHandler.ts
│   │   │   ├── ScrollHandler.ts
│   │   │   ├── ResizeHandler.ts
│   │   │   └── DragHandler.ts
│   │   ├── components/
│   │   │   ├── Toolbar/
│   │   │   ├── SheetBar/
│   │   │   ├── FormulaBar/
│   │   │   ├── ContextMenu/
│   │   │   ├── Dialog/
│   │   │   └── FilterMenu/
│   │   └── styles/
│   │       ├── base.css
│   │       ├── grid.css
│   │       ├── toolbar.css
│   │       └── dialog.css
│   │
│   ├── plugins/                       # 内置插件实现
│   │   ├── conditional-format/
│   │   │   ├── ConditionalFormatPlugin.ts
│   │   │   ├── CFRenderer.ts
│   │   │   ├── CFDialog.ts
│   │   │   └── commands/
│   │   ├── alternate-format/
│   │   │   ├── AlternateFormatPlugin.ts
│   │   │   └── AFDialog.ts
│   │   ├── filter/
│   │   │   ├── FilterPlugin.ts
│   │   │   └── FilterMenu.ts
│   │   ├── freeze/
│   │   │   └── FreezePlugin.ts
│   │   ├── drop-cell/
│   │   │   ├── DropCellPlugin.ts
│   │   │   └── strategies/
│   │   ├── matrix-operation/
│   │   │   └── MatrixOperationPlugin.ts
│   │   └── functions/                 # 函数库插件
│   │       ├── financial/
│   │       ├── statistical/
│   │       ├── date/
│   │       ├── engineering/
│   │       ├── lookup/
│   │       ├── math/
│   │       ├── text/
│   │       └── logical/
│   │
│   ├── api/                           # 公共 API 层
│   │   ├── index.ts
│   │   ├── cell.ts
│   │   ├── sheet.ts
│   │   ├── range.ts
│   │   ├── format.ts
│   │   └── workbook.ts
│   │
│   ├── shared/                        # 共享工具
│   │   ├── utils/
│   │   │   ├── math.ts
│   │   │   ├── string.ts
│   │   │   ├── color.ts
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   ├── array.ts
│   │   │   └── type.ts
│   │   └── constants.ts
│   │
│   ├── i18n/                          # 国际化
│   │   ├── index.ts
│   │   ├── en.ts
│   │   ├── zh.ts
│   │   └── zh_tw.ts
│   │
│   └── index.ts                       # 入口文件
│
├── tests/                             # 测试
│   ├── unit/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/
│   └── e2e/
│
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

### 6.2 与现有代码的对应关系

| 新路径 | 旧路径 | 说明 |
|--------|--------|------|
| `domain/cell/` | `Store.flowdata` + `global/getdata.js` + `global/setdata.js` + `global/format.js` | 单元格核心逻辑提取 |
| `domain/sheet/` | `Store.luckysheetfile` + `controllers/sheetmanage/` | 工作表核心逻辑提取 |
| `domain/formula/` | `global/formula/` + `function/` | 公式引擎核心逻辑提取 |
| `domain/conditionformat/` | `controllers/conditionformat/compute.js` + `ruleManager.js` | 条件格式核心逻辑提取 |
| `infrastructure/store/` | `store/index.js` → 拆分 | Store 拆分为多个子 Store |
| `infrastructure/adapters/DOMAdapter.ts` | `utils/domUtils.js` + jQuery 调用 | DOM 操作统一封装 |
| `presentation/canvas/` | `global/draw/` + `global/refresh/` | 渲染管线重构 |
| `presentation/handlers/` | `controllers/handler/` | 事件处理重构 |
| `presentation/components/Toolbar/` | `controllers/menuButton/` | 工具栏组件化 |
| `plugins/conditional-format/` | `controllers/conditionformat/dialog/` | 条件格式 UI 插件化 |
| `plugins/functions/` | `function/functionImplementation/` | 函数库插件化 |
| `api/` | `global/api/` | API 层重构 |

---

## 7. 状态管理策略

### 7.1 当前 Store 的问题

当前 `Store` 是一个包含 57 个字段的可变对象，存在以下问题：

1. **无领域边界**：选区状态、布局状态、UI 状态、缓存数据全部混在一起
2. **无类型安全**：所有字段都是 `any` 类型
3. **无变更通知**：修改 Store 字段不会自动触发渲染更新
4. **无重置机制**：`method.destroy()` 需要硬编码所有默认值

### 7.2 新 Store 架构

按限界上下文拆分 Store，每个 Store 独立管理：

```typescript
// infrastructure/store/SheetStore.ts
export class SheetStore {
  private state: SheetState;

  get currentSheetIndex(): number { return this.state.currentSheetIndex; }
  get flowdata(): CellValue[][] { return this.state.flowdata; }
  get config(): SheetConfig { return this.state.config; }

  updateSheetIndex(index: number): void { ... }
  updateFlowData(data: CellValue[][]): void { ... }
  updateConfig(config: Partial<SheetConfig>): void { ... }
  reset(): void { this.state = createDefaultSheetState(); }
}
```

### 7.3 Store 拆分映射

| 新 Store | 包含状态 | 对应旧 Store 字段 |
|----------|---------|------------------|
| `SheetStore` | 当前工作表数据、配置、索引 | `container`, `luckysheetfile`, `currentSheetIndex`, `flowdata`, `config`, `lang` |
| `LayoutStore` | 布局尺寸、可视区域 | `visibledatarow`, `visibledatacolumn`, `cellmainWidth`, `cellmainHeight`, `zoomRatio` |
| `SelectionStore` | 选区、剪贴板状态 | `luckysheet_select_save`, `luckysheet_copy_save`, `luckysheet_paste_iscut` |
| `UIStore` | UI 交互状态 | `luckysheet_scroll_status`, `luckysheet_model_move_state`, `zIndex` |
| `CacheStore` | 计算缓存 | `measureTextCache`, `cellOverflowMapCache`, `conditionFormatCells` |
| `RowColStore` | 行列交互状态 | `luckysheet_rows_selected_status`, `luckysheet_cols_change_size` |

---

## 8. 关键设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 领域层是否纯 TS | 是 | 领域逻辑可独立测试、可复用于不同运行时（浏览器/Node/Worker） |
| 是否使用 ORM | 否 | 电子表格数据结构是二维数组，不适合关系型映射 |
| 是否使用响应式框架 | 仅基础设施层 | 领域层手动管理状态，基础设施层提供响应式通知 |
| Canvas 渲染 vs DOM 渲染 | 保持 Canvas | 性能优势明显，且已有大量 Canvas 渲染代码 |
| 插件系统是否支持异步加载 | 是 | 函数库等插件体积大，应支持延迟加载 |
| 是否使用 Web Worker | 后期考虑 | 公式计算可迁移到 Worker，但不在首期范围 |
