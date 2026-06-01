import {  luckysheetContainerFocus  } from '../../utils/util';
import {  isEditMode  } from '../../global/validate';
import {  getdatabyselection } from '../../global/getdata';
import tooltip from '../../global/tooltip';
import editor from '../../global/editor';
import locale from '../../locale/locale';
import Store from '../../store';

function initialMatrixFlipOperation() {
    const locale_drag = locale().drag;
    //矩阵操作选区 翻转 上下
    const _elTurnUp = document.getElementById("luckysheet-matrix-turn-up"); if (_elTurnUp) _elTurnUp.addEventListener("click", function (event) {
        document.querySelectorAll("body .luckysheet-cols-menu").forEach(el => el.style.display = 'none');
        luckysheetContainerFocus();

        if(Store.selections.length > 1){
            if(isEditMode()){
                alert(locale_drag.noMulti);
            }
            else{
                tooltip.info(locale_drag.noMulti, "");
            }
            return;
        }

        let getdata = getdatabyselection(Store.selections[0]);
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
    const _elTurnLeft = document.getElementById("luckysheet-matrix-turn-left"); if (_elTurnLeft) _elTurnLeft.addEventListener("click", function (event) {
        document.querySelectorAll("body .luckysheet-cols-menu").forEach(el => el.style.display = 'none');
        luckysheetContainerFocus();

        if(Store.selections.length > 1){
            if(isEditMode()){
                alert(locale_drag.noMulti);
            }
            else{
                tooltip.info(locale_drag.noMulti, "");
            }
            return;
        }

        let getdata = getdatabyselection(Store.selections[0]);
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
    const _elTurnCw = document.getElementById("luckysheet-matrix-turn-cw"); if (_elTurnCw) _elTurnCw.addEventListener("click", function (event) {
        document.querySelectorAll("body .luckysheet-cols-menu").forEach(el => el.style.display = 'none');
        luckysheetContainerFocus();

        if(Store.selections.length > 1){
            if(isEditMode()){
                alert(locale_drag.noMulti);
            }
            else{
                tooltip.info(locale_drag.noMulti, "");
            }
            return;
        }

        let getdata = getdatabyselection(Store.selections[0]);
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
    const _elTurnAnticw = document.getElementById("luckysheet-matrix-turn-anticw"); if (_elTurnAnticw) _elTurnAnticw.addEventListener("click", function (event) {
        document.querySelectorAll("body .luckysheet-cols-menu").forEach(el => el.style.display = 'none');
        luckysheetContainerFocus();

        if(Store.selections.length > 1){
            if(isEditMode()){
                alert(locale_drag.noMulti);
            }
            else{
                tooltip.info(locale_drag.noMulti, "");
            }
            return;
        }

        let getdata = getdatabyselection(Store.selections[0]);
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
    const _elTurnTrans = document.getElementById("luckysheet-matrix-turn-trans"); if (_elTurnTrans) _elTurnTrans.addEventListener("click", function (event) {
        document.querySelectorAll("body .luckysheet-cols-menu").forEach(el => el.style.display = 'none');
        luckysheetContainerFocus();

        if(Store.selections.length > 1){
            if(isEditMode()){
                alert(locale_drag.noMulti);
            }
            else{
                tooltip.info(locale_drag.noMulti, "");
            }
            return;
        }

        let getdata = getdatabyselection(Store.selections[0]);
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
