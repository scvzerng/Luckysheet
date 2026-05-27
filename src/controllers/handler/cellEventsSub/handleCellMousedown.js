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
import method from '../../../global/method';
import formula from '../../../global/formula';
import luckysheetformula from '../../../global/formula';
import { luckysheet_count_show, selectionCopyShow, selectHightlightShow } from '../../select';
import { getRangetxt } from '../../../methods/get';
import { isEditMode } from '../../../global/validate';
import { luckysheetactiveCell, luckysheetContainerFocus, getObjType } from '../../../utils/util';
import browser from '../../../global/browser';

export function handleCellMousedown(event) {
              if ($(event.target).hasClass("luckysheet-mousedown-cancel")) {
                  return;
              }
  
  
              $("#luckysheet-cell-selected")
                  .find(".luckysheet-cs-fillhandle")
                  .css("cursor", "default")
                  .end()
                  .find(".luckysheet-cs-draghandle")
                  .css("cursor", "default");
              $("#luckysheet-cell-main, #luckysheetTableContent, #luckysheet-sheettable_0").css("cursor", "default");
  
              //有批注在编辑时
              luckysheetPostil.removeActivePs();
  
              //图片 active/cropping
              if (
                  $("#luckysheet-modal-dialog-activeImage").is(":visible") ||
                  $("#luckysheet-modal-dialog-cropping").is(":visible")
              ) {
                  imageCtrl.cancelActiveImgItem();
              }
  
              //luckysheetautoadjustmousedown = 1;
              let mouse = mouseposition(event.pageX, event.pageY);
              if (
                  mouse[0] >= Store.cellmainWidth - Store.cellMainSrollBarSize ||
                  mouse[1] >= Store.cellmainHeight - Store.cellMainSrollBarSize
              ) {
                  return;
              }
  
              let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
              let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();
  
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
              let luckysheetTableContent = $("#luckysheetTableContent")
                  .get(0)
                  .getContext("2d");
  
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
              let margeset = menuButton.mergeborer(Store.flowdata, row_index, col_index);
              if (!!margeset) {
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
                      Store.flowdata[row_index][col_index],
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
              if (col_pre < $("#luckysheet-cell-main").scrollLeft()) {
                  $("#luckysheet-scrollbar-x").scrollLeft(col_pre);
              }
  
              if (row_pre < $("#luckysheet-cell-main").scrollTop()) {
                  $("#luckysheet-scrollbar-y").scrollTop(row_pre);
              }
  
              //mousedown是右键
              if (event.which == "3") {
                  let isright = false;
  
                  for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
                      if (
                          Store.luckysheet_select_save[s]["row"] != null &&
                          row_index >= Store.luckysheet_select_save[s]["row"][0] &&
                          row_index <= Store.luckysheet_select_save[s]["row"][1] &&
                          col_index >= Store.luckysheet_select_save[s]["column"][0] &&
                          col_index <= Store.luckysheet_select_save[s]["column"][1]
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
                  Store.flowdata[row_index] != null &&
                  Store.flowdata[row_index][col_index] != null &&
                  Store.flowdata[row_index][col_index].dd != null
              ) {
                  if (
                      luckysheetConfigsetting.fireMousedown != null &&
                      getObjType(luckysheetConfigsetting.fireMousedown) == "function"
                  ) {
                      luckysheetConfigsetting.fireMousedown(Store.flowdata[row_index][col_index].dd);
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
              let $input = $("#luckysheet-input-box");
              if (parseInt($input.css("top")) > 0) {
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
                          $("#luckysheet-rich-text-editor")
                              .find("span")
                              .last()
                              .text() != ","
                      ) {
                          //按住ctrl 选择选区时  先处理上一个选区
                          let vText = $("#luckysheet-rich-text-editor").text();
  
                          if (vText[vText.length - 1] === ")") {
                              vText = vText.substr(0, vText.length - 1); //先删除最后侧的圆括号)
                          }
  
                          if (vText.length > 0) {
                              let lastWord = vText.substr(vText.length - 1, 1);
                              if (lastWord != "," && lastWord != "=" && lastWord != "(") {
                                  vText += ",";
                              }
                          }
                          if (vText.length > 0 && vText.substr(0, 1) == "=") {
                              vText = formula.functionHTMLGenerate(vText);
  
                              if (window.getSelection) {
                                  // all browsers, except IE before version 9
                                  let currSelection = window.getSelection();
                                  formula.functionRangeIndex = [
                                      $(currSelection.anchorNode)
                                          .parent()
                                          .index(),
                                      currSelection.anchorOffset,
                                  ];
                              } else {
                                  // Internet Explorer before version 9
                                  let textRange = document.selection.createRange();
                                  formula.functionRangeIndex = textRange;
                              }
  
                              /* 在显示前重新 + 右侧的圆括号) */
  
                              $("#luckysheet-rich-text-editor").html(vText + ")");
  
                              formula.canceFunctionrangeSelected();
                              formula.createRangeHightlight();
                          }
  
                          formula.rangestart = false;
                          formula.rangedrag_column_start = false;
                          formula.rangedrag_row_start = false;
  
                          $("#luckysheet-functionbox-cell").html(vText + ")");
                          formula.rangeHightlightselected($("#luckysheet-rich-text-editor"));
  
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
  
                      $("#luckysheet-formula-functionrange-select")
                          .css({
                              left: left,
                              width: width,
                              top: top,
                              height: height,
                          })
                          .show();
                      $("#luckysheet-formula-help-c").hide();
                      luckysheet_count_show(left, top, width, height, rowseleted, columnseleted);
  
                      setTimeout(function() {
                          let currSelection = window.getSelection();
                          let anchorOffset = currSelection.anchorNode;
  
                          let $editor;
                          if (
                              $("#luckysheet-search-formula-parm").is(":visible") ||
                              $("#luckysheet-search-formula-parm-select").is(":visible")
                          ) {
                              $editor = $("#luckysheet-rich-text-editor");
                              formula.rangechangeindex = formula.data_parm_index;
                          } else {
                              $editor = $(anchorOffset).closest("div");
                          }
  
                          let $span = $editor.find("span[rangeindex='" + formula.rangechangeindex + "']");
                          if ($span && $span != undefined && $span != null && $span && $span.html().length) {
                              formula.setCaretPosition($span.get(0), 0, $span.html().length);
                          }
                      }, 1);
                      return;
                  } else {
                      formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                      Store.luckysheet_select_status = true;
  
                      if ($("#luckysheet-info").is(":visible")) {
                          Store.luckysheet_select_status = false;
                      }
                  }
              } else {
                  Store.luckysheet_select_status = true;
              }
  
              //条件格式 应用范围可选择多个单元格
              if ($("#luckysheet-multiRange-dialog").is(":visible")) {
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
                  $("#luckysheet-multiRange-dialog input").val(range);
  
                  return;
              } else {
                  conditionformat.selectStatus = false;
                  conditionformat.selectRange = [];
              }
  
              //条件格式 条件值只能选择单个单元格
              if ($("#luckysheet-singleRange-dialog").is(":visible")) {
                  Store.luckysheet_select_status = false;
  
                  selectionCopyShow([{ row: [row_index, row_index], column: [col_index, col_index] }]);
  
                  let range = getRangetxt(
                      Store.currentSheetIndex,
                      { row: [row_index, row_index], column: [col_index, col_index] },
                      Store.currentSheetIndex,
                  );
                  $("#luckysheet-singleRange-dialog input").val(range);
  
                  return;
              }
  
              //if公式生成器
              if (ifFormulaGenerator.singleRangeFocus) {
                  $("#luckysheet-ifFormulaGenerator-dialog .singRange").click();
              }
              if ($("#luckysheet-ifFormulaGenerator-singleRange-dialog").is(":visible")) {
                  //选择单个单元格
                  Store.luckysheet_select_status = false;
                  formula.rangestart = false;
  
                  $("#luckysheet-formula-functionrange-select")
                      .css({
                          left: col_pre,
                          width: col - col_pre - 1,
                          top: row_pre,
                          height: row - row_pre - 1,
                      })
                      .show();
                  $("#luckysheet-formula-help-c").hide();
  
                  let range = getRangetxt(
                      Store.currentSheetIndex,
                      { row: [row_index, row_index], column: [col_index, col_index] },
                      Store.currentSheetIndex,
                  );
                  $("#luckysheet-ifFormulaGenerator-singleRange-dialog input").val(range);
  
                  return;
              }
              if ($("#luckysheet-ifFormulaGenerator-multiRange-dialog").is(":visible")) {
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
  
                  $("#luckysheet-formula-functionrange-select")
                      .css({
                          left: col_pre,
                          width: col - col_pre - 1,
                          top: row_pre,
                          height: row - row_pre - 1,
                      })
                      .show();
                  $("#luckysheet-formula-help-c").hide();
  
                  let range = getRangetxt(
                      Store.currentSheetIndex,
                      { row: [row_index, row_index], column: [col_index, col_index] },
                      Store.currentSheetIndex,
                  );
                  $("#luckysheet-ifFormulaGenerator-multiRange-dialog input").val(range);
  
                  $("#luckysheet-row-count-show").hide();
                  $("#luckysheet-column-count-show").hide();
  
                  return;
              }
  
              if (Store.luckysheet_select_status) {
                  if (event.shiftKey) {
                      //按住shift点击，选择范围
                      let last = $.extend(
                          true,
                          {},
                          Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1],
                      ); //选区最后一个
  
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
  
                      Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1] = last;
  
                      //交替颜色选择范围
                      if ($("#luckysheet-alternateformat-rangeDialog").is(":visible")) {
                          $("#luckysheet-alternateformat-rangeDialog input").val(
                              getRangetxt(Store.currentSheetIndex, Store.luckysheet_select_save),
                          );
                      }
  
                  } else if (event.ctrlKey) {
                      //选区添加
                      Store.luckysheet_select_save.push({
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
                      Store.luckysheet_select_save.length = 0;
                      Store.luckysheet_select_save.push({
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
                      menuButton.menuButtonFocus(Store.flowdata, row_index, col_index);
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
                  $("#luckysheet-alternateformat-range .fa-table").click();
              }
  
              $("#luckysheet-row-count-show, #luckysheet-column-count-show").hide();
  
              if (!isEditMode()) {
              }
  
              // selectHelpboxFill();
  
              //数据透视表
  
              luckysheetContainerFocus();
  
              method.createHookFunction(
                  "cellMousedown",
                  Store.flowdata[row_index][col_index],
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
  
              //$("#luckysheet-cols-h-c .luckysheet-cols-h-cells-c .luckysheet-cols-h-cells-clip .luckysheet-cols-h-cell-sel").removeClass("luckysheet-cols-h-cell-sel").addClass("luckysheet-cols-h-cell-nosel");
  
              //$("#luckysheet-rows-h .luckysheet-rows-h-cells .luckysheet-rows-h-cells-c .luckysheet-rows-h-cells-clip .luckysheet-rows-h-cell-sel").removeClass("luckysheet-rows-h-cell-sel").addClass("luckysheet-rows-h-cell-nosel");
  
              //$("#luckysheet-cols-h-c .luckysheet-cols-h-cells-c .luckysheet-cols-h-cells-clip .luckysheet-cols-h-cell-nosel").eq(col_index).removeClass("luckysheet-cols-h-cell-nosel").addClass("luckysheet-cols-h-cell-sel");
  
              //$("#luckysheet-rows-h .luckysheet-rows-h-cells .luckysheet-rows-h-cells-c .luckysheet-rows-h-cells-clip .luckysheet-rows-h-cell-nosel").eq(row_index).removeClass("luckysheet-rows-h-cell-nosel").addClass("luckysheet-rows-h-cell-sel");
  
              //event.stopImmediatePropagation();
}
