# Luckysheet 大文件拆分执行计划

> 基于架构分析文档，对超过 1000 行的核心业务文件进行拆分。
> 拆分策略：在目标文件同级目录创建同名目录，将原文件按功能分类拆分到目录中，通过 `index.js` 统一导出，原文件保留为 1 行重导出入口。

---

## 已完成拆分

| 文件 | 原行数 | 拆分后目录 | 子文件数 | 最大子文件 | 状态 |
|------|--------|-----------|---------|-----------|------|
| `global/api.js` | 5,551 | `global/api/` | 16 | rangeRead.js (799) | ✅ 已完成 |
| `global/formula.js` | 5,398 | `global/formula/` | 18 | formulaExec.js (779) | ✅ 已完成 |
| `controllers/handler.js` | 4,979 | `controllers/handler/` | 17 | documentMousemove.js (1,431) | ✅ 已完成 |

---

## 待拆分文件清单

### P1 — 必须立即拆分

---

#### 1. `function/functionImplementation.js` — 21,987 行

- **导出方式**: `export default functionImplementation` (对象字面量)
- **核心问题**: 265 个 Excel 函数实现平铺在一个对象中，无任何分类注释或分组结构
- **函数分类**: 数学(53) / 统计(78) / 日期(26) / 文本(31) / 逻辑(18) / 查找引用(15) / 财务(45) / 信息(20) / 数据库(12) / 工程(23) / 数组矩阵(13) / 动态数组(5) / 条件汇总(2) / 中国特色(14) / 数据挖掘(3) / 扩展(5)
- **状态**: ✅ 已完成

**拆分方案**:

```
src/function/functionImplementation/          # 原 functionImplementation.js
├── index.js                                  # 聚合导出
├── math.js                                   # 数学与三角函数 (~45个)
├── statistical.js                            # 统计函数 (~70个)
├── date.js                                   # 日期与时间函数 (~22个)
├── text.js                                   # 文本函数 (~25个)
├── logical.js                                # 逻辑函数 (~14个)
├── lookup.js                                 # 查找与引用函数 (~12个)
├── financial.js                              # 财务函数 (~35个)
├── information.js                            # 信息函数 (~15个)
├── database.js                               # 数据库函数 (~12个)
├── engineering.js                            # 工程函数 (~20个)
├── arrayMatrix.js                            # 数组与矩阵函数 (~10个)
├── dynamicArray.js                           # 动态数组函数 (~5个)
├── conditionalAgg.js                         # 条件汇总函数 (~5个)
├── localeCn.js                               # 中国特色函数 (身份证/股票 ~13个)
├── dataMining.js                             # 数据挖掘函数 (~3个)
└── extension.js                              # 扩展函数 (AI/远程 ~4个)
```

---

#### 2. `function/functionListDescriptor.js` — 8,643 行

- **导出方式**: `export default` (对象)
- **核心问题**: 函数描述元数据全部平铺，与 functionImplementation.js 需同步拆分
- **状态**: ✅ 已完成

**拆分方案**: 与 functionImplementation.js 保持一致的分类拆分

```
src/function/functionListDescriptor/           # 原 functionListDescriptor.js
├── index.js                                  # 聚合导出
├── math.js
├── statistical.js
├── date.js
├── text.js
├── logical.js
├── lookup.js
├── financial.js
├── information.js
├── database.js
├── engineering.js
├── arrayMatrix.js
├── dynamicArray.js
├── conditionalAgg.js
├── localeCn.js
├── dataMining.js
└── extension.js
```

---

### P2 — 建议拆分

---

#### 3. `controllers/menuButton.js` — 4,690 行

