import { onNS, offNS } from '../../utils/migrationHelpers.js';
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetFreezen from "../freezen";
import luckysheetPostil from "../postil";
import hyperlinkCtrl from "../hyperlinkCtrl";
import menuButton from "../menuButton";
import sheetmanage from "../sheetmanage";
import { luckysheet_searcharray } from "../sheetSearch";
import luckysheetsizeauto from "../resize";
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
import { countfunc } from "../../global/count";
import formula from "../../global/formula";
import method from "../../global/method";
import Store from "../../store";
import { getScrollPosition } from '../../utils/domUtils.js';


import { mouseRender } from './documentMousemoveSub/mouseRender.js';
import sheetContainer from '../../ui/sheetContainer.js';
import canvasContext from '../../ui/canvasContext.js';

export default function documentMousemove() {
    //表格mousemove
    onNS(document, "mousemove.luckysheetEvent", null, function(event) {
        luckysheetPostil.overshow(event); //有批注显示
        hyperlinkCtrl.overshow(event); //链接提示显示

        window.cancelAnimationFrame(Store.jfautoscrollTimeout);

        if (luckysheetConfigsetting && luckysheetConfigsetting.hook && luckysheetConfigsetting.hook.sheetMousemove) {
            let mouse = mouseposition(event.pageX, event.pageY);
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

            let margeset = menuButton.mergeborer(Store.flowdata, row_index, col_index);
            if (margeset) {
                row = margeset.row[1];
                row_pre = margeset.row[0];
                row_index = margeset.row[2];

                col = margeset.column[1];
                col_pre = margeset.column[0];
                col_index = margeset.column[2];
            }

            // if(Store.flowdata[row_index] && Store.flowdata[row_index][col_index]){
            let sheetFile = sheetmanage.getSheetByIndex();

            let moveState = {
                functionResizeStatus: formula.functionResizeStatus,
                horizontalmoveState: !!luckysheetFreezen.horizontalmovestate,
                verticalmoveState: !!luckysheetFreezen.verticalmovestate,
                sheetMoveStatus: Store.luckysheet_sheet_move_status,
                scrollStatus: !!Store.luckysheet_scroll_status,
                selectStatus: !!Store.luckysheet_select_status,
                rowsSelectedStatus: !!Store.luckysheet_rows_selected_status,
                colsSelectedStatus: !!Store.luckysheet_cols_selected_status,
                cellSelectedMove: !!Store.luckysheet_cell_selected_move,
                cellSelectedExtend: !!Store.luckysheet_cell_selected_extend,
                colsChangeSize: !!Store.luckysheet_cols_change_size,
                rowsChangeSize: !!Store.luckysheet_rows_change_size,
                rangeResize: !!formula.rangeResize,
                rangeMove: !!formula.rangeMove,
            };

            let luckysheetTableContent = canvasContext.getContext();

            if (Store.flowdata && Store.flowdata[row_index]) {
                method.createHookFunction(
                    "sheetMousemove",
                    Store.flowdata[row_index][col_index],
                    {
                        r: row_index,
                        c: col_index,
                        start_r: row_pre,
                        start_c: col_pre,
                        end_r: row,
                        end_c: col,
                    },
                    sheetFile,
                    moveState,
                    luckysheetTableContent,
                );
            }
            // }
        }

        if (formula.functionResizeStatus) {
            let y = event.pageY;
            let movepx = y - formula.functionResizeData.y;
            let mpx = formula.functionResizeData.calculatebarHeight + movepx;
            let winh = Math.round(document.documentElement.clientHeight / 2);

            if (mpx <= 28) {
                if (mpx <= 20) {
                    return;
                }
                mpx = 28;
            } else if (mpx >= winh) {
                if (mpx >= winh + 8) {
                    return;
                }
                mpx = winh;
            }

            Store.calculatebarHeight = mpx;
            $("#luckysheet-wa-calculate").css("height", Store.calculatebarHeight - 2);
            $("#luckysheet-wa-calculate-size").css({ background: "#5e5e5e", cursor: "ns-resize" });

            clearTimeout(formula.functionResizeTimeout);
            formula.functionResizeTimeout = setTimeout(function() {
                luckysheetsizeauto();
            }, 15);
        } else if (luckysheetFreezen.horizontalmovestate) {
            let mouse = mouseposition(event.pageX, event.pageY);
            let scroll = getScrollPosition();
            let scrollLeft = scroll.scrollLeft;
            let scrollTop = scroll.scrollTop;
            let x = mouse[0] + scrollLeft;
            let y = mouse[1] + scrollTop;

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];
            let top = mouse[1] + Store.columnHeaderHeight;

            if (top < Store.columnHeaderHeight) {
                top = Store.columnHeaderHeight;
            }

            if (top > luckysheetFreezen.windowHeight - 4) {
                top = luckysheetFreezen.windowHeight - 4;
            }

            $("#luckysheet-freezebar-horizontal")
                .find(".luckysheet-freezebar-horizontal-handle")
                .css({ top: top });

            if (top + scrollTop - Store.columnHeaderHeight >= row_pre + (row - row_pre) / 2) {
                top = row - 2 - scrollTop + Store.columnHeaderHeight;
                luckysheetFreezen.freezenhorizontaldata = [
                    row,
                    row_index + 1,
                    scrollTop,
                    luckysheetFreezen.cutVolumn(Store.visibledatarow, row_index + 1),
                    top,
                ];
            } else {
                top = row_pre - 2 - scrollTop + Store.columnHeaderHeight;
                luckysheetFreezen.freezenhorizontaldata = [
                    row_pre,
                    row_index,
                    scrollTop,
                    luckysheetFreezen.cutVolumn(Store.visibledatarow, row_index),
                    top,
                ];
            }

            $("#luckysheet-freezebar-horizontal")
                .find(".luckysheet-freezebar-horizontal-drop")
                .css({ top: top });
            luckysheetFreezen.saveFreezen(luckysheetFreezen.freezenhorizontaldata, top, null, null);
        } else if (luckysheetFreezen.verticalmovestate) {
            let mouse = mouseposition(event.pageX, event.pageY);
            let scroll = getScrollPosition();
            let scrollLeft = scroll.scrollLeft;
            let scrollTop = scroll.scrollTop;
            let x = mouse[0] + scrollLeft;
            let y = mouse[1] + scrollTop;

            let col_location = colLocation(x),
                col = col_location[1],
                col_pre = col_location[0],
                col_index = col_location[2];

            let left = mouse[0] + Store.rowHeaderWidth;

            if (left < Store.rowHeaderWidth) {
                left = Store.rowHeaderWidth;
            }

            if (left > luckysheetFreezen.windowWidth - 4) {
                left = luckysheetFreezen.windowWidth - 4;
            }

            $("#luckysheet-freezebar-vertical")
                .find(".luckysheet-freezebar-vertical-handle")
                .css({ left: left });

            if (left + scrollLeft - Store.rowHeaderWidth >= col_pre + (col - col_pre) / 2) {
                left = col - 2 - scrollLeft + Store.rowHeaderWidth;
                luckysheetFreezen.freezenverticaldata = [
                    col,
                    col_index + 1,
                    scrollLeft,
                    luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_index + 1),
                    left,
                ];
            } else {
                left = col_pre - 2 - scrollLeft + Store.rowHeaderWidth;
                luckysheetFreezen.freezenverticaldata = [
                    col_pre,
                    col_index,
                    scrollLeft,
                    luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_index),
                    left,
                ];
            }

            $("#luckysheet-freezebar-vertical")
                .find(".luckysheet-freezebar-vertical-drop")
                .css({ left: left });
            luckysheetFreezen.saveFreezen(null, null, luckysheetFreezen.freezenverticaldata, left);
            luckysheetsizeauto(); //调节选区时下部单元格溢出
        } else if (Store.luckysheet_sheet_move_status) {
            let scrollLeft = sheetContainer.getScrollLeft();
            let x = event.pageX + scrollLeft;

            if (Math.abs(event.pageX - Store.luckysheet_sheet_move_data.pageX) < 3) {
                return;
            }

            let winW = $("#luckysheet-sheet-container").width();
            let left = x - Store.luckysheet_sheet_move_data.curleft - $("#luckysheet-sheet-container").offset().left;
            Store.luckysheet_sheet_move_data.activeobject.css({ left: left });

            let row_index = luckysheet_searcharray(
                Store.luckysheet_sheet_move_data.widthlist,
                left + Store.luckysheet_sheet_move_data.curleft,
            );
            Store.luckysheet_sheet_move_data.cursorobject.css({ cursor: "move" });

            if (left - scrollLeft <= 6) {
                $("#luckysheet-sheets-leftscroll").click();
            }

            if (left - scrollLeft >= winW - 40) {
                $("#luckysheet-sheets-rightscroll").click();
            }

            if (row_index != Store.luckysheet_sheet_move_data.curindex) {
                if (row_index == -1 && left > 0) {
                    row_index = Store.luckysheet_sheet_move_data.widthlist.length - 1;
                    $("#luckysheet-sheets-item-clone").insertAfter(
                        $("#luckysheet-sheet-area div.luckysheet-sheets-item:visible").eq(row_index),
                    );
                } else if (row_index == -1 && left <= 0) {
                    $("#luckysheet-sheets-item-clone").insertBefore(
                        $("#luckysheet-sheet-area div.luckysheet-sheets-item:visible").eq(0),
                    );
                } else {
                    $("#luckysheet-sheets-item-clone").insertAfter(
                        $("#luckysheet-sheet-area div.luckysheet-sheets-item:visible").eq(row_index),
                    );
                }

                Store.luckysheet_sheet_move_data.widthlist = [];
                $("#luckysheet-sheet-area div.luckysheet-sheets-item:visible").each(function(i) {
                    if (i == 0) {
                        Store.luckysheet_sheet_move_data.widthlist.push(parseInt($(this).outerWidth()));
                    } else {
                        Store.luckysheet_sheet_move_data.widthlist.push(
                            parseInt($(this).outerWidth()) + Store.luckysheet_sheet_move_data.widthlist[i - 1],
                        );
                    }
                });

                Store.luckysheet_sheet_move_data.curindex = $(
                    "#luckysheet-sheet-area div.luckysheet-sheets-item:visible",
                ).index($("#luckysheet-sheets-item-clone"));
            }
        } else if (Store.luckysheet_model_move_state) {
            let scrollTop = document.documentElement.scrollTop,
                scrollLeft = document.documentElement.scrollLeft;
            let y = event.pageY + scrollTop,
                x = event.pageX + scrollLeft;
            let winH = document.documentElement.clientHeight,
                winW = document.documentElement.clientWidth;
            let myh = Store.luckysheet_model_move_obj.height(),
                myw = Store.luckysheet_model_move_obj.width();
            let top = y - Store.luckysheet_model_xy[1],
                left = x - Store.luckysheet_model_xy[0];

            if (top < 0) {
                top = 0;
            }

            if (top + myh + 62 > winH) {
                top = winH - myh - 62;
            }

            if (left < 0) {
                left = 0;
            }

            if (left + myw + 86 > winW) {
                left = winW - myw - 86;
            }

            Store.luckysheet_model_move_obj.css({ top: top, left: left });
            event.preventDefault();
        } else if (
            !!Store.luckysheet_scroll_status ||
            !!Store.luckysheet_select_status ||
            !!Store.luckysheet_rows_selected_status ||
            !!Store.luckysheet_cols_selected_status ||
            !!Store.luckysheet_cell_selected_move ||
            !!Store.luckysheet_cell_selected_extend ||
            !!Store.luckysheet_cols_change_size ||
            !!Store.luckysheet_rows_change_size ||
            !!formula.rangeResize ||
            !!formula.rangeMove
        ) {
            if (Store.luckysheet_select_status) {
                clearTimeout(Store.countfuncTimeout);
                Store.countfuncTimeout = setTimeout(function() {
                    countfunc();
                }, 500);
            }


            let pageX = event.pageX, pageY = event.pageY;
            Store.jfautoscrollTimeout = window.requestAnimationFrame(() => mouseRender({ pageX, pageY }));
        }
    });
}
