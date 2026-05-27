import { rowLocationByIndex, colLocationByIndex } from "../../global/location";
import { countfunc } from "../../global/count";
import { getBorderInfoCompute } from "../../global/border";
import { isRealNum } from "../../global/validate";
import { genarate, update } from "../../global/format";
import { jfrefreshgrid } from "../../global/refresh";
import editor from "../../global/editor";
import formula from "../../global/formula";
import conditionformat from "../conditionformat";
import { selectHightlightShow } from "../select";
import { getSheetIndex } from "../../methods/get";
import { getObjType, replaceHtml } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";
import dayjs from 'dayjs';

//选区下拉
const coreModule = {
  copyRange: {},
  //复制范围
  applyRange: {},
  //应用范围
  applyType: null,
  //0复制单元格，1填充序列，2仅填充格式，3不带格式填充，4以天数填充，5以工作日填充，6以月填充，7以年填充，8以中文小写数字序列填充
  direction: null,
  update: function () {
    let _this = this;
    if (Store.allowEdit === false) {
      return;
    }
    let d = editor.deepCopyFlowData(Store.flowdata);
    let file = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
    let cfg = $.extend(true, {}, Store.config);
    let borderInfoCompute = getBorderInfoCompute();
    let direction = _this.direction;
    let type = _this.applyType;

    //复制范围
    let copyRange = _this.copyRange;
    let copy_str_r = copyRange["row"][0],
      copy_end_r = copyRange["row"][1];
    let copy_str_c = copyRange["column"][0],
      copy_end_c = copyRange["column"][1];
    let copyData = _this.getCopyData(d, copy_str_r, copy_end_r, copy_str_c, copy_end_c, direction);
    let csLen;
    if (direction == "down" || direction == "up") {
      csLen = copy_end_r - copy_str_r + 1;
    } else if (direction == "right" || direction == "left") {
      csLen = copy_end_c - copy_str_c + 1;
    }

    //应用范围
    let applyRange = _this.applyRange;
    let apply_str_r = applyRange["row"][0],
      apply_end_r = applyRange["row"][1];
    let apply_str_c = applyRange["column"][0],
      apply_end_c = applyRange["column"][1];
    if (direction == "down" || direction == "up") {
      let asLen = apply_end_r - apply_str_r + 1;
      for (let i = apply_str_c; i <= apply_end_c; i++) {
        let copyD = copyData[i - apply_str_c];
        let applyData = _this.getApplyData(copyD, csLen, asLen);
        if (direction == "down") {
          for (let j = apply_str_r; j <= apply_end_r; j++) {
            let cell = applyData[j - apply_str_r];
            if (cell.f != null) {
              let f = "=" + formula.functionCopy(cell.f, "down", j - apply_str_r + 1);
              let v = formula.execfunction(f, j, i);
              formula.execFunctionGroup(j, i, v[1], undefined, d);
              cell.f = v[2];
              cell.v = v[1];
              if (isRealNum(cell.v) && !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(cell.v)) {
                if (cell.v == Infinity || cell.v == -Infinity) {
                  cell.m = cell.v.toString();
                } else {
                  if (cell.v.toString().indexOf("e") > -1) {
                    let len = cell.v.toString().split(".")[1].split("e")[0].length;
                    if (len > 5) {
                      len = 5;
                    }
                    cell.m = cell.v.toExponential(len).toString();
                  } else {
                    let mask;
                    if (cell.ct.fa === "##0.00") {
                      mask = genarate(Math.round(cell.v * 1000000000) / 1000000000 + ".00");
                      cell.m = mask[0].toString();
                    } else {
                      mask = genarate(Math.round(cell.v * 1000000000) / 1000000000);
                      cell.m = mask[0].toString();
                    }
                  }
                }
                cell.ct = cell.ct || {
                  "fa": "General",
                  "t": "n"
                };
              } else {
                let mask = genarate(cell.v);
                cell.m = mask[0].toString();
                cell.ct = mask[1];
              }
            }
            d[j][i] = cell;

            //边框
            let bd_r = copy_str_r + (j - apply_str_r) % csLen;
            let bd_c = i;
            if (borderInfoCompute[bd_r + "_" + bd_c]) {
              let bd_obj = {
                "rangeType": "cell",
                "value": {
                  "row_index": j,
                  "col_index": i,
                  "l": borderInfoCompute[bd_r + "_" + bd_c].l,
                  "r": borderInfoCompute[bd_r + "_" + bd_c].r,
                  "t": borderInfoCompute[bd_r + "_" + bd_c].t,
                  "b": borderInfoCompute[bd_r + "_" + bd_c].b
                }
              };
              cfg["borderInfo"].push(bd_obj);
            } else if (borderInfoCompute[j + "_" + i]) {
              let bd_obj = {
                "rangeType": "cell",
                "value": {
                  "row_index": j,
                  "col_index": i,
                  "l": null,
                  "r": null,
                  "t": null,
                  "b": null
                }
              };
              cfg["borderInfo"].push(bd_obj);
            }
          }
        }
        if (direction == "up") {
          for (let j = apply_end_r; j >= apply_str_r; j--) {
            let cell = applyData[apply_end_r - j];
            if (cell.f != null) {
              let f = "=" + formula.functionCopy(cell.f, "up", apply_end_r - j + 1);
              let v = formula.execfunction(f, j, i);
              formula.execFunctionGroup(j, i, v[1], undefined, d);
              cell.f = v[2];
              cell.v = v[1];
              if (isRealNum(cell.v) && !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(cell.v)) {
                if (cell.v == Infinity || cell.v == -Infinity) {
                  cell.m = cell.v.toString();
                } else {
                  if (cell.v.toString().indexOf("e") > -1) {
                    let len = cell.v.toString().split(".")[1].split("e")[0].length;
                    if (len > 5) {
                      len = 5;
                    }
                    cell.m = cell.v.toExponential(len).toString();
                  } else {
                    let mask = genarate(Math.round(cell.v * 1000000000) / 1000000000);
                    cell.m = mask[0].toString();
                  }
                }
                cell.ct = {
                  "fa": "General",
                  "t": "n"
                };
              } else {
                let mask = genarate(cell.v);
                cell.m = mask[0].toString();
                cell.ct = mask[1];
              }
            }
            d[j][i] = cell;

            //边框
            let bd_r = copy_end_r - (apply_end_r - j) % csLen;
            let bd_c = i;
            if (borderInfoCompute[bd_r + "_" + bd_c]) {
              let bd_obj = {
                "rangeType": "cell",
                "value": {
                  "row_index": j,
                  "col_index": i,
                  "l": borderInfoCompute[bd_r + "_" + bd_c].l,
                  "r": borderInfoCompute[bd_r + "_" + bd_c].r,
                  "t": borderInfoCompute[bd_r + "_" + bd_c].t,
                  "b": borderInfoCompute[bd_r + "_" + bd_c].b
                }
              };
              cfg["borderInfo"].push(bd_obj);
            } else if (borderInfoCompute[j + "_" + i]) {
              let bd_obj = {
                "rangeType": "cell",
                "value": {
                  "row_index": j,
                  "col_index": i,
                  "l": null,
                  "r": null,
                  "t": null,
                  "b": null
                }
              };
              cfg["borderInfo"].push(bd_obj);
            }
          }
        }
      }
    } else if (direction == "right" || direction == "left") {
      let asLen = apply_end_c - apply_str_c + 1;
      for (let i = apply_str_r; i <= apply_end_r; i++) {
        let copyD = copyData[i - apply_str_r];
        let applyData = _this.getApplyData(copyD, csLen, asLen);
        if (direction == "right") {
          for (let j = apply_str_c; j <= apply_end_c; j++) {
            let cell = applyData[j - apply_str_c];
            if (cell.f != null) {
              let f = "=" + formula.functionCopy(cell.f, "right", j - apply_str_c + 1);
              let v = formula.execfunction(f, i, j);
              formula.execFunctionGroup(i, j, v[1], undefined, d);
              cell.f = v[2];
              cell.v = v[1];
              if (isRealNum(cell.v) && !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(cell.v)) {
                if (cell.v == Infinity || cell.v == -Infinity) {
                  cell.m = cell.v.toString();
                } else {
                  if (cell.v.toString().indexOf("e") > -1) {
                    let len = cell.v.toString().split(".")[1].split("e")[0].length;
                    if (len > 5) {
                      len = 5;
                    }
                    cell.m = cell.v.toExponential(len).toString();
                  } else {
                    let mask = genarate(Math.round(cell.v * 1000000000) / 1000000000);
                    cell.m = mask[0].toString();
                  }
                }
                cell.ct = {
                  "fa": "General",
                  "t": "n"
                };
              } else {
                let mask = genarate(cell.v);
                cell.m = mask[0].toString();
                cell.ct = mask[1];
              }
            }
            d[i][j] = cell;

            //边框
            let bd_r = i;
            let bd_c = copy_str_c + (j - apply_str_c) % csLen;
            if (borderInfoCompute[bd_r + "_" + bd_c]) {
              let bd_obj = {
                "rangeType": "cell",
                "value": {
                  "row_index": i,
                  "col_index": j,
                  "l": borderInfoCompute[bd_r + "_" + bd_c].l,
                  "r": borderInfoCompute[bd_r + "_" + bd_c].r,
                  "t": borderInfoCompute[bd_r + "_" + bd_c].t,
                  "b": borderInfoCompute[bd_r + "_" + bd_c].b
                }
              };
              cfg["borderInfo"].push(bd_obj);
            } else if (borderInfoCompute[i + "_" + j]) {
              let bd_obj = {
                "rangeType": "cell",
                "value": {
                  "row_index": i,
                  "col_index": j,
                  "l": null,
                  "r": null,
                  "t": null,
                  "b": null
                }
              };
              cfg["borderInfo"].push(bd_obj);
            }
          }
        }
        if (direction == "left") {
          for (let j = apply_end_c; j >= apply_str_c; j--) {
            let cell = applyData[apply_end_c - j];
            if (cell.f != null) {
              let f = "=" + formula.functionCopy(cell.f, "left", apply_end_c - j + 1);
              let v = formula.execfunction(f, i, j);
              formula.execFunctionGroup(i, j, v[1], undefined, d);
              cell.f = v[2];
              cell.v = v[1];
              if (isRealNum(cell.v) && !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(cell.v)) {
                if (cell.v == Infinity || cell.v == -Infinity) {
                  cell.m = cell.v.toString();
                } else {
                  if (cell.v.toString().indexOf("e") > -1) {
                    let len = cell.v.toString().split(".")[1].split("e")[0].length;
                    if (len > 5) {
                      len = 5;
                    }
                    cell.m = cell.v.toExponential(len).toString();
                  } else {
                    let mask = genarate(Math.round(cell.v * 1000000000) / 1000000000);
                    cell.m = mask[0].toString();
                  }
                }
                cell.ct = {
                  "fa": "General",
                  "t": "n"
                };
              } else {
                let mask = genarate(cell.v);
                cell.m = mask[0].toString();
                cell.ct = mask[1];
              }
            }
            d[i][j] = cell;

            //边框
            let bd_r = i;
            let bd_c = copy_end_c - (apply_end_c - j) % csLen;
            if (borderInfoCompute[bd_r + "_" + bd_c]) {
              let bd_obj = {
                "rangeType": "cell",
                "value": {
                  "row_index": i,
                  "col_index": j,
                  "l": borderInfoCompute[bd_r + "_" + bd_c].l,
                  "r": borderInfoCompute[bd_r + "_" + bd_c].r,
                  "t": borderInfoCompute[bd_r + "_" + bd_c].t,
                  "b": borderInfoCompute[bd_r + "_" + bd_c].b
                }
              };
              cfg["borderInfo"].push(bd_obj);
            } else if (borderInfoCompute[i + "_" + j]) {
              let bd_obj = {
                "rangeType": "cell",
                "value": {
                  "row_index": i,
                  "col_index": j,
                  "l": null,
                  "r": null,
                  "t": null,
                  "b": null
                }
              };
              cfg["borderInfo"].push(bd_obj);
            }
          }
        }
      }
    }

    //条件格式
    let cdformat = $.extend(true, [], file["luckysheet_conditionformat_save"]);
    if (cdformat != null && cdformat.length > 0) {
      for (let i = 0; i < cdformat.length; i++) {
        let cdformat_cellrange = cdformat[i].cellrange;
        let emptyRange = [];
        for (let j = 0; j < cdformat_cellrange.length; j++) {
          let range = conditionformat.CFSplitRange(cdformat_cellrange[j], {
            "row": copyRange["row"],
            "column": copyRange["column"]
          }, {
            "row": applyRange["row"],
            "column": applyRange["column"]
          }, "operatePart");
          if (range.length > 0) {
            emptyRange = emptyRange.concat(range);
          }
        }
        if (emptyRange.length > 0) {
          cdformat[i].cellrange.push(applyRange);
        }
      }
    }

    //刷新一次表格
    let allParam = {
      "cfg": cfg,
      "cdformat": cdformat
    };
    jfrefreshgrid(d, Store.luckysheet_select_save, allParam);
    selectHightlightShow();
  },
  getCopyData: function (d, r1, r2, c1, c2, direction) {
    let _this = this;
    let copyData = [];
    let a1, a2, b1, b2;
    if (direction == "down" || direction == "up") {
      a1 = c1;
      a2 = c2;
      b1 = r1;
      b2 = r2;
    } else if (direction == "right" || direction == "left") {
      a1 = r1;
      a2 = r2;
      b1 = c1;
      b2 = c2;
    }
    for (let a = a1; a <= a2; a++) {
      let obj = {};
      let arrData = [];
      let arrIndex = [];
      let text = "";
      let extendNumberBeforeStr = null;
      let extendNumberAfterStr = null;
      let isSameStr = true;
      for (let b = b1; b <= b2; b++) {
        //单元格
        let data;
        if (direction == "down" || direction == "up") {
          data = d[b][a];
        } else if (direction == "right" || direction == "left") {
          data = d[a][b];
        }

        //单元格值类型
        let str;
        if (!!data && !!data["v"] && data["f"] == null) {
          if (!!data["ct"] && data["ct"]["t"] == "n") {
            str = "number";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else if (!!data["ct"] && data["ct"]["t"] == "d") {
            str = "date";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else if (_this.isExtendNumber(data["m"])[0]) {
            str = "extendNumber";
            let isExtendNumber = _this.isExtendNumber(data["m"]);
            if (extendNumberBeforeStr == null || extendNumberAfterStr == null) {
              isSameStr = true;
              extendNumberBeforeStr = isExtendNumber[2];
              extendNumberAfterStr = isExtendNumber[3];
            } else {
              if (isExtendNumber[2] != extendNumberBeforeStr || isExtendNumber[3] != extendNumberAfterStr) {
                isSameStr = false;
                extendNumberBeforeStr = isExtendNumber[2];
                extendNumberAfterStr = isExtendNumber[3];
              } else {
                isSameStr = true;
              }
            }
          } else if (_this.isChnNumber(data["m"])) {
            str = "chnNumber";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else if (_this.isChnWeek2(data["m"])) {
            str = "chnWeek2";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else if (_this.isChnWeek3(data["m"])) {
            str = "chnWeek3";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else {
            str = "other";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          }
        } else {
          str = "other";
          extendNumberBeforeStr = null;
          extendNumberAfterStr = null;
        }
        if (str == "extendNumber") {
          if (b == b1) {
            if (b1 == b2) {
              text = str;
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
              obj[text] = [];
              obj[text].push({
                "data": arrData,
                "index": arrIndex
              });
            } else {
              text = str;
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
            }
          } else if (b == b2) {
            if (text == str && isSameStr) {
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
              if (text in obj) {
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              } else {
                obj[text] = [];
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              }
            } else {
              if (text in obj) {
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              } else {
                obj[text] = [];
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              }
              text = str;
              arrData = [];
              arrData.push(data);
              arrIndex = [];
              arrIndex.push(b - b1 + 1);
              if (text in obj) {
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              } else {
                obj[text] = [];
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              }
            }
          } else {
            if (text == str && isSameStr) {
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
            } else {
              if (text in obj) {
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              } else {
                obj[text] = [];
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              }
              text = str;
              arrData = [];
              arrData.push(data);
              arrIndex = [];
              arrIndex.push(b - b1 + 1);
            }
          }
        } else {
          if (b == b1) {
            if (b1 == b2) {
              text = str;
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
              obj[text] = [];
              obj[text].push({
                "data": arrData,
                "index": arrIndex
              });
            } else {
              text = str;
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
            }
          } else if (b == b2) {
            if (text == str) {
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
              if (text in obj) {
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              } else {
                obj[text] = [];
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              }
            } else {
              if (text in obj) {
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              } else {
                obj[text] = [];
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              }
              text = str;
              arrData = [];
              arrData.push(data);
              arrIndex = [];
              arrIndex.push(b - b1 + 1);
              if (text in obj) {
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              } else {
                obj[text] = [];
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              }
            }
          } else {
            if (text == str) {
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
            } else {
              if (text in obj) {
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              } else {
                obj[text] = [];
                obj[text].push({
                  "data": arrData,
                  "index": arrIndex
                });
              }
              text = str;
              arrData = [];
              arrData.push(data);
              arrIndex = [];
              arrIndex.push(b - b1 + 1);
            }
          }
        }
      }
      copyData.push(obj);
    }
    return copyData;
  },
  getApplyData: function (copyD, csLen, asLen) {
    let _this = this;
    let applyData = [];
    let direction = _this.direction;
    let type = _this.applyType;
    let num = Math.floor(asLen / csLen);
    let rsd = asLen % csLen;

    //纯数字类型
    let copyD_number = copyD["number"];
    let applyD_number = [];
    if (!!copyD_number) {
      for (let i = 0; i < copyD_number.length; i++) {
        let s = _this.getLenS(copyD_number[i]["index"], rsd);
        let len = copyD_number[i]["index"].length * num + s;
        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(copyD_number[i]["data"], len, direction, type, "number");
        } else if (type == "2") {
          arrData = _this.getDataByType(copyD_number[i]["data"], len, direction, type);
        } else {
          arrData = _this.getDataByType(copyD_number[i]["data"], len, direction, "0");
        }
        let arrIndex = _this.getDataIndex(csLen, asLen, copyD_number[i]["index"]);
        applyD_number.push({
          "data": arrData,
          "index": arrIndex
        });
      }
    }

    //扩展数字型（即一串字符最后面的是数字）
    let copyD_extendNumber = copyD["extendNumber"];
    let applyD_extendNumber = [];
    if (!!copyD_extendNumber) {
      for (let i = 0; i < copyD_extendNumber.length; i++) {
        let s = _this.getLenS(copyD_extendNumber[i]["index"], rsd);
        let len = copyD_extendNumber[i]["index"].length * num + s;
        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(copyD_extendNumber[i]["data"], len, direction, type, "extendNumber");
        } else if (type == "2") {
          arrData = _this.getDataByType(copyD_extendNumber[i]["data"], len, direction, type);
        } else {
          arrData = _this.getDataByType(copyD_extendNumber[i]["data"], len, direction, "0");
        }
        let arrIndex = _this.getDataIndex(csLen, asLen, copyD_extendNumber[i]["index"]);
        applyD_extendNumber.push({
          "data": arrData,
          "index": arrIndex
        });
      }
    }

    //日期类型
    let copyD_date = copyD["date"];
    let applyD_date = [];
    if (!!copyD_date) {
      for (let i = 0; i < copyD_date.length; i++) {
        let s = _this.getLenS(copyD_date[i]["index"], rsd);
        let len = copyD_date[i]["index"].length * num + s;
        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(copyD_date[i]["data"], len, direction, type, "date");
        } else if (type == "8") {
          arrData = _this.getDataByType(copyD_date[i]["data"], len, direction, "0");
        } else {
          arrData = _this.getDataByType(copyD_date[i]["data"], len, direction, type);
        }
        let arrIndex = _this.getDataIndex(csLen, asLen, copyD_date[i]["index"]);
        applyD_date.push({
          "data": arrData,
          "index": arrIndex
        });
      }
    }

    //中文小写数字 或 一~日
    let copyD_chnNumber = copyD["chnNumber"];
    let applyD_chnNumber = [];
    if (!!copyD_chnNumber) {
      for (let i = 0; i < copyD_chnNumber.length; i++) {
        let s = _this.getLenS(copyD_chnNumber[i]["index"], rsd);
        let len = copyD_chnNumber[i]["index"].length * num + s;
        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(copyD_chnNumber[i]["data"], len, direction, type, "chnNumber");
        } else if (type == "2" || type == "8") {
          arrData = _this.getDataByType(copyD_chnNumber[i]["data"], len, direction, type);
        } else {
          arrData = _this.getDataByType(copyD_chnNumber[i]["data"], len, direction, "0");
        }
        let arrIndex = _this.getDataIndex(csLen, asLen, copyD_chnNumber[i]["index"]);
        applyD_chnNumber.push({
          "data": arrData,
          "index": arrIndex
        });
      }
    }

    //周一~周日
    let copyD_chnWeek2 = copyD["chnWeek2"];
    let applyD_chnWeek2 = [];
    if (!!copyD_chnWeek2) {
      for (let i = 0; i < copyD_chnWeek2.length; i++) {
        let s = _this.getLenS(copyD_chnWeek2[i]["index"], rsd);
        let len = copyD_chnWeek2[i]["index"].length * num + s;
        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(copyD_chnWeek2[i]["data"], len, direction, type, "chnWeek2");
        } else if (type == "2") {
          arrData = _this.getDataByType(copyD_chnWeek2[i]["data"], len, direction, type);
        } else {
          arrData = _this.getDataByType(copyD_chnWeek2[i]["data"], len, direction, "0");
        }
        let arrIndex = _this.getDataIndex(csLen, asLen, copyD_chnWeek2[i]["index"]);
        applyD_chnWeek2.push({
          "data": arrData,
          "index": arrIndex
        });
      }
    }

    //星期一~星期日
    let copyD_chnWeek3 = copyD["chnWeek3"];
    let applyD_chnWeek3 = [];
    if (!!copyD_chnWeek3) {
      for (let i = 0; i < copyD_chnWeek3.length; i++) {
        let s = _this.getLenS(copyD_chnWeek3[i]["index"], rsd);
        let len = copyD_chnWeek3[i]["index"].length * num + s;
        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(copyD_chnWeek3[i]["data"], len, direction, type, "chnWeek3");
        } else if (type == "2") {
          arrData = _this.getDataByType(copyD_chnWeek3[i]["data"], len, direction, type);
        } else {
          arrData = _this.getDataByType(copyD_chnWeek3[i]["data"], len, direction, "0");
        }
        let arrIndex = _this.getDataIndex(csLen, asLen, copyD_chnWeek3[i]["index"]);
        applyD_chnWeek3.push({
          "data": arrData,
          "index": arrIndex
        });
      }
    }

    //其它
    let copyD_other = copyD["other"];
    let applyD_other = [];
    if (!!copyD_other) {
      for (let i = 0; i < copyD_other.length; i++) {
        let s = _this.getLenS(copyD_other[i]["index"], rsd);
        let len = copyD_other[i]["index"].length * num + s;
        let arrData;
        if (type == "2" || type == "3") {
          arrData = _this.getDataByType(copyD_other[i]["data"], len, direction, type);
        } else {
          arrData = _this.getDataByType(copyD_other[i]["data"], len, direction, "0");
        }
        let arrIndex = _this.getDataIndex(csLen, asLen, copyD_other[i]["index"]);
        applyD_other.push({
          "data": arrData,
          "index": arrIndex
        });
      }
    }
    for (let x = 1; x <= asLen; x++) {
      if (applyD_number.length > 0) {
        for (let y = 0; y < applyD_number.length; y++) {
          if (x in applyD_number[y]["index"]) {
            applyData.push(applyD_number[y]["data"][applyD_number[y]["index"][x]]);
          }
        }
      }
      if (applyD_extendNumber.length > 0) {
        for (let y = 0; y < applyD_extendNumber.length; y++) {
          if (x in applyD_extendNumber[y]["index"]) {
            applyData.push(applyD_extendNumber[y]["data"][applyD_extendNumber[y]["index"][x]]);
          }
        }
      }
      if (applyD_date.length > 0) {
        for (let y = 0; y < applyD_date.length; y++) {
          if (x in applyD_date[y]["index"]) {
            applyData.push(applyD_date[y]["data"][applyD_date[y]["index"][x]]);
          }
        }
      }
      if (applyD_chnNumber.length > 0) {
        for (let y = 0; y < applyD_chnNumber.length; y++) {
          if (x in applyD_chnNumber[y]["index"]) {
            applyData.push(applyD_chnNumber[y]["data"][applyD_chnNumber[y]["index"][x]]);
          }
        }
      }
      if (applyD_chnWeek2.length > 0) {
        for (let y = 0; y < applyD_chnWeek2.length; y++) {
          if (x in applyD_chnWeek2[y]["index"]) {
            applyData.push(applyD_chnWeek2[y]["data"][applyD_chnWeek2[y]["index"][x]]);
          }
        }
      }
      if (applyD_chnWeek3.length > 0) {
        for (let y = 0; y < applyD_chnWeek3.length; y++) {
          if (x in applyD_chnWeek3[y]["index"]) {
            applyData.push(applyD_chnWeek3[y]["data"][applyD_chnWeek3[y]["index"][x]]);
          }
        }
      }
      if (applyD_other.length > 0) {
        for (let y = 0; y < applyD_other.length; y++) {
          if (x in applyD_other[y]["index"]) {
            applyData.push(applyD_other[y]["data"][applyD_other[y]["index"][x]]);
          }
        }
      }
    }
    return applyData;
  },
  getLenS: function (indexArr, rsd) {
    let s = 0;
    for (let j = 0; j < indexArr.length; j++) {
      if (indexArr[j] <= rsd) {
        s++;
      } else {
        break;
      }
    }
    return s;
  },
  getDataIndex: function (csLen, asLen, indexArr) {
    let obj = {};
    let num = Math.floor(asLen / csLen);
    let rsd = asLen % csLen;
    let sum = 0;
    if (num > 0) {
      for (let i = 1; i <= num; i++) {
        for (let j = 0; j < indexArr.length; j++) {
          obj[indexArr[j] + (i - 1) * csLen] = sum;
          sum++;
        }
      }
      for (let a = 0; a < indexArr.length; a++) {
        if (indexArr[a] <= rsd) {
          obj[indexArr[a] + csLen * num] = sum;
          sum++;
        } else {
          break;
        }
      }
    } else {
      for (let a = 0; a < indexArr.length; a++) {
        if (indexArr[a] <= rsd) {
          obj[indexArr[a]] = sum;
          sum++;
        } else {
          break;
        }
      }
    }
    return obj;
  },
  getDataByType: function (data, len, direction, type, dataType) {
    let _this = this;
    let applyData = [];
    if (type == "0") {
      //复制单元格
      if (direction == "up" || direction == "left") {
        data.reverse();
      }
      applyData = _this.FillCopy(data, len);
    } else if (type == "1") {
      //填充序列
      if (dataType == "number") {
        //数据类型是 数字
        applyData = _this.FillSeries(data, len, direction);
      } else if (dataType == "extendNumber") {
        //扩展数字
        if (data.length == 1) {
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }
          applyData = _this.FillExtendNumber(data, len, step);
        } else {
          let dataNumArr = [];
          for (let i = 0; i < data.length; i++) {
            let txt = data[i]["m"];
            dataNumArr.push(Number(_this.isExtendNumber(txt)[1]));
          }
          if (direction == "up" || direction == "left") {
            data.reverse();
            dataNumArr.reverse();
          }
          if (_this.isEqualDiff(dataNumArr)) {
            //等差数列，以等差为step
            let step = dataNumArr[1] - dataNumArr[0];
            applyData = _this.FillExtendNumber(data, len, step);
          } else {
            //不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else if (dataType == "date") {
        //数据类型是 日期
        if (data.length == 1) {
          //以一天为step
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }
          applyData = _this.FillDays(data, len, step);
        } else {
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          let judgeDate = _this.judgeDate(data);
          if (judgeDate[0] && judgeDate[3]) {
            //日一样，月差为等差数列，以月差为step
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
            applyData = _this.FillMonths(data, len, step);
          } else if (!judgeDate[0] && judgeDate[2]) {
            //日不一样，日差为等差数列，以日差为step
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
            applyData = _this.FillDays(data, len, step);
          } else {
            //其它，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else if (dataType == "chnNumber") {
        //数据类型是 中文小写数字
        if (data.length == 1) {
          if (data[0]["m"] == "日" || _this.ChineseToNumber(data[0]["m"]) < 7) {
            //数字小于7，以周一~周日序列填充
            let step;
            if (direction == "down" || direction == "right") {
              step = 1;
            } else if (direction == "up" || direction == "left") {
              step = -1;
            }
            applyData = _this.FillChnWeek(data, len, step);
          } else {
            //数字大于7，以中文小写数字序列填充
            let step;
            if (direction == "down" || direction == "right") {
              step = 1;
            } else if (direction == "up" || direction == "left") {
              step = -1;
            }
            applyData = _this.FillChnNumber(data, len, step);
          }
        } else {
          let hasweek = false;
          for (let i = 0; i < data.length; i++) {
            if (data[i]["m"] == "日") {
              hasweek = true;
              break;
            }
          }
          let dataNumArr = [];
          let weekIndex = 0;
          for (let i = 0; i < data.length; i++) {
            if (data[i]["m"] == "日") {
              if (i == 0) {
                dataNumArr.push(0);
              } else {
                weekIndex++;
                dataNumArr.push(weekIndex * 7);
              }
            } else if (hasweek && _this.ChineseToNumber(data[i]["m"]) > 0 && _this.ChineseToNumber(data[i]["m"]) < 7) {
              dataNumArr.push(_this.ChineseToNumber(data[i]["m"]) + weekIndex * 7);
            } else {
              dataNumArr.push(_this.ChineseToNumber(data[i]["m"]));
            }
          }
          if (direction == "up" || direction == "left") {
            data.reverse();
            dataNumArr.reverse();
          }
          if (_this.isEqualDiff(dataNumArr)) {
            if (hasweek || dataNumArr[dataNumArr.length - 1] < 6 && dataNumArr[0] > 0 || dataNumArr[0] < 6 && dataNumArr[dataNumArr.length - 1] > 0) {
              //以周一~周日序列填充
              let step = dataNumArr[1] - dataNumArr[0];
              applyData = _this.FillChnWeek(data, len, step);
            } else {
              //以中文小写数字序列填充
              let step = dataNumArr[1] - dataNumArr[0];
              applyData = _this.FillChnNumber(data, len, step);
            }
          } else {
            //不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else if (dataType == "chnWeek2") {
        //周一~周日
        if (data.length == 1) {
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }
          applyData = _this.FillChnWeek2(data, len, step);
        } else {
          let dataNumArr = [];
          let weekIndex = 0;
          for (let i = 0; i < data.length; i++) {
            let lastTxt = data[i]["m"].substr(data[i]["m"].length - 1, 1);
            if (data[i]["m"] == "周日") {
              if (i == 0) {
                dataNumArr.push(0);
              } else {
                weekIndex++;
                dataNumArr.push(weekIndex * 7);
              }
            } else {
              dataNumArr.push(_this.ChineseToNumber(lastTxt) + weekIndex * 7);
            }
          }
          if (direction == "up" || direction == "left") {
            data.reverse();
            dataNumArr.reverse();
          }
          if (_this.isEqualDiff(dataNumArr)) {
            //等差数列，以等差为step
            let step = dataNumArr[1] - dataNumArr[0];
            applyData = _this.FillChnWeek2(data, len, step);
          } else {
            //不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else if (dataType == "chnWeek3") {
        //星期一~星期日
        if (data.length == 1) {
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }
          applyData = _this.FillChnWeek3(data, len, step);
        } else {
          let dataNumArr = [];
          let weekIndex = 0;
          for (let i = 0; i < data.length; i++) {
            let lastTxt = data[i]["m"].substr(data[i]["m"].length - 1, 1);
            if (data[i]["m"] == "星期日") {
              if (i == 0) {
                dataNumArr.push(0);
              } else {
                weekIndex++;
                dataNumArr.push(weekIndex * 7);
              }
            } else {
              dataNumArr.push(_this.ChineseToNumber(lastTxt) + weekIndex * 7);
            }
          }
          if (direction == "up" || direction == "left") {
            data.reverse();
            dataNumArr.reverse();
          }
          if (_this.isEqualDiff(dataNumArr)) {
            //等差数列，以等差为step
            let step = dataNumArr[1] - dataNumArr[0];
            applyData = _this.FillChnWeek3(data, len, step);
          } else {
            //不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else {
        //数据类型是 其它
        if (direction == "up" || direction == "left") {
          data.reverse();
        }
        applyData = _this.FillCopy(data, len);
      }
    } else if (type == "2") {
      //仅填充格式
      if (direction == "up" || direction == "left") {
        data.reverse();
      }
      applyData = _this.FillOnlyFormat(data, len);
    } else if (type == "3") {
      //不带格式填充
      let dataArr = _this.getDataByType(data, len, direction, "1", dataType);
      applyData = _this.FillWithoutFormat(dataArr);
    } else if (type == "4") {
      //以天数填充
      if (data.length == 1) {
        //以一天为step
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }
        applyData = _this.FillDays(data, len, step);
      } else if (data.length == 2) {
        //以日差为step
        if (direction == "up" || direction == "left") {
          data.reverse();
        }
        let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
        applyData = _this.FillDays(data, len, step);
      } else {
        if (direction == "up" || direction == "left") {
          data.reverse();
        }
        let judgeDate = _this.judgeDate(data);
        if (judgeDate[0] && judgeDate[3]) {
          //日一样，且月差为等差数列，以月差为step
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
          applyData = _this.FillMonths(data, len, step);
        } else if (!judgeDate[0] && judgeDate[2]) {
          //日不一样，且日差为等差数列，以日差为step
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
          applyData = _this.FillDays(data, len, step);
        } else {
          //日差不是等差数列，复制数据
          applyData = _this.FillCopy(data, len);
        }
      }
    } else if (type == "5") {
      //以工作日填充
      if (data.length == 1) {
        //以一天为step（若那天为休息日，则跳过）
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }
        let newLen = Math.round(len * 1.5);
        for (let i = 1; i <= newLen; i++) {
          let d = $.extend(true, {}, data[0]);
          let day = dayjs(d["m"]).add(i, "days").day();
          if (day == 0 || day == 6) {
            continue;
          }
          let date = dayjs(d["m"]).add(step * i, "days").format("YYYY-MM-DD");
          d["m"] = date;
          d["v"] = genarate(date)[2];
          applyData.push(d);
          if (applyData.length == len) {
            break;
          }
        }
      } else if (data.length == 2) {
        if (dayjs(data[1]["m"]).date() == dayjs(data[0]["m"]).date() && dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months") != 0) {
          //日一样，且月差大于一月，以月差为step（若那天为休息日，则向前取最近的工作日）
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);
            let day = dayjs(data[data.length - 1]).add(step * i, "months").day(),
              date;
            if (day == 0) {
              date = dayjs(data[data.length - 1]).add(step * i, "months").subtract(2, "days").format("YYYY-MM-DD");
            } else if (day == 6) {
              date = dayjs(data[data.length - 1]).add(step * i, "months").subtract(1, "days").format("YYYY-MM-DD");
            } else {
              date = dayjs(data[data.length - 1]).add(step * i, "months").format("YYYY-MM-DD");
            }
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        } else {
          //日不一样
          if (Math.abs(dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]))) > 7) {
            //若日差大于7天，以一月为step（若那天是休息日，则向前取最近的工作日）
            let step_month;
            if (direction == "down" || direction == "right") {
              step_month = 1;
            } else if (direction == "up" || direction == "left") {
              step_month = -1;
              data.reverse();
            }
            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);
              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"]).add(step_month * num, "months").diff(dayjs(d["m"]), "days");
              }
              let day = dayjs(d["m"]).add(step, "days").day(),
                date;
              if (day == 0) {
                date = dayjs(d["m"]).add(step, "days").subtract(2, "days").format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(d["m"]).add(step, "days").subtract(1, "days").format("YYYY-MM-DD");
              } else {
                date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              }
              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          } else {
            //若日差小于等于7天，以7天为step（若那天是休息日，则向前取最近的工作日）
            let step_day;
            if (direction == "down" || direction == "right") {
              step_day = 7;
            } else if (direction == "up" || direction == "left") {
              step_day = -7;
              data.reverse();
            }
            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);
              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"]).add(step_day * num, "days").diff(dayjs(d["m"]), "days");
              }
              let day = dayjs(d["m"]).add(step, "days").day(),
                date;
              if (day == 0) {
                date = dayjs(d["m"]).add(step, "days").subtract(2, "days").format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(d["m"]).add(step, "days").subtract(1, "days").format("YYYY-MM-DD");
              } else {
                date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              }
              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          }
        }
      } else {
        let judgeDate = _this.judgeDate(data);
        if (judgeDate[0] && judgeDate[3]) {
          //日一样，且月差为等差数列，以月差为step（若那天为休息日，则向前取最近的工作日）
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);
            let day = dayjs(data[data.length - 1]["m"]).add(step * i, "months").day(),
              date;
            if (day == 0) {
              date = dayjs(data[data.length - 1]["m"]).add(step * i, "months").subtract(2, "days").format("YYYY-MM-DD");
            } else if (day == 6) {
              date = dayjs(data[data.length - 1]["m"]).add(step * i, "months").subtract(1, "days").format("YYYY-MM-DD");
            } else {
              date = dayjs(data[data.length - 1]["m"]).add(step * i, "months").format("YYYY-MM-DD");
            }
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        } else if (!judgeDate[0] && judgeDate[2]) {
          //日不一样，且日差为等差数列
          if (Math.abs(dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]))) > 7) {
            //若日差大于7天，以一月为step（若那天是休息日，则向前取最近的工作日）
            let step_month;
            if (direction == "down" || direction == "right") {
              step_month = 1;
            } else if (direction == "up" || direction == "left") {
              step_month = -1;
              data.reverse();
            }
            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);
              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"]).add(step_month * num, "months").diff(dayjs(d["m"]), "days");
              }
              let day = dayjs(d["m"]).add(step, "days").day(),
                date;
              if (day == 0) {
                date = dayjs(d["m"]).add(step, "days").subtract(2, "days").format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(d["m"]).add(step, "days").subtract(1, "days").format("YYYY-MM-DD");
              } else {
                date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              }
              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          } else {
            //若日差小于等于7天，以7天为step（若那天是休息日，则向前取最近的工作日）
            let step_day;
            if (direction == "down" || direction == "right") {
              step_day = 7;
            } else if (direction == "up" || direction == "left") {
              step_day = -7;
              data.reverse();
            }
            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);
              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"]).add(step_day * num, "days").diff(dayjs(d["m"]), "days");
              }
              let day = dayjs(d["m"]).add(step, "days").day(),
                date;
              if (day == 0) {
                date = dayjs(d["m"]).add(step, "days").subtract(2, "days").format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(d["m"]).add(step, "days").subtract(1, "days").format("YYYY-MM-DD");
              } else {
                date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              }
              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          }
        } else {
          //日差不是等差数列，复制数据
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          applyData = _this.FillCopy(data, len);
        }
      }
    } else if (type == "6") {
      //以月填充
      if (data.length == 1) {
        //以一月为step
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }
        applyData = _this.FillMonths(data, len, step);
      } else if (data.length == 2) {
        if (dayjs(data[1]["m"]).date() == dayjs(data[0]["m"]).date() && dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months") != 0) {
          //日一样，且月差大于一月，以月差为step
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
          applyData = _this.FillMonths(data, len, step);
        } else {
          //以一月为step
          let step_month;
          if (direction == "down" || direction == "right") {
            step_month = 1;
          } else if (direction == "up" || direction == "left") {
            step_month = -1;
            data.reverse();
          }
          let step; //以数组第一个为对比
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);
            let num = Math.ceil(i / data.length);
            if (index == 0) {
              step = dayjs(d["m"]).add(step_month * num, "months").diff(dayjs(d["m"]), "days");
            }
            let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        }
      } else {
        let judgeDate = _this.judgeDate(data);
        if (judgeDate[0] && judgeDate[3]) {
          //日一样，且月差为等差数列，以月差为step
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
          applyData = _this.FillMonths(data, len, step);
        } else if (!judgeDate[0] && judgeDate[2]) {
          //日不一样，且日差为等差数列，以一月为step
          let step_month;
          if (direction == "down" || direction == "right") {
            step_month = 1;
          } else if (direction == "up" || direction == "left") {
            step_month = -1;
            data.reverse();
          }
          let step; //以数组第一个为对比
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);
            let num = Math.ceil(i / data.length);
            if (index == 0) {
              step = dayjs(d["m"]).add(step_month * num, "months").diff(dayjs(d["m"]), "days");
            }
            let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        } else {
          //日差不是等差数列，复制数据
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          applyData = _this.FillCopy(data, len);
        }
      }
    } else if (type == "7") {
      //以年填充
      if (data.length == 1) {
        //以一年为step
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }
        applyData = _this.FillYears(data, len, step);
      } else if (data.length == 2) {
        if (dayjs(data[1]["m"]).date() == dayjs(data[0]["m"]).date() && dayjs(data[1]["m"]).month() == dayjs(data[0]["m"]).month() && dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years") != 0) {
          //日月一样，且年差大于一年，以年差为step
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years");
          applyData = _this.FillYears(data, len, step);
        } else {
          //以一年为step
          let step_year;
          if (direction == "down" || direction == "right") {
            step_year = 1;
          } else if (direction == "up" || direction == "left") {
            step_year = -1;
            data.reverse();
          }
          let step; //以数组第一个为对比
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);
            let num = Math.ceil(i / data.length);
            if (index == 0) {
              step = dayjs(d["m"]).add(step_year * num, "years").diff(dayjs(d["m"]), "days");
            }
            let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        }
      } else {
        let judgeDate = _this.judgeDate(data);
        if (judgeDate[0] && judgeDate[1] && judgeDate[4]) {
          //日月一样，且年差为等差数列，以年差为step
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years");
          applyData = _this.FillYears(data, len, step);
        } else if (judgeDate[0] && judgeDate[3] || judgeDate[2]) {
          //日一样且月差为等差数列，或天差为等差数列，以一年为step
          let step_year;
          if (direction == "down" || direction == "right") {
            step_year = 1;
          } else if (direction == "up" || direction == "left") {
            step_year = -1;
            data.reverse();
          }
          let step; //以数组第一个为对比
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);
            let num = Math.ceil(i / data.length);
            if (index == 0) {
              step = dayjs(d["m"]).add(step_year * num, "years").diff(dayjs(d["m"]), "days");
            }
            let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        } else {
          //日差不是等差数列，复制数据
          if (direction == "up" || direction == "left") {
            data.reverse();
          }
          applyData = _this.FillCopy(data, len);
        }
      }
    } else if (type == "8") {
      //以中文小写数字序列填充
      if (data.length == 1) {
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }
        applyData = _this.FillChnNumber(data, len, step);
      } else {
        let dataNumArr = [];
        for (let i = 0; i < data.length; i++) {
          dataNumArr.push(_this.ChineseToNumber(data[i]["m"]));
        }
        if (direction == "up" || direction == "left") {
          data.reverse();
          dataNumArr.reverse();
        }
        if (_this.isEqualDiff(dataNumArr)) {
          let step = dataNumArr[1] - dataNumArr[0];
          applyData = _this.FillChnNumber(data, len, step);
        } else {
          //不是等差数列，复制数据
          applyData = _this.FillCopy(data, len);
        }
      }
    }
    return applyData;
  }
};
export default coreModule;