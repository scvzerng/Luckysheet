# 矩阵操作模块（MatrixOperation）迁移文档

> 本文档为 Luckysheet 矩阵操作模块从旧架构迁移到新架构的完整指南。

---

## 1. 模块总览

| 文件路径 | 核心职责 |
|---------|---------|
| `src/controllers/matrixOperation/index.js` | 模块入口，导出初始化函数和验证函数 |
| `src/controllers/matrixOperation/copyFormatOperation.js` | 格式复制操作 |
| `src/controllers/matrixOperation/matrixFlipOperation.js` | 矩阵翻转操作（水平/垂直） |
| `src/controllers/matrixOperation/matrixCalcOperation.js` | 矩阵计算操作（转置、逆矩阵等） |
| `src/controllers/matrixOperation/matrixCalcOperation.test.js` | 矩阵计算单元测试 |
| `src/controllers/matrixOperation/matrixCleanOperation.js` | 矩阵清空操作 |
| `src/controllers/matrixOperation/matrixValidation.js` | 矩阵验证（多选区检查、合并检查） |
| `src/controllers/matrixOperation/matrixValidation.test.js` | 矩阵验证单元测试 |

---

## 2. 源文件逐一分析

### 2.1 index.js

**导出**:
```js
export { initialMatrixOperation };
export { checkMultiSelection, checkPartMerge } from './matrixValidation';
export { jfnqrt } from './matrixCalcOperation';
```

**迁移映射表**:

| 旧导出 | 新架构 |
|--------|--------|
| `initialMatrixOperation` | `MatrixOperationService.initialize(): void` |
| `checkMultiSelection` | `MatrixValidator.checkMultiSelection(): boolean` |
| `checkPartMerge` | `MatrixValidator.checkPartialMerge(): boolean` |
| `jfnqrt` | `MatrixCalculator.jfnqrt(...): number[][]` |

---

### 2.2 matrixFlipOperation.js

**功能描述**: 矩阵翻转操作。支持水平翻转和垂直翻转。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `initialMatrixFlipOperation()` | 初始化翻转操作事件 |
| `matrixFlipHorizontal(data)` | 水平翻转矩阵 |
| `matrixFlipVertical(data)` | 垂直翻转矩阵 |

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `matrixFlipHorizontal(data)` | `MatrixFlipper.flipHorizontal(data): CellValue[][]` |
| `matrixFlipVertical(data)` | `MatrixFlipper.flipVertical(data): CellValue[][]` |

---

### 2.3 matrixCalcOperation.js

**功能描述**: 矩阵计算操作。包括转置、逆矩阵、行列式等。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `initialMatrixCalcOperation()` | 初始化计算操作事件 |
| `matrixTranspose(data)` | 矩阵转置 |
| `matrixInverse(data)` | 矩阵求逆 |
| `jfnqrt(data)` | QR分解 |

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `matrixTranspose(data)` | `MatrixCalculator.transpose(data): CellValue[][]` |
| `matrixInverse(data)` | `MatrixCalculator.inverse(data): CellValue[][]` |
| `jfnqrt(data)` | `MatrixCalculator.qrDecompose(data): QRResult` |

---

### 2.4 matrixValidation.js

**功能描述**: 矩阵验证。检查选区是否满足矩阵操作的前提条件。

**导出函数列表**:

| 函数签名 | 功能 |
|---------|------|
| `checkMultiSelection(range)` | 检查是否为多选区 |
| `checkPartMerge(range)` | 检查是否有部分合并 |

**迁移映射表**:

| 旧函数 | 新类.方法 |
|--------|----------|
| `checkMultiSelection(range)` | `MatrixValidator.checkMultiSelection(range): boolean` |
| `checkPartMerge(range)` | `MatrixValidator.checkPartialMerge(range): boolean` |

---

## 3. 新架构对应位置

```
src/
  matrixoperation/
    MatrixOperationService.ts          # 主服务类
    MatrixFlipper.ts                   # 翻转操作
    MatrixCalculator.ts                # 计算操作
    MatrixCleaner.ts                   # 清空操作
    CopyFormatOperation.ts             # 格式复制
    MatrixValidator.ts                 # 验证
    types.ts
```

---

## 4. 迁移映射表

| 旧函数 | 新类.方法 |
|--------|----------|
| `initialMatrixOperation()` | `MatrixOperationService.initialize(): void` |
| `matrixFlipHorizontal(data)` | `MatrixFlipper.flipHorizontal(data): CellValue[][]` |
| `matrixFlipVertical(data)` | `MatrixFlipper.flipVertical(data): CellValue[][]` |
| `matrixTranspose(data)` | `MatrixCalculator.transpose(data): CellValue[][]` |
| `matrixInverse(data)` | `MatrixCalculator.inverse(data): CellValue[][]` |
| `jfnqrt(data)` | `MatrixCalculator.qrDecompose(data): QRResult` |
| `checkMultiSelection(range)` | `MatrixValidator.checkMultiSelection(range): boolean` |
| `checkPartMerge(range)` | `MatrixValidator.checkPartialMerge(range): boolean` |

---

## 5. 测试用例

| 功能点 | 输入 | 预期输出 |
|--------|------|---------|
| 水平翻转 | [[1,2],[3,4]] | [[2,1],[4,3]] |
| 垂直翻转 | [[1,2],[3,4]] | [[3,4],[1,2]] |
| 转置 | [[1,2],[3,4]] | [[1,3],[2,4]] |
| 逆矩阵 | [[1,0],[0,1]] | [[1,0],[0,1]] |
| 多选区检查 | 2个选区 | 返回true |
| 部分合并检查 | 有部分合并 | 返回true |

---

## 6. 外部依赖方

| 外部模块 | 引用的API | 使用场景 |
|---------|----------|---------|
| `src/core.js` | `initialMatrixOperation()` | 应用初始化 |
| `controllers/handler/rightClickButtons.js` | 各矩阵操作 | 右键菜单 |
