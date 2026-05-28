# 筛选模块（Filter）迁移文档

> 本文档为 Luckysheet 筛选模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

### 1.1 旧架构文件清单

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/filter/index.js` | 模块入口，重新导出5个函数 |
| `src/controllers/filter/createFilter.js` | 创建筛选UI（筛选图标和下拉按钮） |
| `src/controllers/filter/createFilterOptions.js` | 创建筛选选项面板 |
| `src/controllers/filter/filterActions.js` | 筛选操作（应用/清除筛选） |
| `src/controllers/filter/filterCheckboxEvents.js` | 筛选复选框事件 |
| `src/controllers/filter/filterColorEvents.js` | 筛选颜色事件 |
| `src/controllers/filter/filterMenuEvents.js` | 筛选菜单事件 |
| `src/controllers/filter/filterOptionClick.js` | 筛选选项点击事件 |
| `src/controllers/filter/filterState.js` | 筛选状态管理 |
| `src/controllers/filter/filterState.test.js` | 筛选状态单元测试 |
| `src/controllers/filter/initialFilterHandler.js` | 筛选初始化处理 |
| `src/controllers/filter/labelFilterOptionState.js` | 标签筛选选项状态 |
| `src/controllers/filter/labelFilterOptionState.test.js` | 标签筛选选项状态单元测试 |
| `src/controllers/filter/orderbydatafiler.js` | 排序筛选 |

### 1.2 旧架构核心问题

1. **jQuery重度依赖**：筛选UI、菜单、事件全部使用jQuery
2. **全局Store直访**：直接读写 `Store.luckysheet_filter_save`、`Store.config.rowhidden`
3. **状态分散**：筛选状态分布在Store、DOM data属性和模块变量中
4. **事件委托复杂**：大量 `$(document).off().on()` 命名空间事件

---

## 2. 源文件逐一分析

### 2.1 filter/index.js

**导出**:
```js
export { labelFilterOptionState } from './labelFilterOptionState';
export { orderbydatafiler } from './orderbydatafiler';
export { createFilter } from './createFilter';
export { createFilterOptions } from './createFilterOptions';
export { initialFilterHandler } from './initialFilterHandler';
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `createFilter` | `FilterService.createFilter(): void` |
| `createFilterOptions` | `FilterService.createFilterOptions(save): void` |
| `initialFilterHandler` | `FilterService.initialize(): void` |
| `labelFilterOptionState` | `FilterStateService.applyLabelOption(...): void` |
| `orderbydatafiler` | `FilterSortService.orderByData(...): void` |

---

### 2.2 filter/createFilter.js

**功能描述**: 创建筛选UI。在表头生成筛选图标和下拉按钮。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `createFilter()` | 创建筛选UI |

**依赖**: Store, locale, filterState

**jQuery使用**: `$("body").append()`, `$(selector).css()`, `$(selector).data()` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `createFilter()` | `FilterService.createFilter(): void` |

---

### 2.3 filter/filterState.js

**功能描述**: 筛选状态管理。维护筛选的行隐藏状态和计算结果。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `createFilterState(options)` | 创建筛选状态 |
| `getFilterState()` | 获取当前筛选状态 |

**依赖**: Store

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `createFilterState(options)` | `FilterStateService.create(options): FilterState` |
| `getFilterState()` | `FilterStateService.getCurrent(): FilterState` |

---

### 2.4 filter/initialFilterHandler.js

**功能描述**: 筛选初始化处理。在工作表加载时恢复筛选状态。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `initialFilterHandler()` | 初始化筛选 |

**依赖**: Store, createFilter, createFilterOptions

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `initialFilterHandler()` | `FilterService.initialize(): void` |

---

## 3. 新架构对应位置

```
src/
  filter/
    FilterService.ts                  # 主服务类
    FilterStateService.ts             # 筛选状态管理
    FilterSortService.ts              # 筛选排序
    FilterUIBuilder.ts                # 筛选UI构建
    FilterMenuController.ts           # 筛选菜单控制器
    types.ts                          # TypeScript接口定义
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `createFilter()` | `FilterService.createFilter(): void` |
| `createFilterOptions(save)` | `FilterService.createFilterOptions(save): void` |
| `initialFilterHandler()` | `FilterService.initialize(): void` |
| `createFilterState(options)` | `FilterStateService.create(options): FilterState` |
| `getFilterState()` | `FilterStateService.getCurrent(): FilterState` |
| `labelFilterOptionState(...)` | `FilterStateService.applyLabelOption(...): void` |
| `orderbydatafiler(...)` | `FilterSortService.orderByData(...): void` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 创建筛选 | 有效选区 | 筛选图标出现在表头 |
| 应用筛选 | 选择筛选条件 | 不符合条件的行被隐藏 |
| 清除筛选 | 点击清除 | 所有行恢复显示 |
| 排序筛选 | 升序排序 | 数据按升序排列 |
| 恢复筛选 | 切换工作表 | 筛选状态被恢复 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `src/core.js` | `initialFilterHandler()` | 应用初始化 |
| `controllers/controlHistory.js` | `createFilterOptions()`, `labelFilterOptionState()` | 历史记录 |
| `controllers/menuButton/toolbarInit/initAutofilter.js` | `createFilter()` | 工具栏筛选按钮 |
| `controllers/handler/rightClickButtons.js` | 间接引用 | 右键菜单筛选 |
