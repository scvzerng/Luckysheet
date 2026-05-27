import { selectionCopyShow, selectIsOverlap } from "../select";
import { luckyColor, iconfontObjects } from "../constant";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetMoreFormat from "../moreFormat";
import alternateformat from "../alternateformat";
import conditionformat from "../conditionformat";
import { luckysheet_searcharray } from "../sheetSearch";
import luckysheetFreezen from "../freezen";
import luckysheetsizeauto from "../resize";
import { createFilter } from "../filter";
import luckysheetSearchReplace from "../searchReplace";
import luckysheetLocationCell from "../locationCell";
import ifFormulaGenerator from "../ifFormulaGenerator";
import { luckysheetupdateCell } from "../updateCell";
import insertFormula from "../insertFormula";
import sheetmanage from "../sheetmanage";
import luckysheetPostil from "../postil";
import { isRealNum, isRealNull, isEditMode, hasPartMC, checkIsAllowEdit } from "../../global/validate";
import tooltip from "../../global/tooltip";
import editor from "../../global/editor";
import { genarate, update, is_date } from "../../global/format";
import { jfrefreshgrid, luckysheetrefreshgrid } from "../../global/refresh";
import { sortSelection } from "../../global/sort";
import luckysheetformula from "../../global/formula";
import { rowLocationByIndex, colLocationByIndex } from "../../global/location";
import { isdatatypemulti } from "../../global/datecontroll";
import { rowlenByRange, getCellTextSplitArr } from "../../global/getRowlen";
import { setcellvalue } from "../../global/setdata";
import { getFontStyleByCell, checkstatusByCell } from "../../global/getdata";
import { countfunc } from "../../global/count";
import { hideMenuByCancel } from "../../global/cursorPos";
import { getSheetIndex, getRangetxt, getluckysheetfile } from "../../methods/get";
import { setluckysheetfile } from "../../methods/set";
import { isInlineStringCell, isInlineStringCT, updateInlineStringFormat, convertCssToStyleList, inlineStyleAffectAttribute, updateInlineStringFormatOutside } from "../inlineString";
import { replaceHtml, getObjType, rgbTohex, mouseclickposition, luckysheetfontformat, luckysheetContainerFocus } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";
import { checkTheStatusOfTheSelectedCells, frozenFirstRow, frozenFirstColumn } from "../../global/api";
const sizeUtilsModule = {
  getCellRealSize: function (d, cell_r, cell_c) {
    let _this = this;
    let width = Store.defaultcollen;
    let height = Store.defaultrowlen;
    let celldata = d[cell_r][cell_c];
    if (!!celldata && celldata["mc"] != null) {
      let mc = celldata["mc"];
      let margeset = _this.mergeborer(d, mc.r, mc.c);
      if (!!margeset) {
        let row = margeset.row[1];
        let row_pre = margeset.row[0];
        let row_index = margeset.row[2];
        let row_index_ed = margeset.row[3];
        let col = margeset.column[1];
        let col_pre = margeset.column[0];
        let col_index = margeset.column[2];
        let col_index_ed = margeset.column[3];
        width = col - col_pre - 1;
        height = row - row_pre - 1;
      }
    } else {
      let config = getluckysheetfile()[getSheetIndex(Store.currentSheetIndex)]["config"];
      if (config["columnlen"] != null && config["columnlen"][cell_c] != null) {
        width = config["columnlen"][cell_c];
      }
      if (config["rowlen"] != null && config["rowlen"][cell_r] != null) {
        height = config["rowlen"][cell_r];
      }
    }
    return [width, height];
  },
  getTextHeightCache: {},
  getTextSize: function (text, font) {
    let fontarray = locale().fontarray;
    let f = font || "10pt " + fontarray[0];
    let _this = this;
    if (f in _this.getTextHeightCache) {
      return _this.getTextHeightCache[f];
    }
    if ($("#luckysheetTextSizeTest").length == 0) {
      $('<span id="luckysheetTextSizeTest" style="float:left;white-space:nowrap;visibility:hidden;margin:0;padding:0;">' + text + "</span>").appendTo($("body"));
    }
    let o = $("#luckysheetTextSizeTest").text(text).css({
        font: f
      }),
      w = o.innerWidth(),
      h = o.innerHeight();
    _this.getTextHeightCache[f] = [w, h];
    return [w, h];
  }
};
export default sizeUtilsModule;