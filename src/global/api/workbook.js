import { luckysheetdefaultstyle } from "../../controllers/constant";
import controlHistory from "../../controllers/controlHistory";
import luckysheetsizeauto from "../../controllers/resize";
import sheetmanage from "../../controllers/sheetmanage";
import { getluckysheetfile } from "../../methods/get";
import Store from "../../store";
import { getObjType, luckysheetactiveCell } from "../../utils/util";
import { getCurrentSheetOrder, getDataSize, getLastSelection } from '../../utils/storeAccess.js';
import { luckysheetDrawMain } from "../draw";
import formula from "../formula";
import { jfrefreshgrid, jfrefreshgrid_rhcw, luckysheetrefreshgrid } from "../refresh";
import tooltip from "../tooltip";
import { isRealNum, hasPartMC } from "../validate";

export function showGridLines(options = {}){
    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    file.showGridLines = true;

    if(file.index == Store.currentSheetIndex){
        Store.showGridLines = true;

        setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1);
    }

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    return file;
}

export function hideGridLines(options = {}){
    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    file.showGridLines = false;

    if(file.index == Store.currentSheetIndex){
        Store.showGridLines = false;

        setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1);
    }

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    return file;
}

export function refresh(options = {}) {
    // luckysheetrefreshgrid();
    jfrefreshgrid();

    let {
        success
    } = {...options}

    if (success && typeof success === 'function') {
        success();
    }
}

export function scroll(options = {}){
    let {
        scrollLeft,
        scrollTop,
        targetRow,
        targetColumn,
        success
    } = {...options}

    if(scrollLeft != null){
        if(!isRealNum(scrollLeft)){
            return tooltip.info("The scrollLeft parameter is invalid.", "");
        }

        $("#luckysheet-scrollbar-x").scrollLeft(scrollLeft);
    }
    else if(targetColumn != null){
        if(!isRealNum(targetColumn)){
            return tooltip.info("The targetColumn parameter is invalid.", "");
        }

        let col = Store.visibledatacolumn[targetColumn],
            col_pre = targetColumn <= 0 ? 0 : Store.visibledatacolumn[targetColumn - 1];

        $("#luckysheet-scrollbar-x").scrollLeft(col_pre);
    }


    if(scrollTop != null){
        if(!isRealNum(scrollTop)){
            return tooltip.info("The scrollTop parameter is invalid.", "");
        }

        $("#luckysheet-scrollbar-y").scrollTop(scrollTop);
    }
    else if(targetRow != null){
        if(!isRealNum(targetRow)){
            return tooltip.info("The targetRow parameter is invalid.", "");
        }

        let row = Store.visibledatarow[targetRow],
            row_pre = targetRow <= 0 ? 0 : Store.visibledatarow[targetRow - 1];

        $("#luckysheet-scrollbar-y").scrollTop(row_pre);
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function resize(options = {}){
    luckysheetsizeauto();

    let {
        success
    } = {...options}

    if (success && typeof success === 'function') {
        success();
    }
}

export function getScreenshot(options = {}) {
    let {
        range = getLastSelection(),
    } = {...options}

    if(getObjType(range) == 'string'){
        if(!formula.iscelldata(range)){
            return tooltip.info("The range parameter is invalid.", "");
        }

        let cellrange = formula.getcellrange(range);
        range = {
            "row": cellrange.row,
            "column": cellrange.column
        };
    }

    if(getObjType(range) != 'object' || range.row == null || range.column == null){
        return tooltip.info("The range parameter is invalid.", "");
    }

    let str = range.row[0],
        edr = range.row[1],
        stc = range.column[0],
        edc = range.column[1];

    let has_PartMC = hasPartMC(Store.config, str, edr, stc, edc);

    if(has_PartMC){
        return tooltip.info('Cannot perform this operation on partially merged cells', '');
    }

    let visibledatarow = Store.visibledatarow;
    let visibledatacolumn = Store.visibledatacolumn;

    let scrollHeight, rh_height;
    if (str - 1 < 0) {
        scrollHeight = 0;
        rh_height = visibledatarow[edr];
    }
    else {
        scrollHeight = visibledatarow[str - 1];
        rh_height = visibledatarow[edr] - visibledatarow[str - 1];
    }

    let scrollWidth, ch_width;
    if (stc - 1 < 0) {
        scrollWidth = 0;
        ch_width = visibledatacolumn[edc];
    }
    else {
        scrollWidth = visibledatacolumn[stc - 1];
        ch_width = visibledatacolumn[edc] - visibledatacolumn[stc - 1];
    }

    let newCanvas = $("<canvas>").attr({
        width: Math.ceil(ch_width * Store.devicePixelRatio),
        height: Math.ceil(rh_height * Store.devicePixelRatio)
    }).css({ width: ch_width, height: rh_height });

    luckysheetDrawMain(scrollWidth, scrollHeight, ch_width, rh_height, 1, 1, null, null, newCanvas);
    let ctx_newCanvas = newCanvas.get(0).getContext("2d");

    //补上 左边框和上边框
    ctx_newCanvas.beginPath();
    ctx_newCanvas.moveTo(
        0,
        0
    );
    ctx_newCanvas.lineTo(
        0,
        Store.devicePixelRatio * rh_height
    );
    ctx_newCanvas.lineWidth = Store.devicePixelRatio * 2;
    ctx_newCanvas.strokeStyle = luckysheetdefaultstyle.strokeStyle;
    ctx_newCanvas.stroke();
    ctx_newCanvas.closePath();

    ctx_newCanvas.beginPath();
    ctx_newCanvas.moveTo(
        0,
        0
    );
    ctx_newCanvas.lineTo(
        Store.devicePixelRatio * ch_width,
        0
    );
    ctx_newCanvas.lineWidth = Store.devicePixelRatio * 2;
    ctx_newCanvas.strokeStyle = luckysheetdefaultstyle.strokeStyle;
    ctx_newCanvas.stroke();
    ctx_newCanvas.closePath();

    let url = newCanvas.get(0).toDataURL("image/png");

    return url;
}

export function setWorkbookName(name, options = {}) {
    if(name == null || name.toString().length == 0){
        return tooltip.info("The name parameter is invalid.", "");
    }

    $("#luckysheet_info_detail_input").val(name);

    let {
        success
    } = {...options}

    if (success && typeof success === 'function') {
        success();
    }
}

export function getWorkbookName(options = {}) {

    let name = "";
    let element = $("#luckysheet_info_detail_input");

    if(element.length == 0){

        tooltip.info('Failed to get workbook name, label loading failed!');
        return name;

    }

    name = $.trim(element.val());

    let {
        success
    } = {...options}

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success()
        }
    }, 1)

    return name;
}

