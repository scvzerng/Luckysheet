import formula from '../global/formula';
import editor from '../global/editor';
import {luckysheetupdateCell} from './updateCell';
import { modelHTML } from './constant';
import { replaceHtml } from '../utils/util';
import { showModalMask, hideModalMask, isModalMaskVisible } from '../utils/domUtils.js';
import Store from '../store';
import { getLastSelection, getFocusCell } from '../utils/storeAccess.js';
import locale from '../locale/locale';
import formulaDialogs from '../ui/formulaDialogs.js';
import richTextEditor from '../ui/richTextEditor.js';
import functionBox from '../ui/functionBox.js';
import countShow from '../ui/countShow.js';
import formulaRangeSelect from '../ui/formulaRangeSelect.js';

const ifFormulaGenerator = {
    singleRangeFocus: false,
    init: function(){
        let _this = this;
        const _locale = locale();
        const locale_formula = _locale.formula;
        const locale_button = _locale.button;

        formulaDialogs.ifFormulaDialog.el.addEventListener("focus", function(e){
            if(e.target.matches && e.target.matches("#compareValue")){
                hideModalMask();
                _this.singleRangeFocus = true;
            }
        }, true);

        formulaDialogs.ifFormulaDialog.el.addEventListener("click", function(e){
            if(e.target?.closest?.(".singRange")){
                let _elCompareValue = formulaDialogs.ifFormulaDialog.el?.querySelector("#compareValue");
                let value = _elCompareValue ? _elCompareValue.value.trim() : "";

                if(formula.iscelldata(value)){
                    _this.singleRangeDialog(value);
                }
                else{
                    _this.singleRangeDialog();
                }
            }
        });

        formulaDialogs.ifFormulaSingleRange.el.addEventListener("click", function(e){
            if(e.target.matches && e.target.matches("#luckysheet-ifFormulaGenerator-singleRange-confirm")){
                formulaRangeSelect.hide();

                formulaDialogs.ifFormulaSingleRange.hide();
                showModalMask();
                formulaDialogs.ifFormulaDialog.show();

                let _elInput = formulaDialogs.ifFormulaSingleRange.el?.querySelector("input");
                let value = _elInput ? _elInput.value.trim() : "";
                let _elCompareValue2 = formulaDialogs.ifFormulaDialog.el?.querySelector("#compareValue");
                if (_elCompareValue2) _elCompareValue2.value = value;

                _this.singleRangeFocus = false;
            }
        });

        formulaDialogs.ifFormulaSingleRange.el.addEventListener("click", function(e){
            if(e.target.matches && e.target.matches("#luckysheet-ifFormulaGenerator-singleRange-cancel")){
                formulaRangeSelect.hide();

                formulaDialogs.ifFormulaSingleRange.hide();
                showModalMask();
                formulaDialogs.ifFormulaDialog.show();

                _this.singleRangeFocus = false;
            }
        });

        formulaDialogs.ifFormulaSingleRange.el.addEventListener("click", function(e){
            if(e.target?.closest?.(".luckysheet-modal-dialog-title-close")){
                formulaRangeSelect.hide();

                showModalMask();
                formulaDialogs.ifFormulaDialog.show();

                _this.singleRangeFocus = false;
            }
        });

        formulaDialogs.ifFormulaDialog.el.addEventListener("click", function(e){
            if(e.target?.closest?.(".multiRange")){
                _this.multiRangeDialog();

                _this.singleRangeFocus = false;
            }
        });

        formulaDialogs.ifFormulaMultiRange.el.addEventListener("click", function(e){
            if(e.target.matches && e.target.matches("#luckysheet-ifFormulaGenerator-multiRange-confirm")){
                formulaRangeSelect.hide();
                countShow.row.hide();
                countShow.column.hide();

                formulaDialogs.ifFormulaMultiRange.hide();
                showModalMask();
                formulaDialogs.ifFormulaDialog.show();

                let _elInput2 = formulaDialogs.ifFormulaMultiRange.el?.querySelector("input");
                let value = _elInput2 ? _elInput2.value.trim() : "";
                let cellrange = formula.getcellrange(value);
                let str_r = cellrange["row"][0],
                    end_r = cellrange["row"][1],
                    str_c = cellrange["column"][0],
                    end_c = cellrange["column"][1];
                let d = editor.deepCopyFlowData(Store.flowdata);
                let arr = [];

                for(let r = str_r; r <= end_r; r++){
                    for(let c = str_c; c <= end_c; c++){
                        if(d[r] != null && d[r][c] != null && d[r][c]["ct"] != null && d[r][c]["ct"]["t"] == "n"){
                            arr.push(d[r][c]["v"]);
                        }
                    }
                }

                for(let j = 0; j < arr.length; j++){
                    for(let k = 0; k < arr.length - 1 - j; k++){
                        if(arr[k] < arr[k + 1]){
                            let temp = arr[k];
                            arr[k] = arr[k + 1];
                            arr[k + 1] = temp;
                        }
                    }
                }

                let largeNum = arr[0];
                let smallNum = arr[arr.length - 1];

                let _elSmallRange = formulaDialogs.ifFormulaDialog.el?.querySelector("#smallRange");
                if (_elSmallRange) _elSmallRange.value = smallNum;
                let _elLargeRange = formulaDialogs.ifFormulaDialog.el?.querySelector("#largeRange");
                if (_elLargeRange) _elLargeRange.value = largeNum;
            }
        });

        formulaDialogs.ifFormulaMultiRange.el.addEventListener("click", function(e){
            if(e.target.matches && e.target.matches("#luckysheet-ifFormulaGenerator-multiRange-cancel")){
                formulaRangeSelect.hide();
                countShow.row.hide();
                countShow.column.hide();

                formulaDialogs.ifFormulaMultiRange.hide();
                showModalMask();
                formulaDialogs.ifFormulaDialog.show();
            }
        });

        formulaDialogs.ifFormulaMultiRange.el.addEventListener("click", function(e){
            if(e.target?.closest?.(".luckysheet-modal-dialog-title-close")){
                countShow.row.hide();
                countShow.column.hide();

                showModalMask();
                formulaDialogs.ifFormulaDialog.show();
            }
        });

        formulaDialogs.ifFormulaDialog.el.addEventListener("change", function(e){
            if(e.target.matches && e.target.matches("#DivisionMethod")){
                let _elSelected = e.target.querySelector("option:checked");
                let value = _elSelected ? _elSelected.value : "";

                if(value == "2"){
                    let _elMethodVal = formulaDialogs.ifFormulaDialog.el?.querySelector("#DivisionMethodVal");
                    if (_elMethodVal) _elMethodVal.style.display = 'none';
                }
                else{
                    let _elMethodVal2 = formulaDialogs.ifFormulaDialog.el?.querySelector("#DivisionMethodVal");
                    if (_elMethodVal2) _elMethodVal2.style.display = 'block';
                }

                let _elIfList = formulaDialogs.ifFormulaDialog.el?.querySelector(".ifList");
                if (_elIfList) _elIfList.innerHTML = '';
            }
        });

        formulaDialogs.ifFormulaDialog.el.addEventListener("click", function(e){
            if(e.target.matches && e.target.matches("#createBtn")){
                let _elCompareValue3 = formulaDialogs.ifFormulaDialog.el?.querySelector("#compareValue");
                let compareValue = _elCompareValue3 ? _elCompareValue3.value.trim() : "";
                if(compareValue == ""){
                    _this.info(locale_formula.ifGenTipNotNullValue);
                    return;
                }

                let _elMethodSelected = formulaDialogs.ifFormulaDialog.el?.querySelector("#DivisionMethod option:checked");
                let method = _elMethodSelected ? _elMethodSelected.value : "";
                if(method == "2"){
                    let itemHtml =  '<div class="item">'+
                                        '<input type="number" class="smallNum formulaInputFocus"/>'+
                                        '<select class="operator">'+
                                            '<option value="0"> <= </option>'+
                                            '<option value="1"> < </option>'+
                                        '</select>'+
                                        '<span class="compareValue">'+ compareValue +'</span>'+
                                        '<select class="operator2">'+
                                            '<option value="0"> <= </option>'+
                                            '<option value="1" selected="selected"> < </option>'+
                                        '</select>'+
                                        '<input type="number" class="largeNum formulaInputFocus"/>'+
                                        '<span>'+locale_formula.ifGenTipLableTitile+'：</span>'+
                                        '<input type="text" class="markText formulaInputFocus" value="">'+
                                        '<i class="fa fa-remove" aria-hidden="true"></i>'+
                                    '</div>';
                    let _elIfList2 = formulaDialogs.ifFormulaDialog.el?.querySelector(".ifList");
                    if (_elIfList2) _elIfList2.insertAdjacentHTML('beforeend', itemHtml);
                }
                else{
                    let _elSmallRange2 = formulaDialogs.ifFormulaDialog.el?.querySelector("#smallRange");
                    let smallRange = _elSmallRange2 ? _elSmallRange2.value.trim() : "";
                    let _elLargeRange2 = formulaDialogs.ifFormulaDialog.el?.querySelector("#largeRange");
                    let largeRange = _elLargeRange2 ? _elLargeRange2.value.trim() : "";
                    let _elMethodVal3 = formulaDialogs.ifFormulaDialog.el?.querySelector("#DivisionMethodVal");
                    let DivisionMethodVal = _elMethodVal3 ? _elMethodVal3.value.trim() : "";

                    if(smallRange == "" || largeRange == ""){
                        _this.info(locale_formula.ifGenTipRangeNotforNull);
                        return;
                    }
                    else if(DivisionMethodVal == ""){
                        _this.info(locale_formula.ifGenTipCutValueNotforNull);
                        return;
                    }

                    _this.getIfList(compareValue, smallRange, largeRange, method, DivisionMethodVal);
                }
            }
        });

        formulaDialogs.ifFormulaDialog.el.addEventListener("click", function(e){
            if(e.target?.closest?.(".item .fa-remove")){
                let _elItem = e.target?.closest?.(".item");
                if (_elItem) _elItem.remove();
            }
        });

        formulaDialogs.ifFormulaDialog.el.addEventListener("click", function(e){
            if(e.target?.closest?.("#luckysheet-ifFormulaGenerator-dialog-confirm")){
                let items = formulaDialogs.ifFormulaDialog.el?.querySelectorAll(".ifList .item");
                let str = '';

                Array.from(items).reverse().forEach(function(e, i){
                    let _elSmallNum = e.querySelector(".smallNum");
                    let smallNum = _elSmallNum ? _elSmallNum.value.trim() : "";
                    let _elLargeNum = e.querySelector(".largeNum");
                    let largeNum = _elLargeNum ? _elLargeNum.value.trim() : "";
                    let _elOperator = e.querySelector(".operator option:checked");
                    let operator = _elOperator ? _elOperator.value : "";
                    let _elOperator2 = e.querySelector(".operator2 option:checked");
                    let operator2 = _elOperator2 ? _elOperator2.value : "";
                    let _elCompareValue = e.querySelector(".compareValue");
                    let compareValue = _elCompareValue ? _elCompareValue.textContent : "";

                    let _elMarkText = e.querySelector(".markText");
                    let markText = _elMarkText ? _elMarkText.value.trim() : "";
                    if(markText == ""){
                        markText = locale_formula.ifGenTipLableTitile + (i + 1);
                    }

                    if(smallNum == "" && largeNum == ""){
                        return;
                    }

                    let s;
                    if(operator == "0"){
                        s = compareValue + ">=" + smallNum;
                    }
                    else{
                        s = compareValue + ">" + smallNum;
                    }

                    let l;
                    if(operator2 == "0"){
                        l = compareValue + "<=" + largeNum;
                    }
                    else{
                        l = compareValue + "<" + largeNum;
                    }

                    let a;
                    if(i == 0 && largeNum == ""){
                        a = s;
                    }
                    else if(i == (items.length - 1) && smallNum == ""){
                        a = l;
                    }
                    else{
                        a = "and("+s+","+l+")";
                    }

                    if(i == 0){
                        str = 'if('+ a +',"'+ markText +'")';
                    }
                    else{
                        str = 'if('+ a +',"'+ markText +'",'+ str +')';
                    }
                });

                if(str.length == 0){
                    _this.info(locale_formula.ifGenTipNotGenCondition);
                    return;
                }

                hideModalMask();
                formulaDialogs.ifFormulaDialog.hide();

                let last = getLastSelection();
                let _focus = getFocusCell();
                let row_index = _focus.row,
                    col_index = _focus.col;

                luckysheetupdateCell(row_index, col_index, Store.flowdata);

                richTextEditor.setHtml("=" + str);
                functionBox.setHtml(richTextEditor.getHtml());

                functionBox.confirmClick();
            }
        });

        formulaDialogs.ifFormulaInfo.el.addEventListener("click", function(e){
            if(e.target?.closest?.(".luckysheet-model-close-btn")){
                showModalMask();
            }
        });
        formulaDialogs.ifFormulaInfo.el.addEventListener("click", function(e){
            if(e.target?.closest?.(".luckysheet-modal-dialog-title-close")){
                showModalMask();
            }
        });
    },
    ifFormulaDialog: function(fp){
        let _this = this;

        const _locale = locale();
        const locale_formula = _locale.formula;
        const locale_button = _locale.button;

        showModalMask();
        formulaDialogs.ifFormulaDialog.remove();

        let compareValue = "";
        let ifListHtml = '';

        if(fp){
            let arr = fp.split("if(");

            for(let i = 1; i < arr.length; i++){
                let txt = arr[i].replace("and(","").replace(/\)/g,"").replace(/\"/g,"");
                let arr2 = txt.split(",");
                arr2 = _this.clearArr(arr2);

                compareValue = _this.splitTxt(arr2[0])[0];

                let smallNum, largeNum, markText;
                if(arr2.length == 3){
                    smallNum = _this.splitTxt(arr2[0])[1];
                    largeNum = _this.splitTxt(arr2[1])[2];
                    markText = arr2[2];
                }
                else{
                    smallNum = _this.splitTxt(arr2[0])[1];
                    largeNum = _this.splitTxt(arr2[0])[2];
                    markText = arr2[1];
                }

                let itemHtml =  '<div class="item">'+
                                    '<input type="number" class="smallNum formulaInputFocus" value="'+ smallNum +'"/>'+
                                    '<select class="operator">'+
                                        '<option value="0"> <= </option>'+
                                        '<option value="1"> < </option>'+
                                    '</select>'+
                                    '<span class="compareValue">'+ compareValue +'</span>'+
                                    '<select class="operator2">'+
                                        '<option value="0"> <= </option>'+
                                        '<option value="1" selected="selected"> < </option>'+
                                    '</select>'+
                                    '<input type="number" class="largeNum formulaInputFocus" value="'+ largeNum +'"/>'+
                                    '<span>'+locale_formula.ifGenTipLableTitile+'：</span>'+
                                    '<input type="text" class="markText formulaInputFocus" value="'+ markText +'">'+
                                    '<i class="fa fa-remove" aria-hidden="true"></i>'+
                                '</div>';
                ifListHtml += itemHtml;
            }
        }

        let content = '<div class="ifAttr">'+
                        '<div class="attrBox">'+
                            '<label for="compareValue"> '+ locale_formula.ifGenCompareValueTitle +' </label>'+
                            '<div class="inpBox">'+
                                '<input id="compareValue" class="formulaInputFocus" value="'+ compareValue +'"/>'+
                                '<i class="singRange fa fa-table" aria-hidden="true" title="'+ locale_formula.ifGenSelectCellTitle +'"></i>'+
                            '</div>'+
                        '</div>'+
                        '<div class="attrBox">'+
                            '<label for="smallRange"> '+ locale_formula.ifGenRangeTitle +' </label>'+
                            '<input type="number" id="smallRange" class="formulaInputFocus"/>'+
                            '<span class="text"> '+ locale_formula.ifGenRangeTo +' </span>'+
                            '<input type="number" id="largeRange" class="formulaInputFocus"/>'+
                            '<div id="rangeAssess">'+
                                '<span> '+ locale_formula.ifGenRangeEvaluate +' </span>'+
                                '<i class="multiRange fa fa-table" aria-hidden="true" title="'+ locale_formula.ifGenSelectRangeTitle +'"></i>'+
                            '</div>'+
                        '</div>'+
                        '<div class="attrBox">'+
                            '<label for="DivisionMethod"> '+ locale_formula.ifGenCutWay +' </label>'+
                            '<select id="DivisionMethod">'+
                                '<option value="0"> '+ locale_formula.ifGenCutSame +' </option>'+
                                '<option value="1"> '+ locale_formula.ifGenCutNpiece +' </option>'+
                                '<option value="2"> '+ locale_formula.ifGenCutCustom +' </option>'+
                            '</select>'+
                            '<input id="DivisionMethodVal" class="formulaInputFocus"/>'+
                            '<div id="createBtn"> '+ locale_formula.ifGenCutSame +' </div>'+
                        '</div>'+
                      '</div>'+
                      '<div class="ifList">'+ifListHtml+'</div>';

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
            "id": "luckysheet-ifFormulaGenerator-dialog",
            "addclass": "luckysheet-ifFormulaGenerator-dialog",
            "title": locale_formula.ifGenerate,
            "content": content,
            "botton": '<button id="luckysheet-ifFormulaGenerator-dialog-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button class="btn btn-default luckysheet-model-close-btn">'+locale_button.cancel+'</button>',
            "style": "z-index:100003"
        }));
        formulaDialogs.ifFormulaDialog.setContentCss({"min-width": 590});
        let _elDialog = formulaDialogs.ifFormulaDialog.el;
        let myh = _elDialog.offsetHeight,
            myw = _elDialog.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        formulaDialogs.ifFormulaDialog.showAt({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 });
    },
    clearArr: function(arr){
        for(let i = 0; i < arr.length; i++){
            if(arr[i] == "" || arr[i] == null || arr[i] == undefined){
                arr.splice(i, 1);
            }
        }

        return arr;
    },
    splitTxt: function(txt){
        let compareValue, smallNum, largeNum;

        if(txt.indexOf(">=") != -1){
            compareValue = txt.split(">=")[0];
            smallNum = txt.split(">=")[1];

            return [compareValue, smallNum, largeNum];
        }
        else if(txt.indexOf(">") != -1){
            compareValue = txt.split(">")[0];
            smallNum = txt.split(">")[1];

            return [compareValue, smallNum, largeNum];
        }
        else if(txt.indexOf("<=") != -1){
            compareValue = txt.split("<=")[0];
            largeNum = txt.split("<=")[1];

            return [compareValue, smallNum, largeNum];
        }
        else if(txt.indexOf("<") != -1){
            compareValue = txt.split("<")[0];
            largeNum = txt.split("<")[1];

            return [compareValue, smallNum, largeNum];
        }
    },
    singleRangeDialog: function(value){
        hideModalMask();
        formulaDialogs.ifFormulaDialog.hide();
        formulaDialogs.ifFormulaSingleRange.remove();

        const _locale = locale();
        const locale_formula = _locale.formula;
        const locale_button = _locale.button;

        if(value == null){
            value = "";
        }

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
            "id": "luckysheet-ifFormulaGenerator-singleRange-dialog",
            "addclass": "luckysheet-ifFormulaGenerator-singleRange-dialog",
            "title": locale_formula.ifGenTipSelectCell,
            "content": '<input readonly="readonly" placeholder="'+locale_formula.ifGenTipSelectCellPlace+'" value="'+ value +'">',
            "botton": '<button id="luckysheet-ifFormulaGenerator-singleRange-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button id="luckysheet-ifFormulaGenerator-singleRange-cancel" class="btn btn-default">'+locale_button.cancel+'</button>',
            "style": "z-index:100003"
        }));
        formulaDialogs.ifFormulaSingleRange.setContentCss({"min-width": 400});
        let _elSingleRange = formulaDialogs.ifFormulaSingleRange.el;
        let myh = _elSingleRange.offsetHeight,
            myw = _elSingleRange.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        formulaDialogs.ifFormulaSingleRange.showAt({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 });
    },
    multiRangeDialog: function(){
        hideModalMask();
        formulaDialogs.ifFormulaDialog.hide();
        formulaDialogs.ifFormulaMultiRange.remove();

        const _locale = locale();
        const locale_formula = _locale.formula;
        const locale_button = _locale.button;

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
            "id": "luckysheet-ifFormulaGenerator-multiRange-dialog",
            "addclass": "luckysheet-ifFormulaGenerator-multiRange-dialog",
            "title": locale_formula.ifGenTipSelectRange,
            "content": '<input readonly="readonly" placeholder="'+locale_formula.ifGenTipSelectRangePlace+'" value="">',
            "botton": '<button id="luckysheet-ifFormulaGenerator-multiRange-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button id="luckysheet-ifFormulaGenerator-multiRange-cancel" class="btn btn-default">'+locale_button.cancel+'</button>',
            "style": "z-index:100003"
        }));
        formulaDialogs.ifFormulaMultiRange.setContentCss({"min-width": 400});
        let _elMultiRange = formulaDialogs.ifFormulaMultiRange.el;
        let myh = _elMultiRange.offsetHeight,
            myw = _elMultiRange.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        formulaDialogs.ifFormulaMultiRange.showAt({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 });
    },
    getIfList: function(compareValue, smallRange, largeRange, method, methodVal){
        const locale_formula = locale().formula;

        let _elIfList3 = formulaDialogs.ifFormulaDialog.el?.querySelector(".ifList");
        if (_elIfList3) _elIfList3.innerHTML = '';

        smallRange = parseInt(smallRange);
        largeRange = parseInt(largeRange);
        methodVal = parseInt(methodVal);

        let arr = [];

        if(method == "0"){
            let len = Math.ceil((largeRange - smallRange) / methodVal);
            for(let i = 0; i <= len; i++){
                let num = smallRange + methodVal * i;
                if(i == 0 || num >= largeRange){
                    arr.push("");
                }
                else{
                    arr.push(num);
                }
            }

        }
        else if(method == "1"){
            let addnum = Math.ceil((largeRange - smallRange) / methodVal);
            for(let i = 0; i <= methodVal; i++){
                let num = smallRange + addnum * i;
                if(i == 0 || num >= largeRange){
                    arr.push("");
                }
                else{
                    arr.push(num);
                }
            }
        }
        for(let j = 0; j < arr.length - 1; j++){
            let markText;
            if(j == 0){
                markText = "小于" + arr[j + 1];
            }
            else if(j == arr.length - 2){
                markText = "大于等于" + arr[j];
            }
            else{
                markText = arr[j] + "到" + arr[j + 1];
            }

            let itemHtml =  '<div class="item">'+
                                '<input type="number" class="smallNum formulaInputFocus" value="'+ arr[j] +'"/>'+
                                '<select class="operator">'+
                                    '<option value="0"> <= </option>'+
                                    '<option value="1"> < </option>'+
                                '</select>'+
                                '<span class="compareValue">'+ compareValue +'</span>'+
                                '<select class="operator2">'+
                                    '<option value="0"> <= </option>'+
                                    '<option value="1" selected="selected"> < </option>'+
                                '</select>'+
                                '<input type="number" class="largeNum formulaInputFocus" value="'+ arr[j + 1] +'"/>'+
                                '<span>'+locale_formula.ifGenTipLableTitile+'：</span>'+
                                '<input type="text" class="markText formulaInputFocus" value="'+ markText +'">'+
                                '<i class="fa fa-remove" aria-hidden="true"></i>'+
                            '</div>';
            let _elIfList4 = formulaDialogs.ifFormulaDialog.el?.querySelector(".ifList");
            if (_elIfList4) _elIfList4.insertAdjacentHTML('beforeend', itemHtml);
        }
    },
    info: function(title){
        showModalMask();
        formulaDialogs.ifFormulaInfo.remove();

        const _locale = locale();
        const locale_button = _locale.button;

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, {
            "id": "luckysheet-ifFormulaGenerator-info",
            "addclass": "",
            "title": title,
            "content": "",
            "botton": '<button class="btn btn-default luckysheet-model-close-btn">&nbsp;&nbsp;'+locale_button.close+'&nbsp;&nbsp;</button>',
            "style": "z-index:100003"
        }));
        formulaDialogs.ifFormulaInfo.setContentCss({"min-width": 300});
        let _elInfo = formulaDialogs.ifFormulaInfo.el;
        let myh = _elInfo.offsetHeight,
            myw = _elInfo.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        formulaDialogs.ifFormulaInfo.showAt({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 });
    }
}

export default ifFormulaGenerator;
