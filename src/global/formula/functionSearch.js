import {  replaceHtml } from "../../utils/util";
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
import locale from "../../locale/locale";
import formulaDialogs from '../../ui/formulaDialogs.js';

const functionSearch = {
        searchHTML: '<div id="luckysheet-formula-search-c" class="luckysheet-formula-search-c"></div>',

        helpHTML:
            '<div id="luckysheet-formula-help-c" class="luckysheet-formula-help-c"> <div class="luckysheet-formula-help-close" title="${helpClose}"><i class="fa fa-times" aria-hidden="true"></i></div> <div class="luckysheet-formula-help-collapse" title="${helpCollapse}"><i class="fa fa-angle-up" aria-hidden="true"></i></div> <div class="luckysheet-formula-help-title"><div class="luckysheet-formula-help-title-formula"> <span class="luckysheet-arguments-help-function-name">SUM</span> <span class="luckysheet-arguments-paren">(</span> <span class="luckysheet-arguments-parameter-holder"> <span class="luckysheet-arguments-help-parameter luckysheet-arguments-help-parameter-active" dir="auto">A2:A100</span>, <span class="luckysheet-arguments-help-parameter" dir="auto">101</span> </span> <span class="luckysheet-arguments-paren">)</span> </div></div> <div class="luckysheet-formula-help-content"> <div class="luckysheet-formula-help-content-example"> <div class="luckysheet-arguments-help-section-title">${helpExample}</div> <div class="luckysheet-arguments-help-formula"> <span class="luckysheet-arguments-help-function-name">SUM</span> <span class="luckysheet-arguments-paren">(</span> <span class="luckysheet-arguments-parameter-holder"> <span class="luckysheet-arguments-help-parameter luckysheet-arguments-help-parameter-active" dir="auto">A2:A100</span>, <span class="luckysheet-arguments-help-parameter" dir="auto">101</span> </span> <span class="luckysheet-arguments-paren">)</span> </div> </div> <div class="luckysheet-formula-help-content-detail"> <div class="luckysheet-arguments-help-section"> <div class="luckysheet-arguments-help-section-title luckysheet-arguments-help-parameter-name">${helpAbstract}</div> <span class="luckysheet-arguments-help-parameter-content">${helpAbstract}</span> </div> </div> <div class="luckysheet-formula-help-content-param"> ${param} </div> </div> <div class="luckysheet-formula-help-foot"></div></div>',

        searchFunctionPosition: function($menu, $editor, x, y, isparam) {
            let winH = document.documentElement.clientHeight,
                winW = document.documentElement.clientWidth;
            let menuW = $menu.outerWidth(),
                menuH = $menu.outerHeight();

            if (isparam == null) {
                isparam = false;
            }

            let left = x;
            if (x + menuW > winW) {
                left = x - menuW + $editor.outerWidth();
            } else {
                left = x;
            }

            let top = y;
            if (y + menuH > winH) {
                top = y - menuH;
            } else {
                top = y + $editor.outerHeight();
                if (!isparam) {
                    $menu.html(
                        $menu
                            .find(".luckysheet-formula-search-item")
                            .get()
                            .reverse(),
                    );
                }
            }

            if (top < 0) {
                top = 0;
            }
            if (left < 0) {
                left = 0;
            }

            $menu
                .css({
                    top: top,
                    left: left,
                })
                .show();
        },

        searchFunctionCell: null,

        searchFunction: function($editer) {
            let _this = this;
            let functionlist = Store.functionlist;

            let $cell = _this.getrangeseleciton();
            _this.searchFunctionCell = $cell;

            if ($cell == null || $editer == null) {
                return;
            }
            let inputContent = $editer.text();
            let searchtxt = $cell.text().toUpperCase();
            let reg = /^[a-zA-Z]|[a-zA-Z_]+$/;

            if (!reg.test(searchtxt) || inputContent.substr(0, 1) != "=") {
                return;
            }

            let result = {
                    f: [],
                    s: [],
                    t: [],
                },
                result_i = 0;

            for (let i = 0; i < functionlist.length; i++) {
                let item = functionlist[i],
                    n = item.n;

                if (n == searchtxt) {
                    result.f.unshift(item);
                    result_i++;
                } else if (n.substr(0, searchtxt.length) == searchtxt) {
                    result.s.unshift(item);
                    result_i++;
                } else if (n.indexOf(searchtxt) > -1) {
                    result.t.unshift(item);
                    result_i++;
                }

                if (result_i >= 10) {
                    break;
                }
            }

            let list = result.t.concat(result.s.concat(result.f));
            if (list.length <= 0) {
                return;
            }

            let listHTML = _this.searchFunctionHTML(list);
            formulaDialogs.formulaSearchC.el
                .html(listHTML);
            formulaDialogs.formulaSearchC.show();
            formulaDialogs.formulaHelp.hide();

            let $c = $editer.parent(),
                offset = $c.offset();
            _this.searchFunctionPosition(formulaDialogs.formulaSearchC.el, $c, offset.left, offset.top);
        },

        searchFunctionEnter: function($obj) {
            let _this = this;

            let functxt = $obj.data("func");
            _this.searchFunctionCell.text(functxt).after('<span dir="auto" class="luckysheet-formula-text-color">(</span>');
            _this.setCaretPosition(_this.searchFunctionCell.next().get(0), 0, 1);
            formulaDialogs.formulaSearchC.hide();
            _this.helpFunctionExe(_this.searchFunctionCell.closest("div"), _this.searchFunctionCell.next());
        },

        searchFunctionHTML: function(list) {
            let _this = this;

            if (formulaDialogs.formulaSearchC.getLength() == 0) {
                $("body").append(_this.searchHTML);
                formulaDialogs.formulaSearchC.el
                    .on("mouseover", ".luckysheet-formula-search-item", function() {
                        formulaDialogs.formulaSearchC.el
                            .find(".luckysheet-formula-search-item")
                            .removeClass("luckysheet-formula-search-item-active");
                        $(this).addClass("luckysheet-formula-search-item-active");
                    })
                    .on("mouseout", ".luckysheet-formula-search-item", function() {})
                    .on("click", ".luckysheet-formula-search-item", function() {
                        if (_this.searchFunctionCell == null) {
                            return;
                        }
                        _this.searchFunctionEnter($(this));
                    });
            }

            let itemHTML =
                '<div data-func="${n}" class="luckysheet-formula-search-item ${class}"><div class="luckysheet-formula-search-func">${n}</div><div class="luckysheet-formula-search-detail">${a}</div></div>';
            let retHTML = "";

            for (let i = 0; i < list.length; i++) {
                let item = list[i];

                if (i == list.length - 1) {
                    retHTML += replaceHtml(itemHTML, {
                        class: "luckysheet-formula-search-item-active",
                        n: item.n,
                        a: item.a,
                    });
                } else {
                    retHTML += replaceHtml(itemHTML, {
                        class: "",
                        n: item.n,
                        a: item.a,
                    });
                }
            }

            return retHTML;
        },

        functionlistPosition: {},

        helpFunction: function($editer, funcname, paramIndex) {
            let _this = this;
            let functionlist = Store.functionlist;

            let $func = functionlist[_this.functionlistPosition[$.trim(funcname).toUpperCase()]];
            if ($func == null) {
                return;
            }

            let _locale = locale();
            let locale_formulaMore = _locale.formulaMore;

            formulaDialogs.formulaHelp.find(".luckysheet-arguments-help-function-name").html($func.n);
            formulaDialogs.formulaHelp.find(".luckysheet-arguments-help-parameter-content").html($func.d);

            let helpformula =
                '<span class="luckysheet-arguments-help-function-name">${name}</span> <span class="luckysheet-arguments-paren">(</span> <span class="luckysheet-arguments-parameter-holder"> ${param} </span> <span class="luckysheet-arguments-paren">)</span>';
            let helpformulaItem = '<span class="luckysheet-arguments-help-parameter" dir="auto">${param}</span>';
            let helpformulaArg =
                '<div class="luckysheet-arguments-help-section"><div class="luckysheet-arguments-help-section-title">${param}</div><span class="luckysheet-arguments-help-parameter-content">${content}</span></div>';

            //"n": "AVERAGE",
            //"t": "1",
            //"d": "返回数据集的算术平均值，对文本忽略不计。",
            //"a": "返回数据集的算术平均值",
            //"p": [{ "name": "数值1", "example": "A2:A100", "detail": "计算平均值时用到的第一个数值或范围。", "require": "m", "repeat": "n", "type": "rangenumber" },
            //    { "name": "数值2", "example": "B2:B100", "detail": "计算平均值时用到的其他数值或范围。", "require": "o", "repeat": "y", "type": "rangenumber" }
            //]
            let fht = "",
                ahf = "",
                fhcp = "";

            for (let i = 0; i < $func.p.length; i++) {
                let paramitem = $func.p[i];
                let name = paramitem.name,
                    nameli = paramitem.name;

                if (paramitem.repeat == "y") {
                    name += ", ...";
                    nameli +=
                        '<span class="luckysheet-arguments-help-argument-info">...-' +
                        locale_formulaMore.allowRepeatText +
                        "</span>";
                }
                if (paramitem.require == "o") {
                    name = "[" + name + "]";
                    nameli +=
                        '<span class="luckysheet-arguments-help-argument-info">-[' +
                        locale_formulaMore.allowOptionText +
                        "]</span>";
                }

                fht += '<span class="luckysheet-arguments-help-parameter" dir="auto">' + name + "</span>, ";
                ahf += '<span class="luckysheet-arguments-help-parameter" dir="auto">' + paramitem.example + "</span>, ";
                fhcp += replaceHtml(helpformulaArg, {
                    param: nameli,
                    content: paramitem.detail,
                });
            }

            fht = fht.substr(0, fht.length - 2);
            ahf = ahf.substr(0, ahf.length - 2);

            formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title .luckysheet-arguments-parameter-holder").html(fht);
            formulaDialogs.formulaHelp.find(".luckysheet-arguments-help-formula .luckysheet-arguments-parameter-holder").html(
                ahf,
            );
            formulaDialogs.formulaHelp.find(".luckysheet-formula-help-content-param").html(fhcp);

            if (paramIndex == null) {
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title-formula .luckysheet-arguments-help-function-name").css("font-weight", "bold");
            } else {
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title-formula .luckysheet-arguments-help-function-name").css("font-weight", "normal");
                let index = paramIndex >= $func.p.length ? $func.p.length - 1 : paramIndex;
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title .luckysheet-arguments-parameter-holder .luckysheet-arguments-help-parameter").removeClass("luckysheet-arguments-help-parameter-active");
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title .luckysheet-arguments-parameter-holder .luckysheet-arguments-help-parameter")
                    .eq(index)
                    .addClass("luckysheet-arguments-help-parameter-active");
                formulaDialogs.formulaHelp.find(".luckysheet-arguments-help-formula .luckysheet-arguments-parameter-holder .luckysheet-arguments-help-parameter").removeClass("luckysheet-arguments-help-parameter-active");
                formulaDialogs.formulaHelp.find(".luckysheet-arguments-help-formula .luckysheet-arguments-parameter-holder .luckysheet-arguments-help-parameter")
                    .eq(index)
                    .addClass("luckysheet-arguments-help-parameter-active");
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-content-param .luckysheet-arguments-help-section").removeClass("luckysheet-arguments-help-parameter-active");
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-content-param .luckysheet-arguments-help-section")
                    .eq(index)
                    .addClass("luckysheet-arguments-help-parameter-active");
            }

            let $c = $editer.parent(),
                offset = $c.offset();
            _this.searchFunctionPosition(formulaDialogs.formulaHelp.el, $c, offset.left, offset.top, true);
        },

        helpFunctionExe: function($editer, currSelection) {
            let _this = this;
            let functionlist = Store.functionlist;
            let _locale = locale();
            let locale_formulaMore = _locale.formulaMore;
            if (formulaDialogs.formulaHelp.getLength() == 0) {
                $("body").after(
                    replaceHtml(_this.helpHTML, {
                        helpClose: locale_formulaMore.helpClose,
                        helpCollapse: locale_formulaMore.helpCollapse,
                        helpExample: locale_formulaMore.helpExample,
                        helpAbstract: locale_formulaMore.helpAbstract,
                    }),
                );
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-close").click(function() {
                    formulaDialogs.formulaHelp.hide();
                });
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-collapse").click(function() {
                    let $content = formulaDialogs.formulaHelp.find(".luckysheet-formula-help-content");
                    $content.slideToggle(100, function() {
                        let $c = _this.rangeResizeTo.parent(),
                            offset = $c.offset();
                        _this.searchFunctionPosition(formulaDialogs.formulaHelp.el, $c, offset.left, offset.top, true);
                    });

                    if ($content.is(":hidden")) {
                        $(this).html('<i class="fa fa-angle-up" aria-hidden="true"></i>');
                    } else {
                        $(this).html('<i class="fa fa-angle-down" aria-hidden="true"></i>');
                    }
                });

                for (let i = 0; i < functionlist.length; i++) {
                    _this.functionlistPosition[functionlist[i].n] = i;
                }
            }

            if (!currSelection) {
                return;
            }

            let $prev = currSelection,
                funcLen = $editer.length,
                $span = $editer.find("span"),
                currentIndex = currSelection.index(),
                i = currentIndex;

            if ($prev == null) {
                return;
            }

            let funcName = null,
                paramindex = null;

            if ($span.eq(i).is(".luckysheet-formula-text-func")) {
                funcName = $span.eq(i).text();
            } else {
                let $cur = null,
                    exceptIndex = [-1, -1];

                while (--i > 0) {
                    $cur = $span.eq(i);

                    if (
                        $cur.is(".luckysheet-formula-text-func") ||
                        $.trim($cur.text()).toUpperCase() in _this.functionlistPosition
                    ) {
                        funcName = $cur.text();
                        paramindex = null;
                        let endstate = true;

                        for (let a = i; a <= currentIndex; a++) {
                            if (!paramindex) {
                                paramindex = 0;
                            }

                            if (a >= exceptIndex[0] && a <= exceptIndex[1]) {
                                continue;
                            }

                            $cur = $span.eq(a);
                            if ($cur.is(".luckysheet-formula-text-rpar")) {
                                exceptIndex = [i, a];
                                funcName = null;
                                endstate = false;
                                break;
                            }

                            if ($cur.is(".luckysheet-formula-text-comma")) {
                                paramindex++;
                            }
                        }

                        if (endstate) {
                            break;
                        }
                    }
                }
            }

            if (funcName == null) {
                return;
            }

            _this.helpFunction($editer, funcName, paramindex);
        },

        rangeHightlightselected: function($editer, kcode) {
            let _this = this;

            let currSelection = _this.getrangeseleciton();
            formulaDialogs.formulaSearchC.hide();
            formulaDialogs.formulaHelp.hide();
            $(
                "#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight .luckysheet-selection-copy-hc",
            ).css("opacity", "0.03");
            formulaDialogs.formulaSearchC.hide();
            formulaDialogs.formulaHelp.hide();
            _this.helpFunctionExe($editer, currSelection);

            // console.log(currSelection, $(currSelection).closest(".luckysheet-formula-functionrange-cell").length);
            if ($(currSelection).closest(".luckysheet-formula-functionrange-cell").length == 0) {
                _this.searchFunction($editer);
                return;
            }

            let $anchorOffset = $(currSelection).closest(".luckysheet-formula-functionrange-cell");
            let rangeindex = $anchorOffset.attr("rangeindex");
            let rangeid = "luckysheet-formula-functionrange-highlight-" + rangeindex;

            $("#" + rangeid)
                .find(".luckysheet-selection-copy-hc")
                .css({
                    opacity: "0.13",
                });
        }
};

export default functionSearch;
