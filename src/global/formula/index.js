import { replaceHtml, getObjType, chatatABC, ABCatNum, luckysheetfontformat } from "../../utils/util";
import { getSheetIndex, getRangetxt, getluckysheetfile } from "../../methods/get";
import { setluckysheetfile } from "../../methods/set";
import { luckyColor } from "../../controllers/constant";
import sheetmanage from "../../controllers/sheetmanage";
import menuButton from "../../controllers/menuButton";
import luckysheetFreezen from "../../controllers/freezen";
import { seletedHighlistByindex, luckysheet_count_show } from "../../controllers/select";
import { isRealNum, isRealNull, valueIsError, isEditMode } from "../validate";
import { isdatetime, isdatatype } from "../datecontroll";
import { getCellTextSplitArr, getCellTextInfo } from "../getRowlen";
import { getcellvalue, getcellFormula, getInlineStringNoStyle, getOrigincell } from "../getdata";
import { setcellvalue } from "../setdata";
import { genarate, valueShowEs } from "../format";
import editor from "../editor";
import tooltip from "../tooltip";
import { rowLocation, colLocation, colLocationByIndex, mouseposition } from "../location";
import { luckysheetRangeLast } from "../cursorPos";
import { jfrefreshgrid } from "../refresh";
import { isInlineStringCell, convertSpanToShareString } from "../../controllers/inlineString";
// import luckysheet_function from '../function/luckysheet_function';
// import functionlist from '../function/functionlist';
import {
    luckysheet_compareWith,
    luckysheet_getarraydata,
    luckysheet_getcelldata,
    luckysheet_parseData,
    luckysheet_getValue,
    luckysheet_indirect_check,
    luckysheet_indirect_check_return,
    luckysheet_offset_check,
    luckysheet_calcADPMM,
    luckysheet_getSpecialReference,
} from "../../function/func";
import Store from "../../store";
import locale from "../../locale/locale";
import json from "../json";
import method from "../method";

import error from "./error.js";
import dataRead from "./dataRead.js";
import xss from "./xss.js";
import compare from "./compare.js";
import cellRange from "./cellRange.js";
import formulaString from "./formulaString.js";
import formulaParser from "./formulaParser.js";
import calcChain from "./calcChain.js";
import dependency from "./dependency.js";
import formulaExec from "./formulaExec.js";
import formulaBar from "./formulaBar.js";
import functionSearch from "./functionSearch.js";
import rangeSelect from "./rangeSelect.js";
import rangeHighlight from "./rangeHighlight.js";
import cursorManager from "./cursorManager.js";
import cellUpdate from "./cellUpdate.js";
import refreshButton from "./refreshButton.js";

const luckysheetformula = {
    ...error,
    ...dataRead,
    ...xss,
    ...compare,
    ...cellRange,
    ...formulaString,
    ...formulaParser,
    ...calcChain,
    ...dependency,
    ...formulaExec,
    ...formulaBar,
    ...functionSearch,
    ...rangeSelect,
    ...rangeHighlight,
    ...cursorManager,
    ...cellUpdate,
    ...refreshButton,
};

export default luckysheetformula;
