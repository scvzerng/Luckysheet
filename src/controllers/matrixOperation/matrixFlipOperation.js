import selection from '../selection';
import { getObjType, chatatABC, numFormat, luckysheetContainerFocus } from '../../utils/util';
import { hasPartMC, isEditMode } from '../../global/validate';
import { getdatabyselection, getcellvalue } from '../../global/getdata';
import tooltip from '../../global/tooltip';
import editor from '../../global/editor';
import locale from '../../locale/locale';
import Store from '../../store';
import { checkMultiSelection } from './matrixValidation';

function initialMatrixFlipOperation() {
    //矩阵操作选区 翻转 上下
    $("#luckysheet-matrix-turn-up").click(function (event) {
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

        editor.controlHandler(arr);
    });

    //矩阵操作选区 翻转 左右
    $("#luckysheet-matrix-turn-left").click(function (event) {
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

        editor.controlHandler(arr);
    });

    //矩阵操作选区 翻转 顺时针
    $("#luckysheet-matrix-turn-cw").click(function (event) {
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

        editor.controlHandlerD(arr);
    });

    //矩阵操作选区 翻转 逆时针
    $("#luckysheet-matrix-turn-anticw").click(function (event) {
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

        editor.controlHandlerD(arr);
    });

    //矩阵操作选区 转置
    $("#luckysheet-matrix-turn-trans").click(function (event) {
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

        editor.controlHandlerD(arr);
    });
}

export { initialMatrixFlipOperation };
