import {  isRealNull } from '../../global/validate';
import Store from '../../store';
import menuButton from '../menuButton';
import conditionformat from '../conditionformat';
import alternateformat from '../alternateformat';
import {  rgbTohex, isRowHidden } from '../../utils/util';
import { getCurrentFile, syncConfigToStore, getDataSize } from '../../utils/storeAccess.js';
import cleargridelement from '../../global/cleargridelement';
import {  jfrefreshgrid_rhcw  } from '../../global/refresh';
import json from '../../global/json';
import filterState from './filterState';
import { labelFilterOptionState } from './labelFilterOptionState';

export function filterColorEvents() {
    $("#luckysheet-filter-orderby-color").hover(
        function(){
            //遍历筛选列颜色
            let $menu = $("#luckysheet-filter-menu");
            let st_r = $menu.data("str"), 
                ed_r = $menu.data("edr"), 
                cindex = $menu.data("cindex"), 
                st_c = $menu.data("stc"), 
                ed_c = $menu.data("edc");
            let bgMap = {}; //单元格颜色
            let fcMap = {}; //字体颜色

            let af_compute = alternateformat.getComputeMap();
            let cf_compute = conditionformat.getComputeMap();

            for (let r = st_r + 1; r <= ed_r; r++) {
                let cell = Store.flowdata[r][cindex];

                //单元格颜色
                let bg = menuButton.checkstatus(Store.flowdata, r, cindex , "bg");

                if(bg == null){
                    bg = "#ffffff";
                }

                let checksAF = alternateformat.checksAF(r, cindex, af_compute);
                if(checksAF != null){//若单元格有交替颜色
                    bg = checksAF[1];
                }

                let checksCF = conditionformat.checksCF(r, cindex, cf_compute);
                if(checksCF != null && checksCF["cellColor"] != null){//若单元格有条件格式
                    bg = checksCF["cellColor"];
                }

                if(bg.indexOf("rgb") > -1){
                    bg = rgbTohex(bg);
                }

                if(bg.length == 4){
                    bg = bg.substr(0, 1) + bg.substr(1, 1).repeat(2) + bg.substr(2, 1).repeat(2) + bg.substr(3, 1).repeat(2);
                }

                //字体颜色
                let fc = menuButton.checkstatus(Store.flowdata, r, cindex , "fc");

                if(checksAF != null){//若单元格有交替颜色
                    fc = checksAF[0];
                }

                if(checksCF != null && checksCF["textColor"] != null){//若单元格有条件格式
                    fc = checksCF["textColor"];
                }

                if(fc.indexOf("rgb") > -1){
                    fc = rgbTohex(fc);
                }

                if(fc.length == 4){
                    fc = fc.substr(0, 1) + fc.substr(1, 1).repeat(2) + fc.substr(2, 1).repeat(2) + fc.substr(3, 1).repeat(2);
                }

                if(isRowHidden(r)){
                    bgMap[bg] = 1;

                    if(cell != null && !isRealNull(cell.v)){
                        fcMap[fc] = 1;
                    }
                }
                else{
                    bgMap[bg] = 0;

                    if(cell != null && !isRealNull(cell.v)){
                        fcMap[fc] = 0;
                    }
                }
            }
            //
            let filterBgColorHtml = '';
            if(JSON.stringify(bgMap).length > 2 && Object.keys(bgMap).length > 1){
                let bgColorItemHtml = '';
                for(let b in bgMap){
                    if(bgMap[b] == 0){
                        bgColorItemHtml += '<div class="item luckysheet-mousedown-cancel"><label class="luckysheet-mousedown-cancel" style="background-color: ' + b + '" title="' + b + '"></label><input class="luckysheet-mousedown-cancel" type="checkbox" checked="checked"/></div>';
                    }
                    else{
                        bgColorItemHtml += '<div class="item luckysheet-mousedown-cancel"><label class="luckysheet-mousedown-cancel" style="background-color: ' + b + '" title="' + b + '"></label><input class="luckysheet-mousedown-cancel" type="checkbox"/></div>';
                    }
                }
                filterBgColorHtml = '<div id="filterBgColor" class="box luckysheet-mousedown-cancel"><div class="title luckysheet-mousedown-cancel">'+filterState.locale_filter.filiterByColorTip+'</div><div style="max-height:128px;overflow:auto;" class="luckysheet-mousedown-cancel">' + bgColorItemHtml + '</div></div>';
            }

            let filterFcColorHtml = '';
            if(JSON.stringify(fcMap).length > 2 && Object.keys(fcMap).length > 1){
                let fcColorItemHtml = '';
                for(let f in fcMap){
                    if(fcMap[f] == 0){
                        fcColorItemHtml += '<div class="item luckysheet-mousedown-cancel"><label class="luckysheet-mousedown-cancel" style="background-color: ' + f + '" title="' + f + '"></label><input class="luckysheet-mousedown-cancel" type="checkbox" checked="checked"/></div>';
                    }
                    else{
                        fcColorItemHtml += '<div class="item luckysheet-mousedown-cancel"><label class="luckysheet-mousedown-cancel" style="background-color: ' + f + '" title="' + f + '"></label><input class="luckysheet-mousedown-cancel" type="checkbox"/></div>';
                    }
                }
                filterFcColorHtml = '<div id="filterFcColor" class="box luckysheet-mousedown-cancel"><div class="title luckysheet-mousedown-cancel">'+filterState.locale_filter.filiterByTextColorTip+'</div><div style="max-height:128px;overflow:auto;" class="luckysheet-mousedown-cancel">' + fcColorItemHtml + '</div></div>';
            }
            //
            let content;
            if(filterBgColorHtml == '' && filterFcColorHtml == ''){
                content = '<div class="luckysheet-mousedown-cancel" style="padding: 10px 30px;text-align: center;">'+filterState.locale_filter.filterContainerOneColorTip+'</div>';
            }
            else{
                content = filterBgColorHtml + filterFcColorHtml + '<div class="luckysheet-mousedown-cancel"><button id="luckysheet-filter-orderby-color-confirm" class="btn btn-primary luckysheet-mousedown-cancel" style="margin: 5px 20px;width: 70px;">'+filterState.locale_button.confirm+'</button></div>';
            }
            //颜色筛选子菜单
            $("#luckysheet-filter-orderby-color-submenu").remove();
            $("body").append('<div id="luckysheet-filter-orderby-color-submenu" class="luckysheet-cols-menu luckysheet-mousedown-cancel">'+content+'</div>');
            let $t = $("#luckysheet-filter-orderby-color-submenu").end();
            let $con = $(this).parent();
            let winW = $(window).width(), winH = $(window).height();
            let menuW = $con.width(), 
                myh = $t.height() + 25, 
                myw = $t.width() + 5;
            let offset = $(this).offset();
            let top = offset.top, left = offset.left + menuW;

            if (left + myw > winW) {
                left = offset.left - myw;
            }

            if (top + myh > winH) {
                top = winH - myh;
            }

            $("#luckysheet-filter-orderby-color-submenu").css({ "top": top, "left": left }).show();
        },
        function(){
            submenuhide = setTimeout(function () { $("#luckysheet-filter-orderby-color-submenu").hide(); }, 200);
        }
    );

    $(document).on("mouseover mouseleave", "#luckysheet-filter-orderby-color-submenu", function(e){
        if (e.type === "mouseover") {
            clearTimeout(submenuhide);
        } 
        else {
            $(this).hide();
        }
    });
    $(document).on("click", "#luckysheet-filter-orderby-color-submenu .item label", function(){
        $(this).siblings("input[type='checkbox']").click();
    });
    $(document).off("click.orderbyColorConfirm").on("click.orderbyColorConfirm", "#luckysheet-filter-orderby-color-submenu #luckysheet-filter-orderby-color-confirm", function(){
        let bg_colorMap = {};
        let fc_colorMap = {};

        $("#luckysheet-filter-orderby-color-submenu .item").each(function(i, e){
            if($(e).find("input[type='checkbox']").is(":checked")){
                let color = $(this).find("label").attr("title");
                let $id = $(this).closest(".box").attr("id");

                if($id == "filterBgColor"){
                    bg_colorMap[color] = 0;
                }
                else if($id == "filterFcColor"){
                    fc_colorMap[color] = 0;
                }
            }
        });

        let bg_filter;
        if($("#luckysheet-filter-orderby-color-submenu #filterBgColor").length > 0){
            bg_filter = true;
        }
        else{
            bg_filter = false;
        }

        let fc_filter;
        if($("#luckysheet-filter-orderby-color-submenu #filterFcColor").length > 0){
            fc_filter = true;
        }
        else{
            fc_filter = false;
        }

        let $menu = $("#luckysheet-filter-menu");
        let st_r = $menu.data("str"), 
            ed_r = $menu.data("edr"), 
            cindex = $menu.data("cindex"), 
            st_c = $menu.data("stc"), 
            ed_c = $menu.data("edc");

        let rowhiddenother = {}; //其它筛选列的隐藏行
        $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").not($("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").eq(cindex - st_c).get(0)).each(function () {
            let $t = $(this), rh = $t.data("rowhidden");

            if (rh == "") {
                return true;
            }

            rh = JSON.parse(rh);

            for (let r in rh) {
                rowhiddenother[r] = 0;
            }
        });

        let filterdata = {};
        let rowhidden = {};
        let caljs = {};

        let af_compute = alternateformat.getComputeMap();
        let cf_compute = conditionformat.getComputeMap();

        for (let r = st_r + 1; r <= ed_r; r++) {
            if(r in rowhiddenother){
                continue;
            }

            if(Store.flowdata[r] == null){
                continue;
            }

            let cell = Store.flowdata[r][cindex];

            //单元格颜色
            let bg = menuButton.checkstatus(Store.flowdata, r, cindex , "bg");

            let checksAF = alternateformat.checksAF(r, cindex, af_compute);
            if(checksAF != null){//若单元格有交替颜色
                bg = checksAF[1];
            }

            let checksCF = conditionformat.checksCF(r, cindex, cf_compute);
            if(checksCF != null && checksCF["cellColor"] != null){//若单元格有条件格式
                bg = checksCF["cellColor"];
            }

            // bg maybe null
            bg = bg == null ? '#ffffff' : bg;

            if(bg.indexOf("rgb") > -1){
                bg = rgbTohex(bg);
            }

            if(bg.length == 4){
                bg = bg.substr(0, 1) + bg.substr(1, 1).repeat(2) + bg.substr(2, 1).repeat(2) + bg.substr(3, 1).repeat(2);
            }

            //文本颜色
            let fc = menuButton.checkstatus(Store.flowdata, r, cindex , "fc");

            if(checksAF != null){//若单元格有交替颜色
                fc = checksAF[0];
            }

            if(checksCF != null && checksCF["textColor"] != null){//若单元格有条件格式
                fc = checksCF["textColor"];
            }

            if(fc.indexOf("rgb") > -1){
                fc = rgbTohex(fc);
            }

            if(fc.length == 4){
                fc = fc.substr(0, 1) + fc.substr(1, 1).repeat(2) + fc.substr(2, 1).repeat(2) + fc.substr(3, 1).repeat(2);
            }

            if(bg_filter && fc_filter){
                if(!(bg in bg_colorMap) && (!(fc in fc_colorMap) || cell == null || isRealNull(cell.v))){
                    rowhidden[r] = 0;
                }
            }
            else if(bg_filter){
                if(!(bg in bg_colorMap)){
                    rowhidden[r] = 0;
                }
            }
            else if(fc_filter){
                if(!(fc in fc_colorMap) || cell == null || isRealNull(cell.v)){
                    rowhidden[r] = 0;
                }
            }
        }

        let $top = $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").eq(cindex - st_c);

        let optionstate = Object.keys(rowhidden).length > 0;

        let rowhiddenall = $.extend(true, rowhiddenother, rowhidden), 
            rowhidenPre = json.parseJsonParm($top.data("rowhidden"));

        labelFilterOptionState($top, optionstate, rowhidden, caljs, true, st_r, ed_r, cindex, st_c, ed_c);

        let cfg = $.extend(true, {}, Store.config);
        cfg["rowhidden"] = rowhiddenall;

        //保存撤销
        if(Store.clearjfundo){
            let redo = {};
            redo["type"] = "datachangeAll_filter";
            redo["sheetIndex"] = Store.currentSheetIndex;

            redo["config"] = $.extend(true, {}, Store.config);
            redo["curconfig"] = cfg;

            redo["optionstate"] = optionstate;
            redo["optionsindex"] = cindex - st_c;

            redo["rowhidden"] = $.extend(true, {}, rowhidden);
            redo["rowhidenPre"] = $.extend(true, {}, rowhidenPre);

            if (caljs != null) {
                redo["caljs"] = caljs;
            }

            Store.jfundo.length  = 0;
            Store.jfredo.push(redo);
        }

        //config
        Store.config = cfg;
        syncConfigToStore();


        //行高、列宽 刷新  
        let _dataSize = getDataSize();
        jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);

        $("#luckysheet-filter-menu, #luckysheet-filter-submenu, #luckysheet-filter-orderby-color-submenu").hide();
        cleargridelement();
    });
}
