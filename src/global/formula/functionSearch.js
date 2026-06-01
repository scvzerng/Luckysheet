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
            let menuW = $menu.offsetWidth,
                menuH = $menu.offsetHeight;

            if (isparam == null) {
                isparam = false;
            }

            let left = x;
            if (x + menuW > winW) {
                left = x - menuW + $editor.offsetWidth;
            } else {
                left = x;
            }

            let top = y;
            if (y + menuH > winH) {
                top = y - menuH;
            } else {
                top = y + $editor.offsetHeight;
                if (!isparam) {
                    $menu.innerHTML = Array.from($menu.querySelectorAll(".luckysheet-formula-search-item")).reverse().map(el => el.outerHTML).join('');
                }
            }

            if (top < 0) {
                top = 0;
            }
            if (left < 0) {
                left = 0;
            }

            Object.assign($menu.style, {
                    top: top + "px",
                    left: left + "px",
                });
            $menu.style.display = 'block';
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
            let inputContent = $editer.textContent;
            let searchtxt = $cell.textContent.toUpperCase();
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
                .innerHTML = listHTML;
            formulaDialogs.formulaSearchC.show();
            formulaDialogs.formulaHelp.hide();

            let $c = $editer.parentElement,
                offset = (function() { var r = $c.getBoundingClientRect(); return {top: r.top + window.pageYOffset, left: r.left + window.pageXOffset}; })();
            _this.searchFunctionPosition(formulaDialogs.formulaSearchC.el, $c, offset.left, offset.top);
        },

        searchFunctionEnter: function($obj) {
            let _this = this;

            let functxt = $obj.dataset.func;
            _this.searchFunctionCell.textContent = functxt + '(';
            _this.setCaretPosition(_this.searchFunctionCell.nextElementSibling, 0, 1);
            formulaDialogs.formulaSearchC.hide();
            _this.helpFunctionExe(_this.searchFunctionCell.closest("div"), _this.searchFunctionCell.nextElementSibling);
        },

        searchFunctionHTML: function(list) {
            let _this = this;

            if (formulaDialogs.formulaSearchC.getLength() == 0) {
                document.body.insertAdjacentHTML('beforeend', _this.searchHTML);
                formulaDialogs.formulaSearchC.el
                ?.addEventListener("mouseover", function(e) {
                        let item = e.target?.closest?.(".luckysheet-formula-search-item");
                        if (!item) return;
                        formulaDialogs.formulaSearchC.el
                            .querySelector(".luckysheet-formula-search-item-active")
                            ?.classList.remove("luckysheet-formula-search-item-active");
                        item.classList.add("luckysheet-formula-search-item-active");
                    });
                formulaDialogs.formulaSearchC.el
                    ?.addEventListener("mouseout", function(e) {
                        let item = e.target?.closest?.(".luckysheet-formula-search-item");
                        if (!item) return;
                    });
                formulaDialogs.formulaSearchC.el
                    ?.addEventListener("click", function(e) {
                        let item = e.target?.closest?.(".luckysheet-formula-search-item");
                        if (!item) return;
                        if (_this.searchFunctionCell == null) {
                            return;
                        }
                        _this.searchFunctionEnter(item);
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

            let $func = functionlist[_this.functionlistPosition[(funcname || '').trim().toUpperCase()]];
            if ($func == null) {
                return;
            }

            let _locale = locale();
            let locale_formulaMore = _locale.formulaMore;

            const _elFnName = formulaDialogs.formulaHelp.find(".luckysheet-arguments-help-function-name"); if (_elFnName) _elFnName.innerHTML = $func.n;
            const _elParamContent = formulaDialogs.formulaHelp.find(".luckysheet-arguments-help-parameter-content"); if (_elParamContent) _elParamContent.innerHTML = $func.d;

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

            const _el1 = formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title .luckysheet-arguments-parameter-holder"); if (_el1) _el1.innerHTML = fht;
            const _el2 = formulaDialogs.formulaHelp.find(".luckysheet-formula-help-formula .luckysheet-arguments-parameter-holder"); if (_el2) _el2.innerHTML = ahf;
            const _el3 = formulaDialogs.formulaHelp.find(".luckysheet-formula-help-content-param"); if (_el3) _el3.innerHTML = fhcp;

            if (paramIndex == null) {
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title-formula .luckysheet-arguments-help-function-name")?.style.setProperty("font-weight", "bold");
            } else {
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title-formula .luckysheet-arguments-help-function-name")?.style.setProperty("font-weight", "normal");
                let index = paramIndex >= $func.p.length ? $func.p.length - 1 : paramIndex;
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title .luckysheet-arguments-parameter-holder .luckysheet-arguments-help-parameter")?.classList.remove("luckysheet-arguments-help-parameter-active");
                const _titleParam = formulaDialogs.formulaHelp.find(".luckysheet-formula-help-title .luckysheet-arguments-parameter-holder .luckysheet-arguments-help-parameter");
                if (_titleParam && _titleParam[index]) _titleParam[index].classList.add("luckysheet-arguments-help-parameter-active");
                formulaDialogs.formulaHelp.find(".luckysheet-arguments-help-formula .luckysheet-arguments-parameter-holder .luckysheet-arguments-help-parameter")?.classList.remove("luckysheet-arguments-help-parameter-active");
                const _formulaParam = formulaDialogs.formulaHelp.find(".luckysheet-arguments-help-formula .luckysheet-arguments-parameter-holder .luckysheet-arguments-help-parameter");
                if (_formulaParam && _formulaParam[index]) _formulaParam[index].classList.add("luckysheet-arguments-help-parameter-active");
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-content-param .luckysheet-arguments-help-section")?.classList.remove("luckysheet-arguments-help-parameter-active");
                const _contentParam = formulaDialogs.formulaHelp.find(".luckysheet-formula-help-content-param .luckysheet-arguments-help-section");
                if (_contentParam && _contentParam[index]) _contentParam[index].classList.add("luckysheet-arguments-help-parameter-active");
            }

            let $c = $editer.parentElement,
                offset = (function() { var r = $c.getBoundingClientRect(); return {top: r.top + window.pageYOffset, left: r.left + window.pageXOffset}; })();
            _this.searchFunctionPosition(formulaDialogs.formulaHelp.el, $c, offset.left, offset.top, true);
        },

        helpFunctionExe: function($editer, currSelection) {
            let _this = this;
            let functionlist = Store.functionlist;
            let _locale = locale();
            let locale_formulaMore = _locale.formulaMore;
            if (formulaDialogs.formulaHelp.getLength() == 0) {
                document.body.insertAdjacentHTML('afterend',
                    replaceHtml(_this.helpHTML, {
                        helpClose: locale_formulaMore.helpClose,
                        helpCollapse: locale_formulaMore.helpCollapse,
                        helpExample: locale_formulaMore.helpExample,
                        helpAbstract: locale_formulaMore.helpAbstract,
                    }),
                );
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-close")?.addEventListener("click", function() {
                    formulaDialogs.formulaHelp.hide();
                });
                formulaDialogs.formulaHelp.find(".luckysheet-formula-help-collapse")?.addEventListener("click", function() {
                    let $content = formulaDialogs.formulaHelp.find(".luckysheet-formula-help-content");
                    if ($content.style.display === 'none') {
                        $content.style.display = 'block';
                        this.innerHTML = '<i class="fa fa-angle-up" aria-hidden="true"></i>';
                    } else {
                        $content.style.display = 'none';
                        this.innerHTML = '<i class="fa fa-angle-down" aria-hidden="true"></i>';
                    }
                    let $c = _this.rangeResizeTo.parentElement,
                        offset = (function() { var r = $c.getBoundingClientRect(); return {top: r.top + window.pageYOffset, left: r.left + window.pageXOffset}; })();
                    _this.searchFunctionPosition(formulaDialogs.formulaHelp.el, $c, offset.left, offset.top, true);
                });

                for (let i = 0; i < functionlist.length; i++) {
                    _this.functionlistPosition[functionlist[i].n] = i;
                }
            }

            if (!currSelection) {
                return;
            }

            let $prev = currSelection,
                $span = $editer.querySelectorAll("span"),
                currentIndex = Array.from(currSelection.parentElement.children).indexOf(currSelection),
                i = currentIndex;

            if ($prev == null) {
                return;
            }

            let funcName = null,
                paramindex = null;

            if ($span[i] && $span[i].matches(".luckysheet-formula-text-func")) {
                funcName = $span[i].textContent;
            } else {
                let $cur = null,
                    exceptIndex = [-1, -1];

                while (--i > 0) {
                    $cur = $span[i];
                    if (!$cur) continue;

                    if (
                        $cur.matches(".luckysheet-formula-text-func") ||
                        $cur.textContent.trim().toUpperCase() in _this.functionlistPosition
                    ) {
                        funcName = $cur.textContent;
                        paramindex = null;
                        let endstate = true;

                        for (let a = i; a <= currentIndex; a++) {
                            if (!paramindex) {
                                paramindex = 0;
                            }

                            if (a >= exceptIndex[0] && a <= exceptIndex[1]) {
                                continue;
                            }

                            $cur = $span[a];
                            if ($cur && $cur.matches(".luckysheet-formula-text-rpar")) {
                                exceptIndex = [i, a];
                                funcName = null;
                                endstate = false;
                                break;
                            }

                            if ($cur.matches(".luckysheet-formula-text-comma")) {
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
            document.querySelector(
                "#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight .luckysheet-selection-copy-hc",
            )?.style.setProperty("opacity", "0.03");
            formulaDialogs.formulaSearchC.hide();
            formulaDialogs.formulaHelp.hide();
            _this.helpFunctionExe($editer, currSelection);

            // console.log(currSelection, currSelection.closest(".luckysheet-formula-functionrange-cell").length);
            if (!currSelection || currSelection?.closest?.(".luckysheet-formula-functionrange-cell") === null) {
                _this.searchFunction($editer);
                return;
            }

            let $anchorOffset = currSelection?.closest?.(".luckysheet-formula-functionrange-cell");
            if (!$anchorOffset) return;
            let rangeindex = $anchorOffset.getAttribute("rangeindex");
            let rangeid = "luckysheet-formula-functionrange-highlight-" + rangeindex;

            const _rangeEl = document.getElementById(rangeid);
            const _hcEl = _rangeEl?.querySelector(".luckysheet-selection-copy-hc"); if (_hcEl) Object.assign(_hcEl.style, {
                    opacity: "0.13",
                });
        }
};

export default functionSearch;
