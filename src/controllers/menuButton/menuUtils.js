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
const menuUtilsModule = {
  rightclickmenu: null,
  submenuhide: {},
  focus: function ($obj, value) {
    if ($obj.attr("id") == "luckysheet-icon-font-family-menuButton") {
      if (isdatatypemulti(value)["num"]) {
        let _locale = locale();
        const locale_fontarray = _locale.fontarray;
        value = locale_fontarray[parseInt(value)];
        if (value == null) {
          value = this.defualtFont[itemvalue];
        }
      }
    }
    $obj.find(".luckysheet-cols-menuitem").find("span.icon").html("");
    if (value == null) {
      $obj.find(".luckysheet-cols-menuitem").eq(0).find("span.icon").html('<i class="fa fa-check luckysheet-mousedown-cancel"></i>');
    } else {
      $obj.find(".luckysheet-cols-menuitem[itemvalue='" + value + "']").find("span.icon").html('<i class="fa fa-check luckysheet-mousedown-cancel"></i>');
    }
  },
  createButtonMenu: function (itemdata) {
    let itemset = "";
    let _this = this;
    for (let i = 0; i < itemdata.length; i++) {
      let item = itemdata[i];
      if (item.value == "split") {
        itemset += _this.split;
      } else {
        if (item.example == "more") {
          // itemset += replaceHtml(_this.item, {"value": item.value, "name": item.text, "example": "►", "sub": "luckysheet-cols-submenu"});
          itemset += replaceHtml(_this.item, {
            value: item.value,
            name: item.text,
            example: "",
            sub: "luckysheet-cols-submenu",
            iconClass: "iconfont-luckysheet luckysheet-iconfont-youjiantou"
          });
        } else {
          itemset += replaceHtml(_this.item, {
            value: item.value,
            name: item.text,
            example: item.example,
            sub: "",
            iconClass: ""
          });
        }
      }
    }
    return itemset;
  }
};
export default menuUtilsModule;