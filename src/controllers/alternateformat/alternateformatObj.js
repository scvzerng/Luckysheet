import { onNS, offNS } from '../../utils/migrationHelpers.js';
import Store from '../../store';
import locale from '../../locale/locale';
import formula from '../../global/formula';
import { getRangetxt } from '../../methods/get';
import { getCurrentFile } from '../../utils/storeAccess.js';
import { replaceHtml } from '../../utils/util';
import { isEditMode } from '../../global/validate';
import { showModalMask, hideModalMask } from '../../utils/domUtils.js';
import tooltip from '../../global/tooltip';
import { luckysheetrefreshgrid } from '../../global/refresh';
import { luckysheetAlternateformatHtml, modelHTML } from '../constant';
import luckysheetsizeauto from '../resize';
import { selectHightlightShow } from '../select';
import { FixedModelColor } from './presetData';
import { checksAF, compute, getComputeMap } from './compute';
import { createColorPicker, getPicker, STANDARD_PALETTE } from '../../components/ColorPicker';
import '../../components/ColorPicker/colorPicker.css';

const alternateformat = {
    rangefocus: false,
    modelfocusIndex: null,
    FixedModelColor: FixedModelColor,
    getModelBox: function(hasRowHeader, hasRowFooter){
        let _this = this;

        $("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-modelList").empty();
        $("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-modelCustom").empty();

        //格式样式 模板
        let modelListHtml = '';

        for(let i = 0; i < _this.FixedModelColor.length; i++){
            let obj = _this.FixedModelColor[i];

            let color1, color2, color3, color4;

            if(hasRowHeader && hasRowFooter){
                color1 = obj["head"];
                color2 = obj["one"];
                color3 = obj["two"];
                color4 = obj["foot"];
            }
            else if(hasRowHeader){
                color1 = obj["head"];
                color2 = obj["one"];
                color3 = obj["two"];
                color4 = obj["one"];
            }
            else if(hasRowFooter){
                color1 = obj["one"];
                color2 = obj["two"];
                color3 = obj["one"];
                color4 = obj["foot"];
            }
            else{
                color1 = obj["one"];
                color2 = obj["two"];
                color3 = obj["one"];
                color4 = obj["two"];
            }

            modelListHtml += '<div class="modelbox">'+
                                '<div class="box">'+
                                    '<span style="color:'+ color1["fc"] +';background-color:'+ color1["bc"] +'"> — </span>'+
                                    '<span style="color:'+ color2["fc"] +';background-color:'+ color2["bc"] +'"> — </span>'+
                                    '<span style="color:'+ color3["fc"] +';background-color:'+ color3["bc"] +'"> — </span>'+
                                    '<span style="color:'+ color4["fc"] +';background-color:'+ color4["bc"] +'"> — </span>'+
                                '</div>'+
                             '</div>';
        }

        $("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-modelList").append(modelListHtml);

        //自定义 模板
        let modelCustom = getCurrentFile()["luckysheet_alternateformat_save_modelCustom"];
        if(modelCustom != null && modelCustom.length > 0){
            let modelCustomHtml = '';

            for(let i = 0; i < modelCustom.length; i++){
                let obj = modelCustom[i];

                let color1, color2, color3, color4;

                if(hasRowHeader && hasRowFooter){
                    color1 = obj["head"];
                    color2 = obj["one"];
                    color3 = obj["two"];
                    color4 = obj["foot"];
                }
                else if(hasRowHeader){
                    color1 = obj["head"];
                    color2 = obj["one"];
                    color3 = obj["two"];
                    color4 = obj["one"];
                }
                else if(hasRowFooter){
                    color1 = obj["one"];
                    color2 = obj["two"];
                    color3 = obj["one"];
                    color4 = obj["foot"];
                }
                else{
                    color1 = obj["one"];
                    color2 = obj["two"];
                    color3 = obj["one"];
                    color4 = obj["two"];
                }

                modelCustomHtml +=  '<div class="modelbox">'+
                                        '<div class="box">'+
                                            '<span style="color:'+ color1["fc"] +';background-color:'+ color1["bc"] +'"> — </span>'+
                                            '<span style="color:'+ color2["fc"] +';background-color:'+ color2["bc"] +'"> — </span>'+
                                            '<span style="color:'+ color3["fc"] +';background-color:'+ color3["bc"] +'"> — </span>'+
                                            '<span style="color:'+ color4["fc"] +';background-color:'+ color4["bc"] +'"> — </span>'+
                                        '</div>'+
                                    '</div>';
            }

            $("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-modelCustom").append(modelCustomHtml);
        }
    },
    init: function(){
        let _this = this;

        $("#luckysheet-modal-dialog-slider-alternateformat").remove();
        document.body.insertAdjacentHTML('beforeend', luckysheetAlternateformatHtml());
        luckysheetsizeauto();

        //关闭
        $("#luckysheet-modal-dialog-slider-alternateformat .luckysheet-model-close-btn").click(function () {
            const _elAF1 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAF1) _elAF1.style.display = 'none';
            luckysheetsizeauto();
        });

        //应用范围
        offNS("AFrangeInput");
        onNS(document, "focus.AFrangeInput", "#luckysheet-alternateformat-range input", function(){
            _this.rangefocus = true;
        });
        offNS("AFrangeInput");
        onNS(document, "blur.AFrangeInput", "#luckysheet-alternateformat-range input", function(){
            _this.rangefocus = false;
        });

        offNS("AFrangeInput");
        onNS(document, "keydown.AFrangeInput", "#luckysheet-alternateformat-range input", function(e){
            let rangeValue = $(this).val().trim();
            if(e.keyCode == 13){
                _this.update();
            }
        });
        offNS("AFrangeIcon");
        onNS(document, "click.AFrangeIcon", "#luckysheet-alternateformat-range .fa-table", function(){
            const _elAF2 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAF2) _elAF2.style.display = 'none';
             luckysheetsizeauto();

             let rangeValue = $(this).parents("#luckysheet-alternateformat-range").find("input").val().trim();
            _this.rangeDialog(rangeValue);
        });
        offNS("AFrDCf");
        onNS(document, "click.AFrDCf", "#luckysheet-alternateformat-rangeDialog-confirm", function(){
            let rangeValue = $(this).parents("#luckysheet-alternateformat-rangeDialog").find("input").val().trim();
            $("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-range input").val(rangeValue);

            $(this).parents("#luckysheet-alternateformat-rangeDialog").hide();
            const _elAFShow1 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAFShow1) _elAFShow1.style.display = '';
            luckysheetsizeauto();

            _this.update();
        });
        offNS("AFrDCl");
        onNS(document, "click.AFrDCl", "#luckysheet-alternateformat-rangeDialog-close", function(){
            $(this).parents("#luckysheet-alternateformat-rangeDialog").hide();
            const _elAFShow2 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAFShow2) _elAFShow2.style.display = '';
            luckysheetsizeauto();
        });
        offNS("AFrDTitle");
        onNS(document, "click.AFrDTitle", "#luckysheet-alternateformat-rangeDialog .luckysheet-modal-dialog-title-close", function(){
            $(this).parents("#luckysheet-alternateformat-rangeDialog").hide();
            const _elAFShow3 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAFShow3) _elAFShow3.style.display = '';
            luckysheetsizeauto();
        });

        //页眉、页脚选中
        offNS("AFrowHeader");
        onNS(document, "change.AFrowHeader", "#luckysheet-alternateformat-rowHeader", function(){
            let hasRowHeader;
            if($(this).is(":checked")){
                hasRowHeader = true;
            }
            else{
                hasRowHeader = false;   
            }

            let hasRowFooter;
            if($("#luckysheet-alternateformat-rowFooter").is(":checked")){
                hasRowFooter = true;
            }
            else{
                hasRowFooter = false;   
            }

            _this.checkboxChange(hasRowHeader, hasRowFooter);
            _this.modelboxOn();
            _this.update();
        });
        offNS("AFrowFooter");
        onNS(document, "change.AFrowFooter", "#luckysheet-alternateformat-rowFooter", function(){
            let hasRowHeader;
            if($("#luckysheet-alternateformat-rowHeader").is(":checked")){
                hasRowHeader = true;
            }
            else{
                hasRowHeader = false;   
            }

            let hasRowFooter;
            if($(this).is(":checked")){
                hasRowFooter = true;
            }
            else{
                hasRowFooter = false;   
            }

            _this.checkboxChange(hasRowHeader, hasRowFooter);
            _this.modelboxOn();
            _this.update();
        });

        //点击样式模板
        offNS("AFmodelbox");
        onNS(document, "click.AFmodelbox", "#luckysheet-modal-dialog-slider-alternateformat .modelbox", function(){
            let index = $(this).index();
            let $id = $(this).parents(".cf").attr("id");

            if($id == "luckysheet-alternateformat-modelList"){
                _this.modelfocusIndex = index;
            }
            else if($id == "luckysheet-alternateformat-modelCustom"){
                let len = _this.FixedModelColor.length;
                _this.modelfocusIndex = index + len;
            }

            _this.modelboxOn();
            _this.update();
        });

        //点击选择文本/单元格颜色
        offNS("AFselectColor");
        onNS(document, "click.AFselectColor", "#luckysheet-modal-dialog-slider-alternateformat .luckysheet-color-menu-button-indicator", function(){
            let $parent = $(this).closest(".toningbox");

            let colorType, currenColor;
            if($(this).find(".luckysheet-icon-img").hasClass("luckysheet-icon-text-color")){
                colorType = "fc";
                currenColor = $parent.find(".toningShow").data("fc");
            }
            else if($(this).find(".luckysheet-icon-img").hasClass("luckysheet-icon-cell-color")){
                colorType = "bc";
                currenColor = $parent.find(".toningShow").data("bc");
            }

            //source
            let source;
            if($parent.hasClass("header")){
                source = "0";
            }
            else if($parent.hasClass("ctOne")){
                source = "1";
            }
            else if($parent.hasClass("ctTwo")){
                source = "2";
            }
            else if($parent.hasClass("footer")){
                source = "3";
            }

            _this.colorSelectDialog(currenColor, colorType, source);
        });

        //选择颜色 确定 添加自定义模板
        offNS("AFselectColorConfirm");
        onNS(document, "click.AFselectColorConfirm", "#luckysheet-alternateformat-colorSelect-dialog-confirm", function(){
            let $parent = $(this).parents("#luckysheet-alternateformat-colorSelect-dialog");
            const _locale = locale()
            const alternatingColors =_locale.alternatingColors;
            hideModalMask();
            $parent.hide();

            //获取currenColor colorType source
            let currenColor = $parent.find(".currenColor span").attr("title");

            let colorType;
            if($parent.find(".luckysheet-modal-dialog-title-text").text() == alternatingColors.selectionTextColor){
                colorType = "fc";
            }
            else if($parent.find(".luckysheet-modal-dialog-title-text").text() == alternatingColors.selectionCellColor){
                colorType = "bc";
            }

            let source = $parent.find(".currenColor").attr("data-source");
            
            //赋给颜色
            if(source == "0"){
                if(colorType == "fc"){
                    $("#luckysheet-alternateformat-modelToning .header .toningShow").css("color", currenColor);
                    $("#luckysheet-alternateformat-modelToning .header .toningShow").data("fc", currenColor);
                    $("#luckysheet-alternateformat-modelToning .header .luckysheet-icon-text-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", currenColor);
                }
                if(colorType == "bc"){
                    $("#luckysheet-alternateformat-modelToning .header .toningShow").css("background-color", currenColor);
                    $("#luckysheet-alternateformat-modelToning .header .toningShow").data("bc", currenColor);
                    $("#luckysheet-alternateformat-modelToning .header .luckysheet-icon-cell-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", currenColor);
                }
            }
            else if(source == "1"){
                if(colorType == "fc"){
                    $("#luckysheet-alternateformat-modelToning .ctOne .toningShow").css("color", currenColor);
                    $("#luckysheet-alternateformat-modelToning .ctOne .toningShow").data("fc", currenColor);
                    $("#luckysheet-alternateformat-modelToning .ctOne .luckysheet-icon-text-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", currenColor);
                }
                if(colorType == "bc"){
                    $("#luckysheet-alternateformat-modelToning .ctOne .toningShow").css("background-color", currenColor);
                    $("#luckysheet-alternateformat-modelToning .ctOne .toningShow").data("bc", currenColor);
                    $("#luckysheet-alternateformat-modelToning .ctOne .luckysheet-icon-cell-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", currenColor);
                }
            }
            else if(source == "2"){
                if(colorType == "fc"){
                    $("#luckysheet-alternateformat-modelToning .ctTwo .toningShow").css("color", currenColor);
                    $("#luckysheet-alternateformat-modelToning .ctTwo .toningShow").data("fc", currenColor);
                    $("#luckysheet-alternateformat-modelToning .ctTwo .luckysheet-icon-text-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", currenColor);
                }
                if(colorType == "bc"){
                    $("#luckysheet-alternateformat-modelToning .ctTwo .toningShow").css("background-color", currenColor);
                    $("#luckysheet-alternateformat-modelToning .ctTwo .toningShow").data("bc", currenColor);
                    $("#luckysheet-alternateformat-modelToning .ctTwo .luckysheet-icon-cell-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", currenColor);
                }
            }
            else if(source == "3"){
                if(colorType == "fc"){
                    $("#luckysheet-alternateformat-modelToning .footer .toningShow").css("color", currenColor);
                    $("#luckysheet-alternateformat-modelToning .footer .toningShow").data("fc", currenColor);
                    $("#luckysheet-alternateformat-modelToning .footer .luckysheet-icon-text-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", currenColor);
                }
                if(colorType == "bc"){
                    $("#luckysheet-alternateformat-modelToning .footer .toningShow").css("background-color", currenColor);
                    $("#luckysheet-alternateformat-modelToning .footer .toningShow").data("bc", currenColor);
                    $("#luckysheet-alternateformat-modelToning .footer .luckysheet-icon-cell-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", currenColor);
                }
            }
            
            //若模板聚焦在固有模板，则新加模板；若模板聚焦在自定义模板，则修改该模板
            let hasRowHeader;
            if($("#luckysheet-alternateformat-rowHeader").is(":checked")){
                hasRowHeader = true;
            }
            else{
                hasRowHeader = false;   
            }

            let hasRowFooter;
            if($("#luckysheet-alternateformat-rowFooter").is(":checked")){
                hasRowFooter = true;
            }
            else{
                hasRowFooter = false;   
            }

            let index = _this.modelfocusIndex;
            let len = _this.FixedModelColor.length;

            let format, file;
            if(index < len){
                format = structuredClone(_this.getFormatByIndex());
            }
            else{
                file = getCurrentFile();
                let modelCustom = file["luckysheet_alternateformat_save_modelCustom"];

                format = structuredClone(modelCustom[index - len]);
            }

            if(source == "0"){
                if(colorType == "fc"){
                    format["head"]["fc"] = currenColor;
                }
                else if(colorType == "bc"){
                    format["head"]["bc"] = currenColor;
                }
            }
            else if(source == "1"){
                if(colorType == "fc"){
                    format["one"]["fc"] = currenColor;
                }
                else if(colorType == "bc"){
                    format["one"]["bc"] = currenColor;
                }
            }
            else if(source == "2"){
                if(colorType == "fc"){
                    format["two"]["fc"] = currenColor;
                }
                else if(colorType == "bc"){
                    format["two"]["bc"] = currenColor;
                }
            }
            else if(source == "3"){
                if(colorType == "fc"){
                    format["foot"]["fc"] = currenColor;
                }
                if(colorType == "bc"){
                    format["foot"]["bc"] = currenColor;
                }
            }

            if(_this.modelfocusIndex < len){
                _this.addCustomModel(format);
                _this.modelfocusIndex = _this.getIndexByFormat(format);
            }
            else{
                file["luckysheet_alternateformat_save_modelCustom"][index - len] = format;

            }

            _this.getModelBox(hasRowHeader, hasRowFooter);
            _this.modelboxOn();
            _this.update();
        });
        
        //点击 移除交替颜色 按钮
        offNS("AFremove");
        onNS(document, "click.AFremove", "#luckysheet-alternateformat-remove", function(){
            let dataIndex = $(this).data("index");

            let file = getCurrentFile();

            let ruleArr = file["luckysheet_alternateformat_save"];

            //保存之前的规则
            let historyRules = structuredClone(ruleArr);

            //保存当前的规则
            if(ruleArr.length > 1){
                ruleArr.splice(dataIndex, 1);
            }
            else{
                ruleArr = [];
            }

            let currentRules = structuredClone(ruleArr);
            
            //刷新一次表格
            _this.ref(historyRules, currentRules);

            //隐藏一些dom
            hideModalMask();
            const _elAF3 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAF3) _elAF3.style.display = 'none';

            luckysheetsizeauto();
        });
    },
    perfect: function(){
        let _this = this;

        let range = structuredClone(Store.luckysheet_select_save[0]);
        let existsIndex = _this.rangeIsExists(range)[1];
        
        let obj = structuredClone(getCurrentFile()["luckysheet_alternateformat_save"][existsIndex]);
        
        //应用范围
        let cellrange = obj["cellrange"];
        $("#luckysheet-alternateformat-range input").val(getRangetxt(Store.currentSheetIndex, { "row": cellrange["row"], "column": cellrange["column"] }, Store.currentSheetIndex));
        
        Store.luckysheet_select_save = [{ "row": cellrange["row"], "column": cellrange["column"] }];
        selectHightlightShow();

        //页眉、页脚
        let hasRowHeader = obj["hasRowHeader"];
        let hasRowFooter = obj["hasRowFooter"];
        
        //模板聚焦
        let format = obj["format"];
        _this.modelfocusIndex = _this.getIndexByFormat(format);

        if(_this.modelfocusIndex == null){
            _this.addCustomModel(format);
            _this.modelfocusIndex = _this.getIndexByFormat(format);
        }

        _this.checkboxChange(hasRowHeader, hasRowFooter);
        _this.modelboxOn();

        //标识 交替颜色的index
        $("#luckysheet-alternateformat-remove").data("index", existsIndex);
    },
    checkboxChange: function(hasRowHeader, hasRowFooter){
        if(hasRowHeader){
            $("#luckysheet-alternateformat-rowHeader").prop("checked", true);
            document.querySelectorAll("#luckysheet-alternateformat-modelToning .header").forEach(el => el.style.display = '');
        }
        else{
            $("#luckysheet-alternateformat-rowHeader").removeAttr("checked");  
            document.querySelectorAll("#luckysheet-alternateformat-modelToning .header").forEach(el => el.style.display = 'none');
        }

        if(hasRowFooter){
            $("#luckysheet-alternateformat-rowFooter").prop("checked", true);
            document.querySelectorAll("#luckysheet-alternateformat-modelToning .footer").forEach(el => el.style.display = '');
        }
        else{
            $("#luckysheet-alternateformat-rowFooter").removeAttr("checked"); 
            document.querySelectorAll("#luckysheet-alternateformat-modelToning .footer").forEach(el => el.style.display = 'none');  
        }

        this.getModelBox(hasRowHeader, hasRowFooter);
    },
    modelboxOn: function(){
        let _this = this;

        //模板 foucs
        $("#luckysheet-modal-dialog-slider-alternateformat .modelbox").removeClass("on");

        let index = _this.modelfocusIndex;
        let len = _this.FixedModelColor.length;
        
        if(index < len){
            $("#luckysheet-alternateformat-modelList .modelbox").eq(index).addClass("on");
        }
        else{
            $("#luckysheet-alternateformat-modelCustom .modelbox").eq(index - len).addClass("on");
        }

        //编辑 对应颜色改变
        _this.modelToningColor();
    },
    modelToningColor: function(){
        let format = this.getFormatByIndex();

        //页眉
        $("#luckysheet-alternateformat-modelToning .header .toningShow").css({"color": format["head"].fc, "background-color": format["head"].bc});
        $("#luckysheet-alternateformat-modelToning .header .toningShow").data("fc", format["head"].fc).data("bc", format["head"].bc);
        $("#luckysheet-alternateformat-modelToning .header .luckysheet-icon-text-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", format["head"].fc);
        $("#luckysheet-alternateformat-modelToning .header .luckysheet-icon-cell-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", format["head"].bc);

        //颜色1
        $("#luckysheet-alternateformat-modelToning .ctOne .toningShow").css({"color": format["one"].fc, "background-color": format["one"].bc});
        $("#luckysheet-alternateformat-modelToning .ctOne .toningShow").data("fc", format["one"].fc).data("bc", format["one"].bc);
        $("#luckysheet-alternateformat-modelToning .ctOne .luckysheet-icon-text-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", format["one"].fc);
        $("#luckysheet-alternateformat-modelToning .ctOne .luckysheet-icon-cell-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", format["one"].bc);

        //颜色2
        $("#luckysheet-alternateformat-modelToning .ctTwo .toningShow").css({"color": format["two"].fc, "background-color": format["two"].bc});
        $("#luckysheet-alternateformat-modelToning .ctTwo .toningShow").data("fc", format["two"].fc).data("bc", format["two"].bc);
        $("#luckysheet-alternateformat-modelToning .ctTwo .luckysheet-icon-text-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", format["two"].fc);
        $("#luckysheet-alternateformat-modelToning .ctTwo .luckysheet-icon-cell-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", format["two"].bc);

        //页脚
        $("#luckysheet-alternateformat-modelToning .footer .toningShow").css({"color": format["foot"].fc, "background-color": format["foot"].bc});
        $("#luckysheet-alternateformat-modelToning .footer .toningShow").data("fc", format["foot"].fc).data("bc", format["foot"].bc);
        $("#luckysheet-alternateformat-modelToning .footer .luckysheet-icon-text-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", format["foot"].fc);
        $("#luckysheet-alternateformat-modelToning .footer .luckysheet-icon-cell-color").parents(".luckysheet-color-menu-button-indicator").css("border-bottom-color", format["foot"].bc);
    },
    addCustomModel: function(format){
        let file = getCurrentFile();

        if(file["luckysheet_alternateformat_save_modelCustom"] == null){
            file["luckysheet_alternateformat_save_modelCustom"] = [];
        }

        file["luckysheet_alternateformat_save_modelCustom"].push(format);

    },
    colorSelectDialog: function(currenColor, colorType, source){
        showModalMask();
        $("#luckysheet-alternateformat-colorSelect-dialog").remove();

        const _locale = locale()
        const alternatingColors =_locale.alternatingColors;
        const locale_button = _locale.button;
        const locale_toolbar = _locale.toolbar;

        let title;
        if(colorType == "fc"){
            title = alternatingColors.selectionTextColor;
        }
        else if(colorType == "bc"){
            title = alternatingColors.selectionCellColor;
        }

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
            "id": "luckysheet-alternateformat-colorSelect-dialog", 
            "addclass": "luckysheet-alternateformat-colorSelect-dialog", 
            "title": title, 
            "content": "<div class='currenColor' data-source='"+ source +"'>"+ alternatingColors.currentColor +"：<span title='"+ currenColor +"' style='background-color:"+ currenColor +"'></span></div><div class='colorshowbox'></div>", 
            "botton": '<button id="luckysheet-alternateformat-colorSelect-dialog-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button class="btn btn-default luckysheet-model-close-btn">'+locale_button.cancel+'</button>', 
            "style": "z-index:100003" 
        }));
        let $t = $("#luckysheet-alternateformat-colorSelect-dialog")
                .find(".luckysheet-modal-dialog-content")
                .css("min-width", 300)
                .end(), 
            myh = $t.outerHeight(), 
            myw = $t.outerWidth();
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        $("#luckysheet-alternateformat-colorSelect-dialog").css({
            "left": (winw + scrollLeft - myw) / 2, 
            "top": (winh + scrollTop - myh) / 3 
        }).show();
        
        //初始化选择颜色插件
        createColorPicker($("#luckysheet-alternateformat-colorSelect-dialog").find(".colorshowbox")[0], {
            showPalette: true,
            showPaletteOnly: true,
            preferredFormat: "hex",
            clickoutFiresChange: false,
            showInitial: true,
            showInput: true,
            flat: true,
            hideAfterPaletteSelect: true,
            showSelectionPalette: true,
            showButtons: false,
            maxPaletteSize: 8,
            maxSelectionSize: 8,
            color: currenColor,
            cancelText: locale_button.cancel,
            chooseText: locale_toolbar.confirmColor,
            togglePaletteMoreText: locale_toolbar.customColor,
            togglePaletteLessText: locale_toolbar.collapse,
            togglePaletteOnly: true,
            clearText: locale_toolbar.clearText,
            noColorSelectedText: locale_toolbar.noColorSelectedText,
            palette: STANDARD_PALETTE,
            move: function(color){
                if (color != null) {
                    color = color.toHexString();
                }
                else {
                    color = "#000";
                }

                $("#luckysheet-alternateformat-colorSelect-dialog .currenColor span").css("background-color", color).attr("title", color);
            },
            change: function(color){
                if (color != null) {
                    color = color.toHexString();
                }
                else {
                    color = "#000";
                }

                $("#luckysheet-alternateformat-colorSelect-dialog .currenColor span").css("background-color", color).attr("title", color);
            }
        });
    },
    rangeDialog: function(value){
        hideModalMask();
        $("#luckysheet-alternateformat-rangeDialog").remove();

        const _locale = locale()
        const alternatingColors =_locale.alternatingColors;
        const locale_button = _locale.button;

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
            "id": "luckysheet-alternateformat-rangeDialog", 
            "addclass": "luckysheet-alternateformat-rangeDialog", 
            "title": alternatingColors.selectRange, 
            "content": '<input readonly="readonly" placeholder="'+alternatingColors.tipSelectRange+'" value="'+value+'"/>', 
            "botton": '<button id="luckysheet-alternateformat-rangeDialog-confirm" class="btn btn-primary">'+locale_button.confirm+'</button><button id="luckysheet-alternateformat-rangeDialog-close" class="btn btn-default">'+locale_button.cancel+'</button>', 
            "style": "z-index:100003" 
        }));
        let $t = $("#luckysheet-alternateformat-rangeDialog")
                .find(".luckysheet-modal-dialog-content")
                .css("min-width", 300)
                .end(), 
            myh = $t.outerHeight(), 
            myw = $t.outerWidth();
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        $("#luckysheet-alternateformat-rangeDialog").css({
            "left": (winw + scrollLeft - myw) / 2, 
            "top": (winh + scrollTop - myh) / 3 
        }).show();
    },
    rangeIsExists: function(range, index){
        let _this = this;

        let isExists = false;
        let existsIndex = null;

        //获取已有交替颜色所有应用范围
        let AFarr = structuredClone(getCurrentFile()["luckysheet_alternateformat_save"]);

        if(index != undefined && index != null){
            if(AFarr.length > 1){
                AFarr.splice(index, 1);
            }
            else{
                AFarr = [];
            }
        }

        if(AFarr.length > 0){
            let arr = [];
            for(let i = 0; i < AFarr.length; i++){
                let obj = {
                    "index": i,
                    "map": _this.getRangeMap(AFarr[i]["cellrange"]["row"], AFarr[i]["cellrange"]["column"])
                }

                arr.push(obj);
            }
            
            //获取当前选区
            let rangeMap = _this.getRangeMap(range["row"], range["column"]);
            
            //遍历
            for(let x in rangeMap){
                if(isExists){
                    break;
                } 

                for(let j = 0; j < arr.length; j++){
                    if(x in arr[j]["map"]){
                        isExists = true;
                        existsIndex = arr[j]["index"];
                        break;
                    }
                }
            }
        }

        return [isExists, existsIndex];
    },
    getRangeMap: function(row, column){
        let map = {};
        let st_r = row[0], ed_r = row[1], st_c = column[0], ed_c = column[1];
        
        for(let r = st_r; r <= ed_r; r++){
            for(let c = st_c; c <= ed_c; c++){
                map[r + "_" + c] = 0;
            }
        }
        
        return map;
    },
    getIndexByFormat: function(format){
        let _this = this;
        let index = null;

        //格式样式 模板
        let modelList = _this.FixedModelColor;
        for(let i = 0; i < modelList.length; i++){
            let obj = modelList[i];

            if(format["head"].fc == obj["head"].fc && format["head"].bc == obj["head"].bc){
                if(format["one"].fc == obj["one"].fc && format["one"].bc == obj["one"].bc){
                    if(format["two"].fc == obj["two"].fc && format["two"].bc == obj["two"].bc){
                        if(format["foot"].fc == obj["foot"].fc && format["foot"].bc == obj["foot"].bc){
                            index = i;
                            break;
                        }
                    }
                }
            }
        }
        
        //自定义 模板
        let modelCustom = getCurrentFile()["luckysheet_alternateformat_save_modelCustom"];
        if(modelCustom != null && modelCustom.length > 0){
            for(let j = 0; j < modelCustom.length; j++){
                let obj = modelCustom[j];

                if(format["head"].fc == obj["head"].fc && format["head"].bc == obj["head"].bc){
                    if(format["one"].fc == obj["one"].fc && format["one"].bc == obj["one"].bc){
                        if(format["two"].fc == obj["two"].fc && format["two"].bc == obj["two"].bc){
                            if(format["foot"].fc == obj["foot"].fc && format["foot"].bc == obj["foot"].bc){
                                index = modelList.length + j;
                                break;
                            }
                        }
                    }
                }
            }
        }
       
        return index;
    },
    getFormatByIndex: function(){
        let _this = this;

        let index = _this.modelfocusIndex;
        let len = _this.FixedModelColor.length;

        let format = {};

        if(index < len){
            format = _this.FixedModelColor[index];
        }
        else{
            format = getCurrentFile()["luckysheet_alternateformat_save_modelCustom"][index - len];
        }

        return format;
    },
    new: function(cellrange){
        let _this = this;

        let format = _this.getFormatByIndex();

        let file = getCurrentFile();
        let ruleArr = file["luckysheet_alternateformat_save"];
        
        if(ruleArr == null){
            ruleArr = [];
        }

        //保存之前的规则
        let historyRules = structuredClone(ruleArr);
        
        //保存当前的规则
        let obj = {
            "cellrange": {
                "row": cellrange["row"],
                "column": cellrange["column"]
            },
            "format": format,
            "hasRowHeader": true,
            "hasRowFooter": false
        }

        ruleArr.push(obj);

        let currentRules = structuredClone(ruleArr);
        
        //刷新一次表格
        _this.ref(historyRules, currentRules);

    },
    update: function(){
        let _this = this;
        const _locale = locale()
        const alternatingColors =_locale.alternatingColors;
        //获取标识
        let dataIndex = $("#luckysheet-alternateformat-remove").data("index");
        
        //应用范围
        let rangeValue = $("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-range input").val().trim();
        
        if(!formula.iscelldata(rangeValue)){
            if(isEditMode()){
                alert(alternatingColors.errorNoRange);
            }
            else{
                tooltip.info(alternatingColors.errorNoRange, "");
            }

            return;
        }
        
        let cellrange = formula.getcellrange(rangeValue);
        let isExists = _this.rangeIsExists(cellrange, dataIndex)[0];

        if(isExists){
            if(isEditMode()){
                alert(alternatingColors.errorExistColors);
            }
            else{
                tooltip.info(alternatingColors.errorExistColors, ""); 
            }

            return;
        }

        //页眉、页脚
        let hasRowHeader;
        if($("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-rowHeader").is(":checked")){
            hasRowHeader = true;
        }
        else{
            hasRowHeader = false;    
        }

        let hasRowFooter;
        if($("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-rowFooter").is(":checked")){
            hasRowFooter = true;
        }
        else{
            hasRowFooter = false;    
        }

        //获取选中样式模板的颜色
        let format = _this.getFormatByIndex();
        let file = getCurrentFile();
        
        let ruleArr = file["luckysheet_alternateformat_save"];
        if(ruleArr == null){
            ruleArr = [];
        }
        
        //保存之前的规则
        let historyRules = structuredClone(ruleArr);
        
        //保存当前的规则
        let obj = {
            "cellrange": {
                "row": cellrange["row"],
                "column": cellrange["column"]
            },
            "format": format,
            "hasRowHeader": hasRowHeader,
            "hasRowFooter": hasRowFooter
        }
        
        ruleArr[dataIndex] = obj;

        let currentRules = structuredClone(ruleArr);
        
        //刷新一次表格
        _this.ref(historyRules, currentRules);

    },
    checksAF: checksAF,
    getComputeMap: getComputeMap,
    compute: compute,
    ref: function(historyRules, currentRules){
        if (Store.clearjfundo) {
            Store.jfundo.length  = 0;

            let redo = {};
            redo["type"] = "updateAF";
            redo["sheetIndex"] = Store.currentSheetIndex;
            redo["data"] = {"historyRules": historyRules, "currentRules": currentRules};
            Store.jfredo.push(redo); 
        }

        getCurrentFile()["luckysheet_alternateformat_save"] = currentRules;

        setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1);
    }
}

export default alternateformat;
