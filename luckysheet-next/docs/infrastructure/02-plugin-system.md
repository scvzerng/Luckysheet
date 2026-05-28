# 插件系统架构设计

> 本文档定义 `luckysheet-next` 模块的插件系统架构，包括插件接口、注册表、生命周期、通信机制及内置插件规划。
> 插件系统是 DDD 重构的核心基础设施，使各功能模块（条件格式、交替颜色、筛选等）以插件形式解耦。

---

## 1. 核心接口定义

### 1.1 插件接口

```typescript
interface IPlugin {
  name: string
  version: string
  dependencies?: string[]
  install(context: IPluginContext): void
  destroy?(): void
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | 是 | 插件唯一标识符，格式为 `@luckysheet/plugin-xxx` |
| `version` | `string` | 是 | 语义化版本号，遵循 SemVer |
| `dependencies` | `string[]` | 否 | 依赖的其他插件名称列表 |
| `install` | `(context) => void` | 是 | 插件安装入口，接收插件上下文 |
| `destroy` | `() => void` | 否 | 插件销毁回调，用于清理资源 |

### 1.2 插件上下文接口

```typescript
interface IPluginContext {
  registerCommand(command: ICommand): void
  registerFunction(func: IFormulaFunction): void
  registerConditionFormat(condition: IConditionStrategy): void
  registerRenderer(renderer: ICellRenderer): void
  getStore(): IStore
  getEventBus(): IEventBus
}
```

**方法说明**：

| 方法 | 说明 | 使用场景 |
|------|------|----------|
| `registerCommand` | 注册命令（如条件格式规则增删改） | 用户操作、快捷键、API 调用 |
| `registerFunction` | 注册公式函数 | 扩展公式引擎 |
| `registerConditionFormat` | 注册条件格式策略 | 新增条件格式类型 |
| `registerRenderer` | 注册单元格渲染器 | 自定义单元格绘制逻辑 |
| `getStore` | 获取全局状态仓库 | 读写共享状态 |
| `getEventBus` | 获取事件总线 | 跨插件通信 |

### 1.3 相关支撑接口

```typescript
interface ICommand {
  id: string
  name: string
  execute(...args: unknown[]): void
  undo?(): void
  canExecute?(): boolean
}

interface IFormulaFunction {
  name: string
  category: string
  calculate(...args: unknown[]): unknown
}

interface IConditionStrategy {
  type: ConditionType
  compute(cellValue: CellValue, rule: IConditionRule): ComputeResult
  render(ctx: CanvasRenderingContext2D, cell: Cell, result: ComputeResult): void
}

interface ICellRenderer {
  name: string
  priority: number
  canRender(cell: Cell): boolean
  render(ctx: CanvasRenderingContext2D, cell: Cell, bounds: CellBounds): void
}

interface IStore {
  getState<T>(key: string): T | undefined
  setState<T>(key: string, value: T): void
  subscribe(key: string, listener: (value: unknown) => void): () => void
}

interface IEventBus {
  emit(event: string, payload?: unknown): void
  on(event: string, handler: EventHandler): () => void
  once(event: string, handler: EventHandler): () => void
  off(event: string, handler: EventHandler): void
}

type EventHandler = (payload?: unknown) => void
```

---

## 2. 插件注册表

### 2.1 PluginRegistry 实现

```typescript
type PluginState = 'registered' | 'installed' | 'active' | 'deactivated' | 'destroyed'

interface IPluginRegistry {
  register(plugin: IPlugin): void
  unregister(name: string): void
  install(name: string): void
  activate(name: string): void
  deactivate(name: string): void
  destroy(name: string): void
  getPlugin(name: string): IPlugin | undefined
  getPluginState(name: string): PluginState | undefined
  getAllPlugins(): ReadonlyMap<string, { plugin: IPlugin; state: PluginState }>
}

class PluginRegistry implements IPluginRegistry {
  private plugins: Map<string, { plugin: IPlugin; state: PluginState }> = new Map()
  private context: IPluginContext