export function undo(options = {}) {
    let ctr = $.extend(true, {}, Store.jfredo[Store.jfredo.length - 1]);

    controlHistory.redo(new Event('custom'));
    luckysheetactiveCell();

    let {
        success
    } = {...options}

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    return ctr;
}

export function redo(options = {}) {
    let ctr = $.extend(true, {}, Store.jfundo[Store.jfundo.length - 1]);

    controlHistory.undo(new Event('custom'));
    luckysheetactiveCell();

    let {
        success
    } = {...options}

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    return ctr;
}

export function getAllSheets() {
    let data = $.extend(true, [], Store.luckysheetfile);

    data.forEach((item, index, arr) => {
        if(item.data != null && item.data.length > 0){
            item.celldata = sheetmanage.getGridData(item.data);
        }

        delete item.load;
        delete item.freezen;
    })

    return data;
}

export function getSheet(options = {}){

    let {
        index,
        order,
        name
    } = {...options};

    if(index != null){
        return sheetmanage.getSheetByIndex(index);
    }else if(order != null){
        return Store.luckysheetfile[order];
    }else if(name != null){
        return sheetmanage.getSheetByName(name);
    }

    return sheetmanage.getSheetByIndex();

}

export function getSheetData(options = {}) {
    let {
        order = getCurrentSheetOrder()
    } = {...options};

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let data = $.extend(true, [], file.data);

    if(data == null || data.length == 0){
        data = $.extend(true, [], sheetmanage.buildGridData(file));
    }

    return data;
}

export function getConfig(options = {}) {
    let {
        order = getCurrentSheetOrder()
    } = {...options};

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let config = $.extend(true, {}, file.config);

    return config;
}

export function setConfig(cfg, options = {}) {
    if(getObjType(cfg) != 'object'){
        return tooltip.info("The cfg parameter is invalid.", "");
    }

    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options};

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    file.config = cfg;

    if(file.index == Store.currentSheetIndex){
        Store.config = cfg;

        if("rowhidden" in cfg || "colhidden" in cfg || "rowlen" in cfg || "columnlen" in cfg){
            let _dataSize = getDataSize();
            jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);
        }

        setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1);
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function getLuckysheetfile(){
    return getluckysheetfile();
}

export function toJson(){

    const toJsonOptions = Store.toJsonOptions;

    // Workbook name
    toJsonOptions.title = $("#luckysheet_info_detail_input").val();

    toJsonOptions.data = getAllSheets();

    // row and column
    getluckysheetfile().forEach((file,index)=>{

        if(file.data == undefined){
            return;
        }
        toJsonOptions.data[index].row = getObjType(file.data) === 'array' ? file.data.length : 0;
        toJsonOptions.data[index].column = getObjType(file.data[0]) === 'array' ? file.data[0].length : 0;

    })

    return toJsonOptions;
}

export function changLang(lang = 'zh'){
    if(!['zh', 'en', 'es'].includes(lang)){
        return tooltip.info("The lang parameter is invalid.", "");
    }

    let options = toJson();
    options.lang = lang;
    luckysheet.create(options);
}
