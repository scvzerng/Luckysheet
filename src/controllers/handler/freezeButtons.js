import luckysheetFreezen from "../freezen";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";

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
import {  luckysheetrefreshgrid  } from "../../global/refresh";
import locale from "../../locale/locale";

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
