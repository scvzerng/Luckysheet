import { deepMerge } from '../../utils/migrationHelpers.js';
import imageCtrl from "../../controllers/imageCtrl";
import { sheetHTML } from "../../controllers/constant";
import sheetmanage from "../../controllers/sheetmanage";
import { zoomNumberDomBind, zoomRefreshView } from "../../controllers/zoom";
import locale from "../../locale/locale";
import Store from "../../store";
import { getObjType, replaceHtml } from "../../utils/util";
import { getCurrentSheetOrder } from '../../utils/storeAccess.js';
import cleargridelement from "../cleargridelement";
import tooltip from "../tooltip";
import { isRealNum } from "../validate";
import sheetContainer from '../../ui/sheetContainer.js';
import cellMain from '../../ui/cellMain.js';

export function setSheetAdd(options = {}) {
    let lastOrder = Store.luckysheetfile.length - 1;
    let {
        sheetObject = {},
        order = lastOrder,
        success
    } = {...options}

    if(!isRealNum(order)){
        return tooltip.info("Parameter is not a table index", "");
    }

    order = Number(order);

    let index = sheetmanage.generateRandomSheetIndex();
    // calcChain公式链里的index也要跟着变化
    if (sheetObject.calcChain && sheetObject.calcChain !== null) {
        sheetObject.calcChain.forEach((item) => {
            item.index = index
        })
    }
    let sheetname = sheetmanage.generateRandomSheetName(Store.luckysheetfile, false);
    if(sheetObject.name){
        let sameName = false;

        for(let i = 0; i < Store.luckysheetfile.length; i++){
            if(Store.luckysheetfile[i].name == sheetObject.name){
                sameName = true;
                break;
            }
        }

        if(!sameName){
            sheetname = sheetObject.name;
        }
    }

    sheetContainer.append(replaceHtml(sheetHTML, {
        "index": index,
        "active": "",
        "name": sheetname,
        "style": "",
        "colorset": ""
    }));

    let sheetconfig = {
        "name": "",
        "color": "",
        "status": "0",
        "order": "",
        "index": "",
        "celldata": [],
        "row": Store.defaultrowNum,
        "column": Store.defaultcolumnNum,
        "config": {},
    };
    sheetconfig = deepMerge(sheetconfig, sheetObject);

    sheetconfig.index = index;
    sheetconfig.name = sheetname;
    sheetconfig.order = order;

    if(order <= 0){
        let beforeIndex = Store.luckysheetfile[0].index;
        let beforeObj = document.getElementById("luckysheet-sheets-item" + beforeIndex);
        beforeObj.parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + index), beforeObj);

        Store.luckysheetfile.splice(0, 0, sheetconfig);
    }
    else{
        if(order > Store.luckysheetfile.length){
            order = Store.luckysheetfile.length;
        }

        let afterIndex = Store.luckysheetfile[order - 1].index;
        let afterObj = document.getElementById("luckysheet-sheets-item" + afterIndex);
        afterObj.parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + index), afterObj.nextElementSibling);

        Store.luckysheetfile.splice(order, 0, sheetconfig);
    }

    let orders = {};

    Store.luckysheetfile.forEach((item, i, arr) => {
        arr[i].order = i;
        orders[item.index.toString()] = i;
    })

    document.querySelector("#luckysheet-sheet-area div.luckysheet-sheets-item").classList.remove("luckysheet-sheets-item-active");
    document.getElementById("luckysheet-sheets-item" + index).classList.add("luckysheet-sheets-item-active");
    cellMain.append('<div id="luckysheet-datavisual-selection-set-' + index + '" class="luckysheet-datavisual-selection-set"></div>');
    cleargridelement(true);


    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;
        let redo = {};
        redo["type"] = "addSheet";
        redo["sheetconfig"] = structuredClone(sheetconfig);
        redo["index"] = index;
        redo["currentSheetIndex"] = Store.currentSheetIndex;
        Store.jfredo.push(redo);
    }

    sheetmanage.changeSheetExec(index, false, true);

    if (success && typeof success === 'function') {
        success();
    }
    return sheetconfig;
}

export function setSheetDelete(options = {}) {
    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    if(Store.luckysheetfile.length === 1){
        return tooltip.info(locale().sheetconfig.noMoreSheet, "");
    }

    sheetmanage.deleteSheet(file.index);

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    return file;
}

