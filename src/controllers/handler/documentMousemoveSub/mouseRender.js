import luckysheetFreezen from "../../freezen";
import luckysheetPostil from "../../postil";
import imageCtrl from "../../imageCtrl";
import menuButton from "../../menuButton";
import conditionformat from "../../conditionformat";
import {
    selectHightlightShow,
    selectionCopyShow,
} from "../../select";
import { getRangetxt } from "../../../methods/get";
import { rowLocation, colLocation, mouseposition } from "../../../global/location";
import { countfunc } from "../../../global/count";
import formula from "../../../global/formula";
import Store from "../../../store";
import { getLastSelection, setLastSelection, getMaxRowIndex, getMaxColIndex } from "../../../utils/storeAccess.js";
import { getScrollPosition } from '../../../utils/domUtils.js';
import scrollBarX from '../../../ui/scrollBarX.js';
import scrollBarY from '../../../ui/scrollBarY.js';
import imageDialog from '../../../ui/imageDialog.js';
import { rowHeader, colHeader } from '../../../ui/rowColHeader.js';
import resizeHandles from '../../../ui/resizeHandles.js';
import cellMain from '../../../ui/cellMain.js';
import formulaDialogs from '../../../ui/formulaDialogs.js';

            export function mouseRender(event) {
                if (!event || event.pageX === undefined) return;
                let pageX = event.pageX;
                let pageY = event.pageY;
                if (
                    Store.luckysheet_scroll_status &&
                    !Store.luckysheet_cols_change_size &&
                    !Store.luckysheet_rows_change_size
                ) {
                    let mouse = mouseposition(pageX, pageY);
                    let left = scrollBarX.getScrollLeft(),
                        top = scrollBarY.getScrollTop();
                    let x = mouse[0];
                    let y = mouse[1];
                    let winH = cellMain.getHeight() - 20 * Store.zoomRatio,
                        winW = cellMain.getWidth() - 60 * Store.zoomRatio;

                    if (y < 0 || y > winH) {
                        let stop;
                        if (y < 0) {
                            stop = top + y / 2;
                        } else {
                            stop = top + (y - winH) / 2;
                        }
                        scrollBarY.setScrollTop(stop);
                    }

                    if (x < 0 || x > winW) {
                        let sleft;
                        if (x < 0) {
                            sleft = left + x / 2;
                        } else {
                            sleft = left + (x - winW) / 2;
                        }

                        scrollBarX.setScrollLeft(sleft);
                    }
                }
                if (Store.luckysheet_select_status) {
                    let mouse = mouseposition(pageX, pageY);
                    let scroll = getScrollPosition();
                    let x = mouse[0] + scroll.scrollLeft;
                    let y = mouse[1] + scroll.scrollTop;

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let last = structuredClone(getLastSelection());

                    let top = 0,
                        height = 0,
                        rowseleted = [];
                    if (last.top > row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;

                        if (last.row[1] > last.row_focus) {
                            last.row[1] = last.row_focus;
                        }

                        rowseleted = [row_index, last.row[1]];
                    } else if (last.top == row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;
                        rowseleted = [row_index, last.row[0]];
                    } else {
                        top = last.top;
                        height = row - last.top - 1;

                        if (last.row[0] < last.row_focus) {
                            last.row[0] = last.row_focus;
                        }

                        rowseleted = [last.row[0], row_index];
                    }

                    let left = 0,
                        width = 0,
                        columnseleted = [];
                    if (last.left > col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;

                        if (last.column[1] > last.column_focus) {
                            last.column[1] = last.column_focus;
                        }

                        columnseleted = [col_index, last.column[1]];
                    } else if (last.left == col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;
                        columnseleted = [col_index, last.column[0]];
                    } else {
                        left = last.left;
                        width = col - last.left - 1;

                        if (last.column[0] < last.column_focus) {
                            last.column[0] = last.column_focus;
                        }

                        columnseleted = [last.column[0], col_index];
                    }

                    let changeparam = menuButton.mergeMoveMain(
                        columnseleted,
                        rowseleted,
                        last,
                        top,
                        height,
                        left,
                        width,
                    );
                    if (changeparam != null) {
                        columnseleted = changeparam[0];
                        rowseleted = changeparam[1];
                        top = changeparam[2];
                        height = changeparam[3];
                        left = changeparam[4];
                        width = changeparam[5];
                    }

                    last["row"] = rowseleted;
                    last["column"] = columnseleted;

                    last["left_move"] = left;
                    last["width_move"] = width;
                    last["top_move"] = top;
                    last["height_move"] = height;

                    setLastSelection(last);

                    selectHightlightShow();
                    luckysheetFreezen.scrollFreezen();

                    let _elAlternateformatRangeDialog = document.getElementById("luckysheet-alternateformat-rangeDialog");
                    if (_elAlternateformatRangeDialog && _elAlternateformatRangeDialog.offsetWidth > 0) {
                        let _elRangeInput = _elAlternateformatRangeDialog.querySelector("input");
                        if (_elRangeInput) _elRangeInput.value = getRangetxt(
                                Store.currentSheetIndex,
                                getLastSelection(),
                            );
                    }

                } else if (conditionformat.selectStatus) {
                    let mouse = mouseposition(pageX, pageY);
                    let scroll = getScrollPosition();
                    let x = mouse[0] + scroll.scrollLeft;
                    let y = mouse[1] + scroll.scrollTop;

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let last = conditionformat.selectRange[conditionformat.selectRange.length - 1];

                    let top = 0,
                        height = 0,
                        rowseleted = [];
                    if (last.top > row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;

                        if (last.row[1] > last.row_focus) {
                            last.row[1] = last.row_focus;
                        }

                        rowseleted = [row_index, last.row[1]];
                    } else if (last.top == row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;
                        rowseleted = [row_index, last.row[0]];
                    } else {
                        top = last.top;
                        height = row - last.top - 1;

                        if (last.row[0] < last.row_focus) {
                            last.row[0] = last.row_focus;
                        }

                        rowseleted = [last.row[0], row_index];
                    }

                    let left = 0,
                        width = 0,
                        columnseleted = [];
                    if (last.left > col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;

                        if (last.column[1] > last.column_focus) {
                            last.column[1] = last.column_focus;
                        }

                        columnseleted = [col_index, last.column[1]];
                    } else if (last.left == col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;
                        columnseleted = [col_index, last.column[0]];
                    } else {
                        left = last.left;
                        width = col - last.left - 1;

                        if (last.column[0] < last.column_focus) {
                            last.column[0] = last.column_focus;
                        }

                        columnseleted = [last.column[0], col_index];
                    }

                    let changeparam = menuButton.mergeMoveMain(
                        columnseleted,
                        rowseleted,
                        last,
                        top,
                        height,
                        left,
                        width,
                    );
                    if (changeparam != null) {
                        columnseleted = changeparam[0];
                        rowseleted = changeparam[1];
                        top = changeparam[2];
                        height = changeparam[3];
                        left = changeparam[4];
                        width = changeparam[5];
                    }

                    last["row"] = rowseleted;
                    last["column"] = columnseleted;

                    last["left_move"] = left;
                    last["width_move"] = width;
                    last["top_move"] = top;
                    last["height_move"] = height;

                    conditionformat.selectRange[conditionformat.selectRange.length - 1] = last;

                    selectionCopyShow(conditionformat.selectRange);

                    let range = conditionformat.getTxtByRange(conditionformat.selectRange);
                    let _elMultiRangeInput = formulaDialogs.multiRange.el?.querySelector("input");
                    if (_elMultiRangeInput) _elMultiRangeInput.value = range;
                } else if (formula.rangestart) {
                    formula.rangedrag({ pageX, pageY });
                } else if (formula.rangedrag_row_start) {
                    formula.rangedrag_row({ pageX, pageY });
                } else if (formula.rangedrag_column_start) {
                    formula.rangedrag_column({ pageX, pageY });
                } else if (Store.luckysheet_rows_selected_status) {
                    let mouse = mouseposition(pageX, pageY);
                    let y = mouse[1] + rowHeader.getScrollTop();
                    if (y < 0) {
                        return false;
                    }

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_index = getMaxColIndex(),
                        col = Store.visibleColPositions[col_index],
                        col_pre = 0;

                    let last = structuredClone(getLastSelection());

                    let top = 0,
                        height = 0,
                        rowseleted = [];
                    if (last.top > row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;

                        if (last.row[1] > last.row_focus) {
                            last.row[1] = last.row_focus;
                        }

                        rowseleted = [row_index, last.row[1]];
                    } else if (last.top == row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;
                        rowseleted = [row_index, last.row[0]];
                    } else {
                        top = last.top;
                        height = row - last.top - 1;

                        if (last.row[0] < last.row_focus) {
                            last.row[0] = last.row_focus;
                        }

                        rowseleted = [last.row[0], row_index];
                    }

                    last["row"] = rowseleted;

                    last["top_move"] = top;
                    last["height_move"] = height;

                    setLastSelection(last);

                    selectHightlightShow();
                    clearTimeout(Store.countfuncTimeout);
                    Store.countfuncTimeout = setTimeout(function() {
                        countfunc();
                    }, 500);
                } else if (Store.luckysheet_cols_selected_status) {
                    let mouse = mouseposition(pageX, pageY);
                    let x = mouse[0] + colHeader.getScrollLeft();
                    if (x < 0) {
                        return false;
                    }

                    let row_index = getMaxRowIndex(),
                        row = Store.visibleRowPositions[row_index],
                        row_pre = 0;
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let last = structuredClone(getLastSelection());

                    let left = 0,
                        width = 0,
                        columnseleted = [];
                    if (last.left > col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;

                        if (last.column[1] > last.column_focus) {
                            last.column[1] = last.column_focus;
                        }

                        columnseleted = [col_index, last.column[1]];
                    } else if (last.left == col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;
                        columnseleted = [col_index, last.column[0]];
                    } else {
                        left = last.left;
                        width = col - last.left - 1;

                        if (last.column[0] < last.column_focus) {
                            last.column[0] = last.column_focus;
                        }

                        columnseleted = [last.column[0], col_index];
                    }

                    last["column"] = columnseleted;

                    last["left_move"] = left;
                    last["width_move"] = width;

                    setLastSelection(last);

                    selectHightlightShow();
                    clearTimeout(Store.countfuncTimeout);
                    Store.countfuncTimeout = setTimeout(function() {
                        countfunc();
                    }, 500);
                } else if (Store.luckysheet_cell_selected_move) {
                    let mouse = mouseposition(pageX, pageY);

                    let scroll = getScrollPosition();
                    let scrollLeft = scroll.scrollLeft;
                    let scrollTop = scroll.scrollTop;

                    let x = mouse[0] + scrollLeft;
                    let y = mouse[1] + scrollTop;

                    let winH = document.documentElement.clientHeight + scrollTop - Store.sheetBarHeight - Store.statisticBarHeight,
                        winW = document.documentElement.clientWidth + scrollLeft;

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let row_index_original = Store.luckysheet_cell_selected_move_index[0],
                        col_index_original = Store.luckysheet_cell_selected_move_index[1];

                    let row_s = Store.selections[0]["row"][0] - row_index_original + row_index,
                        row_e = Store.selections[0]["row"][1] - row_index_original + row_index;

                    let col_s = Store.selections[0]["column"][0] - col_index_original + col_index,
                        col_e = Store.selections[0]["column"][1] - col_index_original + col_index;

                    if (row_s < 0 || y < 0) {
                        row_s = 0;
                        row_e = Store.selections[0]["row"][1] - Store.selections[0]["row"][0];
                    }

                    if (col_s < 0 || x < 0) {
                        col_s = 0;
                        col_e =
                            Store.selections[0]["column"][1] - Store.selections[0]["column"][0];
                    }

                    if (row_e >= Store.visibleRowPositions[getMaxRowIndex()] || y > winH) {
                        row_s =
                            getMaxRowIndex() -
                            Store.selections[0]["row"][1] +
                            Store.selections[0]["row"][0];
                        row_e = getMaxRowIndex();
                    }

                    if (col_e >= Store.visibleColPositions[getMaxColIndex()] || x > winW) {
                        col_s =
                            getMaxColIndex() -
                            Store.selections[0]["column"][1] +
                            Store.selections[0]["column"][0];
                        col_e = getMaxColIndex();
                    }

                    col_pre = col_s - 1 == -1 ? 0 : Store.visibleColPositions[col_s - 1];
                    col = Store.visibleColPositions[col_e];
                    row_pre = row_s - 1 == -1 ? 0 : Store.visibleRowPositions[row_s - 1];
                    row = Store.visibleRowPositions[row_e];

                    let _elCellSelectedMove = document.getElementById("luckysheet-cell-selected-move");
                    if (_elCellSelectedMove) {
                        Object.assign(_elCellSelectedMove.style, {
                            left: col_pre + "px",
                            width: (col - col_pre - 2) + "px",
                            top: row_pre + "px",
                            height: (row - row_pre - 2) + "px",
                            display: "block",
                        });
                    }
                } else if (Store.luckysheet_cell_selected_extend) {
                    let mouse = mouseposition(pageX, pageY);
                    let scroll = getScrollPosition();
                    let scrollLeft = scroll.scrollLeft - 5;
                    let scrollTop = scroll.scrollTop - 5;

                    let x = mouse[0] + scrollLeft;
                    let y = mouse[1] + scrollTop;

                    let winH = document.documentElement.clientHeight + scrollTop - Store.sheetBarHeight - Store.statisticBarHeight,
                        winW = document.documentElement.clientWidth + scrollLeft;

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let row_index_original = Store.luckysheet_cell_selected_extend_index[0],
                        col_index_original = Store.luckysheet_cell_selected_extend_index[1];

                    let row_s = Store.selections[0]["row"][0],
                        row_e = Store.selections[0]["row"][1];
                    let col_s = Store.selections[0]["column"][0],
                        col_e = Store.selections[0]["column"][1];

                    if (row_s < 0 || y < 0) {
                        row_s = 0;
                        row_e = Store.selections[0]["row"][1] - Store.selections[0]["row"][0];
                    }

                    if (col_s < 0 || x < 0) {
                        col_s = 0;
                        col_e =
                            Store.selections[0]["column"][1] - Store.selections[0]["column"][0];
                    }

                    if (row_e >= Store.visibleRowPositions[getMaxRowIndex()] || y > winH) {
                        row_s =
                            getMaxRowIndex() -
                            Store.selections[0]["row"][1] +
                            Store.selections[0]["row"][0];
                        row_e = getMaxRowIndex();
                    }

                    if (col_e >= Store.visibleColPositions[getMaxColIndex()] || x > winW) {
                        col_s =
                            getMaxColIndex() -
                            Store.selections[0]["column"][1] +
                            Store.selections[0]["column"][0];
                        col_e = getMaxColIndex();
                    }

                    let top = Store.selections[0].top_move,
                        height = Store.selections[0].height_move;
                    let left = Store.selections[0].left_move,
                        width = Store.selections[0].width_move;

                    if (Math.abs(row_index_original - row_index) > Math.abs(col_index_original - col_index)) {
                        if (!(row_index >= row_s && row_index <= row_e)) {
                            if (Store.selections[0].top_move >= row_pre) {
                                top = row_pre;
                                height =
                                    Store.selections[0].top_move +
                                    Store.selections[0].height_move -
                                    row_pre;
                            } else {
                                top = Store.selections[0].top_move;
                                height = row - Store.selections[0].top_move - 1;
                            }
                        }
                    } else {
                        if (!(col_index >= col_s && col_index <= col_e)) {
                            if (Store.selections[0].left_move >= col_pre) {
                                left = col_pre;
                                width =
                                    Store.selections[0].left_move +
                                    Store.selections[0].width_move -
                                    col_pre;
                            } else {
                                left = Store.selections[0].left_move;
                                width = col - Store.selections[0].left_move - 1;
                            }
                        }
                    }

                    let _elCellSelectedExtend = document.getElementById("luckysheet-cell-selected-extend");
                    if (_elCellSelectedExtend) {
                        Object.assign(_elCellSelectedExtend.style, {
                            left: left + "px",
                            width: width + "px",
                            top: top + "px",
                            height: height + "px",
                            display: "block",
                        });
                    }
                } else if (Store.luckysheet_cols_change_size) {
                    let mouse = mouseposition(pageX, pageY);
                    let scrollLeft = colHeader.getScrollLeft();
                    let x = mouse[0] + scrollLeft;
                    let winW = document.documentElement.clientWidth;

                    let row_index = getMaxRowIndex(),
                        row = Store.visibleRowPositions[row_index],
                        row_pre = 0;
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    if (x + 3 - Store.luckysheet_cols_change_size_start[0] > 30 && x < winW + scrollLeft - 100) {
                        resizeHandles.changeSizeLine.setCss({ left: x });
                        resizeHandles.colChangeSize.setCss({ left: x - 2 });
                    }
                } else if (Store.luckysheet_rows_change_size) {
                    let mouse = mouseposition(pageX, pageY);
                    let scrollTop = rowHeader.getScrollTop();
                    let y = mouse[1] + scrollTop;
                    let winH = document.documentElement.clientHeight;

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];

                    if (y + 3 - Store.luckysheet_rows_change_size_start[0] > 19 && y < winH + scrollTop - 200) {
                        resizeHandles.changeSizeLine.setCss({ top: y });
                        resizeHandles.rowChangeSize.setCss({ top: y });
                    }
                }
                //image move
                else if (imageCtrl.move) {
                    let mouse = mouseposition(pageX, pageY);

                    let scroll = getScrollPosition();
                    let x = mouse[0] + scroll.scrollLeft;
                    let y = mouse[1] + scroll.scrollTop;

                    let imgItem = imageCtrl.images[imageCtrl.currentImgId];
                    if (imgItem.isFixedPos) {
                        x = pageX;
                        y = pageY;
                    }

                    let myh = imageDialog.active.getHeight(),
                        myw = imageDialog.active.getWidth();

                    let top = y - imageCtrl.moveXY[1],
                        left = x - imageCtrl.moveXY[0];

                    let minTop = 0,
                        maxTop = imageCtrl.currentWinH - myh - 42 - 6,
                        minLeft = 0,
                        maxLeft = imageCtrl.currentWinW - myw - 22 - 36;

                    if (imgItem.isFixedPos) {
                        minTop =
                            Store.infobarHeight +
                            Store.toolbarHeight +
                            Store.calculatebarHeight +
                            Store.columnHeaderHeight;
                        maxTop = minTop + Store.gridHeight - Store.cellMainSrollBarSize - myh;
                        minLeft = Store.rowHeaderWidth;
                        maxLeft = minLeft + Store.gridWidth - Store.cellMainSrollBarSize - myw;
                    }

                    if (top < minTop) {
                        top = minTop;
                    }

                    if (top > maxTop) {
                        top = maxTop;
                    }

                    if (left < minLeft) {
                        left = minLeft;
                    }

                    if (left > maxLeft) {
                        left = maxLeft;
                    }

                    imageDialog.active.setCss({ left: left, top: top });
                }
                //image resize
                else if (imageCtrl.resize) {
                    let mouse = mouseposition(pageX, pageY);
                    let scroll = getScrollPosition();
                    let scrollLeft = scroll.scrollLeft;
                    let scrollTop = scroll.scrollTop;
                    let x = mouse[0] + scrollLeft;
                    let y = mouse[1] + scrollTop;

                    if (x < 0 || y < 0) {
                        return false;
                    }

                    let resizeXY = imageCtrl.resizeXY;

                    let topchange = y - resizeXY[1],
                        leftchange = x - resizeXY[0];

                    let top = resizeXY[5],
                        height = resizeXY[3],
                        left = resizeXY[4],
                        width = resizeXY[2];

                    let resize = imageCtrl.resize;
                    let imgItem = imageCtrl.images[imageCtrl.currentImgId];

                    if (imgItem.isFixedPos) {
                        let minTop =
                            Store.infobarHeight +
                            Store.toolbarHeight +
                            Store.calculatebarHeight +
                            Store.columnHeaderHeight;
                        let minLeft = Store.rowHeaderWidth;

                        if (resize == "lt") {
                            left = resizeXY[4] - resizeXY[6] + leftchange;

                            if (left < minLeft) {
                                left = minLeft;
                            }

                            if (left > resizeXY[4] - resizeXY[6] + resizeXY[2] - 1) {
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - 1;
                            }

                            width = resizeXY[4] - resizeXY[6] + resizeXY[2] - left;

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[5] - resizeXY[7] + resizeXY[3] - height;

                            if (top < minTop) {
                                top = minTop;
                                height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - width;
                            }

                            if (top > resizeXY[5] - resizeXY[7] + resizeXY[3] - 1) {
                                top = resizeXY[5] - resizeXY[7] + resizeXY[3] - 1;
                                height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - width;
                            }
                        } else if (resize == "lm") {
                            left = resizeXY[4] - resizeXY[6] + leftchange;

                            if (left < minLeft) {
                                left = minLeft;
                            }

                            if (left > resizeXY[4] - resizeXY[6] + resizeXY[2] - 1) {
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - 1;
                            }

                            width = resizeXY[4] - resizeXY[6] + resizeXY[2] - left;

                            top = resizeXY[5] - resizeXY[7];
                            height = resizeXY[3];
                        } else if (resize == "lb") {
                            left = resizeXY[4] - resizeXY[6] + leftchange;

                            if (left < minLeft) {
                                left = minLeft;
                            }

                            if (left > resizeXY[4] - resizeXY[6] + resizeXY[2] - 1) {
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - 1;
                            }

                            width = resizeXY[4] - resizeXY[6] + resizeXY[2] - left;

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));

                            top = resizeXY[5] - resizeXY[7];

                            if (height < 1) {
                                height = 1;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - width;
                            }

                            if (height > minTop + Store.gridHeight - Store.cellMainSrollBarSize - top) {
                                height = minTop + Store.gridHeight - Store.cellMainSrollBarSize - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - width;
                            }
                        } else if (resize == "rt") {
                            left = resizeXY[4] - resizeXY[6];

                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            }

                            if (width > minLeft + Store.gridWidth - Store.cellMainSrollBarSize - left) {
                                width = minLeft + Store.gridWidth - Store.cellMainSrollBarSize - left;
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[5] - resizeXY[7] + resizeXY[3] - height;

                            if (top < minTop) {
                                top = minTop;
                                height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }

                            if (top > resizeXY[5] - resizeXY[7] + resizeXY[3] - 1) {
                                top = resizeXY[5] - resizeXY[7] + resizeXY[3] - 1;
                                height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }
                        } else if (resize == "rm") {
                            left = resizeXY[4] - resizeXY[6];

                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            }

                            if (width > minLeft + Store.gridWidth - Store.cellMainSrollBarSize - left) {
                                width = minLeft + Store.gridWidth - Store.cellMainSrollBarSize - left;
                            }

                            top = resizeXY[5] - resizeXY[7];
                            height = resizeXY[3];
                        } else if (resize == "rb") {
                            left = resizeXY[4] - resizeXY[6];

                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            }

                            if (width > minLeft + Store.gridWidth - Store.cellMainSrollBarSize - left) {
                                width = minLeft + Store.gridWidth - Store.cellMainSrollBarSize - left;
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[5] - resizeXY[7];

                            if (height < 1) {
                                height = 1;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }

                            if (height > minTop + Store.gridHeight - Store.cellMainSrollBarSize - top) {
                                height = minTop + Store.gridHeight - Store.cellMainSrollBarSize - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }
                        } else if (resize == "mt") {
                            left = resizeXY[4] - resizeXY[6];
                            width = resizeXY[2];

                            top = resizeXY[5] - resizeXY[7] + topchange;

                            if (top < minTop) {
                                top = minTop;
                            }

                            if (top > resizeXY[5] - resizeXY[7] + resizeXY[3] - 1) {
                                top = resizeXY[5] - resizeXY[7] + resizeXY[3] - 1;
                            }

                            height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;
                        } else if (resize == "mb") {
                            left = resizeXY[4] - resizeXY[6];
                            width = resizeXY[2];

                            top = resizeXY[5] - resizeXY[7];

                            height = resizeXY[3] + topchange;

                            if (height < 1) {
                                height = 1;
                            }

                            if (height > minTop + Store.gridHeight - Store.cellMainSrollBarSize - top) {
                                height = minTop + Store.gridHeight - Store.cellMainSrollBarSize - top;
                            }
                        }
                    } else {
                        if (resize == "lt") {
                            left = x;
                            width = resizeXY[2] - leftchange;

                            if (left > resizeXY[2] + resizeXY[4] - 1) {
                                left = resizeXY[2] + resizeXY[4] - 1;
                                width = resizeXY[2] + resizeXY[0] - (resizeXY[2] + resizeXY[4] - 1);
                            } else if (left <= 0) {
                                left = 0;
                                width = resizeXY[2] + resizeXY[0];
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[3] + resizeXY[1] - height;

                            if (top > resizeXY[3] + resizeXY[5] - 1) {
                                top = resizeXY[3] + resizeXY[5] - 1;
                                height = resizeXY[3] + resizeXY[1] - (resizeXY[3] + resizeXY[5] - 1);

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[2] + resizeXY[0] - width;
                            } else if (top <= 0) {
                                top = 0;
                                height = resizeXY[3] + resizeXY[1];

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[2] + resizeXY[0] - width;
                            }
                        } else if (resize == "lm") {
                            left = x;
                            width = resizeXY[2] - leftchange;

                            if (left > resizeXY[2] + resizeXY[4] - 1) {
                                left = resizeXY[2] + resizeXY[4] - 1;
                                width = resizeXY[2] + resizeXY[0] - (resizeXY[2] + resizeXY[4] - 1);
                            } else if (left <= 0) {
                                left = 0;
                                width = resizeXY[2] + resizeXY[0];
                            }
                        } else if (resize == "lb") {
                            left = x;
                            width = resizeXY[2] - leftchange;

                            if (left > resizeXY[2] + resizeXY[4] - 1) {
                                left = resizeXY[2] + resizeXY[4] - 1;
                                width = resizeXY[2] + resizeXY[0] - (resizeXY[2] + resizeXY[4] - 1);
                            } else if (left <= 0) {
                                left = 0;
                                width = resizeXY[2] + resizeXY[0];
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));

                            if (height < 1) {
                                height = 1;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[2] + resizeXY[0] - width;
                            } else if (height >= imageCtrl.currentWinH - resizeXY[5] - 42 - 6) {
                                height = imageCtrl.currentWinH - resizeXY[5] - 42 - 6;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[2] + resizeXY[0] - width;
                            }
                        } else if (resize == "rt") {
                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            } else if (width >= imageCtrl.currentWinW - resizeXY[4] - 22 - 36) {
                                width = imageCtrl.currentWinW - resizeXY[4] - 22 - 36;
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[3] + resizeXY[1] - height;

                            if (top > resizeXY[3] + resizeXY[5] - 1) {
                                top = resizeXY[3] + resizeXY[5] - 1;
                                height = resizeXY[3] + resizeXY[1] - (resizeXY[3] + resizeXY[5] - 1);

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            } else if (top <= 0) {
                                top = 0;
                                height = resizeXY[3] + resizeXY[1];

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }
                        } else if (resize == "rm") {
                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            } else if (width >= imageCtrl.currentWinW - resizeXY[4] - 22 - 36) {
                                width = imageCtrl.currentWinW - resizeXY[4] - 22 - 36;
                            }
                        } else if (resize == "rb") {
                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            } else if (width >= imageCtrl.currentWinW - resizeXY[4] - 22 - 36) {
                                width = imageCtrl.currentWinW - resizeXY[4] - 22 - 36;
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));

                            if (height < 1) {
                                height = 1;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            } else if (height >= imageCtrl.currentWinH - resizeXY[5] - 42 - 6) {
                                height = imageCtrl.currentWinH - resizeXY[5] - 42 - 6;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }
                        } else if (resize == "mt") {
                            top = y;
                            height = resizeXY[3] - topchange;

                            if (top > resizeXY[3] + resizeXY[5] - 1) {
                                top = resizeXY[3] + resizeXY[5] - 1;
                                height = resizeXY[3] + resizeXY[1] - (resizeXY[3] + resizeXY[5] - 1);
                            } else if (top <= 0) {
                                top = 0;
                                height = resizeXY[3] + resizeXY[1];
                            }
                        } else if (resize == "mb") {
                            height = resizeXY[3] + topchange;

                            if (height < 1) {
                                height = 1;
                            } else if (height >= imageCtrl.currentWinH - resizeXY[5] - 42 - 6) {
                                height = imageCtrl.currentWinH - resizeXY[5] - 42 - 6;
                            }
                        }
                    }

                    imageDialog.active.setCss({
                        width: width,
                        height: height,
                        left: left,
                        top: top,
                    });

                    let scaleX = width / imgItem.crop.width;
                    let scaleY = height / imgItem.crop.height;
                    let defaultWidth = Math.round(imgItem.default.width * scaleX);
                    let defaultHeight = Math.round(imgItem.default.height * scaleY);
                    let offsetLeft = Math.round(imgItem.crop.offsetLeft * scaleX);
                    let offsetTop = Math.round(imgItem.crop.offsetTop * scaleY);

                    let _elDialogContent = imageDialog.active.el?.querySelector(".luckysheet-modal-dialog-content");
                    if (_elDialogContent) {
                        Object.assign(_elDialogContent.style, {
                            "background-size": defaultWidth + "px " + defaultHeight + "px",
                            "background-position": -offsetLeft + "px " + -offsetTop + "px",
                        });
                    }
                }
                //image cropChange
                else if (imageCtrl.cropChange) {
                    let mouse = mouseposition(pageX, pageY);
                    let scroll = getScrollPosition();
                    let x = mouse[0] + scroll.scrollLeft;
                    let y = mouse[1] + scroll.scrollTop;

                    if (x < 0 || y < 0) {
                        return false;
                    }

                    let cropChangeXY = imageCtrl.cropChangeXY;

                    let topchange = y - cropChangeXY[1],
                        leftchange = x - cropChangeXY[0];

                    let imgItem = imageCtrl.images[imageCtrl.currentImgId];
                    let cropChange = imageCtrl.cropChange;
                    let width, height, offsetLeft, offsetTop;

                    if (cropChange == "lt") {
                        offsetLeft = imgItem.crop.offsetLeft + leftchange;

                        if (offsetLeft < 0) {
                            offsetLeft = 0;
                        }

                        if (offsetLeft > imgItem.crop.width + imgItem.crop.offsetLeft - 1) {
                            offsetLeft = imgItem.crop.width + imgItem.crop.offsetLeft - 1;
                        }

                        width = imgItem.crop.width + imgItem.crop.offsetLeft - offsetLeft;

                        offsetTop = imgItem.crop.offsetTop + topchange;

                        if (offsetTop < 0) {
                            offsetTop = 0;
                        }

                        if (offsetTop > imgItem.crop.height + imgItem.crop.offsetTop - 1) {
                            offsetTop = imgItem.crop.height + imgItem.crop.offsetTop - 1;
                        }

                        height = imgItem.crop.height + imgItem.crop.offsetTop - offsetTop;
                    } else if (cropChange == "lm") {
                        offsetLeft = imgItem.crop.offsetLeft + leftchange;

                        if (offsetLeft < 0) {
                            offsetLeft = 0;
                        }

                        if (offsetLeft > imgItem.crop.width + imgItem.crop.offsetLeft - 1) {
                            offsetLeft = imgItem.crop.width + imgItem.crop.offsetLeft - 1;
                        }

                        width = imgItem.crop.width + imgItem.crop.offsetLeft - offsetLeft;

                        offsetTop = imgItem.crop.offsetTop;
                        height = imgItem.crop.height;
                    } else if (cropChange == "lb") {
                        offsetLeft = imgItem.crop.offsetLeft + leftchange;

                        if (offsetLeft < 0) {
                            offsetLeft = 0;
                        }

                        if (offsetLeft > imgItem.crop.width + imgItem.crop.offsetLeft - 1) {
                            offsetLeft = imgItem.crop.width + imgItem.crop.offsetLeft - 1;
                        }

                        width = imgItem.crop.width + imgItem.crop.offsetLeft - offsetLeft;

                        offsetTop = imgItem.crop.offsetTop;

                        height = imgItem.crop.height + topchange;

                        if (height < 1) {
                            height = 1;
                        }

                        if (height > imgItem.default.height - offsetTop) {
                            height = imgItem.default.height - offsetTop;
                        }
                    } else if (cropChange == "rt") {
                        offsetLeft = imgItem.crop.offsetLeft;

                        width = imgItem.crop.width + leftchange;

                        if (width < 1) {
                            width = 1;
                        }

                        if (width > imgItem.default.width - offsetLeft) {
                            width = imgItem.default.width - offsetLeft;
                        }

                        offsetTop = imgItem.crop.offsetTop + topchange;

                        if (offsetTop < 0) {
                            offsetTop = 0;
                        }

                        if (offsetTop > imgItem.crop.height + imgItem.crop.offsetTop - 1) {
                            offsetTop = imgItem.crop.height + imgItem.crop.offsetTop - 1;
                        }

                        height = imgItem.crop.height + imgItem.crop.offsetTop - offsetTop;
                    } else if (cropChange == "rm") {
                        offsetLeft = imgItem.crop.offsetLeft;

                        width = imgItem.crop.width + leftchange;

                        if (width < 1) {
                            width = 1;
                        }

                        if (width > imgItem.default.width - offsetLeft) {
                            width = imgItem.default.width - offsetLeft;
                        }

                        offsetTop = imgItem.crop.offsetTop;
                        height = imgItem.crop.height;
                    } else if (cropChange == "rb") {
                        offsetLeft = imgItem.crop.offsetLeft;

                        width = imgItem.crop.width + leftchange;

                        if (width < 1) {
                            width = 1;
                        }

                        if (width > imgItem.default.width - offsetLeft) {
                            width = imgItem.default.width - offsetLeft;
                        }

                        offsetTop = imgItem.crop.offsetTop;

                        height = imgItem.crop.height + topchange;

                        if (height < 1) {
                            height = 1;
                        }

                        if (height > imgItem.default.height - offsetTop) {
                            height = imgItem.default.height - offsetTop;
                        }
                    } else if (cropChange == "mt") {
                        offsetLeft = imgItem.crop.offsetLeft;
                        width = imgItem.crop.width;

                        offsetTop = imgItem.crop.offsetTop + topchange;

                        if (offsetTop < 0) {
                            offsetTop = 0;
                        }

                        if (offsetTop > imgItem.crop.height + imgItem.crop.offsetTop - 1) {
                            offsetTop = imgItem.crop.height + imgItem.crop.offsetTop - 1;
                        }

                        height = imgItem.crop.height + imgItem.crop.offsetTop - offsetTop;
                    } else if (cropChange == "mb") {
                        offsetLeft = imgItem.crop.offsetLeft;
                        width = imgItem.crop.width;

                        offsetTop = imgItem.crop.offsetTop;

                        height = imgItem.crop.height + topchange;

                        if (height < 1) {
                            height = 1;
                        }

                        if (height > imgItem.default.height - offsetTop) {
                            height = imgItem.default.height - offsetTop;
                        }
                    }

                    let left = imgItem.default.left + offsetLeft;
                    let top = imgItem.default.top + offsetTop;

                    if (imgItem.isFixedPos) {
                        left = imgItem.fixedLeft + offsetLeft;
                        top = imgItem.fixedTop + offsetTop;
                    }

                    imageDialog.cropping.showAt({
                            width: width,
                            height: height,
                            left: left,
                            top: top,
                        });

                    let imageUrlHandle = Store.toJsonOptions && Store.toJsonOptions["imageUrlHandle"];
                    let imgSrc = typeof imageUrlHandle === "function" ? imageUrlHandle(imgItem.src) : imgItem.src;

                    let _elCroppingMask = imageDialog.cropping.el?.querySelector(".cropping-mask");
                    if (_elCroppingMask) {
                        Object.assign(_elCroppingMask.style, {
                            width: imgItem.default.width + "px",
                            height: imgItem.default.height + "px",
                            "background-image": "url(" + imgSrc + ")",
                            left: -offsetLeft + "px",
                            top: -offsetTop + "px",
                        });
                    }

                    let _elCroppingContent = imageDialog.cropping.el?.querySelector(".cropping-content");
                    if (_elCroppingContent) {
                        Object.assign(_elCroppingContent.style, {
                            "background-image": "url(" + imgSrc + ")",
                            "background-size": imgItem.default.width + "px " + imgItem.default.height + "px",
                            "background-position": -offsetLeft + "px " + -offsetTop + "px",
                        });
                    }

                    imageCtrl.cropChangeObj = {
                        width: width,
                        height: height,
                        offsetLeft: offsetLeft,
                        offsetTop: offsetTop,
                    };
                } else if (luckysheetPostil.move) {
                    let mouse = mouseposition(pageX, pageY);
                    let scroll = getScrollPosition();
                    let x = mouse[0] + scroll.scrollLeft;
                    let y = mouse[1] + scroll.scrollTop;

                    let myh = luckysheetPostil.currentObj.offsetHeight,
                        myw = luckysheetPostil.currentObj.offsetWidth;

                    let top = y - luckysheetPostil.moveXY[1],
                        left = x - luckysheetPostil.moveXY[0];

                    if (top < 0) {
                        top = 0;
                    }

                    if (top + myh + 42 + 6 > luckysheetPostil.currentWinH) {
                        top = luckysheetPostil.currentWinH - myh - 42 - 6;
                    }

                    if (left < 0) {
                        left = 0;
                    }

                    if (left + myw + 22 + 36 > luckysheetPostil.currentWinW) {
                        left = luckysheetPostil.currentWinW - myw - 22 - 36;
                    }

                    Object.assign(luckysheetPostil.currentObj.style, { left: left + "px", top: top + "px" });
                } else if (luckysheetPostil.resize) {
                    let mouse = mouseposition(pageX, pageY);
                    let scroll = getScrollPosition();
                    let x = mouse[0] + scroll.scrollLeft;
                    let y = mouse[1] + scroll.scrollTop;

                    if (x < 0 || y < 0) {
                        return false;
                    }

                    let resizeXY = luckysheetPostil.resizeXY;

                    let topchange = y - resizeXY[1],
                        leftchange = x - resizeXY[0];

                    let top = resizeXY[5],
                        height = resizeXY[3],
                        left = resizeXY[4],
                        width = resizeXY[2];

                    let resize = luckysheetPostil.resize;

                    if (resize == "lm" || resize == "lt" || resize == "lb") {
                        left = x;
                        width = resizeXY[2] - leftchange;

                        if (left > resizeXY[2] + resizeXY[4] - 60) {
                            left = resizeXY[2] + resizeXY[4] - 60;
                            width = resizeXY[2] - (resizeXY[2] + resizeXY[4] - 60 - resizeXY[0]);
                        } else if (left <= 0) {
                            left = 0;
                            width = resizeXY[2] + resizeXY[0];
                        }
                    }

                    if (resize == "rm" || resize == "rt" || resize == "rb") {
                        width = resizeXY[2] + leftchange;

                        if (width < 60) {
                            width = 60;
                        } else if (width >= luckysheetPostil.currentWinW - resizeXY[4] - 22 - 36) {
                            width = luckysheetPostil.currentWinW - resizeXY[4] - 22 - 36;
                        }
                    }

                    if (resize == "mt" || resize == "lt" || resize == "rt") {
                        top = y;
                        height = resizeXY[3] - topchange;

                        if (top > resizeXY[3] + resizeXY[5] - 60) {
                            top = resizeXY[3] + resizeXY[5] - 60;
                            height = resizeXY[3] - (resizeXY[3] + resizeXY[5] - 60 - resizeXY[1]);
                        } else if (top <= 0) {
                            top = 0;
                            height = resizeXY[3] + resizeXY[1];
                        }
                    }

                    if (resize == "mb" || resize == "lb" || resize == "rb") {
                        height = resizeXY[3] + topchange;

                        if (height < 60) {
                            height = 60;
                        } else if (height >= luckysheetPostil.currentWinH - resizeXY[5] - 42 - 6) {
                            height = luckysheetPostil.currentWinH - resizeXY[5] - 42 - 6;
                        }
                    }

                    Object.assign(luckysheetPostil.currentObj.style, { width: width + "px", height: height + "px", left: left + "px", top: top + "px" });
                } else if (formula.rangeResize) {
                    formula.rangeResizeDraging(
                        { pageX, pageY },
                        formula.rangeResizeObj,
                        formula.rangeResizexy,
                        formula.rangeResize,
                        formula.rangeResizeWinW,
                        formula.rangeResizeWinH,
                        Store.sheetWidth,
                        Store.sheetHeight,
                    );
                } else if (formula.rangeMove) {
                    formula.rangeMoveDraging(
                        { pageX, pageY },
                        formula.rangeMovexy,
                        formula.rangeMoveObj.dataset.range,
                        formula.rangeMoveObj,
                        Store.sheetBarHeight,
                        Store.statisticBarHeight,
                    );
                }

                Store.jfautoscrollTimeout = window.requestAnimationFrame(() => mouseRender({ pageX, pageY }));
            }
