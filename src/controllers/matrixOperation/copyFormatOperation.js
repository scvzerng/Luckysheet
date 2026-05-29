import selection from '../selection';
import {  getObjType,  chatatABC,  luckysheetContainerFocus  } from '../../utils/util';
import { hasPartMC, isEditMode } from '../../global/validate';
import { getdatabyselection, getcellvalue } from '../../global/getdata';
import tooltip from '../../global/tooltip';
import locale from '../../locale/locale';
import Store from '../../store';

function initialCopyFormatOperation() {
    const locale_drag = locale().drag;

    //右键功能键
    //复制为json格式字符串，首行为标题
    document.getElementById("luckysheet-copy-json-head").addEventListener("click", function (event) {
        document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
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
        if (getdata === null) {
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
    document.getElementById("luckysheet-copy-json-nohead").addEventListener("click", function (event) {
        document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
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
        if (getdata === null) {
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
    document.getElementById("luckysheet-copy-array1").addEventListener("click", function (event) {
        document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
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
        if (getdata === null) {
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
    document.getElementById("luckysheet-copy-array2").addEventListener("click", function (event) {
        document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
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
        if (getdata === null) {
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
    document.getElementById("luckysheet-copy-arraymore-confirm").addEventListener("click", function (event) {

        // Click input element, don't comfirm 
        if(event.target.nodeName === 'INPUT'){
            return;
        }

        document.querySelector("body .luckysheet-cols-menu").style.display = 'none';

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
        if (getdata === null) {
            return;
        }

        for (let r = 0; r < getdata.length; r++) {
            for (let c = 0; c < getdata[0].length; c++) {
                arr.push(getdata[r][c]);
            }
        }

        let row = document.getElementById("luckysheet-copy-arraymore-row").value, col = document.getElementById("luckysheet-copy-arraymore-col").value;

        if (row == "" && col == "") {
            selection.copybyformat(event, JSON.stringify(arr));
            document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
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
                    document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
                    return;
                }
            }
            ret.push(a);
        }

        selection.copybyformat(event, JSON.stringify(ret));
    });

    //复制为对角线
    document.getElementById("luckysheet-copy-diagonal").addEventListener("click", function (event) {
        document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
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
        if (getdata === null) {
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
    document.getElementById("luckysheet-copy-antidiagonal").addEventListener("click", function (event) {
        document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
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
        if (getdata === null) {
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
    document.getElementById("luckysheet-copy-diagonaloffset").addEventListener("click", function (event) {

        // Click input element, don't comfirm 
        if(event.target.nodeName === 'INPUT'){
            return;
        }
        
        document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
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
        if (getdata === null) {
            return;
        }

        let clen = getdata[0].length, 
            offset = parseInt(document.getElementById("luckysheet-copy-diagonaloffset-value").value);

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
    document.getElementById("luckysheet-copy-boolvalue").addEventListener("click", function (event) {
        document.querySelector("body .luckysheet-cols-menu").style.display = 'none';
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
        if (getdata === null) {
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
