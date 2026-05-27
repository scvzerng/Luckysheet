import editor from "../editor";
import formula from "../formula";
import { jfrefreshgrid_adRC, jfrefreshgrid_deleteCell, jfrefreshgrid_rhcw } from "../refresh";
import { datagridgrowth, getcellFormula } from "../getdata";
import { setcellvalue } from "../setdata";
import conditionformat from "../../controllers/conditionformat";
import luckysheetFreezen from "../../controllers/freezen";
import { selectHightlightShow } from "../../controllers/select";
import { luckysheet_searcharray } from "../../controllers/sheetSearch";
import { getSheetIndex } from "../../methods/get";
import Store from "../../store";
import method from "../method";

/**
 * 增加行列
 * @param {string} type 行或列 ['row', 'column'] 之一
 * @param {number} index 插入的位置 index
 * @param {number} value 插入 多少 行（列）
 * @param {string} direction 哪个方向插入 ['lefttop','rightbottom'] 之一
 * @param {string | number} sheetIndex 操作的 sheet 的 index 属性
 * @returns
 */

//删除单元格
function luckysheetDeleteCell(type, str, edr, stc, edc, sheetIndex) {
  sheetIndex = sheetIndex || Store.currentSheetIndex;

  // Hook function
  if (!method.createHookFunction("rangeDeleteBefore", str, stc)) {
    return;
  }
  let curOrder = getSheetIndex(sheetIndex);
  let file = Store.luckysheetfile[curOrder];
  let d = $.extend(true, [], file.data);
  let rlen = edr - str + 1;
  let clen = edc - stc + 1;
  let cfg = $.extend(true, {}, Store.config);

  //合并单元格配置变动
  if (cfg["merge"] == null) {
    cfg["merge"] = {};
  }
  let merge_new = {};
  for (let m in cfg["merge"]) {
    let mc = cfg["merge"][m];
    let r = mc.r,
      c = mc.c,
      rs = mc.rs,
      cs = mc.cs;
    if (type == "moveLeft") {
      if (str > r + rs - 1 || edr < r || stc > c + cs - 1) {
        merge_new[r + "_" + c] = {
          r: r,
          c: c,
          rs: rs,
          cs: cs
        };
      } else if (str <= r && edr >= r + rs - 1 && edc < c) {
        merge_new[r + "_" + (c - clen)] = {
          r: r,
          c: c - clen,
          rs: rs,
          cs: cs
        };
      } else {
        for (let r_i = r; r_i <= r + rs - 1; r_i++) {
          for (let c_i = c; c_i <= c + cs - 1; c_i++) {
            delete d[r_i][c_i].mc;
          }
        }
      }
    } else if (type == "moveUp") {
      if (stc > c + cs - 1 || edc < c || str > r + rs - 1) {
        merge_new[r + "_" + c] = {
          r: r,
          c: c,
          rs: rs,
          cs: cs
        };
      } else if (stc <= c && edc >= c + cs - 1 && edr < r) {
        merge_new[r - rlen + "_" + c] = {
          r: r - rlen,
          c: c,
          rs: rs,
          cs: cs
        };
      } else {
        for (let r_i = r; r_i <= r + rs - 1; r_i++) {
          for (let c_i = c; c_i <= c + cs - 1; c_i++) {
            delete d[r_i][c_i].mc;
          }
        }
      }
    }
  }
  cfg["merge"] = merge_new;

  //公式配置变动
  let calcChain = file.calcChain;
  let newCalcChain = [];
  if (calcChain != null && calcChain.length > 0) {
    for (let i = 0; i < calcChain.length; i++) {
      let calc = $.extend(true, {}, calcChain[i]);
      let calc_r = calc.r,
        calc_c = calc.c,
        calc_i = calc.index,
        calc_funcStr = getcellFormula(calc_r, calc_c, calc_i);

      // 添加进公式后，可能又直接覆盖了单元格值
      if (!calc_funcStr) continue;
      if (calc_r < str || calc_r > edr || calc_c < stc || calc_c > edc) {
        let functionStr;
        if (type == "moveLeft") {
          functionStr = "=" + formula.functionStrChange(calc_funcStr, "del", "col", null, stc, clen);
          if (calc_c > edc && calc_r >= str && calc_r <= edr) {
            calc.c = calc_c - clen;
          }
        } else if (type == "moveUp") {
          functionStr = "=" + formula.functionStrChange(calc_funcStr, "del", "row", null, str, rlen);
          if (calc_r > edr && calc_c >= stc && calc_c <= edc) {
            calc.r = calc_r - rlen;
          }
        }
        if (d[calc_r][calc_c] && d[calc_r][calc_c].f == calc_funcStr) {
          d[calc_r][calc_c].f = functionStr;
        }
        newCalcChain.push(calc);
      }
    }
  }

  //筛选配置变动
  let filter_select = file.filter_select;
  let filter = file.filter;
  let newFilterObj = null;
  if (filter_select != null && JSON.stringify(filter_select) != "{}") {
    newFilterObj = {
      filter_select: null,
      filter: null
    };
    let f_r1 = filter_select.row[0],
      f_r2 = filter_select.row[1];
    let f_c1 = filter_select.column[0],
      f_c2 = filter_select.column[1];
    if (type == "moveUp") {
      if (f_c1 >= stc && f_c2 <= edc) {
        if (f_r1 > edr) {
          newFilterObj.filter_select = {
            row: [f_r1 - rlen, f_r2 - rlen],
            column: [f_c1, f_c2]
          };
        } else if (f_r2 < str) {
          newFilterObj.filter_select = {
            row: [f_r1, f_r2],
            column: [f_c1, f_c2]
          };
        } else if (f_r1 < str) {
          if (f_r2 > edr) {
            newFilterObj.filter_select = {
              row: [f_r1, f_r2 - rlen],
              column: [f_c1, f_c2]
            };
          } else {
            newFilterObj.filter_select = {
              row: [f_r1, str - 1],
              column: [f_c1, f_c2]
            };
          }
        }
        if (newFilterObj.filter_select != null && filter != null) {
          for (let k in filter) {
            let f_rowhidden = filter[k].rowhidden;
            let f_rowhidden_new = {};
            for (let n in f_rowhidden) {
              if (n < str) {
                f_rowhidden_new[n] = 0;
              } else if (n > edr) {
                f_rowhidden_new[n - slen] = 0;
              }
            }
            if (newFilterObj.filter == null) {
              newFilterObj.filter = {};
            }
            newFilterObj.filter[k] = $.extend(true, {}, filter[k]);
            if (JSON.stringify(f_rowhidden_new) != "{}") {
              newFilterObj.filter[k].rowhidden = f_rowhidden_new;
            }
            newFilterObj.filter[k].str = newFilterObj.filter_select.row[0];
            newFilterObj.filter[k].edr = newFilterObj.filter_select.row[1];
          }
        }
      } else if (f_r1 >= str && f_r2 <= edr) {
        if (f_c1 > edc) {
          newFilterObj.filter_select = {
            row: [f_r1, f_r2],
            column: [f_c1, f_c2]
          };
        } else if (f_c1 >= stc) {
          if (f_c2 > edc) {
            newFilterObj.filter_select = {
              row: [f_r1, f_r2],
              column: [stc, f_c2 - clen]
            };
          }
        } else {
          if (f_c2 < stc) {
            newFilterObj.filter_select = {
              row: [f_r1, f_r2],
              column: [f_c1, f_c2]
            };
          } else if (f_c2 <= edc) {
            newFilterObj.filter_select = {
              row: [f_r1, f_r2],
              column: [f_c1, stc - 1]
            };
          } else {
            newFilterObj.filter_select = {
              row: [f_r1, f_r2],
              column: [f_c1, f_c2 - clen]
            };
          }
        }
        if (newFilterObj.filter_select != null && filter != null) {
          for (let k in filter) {
            let f_stc = newFilterObj.filter_select.column[0];
            let f_edc = newFilterObj.filter_select.column[1];
            let f_cindex = filter[k].cindex;
            if (f_cindex < stc || f_cindex > edc) {
              if (newFilterObj.filter == null) {
                newFilterObj.filter = {};
              }
              if (f_cindex > edc) {
                f_cindex -= clen;
              }
              let k2 = f_cindex - f_stc;
              newFilterObj.filter[k2] = $.extend(true, {}, filter[k]);
              newFilterObj.filter[k2].cindex = f_cindex;
              newFilterObj.filter[k2].stc = f_stc;
              newFilterObj.filter[k2].edc = f_edc;
            }
          }
        }
      } else {
        newFilterObj.filter_select = {
          row: [f_r1, f_r2],
          column: [f_c1, f_c2]
        };
        if (filter != null) {
          newFilterObj.filter = filter;
        }
      }
    } else if (type == "moveLeft") {
      if (f_r1 >= str && f_r2 <= edr) {
        if (f_c1 > edc) {
          newFilterObj.filter_select = {
            row: [f_r1, f_r2],
            column: [f_c1 - clen, f_c2 - clen]
          };
        } else if (f_c2 < stc) {
          newFilterObj.filter_select = {
            row: [f_r1, f_r2],
            column: [f_c1, f_c2]
          };
        } else if (f_c1 < stc) {
          if (f_c2 > edc) {
            newFilterObj.filter_select = {
              row: [f_r1, f_r2],
              column: [f_c1, f_c2 - clen]
            };
          } else {
            newFilterObj.filter_select = {
              row: [f_r1, f_r2],
              column: [f_c1, stc - 1]
            };
          }
        }
        if (newFilterObj.filter_select != null && filter != null) {
          for (let k in filter) {
            let f_stc = newFilterObj.filter_select.column[0];
            let f_edc = newFilterObj.filter_select.column[1];
            let f_cindex = filter[k].cindex;
            if (f_cindex < stc || f_cindex > edc) {
              if (newFilterObj.filter == null) {
                newFilterObj.filter = {};
              }
              if (f_cindex > edc) {
                f_cindex -= clen;
              }
              let k2 = f_cindex - f_stc;
              newFilterObj.filter[k2] = $.extend(true, {}, filter[k]);
              newFilterObj.filter[k2].cindex = f_cindex;
              newFilterObj.filter[k2].stc = f_stc;
              newFilterObj.filter[k2].edc = f_edc;
            }
          }
        }
      } else if (f_c1 >= stc && f_c2 <= edc) {
        if (f_r1 < str || f_r1 > edr) {
          newFilterObj.filter_select = {
            row: [f_r1, f_r2],
            column: [f_c1, f_c2]
          };
          if (filter != null) {
            newFilterObj.filter = filter;
          }
        }
      } else {
        newFilterObj.filter_select = {
          row: [f_r1, f_r2],
          column: [f_c1, f_c2]
        };
        if (filter != null) {
          newFilterObj.filter = filter;
        }
      }
    }
  }
  if (newFilterObj != null && newFilterObj.filter != null) {
    if (cfg["rowhidden"] == null) {
      cfg["rowhidden"] = {};
    }
    for (let k in newFilterObj.filter) {
      let f_rowhidden = newFilterObj.filter[k].rowhidden;
      for (let n in f_rowhidden) {
        cfg["rowhidden"][n] = 0;
      }
    }
  }

  //条件格式配置变动
  let CFarr = file.luckysheet_conditionformat_save;
  let newCFarr = [];
  if (CFarr != null && CFarr.length > 0) {
    for (let i = 0; i < CFarr.length; i++) {
      let cf_range = CFarr[i].cellrange;
      let cf_new_range = [];
      for (let j = 0; j < cf_range.length; j++) {
        let CFr1 = cf_range[j].row[0],
          CFr2 = cf_range[j].row[1],
          CFc1 = cf_range[j].column[0],
          CFc2 = cf_range[j].column[1];
        if (!(str <= CFr1 && edr >= CFr2 && stc <= CFc1 && edc >= CFc2)) {
          cf_new_range = getMoveRange(type, str, edr, stc, edc, CFr1, CFr2, CFc1, CFc2, rlen, clen);
        }
      }
      if (cf_new_range.length > 0) {
        let cf = $.extend(true, {}, CFarr[i]);
        cf.cellrange = cf_new_range;
        newCFarr.push(cf);
      }
    }
  }

  //超链接配置变动
  let hyperlink = file.hyperlink;
  let newHyperlink = {};
  if (hyperlink != null) {
    for (let key in hyperlink) {
      let r = Number(key.split("_")[0]),
        c = Number(key.split("_")[1]);
      let item = hyperlink[key];
      if (r < str || r > edr || c < stc || c > edc) {
        if (type == "moveLeft") {
          if (c > edc && r >= str && r <= edr) {
            newHyperlink[r + "_" + (c - clen)] = item;
          } else {
            newHyperlink[r + "_" + c] = item;
          }
        } else if (type == "moveUp") {
          if (r > edr && c >= stc && c <= edc) {
            newHyperlink[r - rlen + "_" + c] = item;
          } else {
            newHyperlink[r + "_" + c] = item;
          }
        }
      }
    }
  }

  //边框配置变动
  if (cfg["borderInfo"] && cfg["borderInfo"].length > 0) {
    let borderInfo = [];
    for (let i = 0; i < cfg["borderInfo"].length; i++) {
      let rangeType = cfg["borderInfo"][i].rangeType;
      if (rangeType == "range") {
        let borderRange = cfg["borderInfo"][i].range;
        let emptyRange = [];
        for (let j = 0; j < borderRange.length; j++) {
          let bd_r1 = borderRange[j].row[0],
            bd_r2 = borderRange[j].row[1],
            bd_c1 = borderRange[j].column[0],
            bd_c2 = borderRange[j].column[1];
          if (!(str <= bd_r1 && edr >= bd_r2 && stc <= bd_c1 && edc >= bd_c2)) {
            emptyRange = getMoveRange(type, str, edr, stc, edc, bd_r1, bd_r2, bd_c1, bd_c2, rlen, clen);
          }
        }
        if (emptyRange.length > 0) {
          let bd_obj = {
            rangeType: "range",
            borderType: cfg["borderInfo"][i].borderType,
            style: cfg["borderInfo"][i].style,
            color: cfg["borderInfo"][i].color,
            range: emptyRange
          };
          borderInfo.push(bd_obj);
        }
      } else if (rangeType == "cell") {
        let row_index = cfg["borderInfo"][i].value.row_index;
        let col_index = cfg["borderInfo"][i].value.col_index;
        if (row_index < str || row_index > edr || col_index < stc || col_index > edc) {
          if (type == "moveLeft") {
            if (col_index > edc && row_index >= str && row_index <= edr) {
              col_index -= clen;
              cfg["borderInfo"][i].value.col_index = col_index;
            }
          } else if (type == "moveUp") {
            if (row_index > edr && col_index >= stc && col_index <= edc) {
              row_index -= rlen;
              cfg["borderInfo"][i].value.row_index = row_index;
            }
          }
          borderInfo.push(cfg["borderInfo"][i]);
        }
      }
    }
    cfg["borderInfo"] = borderInfo;
  }

  //空白列模板
  let addcol = [];
  for (let c = stc; c <= edc; c++) {
    addcol.push(null);
  }
  if (type == "moveUp") {
    //上移
    let data = [];
    for (let r = str; r <= d.length - 1; r++) {
      let row = [];
      for (let c = stc; c <= edc; c++) {
        row.push(d[r][c]);
      }
      data.push(row);
    }
    data.splice(0, rlen);

    //空白行模板
    let addrow = [];
    for (let r = str; r <= edr; r++) {
      addrow.push(addcol);
    }
    data = data.concat(addrow);
    for (let r = str; r <= d.length - 1; r++) {
      for (let c = stc; c <= edc; c++) {
        d[r][c] = data[r - str][c - stc];
      }
    }
  } else if (type == "moveLeft") {
    //左移
    for (let r = str; r <= edr; r++) {
      d[r].splice(stc, clen);
      d[r] = d[r].concat(addcol);
    }
  }
  if (file.index == Store.currentSheetIndex) {
    jfrefreshgrid_deleteCell(d, cfg, {
      type: type,
      str: str,
      edr: edr,
      stc: stc,
      edc: edc
    }, newCalcChain, newFilterObj, newCFarr, newHyperlink);
  } else {
    file.data = d;
    file.config = cfg;
    file.calcChain = newCalcChain;
    file.filter = newFilterObj.filter;
    file.filter_select = newFilterObj.filter_select;
    file.luckysheet_conditionformat_save = newCFarr;
    file.hyperlink = newHyperlink;
  }
}
function getMoveRange(type, str, edr, stc, edc, r1, r2, c1, c2, rlen, clen) {
  let newRange = [];
  if (type == "moveLeft") {
    if (str > r2 || edr < r1 || stc > c2) {
      newRange.push({
        row: [r1, r2],
        column: [c1, c2]
      });
    } else if (edc < c1) {
      if (str <= r1 && edr >= r2) {
        newRange.push({
          row: [r1, r2],
          column: [c1 - clen, c2 - clen]
        });
      } else if (str > r1 && edr < r2) {
        let range = [{
          row: [r1, str - 1],
          column: [c1, c2]
        }, {
          row: [edr + 1, r2],
          column: [c1, c2]
        }, {
          row: [str, edr],
          column: [c1 - clen, c2 - clen]
        }];
        newRange = newRange.concat(range);
      } else if (str > r1) {
        let range = [{
          row: [r1, str - 1],
          column: [c1, c2]
        }, {
          row: [str, r2],
          column: [c1 - clen, c2 - clen]
        }];
        newRange = newRange.concat(range);
      } else if (edr < r2) {
        let range = [{
          row: [r1, edr],
          column: [c1 - clen, c2 - clen]
        }, {
          row: [edr + 1, r2],
          column: [c1, c2]
        }];
        newRange = newRange.concat(range);
      }
    } else if (edc >= c1) {
      if (stc <= c1 && edc >= c2) {
        if (str > r1 && edr < r2) {
          let range = [{
            row: [r1, str - 1],
            column: [c1, c2]
          }, {
            row: [edr + 1, r2],
            column: [c1, c2]
          }];
          newRange = newRange.concat(range);
        } else if (str > r1) {
          let range = [{
            row: [r1, str - 1],
            column: [c1, c2]
          }];
          newRange = newRange.concat(range);
        } else if (edr < r2) {
          let range = [{
            row: [edr + 1, r2],
            column: [c1, c2]
          }];
          newRange = newRange.concat(range);
        }
      } else if (stc > c1 && edc < c2) {
        if (str <= r1 && edr >= r2) {
          newRange.push({
            row: [r1, r2],
            column: [c1, c2 - clen]
          });
        } else if (str > r1 && edr < r2) {
          let range = [{
            row: [r1, str - 1],
            column: [c1, c2]
          }, {
            row: [edr + 1, r2],
            column: [c1, c2]
          }, {
            row: [str, edr],
            column: [c1, c2 - clen]
          }];
          newRange = newRange.concat(range);
        } else if (str > r1) {
          let range = [{
            row: [r1, str - 1],
            column: [c1, c2]
          }, {
            row: [str, r2],
            column: [c1, c2 - clen]
          }];
          newRange = newRange.concat(range);
        } else if (edr < r2) {
          let range = [{
            row: [r1, edr],
            column: [c1, c2 - clen]
          }, {
            row: [edr + 1, r2],
            column: [c1, c2]
          }];
          newRange = newRange.concat(range);
        }
      } else if (stc > c1) {
        if (str <= r1 && edr >= r2) {
          newRange.push({
            row: [r1, r2],
            column: [c1, stc - 1]
          });
        } else if (str > r1 && edr < r2) {
          let range = [{
            row: [r1, str - 1],
            column: [c1, c2]
          }, {
            row: [edr + 1, r2],
            column: [c1, c2]
          }, {
            row: [str, edr],
            column: [c1, stc - 1]
          }];
          newRange = newRange.concat(range);
        } else if (str > r1) {
          let range = [{
            row: [r1, str - 1],
            column: [c1, c2]
          }, {
            row: [str, r2],
            column: [c1, stc - 1]
          }];
          newRange = newRange.concat(range);
        } else if (edr < r2) {
          let range = [{
            row: [r1, edr],
            column: [c1, stc - 1]
          }, {
            row: [edr + 1, r2],
            column: [c1, c2]
          }];
          newRange = newRange.concat(range);
        }
      } else if (edc < c2) {
        if (str <= r1 && edr >= r2) {
          newRange.push({
            row: [r1, r2],
            column: [c1 - clen, c2 - clen]
          });
        } else if (str > r1 && edr < r2) {
          let range = [{
            row: [r1, str - 1],
            column: [c1, c2]
          }, {
            row: [edr + 1, r2],
            column: [c1, c2]
          }, {
            row: [str, edr],
            column: [c1 - clen, c2 - clen]
          }];
          newRange = newRange.concat(range);
        } else if (str > r1) {
          let range = [{
            row: [r1, str - 1],
            column: [c1, c2]
          }, {
            row: [str, r2],
            column: [c1 - clen, c2 - clen]
          }];
          newRange = newRange.concat(range);
        } else if (edr < r2) {
          let range = [{
            row: [r1, edr],
            column: [c1 - clen, c2 - clen]
          }, {
            row: [edr + 1, r2],
            column: [c1, c2]
          }];
          newRange = newRange.concat(range);
        }
      }
    }
  } else if (type == "moveUp") {
    if (stc > c2 || edc < c1 || str > r2) {
      newRange.push({
        row: [r1, r2],
        column: [c1, c2]
      });
    } else if (edr < r1) {
      if (stc <= c1 && edc >= c2) {
        newRange.push({
          row: [r1 - rlen, r2 - rlen],
          column: [c1, c2]
        });
      } else if (stc > c1 && edc < c2) {
        let range = [{
          row: [r1, r2],
          column: [c1, stc - 1]
        }, {
          row: [r1, r2],
          column: [edc + 1, c2]
        }, {
          row: [r1 - rlen, r2 - rlen],
          column: [stc, edc]
        }];
        newRange = newRange.concat(range);
      } else if (stc > c1) {
        let range = [{
          row: [r1, r2],
          column: [c1, stc - 1]
        }, {
          row: [r1 - rlen, r2 - rlen],
          column: [stc, c2]
        }];
        newRange = newRange.concat(range);
      } else if (edc < c2) {
        let range = [{
          row: [r1 - rlen, r2 - rlen],
          column: [c1, edc]
        }, {
          row: [r1, r2],
          column: [edc + 1, c2]
        }];
        newRange = newRange.concat(range);
      }
    } else if (edr >= r1) {
      if (str <= r1 && edr >= r2) {
        if (stc > c1 && edc < c2) {
          let range = [{
            row: [r1, r2],
            column: [c1, stc - 1]
          }, {
            row: [r1, r2],
            column: [edc + 1, c2]
          }];
          newRange = newRange.concat(range);
        } else if (stc > c1) {
          let range = [{
            row: [r1, r2],
            column: [c1, stc - 1]
          }];
          newRange = newRange.concat(range);
        } else if (edc < c2) {
          let range = [{
            row: [r1, r2],
            column: [edc + 1, c2]
          }];
          newRange = newRange.concat(range);
        }
      } else if (str > r1 && edr < r2) {
        if (stc <= c1 && edc >= c2) {
          newRange.push({
            row: [r1, r2 - rlen],
            column: [c1, c2]
          });
        } else if (stc > c1 && edc < c2) {
          let range = [{
            row: [r1, r2],
            column: [c1, stc - 1]
          }, {
            row: [r1, r2],
            column: [edc + 1, c2]
          }, {
            row: [r1, r2 - rlen],
            column: [stc, edc]
          }];
          newRange = newRange.concat(range);
        } else if (stc > c1) {
          let range = [{
            row: [r1, r2],
            column: [c1, stc - 1]
          }, {
            row: [r1, r2 - rlen],
            column: [stc, c2]
          }];
          newRange = newRange.concat(range);
        } else if (edc < c2) {
          let range = [{
            row: [r1, r2 - rlen],
            column: [c1, edc]
          }, {
            row: [r1, r2],
            column: [edc + 1, c2]
          }];
          newRange = newRange.concat(range);
        }
      } else if (str > r1) {
        if (stc <= c1 && edc >= c2) {
          newRange.push({
            row: [r1, str - 1],
            column: [c1, c2]
          });
        } else if (stc > c1 && edc < c2) {
          let range = [{
            row: [r1, r2],
            column: [c1, stc - 1]
          }, {
            row: [r1, r2],
            column: [edc + 1, c2]
          }, {
            row: [r1, str - 1],
            column: [stc, edc]
          }];
          newRange = newRange.concat(range);
        } else if (stc > c1) {
          let range = [{
            row: [r1, r2],
            column: [c1, stc - 1]
          }, {
            row: [r1, str - 1],
            column: [stc, c2]
          }];
          newRange = newRange.concat(range);
        } else if (edc < c2) {
          let range = [{
            row: [r1, str - 1],
            column: [c1, edc]
          }, {
            row: [r1, r2],
            column: [edc + 1, c2]
          }];
          newRange = newRange.concat(range);
        }
      } else if (edr < r2) {
        if (stc <= c1 && edc >= c2) {
          newRange.push({
            row: [r1 - rlen, r2 - rlen],
            column: [c1, c2]
          });
        } else if (stc > c1 && edc < c2) {
          let range = [{
            row: [r1, r2],
            column: [c1, stc - 1]
          }, {
            row: [r1, r2],
            column: [edc + 1, c2]
          }, {
            row: [r1 - rlen, r2 - rlen],
            column: [stc, edc]
          }];
          newRange = newRange.concat(range);
        } else if (stc > c1) {
          let range = [{
            row: [r1, r2],
            column: [c1, stc - 1]
          }, {
            row: [r1 - rlen, r2 - rlen],
            column: [stc, c2]
          }];
          newRange = newRange.concat(range);
        } else if (edc < c2) {
          let range = [{
            row: [r1 - rlen, r2 - rlen],
            column: [c1, edc]
          }, {
            row: [r1, r2],
            column: [edc + 1, c2]
          }];
          newRange = newRange.concat(range);
        }
      }
    }
  }
  return newRange;
}
export { luckysheetDeleteCell, getMoveRange };