- **导出方式**: `export default menuButton` (对象字面量)
- **核心问题**: `initialMenuButton` 单函数 3544 行，包含约 25 个独立 jQuery 事件处理器
- **函数分类**: UI模板(6属性) / 格式刷(3) / 工具栏事件初始化(25子区域) / 格式更新核心(3) / 工具栏状态同步(4) / 边框处理(3) / 合并单元格计算(5) / 尺寸文本测量(2) / 公式自动输入(7) / 样式获取(1) / 字体管理(2)
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/menuButton/                    # 原 menuButton.js
├── index.js                                  # 聚合导出，合并回 menuButton 对象
├── templates.js                              # HTML 模板字符串 (menu/item/split/color等)
├── formatUpdate.js                           # updateFormatCell / updateFormat / updateFormat_mc
├── formatStatus.js                           # checkstatus / changeMenuButtonDom / menuButtonFocus / inputMenuButtonFocus
├── borderUtils.js                            # getQKBorder / borderfix / setLineDash
├── mergeCalc.js                              # moveMergeData / getRangeInMerge / mergeborer / mergeMoveMain / mergeMove
├── formulaAutoInput.js                       # activeFormulaInput / backFormulaInput / checkNoNullValue / checkNoNullValueAll / getNoNullValue / singleFormulaInput / autoSelectionFormula
├── sizeUtils.js                              # getCellRealSize / getTextSize
├── styleRead.js                              # getStyleByCell
├── fontManage.js                             # addFontTolist / fontInitial / fontSelectList / defualtFont
├── paintFormat.js                            # cancelPaintModel / luckysheetPaintModelOn / luckysheetPaintSingle
├── toolbarInit.js                            # initialMenuButton (3544行巨型函数，后续可进一步拆分)
└── menuUtils.js                              # rightclickmenu / submenuhide / focus / createButtonMenu
```

---

#### 4. `controllers/conditionformat.js` — 3,483 行

- **导出方式**: `export default conditionformat` (对象字面量)
- **核心问题**: `init` 1294行(事件绑定) + `compute` 905行(计算引擎)，UI 与计算混杂
- **函数分类**: UI对话框(14函数,~2135行,55%) / 数据转换(2,38行) / 规则管理(6,237行) / 计算引擎(6,1353行,35%)
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/conditionformat/               # 原 conditionformat.js
├── index.js                                  # 聚合导出
├── dialog.js                                 # UI对话框: init/ruleTypeHtml/textCellColorHtml/singleRangeDialog/multiRangeDialog/conditionformatDialog/CFiconsDialog/administerRuleDialog/newConditionRuleDialog/editorConditionRuleDialog/infoDialog/getRuleExplain/colorSelectInit/daterangeInit
├── compute.js                                # 计算引擎: compute/getComputeMap/checksCF/getcolorGradation
├── ruleManager.js                            # 规则管理: getConditionRuleList/getConditionRuleName/updateItem/getHistoryRules/getCurrentRules/ref
├── rangeSplit.js                             # 范围拆分: CFSplitRange/getCFPartRange
├── utils.js                                  # 工具: getTxtByRange/getRangeByTxt
└── data.js                                   # 静态数据: fileClone/editorRule/selectRange/selectStatus/dataBarList/colorGradationList
```

---

#### 5. `controllers/dropCell.js` — 2,370 行

- **导出方式**: `export default luckysheetDropCell` (对象字面量)
- **核心问题**: `update` 408行 + `getDataByType` 826行，9个Fill函数有重复模式
- **函数分类**: UI交互(2) / 核心业务(3) / 索引辅助(2) / 策略分发(1) / 填充策略(9) / 中文数字(4) / 类型判断(4) / 数学工具(4) / 日期工具(1)
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/dropCell/                      # 原 dropCell.js
├── index.js                                  # 聚合导出
├── dropCellUI.js                             # createIcon/typeItemHide/iconHtml/typeListHtml
├── dropCellCore.js                           # update/getCopyData/getApplyData/getLenS/getDataIndex
├── fillStrategy.js                           # getDataByType + FillCopy/FillSeries/FillExtendNumber/FillOnlyFormat/FillWithoutFormat/FillDays/FillMonths/FillYears
├── fillChnStrategy.js                        # FillChnWeek/FillChnWeek2/FillChnWeek3/FillChnNumber
├── chnNumberUtils.js                         # ChineseToNumber/SectionToChinese/NumberToChinese/isChnNumber/chnNumChar/chnNameValue
├── typeDetector.js                           # isExtendNumber/isChnWeek1/isChnWeek2/isChnWeek3
└── mathUtils.js                              # isEqualDiff/isEqualRatio/getXArr/forecast/judgeDate
```

---

#### 6. `controllers/rowColumnOperation.js` — 2,122 行

- **导出方式**: 命名导出 `rowColumnOperationInitial` / `deleteRows` / `deleteColumns`
- **核心问题**: `rowColumnOperationInitial` 单函数 2351行，所有行列事件绑定在一个闭包内
- **函数分类**: 行头事件(4) / 列头事件(4) / 行高列宽调整(4) / 行列增删(7) / 行列隐藏(2) / 单元格操作(3) / 右键菜单(4)
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/rowColumnOperation/            # 原 rowColumnOperation.js
├── index.js                                  # 聚合导出
├── rowHeaderEvents.js                        # rowColumnOperationInitial (巨型事件绑定函数)
└── deleteRowCol.js                           # deleteRows / deleteColumns
```

