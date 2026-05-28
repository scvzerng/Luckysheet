import {  selectionCopyShow } from "../select";
import {  getFileBySheetIndex } from "../../utils/storeAccess.js";
import Store from "../../store";
import resizeHandles from '../../ui/resizeHandles.js';
const paintFormatModule = {
  cancelPaintModel: function () {
    let _this = this;
    resizeHandles.sheetTable.removeClass("luckysheetPaintCursor");
    if (Store.luckysheet_copy_save["dataSheetIndex"] == Store.currentSheetIndex) {
      Store.luckysheet_selection_range = [];
      selectionCopyShow();
    } else {
      getFileBySheetIndex(Store.luckysheet_copy_save["dataSheetIndex"]).luckysheet_selection_range = [];
    }
    Store.luckysheet_copy_save = {};
    _this.luckysheetPaintModelOn = false;
    $("#luckysheetpopover").fadeOut(200, function () {
      $("#luckysheetpopover").remove();
    });
  },
  luckysheetPaintModelOn: false,
  luckysheetPaintSingle: false
};
export default paintFormatModule;