import { jfrefreshgrid_rhcw } from '../../../global/refresh';
import tooltip from '../../../global/tooltip';
import { isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import { syncConfigToStore, getDataSize } from '../../../utils/storeAccess.js';
import Store from '../../../store';
import { luckysheetContainerFocus } from '../../../utils/util';
import rightClickMenu from '../../../ui/rightClickMenu.js';

export function initHideShowEvents() {
  
    //隐藏选中行列
    $("#luckysheet-hide-selected").click(function (event) {
      rightClickMenu.hide();
      luckysheetContainerFocus();
      const locale_drag = locale().drag;
      if (Store.luckysheet_select_save.length > 1) {
        if (Store.luckysheetRightHeadClickIs == "row") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        } else if (Store.luckysheetRightHeadClickIs == "column") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        }
        return;
      }
  
      // 隐藏�?
      if (Store.luckysheetRightHeadClickIs == "row") {
        let cfg = structuredClone(Store.config);
        if (cfg["rowhidden"] == null) {
          cfg["rowhidden"] = {};
        }
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let r1 = Store.luckysheet_select_save[s].row[0],
            r2 = Store.luckysheet_select_save[s].row[1];
          for (let r = r1; r <= r2; r++) {
            cfg["rowhidden"][r] = 0;
          }
        }
  
        //保存撤销
        if (Store.clearjfundo) {
          let redo = {};
          redo["type"] = "showHidRows";
          redo["sheetIndex"] = Store.currentSheetIndex;
          redo["config"] = structuredClone(Store.config);
          redo["curconfig"] = cfg;
          Store.jfundo.length = 0;
          Store.jfredo.push(redo);
        }
  
        //config
        Store.config = cfg;
        syncConfigToStore();

        let _dataSize = getDataSize();
        jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);
      }
      // 隐藏列
      else if (Store.luckysheetRightHeadClickIs == "column") {
        let cfg = structuredClone(Store.config);
        if (cfg["colhidden"] == null) {
          cfg["colhidden"] = {};
        }
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let c1 = Store.luckysheet_select_save[s].column[0],
            c2 = Store.luckysheet_select_save[s].column[1];
          for (let c = c1; c <= c2; c++) {
            cfg["colhidden"][c] = 0;
          }
        }
  
        //保存撤销
        if (Store.clearjfundo) {
          let redo = {};
          redo["type"] = "showHidCols";
          redo["sheetIndex"] = Store.currentSheetIndex;
          redo["config"] = structuredClone(Store.config);
          redo["curconfig"] = cfg;
          Store.jfundo.length = 0;
          Store.jfredo.push(redo);
        }
  
        //config
        Store.config = cfg;
        syncConfigToStore();

        let _dataSize2 = getDataSize();
        jfrefreshgrid_rhcw(_dataSize2.rowCount, _dataSize2.colCount);
      }
    });

    //取消隐藏选中行列
    $("#luckysheet-show-selected").click(function (event) {
      rightClickMenu.hide();
      luckysheetContainerFocus();
      const locale_drag = locale().drag;
      if (Store.luckysheet_select_save.length > 1) {
        if (Store.luckysheetRightHeadClickIs == "row") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        } else if (Store.luckysheetRightHeadClickIs == "column") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        }
        return;
      }
  
      // 取消隐藏�?
      if (Store.luckysheetRightHeadClickIs == "row") {
        let cfg = structuredClone(Store.config);
        if (cfg["rowhidden"] == null) {
          return;
        }
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let r1 = Store.luckysheet_select_save[s].row[0],
            r2 = Store.luckysheet_select_save[s].row[1];
          for (let r = r1; r <= r2; r++) {
            delete cfg["rowhidden"][r];
          }
        }
  
        //保存撤销
        if (Store.clearjfundo) {
          let redo = {};
          redo["type"] = "showHidRows";
          redo["sheetIndex"] = Store.currentSheetIndex;
          redo["config"] = structuredClone(Store.config);
          redo["curconfig"] = cfg;
          Store.jfundo.length = 0;
          Store.jfredo.push(redo);
        }
  
        //config
        Store.config = cfg;
        syncConfigToStore();

        let _dataSize3 = getDataSize();
        jfrefreshgrid_rhcw(_dataSize3.rowCount, _dataSize3.colCount);
      } else if (Store.luckysheetRightHeadClickIs == "column") {
        let cfg = structuredClone(Store.config);
        if (cfg["colhidden"] == null) {
          return;
        }
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let c1 = Store.luckysheet_select_save[s].column[0],
            c2 = Store.luckysheet_select_save[s].column[1];
          for (let c = c1; c <= c2; c++) {
            delete cfg["colhidden"][c];
          }
        }
  
        //保存撤销
        if (Store.clearjfundo) {
          let redo = {};
          redo["type"] = "showHidCols";
          redo["sheetIndex"] = Store.currentSheetIndex;
          redo["config"] = structuredClone(Store.config);
          redo["curconfig"] = cfg;
          Store.jfundo.length = 0;
          Store.jfredo.push(redo);
        }
  
        //config
        Store.config = cfg;
        syncConfigToStore();

        let _dataSize4 = getDataSize();
        jfrefreshgrid_rhcw(_dataSize4.rowCount, _dataSize4.colCount);
      }
    });
}
