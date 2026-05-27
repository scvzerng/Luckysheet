import { getObjType } from '../../../utils/util';

export function computeDataBar(_this, computeMap, type, cellrange, format, ruleArr, i, d) {
  {
            //数据条
            let max = null,
              min = null;
            for (let s = 0; s < cellrange.length; s++) {
              for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                  if (d[r] == null || d[r][c] == null) {
                    continue;
                  }
                  let cell = d[r][c];
                  if (getObjType(cell) == "object" && cell["ct"] != null && cell["ct"].t == "n" && cell.v != null) {
                    if (max == null || parseInt(cell.v) > max) {
                      max = parseInt(cell.v);
                    }
                    if (min == null || parseInt(cell.v) < min) {
                      min = parseInt(cell.v);
                    }
                  }
                }
              }
            }
            if (max != null && min != null) {
              if (min < 0) {
                //选区范围内有负数
                let plusLen = Math.round(max / (max - min) * 10) / 10; //正数所占比
                let minusLen = Math.round(Math.abs(min) / (max - min) * 10) / 10; //负数所占比
  
                for (let s = 0; s < cellrange.length; s++) {
                  for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                    for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                      if (d[r] == null || d[r][c] == null) {
                        continue;
                      }
                      let cell = d[r][c];
                      if (getObjType(cell) == "object" && cell["ct"] != null && cell["ct"].t == "n" && cell.v != null) {
                        if (parseInt(cell.v) < 0) {
                          //负数
                          let valueLen = Math.round(Math.abs(parseInt(cell.v)) / Math.abs(min) * 100) / 100;
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["dataBar"] = {
                              "valueType": "minus",
                              "minusLen": minusLen,
                              "valueLen": valueLen,
                              "format": format
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "dataBar": {
                                "valueType": "minus",
                                "minusLen": minusLen,
                                "valueLen": valueLen,
                                "format": format
                              }
                            };
                          }
                        }
                        if (parseInt(cell.v) > 0) {
                          //正数
                          let valueLen = Math.round(parseInt(cell.v) / max * 100) / 100;
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["dataBar"] = {
                              "valueType": "plus",
                              "plusLen": plusLen,
                              "minusLen": minusLen,
                              "valueLen": valueLen,
                              "format": format
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "dataBar": {
                                "valueType": "plus",
                                "plusLen": plusLen,
                                "minusLen": minusLen,
                                "valueLen": valueLen,
                                "format": format
                              }
                            };
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                let plusLen = 1;
                for (let s = 0; s < cellrange.length; s++) {
                  for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                    for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                      if (d[r] == null || d[r][c] == null) {
                        continue;
                      }
                      let cell = d[r][c];
                      if (getObjType(cell) == "object" && cell["ct"] != null && cell["ct"].t == "n" && cell.v != null) {
                        let valueLen;
                        if (max == 0) {
                          valueLen = 1;
                        } else {
                          valueLen = Math.round(parseInt(cell.v) / max * 100) / 100;
                        }
                        if (r + "_" + c in computeMap) {
                          computeMap[r + "_" + c]["dataBar"] = {
                            "valueType": "plus",
                            "plusLen": plusLen,
                            "valueLen": valueLen,
                            "format": format
                          };
                        } else {
                          computeMap[r + "_" + c] = {
                            "dataBar": {
                              "valueType": "plus",
                              "plusLen": plusLen,
                              "valueLen": valueLen,
                              "format": format
                            }
                          };
                        }
                      }
                    }
                  }
                }
              }
            }
          }
}
