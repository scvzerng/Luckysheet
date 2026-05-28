import {  luckysheetContainerFocus  } from '../../utils/util';
import {  isEditMode  } from '../../global/validate';
import {  getdatabyselection } from '../../global/getdata';
import tooltip from '../../global/tooltip';
import editor from '../../global/editor';
import locale from '../../locale/locale';
import Store from '../../store';

function initialMatrixCleanOperation() {
    const locale_drag = locale().drag;
    //矩阵操作选区 删除两端0值 按行
    $("#luckysheet-matrix-delezero-row").click(function (event) {
        $("body .luckysheet-cols-menu").hide();
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
        
        let arr = [];
        let getdatalen = getdata[0].length;
        for (let r = 0; r < getdata.length; r++) {
            let a = [], stdel = true, eddel = true;
            for (let c = 0; c < getdatalen; c++) {
                let value = "";
                if (getdata[r] != null && getdata[r][c] != null) {
                    value = getdata[r][c];
                    if ((value.v == "0" || value.v == 0) && stdel) {
                        continue;
                    }
                    else {
                        stdel = false;
                    }
                }
                a.push(value);
            }

            let a1 = [];
            if (a.length == getdatalen) {
                a1 = a;
            }
            else {
                for (let c = a.length - 1; c >= 0; c--) {
                    let value = "";
                    if (a[c] != null) {
                        value = a[c];
                        if ((value.v == "0" || value.v == 0) && eddel) {
                            continue;
                        }
                        else {
                            eddel = false;
                        }
                    }
                    a1.unshift(value);
                }

                let l = getdatalen - a1.length;
                for (let c1 = 0; c1 < l; c1++) {
                    a1.push("");
                }
            }
            arr.push(a1);
        }

        editor.controlHandler(arr);
    });

    //矩阵操作选区 删除两端0值 按列
    $("#luckysheet-matrix-delezero-column").click(function (event) {
        $("body .luckysheet-cols-menu").hide();
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

        let arr = [];
        let getdatalen = getdata.length, collen = getdata[0].length;
        for (let c = 0; c < collen; c++) {
            let a = [], stdel = true, eddel = true;
            for (let r = 0; r < getdatalen; r++) {
                let value = "";
                if (getdata[r] != null && getdata[r][c] != null) {
                    value = getdata[r][c];
                    if ((value.v == "0" || value.v == 0) && stdel) {
                        continue;
                    }
                    else {
                        stdel = false;
                    }
                }
                a.push(value);
            }

            let a1 = [];
            if (a.length == getdatalen) {
                a1 = a;
            }
            else {
                for (let r = a.length - 1; r >= 0; r--) {
                    let value = "";
                    if (a[r] != null) {
                        value = a[r];
                        if ((value.v == "0" || value.v == 0) && eddel) {
                            continue;
                        }
                        else {
                            eddel = false;
                        }
                    }
                    a1.unshift(value);
                }

                let l = getdatalen - a1.length;
                for (let r1 = 0; r1 < l; r1++) {
                    a1.push("");
                }
            }
            arr.push(a1);
        }

        let arr1 = [];
        for (let c = 0; c < arr[0].length; c++) {
            let a = [];
            for (let r = 0; r < arr.length; r++) {
                let value = "";
                if (arr[r] != null && arr[r][c] != null) {
                    value = arr[r][c];
                }
                a.push(value);
            }
            arr1.push(a);
        }

        editor.controlHandler(arr1);
    });

    //矩阵操作选区 删除重复值 按行
    $("#luckysheet-matrix-delerpt-row").click(function (event) {
        $("body .luckysheet-cols-menu").hide();
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

        let arr = [];
        let getdatalen = getdata[0].length;
        for (let r = 0; r < getdata.length; r++) {
            let a = [], repeat = {};

            for (let c = 0; c < getdatalen; c++) {
                let value = null;
                if (getdata[r] != null && getdata[r][c] != null) {
                    value = getdata[r][c];

                    if(value.v in repeat){
                        repeat[value.v].push(value);
                    }
                    else{
                        repeat[value.v] = [];
                        repeat[value.v].push(value);
                    }
                }
            }

            for (let c = 0; c < getdatalen; c++) {
                let value = null;
                if (getdata[r] != null && getdata[r][c] != null) {
                    value = getdata[r][c];

                    if(repeat[value.v].length == 1){
                        a.push(value);
                    }
                }
            }

            let l = getdatalen - a.length;
            for (let c1 = 0; c1 < l; c1++) {
                a.push(null);
            }
            arr.push(a);
        }

        editor.controlHandler(arr);
    });

    //矩阵操作选区 删除重复值 按列
    $("#luckysheet-matrix-delerpt-column").click(function (event) {
        $("body .luckysheet-cols-menu").hide();
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

        let arr = [];
        let getdatalen = getdata.length, collen = getdata[0].length;
        for (let c = 0; c < collen; c++) {
            let a = [], repeat = {};

            for (let r = 0; r < getdatalen; r++) {
                let value = null;
                if (getdata[r] != null && getdata[r][c] != null) {
                    value = getdata[r][c];

                    if(value.v in repeat){
                        repeat[value.v].push(value);
                    }
                    else{
                        repeat[value.v] = [];
                        repeat[value.v].push(value);
                    }
                }
            }

            for (let r = 0; r < getdatalen; r++) {
                let value = null;
                if (getdata[r] != null && getdata[r][c] != null) {
                    value = getdata[r][c];

                    if(repeat[value.v].length == 1){
                        a.push(value);
                    }
                }
            }

            a1 = a;
            let l = getdatalen - a1.length;
            for (let r1 = 0; r1 < l; r1++) {
                a1.push(null);
            }
            arr.push(a1);
        }

        let arr1 = [];
        for (let c = 0; c < arr[0].length; c++) {
            let a = [];
            for (let r = 0; r < arr.length; r++) {
                let value = null;
                if (arr[r] != null && arr[r][c] != null) {
                    value = arr[r][c];
                }
                a.push(value);
            }
            arr1.push(a);
        }

        editor.controlHandler(arr1);
    });
}

export { initialMatrixCleanOperation };
