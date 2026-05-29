import {  isRealNull } from '../../global/validate';
import { luckysheetlodingHTML } from '../constant';
import Store from '../../store';
import {  showrightclickmenu  } from '../../utils/util';
import {  orderbydata1D  } from '../../global/sort';
import {  update } from '../../global/format';
import filterState from './filterState';
import { orderbydatafiler } from './orderbydatafiler';
import cellMain from '../../ui/cellMain.js';

export function filterOptionClick() {
    cellMain.onClick(".luckysheet-filter-options", function (e) {
        let $t = $(e.currentTarget), 
            toffset = $t.offset(), 
            $menu = $("#luckysheet-filter-menu"), 
            winH = document.documentElement.clientHeight,
            winW = document.documentElement.clientWidth;

        let st_r = $t.data("str"), 
            ed_r = $t.data("edr"), 
            cindex = $t.data("cindex"), 
            st_c = $t.data("stc"), 
            ed_c = $t.data("edc"), 
            rowhidden = $t.data("rowhidden") == "" ? {} : JSON.parse($t.data("rowhidden").replace(/\'/g, '"'));

        $("body .luckysheet-cols-menu").hide();
        $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();
        $("#luckysheet-filter-byvalue-input").val("");
        $("#luckysheet-filter-bycondition").next().hide();
        $("#luckysheet-filter-byvalue").next().show();

        $menu.data("str", st_r);
        $menu.data("edr", ed_r);
        $menu.data("cindex", cindex);
        $menu.data("stc", st_c);
        $menu.data("edc", ed_c);

        $("#luckysheet-filter-menu .luckysheet-filter-selected-input").hide().find("input").val();
        $("#luckysheet-filter-selected span").data("type", "0").data("type", null).text(filterState.locale_filter.filiterInputNone);

        let byconditiontype = $t.data("byconditiontype");
        $("#luckysheet-filter-selected span").data("value", $t.data("byconditionvalue")).data("type", byconditiontype).text($t.data("byconditiontext"));

        if (byconditiontype == "2") {
            let $input = $("#luckysheet-filter-menu .luckysheet-filter-selected-input2").show().find("input");
            $input.eq(0).val($t.data("byconditionvalue1"));
            $input.eq(1).val($t.data("byconditionvalue2"));
        }
        else if (byconditiontype == "1") {
            $("#luckysheet-filter-menu .luckysheet-filter-selected-input").eq(0).show().find("input").val($t.data("byconditionvalue1"));
        }

        $("#luckysheet-filter-orderby-asc").off("click").on("click", function () {
            orderbydatafiler(st_r, st_c, ed_r, ed_c, cindex, true);
        });

        $("#luckysheet-filter-orderby-desc").off("click").on("click", function () {
            orderbydatafiler(st_r, st_c, ed_r, ed_c, cindex, false);
        });

        const loadingObj = luckysheetlodingHTML("#luckysheet-filter-byvalue-select",{text:filterState.locale_filter.filiterMoreDataTip});
        $("#luckysheet-filter-byvalue-select").empty().append(loadingObj.el);

        let rowhiddenother = {}; //其它筛选列的隐藏行
        $("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").not(this).each(function () {
            let $t = $(this), rh = $t.data("rowhidden");

            if (rh == "") {
                return true;
            }

            rh = JSON.parse(rh.replace(/\'/g, '"'));

            for (let r in rh) {
                rowhiddenother[r] = 0;
            }
        });

        let data = Store.flowdata;

        setTimeout(function () {
            //日期值
            let dvmap = {};  
            let dvmap_uncheck = {};

            //除日期以外的值
            let vmap = {}; 
            let vmap_uncheck = {};  

            for (let r = st_r + 1; r <= ed_r; r++) {
                if(r in rowhiddenother){
                    continue;
                }

                if(Store.flowdata[r] == null){
                    continue;
                }

                let cell = Store.flowdata[r][cindex];

                if(cell != null && !isRealNull(cell.v) && cell.ct != null && cell.ct.t == "d" ){ //单元格是日期
                    let v = update("YYYY-MM-DD", cell.v);

                    let y = v.split("-")[0];
                    let m = v.split("-")[1];
                    let d = v.split("-")[2];

                    if(!(y in dvmap)){
                        dvmap[y] = {};
                    }

                    if(!(m in dvmap[y])){
                        dvmap[y][m] = {};
                    }

                    if(!(d in dvmap[y][m])){
                        dvmap[y][m][d] = 0;
                    }

                    dvmap[y][m][d]++;

                    if(r in rowhidden){
                        dvmap_uncheck[y] = 0;
                        dvmap_uncheck[m] = 0;
                        dvmap_uncheck[d] = 0;
                    }
                }
                else{
                    let v, m;
                    if((cell == null || isRealNull(cell.v)) && cell?.mc){
                        const { r, c } = cell.mc;
                        const mainCell = Store.flowdata[r][c];
                        v = mainCell.v;
                        m = mainCell.m;
                    }
                    else if(cell == null || isRealNull(cell.v)){
                        v = null;
                        m = null;
                    }
                    else{
                        v = cell.v;
                        m = cell.m;
                    }

                    if(!(v in vmap)){
                        vmap[v] = {};
                    }

                    if(!(m in vmap[v])){
                        vmap[v][m] = 0;                            
                    }

                    vmap[v][m]++;

                    if(r in rowhidden){
                        vmap_uncheck[v + "#$$$#" + m] = 0;
                    }
                }
            }

            //遍历数据加到页面
            let item = [];

            if(JSON.stringify(dvmap).length > 2){
                for(let y in dvmap){
                    let ysum = 0;
                    let monthHtml = '';

                    for(let m in dvmap[y]){
                        let msum = 0;
                        let dayHtml = '';

                        for(let d in dvmap[y][m]){
                            let dayL = dvmap[y][m][d];
                            msum += dayL;

                            //月 小于 10
                            let mT;
                            if(Number(m) < 10){
                                mT = "0" + Number(m);
                            }
                            else{
                                mT = m;    
                            }

                            //日 小于 10
                            let dT;
                            if(Number(d) < 10){
                                dT = "0" + Number(d);
                            }
                            else{
                                dT = d;    
                            }

                            //日是否选中状态
                            if((y in dvmap_uncheck) && (m in dvmap_uncheck) && (d in dvmap_uncheck)){
                                dayHtml +=  '<div class="day luckysheet-mousedown-cancel cf" data-check="false" title="'+ y +'-'+ mT +'-'+ dT +'">' +
                                                '<input class="luckysheet-mousedown-cancel" type="checkbox"/>' +
                                                '<label class="luckysheet-mousedown-cancel">' + d + '</label>' +
                                                '<span class="count luckysheet-mousedown-cancel">( ' + dayL + ' )</span>' +
                                            '</div>';
                            }
                            else{
                                dayHtml +=  '<div class="day luckysheet-mousedown-cancel cf" data-check="true" title="'+ y +'-'+ mT +'-'+ dT +'">' +
                                                '<input class="luckysheet-mousedown-cancel" type="checkbox" checked="checked"/>' +
                                                '<label class="luckysheet-mousedown-cancel">' + d + '</label>' +
                                                '<span class="count luckysheet-mousedown-cancel">( ' + dayL + ' )</span>' +
                                            '</div>';
                            }
                        }

                        ysum += msum;

                        //月 小于 10
                        let mT2;
                        if(Number(m) < 10){
                            mT2 = "0" + Number(m);
                        }
                        else{
                            mT2 = m;    
                        }

                        //月是否选中状态
                        if((y in dvmap_uncheck) && (m in dvmap_uncheck)){
                            monthHtml += '<div class="monthBox luckysheet-mousedown-cancel">' +
                                            '<div class="month luckysheet-mousedown-cancel cf" data-check="false" title="'+ y +'-'+ mT2 +'">' +
                                                '<i class="fa fa-caret-right luckysheet-mousedown-cancel" aria-hidden="true"></i>' +
                                                '<input class="luckysheet-mousedown-cancel" type="checkbox"/>' +
                                                '<label class="luckysheet-mousedown-cancel">' + m + ''+ filterState.locale_filter.filiterMonthText +'</label>' +
                                                '<span class="count luckysheet-mousedown-cancel">( ' + msum + ' )</span>' +
                                            '</div>' +
                                            '<div class="dayList luckysheet-mousedown-cancel">' + dayHtml + '</div>' +
                                        '</div>';
                        }
                        else{
                            monthHtml += '<div class="monthBox luckysheet-mousedown-cancel">' +
                                            '<div class="month luckysheet-mousedown-cancel cf" data-check="true" title="'+ y +'-'+ mT2 +'">' +
                                                '<i class="fa fa-caret-right luckysheet-mousedown-cancel" aria-hidden="true"></i>' +
                                                '<input class="luckysheet-mousedown-cancel" type="checkbox" checked="checked"/>' +
                                                '<label class="luckysheet-mousedown-cancel">' + m + ''+ filterState.locale_filter.filiterMonthText +'</label>' +
                                                '<span class="count luckysheet-mousedown-cancel">( ' + msum + ' )</span>' +
                                            '</div>' +
                                            '<div class="dayList luckysheet-mousedown-cancel">' + dayHtml + '</div>' +
                                        '</div>';
                        }
                    }

                    //年是否选中状态
                    let yearHtml;
                    if(y in dvmap_uncheck){
                        yearHtml =  '<div class="yearBox luckysheet-mousedown-cancel">' +
                                            '<div class="year luckysheet-mousedown-cancel cf" data-check="false" title="'+ y +'">' +
                                                '<i class="fa fa-caret-right luckysheet-mousedown-cancel" aria-hidden="true"></i>' +
                                                '<input class="luckysheet-mousedown-cancel" type="checkbox"/>' +
                                                '<label class="luckysheet-mousedown-cancel">' + y + ''+ filterState.locale_filter.filiterYearText +'</label>' +
                                                '<span class="count luckysheet-mousedown-cancel">( ' + ysum + ' )</span>' +
                                            '</div>' +
                                            '<div class="monthList luckysheet-mousedown-cancel">' + monthHtml + '</div>' +
                                        '</div>';
                    }
                    else{
                        yearHtml =  '<div class="yearBox luckysheet-mousedown-cancel">' +
                                            '<div class="year luckysheet-mousedown-cancel cf" data-check="true" title="'+ y +'">' +
                                                '<i class="fa fa-caret-right luckysheet-mousedown-cancel" aria-hidden="true"></i>' +
                                                '<input class="luckysheet-mousedown-cancel" type="checkbox" checked="checked"/>' +
                                                '<label class="luckysheet-mousedown-cancel">' + y + ''+ filterState.locale_filter.filiterYearText +'</label>' +
                                                '<span class="count luckysheet-mousedown-cancel">( ' + ysum + ' )</span>' +
                                            '</div>' +
                                            '<div class="monthList luckysheet-mousedown-cancel">' + monthHtml + '</div>' +
                                        '</div>';
                    }

                    item.unshift(yearHtml);
                }
            }

            if(JSON.stringify(vmap).length > 2){
                let vmapKeys = Object.keys(vmap);
                vmapKeys = orderbydata1D(vmapKeys, true);

                for(let i = 0; i < vmapKeys.length; i++){
                    let v = vmapKeys[i];

                    for(let x in vmap[v]){
                        let text;
                        if((v + "#$$$#" + x) == "null#$$$#null"){
                            text = filterState.locale_filter.valueBlank;
                        }
                        else{
                            text = x;
                        }

                        //是否选中状态
                        let dataHtml;
                        if((v + "#$$$#" + x) in vmap_uncheck){
                            dataHtml =  '<div class="textBox luckysheet-mousedown-cancel cf" data-check="false" data-filter="'+ (v + "#$$$#" + x) +'" title="'+ text +'">' +
                                                '<input class="luckysheet-mousedown-cancel" type="checkbox"/>' +
                                                '<label class="luckysheet-mousedown-cancel">' + text + '</label>' +
                                                '<span class="luckysheet-mousedown-cancel count">( ' + vmap[v][x] + ' )</span>' +
                                            '</div>';
                        }
                        else{
                            dataHtml =  '<div class="textBox luckysheet-mousedown-cancel cf" data-check="true" data-filter="'+ (v + "#$$$#" + x) +'" title="'+ text +'">' +
                                                '<input class="luckysheet-mousedown-cancel" type="checkbox" checked="checked"/>' +
                                                '<label class="luckysheet-mousedown-cancel">' + text + '</label>' +
                                                '<span class="luckysheet-mousedown-cancel count">( ' + vmap[v][x] + ' )</span>' +
                                            '</div>';
                        }

                        item.push(dataHtml);
                    }
                }
            }

            // 适配小屏设备
            let containerH = winH - toffset.top - 350
            if (containerH < 0) containerH = 100
            //$("#luckysheet-filter-byvalue-select").html("<div class='ListBox luckysheet-mousedown-cancel' style='min-height: 100px; max-height: " + containerH + "px; overflow-y: auto; overflow-x: hidden;'><table cellspacing='0' style='width:100%;' class='luckysheet-mousedown-cancel'>" + item.join("") + "</table></div>");

            $("#luckysheet-filter-byvalue-select").append("<div class='ListBox luckysheet-mousedown-cancel' style='min-height: 100px; max-height: " + containerH + "px; overflow-y: auto; overflow-x: hidden;'><table cellspacing='0' style='width:100%;' class='luckysheet-mousedown-cancel'>" + item.join("") + "</table></div>");
            loadingObj.close();
        }, 1);

        showrightclickmenu($menu, toffset.left, toffset.top + 20);

        e.stopPropagation();
        return false;
    });
}
