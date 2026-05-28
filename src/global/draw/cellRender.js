import conditionformat from "../../controllers/conditionformat";
import alternateformat from "../../controllers/alternateformat";
import menuButton from "../../controllers/menuButton";
import { luckysheetdefaultstyle, luckysheet_CFiconsImg, luckysheetdefaultFont } from "../../controllers/constant";
import browser from "../browser";
import {  isRealNum  } from "../validate";
import {  getCellTextInfo  } from "../getRowlen";
import { cellOverflow_colIn, cellOverflowRender } from "./cellOverflow";
import { cellTextRender } from "./cellTextRender";
import method from "../method";
import Store from "../../store";
import sheetmanage from "../../controllers/sheetmanage";
let nullCellRender = function(
    r,
    c,
    start_r,
    start_c,
    end_r,
    end_c,
    luckysheetTableContent,
    af_compute,
    cf_compute,
    offsetLeft,
    offsetTop,
    dynamicArray_compute,
    cellOverflowMap,
    dataset_col_st,
    dataset_col_ed,
    scrollHeight,
    scrollWidth,
    bodrder05,
    isMerge,
) {
    let checksAF = alternateformat.checksAF(r, c, af_compute);
    let checksCF = conditionformat.checksCF(r, c, cf_compute);
    let borderfix = menuButton.borderfix(Store.flowdata, r, c);
    let fillStyle = menuButton.checkstatus(Store.flowdata, r, c, "bg");
    if (checksAF != null && checksAF[1] != null) {
        fillStyle = checksAF[1];
    }
    if (checksCF != null && checksCF["cellColor"] != null) {
        fillStyle = checksCF["cellColor"];
    }
    if (Store.flowdata[r][c] != null && Store.flowdata[r][c].tc != null) {
        fillStyle = Store.flowdata[r][c].tc;
    }
    if (fillStyle == null) {
        luckysheetTableContent.fillStyle = "#FFFFFF";
    } else {
        luckysheetTableContent.fillStyle = fillStyle;
    }
    let cellsize = [
        start_c + offsetLeft + borderfix[0] + 1,
        start_r + offsetTop + borderfix[1] + 1,
        end_c - start_c + borderfix[2] - (!!isMerge ? 1 : 0) - 1,
        end_r - start_r + borderfix[3] - 1,
    ];
    if (
        !method.createHookFunction(
            "cellRenderBefore",
            Store.flowdata[r][c],
            {
                r: r,
                c: c,
                start_r: cellsize[1],
                start_c: cellsize[0],
                end_r: cellsize[3] + cellsize[1],
                end_c: cellsize[2] + cellsize[0],
            },
            sheetmanage.getSheetByIndex(),
            luckysheetTableContent,
        )
    ) {
        return;
    }
    luckysheetTableContent.fillRect(cellsize[0], cellsize[1], cellsize[2], cellsize[3]);
    if (r + "_" + c in dynamicArray_compute) {
        let value = dynamicArray_compute[r + "_" + c].v;
        luckysheetTableContent.fillStyle = "#000000";
        let fontset = luckysheetdefaultFont();
        luckysheetTableContent.font = fontset;
        let horizonAlignPos = start_c + 4 + offsetLeft;
        let verticalFixed = browser.luckysheetrefreshfixed();
        let verticalAlignPos = end_r + offsetTop - 2;
        luckysheetTableContent.textBaseline = "bottom";
        luckysheetTableContent.fillText(value == null ? "" : value, horizonAlignPos, verticalAlignPos);
    }
    if (Store.flowdata[r][c] != null && Store.flowdata[r][c].ps != null) {
        let ps_w = 8 * Store.zoomRatio,
            ps_h = 8 * Store.zoomRatio;
        luckysheetTableContent.beginPath();
        luckysheetTableContent.moveTo(end_c + offsetLeft - 1 - ps_w, start_r + offsetTop);
        luckysheetTableContent.lineTo(end_c + offsetLeft - 1, start_r + offsetTop);
        luckysheetTableContent.lineTo(end_c + offsetLeft - 1, start_r + offsetTop + ps_h);
        luckysheetTableContent.fillStyle = "#FC6666";
        luckysheetTableContent.fill();
        luckysheetTableContent.closePath();
    }
    let cellOverflow_colInObj = cellOverflow_colIn(cellOverflowMap, r, c, dataset_col_st, dataset_col_ed);
    if (cellOverflow_colInObj.colLast) {
        cellOverflowRender(
            cellOverflow_colInObj.rowIndex,
            cellOverflow_colInObj.colIndex,
            cellOverflow_colInObj.stc,
            cellOverflow_colInObj.edc,
            luckysheetTableContent,
            scrollHeight,
            scrollWidth,
            offsetLeft,
            offsetTop,
            af_compute,
            cf_compute,
        );
    }
    if (!cellOverflow_colInObj.colIn || cellOverflow_colInObj.colLast) {
        if (Store.showGridLines) {
            luckysheetTableContent.beginPath();
            luckysheetTableContent.moveTo(end_c + offsetLeft - 2 + bodrder05, start_r + offsetTop);
            luckysheetTableContent.lineTo(end_c + offsetLeft - 2 + bodrder05, end_r + offsetTop);
            luckysheetTableContent.lineWidth = 1;
            luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
            luckysheetTableContent.stroke();
            luckysheetTableContent.closePath();
        }
    }
    if (Store.showGridLines) {
        luckysheetTableContent.beginPath();
        luckysheetTableContent.moveTo(start_c + offsetLeft - 1, end_r + offsetTop - 2 + bodrder05);
        luckysheetTableContent.lineTo(end_c + offsetLeft - 1, end_r + offsetTop - 2 + bodrder05);
        luckysheetTableContent.lineWidth = 1;
        luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
        luckysheetTableContent.stroke();
        luckysheetTableContent.closePath();
    }
    method.createHookFunction(
        "cellRenderAfter",
        Store.flowdata[r][c],
        {
            r: r,
            c: c,
            start_r: cellsize[1],
            start_c: cellsize[0],
            end_r: cellsize[3] + cellsize[1],
            end_c: cellsize[2] + cellsize[0],
        },
        sheetmanage.getSheetByIndex(),
        luckysheetTableContent,
    );
};
let cellRender = function(
    r,
    c,
    start_r,
    start_c,
    end_r,
    end_c,
    value,
    luckysheetTableContent,
    af_compute,
    cf_compute,
    offsetLeft,
    offsetTop,
    dynamicArray_compute,
    cellOverflowMap,
    dataset_col_st,
    dataset_col_ed,
    scrollHeight,
    scrollWidth,
    bodrder05,
    isMerge,
) {
    let cell = Store.flowdata[r][c];
    let cellWidth = end_c - start_c - 2;
    let cellHeight = end_r - start_r - 2;
    let space_width = 2,
        space_height = 2;
    let horizonAlign = menuButton.checkstatus(Store.flowdata, r, c, "ht");
    let verticalAlign = menuButton.checkstatus(Store.flowdata, r, c, "vt");
    let checksAF = alternateformat.checksAF(r, c, af_compute);
    let checksCF = conditionformat.checksCF(r, c, cf_compute);
    let fillStyle = menuButton.checkstatus(Store.flowdata, r, c, "bg");
    if (checksAF != null && checksAF[1] != null) {
        fillStyle = checksAF[1];
    }
    if (checksCF != null && checksCF["cellColor"] != null) {
        fillStyle = checksCF["cellColor"];
    }
    if (fillStyle == null) {
        luckysheetTableContent.fillStyle = "#FFFFFF";
    } else {
        luckysheetTableContent.fillStyle = fillStyle;
    }
    let borderfix = menuButton.borderfix(Store.flowdata, r, c);
    let cellsize = [
        start_c + offsetLeft + borderfix[0] + 1,
        start_r + offsetTop + borderfix[1] + 1,
        end_c - start_c + borderfix[2] - (!!isMerge ? 1 : 0) - 1,
        end_r - start_r + borderfix[3] + 1,
    ];
    if (
        !method.createHookFunction(
            "cellRenderBefore",
            Store.flowdata[r][c],
            {
                r: r,
                c: c,
                start_r: cellsize[1],
                start_c: cellsize[0],
                end_r: cellsize[3] + cellsize[1],
                end_c: cellsize[2] + cellsize[0],
            },
            sheetmanage.getSheetByIndex(),
            luckysheetTableContent,
        )
    ) {
        return;
    }
    luckysheetTableContent.fillRect(cellsize[0], cellsize[1], cellsize[2], cellsize[3]);
    if (cell.ps != null) {
        let ps_w = 8 * Store.zoomRatio,
            ps_h = 8 * Store.zoomRatio;
        luckysheetTableContent.beginPath();
        luckysheetTableContent.moveTo(end_c + offsetLeft - ps_w, start_r + offsetTop);
        luckysheetTableContent.lineTo(end_c + offsetLeft, start_r + offsetTop);
        luckysheetTableContent.lineTo(end_c + offsetLeft, start_r + offsetTop + ps_h);
        luckysheetTableContent.fillStyle = "#FC6666";
        luckysheetTableContent.fill();
        luckysheetTableContent.closePath();
    }
    if (cell.qp == 1 && isRealNum(cell.v)) {
        let ps_w = 6 * Store.zoomRatio,
            ps_h = 6 * Store.zoomRatio;
        luckysheetTableContent.beginPath();
        luckysheetTableContent.moveTo(start_c + offsetLeft + ps_w - 1, start_r + offsetTop);
        luckysheetTableContent.lineTo(start_c + offsetLeft - 1, start_r + offsetTop);
        luckysheetTableContent.lineTo(start_c + offsetLeft - 1, start_r + offsetTop + ps_h);
        luckysheetTableContent.fillStyle = "#487f1e";
        luckysheetTableContent.fill();
        luckysheetTableContent.closePath();
    }
    let cellOverflow_bd_r_render = true;
    let cellOverflow_colInObj = cellOverflow_colIn(cellOverflowMap, r, c, dataset_col_st, dataset_col_ed);
    if (cell.tb == "1" && cellOverflow_colInObj.colIn) {
        if (cellOverflow_colInObj.colLast) {
            cellOverflowRender(
                cellOverflow_colInObj.rowIndex,
                cellOverflow_colInObj.colIndex,
                cellOverflow_colInObj.stc,
                cellOverflow_colInObj.edc,
                luckysheetTableContent,
                scrollHeight,
                scrollWidth,
                offsetLeft,
                offsetTop,
                af_compute,
                cf_compute,
            );
        } else {
            cellOverflow_bd_r_render = false;
        }
    }
    if (
        checksCF != null &&
        checksCF["dataBar"] != null &&
        checksCF["dataBar"]["valueLen"] &&
        checksCF["dataBar"]["valueLen"].toString() !== "NaN"
    ) {
        let x = start_c + offsetLeft + space_width;
        let y = start_r + offsetTop + space_height;
        let w = cellWidth - space_width * 2;
        let h = cellHeight - space_height * 2;
        let valueType = checksCF["dataBar"]["valueType"];
        let valueLen = checksCF["dataBar"]["valueLen"];
        let format = checksCF["dataBar"]["format"];
        if (valueType == "minus") {
            let minusLen = checksCF["dataBar"]["minusLen"];
            if (format.length > 1) {
                let my_gradient = luckysheetTableContent.createLinearGradient(
                    x + w * minusLen * (1 - valueLen),
                    y,
                    x + w * minusLen,
                    y,
                );
                my_gradient.addColorStop(0, "#ffffff");
                my_gradient.addColorStop(1, "#ff0000");
                luckysheetTableContent.fillStyle = my_gradient;
            } else {
                luckysheetTableContent.fillStyle = "#ff0000";
            }
            luckysheetTableContent.fillRect(x + w * minusLen * (1 - valueLen), y, w * minusLen * valueLen, h);
            luckysheetTableContent.beginPath();
            luckysheetTableContent.moveTo(x + w * minusLen * (1 - valueLen), y);
            luckysheetTableContent.lineTo(x + w * minusLen * (1 - valueLen), y + h);
            luckysheetTableContent.lineTo(x + w * minusLen, y + h);
            luckysheetTableContent.lineTo(x + w * minusLen, y);
            luckysheetTableContent.lineTo(x + w * minusLen * (1 - valueLen), y);
            luckysheetTableContent.lineWidth = 1;
            luckysheetTableContent.strokeStyle = "#ff0000";
            luckysheetTableContent.stroke();
            luckysheetTableContent.closePath();
        } else if (valueType == "plus") {
            let plusLen = checksCF["dataBar"]["plusLen"];
            if (plusLen == 1) {
                if (format.length > 1) {
                    let my_gradient = luckysheetTableContent.createLinearGradient(x, y, x + w * valueLen, y);
                    my_gradient.addColorStop(0, format[0]);
                    my_gradient.addColorStop(1, format[1]);
                    luckysheetTableContent.fillStyle = my_gradient;
                } else {
                    luckysheetTableContent.fillStyle = format[0];
                }
                luckysheetTableContent.fillRect(x, y, w * valueLen, h);
                luckysheetTableContent.beginPath();
                luckysheetTableContent.moveTo(x, y);
                luckysheetTableContent.lineTo(x, y + h);
                luckysheetTableContent.lineTo(x + w * valueLen, y + h);
                luckysheetTableContent.lineTo(x + w * valueLen, y);
                luckysheetTableContent.lineTo(x, y);
                luckysheetTableContent.lineWidth = 1;
                luckysheetTableContent.strokeStyle = format[0];
                luckysheetTableContent.stroke();
                luckysheetTableContent.closePath();
            } else {
                let minusLen = checksCF["dataBar"]["minusLen"];
                if (format.length > 1) {
                    let my_gradient = luckysheetTableContent.createLinearGradient(
                        x + w * minusLen,
                        y,
                        x + w * minusLen + w * plusLen * valueLen,
                        y,
                    );
                    my_gradient.addColorStop(0, format[0]);
                    my_gradient.addColorStop(1, format[1]);
                    luckysheetTableContent.fillStyle = my_gradient;
                } else {
                    luckysheetTableContent.fillStyle = format[0];
                }
                luckysheetTableContent.fillRect(x + w * minusLen, y, w * plusLen * valueLen, h);
                luckysheetTableContent.beginPath();
                luckysheetTableContent.moveTo(x + w * minusLen, y);
                luckysheetTableContent.lineTo(x + w * minusLen, y + h);
                luckysheetTableContent.lineTo(x + w * minusLen + w * plusLen * valueLen, y + h);
                luckysheetTableContent.lineTo(x + w * minusLen + w * plusLen * valueLen, y);
                luckysheetTableContent.lineTo(x + w * minusLen, y);
                luckysheetTableContent.lineWidth = 1;
                luckysheetTableContent.strokeStyle = format[0];
                luckysheetTableContent.stroke();
                luckysheetTableContent.closePath();
            }
        }
    }
    let pos_x = start_c + offsetLeft;
    let pos_y = start_r + offsetTop + 1;
    luckysheetTableContent.save();
    luckysheetTableContent.beginPath();
    luckysheetTableContent.rect(pos_x, pos_y, cellWidth, cellHeight);
    luckysheetTableContent.clip();
    luckysheetTableContent.scale(Store.zoomRatio, Store.zoomRatio);
    let textInfo = getCellTextInfo(cell, luckysheetTableContent, {
        cellWidth: cellWidth,
        cellHeight: cellHeight,
        space_width: space_width,
        space_height: space_height,
        r: r,
        c: c,
    });
    if (checksCF != null && checksCF["icons"] != null && textInfo.type == "plain") {
        let l = checksCF["icons"]["left"];
        let t = checksCF["icons"]["top"];
        let value = textInfo.values[0];
        let horizonAlignPos = pos_x + value.left;
        let verticalAlignPos = pos_y + value.top - textInfo.textHeightAll;
        if (verticalAlign == "0") {
            verticalAlignPos = pos_y + cellHeight / 2 - textInfo.textHeightAll / 2;
        } else if (verticalAlign == "1") {
            verticalAlignPos = pos_y;
        } else if (verticalAlign == "2") {
            verticalAlignPos = verticalAlignPos - textInfo.desc;
        }
        verticalAlignPos = verticalAlignPos / Store.zoomRatio;
        horizonAlignPos = horizonAlignPos / Store.zoomRatio;
        luckysheetTableContent.drawImage(
            luckysheet_CFiconsImg,
            l * 42,
            t * 32,
            32,
            32,
            pos_x / Store.zoomRatio,
            verticalAlignPos,
            textInfo.textHeightAll / Store.zoomRatio,
            textInfo.textHeightAll / Store.zoomRatio,
        );
        if (horizonAlign != "0" && horizonAlign != "2") {
            horizonAlignPos = horizonAlignPos + textInfo.textHeightAll / Store.zoomRatio;
        }
    }
    luckysheetTableContent.fillStyle = menuButton.checkstatus(Store.flowdata, r, c, "fc");
    if (checksAF != null && checksAF[0] != null) {
        luckysheetTableContent.fillStyle = checksAF[0];
    }
    if (checksCF != null && checksCF["textColor"] != null) {
        luckysheetTableContent.fillStyle = checksCF["textColor"];
    }
    if (cell.ct && cell.ct.fa && cell.ct.fa.indexOf("[Red]") > -1 && cell.ct.t == "n" && cell.v < 0) {
        luckysheetTableContent.fillStyle = "#ff0000";
    }
    cellTextRender(textInfo, luckysheetTableContent, {
        pos_x: pos_x,
        pos_y: pos_y,
    });
    luckysheetTableContent.restore();
    if (cellOverflow_bd_r_render) {
        if (Store.showGridLines) {
            luckysheetTableContent.beginPath();
            luckysheetTableContent.moveTo(end_c + offsetLeft - 2 + bodrder05, start_r + offsetTop);
            luckysheetTableContent.lineTo(end_c + offsetLeft - 2 + bodrder05, end_r + offsetTop);
            luckysheetTableContent.lineWidth = 1;
            luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
            luckysheetTableContent.stroke();
            luckysheetTableContent.closePath();
        }
    }
    if (Store.showGridLines) {
        luckysheetTableContent.beginPath();
        luckysheetTableContent.moveTo(start_c + offsetLeft - 1, end_r + offsetTop - 2 + bodrder05);
        luckysheetTableContent.lineTo(end_c + offsetLeft - 1, end_r + offsetTop - 2 + bodrder05);
        luckysheetTableContent.lineWidth = 1;
        luckysheetTableContent.strokeStyle = luckysheetdefaultstyle.strokeStyle;
        luckysheetTableContent.stroke();
        luckysheetTableContent.closePath();
    }
    method.createHookFunction(
        "cellRenderAfter",
        Store.flowdata[r][c],
        {
            r: r,
            c: c,
            start_r: cellsize[1],
            start_c: cellsize[0],
            end_r: cellsize[3] + cellsize[1],
            end_c: cellsize[2] + cellsize[0],
        },
        sheetmanage.getSheetByIndex(),
        luckysheetTableContent,
    );
};
export { nullCellRender, cellRender };
