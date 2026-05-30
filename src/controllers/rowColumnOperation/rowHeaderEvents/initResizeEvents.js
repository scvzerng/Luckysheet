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
      const _colsMenuBtn5 = document.getElementById("luckysheet-cols-menu-btn"); if (_colsMenuBtn5) _colsMenuBtn5.style.display = 'none';
      event.stopPropagation();
    });

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
      document.getElementById("luckysheet-cols-menu-btn").style.display = 'none';
      Store.luckysheet_cols_dbclick_times = 0;
      event.stopPropagation();
    });
    resizeHandles.colChangeSize.onDblclick(function () {
      luckysheetcolsdbclick();
    });
  
    // 列标题的下拉箭头
    document.getElementById("luckysheet-cols-menu-btn")?.addEventListener("click", function (event) {
      // *如果禁止前台编辑，则中止下一步操�?
      if (!checkIsAllowEdit()) {
        return;
      }
      let $menu = rightClickMenu.el;
      let offset = (() => { const _r = this.getBoundingClientRect(); return {top: _r.top + window.pageYOffset, left: _r.left + window.pageXOffset}; })();
      const _elShift4 = document.getElementById("luckysheet-cols-rows-shift"); if (_elShift4) _elShift4.style.display = 'block';
      Store.luckysheetRightHeadClickIs = "column";
      rightClickMenu.findText(".luckysheet-cols-rows-shift-word", locale().rightclick.column);
      rightClickMenu.findText(".luckysheet-cols-rows-shift-left", locale().rightclick.left);
      rightClickMenu.findText(".luckysheet-cols-rows-shift-right", locale().rightclick.right);
      const _elAdd3 = document.getElementById("luckysheet-cols-rows-add"); if (_elAdd3) _elAdd3.style.display = 'block';
      const _elData3 = document.getElementById("luckysheet-cols-rows-data"); if (_elData3) _elData3.style.display = 'none';
      const _elShift5 = document.getElementById("luckysheet-cols-rows-shift"); if (_elShift5) _elShift5.style.display = 'block';
      const _elHandleInCell3 = document.getElementById("luckysheet-cols-rows-handleincell"); if (_elHandleInCell3) _elHandleInCell3.style.display = 'none';
      const _sep27 = document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator"); if (_sep27) _sep27.style.display = "block";
      const _sep28 = document.querySelector("#luckysheet-cols-rows-shift .luckysheet-menuseparator"); if (_sep28) _sep28.style.display = "block";
  
      // 自定义右键菜单：向左向右增加列，删除列，隐藏显示列，设置列宽
      const cellRightClickConfig = luckysheetConfigsetting.cellRightClickConfig;
  
      // 如果全部按钮都隐藏，则整个菜单容器也要隐�?
      if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste && !cellRightClickConfig.insertColumn && !cellRightClickConfig.deleteColumn && !cellRightClickConfig.hideColumn && !cellRightClickConfig.columnWidth && !cellRightClickConfig.sort) {
        return;
      }
      const _tlAdd5 = document.getElementById("luckysheet-top-left-add-selected"); if (_tlAdd5) _tlAdd5.style.display = cellRightClickConfig.insertColumn ? "block" : "none";
      const _brAdd5 = document.getElementById("luckysheet-bottom-right-add-selected"); if (_brAdd5) _brAdd5.style.display = cellRightClickConfig.insertColumn ? "block" : "none";
      const _delSel5 = document.getElementById("luckysheet-del-selected"); if (_delSel5) _delSel5.style.display = cellRightClickConfig.deleteColumn ? "block" : "none";
      const _hideSel5 = document.getElementById("luckysheet-hide-selected"); if (_hideSel5) _hideSel5.style.display = cellRightClickConfig.hideColumn ? "block" : "none";
      const _showSel5 = document.getElementById("luckysheet-show-selected"); if (_showSel5) _showSel5.style.display = cellRightClickConfig.hideColumn ? "block" : "none";
      const _crwSel5 = document.getElementById("luckysheet-column-row-width-selected"); if (_crwSel5) _crwSel5.style.display = cellRightClickConfig.columnWidth ? "block" : "none";
  
      // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐�?
      if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
        const _sep29 = document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator"); if (_sep29) _sep29.style.display = "none";
        if (!cellRightClickConfig.insertColumn && !cellRightClickConfig.deleteColumn && !cellRightClickConfig.hideColumn && !cellRightClickConfig.columnWidth) {
          const _sep30 = document.querySelector("#luckysheet-cols-rows-shift .luckysheet-menuseparator"); if (_sep30) _sep30.style.display = "none";
        }
      }

      if (!cellRightClickConfig.insertColumn && !cellRightClickConfig.deleteColumn && !cellRightClickConfig.hideColumn && !cellRightClickConfig.columnWidth) {
        const _sep31 = document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator"); if (_sep31) _sep31.style.display = "none";
      }
      if (!cellRightClickConfig.sort) {
        const _sep32 = document.querySelector("#luckysheet-cols-rows-shift .luckysheet-menuseparator"); if (_sep32) _sep32.style.display = "none";
      }
      showrightclickmenu($menu, offset.left, offset.top + 18);
      Store.luckysheet_cols_menu_status = true;
    });
}
