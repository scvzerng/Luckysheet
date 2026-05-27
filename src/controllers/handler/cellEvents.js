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
import menuButton from "../menuButton";
import context from "./context";

import { handleCellMousedown } from './cellEventsSub/handleCellMousedown.js';
import { handleCellMouseup } from './cellEventsSub/handleCellMouseup.js';
import { handleCellDblclick } from './cellEventsSub/handleCellDblclick.js';

export default function cellEvents() {
    $(window).resize(function() {
        let luckysheetDocument = document.getElementById(Store.container);
        if (luckysheetDocument) {
            luckysheetsizeauto();
        }
    });

    $("#luckysheet-rich-text-editor").mouseup(function(e) {
        menuButton.inputMenuButtonFocus(e.target);
    });

    $("#luckysheet-cell-main, #luckysheetTableContent")
        .mousedown(function(event) {
            handleCellMousedown(event);
        })
        .mouseup(function(event) {
            handleCellMouseup(event);
        })
        .dblclick(function(event) {
            handleCellDblclick(event);
        });
}
