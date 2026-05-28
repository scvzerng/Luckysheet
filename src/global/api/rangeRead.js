import conditionformat from "../../controllers/conditionformat";
import menuButton from "../../controllers/menuButton";
import selection from "../../controllers/selection";
import { selectIsOverlap } from "../../controllers/select";
import sheetmanage from "../../controllers/sheetmanage";
import locale from "../../locale/locale";
import { getRangetxt } from "../../methods/get";
import Store from "../../store";
import { getObjType, replaceHtml } from "../../utils/util";
import { getCurrentSheetOrder, getLastSelection } from '../../utils/storeAccess.js';
import { getBorderInfoCompute } from "../border";
import { getCellHtmlValue, getCellBorderStyle, getMergedCellBorderStyle, dataToJsonObject, dataToJsonNoHeaderObject } from "../../controllers/selection/htmlTableBuilder.js";
import formula from "../formula";
import { getdatabyselection } from "../getdata";
import tooltip from "../tooltip";
import { isEditMode, hasPartMC } from "../validate";

export function getRange() {
    let rangeArr = JSON.parse(JSON.stringify(Store.luckysheet_select_save));

    let result = [];

    for (let i = 0; i < rangeArr.length; i++) {
        let rangeItem = rangeArr[i];
        let temp = {
            row: rangeItem.row,
            column: rangeItem.column
        }
        result.push(temp)
    }

    return result;
}

export function getRangeWithFlatten(range){
    range = range ||  getRange();

    let result = [];

    range.forEach(ele=>{
        // 这个data可能是个范围或者是单个cell
        let rs = ele.row;
        let cs = ele.column;
        for(let r = rs[0]; r <= rs[1]; r++){
            for(let c = cs[0]; c <= cs[1]; c++){
                // r c 当前的r和当前的c
                result.push({r,c});
            }
        }
    })
    return result;
}

export function getRangeValuesWithFlatte(range){
    range = range || getRangeWithFlatten();

    let values = [];

    // 获取到的这个数据不是最新的数据
    range.forEach(item=> {
        values.push(Store.flowdata[item.r][item.c]);
    });
    return values;
}

export function getRangeAxis() {
    let result = [];
    let rangeArr = JSON.parse(JSON.stringify(Store.luckysheet_select_save));
    let sheetIndex = Store.currentSheetIndex;

    rangeArr.forEach(ele=>{
        let axisText = getRangetxt(sheetIndex, {column:ele.column,row:ele.row});
        result.push(axisText);
    })

    return result;
}

export function getRangeValue(options = {}) {
    let curOrder = getCurrentSheetOrder();
    let {
        range,
        order = curOrder
    } = {...options}

    let file = Store.luckysheetfile[order];

    if (!range || typeof range === 'object') {
        return getdatabyselection(range, file.index);
    } else if (typeof range === 'string') {
        if (formula.iscelldata(range)) {
            return getdatabyselection(formula.getcellrange(range), file.index)
        } else {
            tooltip.info('The range is invalid, please check range parameter.', '')
        }
    }
}

