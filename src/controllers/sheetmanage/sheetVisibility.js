import { isEditMode } from "../../global/validate";
import cleargridelement from "../../global/cleargridelement";
import { getdatabyselectionD, getcellvalue, datagridgrowth, getcellFormula } from "../../global/getdata";
import { setcellvalue } from "../../global/setdata";
import luckysheetcreatedom from "../../global/createdom";
import tooltip from "../../global/tooltip";
import formula from "../../global/formula";
import { luckysheetrefreshgrid, jfrefreshgrid_rhcw, jfrefreshgrid } from "../../global/refresh";
import rhchInit from "../../global/rhchInit";
import editor from "../../global/editor";
import { luckysheetextendtable, luckysheetdeletetable } from "../../global/extend";
import { isRealNum } from "../../global/validate";
import { replaceHtml, getObjType, chatatABC, arrayRemoveItem } from "../../utils/util";
import { sheetHTML, luckysheetlodingHTML } from "../constant";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetsizeauto from "../resize";
import luckysheetPostil from "../postil";
import imageCtrl from "../imageCtrl";
import hyperlinkCtrl from "../hyperlinkCtrl";
import luckysheetFreezen from "../freezen";
import { createFilterOptions, labelFilterOptionState } from "../filter";
import { selectHightlightShow, selectionCopyShow } from "../select";
import Store from "../../store";
import locale from "../../locale/locale";
import { changeSheetContainerSize, menuToolBarWidth } from "../resize";
import { zoomNumberDomBind } from "../zoom";
import menuButton from "../menuButton";
import method from "../../global/method";
import luckysheetformula from "../../global/formula";
import localforage from 'localforage';
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