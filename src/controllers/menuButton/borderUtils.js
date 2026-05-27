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
const borderUtilsModule = {
  borderfix: function (d, r, c) {
    // return [-1, -1, 2, 2];

    let cell = d[r][c];
    let bg = null;
    if (cell == null) {
      return [-1, 0, 0, -1];
    } else if (d[r][c].bg == null || d[r][c].bg == "") {
      return [-1, 0, 0, -1];
    } else {
      return [-2, -1, 1, 0];
      //return [-2, -2, 1, 0];
    }
  },
  setLineDash: function (canvasborder, type, hv, m_st, m_ed, line_st, line_ed) {
    let borderType = {
      "0": "none",
      "1": "Thin",
      "2": "Hair",
      "3": "Dotted",
      "4": "Dashed",
      "5": "DashDot",
      "6": "DashDotDot",
      "7": "Double",
      "8": "Medium",
      "9": "MediumDashed",
      "10": "MediumDashDot",
      "11": "MediumDashDotDot",
      "12": "SlantedDashDot",
      "13": "Thick"
    };
    type = borderType[type.toString()];
    try {
      if (type == "Hair") {
        canvasborder.setLineDash([1, 2]);
      } else if (type.indexOf("DashDotDot") > -1) {
        canvasborder.setLineDash([2, 2, 5, 2, 2]);
      } else if (type.indexOf("DashDot") > -1) {
        canvasborder.setLineDash([2, 5, 2]);
      } else if (type.indexOf("Dotted") > -1) {
        canvasborder.setLineDash([2]);
      } else if (type.indexOf("Dashed") > -1) {
        canvasborder.setLineDash([3]);
      } else {
        canvasborder.setLineDash([0]);
      }
    } catch (e) {
      console.log(e);
    }
    canvasborder.beginPath();
    if (type.indexOf("Medium") > -1) {
      if (hv == "h") {
        canvasborder.moveTo(m_st, m_ed - 0.5);
        canvasborder.lineTo(line_st, line_ed - 0.5);
      } else {
        canvasborder.moveTo(m_st - 0.5, m_ed);
        canvasborder.lineTo(line_st - 0.5, line_ed);
      }
      canvasborder.lineWidth = 2;
    } else if (type == "Thick") {
      canvasborder.moveTo(m_st, m_ed);
      canvasborder.lineTo(line_st, line_ed);
      canvasborder.lineWidth = 3;
    } else {
      canvasborder.moveTo(m_st, m_ed);
      canvasborder.lineTo(line_st, line_ed);
      canvasborder.lineWidth = 1;
    }
  }
};
export default borderUtilsModule;