import luckysheetDropCell from "../dropCell";
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
import { rowLocation, colLocation, mouseposition } from "../../global/location";
import {  isRealNull,  isEditMode } from "../../global/validate";
import { countfunc } from "../../global/count";
import Store from "../../store";
import { getScrollPosition } from "../../utils/domUtils.js";
import cellMain from "../../ui/cellMain.js";

export default function selectionDrag() {
    // //禁止前台编辑(只可 框选单元格、滚动查看表格)
    // if(!Store.allowEdit){
    //     return;
    // }

    //选区拖动替换
    const _dragHandle = cellMain.find("div.luckysheet-cs-draghandle");
    if (_dragHandle) _dragHandle.addEventListener("mousedown", function(event) {
        if (isEditMode() || Store.allowEdit === false) {
            //此模式下禁用选区拖动
            return;
        }

        const _elCellSel = document.getElementById("luckysheet-cell-selected");
        if (_elCellSel) {
            const _elFillHandle = _elCellSel.querySelector(".luckysheet-cs-fillhandle");
            if (_elFillHandle) _elFillHandle.style.cursor = "move";
            const _elDragHandle = _elCellSel.querySelector(".luckysheet-cs-draghandle");
            if (_elDragHandle) _elDragHandle.style.cursor = "move";
        }
        cellMain.setCursor("move");

        Store.luckysheet_cell_selected_move = true;
        Store.luckysheet_scroll_status = true;

        let mouse = mouseposition(event.pageX, event.pageY);
        let scroll = getScrollPosition();
        let x = mouse[0] + scroll.scrollLeft;
        let y = mouse[1] + scroll.scrollTop;

        let row_location = rowLocation(y),
            row_pre = row_location[0],
            row = row_location[1],
            row_index = row_location[2];
        let col_location = colLocation(x),
            col_pre = col_location[0],
            col = col_location[1],
            col_index = col_location[2];

        Store.luckysheet_cell_selected_move_index = [row_index, col_index];

        const _elCellSelectedMove = document.getElementById("luckysheet-cell-selected-move");
        if (_elCellSelectedMove) {
            Object.assign(_elCellSelectedMove.style, {
                left: col_pre + "px",
                width: col - col_pre - 1 + "px",
                top: row_pre + "px",
                height: row - row_pre - 1 + "px",
                display: "block",
            });
        }

        event.stopPropagation();
    });

    //选区下拉
    const _fillHandle = cellMain.find("div.luckysheet-cs-fillhandle");
    if (_fillHandle) {
        _fillHandle.addEventListener("mousedown", function(event) {
            if (isEditMode() || Store.allowEdit === false) {
                //此模式下禁用选区下拉
                return;
            }

            const _elCellSel2 = document.getElementById("luckysheet-cell-selected");
            if (_elCellSel2) {
                const _elFillHandle2 = _elCellSel2.querySelector(".luckysheet-cs-fillhandle");
                if (_elFillHandle2) _elFillHandle2.style.cursor = "crosshair";
                const _elDragHandle2 = _elCellSel2.querySelector(".luckysheet-cs-draghandle");
                if (_elDragHandle2) _elDragHandle2.style.cursor = "crosshair";
            }
            cellMain.setCursor("crosshair");

            let pageX = event.pageX, pageY = event.pageY;

            Store.luckysheet_cell_selected_extend_time = setTimeout(function() {
                Store.luckysheet_cell_selected_extend = true;
                Store.luckysheet_scroll_status = true;

                let mouse = mouseposition(pageX, pageY);
                let scroll = getScrollPosition();
                let x = mouse[0] + scroll.scrollLeft - 5;
                let y = mouse[1] + scroll.scrollTop - 5;

                let row_location = rowLocation(y),
                    row_pre = row_location[0],
                    row = row_location[1],
                    row_index = row_location[2];
                let col_location = colLocation(x),
                    col_pre = col_location[0],
                    col = col_location[1],
                    col_index = col_location[2];

                Store.luckysheet_cell_selected_extend_index = [row_index, col_index];

                const _elCellSelectedExtend = document.getElementById("luckysheet-cell-selected-extend");
                if (_elCellSelectedExtend) {
                    Object.assign(_elCellSelectedExtend.style, {
                        left: col_pre + "px",
                    width: col - col_pre - 1 + "px",
                    top: row_pre + "px",
                    height: row - row_pre - 1 + "px",
                    display: "block",
                    });
                }
            }, 100);

            event.stopPropagation();
        });
        _fillHandle.addEventListener("click", function() {
            clearTimeout(Store.luckysheet_cell_selected_extend_time);
            event.stopPropagation();
        });
        _fillHandle.addEventListener("dblclick", function() {
            let last = Store.selections[0];

            let r0 = last.row[0],
                r1 = last.row[1],
                c0 = last.column[0],
                c1 = last.column[1];


            let dropCellState = false;
            let step = 0;

            for (let r = r1 + 1; r < Store.sheetData.length; r++) {
                if (c0 - 1 >= 0 && c1 + 1 < Store.sheetData[0].length) {
                    let cell1 = Store.sheetData[r][c0 - 1];
                    let cell2 = Store.sheetData[r][c1 + 1];

                    if (r == r1 + 1) {
                        if ((cell1 == null || isRealNull(cell1.v)) && (cell2 == null || isRealNull(cell2.v))) {
                            dropCellState = false;
                            break;
                        } else {
                            dropCellState = true;
                            step++;
                        }
                    } else {
                        if ((cell1 == null || isRealNull(cell1.v)) && (cell2 == null || isRealNull(cell2.v))) {
                            break;
                        }

                        step++;
                    }
                } else if (c0 - 1 >= 0) {
                    let cell = Store.sheetData[r][c0 - 1];

                    if (r == r1 + 1) {
                        if (cell == null || isRealNull(cell.v)) {
                            dropCellState = false;
                            break;
                        } else {
                            dropCellState = true;
                            step++;
                        }
                    } else {
                        if (cell == null || isRealNull(cell.v)) {
                            break;
                        }

                        step++;
                    }
                } else if (c1 + 1 < Store.sheetData[0].length) {
                    let cell = Store.sheetData[r][c1 + 1];

                    if (r == r1 + 1) {
                        if (cell == null || isRealNull(cell.v)) {
                            dropCellState = false;
                            break;
                        } else {
                            dropCellState = true;
                            step++;
                        }
                    } else {
                        if (cell == null || isRealNull(cell.v)) {
                            break;
                        }

                        step++;
                    }
                }
            }

            if (!dropCellState || step == 0) {
                event.stopPropagation();
                return;
            }

            //复制范围
            luckysheetDropCell.copyRange = { row: [r0, r1], column: [c0, c1] };

            //applyType
            let typeItemHide = luckysheetDropCell.typeItemHide();

            if (
                !typeItemHide[0] &&
                !typeItemHide[1] &&
                !typeItemHide[2] &&
                !typeItemHide[3] &&
                !typeItemHide[4] &&
                !typeItemHide[5] &&
                !typeItemHide[6]
            ) {
                luckysheetDropCell.applyType = "0";
            } else {
                luckysheetDropCell.applyType = "1";
            }

            luckysheetDropCell.applyRange = { row: [r1 + 1, r1 + step], column: [c0, c1] };
            luckysheetDropCell.direction = "down";

            Store.selections = [{ row: [r0, r1 + step], column: [c0, c1] }];

            luckysheetDropCell.update();
            luckysheetDropCell.createIcon();

            const _elMoveHide = document.getElementById("luckysheet-cell-selected-move"); if (_elMoveHide) _elMoveHide.style.display = 'none';

            const _elSheettable = document.getElementById("luckysheet-sheet-table"); if (_elSheettable) _elSheettable.style.cursor = "default";
            clearTimeout(Store.countfuncTimeout);
            Store.countfuncTimeout = setTimeout(function() {
                countfunc();
            }, 500);

            event.stopPropagation();
        });
    }

}
