import alternateformat from '../../alternateformat';
import conditionformat from '../../conditionformat';
import luckysheetFreezen from '../../freezen';
import hyperlinkCtrl from '../../hyperlinkCtrl';
import ifFormulaGenerator from '../../ifFormulaGenerator';
import imageCtrl from '../../imageCtrl';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';
import menuButton from '../../menuButton';
import luckysheetPostil from '../../postil';
import sheetmanage from '../../sheetmanage';
import { mouseposition, rowLocation, colLocation } from '../../../global/location';
import Store from '../../../store';
import { getLastSelection, setLastSelection } from '../../../utils/storeAccess.js';
import method from '../../../global/method';
import formula from '../../../global/formula';
import luckysheetformula from '../../../global/formula';
import { luckysheet_count_show, selectionCopyShow, selectHightlightShow } from '../../select';
import { getRangetxt } from '../../../methods/get';
import { isEditMode } from '../../../global/validate';
import { luckysheetactiveCell, luckysheetContainerFocus, getObjType } from '../../../utils/util';
import browser from '../../../global/browser';
import { getScrollPosition } from '../../../utils/domUtils.js';
import scrollBarX from '../../../ui/scrollBarX.js';
import scrollBarY from '../../../ui/scrollBarY.js';
import formulaDialogs from '../../../ui/formulaDialogs.js';
import cellMain from '../../../ui/cellMain.js';
import richTextEditor from '../../../ui/richTextEditor.js';
import imageDialog from '../../../ui/imageDialog.js';
import formulaRangeSelect from '../../../ui/formulaRangeSelect.js';
import functionBox from '../../../ui/functionBox.js';
import countShow from '../../../ui/countShow.js';
import inputBox from '../../../ui/inputBox.js';
import canvasContext from '../../../ui/canvasContext.js';

