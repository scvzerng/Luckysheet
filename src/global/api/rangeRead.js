import conditionformat from "../../controllers/conditionformat";
import menuButton from "../../controllers/menuButton";
import { selectIsOverlap } from "../../controllers/select";
import sheetmanage from "../../controllers/sheetmanage";
import locale from "../../locale/locale";
import { getSheetIndex } from "../../methods/get";
import Store from "../../store";
import { getObjType, chatatABC, replaceHtml } from "../../utils/util";
import { getBorderInfoCompute } from "../border";
import formula from "../formula";
import { getdatabyselection, getcellvalue } from "../getdata";
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
    let curOrder = getSheetIndex(Store.currentSheetIndex);
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
        order = getSheetIndex(Store.currentSheetIndex),
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

                let reg = /^(w|W)((0?)|(0\.0+))$/;
                let c_value;
                if(d[r][c].ct != null && d[r][c].ct.fa != null && d[r][c].ct.fa.match(reg)){
                    c_value = getcellvalue(r, c, d);
                }
                else{
                    c_value = getcellvalue(r, c, d, "m");
                }

                style += menuButton.getStyleByCell(d, r, c);

                if(getObjType(d[r][c]) == "object" && ("mc" in d[r][c])){
                    if("rs" in d[r][c]["mc"]){
                        span = 'rowspan="'+ d[r][c]["mc"].rs +'" colspan="'+ d[r][c]["mc"].cs +'"';

                        //边框
                        if(borderInfoCompute && borderInfoCompute[r + "_" + c]){
                            let bl_obj = { "color": {}, "style": {} },
                                br_obj = { "color": {}, "style": {} },
                                bt_obj = { "color": {}, "style": {} },
                                bb_obj = { "color": {}, "style": {} };

                            for(let bd_r = r; bd_r < (r + d[r][c]["mc"].rs); bd_r++){
                                for(let bd_c = c; bd_c < (c + d[r][c]["mc"].cs); bd_c++){
                                    if(bd_r == r && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].t){
                                        let linetype = borderInfoCompute[bd_r + "_" + bd_c].t.style;
                                        let bcolor = borderInfoCompute[bd_r + "_" + bd_c].t.color;

                                        if(bt_obj["style"][linetype] == null){
                                            bt_obj["style"][linetype] = 1;
                                        }
                                        else{
                                            bt_obj["style"][linetype] = bt_obj["style"][linetype] + 1;
                                        }

                                        if(bt_obj["color"][bcolor] == null){
                                            bt_obj["color"][bcolor] = 1;
                                        }
                                        else{
                                            bt_obj["color"][bcolor] = bt_obj["color"][bcolor] + 1;
                                        }
                                    }

                                    if(bd_r == (r + d[r][c]["mc"].rs - 1) && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].b){
                                        let linetype = borderInfoCompute[bd_r + "_" + bd_c].b.style;
                                        let bcolor = borderInfoCompute[bd_r + "_" + bd_c].b.color;

                                        if(bb_obj["style"][linetype] == null){
                                            bb_obj["style"][linetype] = 1;
                                        }
                                        else{
                                            bb_obj["style"][linetype] = bb_obj["style"][linetype] + 1;
                                        }

                                        if(bb_obj["color"][bcolor] == null){
                                            bb_obj["color"][bcolor] = 1;
                                        }
                                        else{
                                            bb_obj["color"][bcolor] = bb_obj["color"][bcolor] + 1;
                                        }
                                    }

                                    if(bd_c == c && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].l){
                                        let linetype = borderInfoCompute[r + "_" + c].l.style;
                                        let bcolor = borderInfoCompute[bd_r + "_" + bd_c].l.color;

                                        if(bl_obj["style"][linetype] == null){
                                            bl_obj["style"][linetype] = 1;
                                        }
                                        else{
                                            bl_obj["style"][linetype] = bl_obj["style"][linetype] + 1;
                                        }

                                        if(bl_obj["color"][bcolor] == null){
                                            bl_obj["color"][bcolor] = 1;
                                        }
                                        else{
                                            bl_obj["color"][bcolor] = bl_obj["color"][bcolor] + 1;
                                        }
                                    }

                                    if(bd_c == (c + d[r][c]["mc"].cs - 1) && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].r){
                                        let linetype = borderInfoCompute[bd_r + "_" + bd_c].r.style;
                                        let bcolor = borderInfoCompute[bd_r + "_" + bd_c].r.color;

                                        if(br_obj["style"][linetype] == null){
                                            br_obj["style"][linetype] = 1;
                                        }
                                        else{
                                            br_obj["style"][linetype] = br_obj["style"][linetype] + 1;
                                        }

                                        if(br_obj["color"][bcolor] == null){
                                            br_obj["color"][bcolor] = 1;
                                        }
                                        else{
                                            br_obj["color"][bcolor] = br_obj["color"][bcolor] + 1;
                                        }
                                    }
                                }
                            }

                            let rowlen = d[r][c]["mc"].rs, collen = d[r][c]["mc"].cs;

                            if(JSON.stringify(bl_obj).length > 23){
                                let bl_color = null, bl_style = null;

                                for(let x in bl_obj.color){
                                    if(bl_obj.color[x] >= (rowlen / 2)){
                                        bl_color = x;
                                    }
                                }

                                for(let x in bl_obj.style){
                                    if(bl_obj.style[x] >= (rowlen / 2)){
                                        bl_style = x;
                                    }
                                }

                                if(bl_color != null && bl_style != null){
                                    style += "border-left:" + selection.getHtmlBorderStyle(bl_style, bl_color);
                                }
                            }

                            if(JSON.stringify(br_obj).length > 23){
                                let br_color = null, br_style = null;

                                for(let x in br_obj.color){
                                    if(br_obj.color[x] >= (rowlen / 2)){
                                        br_color = x;
                                    }
                                }

                                for(let x in br_obj.style){
                                    if(br_obj.style[x] >= (rowlen / 2)){
                                        br_style = x;
                                    }
                                }

                                if(br_color != null && br_style != null){
                                    style += "border-right:" + selection.getHtmlBorderStyle(br_style, br_color);
                                }
                            }

                            if(JSON.stringify(bt_obj).length > 23){
                                let bt_color = null, bt_style = null;

                                for(let x in bt_obj.color){
                                    if(bt_obj.color[x] >= (collen / 2)){
                                        bt_color = x;
                                    }
                                }

                                for(let x in bt_obj.style){
                                    if(bt_obj.style[x] >= (collen / 2)){
                                        bt_style = x;
                                    }
                                }

                                if(bt_color != null && bt_style != null){
                                    style += "border-top:" + selection.getHtmlBorderStyle(bt_style, bt_color);
                                }
                            }

                            if(JSON.stringify(bb_obj).length > 23){
                                let bb_color = null, bb_style = null;

                                for(let x in bb_obj.color){
                                    if(bb_obj.color[x] >= (collen / 2)){
                                        bb_color = x;
                                    }
                                }

                                for(let x in bb_obj.style){
                                    if(bb_obj.style[x] >= (collen / 2)){
                                        bb_style = x;
                                    }
                                }

                                if(bb_color != null && bb_style != null){
                                    style += "border-bottom:" + selection.getHtmlBorderStyle(bb_style, bb_color);
                                }
                            }
                        }
                    }
                    else{
                        continue;
                    }
                }
                else{
                    //边框
                    if(borderInfoCompute && borderInfoCompute[r + "_" + c]){
                        //左边框
                        if(borderInfoCompute[r + "_" + c].l){
                            let linetype = borderInfoCompute[r + "_" + c].l.style;
                            let bcolor = borderInfoCompute[r + "_" + c].l.color;
                            style += "border-left:" + selection.getHtmlBorderStyle(linetype, bcolor);
                        }

                        //右边框
                        if(borderInfoCompute[r + "_" + c].r){
                            let linetype = borderInfoCompute[r + "_" + c].r.style;
                            let bcolor = borderInfoCompute[r + "_" + c].r.color;
                            style += "border-right:" + selection.getHtmlBorderStyle(linetype, bcolor);
                        }

                        //下边框
                        if(borderInfoCompute[r + "_" + c].b){
                            let linetype = borderInfoCompute[r + "_" + c].b.style;
                            let bcolor = borderInfoCompute[r + "_" + c].b.color;
                            style += "border-bottom:" + selection.getHtmlBorderStyle(linetype, bcolor);
                        }

                        //上边框
                        if(borderInfoCompute[r + "_" + c].t){
                            let linetype = borderInfoCompute[r + "_" + c].t.style;
                            let bcolor = borderInfoCompute[r + "_" + c].t.color;
                            style += "border-top:" + selection.getHtmlBorderStyle(linetype, bcolor);
                        }
                    }
                }

                column = replaceHtml(column, {"style": style, "span": span});

                if(c_value == null){
                    c_value = getcellvalue(r, c, d);
                }

                if(c_value == null){
                    c_value = " ";
                }

                column += c_value;
            }
            else {
                let style = "";

                //边框
                if(borderInfoCompute && borderInfoCompute[r + "_" + c]){
                    //左边框
                    if(borderInfoCompute[r + "_" + c].l){
                        let linetype = borderInfoCompute[r + "_" + c].l.style;
                        let bcolor = borderInfoCompute[r + "_" + c].l.color;
                        style += "border-left:" + selection.getHtmlBorderStyle(linetype, bcolor);
                    }

                    //右边框
                    if(borderInfoCompute[r + "_" + c].r){
                        let linetype = borderInfoCompute[r + "_" + c].r.style;
                        let bcolor = borderInfoCompute[r + "_" + c].r.color;
                        style += "border-right:" + selection.getHtmlBorderStyle(linetype, bcolor);
                    }

                    //下边框
                    if(borderInfoCompute[r + "_" + c].b){
                        let linetype = borderInfoCompute[r + "_" + c].b.style;
                        let bcolor = borderInfoCompute[r + "_" + c].b.color;
                        style += "border-bottom:" + selection.getHtmlBorderStyle(linetype, bcolor);
                    }

                    //上边框
                    if(borderInfoCompute[r + "_" + c].t){
                        let linetype = borderInfoCompute[r + "_" + c].t.style;
                        let bcolor = borderInfoCompute[r + "_" + c].t.color;
                        style += "border-top:" + selection.getHtmlBorderStyle(linetype, bcolor);
                    }
                }

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
        range = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1],
        order = getSheetIndex(Store.currentSheetIndex),
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
    let curRange = Store.luckysheet_select_save[0];
    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
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
    let arr = [];
    if (getdata.length === 0) {
        return;
    }
    if (isFirstRowTitle) {
        if (getdata.length === 1) {
            let obj = {};
            for (let i = 0; i < getdata[0].length; i++) {
                obj[getcellvalue(0, i, getdata)] = "";
            }
            arr.push(obj);
        } else {
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
    } else {
        let st = range["column"][0];
        for (let r = 0; r < getdata.length; r++) {
            let obj = {};
            for (let c = 0; c < getdata[0].length; c++) {
                obj[chatatABC(c + st)] = getcellvalue(r, c, getdata);
            }
            arr.push(obj);
        }
    }
    // selection.copybyformat(new Event('click'), JSON.stringify(arr));
    return arr;
}

export function getRangeDiagonal(type, options = {}) {
    let typeValues = ['normal', 'anti', 'offset'];
    if (typeValues.indexOf(type) < 0) {
        return tooltip.info('The type parameter must be included in [\'normal\', \'anti\', \'offset\']', '')
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
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
    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
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
