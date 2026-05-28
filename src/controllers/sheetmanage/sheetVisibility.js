import luckysheetConfigsetting from "../luckysheetConfigsetting";
import Store from "../../store";
import method from "../../global/method";
const sheetVisibilityModule = {
  setSheetHide: function (index, isDelete) {
    let _this = this;
    let currentIdx = _this.getSheetIndex(index);
    // 钩子 sheetHideBefore
    if (!isDelete && !method.createHookFunction("sheetHideBefore", {
      sheet: Store.luckysheetfile[currentIdx]
    })) {
      return;
    }
    Store.luckysheetfile[currentIdx].hide = 1;
    let luckysheetcurrentSheetitem = $("#luckysheet-sheets-item" + index);
    luckysheetcurrentSheetitem.hide();
    $("#luckysheet-sheet-area div.luckysheet-sheets-item").removeClass("luckysheet-sheets-item-active");
    let indicator;
    if (luckysheetConfigsetting.showsheetbarConfig.sheet) {
      indicator = luckysheetcurrentSheetitem.nextAll(":visible");
      if (luckysheetcurrentSheetitem.nextAll(":visible").length > 0) {
        indicator = indicator.eq(0).data("index");
      } else {
        indicator = luckysheetcurrentSheetitem.prevAll(":visible").eq(0).data("index");
      }
    } else {
      let nextActiveIdx,
        showSheetIdxs = [];
      Store.luckysheetfile.forEach((ele, index) => {
        if (1 !== ele.hide) showSheetIdxs.push(index);
      });
      let len = showSheetIdxs.length;
      if (1 === len) {
        nextActiveIdx = showSheetIdxs[0];
      } else {
        nextActiveIdx = showSheetIdxs[len - 1] > currentIdx ? showSheetIdxs.find(e => e > currentIdx) : showSheetIdxs[len - 1];
      }
      indicator = Store.luckysheetfile[nextActiveIdx].index;
    }
    $("#luckysheet-sheets-item" + indicator).addClass("luckysheet-sheets-item-active");
    _this.changeSheetExec(indicator);
    _this.locationSheet();

    // 钩子 sheetHideAfter
    if (!isDelete) {
      method.createHookFunction("sheetHideAfter", {
        sheet: Store.luckysheetfile[currentIdx]
      });
    }
  },
  setSheetShow: function (index) {
    let _this = this;
    const file = Store.luckysheetfile[_this.getSheetIndex(index)];
    // 钩子 sheetShowBefore
    if (!method.createHookFunction("sheetShowBefore", {
      sheet: file
    })) {
      return;
    }
    file.hide = 0;
    _this.changeSheetExec(index);

    // 钩子 sheetShowAfter
    method.createHookFunction("sheetShowAfter", {
      sheet: file
    });
  }
};
export default sheetVisibilityModule;