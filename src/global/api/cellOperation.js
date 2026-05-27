import menuButton from "../../controllers/menuButton";
import sheetmanage from "../../controllers/sheetmanage";
import { getSheetIndex } from "../../methods/get";
import Store from "../../store";
import { getObjType } from "../../utils/util";
import { update } from "../format";
import formula from "../formula";
import method from "../method";
import { jfrefreshgrid } from "../refresh";
import { setcellvalue } from "../setdata";
import tooltip from "../tooltip";
import { isRealNull, isRealNum } from "../validate";
import { luckysheetDeleteCell } from "../extend";

export function getCellValue(row, column, options = {}) {
    if (!isRealNum(row) || !isRealNum(column)) {
        return tooltip.info('Arguments row or column cannot be null or undefined.', '')
    }
    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        type = 'v',
        order = curSheetOrder
    } = { ...options };
    let targetSheetData = Store.luckysheetfile[order].data;
    let cellData = targetSheetData[row][column];
    let return_v;

    if(getObjType(cellData) == "object"){
        return_v = cellData[type];

        if (type == "f" && return_v != null) {
            return_v = formula.functionHTMLGenerate(return_v);
        }
        else if(type == "f") {
            return_v = cellData["v"];
        }
        else if(cellData && cellData.ct ) {
            if (cellData.ct.fa == 'yyyy-MM-dd') {
                return_v = cellData.m;
            }
            // 修复当单元格内有换行获取不到值的问题
            else if (cellData.ct.hasOwnProperty("t") && cellData.ct.t === 'inlineStr') {
                let inlineStrValueArr = cellData.ct.s;
                if (inlineStrValueArr) {
                    return_v =  inlineStrValueArr.map(i => i.v).join("")
                }
            }
        }

    }

    if(return_v == undefined ){
        return_v = null;
    }

    return return_v;
}

