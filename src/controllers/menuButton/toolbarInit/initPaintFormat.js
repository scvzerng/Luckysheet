import tooltip from '../../../global/tooltip';
import { checkIsAllowEdit, hasPartMC, isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { getObjType, isRowHidden } from '../../../utils/util';
import { selectionCopyShow } from '../../select';
import resizeHandles from '../../../ui/resizeHandles.js';

export function initPaintFormat(_this) {
      //格式�?
      document.getElementById("luckysheet-icon-paintformat")?.addEventListener("click", function (e) {
        // *如果禁止前台编辑，则中止下一步操�?
        if (!checkIsAllowEdit()) {
          return;
        }
        e.stopPropagation();
        let _locale = locale();
        let locale_paint = _locale.paint;
        if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
          if (isEditMode()) {
            alert(locale_paint.tipSelectRange);
          } else {
            tooltip.info("", locale_paint.tipSelectRange);
          }
          return;
        } else if (Store.luckysheet_select_save.length > 1) {
          if (isEditMode()) {
            alert(locale_paint.tipNotMulti);
          } else {
            tooltip.info("", locale_paint.tipNotMulti);
          }
          return;
        }
  
        // *增加了对选区范围是否为部分合并单元格的校验，如果为部分合并单元格，就阻止格式刷的下一�?
        // TODO 这里也可以改为：判断到是合并单元格的一部分后，格式刷执行黏贴格式后删除范围单元格的 mc �?
  
        let has_PartMC = false;
        let r1 = Store.luckysheet_select_save[0].row[0],
          r2 = Store.luckysheet_select_save[0].row[1];
        let c1 = Store.luckysheet_select_save[0].column[0],
          c2 = Store.luckysheet_select_save[0].column[1];
        has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);
        if (has_PartMC) {
          // *提示后中止下一�?
          tooltip.info(_locale.merge.partiallyError, "");
          return;
        }
        tooltip.popover("<i class='fa fa-paint-brush'></i> " + locale_paint.start + "", "topCenter", true, null, locale_paint.end, function () {
          _this.cancelPaintModel();
        });
        resizeHandles.sheetTable.addClass("luckysheetPaintCursor");
        Store.luckysheet_selection_range = [{
          row: Store.luckysheet_select_save[0].row,
          column: Store.luckysheet_select_save[0].column
        }];
        selectionCopyShow();
        let RowlChange = false,
          HasMC = false;
        for (let r = Store.luckysheet_select_save[0].row[0]; r <= Store.luckysheet_select_save[0].row[1]; r++) {
          if (isRowHidden(r)) {
            continue;
          }
          if (Store.config["rowlen"] != null && r in Store.config["rowlen"]) {
            RowlChange = true;
          }
          for (let c = Store.luckysheet_select_save[0].column[0]; c <= Store.luckysheet_select_save[0].column[1]; c++) {
            let cell = Store.sheetData[r][c];
            if (getObjType(cell) == "object" && "mc" in cell && cell.mc.rs != null) {
              HasMC = true;
            }
          }
        }
        Store.luckysheet_copy_save = {
          dataSheetIndex: Store.currentSheetIndex,
          copyRange: [{
            row: Store.luckysheet_select_save[0].row,
            column: Store.luckysheet_select_save[0].column
          }],
          RowlChange: RowlChange,
          HasMC: HasMC
        };
        _this.luckysheetPaintModelOn = true;
        _this.luckysheetPaintSingle = true;
      });
      document.getElementById("luckysheet-icon-paintformat")?.addEventListener("dblclick", function () {
        // *如果禁止前台编辑，则中止下一步操�?
        if (!checkIsAllowEdit()) {
          return;
        }
        let _locale = locale();
        let locale_paint = _locale.paint;
        if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length == 0) {
          if (isEditMode()) {
            alert(locale_paint.tipSelectRange);
          } else {
            tooltip.info("", locale_paint.tipSelectRange);
          }
          return;
        } else if (Store.luckysheet_select_save.length > 1) {
          if (isEditMode()) {
            alert(locale_paint.tipNotMulti);
          } else {
            tooltip.info("", locale_paint.tipNotMulti);
          }
          return;
        }
        tooltip.popover("<i class='fa fa-paint-brush'></i> " + locale_paint.start, "topCenter", true, null, locale_paint.end, function () {
          _this.cancelPaintModel();
        });
        resizeHandles.sheetTable.addClass("luckysheetPaintCursor");
        Store.luckysheet_selection_range = [{
          row: Store.luckysheet_select_save[0].row,
          column: Store.luckysheet_select_save[0].column
        }];
        selectionCopyShow();
        let RowlChange = false,
          HasMC = false;
        for (let r = Store.luckysheet_select_save[0].row[0]; r <= Store.luckysheet_select_save[0].row[1]; r++) {
          if (isRowHidden(r)) {
            continue;
          }
          if (Store.config["rowlen"] != null && r in Store.config["rowlen"]) {
            RowlChange = true;
          }
          for (let c = Store.luckysheet_select_save[0].column[0]; c <= Store.luckysheet_select_save[0].column[1]; c++) {
            let cell = Store.sheetData[r][c];
            if (getObjType(cell) == "object" && "mc" in cell && cell.mc.rs != null) {
              HasMC = true;
            }
          }
        }
        Store.luckysheet_copy_save = {
          dataSheetIndex: Store.currentSheetIndex,
          copyRange: [{
            row: Store.luckysheet_select_save[0].row,
            column: Store.luckysheet_select_save[0].column
          }],
          RowlChange: RowlChange,
          HasMC: HasMC
        };
        _this.luckysheetPaintModelOn = true;
        _this.luckysheetPaintSingle = false;
      });
}
