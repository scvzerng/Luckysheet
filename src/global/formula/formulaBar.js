import sheetmanage from "../../controllers/sheetmanage";
import {  isEditMode  } from "../validate";
import {  getcellvalue,  getInlineStringNoStyle } from "../getdata";
import {  valueShowEs  } from "../format";
import {  isInlineStringCell } from "../../controllers/inlineString";
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

const formulaBar = {
        oldvalue: null,

        dontupdate: function() {
            let _this = this;
            Store.luckysheetCellUpdate.length = 0;
            functionBox.setHtml(_this.oldvalue);
            richTextEditor.setHtml(_this.oldvalue);
            _this.cancelNormalSelected();
            if (_this.rangetosheet != Store.currentSheetIndex) {
                sheetmanage.changeSheetExec(_this.rangetosheet);
            }
        },

        fucntionboxshow: function(r, c) {
            functionBox.setHtml("");

            let _this = this;

            let d = Store.sheetData;
            let value = "";
            // && d[r][c].v != null
            if (d[r] != null && d[r][c] != null) {
                let cell = structuredClone(d[r][c]);
                /**
                 * fix #1010
                 */
                if (isInlineStringCell(cell)) {
                    value = getInlineStringNoStyle(r, c);
                    if (typeof value === "string") {
                        value = value.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
                    }
                } else if (cell.f != null) {
                    value = getcellvalue(r, c, d, "f");
                } else {
                    value = valueShowEs(r, c, d);
                    if (typeof value === "string") {
                        value = value.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
                    }
                }
            }
            value = this.xssDeal(value);
            _this.oldvalue = value;
            functionBox.setHtml(value);
        },
        //获得某个单元格或区域的偏移一定距离后的单元格( Sheet1!B6:C8 格式),

        functionInputHanddler: function($to, $input, kcode) {
            if (isEditMode()) {
                //此模式下禁用公式栏
                return;
            }

            let _this = this;

            let $copy = $to,
                $editer = $input;
            let value1 = $editer.innerHTML,
                value1txt = $editer.textContent;
            let xssDeal = this.xssDeal;
            setTimeout(function() {
                let value = $editer.textContent,
                    valuetxt = value;
                value = xssDeal(value);
                if (value !== null && value.substr(0, 1) == "=" && (kcode != 229 || value.length == 1)) {
                    value = _this.functionHTMLGenerate(value);
                    value1 = _this.functionHTMLGenerate(value1txt);

                    if (window.getSelection) {
                        // all browsers, except IE before version 9
                        let currSelection = window.getSelection();
                        if (currSelection.anchorNode && currSelection.anchorNode.matches("div")) {
                            let editorSpans = richTextEditor.el?.querySelectorAll("span");
                            let editorlen = editorSpans ? editorSpans.length : 0;
                            _this.functionRangeIndex = [
                                editorlen - 1,
                                editorSpans && editorlen > 0 ? editorSpans[editorlen - 1]
                                    .textContent.length : 0,
                            ];
                        } else {
                            let _an = currSelection.anchorNode;
                            let _p = _an && _an.nodeType === Node.TEXT_NODE ? _an.parentElement : _an;
                            _this.functionRangeIndex = [
                                _p && _p.parentElement ? Array.from(_p.parentElement.children).indexOf(_p) : -1,
                                currSelection.anchorOffset,
                            ];
                        }
                    } else {
                        // Internet Explorer before version 9
                        let textRange = document.selection.createRange();
                        _this.functionRangeIndex = textRange;
                    }

                    $editer.innerHTML = value;
                    _this.functionRange($editer, value, value1);
                    _this.canceFunctionrangeSelected();

                    if (kcode != 46) {
                        //delete不执行此函数
                        _this.createRangeHightlight();
                    }

                    $copy.innerHTML = value;
                    _this.rangestart = false;
                    _this.rangedrag_column_start = false;
                    _this.rangedrag_row_start = false;

                    _this.rangeHightlightselected($editer, kcode);
                } else if (value1txt.substr(0, 1) != "=") {
                    //&& value1.indexOf("span")>-1
                    // $editer.innerHTML = value1;

                    // let w = window.getSelection();
                    // if(w!=null && w.type!="None"){
                    //     let range = w.getRangeAt(0);
                    //     let c = range.startContainer;

                    //     if(c.id=="luckysheet-rich-text-editor" || c.closest("#luckysheet-rich-text-editor")){
                    //         $functionbox.innerHTML = value;
                    //     }
                    //     else if(c.id=="luckysheet-function-input-cell" || c.closest("#luckysheet-function-input-cell")){
                    //         if(value1.indexOf("span")>-1){

                    //         }
                    //         else{
                    //             $editer.innerHTML = value;
                    //         }
                    //     }

                    // }
                    // console.trace();
                    // console.log(value, $copy.getAttribute("id"));

                    if ($copy.getAttribute("id") == "luckysheet-rich-text-editor") {
                        if ($copy.innerHTML.substr(0, 5) == "<span") {
                        } else {
                            value = _this.ltGtSignDeal(value);
                            $copy.innerHTML = value;
                        }
                    } else {
                        value = _this.ltGtSignDeal(value);
                        $copy.innerHTML = value;
                    }
                }
            }, 1);
        },

        functionResizeData: {},

        functionResizeStatus: false,

        functionResizeTimeout: null,

        data_parm_index: 0, //选择公式后参数索引标记

        // 点中指定的公式，展示刷新按钮
};

export default formulaBar;
