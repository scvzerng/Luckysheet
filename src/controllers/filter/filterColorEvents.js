import { deepMerge, onNS, offNS } from '../../utils/migrationHelpers.js';
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

let submenuhide = null;

export function filterColorEvents() {
    const orderbyColor = document.getElementById("luckysheet-filter-orderby-color");
    if (orderbyColor) {
        orderbyColor.addEventListener("mouseenter", function(){
            let menuEl = document.getElementById("luckysheet-filter-menu");
            let st_r = menuEl ? menuEl.dataset.str : null,
                ed_r = menuEl ? menuEl.dataset.edr : null,
                cindex = menuEl ? menuEl.dataset.cindex : null,
                st_c = menuEl ? menuEl.dataset.stc : null,
                ed_c = menuEl ? menuEl.dataset.edc : null;
            let bgMap = {};
            let fcMap = {};

            let af_compute = alternateformat.getComputeMap();
            let cf_compute = conditionformat.getComputeMap();

            for (let r = st_r + 1; r <= ed_r; r++) {
                let cell = Store.flowdata[r][cindex];

                let bg = menuButton.checkstatus(Store.flowdata, r, cindex , "bg");

                if(bg == null){
                    bg = "#ffffff";
                }

                let checksAF = alternateformat.checksAF(r, cindex, af_compute);
                if(checksAF != null){
                    bg = checksAF[1];
                }

                let checksCF = conditionformat.checksCF(r, cindex, cf_compute);
                if(checksCF != null && checksCF["cellColor"] != null){
                    bg = checksCF["cellColor"];
                }

                if(bg.indexOf("rgb") > -1){
                    bg = rgbTohex(bg);
                }

                if(bg.length == 4){
                    bg = bg.substr(0, 1) + bg.substr(1, 1).repeat(2) + bg.substr(2, 1).repeat(2) + bg.substr(3, 1).repeat(2);
                }

                let fc = menuButton.checkstatus(Store.flowdata, r, cindex , "fc");

                if(checksAF != null){
                    fc = checksAF[0];
                }

                if(checksCF != null && checksCF["textColor"] != null){
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

            let content;
            if(filterBgColorHtml == '' && filterFcColorHtml == ''){
                content = '<div class="luckysheet-mousedown-cancel" style="padding: 10px 30px;text-align: center;">'+filterState.locale_filter.filterContainerOneColorTip+'</div>';
            }
            else{
                content = filterBgColorHtml + filterFcColorHtml + '<div class="luckysheet-mousedown-cancel"><button id="luckysheet-filter-orderby-color-confirm" class="btn btn-primary luckysheet-mousedown-cancel" style="margin: 5px 20px;width: 70px;">'+filterState.locale_button.confirm+'</button></div>';
            }

            const oldSubmenu = document.getElementById("luckysheet-filter-orderby-color-submenu");
            if (oldSubmenu) oldSubmenu.remove();
            document.body.insertAdjacentHTML('beforeend', '<div id="luckysheet-filter-orderby-color-submenu" class="luckysheet-cols-menu luckysheet-mousedown-cancel">'+content+'</div>');
            const t = document.getElementById("luckysheet-filter-orderby-color-submenu");
            const con = this.parentElement;
            let winW = document.documentElement.clientWidth, winH = document.documentElement.clientHeight;
            let menuW = con.offsetWidth,
                myh = t ? t.offsetHeight + 25 : 0,
                myw = t ? t.offsetWidth + 5 : 0;
            let tRect = this.getBoundingClientRect();
            let offsetTop = tRect.top + window.pageYOffset,
                offsetLeft = tRect.left + window.pageXOffset;
            let top = offsetTop, left = offsetLeft + menuW;

            if (left + myw > winW) {
                left = offsetLeft - myw;
            }

            if (top + myh > winH) {
                top = winH - myh;
            }

            if (t) {
                t.style.top = top + 'px';
                t.style.left = left + 'px';
                t.style.display = '';
            }
        });
        orderbyColor.addEventListener("mouseleave", function(){
            submenuhide = setTimeout(function () { const _elColorSub = document.getElementById("luckysheet-filter-orderby-color-submenu"); if (_elColorSub) _elColorSub.style.display = 'none'; }, 200);
        });
    }

    document.addEventListener("mouseover", function(e) { const t = e.target.closest("#luckysheet-filter-orderby-color-submenu"); if (t && document.contains(t)) {
        clearTimeout(submenuhide);
    } });
    document.addEventListener("mouseleave", function(e) { const t = e.target.closest("#luckysheet-filter-orderby-color-submenu"); if (t && document.contains(t)) {
        t.style.display = 'none';
    } });
    document.addEventListener("click", function(e) { const t = e.target.closest("#luckysheet-filter-orderby-color-submenu .item label"); if (t && document.contains(t)) {
        const sibling = t.parentElement.querySelector("input[type='checkbox']");
        if (sibling) sibling.click();
    } });
    offNS("orderbyColorConfirm");
    onNS(document, "click.orderbyColorConfirm", "#luckysheet-filter-orderby-color-submenu #luckysheet-filter-orderby-color-confirm", function(){
        let bg_colorMap = {};
        let fc_colorMap = {};

        document.querySelectorAll("#luckysheet-filter-orderby-color-submenu .item").forEach(function(e){
            const cb = e.querySelector("input[type='checkbox']");
            if(cb && cb.checked){
                let color = e.querySelector("label").getAttribute("title");
                let boxId = e.closest(".box").getAttribute("id");

                if(boxId == "filterBgColor"){
                    bg_colorMap[color] = 0;
                }
                else if(boxId == "filterFcColor"){
                    fc_colorMap[color] = 0;
                }
            }
        });

        let bg_filter = !!document.querySelector("#luckysheet-filter-orderby-color-submenu #filterBgColor");
        let fc_filter = !!document.querySelector("#luckysheet-filter-orderby-color-submenu #filterFcColor");

        let menuEl = document.getElementById("luckysheet-filter-menu");
        let st_r = menuEl ? menuEl.dataset.str : null,
            ed_r = menuEl ? menuEl.dataset.edr : null,
            cindex = menuEl ? menuEl.dataset.cindex : null,
            st_c = menuEl ? menuEl.dataset.stc : null,
            ed_c = menuEl ? menuEl.dataset.edc : null;

        let rowhiddenother = {};
        const allFilterOpts = document.querySelectorAll("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options");
        const excludeEl = allFilterOpts[cindex - st_c];
        allFilterOpts.forEach(function (opt) {
            if (opt === excludeEl) return;
            let rh = opt.dataset.rowhidden;

            if (rh == "") {
                return;
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

            let bg = menuButton.checkstatus(Store.flowdata, r, cindex , "bg");

            let checksAF = alternateformat.checksAF(r, cindex, af_compute);
            if(checksAF != null){
                bg = checksAF[1];
            }

            let checksCF = conditionformat.checksCF(r, cindex, cf_compute);
            if(checksCF != null && checksCF["cellColor"] != null){
                bg = checksCF["cellColor"];
            }

            bg = bg == null ? '#ffffff' : bg;

            if(bg.indexOf("rgb") > -1){
                bg = rgbTohex(bg);
            }

            if(bg.length == 4){
                bg = bg.substr(0, 1) + bg.substr(1, 1).repeat(2) + bg.substr(2, 1).repeat(2) + bg.substr(3, 1).repeat(2);
            }

            let fc = menuButton.checkstatus(Store.flowdata, r, cindex , "fc");

            if(checksAF != null){
                fc = checksAF[0];
            }

            if(checksCF != null && checksCF["textColor"] != null){
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

        let topEl = allFilterOpts[cindex - st_c];

        let optionstate = Object.keys(rowhidden).length > 0;

        let rowhiddenall = deepMerge(rowhiddenother, rowhidden),
            rowhidenPre = json.parseJsonParm(topEl ? topEl.dataset.rowhidden : null);

        labelFilterOptionState(topEl, optionstate, rowhidden, caljs, true, st_r, ed_r, cindex, st_c, ed_c);

        let cfg = structuredClone(Store.config);
        cfg["rowhidden"] = rowhiddenall;

        if(Store.clearjfundo){
            let redo = {};
            redo["type"] = "datachangeAll_filter";
            redo["sheetIndex"] = Store.currentSheetIndex;

            redo["config"] = structuredClone(Store.config);
            redo["curconfig"] = cfg;

            redo["optionstate"] = optionstate;
            redo["optionsindex"] = cindex - st_c;

            redo["rowhidden"] = structuredClone(rowhidden);
            redo["rowhidenPre"] = structuredClone(rowhidenPre);

            if (caljs != null) {
                redo["caljs"] = caljs;
            }

            Store.jfundo.length  = 0;
            Store.jfredo.push(redo);
        }

        Store.config = cfg;
        syncConfigToStore();

        let _dataSize = getDataSize();
        jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);

        [document.getElementById("luckysheet-filter-menu"), document.getElementById("luckysheet-filter-submenu"), document.getElementById("luckysheet-filter-orderby-color-submenu")].forEach(el => { if (el) el.style.display = 'none'; });
        cleargridelement();
    });
}
