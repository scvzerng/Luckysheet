# Luckysheet DDD 重构工程 - 文档索引

本索引涵盖 Luckysheet DDD（领域驱动设计）重构工程的全部文档。重构目标是将现有基于全局对象和 jQuery 的单体架构，迁移为基于限界上下文、分层架构、插件化体系的现代化 TypeScript 工程。

---

## 一、架构设计

架构层面的核心设计文档，定义限界上下文、分层架构、依赖规则与技术选型。

| 文档 | 说明 |
|------|------|
| [01-总体架构设计](architecture/01-overall-architecture.md) | 限界上下文划分、分层架构、依赖规则、插件化架构、目录结构设计 |
| [02-技术选型与规范](architecture/02-tech-stack.md) | TypeScript strict 模式、Vite 构建、CSS 方案、颜色选择器替代、测试框架、无 jQuery 策略 |

---

## 二、领域模型

领域驱动设计核心产出物，定义统一语言、聚合、领域事件与领域服务。

| 文档 | 说明 |
|------|------|
| [01-统一语言](domain/01-ubiquitous-language.md) | 领域词汇表，统一团队对核心概念的理解 |
| [02-聚合与实体设计](domain/02-aggregates.md) | 聚合根、实体、值对象的识别与设计 |
| [03-领域事件](domain/03-domain-events.md) | 领域事件定义、发布/订阅机制与事件流转 |
| [04-领域服务](domain/04-domain-services.md) | 计算引擎、公式引擎等跨聚合领域服务 |

---

## 三、模块迁移清单

每个模块包含：源文件清单、功能点列表、新旧代码迁移映射、测试用例。

| 模块 | 文档 | 核心关注点 |
|------|------|-----------|
| 条件格式 | [conditionformat/README.md](modules/conditionformat/README.md) | 规则管理、计算引擎、对话框、颜色渐变/数据条/图标集 |
| 交替格式 | [alternateformat/README.md](modules/alternateformat/README.md) | 预设样式、规则管理、对话框 |
| 公式引擎 | [formula/README.md](modules/formula/README.md) | 解析器、执行引擎、函数库、依赖链、循环引用检测 |
| 选区与剪贴板 | [selection/README.md](modules/selection/README.md) | 选区状态、复制/剪切/粘贴、HTML 生成、拖拽填充 |
| Sheet 管理 | [sheetmanage/README.md](modules/sheetmanage/README.md) | Sheet CRUD、缓存、初始化、切换、可见性 |
| 事件处理 | [handler/README.md](modules/handler/README.md) | 鼠标/键盘事件、上下文菜单、滚动、拖拽 |
| 筛选 | [filter/README.md](modules/filter/README.md) | 筛选创建、筛选菜单、排序、状态管理 |
| 冻结 | [freezen/README.md](modules/freezen/README.md) | 冻结配置、Canvas 适配、滚动联动 |
| 渲染引擎 | [rendering/README.md](modules/rendering/README.md) | Canvas 绘制管线、单元格渲染、行列标题、溢出处理 |
| 菜单工具栏 | [menubutton/README.md](modules/menubutton/README.md) | 工具栏初始化、格式状态、合并计算、画笔格式 |
| 拖拽填充 | [dropcell/README.md](modules/dropcell/README.md) | 填充策略、类型检测、中文数字、数学工具 |
| 矩阵操作 | [matrixoperation/README.md](modules/matrixoperation/README.md) | 翻转、清空、计算、格式复制、校验 |
| 行列操作 | [rowcolumnoperation/README.md](modules/rowcolumnoperation/README.md) | 行列增删、隐藏/显示、宽度调整、右键菜单 |
| 更多格式 | [moreformat/README.md](modules/moreformat/README.md) | 格式数据、格式对话框 |
| 撤销重做 | [undo/README.md](modules/undo/README.md) | 操作栈、历史记录、重做逻辑 |
| Store 重构 | [store/README.md](modules/store/README.md) | Store 拆分、响应式、状态访问层 |
| API 层 | [api/README.md](modules/api/README.md) | 公共 API 接口、数据转换、工作簿操作 |

---

## 四、基础设施

构建配置、插件系统等基础设施设计。

| 文档 | 说明 |
|------|------|
| [01-构建配置](infrastructure/01-build-config.md) | Vite 配置、TypeScript 配置、测试配置、开发脚本 |
| [02-插件系统设计](infrastructure/02-plugin-system.md) | 插件化架构设计、插件注册机制、生命周期钩子 |

---

## 五、jQuery 迁移

jQuery 依赖的全面分析与替代方案。

| 文档 | 说明 |
|------|------|
| [01-jQuery 依赖全量分析](jquery-migration/01-jquery-usage-analysis.md) | 逐文件统计 jQuery 用法：选择器、DOM 操作、事件绑定、AJAX、动画 |
| [02-DOM 操作替代方案](jquery-migration/02-dom-replacement.md) | 原生 DOM API 替代方案、封装薄层设计 |
| [03-颜色选择器替代](jquery-migration/03-color-picker.md) | spectrum-colorpicker（jQuery 依赖）替代方案 |
| [04-jQuery UI 替代](jquery-migration/04-jquery-ui-replacement.md) | 对话框、拖拽、排序等 jQuery UI 组件替代 |
| [05-jQuery 对象特殊性](jquery-migration/05-jquery-object-quirks.md) | jQuery 包装对象 vs 原生 DOM、隐式迭代、链式调用等差异 |

---

## 六、迁移策略

整体迁移路线图与兼容性保障策略。

| 文档 | 说明 |
|------|------|
| [01-迁移路线图](migration/01-roadmap.md) | 分阶段迁移计划、优先级排序、里程碑定义 |
| [02-兼容性保障](migration/02-compatibility.md) | 新旧代码共存策略、API 兼容层、渐进式迁移 |

---

## 文档约定

- 所有文档使用中文编写
- 代码示例使用 TypeScript
- 文件路径基于 `luckysheet-next/src/` 目录
- 旧代码路径基于 `src/` 目录（当前仓库根目录下的 src）
- 每个模块迁移清单遵循统一模板：源文件清单 → 功能点 → 迁移映射 → 测试用例
