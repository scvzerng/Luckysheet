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

export default function bottomButtons() {
    $("#luckysheet-bottom-add-row, #luckysheet-bottom-add-row-input, #luckysheet-bottom-return-top").on(
        "mousedown dblclick mouseup",
        function(e) {
            e.stopPropagation();
        },
    );

    //底部添加行按钮
    $("#luckysheet-bottom-add-row").on("click", function(e) {
        $("#luckysheet-rightclick-menu").hide();
        luckysheetContainerFocus();

        let $t = $(this),
            value = $("#luckysheet-bottom-add-row-input").val();

        if (value == "") {
            value = luckysheetConfigsetting.addRowCount || 100;
        }

        if (isNaN(parseInt(value))) {
            if (isEditMode()) {
                alert(context.locale_info.tipInputNumber);
            } else {
                tooltip.info("error", context.locale_info.tipInputNumber);
            }
            return;
        }

        value = parseInt(value);
        if (value < 1 || value > 100) {
            if (isEditMode()) {
                alert(context.locale_info.tipInputNumberLimit);
            } else {
                tooltip.info("error", context.locale_info.tipInputNumberLimit);
            }
            return;
        }

        luckysheetextendtable("row", Store.flowdata.length - 1, value);
    });

    $("#luckysheet-bottom-return-top").on("click", function(e) {
        $("#luckysheet-scrollbar-y").scrollTop(0);
    });
}
