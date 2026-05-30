import { onNS, offNS } from '../../utils/migrationHelpers.js';
import Store from '../../store';
import locale from '../../locale/locale';
import { getRangetxt } from '../../methods/get';
import { getCurrentFile } from '../../utils/storeAccess.js';
import { replaceHtml } from '../../utils/util';
import { showModalMask, hideModalMask } from '../../utils/domUtils.js';
import { luckysheetAlternateformatHtml, modelHTML } from '../constant';
import { luckysheetsizeauto } from '../resize';
import { selectHightlightShow } from '../select';
import { FixedModelColor } from './presetData';
import { getRangeMap, rangeIsExists, getIndexByFormat, getFormatByIndex, newRule, update, ref } from './ruleManager';
import { checksAF, getComputeMap, compute } from './compute';
import { createColorPicker, getPicker, STANDARD_PALETTE } from '../../components/ColorPicker';
import '../../components/ColorPicker/colorPicker.css';

function getModelBox(hasRowHeader, hasRowFooter) {
        let _this = this;

        const _el1 = document.querySelector("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-modelList"); if (_el1) _el1.innerHTML = '';
        const _el2 = document.querySelector("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-modelCustom"); if (_el2) _el2.innerHTML = '';

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

        const _elModelList = document.querySelector("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-modelList"); if (_elModelList) _elModelList.insertAdjacentHTML('beforeend', modelListHtml);

        //自定义 模板
        let modelCustom = getCurrentFile()["luckysheet_alternateformat_save_modelCustom"];
        if(modelCustom != null && modelCustom !== null){
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

            const _elModelCustom = document.querySelector("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-modelCustom"); if (_elModelCustom) _elModelCustom.insertAdjacentHTML('beforeend', modelCustomHtml);
        }
    },
}

