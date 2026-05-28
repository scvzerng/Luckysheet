import luckysheetFreezen from '../../freezen';
import menuButton from '../../menuButton';
import { luckysheetupdateCell } from '../../updateCell';
import { mouseposition, rowLocation, colLocation } from '../../../global/location';
import Store from '../../../store';
import { isInputBoxActive } from '../../../utils/domUtils.js';
import { selectHightlightShow } from '../../select';

export function handleCellDblclick(event) {
              if ($(event.target).hasClass("luckysheet-mousedown-cancel")) {
                  return;
              }
  
              //禁止前台编辑(只可 框选单元格、滚动查看表格)
              if (!Store.allowEdit) {
                  return;
              }
  
              if (isInputBoxActive()) {
                  return;
              }
  
              let mouse = mouseposition(event.pageX, event.pageY);
              if (
                  mouse[0] >= Store.cellmainWidth - Store.cellMainSrollBarSize ||
                  mouse[1] >= Store.cellmainHeight - Store.cellMainSrollBarSize
              ) {
                  return;
              }
  
              let scrollLeft = $("#luckysheet-cell-main").scrollLeft(),
                  scrollTop = $("#luckysheet-cell-main").scrollTop();
              let x = mouse[0] + scrollLeft;
              let y = mouse[1] + scrollTop;
  
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
  
              let row_location = rowLocation(y),
                  row_index = row_location[2];
  
              let col_location = colLocation(x),
                  col_index = col_location[2];
  
              let margeset = menuButton.mergeborer(Store.flowdata, row_index, col_index);
              if (margeset) {
                  row_index = margeset.row[2];
                  col_index = margeset.column[2];
              }
  
  
              if (
                  $("#luckysheet-search-formula-parm").is(":visible") ||
                  $("#luckysheet-search-formula-parm-select").is(":visible")
              ) {
                  //公式参数栏显示
                  $("#luckysheet-cell-selected").hide();
              } else if (
                  $("#luckysheet-conditionformat-dialog").is(":visible") ||
                  $("#luckysheet-administerRule-dialog").is(":visible") ||
                  $("#luckysheet-newConditionRule-dialog").is(":visible") ||
                  $("#luckysheet-editorConditionRule-dialog").is(":visible") ||
                  $("#luckysheet-singleRange-dialog").is(":visible") ||
                  $("#luckysheet-multiRange-dialog").is(":visible")
              ) {
                  //条件格式
                  return;
              } else if (
                  $("#luckysheet-modal-dialog-slider-alternateformat").is(":visible") ||
                  $("#luckysheet-alternateformat-rangeDialog").is(":visible")
              ) {
                  //交替颜色
                  return;
              } else {
                  if (menuButton.luckysheetPaintModelOn) {
                      menuButton.cancelPaintModel();
                  }
  
                  // 检查当前坐标和焦点坐标是否一致，如果不一致那么进行修正
                  let column_focus = Store.luckysheet_select_save[0]["column_focus"];
                  let row_focus = Store.luckysheet_select_save[0]["row_focus"];
                  if (column_focus !== col_index || row_focus !== row_index) {
                      row_index = row_focus;
                      col_index = column_focus;
                  }
                  luckysheetupdateCell(row_index, col_index, Store.flowdata);
  
                  /* 设置选区高亮 */
                  selectHightlightShow();
              }
}
