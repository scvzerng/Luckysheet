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
        const _elPageNext = document.getElementById("luckysheet-bottom-page-next");
        if (_elPageNext) {
            _elPageNext.addEventListener("click", function() {
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
                            const _elPageNextInner = document.getElementById("luckysheet-bottom-page-next"); if (_elPageNextInner) _elPageNextInner.style.display = 'none';
                            let pageInfoFull = replaceHtml(context.locale_info.pageInfoFull, {
                                total: luckysheetConfigsetting.total,
                                totalPage: luckysheetConfigsetting.pageInfo.totalPage,
                            });
                            const _elPageInfo = document.getElementById("luckysheet-bottom-page-info"); if (_elPageInfo) _elPageInfo.innerHTML = pageInfoFull;
                        } else {
                            let pageInfo = replaceHtml(context.locale_info.pageInfo, {
                                total: luckysheetConfigsetting.total,
                                totalPage: luckysheetConfigsetting.pageInfo.totalPage,
                                currentPage: luckysheetConfigsetting.pageInfo.currentPage,
                            });
                            const _elPageInfo2 = document.getElementById("luckysheet-bottom-page-info"); if (_elPageInfo2) _elPageInfo2.innerHTML = pageInfo;
                        }
                    },
                );
            });
            _elPageNext.addEventListener("mousedown", function(e) {
                e.stopPropagation();
            });
        }
    }

    //回到顶部
    const _elBottomTop = document.getElementById("luckysheet-bottom-bottom-top");
    if (_elBottomTop) {
        _elBottomTop.addEventListener("click", function() {
            scrollBarY.setScrollTop(0);
        });
        _elBottomTop.addEventListener("mousedown", function(e) {
            e.stopPropagation();
        });
    }

    document.querySelectorAll("#luckysheet-toolbar,#luckysheet-icon-morebtn-div,.luckysheet-toolbar-button").forEach(el => el.addEventListener("click", function(e) {
        if (this.id != "luckysheet-icon-paintformat" && menuButton.luckysheetPaintModelOn) {
            menuButton.cancelPaintModel();
        }
    }));
}
