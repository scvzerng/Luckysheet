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
const templatesModule = {
  menu: '<div class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-menuButton ${subclass} luckysheet-mousedown-cancel" id="luckysheet-icon-${id}-menuButton">${item}</div>',
  // "item": '<div itemvalue="${value}" itemname="${name}" class="luckysheet-cols-menuitem ${sub} luckysheet-mousedown-cancel"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 0px 3px 1px;"><span style="margin-right:3px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span> ${name} <span class="luckysheet-submenu-arrow luckysheet-mousedown-cancel" style="user-select: none;">${example}</span></div></div>',
  item: '<div itemvalue="${value}" itemname="${name}" class="luckysheet-cols-menuitem ${sub} luckysheet-mousedown-cancel"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="padding: 3px 0px 3px 1px;"><span style="margin-right:3px;width:13px;display:inline-block;" class="icon luckysheet-mousedown-cancel"></span> ${name} <span class="luckysheet-submenu-arrow luckysheet-mousedown-cancel ${iconClass}" style="user-select: none;">${example}</span></div></div>',
  split: '<div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div>',
  color: '<div class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-rightgclick-menu-sub luckysheet-mousedown-cancel luckysheet-menuButton ${sub}" id="${id}"><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel luckysheet-color-reset"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${resetColor}</div></div> <div class="luckysheet-mousedown-cancel"> <div class="luckysheet-mousedown-cancel"> <input type="text" class="luckysheet-color-selected" /> </div> </div> <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div> ${coloritem}</div>',
  coloritem: '<div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel ${class}"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${name}</div></div>',
  subcolor: '<div id="luckysheet-icon-${id}-menuButton" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-rightgclick-menu-sub luckysheet-menuButton-sub luckysheet-mousedown-cancel"> <div class="luckysheet-mousedown-cancel"> <div class="luckysheet-mousedown-cancel"> <input type="text" class="luckysheet-color-selected" /> </div> </div></div>'
};
export default templatesModule;