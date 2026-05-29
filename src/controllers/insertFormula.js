import { luckysheet_getcelldata } from '../function/func';
// import functionlist from '../function/functionlist';
// import Store.luckysheet_function from '../function/Store.luckysheet_function';
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

//插入函数
const insertFormula = {
    init: function(){
        let _this = this;
        let _locale = locale();
        let locale_formulaMore = _locale.formulaMore;
        let locale_button = _locale.button;

        searchFormula.el.off("keyup.fxSFLI").on("keyup.fxSFLI", "#searchFormulaListInput", function(){
            searchFormula.find("#formulaTypeList").empty();
            let txt = $(this).val().toUpperCase();
            let functionlist = Store.functionlist;

            if(txt == ""){
                //若没有查找内容则根据类别筛选
                _this.formulaListByType(searchFormula.find("#formulaTypeSelect option:selected").val());
            }
            else{
                for(let i = 0; i < functionlist.length; i++){
                    if(/^[a-zA-Z]+$/.test(txt)){
                        if(functionlist[i].n.indexOf(txt) != "-1"){
                            $('<div class="listBox" name="'+ functionlist[i].n +'"><span>'+ functionlist[i].n +'</span><span>'+ functionlist[i].a +'</span></div>').appendTo(searchFormula.find("#formulaTypeList"));
                        }
                    }
                    else if(functionlist[i].a.indexOf(txt) != "-1"){
                        $('<div class="listBox" name="'+ functionlist[i].n +'"><span>'+ functionlist[i].n +'</span><span>'+ functionlist[i].a +'</span></div>').appendTo(searchFormula.find("#formulaTypeList"));
                    }
                }
            }
            
            searchFormula.find("#formulaTypeList .listBox:first-child").addClass("on"); //默认公式列表第一个为选中状态
        });

        searchFormula.el.off("change.fxFormulaTS").on("change.fxFormulaTS", "#formulaTypeSelect", function(){
            let type = searchFormula.find("#formulaTypeSelect option:selected").val();
            _this.formulaListByType(type);
        });

        searchFormula.el.off("click.fxListbox").on("click.fxListbox", "#formulaTypeList .listBox", function(){
            $(this).addClass("on").siblings().removeClass("on");
        });

        //选择公式后弹出参数栏弹框
        searchFormula.el.off("click.fxFormulaCf").on("click.fxFormulaCf", function(){
            let formula = searchFormula.find(".listBox.on").attr("name");
            let formulaTxt = '<span dir="auto" class="luckysheet-formula-text-color">=</span><span dir="auto" class="luckysheet-formula-text-color">'+ formula.toUpperCase() +'</span><span dir="auto" class="luckysheet-formula-text-color">(</span><span dir="auto" class="luckysheet-formula-text-color">)</span>';
            
            richTextEditor.setHtml(formulaTxt);
            functionBox.setHtml(richTextEditor.getHtml());

            _this.formulaParmDialog(formula);
        });

        //公式参数框
        formulaDialogs.searchParm.el.off("focus.fxParamInput").on("focus.fxParamInput", ".parmBox input", function(){
            let parmIndex = $(this).parents(".parmBox").index();
            formula.data_parm_index = parmIndex;

            let formulatxt = formulaDialogs.searchParm.find(".luckysheet-modal-dialog-title-text").text();
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

            //参数选区显示，参数值显示
            _this.parmTxtShow($(this).val());
            
            //计算结果
            _this.functionStrCompute();
            
            //参数名称和释义切换
            formulaDialogs.searchParm.find(".parmDetailsBox").empty();

            let parmName = $(this).parents(".parmBox").find(".name").text();
            $('<span>'+ parmName +':</span><span>'+ parmDetail +'</span>').appendTo(formulaDialogs.searchParm.find(".parmDetailsBox"));

            if(parmRepeat == "y"){
                let parmCount = formulaDialogs.searchParm.find(".parmBox").length;

                if(parmCount < 5 && parmIndex == (parmCount - 1)){
                    $('<div class="parmBox"><div class="name">'+ locale_formulaMore.valueTitle +''+ (parmCount + 1) +'</div><div class="txt"><input class="formulaInputFocus" /><i class="fa fa-table" aria-hidden="true" title="'+locale_formulaMore.tipSelectDataRange+'"></i></div><div class="val">=</div></div>').appendTo(formulaDialogs.searchParm.find(".parmListBox"));
                }
            }
        });

        formulaDialogs.searchParm.el.off("blur.fxParamInput").on("blur.fxParamInput", ".parmBox input", function(){
            let txt = $(this).val();

            if(formula.getfunctionParam(txt).fn == null && !formula.iscelldata(txt)){
                if(!isRealNum(txt) && txt != "" && txt.length <= 2 && txt.indexOf('"') != 0 && txt.lastIndexOf('"') != 0){
                    txt = '"' + txt + '"';
                    $(this).val(txt);

                    _this.parmTxtShow(txt);
                    _this.functionStrCompute();
                }
            }
        });
        
        formulaDialogs.searchParm.el.off("keyup.fxParamInput").on("keyup.fxParamInput", ".parmBox input", function(){
            //参数选区显示，参数值显示
            _this.parmTxtShow($(this).val());

            //计算结果
            _this.functionStrCompute();
        });

        //点击图标选取数据范围
        formulaDialogs.searchParm.el.off("click.fxParamI").on("click.fxParamI", ".parmBox i", function(){
            formula.data_parm_index = $(this).parents(".parmBox").index();
            
            //选取范围弹出框
            formulaDialogs.searchParm.hide();
            hideModalMask();

            formulaDialogs.searchParmSelect.remove();
            
            if($(this).parents(".parmBox").find(".txt input").val() == ""){
                $("body").append(replaceHtml(modelHTML, { 
                    "id": "luckysheet-search-formula-parm-select", 
                    "addclass": "luckysheet-search-formula-parm-select", 
                    "title": locale_formulaMore.tipSelectDataRange, 
                    "content": "<input id='luckysheet-search-formula-parm-select-input' class='luckysheet-datavisual-range-container' style='font-size: 14px;padding:5px;max-width:none;' spellcheck='false' aria-label='"+ locale_formulaMore.tipDataRangeTile +"' readonly='true' placeholder='"+ locale_formulaMore.tipDataRangeTile +"'>", 
                    "botton": '<button id="luckysheet-search-formula-parm-select-confirm" class="btn btn-primary">'+locale_button.confirm+'</button>', 
                    "style": "z-index:100003" 
                }));
            }
            else{
                $("body").append(replaceHtml(modelHTML, { 
                    "id": "luckysheet-search-formula-parm-select", 
                    "addclass": "luckysheet-search-formula-parm-select", 
                    "title": locale_formulaMore.tipSelectDataRange, 
                    "content": "<input id='luckysheet-search-formula-parm-select-input' class='luckysheet-datavisual-range-container' style='font-size: 14px;padding:5px;max-width:none;' spellcheck='false' aria-label='"+ locale_formulaMore.tipDataRangeTile +"' readonly='true' value='"+ $(this).parents(".parmBox").find(".txt input").val() +"'>", 
                    "botton": '<button id="luckysheet-search-formula-parm-select-confirm" class="btn btn-primary">'+locale_button.confirm+'</button>', 
                    "style": "z-index:100003" 
                }));
            }

            formulaDialogs.searchParmSelect.setContentCss({"min-width": 300});
            let $t = formulaDialogs.searchParmSelect.el,
                myh = $t.outerHeight(),
                myw = $t.outerWidth();
            let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
            let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
            formulaDialogs.searchParmSelect.showAt({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 });
            
            //参数选区虚线框
            _this.parmTxtShow($(this).parents(".parmBox").find(".txt input").val());
        });

        //点击确定
        formulaDialogs.searchParm.el.off("click.fxParamCf").on("click.fxParamCf", function(){
            functionBox.confirmClick();
        });

        //选取范围后传回参数栏弹框
        formulaDialogs.searchParmSelect.el.off("click.fxParamSelectCf").on("click.fxParamSelectCf", function(){
            let parmIndex = formulaDialogs.searchParmSelect.find("#luckysheet-search-formula-parm-select-input").attr("data_parm_index");

            formulaDialogs.searchParmSelect.hide();
            formulaDialogs.searchParm.show();
            formulaDialogs.searchParm.find(".parmBox").eq(parmIndex).find(".txt input").focus();
        });
    },
    formulaListDialog: function(){
        let _this = this;

        let _locale = locale();
        let locale_formulaMore = _locale.formulaMore;
        let locale_button = _locale.button

        showModalMask();
        searchFormula.remove();

        $("body").append(replaceHtml(modelHTML, { 
            "id": "luckysheet-search-formula", 
            "addclass": "luckysheet-search-formula", 
            "title": "", 
            "content": "<div class='inpbox'><label for='searchFormulaListInput'>"+ locale_formulaMore.findFunctionTitle +"：</label><input class='formulaInputFocus' id='searchFormulaListInput' placeholder='"+ locale_formulaMore.tipInputFunctionName +"' spellcheck='false'/></div><div class='selbox'><label>"+locale_formulaMore.selectCategory+"：</label><select id='formulaTypeSelect'><option value='0'>"+locale_formulaMore.Math+"</option><option value='1'>"+locale_formulaMore.Statistical+"</option><option value='2'>"+locale_formulaMore.Lookup+"</option><option value='3'>"+locale_formulaMore.luckysheet+"</option><option value='4'>"+locale_formulaMore.dataMining+"</option><option value='5'>"+locale_formulaMore.Database+"</option><option value='6'>"+locale_formulaMore.Date+"</option><option value='7'>"+locale_formulaMore.Filter+"</option><option value='8'>"+locale_formulaMore.Financial+"</option><option value='9'>"+locale_formulaMore.Engineering+"</option><option value='10'>"+locale_formulaMore.Logical+"</option><option value='11'>"+locale_formulaMore.Operator+"</option><option value='12'>"+locale_formulaMore.Text+"</option><option value='13'>"+locale_formulaMore.Parser+"</option><option value='14'>"+locale_formulaMore.Array+"</option><option value='-1'>"+locale_formulaMore.other+"</option></select></div><div class='listbox'><label>"+locale_formulaMore.selectFunctionTitle+"：</label><div id='formulaTypeList'></div></div>", 
            "botton": '<button id="luckysheet-search-formula-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button class="btn btn-default luckysheet-model-close-btn">'+locale_button.cancel+'</button>', 
            "style": "z-index:100003" 
        }));
        let $t = searchFormula.find(".luckysheet-modal-dialog-content").css("min-width", 300).end(),
            myh = $t.outerHeight(), 
            myw = $t.outerWidth();
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
        searchFormula.setCss({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3, "user-select": "none" }).show();
        
        _this.formulaListByType("0"); //默认公式列表为类型0
        $("#searchFormulaListInput").focus();
    },
    formulaListByType: function(type){
        searchFormula.find("#formulaTypeList").empty();
        let functionlist = Store.functionlist;
                    
        for(let i = 0; i < functionlist.length; i++){
            if((type == "-1" && functionlist[i].t > 14) || functionlist[i].t == type){
                $('<div class="listBox" name="'+ functionlist[i].n +'"><span>'+ functionlist[i].n +'</span><span>'+ functionlist[i].a +'</span></div>').appendTo(searchFormula.find("#formulaTypeList"));
            }
        }

        searchFormula.find("#formulaTypeList .listBox:first-child").addClass("on"); //默认公式列表第一个为选中状态
    },
    formulaParmDialog: function(formulaTxt, parm){ //参数弹出框
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
                        //无参数
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
                        //有参数
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
        $("body").append(replaceHtml(modelHTML, { 
            "id": "luckysheet-search-formula-parm", 
            "addclass": "luckysheet-search-formula-parm", 
            "title": parm_title, 
            "content": parm_content, 
            "botton": '<button id="luckysheet-search-formula-parm-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button class="btn btn-default luckysheet-model-close-btn">'+locale_button.cancel+'</button>', 
            "style": "z-index:100003" 
        }));
        formulaDialogs.searchParm.setContentCss({"min-width": 300});
        let $t = formulaDialogs.searchParm.el,
            myh = $t.outerHeight(),
            myw = $t.outerWidth();
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = $(document).scrollLeft(), scrollTop = $(document).scrollTop();
        formulaDialogs.searchParm.showAt({ "left": (winw + scrollLeft - myw) / 2, "top": (winh + scrollTop - myh) / 3 });
        
        //参数栏第一个参数聚焦，显示选取虚线框
        formulaDialogs.searchParm.find(".parmBox:eq(0) input").focus();

        //遍历参数，有参数显示值，无显示空
        formulaDialogs.searchParm.find(".parmBox").each(function(index,e){
            let parmtxt = $(e).find(".txt input").val();
            
            if(formula.getfunctionParam(parmtxt).fn == null){ //参数不是公式
                if(formula.iscelldata(parmtxt)){ //参数是选区
                    let txtdata = luckysheet_getcelldata(parmtxt).data;

                    if(getObjType(txtdata) == "array"){ //参数为多个单元格选区
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

                        formulaDialogs.searchParm.find(".parmBox").eq(index).find(".val").text(" = {"+ txtArr.join(",") +"}");
                    }
                    else{
                        formulaDialogs.searchParm.find(".parmBox").eq(index).find(".val").text(" = {"+ txtdata.v +"}");
                    }
                }
                else{
                    formulaDialogs.searchParm.find(".parmBox").eq(index).find(".val").text(" = {"+ parmtxt +"}");
                }
            }
            else{
                formulaDialogs.searchParm.find(".parmBox").eq(index).find(".val").text(" = {"+ (new Function("return " + $.trim(formula.functionParserExe("=" + parmtxt)))()) +"}");
            }
        })

        $("#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight").remove();                        
        formula.data_parm_index = 0;
        formula.rangestart = true;
    },
    parmTxtShow: function(parmtxt){
        if(formula.getfunctionParam(parmtxt).fn == null){ //参数不是公式
            if(formula.iscelldata(parmtxt)){ //参数是选区
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
                if(getObjType(txtdata) == "array"){ //参数为多个单元格选区
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

                    formulaDialogs.searchParm.find(".parmBox").eq(formula.data_parm_index).find(".val").text(" = {"+ txtArr.join(",") +"}");
                }
                else{
                    formulaDialogs.searchParm.find(".parmBox").eq(formula.data_parm_index).find(".val").text(" = {"+ txtdata.v +"}");
                }
            }
            else if(getObjType(txtdata) != "object"){
                formulaDialogs.searchParm.find(".parmBox").eq(formula.data_parm_index).find(".val").text(" = {"+ parmtxt +"}");

                formulaRangeSelect.hide();
            }
        }
        else{   
            //参数是公式
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

            formulaDialogs.searchParm.find(".parmBox").eq(formula.data_parm_index).find(".val").text(" = {"+ (new Function("return " + $.trim(formula.functionParserExe("=" + parmtxt)))()) +"}");
        }
    },
    functionStrCompute: function(){
        let isVal = true;
        let parmValArr = [];
        let lvi = -1;

        let formulatxt = formulaDialogs.searchParm.find(".luckysheet-modal-dialog-title-text").text();
        let p = Store.luckysheet_function[formulatxt].p;

        formulaDialogs.searchParm.find(".parmBox").each(function(i, e){
            let parmtxt = $(e).find(".txt input").val();

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

        //单元格显示
        let functionHtmlTxt;
        if(lvi == -1){
            functionHtmlTxt = "=" + formulaDialogs.searchParm.find(".luckysheet-modal-dialog-title-text").text() + "()";
        }
        else if(lvi == 0){
            functionHtmlTxt = "=" + formulaDialogs.searchParm.find(".luckysheet-modal-dialog-title-text").text() + "(" + formulaDialogs.searchParm.find(".parmBox").eq(0).find(".txt input").val() + ")";
        }
        else{
            for(let j = 0; j <= lvi; j++){
                parmValArr.push(formulaDialogs.searchParm.find(".parmBox").eq(j).find(".txt input").val());
            }

            functionHtmlTxt = "=" + formulaDialogs.searchParm.find(".luckysheet-modal-dialog-title-text").text() + "(" + parmValArr.join(",") + ")";
        }

        let function_str = formula.functionHTMLGenerate(functionHtmlTxt);
        richTextEditor.setHtml(function_str);
        functionBox.setHtml(richTextEditor.getHtml());
        
        if(isVal){
            let fp = $.trim(formula.functionParserExe(richTextEditor.getText()));
            
            let result = null;

            try {
                result = new Function("return " + fp)();
            } 
            catch (e) {
                result = formula.error.n;
            }

            formulaDialogs.searchParm.find(".result span").text(result);
        }
    }
}

export default insertFormula;