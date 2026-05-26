import sheetmanage from './sheetmanage';
import conditionformat from './conditionformat';
import luckysheetPostil from './postil';
import imageCtrl from './imageCtrl';
import hyperlinkCtrl from './hyperlinkCtrl';
import {zoomRefreshView,zoomNumberDomBind} from './zoom';
import { createFilter, createFilterOptions, labelFilterOptionState } from './filter';
import formula from '../global/formula';
import json from '../global/json';
import cleargridelement from '../global/cleargridelement';
import { 
    jfrefreshgrid, 
    jfrefreshgridall, 
    jfrefreshrange, 
    jfrefreshgrid_rhcw, 
    jfrefreshgrid_adRC,
    jfrefreshgrid_deleteCell,
    jfrefreshgrid_pastcut,
    luckysheetrefreshgrid 
} from '../global/refresh';
import { getSheetIndex } from '../methods/get';
import Store from '../store';
import { selectHightlightShow } from './select';
import method from '../global/method';

function formulaHistoryHanddler(ctr, type="redo"){
    if(ctr==null){
        return;
    }

    let data = ctr.data;
    if(type=="undo"){
        data = ctr.curdata;
    }
    for(let s = 0; s < ctr.range.length; s++){
        let st_r = ctr.range[s].row[0];
        let ed_r = ctr.range[s].row[1];
        let st_c = ctr.range[s].column[0];
        let ed_c = ctr.range[s].column[1];

        for(let r = st_r;r < ed_r + 1; r++){
            for(let c = st_c; c < ed_c +1; c++){
                if(r > data.length - 1){
                    break;
                }
                // formula.execFunctionExist.push({ "r": r, "c": c, "i": ctr.sheetIndex });
                if(data[r][c] == null || data[r][c].f==null || data[r][c].f==""){
                    formula.delFunctionGroup(r,c,ctr.sheetIndex);
                }
                else if(data[r][c] != null && data[r][c].f!=null && data[r][c].f.length>0){
                    formula.insertUpdateFunctionGroup(r,c,ctr.sheetIndex);
                }
            }
        }
    }
}

