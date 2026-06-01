import { deepMerge } from '../../utils/migrationHelpers.js';
import {  isRealNull } from '../../global/validate';
import Store from '../../store';
import cleargridelement from '../../global/cleargridelement';
import {  jfrefreshgrid_rhcw  } from '../../global/refresh';
import json from '../../global/json';
import { update, genarate } from '../../global/format';
import filterState from './filterState';
import { labelFilterOptionState } from './labelFilterOptionState';
import { getCurrentFile, syncConfigToStore, getDataSize } from '../../utils/storeAccess.js';

export function filterActions() {
    const filterInitial = document.getElementById("luckysheet-filter-initial");
    if (filterInitial) {
        filterInitial.addEventListener("click", function () {
            document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input").forEach(el => { el.style.display = 'none'; const input = el.querySelector("input"); if (input) input.value; });
            const selectedSpan = document.querySelector("#luckysheet-filter-selected span");
            if (selectedSpan) {
                selectedSpan.dataset.type = "0";
                selectedSpan.dataset.type = null;
                selectedSpan.textContent = filterState.locale_filter.conditionNone;
            }

            let redo = {};
            redo["type"] = "datachangeAll_filter_clear";
            redo["sheetIndex"] = Store.currentSheetIndex;

            redo["config"] = structuredClone(Store.config);
            Store.config["rowhidden"] = {};
            redo["curconfig"] = structuredClone(Store.config);

            redo["filter_save"] = structuredClone(Store.luckysheet_filter_save);

            let optiongroups = [];
            document.querySelectorAll("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").forEach(function (opt) {
                let optionstate = opt.classList.contains("luckysheet-filter-options-active");
                let rowhidden = json.parseJsonParm(opt.dataset.rowhidden);
                let caljs = json.parseJsonParm(opt.dataset.caljs);

                optiongroups.push({
                    "optionstate":optionstate,
                    "rowhidden": rowhidden,
                    "caljs":caljs,
                    "str": opt.dataset.str,
                    "edr": opt.dataset.edr,
                    "cindex": opt.dataset.cindex,
                    "stc": opt.dataset.stc,
                    "edc": opt.dataset.edc
                });
            });
            redo["optiongroups"] = optiongroups;

            Store.jfundo.length  = 0;
            Store.jfredo.push(redo);

            const el1 = document.getElementById('luckysheet-filter-selected-sheet' + Store.currentSheetIndex);
            if (el1) el1.remove();
            const el2 = document.getElementById('luckysheet-filter-options-sheet' + Store.currentSheetIndex);
            if (el2) el2.remove();
            [document.getElementById("luckysheet-filter-menu"), document.getElementById("luckysheet-filter-submenu")].forEach(el => { if (el) el.style.display = 'none'; });

            getCurrentFile().filter = null;
            getCurrentFile().filter_select = null;

            syncConfigToStore();

            let _dataSize = getDataSize();
            jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);
        });
    }

    const byvalueInput = document.getElementById("luckysheet-filter-byvalue-input");
    if (byvalueInput) {
        byvalueInput.addEventListener("input", function () {
            let v = this.value.toString();
            document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox .luckysheet-mousedown-cancel").forEach(el => el.style.display = 'block');

            if(v != ""){
                document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").forEach(function(e){
                    if(e.closest(".day")){
                        let day = Array.from(e.parentElement.children).filter(s => s !== e && s.matches("label"))[0];
                        let dayText = day ? day.textContent.toString() : '';
                        let monthLabel = e.closest(".monthBox")?.querySelector(".month label");
                        let monthText = monthLabel ? monthLabel.textContent.toString() : '';
                        let yearLabel = e.closest(".yearBox")?.querySelector(".year label");
                        let yearText = yearLabel ? yearLabel.textContent.toString() : '';
                        let itemV = yearText + "-" + monthText + "-" + dayText;

                        if(itemV.indexOf(v) == -1){
                            const dayEl = e.closest(".day");
                            if (dayEl) dayEl.style.display = 'none';

                            let monthDayVisible = Array.from(e.closest(".dayList")?.querySelectorAll(".day") || []).filter(el => el.offsetWidth > 0);
                            if(monthDayVisible.length == 0){
                                const monthEl = e.closest(".monthBox")?.querySelector(".month");
                                if (monthEl) monthEl.style.display = 'none';
                            }

                            let yearDayVisible = Array.from(e.closest(".monthList")?.querySelectorAll(".day") || []).filter(el => el.offsetWidth > 0);
                            if(yearDayVisible.length == 0){
                                const yearEl = e.closest(".yearBox")?.querySelector(".year");
                                if (yearEl) yearEl.style.display = 'none';
                            }
                        }
                    }

                    if(e.closest(".textBox")){
                        let label = Array.from(e.parentElement.children).filter(s => s !== e && s.matches("label"))[0];
                        let itemV = label ? label.textContent.toString() : '';

                        if(itemV.indexOf(v) == -1){
                            const textBox = e.closest(".textBox");
                            if (textBox) textBox.style.display = 'none';
                        }
                    }
                });
            }
        });
    }

    const filterCancel = document.getElementById("luckysheet-filter-cancel");
    if (filterCancel) {
        filterCancel.addEventListener("click", function () {
            [document.getElementById("luckysheet-filter-menu"), document.getElementById("luckysheet-filter-submenu")].forEach(el => { if (el) el.style.display = 'none'; });
        });
    }

    const filterConfirm = document.getElementById("luckysheet-filter-confirm");
    if (filterConfirm) {
        filterConfirm.addEventListener("click", function () {
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

                rh = JSON.parse(rh.replace(/'/g, '"'));

                for (let r in rh) {
                    rowhiddenother[r] = 0;
                }
            });

            let filterdata = {};
            let rowhidden = {};
            let caljs = {};

            const byconditionEl = document.getElementById("luckysheet-filter-bycondition");
            const byvalueEl = document.getElementById("luckysheet-filter-byvalue");
            const selectedSpanEl = document.querySelector("#luckysheet-filter-selected span");

            if (byconditionEl && byconditionEl.nextElementSibling && byconditionEl.nextElementSibling.offsetWidth > 0 && byvalueEl && byvalueEl.nextElementSibling && byvalueEl.nextElementSibling.offsetWidth === 0 && selectedSpanEl && selectedSpanEl.dataset.value != "null") {
                let type = selectedSpanEl.dataset.type, value = selectedSpanEl.dataset.value;

                caljs["value"] = value;
                caljs["text"] = selectedSpanEl.textContent;

                if (type == "0") {
                    caljs["type"] = "0";
                }
                else if (type == "2") {
                    const input2 = document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input2 input");
                    caljs["type"] = "2";
                    caljs["value1"] = input2[0] ? input2[0].value : '';
                    caljs["value2"] = input2[1] ? input2[1].value : '';
                }
                else {
                    caljs["type"] = "1";
                    const firstInput = document.querySelectorAll("#luckysheet-filter-menu .luckysheet-filter-selected-input")[0];
                    caljs["value1"] = firstInput ? firstInput.querySelector("input").value : '';
                }

                for (let r = st_r + 1; r <= ed_r; r++) {
                    if(r in rowhiddenother){
                        continue;
                    }

                    if(Store.sheetData[r] == null){
                        continue;
                    }

                    let cell = Store.sheetData[r][cindex];

                    if (value == "cellnull") {
                        if(cell != null && !isRealNull(cell.v)){
                            rowhidden[r] = 0;
                        }
                    }
                    else if (value == "cellnonull") {
                        if(cell == null || isRealNull(cell.v)){
                            rowhidden[r] = 0;
                        }
                    }
                    else if (value == "textinclude") {
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
                    else if (value == "textnotinclude") {
                        let value1 = caljs["value1"];

                        if(cell == null || isRealNull(cell.v)){

                        }
                        else{
                            if(cell.m.indexOf(value1) > -1){
                                rowhidden[r] = 0;
                            }
                        }
                    }
                    else if (value == "textstart") {
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
                    else if (value == "textend") {
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
                    else if (value == "textequal") {
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
                    else if (value == "dateequal") {
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
                    else if (value == "datelessthan") {
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
                    else if (value == "datemorethan") {
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
                    else if (value == "morethan") {
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
                    else if (value == "moreequalthan") {
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
                    else if (value == "lessthan") {
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
                    else if (value == "lessequalthan") {
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
                    else if (value == "equal") {
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
                    else if (value == "noequal") {
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
                    else if (value == "include") {
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
                    else if (value == "noinclude") {
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
                document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']").forEach(function(e){
                    if(e.offsetWidth > 0 && e.checked){
                        return;
                    }

                    if(e.closest(".day")){
                        let day = Array.from(e.parentElement.children).find(s => s !== e && s.matches("label"));
                        let dayText = day ? day.textContent : '';
                        if(Number(dayText) < 10){
                            dayText = "0" + Number(dayText);
                        }

                        let monthLabel = e.closest(".monthBox")?.querySelector(".month label");
                        let monthText = monthLabel ? monthLabel.textContent.replace(filterState.locale_filter.filiterMonthText, "") : '';
                        if(Number(monthText) < 10){
                            monthText = "0" + Number(monthText);
                        }

                        let yearLabel = e.closest(".yearBox")?.querySelector(".year label");
                        let yearText = yearLabel ? yearLabel.textContent.replace(filterState.locale_filter.filiterYearText, "") : '';

                        let itemV = filterState.locale_filter.filterDateFormatTip +"#$$$#" + yearText + "-" + monthText + "-" + dayText;

                        filterdata[itemV] = "1";
                    }

                    if(e.closest(".textBox")){
                        let itemV = e.closest(".textBox")?.dataset?.filter;

                        filterdata[itemV] = "1";
                    }
                });

                for (let r = st_r + 1; r <= ed_r; r++) {
                    if(r in rowhiddenother){
                        continue;
                    }

                    if(Store.sheetData[r] == null){
                        continue;
                    }

                    let cell = Store.sheetData[r][cindex];

                    let value;
                    if((cell == null || isRealNull(cell.v)) && cell?.mc){
                        const { r, c } = cell.mc
                        const mainCell = Store.sheetData[r][c]
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

            let topEl = allFilterOpts[cindex - st_c];

            const allCheckboxes = document.querySelectorAll("#luckysheet-filter-byvalue-select .ListBox input[type='checkbox']");
            const visibleCheckboxes = Array.from(allCheckboxes).filter(el => el.offsetWidth > 0);
            const visibleChecked = visibleCheckboxes.filter(el => el.checked);
            const byvalueInputEl = document.getElementById("luckysheet-filter-byvalue-input");
            let optionstate = visibleChecked.length < visibleCheckboxes.length || (byvalueInputEl && byvalueInputEl.value.length > 0) || (byconditionEl && byconditionEl.nextElementSibling && byconditionEl.nextElementSibling.offsetWidth > 0 && byvalueEl && byvalueEl.nextElementSibling && byvalueEl.nextElementSibling.offsetWidth === 0 && selectedSpanEl && selectedSpanEl.dataset.value != "null");

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

            [document.getElementById("luckysheet-filter-menu"), document.getElementById("luckysheet-filter-submenu")].forEach(el => { if (el) el.style.display = 'none'; });
            cleargridelement();
        });
    }
}
