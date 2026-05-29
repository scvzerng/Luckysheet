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
    const _freezenBtnH = document.getElementById("luckysheet-freezen-btn-horizontal"); if (_freezenBtnH) _freezenBtnH.addEventListener("click", function() {
        if (this.textContent.trim() == locale().freezen.freezenCancel) {
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
            const _menuBtn = document.getElementById("luckysheet-icon-freezen-menu-menuButton");
            const _check = _menuBtn ? _menuBtn.querySelector(".fa.fa-check") : null;
            if (_check) _check.remove();
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

    const _freezenBtnV = document.getElementById("luckysheet-freezen-btn-vertical"); if (_freezenBtnV) _freezenBtnV.addEventListener("click", function() {
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
