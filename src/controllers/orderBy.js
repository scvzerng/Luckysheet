
import { modelHTML } from './constant';

import { selectHightlightShow } from './select';
import { 
    replaceHtml,
    chatatABC, 
} from '../utils/util';
import { rowlenByRange } from '../global/getRowlen';
import {  isEditMode } from '../global/validate';
import cleargridelement from '../global/cleargridelement';
import { 
    jfrefreshgrid, 
} from '../global/refresh';
import { getcellvalue } from '../global/getdata';
import { orderbydata,  sortColumnSeletion } from '../global/sort';
import tooltip from '../global/tooltip';
import editor from '../global/editor';
import { isdatatype } from '../global/datecontroll';
import { showModalMask, hideModalMask } from '../utils/domUtils.js';
import Store from '../store';
import locale from '../locale/locale';


export function orderByInitial(){
    const _locale = locale();
    document.querySelectorAll("#luckysheetorderbyasc, #luckysheetorderbyasc_t").forEach(function(el) {
        el.addEventListener("mousedown", function (event) {
            cleargridelement(event);
            sortColumnSeletion(Store.orderbyindex, true);
            selectHightlightShow();
        });
    });

    document.querySelectorAll("#luckysheetorderbydesc, #luckysheetorderbydesc_t").forEach(function(el) {
        el.addEventListener("click", function (event) {
            cleargridelement(event);
            sortColumnSeletion(Store.orderbyindex, false);
            selectHightlightShow();
        });
    });

    let luckysheet_sort_initial = true;
    document.getElementById("luckysheetorderby")?.addEventListener("click", function () {

        document.querySelectorAll("body .luckysheet-cols-menu").forEach(el => el.style.display = 'none');
        const locale_sort = _locale.sort;
        if(Store.luckysheet_select_save.length > 1){
            if(isEditMode()){
                alert(locale_sort.noRangeError);
            }
            else{
                tooltip.info(locale_sort.noRangeError, ""); 
            }
            return;
        }

        let last = Store.luckysheet_select_save[0];
        let r1 = last["row"][0], r2 = last["row"][1];
        let c1 = last["column"][0], c2 = last["column"][1];

        if (luckysheet_sort_initial) {
            luckysheet_sort_initial = false;
            
            let content = `<div style="overflow: hidden;" class="luckysheet-sort-modal"><div><label><input type="checkbox" id="luckysheet-sort-haveheader"/><span>${locale_sort.hasTitle}</span></label></div><div style="overflow-y:auto;" id="luckysheet-sort-dialog-tablec"><table data-itemcount="0" cellspacing="0"> <tr><td>${locale_sort.hasTitle} <select name="sort_0"> <option value="1">1</option> <option value="2">2</option> <option value="3">3</option> <option value="4">4</option> </select> </td> <td> <div><label><input value="asc" type="radio" checked="checked" name="sort_0"><span>${locale_sort.asc}A-Z</span></label></div> <div><label><input value="desc" type="radio" name="sort_0"><span>${locale_sort.desc}Z-A</span></label></div></td></tr></table></div><div style="background: #e5e5e5;border-top: 1px solid #f5f5f5; height: 1px; width: 100%;margin:2px 0px;margin-bottom:10px;"></div> <div> <span style="font-weight: bold; text-decoration: underline;text-align:center;color: blue;cursor: pointer;" class="luckysheet-sort-dialog-additem">+ ${locale_sort.addOthers}</span> </div> </div>`;

            document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { "id": "luckysheet-sort-dialog", "addclass": "", "title": _locale.sort.sortTitle, "content": content, "botton": `<button id="luckysheet-sort-modal-confirm" class="btn btn-primary">${locale_sort.confirm}</button><button class="btn btn-default luckysheet-model-close-btn">${locale_sort.close}</button>`}));

            document.querySelector("#luckysheet-sort-dialog .luckysheet-sort-dialog-additem").addEventListener("click", function () {
                let last = Store.luckysheet_select_save[0];
                let r1 = last["row"][0], r2 = last["row"][1];
                let c1 = last["column"][0], c2 = last["column"][1];

                let _elSortTable = document.querySelector("#luckysheet-sort-dialog table");
                let option = "", i = parseInt(_elSortTable.dataset.itemcount) + 1;
                let t = document.getElementById("luckysheet-sort-haveheader")?.checked ?? false;

                for (let c = c1; c <= c2; c++) {
                    if (t) {
                        let v = getcellvalue(r1, c, Store.flowdata, "m");

                        if(v == null){
                            v = locale_sort.columnOperation + (c - c1 + 1); 
                        }

                        option += '<option value="' + c + '">' + v + '</option>';
                    }
                    else {
                        option += '<option value="' + c + '">' + chatatABC(c) + '</option>';
                    }
                }

                _elSortTable.insertAdjacentHTML('beforeend', `
                    <tr class="luckysheet-sort-dialog-tr">
                        <td><span class="luckysheet-sort-item-close" onclick="this.parentElement.parentElement.remove();"><i class="fa fa-times"
                                    aria-hidden="true"></i></span>${locale_sort.secondaryTitle} <select
                                name="sort_${i}">${option}</select> </td>
                        <td>
                            <div><label><input value="asc" type="radio" checked="checked"
                                        name="sort_${i}"><span>${locale_sort.asc}A-Z</span></label></div>
                            <div><label><input value="desc" type="radio" name="sort_${i}"><span>${locale_sort.desc}Z-A</span></label>
                            </div>
                        </td>
                    </tr>
                `);
                _elSortTable.dataset.itemcount = i;
            });

            document.getElementById("luckysheet-sort-haveheader")?.addEventListener("change", function () {
                let last = Store.luckysheet_select_save[0];
                let r1 = last["row"][0], r2 = last["row"][1];
                let c1 = last["column"][0], c2 = last["column"][1];

                let t = this.checked;
                let option = "";

                for (let c = c1; c <= c2; c++) {
                    if (t) {
                        let v = getcellvalue(r1, c, Store.flowdata, "m");
                        
                        if(v == null){
                            v = locale_sort.columnOperation + (c - c1 + 1); 
                        }

                        option += '<option value="' + c + '">' + v + '</option>';
                    }
                    else {
                        option += '<option value="' + c + '">' + chatatABC(c) + '</option>';
                    }
                }

                document.querySelectorAll("#luckysheet-sort-dialog tr select").forEach(function(el) {
                    el.innerHTML = option;
                });
            });

            document.getElementById("luckysheet-sort-modal-confirm")?.addEventListener("click", function () {
                if(Store.luckysheet_select_save.length > 1){
                    if(isEditMode()){
                        alert(locale_sort.noRangeError);
                    }
                    else{
                        tooltip.info(locale_sort.noRangeError, "");
                    }

                    return;
                }

                let d = editor.deepCopyFlowData(Store.flowdata);

                let last = Store.luckysheet_select_save[0];
                let r1 = last["row"][0], r2 = last["row"][1];
                let c1 = last["column"][0], c2 = last["column"][1];

                let t = document.getElementById("luckysheet-sort-haveheader")?.checked ?? false;

                let str;
                if(t){
                    str = r1 + 1;
                }
                else{
                    str = r1;
                }

                let hasMc = false;

                let data = [];

                for(let r = str; r <= r2; r++){
                    let data_row = [];

                    for(let c = c1; c <= c2; c++){
                        if(d[r][c] != null && d[r][c].mc != null){
                            hasMc = true;
                            break;
                        }

                        data_row.push(d[r][c]);
                    }

                    data.push(data_row);
                }

                if(hasMc){
                    if(isEditMode()){
                        alert(locale_sort.mergeError);
                    }
                    else{
                        tooltip.info(locale_sort.mergeError, "");
                    }

                    return;
                }
                
                let sortRows = Array.from(document.querySelectorAll("#luckysheet-sort-dialog table tr")).reverse();
                for (let row of sortRows) {
                    let sel = row.querySelector("select");
                    let radio = row.querySelector('input[type="radio"]:checked');
                    if (!sel || !radio) continue;
                    let i = sel.value, asc = radio.value;
                    
                    i -= c1;
                    
                    if (asc == "asc") {
                        asc = true;
                    }
                    else {
                        asc = false;
                    }

                    data = orderbydata([].concat(data), i, asc);
                }

                for(let r = str; r <= r2; r++){
                    for(let c = c1; c <= c2; c++){
                        d[r][c] = data[r - str][c - c1];
                    }
                }

                let allParam = {};
                if(Store.config["rowlen"] != null){
                    let cfg = structuredClone(Store.config);
                    cfg = rowlenByRange(d, str, r2, cfg);

                    allParam = {
                        "cfg": cfg,
                        "RowlChange": true
                    }
                }

                jfrefreshgrid(d, [{ "row": [str, r2], "column": [c1, c2] }], allParam);

                let _elSortDialog = document.getElementById("luckysheet-sort-dialog");
                if (_elSortDialog) _elSortDialog.style.display = 'none';
                hideModalMask();
            });
        }

        let option = "";
        for (let c = c1; c <= c2; c++) {
            option += '<option value="' + c + '">' + chatatABC(c) + '</option>';
        }

        document.querySelectorAll("#luckysheet-sort-dialog select").forEach(function(el) {
            el.innerHTML = option;
        });

        document.querySelectorAll("#luckysheet-sort-dialog .luckysheet-sort-dialog-tr").forEach(function(el) {
            el.remove();
        });

        const _elHaveHeader = document.getElementById("luckysheet-sort-haveheader");
        if (_elHaveHeader) _elHaveHeader.checked = false;
        let _elFirstRadio = document.querySelector("#luckysheet-sort-dialog input[type='radio']");
        if (_elFirstRadio) _elFirstRadio.checked = true;

        let _elTitleText = document.querySelector("#luckysheet-sort-dialog .luckysheet-modal-dialog-title-text");
        if (_elTitleText) _elTitleText.innerHTML = locale_sort.sortRangeTitle+"<span>" + chatatABC(c1) + (r1 + 1) + "</span>"+ locale_sort.sortRangeTitleTo +"<span>" + chatatABC(c2) + (r2 + 1) + "</span>";

        let _elSortDialog2 = document.getElementById("luckysheet-sort-dialog");
        let myh = _elSortDialog2?.offsetHeight, myw = _elSortDialog2?.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;

        let _elTableC = document.getElementById("luckysheet-sort-dialog-tablec");
        if (_elTableC) _elTableC.style.maxHeight = ((winh - myh) / 2) + "px";
        if (_elSortDialog2) Object.assign(_elSortDialog2.style, {
            "left": ((winw + scrollLeft - myw) / 2) + "px",
            "top": ((winh + scrollTop - myh) / 2) + "px"
        });
        if (_elSortDialog2) _elSortDialog2.style.display = 'block';
        showModalMask();

        if (r1 < r2) {
            setTimeout(function () {
                let flowrowdata1 = Store.flowdata[r1], 
                    flowrowdata2 = Store.flowdata[r1 + 1], 
                    hastitle = false;
                
                for (let i = c1; i <= c2; i++) {
                    let isdatatype_r1 = isdatatype(flowrowdata1[i]), 
                        isdatatype_r2 = isdatatype(flowrowdata2[i]);
                    
                    if (isdatatype_r1 != isdatatype_r2) {
                        hastitle = true;
                    }
                }

                if (hastitle) {
                    let _elHaveHeader = document.getElementById("luckysheet-sort-haveheader");
                    if (_elHaveHeader) _elHaveHeader.checked = true;
                    _elHaveHeader?.dispatchEvent(new Event("change"));
                }
            }, 10);
        }
    });
}