export function setCellValue(row, column, value, options = {}) {
    if (!isRealNum(row) || !isRealNum(column)) {
        return tooltip.info('The row or column parameter is invalid.', '');
    }

    let {
        order = getSheetIndex(Store.currentSheetIndex),
        isRefresh = true,
        triggerBeforeUpdate = true,
        triggerUpdated = true,
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    /* cell更新前触发  */
    if (triggerBeforeUpdate && !method.createHookFunction("cellUpdateBefore", row, column, value, isRefresh)) {
        /* 如果cellUpdateBefore函数返回false 则不执行后续的更新 */
        return;
    }

    let data = file.data;
    if(isRefresh) {
      data = $.extend(true, [], file.data);
    }
    if(data.length == 0){
        data = sheetmanage.buildGridData(file);
    }

    let oldValue
    if (Store.flowdata[row] && Store.flowdata[row][column]) {
      oldValue = JSON.stringify(Store.flowdata[row][column]);
    }

    // formula.updatecell(row, column, value);
    let formatList = {
        //ct:1, //celltype,Cell value format: text, time, etc.
        bg: 1,//background,#fff000
        ff: 1,//fontfamily,
        fc: 1,//fontcolor
        bl: 1,//Bold
        it: 1,//italic
        fs: 1,//font size
        cl: 1,//Cancelline, 0 Regular, 1 Cancelline
        un: 1,//underline, 0 Regular, 1 underlines, fonts
        vt: 1,//Vertical alignment, 0 middle, 1 up, 2 down
        ht: 1,//Horizontal alignment,0 center, 1 left, 2 right
        mc: 1, //Merge Cells
        tr: 1, //Text rotation,0: 0、1: 45 、2: -45、3 Vertical text、4: 90 、5: -90
        tb: 1, //Text wrap,0 truncation, 1 overflow, 2 word wrap
        //v: 1, //Original value
        //m: 1, //Display value
        rt:1, //text rotation angle 0-180 alignment
        //f: 1, //formula
        qp:1 //quotePrefix, show number as string
    }

    if(value == null || value.toString().length == 0){
        formula.delFunctionGroup(row, column);
        setcellvalue(row, column, data, value);
    }
    else if(value instanceof Object){
        let curv = {};
        if(isRealNull(data[row])){
            data[row] = {};
        }
        if(isRealNull(data[row][column])){
            data[row][column] = {};
        }
        let cell = data[row][column];
        if(value.f!=null && value.v==null){
            curv.f = value.f;
            if(value.ct!=null){
                curv.ct = value.ct;
            }
            data = formula.updatecell(row, column, curv, false).data;//update formula value
        }
        else{
            if(value.ct!=null){
                curv.ct = value.ct;
            }
            if(value.f!=null){
                curv.f = value.f;
            } else {
                formula.delFunctionGroup(row, column);
            }
            if(value.v!=null){
                curv.v = value.v;
            }
            else {
                curv.v = cell.v;
            }
            if(value.m!=null){
                curv.m = value.m;
            }
            setcellvalue(row, column, data, curv);//update text value
        }
        for(let attr in value){
            let v = value[attr];
            if(attr in formatList){
                menuButton.updateFormatCell(data, attr, v, row, row, column, column);//change range format
            }
            else {
                cell[attr] = v;
            }
        }
        data[row][column] = cell;
    }
    else{
        if(value.toString().substr(0,1)=="=" || value.toString().substr(0,5)=="<span"){
            data = formula.updatecell(row, column, value, false).data;//update formula value or convert inline string html to object
        }
        else{
            formula.delFunctionGroup(row, column);
            setcellvalue(row, column, data, value);
        }
    }

    /* cell更新后触发  */
    setTimeout(() => {
        let oldValueObj
        if (oldValue) {
          oldValueObj = JSON.parse(oldValue)
        }
        // Hook function
        if (triggerUpdated) {
            method.createHookFunction("cellUpdated", row, column, oldValueObj, Store.flowdata[row][column], isRefresh);
        }

    }, 0);

    if(file.index == Store.currentSheetIndex && isRefresh){
        jfrefreshgrid(data, [{ "row": [row, row], "column": [column, column] }]);//update data, meanwhile refresh canvas and store data to history
    }
    else{
        file.data = data;//only update data
    }

    if (success && typeof success === 'function') {
        success(data);
    }
}

export function clearCell(row, column, options = {}) {
    if (!isRealNum(row) || !isRealNum(column)) {
        return tooltip.info('Arguments row and column cannot be null or undefined.', '')
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        order = curSheetOrder,
        success
    } = {...options}

    let targetSheetData = $.extend(true, [], Store.luckysheetfile[order].data);
    let cell = targetSheetData[row][column];

    if(getObjType(cell) == "object"){
        delete cell["m"];
        delete cell["v"];

        if(cell["f"] != null){
            delete cell["f"];
            formula.delFunctionGroup(row, column, order);

            delete cell["spl"];
        }
    }
    else{
        cell = null;
    }

    // 若操作为当前sheet页，则刷新当前sheet页
    if (order === curSheetOrder) {
        jfrefreshgrid(targetSheetData, [{
            row: [row, row],
            column: [column, column]
        }])
    }
    else{
        Store.luckysheetfile[order].data = targetSheetData;
    }

    if (success && typeof success === 'function') {
        success(cell)
    }
}

export function deleteCell(move, row, column, options = {}) {
    let moveTypes = ['left', 'up'];
    if (!move || moveTypes.indexOf(move) < 0) {
        return tooltip.info('Arguments move cannot be null or undefined and its value must be \'left\' or \'up\'', '')
    }

    if (!isRealNum(row) || !isRealNum(column)) {
        return tooltip.info('Arguments row and column cannot be null or undefined.', '')
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        order = curSheetOrder,
        success
    } = {...options}

    let moveType = 'move' + move.replace(move[0], move[0].toUpperCase()); // left-moveLeft;  up-moveUp

    let sheetIndex;
    if(order){
        if(Store.luckysheetfile[order]){
            sheetIndex = Store.luckysheetfile[order].index;
        }
    }

    luckysheetDeleteCell(moveType, row, row, column, column, sheetIndex);

    if (success && typeof success === 'function') {
        success()
    }
}

export function setCellFormat(row, column, attr, value, options = {}) {
    if (!isRealNum(row) || !isRealNum(column)) {
        return tooltip.info('Arguments row or column cannot be null or undefined.', '')
    }

    if (!attr) {
        return tooltip.info('Arguments attr cannot be null or undefined.', '')
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        order = curSheetOrder,
        success
    } = { ...options };

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let targetSheetData = $.extend(true, [], file.data);
    if(targetSheetData.length == 0){
        targetSheetData = sheetmanage.buildGridData(file);
    }

    let cellData = targetSheetData[row][column] || {};
    let cfg = $.extend(true, {}, file.config);

    // 特殊格式
    if (attr == 'ct' && (!value || !value.hasOwnProperty('fa') || !value.hasOwnProperty('t'))) {
        return new TypeError('While set attribute \'ct\' to cell, the value must have property \'fa\' and \'t\'')
    }

    if (attr == 'bd') {
        if(cfg["borderInfo"] == null){
            cfg["borderInfo"] = [];
        }

        let borderInfo = {
            rangeType: "range",
            borderType: "border-all",
            color: "#000",
            style: "1",
            range: [{
                column: [column, column],
                row: [row, row]
            }],
            ...value,
        }

        cfg["borderInfo"].push(borderInfo);
    } else {
        cellData[attr] = value;
    }

    targetSheetData[row][column] = cellData;

    // refresh
    if(file.index == Store.currentSheetIndex){
        file.config = cfg;
        Store.config = cfg;
        jfrefreshgrid(targetSheetData, [{ "row": [row, row], "column": [column, column] }]);
    }
    else {
        file.config = cfg;
        file.data = targetSheetData;
    }

    if (success && typeof success === 'function') {
        success(cellData);
    }
}