  constructor(context: IPluginContext) {
    this.context = context
  }

  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }
    this.validateDependencies(plugin)
    this.plugins.set(plugin.name, { plugin, state: 'registered' })
  }

  unregister(name: string): void {
    const entry = this.plugins.get(name)
    if (!entry) return
    if (entry.state !== 'registered' && entry.state !== 'destroyed') {
      throw new Error(`Cannot unregister plugin "${name}" in state "${entry.state}"`)
    }
    this.plugins.delete(name)
  }

  install(name: string): void {
    const entry = this.plugins.get(name)
    if (!entry) throw new Error(`Plugin "${name}" not found`)
    if (entry.state !== 'registered') {
      throw new Error(`Cannot install plugin "${name}" in state "${entry.state}"`)
    }
    this.ensureDependenciesInstalled(name)
    entry.plugin.install(this.context)
    entry.state = 'installed'
  }

  activate(name: string): void {
    const entry = this.plugins.get(name)
    if (!entry) throw new Error(`Plugin "${name}" not found`)
    if (entry.state !== 'installed' && entry.state !== 'deactivated') {
      throw new Error(`Cannot activate plugin "${name}" in state "${entry.state}"`)
    }
    entry.state = 'active'
    this.context.getEventBus().emit('plugin:activated', { name })
  }

  deactivate(name: string): void {
    const entry = this.plugins.get(name)
    if (!entry) throw new Error(`Plugin "${name}" not found`)
    if (entry.state !== 'active') {
      throw new Error(`Cannot deactivate plugin "${name}" in state "${entry.state}"`)
    }
    entry.state = 'deactivated'
    this.context.getEventBus().emit('plugin:deactivated', { name })
  }

  destroy(name: string): void {
    const entry = this.plugins.get(name)
    if (!entry) throw new Error(`Plugin "${name}" not found`)
    if (entry.state === 'installed' || entry.state === 'active') {
      throw new Error(`Cannot destroy plugin "${name}" in state "${entry.state}", deactivate first`)
    }
    if (entry.plugin.destroy) {
      entry.plugin.destroy()
    }
    entry.state = 'destroyed'
    this.context.getEventBus().emit('plugin:destroyed', { name })
  }

  getPlugin(name: string): IPlugin | undefined {
    return this.plugins.get(name)?.plugin
  }

  getPluginState(name: string): PluginState | undefined {
    return this.plugins.get(name)?.state
  }

  getAllPlugins(): ReadonlyMap<string, { plugin: IPlugin; state: PluginState }> {
    return this.plugins
  }

  private validateDependencies(plugin: IPlugin): void {
    if (!plugin.dependencies) return
    for (const dep of plugin.dependencies) {
      if (!this.plugins.has(dep)) {
        throw new Error(`Plugin "${plugin.name}" depends on "${dep}" which is not registered`)
      }
    }
  }

  private ensureDependenciesInstalled(name: string): void {
    const entry = this.plugins.get(name)
    if (!entry?.plugin.dependencies) return
    for (const dep of entry.plugin.dependencies) {
      const depEntry = this.plugins.get(dep)
      if (!depEntry || (depEntry.state !== 'installed' && depEntry.state !== 'active')) {
        throw new Error(`Plugin "${name}" depends on "${dep}" which is not installed`)
      }
    }
  }
}
```

### 2.2 注册表设计原则

1. **单一职责**：注册表只负责插件的生命周期管理，不关心插件内部实现
2. **依赖安全**：安装时校验依赖是否已安装，防止循环依赖
3. **状态保护**：非法状态转换抛出异常，防止插件处于不一致状态
4. **事件通知**：状态变更通过 EventBus 广播，其他模块可监听

---

## 3. 插件生命周期

### 3.1 状态机

```
                    register()
                        │
                        ▼
                  ┌──────────┐
                  │ registered│
                  └─────┬─────┘
                        │ install()
                        ▼
                  ┌──────────┐
            ┌─────┤ installed │─────┐
            │     └──────────┘     │
            │ activate()          │ destroy()
            ▼                     │
      ┌──────────┐                │
      │  active  │◄──activate()   │
      └─────┬────┘                │
            │ deactivate()        │
            ▼                     │
     ┌────────────┐               │
     │deactivated ├───────────────┘
     └────────────┘      destroy()
```

### 3.2 生命周期各阶段说明

| 阶段 | 触发方法 | 说明 | 可执行操作 |
|------|----------|------|-----------|
| `registered` | `register()` | 插件已注册到注册表，但未初始化 | `install()`, `unregister()` |
| `installed` | `install()` | 调用了 `plugin.install(context)`，注册了命令/函数/渲染器 | `activate()`, `destroy()` |
| `active` | `activate()` | 插件处于活跃状态，响应用户操作和事件 | `deactivate()` |
| `deactivated` | `deactivate()` | 插件暂停，不响应事件 | `activate()`, `destroy()` |
| `destroyed` | `destroy()` | 插件已销毁，资源已清理 | `unregister()` |

### 3.3 生命周期钩子

插件通过 `install` 和 `destroy` 方法参与生命周期：

```typescript
class ConditionalFormatPlugin implements IPlugin {
  name = '@luckysheet/plugin-condition-format'
  version = '1.0.0'
  dependencies = ['@luckysheet/plugin-core-renderer']

