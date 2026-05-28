import { jfrefreshgrid_rhcw } from '../../../global/refresh';
import tooltip from '../../../global/tooltip';
import { isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import { getCurrentFile, syncConfigToStore, getDataSize } from '../../../utils/storeAccess.js';
import Store from '../../../store';
import { luckysheetContainerFocus } from '../../../utils/util';
import imageCtrl from '../../imageCtrl';

export function initRowColWidthEvents() {
  
    //行高列宽设置
    // $("#luckysheet-rows-cols-changesize").click(function(){
    $("#luckysheet-column-row-width-selected").click(function (event) {
      // Click input element, don't comfirm
      if (event.target.nodeName === "INPUT") {
        return;
      }
      $("#luckysheet-rightclick-menu").hide();
      luckysheetContainerFocus();
  
      // let size = parseInt($(this).siblings("input[type='number']").val().trim());
      let size = parseInt($(this).closest(".luckysheet-cols-menuitem").find("input[type='number']").val().trim());
      const locale_info = locale().info;
  
      /* 对异常情况进行判断：NaN */
      if (isNaN(size)) {
        tooltip.info(locale_info.tipInputNumber, "");
        return;
      }
      let cfg = $.extend(true, {}, Store.config);
      let type;
      let images = null;
      if (Store.luckysheetRightHeadClickIs == "row") {
        if (size < 0 || size > 545) {
          if (isEditMode()) {
            alert(locale_info.tipRowHeightLimit);
          } else {
            tooltip.info(locale_info.tipRowHeightLimit, "");
          }
          return;
        }
        type = "resizeR";
        if (cfg["rowlen"] == null) {
          cfg["rowlen"] = {};
        }
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let r1 = Store.luckysheet_select_save[s].row[0];
          let r2 = Store.luckysheet_select_save[s].row[1];
          for (let r = r1; r <= r2; r++) {
            cfg["rowlen"][r] = size;
            images = imageCtrl.moveChangeSize("row", r, size);
          }
        }
      } else if (Store.luckysheetRightHeadClickIs == "column") {
        if (size < 0 || size > 2038) {
          if (isEditMode()) {
            alert(locale_info.tipColumnWidthLimit);
          } else {
            tooltip.info(locale_info.tipColumnWidthLimit, "");
          }
          return;
        }
        type = "resizeC";
        if (cfg["columnlen"] == null) {
          cfg["columnlen"] = {};
        }
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let c1 = Store.luckysheet_select_save[s].column[0];
          let c2 = Store.luckysheet_select_save[s].column[1];
          for (let c = c1; c <= c2; c++) {
            cfg["columnlen"][c] = size;
            images = imageCtrl.moveChangeSize("column", c, size);
          }
        }
      }
      if (Store.clearjfundo) {
        Store.jfundo.length = 0;
        Store.jfredo.push({
          type: "resize",
          ctrlType: type,
          sheetIndex: Store.currentSheetIndex,
          config: $.extend(true, {}, Store.config),
          curconfig: $.extend(true, {}, cfg),
          images: $.extend(true, {}, imageCtrl.images),
          curImages: $.extend(true, {}, images)
        });
      }
  
      //config
      Store.config = cfg;
      syncConfigToStore();

      //images
      getCurrentFile().images = images;
      imageCtrl.images = images;
      imageCtrl.allImagesShow();
      let _dataSize = getDataSize();
      if (Store.luckysheetRightHeadClickIs == "row") {
        jfrefreshgrid_rhcw(_dataSize.rowCount, null);
      } else if (Store.luckysheetRightHeadClickIs == "column") {
        jfrefreshgrid_rhcw(null, _dataSize.colCount);
      }
    });
}
