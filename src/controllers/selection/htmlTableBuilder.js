import Store from "../../store/index.js";
import { getcellvalue } from "../../global/getdata.js";
import { getObjType, chatatABC } from "../../utils/util.js";

export function getCellHtmlValue(r, c, data) {
    if (data[r] == null || data[r][c] == null) {
        return "";
    }

    let cell = data[r][c];
    let reg = /^(w|W)((0?)|(0\.0+))$/;
    let c_value;

    if (cell.ct != null && cell.ct.fa != null && cell.ct.fa.match(reg)) {
        c_value = getcellvalue(r, c, data);
    } else {
        c_value = getcellvalue(r, c, data, "m");
    }

    if (c_value == null) {
        c_value = getcellvalue(r, c, data);
    }

    if (c_value == null && cell.ct && cell.ct.t == "inlineStr") {
        c_value = cell.ct.s.map(function (val) {
            var brDom = document.createElement('br');
            brDom.style.cssText = "mso-data-placement:same-cell;";
            var splitValue = val.v.split("\r\n");
            return splitValue.map(function (item) {
                if (!item) {
                    return "";
                }
                var font = document.createElement("font");
                val.fs && (font.style.fontSize = val.fs + "pt");
                val.bl && (font.style.fontWeight = "bold");
                val.it && (font.style.fontStyle = "italic");
                val.un && (font.style.textDecoration = "underline");
                val.fc && (font.style.color = val.fc);
                if (val.cl) {
                    font.insertAdjacentHTML('beforeend', "<s>" + item + "</s>");
                } else {
                    font.textContent = item;
                }
                return font.outerHTML;
            }).join(brDom.outerHTML);
        }).join("");
    }

    if (c_value == null) {
        c_value = "";
    }

    return c_value;
}

export function getCellBorderStyle(r, c, borderInfoCompute, selection) {
    let style = "";

    if (borderInfoCompute && borderInfoCompute[r + "_" + c]) {
        if (borderInfoCompute[r + "_" + c].l) {
            let linetype = borderInfoCompute[r + "_" + c].l.style;
            let bcolor = borderInfoCompute[r + "_" + c].l.color;
            style += "border-left:" + selection.getHtmlBorderStyle(linetype, bcolor);
        }

        if (borderInfoCompute[r + "_" + c].r) {
            let linetype = borderInfoCompute[r + "_" + c].r.style;
            let bcolor = borderInfoCompute[r + "_" + c].r.color;
            style += "border-right:" + selection.getHtmlBorderStyle(linetype, bcolor);
        }

        if (borderInfoCompute[r + "_" + c].b) {
            let linetype = borderInfoCompute[r + "_" + c].b.style;
            let bcolor = borderInfoCompute[r + "_" + c].b.color;
            style += "border-bottom:" + selection.getHtmlBorderStyle(linetype, bcolor);
        }

        if (borderInfoCompute[r + "_" + c].t) {
            let linetype = borderInfoCompute[r + "_" + c].t.style;
            let bcolor = borderInfoCompute[r + "_" + c].t.color;
            style += "border-top:" + selection.getHtmlBorderStyle(linetype, bcolor);
        }
    }

    return style;
}

