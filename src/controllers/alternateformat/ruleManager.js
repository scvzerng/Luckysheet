import Store from '../../store';
import { getRangetxt } from '../../methods/get';
import { getCurrentFile } from '../../utils/storeAccess.js';
import { isEditMode } from '../../global/validate';
import tooltip from '../../global/tooltip';
import { luckysheetrefreshgrid } from '../../global/refresh';
import { FixedModelColor } from './presetData';
import { checksAF, getComputeMap, compute } from './compute';

function getRangeMap(row, column) {
        let map = {};
        let st_r = row[0], ed_r = row[1], st_c = column[0], ed_c = column[1];
        
        for(let r = st_r; r <= ed_r; r++){
            for(let c = st_c; c <= ed_c; c++){
                map[r + "_" + c] = 0;
            }
        }
        
        return map;
    },
}

function rangeIsExists(range, index) {
        let _this = this;

        let isExists = false;
        let existsIndex = null;

        //获取已有交替颜色所有应用范围
        let AFarr = $.extend(true, [], getCurrentFile()["luckysheet_alternateformat_save"]);

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
}

function getIndexByFormat(format) {
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
}

function getFormatByIndex(modelfocusIndex) {
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
}

function newRule(cellrange, modelfocusIndex) {
        let _this = this;

        let format = _this.getFormatByIndex();

        let file = getCurrentFile();
        let ruleArr = file["luckysheet_alternateformat_save"];
        
        if(ruleArr == null){
            ruleArr = [];
        }

        //保存之前的规则
        let historyRules = $.extend(true, [], ruleArr);
        
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

        let currentRules = $.extend(true, [], ruleArr);
        
        //刷新一次表格
        _this.ref(historyRules, currentRules);

    },
}

function update(modelfocusIndex, rangefocus) {
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
        let historyRules = $.extend(true, [], ruleArr);
        
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

        let currentRules = $.extend(true, [], ruleArr);
        
        //刷新一次表格
        _this.ref(historyRules, currentRules);

    },
}

function ref(historyRules, currentRules) {
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
}

export { getRangeMap, rangeIsExists, getIndexByFormat, getFormatByIndex, newRule, update, ref };
