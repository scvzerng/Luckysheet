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
            const _calcBar = document.getElementById("luckysheet-wa-calculate");
            if (_calcBar) _calcBar.style.height = (Store.calculatebarHeight - 2) + 'px';
            const _calcSize = document.getElementById("luckysheet-wa-calculate-size");
            if (_calcSize) Object.assign(_calcSize.style, { background: "#5e5e5e", cursor: "ns-resize" });

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

            const _freezeH = document.getElementById("luckysheet-freezebar-horizontal");
            const _freezeHHandle = _freezeH ? _freezeH.querySelector(".luckysheet-freezebar-horizontal-handle") : null;
            if (_freezeHHandle) _freezeHHandle.style.top = top + 'px';

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

            const _freezeHDrop = _freezeH ? _freezeH.querySelector(".luckysheet-freezebar-horizontal-drop") : null;
            if (_freezeHDrop) _freezeHDrop.style.top = top + 'px';
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

            const _freezeV = document.getElementById("luckysheet-freezebar-vertical");
            const _freezeVHandle = _freezeV ? _freezeV.querySelector(".luckysheet-freezebar-vertical-handle") : null;
            if (_freezeVHandle) _freezeVHandle.style.left = left + 'px';

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

            const _freezeVDrop = _freezeV ? _freezeV.querySelector(".luckysheet-freezebar-vertical-drop") : null;
            if (_freezeVDrop) _freezeVDrop.style.left = left + 'px';
            luckysheetFreezen.saveFreezen(null, null, luckysheetFreezen.freezenverticaldata, left);
            luckysheetsizeauto(); //调节选区时下部单元格溢出
        } else if (Store.luckysheet_sheet_move_status) {
            let scrollLeft = sheetContainer.getScrollLeft();
            let x = event.pageX + scrollLeft;

            if (Math.abs(event.pageX - Store.luckysheet_sheet_move_data.pageX) < 3) {
                return;
            }

            const _sheetContainer = document.getElementById("luckysheet-sheet-container");
            let winW = _sheetContainer ? _sheetContainer.getBoundingClientRect().width : 0;
            const _containerRect = _sheetContainer ? _sheetContainer.getBoundingClientRect() : {left: 0};
            let left = x - Store.luckysheet_sheet_move_data.curleft - (_containerRect.left + window.pageXOffset);
            if (Store.luckysheet_sheet_move_data.activeobject) Store.luckysheet_sheet_move_data.activeobject.style.left = left + 'px';

            let row_index = luckysheet_searcharray(
                Store.luckysheet_sheet_move_data.widthlist,
                left + Store.luckysheet_sheet_move_data.curleft,
            );
            if (Store.luckysheet_sheet_move_data.cursorobject) Store.luckysheet_sheet_move_data.cursorobject.style.cursor = "move";

            if (left - scrollLeft <= 6) {
                const _leftScroll = document.getElementById("luckysheet-sheets-leftscroll"); if (_leftScroll) _leftScroll.click();
            }

            if (left - scrollLeft >= winW - 40) {
                const _rightScroll = document.getElementById("luckysheet-sheets-rightscroll"); if (_rightScroll) _rightScroll.click();
            }

            if (row_index != Store.luckysheet_sheet_move_data.curindex) {
                const _clone = document.getElementById("luckysheet-sheets-item-clone");
                const _visibleItems = document.querySelectorAll("#luckysheet-sheet-area div.luckysheet-sheets-item:visible");
                if (row_index == -1 && left > 0) {
                    row_index = Store.luckysheet_sheet_move_data.widthlist.length - 1;
                    const _target = _visibleItems[row_index];
                    if (_clone && _target) _target.after(_clone);
                } else if (row_index == -1 && left <= 0) {
                    const _target = _visibleItems[0];
                    if (_clone && _target) _target.before(_clone);
                } else {
                    const _target = _visibleItems[row_index];
                    if (_clone && _target) _target.after(_clone);
                }

                Store.luckysheet_sheet_move_data.widthlist = [];
                _visibleItems.forEach(function(item, i) {
                    if (i == 0) {
                        Store.luckysheet_sheet_move_data.widthlist.push(parseInt(item.offsetWidth));
                    } else {
                        Store.luckysheet_sheet_move_data.widthlist.push(
                            parseInt(item.offsetWidth) + Store.luckysheet_sheet_move_data.widthlist[i - 1],
                        );
                    }
                });

                Store.luckysheet_sheet_move_data.curindex = _clone ? Array.from(_visibleItems).indexOf(_clone) : -1;
            }
        } else if (Store.luckysheet_model_move_state) {
            let scrollTop = document.documentElement.scrollTop,
                scrollLeft = document.documentElement.scrollLeft;
            let y = event.pageY + scrollTop,
                x = event.pageX + scrollLeft;
            let winH = document.documentElement.clientHeight,
                winW = document.documentElement.clientWidth;
            let myh = Store.luckysheet_model_move_obj.getBoundingClientRect().height,
                myw = Store.luckysheet_model_move_obj.getBoundingClientRect().width;
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

            Store.luckysheet_model_move_obj.style.top = top + 'px';
            Store.luckysheet_model_move_obj.style.left = left + 'px';
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
