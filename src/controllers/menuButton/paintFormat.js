import {  selectionCopyShow } from "../select";
import {  getSheetIndex } from "../../methods/get";
import Store from "../../store";
const paintFormatModule = {
  cancelPaintModel: function () {
    let _this = this;
    $("#luckysheet-sheettable_0").removeClass("luckysheetPaintCursor");
    if (Store.luckysheet_copy_save["dataSheetIndex"] == Store.currentSheetIndex) {
      Store.luckysheet_selection_range = [];
      selectionCopyShow();
    } else {
      Store.luckysheetfile[getSheetIndex(Store.luckysheet_copy_save["dataSheetIndex"])].luckysheet_selection_range = [];
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