  private disposers: (() => void)[] = []

  install(context: IPluginContext): void {
    const eventBus = context.getEventBus()

    context.registerCommand({
      id: 'condition-format.add-rule',
      name: '添加条件格式规则',
      execute: (rule: IConditionRule) => { /* ... */ },
      undo: () => { /* ... */ },
    })

    context.registerCommand({
      id: 'condition-format.delete-rule',
      name: '删除条件格式规则',
      execute: (ruleId: string) => { /* ... */ },
      undo: () => { /* ... */ },
    })

    context.registerConditionFormat(new ColorScaleStrategy())
    context.registerConditionFormat(new DataBarStrategy())
    context.registerConditionFormat(new IconSetStrategy())
    context.registerConditionFormat(new HighlightCellStrategy())
    context.registerConditionFormat(new TopRankStrategy())
    context.registerConditionFormat(new DuplicateValueStrategy())

    const unsub = eventBus.on('cell:value-changed', (payload) => {
      this.recomputeAffectedCells(payload)
    })
    this.disposers.push(unsub)
  }

  destroy(): void {
    this.disposers.forEach((fn) => fn())
    this.disposers = []
  }
}
```

---

## 4. 插件通信机制

### 4.1 EventBus 实现

插件之间通过 EventBus 进行松耦合通信，避免直接依赖。

```typescript
type EventHandler = (payload?: unknown) => void

class EventBus implements IEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map()

  emit(event: string, payload?: unknown): void {
    const handlers = this.handlers.get(event)
    if (!handlers) return
    handlers.forEach((handler) => {
      try {
        handler(payload)
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error)
      }
    })
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
    return () => this.off(event, handler)
  }

  once(event: string, handler: EventHandler): () => void {
    const wrapper: EventHandler = (payload) => {
      this.off(event, wrapper)
      handler(payload)
    }
    return this.on(event, wrapper)
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event)
    if (!handlers) return
    handlers.delete(handler)
    if (handlers.size === 0) {
      this.handlers.delete(event)
    }
  }
}
```

### 4.2 标准事件协议

定义插件间通信的标准事件名称和载荷格式：

| 事件名 | 载荷类型 | 说明 | 发送者 | 接收者 |
|--------|----------|------|--------|--------|
| `cell:value-changed` | `{ row: number; col: number; oldValue: CellValue; newValue: CellValue }` | 单元格值变更 | Core | 条件格式、公式引擎等 |
| `cell:style-changed` | `{ row: number; col: number; style: CellStyle }` | 单元格样式变更 | Core | 渲染器 |
| `sheet:activated` | `{ sheetId: string }` | 工作表切换 | Core | 所有插件 |
| `selection:changed` | `{ ranges: CellRange[] }` | 选区变更 | Selection 插件 | 条件格式、筛选 |
| `command:executed` | `{ commandId: string; args: unknown[] }` | 命令执行完成 | CommandBus | UndoRedo、日志 |
| `command:undone` | `{ commandId: string }` | 命令撤销完成 | CommandBus | 所有插件 |
| `plugin:activated` | `{ name: string }` | 插件激活 | PluginRegistry | 所有插件 |
| `plugin:deactivated` | `{ name: string }` | 插件停用 | PluginRegistry | 所有插件 |
| `render:before` | `{ sheetId: string }` | 渲染前 | 渲染器 | 条件格式（计算） |
| `render:after` | `{ sheetId: string }` | 渲染完成 | 渲染器 | 所有插件 |

### 4.3 通信模式

```
┌─────────────────────┐     emit('cell:value-changed')     ┌──────────────────────┐
│                     │ ──────────────────────────────────► │                      │
│   Core / Store      │                                    │  ConditionalFormat   │
│                     │ ◄────────────────────────────────── │  Plugin              │
└─────────────────────┘     emit('render:before')          └──────────────────────┘

┌─────────────────────┐     emit('selection:changed')      ┌──────────────────────┐
│                     │ ──────────────────────────────────► │                      │
│  Selection Plugin   │                                    │  Filter Plugin       │
│                     │                                    │                      │
└─────────────────────┘                                    └──────────────────────┘