export function getRangeHtml(options = {}) {
    let {
        range = Store.luckysheet_select_save,
        order = getCurrentSheetOrder(),
        success
    } = {...options}
    range = JSON.parse(JSON.stringify(range));

    if(getObjType(range) == 'string'){
        if(!formula.iscelldata(range)){
            return tooltip.info("The range parameter is invalid.", "");
        }

        let cellrange = formula.getcellrange(range);
        range = [{
            "row": cellrange.row,
            "column": cellrange.column
        }]
    }
    else if(getObjType(range) == 'object'){
        if(range.row == null || range.column == null){
            return tooltip.info("The range parameter is invalid.", "");
        }

        range = [{
            "row": range.row,
            "column": range.column
        }];
    }

    if(getObjType(range) != 'array'){
        return tooltip.info("The range parameter is invalid.", "");
    }

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    //复制范围内包含部分合并单元格，提示
    let cfg = $.extend(true, {}, file.config);
    if (cfg["merge"] != null) {
        let has_PartMC = false;

        for (let s = 0; s < range.length; s++) {
            let r1 = range[s].row[0],
                r2 = range[s].row[1];
            let c1 = range[s].column[0],
                c2 = range[s].column[1];

            has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

            if (has_PartMC) {
                break;
            }
        }

        if (has_PartMC) {
            return tooltip.info("Cannot perform this operation on partially merged cells", "");
        }
    }

    //多重选区 有条件格式时 提示
    let cdformat = $.extend(true, [], file.luckysheet_conditionformat_save);
    if (range.length > 1 && cdformat.length > 0) {
        let hasCF = false;
        let cf_compute = conditionformat.getComputeMap(file.index);

        for (let s = 0; s < range.length; s++) {
            let r1 = range[s].row[0],
                r2 = range[s].row[1];
            let c1 = range[s].column[0],
                c2 = range[s].column[1];

            for (let r = r1; r <= r2; r++) {
                for (let c = c1; c <= c2; c++) {
                    if (conditionformat.checksCF(r, c, cf_compute) != null) {
                        hasCF = true;
                        break;
                    }
                }

                if (hasCF) {
                    break;
                }
            }

            if (hasCF) {
                break;
            }
        }

        if (hasCF) {
            return tooltip.info("Cannot perform this operation on multiple selection areas, please select a single area", "");
        }
    }

    //多重选区 行不一样且列不一样时 提示
    if (range.length > 1) {
        let isSameRow = true,
            str_r = range[0].row[0],
            end_r = range[0].row[1];
        let isSameCol = true,
            str_c = range[0].column[0],
            end_c = range[0].column[1];

        for (let s = 1; s < range.length; s++) {
            if (range[s].row[0] != str_r || range[s].row[1] != end_r) {
                isSameRow = false;
            }

            if (range[s].column[0] != str_c || range[s].column[1] != end_c) {
                isSameCol = false;
            }
        }

        if ((!isSameRow && !isSameCol) || selectIsOverlap(range)) {
            return tooltip.info("Cannot perform this operation on multiple selection areas, please select a single area", "");
        }
    }

    let rowIndexArr = [], colIndexArr = [];

    for(let s = 0; s < range.length; s++){
        let r1 = range[s].row[0],
            r2 = range[s].row[1];
        let c1 = range[s].column[0],
            c2 = range[s].column[1];

        for(let r = r1; r <= r2; r++){
            if (cfg["rowhidden"] != null && cfg["rowhidden"][r] != null) {
                continue;
            }

            if(!rowIndexArr.includes(r)){
                rowIndexArr.push(r);
            }

            for(let c = c1; c <= c2; c++){
                if (cfg["colhidden"] != null && cfg["colhidden"][c] != null) {
                    continue;
                }

                if(!colIndexArr.includes(c)){
                    colIndexArr.push(c);
                }
            }
        }
    }

    let borderInfoCompute;
    if(cfg["borderInfo"] && cfg["borderInfo"].length > 0){ //边框
        borderInfoCompute = getBorderInfoCompute(file.index);
    }

    let d = file.data;
    if(d == null || d.length == 0){
        d = sheetmanage.buildGridData(file);
    }

    let cpdata = "";
    let colgroup = "";

    rowIndexArr = rowIndexArr.sort((a, b) => a - b);
    colIndexArr = colIndexArr.sort((a, b) => a - b);

    for (let i = 0; i < rowIndexArr.length; i++) {
        let r = rowIndexArr[i];

        if (cfg["rowhidden"] != null && cfg["rowhidden"][r] != null) {
            continue;
        }

        cpdata += '<tr>';

        for (let j = 0; j < colIndexArr.length; j++) {
            let c = colIndexArr[j];

            if (cfg["colhidden"] != null && cfg["colhidden"][c] != null) {
                continue;
            }

            let column = '<td ${span} style="${style}">';

            if (d[r] != null && d[r][c] != null) {
                let style = "", span = "";

                if(r == rowIndexArr[0]){
                    if(cfg["columnlen"] == null || cfg["columnlen"][c.toString()] == null){
                        colgroup += '<colgroup width="72px"></colgroup>';
                    }
                    else {
                        colgroup += '<colgroup width="'+ cfg["columnlen"][c.toString()] +'px"></colgroup>';
                    }
                }

                if(c == colIndexArr[0]){
                    if(cfg["rowlen"] == null || cfg["rowlen"][r.toString()] == null){
                        style += 'height:19px;';
                    }
                    else {
                        style += 'height:'+ cfg["rowlen"][r.toString()] + 'px;';
                    }
                }

                let c_value = getCellHtmlValue(r, c, d);

                style += menuButton.getStyleByCell(d, r, c);

                if(getObjType(d[r][c]) == "object" && ("mc" in d[r][c])){
                    if("rs" in d[r][c]["mc"]){
                        span = 'rowspan="'+ d[r][c]["mc"].rs +'" colspan="'+ d[r][c]["mc"].cs +'"';

                        style += getMergedCellBorderStyle(r, c, d[r][c]["mc"], borderInfoCompute, selection);
                    }
                    else{
                        continue;
                    }
                }
                else{
                    style += getCellBorderStyle(r, c, borderInfoCompute, selection);
                }

                column = replaceHtml(column, {"style": style, "span": span});

                column += c_value;
            }
            else {
                let style = "";

                style += getCellBorderStyle(r, c, borderInfoCompute, selection);

                column += "";

                if(r == rowIndexArr[0]){
                    if(cfg["columnlen"] == null || cfg["columnlen"][c.toString()] == null){
                        colgroup += '<colgroup width="72px"></colgroup>';
                    }
                    else {
                        colgroup += '<colgroup width="'+ cfg["columnlen"][c.toString()] +'px"></colgroup>';
                    }
                }

                if(c == colIndexArr[0]){
                    if(cfg["rowlen"] == null || cfg["rowlen"][r.toString()] == null){
                        style += 'height:19px;';
                    }
                    else {
                        style += 'height:'+ cfg["rowlen"][r.toString()] + 'px;';
                    }
                }

                column = replaceHtml(column, {"style": style, "span": ""});
                column += " ";
            }

            column += '</td>';
            cpdata += column;
        }

        cpdata += "</tr>";
    }

    cpdata = '<table data-type="luckysheet_copy_action_table">' + colgroup + cpdata + '</table>';

    return cpdata;
}

