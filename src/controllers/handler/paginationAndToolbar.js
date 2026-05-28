import luckysheetConfigsetting from "../luckysheetConfigsetting";
import menuButton from "../menuButton";
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
import method from "../../global/method";
import Store from "../../store";
import context from "./context";
import scrollBarY from '../../ui/scrollBarY.js';

export default function paginationAndToolbar() {
    //是否允许加载下一页
    if (luckysheetConfigsetting.enablePage) {
        $("#luckysheet-bottom-page-next")
            .click(function() {
                let queryExps = luckysheetConfigsetting.pageInfo.queryExps;
                let reportId = luckysheetConfigsetting.pageInfo.reportId;
                let fields = luckysheetConfigsetting.pageInfo.fields;
                let mobile = luckysheetConfigsetting.pageInfo.mobile;
                let frezon = luckysheetConfigsetting.pageInfo.frezon;
                let currentPage = luckysheetConfigsetting.pageInfo.currentPage;
                let totalPage = luckysheetConfigsetting.pageInfo.totalPage;
                let pageUrl = luckysheetConfigsetting.pageInfo.pageUrl;

                method.addDataAjax(
                    {
                        queryExps: queryExps,
                        reportId: reportId,
                        fields: fields,
                        mobile: mobile,
                        frezon: frezon,
                        pageIndex: currentPage,
                        currentPage: currentPage,
                    },
                    Store.currentSheetIndex,
                    pageUrl,
                    function() {
                        luckysheetConfigsetting.pageInfo.currentPage++;
                        if (
                            luckysheetConfigsetting.pageInfo.totalPage == luckysheetConfigsetting.pageInfo.currentPage
                        ) {
                            $("#luckysheet-bottom-page-next").hide();
                            let pageInfoFull = replaceHtml(context.locale_info.pageInfoFull, {
                                total: luckysheetConfigsetting.total,
                                totalPage: luckysheetConfigsetting.pageInfo.totalPage,
                            });
                            $("#luckysheet-bottom-page-info").html(pageInfoFull);
                        } else {
                            let pageInfo = replaceHtml(context.locale_info.pageInfo, {
                                total: luckysheetConfigsetting.total,
                                totalPage: luckysheetConfigsetting.pageInfo.totalPage,
                                currentPage: luckysheetConfigsetting.pageInfo.currentPage,
                            });
                            $("#luckysheet-bottom-page-info").html(pageInfo);
                        }
                    },
                );
            })
            .mousedown(function(e) {
                e.stopPropagation();
            });
    }

    //回到顶部
    $("#luckysheet-bottom-bottom-top")
        .click(function() {
            scrollBarY.setScrollTop(0);
        })
        .mousedown(function(e) {
            e.stopPropagation();
        });

    $("#luckysheet-wa-editor,#luckysheet-icon-morebtn-div,.luckysheet-toolbar-button").click(function(e) {
        if (this.id != "luckysheet-icon-paintformat" && menuButton.luckysheetPaintModelOn) {
            menuButton.cancelPaintModel();
        }
    });
}