┌─────────────────────┐     emit('command:executed')       ┌──────────────────────┐
│                     │ ──────────────────────────────────► │                      │
│  CommandBus         │                                    │  UndoRedo Plugin     │
│                     │                                    │                      │
└─────────────────────┘                                    └──────────────────────┘
```

### 4.4 通信约束

1. **禁止同步调用**：插件间不允许直接调用对方方法，必须通过 EventBus
2. **事件命名规范**：`模块:动作`，如 `cell:value-changed`
3. **载荷不可变**：事件载荷应视为只读，接收方不应修改
4. **错误隔离**：单个事件处理器异常不影响其他处理器和事件传播
5. **内存安全**：`on()` 返回取消函数，插件 `destroy()` 时必须调用

---

## 5. 内置插件规划

### 5.1 插件清单

| 插件名称 | 对应旧模块 | 优先级 | 说明 |
|----------|-----------|--------|------|
| `@luckysheet/plugin-condition-format` | [conditionformat/](file:///d:/gitee/Luckysheet/src/controllers/conditionformat) | P0 | 条件格式（首批迁移） |
| `@luckysheet/plugin-alternate-format` | [alternateformat/](file:///d:/gitee/Luckysheet/src/controllers/alternateformat) | P1 | 交替颜色 |
| `@luckysheet/plugin-filter` | [filter/](file:///d:/gitee/Luckysheet/src/controllers/filter) | P1 | 数据筛选 |
| `@luckysheet/plugin-freeze` | [freezen/](file:///d:/gitee/Luckysheet/src/controllers/freezen) | P2 | 冻结窗格 |
| `@luckysheet/plugin-drop-cell` | [dropCell/](file:///d:/gitee/Luckysheet/src/controllers/dropCell) | P2 | 拖拽填充 |
| `@luckysheet/plugin-selection` | [selection/](file:///d:/gitee/Luckysheet/src/controllers/selection) | P2 | 选区管理 |
| `@luckysheet/plugin-search-replace` | [searchReplace](file:///d:/gitee/Luckysheet/src/controllers/searchReplace.js) | P3 | 查找替换 |
| `@luckysheet/plugin-postil` | [postil](file:///d:/gitee/Luckysheet/src/controllers/postil.js) | P3 | 批注 |
| `@luckysheet/plugin-hyperlink` | [hyperlinkCtrl](file:///d:/gitee/Luckysheet/src/controllers/hyperlinkCtrl.js) | P3 | 超链接 |

### 5.2 ConditionalFormatPlugin 详细设计

作为首批迁移的插件，条件格式插件的详细结构如下：

```typescript
class ConditionalFormatPlugin implements IPlugin {
  name = '@luckysheet/plugin-condition-format'
  version = '1.0.0'
  dependencies = []

  private disposers: (() => void)[] = []

  install(context: IPluginContext): void {
    this.registerCommands(context)
    this.registerStrategies(context)
    this.registerRenderers(context)
    this.subscribeEvents(context)
  }

  destroy(): void {
    this.disposers.forEach((fn) => fn())
    this.disposers = []
  }

  private registerCommands(context: IPluginContext): void {
    context.registerCommand({
      id: 'condition-format.add-rule',
      name: '添加条件格式规则',
      execute: (rule: IConditionRule) => { /* 调用 ConditionFormatService */ },
      undo: () => { /* 撤销添加 */ },
    })

    context.registerCommand({
      id: 'condition-format.delete-rule',
      name: '删除条件格式规则',
      execute: (ruleId: string) => { /* 调用 ConditionFormatService */ },
      undo: () => { /* 撤销删除 */ },
    })

    context.registerCommand({
      id: 'condition-format.update-rule',
      name: '更新条件格式规则',
      execute: (ruleId: string, updates: Partial<IConditionRule>) => { /* ... */ },
      undo: () => { /* 撤销更新 */ },
    })

    context.registerCommand({
      id: 'condition-format.clear-rules',
      name: '清除所有条件格式规则',
      execute: (range?: CellRange) => { /* ... */ },
      undo: () => { /* 撤销清除 */ },
    })
  }

  private registerStrategies(context: IPluginContext): void {
    context.registerConditionFormat(new HighlightCellStrategy())
    context.registerConditionFormat(new TopRankStrategy())
    context.registerConditionFormat(new DuplicateValueStrategy())
    context.registerConditionFormat(new ColorScaleStrategy())
    context.registerConditionFormat(new DataBarStrategy())
    context.registerConditionFormat(new IconSetStrategy())
  }

