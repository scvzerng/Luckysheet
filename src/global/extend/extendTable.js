import formula from "../formula";
import {  jfrefreshgrid_adRC } from "../refresh";
import {  getcellFormula  } from "../getdata";
import luckysheetFreezen from "../../controllers/freezen";
import { selectHightlightShow } from "../../controllers/select";
import { getSheetIndex } from "../../methods/get";
import Store from "../../store";
import { getScrollPosition } from "../../utils/domUtils.js";
import scrollBarY from '../../ui/scrollBarY.js';
import countShow from '../../ui/countShow.js';
import cellMain from '../../ui/cellMain.js';

/**
 * 增加行列
 * @param {string} type 行或列 ['row', 'column'] 之一
 * @param {number} index 插入的位置 index
 * @param {number} value 插入 多少 行（列）
 * @param {string} direction 哪个方向插入 ['lefttop','rightbottom'] 之一
 * @param {string | number} sheetIndex 操作的 sheet 的 index 属性
 * @returns
 */
/**
 * 增加行列
 * @param {string} type 行或列 ['row', 'column'] 之一
 * @param {number} index 插入的位置 index
 * @param {number} value 插入 多少 行（列）
 * @param {string} direction 哪个方向插入 ['lefttop','rightbottom'] 之一
 * @param {string | number} sheetIndex 操作的 sheet 的 index 属性
 * @returns
 */
