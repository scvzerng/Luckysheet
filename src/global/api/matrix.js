import locale from "../../locale/locale";
import Store from "../../store";
import editor from "../editor";
import formula from "../formula";
import { getdatabyselection } from "../getdata";
import tooltip from "../tooltip";
import { isRealNum } from "../validate";

export function matrixOperation(type, options = {}) {
    let typeValues = [
        'flipUpDown',               // 上下翻转
        'flipLeftRight',            // 左右翻转
        'flipClockwise',            // 顺时针旋转
        'flipCounterClockwise',     // 逆时针旋转
        'transpose',                // 转置
        'deleteZeroByRow',          // 按行删除两端0值
        'deleteZeroByColumn',       // 按列删除两端0值
        'removeDuplicateByRow',     // 按行删除重复值
        'removeDuplicateByColumn',  // 按列删除重复值
        'newMatrix'                 // 生产新矩阵
    ]

    if (!type || typeValues.indexOf(type) < 0) {
        return tooltip.info('The type parameter is invalid.', '')
    }

    let curRange = Store.luckysheet_select_save[0];
    let {
        range = curRange,
        success
    } = {...options}

    if(range instanceof Array && range.length > 1){
        tooltip.info(locale().drag.noMulti, "");
        return;
    }

    if (range && typeof range === 'string' && formula.iscelldata(range)) {
        range = formula.getcellrange(range)
    }

    let getdata = getdatabyselection(range);
    let arr = [];
    if (getdata.length === 0) {
        return;
    }

    let getdatalen, collen, arr1;
    switch (type) {
        case 'flipUpDown':
            for (let r = getdata.length - 1; r >= 0; r--) {
                let a = [];
                for (let c = 0; c < getdata[0].length; c++) {
                    let value = "";
                    if (getdata[r] != null && getdata[r][c] != null) {
                        value = getdata[r][c];
                    }
                    a.push(value);
                }
                arr.push(a);
            }
            break;
        case 'flipLeftRight':
            for (let r = 0; r < getdata.length; r++) {
                let a = [];
                for (let c = getdata[0].length - 1; c >= 0; c--) {
                    let value = "";
                    if (getdata[r] != null && getdata[r][c] != null) {
                        value = getdata[r][c];
                    }
                    a.push(value);
                }
                arr.push(a);
            }
            break;
        case 'flipClockwise':
            for (let c = 0; c < getdata[0].length; c++) {
                let a = [];
                for (let r = getdata.length - 1; r >= 0; r--) {
                    let value = "";
                    if (getdata[r] != null && getdata[r][c] != null) {
                        value = getdata[r][c];
                    }
                    a.push(value);
                }
                arr.push(a);
            }
            break;
        case 'flipCounterClockwise':
            for (let c = getdata[0].length - 1; c >= 0; c--) {
                let a = [];
                for (let r = 0; r < getdata.length; r++) {
                    let value = "";
                    if (getdata[r] != null && getdata[r][c] != null) {
                        value = getdata[r][c];
                    }
                    a.push(value);
                }
                arr.push(a);
            }
            break;
        case 'transpose':
            for (let c = 0; c < getdata[0].length; c++) {
                let a = [];
                for (let r = 0; r < getdata.length; r++) {
                    let value = "";
                    if (getdata[r] != null && getdata[r][c] != null) {
                        value = getdata[r][c];
                    }
                    a.push(value);
                }
                arr.push(a);
            }
            break;
        case 'deleteZeroByRow':
            getdatalen = getdata[0].length;
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
                } else {
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
            break;
        case 'deleteZeroByColumn':
            getdatalen = getdata.length;
            collen = getdata[0].length;
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

            arr1 = [];
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
            break;
        case 'removeDuplicateByRow':
            getdatalen = getdata[0].length;
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
            break;
        case 'removeDuplicateByColumn':
            collen = getdata[0].length;
            getdatalen = getdata.length;
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

            arr1 = [];
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
            break;
        case 'newMatrix':
            // TODO
            console.log("TODO")
            break;
    }
    editor.controlHandler(arr, range)

    if (success && typeof success === 'function') {
        success();
    }
}

export function matrixCalculation(type, number, options = {}) {
    let typeValues = [
        'plus',     // 加
        'minus',    // 减
        'multiply', // 乘
        'divided',  // 除
        'power',    // 幂
        'root',     // 次方根
        'log'       // 对数log
    ]

    if (!type || typeValues.indexOf(type) < 0) {
        return tooltip.info('The type parameter is invalid.', '')
    }

    if(!isRealNum(number)){
        return tooltip.info('The number parameter is invalid.', '')
    }

    let curRange = Store.luckysheet_select_save[0];
    let {
        range = curRange,
        success
    } = {...options}

    if(range instanceof Array && range.length > 1){
        tooltip.info(locale().drag.noMulti, "");
        return;
    }

    if (range && typeof range === 'string' && formula.iscelldata(range)) {
        range = formula.getcellrange(range)
    }

    let getdata = getdatabyselection(range);
    if (getdata.length == 0) {
        return;
    }

    let arr = [];
    for (let r = 0; r < getdata.length; r++) {
        let a = [];
        for (let c = 0; c < getdata[0].length; c++) {
            let value = "";
            if (getdata[r] != null && getdata[r][c] != null) {
                value = getdata[r][c];
                if (parseInt(value) != null && getdata[r][c].ct != undefined && getdata[r][c].ct.t == "n") {
                    if (type == "minus") {
                        value.v = value.v - number;
                    }
                    else if (type == "multiply") {
                        value.v = value.v * number;
                    }
                    else if (type == "divided") {
                        value.v = numFormat(value.v / number, 4);
                    }
                    else if (type == "power") {
                        value.v = Math.pow(value.v, number);
                    }
                    else if (type == "root") {
                        if (number == 2) {
                            value.v = numFormat(Math.sqrt(value.v), 4);
                        }
                        else if (number == 3 && Math.cbrt) {
                            value.v = numFormat(Math.cbrt(value.v), 4);
                        }
                        else {
                            value.v = numFormat(jfnqrt(value.v, number), 4);
                        }
                    }
                    else if (type == "log") {
                        value.v = numFormat(Math.log(value.v) * 10000 / Math.log(Math.abs(number)), 4);
                    }
                    else {
                        value.v = value.v + number;
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

    editor.controlHandler(arr, range);

    if (success && typeof success === 'function') {
        success();
    }
}