  private registerRenderers(context: IPluginContext): void {
    context.registerRenderer(new ConditionFormatRenderer())
  }

  private subscribeEvents(context: IPluginContext): void {
    const eventBus = context.getEventBus()

    const unsub1 = eventBus.on('cell:value-changed', (payload) => {
      this.recomputeAffectedCells(context, payload)
    })

    const unsub2 = eventBus.on('render:before', (payload) => {
      this.prepareComputeResults(context, payload)
    })

    this.disposers.push(unsub1, unsub2)
  }

  private recomputeAffectedCells(
    context: IPluginContext,
    payload: { row: number; col: number }
  ): void {
    // 触发受影响单元格的条件格式重计算
  }

  private prepareComputeResults(
    context: IPluginContext,
    payload: { sheetId: string }
  ): void {
    // 渲染前准备条件格式计算结果
  }
}
```

### 5.3 AlternateFormatPlugin 设计概要

```typescript
class AlternateFormatPlugin implements IPlugin {
  name = '@luckysheet/plugin-alternate-format'
  version = '1.0.0'
  dependencies = ['@luckysheet/plugin-condition-format']

  install(context: IPluginContext): void {
    context.registerCommand({
      id: 'alternate-format.apply',
      name: '应用交替颜色',
      execute: (config: IAlternateFormatConfig) => { /* ... */ },
      undo: () => { /* ... */ },
    })

    context.registerRenderer(new AlternateFormatRenderer())
  }

  destroy(): void {
    // 清理资源
  }
}
```

---

## 6. 插件初始化流程

### 6.1 启动时序

```
1. 创建 EventBus 实例
2. 创建 Store 实例
3. 创建 PluginContext（注入 EventBus 和 Store）
4. 创建 PluginRegistry（注入 PluginContext）
5. 注册内置插件（按依赖顺序）
6. 安装内置插件（按依赖顺序）
7. 激活内置插件
8. 发出 'app:ready' 事件
```

### 6.2 初始化代码

```typescript
function initializePlugins(): PluginRegistry {
  const eventBus = new EventBus()
  const store = new Store()
  const context = new PluginContextImpl(eventBus, store)
  const registry = new PluginRegistry(context)

  const builtInPlugins: IPlugin[] = [
    new ConditionalFormatPlugin(),
    new AlternateFormatPlugin(),
    new FilterPlugin(),
  ]

  for (const plugin of builtInPlugins) {
    registry.register(plugin)
  }

  for (const plugin of builtInPlugins) {
    registry.install(plugin.name)
  }

  for (const plugin of builtInPlugins) {
    registry.activate(plugin.name)
  }

  eventBus.emit('app:ready')

  return registry
}
```

### 6.3 依赖安装顺序

插件安装必须遵循拓扑排序，确保依赖先于被依赖者安装：

```
@luckysheet/plugin-condition-format  ← 无依赖，最先安装
         │
         ▼
@luckysheet/plugin-alternate-format  ← 依赖条件格式
         │
         ▼
@luckysheet/plugin-filter            ← 依赖条件格式（筛选条件）
```

---

## 7. 插件与 DDD 分层映射

| DDD 层 | 插件系统角色 | 说明 |
|--------|-------------|------|
| 领域层 | 策略接口 + 值对象 | `IConditionStrategy`、`CellRange`、`ConditionRule` 等领域对象不依赖插件系统 |
| 应用层 | 插件本身 | 插件的 `install()` 方法编排领域对象，属于应用服务 |
| 基础设施层 | PluginContext 实现 | `Store`、`EventBus`、`CommandBus` 等基础设施由 PluginContext 暴露 |
| UI 层 | 插件注册的渲染器 | `ICellRenderer` 实现属于 UI 层，由插件注册到渲染管线 |

```
┌─────────────────────────────────────────────────────────┐
│                      UI 层                              │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  Dialog 组件     │  │  ICellRenderer 实现          │  │
│  └────────┬────────┘  └──────────────┬───────────────┘  │
└───────────┼──────────────────────────┼──────────────────┘
            │                          │
