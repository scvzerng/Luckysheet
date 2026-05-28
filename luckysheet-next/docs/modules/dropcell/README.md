# 拖拽填充模块（DropCell）迁移文档

> 本文档为 Luckysheet 拖拽填充模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/dropCell/index.js` | 模块入口，合并6个子模块 |
| `src/controllers/dropCell/ui.js` | 拖拽UI交互（拖拽手柄、鼠标事件） |
| `src/controllers/dropCell/core.js` | 拖拽核心逻辑（分发到9种填充策略） |
| `src/controllers/dropCell/core/index.js` | 核心子模块入口 |
| `src/controllers/dropCell/core/coreSub/getDataByType0-8.js` | 9种数据类型的填充策略 |
| `src/controllers/dropCell/fillStrategy.js` | 填充策略管理 |
| `src/controllers/dropCell/chnNumber.js` | 中文数字识别与处理 |
| `src/controllers/dropCell/typeDetector.js` | 数据类型检测 |
| `src/controllers/dropCell/mathUtils.js` | 数学工具（等差数列计算等） |

---

## 2. 源文件逐一分析

### 2.1 dropCell/index.js

**导出**:
```js
const luckysheetDropCell = {
    ...uiModule, ...coreModule, ...fillStrategyModule,
    ...chnNumberModule, ...typeDetectorModule, ...mathUtilsModule,
};
export default luckysheetDropCell;
```

**迁移映射表**: `luckysheetDropCell` → `DropCellService`

---

### 2.2 dropCell/ui.js

**功能描述**: 拖拽UI交互。管理拖拽手柄的显示、鼠标事件处理。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `dropCellMousedown(event)` | 拖拽手柄鼠标按下 |
| `dropCellMousemove(event)` | 拖拽过程鼠标移动 |
| `dropCellMouseup(event)` | 拖拽释放 |

**jQuery使用**: `$(selector).css()`, `$(selector).show()/hide()`

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `dropCellMousedown(event)` | `DropCellUI.onMouseDown(event): void` |
| `dropCellMousemove(event)` | `DropCellUI.onMouseMove(event): void` |
| `dropCellMouseup(event)` | `DropCellUI.onMouseUp(event): void` |

---

### 2.3 dropCell/core.js + coreSub/

**功能描述**: 拖拽核心逻辑。根据数据类型分发到9种填充策略。

**9种填充类型**:

| Type | 文件 | 填充策略 |
|------|------|---------|
| 0 | getDataByType0.js | 仅复制 |
| 1 | getDataByType1.js | 数值序列填充 |
| 2 | getDataByType2.js | 仅填充格式 |
| 3 | getDataByType3.js | 不带格式填充 |
| 4 | getDataByType4.js | 日期天数填充 |
| 5 | getDataByType5.js | 日期工作日填充 |
| 6 | getDataByType6.js | 日期月份填充 |
| 7 | getDataByType7.js | 日期年份填充 |
| 8 | getDataByType8.js | 等比数列填充 |

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `getDataByType0(data, ...)` | `CopyFillStrategy.fill(data, ...): FillResult` |
| `getDataByType1(data, ...)` | `NumericSeriesStrategy.fill(data, ...): FillResult` |
| `getDataByType2(data, ...)` | `FormatOnlyStrategy.fill(data, ...): FillResult` |
| `getDataByType3(data, ...)` | `NoFormatFillStrategy.fill(data, ...): FillResult` |
| `getDataByType4(data, ...)` | `DateDayStrategy.fill(data, ...): FillResult` |
| `getDataByType5(data, ...)` | `DateWorkdayStrategy.fill(data, ...): FillResult` |
| `getDataByType6(data, ...)` | `DateMonthStrategy.fill(data, ...): FillResult` |
| `getDataByType7(data, ...)` | `DateYearStrategy.fill(data, ...): FillResult` |
| `getDataByType8(data, ...)` | `GeometricSeriesStrategy.fill(data, ...): FillResult` |

---

### 2.4 dropCell/typeDetector.js

**功能描述**: 数据类型检测。识别单元格数据的类型（数值、日期、中文数字等）。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getCellType(cell)` | 检测单元格数据类型 |

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `getCellType(cell)` | `TypeDetector.detect(cell): CellDataType` |

---

### 2.5 dropCell/mathUtils.js

**功能描述**: 数学工具。等差数列、等比数列计算。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `getArithmeticSequence(start, diff, count)` | 计算等差数列 |
| `getGeometricSequence(start, ratio, count)` | 计算等比数列 |

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `getArithmeticSequence(...)` | `MathUtils.arithmeticSequence(...): number[]` |
| `getGeometricSequence(...)` | `MathUtils.geometricSequence(...): number[]` |

---

## 3. 新架构对应位置

```
src/
  dropcell/
    DropCellService.ts                 # 主服务类
    DropCellUI.ts                      # UI交互
    TypeDetector.ts                    # 数据类型检测
    MathUtils.ts                       # 数学工具
    ChnNumberUtils.ts                  # 中文数字工具
    strategies/
      IFillStrategy.ts                 # 填充策略接口
      CopyFillStrategy.ts              # 仅复制
      NumericSeriesStrategy.ts         # 数值序列
      FormatOnlyStrategy.ts            # 仅格式
      NoFormatFillStrategy.ts          # 无格式填充
      DateDayStrategy.ts               # 日期天
      DateWorkdayStrategy.ts           # 工作日
      DateMonthStrategy.ts             # 日期月
      DateYearStrategy.ts              # 日期年
      GeometricSeriesStrategy.ts       # 等比数列
    types.ts
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `dropCellMousedown(event)` | `DropCellUI.onMouseDown(event): void` |
| `dropCellMousemove(event)` | `DropCellUI.onMouseMove(event): void` |
| `dropCellMouseup(event)` | `DropCellUI.onMouseUp(event): void` |
| `getCellType(cell)` | `TypeDetector.detect(cell): CellDataType` |
| `getArithmeticSequence(...)` | `MathUtils.arithmeticSequence(...): number[]` |
| 各getDataByType函数 | 各Strategy类 `.fill(...): FillResult` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 复制填充 | [1,2,3] 向下拖 | [1,2,3,1,2,3] |
| 数值序列 | [1,2] 向下拖 | [1,2,3,4] |
| 仅格式 | 有格式数据向下拖 | 目标仅有格式无值 |
| 日期天数 | [2023-01-01] 向下拖 | [01-02, 01-03] |
| 等比数列 | [2,4] 向下拖 | [2,4,8,16] |
| 中文数字 | [一,二] 向下拖 | [一,二,三,四] |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `controllers/handler/cellEvents.js` | `dropCellMousedown()` | 单元格拖拽手柄事件 |
| `controllers/handler/documentMousemove.js` | `dropCellMousemove()` | 拖拽过程 |
| `controllers/handler/documentMouseup.js` | `dropCellMouseup()` | 拖拽释放 |