export function setSheetCopy(options = {}) {
    let {
        targetOrder,
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    if(targetOrder == null){
        targetOrder = order + 1;
    }

    if(!isRealNum(targetOrder)){
        return tooltip.info("The targetOrder parameter is invalid.", "");
    }

    let copyindex = file.index;
    let index = sheetmanage.generateRandomSheetIndex();

    let copyjson = structuredClone(file);
    copyjson.order = Store.luckysheetfile.length;
    copyjson.index = index;
    copyjson.name = sheetmanage.generateCopySheetName(Store.luckysheetfile, copyjson.name);

    let colorset = '';
    if(copyjson.color != null){
        colorset = '<div class="luckysheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' + copyjson.color + ';"></div>';
    }

    let afterObj = document.getElementById("luckysheet-sheets-item" + copyindex);
    if(isRealNum(targetOrder)){
        afterObj = document.getElementById("luckysheet-sheets-item" + Store.luckysheetfile[targetOrder - 1].index);
    }

    sheetContainer.append(replaceHtml(sheetHTML, {
        "index": copyjson.index,
        "active": "",
        "name": copyjson.name,
        "order": copyjson.order,
        "style": "",
        "colorset": colorset
    }));
    afterObj.parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + copyjson.index), afterObj.nextElementSibling);
    Store.luckysheetfile.splice(targetOrder, 0, copyjson);

    document.querySelector("#luckysheet-sheet-area div.luckysheet-sheets-item").classList.remove("luckysheet-sheets-item-active");
    document.getElementById("luckysheet-sheets-item" + index).classList.add("luckysheet-sheets-item-active");
    cellMain.append('<div id="luckysheet-datavisual-selection-set-' + index + '" class="luckysheet-datavisual-selection-set"></div>');
    cleargridelement(true);


    sheetmanage.changeSheetExec(index);
    sheetmanage.reOrderAllSheet();

    if (Store.clearjfundo) {
        Store.jfredo.push({
            "type": "copySheet",
            "copyindex": copyindex,
            "index": copyjson.index,
            "sheetIndex": copyjson.index
        });
    }
    else if (Store.jfredo !== null) {
        let jfredostr = Store.jfredo[Store.jfredo.length - 1];

        if (jfredostr.type == "copySheet") {
            jfredostr.index = copyjson.index;
            jfredostr.sheetIndex = copyjson.index;
        }
    }

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    return copyjson;
}

export function setSheetHide(options = {}) {
    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    sheetmanage.setSheetHide(file.index);

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    return file;
}

export function setSheetShow(options = {}) {
    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    sheetmanage.setSheetShow(file.index);

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    return file;
}

export function setSheetActive(order, options = {}) {
    if(order == null || !isRealNum(order) || Store.luckysheetfile[order] == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let file = Store.luckysheetfile[order];

    let {
        success
    } = {...options}

    document.querySelector("#luckysheet-sheet-area div.luckysheet-sheets-item").classList.remove("luckysheet-sheets-item-active");
    document.getElementById("luckysheet-sheets-item" + file.index).classList.add("luckysheet-sheets-item-active");

    sheetmanage.changeSheet(file.index);

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);
    return file;
}