function init() {
        let _this = this;

        document.getElementById("luckysheet-modal-dialog-slider-alternateformat")?.remove();
        document.body.insertAdjacentHTML('beforeend', luckysheetAlternateformatHtml());
        luckysheetsizeauto();

        //关闭
        document.querySelector("#luckysheet-modal-dialog-slider-alternateformat .luckysheet-model-close-btn")?.addEventListener("click", function () {
            const _elAFD1 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAFD1) _elAFD1.style.display = 'none';
             luckysheetsizeauto();
         });

         //应用范围
        onNS(document, "focus.AFrangeInput", "#luckysheet-alternateformat-range input", function(){
            _this.rangefocus = true;
        });
        offNS("AFrangeInput");
        onNS(document, "blur.AFrangeInput", "#luckysheet-alternateformat-range input", function(){
            _this.rangefocus = false;
        });

        offNS("AFrangeInput");
        onNS(document, "keydown.AFrangeInput", "#luckysheet-alternateformat-range input", function(e){
            let rangeValue = this.value.trim();
            if(e.keyCode == 13){
                _this.update();
            }
        });
        offNS("AFrangeIcon");
        onNS(document, "click.AFrangeIcon", "#luckysheet-alternateformat-range .fa-table", function(){
            const _elAFD2 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAFD2) _elAFD2.style.display = 'none';
            luckysheetsizeauto();

            let rangeValue = this.closest("#luckysheet-alternateformat-range").querySelector("input").value.trim();
            _this.rangeDialog(rangeValue);
        });
        offNS("AFrDCf");
        onNS(document, "click.AFrDCf", "#luckysheet-alternateformat-rangeDialog-confirm", function(){
            let rangeValue = this.closest("#luckysheet-alternateformat-rangeDialog").querySelector("input").value.trim();
            document.querySelector("#luckysheet-modal-dialog-slider-alternateformat #luckysheet-alternateformat-range input").value = rangeValue;

            const _rd1 = this.closest("#luckysheet-alternateformat-rangeDialog"); if (_rd1) _rd1.style.display = 'none';
            const _elAFDShow1 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAFDShow1) _elAFDShow1.style.display = '';
            luckysheetsizeauto();

            _this.update();
        });
        offNS("AFrDCl");
        onNS(document, "click.AFrDCl", "#luckysheet-alternateformat-rangeDialog-close", function(){
            const _rd2 = this.closest("#luckysheet-alternateformat-rangeDialog"); if (_rd2) _rd2.style.display = 'none';
            const _elAFDShow2 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAFDShow2) _elAFDShow2.style.display = '';
            luckysheetsizeauto();
        });
        offNS("AFrDTitle");
        onNS(document, "click.AFrDTitle", "#luckysheet-alternateformat-rangeDialog .luckysheet-modal-dialog-title-close", function(){
            const _rd3 = this.closest("#luckysheet-alternateformat-rangeDialog"); if (_rd3) _rd3.style.display = 'none';
            const _elAFDShow3 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAFDShow3) _elAFDShow3.style.display = '';
            luckysheetsizeauto();
        });

        //页眉、页脚选中
        offNS("AFrowHeader");
        onNS(document, "change.AFrowHeader", "#luckysheet-alternateformat-rowHeader", function(){
            let hasRowHeader;
            if(this.checked){
                hasRowHeader = true;
            }
            else{
                hasRowHeader = false;   
            }

            let hasRowFooter;
            if(document.getElementById("luckysheet-alternateformat-rowFooter")?.checked){
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
            if(document.getElementById("luckysheet-alternateformat-rowHeader")?.checked){
                hasRowHeader = true;
            }
            else{
                hasRowHeader = false;   
            }

            let hasRowFooter;
            if(this.checked){
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
            let index = Array.from(this.parentElement.children).indexOf(this);
            let $id = this.closest(".cf")?.getAttribute("id");

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
            let $parent = this.closest(".toningbox");

            let colorType, currenColor;
            if(this.querySelector(".luckysheet-icon-img")?.classList?.contains("luckysheet-icon-text-color")){
                colorType = "fc";
                currenColor = $parent?.querySelector(".toningShow")?.dataset.fc;
            }
            else if(this.querySelector(".luckysheet-icon-img")?.classList?.contains("luckysheet-icon-cell-color")){
                colorType = "bc";
                currenColor = $parent?.querySelector(".toningShow")?.dataset.bc;
            }

            //source
            let source;
            if($parent?.classList?.contains("header")){
                source = "0";
            }
            else if($parent?.classList?.contains("ctOne")){
                source = "1";
            }
            else if($parent?.classList?.contains("ctTwo")){
                source = "2";
            }
            else if($parent?.classList?.contains("footer")){
                source = "3";
            }

            _this.colorSelectDialog(currenColor, colorType, source);
        });

        //选择颜色 确定 添加自定义模板
        offNS("AFselectColorConfirm");
        onNS(document, "click.AFselectColorConfirm", "#luckysheet-alternateformat-colorSelect-dialog-confirm", function(){
            let $parent = this.closest("#luckysheet-alternateformat-colorSelect-dialog");
            const _locale = locale()
            const alternatingColors =_locale.alternatingColors;
            hideModalMask();
            if ($parent) $parent.style.display = 'none';

            //获取currenColor colorType source
            let currenColor = $parent?.querySelector(".currenColor span")?.getAttribute("title");

            let colorType;
            if($parent?.querySelector(".luckysheet-modal-dialog-title-text")?.textContent == alternatingColors.selectionTextColor){
                colorType = "fc";
            }
            else if($parent?.querySelector(".luckysheet-modal-dialog-title-text")?.textContent == alternatingColors.selectionCellColor){
                colorType = "bc";
            }

            let source = $parent?.querySelector(".currenColor")?.getAttribute("data-source");
            
            //赋给颜色
            if(source == "0"){
                if(colorType == "fc"){
                    const _hdrShow = document.querySelector("#luckysheet-alternateformat-modelToning .header .toningShow"); if (_hdrShow) { _hdrShow.style.color = currenColor; _hdrShow.dataset.fc = currenColor; }
                    const _hdrInd = document.querySelector("#luckysheet-alternateformat-modelToning .header .luckysheet-icon-text-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_hdrInd) _hdrInd.style.borderBottomColor = currenColor;
                }
                if(colorType == "bc"){
                    const _hdrShow2 = document.querySelector("#luckysheet-alternateformat-modelToning .header .toningShow"); if (_hdrShow2) { _hdrShow2.style.backgroundColor = currenColor; _hdrShow2.dataset.bc = currenColor; }
                    const _hdrInd2 = document.querySelector("#luckysheet-alternateformat-modelToning .header .luckysheet-icon-cell-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_hdrInd2) _hdrInd2.style.borderBottomColor = currenColor;
                }
            }
            else if(source == "1"){
                if(colorType == "fc"){
                    const _oneShow = document.querySelector("#luckysheet-alternateformat-modelToning .ctOne .toningShow"); if (_oneShow) { _oneShow.style.color = currenColor; _oneShow.dataset.fc = currenColor; }
                    const _oneInd = document.querySelector("#luckysheet-alternateformat-modelToning .ctOne .luckysheet-icon-text-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_oneInd) _oneInd.style.borderBottomColor = currenColor;
                }
                if(colorType == "bc"){
                    const _oneShow2 = document.querySelector("#luckysheet-alternateformat-modelToning .ctOne .toningShow"); if (_oneShow2) { _oneShow2.style.backgroundColor = currenColor; _oneShow2.dataset.bc = currenColor; }
                    const _oneInd2 = document.querySelector("#luckysheet-alternateformat-modelToning .ctOne .luckysheet-icon-cell-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_oneInd2) _oneInd2.style.borderBottomColor = currenColor;
                }
            }
            else if(source == "2"){
                if(colorType == "fc"){
                    const _twoShow = document.querySelector("#luckysheet-alternateformat-modelToning .ctTwo .toningShow"); if (_twoShow) { _twoShow.style.color = currenColor; _twoShow.dataset.fc = currenColor; }
                    const _twoInd = document.querySelector("#luckysheet-alternateformat-modelToning .ctTwo .luckysheet-icon-text-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_twoInd) _twoInd.style.borderBottomColor = currenColor;
                }
                if(colorType == "bc"){
                    const _twoShow2 = document.querySelector("#luckysheet-alternateformat-modelToning .ctTwo .toningShow"); if (_twoShow2) { _twoShow2.style.backgroundColor = currenColor; _twoShow2.dataset.bc = currenColor; }
                    const _twoInd2 = document.querySelector("#luckysheet-alternateformat-modelToning .ctTwo .luckysheet-icon-cell-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_twoInd2) _twoInd2.style.borderBottomColor = currenColor;
                }
            }
            else if(source == "3"){
                if(colorType == "fc"){
                    const _footShow = document.querySelector("#luckysheet-alternateformat-modelToning .footer .toningShow"); if (_footShow) { _footShow.style.color = currenColor; _footShow.dataset.fc = currenColor; }
                    const _footInd = document.querySelector("#luckysheet-alternateformat-modelToning .footer .luckysheet-icon-text-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_footInd) _footInd.style.borderBottomColor = currenColor;
                }
                if(colorType == "bc"){
                    const _footShow2 = document.querySelector("#luckysheet-alternateformat-modelToning .footer .toningShow"); if (_footShow2) { _footShow2.style.backgroundColor = currenColor; _footShow2.dataset.bc = currenColor; }
                    const _footInd2 = document.querySelector("#luckysheet-alternateformat-modelToning .footer .luckysheet-icon-cell-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_footInd2) _footInd2.style.borderBottomColor = currenColor;
                }
            }
            
            //若模板聚焦在固有模板，则新加模板；若模板聚焦在自定义模板，则修改该模板
            let hasRowHeader;
            if(document.getElementById("luckysheet-alternateformat-rowHeader")?.checked){
                hasRowHeader = true;
            }
            else{
                hasRowHeader = false;   
            }

            let hasRowFooter;
            if(document.getElementById("luckysheet-alternateformat-rowFooter")?.checked){
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
            let dataIndex = this.dataset.index;

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
            const _elAFD3 = document.getElementById("luckysheet-modal-dialog-slider-alternateformat"); if (_elAFD3) _elAFD3.style.display = 'none';

            luckysheetsizeauto();
        });
    },
}

function perfect() {
        let _this = this;

        let range = structuredClone(Store.luckysheet_select_save[0]);
        let existsIndex = _this.rangeIsExists(range)[1];
        
        let obj = structuredClone(getCurrentFile()["luckysheet_alternateformat_save"][existsIndex]);
        
        //应用范围
        let cellrange = obj["cellrange"];
        const _elRangeInput = document.querySelector("#luckysheet-alternateformat-range input"); if (_elRangeInput) _elRangeInput.value = getRangetxt(Store.currentSheetIndex, { "row": cellrange["row"], "column": cellrange["column"] }, Store.currentSheetIndex);
        
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
        document.getElementById("luckysheet-alternateformat-remove")?.setAttribute("data-index", existsIndex);
    },
}

function checkboxChange(hasRowHeader, hasRowFooter) {
        if(hasRowHeader){
            const _elRH = document.getElementById("luckysheet-alternateformat-rowHeader"); if (_elRH) _elRH.checked = true;
            document.querySelectorAll("#luckysheet-alternateformat-modelToning .header").forEach(el => el.style.display = '');
        }
        else{
            const _elRH2 = document.getElementById("luckysheet-alternateformat-rowHeader"); if (_elRH2) _elRH2.removeAttribute("checked");  
            document.querySelectorAll("#luckysheet-alternateformat-modelToning .header").forEach(el => el.style.display = 'none');
        }

        if(hasRowFooter){
            const _elRF = document.getElementById("luckysheet-alternateformat-rowFooter"); if (_elRF) _elRF.checked = true;
            document.querySelectorAll("#luckysheet-alternateformat-modelToning .footer").forEach(el => el.style.display = '');
        }
        else{
            const _elRF2 = document.getElementById("luckysheet-alternateformat-rowFooter"); if (_elRF2) _elRF2.removeAttribute("checked"); 
            document.querySelectorAll("#luckysheet-alternateformat-modelToning .footer").forEach(el => el.style.display = 'none');  
        }

        this.getModelBox(hasRowHeader, hasRowFooter);
    },
}

function modelboxOn() {
        let _this = this;

        //模板 foucs
        document.querySelector("#luckysheet-modal-dialog-slider-alternateformat .modelbox")?.classList.remove("on");

        let index = _this.modelfocusIndex;
        let len = _this.FixedModelColor.length;
        
        if(index < len){
            const _modelList = document.querySelector("#luckysheet-alternateformat-modelList .modelbox"); if (_modelList) _modelList[index].classList.add("on");
        }
        else{
            const _modelCustom = document.querySelector("#luckysheet-alternateformat-modelCustom .modelbox"); if (_modelCustom) _modelCustom[index - len].classList.add("on");
        }

        //编辑 对应颜色改变
        _this.modelToningColor();
    },
}

function modelToningColor() {
        let format = this.getFormatByIndex();

        //页眉
        const _hdrShow = document.querySelector("#luckysheet-alternateformat-modelToning .header .toningShow"); if (_hdrShow) { Object.assign(_hdrShow.style, {"color": format["head"].fc, "background-color": format["head"].bc}); Object.assign(_hdrShow.dataset, {fc: format["head"].fc, bc: format["head"].bc}); }
        const _hdrFcInd = document.querySelector("#luckysheet-alternateformat-modelToning .header .luckysheet-icon-text-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_hdrFcInd) _hdrFcInd.style.borderBottomColor = format["head"].fc;
        const _hdrBcInd = document.querySelector("#luckysheet-alternateformat-modelToning .header .luckysheet-icon-cell-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_hdrBcInd) _hdrBcInd.style.borderBottomColor = format["head"].bc;

        //颜色1
        const _oneShow = document.querySelector("#luckysheet-alternateformat-modelToning .ctOne .toningShow"); if (_oneShow) { Object.assign(_oneShow.style, {"color": format["one"].fc, "background-color": format["one"].bc}); Object.assign(_oneShow.dataset, {fc: format["one"].fc, bc: format["one"].bc}); }
        const _oneFcInd = document.querySelector("#luckysheet-alternateformat-modelToning .ctOne .luckysheet-icon-text-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_oneFcInd) _oneFcInd.style.borderBottomColor = format["one"].fc;
        const _oneBcInd = document.querySelector("#luckysheet-alternateformat-modelToning .ctOne .luckysheet-icon-cell-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_oneBcInd) _oneBcInd.style.borderBottomColor = format["one"].bc;

        //颜色2
        const _twoShow = document.querySelector("#luckysheet-alternateformat-modelToning .ctTwo .toningShow"); if (_twoShow) { Object.assign(_twoShow.style, {"color": format["two"].fc, "background-color": format["two"].bc}); Object.assign(_twoShow.dataset, {fc: format["two"].fc, bc: format["two"].bc}); }
        const _twoFcInd = document.querySelector("#luckysheet-alternateformat-modelToning .ctTwo .luckysheet-icon-text-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_twoFcInd) _twoFcInd.style.borderBottomColor = format["two"].fc;
        const _twoBcInd = document.querySelector("#luckysheet-alternateformat-modelToning .ctTwo .luckysheet-icon-cell-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_twoBcInd) _twoBcInd.style.borderBottomColor = format["two"].bc;

        //页脚
        const _footShow = document.querySelector("#luckysheet-alternateformat-modelToning .footer .toningShow"); if (_footShow) { Object.assign(_footShow.style, {"color": format["foot"].fc, "background-color": format["foot"].bc}); Object.assign(_footShow.dataset, {fc: format["foot"].fc, bc: format["foot"].bc}); }
        const _footFcInd = document.querySelector("#luckysheet-alternateformat-modelToning .footer .luckysheet-icon-text-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_footFcInd) _footFcInd.style.borderBottomColor = format["foot"].fc;
        const _footBcInd = document.querySelector("#luckysheet-alternateformat-modelToning .footer .luckysheet-icon-cell-color")?.closest(".luckysheet-color-menu-button-indicator"); if (_footBcInd) _footBcInd.style.borderBottomColor = format["foot"].bc;
    },
}

function addCustomModel(format) {
        let file = getCurrentFile();

        if(file["luckysheet_alternateformat_save_modelCustom"] == null){
            file["luckysheet_alternateformat_save_modelCustom"] = [];
        }

        file["luckysheet_alternateformat_save_modelCustom"].push(format);

    },
}

function colorSelectDialog(currenColor, colorType, source) {
        showModalMask();
        document.getElementById("luckysheet-alternateformat-colorSelect-dialog")?.remove();

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
        let _dialog = document.getElementById("luckysheet-alternateformat-colorSelect-dialog");
        const _dlgContent = _dialog?.querySelector(".luckysheet-modal-dialog-content"); if (_dlgContent) _dlgContent.style.minWidth = '300px';
        let myh = _dialog.offsetHeight,
            myw = _dialog.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        const _csDlg = document.getElementById("luckysheet-alternateformat-colorSelect-dialog");
        if (_csDlg) {
            Object.assign(_csDlg.style, {
                "left": (winw + scrollLeft - myw) / 2,
                "top": (winh + scrollTop - myh) / 3
            });
            _csDlg.style.display = '';
        }
        
        //初始化选择颜色插件
        createColorPicker(document.getElementById("luckysheet-alternateformat-colorSelect-dialog")?.querySelector(".colorshowbox"), {
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

                const _span = document.querySelector("#luckysheet-alternateformat-colorSelect-dialog .currenColor span"); if (_span) { _span.setAttribute("title", color); _span.style.backgroundColor = color; }
            },
            change: function(color){
                if (color != null) {
                    color = color.toHexString();
                }
                else {
                    color = "#000";
                }

                const _span2 = document.querySelector("#luckysheet-alternateformat-colorSelect-dialog .currenColor span"); if (_span2) { _span2.setAttribute("title", color); _span2.style.backgroundColor = color; }
            }
        });
}

function rangeDialog(value) {
        hideModalMask();
        document.getElementById("luckysheet-alternateformat-rangeDialog")?.remove();

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
        let _dialog2 = document.getElementById("luckysheet-alternateformat-rangeDialog");
        const _dlg2Content = _dialog2?.querySelector(".luckysheet-modal-dialog-content"); if (_dlg2Content) _dlg2Content.style.minWidth = '300px';
        let myh = _dialog2.offsetHeight,
            myw = _dialog2.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        const _rdDlg = document.getElementById("luckysheet-alternateformat-rangeDialog");
        if (_rdDlg) {
            Object.assign(_rdDlg.style, {
                "left": (winw + scrollLeft - myw) / 2,
                "top": (winh + scrollTop - myh) / 3
            });
            _rdDlg.style.display = '';
        }
    },
}

export { getModelBox, init, perfect, checkboxChange, modelboxOn, modelToningColor, addCustomModel, colorSelectDialog, rangeDialog };
