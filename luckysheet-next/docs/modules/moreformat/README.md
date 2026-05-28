# 更多格式模块（MoreFormat）迁移文档

> 本文档为 Luckysheet 更多格式模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/moreFormat/index.js` | 模块入口 |
| `src/controllers/moreFormat/numberFormat.js` | 数字格式化（千分位、百分比、小数位等） |
| `src/controllers/moreFormat/numberFormat.test.js` | 数字格式化单元测试 |
| `src/controllers/moreFormat/dateFormat.js` | 日期格式化 |
| `src/controllers/moreFormat/currencyFormat.js` | 货币格式化 |
| `src/controllers/moreFormat/customFormat.js` | 自定义格式 |
| `src/controllers/moreFormat/formatDetector.js` | 格式自动检测 |
| `src/controllers/moreFormat/formatParser.js` | 格式字符串解析 |

---

## 2. 源文件逐一分析

### 2.1 index.js

**导出**:
```js
export { initialMoreFormat } from './numberFormat';
export { formatDetector } from './formatDetector';
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `initialMoreFormat` | `MoreFormatService.initialize(): void` |
| `formatDetector` | `FormatDetector.detect(value): FormatType` |

---

### 2.2 numberFormat.js

**功能描述**: 数字格式化。支持千分位、百分比、科学计数法、小数位控制等。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `initialMoreFormat()` | 初始化更多格式事件 |
| `updateFormat(ct, value)` | 更新数字格式 |
| `numberFormat(value, format)` | 格式化数字 |

**依赖**: Store, menuButton

**jQuery使用**: `$(selector).on()` 事件绑定

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `numberFormat(value, format)` | `NumberFormatter.format(value, format): string` |
| `updateFormat(ct, value)` | `FormatService.applyNumberFormat(ct, value): void` |

---

### 2.3 dateFormat.js

**功能描述**: 日期格式化。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `dateFormat(value, format)` | 格式化日期 |

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `dateFormat(value, format)` | `DateFormatter.format(value, format): string` |

---

### 2.4 currencyFormat.js

**功能描述**: 货币格式化。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `currencyFormat(value, symbol, decimals)` | 格式化货币 |

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `currencyFormat(value, symbol, decimals)` | `CurrencyFormatter.format(value, symbol, decimals): string` |

---

### 2.5 formatDetector.js

**功能描述**: 格式自动检测。根据单元格值自动推断格式类型。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `formatDetector(value)` | 检测值的格式类型 |

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `formatDetector(value)` | `FormatDetector.detect(value): FormatType` |

---

## 3. 新架构对应位置

```
src/
  moreformat/
    MoreFormatService.ts               # 主服务类
    NumberFormatter.ts                 # 数字格式化
    DateFormatter.ts                   # 日期格式化
    CurrencyFormatter.ts               # 货币格式化
    CustomFormatter.ts                 # 自定义格式化
    FormatDetector.ts                  # 格式检测
    FormatParser.ts                    # 格式解析
    types.ts
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `numberFormat(value, format)` | `NumberFormatter.format(value, format): string` |
| `dateFormat(value, format)` | `DateFormatter.format(value, format): string` |
| `currencyFormat(value, symbol, decimals)` | `CurrencyFormatter.format(value, symbol, decimals): string` |
| `formatDetector(value)` | `FormatDetector.detect(value): FormatType` |
| `updateFormat(ct, value)` | `FormatService.applyNumberFormat(ct, value): void` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 千分位 | 1234567.89 | "1,234,567.89" |
| 百分比 | 0.1234 | "12.34%" |
| 科学计数 | 1234567 | "1.23E+06" |
| 日期 | 44927 | "2023-01-01" |
| 货币 | 1234.5, "¥" | "¥1,234.50" |
| 格式检测 | "2023-01-01" | FormatType.Date |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `controllers/menuButton/toolbarInit/initNumberFormat.js` | `updateFormat()` | 工具栏数字格式按钮 |
| `controllers/menuButton/toolbarInit/initMoreFormat.js` | `initialMoreFormat()` | 工具栏更多格式按钮 |
| `global/draw/cellRender.js` | `numberFormat()` | 渲染时格式化显示 |
