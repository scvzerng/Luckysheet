import { luckysheet_getcelldata } from '../function/func';
import formula from '../global/formula';
import { isRealNum, isRealNull } from '../global/validate';
import { modelHTML } from './constant';
import { luckysheet_count_show } from './select';
import { replaceHtml, getObjType } from '../utils/util';
import { showModalMask, hideModalMask } from '../utils/domUtils.js';
import Store from '../store';
import locale from '../locale/locale';
import formulaDialogs from '../ui/formulaDialogs.js';
import richTextEditor from '../ui/richTextEditor.js';
import functionBox from '../ui/functionBox.js';
import formulaRangeSelect from '../ui/formulaRangeSelect.js';
import searchFormula from '../ui/searchFormula.js';

const insertFormula = {
    init: function(){
        let _this = this;
        let _locale = locale();
        let locale_formulaMore = _locale.formulaMore;
        let locale_button = _locale.button;

        searchFormula.el.addEventListener("keyup", function(e){
            if(!e.target.matches || !e.target.matches("#searchFormulaListInput")) return;
            let _elTypeList = searchFormula.el.querySelector("#formulaTypeList");
            if (_elTypeList) _elTypeList.innerHTML = '';
            let txt = e.target.value.toUpperCase();
            let functionlist = Store.functionlist;

            if(txt == ""){
                let _elTypeSelect = searchFormula.el.querySelector("#formulaTypeSelect option:checked");
                _this.formulaListByType(_elTypeSelect ? _elTypeSelect.value : "0");
            }
            else{
                for(let i = 0; i < functionlist.length; i++){
                    if(/^[a-zA-Z]+$/.test(txt)){
                        if(functionlist[i].n.indexOf(txt) != "-1"){
                            let _elTypeList2 = searchFormula.el.querySelector("#formulaTypeList");
                            if (_elTypeList2) _elTypeList2.insertAdjacentHTML('beforeend', '<div class="listBox" name="'+ functionlist[i].n +'"><span>'+ functionlist[i].n +'</span><span>'+ functionlist[i].a +'</span></div>');
                        }
                    }
                    else if(functionlist[i].a.indexOf(txt) != "-1"){
                        let _elTypeList3 = searchFormula.el.querySelector("#formulaTypeList");
                        if (_elTypeList3) _elTypeList3.insertAdjacentHTML('beforeend', '<div class="listBox" name="'+ functionlist[i].n +'"><span>'+ functionlist[i].n +'</span><span>'+ functionlist[i].a +'</span></div>');
                    }
                }
            }
            
            let _elFirstBox = searchFormula.el.querySelector("#formulaTypeList .listBox:first-child");
            if (_elFirstBox) _elFirstBox.classList.add("on");
        });

        searchFormula.el.addEventListener("change", function(e){
            if(!e.target.matches || !e.target.matches("#formulaTypeSelect")) return;
            let _elTypeSelect2 = e.target.querySelector("option:checked");
            _this.formulaListByType(_elTypeSelect2 ? _elTypeSelect2.value : "0");
        });

        searchFormula.el.addEventListener("click", function(e){
            let listBox = e.target.closest ? e.target.closest("#formulaTypeList .listBox") : null;
            if(listBox){
                listBox.classList.add("on");
                Array.from(listBox.parentElement.children).filter(s => s !== listBox).forEach(function(el) { el.classList.remove("on"); });
            }
        });

        searchFormula.el.addEventListener("click", function(e){
            if(e.target.closest && e.target.closest("#luckysheet-search-formula-confirm")){
                let _elOnBox = searchFormula.el.querySelector(".listBox.on");
                let formulaName = _elOnBox ? _elOnBox.getAttribute("name") : "";
                let formulaTxt = '<span dir="auto" class="luckysheet-formula-text-color">=</span><span dir="auto" class="luckysheet-formula-text-color">'+ formulaName.toUpperCase() +'</span><span dir="auto" class="luckysheet-formula-text-color">(</span><span dir="auto" class="luckysheet-formula-text-color">)</span>';
                
                richTextEditor.setHtml(formulaTxt);
                functionBox.setHtml(richTextEditor.getHtml());

                _this.formulaParmDialog(formulaName);
            }
        });

        formulaDialogs.searchParm.el.addEventListener("focus", function(e){
            if(!e.target.matches || !e.target.matches(".parmBox input")) return;
            let parmBox = e.target.closest(".parmBox");
            let parmIndex = Array.from(parmBox.parentElement.children).indexOf(parmBox);
            formula.data_parm_index = parmIndex;

            let _elTitleText = formulaDialogs.searchParm.el.querySelector(".luckysheet-modal-dialog-title-text");
            let formulatxt = _elTitleText ? _elTitleText.textContent : "";
            let parmLen = Store.luckysheet_function[formulatxt].p.length;

            let parmDetail, parmRepeat;
            if(parmIndex >= parmLen){
                parmDetail = Store.luckysheet_function[formulatxt].p[parmLen - 1].detail;
                parmRepeat = Store.luckysheet_function[formulatxt].p[parmLen - 1].repeat;
            }
            else{
                parmDetail = Store.luckysheet_function[formulatxt].p[parmIndex].detail;
                parmRepeat = Store.luckysheet_function[formulatxt].p[parmIndex].repeat;
            }

            _this.parmTxtShow(e.target.value);
            _this.functionStrCompute();

            let _elDetailsBox = formulaDialogs.searchParm.el.querySelector(".parmDetailsBox");
            if (_elDetailsBox) _elDetailsBox.innerHTML = '';

            let _elName = parmBox.querySelector(".name");
            let parmName = _elName ? _elName.textContent : "";
            if (_elDetailsBox) _elDetailsBox.insertAdjacentHTML('beforeend', '<span>'+ parmName +':</span><span>'+ parmDetail +'</span>');

            if(parmRepeat == "y"){
                let _elParmBoxes = formulaDialogs.searchParm.el.querySelectorAll(".parmBox");
                let parmCount = _elParmBoxes.length;

                if(parmCount < 5 && parmIndex == (parmCount - 1)){
                    let _elParmListBox = formulaDialogs.searchParm.el.querySelector(".parmListBox");
                    if (_elParmListBox) _elParmListBox.insertAdjacentHTML('beforeend', '<div class="parmBox"><div class="name">'+ locale_formulaMore.valueTitle +''+ (parmCount + 1) +'</div><div class="txt"><input class="formulaInputFocus" /><i class="fa fa-table" aria-hidden="true" title="'+locale_formulaMore.tipSelectDataRange+'"></i></div><div class="val">=</div></div>');
                }
            }
        }, true);

        formulaDialogs.searchParm.el.addEventListener("blur", function(e){
            if(!e.target.matches || !e.target.matches(".parmBox input")) return;
            let txt = e.target.value;

            if(formula.getfunctionParam(txt).fn == null && !formula.iscelldata(txt)){
                if(!isRealNum(txt) && txt != "" && txt.length <= 2 && txt.indexOf('"') != 0 && txt.lastIndexOf('"') != 0){
                    txt = '"' + txt + '"';
                    e.target.value = txt;

                    _this.parmTxtShow(txt);
                    _this.functionStrCompute();
                }
            }
        }, true);

        formulaDialogs.searchParm.el.addEventListener("keyup", function(e){
            if(!e.target.matches || !e.target.matches(".parmBox input")) return;
            _this.parmTxtShow(e.target.value);
            _this.functionStrCompute();
        });

        formulaDialogs.searchParm.el.addEventListener("click", function(e){
            if(!e.target.closest || !e.target.closest(".parmBox i")) return;
            let parmBox = e.target.closest(".parmBox");
            let parmIndex = Array.from(parmBox.parentElement.children).indexOf(parmBox);
            formula.data_parm_index = parmIndex;

            formulaDialogs.searchParm.hide();
            hideModalMask();

            formulaDialogs.searchParmSelect.remove();

            let _elInput = parmBox.querySelector(".txt input");
            let inputVal = _elInput ? _elInput.value : "";

            if(inputVal == ""){
                document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
                    "id": "luckysheet-search-formula-parm-select", 
                    "addclass": "luckysheet-search-formula-parm-select", 
                    "title": locale_formulaMore.tipSelectDataRange, 
                    "content": "<input id='luckysheet-search-formula-parm-select-input' class='luckysheet-datavisual-range-container' style='font-size: 14px;padding:5px;max-width:none;' spellcheck='false' aria-label='"+ locale_formulaMore.tipDataRangeTile +"' readonly='true' placeholder='"+ locale_formulaMore.tipDataRangeTile +"'>", 
                    "botton": '<button id="luckysheet-search-formula-parm-select-confirm" class="btn btn-primary">'+locale_button.confirm+'</button>', 
                    "style": "z-index:100003" 
                }));
            }
            else{
                document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
                    "id": "luckysheet-search-formula-parm-select", 
                    "addclass": "luckysheet-search-formula-parm-select", 
                    "title": locale_formulaMore.tipSelectDataRange, 
                    "content": "<input id='luckysheet-search-formula-parm-select-input' class='luckysheet-datavisual-range-container' style='font-size: 14px;padding:5px;max-width:none;' spellcheck='false' aria-label='"+ locale_formulaMore.tipDataRangeTile +"' readonly='true' value='"+ inputVal +"'>", 
                    "botton": '<button id="luckysheet-search-formula-parm-select-confirm" class="btn btn-primary">'+locale_button.confirm+'</button>', 
                    "style": "z-index:100003" 
                }));
            }

            formulaDialogs.searchParmSelect.setContentCss({"min-width": 300});
            let _elSelect = formulaDialogs.searchParmSelect.el;
            let myh = _elSelect.offsetHeight,
                myw = _elSelect.offsetWidth;
            let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
            let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
            formulaDialogs.searchParmSelect.showAt({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 });
            
            _this.parmTxtShow(inputVal);
        });

        formulaDialogs.searchParm.el.addEventListener("click", function(e){
            if(e.target.closest && e.target.closest("#luckysheet-search-formula-parm-confirm")){
                functionBox.confirmClick();
            }
        });

        formulaDialogs.searchParmSelect.el.addEventListener("click", function(e){
            if(e.target.closest && e.target.closest("#luckysheet-search-formula-parm-select-confirm")){
                let _elSelectInput = formulaDialogs.searchParmSelect.el.querySelector("#luckysheet-search-formula-parm-select-input");
                let parmIndex = _elSelectInput ? _elSelectInput.getAttribute("data_parm_index") : null;

                formulaDialogs.searchParmSelect.hide();
                formulaDialogs.searchParm.show();
                let _elParmBoxes = formulaDialogs.searchParm.el.querySelectorAll(".parmBox");
                if (parmIndex != null && _elParmBoxes[parmIndex]) {
                    let _elInput2 = _elParmBoxes[parmIndex].querySelector(".txt input");
                    if (_elInput2) _elInput2.focus();
                }
            }
        });
    },
    formulaListDialog: function(){
        let _this = this;

        let _locale = locale();
        let locale_formulaMore = _locale.formulaMore;
        let locale_button = _locale.button

        showModalMask();
        searchFormula.remove();

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
            "id": "luckysheet-search-formula", 
            "addclass": "luckysheet-search-formula", 
            "title": "", 
            "content": "<div class='inpbox'><label for='searchFormulaListInput'>"+ locale_formulaMore.findFunctionTitle +"：</label><input class='formulaInputFocus' id='searchFormulaListInput' placeholder='"+ locale_formulaMore.tipInputFunctionName +"' spellcheck='false'/></div><div class='selbox'><label>"+locale_formulaMore.selectCategory+"：</label><select id='formulaTypeSelect'><option value='0'>"+locale_formulaMore.Math+"</option><option value='1'>"+locale_formulaMore.Statistical+"</option><option value='2'>"+locale_formulaMore.Lookup+"</option><option value='3'>"+locale_formulaMore.luckysheet+"</option><option value='4'>"+locale_formulaMore.dataMining+"</option><option value='5'>"+locale_formulaMore.Database+"</option><option value='6'>"+locale_formulaMore.Date+"</option><option value='7'>"+locale_formulaMore.Filter+"</option><option value='8'>"+locale_formulaMore.Financial+"</option><option value='9'>"+locale_formulaMore.Engineering+"</option><option value='10'>"+locale_formulaMore.Logical+"</option><option value='11'>"+locale_formulaMore.Operator+"</option><option value='12'>"+locale_formulaMore.Text+"</option><option value='13'>"+locale_formulaMore.Parser+"</option><option value='14'>"+locale_formulaMore.Array+"</option><option value='-1'>"+locale_formulaMore.other+"</option></select></div><div class='listbox'><label>"+locale_formulaMore.selectFunctionTitle+"：</label><div id='formulaTypeList'></div></div>", 
            "botton": '<button id="luckysheet-search-formula-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button class="btn btn-default luckysheet-model-close-btn">'+locale_button.cancel+'</button>', 
            "style": "z-index:100003" 
        }));
        let _elContent = searchFormula.el.querySelector(".luckysheet-modal-dialog-content");
        if (_elContent) _elContent.style.minWidth = "300px";
        let _elDialog = searchFormula.el;
        let myh = _elDialog.offsetHeight, 
            myw = _elDialog.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        searchFormula.setCss({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3, "user-select": "none" });
        searchFormula.show();
        
        _this.formulaListByType("0");
        let _elSearchInput = document.getElementById("searchFormulaListInput");
        if (_elSearchInput) _elSearchInput.focus();
    },
    formulaListByType: function(type){
        let _elTypeList = searchFormula.el.querySelector("#formulaTypeList");
        if (_elTypeList) _elTypeList.innerHTML = '';
        let functionlist = Store.functionlist;
                    
        for(let i = 0; i < functionlist.length; i++){
            if((type == "-1" && functionlist[i].t > 14) || functionlist[i].t == type){
                if (_elTypeList) _elTypeList.insertAdjacentHTML('beforeend', '<div class="listBox" name="'+ functionlist[i].n +'"><span>'+ functionlist[i].n +'</span><span>'+ functionlist[i].a +'</span></div>');
            }
        }

        let _elFirstBox = searchFormula.el.querySelector("#formulaTypeList .listBox:first-child");
        if (_elFirstBox) _elFirstBox.classList.add("on");
    },
    formulaParmDialog: function(formulaTxt, parm){
        let parm_title = '',
            parm_content = '',
            parm_list_content = '';

        let _locale = locale();
        let locale_formulaMore = _locale.formulaMore;
        let locale_button = _locale.button;
        let functionlist = Store.functionlist;

        for(let i = 0; i < functionlist.length; i++){
            if(functionlist[i].n == formulaTxt.toUpperCase()){
                parm_title = functionlist[i].n;

                for(let j = 0; j < functionlist[i].p.length; j++){
                    if(parm == null){
                        parm_list_content += '<div class="parmBox">'+
                                                '<div class="name">'+ functionlist[i].p[j].name +'</div>'+
                                                '<div class="txt">'+
                                                    '<input class="formulaInputFocus" spellcheck="false"/>' +
                                                    '<i class="fa fa-table" aria-hidden="true" title="'+locale_formulaMore.tipSelectDataRange+'"></i>'+
                                                '</div>'+
                                                '<div class="val">=</div>'+
                                             '</div>';
                    }
                    else{
                        if(parm[j] == null){
                            parm[j] = "";
                        }

                        parm_list_content += '<div class="parmBox">'+
                                                '<div class="name">'+ functionlist[i].p[j].name +'</div>'+
                                                '<div class="txt">'+
                                                    '<input class="formulaInputFocus" value="'+ parm[j] +'" spellcheck="false"/>'+
                                                    '<i class="fa fa-table" aria-hidden="true" title="'+locale_formulaMore.tipSelectDataRange+'"></i>'+
                                                '</div>'+
                                                '<div class="val">=</div>'+
                                             '</div>';
                    }
                }

                parm_content =  '<div>'+
                                    '<div class="parmListBox">'+ parm_list_content +'</div>'+
                                    '<div class="formulaDetails">'+ functionlist[i].d +'</div>'+
                                    '<div class="parmDetailsBox"></div>'+
                                    '<div class="result">'+locale_formulaMore.calculationResult+' = <span></span></div>'+
                                '</div>';
            }
        }

        searchFormula.hide();
        hideModalMask();
        
        formulaDialogs.searchParm.remove();
        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
            "id": "luckysheet-search-formula-parm", 
            "addclass": "luckysheet-search-formula-parm", 
            "title": parm_title, 
            "content": parm_content, 
            "botton": '<button id="luckysheet-search-formula-parm-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button class="btn btn-default luckysheet-model-close-btn">'+locale_button.cancel+'</button>', 
            "style": "z-index:100003" 
        }));
        formulaDialogs.searchParm.setContentCss({"min-width": 300});
        let _elParmDialog = formulaDialogs.searchParm.el;
        let myh = _elParmDialog.offsetHeight,
            myw = _elParmDialog.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        formulaDialogs.searchParm.showAt({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 });
        
        let _elFirstInput = formulaDialogs.searchParm.el.querySelector(".parmBox input");
        if (_elFirstInput) _elFirstInput.focus();

        let _elParmBoxes = formulaDialogs.searchParm.el.querySelectorAll(".parmBox");
        _elParmBoxes.forEach(function(e, index){
            let _elTxtInput = e.querySelector(".txt input");
            let parmtxt = _elTxtInput ? _elTxtInput.value : "";
            
            if(formula.getfunctionParam(parmtxt).fn == null){
                if(formula.iscelldata(parmtxt)){
                    let txtdata = luckysheet_getcelldata(parmtxt).data;

                    if(getObjType(txtdata) == "array"){
                        let txtArr = [];
                        
                        for(let i = 0; i < txtdata.length; i++){
                            for(let j = 0; j < txtdata[i].length; j++){
                                let cell = txtdata[i][j];

                                if(cell == null || isRealNull(cell.v)){
                                    txtArr.push(null);
                                }
                                else{
                                    txtArr.push(cell.v);
                                }
                            }
                        }

                        let _elVal = e.querySelector(".val");
                        if (_elVal) _elVal.textContent = " = {"+ txtArr.join(",") +"}";
                    }
                    else{
                        let _elVal2 = e.querySelector(".val");
                        if (_elVal2) _elVal2.textContent = " = {"+ txtdata.v +"}";
                    }
                }
                else{
                    let _elVal3 = e.querySelector(".val");
                    if (_elVal3) _elVal3.textContent = " = {"+ parmtxt +"}";
                }
            }
            else{
                let _elVal4 = e.querySelector(".val");
                if (_elVal4) _elVal4.textContent = " = {"+ (new Function("return " + formula.functionParserExe("=" + parmtxt).trim()))() +"}";
            }
        });

        let _elHighlights = document.querySelectorAll("#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight");
        _elHighlights.forEach(function(el) { el.remove(); });
        formula.data_parm_index = 0;
        formula.rangestart = true;
    },
    parmTxtShow: function(parmtxt){
        if(formula.getfunctionParam(parmtxt).fn == null){
            if(formula.iscelldata(parmtxt)){
                let cellrange = formula.getcellrange(parmtxt);
                let r1 = cellrange.row[0], 
                    r2 = cellrange.row[1], 
                    c1 = cellrange.column[0], 
                    c2 = cellrange.column[1];
                let row = Store.visibledatarow[r2], 
                    row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
                let col = Store.visibledatacolumn[c2], 
                    col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

                formulaRangeSelect.showAt({ 
                    "left": col_pre, 
                    "width": col - col_pre - 1, 
                    "top": row_pre, 
                    "height": row - row_pre - 1 
                });
                formulaDialogs.formulaHelp.hide();

                luckysheet_count_show(col_pre, row_pre, col - col_pre - 1, row - row_pre - 1, cellrange.row, cellrange.column);

                let txtdata = luckysheet_getcelldata(parmtxt).data;
                if(getObjType(txtdata) == "array"){
                    let txtArr = [];
                    
                    for(let i = 0; i < txtdata.length; i++){
                        for(let j = 0; j < txtdata[i].length; j++){
                            let cell = txtdata[i][j];

                            if(cell == null || isRealNull(cell.v)){
                                txtArr.push(null);
                            }
                            else{
                                txtArr.push(cell.v);
                            }
                        }
                    }

                    let _elParmBoxes2 = formulaDialogs.searchParm.el.querySelectorAll(".parmBox");
                    let _elVal5 = _elParmBoxes2[formula.data_parm_index] ? _elParmBoxes2[formula.data_parm_index].querySelector(".val") : null;
                    if (_elVal5) _elVal5.textContent = " = {"+ txtArr.join(",") +"}";
                }
                else{
                    let _elParmBoxes3 = formulaDialogs.searchParm.el.querySelectorAll(".parmBox");
                    let _elVal6 = _elParmBoxes3[formula.data_parm_index] ? _elParmBoxes3[formula.data_parm_index].querySelector(".val") : null;
                    if (_elVal6) _elVal6.textContent = " = {"+ txtdata.v +"}";
                }
            }
            else if(getObjType(txtdata) != "object"){
                let _elParmBoxes4 = formulaDialogs.searchParm.el.querySelectorAll(".parmBox");
                let _elVal7 = _elParmBoxes4[formula.data_parm_index] ? _elParmBoxes4[formula.data_parm_index].querySelector(".val") : null;
                if (_elVal7) _elVal7.textContent = " = {"+ parmtxt +"}";

                formulaRangeSelect.hide();
            }
        }
        else{   
            let txt;
            for(let k = 0; k < formula.getfunctionParam(parmtxt).param.length; k++){
                if(formula.iscelldata(formula.getfunctionParam(parmtxt).param[k])){
                    txt = formula.getfunctionParam(parmtxt).param[k];
                    break;
                }
            }

            let cellrange = formula.getcellrange(txt);
            let r1 = cellrange.row[0], 
                r2 = cellrange.row[1], 
                c1 = cellrange.column[0], 
                c2 = cellrange.column[1];
            let row = Store.visibledatarow[r2], 
                row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
            let col = Store.visibledatacolumn[c2], 
                col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

            formulaRangeSelect.showAt({ 
                "left": col_pre, 
                "width": col - col_pre - 1, 
                "top": row_pre, 
                "height": row - row_pre - 1 
            });
            formulaDialogs.formulaHelp.hide();

            luckysheet_count_show(col_pre, row_pre, col - col_pre - 1, row - row_pre - 1, cellrange.row, cellrange.column);

            let _elParmBoxes5 = formulaDialogs.searchParm.el.querySelectorAll(".parmBox");
            let _elVal8 = _elParmBoxes5[formula.data_parm_index] ? _elParmBoxes5[formula.data_parm_index].querySelector(".val") : null;
            if (_elVal8) _elVal8.textContent = " = {"+ (new Function("return " + formula.functionParserExe("=" + parmtxt).trim()))() +"}";
        }
    },
    functionStrCompute: function(){
        let isVal = true;
        let parmValArr = [];
        let lvi = -1;

        let _elTitleText2 = formulaDialogs.searchParm.el.querySelector(".luckysheet-modal-dialog-title-text");
        let formulatxt = _elTitleText2 ? _elTitleText2.textContent : "";
        let p = Store.luckysheet_function[formulatxt].p;

        let _elParmBoxes6 = formulaDialogs.searchParm.el.querySelectorAll(".parmBox");
        _elParmBoxes6.forEach(function(e, i){
            let _elTxtInput2 = e.querySelector(".txt input");
            let parmtxt = _elTxtInput2 ? _elTxtInput2.value : "";

            let parmRequire;
            if(i < p.length){
                parmRequire = p[i].require;
            }
            else{
                parmRequire = p[p.length - 1].require;
            }

            if(parmtxt == "" && parmRequire == "m"){
                isVal = false;
            }

            if(parmtxt != ""){
                lvi = i;
            }
        });

        let functionHtmlTxt;
        if(lvi == -1){
            functionHtmlTxt = "=" + formulatxt + "()";
        }
        else if(lvi == 0){
            let _elFirstInput2 = _elParmBoxes6[0] ? _elParmBoxes6[0].querySelector(".txt input") : null;
            functionHtmlTxt = "=" + formulatxt + "(" + (_elFirstInput2 ? _elFirstInput2.value : "") + ")";
        }
        else{
            for(let j = 0; j <= lvi; j++){
                let _elTxtInput3 = _elParmBoxes6[j] ? _elParmBoxes6[j].querySelector(".txt input") : null;
                parmValArr.push(_elTxtInput3 ? _elTxtInput3.value : "");
            }

            functionHtmlTxt = "=" + formulatxt + "(" + parmValArr.join(",") + ")";
        }

        let function_str = formula.functionHTMLGenerate(functionHtmlTxt);
        richTextEditor.setHtml(function_str);
        functionBox.setHtml(richTextEditor.getHtml());
        
        if(isVal){
            let fp = formula.functionParserExe(richTextEditor.getText()).trim();
            
            let result = null;

            try {
                result = new Function("return " + fp)();
            } 
            catch (e) {
                result = formula.error.n;
            }

            let _elResultSpan = formulaDialogs.searchParm.el.querySelector(".result span");
            if (_elResultSpan) _elResultSpan.textContent = result;
        }
    }
}

export default insertFormula;
