import formula from "../formula";
import {  jfrefreshgrid_adRC } from "../refresh";
import {  getcellFormula  } from "../getdata";
import luckysheetFreezen from "../../controllers/freezen";
import { luckysheet_searcharray } from "../../controllers/sheetSearch";
import { getSheetIndex } from "../../methods/get";
import Store from "../../store";

/**
 * 增加行列
 * @param {string} type 行或列 ['row', 'column'] 之一
 * @param {number} index 插入的位置 index
 * @param {number} value 插入 多少 行（列）
 * @param {string} direction 哪个方向插入 ['lefttop','rightbottom'] 之一
 * @param {string | number} sheetIndex 操作的 sheet 的 index 属性
 * @returns
 */

//删除行列
function luckysheetdeletetable(type, st, ed, sheetIndex) {
  sheetIndex = sheetIndex || Store.currentSheetIndex;
  let curOrder = getSheetIndex(sheetIndex);
  let file = Store.luckysheetfile[curOrder];
  let d = structuredClone(file.data);
  if (st < 0) {
    st = 0;
  }
  if (ed < 0) {
    ed = 0;
  }
  if (type == "row") {
    if (st > d.length - 1) {
      st = d.length - 1;
    }
    if (ed > d.length - 1) {
      ed = d.length - 1;
    }
  } else {
    if (st > d[0].length - 1) {
      st = d[0].length - 1;
    }
    if (ed > d[0].length - 1) {
      ed = d[0].length - 1;
    }
  }
  if (st > ed) {
    return;
  }
  let slen = ed - st + 1;
  let cfg = structuredClone(file.config);

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
    if (type == "row") {
      if (r < st) {
        if (r + rs - 1 < st) {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: rs,
            cs: cs
          };
        } else if (r + rs - 1 >= st && r + rs - 1 < ed) {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: st - r,
            cs: cs
          };
        } else if (r + rs - 1 >= ed) {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: rs - slen,
            cs: cs
          };
        }
      } else if (r >= st && r <= ed) {
        if (r + rs - 1 > ed) {
          merge_new[st + "_" + c] = {
            r: st,
            c: c,
            rs: r + rs - 1 - ed,
            cs: cs
          };
        }
      } else if (r > ed) {
        merge_new[r - slen + "_" + c] = {
          r: r - slen,
          c: c,
          rs: rs,
          cs: cs
        };
      }
    } else if (type == "column") {
      if (c < st) {
        if (c + cs - 1 < st) {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: rs,
            cs: cs
          };
        } else if (c + cs - 1 >= st && c + cs - 1 < ed) {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: rs,
            cs: st - c
          };
        } else if (c + cs - 1 >= ed) {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: rs,
            cs: cs - slen
          };
        }
      } else if (c >= st && c <= ed) {
        if (c + cs - 1 > ed) {
          merge_new[r + "_" + st] = {
            r: r,
            c: st,
            rs: rs,
            cs: c + cs - 1 - ed
          };
        }
      } else if (c > ed) {
        merge_new[r + "_" + (c - slen)] = {
          r: r,
          c: c - slen,
          rs: rs,
          cs: cs
        };
      }
    }
  }
  cfg["merge"] = merge_new;

  //公式配置变动
  let calcChain = file.calcChain;
  let newCalcChain = [];
  if (calcChain != null && calcChain.length > 0) {
    for (let i = 0; i < calcChain.length; i++) {
      let calc = structuredClone(calcChain[i]);
      let calc_r = calc.r,
        calc_c = calc.c,
        calc_i = calc.index,
        calc_funcStr = getcellFormula(calc_r, calc_c, calc_i);

      // 添加进公式后，可能又直接覆盖了单元格值
      if (!calc_funcStr) continue;
      if (type == "row") {
        if (calc_r < st || calc_r > ed) {
          let functionStr = "=" + formula.functionStrChange(calc_funcStr, "del", "row", null, st, slen);
          if (d[calc_r][calc_c] && d[calc_r][calc_c].f == calc_funcStr) {
            d[calc_r][calc_c].f = functionStr;
          }
          if (calc_r > ed) {
            calc.r = calc_r - slen;
          }
          newCalcChain.push(calc);
        }
      } else if (type == "column") {
        if (calc_c < st || calc_c > ed) {
          let functionStr = "=" + formula.functionStrChange(calc_funcStr, "del", "col", null, st, slen);
          if (d[calc_r][calc_c] && d[calc_r][calc_c].f == calc_funcStr) {
            d[calc_r][calc_c].f = functionStr;
          }
          if (calc_c > ed) {
            calc.c = calc_c - slen;
          }
          newCalcChain.push(calc);
        }
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
    if (type == "row") {
      if (f_r1 > ed) {
        f_r1 -= slen;
        f_r2 -= slen;
        newFilterObj.filter_select = {
          row: [f_r1, f_r2],
          column: [f_c1, f_c2]
        };
      } else if (f_r1 < st) {
        if (f_r2 < st) {} else if (f_r2 <= ed) {
          f_r2 = st - 1;
        } else {
          f_r2 -= slen;
        }
        newFilterObj.filter_select = {
          row: [f_r1, f_r2],
          column: [f_c1, f_c2]
        };
      }
      if (newFilterObj.filter_select != null && filter != null) {
        for (let k in filter) {
          let f_rowhidden = filter[k].rowhidden;
          let f_rowhidden_new = {};
          for (let n in f_rowhidden) {
            if (n < st) {
              f_rowhidden_new[n] = 0;
            } else if (n > ed) {
              f_rowhidden_new[n - slen] = 0;
            }
          }
          if (JSON.stringify(f_rowhidden_new) != "{}") {
            if (newFilterObj.filter == null) {
              newFilterObj.filter = {};
            }
            newFilterObj.filter[k] = structuredClone(filter[k]);
            newFilterObj.filter[k].rowhidden = f_rowhidden_new;
            newFilterObj.filter[k].str = f_r1;
            newFilterObj.filter[k].edr = f_r2;
          }
        }
      }
    } else if (type == "column") {
      if (f_c1 > ed) {
        f_c1 -= slen;
        f_c2 -= slen;
        newFilterObj.filter_select = {
          row: [f_r1, f_r2],
          column: [f_c1, f_c2]
        };
      } else if (f_c1 < st) {
        if (f_c2 < st) {} else if (f_c2 <= ed) {
          f_c2 = st - 1;
        } else {
          f_c2 -= slen;
        }
        newFilterObj.filter_select = {
          row: [f_r1, f_r2],
          column: [f_c1, f_c2]
        };
      } else {
        if (f_c2 > ed) {
          f_c1 = st;
          f_c2 -= slen;
          newFilterObj.filter_select = {
            row: [f_r1, f_r2],
            column: [f_c1, f_c2]
          };
        }
      }
      if (newFilterObj.filter_select != null && filter != null) {
        for (let k in filter) {
          let f_cindex = filter[k].cindex;
          if (f_cindex < st) {
            if (newFilterObj.filter == null) {
              newFilterObj.filter = {};
            }
            newFilterObj.filter[f_cindex - f_c1] = structuredClone(filter[k]);
            newFilterObj.filter[f_cindex - f_c1].edc = f_c2;
          } else if (f_cindex > ed) {
            f_cindex -= slen;
            if (newFilterObj.filter == null) {
              newFilterObj.filter = {};
            }
            newFilterObj.filter[f_cindex - f_c1] = structuredClone(filter[k]);
            newFilterObj.filter[f_cindex - f_c1].cindex = f_cindex;
            newFilterObj.filter[f_cindex - f_c1].stc = f_c1;
            newFilterObj.filter[f_cindex - f_c1].edc = f_c2;
          }
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
        if (type == "row") {
          if (!(CFr1 >= st && CFr2 <= ed)) {
            if (CFr1 > ed) {
              CFr1 -= slen;
              CFr2 -= slen;
            } else if (CFr1 < st) {
              if (CFr2 < st) {} else if (CFr2 <= ed) {
                CFr2 = st - 1;
              } else {
                CFr2 -= slen;
              }
            } else {
              if (CFr2 > ed) {
                CFr1 = st;
                CFr2 -= slen;
              }
            }
            cf_new_range.push({
              row: [CFr1, CFr2],
              column: [CFc1, CFc2]
            });
          }
        } else if (type == "column") {
          if (!(CFc1 >= st && CFc2 <= ed)) {
            if (CFc1 > ed) {
              CFc1 -= slen;
              CFc2 -= slen;
            } else if (CFc1 < st) {
              if (CFc2 < st) {} else if (CFc2 <= ed) {
                CFc2 = st - 1;
              } else {
                CFc2 -= slen;
              }
            } else {
              if (CFc2 > ed) {
                CFc1 = st;
                CFc2 -= slen;
              }
            }
            cf_new_range.push({
              row: [CFr1, CFr2],
              column: [CFc1, CFc2]
            });
          }
        }
      }
      if (cf_new_range.length > 0) {
        let cf = structuredClone(CFarr[i]);
        cf.cellrange = cf_new_range;
        newCFarr.push(cf);
      }
    }
  }

  //交替颜色配置变动
  let AFarr = file.luckysheet_alternateformat_save;
  let newAFarr = [];
  if (AFarr != null && AFarr.length > 0) {
    for (let i = 0; i < AFarr.length; i++) {
      let AFr1 = AFarr[i].cellrange.row[0],
        AFr2 = AFarr[i].cellrange.row[1],
        AFc1 = AFarr[i].cellrange.column[0],
        AFc2 = AFarr[i].cellrange.column[1];
      if (type == "row") {
        if (!(AFr1 >= st && AFr2 <= ed)) {
          let af = structuredClone(AFarr[i]);
          if (AFr1 > ed) {
            AFr1 -= slen;
            AFr2 -= slen;
          } else if (AFr1 < st) {
            if (AFr2 < st) {} else if (AFr2 <= ed) {
              AFr2 = st - 1;
            } else {
              AFr2 -= slen;
            }
          } else {
            if (AFr2 > ed) {
              AFr1 = st;
              AFr2 -= slen;
            }
          }
          af.cellrange = {
            row: [AFr1, AFr2],
            column: [AFc1, AFc2]
          };
          newAFarr.push(af);
        }
      } else if (type == "column") {
        if (!(AFc1 >= st && AFc2 <= ed)) {
          let af = structuredClone(AFarr[i]);
          if (AFc1 > ed) {
            AFc1 -= slen;
            AFc2 -= slen;
          } else if (AFc1 < st) {
            if (AFc2 < st) {} else if (AFc2 <= ed) {
              AFc2 = st - 1;
            } else {
              AFc2 -= slen;
            }
          } else {
            if (AFc2 > ed) {
              AFc1 = st;
              AFc2 -= slen;
            }
          }
          af.cellrange = {
            row: [AFr1, AFr2],
            column: [AFc1, AFc2]
          };
          newAFarr.push(af);
        }
      }
    }
  }

  //冻结配置变动
  let newFreezen = {
    freezenhorizontaldata: null,
    freezenverticaldata: null
  };
  if (luckysheetFreezen.freezenhorizontaldata != null && type == "row") {
    let freezen_scrollTop = luckysheetFreezen.freezenhorizontaldata[2];
    let freezen_st = luckysheet_searcharray(Store.visibledatarow, freezen_scrollTop);
    if (freezen_st == -1) {
      freezen_st = 0;
    }
    let freezen_row_st = luckysheetFreezen.freezenhorizontaldata[1] - 1;
    if (freezen_row_st >= st) {
      if (freezen_row_st < ed) {
        freezen_row_st = st - 1;
      } else {
        freezen_row_st -= slen;
      }
    }
    if (freezen_row_st < freezen_st) {
      freezen_row_st = freezen_st;
    }
    let freezen_top = Store.visibledatarow[freezen_row_st] - 2 - freezen_scrollTop + Store.columnHeaderHeight;
    newFreezen.freezenhorizontaldata = [Store.visibledatarow[freezen_row_st], freezen_row_st + 1, freezen_scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, freezen_row_st + 1), freezen_top];
  } else {
    newFreezen.freezenhorizontaldata = luckysheetFreezen.freezenhorizontaldata;
  }
  if (luckysheetFreezen.freezenverticaldata != null && type == "column") {
    let freezen_scrollLeft = luckysheetFreezen.freezenverticaldata[2];
    let freezen_st2 = luckysheet_searcharray(Store.visibledatacolumn, freezen_scrollLeft);
    if (freezen_st2 == -1) {
      freezen_st2 = 0;
    }
    let freezen_col_st = luckysheetFreezen.freezenverticaldata[1] - 1;
    if (freezen_col_st >= st) {
      if (freezen_col_st < ed) {
        freezen_col_st = st - 1;
      } else {
        freezen_col_st -= slen;
      }
    }
    if (freezen_col_st < freezen_st2) {
      freezen_col_st = freezen_st2;
    }
    let freezen_left = Store.visibledatacolumn[freezen_col_st] - 2 - freezen_scrollLeft + Store.rowHeaderWidth;
    newFreezen.freezenverticaldata = [Store.visibledatacolumn[freezen_col_st], freezen_col_st + 1, freezen_scrollLeft, luckysheetFreezen.cutVolumn(Store.visibledatacolumn, freezen_col_st + 1), freezen_left];
  } else {
    newFreezen.freezenverticaldata = luckysheetFreezen.freezenverticaldata;
  }

  //超链接配置变动
  let hyperlink = file.hyperlink;
  let newHyperlink = {};
  if (hyperlink != null) {
    for (let key in hyperlink) {
      let r = Number(key.split("_")[0]),
        c = Number(key.split("_")[1]);
      let item = hyperlink[key];
      if (type == "row") {
        if (r < st) {
          newHyperlink[r + "_" + c] = item;
        } else if (r > ed) {
          newHyperlink[r - slen + "_" + c] = item;
        }
      } else if (type == "column") {
        if (c < st) {
          newHyperlink[r + "_" + c] = item;
        } else if (c > ed) {
          newHyperlink[r + "_" + (c - slen)] = item;
        }
      }
    }
  }

  //主逻辑
  let type1;
  if (type == "row") {
    type1 = "r";

    //行高配置变动
    if (cfg["rowlen"] == null) {
      cfg["rowlen"] = {};
    }
    let rowlen_new = {};
    for (let r in cfg["rowlen"]) {
      if (r < st) {
        rowlen_new[r] = cfg["rowlen"][r];
      } else if (r > ed) {
        rowlen_new[r - slen] = cfg["rowlen"][r];
      }
    }
    cfg["rowlen"] = rowlen_new;

    //隐藏行配置变动
    if (cfg["rowhidden"] == null) {
      cfg["rowhidden"] = {};
    }
    let rowhidden_new = {};
    for (let r in cfg["rowhidden"]) {
      if (r < st) {
        rowhidden_new[r] = cfg["rowhidden"][r];
      } else if (r > ed) {
        rowhidden_new[r - slen] = cfg["rowhidden"][r];
      }
    }
    cfg["rowhidden"] = rowhidden_new;

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
              bd_r2 = borderRange[j].row[1];
            for (let r = st; r <= ed; r++) {
              if (r < borderRange[j].row[0]) {
                bd_r1 -= 1;
                bd_r2 -= 1;
              } else if (r <= borderRange[j].row[1]) {
                bd_r2 -= 1;
              }
            }
            if (bd_r2 >= bd_r1) {
              emptyRange.push({
                row: [bd_r1, bd_r2],
                column: borderRange[j].column
              });
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
          if (row_index < st) {
            borderInfo.push(cfg["borderInfo"][i]);
          } else if (row_index > ed) {
            cfg["borderInfo"][i].value.row_index = row_index - (ed - st + 1);
            borderInfo.push(cfg["borderInfo"][i]);
          }
        }
      }
      cfg["borderInfo"] = borderInfo;
    }

    // 备注：该处理方式会在删除多行的时候会存在bug
    // 说明：删除多行后，会把同一个row空数组(引用类型)添加成为data多行的数据源，导致设置这些行数据时产生错误。
    //空白行模板
    // let row = [];
    // for (let c = 0; c < d[0].length; c++) {
    //     row.push(null);
    // }

    // //删除选中行
    // d.splice(st, slen);

    // //删除多少行，增加多少行空白行
    // for (let r = 0; r < slen; r++) {
    //     d.push(row);
    // }

    //删除选中行
    d.splice(st, slen);

    //删除多少行，增加多少行空白行
    // for (let r = 0; r < slen; r++) {
    //     let row = [];
    //     for (let c = 0; c < d[0].length; c++) {
    //         row.push(null);
    //     }
    //     d.push(row);
    // }
  } else {
    type1 = "c";

    //列宽配置变动
    if (cfg["columnlen"] == null) {
      cfg["columnlen"] = {};
    }
    let columnlen_new = {};
    for (let c in cfg["columnlen"]) {
      if (c < st) {
        columnlen_new[c] = cfg["columnlen"][c];
      } else if (c > ed) {
        columnlen_new[c - slen] = cfg["columnlen"][c];
      }
    }
    cfg["columnlen"] = columnlen_new;

    //隐藏列配置变动
    if (cfg["colhidden"] == null) {
      cfg["colhidden"] = {};
    }
    let colhidden_new = {};
    for (let c in cfg["colhidden"]) {
      if (c < st) {
        colhidden_new[c] = cfg["colhidden"][c];
      } else if (c > ed) {
        colhidden_new[c - slen] = cfg["colhidden"][c];
      }
    }
    cfg["colhidden"] = colhidden_new;

    //边框配置变动
    if (cfg["borderInfo"] && cfg["borderInfo"].length > 0) {
      let borderInfo = [];
      for (let i = 0; i < cfg["borderInfo"].length; i++) {
        let rangeType = cfg["borderInfo"][i].rangeType;
        if (rangeType == "range") {
          let borderRange = cfg["borderInfo"][i].range;
          let emptyRange = [];
          for (let j = 0; j < borderRange.length; j++) {
            let bd_c1 = borderRange[j].column[0],
              bd_c2 = borderRange[j].column[1];
            for (let c = st; c <= ed; c++) {
              if (c < borderRange[j].column[0]) {
                bd_c1 -= 1;
                bd_c2 -= 1;
              } else if (c <= borderRange[j].column[1]) {
                bd_c2 -= 1;
              }
            }
            if (bd_c2 >= bd_c1) {
              emptyRange.push({
                row: borderRange[j].row,
                column: [bd_c1, bd_c2]
              });
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
          let col_index = cfg["borderInfo"][i].value.col_index;
          if (col_index < st) {
            borderInfo.push(cfg["borderInfo"][i]);
          } else if (col_index > ed) {
            cfg["borderInfo"][i].value.col_index = col_index - (ed - st + 1);
            borderInfo.push(cfg["borderInfo"][i]);
          }
        }
      }
      cfg["borderInfo"] = borderInfo;
    }

    // //空白列模板
    // let addcol = [];
    // for (let r = 0; r < slen; r++) {
    //     addcol.push(null);
    // }

    for (let r = 0; r < d.length; r++) {
      let row = [].concat(JSON.parse(JSON.stringify(d[r])));
      //删除该行选中列
      row.splice(st, slen);
      d[r] = row; //将删除列的行数据        赋值给sheet的对应行
    }
  }

  // 修改当前sheet页时刷新
  if (file.index == Store.currentSheetIndex) {
    jfrefreshgrid_adRC(d, cfg, "delRC", {
      index: st,
      len: ed - st + 1,
      rc: type1
    }, newCalcChain, newFilterObj, newCFarr, newAFarr, newFreezen, newHyperlink);
  } else {
    file.data = d;
    file.config = cfg;
    file.calcChain = newCalcChain;
    file.filter = newFilterObj.filter;
    file.filter_select = newFilterObj.filter_select;
    file.luckysheet_conditionformat_save = newCFarr;
    file.luckysheet_alternateformat_save = newAFarr;
    file.hyperlink = newHyperlink;
  }
}

//删除单元格
export { luckysheetdeletetable };