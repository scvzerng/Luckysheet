import { genarate } from '../../../global/format';
import formula from '../../../global/formula';
import { getcellvalue } from '../../../global/getdata';
import { isRealNull } from '../../../global/validate';
import { getObjType } from '../../../utils/util';

export function computeDefault(_this, computeMap, type, cellrange, format, ruleArr, i, d) {
  {
            //获取变量值
            let conditionName = ruleArr[i].conditionName,
              //条件名称
              conditionValue0 = ruleArr[i].conditionValue[0],
              //条件值1
              conditionValue1 = ruleArr[i].conditionValue[1],
              //条件值2
              textColor = format.textColor,
              //条件格式文本颜色 fc
              cellColor = format.cellColor; //条件格式单元格颜色 bg
  
            for (let s = 0; s < cellrange.length; s++) {
              //条件类型判断
              if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "equal" || conditionName == "textContains") {
                //循环应用范围计算
                for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                  for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                    if (d[r] == null || d[r][c] == null) {
                      continue;
                    }
  
                    //单元格值
                    let cell = d[r][c];
                    if (getObjType(cell) != "object" || isRealNull(cell.v)) {
                      continue;
                    }
  
                    //符合条件
                    if (conditionName == "greaterThan" && cell.v > conditionValue0) {
                      if (r + "_" + c in computeMap) {
                        computeMap[r + "_" + c]["textColor"] = textColor;
                        computeMap[r + "_" + c]["cellColor"] = cellColor;
                      } else {
                        computeMap[r + "_" + c] = {
                          "textColor": textColor,
                          "cellColor": cellColor
                        };
                      }
                    } else if (conditionName == "lessThan" && cell.v < conditionValue0) {
                      if (r + "_" + c in computeMap) {
                        computeMap[r + "_" + c]["textColor"] = textColor;
                        computeMap[r + "_" + c]["cellColor"] = cellColor;
                      } else {
                        computeMap[r + "_" + c] = {
                          "textColor": textColor,
                          "cellColor": cellColor
                        };
                      }
                    } else if (conditionName == "equal" && cell.v == conditionValue0) {
                      if (r + "_" + c in computeMap) {
                        computeMap[r + "_" + c]["textColor"] = textColor;
                        computeMap[r + "_" + c]["cellColor"] = cellColor;
                      } else {
                        computeMap[r + "_" + c] = {
                          "textColor": textColor,
                          "cellColor": cellColor
                        };
                      }
                    } else if (conditionName == "textContains" && cell.v.toString().indexOf(conditionValue0) != -1) {
                      if (r + "_" + c in computeMap) {
                        computeMap[r + "_" + c]["textColor"] = textColor;
                        computeMap[r + "_" + c]["cellColor"] = cellColor;
                      } else {
                        computeMap[r + "_" + c] = {
                          "textColor": textColor,
                          "cellColor": cellColor
                        };
                      }
                    }
                  }
                }
              } else if (conditionName == "betweenness") {
                //比较条件值1和条件值2的大小
                let vBig, vSmall;
                if (conditionValue0 > conditionValue1) {
                  vBig = conditionValue0;
                  vSmall = conditionValue1;
                } else {
                  vBig = conditionValue1;
                  vSmall = conditionValue0;
                }
                //循环应用范围计算
                for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                  for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                    if (d[r] == null || d[r][c] == null) {
                      continue;
                    }
  
                    //单元格值
                    let cell = d[r][c];
                    if (getObjType(cell) != "object" || isRealNull(cell.v)) {
                      continue;
                    }
  
                    //符合条件
                    if (cell.v >= vSmall && cell.v <= vBig) {
                      if (r + "_" + c in computeMap) {
                        computeMap[r + "_" + c]["textColor"] = textColor;
                        computeMap[r + "_" + c]["cellColor"] = cellColor;
                      } else {
                        computeMap[r + "_" + c] = {
                          "textColor": textColor,
                          "cellColor": cellColor
                        };
                      }
                    }
                  }
                }
              } else if (conditionName == "occurrenceDate") {
                //获取日期所对应的数值
                let dBig, dSmall;
                if (conditionValue0.toString().indexOf("-") == -1) {
                  dBig = genarate(conditionValue0)[2];
                  dSmall = genarate(conditionValue0)[2];
                } else {
                  let str = conditionValue0.toString().split("-");
                  dBig = genarate(str[1].trim())[2];
                  dSmall = genarate(str[0].trim())[2];
                }
                //循环应用范围计算
                for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                  for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                    if (d[r] == null || d[r][c] == null) {
                      continue;
                    }
  
                    //单元格值类型为日期类型
                    if (d[r][c].ct != null && d[r][c].ct.t == "d") {
                      //单元格值
                      let cellVal = getcellvalue(r, c, d);
                      //符合条件
                      if (cellVal >= dSmall && cellVal <= dBig) {
                        if (r + "_" + c in computeMap) {
                          computeMap[r + "_" + c]["textColor"] = textColor;
                          computeMap[r + "_" + c]["cellColor"] = cellColor;
                        } else {
                          computeMap[r + "_" + c] = {
                            "textColor": textColor,
                            "cellColor": cellColor
                          };
                        }
                      }
                    }
                  }
                }
              } else if (conditionName == "duplicateValue") {
                //应用范围单元格值处理
                let dmap = {};
                for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                  for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                    let item = getcellvalue(r, c, d);
                    if (!(item in dmap)) {
                      dmap[item] = [];
                    }
                    dmap[item].push({
                      "r": r,
                      "c": c
                    });
                  }
                }
                //循环应用范围计算
                if (conditionValue0 == "0") {
                  //重复值
                  for (let x in dmap) {
                    if (x != "null" && x != "undefined" && dmap[x].length > 1) {
                      for (let j = 0; j < dmap[x].length; j++) {
                        if (dmap[x][j].r + "_" + dmap[x][j].c in computeMap) {
                          computeMap[dmap[x][j].r + "_" + dmap[x][j].c]["textColor"] = textColor;
                          computeMap[dmap[x][j].r + "_" + dmap[x][j].c]["cellColor"] = cellColor;
                        } else {
                          computeMap[dmap[x][j].r + "_" + dmap[x][j].c] = {
                            "textColor": textColor,
                            "cellColor": cellColor
                          };
                        }
                      }
                    }
                  }
                }
                if (conditionValue0 == "1") {
                  //唯一值
                  for (let x in dmap) {
                    if (x != "null" && x != "undefined" && dmap[x].length == 1) {
                      if (dmap[x][0].r + "_" + dmap[x][0].c in computeMap) {
                        computeMap[dmap[x][0].r + "_" + dmap[x][0].c]["textColor"] = textColor;
                        computeMap[dmap[x][0].r + "_" + dmap[x][0].c]["cellColor"] = cellColor;
                      } else {
                        computeMap[dmap[x][0].r + "_" + dmap[x][0].c] = {
                          "textColor": textColor,
                          "cellColor": cellColor
                        };
                      }
                    }
                  }
                }
              } else if (conditionName == "top10" || conditionName == "top10%" || conditionName == "last10" || conditionName == "last10%" || conditionName == "AboveAverage" || conditionName == "SubAverage") {
                //应用范围单元格值(数值型)
                let dArr = [];
                for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                  for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                    if (d[r] == null || d[r][c] == null) {
                      continue;
                    }
  
                    //单元格值类型为数字类型
                    if (d[r][c].ct != null && d[r][c].ct.t == "n") {
                      dArr.push(getcellvalue(r, c, d));
                    }
                  }
                }
                //数组处理
                if (conditionName == "top10" || conditionName == "top10%" || conditionName == "last10" || conditionName == "last10%") {
                  //从大到小排序
                  for (let j = 0; j < dArr.length; j++) {
                    for (let k = 0; k < dArr.length - 1 - j; k++) {
                      if (dArr[k] < dArr[k + 1]) {
                        let temp = dArr[k];
                        dArr[k] = dArr[k + 1];
                        dArr[k + 1] = temp;
                      }
                    }
                  }
                  //取条件值数组
                  let cArr;
                  if (conditionName == "top10") {
                    cArr = dArr.slice(0, conditionValue0); //前10项数组
                  } else if (conditionName == "top10%") {
                    cArr = dArr.slice(0, Math.floor(conditionValue0 * dArr.length / 100)); //前10%数组
                  } else if (conditionName == "last10") {
                    cArr = dArr.slice(dArr.length - conditionValue0, dArr.length); //最后10项数组
                  } else if (conditionName == "last10%") {
                    cArr = dArr.slice(dArr.length - Math.floor(conditionValue0 * dArr.length / 100), dArr.length); //最后10%数组
                  }
                  //循环应用范围计算
                  for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                    for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                      if (d[r] == null || d[r][c] == null) {
                        continue;
                      }
  
                      //单元格值
                      let cellVal = getcellvalue(r, c, d);
                      //符合条件
                      if (cArr.indexOf(cellVal) != -1) {
                        if (r + "_" + c in computeMap) {
                          computeMap[r + "_" + c]["textColor"] = textColor;
                          computeMap[r + "_" + c]["cellColor"] = cellColor;
                        } else {
                          computeMap[r + "_" + c] = {
                            "textColor": textColor,
                            "cellColor": cellColor
                          };
                        }
                      }
                    }
                  }
                } else if (conditionName == "AboveAverage" || conditionName == "SubAverage") {
                  //计算数组平均值
                  let sum = 0;
                  for (let j = 0; j < dArr.length; j++) {
                    sum += dArr[j];
                  }
                  let averageNum = sum / dArr.length;
                  //循环应用范围计算
                  if (conditionName == "AboveAverage") {
                    //高于平均值
                    for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                      for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                        if (d[r] == null || d[r][c] == null) {
                          continue;
                        }
  
                        //单元格值
                        let cellVal = getcellvalue(r, c, d);
                        //符合条件
                        if (cellVal > averageNum) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["textColor"] = textColor;
                            computeMap[r + "_" + c]["cellColor"] = cellColor;
                          } else {
                            computeMap[r + "_" + c] = {
                              "textColor": textColor,
                              "cellColor": cellColor
                            };
                          }
                        }
                      }
                    }
                  } else if (conditionName == "SubAverage") {
                    //低于平均值
                    for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                      for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                        if (d[r] == null || d[r][c] == null) {
                          continue;
                        }
  
                        //单元格值
                        let cellVal = getcellvalue(r, c, d);
                        //符合条件
                        if (cellVal < averageNum) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["textColor"] = textColor;
                            computeMap[r + "_" + c]["cellColor"] = cellColor;
                          } else {
                            computeMap[r + "_" + c] = {
                              "textColor": textColor,
                              "cellColor": cellColor
                            };
                          }
                        }
                      }
                    }
                  }
                }
              } else if (conditionName == 'regExp') {
                // 支持正则
                let re = new RegExp(conditionValue0); // 外部传递过来的正则表达式
                if (undefined == conditionValue1) {
                  // 如果没有第二个参数，默认是正则表达式直接生效
                  conditionValue1 = 1;
                }
                for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                  for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                    if (d[r] == null || d[r][c] == null) {
                      continue;
                    }
  
                    //单元格值
                    let cell = d[r][c];
                    if (getObjType(cell) != "object" || isRealNull(cell.v)) {
                      continue;
                    }
  
                    // 符合条件
                    let ret = re.test(cell.v);
                    if (conditionValue1 == 1 && ret || conditionValue1 == 0 && !ret) {
                      if (r + "_" + c in computeMap) {
                        computeMap[r + "_" + c]["textColor"] = textColor;
                        computeMap[r + "_" + c]["cellColor"] = cellColor;
                      } else {
                        computeMap[r + "_" + c] = {
                          "textColor": textColor,
                          "cellColor": cellColor
                        };
                      }
                    }
                  }
                }
              } else if (conditionName == 'sort') {
                // 支持数据有序
                for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                  for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                    if (d[r] == null || d[r][c] == null) {
                      continue;
                    }
  
                    //单元格值
                    let cell = d[r][c];
                    if (r < 1) {
                      continue;
                    }
                    let cellAbove = d[r - 1][c];
                    if (undefined == cellAbove) {
                      continue;
                    }
                    if (getObjType(cell) != "object" || isRealNull(cell.v)) {
                      continue;
                    }
  
                    // 符合条件
                    if ($.inArray(conditionValue0, [0, 'asc', '0']) > -1 && cell.v > cellAbove.v || $.inArray(conditionValue0, [1, '1', 'desc']) > -1 && cell.v < cellAbove.v) {
                      if (r + "_" + c in computeMap) {
                        computeMap[r + "_" + c]["textColor"] = textColor;
                        computeMap[r + "_" + c]["cellColor"] = cellColor;
                      } else {
                        computeMap[r + "_" + c] = {
                          "textColor": textColor,
                          "cellColor": cellColor
                        };
                      }
                    }
                  }
                }
              } else if (conditionName == "formula") {
                let str = cellrange[s].row[0],
                  edr = cellrange[s].row[1],
                  stc = cellrange[s].column[0],
                  edc = cellrange[s].column[1];
                let formulaTxt = conditionValue0;
                if (conditionValue0.toString().slice(0, 1) != '=') {
                  formulaTxt = '=' + conditionValue0;
                }
                for (let r = str; r <= edr; r++) {
                  for (let c = stc; c <= edc; c++) {
                    let func = formulaTxt;
                    let offsetRow = r - str;
                    let offsetCol = c - stc;
                    if (offsetRow > 0) {
                      func = "=" + formula.functionCopy(func, "down", offsetRow);
                    }
                    if (offsetCol > 0) {
                      func = "=" + formula.functionCopy(func, "right", offsetCol);
                    }
                    let funcV = formula.execfunction(func);
                    let v = funcV[1];
                    if (typeof v != 'boolean') {
                      v = !!Number(v);
                    }
                    if (!v) {
                      continue;
                    }
                    if (r + "_" + c in computeMap) {
                      computeMap[r + "_" + c]["textColor"] = textColor;
                      computeMap[r + "_" + c]["cellColor"] = cellColor;
                    } else {
                      computeMap[r + "_" + c] = {
                        "textColor": textColor,
                        "cellColor": cellColor
                      };
                    }
                  }
                }
              }
            }
          }
}
