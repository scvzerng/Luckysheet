# 工作表管理模块（SheetManage）迁移文档

> 本文档为 Luckysheet 工作表管理模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

### 1.1 旧架构文件清单

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/sheetmanage/index.js` | 模块入口，合并10个子模块 |
| `src/controllers/sheetmanage/sheetCRUD.js` | 工作表增删复制 |
| `src/controllers/sheetmanage/sheetSwitch.js` | 工作表切换 |
| `src/controllers/sheetmanage/sheetData.js` | 工作表数据读写 |
| `src/controllers/sheetmanage/sheetDataUtils.js` | 工作表数据工具函数 |
| `src/controllers/sheetmanage/sheetInit.js` | 工作表初始化 |
| `src/controllers/sheetmanage/sheetLayout.js` | 工作表布局计算 |
| `src/controllers/sheetmanage/sheetCache.js` | 工作表缓存管理 |
| `src/controllers/sheetmanage/sheetUtils.js` | 工作表通用工具 |
| `src/controllers/sheetmanage/sheetVisibility.js` | 工作表显示/隐藏 |
| `src/controllers/sheetmanage/sheetParamRestore.js` | 工作表参数恢复 |
| `src/controllers/sheetBar.js` | 工作表标签栏事件 |
| `src/controllers/sheetSearch.js` | 工作表搜索 |
| `src/controllers/sheetmanage.js` | 旧入口代理 |

### 1.2 旧架构核心问题

1. **对象字面量混入**：10个子模块通过展开运算符合并
2. **jQuery重度依赖**：标签栏DOM操作、事件绑定、`$.extend`深拷贝
3. **全局Store直访**：直接读写 `Store.luckysheetfile`、`Store.flowdata`、`Store.config` 等
4. **初始化逻辑分散**：工作表初始化分布在多个文件中

---

## 2. 源文件逐一分析

### 2.1 sheetmanage/index.js

**功能描述**: 模块入口，合并10个子模块为统一的 `sheetmanage` 对象。

**导出**:
```js
export default sheetmanage;
```

**依赖**: sheetCRUD, sheetSwitch, sheetDataUtils, sheetParamRestore, sheetInit, sheetLayout, sheetCache, sheetUtils, sheetVisibility, sheetData

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `sheetmanage` (整个对象) | `SheetManageService` 单例实例 |

---

### 2.2 sheetmanage/sheetCRUD.js

**功能描述**: 工作表增删复制操作。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `createSheetbydata(data, isrenew)` | 根据数据创建工作表 |
| `deleteSheet(index)` | 删除工作表 |
| `copySheet(index)` | 复制工作表 |
| `hasSheet(index)` | 检查工作表是否存在 |

**依赖**: Store, getSheetIndex, luckysheetrefreshgrid

**jQuery使用**: `$.extend()` 深拷贝, `$("#...").hide()/show()` DOM操作

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `createSheetbydata(data, isrenew)` | `SheetCRUDService.create(data, isRenew): void` |
| `deleteSheet(index)` | `SheetCRUDService.delete(index): void` |
| `copySheet(index)` | `SheetCRUDService.copy(index): void` |
| `hasSheet(index)` | `SheetCRUDService.has(index): boolean` |

---

### 2.3 sheetmanage/sheetSwitch.js

**功能描述**: 工作表切换逻辑。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `changeSheetExec(index)` | 执行工作表切换 |
| `reSheetHide(index)` | 恢复工作表隐藏状态 |

**依赖**: Store, formula, luckysheetrefreshgrid

**jQuery使用**: `$.extend()` 深拷贝

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `changeSheetExec(index)` | `SheetSwitchService.switchTo(index): void` |

---

### 2.4 sheetmanage/sheetInit.js

**功能描述**: 工作表初始化。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `initialjfFile(menu, title)` | 初始化工作表文件 |
| `initialSheetData(index)` | 初始化指定工作表数据 |

**依赖**: Store, formula, getSheetIndex

**jQuery使用**: `$.post()` AJAX请求

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `initialjfFile(menu, title)` | `SheetInitService.initialize(menu, title): void` |
| `initialSheetData(index)` | `SheetInitService.initSheetData(index): void` |

---

### 2.5 sheetmanage/sheetData.js

**功能描述**: 工作表数据读写。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getGridData(data)` | 二维数组转为一维对象数组 |
| `buildGridData(file)` | 一维对象数组转为二维数组 |
| `getSheetData(index)` | 获取工作表数据 |