export function getMergedCellBorderStyle(r, c, mc, borderInfoCompute, selection) {
    let style = "";

    if (!borderInfoCompute || !borderInfoCompute[r + "_" + c]) {
        return style;
    }

    let bl_obj = { color: {}, style: {} },
        br_obj = { color: {}, style: {} },
        bt_obj = { color: {}, style: {} },
        bb_obj = { color: {}, style: {} };

    for (let bd_r = r; bd_r < r + mc.rs; bd_r++) {
        for (let bd_c = c; bd_c < c + mc.cs; bd_c++) {
            if (bd_r == r && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].t) {
                let linetype = borderInfoCompute[bd_r + "_" + bd_c].t.style;
                let bcolor = borderInfoCompute[bd_r + "_" + bd_c].t.color;
                if (bt_obj.style[linetype] == null) {
                    bt_obj.style[linetype] = 1;
                } else {
                    bt_obj.style[linetype] = bt_obj.style[linetype] + 1;
                }
                if (bt_obj.color[bcolor] == null) {
                    bt_obj.color[bcolor] = 1;
                } else {
                    bt_obj.color[bcolor] = bt_obj.color[bcolor] + 1;
                }
            }

            if (bd_r == r + mc.rs - 1 && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].b) {
                let linetype = borderInfoCompute[bd_r + "_" + bd_c].b.style;
                let bcolor = borderInfoCompute[bd_r + "_" + bd_c].b.color;
                if (bb_obj.style[linetype] == null) {
                    bb_obj.style[linetype] = 1;
                } else {
                    bb_obj.style[linetype] = bb_obj.style[linetype] + 1;
                }
                if (bb_obj.color[bcolor] == null) {
                    bb_obj.color[bcolor] = 1;
                } else {
                    bb_obj.color[bcolor] = bb_obj.color[bcolor] + 1;
                }
            }

            if (bd_c == c && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].l) {
                let linetype = borderInfoCompute[bd_r + "_" + bd_c].l.style;
                let bcolor = borderInfoCompute[bd_r + "_" + bd_c].l.color;
                if (bl_obj.style[linetype] == null) {
                    bl_obj.style[linetype] = 1;
                } else {
                    bl_obj.style[linetype] = bl_obj.style[linetype] + 1;
                }
                if (bl_obj.color[bcolor] == null) {
                    bl_obj.color[bcolor] = 1;
                } else {
                    bl_obj.color[bcolor] = bl_obj.color[bcolor] + 1;
                }
            }

            if (bd_c == c + mc.cs - 1 && borderInfoCompute[bd_r + "_" + bd_c] && borderInfoCompute[bd_r + "_" + bd_c].r) {
                let linetype = borderInfoCompute[bd_r + "_" + bd_c].r.style;
                let bcolor = borderInfoCompute[bd_r + "_" + bd_c].r.color;
                if (br_obj.style[linetype] == null) {
                    br_obj.style[linetype] = 1;
                } else {
                    br_obj.style[linetype] = br_obj.style[linetype] + 1;
                }
                if (br_obj.color[bcolor] == null) {
                    br_obj.color[bcolor] = 1;
                } else {
                    br_obj.color[bcolor] = br_obj.color[bcolor] + 1;
                }
            }
        }
    }

    let rowlen = mc.rs,
        collen = mc.cs;

    if (JSON.stringify(bl_obj).length > 23) {
        let bl_color = null,
            bl_style = null;
        for (let x in bl_obj.color) {
            if (bl_obj.color[x] >= rowlen / 2) {
                bl_color = x;
            }
        }
        for (let x in bl_obj.style) {
            if (bl_obj.style[x] >= rowlen / 2) {
                bl_style = x;
            }
        }
        if (bl_color != null && bl_style != null) {
            style += "border-left:" + selection.getHtmlBorderStyle(bl_style, bl_color);
        }
    }

    if (JSON.stringify(br_obj).length > 23) {
        let br_color = null,
            br_style = null;
        for (let x in br_obj.color) {
            if (br_obj.color[x] >= rowlen / 2) {
                br_color = x;
            }
        }
        for (let x in br_obj.style) {
            if (br_obj.style[x] >= rowlen / 2) {
                br_style = x;
            }
        }
        if (br_color != null && br_style != null) {
            style += "border-right:" + selection.getHtmlBorderStyle(br_style, br_color);
        }
    }

    if (JSON.stringify(bt_obj).length > 23) {
        let bt_color = null,
            bt_style = null;
        for (let x in bt_obj.color) {
            if (bt_obj.color[x] >= collen / 2) {
                bt_color = x;
            }
        }
        for (let x in bt_obj.style) {
            if (bt_obj.style[x] >= collen / 2) {
                bt_style = x;
            }
        }
        if (bt_color != null && bt_style != null) {
            style += "border-top:" + selection.getHtmlBorderStyle(bt_style, bt_color);
        }
    }

    if (JSON.stringify(bb_obj).length > 23) {
        let bb_color = null,
            bb_style = null;
        for (let x in bb_obj.color) {
            if (bb_obj.color[x] >= collen / 2) {
                bb_color = x;
            }
        }
        for (let x in bb_obj.style) {
            if (bb_obj.style[x] >= collen / 2) {
                bb_style = x;
            }
        }
        if (bb_color != null && bb_style != null) {
            style += "border-bottom:" + selection.getHtmlBorderStyle(bb_style, bb_color);
        }
    }

    return style;
}

export function dataToJsonObject(data) {
    let arr = [];
    if (data === null) {
        return arr;
    }
    if (data.length === 1) {
        let obj = {};
        for (let i = 0; i < data[0].length; i++) {
            obj[getcellvalue(0, i, data)] = "";
        }
        arr.push(obj);
    } else {
        for (let r = 1; r < data.length; r++) {
            let obj = {};
            for (let c = 0; c < data[0].length; c++) {
                if (getcellvalue(0, c, data) == undefined) {
                    obj[""] = getcellvalue(r, c, data);
                } else {
                    obj[getcellvalue(0, c, data)] = getcellvalue(r, c, data);
                }
            }
            arr.push(obj);
        }
    }
    return arr;
}

export function dataToJsonNoHeaderObject(data, startCol) {
    let arr = [];
    if (data === null) {
        return arr;
    }
    let st = startCol || 0;
    for (let r = 0; r < data.length; r++) {
        let obj = {};
        for (let c = 0; c < data[0].length; c++) {
            obj[chatatABC(c + st)] = getcellvalue(r, c, data);
        }
        arr.push(obj);
    }
    return arr;
}