---

#### 7. `global/extend.js` — 2,092 行

- **导出方式**: 命名导出 `luckysheetextendtable` / `luckysheetextendData` / `luckysheetdeletetable` / `luckysheetDeleteCell`
- **核心问题**: 4个函数内配置更新代码(merge/calcChain/filter/CF/AF/freezen/hyperlink/borderInfo)大量重复
- **状态**: ✅ 已完成

**拆分方案**:

```
src/global/extend/                             # 原 extend.js
├── index.js                                  # 聚合导出
├── extendTable.js                            # luckysheetextendtable (增加行/列)
├── extendData.js                             # luckysheetextendData (追加数据行)
├── deleteTable.js                            # luckysheetdeletetable (删除行/列)
└── deleteCell.js                             # luckysheetDeleteCell + getMoveRange (删除单元格左移/上移)
```

---

#### 8. `global/format.js` — 1,940 行

- **导出方式**: 命名导出 `datenum_local` / `genarate` / `update` / `is_date` / `valueShowEs`
- **核心问题**: SSF 闭包 1600行(第三方库) + 外部格式推断函数
- **状态**: ⏸️ 暂缓 (SSF闭包源自SheetJS/sscf库，保持内聚不宜拆分)

---

#### 9. `global/draw.js` — 1,802 行

- **导出方式**: 命名导出 `luckysheetDrawgridRowTitle` / `luckysheetDrawgridColumnTitle` / `luckysheetDrawMain` / `getCellOverflowMap` / `cellOverflow_colIn` / `cellOverflowRender` / `cellTextRender`
- **核心问题**: `luckysheetDrawMain` 701行，渲染与业务逻辑混合
- **状态**: ✅ 已完成

**拆分方案**:

```
src/global/draw/                               # 原 draw.js
├── index.js                                  # 聚合导出
├── drawTitle.js                              # luckysheetDrawgridRowTitle + luckysheetDrawgridColumnTitle
├── drawMain.js                               # luckysheetDrawMain (主绘制调度，含内部borderRender函数)
├── cellOverflow.js                           # getCellOverflowMap + cellOverflow_trace + cellOverflow_colIn
└── cellTextRender.js                         # cellTextRender
```

---

#### 10. `controllers/sheetMove.js` — 1,737 行

- **导出方式**: 命名导出 `luckysheetMoveEndCell` / `luckysheetMoveHighlightCell` / `luckysheetMoveHighlightCell2` / `luckysheetMoveHighlightRange` / `luckysheetMoveHighlightRange2`
- **核心问题**: 5个导出函数+5个辅助函数，命名极具误导性(实际是单元格导航而非Sheet移动)
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/sheetMove/                     # 原 sheetMove.js
├── index.js                                  # 聚合导出
├── cellMove.js                               # luckysheetMoveEndCell / luckysheetMoveHighlightCell / luckysheetMoveHighlightCell2
├── rangeMove.js                              # luckysheetMoveHighlightRange / luckysheetMoveHighlightRange2
├── mergeHelper.js                            # rowHasMerge / colHasMerge / getRowMerge / getColMerge
└── dataBoundary.js                           # getNextIndex
```

---

#### 11. `controllers/selection.js` — 1,696 行

- **导出方式**: `export default selection` (对象字面量)
- **核心问题**: 3个粘贴处理函数有大量重复的合并单元格/边框/条件格式处理逻辑
- **函数分类**: 剪贴板操作(3) / 粘贴处理(4) / 辅助工具(2)
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/selection/                     # 原 selection.js
├── index.js                                  # 聚合导出
├── clipboardCopy.js                          # copy / clearcopy / copybyformat / getHtmlBorderStyle
├── clipboardPaste.js                         # paste / pasteHandler / isPasteAction
├── clipboardCutPaste.js                      # pasteHandlerOfCutPaste
├── clipboardCopyPaste.js                     # pasteHandlerOfCopyPaste
├── clipboardPaintModel.js                    # pasteHandlerOfPaintModel
└── utils.js                                  # matchcopy
```

---

