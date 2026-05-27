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
const styleReadModule = {
  getStyleByCell: function (d, r, c) {
    let _this = this;
    let style = "";

    //交替颜色
    let af_compute = alternateformat.getComputeMap();
    let checksAF = alternateformat.checksAF(r, c, af_compute);

    //条件格式
    let cf_compute = conditionformat.getComputeMap();
    let checksCF = conditionformat.checksCF(r, c, cf_compute);
    const locale_fontarray = locale().fontarray;
    let cell = d[r][c];
    let ct = cell.ct,
      isInline = false;
    if (isInlineStringCell(cell)) {
      isInline = true;
    }
    for (let key in cell) {
      let value = _this.checkstatus(d, r, c, key);
      if (checksAF != null || checksCF != null && checksCF["cellColor"] != null) {
        if (checksCF != null && checksCF["cellColor"] != null) {
          style += "background: " + checksCF["cellColor"] + ";";
        } else if (checksAF != null) {
          style += "background: " + checksAF[1] + ";";
        }
      }
      if (getObjType(value) == "object") {
        continue;
      }
      if (key == "bg" || checksAF != null || checksCF != null && checksCF["cellColor"] != null) {
        if (checksCF != null && checksCF["cellColor"] != null) {
          style += "background: " + checksCF["cellColor"] + ";";
        } else if (checksAF != null) {
          style += "background: " + checksAF[1] + ";";
        } else {
          style += "background: " + value + ";";
        }
      }

      // if(!isInline){
      //     if(key == "bl" && value != "0"){
      //         style += "font-weight: bold;";
      //     }

      //     if(key == "it" && value != "0"){
      //         style += "font-style:italic;";
      //     }

      //     if(key == "ff" && value != "0"){
      //         let f = value;
      //         if(!isNaN(parseInt(value))){
      //             f = locale_fontarray[parseInt(value)];
      //         }
      //         style += "font-family: " + f + ";";
      //     }

      //     if(key == "fs" && value != "10"){
      //         style += "font-size: "+ value + "pt;";
      //     }

      //     if((key == "fc" && value != "#000000") || checksAF != null || (checksCF != null && checksCF["textColor"] != null)){
      //         if(checksCF != null && checksCF["textColor"] != null){
      //             style += "color: " + checksCF["textColor"] + ";";
      //         }
      //         else if(checksAF != null){
      //             style += "color: " + checksAF[0] + ";";
      //         }
      //         else{
      //             style += "color: " + value + ";";
      //         }
      //     }
      // }

      if (key == "ht" && value != "1") {
        if (value == "0") {
          style += "text-align: center;";
        } else if (value == "2") {
          style += "text-align: right;";
        }
      }
      if (key == "vt") {
        if (value == "0") {
          style += "vertical-align: middle;";
        } else if (value == "1") {
          style += "vertical-align: top;";
        } else if (value == "2") {
          style += "vertical-align: bottom;";
        }
      }
      if (key == "un" && value) {
        style += "text-decoration:underline;";
      }
    }
    if (!isInline) {
      style += getFontStyleByCell(cell, checksAF, checksCF);
    }
    return style;
  }
};
export default styleReadModule;