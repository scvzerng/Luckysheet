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

export function filterCheckboxEvents() {
    $(document).off("click.filterCheckbox1").on("click.filterCheckbox1", "#luckysheet-filter-byvalue-select .textBox",function(){
        if($(this).attr("data-check") == "true"){
            $(this).attr("data-check", "false");
            $(this).find("input[type='checkbox']").removeAttr("checked");
        }
        else{
            $(this).attr("data-check", "true");
            $(this).find("input[type='checkbox']").prop("checked", true);
        }
    })
    $(document).off("click.filterCheckbox2").on("click.filterCheckbox2", "#luckysheet-filter-byvalue-select .year",function(){
        if($(this).attr("data-check") == "true"){
            $(this).attr("data-check", "false");
            $(this).parents(".yearBox").find(".month").attr("data-check", "false");
            $(this).parents(".yearBox").find(".day").attr("data-check", "false");
            $(this).parents(".yearBox").find("input[type='checkbox']").removeAttr("checked");
        }
        else{
            $(this).attr("data-check", "true");
            $(this).parents(".yearBox").find(".month").attr("data-check", "true");
            $(this).parents(".yearBox").find(".day").attr("data-check", "true");
            $(this).parents(".yearBox").find("input[type='checkbox']").prop("checked", true);
        }
    })
    $(document).off("click.filterCheckbox3").on("click.filterCheckbox3", "#luckysheet-filter-byvalue-select .month",function(){
        //月份 对应的 天
        if($(this).attr("data-check") == "true"){
            $(this).attr("data-check", "false");
            $(this).parents(".monthBox").find(".day").attr("data-check", "false");
            $(this).parents(".monthBox").find("input[type='checkbox']").removeAttr("checked");
        }
        else{
            $(this).attr("data-check", "true");
            $(this).parents(".monthBox").find(".day").attr("data-check", "true");
            $(this).parents(".monthBox").find("input[type='checkbox']").prop("checked", true);
        }
        //月份 对应的 年份
        let yearDayAllCheck = true;
        let $yearDay = $(this).parents(".yearBox").find(".day");
        $yearDay.each(function(i,e){
            if($(e).attr("data-check") == "true"){

            }
            else{
                yearDayAllCheck = false;
            }
        });
        if(yearDayAllCheck){
            $(this).parents(".yearBox").find(".year").attr("data-check", "true");
            $(this).parents(".yearBox").find(".year input[type='checkbox']").prop("checked", true);
        }
        else{
            $(this).parents(".yearBox").find(".year").attr("data-check", "false");
            $(this).parents(".yearBox").find(".year input[type='checkbox']").removeAttr("checked");
        }
    })
    $(document).off("click.filterCheckbox4").on("click.filterCheckbox4", "#luckysheet-filter-byvalue-select .day",function(){
        if($(this).attr("data-check") == "true"){
            $(this).attr("data-check", "false");
            $(this).find("input[type='checkbox']").removeAttr("checked");
        }
        else{
            $(this).attr("data-check", "true");
            $(this).find("input[type='checkbox']").prop("checked", true);
        }
        //天 对应的 月份
        let monthDayAllCheck = true;
        let $monthDay = $(this).parents(".monthBox").find(".day");
        $monthDay.each(function(i,e){
            if($(e).attr("data-check") == "true"){

            }
            else{
                monthDayAllCheck = false;
            }
        });
        if(monthDayAllCheck){
            $(this).parents(".monthBox").find(".month").attr("data-check", "true");
            $(this).parents(".monthBox").find(".month input[type='checkbox']").prop("checked", true);
        }
        else{
            $(this).parents(".monthBox").find(".month").attr("data-check", "false");
            $(this).parents(".monthBox").find(".month input[type='checkbox']").removeAttr("checked");
        }
        //天 对应的 年份
        let yearDayAllCheck = true;
        let $yearDay = $(this).parents(".yearBox").find(".day");
        $yearDay.each(function(i,e){
            if($(e).attr("data-check") == "true"){

            }
            else{
                yearDayAllCheck = false;
            }
        });
        if(yearDayAllCheck){
            $(this).parents(".yearBox").find(".year").attr("data-check", "true");
            $(this).parents(".yearBox").find(".year input[type='checkbox']").prop("checked", true);
        }
        else{
            $(this).parents(".yearBox").find(".year").attr("data-check", "false");
            $(this).parents(".yearBox").find(".year input[type='checkbox']").removeAttr("checked");
        }
    })

    //日期 三级下拉显示
    $(document).off("click.filterYearDropdown").on("click.filterYearDropdown", "#luckysheet-filter-byvalue-select .yearBox .fa-caret-right",function(event){
        let $p = $(this).parents(".luckysheet-mousedown-cancel");
        if($p.hasClass("year")){
            $(this).parents(".yearBox").find(".monthList").slideToggle();
        }
        if($p.hasClass("month")){
            $(this).parents(".monthBox").find(".dayList").slideToggle();
        }

        event.stopPropagation();
    });

    //全选
    $("#luckysheet-filter-byvalue-btn-all").click(function () {
        $("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").prop("checked", true);
        $("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").parents(".luckysheet-mousedown-cancel").attr("data-check", "true");
    });

    //清除
    $("#luckysheet-filter-byvalue-btn-clear").click(function () {
        $("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").removeAttr("checked");
        $("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").parents(".luckysheet-mousedown-cancel").attr("data-check", "false");
    });

    //反选
    $("#luckysheet-filter-byvalue-btn-contra").click(function () {
        let $input = $("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']");
        $input.each(function(i, e){
            if($(e).is(":checked")){
                $(e).removeAttr("checked");
                $(e).parents(".luckysheet-mousedown-cancel").attr("data-check", "false");
            }
            else{
                $(e).prop("checked", true);
                $(e).parents(".luckysheet-mousedown-cancel").attr("data-check", "true");
            }
        });
        //天 对应的 月份
        let $month = $("#luckysheet-filter-byvalue-select .ListBox .monthBox");
        $month.each(function(index, event){
            let monthDayAllCheck = true;
            let $monthDay = $(event).find(".day input[type='checkbox']");
            $monthDay.each(function(i,e){
                if($(e).is(":checked")){

                }
                else{
                    monthDayAllCheck = false;
                }
            });
            if(monthDayAllCheck){
                $(event).find(".month input[type='checkbox']").prop("checked", true);
                $(event).attr("data-check", "true");
            }
            else{
                $(event).find(".month input[type='checkbox']").removeAttr("checked");
                $(event).attr("data-check", "false");
            }
        });
        //天 对应的 年份
        let $year = $("#luckysheet-filter-byvalue-select .ListBox .yearBox");
        $year.each(function(index, event){
            let yearDayAllCheck = true;
            let $yearDay = $(event).find(".day input[type='checkbox']");
            $yearDay.each(function(i,e){
                if($(e).is(":checked")){

                }
                else{
                    yearDayAllCheck = false;
                }
            });
            if(yearDayAllCheck){
                $(event).find(".year input[type='checkbox']").prop("checked", true);
                $(event).attr("data-check", "true");
            }
            else{
                $(event).find(".year input[type='checkbox']").removeAttr("checked");
                $(event).attr("data-check", "false");
            }
        });
    });
}
