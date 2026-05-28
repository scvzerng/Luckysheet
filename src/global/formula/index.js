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
