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

export default function freezeButtons() {
    //冻结行列
    $("#luckysheet-freezen-btn-horizontal").click(function() {
        if ($.trim($(this).text()) == locale().freezen.freezenCancel) {
            luckysheetFreezen.saveFrozen("freezenCancel");

            if (luckysheetFreezen.freezenverticaldata != null) {
                luckysheetFreezen.cancelFreezenVertical();
                luckysheetFreezen.createAssistCanvas();
                luckysheetrefreshgrid();
            }

            if (luckysheetFreezen.freezenhorizontaldata != null) {
                luckysheetFreezen.cancelFreezenHorizontal();
                luckysheetFreezen.createAssistCanvas();
                luckysheetrefreshgrid();
            }

            luckysheetFreezen.scrollAdapt();
            // cancel 之后 勾勾取消
            $("#luckysheet-icon-freezen-menu-menuButton")
                .find(".fa.fa-check")
                .remove();
        } else {
            luckysheetFreezen.saveFrozen("freezenRow");

            if (luckysheetFreezen.freezenverticaldata != null) {
                luckysheetFreezen.cancelFreezenVertical();
                luckysheetFreezen.createAssistCanvas();
                luckysheetrefreshgrid();
            }

            if (luckysheetFreezen.freezenhorizontaldata == null) {
                luckysheetFreezen.createFreezenHorizontal();
                luckysheetFreezen.createAssistCanvas();
            }
        }
    });

    $("#luckysheet-freezen-btn-vertical").click(function() {
        if (luckysheetFreezen.freezenverticaldata != null) {
            luckysheetFreezen.saveFrozen("freezenCancel");

            luckysheetFreezen.cancelFreezenVertical();
            luckysheetrefreshgrid();
        } else {
            luckysheetFreezen.saveFrozen("freezenColumn");

            luckysheetFreezen.createFreezenVertical();
        }
        luckysheetFreezen.createAssistCanvas();
    });
}