const controlHistory = {
    redo: function (e) {
        if (Store.jfredo.length == 0) {
            return;
        }

        let ctr = Store.jfredo.pop();
        Store.jfundo.push(ctr);
        Store.clearjfundo = false;
        
        if (sheetmanage.hasSheet(ctr.sheetIndex) && Store.currentSheetIndex != ctr.sheetIndex) {
            sheetmanage.changeSheetExec(ctr.sheetIndex);
        }

        // formula.execFunctionExist = [];

        if (ctr.type == "datachange") {
            //如果有单元格为null,则对应公式应该删除
            formulaHistoryHanddler(ctr);
            
            let allParam = {
                "cfg": ctr.config,
                "RowlChange": ctr.RowlChange,
                "cdformat": ctr.cdformat,
                "dynamicArray": ctr.dynamicArray,
                "hyperlink": ctr.hyperlink,
            }
            //防止协同编辑时选区错误
           // jfrefreshgrid(ctr.data, ctr.range, allParam);

            /* ⚠️  这个🌶️  dataRange表示的才是数据更新的位置 */
            jfrefreshgrid(ctr.data, ctr.dataRange, allParam);

            // formula.execFunctionGroup(null, null, null, null, ctr.data);//取之前的数据
        }
        else if (ctr.type == "pasteCut") {
            let s = {
                "sheetIndex": ctr.source["sheetIndex"],
                "data": ctr.source["curData"],
                "curData": ctr.source["data"],
                "config": ctr.source["curConfig"],
                "curConfig": ctr.source["config"],
                "cdformat": ctr.source["curCdformat"],
                "curCdformat": ctr.source["cdformat"],
                "range": ctr.source["range"]
            }
            let t = {
                "sheetIndex": ctr.target["sheetIndex"],
                "data": ctr.target["curData"],
                "curData": ctr.target["data"],
                "config": ctr.target["curConfig"],
                "curConfig": ctr.target["config"],
                "cdformat": ctr.target["curCdformat"],
                "curCdformat": ctr.target["cdformat"],
                "range": ctr.target["range"]
            }
            jfrefreshgrid_pastcut(s, t, ctr.RowlChange);
        }
        else if (ctr.type == "rangechange") {
            //如果有单元格为null,则对应公式应该删除
            formulaHistoryHanddler(ctr);
            
            jfrefreshrange(ctr.data, ctr.range, ctr.cdformat);
            // formula.execFunctionGroup(null, null, null, null, ctr.data);//取之前的数据
        }
        else if (ctr.type == "resize") {
            Store.config = ctr.config;
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].config = Store.config;

            if(ctr.ctrlType == "resizeR"){
            }
            else if(ctr.ctrlType == "resizeC"){
            }

            let images = $.extend(true, {}, ctr.images);
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].images = images;
            imageCtrl.images = images;
            imageCtrl.allImagesShow();

            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
        else if (ctr.type == "cellRowChange") {
            jfrefreshgridall(ctr.data[0].length, ctr.data.length, ctr.data, ctr.config, ctr.range, ctr.ctrlType, ctr.ctrlValue, ctr.cdformat);
        }
        else if (ctr.type == "extend") {
            jfrefreshgridall(ctr.data[0].length, ctr.data.length, ctr.data, ctr.config, ctr.range, "dele", ctr.ctrlValue);
        }
        else if (ctr.type == "dele") {
            let ctrlValue1 = $.extend(true, {}, ctr.ctrlValue);
            ctrlValue1.restore = true;
            jfrefreshgridall(ctr.data[0].length, ctr.data.length, ctr.data, ctr.config, ctr.range, "extend", ctrlValue1);
        }
        else if (ctr.type == "addRC") { //增加行列撤销操作
            let ctrlValue = $.extend(true, {}, ctr.ctrlValue);
            if(ctrlValue.direction == "rightbottom"){
                ctrlValue.index = ctrlValue.index + 1;
            }

            jfrefreshgrid_adRC(
                ctr.data, 
                ctr.config, 
                "delRC", 
                ctrlValue, 
                ctr.calc, 
                ctr.filterObj, 
                ctr.cf, 
                ctr.af, 
                ctr.freezen,
                ctr.hyperlink
            );
        }
        else if (ctr.type == "delRC") { //删除行列撤销操作
            let ctrlValue = $.extend(true, {}, ctr.ctrlValue);
            ctrlValue.restore = true;
            ctrlValue.direction = "lefttop";

            jfrefreshgrid_adRC(
                ctr.data, 
                ctr.config, 
                "addRC", 
                ctrlValue, 
                ctr.calc, 
                ctr.filterObj, 
                ctr.cf, 
                ctr.af, 
                ctr.freezen,
                ctr.hyperlink
            );
        }
        else if (ctr.type == "deleteCell") { //删除单元格撤销操作
            jfrefreshgrid_deleteCell(
                ctr.data, 
                ctr.config, 
                ctr.ctrl, 
                ctr.calc, 
                ctr.filterObj, 
                ctr.cf,
                ctr.hyperlink
            );
        }
        else if (ctr.type == "showHidRows") { // 隐藏、显示行 撤销操作
            //config
            Store.config = ctr.config;
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].config = ctr.config;
        
        
            //行高、列宽 刷新  
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
        else if (ctr.type == "showHidCols") { // 隐藏、显示列 撤销操作
            //config
            Store.config = ctr.config;
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].config = ctr.config;
        
        
            //行高、列宽 刷新  
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
        else if (ctr.type == "datachangeAll") {
            formula.execFunctionGroup();
            jfrefreshgridall(ctr.data[0].length, ctr.data.length, ctr.data, null, ctr.range, "datachangeAll", ctr.ctrlValue);
        }
        else if (ctr.type == "datachangeAll_filter_clear") {
            createFilterOptions(ctr.filter_save);

            $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").each(function(i){
                let $top = $(this);
                let item = ctr.optiongroups[i];
                labelFilterOptionState($top, item.optionstate, item.rowhidden, item.caljs, false, item.st_r, item.ed_r, item.cindex, item.st_c, item.ed_c);
            });


            //config
            Store.config = ctr.config;
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

            if(Store.config["rowhidden"] == null){
                Store.config["rowhidden"] = {};
            }


            //行高、列宽 刷新  
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);

            $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();
        }
        else if (ctr.type == "datachangeAll_filter") {
            let $top = $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").eq(ctr["optionsindex"]);
            let st_r = $top.data("str"), 
                ed_r = $top.data("edr"), 
                cindex = $top.data("cindex"), 
                st_c = $top.data("stc"), 
                ed_c = $top.data("edc");

            labelFilterOptionState($top, json.hasKey(ctr.rowhidenPre), ctr.rowhidenPre, ctr.caljs, true, st_r, ed_r, cindex, st_c, ed_c);

            //config
            Store.config = ctr.config;
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

            if(Store.config["rowhidden"] == null){
                Store.config["rowhidden"] = {};
            }


            //行高、列宽 刷新  
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
            
            $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();
        }
        else if (ctr.type == "filtershow") {
            $('#luckysheet-filter-selected-sheet' + ctr.sheetIndex + ', #luckysheet-filter-options-sheet' + ctr.sheetIndex).remove();
            
        }
        else if (ctr.type == "addSheet") {
            sheetmanage.deleteSheet(ctr.index);
            sheetmanage.changeSheetExec(ctr.currentSheetIndex);
            $("#luckysheet-input-box").removeAttr("style");
            $("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").hide();
        }
        else if (ctr.type == "copySheet") {
            sheetmanage.deleteSheet(ctr.index);
            sheetmanage.changeSheetExec(ctr.copyindex);
        }
        else if (ctr.type == "deleteSheet") {
            let isDupName = false;

            for(let i = 0; i < Store.luckysheetfile.length; i++){
                if(Store.luckysheetfile[i].name == ctr.name){
                    isDupName = true;
                }
            }

            if(!isDupName){
                sheetmanage.createSheetbydata(ctr, "isrenew");
                $("#luckysheet-input-box").removeAttr("style");
                $("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").hide();
            }
        }
        else if (ctr.type == "sheetName") {
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].name = ctr.oldtxt;
            $("#luckysheet-sheets-item" + ctr.sheetIndex).find(".luckysheet-sheets-item-name").html(ctr.oldtxt);

        }
        else if (ctr.type == "sheetColor") {
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].color = ctr.oldcolor;
            
            let luckysheetcurrentSheetitem = $("#luckysheet-sheets-item" + ctr.sheetIndex);
            luckysheetcurrentSheetitem.find(".luckysheet-sheets-item-color").remove();

            if(ctr.oldcolor != null){
                luckysheetcurrentSheetitem.append('<div class="luckysheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' + ctr.oldcolor + ';"></div>');
            }

        }
        else if (ctr.type == "mergeChange") {
            let allParam = {
                "cfg": ctr.config,
                calc: ctr.calc,
                hyperlink: ctr.hyperlink,
            }

            jfrefreshgrid(ctr.data, ctr.range, allParam);
        }
        else if (ctr.type == "updateHyperlink"){
            hyperlinkCtrl.ref(ctr.currentHyperlink, ctr.historyHyperlink, ctr.sheetIndex, ctr.data, ctr.range);
        }
        else if (ctr.type == "updateCF"){
            let historyRules = ctr["data"]["historyRules"];

            for(let i = 0; i < historyRules.length; i++){
                //条件规则
                let sheetIndex = historyRules[i]["sheetIndex"];
                Store.luckysheetfile[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"] = historyRules[i]["luckysheet_conditionformat_save"];
            
            }

            //刷新一次表格
            conditionformat.ref();
        }
        else if (ctr.type == "updateAF"){
            let historyRules = ctr["data"]["historyRules"];

            let index = getSheetIndex(ctr["sheetIndex"]);

            Store.luckysheetfile[index]["luckysheet_alternateformat_save"] = $.extend(true, [], historyRules);

            setTimeout(function () {
                luckysheetrefreshgrid();
            }, 1);
        }
        else if (ctr.type == "borderChange"){
            if(ctr.config["borderInfo"] == null){
            }
            else{
            }

            Store.config = ctr.config;
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].config = Store.config;

            setTimeout(function () {
                luckysheetrefreshgrid();
            }, 1);
        }
        else if (ctr.type == "postil"){
            luckysheetPostil.ref(ctr.data, ctr.rc);

            for(let i = 0; i < ctr.rc.length; i++){
                let r = ctr.rc[i].split("_")[0];
                let c = ctr.rc[i].split("_")[1];

                if(ctr.data[r][c] != null && ctr.data[r][c].ps != null){
                    luckysheetPostil.buildPs(r, c, ctr.data[r][c].ps);
                }
                else{
                    luckysheetPostil.buildPs(r, c, null);
                }
            }
        }
        else if (ctr.type == "imageCtrl"){
            imageCtrl.images = $.extend(true, {}, ctr.images);
            imageCtrl.allImagesShow();
            imageCtrl.ref();
        }
        else if (ctr.type=="zoomChange"){
            Store.zoomRatio = ctr.zoomRatio;
            zoomNumberDomBind();
            zoomRefreshView();
        }
        
        cleargridelement(e);
        if (ctr.range) {
            //使用深复制
            Store.luckysheet_select_save = $.extend(true, [],ctr.range);
            selectHightlightShow();
        }
        Store.clearjfundo = true;

        // 撤销的时候curdata 跟 data 数据要调换一下
        let newCtr = {...ctr, ...{data: ctr.curdata, curdata: ctr.data}}
        // 钩子函数
        method.createHookFunction('updated', newCtr)
        
    },
    undo: function () {
        if (Store.jfundo.length == 0) {
            return;
        }

        let ctr = Store.jfundo.pop();
        Store.jfredo.push(ctr);
        Store.clearjfundo = false;

        if (sheetmanage.hasSheet(ctr.sheetIndex) && Store.currentSheetIndex != ctr.sheetIndex) {
            sheetmanage.changeSheetExec(ctr.sheetIndex);
        }

        if (ctr.type == "datachange") {
            formula.execFunctionGroup();

            let allParam = {
                "cfg": ctr.curConfig,
                "RowlChange": ctr.RowlChange,
                "cdformat": ctr.curCdformat,
                "dynamicArray": ctr.curDynamicArray,
                "hyperlink": ctr.curHyperlink,
            }

            formulaHistoryHanddler(ctr, "undo");

            //防止协同编辑时选区错误
            jfrefreshgrid(ctr.curdata, ctr.range, allParam);
        }
        else if (ctr.type == "pasteCut") {
            jfrefreshgrid_pastcut(ctr.source, ctr.target, ctr.RowlChange);
        }
        else if (ctr.type == "rangechange") {
            // formula.execFunctionGroup();
            formulaHistoryHanddler(ctr, "undo");
            jfrefreshrange(ctr.curdata, ctr.range, ctr.curCdformat);
        }
        else if (ctr.type == "resize") {
            Store.config = ctr.curconfig;
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].config = Store.config;

            if(ctr.ctrlType == "resizeR"){
            }
            else if(ctr.ctrlType == "resizeC"){
            }

            let images = $.extend(true, {}, ctr.curImages);
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].images = images;
            imageCtrl.images = images;
            imageCtrl.allImagesShow();

            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
        else if (ctr.type == "cellRowChange") {
            jfrefreshgridall(ctr.curdata[0].length, ctr.curdata.length, ctr.curdata, ctr.curconfig, ctr.currange, ctr.ctrlType, ctr.ctrlValue, ctr.curCdformat);
        }
        else if (ctr.type == "extend") {
            jfrefreshgridall(ctr.curdata[0].length, ctr.curdata.length, ctr.curdata, ctr.curconfig, ctr.currange, ctr.ctrlType, ctr.ctrlValue);
        }
        else if (ctr.type == "dele") {
            let ctrlValue1 = $.extend(true, {}, ctr.ctrlValue);
            ctrlValue1.restore = true;
            jfrefreshgridall(ctr.curdata[0].length, ctr.curdata.length, ctr.curdata, ctr.curconfig, ctr.currange, ctr.ctrlType, ctr.ctrlValue);
        }
        else if (ctr.type == "addRC") { //增加行列重做操作
            jfrefreshgrid_adRC(
                ctr.curData, 
                ctr.curConfig, 
                "addRC", 
                ctr.ctrlValue, 
                ctr.curCalc, 
                ctr.curFilterObj, 
                ctr.curCf, 
                ctr.curAf, 
                ctr.curFreezen,
                ctr.curHyperlink
            );
        }
        else if (ctr.type == "delRC") { //删除行列重做操作
            jfrefreshgrid_adRC(
                ctr.curData, 
                ctr.curConfig, 
                "delRC", 
                ctr.ctrlValue, 
                ctr.curCalc, 
                ctr.curFilterObj, 
                ctr.curCf, 
                ctr.curAf, 
                ctr.curFreezen,
                ctr.curHyperlink
            );
        }
        else if (ctr.type == "deleteCell") { //删除单元格重做操作
            jfrefreshgrid_deleteCell(
                ctr.curData, 
                ctr.curConfig, 
                ctr.ctrl, 
                ctr.curCalc, 
                ctr.curFilterObj, 
                ctr.curCf,
                ctr.curHyperlink
            );
        }
        else if (ctr.type == "showHidRows") { // 隐藏、显示行 重做操作
            //config
            Store.config = ctr.curconfig;
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].config = ctr.curconfig;
        
        
            //行高、列宽 刷新  
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
        else if (ctr.type == "showHidCols") { // 隐藏、显示列 重做操作
            //config
            Store.config = ctr.curconfig;
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].config = ctr.curconfig;
        
        
            //行高、列宽 刷新  
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
        else if (ctr.type == "datachangeAll") {
            formula.execFunctionGroup();
            jfrefreshgridall(ctr.curdata[0].length, ctr.curdata.length, ctr.curdata, null, ctr.currange, "datachangeAll", ctr.ctrlValue);
        }
        else if (ctr.type == "datachangeAll_filter_clear") {
            
            //config
            Store.config = ctr.curconfig;
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;


            //行高、列宽 刷新  
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
            

            $("#luckysheet-filter-menu .luckysheet-filter-selected-input").hide().find("input").val();
            $("#luckysheet-filter-selected span").data("type", "0").data("type", null).text("无");

            $('#luckysheet-filter-selected-sheet' + Store.currentSheetIndex + ', #luckysheet-filter-options-sheet' + Store.currentSheetIndex).remove();
            $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();
        }
        else if (ctr.type == "datachangeAll_filter") {
            let $top = $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").eq(ctr["optionsindex"]);
            let st_r = $top.data("str"), 
                ed_r = $top.data("edr"), 
                cindex = $top.data("cindex"), 
                st_c = $top.data("stc"), 
                ed_c = $top.data("edc");

            labelFilterOptionState($top, json.hasKey(ctr.rowhidden), ctr.rowhidden, ctr.caljs, true, st_r, ed_r, cindex, st_c, ed_c);

            //config
            Store.config = ctr.curconfig;
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;


            //行高、列宽 刷新  
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);

            $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();
        }
        else if (ctr.type == "filtershow") {
            Store.luckysheet_select_save = [ctr.filter_save];
            Store.filterchage = false;
            createFilter();
            Store.filterchage = true;
        }
        else if (ctr.type == "addSheet") {
            sheetmanage.createSheetbydata(ctr.sheetconfig);
            $("#luckysheet-input-box").removeAttr("style");
            $("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").hide();
        }
        else if (ctr.type == "copySheet") {
            sheetmanage.copySheet(ctr.copyindex);
        }
        else if (ctr.type == "deleteSheet") {
            sheetmanage.deleteSheet(ctr.index);

            if (ctr.order == 0) {
                sheetmanage.changeSheetExec(Store.luckysheetfile[0].index);
            }
            else {
                sheetmanage.changeSheetExec(Store.luckysheetfile[ctr.order - 1].index);
            }
            
            $("#luckysheet-input-box").removeAttr("style");
            $("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").hide();
        }
        else if (ctr.type == "sheetName") {
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].name = ctr.txt;
            $("#luckysheet-sheets-item" + ctr.sheetIndex).find(".luckysheet-sheets-item-name").html(ctr.txt);
            
        }
        else if (ctr.type == "sheetColor") {
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].color = ctr.color;

            let luckysheetcurrentSheetitem = $("#luckysheet-sheets-item" + ctr.sheetIndex);
            luckysheetcurrentSheetitem.find(".luckysheet-sheets-item-color").remove();
            
            if(ctr.color != null){
                luckysheetcurrentSheetitem.append('<div class="luckysheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' + ctr.color + ';"></div>');
            }
            
        }
        else if (ctr.type == "mergeChange") {
            let allParam = {
                "cfg": ctr.curConfig,
                calc: ctr.curCalc,
                hyperlink: ctr.curHyperlink,
            }

            jfrefreshgrid(ctr.curData, ctr.range, allParam);
        }
        else if (ctr.type == "updateHyperlink") {
            hyperlinkCtrl.ref(ctr.historyHyperlink, ctr.currentHyperlink, ctr.sheetIndex, ctr.curData, ctr.range);
        }
        else if (ctr.type == "updateCF"){
            let currentRules = ctr["data"]["currentRules"];

            for(let i = 0; i < currentRules.length; i++){
                //条件规则
                let sheetIndex = currentRules[i]["sheetIndex"];
                Store.luckysheetfile[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"] = currentRules[i]["luckysheet_conditionformat_save"];
                
            }

            //刷新一次表格
            conditionformat.ref();
        }
        else if (ctr.type == "updateAF"){
            let currentRules = ctr["data"]["currentRules"];

            let index = getSheetIndex(ctr["sheetIndex"]);

            Store.luckysheetfile[index]["luckysheet_alternateformat_save"] = $.extend(true, [], currentRules);

            setTimeout(function () {
                luckysheetrefreshgrid();
            }, 1);
        }
        else if (ctr.type == "borderChange"){

            Store.config = ctr.curconfig;
            Store.luckysheetfile[getSheetIndex(ctr.sheetIndex)].config = Store.config;

            setTimeout(function () {
                luckysheetrefreshgrid();
            }, 1);
        }
        else if (ctr.type == "postil"){
            luckysheetPostil.ref(ctr.curdata, ctr.rc);

            for(let i = 0; i < ctr.rc.length; i++){
                let r = ctr.rc[i].split("_")[0];
                let c = ctr.rc[i].split("_")[1];

                if(ctr.curdata[r][c] != null && ctr.curdata[r][c].ps != null){
                    luckysheetPostil.buildPs(r, c, ctr.curdata[r][c].ps);
                }
                else{
                    luckysheetPostil.buildPs(r, c, null);
                }
            }
        }
        else if (ctr.type == "imageCtrl"){
            imageCtrl.images = $.extend(true, {}, ctr.curImages);
            imageCtrl.allImagesShow();
            imageCtrl.ref();
        }
        else if (ctr.type=="zoomChange"){
            Store.zoomRatio = ctr.curZoomRatio;
            zoomNumberDomBind();
            zoomRefreshView();
        }

        if (ctr.range) {
            //使用深复制
            Store.luckysheet_select_save = $.extend(true, [],ctr.range);
            selectHightlightShow();
        }
        Store.clearjfundo = true;

    }
};

export default controlHistory;
