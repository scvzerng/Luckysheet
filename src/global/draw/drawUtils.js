import menuButton from "../../controllers/menuButton";
import { luckysheetdefaultstyle, luckysheetdefaultFont } from "../../controllers/constant";
import Store from "../../store";

function initCanvasDefaults(ctx) {
    ctx.font = luckysheetdefaultFont();
    ctx.textBaseline = luckysheetdefaultstyle.textBaseline;
    ctx.fillStyle = luckysheetdefaultstyle.fillStyle;
}

function getCellTextColor(r, c, checksAF, checksCF, cell) {
    let textColor = menuButton.checkstatus(Store.flowdata, r, c, "fc");
    if (checksAF != null && checksAF[0] != null) {
        textColor = checksAF[0];
    }
    if (checksCF != null && checksCF["textColor"] != null) {
        textColor = checksCF["textColor"];
    }
    if (cell.ct && cell.ct.fa && cell.ct.fa.indexOf("[Red]") > -1 && cell.ct.t == "n" && cell.v < 0) {
        textColor = "#ff0000";
    }
    return textColor;
}

function getCellBgColor(r, c, checksAF, checksCF) {
    let bgColor = menuButton.checkstatus(Store.flowdata, r, c, "bg");
    if (checksAF != null && checksAF[1] != null) {
        bgColor = checksAF[1];
    }
    if (checksCF != null && checksCF["cellColor"] != null) {
        bgColor = checksCF["cellColor"];
    }
    if (bgColor == null) {
        bgColor = "#FFFFFF";
    }
    return bgColor;
}

function drawGridLine(ctx, type, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = luckysheetdefaultstyle.strokeStyle;
    ctx.stroke();
    ctx.closePath();
}

function resetCanvasStroke(ctx) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = luckysheetdefaultstyle.strokeStyle;
}

function getRowStartEnd(r, scrollHeight) {
    let start_r = (r == 0 ? -1 : Store.visibledatarow[r - 1]) - scrollHeight - 1;
    let end_r = Store.visibledatarow[r] - scrollHeight;
    return { start_r, end_r };
}

function getColStartEnd(c, scrollWidth) {
    let start_c = (c == 0 ? 0 : Store.visibledatacolumn[c - 1]) - scrollWidth;
    let end_c = Store.visibledatacolumn[c] - scrollWidth;
    return { start_c, end_c };
}

function drawBorder(ctx, direction, style, color, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, linetype, m_st, m_ed, line_st, line_ed) {
    let bodrder05 = 0.5;
    let computedLinetype = style;
    let computedM_st, computedM_ed, computedLine_st, computedLine_ed, setLineDashDirection;

    if (direction === "left") {
        computedM_st = start_c - 2 + bodrder05 + offsetLeft;
        computedM_ed = start_r + offsetTop - 1;
        computedLine_st = start_c - 2 + bodrder05 + offsetLeft;
        computedLine_ed = end_r - 2 + bodrder05 + offsetTop;
        setLineDashDirection = "v";
    } else if (direction === "right") {
        computedM_st = end_c - 2 + bodrder05 + offsetLeft;
        computedM_ed = start_r + offsetTop - 1;
        computedLine_st = end_c - 2 + bodrder05 + offsetLeft;
        computedLine_ed = end_r - 2 + bodrder05 + offsetTop;
        setLineDashDirection = "v";
    } else if (direction === "top") {
        computedM_st = start_c - 2 + bodrder05 + offsetLeft;
        computedM_ed = start_r - 1 + bodrder05 + offsetTop;
        computedLine_st = end_c - 2 + bodrder05 + offsetLeft;
        computedLine_ed = start_r - 1 + bodrder05 + offsetTop;
        setLineDashDirection = "h";
    } else if (direction === "bottom") {
        computedM_st = start_c - 2 + bodrder05 + offsetLeft;
        computedM_ed = end_r - 2 + bodrder05 + offsetTop;
        computedLine_st = end_c - 2 + bodrder05 + offsetLeft;
        computedLine_ed = end_r - 2 + bodrder05 + offsetTop;
        setLineDashDirection = "h";
    }

    let finalLinetype = linetype != null ? linetype : computedLinetype;
    let finalM_st = m_st != null ? m_st : computedM_st;
    let finalM_ed = m_ed != null ? m_ed : computedM_ed;
    let finalLine_st = line_st != null ? line_st : computedLine_st;
    let finalLine_ed = line_ed != null ? line_ed : computedLine_ed;

    ctx.save();
    menuButton.setLineDash(ctx, finalLinetype, setLineDashDirection, finalM_st, finalM_ed, finalLine_st, finalLine_ed);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

export {
    initCanvasDefaults,
    getCellTextColor,
    getCellBgColor,
    drawGridLine,
    resetCanvasStroke,
    getRowStartEnd,
    getColStartEnd,
    drawBorder
};