#### 12. `controllers/sheetmanage.js` — 1,652 行

- **导出方式**: `export default sheetmanage` (对象字面量，40+方法)
- **核心问题**: Sheet CRUD / 数据转换 / 参数恢复 / 协同缓存 混在一起
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/sheetmanage/                   # 原 sheetmanage.js
├── index.js                                  # 聚合导出
├── sheetCRUD.js                              # addNewSheet / copySheet / deleteSheet / createSheet / createSheetbydata / hasSheet
├── sheetSwitch.js                            # changeSheet / changeSheetExec / setCurSheet / getCurSheet / getCurSheetnoset
├── sheetDataUtils.js                         # getGridData / buildGridData / cutGridData / addGridData / getSheetData / getSheetConfig / getSheetMerge / getRangetxt
├── sheetParamRestore.js                      # sheetParamRestore / storeSheetParam / storeSheetParamALL / setSheetParam / restoreselect / restoreSheetAll / restoreFilter / restoreFreezen / restoreCache / showSheet
├── sheetInit.js                              # initialjfFile / loadOtherFile / checkLoadSheetIndex / mergeCalculation
├── sheetLayout.js                            # ordersheet / getCurrentOrder / reOrderAllSheet / locationSheet / sheetArrowShowAndHide / sheetBarShowAndHide
├── sheetCache.js                             # execCache / CacheNotLoadControll
├── sheetUtils.js                             # generateRandomSheetIndex / generateRandomSheetName / generateCopySheetName / getSheetByIndex / getSheetByName / getSheetIndex / getSheetName / getCustomSheet / setCustomSheet
├── sheetVisibility.js                        # setSheetHide / setSheetShow
└── sheetData.js                              # refreshAllPivotTable / refreshPivotTableByFile / restorePivot / sheetMaxIndex / nulldata / mergeCalculationSheet / checkLoadSheetIndexToDataIndex
```

---

#### 13. `function/func.js` — 1,649 行

- **导出方式**: 命名导出 `luckysheet_compareWith` / `luckysheet_getarraydata` / `luckysheet_getcelldata` / `luckysheet_parseData` / `luckysheet_getValue` / `luckysheet_indirect_check` / `luckysheet_indirect_check_return` / `luckysheet_offset_check` / `luckysheet_calcADPMM` / `luckysheet_getSpecialReference`
- **核心问题**: `luckysheet_compareWith` 单函数 1534行，按8种运算符分支有大量重复
- **状态**: ✅ 已完成

**拆分方案**:

```
src/function/func/                              # 原 func.js
├── index.js                                    # 聚合导出
├── compareWith.js                              # luckysheet_compareWith 主调度函数 + 参数预处理
├── compareHelpers.js                           # booleanOperation / booleanToNum (共享辅助函数)
├── opMultiply.js                               # * 乘法运算符分支 (~337行)
├── opDivide.js                                 # / 除法运算符分支 (~362行)
├── opAddSubMod.js                              # + - % 加减取余运算符分支 (~260行)
├── opComparison.js                             # == != >= <= > < 比较运算符分支 (~122行)
├── opConcat.js                                 # & 连接符分支 (~113行)
├── opPower.js                                  # ^ 幂运算符分支 (~213行)
├── getCellData.js                              # luckysheet_getcelldata
├── parseDataUtils.js                           # luckysheet_parseData / luckysheet_getValue
├── referenceUtils.js                           # luckysheet_indirect_check / indirect_check_return / offset_check / getSpecialReference
└── arrayCalcUtils.js                           # luckysheet_getarraydata / luckysheet_calcADPMM
```

---

#### 14. `controllers/filter.js` — 1,601 行

- **导出方式**: 命名导出 `labelFilterOptionState` / `orderbydatafiler` / `createFilter` / `createFilterOptions` / `initialFilterHandler`
- **核心问题**: `initialFilterHandler` 单函数 1510行，绑定所有筛选UI交互事件
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/filter/                         # 原 filter.js
├── index.js                                   # 聚合导出
├── filterState.js                             # 共享可变状态 (hidefilersubmenu/locale_filter/locale_button)
├── initialFilterHandler.js                    # 主调度函数 + locale 初始化
├── labelFilterOptionState.js                  # labelFilterOptionState (筛选图标状态管理)
├── orderbydatafiler.js                        # orderbydatafiler (筛选排序)
├── createFilter.js                            # createFilter (创建筛选)
├── createFilterOptions.js                     # createFilterOptions (创建筛选选项)
├── filterMenuEvents.js                        # 子菜单hover/菜单mouseover/条件切换事件
├── filterOptionClick.js                       # 筛选按钮点击事件
├── filterColorEvents.js                       # 按颜色筛选事件
├── filterCheckboxEvents.js                    # 复选框/日期/全选/清除/反选事件
└── filterActions.js                           # 清除筛选/搜索/取消/确认事件
```

