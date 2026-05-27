import { getObjType } from '../../../utils/util';

export function computeColorGradation(_this, computeMap, type, cellrange, format, ruleArr, i, d) {
  {
            //色阶
            let max = null,
              min = null,
              sum = 0,
              count = 0;
            for (let s = 0; s < cellrange.length; s++) {
              for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                  if (d[r] == null || d[r][c] == null) {
                    continue;
                  }
                  let cell = d[r][c];
                  if (getObjType(cell) == "object" && cell["ct"] != null && cell["ct"].t == "n" && cell.v != null) {
                    count++;
                    sum += parseInt(cell.v);
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
              if (format.length == 3) {
                //三色色阶
                let avg = Math.floor(sum / count);
                for (let s = 0; s < cellrange.length; s++) {
                  for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                    for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                      if (d[r] == null || d[r][c] == null) {
                        continue;
                      }
                      let cell = d[r][c];
                      if (getObjType(cell) == "object" && cell["ct"] != null && cell["ct"].t == "n" && cell.v != null) {
                        if (parseInt(cell.v) == min) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["cellColor"] = format[2];
                          } else {
                            computeMap[r + "_" + c] = {
                              "cellColor": format[2]
                            };
                          }
                        } else if (parseInt(cell.v) > min && parseInt(cell.v) < avg) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["cellColor"] = _this.getcolorGradation(format[2], format[1], min, avg, parseInt(cell.v));
                          } else {
                            computeMap[r + "_" + c] = {
                              "cellColor": _this.getcolorGradation(format[2], format[1], min, avg, parseInt(cell.v))
                            };
                          }
                        } else if (parseInt(cell.v) == avg) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["cellColor"] = format[1];
                          } else {
                            computeMap[r + "_" + c] = {
                              "cellColor": format[1]
                            };
                          }
                        } else if (parseInt(cell.v) > avg && parseInt(cell.v) < max) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["cellColor"] = _this.getcolorGradation(format[1], format[0], avg, max, parseInt(cell.v));
                          } else {
                            computeMap[r + "_" + c] = {
                              "cellColor": _this.getcolorGradation(format[1], format[0], avg, max, parseInt(cell.v))
                            };
                          }
                        } else if (parseInt(cell.v) == max) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["cellColor"] = format[0];
                          } else {
                            computeMap[r + "_" + c] = {
                              "cellColor": format[0]
                            };
                          }
                        }
                      }
                    }
                  }
                }
              } else if (format.length == 2) {
                //两色色阶
                for (let s = 0; s < cellrange.length; s++) {
                  for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                    for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                      if (d[r] == null || d[r][c] == null) {
                        continue;
                      }
                      let cell = d[r][c];
                      if (getObjType(cell) == "object" && cell["ct"] != null && cell["ct"].t == "n" && cell.v != null) {
                        if (parseInt(cell.v) == min) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["cellColor"] = format[1];
                          } else {
                            computeMap[r + "_" + c] = {
                              "cellColor": format[1]
                            };
                          }
                        } else if (parseInt(cell.v) > min && parseInt(cell.v) < max) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["cellColor"] = _this.getcolorGradation(format[1], format[0], min, max, parseInt(cell.v));
                          } else {
                            computeMap[r + "_" + c] = {
                              "cellColor": _this.getcolorGradation(format[1], format[0], min, max, parseInt(cell.v))
                            };
                          }
                        } else if (parseInt(cell.v) == max) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["cellColor"] = format[0];
                          } else {
                            computeMap[r + "_" + c] = {
                              "cellColor": format[0]
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
}
