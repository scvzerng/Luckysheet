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

export default function scroll() {
    $("#luckysheet-sheet-container-c").mousewheel(function(event, delta) {
        let scrollNum = event.deltaFactor < 40 ? 1 : event.deltaFactor < 80 ? 2 : 3;
        let scrollLeft = $(this).scrollLeft();
        if (event.deltaY != 0) {
            if (event.deltaY < 0) {
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
        $(this).scrollLeft(scrollLeft);
        event.preventDefault();
    });

    //滚动监听
    $("#luckysheet-cell-main")
        .scroll(function() {})
        .mousewheel(function(event, delta) {
            event.preventDefault();
        });

    context._locale = locale();
    context.locale_drag = context._locale.drag;
    context.locale_info = context._locale.info;
    $("#luckysheet-grid-window-1").mousewheel(function(event, delta) {
        let scrollLeft = $("#luckysheet-scrollbar-x").scrollLeft(),
            scrollTop = $("#luckysheet-scrollbar-y").scrollTop();
        let visibledatacolumn_c = Store.visibledatacolumn,
            visibledatarow_c = Store.visibledatarow;

        if (luckysheetFreezen.freezenhorizontaldata != null) {
            visibledatarow_c = luckysheetFreezen.freezenhorizontaldata[3];
        }

        if (luckysheetFreezen.freezenverticaldata != null) {
            visibledatacolumn_c = luckysheetFreezen.freezenverticaldata[3];
        }

        clearTimeout(context.mousewheelArrayUniqueTimeout);

        // if(Store.visibledatacolumn.length!=visibledatacolumn_c.length){
        if (Store.visibledatacolumn_unique != null) {
            visibledatacolumn_c = Store.visibledatacolumn_unique;
        } else {
            visibledatacolumn_c = ArrayUnique(visibledatacolumn_c);
            Store.visibledatacolumn_unique = visibledatacolumn_c;
        }
        // }

        // if(Store.visibledatarow.length!=visibledatarow_c.length){
        if (Store.visibledatarow_unique != null) {
            visibledatarow_c = Store.visibledatarow_unique;
        } else {
            visibledatarow_c = ArrayUnique(visibledatarow_c);
            Store.visibledatarow_unique = visibledatarow_c;
        }
        // }

        // visibledatacolumn_c = ArrayUnique(visibledatacolumn_c);
        // visibledatarow_c = ArrayUnique(visibledatarow_c);

        let col_st = luckysheet_searcharray(visibledatacolumn_c, scrollLeft);
        let row_st = luckysheet_searcharray(visibledatarow_c, scrollTop);

        if (luckysheetFreezen.freezenhorizontaldata != null) {
            row_st = luckysheet_searcharray(visibledatarow_c, scrollTop + luckysheetFreezen.freezenhorizontaldata[0]);
        }

        let colscroll = 0;
        let rowscroll = 0;

        let scrollNum = event.deltaFactor < 40 ? 1 : event.deltaFactor < 80 ? 2 : 3;
        //一次滚动三行或三列
        if (event.deltaY != 0) {
            let row_ed,
                step = Math.round(scrollNum / Store.zoomRatio);
            step = step < 1 ? 1 : step;
            if (event.deltaY < 0) {
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

            $("#luckysheet-scrollbar-y").scrollTop(rowscroll);
        } else if (event.deltaX != 0) {
            let col_ed;

            // if((isMac && event.deltaX >0 ) || (!isMac && event.deltaX < 0)){
            if (event.deltaX > 0) {
                scrollLeft = scrollLeft + 20 * Store.zoomRatio;

                // if(col_ed >= visibledatacolumn_c.length){
                //     col_ed = visibledatacolumn_c.length - 1;
                // }
            } else {
                scrollLeft = scrollLeft - 20 * Store.zoomRatio;

                // if(col_ed < 0){
                //     col_ed = 0;
                // }
            }

            // colscroll = col_ed == 0 ? 0 : visibledatacolumn_c[col_ed - 1];

            $("#luckysheet-scrollbar-x").scrollLeft(scrollLeft);
        }

        context.mousewheelArrayUniqueTimeout = setTimeout(() => {
            Store.visibledatacolumn_unique = null;
            Store.visibledatarow_unique = null;
        }, 500);
    });

    $("#luckysheet-scrollbar-x")
        .scroll(function() {
            // setTimeout(function(){
            luckysheetscrollevent();
            // },10);
        })
        .mousewheel(function(event, delta) {
            event.preventDefault();
        });

    $("#luckysheet-scrollbar-y")
        .scroll(function() {
            // setTimeout(function(){
            luckysheetscrollevent();
            // },10);
        })
        .mousewheel(function(event, delta) {
            event.preventDefault();
        });

}