**依赖**: Store, getSheetIndex

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `getGridData(data)` | `SheetDataTransformer.gridToArray(data): GridItem[]` |
| `buildGridData(file)` | `SheetDataTransformer.arrayToGrid(items): CellValue[][]` |

---

### 2.6 sheetmanage/sheetLayout.js

**功能描述**: 工作表布局计算。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `computeRowColInfo(data)` | 计算行列信息 |
| `computeRowlenArr(data, config)` | 计算行高数组 |

**依赖**: Store, getRowlen

**jQuery使用**: 无

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `computeRowColInfo(data)` | `SheetLayoutService.computeRowColInfo(data): RowColInfo` |
| `computeRowlenArr(data, config)` | `SheetLayoutService.computeRowlenArr(data, config): number[]` |

---

### 2.7 controllers/sheetBar.js

**功能描述**: 工作表标签栏事件处理。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `initialSheetBar()` | 初始化工作表标签栏事件 |

**依赖**: sheetmanage, Store, locale

**jQuery使用**: 大量 `$(document).on()` 事件委托，`$(selector).click()` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `initialSheetBar()` | `SheetBarController.initialize(): void` |

---

### 2.8 controllers/sheetSearch.js

**功能描述**: 工作表搜索功能。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `initialSheetSearch()` | 初始化工作表搜索 |

**依赖**: Store, locale

**jQuery使用**: DOM操作和事件绑定

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `initialSheetSearch()` | `SheetSearchService.initialize(): void` |

---

## 3. 新架构对应位置

```
src/
  sheetmanage/
    SheetManageService.ts            # 主服务类
    SheetCRUDService.ts              # 工作表增删复制
    SheetSwitchService.ts            # 工作表切换
    SheetInitService.ts              # 工作表初始化
    SheetDataTransformer.ts          # 数据格式转换
    SheetLayoutService.ts            # 布局计算
    SheetCacheService.ts             # 缓存管理
    SheetVisibilityService.ts        # 显示/隐藏
    SheetBarController.ts            # 标签栏控制器
    SheetSearchService.ts            # 搜索服务
    types.ts                         # TypeScript接口定义
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `createSheetbydata(data, isrenew)` | `SheetCRUDService.create(data, isRenew): void` |
| `deleteSheet(index)` | `SheetCRUDService.delete(index): void` |
| `copySheet(index)` | `SheetCRUDService.copy(index): void` |
| `changeSheetExec(index)` | `SheetSwitchService.switchTo(index): void` |
| `initialjfFile(menu, title)` | `SheetInitService.initialize(menu, title): void` |
| `getGridData(data)` | `SheetDataTransformer.gridToArray(data): GridItem[]` |
| `buildGridData(file)` | `SheetDataTransformer.arrayToGrid(items): CellValue[][]` |
| `computeRowColInfo(data)` | `SheetLayoutService.computeRowColInfo(data): RowColInfo` |
| `initialSheetBar()` | `SheetBarController.initialize(): void` |
| `initialSheetSearch()` | `SheetSearchService.initialize(): void` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 创建工作表 | 有效数据 | luckysheetfile长度+1 |
| 删除工作表 | 有效index | luckysheetfile长度-1 |
| 复制工作表 | 有效index | 新工作表数据与源一致 |
| 切换工作表 | 有效index | currentSheetIndex变更 |
| 数据转换 | 二维数组 | 正确的一维对象数组 |
| 反向转换 | 一维对象数组 | 正确的二维数组 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `src/core.js` | `initialjfFile()` | 应用初始化 |
| `controllers/controlHistory.js` | `deleteSheet()`, `changeSheetExec()`, `createSheetbydata()` | 历史记录 |
| `controllers/handler/init.js` | 间接引用 | 初始化 |
| `controllers/sheetBar.js` | `changeSheetExec()` | 标签栏切换 |
| `global/api/sheet.js` | `getGridData()`, `buildGridData()` | 公开API |
