import {  getRangetxt } from "../../methods/get";
import { luckyColor } from "../../controllers/constant";
import menuButton from "../../controllers/menuButton";
import luckysheetFreezen from "../../controllers/freezen";
import {  luckysheet_count_show  } from "../../controllers/select";
import {  rowLocation,  colLocation,  mouseposition  } from "../location";
import { luckysheetRangeLast } from "../cursorPos";
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
import { getScrollPosition } from '../../utils/domUtils.js';
import scrollBarX from '../../ui/scrollBarX.js';
import scrollBarY from '../../ui/scrollBarY.js';
import formulaDialogs from '../../ui/formulaDialogs.js';
import richTextEditor from '../../ui/richTextEditor.js';
import functionBox from '../../ui/functionBox.js';
import formulaRangeSelect from '../../ui/formulaRangeSelect.js';

const rangeSelect = {
        israngeseleciton: function(istooltip) {
            let _this = this;

            if (_this.operatorjson == null) {
                let arr = _this.operator.split("|"),
                    op = {};

                for (let i = 0; i < arr.length; i++) {
                    op[arr[i].toString()] = 1;
                }

                _this.operatorjson = op;
            }

            if (istooltip == null) {
                istooltip = false;
            }

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
                    _this.rangeSetValueTo = ahr;
                } else {
                    lasttxt = txt.substr(anchorOffset - 1, 1);
                    _this.rangeSetValueTo = anchor.parent();
                }

                if (
                    (istooltip && (lasttxt == "(" || lasttxt == ",")) ||
                    (!istooltip &&
                        (lasttxt == "(" ||
                            lasttxt == "," ||
                            lasttxt == "=" ||
                            lasttxt in _this.operatorjson ||
                            lasttxt == "&"))
                ) {
                    return true;
                }
            } else if (anchor.is(richTextEditor.el) || anchor.is(functionBox.el)) {
                let txt = $.trim(
                        anchor
                            .find("span")
                            .last()
                            .text(),
                    ),
                    lasttxt;

                _this.rangeSetValueTo = anchor.find("span").last();

                if (txt.length == 0 && anchor.find("span").length > 1) {
                    let ahr = anchor.find("span");
                    txt = $.trim(ahr.eq(ahr.length - 2).text());
                    _this.rangeSetValueTo = ahr;
                }

                lasttxt = txt.substr(txt.length - 1, 1);

                if (
                    (istooltip && (lasttxt == "(" || lasttxt == ",")) ||
                    (!istooltip &&
                        (lasttxt == "(" ||
                            lasttxt == "," ||
                            lasttxt == "=" ||
                            lasttxt in _this.operatorjson ||
                            lasttxt == "&"))
                ) {
                    return true;
                }
            } else if (
                anchor.parent().is(richTextEditor.el) ||
                anchor.parent().is(functionBox.el) ||
                anchorOffset == 0
            ) {
                if (anchorOffset == 0) {
                    anchor = anchor.parent();
                }

                if (anchor.prev().length > 0) {
                    let txt = $.trim(anchor.prev().text());
                    let lasttxt = txt.substr(txt.length - 1, 1);

                    _this.rangeSetValueTo = anchor.prev();

                    if (
                        (istooltip && (lasttxt == "(" || lasttxt == ",")) ||
                        (!istooltip &&
                            (lasttxt == "(" ||
                                lasttxt == "," ||
                                lasttxt == "=" ||
                                lasttxt in _this.operatorjson ||
                                lasttxt == "&"))
                    ) {
                        return true;
                    }
                }
            }

            return false;
        },

        rangechangeindex: null,

        rangestart: false,

        rangetosheet: null,

        rangeSetValueTo: null,

        func_selectedrange: {}, //函数选区范围,

        rangeSetValue: function(selected, obj) {
            let _this = this;

            let range = "",
                rf = selected["row"][0],
                cf = selected["column"][0];
            if (Store.config["merge"] != null && rf + "_" + cf in Store.config["merge"]) {
                range = getRangetxt(
                    Store.currentSheetIndex,
                    {
                        column: [cf, cf],
                        row: [rf, rf],
                    },
                    _this.rangetosheet,
                );
            } else {
                range = getRangetxt(Store.currentSheetIndex, selected, _this.rangetosheet);
            }

            let $editor;

            if (_this.rangestart || _this.rangedrag_column_start || _this.rangedrag_row_start) {
                if (
                    formulaDialogs.searchParm.isVisible() ||
                    formulaDialogs.searchParmSelect.isVisible()
                ) {
                    //公式参数框选取范围
                    $editor = richTextEditor.el;
                    formulaDialogs.searchParmSelect.find("#luckysheet-search-formula-parm-select-input").val(range);
                    formulaDialogs.searchParm.find(".parmBox")
                        .eq(_this.data_parm_index)
                        .find(".txt input")
                        .val(range);

                    //参数对应值显示
                    let txtdata = luckysheet_getcelldata(range).data;
                    if (txtdata instanceof Array) {
                        //参数为多个单元格选区
                        let txtArr = [];

                        for (let i = 0; i < txtdata.length; i++) {
                            for (let j = 0; j < txtdata[i].length; j++) {
                                if (txtdata[i][j] == null) {
                                    txtArr.push(null);
                                } else {
                                    txtArr.push(txtdata[i][j].v);
                                }
                            }
                        }

                        formulaDialogs.searchParm.find(".parmBox")
                            .eq(_this.data_parm_index)
                            .find(".val")
                            .text(" = {" + txtArr.join(",") + "}");
                    } else {
                        formulaDialogs.searchParm.find(".parmBox")
                            .eq(_this.data_parm_index)
                            .find(".val")
                            .text(" = {" + txtdata.v + "}");
                    }

                    //计算结果显示
                    let isVal = true; //参数不为空
                    let parmValArr = []; //参数值集合
                    let lvi = -1; //最后一个有值的参数索引
                    formulaDialogs.searchParm.find(".parmBox").each(function(i, e) {
                        let parmtxt = $(e)
                            .find(".txt input")
                            .val();
                        if (
                            parmtxt == "" &&
                            $(e)
                                .find(".txt input")
                                .attr("data_parm_require") == "m"
                        ) {
                            isVal = false;
                        }
                        if (parmtxt != "") {
                            lvi = i;
                        }
                    });

                    //单元格显示
                    let functionHtmlTxt;
                    if (lvi == -1) {
                        functionHtmlTxt =
                            "=" + formulaDialogs.searchParm.find(".luckysheet-modal-dialog-title-text").text() + "()";
                    } else if (lvi == 0) {
                        functionHtmlTxt =
                            "=" +
                            formulaDialogs.searchParm.find(".luckysheet-modal-dialog-title-text").text() +
                            "(" +
                            formulaDialogs.searchParm.find(".parmBox")
                                .eq(0)
                                .find(".txt input")
                                .val() +
                            ")";
                    } else {
                        for (let j = 0; j <= lvi; j++) {
                            parmValArr.push(
                                formulaDialogs.searchParm.find(".parmBox")
                                    .eq(j)
                                    .find(".txt input")
                                    .val(),
                            );
                        }
                        functionHtmlTxt =
                            "=" +
                            formulaDialogs.searchParm.find(".luckysheet-modal-dialog-title-text").text() +
                            "(" +
                            parmValArr.join(",") +
                            ")";
                    }

                    let function_str = _this.functionHTMLGenerate(functionHtmlTxt);
                    richTextEditor.setHtml(function_str);
                    functionBox.setHtml(richTextEditor.getHtml());

                    if (isVal) {
                        let fp = $.trim(_this.functionParserExe(richTextEditor.getText()));
                        let result = new Function("return " + fp)();
                        formulaDialogs.searchParm.find(".result span").text(result);
                    }
                } else {
                    let currSelection = window.getSelection();
                    let anchorOffset = currSelection.anchorNode;
                    $editor = $(anchorOffset).closest("div");

                    let $span = $editor.find("span[rangeindex='" + _this.rangechangeindex + "']").html(range);

                    _this.setCaretPosition($span.get(0), 0, range.length);
                }
            } else {
                let function_str =
                    '<span class="luckysheet-formula-functionrange-cell" rangeindex="' +
                    _this.functionHTMLIndex +
                    '" dir="auto" style="color:' +
                    luckyColor[_this.functionHTMLIndex] +
                    ';">' +
                    range +
                    "</span>";
                let $t = $(function_str).insertAfter(_this.rangeSetValueTo);
                _this.rangechangeindex = _this.functionHTMLIndex;
                $editor = $(_this.rangeSetValueTo).closest("div");

                _this.setCaretPosition(
                    $editor.find("span[rangeindex='" + _this.rangechangeindex + "']").get(0),
                    0,
                    range.length,
                );
                _this.functionHTMLIndex++;
            }

            if ($editor.is(richTextEditor.el)) {
                functionBox.setHtml(richTextEditor.getHtml());
            } else {
                richTextEditor.setHtml(functionBox.getHtml());
            }
        },

        rangedrag: function(event) {
            let _this = this;

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

            let top = 0,
                height = 0,
                rowseleted = [];

            if (_this.func_selectedrange.top > row_pre) {
                top = row_pre;
                height = _this.func_selectedrange.top + _this.func_selectedrange.height - row_pre;
                rowseleted = [row_index, _this.func_selectedrange.row[1]];
            } else if (_this.func_selectedrange.top == row_pre) {
                top = row_pre;
                height = _this.func_selectedrange.top + _this.func_selectedrange.height - row_pre;
                rowseleted = [row_index, _this.func_selectedrange.row[0]];
            } else {
                top = _this.func_selectedrange.top;
                height = row - _this.func_selectedrange.top - 1;
                rowseleted = [_this.func_selectedrange.row[0], row_index];
            }

            let left = 0,
                width = 0,
                columnseleted = [];

            if (_this.func_selectedrange.left > col_pre) {
                left = col_pre;
                width = _this.func_selectedrange.left + _this.func_selectedrange.width - col_pre;
                columnseleted = [col_index, _this.func_selectedrange.column[1]];
            } else if (_this.func_selectedrange.left == col_pre) {
                left = col_pre;
                width = _this.func_selectedrange.left + _this.func_selectedrange.width - col_pre;
                columnseleted = [col_index, _this.func_selectedrange.column[0]];
            } else {
                left = _this.func_selectedrange.left;
                width = col - _this.func_selectedrange.left - 1;
                columnseleted = [_this.func_selectedrange.column[0], col_index];
            }

            rowseleted[0] = luckysheetFreezen.changeFreezenIndex(rowseleted[0], "h");
            rowseleted[1] = luckysheetFreezen.changeFreezenIndex(rowseleted[1], "h");
            columnseleted[0] = luckysheetFreezen.changeFreezenIndex(columnseleted[0], "v");
            columnseleted[1] = luckysheetFreezen.changeFreezenIndex(columnseleted[1], "v");

            let changeparam = menuButton.mergeMoveMain(
                columnseleted,
                rowseleted,
                _this.func_selectedrange,
                top,
                height,
                left,
                width,
            );
            if (changeparam != null) {
                columnseleted = changeparam[0];
                rowseleted = changeparam[1];
                top = changeparam[2];
                height = changeparam[3];
                left = changeparam[4];
                width = changeparam[5];
            }

            _this.func_selectedrange["row"] = rowseleted;
            _this.func_selectedrange["column"] = columnseleted;

            _this.func_selectedrange["left_move"] = left;
            _this.func_selectedrange["width_move"] = width;
            _this.func_selectedrange["top_move"] = top;
            _this.func_selectedrange["height_move"] = height;

            luckysheet_count_show(left, top, width, height, rowseleted, columnseleted);

            formulaRangeSelect.showAt({
                    left: left,
                    width: width,
                    top: top,
                    height: height,
                });

            if (formulaDialogs.ifFormulaMultiRange.isVisible()) {
                //if公式生成器 选择范围
                let range = getRangetxt(
                    Store.currentSheetIndex,
                    { row: rowseleted, column: columnseleted },
                    Store.currentSheetIndex,
                );
                formulaDialogs.ifFormulaMultiRange.find("input").val(range);
            } else {
                _this.rangeSetValue({
                    row: rowseleted,
                    column: columnseleted,
                });
            }

            luckysheetFreezen.scrollFreezen(rowseleted, columnseleted);
        },

        rangedrag_column_start: false,

        rangedrag_row_start: false,

        rangedrag_column: function(event) {
            let _this = this;

            let mouse = mouseposition(event.pageX, event.pageY);
            let scroll = getScrollPosition();
            let x = mouse[0] + scroll.scrollLeft;
            let y = mouse[1] + scroll.scrollTop;

            let visibledatarow = Store.visibledatarow;
            let row_index = visibledatarow.length - 1,
                row = visibledatarow[row_index],
                row_pre = 0;

            let col_location = colLocation(x),
                col = col_location[1],
                col_pre = col_location[0],
                col_index = col_location[2];

            let left = 0,
                width = 0,
                columnseleted = [];

            if (_this.func_selectedrange.left > col_pre) {
                left = col_pre;
                width = _this.func_selectedrange.left + _this.func_selectedrange.width - col_pre;
                columnseleted = [col_index, _this.func_selectedrange.column[1]];
            } else if (_this.func_selectedrange.left == col_pre) {
                left = col_pre;
                width = _this.func_selectedrange.left + _this.func_selectedrange.width - col_pre;
                columnseleted = [col_index, _this.func_selectedrange.column[0]];
            } else {
                left = _this.func_selectedrange.left;
                width = col - _this.func_selectedrange.left - 1;
                columnseleted = [_this.func_selectedrange.column[0], col_index];
            }

            //rowseleted[0] = luckysheetFreezen.changeFreezenIndex(rowseleted[0], "h");
            //rowseleted[1] = luckysheetFreezen.changeFreezenIndex(rowseleted[1], "h");
            columnseleted[0] = luckysheetFreezen.changeFreezenIndex(columnseleted[0], "v");
            columnseleted[1] = luckysheetFreezen.changeFreezenIndex(columnseleted[1], "v");

            let changeparam = menuButton.mergeMoveMain(
                columnseleted,
                [0, row_index],
                _this.func_selectedrange,
                row_pre,
                row - row_pre - 1,
                left,
                width,
            );
            if (changeparam != null) {
                columnseleted = changeparam[0];
                // rowseleted= changeparam[1];
                // top = changeparam[2];
                // height = changeparam[3];
                left = changeparam[4];
                width = changeparam[5];
            }

            _this.func_selectedrange["column"] = columnseleted;
            _this.func_selectedrange["left_move"] = left;
            _this.func_selectedrange["width_move"] = width;

            luckysheet_count_show(left, row_pre, width, row - row_pre - 1, [0, row_index], columnseleted);

            _this.rangeSetValue({
                row: [null, null],
                column: columnseleted,
            });

            formulaRangeSelect.showAt({
                    left: left,
                    width: width,
                    top: row_pre,
                    height: row - row_pre - 1,
                });

            luckysheetFreezen.scrollFreezen([0, row_index], columnseleted);
        },

        rangedrag_row: function(event) {
            let _this = this;

            let mouse = mouseposition(event.pageX, event.pageY);
            let scroll = getScrollPosition();
            let x = mouse[0] + scroll.scrollLeft;
            let y = mouse[1] + scroll.scrollTop;

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];

            let visibledatacolumn = Store.visibledatacolumn;
            let col_index = visibledatacolumn.length - 1,
                col = visibledatacolumn[col_index],
                col_pre = 0;

            let top = 0,
                height = 0,
                rowseleted = [];

            if (_this.func_selectedrange.top > row_pre) {
                top = row_pre;
                height = _this.func_selectedrange.top + _this.func_selectedrange.height - row_pre;
                rowseleted = [row_index, _this.func_selectedrange.row[1]];
            } else if (_this.func_selectedrange.top == row_pre) {
                top = row_pre;
                height = _this.func_selectedrange.top + _this.func_selectedrange.height - row_pre;
                rowseleted = [row_index, _this.func_selectedrange.row[0]];
            } else {
                top = _this.func_selectedrange.top;
                height = row - _this.func_selectedrange.top - 1;
                rowseleted = [_this.func_selectedrange.row[0], row_index];
            }

            rowseleted[0] = luckysheetFreezen.changeFreezenIndex(rowseleted[0], "h");
            rowseleted[1] = luckysheetFreezen.changeFreezenIndex(rowseleted[1], "h");
            // columnseleted[0] = luckysheetFreezen.changeFreezenIndex(columnseleted[0], "v");
            // columnseleted[1] = luckysheetFreezen.changeFreezenIndex(columnseleted[1], "v");

            let changeparam = menuButton.mergeMoveMain(
                [0, col_index],
                rowseleted,
                _this.func_selectedrange,
                top,
                height,
                col_pre,
                col - col_pre - 1,
            );
            if (changeparam != null) {
                // columnseleted = changeparam[0];
                rowseleted = changeparam[1];
                top = changeparam[2];
                height = changeparam[3];
                // left = changeparam[4];
                // width = changeparam[5];
            }

            _this.func_selectedrange["row"] = rowseleted;
            _this.func_selectedrange["top_move"] = top;
            _this.func_selectedrange["height_move"] = height;

            luckysheet_count_show(col_pre, top, col - col_pre - 1, height, rowseleted, [0, col_index]);

            _this.rangeSetValue({
                row: rowseleted,
                column: [null, null],
            });

            formulaRangeSelect.showAt({
                    left: col_pre,
                    width: col - col_pre - 1,
                    top: top,
                    height: height,
                });

            luckysheetFreezen.scrollFreezen(rowseleted, [0, col_index]);
        },

        rangedragged: function() {},

        rangeResizeObj: null,

        rangeResize: null,

        rangeResizeIndex: null,

        rangeResizexy: null,

        rangeResizeWinH: null,

        rangeResizeWinW: null,

        rangeResizeTo: null,

        rangeResizeDraging: function(
            event,
            rangeResizeObj,
            rangeResizexy,
            rangeResizeType,
            rangeResizeWinW,
            rangeResizeWinH,
            ch_width,
            rh_height,
        ) {
            let _this = this;

            let scrollTop = scrollBarY.getScrollTop(),
                scrollLeft = scrollBarX.getScrollLeft();
            let mouse = mouseposition(event.pageX, event.pageY);
            let x = mouse[0] + scrollLeft;
            let y = mouse[1] + scrollTop;

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];
            let col_location = colLocation(x),
                col = col_location[1],
                col_pre = col_location[0],
                col_index = col_location[2];

            if (x < 0 || y < 0) {
                return false;
            }

            let topchange = row_pre - rangeResizexy[1],
                leftchange = col_pre - rangeResizexy[0];
            let top = rangeResizexy[5],
                height = rangeResizexy[3],
                left = rangeResizexy[4],
                width = rangeResizexy[2];

            if (rangeResizeType == "lt" || rangeResizeType == "lb") {
                if (rangeResizexy[0] + rangeResizexy[2] < col_pre) {
                    return;
                }

                left = col_pre;
                width = rangeResizexy[2] - leftchange;

                if (left > rangeResizexy[2] + rangeResizexy[4] - col + col_pre) {
                    left = rangeResizexy[2] + rangeResizexy[4] - col + col_pre;
                    width =
                        rangeResizexy[2] -
                        (rangeResizexy[2] +
                            rangeResizexy[4] -
                            col +
                            col_pre -
                            rangeResizexy[0]);
                } else if (left <= 0) {
                    left = 0;
                    width = rangeResizexy[2] + rangeResizexy[0];
                }
            }

            if (rangeResizeType == "rt" || rangeResizeType == "rb") {
                if (rangeResizexy[6] - rangeResizexy[2] > col) {
                    return;
                }

                width = rangeResizexy[2] + col - rangeResizexy[6];

                if (width < col - col_pre - 1) {
                    width = col - col_pre - 1;
                } else if (width >= ch_width - left) {
                    width = ch_width - left;
                }
            }

            if (rangeResizeType == "lt" || rangeResizeType == "rt") {
                if (rangeResizexy[1] + rangeResizexy[3] < row_pre) {
                    return;
                }

                top = row_pre;
                height = rangeResizexy[3] - topchange;

                if (top > rangeResizexy[3] + rangeResizexy[5] - row + row_pre) {
                    top = rangeResizexy[3] + rangeResizexy[5] - row + row_pre;
                    height =
                        rangeResizexy[3] -
                        (rangeResizexy[3] +
                            rangeResizexy[5] -
                            row +
                            row_pre -
                            rangeResizexy[1]);
                } else if (top <= 0) {
                    top = 0;
                    height = rangeResizexy[3] + rangeResizexy[1];
                }
            }

            if (rangeResizeType == "lb" || rangeResizeType == "rb") {
                if (rangeResizexy[7] - rangeResizexy[3] > row) {
                    return;
                }

                height = rangeResizexy[3] + row - rangeResizexy[7];

                if (height < row - row_pre - 1) {
                    height = row - row_pre - 1;
                } else if (height >= rh_height - top) {
                    height = rh_height - top;
                }
            }

            let rangeindex = _this.rangeResizeIndex;
            let selected = {
                top: top,
                left: left,
                height: height,
                width: width,
            };
            let range = _this.getSelectedFromRange(selected);
            let rangetxt = getRangetxt(Store.currentSheetIndex, range, _this.rangetosheet);
            let $span = _this.rangeResizeTo.find("span[rangeindex='" + rangeindex + "']").html(rangetxt);
            luckysheetRangeLast(_this.rangeResizeTo[0]);
            rangeResizeObj.css(selected).data("range", range);
        },

        getSelectedFromRange: function(obj) {
            let row_st = obj.top + 2,
                row_ed = obj.top + obj.height - 2;
            let col_st = obj.left + 2,
                col_ed = obj.left + obj.width - 2;

            let ret = {
                row: [rowLocation(row_st)[2], rowLocation(row_ed)[2]],
                column: [colLocation(col_st)[2], colLocation(col_ed)[2]],
            };

            return ret;
        },

        rangeResizeDragged: function(
            event,
            rangeResizeObj,
            rangeResizexy,
            rangeResizeType,
            rangeResizeWinW,
            rangeResizeWinH,
        ) {
            let _this = this;

            _this.rangeResize = null;
            $("#luckysheet-formula-functionrange-highlight-" + _this.rangeResizeIndex)
                .find(".luckysheet-selection-copy-hc")
                .css("opacity", 0.03);
        },

        rangeMovexy: null,

        rangeMove: false,

        rangeMoveObj: null,

        rangeMoveIndex: null,

        rangeMoveRangedata: null,

        rangeMoveDraging: function(
            event,
            luckysheet_cell_selected_move_index,
            luckysheet_select_save,
            obj,
            sheetBarHeight,
            statisticBarHeight,
        ) {
            let _this = this;

            let mouse = mouseposition(event.pageX, event.pageY);
            let scrollLeft = scrollBarX.getScrollLeft();
            let scrollTop = scrollBarY.getScrollTop();
            let x = mouse[0] + scrollLeft;
            let y = mouse[1] + scrollTop;

            let winH = $(window).height() + scrollTop - sheetBarHeight - statisticBarHeight,
                winW = $(window).width() + scrollLeft;

            let row_index_original = luckysheet_cell_selected_move_index[0],
                col_index_original = luckysheet_cell_selected_move_index[1];
            let row_s = luckysheet_select_save["row"][0] - row_index_original + rowLocation(y)[2],
                row_e = luckysheet_select_save["row"][1] - row_index_original + rowLocation(y)[2];
            let col_s = luckysheet_select_save["column"][0] - col_index_original + colLocation(x)[2],
                col_e = luckysheet_select_save["column"][1] - col_index_original + colLocation(x)[2];

            if (row_s < 0 || y < 0) {
                row_s = 0;
                row_e = luckysheet_select_save["row"][1] - luckysheet_select_save["row"][0];
            }
            if (col_s < 0 || x < 0) {
                col_s = 0;
                col_e = luckysheet_select_save["column"][1] - luckysheet_select_save["column"][0];
            }

            let visibledatarow = Store.visibledatarow;
            if (row_e >= visibledatarow[visibledatarow.length - 1] || y > winH) {
                row_s = visibledatarow.length - 1 - luckysheet_select_save["row"][1] + luckysheet_select_save["row"][0];
                row_e = visibledatarow.length - 1;
            }
            let visibledatacolumn = Store.visibledatacolumn;
            if (col_e >= visibledatacolumn[visibledatacolumn.length - 1] || x > winW) {
                col_s =
                    visibledatacolumn.length -
                    1 -
                    luckysheet_select_save["column"][1] +
                    luckysheet_select_save["column"][0];
                col_e = visibledatacolumn.length - 1;
            }

            let col_pre = col_s - 1 == -1 ? 0 : visibledatacolumn[col_s - 1],
                col = visibledatacolumn[col_e];
            let row_pre = row_s - 1 == -1 ? 0 : visibledatarow[row_s - 1],
                row = visibledatarow[row_e];
            let rangeindex = _this.rangeMoveIndex;
            let selected = {
                left: col_pre,
                width: col - col_pre - 2,
                top: row_pre,
                height: row - row_pre - 2,
                display: "block",
            };
            let range = _this.getSelectedFromRange(selected);
            let rangetxt = getRangetxt(Store.currentSheetIndex, range, _this.rangetosheet);
            let $span = _this.rangeResizeTo.find("span[rangeindex='" + rangeindex + "']").html(rangetxt);
            luckysheetRangeLast(_this.rangeResizeTo[0]);
            _this.rangeMoveRangedata = range;
            obj.css(selected);
        },

        rangeMoveDragged: function(obj) {
            let _this = this;

            _this.rangeMove = false;
            $("#luckysheet-formula-functionrange-highlight-" + _this.rangeMoveIndex)
                .data("range", _this.rangeMoveRangedata)
                .find(".luckysheet-selection-copy-hc")
                .css("opacity", 0.03);
        }
};

export default rangeSelect;
