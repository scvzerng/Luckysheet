# 事件处理模块（Handler）迁移文档

> 本文档为 Luckysheet 事件处理模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

### 1.1 旧架构文件清单

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/handler/index.js` | 模块入口，调用14个初始化函数 |
| `src/controllers/handler/init.js` | 主初始化逻辑 |
| `src/controllers/handler/scroll.js` | 滚动事件处理 |
| `src/controllers/handler/cellEvents.js` | 单元格鼠标事件 |
| `src/controllers/handler/cellDragDrop.js` | 单元格拖拽 |
| `src/controllers/handler/documentMousemove.js` | 文档鼠标移动 |
| `src/controllers/handler/documentMouseup.js` | 文档鼠标释放 |
| `src/controllers/handler/contextMenu.js` | 右键菜单 |
| `src/controllers/handler/selectionDrag.js` | 选区拖拽 |
| `src/controllers/handler/bottomButtons.js` | 底部按钮事件 |
| `src/controllers/handler/rightClickButtons.js` | 右键菜单按钮 |
| `src/controllers/handler/freezeButtons.js` | 冻结按钮事件 |
| `src/controllers/handler/globalEvents.js` | 全局事件 |
| `src/controllers/handler/formulaBarResize.js` | 公式栏缩放 |
| `src/controllers/handler/pasteEvent.js` | 粘贴事件 |
| `src/controllers/handler/paginationAndToolbar.js` | 分页和工具栏 |
| `src/controllers/handler/cellEventsSub/handleCellDblclick.js` | 单元格双击 |
| `src/controllers/handler/cellEventsSub/handleCellMousedown.js` | 单元格鼠标按下 |
| `src/controllers/handler/cellEventsSub/handleCellMouseup.js` | 单元格鼠标释放 |
| `src/controllers/handler/documentMousemoveSub/mouseRender.js` | 鼠标渲染 |
| `src/controllers/handler/context.js` | 上下文管理 |
| `src/controllers/keyboard.js` | 键盘事件处理 |
| `src/controllers/listener.js` | 监听器（undo/redo状态同步） |
| `src/controllers/updateCell.js` | 单元格编辑更新 |

### 1.2 旧架构核心问题

1. **事件绑定分散**：14个独立初始化函数，事件绑定分散在各文件中
2. **jQuery重度依赖**：所有事件绑定使用 `$(document).on()`，DOM操作使用jQuery
3. **全局Store直访**：大量直接读写Store属性
4. **事件命名空间管理混乱**：使用字符串命名空间如 `"click.AFrangeInput"`
5. **_this传递模式**：多个子模块通过 `_this` 参数访问主对象

---

## 2. 源文件逐一分析

### 2.1 handler/index.js

**功能描述**: 模块入口，依次调用14个初始化函数。

**导出**:
```js
export default function luckysheetHandler() {
    init(); scroll(); cellEvents(); cellDragDrop();
    documentMousemove(); documentMouseup(); contextMenu();
    selectionDrag(); bottomButtons(); rightClickButtons();
    freezeButtons(); globalEvents(); formulaBarResize();
    pasteEvent(); paginationAndToolbar();
}
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `luckysheetHandler()` | `EventHandlerService.initialize(): void` |

---

### 2.2 handler/init.js

**功能描述**: 主初始化逻辑。设置Canvas、初始化各种事件监听。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `init()` | 主初始化函数 |

**依赖**: Store, formula, freezen, handler等

**jQuery使用**: `$("#...").bind()`, `$(document).on()` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `init()` | `EventHandlerService.initialize(): void` |

---

### 2.3 handler/cellEvents.js

**功能描述**: 单元格鼠标事件处理。分发到子模块处理双击、按下、释放事件。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `cellEvents()` | 初始化单元格事件 |

**依赖**: handleCellDblclick, handleCellMousedown, handleCellMouseup

**jQuery使用**: `$("#luckysheet-cell-main").on("mousedown")` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `cellEvents()` | `CellEventHandler.initialize(): void` |

---

### 2.4 handler/scroll.js

**功能描述**: 滚动事件处理。处理表格滚动时的Canvas重绘和冻结适配。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `scroll()` | 初始化滚动事件 |

**依赖**: Store, freezen, luckysheetrefreshgrid

**jQuery使用**: `$("#luckysheet-cell-main").on("scroll")` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `scroll()` | `ScrollEventHandler.initialize(): void` |

---

### 2.5 handler/contextMenu.js

