import { getSheetIndex } from '../../methods/get';
import editor from '../../global/editor';
import { isRealNull, isEditMode } from '../../global/validate';
import tooltip from '../../global/tooltip';
import { rowlenByRange } from '../../global/getRowlen';
import { selectHightlightShow } from '../select';
import { luckysheetMoveEndCell } from '../sheetMove';
import { luckysheetlodingHTML } from '../constant';
import locale from '../../locale/locale';
import Store from '../../store';
import menuButton from '../menuButton';
import conditionformat from '../conditionformat';
import alternateformat from '../alternateformat';
import { rgbTohex, showrightclickmenu } from '../../utils/util';
import cleargridelement from '../../global/cleargridelement';
import { jfrefreshgrid, jfrefreshgrid_rhcw } from '../../global/refresh';
import { orderbydata, orderbydata1D } from '../../global/sort';
import json from '../../global/json';
import { update, genarate } from '../../global/format';
import filterState from './filterState';
import { labelFilterOptionState } from './labelFilterOptionState';
import { orderbydatafiler } from './orderbydatafiler';

export function filterActions() {
    $("#luckysheet-filter-initial").click(function () {

        $("#luckysheet-filter-menu .luckysheet-filter-selected-input").hide().find("input").val();
        $("#luckysheet-filter-selected span").data("type", "0").data("type", null).text(filterState.locale_filter.conditionNone);

        let redo = {};
        redo["type"] = "datachangeAll_filter_clear";
        redo["sheetIndex"] = Store.currentSheetIndex;

        redo["config"] = $.extend(true, {}, Store.config);
        Store.config["rowhidden"] = {};
        redo["curconfig"] = $.extend(true, {}, Store.config);

        redo["filter_save"] = $.extend(true, {}, Store.luckysheet_filter_save);

        let optiongroups = [];
        $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").each(function () {
            let $t = $(this);

            let optionstate = $t.hasClass("luckysheet-filter-options-active");
            let rowhidden = json.parseJsonParm($t.data("rowhidden"));
            let caljs = json.parseJsonParm($t.data("caljs"));

            optiongroups.push({
                "optionstate":optionstate,
                "rowhidden": rowhidden, 
                "caljs":caljs, 
                "str": $t.data("str"),
                "edr": $t.data("edr"),
                "cindex": $t.data("cindex"),
                "stc": $t.data("stc"),
                "edc": $t.data("edc")
            });
        });
        redo["optiongroups"] = optiongroups;

        Store.jfundo.length  = 0;
        Store.jfredo.push(redo);

        $('#luckysheet-filter-selected-sheet' + Store.currentSheetIndex + ', #luckysheet-filter-options-sheet' + Store.currentSheetIndex).remove();
        $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();

        //清除筛选发送给后台
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].filter = null;
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].filter_select = null;


        //config
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;


        //行高、列宽 刷新  
        jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    });

    //按照值进行筛选
    $("#luckysheet-filter-byvalue-input").on('input propertychange', function () {
        let v = $(this).val().toString();
        $("#luckysheet-filter-byvalue-select .ListBox .luckysheet-mousedown-cancel").show();

        if(v != ""){
            $("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").each(function(i, e){
                if($(e).closest(".day").length > 0){
                    let day = $(e).siblings("label").text().toString();
                    let month = $(e).closest(".monthBox").find(".month label").text().toString();
                    let year = $(e).closest(".yearBox").find(".year label").text().toString();
                    let itemV = year + "-" + month + "-" + day;

                    if(itemV.indexOf(v) == -1){
                        $(e).closest(".day").hide();

                        //天 对应的 月份
                        let $monthDay = $(e).closest(".dayList").find(".day:visible");
                        if($monthDay.length == 0){
                            $(e).closest(".monthBox").find(".month").hide();
                        }

                        //天 对应的 年份
                        let $yearDay = $(e).closest(".monthList").find(".day:visible");
                        if($yearDay.length == 0){
                            $(e).closest(".yearBox").find(".year").hide();
                        }
                    }
                }

                if($(e).closest(".textBox").length > 0){
                    let itemV = $(e).siblings("label").text().toString();

                    if(itemV.indexOf(v) == -1){
                        $(e).parents(".textBox").hide();
                    }
                }
            });
        }
    });

    //筛选取消
    $("#luckysheet-filter-cancel").click(function () {
        $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();
    });

    //筛选 确认
    $("#luckysheet-filter-confirm").click(function () {
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

            rh = JSON.parse(rh.replace(/\'/g, '"'));

            for (let r in rh) {
                rowhiddenother[r] = 0;
            }
        });

        let filterdata = {};
        let rowhidden = {};
        let caljs = {};

        if ($("#luckysheet-filter-bycondition").next().is(":visible") && $("#luckysheet-filter-byvalue").next().is(":hidden") && $("#luckysheet-filter-selected span").data("value") != "null") {
            let $t = $("#luckysheet-filter-selected span");
            let type = $t.data("type"), value = $t.data("value");

            caljs["value"] = value;
            caljs["text"] = $t.text();

            if (type == "0") {
                caljs["type"] = "0";
            }
            else if (type == "2") {
                let $input = $("#luckysheet-filter-menu .luckysheet-filter-selected-input2 input");
                caljs["type"] = "2";
                caljs["value1"] = $input.eq(0).val();
                caljs["value2"] = $input.eq(1).val();
            }
            else {
                caljs["type"] = "1";
                caljs["value1"] = $("#luckysheet-filter-menu .luckysheet-filter-selected-input").eq(0).find("input").val();
            }

            for (let r = st_r + 1; r <= ed_r; r++) {
                if(r in rowhiddenother){
                    continue;
                }

                if(Store.flowdata[r] == null){
                    continue;
                }

                let cell = Store.flowdata[r][cindex];

                if (value == "cellnull") { //单元格为空
                    if(cell != null && !isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "cellnonull") { //单元格有数据
                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "textinclude") { //文本包含 
                    let value1 = caljs["value1"];

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else{
                        if(cell.m.indexOf(value1) == -1){
                            rowhidden[r] = 0;
                        }
                    }
                }
                else if (value == "textnotinclude") { //文本不包含
                    let value1 = caljs["value1"];

                    if(cell == null || isRealNull(cell.v)){

                    }
                    else{
                        if(cell.m.indexOf(value1) > -1){
                            rowhidden[r] = 0;
                        }
                    }
                }
                else if (value == "textstart") { //文本开头为
                    let value1 = caljs["value1"], valuelen = value1.length;

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else{
                        if(cell.m.substr(0, valuelen) != value1){
                            rowhidden[r] = 0;
                        }
                    }
                }
                else if (value == "textend") { //文本结尾为
                    let value1 = caljs["value1"], valuelen = value1.length;

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else{
                        if(valuelen > cell.m.length || cell.m.substr(cell.m.length - valuelen, valuelen) != value1){
                            rowhidden[r] = 0;
                        }
                    }
                }
                else if (value == "textequal") { //文本等于
                    let value1 = caljs["value1"];

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else{
                        if(cell.m != value1){
                            rowhidden[r] = 0;
                        }
                    }
                }
                else if (value == "dateequal") { //日期等于
                    let value1 = genarate(caljs["value1"])[2];

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "d"){
                        if(parseInt(cell.v) != value1){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "datelessthan") { //日期早于
                    let value1 = genarate(caljs["value1"])[2];

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "d"){
                        if(parseInt(cell.v) >= value1){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "datemorethan") { //日期晚于
                    let value1 = genarate(caljs["value1"])[2];

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "d"){
                        if(parseInt(cell.v) <= value1){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "morethan") { //大于
                    let value1 = parseFloat(caljs["value1"]);

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "n"){
                        if(cell.v <= value1){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "moreequalthan") { //大于等于
                    let value1 = parseFloat(caljs["value1"]);

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "n"){
                        if(cell.v < value1){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "lessthan") { //小于
                    let value1 = parseFloat(caljs["value1"]);

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "n"){
                        if(cell.v >= value1){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "lessequalthan") { //小于等于
                    let value1 = parseFloat(caljs["value1"]);

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "n"){
                        if(cell.v > value1){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "equal") { //等于
                    let value1 = parseFloat(caljs["value1"]);

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "n"){
                        if(cell.v != value1){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "noequal") { //不等于
                    let value1 = parseFloat(caljs["value1"]);

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "n"){
                        if(cell.v == value1){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "include") { //介于
                    let value1 = parseFloat(caljs["value1"]), value2 = parseFloat(caljs["value2"]);

                    let min, max;
                    if(value1 < value2){
                        min = value1;
                        max = value2;
                    }
                    else{
                        max = value1;
                        min = value2;   
                    }

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "n"){
                        if(cell.v < min || cell.v > max){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
                else if (value == "noinclude") { //不在其中
                    let value1 = parseFloat(caljs["value1"]), value2 = parseFloat(caljs["value2"]);

                    let min, max;
                    if(value1 < value2){
                        min = value1;
                        max = value2;
                    }
                    else{
                        max = value1;
                        min = value2;   
                    }

                    if(cell == null || isRealNull(cell.v)){
                        rowhidden[r] = 0;
                    }
                    else if(cell.ct != null && cell.ct.t == "n"){
                        if(cell.v >= min && cell.v <= max){
                            rowhidden[r] = 0;
                        }
                    }
                    else{
                        rowhidden[r] = 0;
                    }
                }
            }
        }
        else {
            $("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").each(function(i, e){
                if($(e).is(":visible") && $(e).is(":checked")){
                    return true;
                }

                if($(e).closest(".day").length > 0){
                    let day = $(e).siblings("label").text();
                    if(Number(day) < 10){
                        day = "0" + Number(day);
                    }

                    let month = $(e).closest(".monthBox").find(".month label").text().replace(filterState.locale_filter.filiterMonthText, "");
                    if(Number(month) < 10){
                        month = "0" + Number(month);
                    }

                    let year = $(e).closest(".yearBox").find(".year label").text().replace(filterState.locale_filter.filiterYearText, "");

                    let itemV = filterState.locale_filter.filterDateFormatTip +"#$$$#" + year + "-" + month + "-" + day;

                    filterdata[itemV] = "1";
                }

                if($(e).closest(".textBox").length > 0){
                    let itemV = $(e).closest(".textBox").data("filter");

                    filterdata[itemV] = "1";
                }
            });

            for (let r = st_r + 1; r <= ed_r; r++) {
                if(r in rowhiddenother){
                    continue;
                }

                if(Store.flowdata[r] == null){
                    continue;
                }

                let cell = Store.flowdata[r][cindex];

                let value;
                if((cell == null || isRealNull(cell.v)) && cell?.mc){
                    const { r, c } = cell.mc
                    const mainCell = Store.flowdata[r][c]
                    value = mainCell.v + "#$$$#" + mainCell.m;
                }
                else if(cell == null || isRealNull(cell.v)){
                    value = "null#$$$#null";
                }
                else if(cell.ct != null && cell.ct.t == "d"){
                    let fmt = update("YYYY-MM-DD", cell.v);
                    value = filterState.locale_filter.filterDateFormatTip +"#$$$#" + fmt;
                }
                else{
                    value = cell.v + "#$$$#" + cell.m;
                }

                if(value in filterdata){
                    rowhidden[r] = 0;
                }
            }
        }

        let $top = $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").eq(cindex - st_c);

        let optionstate = $("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']:visible:checked").length < $("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']:visible").length || $("#luckysheet-filter-byvalue-input").val().length > 0 || ($("#luckysheet-filter-bycondition").next().is(":visible") && $("#luckysheet-filter-byvalue").next().is(":hidden") && $("#luckysheet-filter-selected span").data("value") != "null");

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
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;


        //行高、列宽 刷新  
        jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);

        $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();
        cleargridelement();
    });
}
