import {  isRealNum,  isRealNull,  checkIsAllowEdit  } from "../../global/validate";
import {  update,  is_date  } from "../../global/format";
import {  jfrefreshgrid } from "../../global/refresh";
import luckysheetformula from "../../global/formula";
import {  rowlenByRange } from "../../global/getRowlen";
import {  getCurrentFile } from "../../utils/storeAccess.js";
import {  isInputBoxActive } from "../../utils/domUtils.js";
import {  isInlineStringCT,  updateInlineStringFormat,  inlineStyleAffectAttribute,  updateInlineStringFormatOutside  } from "../inlineString";
import {  getObjType, isRowHidden } from "../../utils/util";
import Store from "../../store";
import inputBox from '../../ui/inputBox.js';
const formatUpdateModule = {
  getQKBorder: function (width, type, color) {
    let bordertype = "";
    if (width.indexOf("pt") > -1) {
      width = parseFloat(width);
      if (width < 1) {} else if (width < 1.5) {
        bordertype = "Medium";
      } else {
        bordertype = "Thick";
      }
    } else {
      width = parseFloat(width);
      if (width < 2) {} else if (width < 3) {
        bordertype = "Medium";
      } else {
        bordertype = "Thick";
      }
    }
    let style = 0;
    type = type.toLowerCase();
    if (type == "double") {
      style = 2;
    } else if (type == "dotted") {
      if (bordertype == "Medium" || bordertype == "Thick") {
        style = 3;
      } else {
        style = 10;
      }
    } else if (type == "dashed") {
      if (bordertype == "Medium" || bordertype == "Thick") {
        style = 4;
      } else {
        style = 9;
      }
    } else if (type == "solid") {
      if (bordertype == "Medium") {
        style = 8;
      } else if (bordertype == "Thick") {
        style = 13;
      } else {
        style = 1;
      }
    }
    return [style, color];
  },
  updateFormatCell: function (d, attr, foucsStatus, row_st, row_ed, col_st, col_ed) {
    if (d == null || attr == null) {
      return;
    }
    if (attr == "ct") {
      for (let r = row_st; r <= row_ed; r++) {
        if (isRowHidden(r)) {
          continue;
        }
        for (let c = col_st; c <= col_ed; c++) {
          let cell = d[r][c],
            value = null;
          if (getObjType(cell) == "object") {
            value = d[r][c]["v"];
          } else {
            value = d[r][c];
          }
          if (foucsStatus != "@" && isRealNum(value)) {
            value = parseFloat(value);
          }
          let mask = update(foucsStatus, value);
          let type = "n";
          if (is_date(foucsStatus) || foucsStatus === 14 || foucsStatus === 15 || foucsStatus === 16 || foucsStatus === 17 || foucsStatus === 18 || foucsStatus === 19 || foucsStatus === 20 || foucsStatus === 21 || foucsStatus === 22 || foucsStatus === 45 || foucsStatus === 46 || foucsStatus === 47) {
            type = "d";
          } else if (foucsStatus == "@" || foucsStatus === 49) {
            type = "s";
          } else if (foucsStatus == "General" || foucsStatus === 0) {
            // type = "g";
            type = isRealNum(value) ? "n" : "g";
          }
          if (getObjType(cell) == "object") {
            d[r][c]["m"] = mask;
            if (d[r][c]["ct"] == null) {
              d[r][c]["ct"] = {};
            }
            d[r][c]["ct"]["fa"] = foucsStatus;
            d[r][c]["ct"]["t"] = type;
          } else {
            d[r][c] = {
              ct: {
                fa: foucsStatus,
                t: type
              },
              v: value,
              m: mask
            };
          }
        }
      }
    } else {
      if (attr == "ht") {
        if (foucsStatus == "left") {
          foucsStatus = "1";
        } else if (foucsStatus == "center") {
          foucsStatus = "0";
        } else if (foucsStatus == "right") {
          foucsStatus = "2";
        }
      } else if (attr == "vt") {
        if (foucsStatus == "top") {
          foucsStatus = "1";
        } else if (foucsStatus == "middle") {
          foucsStatus = "0";
        } else if (foucsStatus == "bottom") {
          foucsStatus = "2";
        }
      } else if (attr == "tb") {
        if (foucsStatus == "overflow") {
          foucsStatus = "1";
        } else if (foucsStatus == "clip") {
          foucsStatus = "0";
        } else if (foucsStatus == "wrap") {
          foucsStatus = "2";
        }
      } else if (attr == "tr") {
        if (foucsStatus == "none") {
          foucsStatus = "0";
        } else if (foucsStatus == "angleup") {
          foucsStatus = "1";
        } else if (foucsStatus == "angledown") {
          foucsStatus = "2";
        } else if (foucsStatus == "vertical") {
          foucsStatus = "3";
        } else if (foucsStatus == "rotation-up") {
          foucsStatus = "4";
        } else if (foucsStatus == "rotation-down") {
          foucsStatus = "5";
        }
      }
      for (let r = row_st; r <= row_ed; r++) {
        if (isRowHidden(r)) {
          continue;
        }
        for (let c = col_st; c <= col_ed; c++) {
          let value = d[r][c];
          if (getObjType(value) == "object") {
            // if(attr in inlineStyleAffectAttribute && isInlineStringCell(value)){
            updateInlineStringFormatOutside(value, attr, foucsStatus);
            // }
            // else{
            d[r][c][attr] = foucsStatus;
            // }
          } else {
            d[r][c] = {
              v: value
            };
            d[r][c][attr] = foucsStatus;
          }

          // if(attr == "tr" && d[r][c].tb != null){
          //     d[r][c].tb = "0";
          // }
        }
      }
    }
  },
  updateFormat: function (d, attr, foucsStatus) {
    let _this = this;

    if (!checkIsAllowEdit()) {
      return;
    }
    let canvasElement = document.createElement("canvas");
    let canvas = canvasElement.getContext("2d");
    if (attr in inlineStyleAffectAttribute) {
      if (isInputBoxActive()) {
        let value = inputBox.el?.textContent || "";
        if (value.substr(0, 1) != "=") {
          let cell = d[Store.luckysheetCellUpdate[0]][Store.luckysheetCellUpdate[1]];
          updateInlineStringFormat(cell, attr, foucsStatus, luckysheetformula.rangeResizeTo);
        }
      }
    }
    let cfg = structuredClone(Store.config);
    if (cfg["rowlen"] == null) {
      cfg["rowlen"] = {};
    }
    for (let s = 0; s < Store.selections.length; s++) {
      let row_st = Store.selections[s]["row"][0],
        row_ed = Store.selections[s]["row"][1];
      let col_st = Store.selections[s]["column"][0],
        col_ed = Store.selections[s]["column"][1];
      this.updateFormatCell(d, attr, foucsStatus, row_st, row_ed, col_st, col_ed);
      if (attr == "tb" || attr == "tr" || attr == "fs") {
        cfg = rowlenByRange(d, row_st, row_ed, cfg);
      }
    }
    let allParam = {};
    if (attr == "tb" || attr == "tr" || attr == "fs") {
      allParam = {
        cfg: cfg,
        RowlChange: true
      };
    }
    jfrefreshgrid(d, Store.selections, allParam, false);
  },
  updateFormat_mc: function (d, foucsStatus) {
    // *如果禁止前台编辑，则中止下一步操作
    if (!checkIsAllowEdit()) {
      return;
    }
    let cfg = structuredClone(Store.config);
    if (cfg["merge"] == null) {
      cfg["merge"] = {};
    }
    if (foucsStatus == "mergeCancel") {
      for (let i = 0; i < Store.selections.length; i++) {
        let range = Store.selections[i];
        let r1 = range["row"][0],
          r2 = range["row"][1];
        let c1 = range["column"][0],
          c2 = range["column"][1];
        if (r1 == r2 && c1 == c2) {
          continue;
        }
        let fv = {};
        for (let r = r1; r <= r2; r++) {
          for (let c = c1; c <= c2; c++) {
            let cell = d[r][c];
            if (cell != null && cell.mc != null) {
              let mc_r = cell.mc.r,
                mc_c = cell.mc.c;
              if ("rs" in cell.mc) {
                delete cell.mc;
                delete cfg["merge"][mc_r + "_" + mc_c];
                fv[mc_r + "_" + mc_c] = structuredClone(cell);
              } else {
                // let cell_clone = fv[mc_r + "_" + mc_c];
                let cell_clone = JSON.parse(JSON.stringify(fv[mc_r + "_" + mc_c]));
                delete cell_clone.v;
                delete cell_clone.m;
                delete cell_clone.ct;
                delete cell_clone.f;
                d[r][c] = cell_clone;
              }
            }
          }
        }
      }
    } else {
      let isHasMc = false; //选区是否含有 合并的单元格

      for (let i = 0; i < Store.selections.length; i++) {
        let range = Store.selections[i];
        let r1 = range["row"][0],
          r2 = range["row"][1];
        let c1 = range["column"][0],
          c2 = range["column"][1];
        for (let r = r1; r <= r2; r++) {
          for (let c = c1; c <= c2; c++) {
            let cell = d[r][c];
            if (getObjType(cell) == "object" && "mc" in cell) {
              isHasMc = true;
              break;
            }
          }
        }
      }
      if (isHasMc) {
        //选区有合并单元格（选区都执行 取消合并）
        for (let i = 0; i < Store.selections.length; i++) {
          let range = Store.selections[i];
          let r1 = range["row"][0],
            r2 = range["row"][1];
          let c1 = range["column"][0],
            c2 = range["column"][1];
          if (r1 == r2 && c1 == c2) {
            continue;
          }
          let fv = {};
          for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
              let cell = d[r][c];
              if (cell != null && cell.mc != null) {
                let mc_r = cell.mc.r,
                  mc_c = cell.mc.c;
                if ("rs" in cell.mc) {
                  delete cell.mc;
                  delete cfg["merge"][mc_r + "_" + mc_c];
                  fv[mc_r + "_" + mc_c] = structuredClone(cell);
                } else {
                  // let cell_clone = fv[mc_r + "_" + mc_c];
                  let cell_clone = JSON.parse(JSON.stringify(fv[mc_r + "_" + mc_c]));
                  delete cell_clone.v;
                  delete cell_clone.m;
                  delete cell_clone.ct;
                  delete cell_clone.f;
                  d[r][c] = cell_clone;
                }
              }
            }
          }
        }
      } else {
        for (let i = 0; i < Store.selections.length; i++) {
          let range = Store.selections[i];
          let r1 = range["row"][0],
            r2 = range["row"][1];
          let c1 = range["column"][0],
            c2 = range["column"][1];
          if (r1 == r2 && c1 == c2) {
            continue;
          }
          if (foucsStatus == "mergeAll") {
            let fv = {},
              isfirst = false;
            for (let r = r1; r <= r2; r++) {
              for (let c = c1; c <= c2; c++) {
                let cell = d[r][c];
                if (cell != null && (isInlineStringCT(cell.ct) || !isRealNull(cell.v) || cell.f != null) && !isfirst) {
                  fv = structuredClone(cell);
                  isfirst = true;
                }
                d[r][c] = {
                  mc: {
                    r: r1,
                    c: c1
                  }
                };
              }
            }
            d[r1][c1] = fv;
            d[r1][c1].mc = {
              r: r1,
              c: c1,
              rs: r2 - r1 + 1,
              cs: c2 - c1 + 1
            };
            cfg["merge"][r1 + "_" + c1] = {
              r: r1,
              c: c1,
              rs: r2 - r1 + 1,
              cs: c2 - c1 + 1
            };
          } else if (foucsStatus == "mergeV") {
            for (let c = c1; c <= c2; c++) {
              let fv = {},
                isfirst = false;
              for (let r = r1; r <= r2; r++) {
                let cell = d[r][c];
                if (cell != null && (!isRealNull(cell.v) || cell.f != null) && !isfirst) {
                  fv = structuredClone(cell);
                  isfirst = true;
                }
                d[r][c] = {
                  mc: {
                    r: r1,
                    c: c
                  }
                };
              }
              d[r1][c] = fv;
              d[r1][c].mc = {
                r: r1,
                c: c,
                rs: r2 - r1 + 1,
                cs: 1
              };
              cfg["merge"][r1 + "_" + c] = {
                r: r1,
                c: c,
                rs: r2 - r1 + 1,
                cs: 1
              };
            }
          } else if (foucsStatus == "mergeH") {
            for (let r = r1; r <= r2; r++) {
              let fv = {},
                isfirst = false;
              for (let c = c1; c <= c2; c++) {
                let cell = d[r][c];
                if (cell != null && (!isRealNull(cell.v) || cell.f != null) && !isfirst) {
                  fv = structuredClone(cell);
                  isfirst = true;
                }
                d[r][c] = {
                  mc: {
                    r: r,
                    c: c1
                  }
                };
              }
              d[r][c1] = fv;
              d[r][c1].mc = {
                r: r,
                c: c1,
                rs: 1,
                cs: c2 - c1 + 1
              };
              cfg["merge"][r + "_" + c1] = {
                r: r,
                c: c1,
                rs: 1,
                cs: c2 - c1 + 1
              };
            }
          }
        }
      }
    }
    const file = getCurrentFile();
    const calc = file.calcChain?.filter(({
      r,
      c
    }) => d[r][c]?.f);
    const hyperlink = file.hyperlink && Object.fromEntries(Object.entries(file.hyperlink).filter(([r_c]) => {
      const [r, c] = r_c.split("_");
      return d[r][c]?.v;
    }));
    if (Store.clearjfundo) {
      Store.jfundo.length = 0;
      Store.jfredo.push({
        type: "mergeChange",
        sheetIndex: Store.currentSheetIndex,
        data: Store.sheetData,
        curData: d,
        range: structuredClone(Store.selections),
        config: structuredClone(Store.config),
        curConfig: cfg,
        calc: file.calcChain,
        curCalc: calc,
        hyperlink: file.hyperlink,
        curHyperlink: hyperlink
      });
    }
    Store.clearjfundo = false;
    jfrefreshgrid(d, Store.selections, {
      cfg,
      calc,
      hyperlink
    });
    Store.clearjfundo = true;
  }
};
export default formatUpdateModule;