**功能描述**: 右键菜单处理。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `contextMenu()` | 初始化右键菜单 |

**依赖**: Store, locale

**jQuery使用**: `$(document).on("contextmenu")` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `contextMenu()` | `ContextMenuHandler.initialize(): void` |

---

### 2.6 controllers/keyboard.js

**功能描述**: 键盘事件处理。处理方向键、Enter、Tab、Delete、Ctrl+Z/Y等键盘操作。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `keyboardInitial()` | 初始化键盘事件 |

**依赖**: menuButton, conditionformat, updateCell, selection, controlHistory, formula, Store

**jQuery使用**: `$(document).on("keydown")` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `keyboardInitial()` | `KeyboardHandler.initialize(): void` |

---

### 2.7 controllers/listener.js

**功能描述**: 监听器模块。监听Store中jfredo/jfundo数组变化，更新undo/redo按钮状态。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `initListener()` | 初始化监听器 |

**依赖**: Store, method, toJson

**jQuery使用**: `$('#luckysheet-icon-undo').addClass/removeClass('disabled')`

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `initListener()` | `StateListener.initialize(): void` |

---

### 2.8 controllers/updateCell.js

**功能描述**: 单元格编辑更新。处理单元格进入编辑模式、编辑器定位、内容更新等。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `luckysheetupdateCell(r, c, d, cover, isnotfocus)` | 进入单元格编辑模式 |
| `setCenterInputPosition(r, c)` | 设置编辑器居中位置 |

**依赖**: freezen, menuButton, conditionformat, alternateformat, formula, Store

**jQuery使用**: 大量 `$(selector).css()`, `$(selector).show()/hide()`, `$(window).height()` 等

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `luckysheetupdateCell(r, c, d, cover, isnotfocus)` | `CellEditor.enterEditMode(r, c, options): void` |
| `setCenterInputPosition(r, c)` | `CellEditor.setPosition(r, c): void` |

---

## 3. 新架构对应位置

```
src/
  handler/
    EventHandlerService.ts            # 主服务类（替代index.js）
    CellEventHandler.ts               # 单元格事件
    ScrollEventHandler.ts             # 滚动事件
    ContextMenuHandler.ts             # 右键菜单
    SelectionDragHandler.ts           # 选区拖拽
    KeyboardHandler.ts                # 键盘事件
    StateListener.ts                  # 状态监听
    CellEditor.ts                     # 单元格编辑器
    PasteEventHandler.ts              # 粘贴事件
    GlobalEventHandler.ts             # 全局事件
    FormulaBarResizeHandler.ts        # 公式栏缩放
    types.ts                          # TypeScript接口定义
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `luckysheetHandler()` | `EventHandlerService.initialize(): void` |
| `init()` | `EventHandlerService.initCore(): void` |
| `cellEvents()` | `CellEventHandler.initialize(): void` |
| `scroll()` | `ScrollEventHandler.initialize(): void` |
| `contextMenu()` | `ContextMenuHandler.initialize(): void` |
| `selectionDrag()` | `SelectionDragHandler.initialize(): void` |
| `keyboardInitial()` | `KeyboardHandler.initialize(): void` |
| `initListener()` | `StateListener.initialize(): void` |
| `luckysheetupdateCell(r, c, ...)` | `CellEditor.enterEditMode(r, c, options): void` |
| `setCenterInputPosition(r, c)` | `CellEditor.setPosition(r, c): void` |
| `pasteEvent()` | `PasteEventHandler.initialize(): void` |
| `globalEvents()` | `GlobalEventHandler.initialize(): void` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 单元格点击 | mousedown事件 | 选区更新，单元格高亮 |
| 单元格双击 | dblclick事件 | 进入编辑模式 |
| 方向键 | keydown ArrowDown | 选区下移一格 |
| Ctrl+Z | keydown Ctrl+Z | 执行undo |
| Ctrl+Y | keydown Ctrl+Y | 执行redo |
| 滚动 | scroll事件 | Canvas重绘 |
| 右键 | contextmenu事件 | 显示右键菜单 |
| Enter | keydown Enter | 确认编辑，选区下移 |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `src/core.js` | `luckysheetHandler()` | 应用初始化 |
| `controllers/sheetmanage/sheetInit.js` | `init()` | 工作表初始化后 |
| `controllers/menuButton/toolbarInit.js` | 间接引用 | 工具栏按钮事件 |
| `controllers/freezen/` | 间接引用 | 冻结相关事件 |
