import {colLocationByIndex,colSpanLocationByIndex} from '../../global/location';
import {isInlineStringCell} from '../../controllers/inlineString';
import Store from '../../store';
import { getCellTextInfo } from './getCellTextInfo';
import { isRowHidden, isColHidden } from '../../utils/util';

function rowlenByRange(d, r1, r2, cfg) {
    let cfg_clone = $.extend(true, {}, cfg);
    if(cfg_clone["rowlen"] == null){
        cfg_clone["rowlen"] = {};
    }

    if(cfg_clone["customHeight"] == null){
        cfg_clone["customHeight"] = {};
    }

    let canvas = $("#luckysheetTableContent").get(0).getContext("2d");
    canvas.textBaseline = 'top'; //textBaseline以top计算

    for(let r = r1; r <= r2; r++){
        if (isRowHidden(r, cfg_clone)) {
            continue;
        }

        let currentRowLen = Store.defaultrowlen;

        if(cfg_clone["customHeight"][r]==1){
            continue;
        }

        delete cfg_clone["rowlen"][r];

        for(let c = 0; c < d[r].length; c++){
            let cell = d[r][c];

            if(cell == null){
                continue;
            }

            if(cell != null && (cell.v != null || isInlineStringCell(cell)) ){
                let cellWidth;
                if(cell.mc){
                    if(c === cell.mc.c){
                        let st_cellWidth = colLocationByIndex(c)[0];
                        let ed_cellWidth = colLocationByIndex(cell.mc.c + cell.mc.cs - 1)[1];
                        cellWidth = ed_cellWidth - st_cellWidth - 2;
                    }else{
                        continue;
                    }
                } else {
                    cellWidth = colLocationByIndex(c)[1] - colLocationByIndex(c)[0] - 2;
                }

                let textInfo = getCellTextInfo(cell, canvas,{
                    r:r,
                    c:c,
                    cellWidth:cellWidth
                });

                let computeRowlen = 0;

                if(textInfo!=null){
                    computeRowlen = textInfo.textHeightAll+2;
                }

                //比较计算高度和当前高度取最大高度
                if(computeRowlen > currentRowLen){
                    currentRowLen = computeRowlen;
                }
            }
        }

        currentRowLen = currentRowLen/Store.zoomRatio;

        if(currentRowLen != Store.defaultrowlen){
            cfg_clone["rowlen"][r] = currentRowLen;
        }else{
            if(cfg["rowlen"]?.[r]){
                cfg_clone["rowlen"][r] = cfg["rowlen"][r]
            }
        }
    }

    return cfg_clone;
}

function computeRowlenByContent(d, r) {
    let currentRowLen = 0;

    let canvas = $("#luckysheetTableContent").get(0).getContext("2d");
    canvas.textBaseline = 'top'; //textBaseline以top计算

    for(let c = 0; c < d[r].length; c++){
        let cell = d[r][c];

        if (cell == null) {
            continue;
        }

        if (cell.mc != null) {
            if (1 !== cell.mc.rs) {
                continue;
            }
        }

        if(isColHidden(c)){
            continue;
        }


        if(cell != null && (cell.v != null || isInlineStringCell(cell)) ){
            let cellWidth = computeCellWidth(cell, c);

            let textInfo = getCellTextInfo(cell, canvas,{
                r:r,
                c:c,
                cellWidth:cellWidth
            });

            let computeRowlen = 0;

            if (textInfo != null) {
                computeRowlen = textInfo.textHeightAll + 2;
            }

            //比较计算高度和当前高度取最大高度
            if (computeRowlen > currentRowLen) {
                currentRowLen = computeRowlen;
            }
        }
    }

    return currentRowLen;
}

function computeCellWidth(cell, col_index) {
    let colLocationArr = colLocationByIndex(col_index);
    if (cell.mc && 1 !== cell.mc.cs) {
        colLocationArr = colSpanLocationByIndex(col_index, cell.mc.cs);
    }

    return colLocationArr[1] - colLocationArr[0] - 2;
}

function computeColWidthByContent(d, c, rh) {
    let currentColLen = 0;
    let rowlenArr = computeRowlenArr(rh, c)

    let canvas = $("#luckysheetTableContent").get(0).getContext("2d");
    canvas.textBaseline = 'top'; //textBaseline以top计算

    for (var i = 0; i < d.length; i++) {
        var cell = d[i][c]

        if (cell != null && (cell.v != null || isInlineStringCell(cell))) {
            let cellHeight = rowlenArr[c];
            let textInfo = getCellTextInfo(cell, canvas, {
                r: i,
                c: c,
                cellHeight: cellHeight
            });

            let computeCollen = 0;

            if (textInfo != null) {
                computeCollen = textInfo.textWidthAll + 2;
            }

            //比较计算高度和当前高度取最大高度
            if (computeCollen > currentColLen) {
                currentColLen = computeCollen;
            }
        }
    }

    return currentColLen;
}

function computeRowlenArr(rowHeight, cfg) {
    let rowlenArr = [];
    let rh_height = 0;

    for (let i = 0; i < rowHeight; i++) {
        let rowlen = Store.defaultrowlen;

        if (cfg["rowlen"] != null && cfg["rowlen"][i] != null) {
            rowlen = cfg["rowlen"][i];
        }

        if (isRowHidden(i, cfg)) {
            rowlen = cfg["rowhidden"][i];
            rowlenArr.push(rh_height);
            continue;
        }
        else {
            rh_height += rowlen + 1;
        }

        rowlenArr.push(rh_height);//行的临时长度分布
    }

    return rowlenArr;
}

export { rowlenByRange, computeRowlenByContent, computeCellWidth, computeColWidthByContent, computeRowlenArr };
