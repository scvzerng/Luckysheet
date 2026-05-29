import {  getObjType } from "../../utils/util";
import { getCurrentFile } from "../../utils/storeAccess.js";
import sheetmanage from "../../controllers/sheetmanage";
import {  isRealNull } from "../validate";
import {  getCellTextInfo  } from "../getRowlen";
import { setcellvalue } from "../setdata";
import editor from "../editor";
import {  colLocationByIndex } from "../location";
import { jfrefreshgrid } from "../refresh";
import { isInlineStringCell, convertSpanToShareString } from "../../controllers/inlineString";
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
import method from "../method";
import { resetInputBoxStyle } from '../../utils/domUtils.js';
import formulaDialogs from '../../ui/formulaDialogs.js';
import richTextEditor from '../../ui/richTextEditor.js';
import canvasContext from '../../ui/canvasContext.js';
import countShow from '../../ui/countShow.js';
import formulaRangeSelect from '../../ui/formulaRangeSelect.js';
import inputBoxIndex from '../../ui/inputBoxIndex.js';
import functionBox from '../../ui/functionBox.js';

const cellUpdate = {
        updatecell: function(r, c, value, isRefresh = true) {
            let _this = this;

            let $input = richTextEditor.el;
            let inputText = richTextEditor.getText(),
                inputHtml = richTextEditor.getHtml();

            if (_this.rangetosheet != null && _this.rangetosheet != Store.currentSheetIndex) {
                sheetmanage.changeSheetExec(_this.rangetosheet);
            }

            let curv = Store.flowdata[r][c];

            // Store old value for hook function
            const oldValue = JSON.stringify(curv);

            let isPrevInline = isInlineStringCell(curv);
            let isCurInline = inputText.slice(0, 1) != "=" && inputHtml.substr(0, 5) == "<span";

            let isCopyVal = false;
            if (!isCurInline && inputText && inputText.length > 0) {
                let splitArr = inputText
                    .replace(/\r\n/g, "_x000D_")
                    .replace(/&#13;&#10;/g, "_x000D_")
                    .replace(/\r/g, "_x000D_")
                    .replace(/\n/g, "_x000D_")
                    .split("_x000D_");
                if (splitArr.length > 1) {
                    isCopyVal = true;
                    isCurInline = true;
                    inputText = splitArr.join("\r\n");
                }
            }

            if (!value && !isCurInline && isPrevInline) {
                delete curv.ct.s;
                curv.ct.t = "g";
                curv.ct.fa = "General";
                value = "";
            } else if (isCurInline) {
                if (getObjType(curv) != "object") {
                    curv = {};
                }
                delete curv.f;
                delete curv.v;
                delete curv.m;

                if (curv.ct == null) {
                    curv.ct = {};
                    curv.ct.fa = "General";
                }

                curv.ct.t = "inlineStr";
                curv.ct.s = convertSpanToShareString($input.querySelectorAll("span"));
                if (isCopyVal) {
                    curv.ct.s = [
                        {
                            v: inputText,
                        },
                    ];
                }
            }

            // API, we get value from user
            value = value || $input.textContent;

            // Hook function
            if (!method.createHookFunction("cellUpdateBefore", r, c, value, isRefresh)) {
                _this.cancelNormalSelected();
                return;
            }

            if (!isCurInline) {
                if (isRealNull(value) && !isPrevInline) {
                    if (curv == null || (isRealNull(curv.v) && curv.f == null)) {
                        _this.cancelNormalSelected();
                        return;
                    }
                } else if (curv != null && curv.qp != 1) {
                    if (getObjType(curv) == "object" && (value == curv.f || value == curv.v || value == curv.m)) {
                        _this.cancelNormalSelected();
                        return;
                    } else if (value == curv) {
                        _this.cancelNormalSelected();
                        return;
                    }
                }

                if (getObjType(value) == "string" && value.slice(0, 1) == "=" && value.length > 1) {
                } else if (
                    getObjType(curv) == "object" &&
                    curv.ct != null &&
                    curv.ct.fa != null &&
                    curv.ct.fa != "@" &&
                    !isRealNull(value)
                ) {
                    delete curv.m; //更新时间m处理 ， 会实际删除单元格数据的参数（flowdata时已删除）
                    if (curv.f != null) {
                        //如果原来是公式，而更新的数据不是公式，则把公式删除
                        delete curv.f;
                    }
                }
            }

            window.luckysheet_getcelldata_cache = null;

            let isRunExecFunction = true;

            let d = editor.deepCopyFlowData(Store.flowdata);
            let dynamicArrayItem = null; //动态数组

            if (getObjType(curv) == "object") {
                if (!isCurInline) {
                    if (getObjType(value) == "string" && value.slice(0, 1) == "=" && value.length > 1) {
                        let v = _this.execfunction(value, r, c, undefined, true);
                        isRunExecFunction = false;
                        curv = structuredClone(d[r][c]);
                        curv.v = v[1];
                        curv.f = v[2];

                        if (v.length == 4 && v[3].type == "dynamicArrayItem") {
                            dynamicArrayItem = v[3].data;
                        }
                    }
                    // from API setCellValue,luckysheet.setCellValue(0, 0, {f: "=sum(D1)", bg:"#0188fb"}),value is an object, so get attribute f as value
                    else if (getObjType(value) == "object") {
                        let valueFunction = value.f;

                        if (
                            getObjType(valueFunction) == "string" &&
                            valueFunction.slice(0, 1) == "=" &&
                            valueFunction.length > 1
                        ) {
                            let v = _this.execfunction(valueFunction, r, c, undefined, true);
                            isRunExecFunction = false;
                            // get v/m/ct

                            curv = structuredClone(d[r][c]);
                            curv.v = v[1];
                            curv.f = v[2];

                            if (v.length == 4 && v[3].type == "dynamicArrayItem") {
                                dynamicArrayItem = v[3].data;
                            }
                        }
                        // from API setCellValue,luckysheet.setCellValue(0, 0, {f: "=sum(D1)", bg:"#0188fb"}),value is an object, so get attribute f as value
                        else {
                            for (let attr in value) {
                                curv[attr] = value[attr];
                            }
                            // let valueFunction = value.f;

                            // if(getObjType(valueFunction) == "string" && valueFunction.slice(0, 1) == "=" && valueFunction.length > 1){
                            //     let v = _this.execfunction(valueFunction, r, c, undefined, true);
                            //     isRunExecFunction = false;
                            //     // get v/m/ct
                            //     curv = d[r][c];
                            //     curv.v = v[1];
                            //     // get f
                            //     curv.f = v[2];

                            //     // get other cell style attribute
                            //     delete value.v;
                            //     delete value.m;
                        }
                    } else {
                        _this.delFunctionGroup(r, c);
                        _this.execFunctionGroup(r, c, value);
                        isRunExecFunction = false;

                        curv = structuredClone(d[r][c]);
                        // let gd = _this.execFunctionGlobalData[r+"_"+c+"_"+Store.currentSheetIndex];
                        // if(gd!=null){
                        //     curv.v = gd.v;
                        // }
                        curv.v = value;

                        delete curv.f;

                        if (curv.qp == 1 && ("" + value).substr(0, 1) != "'") {
                            //if quotePrefix is 1, cell is force string, cell clear quotePrefix when it is updated
                            curv.qp = 0;
                            if (curv.ct != null) {
                                curv.ct.fa = "General";
                                curv.ct.t = "n";
                            }
                        }
                    }
                }
                value = curv;
            } else {
                if (getObjType(value) == "string" && value.slice(0, 1) == "=" && value.length > 1) {
                    let v = _this.execfunction(value, r, c, undefined, true);
                    isRunExecFunction = false;
                    value = {
                        v: v[1],
                        f: v[2],
                    };

                    if (v.length == 4 && v[3].type == "dynamicArrayItem") {
                        dynamicArrayItem = v[3].data;
                    }
                }
                // from API setCellValue,luckysheet.setCellValue(0, 0, {f: "=sum(D1)", bg:"#0188fb"}),value is an object, so get attribute f as value
                else if (getObjType(value) == "object") {
                    let valueFunction = value.f;

                    if (
                        getObjType(valueFunction) == "string" &&
                        valueFunction.slice(0, 1) == "=" &&
                        valueFunction.length > 1
                    ) {
                        let v = _this.execfunction(valueFunction, r, c, undefined, true);
                        isRunExecFunction = false;
                        // value = {
                        //     "v": v[1],
                        //     "f": v[2]
                        // };

                        // update attribute v
                        value.v = v[1];
                        value.f = v[2];

                        if (v.length == 4 && v[3].type == "dynamicArrayItem") {
                            dynamicArrayItem = v[3].data;
                        }
                    } else {
                        let v = curv;
                        if (value.v == null) {
                            value.v = v;
                        }
                    }
                } else {
                    _this.delFunctionGroup(r, c);
                    _this.execFunctionGroup(r, c, value);
                    isRunExecFunction = false;
                }
            }

            // value maybe an object
            setcellvalue(r, c, d, value);
            _this.cancelNormalSelected();

            let RowlChange = false;
            let cfg = structuredClone(getCurrentFile()["config"]);
            if (cfg["rowlen"] == null) {
                cfg["rowlen"] = {};
            }

            // 单元格行高自适应,只有在单元格不是合并单元格时才能生效
            if (
                (d[r][c].tb == "2" && d[r][c].v != null) ||
                (isInlineStringCell(d[r][c]) && typeof d[r][c]["mc"] == "undefined")
            ) {
                //自动换行
                let defaultrowlen = Store.defaultrowlen;

                let canvas = canvasContext.getContext();
                // offlinecanvas.textBaseline = 'top'; //textBaseline以top计算

                // let fontset = luckysheetfontformat(d[r][c]);
                // offlinecanvas.font = fontset;

                if (cfg["customHeight"] && cfg["customHeight"][r] == 1) {
                } else {
                    // let currentRowLen = defaultrowlen;
                    // if(cfg["rowlen"][r] != null){
                    //     currentRowLen = cfg["rowlen"][r];
                    // }

                    let cellWidth = colLocationByIndex(c)[1] - colLocationByIndex(c)[0] - 2;

                    let textInfo = getCellTextInfo(d[r][c], canvas, {
                        r: r,
                        c: c,
                        cellWidth: cellWidth,
                    });

                    let currentRowLen = defaultrowlen;
                    // console.log("rowlen", textInfo);
                    if (textInfo != null) {
                        currentRowLen = textInfo.textHeightAll + 2;
                    }

                    // let strValue = getcellvalue(r, c, d).toString();
                    // let measureText = offlinecanvas.measureText(strValue);

                    // let textMetrics = measureText.width;
                    // let cellWidth = colLocationByIndex(c)[1] - colLocationByIndex(c)[0] - 4;
                    // let oneLineTextHeight = measureText.actualBoundingBoxDescent - measureText.actualBoundingBoxAscent;

                    // if(textMetrics > cellWidth){
                    //     let strArr = [];//文本截断数组
                    //     strArr = getCellTextSplitArr(strValue, strArr, cellWidth, offlinecanvas);

                    //     let computeRowlen = oneLineTextHeight * strArr.length + 4;
                    //     //比较计算高度和当前高度取最大高度
                    //     if(computeRowlen > currentRowLen){
                    //         currentRowLen = computeRowlen;
                    //     }
                    // }

                    if (currentRowLen > defaultrowlen) {
                        cfg["rowlen"][r] = currentRowLen;
                        RowlChange = true;
                    }
                }
            }

            //动态数组
            let dynamicArray = null;
            if (dynamicArrayItem) {
                // let file = getCurrentFile();
                dynamicArray = structuredClone(this.insertUpdateDynamicArray(dynamicArrayItem));
                // dynamicArray.push(dynamicArrayItem);
            }

            let allParam = {
                dynamicArray: dynamicArray,
            };

            if (RowlChange) {
                allParam = {
                    cfg: cfg,
                    dynamicArray: dynamicArray,
                    RowlChange: RowlChange,
                };
            }

            setTimeout(() => {
                // Hook function
                method.createHookFunction("cellUpdated", r, c, JSON.parse(oldValue), Store.flowdata[r][c], isRefresh);
            }, 0);

            if (isRefresh) {
                jfrefreshgrid(d, [{ row: [r, r], column: [c, c] }], allParam, isRunExecFunction);
                // Store.luckysheetCellUpdate.length = 0; //clear array
                _this.execFunctionGlobalData = null; //销毁
            } else {
                return {
                    data: d,
                    allParam: allParam,
                };
            }
        },

        cancelNormalSelected: function() {
            let _this = this;

            _this.canceFunctionrangeSelected();

            document.querySelectorAll("#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight").forEach(el => el.remove());
            resetInputBoxStyle();
            inputBoxIndex.hide();
            functionBox.unsetActive();

            _this.rangestart = false;
            _this.rangedrag_column_start = false;
            _this.rangedrag_row_start = false;
        },

        canceFunctionrangeSelected: function() {
            formulaRangeSelect.hide();
            countShow.row.hide();
            countShow.column.hide();
            // $("#luckysheet-cols-h-selected, #luckysheet-rows-h-selected").hide();
            formulaDialogs.formulaSearchC.hide();
            formulaDialogs.formulaHelp.hide();
        }
};

export default cellUpdate;