export function setSheetName(name, options = {}) {
    if(getObjType(name) != 'string' || name.toString() === null){
        return tooltip.info("The name parameter is invalid.", "");
    }

    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let oldtxt = file.name;
    file.name = name;

    document.querySelector("#luckysheet-sheets-item" + file.index + " .luckysheet-sheets-item-name").textContent = name;


    if (Store.clearjfundo) {
        let redo = {};
        redo["type"] = "sheetName";
        redo["sheetIndex"] = file.index;

        redo["oldtxt"] = oldtxt;
        redo["txt"] = name;

        Store.jfundo.length  = 0;
        Store.jfredo.push(redo);
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function setSheetColor(color, options = {}) {
    if(getObjType(color) != 'string' || color.toString() === null){
        return tooltip.info("The color parameter is invalid.", "");
    }

    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let oldcolor = file.color;
    file.color = color;

    document.getElementById("luckysheet-sheets-item" + file.index).querySelector(".luckysheet-sheets-item-color").remove();
    document.getElementById("luckysheet-sheets-item" + file.index).insertAdjacentHTML('beforeend', '<div class="luckysheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' + color + ';"></div>');


    if (Store.clearjfundo) {
        let redo = {};
        redo["type"] = "sheetColor";
        redo["sheetIndex"] = file.index;

        redo["oldcolor"] = oldcolor;
        redo["color"] = color;

        Store.jfundo.length  = 0;
        Store.jfredo.push(redo);
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function setSheetMove(type, options = {}) {
    if(type != 'left' && type != 'right' && !isRealNum(type)){
        return tooltip.info("Type parameter not available", "");
    }

    if(isRealNum(type)){
        type = parseInt(type);
    }

    let curOrder = getCurrentSheetOrder();
    let {
        order = curOrder,
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("ncorrect worksheet index", "");
    }

    let sheetIndex = file.index;

    if(type == 'left'){
        if(order == 0){
            return;
        }

        let prevIndex = Store.luckysheetfile[order - 1].index;
        document.getElementById("luckysheet-sheets-item" + prevIndex).parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + sheetIndex), document.getElementById("luckysheet-sheets-item" + prevIndex));

        Store.luckysheetfile.splice(order, 1);
        Store.luckysheetfile.splice(order - 1, 0, file);
    }
    else if(type == 'right'){
        if(order == Store.luckysheetfile.length - 1){
            return;
        }

        let nextIndex = Store.luckysheetfile[order + 1].index;
        document.getElementById("luckysheet-sheets-item" + nextIndex).parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + sheetIndex), document.getElementById("luckysheet-sheets-item" + nextIndex).nextElementSibling);

        Store.luckysheetfile.splice(order, 1);
        Store.luckysheetfile.splice(order + 1, 0, file);
    }
    else{
        if(type < 0){
            type = 0;
        }

        if(type > Store.luckysheetfile.length - 1){
            type = Store.luckysheetfile.length - 1;
        }

        if(type == order){
            return;
        }

        if(type < order){
            let prevIndex = Store.luckysheetfile[type].index;
            document.getElementById("luckysheet-sheets-item" + prevIndex).parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + sheetIndex), document.getElementById("luckysheet-sheets-item" + prevIndex));
        }
        else{
            let nextIndex = Store.luckysheetfile[type].index;
            document.getElementById("luckysheet-sheets-item" + nextIndex).parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + sheetIndex), document.getElementById("luckysheet-sheets-item" + nextIndex).nextElementSibling);
        }

        Store.luckysheetfile.splice(order, 1);
        Store.luckysheetfile.splice(type, 0, file);
    }

    let orders = {};

    Store.luckysheetfile.forEach((item, i, arr) => {
        arr[i].order = i;
        orders[item.index.toString()] = i;
    })


    if (success && typeof success === 'function') {
        success();
    }
}

export function setSheetOrder(orderList, options = {}) {
    if(orderList == null || orderList === null){
        return tooltip.info("Type orderList not available", "");
    }

    let orderListMap = {};
    orderList.forEach((item) => {
        orderListMap[item.index.toString()] = item.order;
    })

    Store.luckysheetfile.sort((x, y) => {
        let order_x = orderListMap[x.index.toString()];
        let order_y = orderListMap[y.index.toString()];

        if(order_x != null && order_y != null){
            return order_x - order_y;
        }
        else if(order_x != null){
            return -1;
        }
        else if(order_y != null){
            return 1;
        }
        else{
            return 1;
        }
    })

    let orders = {};

    Store.luckysheetfile.forEach((item, i, arr) => {
        arr[i].order = i;
        orders[item.index.toString()] = i;

        if(i > 0){
            let preIndex = arr[i - 1].index;
            document.getElementById("luckysheet-sheets-item" + preIndex).parentElement.insertBefore(document.getElementById("luckysheet-sheets-item" + item.index), document.getElementById("luckysheet-sheets-item" + preIndex).nextElementSibling);
        }
    })


    let {
        success
    } = {...options}

    if (success && typeof success === 'function') {
        success();
    }
}

export function setSheetZoom(zoom, options = {}) {
    if(!isRealNum(zoom) || zoom < 0.1 || zoom > 4){
        return tooltip.info("The zoom parameter is invalid.", "");
    }

    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    file["zoomRatio"] = zoom;


    if(file.index == Store.currentSheetIndex){
        Store.zoomRatio = zoom;
        // 图片
        let currentSheet = sheetmanage.getSheetByIndex();
        imageCtrl.images = currentSheet.images;
        imageCtrl.allImagesShow();
        imageCtrl.init();

        zoomNumberDomBind();
        zoomRefreshView();
    }

    if (success && typeof success === 'function') {
        success();
    }
}
