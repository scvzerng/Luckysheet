import {  isRealNull } from '../../global/validate';
import { luckysheetlodingHTML } from '../constant';
import Store from '../../store';
import {  orderbydata1D  } from '../../global/sort';
import {  update } from '../../global/format';
import filterState from './filterState';
import { orderbydatafiler } from './orderbydatafiler';
import cellMain from '../../ui/cellMain.js';

export function filterOptionClick() {
    cellMain.onClick(".luckysheet-filter-options", function (e) {
        let t = this,
            tRect = t.getBoundingClientRect(),
            toffset = { top: tRect.top + window.pageYOffset, left: tRect.left + window.pageXOffset },
            menu = document.getElementById("luckysheet-filter-menu"),
            winH = document.documentElement.clientHeight,
            winW = document.documentElement.clientWidth;

        let st_r = t.dataset.str,
            ed_r = t.dataset.edr,
            cindex = t.dataset.cindex,
            st_c = t.dataset.stc,
            ed_c = t.dataset.edc,
            rowhidden = t.dataset.rowhidden == "" ? {} : JSON.parse(t.dataset.rowhidden.replace(/'/g, '"'));

        document.querySelectorAll("body .luckysheet-cols-menu").forEach(el => { el.style.display = 'none'; });
        if (menu) menu.style.display = 'none';
        const submenuEl = document.getElementById("luckysheet-filter-submenu");
        if (submenuEl) submenuEl.style.display = 'none';
        const byvalueInput = document.getElementById("luckysheet-filter-byvalue-input");
        if (byvalueInput) byvalueInput.value = "";
        const bycondition = document.getElementById("luckysheet-filter-bycondition");
        if (bycondition && bycondition.nextElementSibling) bycondition.nextElementSibling.style.display = 'none';
        const byvalue = document.getElementById("luckysheet-filter-byvalue");
        if (byvalue && byvalue.nextElementSibling) byvalue.nextElementSibling.style.display = '';

        if (menu) {
            menu.dataset.str = st_r;
            menu.dataset.edr = ed_r;
            menu.dataset.cindex = cindex;
            menu.dataset.stc = st_c;
            menu.dataset.edc = ed_c;
        }

        document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input").forEach(el => {
            el.style.display = 'none';
            const input = el.querySelector("input");
            if (input) input.value;
        });
        const selectedSpan = document.querySelector("#luckysheet-filter-selected span");
        if (selectedSpan) {
            selectedSpan.dataset.type = "0";
            selectedSpan.dataset.type = null;
            selectedSpan.textContent = filterState.locale_filter.filiterInputNone;
        }

        let byconditiontype = t.dataset.byconditiontype;
        if (selectedSpan) {
            selectedSpan.dataset.value = t.dataset.byconditionvalue;
            selectedSpan.dataset.type = byconditiontype;
            selectedSpan.textContent = t.dataset.byconditiontext;
        }

        if (byconditiontype == "2") {
            const input2Container = document.querySelector("#luckysheet-filter-menu .luckysheet-filter-selected-input2");
            if (input2Container) {
                input2Container.style.display = '';
                const inputs = input2Container.querySelectorAll("input");
                if (inputs[0]) inputs[0].value = t.dataset.byconditionvalue1;
                if (inputs[1]) inputs[1].value = t.dataset.byconditionvalue2;
            }
        }
        else if (byconditiontype == "1") {
            const firstInput = document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input")[0];
            if (firstInput) {
                firstInput.style.display = '';
                const input = firstInput.querySelector("input");
                if (input) input.value = t.dataset.byconditionvalue1;
            }
        }

        const orderbyAsc = document.getElementById("luckysheet-filter-orderby-asc");
        if (orderbyAsc) {
            const newHandlerAsc = function () {
                orderbydatafiler(st_r, st_c, ed_r, ed_c, cindex, true);
            };
            if (orderbyAsc._filterHandler) orderbyAsc.removeEventListener("click", orderbyAsc._filterHandler);
            orderbyAsc._filterHandler = newHandlerAsc;
            orderbyAsc.addEventListener("click", newHandlerAsc);
        }

        const orderbyDesc = document.getElementById("luckysheet-filter-orderby-desc");
        if (orderbyDesc) {
            const newHandlerDesc = function () {
                orderbydatafiler(st_r, st_c, ed_r, ed_c, cindex, false);
            };
            if (orderbyDesc._filterHandler) orderbyDesc.removeEventListener("click", orderbyDesc._filterHandler);
            orderbyDesc._filterHandler = newHandlerDesc;
            orderbyDesc.addEventListener("click", newHandlerDesc);
        }

        const byvalueSelect = document.getElementById("luckysheet-filter-byvalue-select");
        if (byvalueSelect) byvalueSelect.innerHTML = '';
        const loadingObj = luckysheetlodingHTML(byvalueSelect, {text: filterState.locale_filter.filiterMoreDataTip});

        let rowhiddenother = {};
        const filterOpts = document.querySelectorAll("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options");
        filterOpts.forEach(function (opt) {
            if (opt === t) return;
            let rh = opt.dataset.rowhidden;

            if (rh == "") {
                return;
            }

            rh = JSON.parse(rh.replace(/'/g, '"'));

            for (let r in rh) {
                rowhiddenother[r] = 0;
            }
        });

        let data = Store.flowdata;

        setTimeout(function () {
            let dvmap = {};
            let dvmap_uncheck = {};

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

                if(cell != null && !isRealNull(cell.v) && cell.ct != null && cell.ct.t == "d" ){
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

                            let mT;
                            if(Number(m) < 10){
                                mT = "0" + Number(m);
                            }
                            else{
                                mT = m;
                            }

                            let dT;
                            if(Number(d) < 10){
                                dT = "0" + Number(d);
                            }
                            else{
                                dT = d;
                            }

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

                        let mT2;
                        if(Number(m) < 10){
                            mT2 = "0" + Number(m);
                        }
                        else{
                            mT2 = m;
                        }

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

            let containerH = winH - toffset.top - 350
            if (containerH < 0) containerH = 100

            if (byvalueSelect) {
                byvalueSelect.insertAdjacentHTML('beforeend', "<div class='ListBox luckysheet-mousedown-cancel' style='min-height: 100px; max-height: " + containerH + "px; overflow-y: auto; overflow-x: hidden;'><table cellspacing='0' style='width:100%;' class='luckysheet-mousedown-cancel'>" + item.join("") + "</table></div>");
            }
            if (loadingObj) loadingObj.close();
        }, 1);

        if (menu) {
            let menuW = menu.offsetWidth,
                menuH = menu.offsetHeight;
            let top = toffset.top + 20,
                left = toffset.left;
            if (left + menuW > winW) { left = toffset.left - menuW; }
            if (top + menuH > winH) { top = winH - menuH; }
            if (top < 0) { top = 0; }
            menu.style.top = top + 'px';
            menu.style.left = left + 'px';
            menu.style.display = '';
        }

        e.stopPropagation();
        return false;
    });
}
