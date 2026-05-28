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

const formulaBar = {
        oldvalue: null,

        dontupdate: function() {
            let _this = this;
            Store.luckysheetCellUpdate.length = 0; //clear array
            $("#luckysheet-functionbox-cell, #luckysheet-rich-text-editor").html(_this.oldvalue);
            _this.cancelNormalSelected();
            if (_this.rangetosheet != Store.currentSheetIndex) {
                sheetmanage.changeSheetExec(_this.rangetosheet);
            }
        },

        fucntionboxshow: function(r, c) {
            $("#luckysheet-functionbox-cell").html("");

            let _this = this;

            let d = Store.flowdata;
            let value = "";
            // && d[r][c].v != null
            if (d[r] != null && d[r][c] != null) {
                let cell = $.extend(true, {}, d[r][c]);
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
            $("#luckysheet-functionbox-cell").html(value);
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
            let value1 = $editer.html(),
                value1txt = $editer.text();
            let xssDeal = this.xssDeal;
            setTimeout(function() {
                let value = $editer.text(),
                    valuetxt = value;
                value = xssDeal(value);
                if (value.length > 0 && value.substr(0, 1) == "=" && (kcode != 229 || value.length == 1)) {
                    value = _this.functionHTMLGenerate(value);
                    value1 = _this.functionHTMLGenerate(value1txt);

                    if (window.getSelection) {
                        // all browsers, except IE before version 9
                        let currSelection = window.getSelection();
                        if ($(currSelection.anchorNode).is("div")) {
                            let editorlen = $("#luckysheet-rich-text-editor span").length;
                            _this.functionRangeIndex = [
                                editorlen - 1,
                                $("#luckysheet-rich-text-editor")
                                    .find("span")
                                    .eq(editorlen - 1)
                                    .text().length,
                            ];
                        } else {
                            _this.functionRangeIndex = [
                                $(currSelection.anchorNode)
                                    .parent()
                                    .index(),
                                currSelection.anchorOffset,
                            ];
                        }
                    } else {
                        // Internet Explorer before version 9
                        let textRange = document.selection.createRange();
                        _this.functionRangeIndex = textRange;
                    }

                    $editer.html(value);
                    _this.functionRange($editer, value, value1);
                    _this.canceFunctionrangeSelected();

                    if (kcode != 46) {
                        //delete不执行此函数
                        _this.createRangeHightlight();
                    }

                    $copy.html(value);
                    _this.rangestart = false;
                    _this.rangedrag_column_start = false;
                    _this.rangedrag_row_start = false;

                    _this.rangeHightlightselected($editer, kcode);
                } else if (value1txt.substr(0, 1) != "=") {
                    //&& value1.indexOf("span")>-1
                    // $editer.html(value1);

                    // let w = window.getSelection();
                    // if(w!=null && w.type!="None"){
                    //     let range = w.getRangeAt(0);
                    //     let c = range.startContainer;

                    //     if(c.id=="luckysheet-rich-text-editor" || $(c).closest("#luckysheet-rich-text-editor")){
                    //         $functionbox.html(value);
                    //     }
                    //     else if(c.id=="luckysheet-functionbox-cell" || $(c).closest("#luckysheet-functionbox-cell")){
                    //         if(value1.indexOf("span")>-1){

                    //         }
                    //         else{
                    //             $editer.html(value);
                    //         }
                    //     }

                    // }
                    // console.trace();
                    // console.log(value, $copy.attr("id"));

                    if ($copy.attr("id") == "luckysheet-rich-text-editor") {
                        if ($copy.html().substr(0, 5) == "<span") {
                        } else {
                            value = _this.ltGtSignDeal(value);
                            $copy.html(value);
                        }
                    } else {
                        value = _this.ltGtSignDeal(value);
                        $copy.html(value);
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
