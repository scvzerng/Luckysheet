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
import functionBox from '../../ui/functionBox.js';

const rangeHighlight = {
        rangeHightlightHTML:
            '<div id="luckysheet-formula-functionrange-highlight-${id}" rangeindex="${id}"  class="luckysheet-selection-highlight luckysheet-formula-functionrange-highlight"><div data-type="top" class="luckysheet-selection-copy-top luckysheet-copy"></div><div data-type="right" class="luckysheet-selection-copy-right luckysheet-copy"></div><div data-type="bottom" class="luckysheet-selection-copy-bottom luckysheet-copy"></div><div data-type="left" class="luckysheet-selection-copy-left luckysheet-copy"></div><div class="luckysheet-selection-copy-hc"></div><div data-type="lt" class="luckysheet-selection-highlight-topleft luckysheet-highlight"></div><div data-type="rt" class="luckysheet-selection-highlight-topright luckysheet-highlight"></div><div data-type="lb" class="luckysheet-selection-highlight-bottomleft luckysheet-highlight"></div><div data-type="rb" class="luckysheet-selection-highlight-bottomright luckysheet-highlight"></div></div>',

        createRangeHightlight: function() {
            let _this = this;

            let $spanList = document.querySelectorAll("#luckysheet-formula-functionrange span");
            document.querySelector("#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight")?.remove();

            $spanList.forEach(function(span) {
                let rangeindex = span.getAttribute("rangeindex"),
                    range = span.textContent;

                document.getElementById("luckysheet-formula-functionrange").insertAdjacentHTML('beforeend', replaceHtml(_this.rangeHightlightHTML, {
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
                    let _rangeEl = document.getElementById(rangeid);
                    _rangeEl.dataset.range = cellrange;
                    Object.assign(_rangeEl.querySelector(".luckysheet-copy").style, { background: luckyColor[rangeindex] });
                    Object.assign(_rangeEl.querySelector(".luckysheet-highlight").style, { background: luckyColor[rangeindex] });
                    Object.assign(_rangeEl.querySelector(".luckysheet-selection-copy-hc").style, { background: luckyColor[rangeindex] });

                    seletedHighlistByindex(
                        rangeid,
                        cellrange.row[0],
                        cellrange.row[1],
                        cellrange.column[0],
                        cellrange.column[1],
                    );
                }
            });

            document.querySelectorAll("#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight").forEach(el => el.style.display = '');
        },

        getrangeseleciton: function() {
            let currSelection = window.getSelection();
            let anchor = currSelection.anchorNode;
            let anchorOffset = currSelection.anchorOffset;

            if (!anchor) return null;

            if (anchor.nodeType === Node.TEXT_NODE && anchor.parentElement && anchor.parentElement.matches("span") && anchorOffset != 0) {
                let txt = anchor.textContent.trim(),
                    lasttxt = "";

                if (txt === null && anchor.parentElement.previousElementSibling !== null) {
                    let ahr = anchor.parentElement.previousElementSibling;
                    txt = ahr.textContent.trim();
                    lasttxt = txt.substr(txt.length - 1, 1);
                    return ahr;
                } else {
                    lasttxt = txt.substr(anchorOffset - 1, 1);
                    return anchor.parentElement;
                }
            } else if (anchor === richTextEditor.el || anchor === functionBox.el) {
                let spans = anchor.querySelectorAll("span");
                let txt = spans[spans.length - 1].textContent.trim();

                if (txt === null && spans.length > 1) {
                    txt = spans[spans.length - 2].textContent.trim();
                    return ahr;
                } else {
                    return anchor.querySelector("span").last();
                }
            } else if (
                anchor.parentElement === richTextEditor.el ||
                anchor.parentElement === functionBox.el ||
                anchorOffset == 0
            ) {
                if (anchorOffset == 0) {
                    anchor = anchor.parentElement;
                }

                if (anchor.previousElementSibling !== null) {
                    let txt = anchor.previousElementSibling.textContent.trim();
                    let lasttxt = txt.substr(txt.length - 1, 1);
                    return anchor.previousElementSibling;
                }
            }

            return null;
        }
};

export default rangeHighlight;