export function handleCellMousedown(event) {
              if (event.target.classList.contains("luckysheet-mousedown-cancel")) {
                  return;
              }
  
  
              const _cellSelected = document.getElementById("luckysheet-cell-selected");
              if (_cellSelected) {
                  const _fillHandle = _cellSelected.querySelector(".luckysheet-cs-fillhandle");
                  if (_fillHandle) _fillHandle.style.cursor = "default";
                  const _dragHandle = _cellSelected.querySelector(".luckysheet-cs-draghandle");
                  if (_dragHandle) _dragHandle.style.cursor = "default";
              }
              cellMain.setCursorDefault();
  
              //有批注在编辑时
              luckysheetPostil.removeActivePs();
  
              //图片 active/cropping
              if (
                  imageDialog.active.isVisible() ||
                  imageDialog.cropping.isVisible()
              ) {
                  imageCtrl.cancelActiveImgItem();
              }
  
              //luckysheetautoadjustmousedown = 1;
              let mouse = mouseposition(event.pageX, event.pageY);
              if (
                  mouse[0] >= Store.gridWidth - Store.cellMainSrollBarSize ||
                  mouse[1] >= Store.gridHeight - Store.cellMainSrollBarSize
              ) {
                  return;
              }
  
              let scroll = getScrollPosition();
              let x = mouse[0] + scroll.scrollLeft;
              let y = mouse[1] + scroll.scrollTop;
  
              if (
                  luckysheetFreezen.freezenverticaldata != null &&
                  mouse[0] < luckysheetFreezen.freezenverticaldata[0] - luckysheetFreezen.freezenverticaldata[2]
              ) {
                  x = mouse[0] + luckysheetFreezen.freezenverticaldata[2];
              }
  
              if (
                  luckysheetFreezen.freezenhorizontaldata != null &&
                  mouse[1] < luckysheetFreezen.freezenhorizontaldata[0] - luckysheetFreezen.freezenhorizontaldata[2]
              ) {
                  y = mouse[1] + luckysheetFreezen.freezenhorizontaldata[2];
              }
  
              let sheetFile = sheetmanage.getSheetByIndex();
              let luckysheetTableContent = canvasContext.getContext();
  
              let row_location = rowLocation(y),
                  row = row_location[1],
                  row_pre = row_location[0],
                  row_index = row_location[2];
  
              let col_location = colLocation(x),
                  col = col_location[1],
                  col_pre = col_location[0],
                  col_index = col_location[2];
  
              let row_index_ed = row_index,
                  col_index_ed = col_index;
              let margeset = menuButton.mergeborer(Store.sheetData, row_index, col_index);
              if (margeset) {
                  row = margeset.row[1];
                  row_pre = margeset.row[0];
                  row_index = margeset.row[2];
                  row_index_ed = margeset.row[3];
  
                  col = margeset.column[1];
                  col_pre = margeset.column[0];
                  col_index = margeset.column[2];
                  col_index_ed = margeset.column[3];
              }
  
              //单元格单击之前
              if (
                  !method.createHookFunction(
                      "cellMousedownBefore",
                      Store.sheetData[row_index][col_index],
                      {
                          r: row_index,
                          c: col_index,
                          start_r: row_pre,
                          start_c: col_pre,
                          end_r: row,
                          end_c: col,
                      },
                      sheetFile,
                      luckysheetTableContent,
                  )
              ) {
                  return;
              }
  
              luckysheetformula.cellFocus(row_index, col_index);
  
              //若点击单元格部分不在视图内
              if (col_pre < scroll.scrollLeft) {
                  scrollBarX.setScrollLeft(col_pre);
              }

              if (row_pre < scroll.scrollTop) {
                  scrollBarY.setScrollTop(row_pre);
              }
  
              //mousedown是右键
              if (event.which == "3") {
                  let isright = false;
  
                  for (let s = 0; s < Store.selections.length; s++) {
                      if (
                          Store.selections[s]["row"] != null &&
                          row_index >= Store.selections[s]["row"][0] &&
                          row_index <= Store.selections[s]["row"][1] &&
                          col_index >= Store.selections[s]["column"][0] &&
                          col_index <= Store.selections[s]["column"][1]
                      ) {
                          isright = true;
                          break;
                      }
                  }
  
                  if (isright) {
                      return;
                  }
              }
  
              //单元格数据下钻
              if (
                  Store.sheetData[row_index] != null &&
                  Store.sheetData[row_index][col_index] != null &&
                  Store.sheetData[row_index][col_index].dd != null
              ) {
                  if (
                      luckysheetConfigsetting.fireMousedown != null &&
                      getObjType(luckysheetConfigsetting.fireMousedown) == "function"
                  ) {
                      luckysheetConfigsetting.fireMousedown(Store.sheetData[row_index][col_index].dd);
                      return;
                  }
              }
  
              //链接 单元格聚焦
              if (hyperlinkCtrl.hyperlink && hyperlinkCtrl.hyperlink[row_index + "_" + col_index] && event.which != "3") {
                  hyperlinkCtrl.cellFocus(row_index, col_index);
                  return;
              }
  
              Store.luckysheet_scroll_status = true;
  
              //公式相关
              if (inputBox.getTop() > 0) {
                  if (
                      formula.rangestart ||
                      formula.rangedrag_column_start ||
                      formula.rangedrag_row_start ||
                      formula.israngeseleciton()
                  ) {
                      //公式选区
                      let rowseleted = [row_index, row_index_ed];
                      let columnseleted = [col_index, col_index_ed];
  
                      let left = col_pre;
                      let width = col - col_pre - 1;
                      let top = row_pre;
                      let height = row - row_pre - 1;
  
                      if (event.shiftKey) {
                          let last = formula.func_selectedrange;
  
                          let top = 0,
                              height = 0,
                              rowseleted = [];
                          if (last.top > row_pre) {
                              top = row_pre;
                              height = last.top + last.height - row_pre;
  
                              if (last.row[1] > last.row_focus) {
                                  last.row[1] = last.row_focus;
                              }
  
                              rowseleted = [row_index, last.row[1]];
                          } else if (last.top == row_pre) {
                              top = row_pre;
                              height = last.top + last.height - row_pre;
                              rowseleted = [row_index, last.row[0]];
                          } else {
                              top = last.top;
                              height = row - last.top - 1;
  
                              if (last.row[0] < last.row_focus) {
                                  last.row[0] = last.row_focus;
                              }
  
                              rowseleted = [last.row[0], row_index];
                          }
  
                          let left = 0,
                              width = 0,
                              columnseleted = [];
                          if (last.left > col_pre) {
                              left = col_pre;
                              width = last.left + last.width - col_pre;
  
                              if (last.column[1] > last.column_focus) {
                                  last.column[1] = last.column_focus;
                              }
  
                              columnseleted = [col_index, last.column[1]];
                          } else if (last.left == col_pre) {
                              left = col_pre;
                              width = last.left + last.width - col_pre;
                              columnseleted = [col_index, last.column[0]];
                          } else {
                              left = last.left;
                              width = col - last.left - 1;
  
                              if (last.column[0] < last.column_focus) {
                                  last.column[0] = last.column_focus;
                              }
  
                              columnseleted = [last.column[0], col_index];
                          }
  
                          let changeparam = menuButton.mergeMoveMain(
                              columnseleted,
                              rowseleted,
                              last,
                              top,
                              height,
                              left,
                              width,
                          );
                          if (changeparam != null) {
                              columnseleted = changeparam[0];
                              rowseleted = changeparam[1];
                              top = changeparam[2];
                              height = changeparam[3];
                              left = changeparam[4];
                              width = changeparam[5];
                          }
  
                          luckysheet_count_show(left, top, width, height, rowseleted, columnseleted);
  
                          last["row"] = rowseleted;
                          last["column"] = columnseleted;
  
                          last["left_move"] = left;
                          last["width_move"] = width;
                          last["top_move"] = top;
                          last["height_move"] = height;
  
                          formula.func_selectedrange = last;
                      } else if (
                          event.ctrlKey &&
                          (() => { const _s = richTextEditor.el?.querySelectorAll("span"); return _s && _s.length ? _s[_s.length - 1].textContent : ""; })() != ","
                      ) {
                          //按住ctrl 选择选区时  先处理上一个选区
                          let vText = richTextEditor.getText();
  
                          if (vText[vText.length - 1] === ")") {
                              vText = vText.substr(0, vText.length - 1); //先删除最后侧的圆括号)
                          }
  
                          if (vText !== null) {
                              let lastWord = vText.substr(vText.length - 1, 1);
                              if (lastWord != "," && lastWord != "=" && lastWord != "(") {
                                  vText += ",";
                              }
                          }
                          if (vText !== null && vText.substr(0, 1) == "=") {
                              vText = formula.functionHTMLGenerate(vText);
  
                              if (window.getSelection) {
                                  // all browsers, except IE before version 9
                                  let currSelection = window.getSelection();
                                  formula.functionRangeIndex = [
                                      (() => { const _an = currSelection.anchorNode; if (!_an) return -1; const _p = _an.nodeType === Node.TEXT_NODE ? _an.parentElement : _an; return _p && _p.parentElement ? Array.from(_p.parentElement.children).indexOf(_p) : -1; })(),
                                      currSelection.anchorOffset,
                                  ];
                              } else {
                                  // Internet Explorer before version 9
                                  let textRange = document.selection.createRange();
                                  formula.functionRangeIndex = textRange;
                              }
  
                              /* 在显示前重新 + 右侧的圆括号) */
  
                              richTextEditor.setHtml(vText + ")");
  
                              formula.canceFunctionrangeSelected();
                              formula.createRangeHightlight();
                          }
  
                          formula.rangestart = false;
                          formula.rangedrag_column_start = false;
                          formula.rangedrag_row_start = false;
  
                          functionBox.setHtml(vText + ")");
                          formula.rangeHightlightselected(richTextEditor.el);
  
                          //再进行 选区的选择
                          formula.israngeseleciton();
                          formula.func_selectedrange = {
                              left: left,
                              width: width,
                              top: top,
                              height: height,
                              left_move: left,
                              width_move: width,
                              top_move: top,
                              height_move: height,
                              row: rowseleted,
                              column: columnseleted,
                              row_focus: row_index,
                              column_focus: col_index,
                          };
                      } else {
                          formula.func_selectedrange = {
                              left: left,
                              width: width,
                              top: top,
                              height: height,
                              left_move: left,
                              width_move: width,
                              top_move: top,
                              height_move: height,
                              row: rowseleted,
                              column: columnseleted,
                              row_focus: row_index,
                              column_focus: col_index,
                          };
                      }
  
                      formula.rangeSetValue({ row: rowseleted, column: columnseleted });
  
                      formula.rangestart = true;
                      formula.rangedrag_column_start = false;
                      formula.rangedrag_row_start = false;
  
                      formulaRangeSelect.showAt({
                              left: left,
                              width: width,
                              top: top,
                              height: height,
                          });
                      formulaDialogs.formulaHelp.hide();
                      luckysheet_count_show(left, top, width, height, rowseleted, columnseleted);

                      setTimeout(function() {
                          let currSelection = window.getSelection();
                          let anchorOffset = currSelection.anchorNode;

                          let _editor;
                          if (
                              formulaDialogs.searchParm.isVisible() ||
                              formulaDialogs.searchParmSelect.isVisible()
                          ) {
                              _editor = richTextEditor.el;
                              formula.rangechangeindex = formula.data_parm_index;
                          } else {
                              const _anchorEl = anchorOffset.nodeType === Node.TEXT_NODE ? anchorOffset.parentElement : anchorOffset;
                              _editor = _anchorEl ? _anchorEl.closest("div") : null;
                          }

                          let _span = _editor ? _editor.querySelector("span[rangeindex='" + formula.rangechangeindex + "']") : null;
                          if (_span && _span.innerHTML.length) {
                              formula.setCaretPosition(_span, 0, _span.innerHTML.length);
                          }
                      }, 1);
                      return;
                  } else {
                      formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                      Store.luckysheet_select_status = true;
  
                      const _info = document.getElementById("luckysheet-info"); if (_info && _info.offsetWidth > 0) {
                          Store.luckysheet_select_status = false;
                      }
                  }
              } else {
                  Store.luckysheet_select_status = true;
              }
  
              //条件格式 应用范围可选择多个单元格
              if (formulaDialogs.multiRange.isVisible()) {
                  conditionformat.selectStatus = true;
                  Store.luckysheet_select_status = false;
  
                  if (event.shiftKey) {
                      let last = conditionformat.selectRange[conditionformat.selectRange.length - 1];
  
                      let top = 0,
                          height = 0,
                          rowseleted = [];
                      if (last.top > row_pre) {
                          top = row_pre;
                          height = last.top + last.height - row_pre;
  
                          if (last.row[1] > last.row_focus) {
                              last.row[1] = last.row_focus;
                          }
  
                          rowseleted = [row_index, last.row[1]];
                      } else if (last.top == row_pre) {
                          top = row_pre;
                          height = last.top + last.height - row_pre;
                          rowseleted = [row_index, last.row[0]];
                      } else {
                          top = last.top;
                          height = row - last.top - 1;
  
                          if (last.row[0] < last.row_focus) {
                              last.row[0] = last.row_focus;
                          }
  
                          rowseleted = [last.row[0], row_index];
                      }
  
                      let left = 0,
                          width = 0,
                          columnseleted = [];
                      if (last.left > col_pre) {
                          left = col_pre;
                          width = last.left + last.width - col_pre;
  
                          if (last.column[1] > last.column_focus) {
                              last.column[1] = last.column_focus;
                          }
  
                          columnseleted = [col_index, last.column[1]];
                      } else if (last.left == col_pre) {
                          left = col_pre;
                          width = last.left + last.width - col_pre;
                          columnseleted = [col_index, last.column[0]];
                      } else {
                          left = last.left;
                          width = col - last.left - 1;
  
                          if (last.column[0] < last.column_focus) {
                              last.column[0] = last.column_focus;
                          }
  
                          columnseleted = [last.column[0], col_index];
                      }
  
                      let changeparam = menuButton.mergeMoveMain(
                          columnseleted,
                          rowseleted,
                          last,
                          top,
                          height,
                          left,
                          width,
                      );
                      if (changeparam != null) {
                          columnseleted = changeparam[0];
                          rowseleted = changeparam[1];
                          top = changeparam[2];
                          height = changeparam[3];
                          left = changeparam[4];
                          width = changeparam[5];
                      }
  
                      last["row"] = rowseleted;
                      last["column"] = columnseleted;
  
                      last["left_move"] = left;
                      last["width_move"] = width;
                      last["top_move"] = top;
                      last["height_move"] = height;
  
                      conditionformat.selectRange[conditionformat.selectRange.length - 1] = last;
                  } else if (event.ctrlKey) {
                      conditionformat.selectRange.push({
                          left: col_pre,
                          width: col - col_pre - 1,
                          top: row_pre,
                          height: row - row_pre - 1,
                          left_move: col_pre,
                          width_move: col - col_pre - 1,
                          top_move: row_pre,
                          height_move: row - row_pre - 1,
                          row: [row_index, row_index_ed],
                          column: [col_index, col_index_ed],
                          row_focus: row_index,
                          column_focus: col_index,
                      });
                  } else {
                      conditionformat.selectRange = [];
                      conditionformat.selectRange.push({
                          left: col_pre,
                          width: col - col_pre - 1,
                          top: row_pre,
                          height: row - row_pre - 1,
                          left_move: col_pre,
                          width_move: col - col_pre - 1,
                          top_move: row_pre,
                          height_move: row - row_pre - 1,
                          row: [row_index, row_index_ed],
                          column: [col_index, col_index_ed],
                          row_focus: row_index,
                          column_focus: col_index,
                      });
                  }
  
                  selectionCopyShow(conditionformat.selectRange);
  
                  let range = conditionformat.getTxtByRange(conditionformat.selectRange);
                  let _multiRangeInput = formulaDialogs.multiRange.querySelector("input"); if (_multiRangeInput) _multiRangeInput.value = range;
  
                  return;
              } else {
                  conditionformat.selectStatus = false;
                  conditionformat.selectRange = [];
              }
  
              //条件格式 条件值只能选择单个单元格
              if (formulaDialogs.singleRange.isVisible()) {
                  Store.luckysheet_select_status = false;
  
                  selectionCopyShow([{ row: [row_index, row_index], column: [col_index, col_index] }]);
  
                  let range = getRangetxt(
                      Store.currentSheetIndex,
                      { row: [row_index, row_index], column: [col_index, col_index] },
                      Store.currentSheetIndex,
                  );
                  let _singleRangeInput = formulaDialogs.singleRange.querySelector("input"); if (_singleRangeInput) _singleRangeInput.value = range;
  
                  return;
              }
  
              //if公式生成器
              if (ifFormulaGenerator.singleRangeFocus) {
                  let _singRangeBtn = formulaDialogs.ifFormulaDialog.querySelector(".singRange"); if (_singRangeBtn) _singRangeBtn.click();
              }
              if (formulaDialogs.ifFormulaSingleRange.isVisible()) {
                  //选择单个单元格
                  Store.luckysheet_select_status = false;
                  formula.rangestart = false;
  
                  formulaRangeSelect.showAt({
                          left: col_pre,
                          width: col - col_pre - 1,
                          top: row_pre,
                          height: row - row_pre - 1,
                      });
                  formulaDialogs.formulaHelp.hide();

                  let range = getRangetxt(
                      Store.currentSheetIndex,
                      { row: [row_index, row_index], column: [col_index, col_index] },
                      Store.currentSheetIndex,
                  );
                  let _ifSingleInput = formulaDialogs.ifFormulaSingleRange.querySelector("input"); if (_ifSingleInput) _ifSingleInput.value = range;

                  return;
              }
              if (formulaDialogs.ifFormulaMultiRange.isVisible()) {
                  //选择范围
                  Store.luckysheet_select_status = false;
                  formula.func_selectedrange = {
                      left: col_pre,
                      width: col - col_pre - 1,
                      top: row_pre,
                      height: row - row_pre - 1,
                      left_move: col_pre,
                      width_move: col - col_pre - 1,
                      top_move: row_pre,
                      height_move: row - row_pre - 1,
                      row: [row_index, row_index],
                      column: [col_index, col_index],
                      row_focus: row_index,
                      column_focus: col_index,
                  };
                  formula.rangestart = true;
  
                  formulaRangeSelect.showAt({
                          left: col_pre,
                          width: col - col_pre - 1,
                          top: row_pre,
                          height: row - row_pre - 1,
                      });
                  formulaDialogs.formulaHelp.hide();
  
                  let range = getRangetxt(
                      Store.currentSheetIndex,
                      { row: [row_index, row_index], column: [col_index, col_index] },
                      Store.currentSheetIndex,
                  );
                  let _ifMultiInput = formulaDialogs.ifFormulaMultiRange.querySelector("input"); if (_ifMultiInput) _ifMultiInput.value = range;
  
                  countShow.row.hide();
                  countShow.column.hide();
  
                  return;
              }
  
              if (Store.luckysheet_select_status) {
                  if (event.shiftKey) {
                      //按住shift点击，选择范围
                      let last = structuredClone(getLastSelection()); //选区最后一个
  
                      let top = 0,
                          height = 0,
                          rowseleted = [];
                      if (last.top > row_pre) {
                          top = row_pre;
                          height = last.top + last.height - row_pre;
  
                          if (last.row[1] > last.row_focus) {
                              last.row[1] = last.row_focus;
                          }
  
                          rowseleted = [row_index, last.row[1]];
                      } else if (last.top == row_pre) {
                          top = row_pre;
                          height = last.top + last.height - row_pre;
                          rowseleted = [row_index, last.row[0]];
                      } else {
                          top = last.top;
                          height = row - last.top - 1;
  
                          if (last.row[0] < last.row_focus) {
                              last.row[0] = last.row_focus;
                          }
  
                          rowseleted = [last.row[0], row_index];
                      }
  
                      let left = 0,
                          width = 0,
                          columnseleted = [];
                      if (last.left > col_pre) {
                          left = col_pre;
                          width = last.left + last.width - col_pre;
  
                          if (last.column[1] > last.column_focus) {
                              last.column[1] = last.column_focus;
                          }
  
                          columnseleted = [col_index, last.column[1]];
                      } else if (last.left == col_pre) {
                          left = col_pre;
                          width = last.left + last.width - col_pre;
                          columnseleted = [col_index, last.column[0]];
                      } else {
                          left = last.left;
                          width = col - last.left - 1;
  
                          if (last.column[0] < last.column_focus) {
                              last.column[0] = last.column_focus;
                          }
  
                          columnseleted = [last.column[0], col_index];
                      }
  
                      let changeparam = menuButton.mergeMoveMain(
                          columnseleted,
                          rowseleted,
                          last,
                          top,
                          height,
                          left,
                          width,
                      );
                      if (changeparam != null) {
                          columnseleted = changeparam[0];
                          rowseleted = changeparam[1];
                          top = changeparam[2];
                          height = changeparam[3];
                          left = changeparam[4];
                          width = changeparam[5];
                      }
  
                      last["row"] = rowseleted;
                      last["column"] = columnseleted;
  
                      last["left_move"] = left;
                      last["width_move"] = width;
                      last["top_move"] = top;
                      last["height_move"] = height;
  
                      setLastSelection(last);
  
                      //交替颜色选择范围
                      const _rangeDialog = document.getElementById("luckysheet-alternateformat-rangeDialog");
                      if (_rangeDialog && _rangeDialog.offsetWidth > 0) {
                          const _rangeDialogInput = _rangeDialog.querySelector("input");
                          if (_rangeDialogInput) _rangeDialogInput.value = getRangetxt(Store.currentSheetIndex, Store.selections);
                      }
  
                  } else if (event.ctrlKey) {
                      //选区添加
                      Store.selections.push({
                          left: col_pre,
                          width: col - col_pre - 1,
                          top: row_pre,
                          height: row - row_pre - 1,
                          left_move: col_pre,
                          width_move: col - col_pre - 1,
                          top_move: row_pre,
                          height_move: row - row_pre - 1,
                          row: [row_index, row_index_ed],
                          column: [col_index, col_index_ed],
                          row_focus: row_index,
                          column_focus: col_index,
                      });
                  } else {
                      Store.selections.length = 0;
                      Store.selections.push({
                          left: col_pre,
                          width: col - col_pre - 1,
                          top: row_pre,
                          height: row - row_pre - 1,
                          left_move: col_pre,
                          width_move: col - col_pre - 1,
                          top_move: row_pre,
                          height_move: row - row_pre - 1,
                          row: [row_index, row_index_ed],
                          column: [col_index, col_index_ed],
                          row_focus: row_index,
                          column_focus: col_index,
                      });
  
                      //单元格格式icon对应
                      menuButton.menuButtonFocus(Store.sheetData, row_index, col_index);
                      //函数公式显示栏
                      formula.fucntionboxshow(row_index, col_index);
                  }
  
                  selectHightlightShow();
  
                  if (luckysheetFreezen.freezenhorizontaldata != null || luckysheetFreezen.freezenverticaldata != null) {
                      luckysheetFreezen.scrollAdaptOfselect();
                  }
  
                  if (!browser.mobilecheck()) {
                      //非移动端聚焦输入框
                      luckysheetactiveCell();
                  }
  
                  //允许编辑后的后台更新时
              }
  
              //交替颜色
              if (alternateformat.rangefocus) {
                  alternateformat.rangefocus = false;
                  const _faTable = document.querySelector("#luckysheet-alternateformat-range .fa-table"); if (_faTable) _faTable.click();
              }
  
              countShow.row.hide();
              countShow.column.hide();
  
              if (!isEditMode()) {
              }
  
              // selectHelpboxFill();
  
              //数据透视表
  
              luckysheetContainerFocus();
  
              method.createHookFunction(
                  "cellMousedown",
                  Store.sheetData[row_index][col_index],
                  {
                      r: row_index,
                      c: col_index,
                      start_r: row_pre,
                      start_c: col_pre,
                      end_r: row,
                      end_c: col,
                  },
                  sheetFile,
                  luckysheetTableContent,
              );
  
              //document.querySelector("#luckysheet-col-header .luckysheet-cols-h-cells-c .luckysheet-cols-h-cells-clip .luckysheet-cols-h-cell-sel").classList.remove("luckysheet-cols-h-cell-sel").classList.add("luckysheet-cols-h-cell-nosel");

              //document.querySelector("#luckysheet-row-header .luckysheet-rows-h-cells .luckysheet-rows-h-cells-c .luckysheet-rows-h-cells-clip .luckysheet-rows-h-cell-sel").classList.remove("luckysheet-rows-h-cell-sel").classList.add("luckysheet-rows-h-cell-nosel");

              //document.querySelector("#luckysheet-col-header .luckysheet-cols-h-cells-c .luckysheet-cols-h-cells-clip .luckysheet-cols-h-cell-nosel")[col_index].classList.remove("luckysheet-cols-h-cell-nosel").classList.add("luckysheet-cols-h-cell-sel");
  
              //document.querySelector("#luckysheet-row-header .luckysheet-rows-h-cells .luckysheet-rows-h-cells-c .luckysheet-rows-h-cells-clip .luckysheet-rows-h-cell-nosel")[row_index].classList.remove("luckysheet-rows-h-cell-nosel").classList.add("luckysheet-rows-h-cell-sel");
  
              //event.stopImmediatePropagation();
}
