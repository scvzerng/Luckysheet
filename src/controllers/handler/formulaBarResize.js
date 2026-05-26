import mobileinit from "../mobile";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetFreezen from "../freezen";
import luckysheetDropCell from "../dropCell";
import luckysheetPostil from "../postil";
import imageCtrl from "../imageCtrl";
import hyperlinkCtrl from "../hyperlinkCtrl";
import menuButton from "../menuButton";
import conditionformat from "../conditionformat";
import alternateformat from "../alternateformat";
import ifFormulaGenerator from "../ifFormulaGenerator";
import sheetmanage from "../sheetmanage";
import { luckysheetupdateCell } from "../updateCell";
import { luckysheet_searcharray } from "../sheetSearch";
import luckysheetsizeauto from "../resize";
import { luckysheetMoveHighlightCell } from "../sheetMove";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";
import selection from "../selection";
import controlHistory from "../controlHistory";
import { hideMenuByCancel } from "../../global/cursorPos";
import { luckysheetdefaultstyle } from "../constant";

import {
    replaceHtml,
    getObjType,
    chatatABC,
    ArrayUnique,
    showrightclickmenu,
    luckysheetactiveCell,
    luckysheetContainerFocus,
    $$,
} from "../../utils/util";
import { getSheetIndex, getRangetxt } from "../../methods/get";
import { rowLocation, colLocation, mouseposition } from "../../global/location";
import { rowlenByRange } from "../../global/getRowlen";
import { isRealNull, hasPartMC, isEditMode, checkIsAllowEdit } from "../../global/validate";
import { countfunc } from "../../global/count";
import browser from "../../global/browser";
import formula from "../../global/formula";
import { luckysheetextendtable } from "../../global/extend";
import luckysheetscrollevent from "../../global/scroll";
import { jfrefreshgrid, jfrefreshgrid_rhcw, luckysheetrefreshgrid } from "../../global/refresh";
import { getdatabyselection, datagridgrowth } from "../../global/getdata";
import tooltip from "../../global/tooltip";
import editor from "../../global/editor";
import { genarate, update } from "../../global/format";
import method from "../../global/method";
import { getBorderInfoCompute } from "../../global/border";
import { luckysheetDrawMain } from "../../global/draw";
import locale from "../../locale/locale";
import Store from "../../store";
import luckysheetformula from "../../global/formula";
import context from "./context";

export default function formulaBarResize() {
    $("#luckysheet-wa-calculate-size").mousedown(function(e) {
        let y = e.pageY;
        formula.functionResizeData.y = y;
        formula.functionResizeStatus = true;
        formula.functionResizeData.calculatebarHeight = Store.calculatebarHeight;
        if (formula.rangetosheet && formula.rangetosheet != null) {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
        }
    });

    // 点击设置字体大小的下拉箭头，把自动聚焦输入框去除（认为下拉设置字体大小，不需要聚焦输入框）
    // //toolbar菜单
    // $("#" + Store.container + " .luckysheet-wa-editor").on("click", ".luckysheet-toolbar-zoom-combobox", function (e) {
    //     $(e.currentTarget).addClass("luckysheet-toolbar-combo-button-open");
    //     $(e.currentTarget).find(".luckysheet-toolbar-combo-button-input").focus();
    // });

    // $("#" + Store.container + " .luckysheet-wa-editor").on("blur", ".luckysheet-toolbar-combo-button-input", function (e) {
    //     $(e.currentTarget).closest(".luckysheet-toolbar-zoom-combobox").removeClass("luckysheet-toolbar-combo-button-open");
    // });

    //表格格式处理
    menuButton.initialMenuButton();

    let dpi_x = document.getElementById("testdpidiv").offsetWidth * Store.devicePixelRatio;
    let dpi_y = document.getElementById("testdpidiv").offsetHeight * Store.devicePixelRatio;
}