┌───────────┼──────────────────────────┼──────────────────┐
│           │       应用层（插件）       │                  │
│  ┌────────▼──────────────────────────▼───────────────┐  │
│  │              IPlugin.install(context)              │  │
│  │  registerCommand / registerConditionFormat / ...   │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────┐
│                 领域层                                  │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │  ConditionRule / CellRange / IConditionStrategy   │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼──────────────────────────────┐
│              基础设施层                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Store   │  │ EventBus │  │CommandBus│              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────────────────────────────────────────┘
```

---

## 8. 测试策略

### 8.1 插件系统单元测试

```typescript
describe('PluginRegistry', () => {
  let registry: PluginRegistry
  let context: IPluginContext

  beforeEach(() => {
    const eventBus = new EventBus()
    const store = new Store()
    context = new PluginContextImpl(eventBus, store)
    registry = new PluginRegistry(context)
  })

  it('should register and install a plugin', () => {
    const plugin: IPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      install: vi.fn(),
    }
    registry.register(plugin)
    registry.install('test-plugin')
    expect(plugin.install).toHaveBeenCalledWith(context)
    expect(registry.getPluginState('test-plugin')).toBe('installed')
  })

  it('should reject duplicate registration', () => {
    const plugin: IPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      install: vi.fn(),
    }
    registry.register(plugin)
    expect(() => registry.register(plugin)).toThrow('already registered')
  })

  it('should enforce dependency order', () => {
    const dep: IPlugin = { name: 'dep', version: '1.0.0', install: vi.fn() }
    const plugin: IPlugin = {
      name: 'plugin',
      version: '1.0.0',
      dependencies: ['dep'],
      install: vi.fn(),
    }
    registry.register(dep)
    registry.register(plugin)
    expect(() => registry.install('plugin')).toThrow('not installed')
    registry.install('dep')
    expect(() => registry.install('plugin')).not.toThrow()
  })

  it('should call destroy on plugin destruction', () => {
    const plugin: IPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      install: vi.fn(),
      destroy: vi.fn(),
    }
    registry.register(plugin)
    registry.install('test-plugin')
    registry.destroy('test-plugin')
    expect(plugin.destroy).toHaveBeenCalled()
  })
})
```

### 8.2 EventBus 单元测试

```typescript
describe('EventBus', () => {
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = new EventBus()
  })

  it('should emit events to subscribers', () => {
    const handler = vi.fn()
    eventBus.on('test-event', handler)
    eventBus.emit('test-event', { data: 42 })
    expect(handler).toHaveBeenCalledWith({ data: 42 })
  })

  it('should return unsubscribe function', () => {
    const handler = vi.fn()
    const unsub = eventBus.on('test-event', handler)
    unsub()
    eventBus.emit('test-event')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle once subscriptions', () => {
    const handler = vi.fn()
    eventBus.once('test-event', handler)
    eventBus.emit('test-event')
    eventBus.emit('test-event')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should isolate handler errors', () => {
    const errorHandler = vi.fn(() => { throw new Error('boom') })
    const normalHandler = vi.fn()
    eventBus.on('test-event', errorHandler)
    eventBus.on('test-event', normalHandler)
    eventBus.emit('test-event')
    expect(normalHandler).toHaveBeenCalled()
  })
})
```

---

## 9. 扩展性设计

### 9.1 第三方插件支持

插件系统设计为可扩展，未来支持第三方插件：

```typescript
interface IPluginHost {
  use(plugin: IPlugin): IPluginHost
  start(): void
}

class LuckysheetNext implements IPluginHost {
  private registry: PluginRegistry
  private plugins: IPlugin[] = []

  use(plugin: IPlugin): IPluginHost {
    this.plugins.push(plugin)
    return this
  }

  start(): void {
    for (const plugin of this.plugins) {
      this.registry.register(plugin)
    }
    for (const plugin of this.plugins) {
      this.registry.install(plugin.name)
    }
    for (const plugin of this.plugins) {
      this.registry.activate(plugin.name)
    }
  }
}
```

使用方式：

```typescript
const app = new LuckysheetNext()
  .use(new ConditionalFormatPlugin())
  .use(new AlternateFormatPlugin())
  .use(new CustomThirdPartyPlugin())

app.start()
```

### 9.2 插件沙箱（远期规划）

为第三方插件提供沙箱环境，限制其访问权限：

```typescript
interface IPluginSandbox {
  context: IPluginContext
  permissions: PluginPermission[]
}

type PluginPermission =
  | 'store:read'
  | 'store:write'
  | 'event:listen'
  | 'event:emit'
  | 'command:register'
  | 'render:register'
  | 'dom:access'
```

此功能为远期规划，当前阶段仅支持内置插件，不实现沙箱。