---

#### 15. `controllers/freezen.js` — 1,549 行

- **导出方式**: `export default luckysheetFreezen` (对象字面量)
- **核心问题**: 5个 scrollAdapt 函数有重复的位置计算模式
- **函数分类**: 冻结操作核心(8) / 冻结配置转换(2) / Canvas渲染(3) / 滚动适配(6) / 辅助(1)
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/freezen/                       # 原 freezen.js
├── index.js                                  # 聚合导出
├── freezeCore.js                             # 创建/取消/保存/初始化冻结 + cutVolumn + 状态属性
├── freezeConfig.js                           # saveFrozen / frozenTofreezen配置转换
├── freezeCanvas.js                           # createAssistCanvas / createCanvas / removeAssistCanvas
├── scrollAdapt.js                            # 5个scrollAdapt函数
└── windowSize.js                             # windowHeight / windowWidth
```

---

### P3 — 可选拆分

---

#### 16. `global/getRowlen.js` — 1,427 行

- **导出方式**: 命名导出 `computeColWidthByContent` / `rowlenByRange` / `computeRowlenByContent` / `computeRowlenArr` / `getCellTextSplitArr` / `getMeasureText` / `getCellTextInfo`
- **核心问题**: `getCellTextInfo` 单函数 1286行(占74%)，含竖排/换行/普通/inlineString四大分支
- **状态**: ✅ 已完成

**拆分方案**:

```
src/global/getRowlen/                          # 原 getRowlen.js
├── index.js                                  # 聚合导出
├── rowlenUtils.js                            # rowlenByRange / computeRowlenByContent / computeCellWidth / computeColWidthByContent / computeRowlenArr
├── getCellTextSplitArr.js                    # getCellTextSplitArr
├── getMeasureText.js                         # getMeasureText
├── isSupportBoundingBox.js                   # isSupportBoundingBox
├── getCellTextInfo.js                        # getCellTextInfo (1287行主函数)
└── drawLineInfo.js                           # drawLineInfo (删除线/下划线坐标计算)
```

---

#### 17. `controllers/constant.js` — 1,354 行

- **导出方式**: 命名导出（22项）
- **核心问题**: HTML模板字符串(70%)+纯数据常量+配置函数全部混杂
- **函数分类**: HTML模板(gridHTML 272行/rightclickHTML 482行/sheetconfigHTML 106行/交替颜色101行/加载遮罩48行) / 数据常量(keycode/luckyColor/columeHeader_word/iconfontObjects/CFiconsImg) / 配置函数(右键配置/加载配置/默认字体)
- **状态**: ✅ 已完成

**拆分方案**:

```
src/controllers/constant/                      # 原 constant.js
├── index.js                                   # 聚合导出
├── gridTemplate.js                            # gridHTML (272行)
├── rightclickTemplate.js                      # rightclickHTML (482行)
├── sheetTemplate.js                           # sheetconfigHTML / filtermenuHTML / filtersubmenuHTML / luckysheetAlternateformatHtml
├── loadingTemplate.js                         # luckysheetToolHTML / menuToolBar / customLoadingConfig / luckysheetloadingImage / luckysheetlodingHTML
├── dataConstants.js                           # columeHeader_word / columeHeader_word_index / flow / colsmenuHTML / sheetHTML / columnHeaderHTML / sheetselectlistHTML / sheetselectlistitemHTML / inputHTML / modelHTML / maskHTML / luckyColor / keycode / luckysheetdefaultstyle / luckysheet_CFiconsImg / iconfontObjects
└── configFunctions.js                         # luckysheetdefaultFont / customCellRightClickConfig / customSheetRightClickConfig
```

---

#### 18. `controllers/moreFormat.js` — 1,181 行

- **导出方式**: `export default luckysheetMoreFormat` (对象字面量)
- **核心问题**: 数据与逻辑混杂，createDialog 内部重复定义了 moneyFmtList/numFmtList
- **函数分类**: 纯数据(moneyFmtList/dateFmtList/numFmtList, 784行) / 对话框创建(createDialog 350行) / 事件绑定(init 67行)
- **状态**: ✅ 已完成

---

#### 19. `controllers/alternateformat.js` — 1,089 行

- **导出方式**: 待分析
- **核心问题**: 与 conditionformat 重复模式
- **状态**: ✅ 已完成

---

#### 20. `controllers/matrixOperation.js` — 1,086 行

- **导出方式**: 命名导出 `initialMatrixOperation`（1项）
- **核心问题**: 典型"上帝函数"反模式，单函数 1250 行，含约 15 个 jQuery 事件处理器
- **函数分类**: 复制格式操作 / 矩阵翻转操作 / 矩阵计算操作 / 矩阵清理操作 / 公共验证逻辑
- **状态**: ✅ 已完成

---

#### 21. `global/refresh.js` — 1,029 行

- **导出方式**: 命名导出（8项）
- **核心问题**: 3个函数存在大量重复的undo/redo记录逻辑和公式链更新逻辑
- **状态**: ✅ 已完成

---

### P4 — 二次拆分（拆分产物仍超过 1000 行）

> 首轮拆分后，部分子文件仍然过大，需要进一步拆分。

#### 22. `functionImplementation/statistical.js` — 4,563 行

- **状态**: ✅ 已完成
- **建议**: 按子类别拆分为 `statisticalBasic.js`(COUNT/SUM/AVERAGE/MAX/MIN等基础统计) + `statisticalDistribution.js`(NORM_DIST/T_DIST/F_DIST等分布函数) + `statisticalRegression.js`(FORECAST/SLOPE/INTERCEPT/CORREL等回归函数) + `statisticalRanking.js`(RANK/PERCENTILE/QUARTILE等排名函数)

#### 23. `functionImplementation/financial.js` — 3,913 行

- **状态**: ✅ 已完成
- **建议**: 按子类别拆分为 `financialCashflow.js`(PMT/PV/FV/NPV/IRR等现金流) + `financialBond.js`(PRICE/YIELD/ACCRINT/COUP*等债券) + `financialDepreciation.js`(DB/DDB/SLN/SYD等折旧)

#### 24. `menuButton/toolbarInit.js` — 2,884 行

- **状态**: ⬜ 待二次拆分
- **建议**: 按工具栏功能区域拆分为 20 个独立 init* 函数（initPaintFormat/initNumberFormat/initFontFamily等）

#### 25. `functionImplementation/math.js` — 1,874 行

- **状态**: ✅ 已完成
- **建议**: 拆分为 `mathBasic.js`(SUM/ABS/INT/ROUND等基础数学) + `mathTrigonometric.js`(SIN/COS/TAN/ASIN等三角函数)

#### 26. `conditionformat/dialog.js` — 1,806 行

- **状态**: ⬜ 待二次拆分
- **建议**: 将 `init` 函数(1294行)内的事件绑定按功能拆分为独立注册函数

#### 27. `rowColumnOperation/rowHeaderEvents.js` — 1,777 行

- **状态**: ⬜ 待二次拆分
- **建议**: 将 `rowColumnOperationInitial` 函数内的事件绑定按行头/列头/右键菜单/行高列宽拆分

#### 28. `dropCell/core.js` — 1,530 行

- **状态**: ⬜ 待二次拆分
- **建议**: 将 `update`(408行)和`getDataByType`(826行)进一步拆分

#### 29. `handler/documentMousemove.js` — 1,431 行

- **状态**: ⬜ 待二次拆分
- **建议**: 按鼠标移动的不同场景(选区拖拽/列宽调整/行高调整/冻结条拖拽)拆分

#### 30. `functionListDescriptor/statistical.js` — 1,347 行

- **状态**: ✅ 已完成
- **建议**: 与 functionImplementation/statistical.js 同步拆分

#### 31. `functionImplementation/engineering.js` — 1,209 行

- **状态**: ✅ 已完成
- **建议**: 拆分为 `engineeringConversion.js`(进制转换) + `engineeringComplex.js`(复数运算)

#### 32. `functionListDescriptor/financial.js` — 1,207 行

- **状态**: ✅ 已完成
- **建议**: 与 functionImplementation/financial.js 同步拆分

#### 33. `functionImplementation/text.js` — 1,135 行

- **状态**: ✅ 已完成
- **建议**: 拆分为 `textBasic.js`(LEFT/RIGHT/MID/LEN等基础文本) + `textTransform.js`(UPPER/LOWER/PROPER/REPLACE等转换)

#### 34. `handler/cellEvents.js` — 1,116 行

- **状态**: ⬜ 待二次拆分
- **建议**: 按单元格事件类型(单击/双击/拖拽)拆分

#### 35. `functionImplementation/date.js` — 1,104 行

- **状态**: ✅ 已完成
- **建议**: 拆分为 `dateBasic.js`(DATE/DAY/MONTH/YEAR等基础日期) + `dateWorkday.js`(NETWORKDAYS/WORKDAY等工作日函数)

#### 36. `functionImplementation/lookup.js` — 1,024 行

- **状态**: ✅ 已完成
- **建议**: 拆分为 `lookupBasic.js`(VLOOKUP/HLOOKUP/LOOKUP) + `lookupReference.js`(INDEX/MATCH/OFFSET/INDIRECT)

#### 37. `conditionformat/compute.js` — 1,000 行

- **状态**: ⬜ 待二次拆分
- **建议**: 将 `compute` 函数按条件类型拆分为独立计算函数

---

### P5 — 新发现需拆分文件（原计划未覆盖）

#### 38. `utils/util.js` — 783 行

- **导出方式**: 命名导出（27项）
- **核心问题**: 典型"万能工具箱"反模式，31个函数间毫无关联
- **函数分类**: 类型判断(4) / 颜色转换(2) / 列号转换(4) / 数字格式(2) / DOM操作(6) / 脚本加载(4) / 响应式(3) / 字符串(4) / 数组(3)
- **状态**: ⬜ 待拆分

**拆分方案**:

```
src/utils/util/                                 # 原 util.js
├── index.js                                   # 聚合导出
├── typeUtils.js                               # isJsonString / getObjType
├── colorUtils.js                              # hexToRgb / rgbTohex
├── columnUtils.js                             # ABCatNum / chatatABC / ceateABC / createABCdim
├── numberUtils.js                             # numFormat / numfloatLen
├── domUtils.js                                # showrightclickmenu / mouseclickposition / $$ / luckysheetactiveCell / luckysheetContainerFocus / openSelfModel
├── scriptLoader.js                            # seriesLoadScripts / parallelLoadScripts / loadLink / loadLinks
├── reactiveUtils.js                           # createProxy / defineObjectReactive / defineBasicReactive
├── stringUtils.js                             # replaceHtml / getByteLen / transformRangeToAbsolute / camel2split / common_extend
└── arrayUtils.js                              # ArrayUnique / arrayRemoveItem / luckysheetfontformat / getNowDateTime
```

---

## 接近阈值需关注

| 文件 | 当前行数 | 说明 |
|------|---------|------|
| `controllers/imageCtrl.js` | 981 | 接近 1000 行阈值 |
| `global/border.js` | 909 | 接近 1000 行阈值 |
| `controllers/keyboard.js` | 866 | 接近 1000 行阈值 |
| `global/extend/extendTable.js` | 849 | 拆分产物，接近阈值 |
| `global/extend/deleteCell.js` | 828 | 拆分产物，接近阈值 |
| `controllers/freezen/scrollAdapt.js` | 823 | 拆分产物，接近阈值 |

---

## 拆分执行规范

1. **创建目录**: 在原文件同级创建同名目录
2. **拆分子文件**: 按上述方案将函数移入子文件，保留完整 JSDoc
3. **创建 index.js**: 聚合导出所有子模块
4. **原文件改重导出**: 原文件改为 `export * from './dirname/index.js'` 或 `export { default } from './dirname/index.js'`
5. **验证**: 确保项目可正常构建运行
6. **标记完成**: 在本文件中将对应项状态改为 ✅ 已完成

---

## 进度统计

| 优先级 | 总数 | 已完成 | 暂缓 | 待拆分 |
|--------|------|--------|------|--------|
| P0 (已完成) | 3 | 3 | 0 | 0 |
| P1 | 2 | 2 | 0 | 0 |
| P2 | 13 | 12 | 1 | 0 |
| P3 | 6 | 6 | 0 | 0 |
| P4 (二次拆分) | 16 | 8 | 0 | 8 |
| P5 (新发现) | 1 | 0 | 0 | 1 |
| **合计** | **41** | **23** | **1** | **17** |
