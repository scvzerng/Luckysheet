import selection from '../selection';
import { getObjType, chatatABC, numFormat, luckysheetContainerFocus } from '../../utils/util';
import { hasPartMC, isEditMode } from '../../global/validate';
import { getdatabyselection, getcellvalue } from '../../global/getdata';
import tooltip from '../../global/tooltip';
import editor from '../../global/editor';
import locale from '../../locale/locale';
import Store from '../../store';
import { checkMultiSelection, checkPartMerge } from './matrixValidation';

function initialCopyFormatOperation() {
    const locale_drag = locale().drag;

    //右键功能键
    //复制为json格式字符串，首行为标题
    $("#luckysheet-copy-json-head").click(function (event) {
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

        //复制范围内包含部分合并单元格，提示
        if(Store.config["merge"] != null){
            let has_PartMC = false;

            for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                let r1 = Store.luckysheet_select_save[s].row[0], 
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0], 
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if(has_PartMC){
                    break;
                }
            }

            if(has_PartMC){
                if(isEditMode()){
                    alert(locale_drag.noPartMerge);
                }
                else{
                    tooltip.info(locale_drag.noPartMerge, ""); 
                }
                return;    
            }
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        let arr = [];
        if (getdata.length == 0) {
            return;
        }

        if (getdata.length == 1) {
            let obj = {};
            for (let i = 0; i < getdata[0].length; i++) {
                obj[getcellvalue(0, i, getdata)] = "";
            }
            arr.push(obj);
        }
        else {
            for (let r = 1; r < getdata.length; r++) {
                let obj = {};
                for (let c = 0; c < getdata[0].length; c++) {
                    if(getcellvalue(0, c, getdata) == undefined){
                        obj[""] = getcellvalue(r, c, getdata);
                    }else{
                        obj[getcellvalue(0, c, getdata)] = getcellvalue(r, c, getdata);
                    }
                }
                arr.push(obj);
            }
        }

        selection.copybyformat(event, JSON.stringify(arr));
    });

    //复制为json格式字符串，无标题，采用ABCD作为标题
    $("#luckysheet-copy-json-nohead").click(function (event) {
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

        //复制范围内包含部分合并单元格，提示
        if(Store.config["merge"] != null){
            let has_PartMC = false;

            for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                let r1 = Store.luckysheet_select_save[s].row[0], 
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0], 
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if(has_PartMC){
                    break;
                }
            }

            if(has_PartMC){
                if(isEditMode()){
                    alert(locale_drag.noPartMerge);
                }
                else{
                    tooltip.info(locale_drag.noPartMerge, ""); 
                }
                return;    
            }
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        let arr = [];
        if (getdata.length == 0) {
            return;
        }
        let st = Store.luckysheet_select_save[0]["column"][0];
        for (let r = 0; r < getdata.length; r++) {
            let obj = {};
            for (let c = 0; c < getdata[0].length; c++) {
                obj[chatatABC(c + st)] = getcellvalue(r, c, getdata);
            }
            arr.push(obj);
        }

        selection.copybyformat(event, JSON.stringify(arr));
    });

    //复制为一维数组
    $("#luckysheet-copy-array1").click(function (event) {
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

        //复制范围内包含部分合并单元格，提示
        if(Store.config["merge"] != null){
            let has_PartMC = false;

            for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                let r1 = Store.luckysheet_select_save[s].row[0], 
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0], 
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if(has_PartMC){
                    break;
                }
            }

            if(has_PartMC){
                if(isEditMode()){
                    alert(locale_drag.noPartMerge);
                }
                else{
                    tooltip.info(locale_drag.noPartMerge, ""); 
                }
                return;    
            }
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        let arr = [];
        if (getdata.length == 0) {
            return;
        }
        for (let r = 0; r < getdata.length; r++) {
            for (let c = 0; c < getdata[0].length; c++) {
                arr.push(getcellvalue(r, c, getdata));
            }
        }

        selection.copybyformat(event, JSON.stringify(arr));
    });

    //复制为二维数组
    $("#luckysheet-copy-array2").click(function (event) {
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

        //复制范围内包含部分合并单元格，提示
        if(Store.config["merge"] != null){
            let has_PartMC = false;

            for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                let r1 = Store.luckysheet_select_save[s].row[0], 
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0], 
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if(has_PartMC){
                    break;
                }
            }

            if(has_PartMC){
                if(isEditMode()){
                    alert(locale_drag.noPartMerge);
                }
                else{
                    tooltip.info(locale_drag.noPartMerge, ""); 
                }
                return;    
            }
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        let arr = [];
        if (getdata.length == 0) {
            return;
        }
        for (let r = 0; r < getdata.length; r++) {
            let a = [];
            for (let c = 0; c < getdata[0].length; c++) {
                a.push(getcellvalue(r, c, getdata));
            }
            arr.push(a);
        }

        selection.copybyformat(event, JSON.stringify(arr));
    });

    //复制为多维数组
    $("#luckysheet-copy-arraymore-confirm").click(function (event) {

        // Click input element, don't comfirm 
        if(event.target.nodeName === 'INPUT'){
            return;
        }

        $("body .luckysheet-cols-menu").hide();

        if(Store.luckysheet_select_save.length > 1){
            if(isEditMode()){
                alert(locale_drag.noMulti);
            }
            else{
                tooltip.info(locale_drag.noMulti, "");
            }
            return;
        }

        //复制范围内包含部分合并单元格，提示
        if(Store.config["merge"] != null){
            let has_PartMC = false;

            for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                let r1 = Store.luckysheet_select_save[s].row[0], 
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0], 
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if(has_PartMC){
                    break;
                }
            }

            if(has_PartMC){
                if(isEditMode()){
                    alert(locale_drag.noPartMerge);
                }
                else{
                    tooltip.info(locale_drag.noPartMerge, ""); 
                }
                return;    
            }
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        let arr = [];
        if (getdata.length == 0) {
            return;
        }

        for (let r = 0; r < getdata.length; r++) {
            for (let c = 0; c < getdata[0].length; c++) {
                arr.push(getdata[r][c]);
            }
        }

        let row = $("#luckysheet-copy-arraymore-row").val(), col = $("#luckysheet-copy-arraymore-col").val();

        if (row == "" && col == "") {
            selection.copybyformat(event, JSON.stringify(arr));
            $("body .luckysheet-cols-menu").hide();
            return;
        }

        if (row == "") {
            row = 1;
        }
        else {
            row = parseInt(row);
            if (row == null) {
                row = 1;
            }
        }

        if (col == "") {
            col = 1;
        }
        else {
            col = parseInt(col);
            if (col == null) {
                col = 1;
            }
        }

        if(row.toString() == "NaN" || col.toString() == "NaN"){
            if(isEditMode()){
                alert(locale_drag.inputCorrect);
            }
            else{
                tooltip.info(locale_drag.inputCorrect, "");
            }
            return;
        }

        if(row < 1 || col < 1){
            if(isEditMode()){
                alert(locale_drag.notLessOne);
            }
            else{
                tooltip.info(locale_drag.notLessOne, "");
            }
            return;
        }

        let arrlen = arr.length, i = 0, ret = [];
        for (let r = 0; r < row; r++) {
            let a = [];
            for (let c = 0; c < col; c++) {
                a.push(arr[i++]);
                if (i >= arrlen) {
                    selection.copybyformat(event, JSON.stringify(ret));
                    $("body .luckysheet-cols-menu").hide();
                    return;
                }
            }
            ret.push(a);
        }

        selection.copybyformat(event, JSON.stringify(ret));
    });

    //复制为对角线
    $("#luckysheet-copy-diagonal").click(function (event) {
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

        //复制范围内包含部分合并单元格，提示
        if(Store.config["merge"] != null){
            let has_PartMC = false;

            for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                let r1 = Store.luckysheet_select_save[s].row[0], 
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0], 
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if(has_PartMC){
                    break;
                }
            }

            if(has_PartMC){
                if(isEditMode()){
                    alert(locale_drag.noPartMerge);
                }
                else{
                    tooltip.info(locale_drag.noPartMerge, ""); 
                }
                return;    
            }
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        let arr = [];
        if (getdata.length == 0) {
            return;
        }

        let clen = getdata[0].length;
        for (let r = 0; r < getdata.length; r++) {
            if (r >= clen) {
                break;
            }
            arr.push(getdata[r][r]);
        }

        selection.copybyformat(event, JSON.stringify(arr));
    });

    //复制为反对角线
    $("#luckysheet-copy-antidiagonal").click(function (event) {
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

        //复制范围内包含部分合并单元格，提示
        if(Store.config["merge"] != null){
            let has_PartMC = false;

            for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                let r1 = Store.luckysheet_select_save[s].row[0], 
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0], 
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if(has_PartMC){
                    break;
                }
            }

            if(has_PartMC){
                if(isEditMode()){
                    alert(locale_drag.noPartMerge);
                }
                else{
                    tooltip.info(locale_drag.noPartMerge, ""); 
                }
                return;    
            }
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        let arr = [];
        if (getdata.length == 0) {
            return;
        }

        let clen = getdata[0].length;
        for (let r = 0; r < getdata.length; r++) {
            if (r >= clen) {
                break;
            }
            arr.push(getdata[r][clen - r - 1]);
        }

        selection.copybyformat(event, JSON.stringify(arr));
    });

    //复制为对角偏移n列
    $("#luckysheet-copy-diagonaloffset").click(function (event) {

        // Click input element, don't comfirm 
        if(event.target.nodeName === 'INPUT'){
            return;
        }
        
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

        //复制范围内包含部分合并单元格，提示
        if(Store.config["merge"] != null){
            let has_PartMC = false;

            for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                let r1 = Store.luckysheet_select_save[s].row[0], 
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0], 
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if(has_PartMC){
                    break;
                }
            }

            if(has_PartMC){
                if(isEditMode()){
                    alert(locale_drag.noPartMerge);
                }
                else{
                    tooltip.info(locale_drag.noPartMerge, ""); 
                }
                return;    
            }
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        let arr = [];
        if (getdata.length == 0) {
            return;
        }

        let clen = getdata[0].length, 
            offset = parseInt($("#luckysheet-copy-diagonaloffset-value").val());

        if(offset.toString() == "NaN"){
            if(isEditMode()){
                alert(locale_drag.inputCorrect);
            }
            else{
                tooltip.info(locale_drag.inputCorrect, "");
            }
            return;
        }

        if(offset < 0){
            if(isEditMode()){
                alert(locale_drag.offsetColumnLessZero);
            }
            else{
                tooltip.info(locale_drag.offsetColumnLessZero, "");
            }
            return;
        }

        if (offset == null) {
            offset = 1;
        }

        for (let r = 0; r < getdata.length; r++) {
            if (r + offset >= clen) {
                break;
            }
            arr.push(getdata[r][r + offset]);
        }

        selection.copybyformat(event, JSON.stringify(arr));
    });

    //复制为布尔值
    $("#luckysheet-copy-boolvalue").click(function (event) {
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

        //复制范围内包含部分合并单元格，提示
        if(Store.config["merge"] != null){
            let has_PartMC = false;

            for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                let r1 = Store.luckysheet_select_save[s].row[0], 
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0], 
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if(has_PartMC){
                    break;
                }
            }

            if(has_PartMC){
                if(isEditMode()){
                    alert(locale_drag.noPartMerge);
                }
                else{
                    tooltip.info(locale_drag.noPartMerge, ""); 
                }
                return;    
            }
        }

        let getdata = getdatabyselection(Store.luckysheet_select_save[0]);
        let arr = [];
        if (getdata.length == 0) {
            return;
        }
        for (let r = 0; r < getdata.length; r++) {
            let a = [];
            for (let c = 0; c < getdata[0].length; c++) {
                let bool = false;

                let v;
                if(getObjType(getdata[r][c]) == "object"){
                    v = getdata[r][c].v;
                }
                else{
                    v = getdata[r][c];
                }

                if (v == null || v == "") {
                    bool = false;
                }
                else {
                    v = parseInt(v);
                    if (v == null || v > 0) {
                        bool = true;
                    }
                    else {
                        bool = false;
                    }
                }
                a.push(bool);
            }
            arr.push(a);
        }

        selection.copybyformat(event, JSON.stringify(arr));
    });
}

export { initialCopyFormatOperation };
