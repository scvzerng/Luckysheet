import { colLocation, mouseposition, rowLocation } from '../../../global/location';
import { checkIsAllowEdit } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { getMaxRowIndex } from '../../../utils/storeAccess.js';
import { $$, showrightclickmenu } from '../../../utils/util';
import imageCtrl from '../../imageCtrl';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';
import luckysheetPostil from '../../postil';
import cellMain from '../../../ui/cellMain.js';
import resizeHandles from '../../../ui/resizeHandles.js';
import inputBox from '../../../ui/inputBox.js';
import imageDialog from '../../../ui/imageDialog.js';
import rightClickMenu from '../../../ui/rightClickMenu.js';
import { rowHeader, colHeader } from '../../../ui/rowColHeader.js';

export function initResizeEvents() {
    resizeHandles.rowChangeSize.onMousedown(function (event) {
      if (!checkIsAllowEdit()) {
        return;
      }
      luckysheetPostil.removeActivePs();
  
      if (imageDialog.active.isVisible() || imageDialog.cropping.isVisible()) {
        imageCtrl.cancelActiveImgItem();
      }
      inputBox.hide();
      resizeHandles.rowChangeSize.setCss({
        opacity: 1
      });
      let mouse = mouseposition(event.pageX, event.pageY);
      let y = mouse[1] + rowHeader.getScrollTop();
      let scrollLeft = cellMain.getScrollLeft();
      let winW = cellMain.getWidth();
      let row_location = rowLocation(y),
        row = row_location[1],
        row_pre = row_location[0],
        row_index = row_location[2];
      Store.luckysheet_rows_change_size = true;
      Store.luckysheet_scroll_status = true;
      resizeHandles.changeSizeLine.setCss({
        height: "1px",
        "border-width": "0 0px 1px 0",
        top: row - 3,
        left: 0,
        width: scrollLeft + winW,
        display: "block",
        cursor: "ns-resize"
      });
      rowHeader.setCursor("ns-resize");
      Store.luckysheet_rows_change_size_start = [row_pre, row_index];
      rightClickMenu.hide();
      resizeHandles.rowHover.hide();
      $("#luckysheet-cols-menu-btn").hide();
      event.stopPropagation();
    });
  
    //表格列标�?改变列宽按钮
    resizeHandles.colChangeSize.onMousedown(function (event) {
      if (!checkIsAllowEdit()) {
        return;
      }
      luckysheetPostil.removeActivePs();
  
      if (imageDialog.active.isVisible() || imageDialog.cropping.isVisible()) {
        imageCtrl.cancelActiveImgItem();
      }
      inputBox.hide();
      resizeHandles.colChangeSize.setCss({
        opacity: 1
      });
      let mouse = mouseposition(event.pageX, event.pageY);
      let scrollLeft = colHeader.getScrollLeft();
      let scrollTop = cellMain.getScrollTop();
      let winH = cellMain.getHeight();
      let x = mouse[0] + scrollLeft;
      let row_index = getMaxRowIndex(),
        row = Store.visibledatarow[row_index],
        row_pre = 0;
      let col_location = colLocation(x),
        col = col_location[1],
        col_pre = col_location[0],
        col_index = col_location[2];
      Store.luckysheet_cols_change_size = true;
      Store.luckysheet_scroll_status = true;
      resizeHandles.changeSizeLine.setCss({
        height: winH + scrollTop,
        "border-width": "0 1px 0 0",
        top: 0,
        left: col - 3,
        width: "1px",
        display: "block",
        cursor: "ew-resize"
      });
      colHeader.setCursor("ew-resize");
      Store.luckysheet_cols_change_size_start = [col_pre, col_index];
      rightClickMenu.hide();
      resizeHandles.colHover.hide();
      $("#luckysheet-cols-menu-btn").hide();
      Store.luckysheet_cols_dbclick_times = 0;
      event.stopPropagation();
    });
    resizeHandles.colChangeSize.onDblclick(function () {
      luckysheetcolsdbclick();
    });
  
    // 列标题的下拉箭头
    $("#luckysheet-cols-menu-btn").click(function (event) {
      // *如果禁止前台编辑，则中止下一步操�?
      if (!checkIsAllowEdit()) {
        return;
      }
      let $menu = rightClickMenu.el;
      let offset = $(this).offset();
      $("#luckysheet-cols-rows-shift").show();
      Store.luckysheetRightHeadClickIs = "column";
      rightClickMenu.findText(".luckysheet-cols-rows-shift-word", locale().rightclick.column);
      rightClickMenu.findText(".luckysheet-cols-rows-shift-left", locale().rightclick.left);
      rightClickMenu.findText(".luckysheet-cols-rows-shift-right", locale().rightclick.right);
      $("#luckysheet-cols-rows-add").show();
      $("#luckysheet-cols-rows-data").hide();
      $("#luckysheet-cols-rows-shift").show();
      $("#luckysheet-cols-rows-handleincell").hide();
      $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "block";
      $$("#luckysheet-cols-rows-shift .luckysheet-menuseparator").style.display = "block";
  
      // 自定义右键菜单：向左向右增加列，删除列，隐藏显示列，设置列宽
      const cellRightClickConfig = luckysheetConfigsetting.cellRightClickConfig;
  
      // 如果全部按钮都隐藏，则整个菜单容器也要隐�?
      if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste && !cellRightClickConfig.insertColumn && !cellRightClickConfig.deleteColumn && !cellRightClickConfig.hideColumn && !cellRightClickConfig.columnWidth && !cellRightClickConfig.sort) {
        return;
      }
      $$("#luckysheet-top-left-add-selected").style.display = cellRightClickConfig.insertColumn ? "block" : "none";
      $$("#luckysheet-bottom-right-add-selected").style.display = cellRightClickConfig.insertColumn ? "block" : "none";
      $$("#luckysheet-del-selected").style.display = cellRightClickConfig.deleteColumn ? "block" : "none";
      $$("#luckysheet-hide-selected").style.display = cellRightClickConfig.hideColumn ? "block" : "none";
      $$("#luckysheet-show-selected").style.display = cellRightClickConfig.hideColumn ? "block" : "none";
      $$("#luckysheet-column-row-width-selected").style.display = cellRightClickConfig.columnWidth ? "block" : "none";
  
      // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐�?
      if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
        $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
        if (!cellRightClickConfig.insertColumn && !cellRightClickConfig.deleteColumn && !cellRightClickConfig.hideColumn && !cellRightClickConfig.columnWidth) {
          $$("#luckysheet-cols-rows-shift .luckysheet-menuseparator").style.display = "none";
        }
      }
  
      // 2. 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
      if (!cellRightClickConfig.insertColumn && !cellRightClickConfig.deleteColumn && !cellRightClickConfig.hideColumn && !cellRightClickConfig.columnWidth) {
        $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
      }
      if (!cellRightClickConfig.sort) {
        $$("#luckysheet-cols-rows-shift .luckysheet-menuseparator").style.display = "none";
      }
      showrightclickmenu($menu, offset.left, offset.top + 18);
      Store.luckysheet_cols_menu_status = true;
    });
}
