import { createFilterOptions } from "../../controllers/filter";
import { selectIsOverlap } from "../../controllers/select";
import sheetmanage from "../../controllers/sheetmanage";
import locale from "../../locale/locale";
import Store from "../../store";
import { getObjType } from "../../utils/util";
import { getCurrentSheetOrder, getLastSelection } from '../../utils/storeAccess.js';
import formula from "../formula";
import { rowlenByRange } from "../getRowlen";
import { jfrefreshgrid } from "../refresh";
import { orderbydata } from "../sort";
import tooltip from "../tooltip";
import { isRealNull, hasPartMC } from "../validate";

export function setRangeFilter(type, options = {}) {
    let typeValues = ['open', 'close'];

    if(!typeValues.includes(type)){
        return tooltip.info("The type parameter is invalid.", "");
    }

    let {
        range = getLastSelection(),
        order = getCurrentSheetOrder(),
        success
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

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    if(type == 'open'){
        file.filter_select = range;

        if(file.index == Store.currentSheetIndex){
            createFilterOptions(range, file.filter);
        }

        return {
            "row": range.row,
            "column": range.column
        };
    }
    else if(type == 'close'){
        let luckysheet_filter_save = structuredClone(file.filter_select);

        file.filter_select = null;

        const _elFilterSelRm = document.getElementById("luckysheet-filter-selected-sheet" + file.index); if (_elFilterSelRm) _elFilterSelRm.remove();
        const _elFilterOptRm = document.getElementById("luckysheet-filter-options-sheet" + file.index); if (_elFilterOptRm) _elFilterOptRm.remove();

        return {
            "row": luckysheet_filter_save.row,
            "column": luckysheet_filter_save.column
        };
    }
}

export function setRangeMerge(type, options = {}) {
    let typeValues = ['all', 'horizontal', 'vertical'];
    if (typeValues.indexOf(type) < 0) {
        return tooltip.info('The type parameter must be included in [\'all\', \'horizontal\', \'vertical\']', '')
    }

    let curSheetOrder = getCurrentSheetOrder(),
        curRange = JSON.parse(JSON.stringify(Store.luckysheet_select_save));
    let {
        range = curRange,
        order = curSheetOrder,
        success
    } = {...options}

    let file = Store.luckysheetfile[order],
        cfg = structuredClone(file.config),
        data = structuredClone(file.data);

    if(data.length == 0){
        data = structuredClone(sheetmanage.buildGridData(file));
    }

    if(getObjType(range) == 'string'){
        if(!formula.iscelldata(range)){
            return tooltip.info('Incorrect selection format', '');
        }

        let cellrange = formula.getcellrange(range);
        range = [{
            "row": cellrange.row,
            "column": cellrange.column
        }]
    }
    else if(getObjType(range) == 'object'){
        if(!range.hasOwnProperty("row") || !range.hasOwnProperty("column")){
            return tooltip.info('Incorrect selection format', '');
        }

        range = [{
            "row": range.row,
            "column": range.column
        }]
    }

    //不能合并重叠区域
    if(selectIsOverlap(range)){
        return tooltip.info('Cannot merge overlapping range', '');
    }

    //选区是否含有 部分合并单元格
    if(cfg["merge"] != null){
        let has_PartMC = false;

        for(let s = 0; s < range.length; s++){
            let r1 = range[s].row[0],
                r2 = range[s].row[1];
            let c1 = range[s].column[0],
                c2 = range[s].column[1];

            has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

            if(has_PartMC){
                break;
            }
        }

        if(has_PartMC){
            return tooltip.info('Cannot perform this operation on partially merged cells', '');
        }
    }else {
        cfg.merge = {}
    }

    //选区是否含有 合并的单元格
    let isHasMc = false;

    for(let i = 0; i < range.length; i++){
        let r1 = range[i].row[0],
            r2 = range[i].row[1];
        let c1 = range[i].column[0],
            c2 = range[i].column[1];

        for(let r = r1; r <= r2; r++){
            for(let c = c1; c <= c2; c++){
                let cell = data[r][c];

                if(getObjType(cell) == "object" && ("mc" in cell)){
                    isHasMc = true;
                    break;
                }
            }

            if(isHasMc){
                break;
            }
        }
    }

    if(isHasMc){//选区有合并单元格（选区都执行 取消合并）
        cancelRangeMerge({
            range: range,
            order: order
        })
    }
    else{
        for(let i = 0; i < range.length; i++){
            let r1 = range[i].row[0],
                r2 = range[i].row[1];
            let c1 = range[i].column[0],
                c2 = range[i].column[1];

            if(r1 == r2 && c1 == c2){
                continue;
            }

            if(type == "all"){
                let fv = {}, isfirst = false;

                for(let r = r1; r <= r2; r++){
                    for(let c = c1; c <= c2; c++){
                        let cell = data[r][c];

                        if(cell != null && (!isRealNull(cell.v) || cell.f != null) && !isfirst){
                            fv = structuredClone(cell);
                            isfirst = true;
                        }

                        data[r][c] = { "mc": { "r": r1, "c": c1 } };
                    }
                }

                data[r1][c1] = fv;
                data[r1][c1].mc = { "r": r1, "c": c1, "rs": r2 - r1 + 1, "cs": c2 - c1 + 1 };

                cfg["merge"][r1 + "_" + c1] = { "r": r1, "c": c1, "rs": r2 - r1 + 1, "cs": c2 - c1 + 1 };
            }
            else if(type == "vertical"){
                for(let c = c1; c <= c2; c++){
                    let fv = {}, isfirst = false;

                    for(let r = r1; r <= r2; r++){
                        let cell = data[r][c];

                        if(cell != null && (!isRealNull(cell.v) || cell.f != null) && !isfirst){
                            fv = structuredClone(cell);
                            isfirst = true;
                        }

                        data[r][c] = { "mc": { "r": r1, "c": c } };
                    }

                    data[r1][c] = fv;
                    data[r1][c].mc = { "r": r1, "c": c, "rs": r2 - r1 + 1, "cs": 1 };

                    cfg["merge"][r1 + "_" + c] = { "r": r1, "c": c, "rs": r2 - r1 + 1, "cs": 1 };
                }
            }
            else if(type == "horizontal"){
                for(let r = r1; r <= r2; r++){
                    let fv = {}, isfirst = false;

                    for(let c = c1; c <= c2; c++){
                        let cell = data[r][c];

                        if(cell != null && (!isRealNull(cell.v) || cell.f != null) && !isfirst){
                            fv = structuredClone(cell);
                            isfirst = true;
                        }

                        data[r][c] = { "mc": { "r": r, "c": c1 } };
                    }

                    data[r][c1] = fv;
                    data[r][c1].mc = { "r": r, "c": c1, "rs": 1, "cs": c2 - c1 + 1 };

                    cfg["merge"][r + "_" + c1] = { "r": r, "c": c1, "rs": 1, "cs": c2 - c1 + 1 };
                }
            }
        }

        if(order == curSheetOrder){
            if (Store.clearjfundo) {
                Store.jfundo.length  = 0;
                Store.jfredo.push({
                    "type": "mergeChange",
                    "sheetIndex": file.index,
                    "data": structuredClone(file.data),
                    "curData": data,
                    "range": range,
                    "config": structuredClone(file.config),
                    "curConfig": cfg
                });
            }

            Store.clearjfundo = false;
            jfrefreshgrid(data, range, {"cfg": cfg});
            Store.clearjfundo = true;
        }
        else{
            file.data = data;
            file.config = cfg;
        }
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function cancelRangeMerge(options = {}) {
    let curRange = Store.luckysheet_select_save,
        curSheetOrder = getCurrentSheetOrder();
    let {
        range = curRange,
        order = curSheetOrder,
        success
    } = {...options}

    let file = Store.luckysheetfile[order],
        cfg = structuredClone(file.config),
        data = structuredClone(file.data);

    if(data.length == 0){
        data = structuredClone(sheetmanage.buildGridData(file));
    }

    if(getObjType(range) == 'string'){
        if(!formula.iscelldata(range)){
            return tooltip.info('Incorrect selection format', '');
        }

        let cellrange = formula.getcellrange(range);
        range = [{
            "row": cellrange.row,
            "column": cellrange.column
        }]
    }
    else if(getObjType(range) == 'object'){
        if(!range.hasOwnProperty("row") || !range.hasOwnProperty("column")){
            return tooltip.info('Incorrect selection format', '');
        }

        range = [{
            "row": range.row,
            "column": range.column
        }]
    }

    //不能合并重叠区域
    if(selectIsOverlap(range)){
        return tooltip.info('Cannot merge overlapping range', '');
    }

    //选区是否含有 部分合并单元格
    if(cfg["merge"] != null){
        let has_PartMC = false;

        for(let s = 0; s < range.length; s++){
            let r1 = range[s].row[0],
                r2 = range[s].row[1];
            let c1 = range[s].column[0],
                c2 = range[s].column[1];

            has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

            if(has_PartMC){
                break;
            }
        }

        if(has_PartMC){
            return tooltip.info('Cannot perform this operation on partially merged cells', '');
        }
    }

    for(let i = 0; i < range.length; i++){
        let r1 = range[i].row[0],
            r2 = range[i].row[1];
        let c1 = range[i].column[0],
            c2 = range[i].column[1];

        if(r1 == r2 && c1 == c2){
            continue;
        }

        let fv = {};

        for(let r = r1; r <= r2; r++){
            for(let c = c1; c <= c2; c++){
                let cell = data[r][c];

                if(cell != null && cell.mc != null){
                    let mc_r = cell.mc.r, mc_c = cell.mc.c;

                    if("rs" in cell.mc){
                        delete cell.mc;
                        delete cfg["merge"][mc_r + "_" + mc_c];

                        fv[mc_r + "_" + mc_c] = structuredClone(cell);
                    }
                    else{
                        // let cell_clone = fv[mc_r + "_" + mc_c];
                        let cell_clone = JSON.parse(JSON.stringify(fv[mc_r + "_" + mc_c]));

                        delete cell_clone.v;
                        delete cell_clone.m;
                        delete cell_clone.ct;
                        delete cell_clone.f;

                        data[r][c] = cell_clone;
                    }
                }
            }
        }
    }

    if(order == curSheetOrder){
        if (Store.clearjfundo) {
            Store.jfundo.length  = 0;
            Store.jfredo.push({
                "type": "mergeChange",
                "sheetIndex": file.index,
                "data": structuredClone(file.data),
                "curData": data,
                "range": range,
                "config": structuredClone(file.config),
                "curConfig": cfg
            });
        }

        Store.clearjfundo = false;
        jfrefreshgrid(data, range, {"cfg": cfg});
        Store.clearjfundo = true;
    }
    else{
        file.data = data;
        file.config = cfg;
    }
}

export function setRangeSort(type, options = {}) {
    let typeValues = ['asc', 'desc']
    if (typeValues.indexOf(type) < 0) {
        return tooltip.info('The type parameter must be included in [\'asc\', \'desc\'', '')
    }

    let curSheetOrder = getCurrentSheetOrder(),
        curRange = Store.luckysheet_select_save[0];
    let {
        range = curRange,
        order = curSheetOrder,
        success
    } = {...options}

    let file = Store.luckysheetfile[order],
        cfg = structuredClone(file.config),
        fileData = structuredClone(file.data);

    if(fileData.length == 0){
        fileData = structuredClone(sheetmanage.buildGridData(file));
    }

    if(range instanceof Array && range.length > 1){
        tooltip.info(locale().sort.noRangeError, "");
        return;
    }

    if (range && typeof range === 'string' && formula.iscelldata(range)) {
        range = formula.getcellrange(range)
    }

    let r1 = range.row[0],
        r2 = range.row[1],
        c1 = range.column[0],
        c2 = range.column[1];

    let hasMc = false; //Whether the sort selection has merged cells
    let data = [];
    for(let r = r1; r <= r2; r++){
        let data_row = [];
        for(let c = c1; c <= c2; c++){
            if(fileData[r][c] != null && fileData[r][c].mc != null){
                hasMc = true;
                break;
            }
            data_row.push(fileData[r][c]);
        }
        data.push(data_row);
    }

    if(hasMc){
        tooltip.info(locale().sort.mergeError, "");
        return;
    }

    data = orderbydata([].concat(data), 0, type === 'asc');

    for(let r = r1; r <= r2; r++){
        for(let c = c1; c <= c2; c++){
            fileData[r][c] = data[r - r1][c - c1];
        }
    }

    let allParam = {};
    if(cfg["rowlen"] != null){
        cfg = rowlenByRange(fileData, r1, r2, cfg);

        allParam = {
            "cfg": cfg,
            "RowlChange": true
        }
    }

    if (file.index == Store.currentSheetIndex) {
        jfrefreshgrid(fileData, [{ "row": [r1, r2], "column": [c1, c2] }], allParam);
    }
    else{
        file.data = fileData;
        file.config = cfg;
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function setRangeSortMulti(hasTitle, sort, options = {}) {
    if (!sort || !(sort instanceof Array)) {
        return tooltip.info('The sort parameter is invalid.', '')
    }

    let curSheetOrder = getCurrentSheetOrder(),
        curRange = Store.luckysheet_select_save[0];
    let {
        range = curRange,
        order = curSheetOrder,
        success
    } = {...options}

    let file = Store.luckysheetfile[order],
        cfg = structuredClone(file.config),
        fileData = structuredClone(file.data);

    if(fileData.length == 0){
        fileData = structuredClone(sheetmanage.buildGridData(file));
    }

    if(range instanceof Array && range.length > 1){
        tooltip.info(locale().sort.noRangeError, "");
        return;
    }

    if (range && typeof range === 'string' && formula.iscelldata(range)) {
        range = formula.getcellrange(range)
    }

    let r1 = range.row[0],
        r2 = range.row[1],
        c1 = range.column[0],
        c2 = range.column[1];

    let str;
    if(hasTitle){
        str = r1 + 1;
    } else{
        str = r1;
    }

    let hasMc = false; //Whether the sort selection has merged cells
    let data = [];
    for(let r = str; r <= r2; r++){
        let data_row = [];
        for(let c = c1; c <= c2; c++){
            if(fileData[r][c] != null && fileData[r][c].mc != null){
                hasMc = true;
                break;
            }
            data_row.push(fileData[r][c]);
        }
        data.push(data_row);
    }

    if(hasMc){
        tooltip.info(locale().sort.mergeError, "");
        return;
    }

    sort.forEach(sortItem => {
        let i = sortItem.i;
        i -= c1;
        data = orderbydata([].concat(data), i, sortItem.sort === 'asc');
    })

    for(let r = str; r <= r2; r++){
        for(let c = c1; c <= c2; c++){
            fileData[r][c] = data[r - str][c - c1];
        }
    }

    let allParam = {};
    if(cfg["rowlen"] != null){
        cfg = rowlenByRange(fileData, str, r2, cfg);

        allParam = {
            "cfg": cfg,
            "RowlChange": true
        }
    }

    if (file.index === Store.currentSheetIndex) {
        jfrefreshgrid(fileData, [{ "row": [str, r2], "column": [c1, c2] }], allParam);
    }
    else{
        file.data = fileData;
        file.config = cfg;
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function clearRange(options = {}) {
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

    let cfg = structuredClone(file.config);
    let has_PartMC = false;

    for(let s = 0; s < range.length; s++){
        let r1 = range[s].row[0],
            r2 = range[s].row[1];
        let c1 = range[s].column[0],
            c2 = range[s].column[1];

        has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

        if(has_PartMC){
            break;
        }
    }

    if(has_PartMC){
        return tooltip.info('Cannot perform this operation on partially merged cells', '');
    }

    let d = structuredClone(file.data);

    if(d.length == 0){
        d = structuredClone(sheetmanage.buildGridData(file));
    }

    for(let s = 0; s < range.length; s++){
        let r1 = range[s].row[0],
            r2 = range[s].row[1];
        let c1 = range[s].column[0],
            c2 = range[s].column[1];

        for(let r = r1; r <= r2; r++){
            for(let c = c1; c <= c2; c++){
                let cell = d[r][c];

                if(getObjType(cell) == "object"){
                    delete cell["m"];
                    delete cell["v"];

                    if(cell["f"] != null){
                        delete cell["f"];
                        formula.delFunctionGroup(r, c, file.index);

                        delete cell["spl"];
                    }

                    if(cell["ct"] != null && cell["ct"].t == 'inlineStr'){
                        delete cell["ct"];
                    }
                }
                else{
                    d[r][c] = null;
                }
            }
        }
    }

    if(file.index == Store.currentSheetIndex){
        jfrefreshgrid(d, range);
    }
    else{
        file.data = d;
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function deleteRange(move, options = {}) {
    let moveList = ['left', 'up'];

    if(!moveList.includes(move)){
        return tooltip.info("The move parameter is invalid.", "");
    }

    let {
        range = getLastSelection(),
        order = getCurrentSheetOrder(),
        success
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

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let str = range.row[0],
        edr = range.row[1],
        stc = range.column[0],
        edc = range.column[1];

    if(move == 'left'){
        luckysheetDeleteCell('moveLeft', str, edr, stc, edc, order);
    }
    else if(move == 'up'){
        luckysheetDeleteCell('moveUp', str, edr, stc, edc, order);
    }

    if (success && typeof success === 'function') {
        success();
    }
}
