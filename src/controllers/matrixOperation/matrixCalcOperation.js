import {  numFormat,  luckysheetContainerFocus  } from '../../utils/util';
import {  isEditMode  } from '../../global/validate';
import {  getdatabyselection } from '../../global/getdata';
import tooltip from '../../global/tooltip';
import editor from '../../global/editor';
import locale from '../../locale/locale';
import Store from '../../store';

let jfnqrt = function (x, p) {
        if (x == 0)
            return 0;
        let x0, x1;
        x0 = x;
        x1 = ((p - 1) * x0 / p) + (x / (Math.pow(x0, p - 1) * p));//利用迭代法求解
        while (Math.abs(x1 - x0) > 0.000001) {
            x0 = x1;
            x1 = ((p - 1) * x0 / p) + (x / (Math.pow(x0, p - 1) * p));
        }
        return x1;
    }

function initialMatrixCalcOperation() {
    const locale_drag = locale().drag;
    //矩阵操作选区 矩阵计算
    const _elCalConfirm = document.getElementById("luckysheet-matrix-cal-confirm"); if (_elCalConfirm) _elCalConfirm.addEventListener("click", function (event) {

        // Click input element, don't comfirm 
        if(event.target.nodeName === 'INPUT' || event.target.nodeName === 'SELECT'){
            return;
        }

        document.querySelectorAll("body .luckysheet-cols-menu").forEach(el => el.style.display = 'none');
        luckysheetContainerFocus();

        if(Store.luckysheet_select_save.length > 1){
            if(isEditMode()){
                alert(locale_drag.noMulti);
            }
            else{
                tooltip.info(locale_drag.noMulti, "");
            }
            return;
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        if (getdata.length == 0) {
            return;
        }

        let caltype = document.getElementById("luckysheet-matrix-cal-type")?.value,
            calvalue = parseInt(document.getElementById("luckysheet-matrix-cal-value")?.value);

        if(calvalue.toString() == "NaN"){
            if(isEditMode()){
                alert(locale_drag.inputCorrect);
            }
            else{
                tooltip.info(locale_drag.inputCorrect, "");
            }
            return;
        }

        if (calvalue == null) {
            calvalue = 2;
        }

        let arr = [];

        for (let r = 0; r < getdata.length; r++) {
            let a = [];

            for (let c = 0; c < getdata[0].length; c++) {
                let value = "";
                if (getdata[r] != null && getdata[r][c] != null) {
                    value = getdata[r][c];
                    if (parseInt(value) != null && getdata[r][c].ct != undefined && getdata[r][c].ct.t == "n") {
                        if (caltype == "minus") {
                            value.v = value.v - calvalue;
                        }
                        else if (caltype == "multiply") {
                            value.v = value.v * calvalue;
                        }
                        else if (caltype == "divided") {
                            value.v = numFormat(value.v / calvalue, 4);
                        }
                        else if (caltype == "power") {
                            value.v = Math.pow(value.v, calvalue);
                        }
                        else if (caltype == "root") {
                            if (calvalue == 2) {
                                value.v = numFormat(Math.sqrt(value.v), 4);
                            }
                            else if (calvalue == 3 && Math.cbrt) {
                                value.v = numFormat(Math.cbrt(value.v), 4);
                            }
                            else {
                                value.v = numFormat(jfnqrt(value.v, calvalue), 4);
                            }
                        }
                        else if (caltype == "log") {
                            value.v = numFormat(Math.log(value.v) * 10000 / Math.log(Math.abs(calvalue)), 4);
                        }
                        else {
                            value.v = value.v + calvalue;
                        }

                        if(value.v == null){
                            value.m = "";
                        }
                        else{
                            value.m = value.v.toString();
                        }
                    }
                }
                a.push(value);
            }
            arr.push(a);
        }

        editor.controlHandler(arr);
    });
}

export { initialMatrixCalcOperation, jfnqrt };
