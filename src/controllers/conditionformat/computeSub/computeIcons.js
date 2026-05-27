import { getObjType } from '../../../utils/util';

export function computeIcons(_this, computeMap, type, cellrange, format, ruleArr, i, d) {
  {
            //图标集
            let len = parseInt(format["len"]);
            let leftMin = parseInt(format["leftMin"]);
            let top = parseInt(format["top"]);
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
              let a = Math.floor((max - min + 1) / len);
              let b = (max - min + 1) % len;
              if (len == 3) {
                //一组图标有三个
                let v1, v2, v3;
                if (b == 2) {
                  v1 = [min, min + a];
                  v2 = [min + a + 1, min + a * 2];
                  v3 = [min + a * 2 + 1, max];
                } else {
                  v1 = [min, min + a - 1];
                  v2 = [min + a, min + a * 2 - 1];
                  v3 = [min + a * 2, max];
                }
                for (let s = 0; s < cellrange.length; s++) {
                  for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                    for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                      if (d[r] == null || d[r][c] == null) {
                        continue;
                      }
                      let cell = d[r][c];
                      if (getObjType(cell) == "object" && cell["ct"] != null && cell["ct"].t == "n" && cell.v != null) {
                        if (parseInt(cell.v) >= v1[0] && parseInt(cell.v) <= v1[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin + 2,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin + 2,
                                "top": top
                              }
                            };
                          }
                        } else if (parseInt(cell.v) >= v2[0] && parseInt(cell.v) <= v2[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin + 1,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin + 1,
                                "top": top
                              }
                            };
                          }
                        } else if (parseInt(cell.v) >= v3[0] && parseInt(cell.v) <= v3[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin,
                                "top": top
                              }
                            };
                          }
                        }
                      }
                    }
                  }
                }
              } else if (len == 4) {
                //一组图标有四个
                let v1, v2, v3, v4;
                if (b == 2) {
                  v1 = [min, min + a];
                  v2 = [min + a + 1, min + a * 2];
                  v3 = [min + a * 2 + 1, min + a * 3];
                  v4 = [min + a * 3 + 1, max];
                } else if (b == 3) {
                  v1 = [min, min + a];
                  v2 = [min + a + 1, min + a * 2];
                  v3 = [min + a * 2 + 1, min + a * 3 + 1];
                  v4 = [min + a * 3 + 2, max];
                } else {
                  v1 = [min, min + a - 1];
                  v2 = [min + a, min + a * 2 - 1];
                  v3 = [min + a * 2, min + a * 3 - 1];
                  v4 = [min + a * 3, max];
                }
                for (let s = 0; s < cellrange.length; s++) {
                  for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                    for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                      if (d[r] == null || d[r][c] == null) {
                        continue;
                      }
                      let cell = d[r][c];
                      if (getObjType(cell) == "object" && cell["ct"] != null && cell["ct"].t == "n" && cell.v != null) {
                        if (parseInt(cell.v) >= v1[0] && parseInt(cell.v) <= v1[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin + 3,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin + 3,
                                "top": top
                              }
                            };
                          }
                        } else if (parseInt(cell.v) >= v2[0] && parseInt(cell.v) <= v2[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin + 2,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin + 2,
                                "top": top
                              }
                            };
                          }
                        } else if (parseInt(cell.v) >= v3[0] && parseInt(cell.v) <= v3[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin + 1,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin + 1,
                                "top": top
                              }
                            };
                          }
                        } else if (parseInt(cell.v) >= v4[0] && parseInt(cell.v) <= v4[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin,
                                "top": top
                              }
                            };
                          }
                        }
                      }
                    }
                  }
                }
              } else if (len == 5) {
                //一组图标有五个
                let v1, v2, v3, v4, v5;
                if (b == 2) {
                  v1 = [min, min + a];
                  v2 = [min + a + 1, min + a * 2];
                  v3 = [min + a * 2 + 1, min + a * 3];
                  v4 = [min + a * 3 + 1, min + a * 4];
                  v5 = [min + a * 4 + 1, max];
                } else if (b == 3) {
                  v1 = [min, min + a];
                  v2 = [min + a + 1, min + a * 2];
                  v3 = [min + a * 2 + 1, min + a * 3 + 1];
                  v4 = [min + a * 3 + 2, min + a * 4 + 1];
                  v5 = [min + a * 4 + 2, max];
                } else if (b == 4) {
                  v1 = [min, min + a];
                  v2 = [min + a + 1, min + a * 2 + 1];
                  v3 = [min + a * 2 + 2, min + a * 3 + 1];
                  v4 = [min + a * 3 + 2, min + a * 4 + 2];
                  v5 = [min + a * 4 + 3, max];
                } else {
                  v1 = [min, min + a - 1];
                  v2 = [min + a, min + a * 2 - 1];
                  v3 = [min + a * 2, min + a * 3 - 1];
                  v4 = [min + a * 3, min + a * 4 - 1];
                  v5 = [min + a * 4, max];
                }
                for (let s = 0; s < cellrange.length; s++) {
                  for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
                    for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                      if (d[r] == null || d[r][c] == null) {
                        continue;
                      }
                      let cell = d[r][c];
                      if (getObjType(cell) == "object" && cell["ct"] != null && cell["ct"].t == "n" && cell.v != null) {
                        if (parseInt(cell.v) >= v1[0] && parseInt(cell.v) <= v1[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin + 4,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin + 4,
                                "top": top
                              }
                            };
                          }
                        } else if (parseInt(cell.v) >= v2[0] && parseInt(cell.v) <= v2[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin + 3,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin + 3,
                                "top": top
                              }
                            };
                          }
                        } else if (parseInt(cell.v) >= v3[0] && parseInt(cell.v) <= v3[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin + 2,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin + 2,
                                "top": top
                              }
                            };
                          }
                        } else if (parseInt(cell.v) >= v4[0] && parseInt(cell.v) <= v4[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin + 1,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin + 1,
                                "top": top
                              }
                            };
                          }
                        } else if (parseInt(cell.v) >= v5[0] && parseInt(cell.v) <= v5[1]) {
                          if (r + "_" + c in computeMap) {
                            computeMap[r + "_" + c]["icons"] = {
                              "left": leftMin,
                              "top": top
                            };
                          } else {
                            computeMap[r + "_" + c] = {
                              "icons": {
                                "left": leftMin,
                                "top": top
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
}