export function getRangeArray(dimensional, options = {}) {
    let dimensionalValues = ['oneDimensional', 'twoDimensional'];

    if(!dimensionalValues.includes(dimensional)){
        return tooltip.info("The dimensional parameter is invalid.", "");
    }

    let {
        range = getLastSelection(),
        order = getCurrentSheetOrder(),
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    if(getObjType(range) == 'string'){
        if(!formula.iscelldata(range)){
            return tooltip.info("The range parameter is invalid.", "");
        }

        range = formula.getcellrange(range);
    }

    if(getObjType(range) != 'object' || range.row == null || range.column == null){
        return tooltip.info("The range parameter is invalid.", "");
    }

    let r1 = range.row[0],
        r2 = range.row[1];
    let c1 = range.column[0],
        c2 = range.column[1];

    //复制范围内包含部分合并单元格，提示
    let cfg = $.extend(true, {}, file.config);
    if(cfg["merge"] != null){
        let has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

        if(has_PartMC){
            return tooltip.info("Cannot perform this operation on partially merged cells", "");
        }
    }

    let data = file.data;
    if(data == null || data.length == 0){
        data = sheetmanage.buildGridData(file);
    }

    let dataArr = [];

    if(dimensional == 'oneDimensional'){//一维数组
        for(let r = r1; r <= r2; r++){
            for(let c = c1; c <= c2; c++){
                let cell = data[r][c];

                if(cell == null || cell.v == null){
                    dataArr.push(null);
                }
                else{
                    dataArr.push(cell.v);
                }
            }
        }
    }
    else if(dimensional == 'twoDimensional'){
        for(let r = r1; r <= r2; r++){
            let row = [];

            for(let c = c1; c <= c2; c++){
                let cell = data[r][c];

                if(cell == null || cell.v == null){
                    row.push(null);
                }
                else{
                    row.push(cell.v);
                }
            }

            dataArr.push(row);
        }
    }

    return dataArr;
}

export function getRangeJson(isFirstRowTitle, options = {}) {
    const locale_drag = locale().drag;
    let curRange = Store.luckysheet_select_save[0];
    let curSheetOrder = getCurrentSheetOrder();
    let {
        range = curRange,
        order = curSheetOrder
    } = {...options}
    let file = Store.luckysheetfile[order];
    let config = file.config;

    if (range && typeof range === 'string' && formula.iscelldata(range)) {
        range = formula.getcellrange(range)
    }

    if (!range || range.length > 1) {
        if(isEditMode()){
            alert(locale_drag.noMulti);
        } else{
            tooltip.info(locale_drag.noMulti, "");
        }
        return;
    }

    //复制范围内包含部分合并单元格，提示
    if(config["merge"] != null) {
        let has_PartMC = false;
        let r1 = range.row[0],
        r2 = range.row[1],
        c1 = range.column[0],
        c2 = range.column[1];
        has_PartMC = hasPartMC(config, r1, r2, c1, c2);

        if(has_PartMC){
            if(isEditMode()){
                alert(locale().drag.noPartMerge);
            } else{
                tooltip.info(locale().drag.noPartMerge, "");
            }
            return;
        }
    }
    let getdata = getdatabyselection(range, file.index);
    if (getdata.length === 0) {
        return;
    }
    let arr = isFirstRowTitle ? dataToJsonObject(getdata) : dataToJsonNoHeaderObject(getdata, range["column"][0]);
    return arr;
}

export function getRangeDiagonal(type, options = {}) {
    let typeValues = ['normal', 'anti', 'offset'];
    if (typeValues.indexOf(type) < 0) {
        return tooltip.info('The type parameter must be included in [\'normal\', \'anti\', \'offset\']', '')
    }

    let curSheetOrder = getCurrentSheetOrder();
    let curRange = JSON.parse(JSON.stringify(Store.luckysheet_select_save));
    let {
        column = 1,
        range = curRange,
        order = curSheetOrder
    } = {...options}

    let file = Store.luckysheetfile[order];
    let config = file.config;

    if (range && typeof range === 'string' && formula.iscelldata(range)) {
        range = formula.getcellrange(range)
    }

    if (!range || range.length > 1) {
        if(isEditMode()){
            alert(locale().drag.noMulti);
        } else{
            tooltip.info(locale().drag.noMulti, "");
        }
        return;
    }

    //复制范围内包含部分合并单元格，提示
    if(config["merge"] != null) {
        let has_PartMC = false;
        let r1 = range[0].row[0],
        r2 = range[0].row[1],
        c1 = range[0].column[0],
        c2 = range[0].column[1];
        has_PartMC = hasPartMC(config, r1, r2, c1, c2);

        if(has_PartMC){
            if(isEditMode()){
                alert(locale().drag.noPartMerge);
            } else{
                tooltip.info(locale().drag.noPartMerge, "");
            }
            return;
        }
    }
    let getdata = getdatabyselection(range, order);
    let arr = [];
    if (getdata.length === 0) {
        return;
    }

    let clen = getdata[0].length;
    switch (type) {
        case 'normal':
            for (let r = 0; r < getdata.length; r++) {
                if (r >= clen) {
                    break;
                }
                arr.push(getdata[r][r]);
            }
            break;
        case 'anti':
            for (let r = 0; r < getdata.length; r++) {
                if (r >= clen) {
                    break;
                }
                arr.push(getdata[r][clen - r - 1]);
            }
            break;
        case 'offset':
            if(column.toString() == "NaN"){
                if(isEditMode()){
                    alert(locale().drag.inputCorrect);
                } else{
                    tooltip.info(locale().drag.inputCorrect, "");
                }
                return;
            }

            if(column < 0){
                if(isEditMode()){
                    alert(locale().drag.offsetColumnLessZero);
                } else{
                    tooltip.info(locale().drag.offsetColumnLessZero, "");
                }
                return;
            }

            for (let r = 0; r < getdata.length; r++) {
                if (r + column >= clen) {
                    break;
                }
                arr.push(getdata[r][r + column]);
            }
            break;
    }
    selection.copybyformat(new Event(), JSON.stringify(arr));
}

export function getRangeBoolean(options = {}) {
    let curSheetOrder = getCurrentSheetOrder();
    let curRange = JSON.parse(JSON.stringify(Store.luckysheet_select_save));
    let {
        range = curRange,
        order = curSheetOrder
    } = {...options}

    let file = Store.luckysheetfile[order];
    let config = file.config;

    if (range && typeof range === 'string' && formula.iscelldata(range)) {
        range = formula.getcellrange(range)
    }

    if (!range || range.length > 1) {
        if(isEditMode()){
            alert(locale().drag.noMulti);
        } else{
            tooltip.info(locale().drag.noMulti, "");
        }
        return;
    }

    //复制范围内包含部分合并单元格，提示
    if(config["merge"] != null) {
        let has_PartMC = false;
        let r1 = range[0].row[0],
        r2 = range[0].row[1],
        c1 = range[0].column[0],
        c2 = range[0].column[1];
        has_PartMC = hasPartMC(config, r1, r2, c1, c2);

        if(has_PartMC){
            if(isEditMode()){
                alert(locale().drag.noPartMerge);
            } else{
                tooltip.info(locale().drag.noPartMerge, "");
            }
            return;
        }
    }
    let getdata = getdatabyselection(range, order);
    let arr = [];
    if (getdata.length === 0) {
        return;
    }
    for (let r = 0; r < getdata.length; r++) {
        let a = [];
        for (let c = 0; c < getdata[0].length; c++) {
            let bool = false;

            let v;
            if(getObjType(getdata[r][c]) == "object"){
                v = getdata[r][c].v;
            } else{
                v = getdata[r][c];
            }

            if (v == null || v == "") {
                bool = false;
            } else {
                v = parseInt(v);
                if (v == null || v > 0) {
                    bool = true;
                } else {
                    bool = false;
                }
            }
            a.push(bool);
        }
        arr.push(a);
    }

    selection.copybyformat(event, JSON.stringify(arr));
}
