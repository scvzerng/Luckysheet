import { onNS, offNS } from '../../utils/migrationHelpers.js';
import luckysheetPostil from "../postil";
import { luckysheetMoveHighlightCell } from "../sheetMove";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";
import controlHistory from "../controlHistory";
import { hideMenuByCancel } from "../../global/cursorPos";
import { isInputBoxActive, hideModalMask } from "../../utils/domUtils.js";

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
import { countfunc } from "../../global/count";
import formula from "../../global/formula";
import Store from "../../store";
import rightClickMenu from "../../ui/rightClickMenu.js";
import conditionformatDialog from '../../ui/conditionformatDialog.js';
import functionBox from '../../ui/functionBox.js';

export default function globalEvents() {
    const _menuEl = document.getElementById("luckysheet-rightclick-menu");
    if (_menuEl) {
        const _menuInput = _menuEl.querySelector("input");
        if (_menuInput) _menuInput.addEventListener("keydown", function(e) {
            e.stopPropagation();
        });
    }

    const _mask = document.getElementById("luckysheet-modal-dialog-mask");
    if (_mask) {
        ["click", "dblclick", "mousedown", "mousemove", "mouseup"].forEach(function(evt) {
            _mask.addEventListener(evt, function(e) {
                e.stopPropagation();
                e.preventDefault();
            });
        });
    }

    let copychange = function() {
        if (document.hidden || document.webkitHidden || document.msHidden) {
            Store.iscopyself = false;
        }
    };

    onNS(document, "visibilitychange.luckysheetEvent", null, copychange);
    onNS(document, "webkitvisibilitychange.luckysheetEvent", null, copychange);
    onNS(document, "msvisibilitychange.luckysheetEvent", null, copychange);
    onNS(document, "mouseleave.luckysheetEvent", null, function() {
        Store.iscopyself = false;
    });
    onNS(document, "mousedown.luckysheetEvent", null, function(event) {
        luckysheetPostil.removeActivePs();

        hideMenuByCancel(event);

        if (
            event.target.closest("#luckysheet-wa-editor") !== null &&
            isInputBoxActive()
        ) {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
            luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
        }
    });

    //表格左上角点击 全选表格
    const _leftTop = document.getElementById("luckysheet-left-top"); if (_leftTop) _leftTop.addEventListener("click", function(event) {

        const _confirmBtn = document.getElementById("luckysheet-wa-functionbox-confirm"); if (_confirmBtn) _confirmBtn.click();
        Store.luckysheet_select_status = false;

        Store.luckysheet_select_save = [
            {
                row: [0, Store.flowdata.length - 1],
                column: [0, Store.flowdata[0].length - 1],
                row_focus: 0,
                column_focus: 0,
                row_select: true,
                column_select: true,
            },
        ];
        selectHightlightShow();

        clearTimeout(Store.countfuncTimeout);
        Store.countfuncTimeout = setTimeout(function() {
            countfunc();
        }, 500);


        event.stopPropagation();
    });

    //回退 重做 按钮
    const _undoBtn = document.getElementById("luckysheet-icon-undo"); if (_undoBtn) _undoBtn.addEventListener("click", function(event) {
        if (this.classList.contains("disabled")) {
            return;
        }
        controlHistory.redo(event);
    });
    const _redoBtn = document.getElementById("luckysheet-icon-redo"); if (_redoBtn) _redoBtn.addEventListener("click", function(event) {
        if (this.classList.contains("disabled")) {
            return;
        }
        controlHistory.undo(event);
    });

    //模态框拖动
    onNS(document, "mousedown.luckysheetEvent", "div.luckysheet-modal-dialog", function(e) {
        if (!e.target.matches(".luckysheet-modal-dialog")) {
            return;
        }

        Store.luckysheet_model_move_state = true;

        Store.luckysheet_model_move_obj = e.currentTarget;
        const _objRect = Store.luckysheet_model_move_obj.getBoundingClientRect();
        let toffset = {top: _objRect.top + window.pageYOffset, left: _objRect.left + window.pageXOffset};
        Store.luckysheet_model_xy = [e.pageX - toffset.left, e.pageY - toffset.top];
    });

    //模态框关闭
    onNS(document, "click.luckysheetEvent", ".luckysheet-modal-dialog-title-close, .luckysheet-model-close-btn", function(e) {
            //选择文本颜色和单元格颜色弹出框取消
            const _textColor = document.getElementById("textcolorselect");
            const _cellColor = document.getElementById("cellcolorselect");
            if ((_textColor && _textColor.offsetWidth > 0) || (_cellColor && _cellColor.offsetWidth > 0)) {
                conditionformatDialog.main.show();
            }
            const _modalDlg = e.currentTarget.closest(".luckysheet-modal-dialog"); if (_modalDlg) _modalDlg.style.display = 'none';
            hideModalMask();

            //函数查找功能所有弹出框关闭和取消
            if (
                this.closest(".luckysheet-modal-dialog")
                    ?.classList.contains("luckysheet-search-formula")
            ) {
                formula.dontupdate();
                luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            }
            if (
                this.closest(".luckysheet-modal-dialog")
                    ?.classList.contains("luckysheet-search-formula-parm")
            ) {
                formula.dontupdate();
                luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            }
            if (
                this.closest(".luckysheet-modal-dialog")
                    ?.classList.contains("luckysheet-search-formula-parm-select")
            ) {
                formula.dontupdate();
                luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            }

            luckysheetContainerFocus();
        },
    );
}
