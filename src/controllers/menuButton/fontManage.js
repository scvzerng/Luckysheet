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
const fontManageModule = {
  fontSelectList: [],
  defualtFont: ["Times New Roman", "Arial", "Tahoma", "Verdana", "微软雅黑", "宋体", "黑体", "楷体", "仿宋", "新宋体", "华文新魏", "华文行楷", "华文隶书"],
  addFontTolist: function (fontName) {
    fontName = fontName.replace(/"/g, "").replace(/'/g, "");
    let isNone = true;
    for (let a = 0; a < this.fontSelectList.length; a++) {
      let fItem = this.fontSelectList[a];
      if (fItem.value == fontName) {
        isNone = false;
        break;
      }
    }
    let _locale = locale();
    const locale_fontjson = _locale.fontjson;
    if (fontName in locale_fontjson) {
      isNone = false;
    }
    if (isNone) {
      let ret = {};
      ret.value = fontName;
      ret.index = this.fontSelectList.length;
      ret.type = "userDefined";
      ret.text = "<span class='luckysheet-mousedown-cancel' style='font-size:11px;font-family:" + fontName + "'>" + fontName + "</span>";
      ret.example = "";
      this.fontSelectList.push(ret);
      let $menuButton = $("#luckysheet-icon-font-family-menuButton");
      let itemset = this.createButtonMenu(this.fontSelectList);
      $menuButton.html(itemset);
    }
  },
  fontInitial: function (fontList) {
    let itemdata = [];
    const locale_fontarray = locale().fontarray;
    for (let a = 0; a < locale_fontarray.length; a++) {
      let fItem = locale_fontarray[a];
      let ret = {};
      ret.value = fItem;
      ret.index = a;
      ret.type = "inner";
      ret.text = "<span class='luckysheet-mousedown-cancel' style='font-size:11px;font-family:" + fItem + "'>" + fItem + "</span>";
      ret.example = "";
      itemdata.push(ret);
    }
    if (fontList != null) {
      for (let a = 0; a < fontList.length; a++) {
        let fItem = fontList[a];
        let ret = {};
        ret.value = fItem.fontName;
        ret.index = a;
        ret.type = "userDefined";
        ret.text = "<span class='luckysheet-mousedown-cancel' style='font-size:11px;font-family:" + fItem.fontName + "'>" + fItem.fontName + "</span>";
        ret.example = "";
        itemdata.push(ret);
        if (document.fonts && !document.fonts.check("12px " + fItem.fontName)) {
          if (fItem.url) {
            const fontface = new FontFace(fItem.fontName, `url(${fItem.url})`);
            document.fonts.add(fontface);
            fontface.load();
          }
        }
      }
      document.fonts && document.fonts.ready.then(function () {
        // Any operation that needs to be done only after all the fonts
        // have finished loading can go here.
        // console.log("font ready");
      });
    }
    this.fontSelectList = itemdata;
  }
};
export default fontManageModule;