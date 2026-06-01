import luckysheetFreezen from "../freezen";
import { luckysheet_searcharray } from "../sheetSearch";
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
import luckysheetscrollevent from "../../global/scroll";
import locale from "../../locale/locale";
import Store from "../../store";
import context from "./context";
import scrollBarX from "../../ui/scrollBarX.js";
import scrollBarY from "../../ui/scrollBarY.js";
import cellMain from "../../ui/cellMain.js";
import gridWindow from "../../ui/gridWindow.js";
import sheetContainer from "../../ui/sheetContainer.js";

export default function scroll() {
    sheetContainer.onMousewheel(function(event) {
        let absDelta = Math.abs(event.deltaY);
        let scrollNum = absDelta < 40 ? 1 : absDelta < 80 ? 2 : 3;
        let scrollLeft = sheetContainer.getScrollLeft();
        if (event.deltaY != 0) {
            if (event.deltaY > 0) {
                scrollLeft = scrollLeft + 10 * scrollNum;
            } else {
                scrollLeft = scrollLeft - 10 * scrollNum;
            }
        } else if (event.deltaX != 0) {
            if (event.deltaX > 0) {
                scrollLeft = scrollLeft + 10 * scrollNum;
            } else {
                scrollLeft = scrollLeft - 10 * scrollNum;
            }
        }
        sheetContainer.setScrollLeft(scrollLeft);
        event.preventDefault();
    });

    cellMain
        .onScroll(function() {})
        .onMousewheel(function(event) {
            event.preventDefault();
        });

    context._locale = locale();
    context.locale_drag = context._locale.drag;
    context.locale_info = context._locale.info;
    gridWindow.onMousewheel(function(event) {
        let scrollLeft = scrollBarX.getScrollLeft(),
            scrollTop = scrollBarY.getScrollTop();
        let visibledatacolumn_c = Store.visibleColPositions,
            visibledatarow_c = Store.visibledatarow;

        if (luckysheetFreezen.freezenhorizontaldata != null) {
            visibledatarow_c = luckysheetFreezen.freezenhorizontaldata[3];
        }

        if (luckysheetFreezen.freezenverticaldata != null) {
            visibledatacolumn_c = luckysheetFreezen.freezenverticaldata[3];
        }

        clearTimeout(context.mousewheelArrayUniqueTimeout);

        if (Store.visibleColPositions_unique != null) {
            visibledatacolumn_c = Store.visibleColPositions_unique;
        } else {
            visibledatacolumn_c = ArrayUnique(visibledatacolumn_c);
            Store.visibleColPositions_unique = visibledatacolumn_c;
        }

        if (Store.visibledatarow_unique != null) {
            visibledatarow_c = Store.visibledatarow_unique;
        } else {
            visibledatarow_c = ArrayUnique(visibledatarow_c);
            Store.visibledatarow_unique = visibledatarow_c;
        }

        let col_st = luckysheet_searcharray(visibledatacolumn_c, scrollLeft);
        let row_st = luckysheet_searcharray(visibledatarow_c, scrollTop);

        if (luckysheetFreezen.freezenhorizontaldata != null) {
            row_st = luckysheet_searcharray(visibledatarow_c, scrollTop + luckysheetFreezen.freezenhorizontaldata[0]);
        }

        let colscroll = 0;
        let rowscroll = 0;

        let absDelta = Math.abs(event.deltaY);
        let scrollNum = absDelta < 40 ? 1 : absDelta < 80 ? 2 : 3;
        if (event.deltaY != 0) {
            let row_ed,
                step = Math.round(scrollNum / Store.zoomRatio);
            step = step < 1 ? 1 : step;
            if (event.deltaY > 0) {
                row_ed = row_st + step;

                if (row_ed >= visibledatarow_c.length) {
                    row_ed = visibledatarow_c.length - 1;
                }
            } else {
                row_ed = row_st - step;

                if (row_ed < 0) {
                    row_ed = 0;
                }
            }

            rowscroll = row_ed == 0 ? 0 : visibledatarow_c[row_ed - 1];

            if (luckysheetFreezen.freezenhorizontaldata != null) {
                rowscroll -= luckysheetFreezen.freezenhorizontaldata[0];
            }

            scrollBarY.setScrollTop(rowscroll);
        } else if (event.deltaX != 0) {
            let col_ed;

            if (event.deltaX > 0) {
                scrollLeft = scrollLeft + 20 * Store.zoomRatio;
            } else {
                scrollLeft = scrollLeft - 20 * Store.zoomRatio;
            }

            scrollBarX.setScrollLeft(scrollLeft);
        }

        context.mousewheelArrayUniqueTimeout = setTimeout(() => {
            Store.visibleColPositions_unique = null;
            Store.visibledatarow_unique = null;
        }, 500);
    });

    scrollBarX
        .onScroll(function() {
            luckysheetscrollevent();
        })
        .onMousewheel(function(event) {
            event.preventDefault();
        });

    scrollBarY
        .onScroll(function() {
            luckysheetscrollevent();
        })
        .onMousewheel(function(event) {
            event.preventDefault();
        });

}
