import {  replaceHtml } from "../../utils/util";
import { luckyColor } from "../../controllers/constant";
import {  seletedHighlistByindex } from "../../controllers/select";
// import luckysheet_function from '../function/luckysheet_function';
// import functionlist from '../function/functionlist';
import {
    luckysheet_compareWith,
    luckysheet_getarraydata,
    luckysheet_getcelldata,
    luckysheet_parseData,
    luckysheet_getValue,
    luckysheet_indirect_check,
    luckysheet_indirect_check_return,
    luckysheet_offset_check,
    luckysheet_calcADPMM,
    luckysheet_getSpecialReference,
} from "../../function/func";
import Store from "../../store";
import richTextEditor from '../../ui/richTextEditor.js';

const rangeHighlight = {
        rangeHightlightHTML:
            '<div id="luckysheet-formula-functionrange-highlight-${id}" rangeindex="${id}"  class="luckysheet-selection-highlight luckysheet-formula-functionrange-highlight"><div data-type="top" class="luckysheet-selection-copy-top luckysheet-copy"></div><div data-type="right" class="luckysheet-selection-copy-right luckysheet-copy"></div><div data-type="bottom" class="luckysheet-selection-copy-bottom luckysheet-copy"></div><div data-type="left" class="luckysheet-selection-copy-left luckysheet-copy"></div><div class="luckysheet-selection-copy-hc"></div><div data-type="lt" class="luckysheet-selection-highlight-topleft luckysheet-highlight"></div><div data-type="rt" class="luckysheet-selection-highlight-topright luckysheet-highlight"></div><div data-type="lb" class="luckysheet-selection-highlight-bottomleft luckysheet-highlight"></div><div data-type="rb" class="luckysheet-selection-highlight-bottomright luckysheet-highlight"></div></div>',

        createRangeHightlight: function() {
            let _this = this;

            let $span = richTextEditor.find("span.luckysheet-formula-functionrange-cell");
            $("#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight").remove();

            $span.each(function() {
                let rangeindex = $(this).attr("rangeindex"),
                    range = $(this).text();

                $("#luckysheet-formula-functionrange").append(
                    replaceHtml(_this.rangeHightlightHTML, {
                        id: rangeindex,
                    }),
                );

                let cellrange = _this.getcellrange(range);
                let rangeid = "luckysheet-formula-functionrange-highlight-" + rangeindex;

                if (cellrange == null) {
                } else if (
                    cellrange.sheetIndex == Store.currentSheetIndex ||
                    (cellrange.sheetIndex == -1 && _this.rangetosheet == Store.currentSheetIndex)
                ) {
                    $("#" + rangeid)
                        .data("range", cellrange)
                        .find(".luckysheet-copy")
                        .css({ background: luckyColor[rangeindex] })
                        .end()
                        .find(".luckysheet-highlight")
                        .css({ background: luckyColor[rangeindex] })
                        .end()
                        .find(".luckysheet-selection-copy-hc")
                        .css({ background: luckyColor[rangeindex] });

                    seletedHighlistByindex(
                        rangeid,
                        cellrange.row[0],
                        cellrange.row[1],
                        cellrange.column[0],
                        cellrange.column[1],
                    );
                }
            });

            $("#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight").show();
        },

        getrangeseleciton: function() {
            let currSelection = window.getSelection();
            let anchor = $(currSelection.anchorNode);
            let anchorOffset = currSelection.anchorOffset;

            if (anchor.parent().is("span") && anchorOffset != 0) {
                let txt = $.trim(anchor.text()),
                    lasttxt = "";

                if (txt.length == 0 && anchor.parent().prev().length > 0) {
                    let ahr = anchor.parent().prev();
                    txt = $.trim(ahr.text());
                    lasttxt = txt.substr(txt.length - 1, 1);
                    return ahr;
                } else {
                    lasttxt = txt.substr(anchorOffset - 1, 1);
                    return anchor.parent();
                }
            } else if (anchor.is("#luckysheet-rich-text-editor") || anchor.is("#luckysheet-functionbox-cell")) {
                let txt = $.trim(
                    anchor
                        .find("span")
                        .last()
                        .text(),
                );

                if (txt.length == 0 && anchor.find("span").length > 1) {
                    let ahr = anchor.find("span");
                    txt = $.trim(ahr.eq(ahr.length - 2).text());
                    return ahr;
                } else {
                    return anchor.find("span").last();
                }
            } else if (
                anchor.parent().is("#luckysheet-rich-text-editor") ||
                anchor.parent().is("#luckysheet-functionbox-cell") ||
                anchorOffset == 0
            ) {
                if (anchorOffset == 0) {
                    anchor = anchor.parent();
                }

                if (anchor.prev().length > 0) {
                    let txt = $.trim(anchor.prev().text());
                    let lasttxt = txt.substr(txt.length - 1, 1);
                    return anchor.prev();
                }
            }

            return null;
        }
};

export default rangeHighlight;