function luckysheetextendtable(type, index, value, direction, sheetIndex) {
  sheetIndex = sheetIndex ?? Store.currentSheetIndex;
  let curOrder = getSheetIndex(sheetIndex);
  let file = Store.luckysheetfile[curOrder];
  let d = structuredClone(file.data);
  value = Math.floor(value);
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
      if (index < r) {
        merge_new[r + value + "_" + c] = {
          r: r + value,
          c: c,
          rs: rs,
          cs: cs
        };
      }
      // *这里要判断一下rs是否等于1,因为如果这个合并单元格的行数只有一行时r = r+ rs-1,这种情况不应该进行单元格的加高
      else if (index == r && rs != 1) {
        if (direction == "lefttop") {
          merge_new[r + value + "_" + c] = {
            r: r + value,
            c: c,
            rs: rs,
            cs: cs
          };
        } else {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: rs + value,
            cs: cs
          };
        }
      } else if (index < r + rs - 1) {
        merge_new[r + "_" + c] = {
          r: r,
          c: c,
          rs: rs + value,
          cs: cs
        };
      } else if (index == r + rs - 1) {
        if (direction == "lefttop") {
          if (rs == 1) {
            merge_new[r + value + "_" + c] = {
              r: r + value,
              c: c,
              rs: rs,
              cs: cs
            };
          } else {
            merge_new[r + "_" + c] = {
              r: r,
              c: c,
              rs: rs + value,
              cs: cs
            };
          }
        } else {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: rs,
            cs: cs
          };
        }
      } else {
        merge_new[r + "_" + c] = {
          r: r,
          c: c,
          rs: rs,
          cs: cs
        };
      }
    } else if (type == "column") {
      if (index < c) {
        merge_new[r + "_" + (c + value)] = {
          r: r,
          c: c + value,
          rs: rs,
          cs: cs
        };
      } else if (index == c && cs != 1) {
        if (direction == "lefttop") {
          merge_new[r + "_" + (c + value)] = {
            r: r,
            c: c + value,
            rs: rs,
            cs: cs
          };
        } else {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: rs,
            cs: cs + value
          };
        }
      } else if (index < c + cs - 1) {
        merge_new[r + "_" + c] = {
          r: r,
          c: c,
          rs: rs,
          cs: cs + value
        };
      } else if (index == c + cs - 1) {
        if (direction == "lefttop") {
          // *这是要判断一下这个合并单元格的列宽是否=1,如果cs等于1的情况下,向左插入列，这个合并单元格会右移
          if (cs == 1) {
            merge_new[r + "_" + (c + value)] = {
              r: r,
              c: c + value,
              rs: rs,
              cs: cs
            };
          } else {
            merge_new[r + "_" + c] = {
              r: r,
              c: c,
              rs: rs,
              cs: cs + value
            };
          }
        } else {
          merge_new[r + "_" + c] = {
            r: r,
            c: c,
            rs: rs,
            cs: cs
          };
        }
      } else {
        merge_new[r + "_" + c] = {
          r: r,
          c: c,
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
        let functionStr = "=" + formula.functionStrChange(calc_funcStr, "add", "row", direction, index, value);
        if (d[calc_r][calc_c] && d[calc_r][calc_c].f == calc_funcStr) {
          d[calc_r][calc_c].f = functionStr;
        }
        if (direction == "lefttop") {
          if (calc_r >= index) {
            calc.r += value;
          }
        } else if (direction == "rightbottom") {
          if (calc_r > index) {
            calc.r += value;
          }
        }
        newCalcChain.push(calc);
      } else if (type == "column") {
        let functionStr = "=" + formula.functionStrChange(calc_funcStr, "add", "col", direction, index, value);
        if (d[calc_r][calc_c] && d[calc_r][calc_c].f == calc_funcStr) {
          d[calc_r][calc_c].f = functionStr;
        }
        if (direction == "lefttop") {
          if (calc_c >= index) {
            calc.c += value;
          }
        } else if (direction == "rightbottom") {
          if (calc_c > index) {
            calc.c += value;
          }
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
    if (type == "row") {
      if (f_r1 < index) {
        if (f_r2 == index && direction == "lefttop") {
          f_r2 += value;
        } else if (f_r2 > index) {
          f_r2 += value;
        }
      } else if (f_r1 == index) {
        if (direction == "lefttop") {
          f_r1 += value;
          f_r2 += value;
        } else if (direction == "rightbottom" && f_r2 > index) {
          f_r2 += value;
        }
      } else {
        f_r1 += value;
        f_r2 += value;
      }
      if (filter != null) {
        newFilterObj.filter = {};
        for (let k in filter) {
          let f_rowhidden = filter[k].rowhidden;
          let f_rowhidden_new = {};
          for (let n in f_rowhidden) {
            n = parseFloat(n);
            if (n < index) {
              f_rowhidden_new[n] = 0;
            } else if (n == index) {
              if (direction == "lefttop") {
                f_rowhidden_new[n + value] = 0;
              } else if (direction == "rightbottom") {
                f_rowhidden_new[n] = 0;
              }
            } else {
              f_rowhidden_new[n + value] = 0;
            }
          }
          newFilterObj.filter[k] = structuredClone(filter[k]);
          newFilterObj.filter[k].rowhidden = f_rowhidden_new;
          newFilterObj.filter[k].str = f_r1;
          newFilterObj.filter[k].edr = f_r2;
        }
      }
    } else if (type == "column") {
      if (f_c1 < index) {
        if (f_c2 == index && direction == "lefttop") {
          f_c2 += value;
        } else if (f_c2 > index) {
          f_c2 += value;
        }
      } else if (f_c1 == index) {
        if (direction == "lefttop") {
          f_c1 += value;
          f_c2 += value;
        } else if (direction == "rightbottom" && f_c2 > index) {
          f_c2 += value;
        }
      } else {
        f_c1 += value;
        f_c2 += value;
      }
      if (filter != null) {
        newFilterObj.filter = {};
        for (let k in filter) {
          let f_cindex = filter[k].cindex;
          if (f_cindex == index && direction == "lefttop") {
            f_cindex += value;
          } else if (f_cindex > index) {
            f_cindex += value;
          }
          newFilterObj.filter[f_cindex - f_c1] = structuredClone(filter[k]);
          newFilterObj.filter[f_cindex - f_c1].cindex = f_cindex;
          newFilterObj.filter[f_cindex - f_c1].stc = f_c1;
          newFilterObj.filter[f_cindex - f_c1].edc = f_c2;
        }
      }
    }
    newFilterObj.filter_select = {
      row: [f_r1, f_r2],
      column: [f_c1, f_c2]
    };
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
          if (CFr1 < index) {
            if (CFr2 == index && direction == "lefttop") {
              CFr2 += value;
            } else if (CFr2 > index) {
              CFr2 += value;
            }
          } else if (CFr1 == index) {
            if (direction == "lefttop") {
              CFr1 += value;
              CFr2 += value;
            } else if (direction == "rightbottom" && CFr2 > index) {
              CFr2 += value;
            }
          } else {
            CFr1 += value;
            CFr2 += value;
          }
        } else if (type == "column") {
          if (CFc1 < index) {
            if (CFc2 == index && direction == "lefttop") {
              CFc2 += value;
            } else if (CFc2 > index) {
              CFc2 += value;
            }
          } else if (CFc1 == index) {
            if (direction == "lefttop") {
              CFc1 += value;
              CFc2 += value;
            } else if (direction == "rightbottom" && CFc2 > index) {
              CFc2 += value;
            }
          } else {
            CFc1 += value;
            CFc2 += value;
          }
        }
        cf_new_range.push({
          row: [CFr1, CFr2],
          column: [CFc1, CFc2]
        });
      }
      let cf = structuredClone(CFarr[i]);
      cf.cellrange = cf_new_range;
      newCFarr.push(cf);
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
      let af = structuredClone(AFarr[i]);
      if (type == "row") {
        if (AFr1 < index) {
          if (AFr2 == index && direction == "lefttop") {
            AFr2 += value;
          } else if (AFr2 > index) {
            AFr2 += value;
          }
        } else if (AFr1 == index) {
          if (direction == "lefttop") {
            AFr1 += value;
            AFr2 += value;
          } else if (direction == "rightbottom" && AFr2 > index) {
            AFr2 += value;
          }
        } else {
          AFr1 += value;
          AFr2 += value;
        }
      } else if (type == "column") {
        if (AFc1 < index) {
          if (AFc2 == index && direction == "lefttop") {
            AFc2 += value;
          } else if (AFc2 > index) {
            AFc2 += value;
          }
        } else if (AFc1 == index) {
          if (direction == "lefttop") {
            AFc1 += value;
            AFc2 += value;
          } else if (direction == "rightbottom" && AFc2 > index) {
            AFc2 += value;
          }
        } else {
          AFc1 += value;
          AFc2 += value;
        }
      }
      af.cellrange = {
        row: [AFr1, AFr2],
        column: [AFc1, AFc2]
      };
      newAFarr.push(af);
    }
  }

  //冻结配置变动
  let newFreezen = {
    freezenhorizontaldata: null,
    freezenverticaldata: null
  };
  if (luckysheetFreezen.freezenhorizontaldata != null && type == "row") {
    let freezen_scrollTop = luckysheetFreezen.freezenhorizontaldata[2];
    let freezen_row_st = luckysheetFreezen.freezenhorizontaldata[1] - 1;
    if (freezen_row_st == index && direction == "lefttop") {
      freezen_row_st += value;
    } else if (freezen_row_st > index) {
      freezen_row_st += value;
    }
    let freezen_top = Store.visibledatarow[freezen_row_st] - 2 - freezen_scrollTop + Store.columnHeaderHeight;
    newFreezen.freezenhorizontaldata = [Store.visibledatarow[freezen_row_st], freezen_row_st + 1, freezen_scrollTop, luckysheetFreezen.cutVolumn(Store.visibledatarow, freezen_row_st + 1), freezen_top];
  } else {
    newFreezen.freezenhorizontaldata = luckysheetFreezen.freezenhorizontaldata;
  }
  if (luckysheetFreezen.freezenverticaldata != null && type == "column") {
    let freezen_scrollLeft = luckysheetFreezen.freezenverticaldata[2];
    let freezen_col_st = luckysheetFreezen.freezenverticaldata[1] - 1;
    if (freezen_col_st == index && direction == "lefttop") {
      freezen_col_st += value;
    } else if (freezen_col_st > index) {
      freezen_col_st += value;
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
        if (index < r) {
          newHyperlink[r + value + "_" + c] = item;
        } else if (index == r) {
          if (direction == "lefttop") {
            newHyperlink[r + value + "_" + c] = item;
          } else {
            newHyperlink[r + "_" + c] = item;
          }
        } else {
          newHyperlink[r + "_" + c] = item;
        }
      } else if (type == "column") {
        if (index < c) {
          newHyperlink[r + "_" + (c + value)] = item;
        } else if (index == c) {
          if (direction == "lefttop") {
            newHyperlink[r + "_" + (c + value)] = item;
          } else {
            newHyperlink[r + "_" + c] = item;
          }
        } else {
          newHyperlink[r + "_" + c] = item;
        }
      }
    }
  }
  let type1;
  if (type == "row") {
    type1 = "r";

    //行高配置变动
    if (cfg["rowlen"] != null) {
      let rowlen_new = {};
      for (let r in cfg["rowlen"]) {
        r = parseFloat(r);
        if (r < index) {
          rowlen_new[r] = cfg["rowlen"][r];
        } else if (r == index) {
          if (direction == "lefttop") {
            rowlen_new[r + value] = cfg["rowlen"][r];
          } else if (direction == "rightbottom") {
            rowlen_new[r] = cfg["rowlen"][r];
          }
        } else {
          rowlen_new[r + value] = cfg["rowlen"][r];
        }
      }
      cfg["rowlen"] = rowlen_new;
    }

    //隐藏行配置变动
    if (cfg["rowhidden"] != null) {
      let rowhidden_new = {};
      for (let r in cfg["rowhidden"]) {
        r = parseFloat(r);
        if (r < index) {
          rowhidden_new[r] = cfg["rowhidden"][r];
        } else if (r == index) {
          if (direction == "lefttop") {
            rowhidden_new[r + value] = cfg["rowhidden"][r];
          } else if (direction == "rightbottom") {
            rowhidden_new[r] = cfg["rowhidden"][r];
          }
        } else {
          rowhidden_new[r + value] = cfg["rowhidden"][r];
        }
      }
      cfg["rowhidden"] = rowhidden_new;
    }

    // *添加空行模板这里请保持为push null;
    let row = [];
    for (let c = 0; c < d[0].length; c++) {
      row.push(null);
    }
    var cellBorderConfig = [];
    //边框
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
            if (direction == "lefttop") {
              if (index <= bd_r1) {
                bd_r1 += value;
                bd_r2 += value;
              } else if (index <= bd_r2) {
                bd_r2 += value;
              }
            } else {
              if (index < bd_r1) {
                bd_r1 += value;
                bd_r2 += value;
              } else if (index < bd_r2) {
                bd_r2 += value;
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
          // 位置相同标识边框相关 先缓存
          if (row_index === index) {
            cellBorderConfig.push(JSON.parse(JSON.stringify(cfg["borderInfo"][i])));
          }
          if (direction == "lefttop") {
            if (index <= row_index) {
              row_index += value;
            }
          } else {
            if (index < row_index) {
              row_index += value;
            }
          }
          cfg["borderInfo"][i].value.row_index = row_index;
          borderInfo.push(cfg["borderInfo"][i]);
        }
      }
      cfg["borderInfo"] = borderInfo;
    }
    let arr = [];
    for (let r = 0; r < value; r++) {
      arr.push(JSON.stringify(row));
      // 同步拷贝 type 为 cell 类型的边框
      if (cellBorderConfig.length) {
        var cellBorderConfigCopy = JSON.parse(JSON.stringify(cellBorderConfig));
        cellBorderConfigCopy.forEach(item => {
          if (direction === "rightbottom") {
            // 向下插入时 基于模板行位置直接递增即可
            item.value.row_index += r + 1;
          } else if (direction === "lefttop") {
            // 向上插入时 目标行移动到后面 新增n行到前面 对于新增的行来说 也是递增，不过是从0开始
            item.value.row_index += r;
          }
        });
        cfg["borderInfo"].push(...cellBorderConfigCopy);
      }
    }
    if (direction == "lefttop") {
      if (index == 0) {
        new Function("d", "return " + "d.unshift(" + arr.join(",") + ")")(d);
      } else {
        new Function("d", "return " + "d.splice(" + index + ", 0, " + arr.join(",") + ")")(d);
      }
    } else {
      new Function("d", "return " + "d.splice(" + (index + 1) + ", 0, " + arr.join(",") + ")")(d);
    }
  } else {
    type1 = "c";

    //行高配置变动
    if (cfg["columnlen"] != null) {
      let columnlen_new = {};
      for (let c in cfg["columnlen"]) {
        c = parseFloat(c);
        if (c < index) {
          columnlen_new[c] = cfg["columnlen"][c];
        } else if (c == index) {
          if (direction == "lefttop") {
            columnlen_new[c + value] = cfg["columnlen"][c];
          } else if (direction == "rightbottom") {
            columnlen_new[c] = cfg["columnlen"][c];
          }
        } else {
          columnlen_new[c + value] = cfg["columnlen"][c];
        }
      }
      cfg["columnlen"] = columnlen_new;
    }

    //隐藏列配置变动
    if (cfg["colhidden"] != null) {
      let colhidden_new = {};
      for (let c in cfg["colhidden"]) {
        c = parseFloat(c);
        if (c < index) {
          colhidden_new[c] = cfg["colhidden"][c];
        } else if (c == index) {
          if (direction == "lefttop") {
            colhidden_new[c + value] = cfg["colhidden"][c];
          } else if (direction == "rightbottom") {
            colhidden_new[c] = cfg["colhidden"][c];
          }
        } else {
          colhidden_new[c + value] = cfg["colhidden"][c];
        }
      }
      cfg["colhidden"] = colhidden_new;
    }

    // *添加空列模板这里请保持为push null;
    let col = [];
    for (let r = 0; r < d.length; r++) {
      col.push(null);
    }
    var cellBorderConfig = [];
    //边框
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
            if (direction == "lefttop") {
              if (index <= bd_c1) {
                bd_c1 += value;
                bd_c2 += value;
              } else if (index <= bd_c2) {
                bd_c2 += value;
              }
            } else {
              if (index < bd_c1) {
                bd_c1 += value;
                bd_c2 += value;
              } else if (index < bd_c2) {
                bd_c2 += value;
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
          // 位置相同标识边框相关 先缓存
          if (col_index === index) {
            cellBorderConfig.push(JSON.parse(JSON.stringify(cfg["borderInfo"][i])));
          }
          if (direction == "lefttop") {
            if (index <= col_index) {
              col_index += value;
            }
          } else {
            if (index < col_index) {
              col_index += value;
            }
          }
          cfg["borderInfo"][i].value.col_index = col_index;
          borderInfo.push(cfg["borderInfo"][i]);
        }
      }
      cfg["borderInfo"] = borderInfo;
    }

    // 处理相关的 type 为 cell 类型的边框
    if (cellBorderConfig.length) {
      for (let i = 0; i < value; i++) {
        var cellBorderConfigCopy = JSON.parse(JSON.stringify(cellBorderConfig));
        cellBorderConfigCopy.forEach(item => {
          if (direction === "rightbottom") {
            // 向右插入时 基于模板列位置直接递增即可
            item.value.col_index += i + 1;
          } else if (direction === "lefttop") {
            // 向左插入时 目标列移动到后面 新增n列到前面 对于新增的列来说 也是递增，不过是从0开始
            item.value.col_index += i;
          }
        });
        cfg["borderInfo"].push(...cellBorderConfigCopy);
      }
    }
    for (let r = 0; r < d.length; r++) {
      let row = d[r];
      for (let i = 0; i < value; i++) {
        // *这里不能是引用,不然添加多列时添加的都是同一个引用,修改一个cell会同步到多个
        const COLR = JSON.parse(JSON.stringify(col[r]));
        if (direction == "lefttop") {
          if (index == 0) {
            row.unshift(COLR);
          } else {
            row.splice(index, 0, COLR);
          }
        } else {
          row.splice(index + 1, 0, COLR);
        }
      }
    }
  }

  // 修改当前sheet页时刷新
  if (file.index == Store.currentSheetIndex) {
    jfrefreshgrid_adRC(d, cfg, "addRC", {
      index: index,
      len: value,
      direction: direction,
      rc: type1,
      restore: false
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
  let range = null;
  if (type == "row") {
    if (direction == "lefttop") {
      range = [{
        row: [index, index + value - 1],
        column: [0, d[0].length - 1]
      }];
    } else {
      range = [{
        row: [index + 1, index + value],
        column: [0, d[0].length - 1]
      }];
    }
  } else {
    if (direction == "lefttop") {
      range = [{
        row: [0, d.length - 1],
        column: [index, index + value - 1]
      }];
    } else {
      range = [{
        row: [0, d.length - 1],
        column: [index + 1, index + value]
      }];
    }
  }
  file.luckysheet_select_save = range;
  if (file.index == Store.currentSheetIndex) {
    Store.luckysheet_select_save = range;
    selectHightlightShow();
  }
  if (type == "row") {
    let scroll = getScrollPosition();
    let scrollLeft = scroll.scrollLeft,
      scrollTop = scroll.scrollTop;
    let winH = cellMain.getHeight(),
      winW = cellMain.getWidth();
    let row = Store.visibledatarow[range[0].row[1]],
      row_pre = range[0].row[0] - 1 == -1 ? 0 : Store.visibledatarow[range[0].row[0] - 1];
    if (row - scrollTop - winH + 20 > 0) {
      scrollBarY.setScrollTop(row - winH + 20);
    } else if (row_pre - scrollTop - 20 < 0) {
      scrollBarY.setScrollTop(row_pre - 20);
    }
    if (value > 30) {
      countShow.row.hide();
      countShow.column.hide();
    }
  }
}
export { luckysheetextendtable };