import { formatNumericCell } from "../../../utils/util.js";
import { getBorderInfoCompute } from "../../../global/border";
import { isRealNum } from "../../../global/validate";
import {  genarate } from "../../../global/format";
import { jfrefreshgrid } from "../../../global/refresh";
import editor from "../../../global/editor";
import formula from "../../../global/formula";
import conditionformat from "../../conditionformat";
import { selectHightlightShow } from "../../select";
import { getCurrentFile } from "../../../utils/storeAccess.js";
import Store from "../../../store";
import { GENERAL_NUMBER_CT } from "../../../utils/constants.js";

import { getDataByType0 } from './coreSub/getDataByType0.js';
import { getDataByType1 } from './coreSub/getDataByType1.js';
import { getDataByType2 } from './coreSub/getDataByType2.js';
import { getDataByType3 } from './coreSub/getDataByType3.js';
import { getDataByType4 } from './coreSub/getDataByType4.js';
import { getDataByType5 } from './coreSub/getDataByType5.js';
import { getDataByType6 } from './coreSub/getDataByType6.js';
import { getDataByType7 } from './coreSub/getDataByType7.js';
import { getDataByType8 } from './coreSub/getDataByType8.js';

const coreModule = {
  copyRange: {},
  applyRange: {},
  applyType: null,
  direction: null,
    update: function () {
    let _this = this;
    if (Store.allowEdit === false) {
      return;
    }
    let d = editor.deepCopyFlowData(Store.sheetData);
    let file = getCurrentFile();
    let cfg = structuredClone(Store.config);
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
                formatNumericCell(cell, genarate);
                cell.ct = cell.ct || GENERAL_NUMBER_CT;
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
                formatNumericCell(cell, genarate);
                cell.ct = GENERAL_NUMBER_CT;
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
                formatNumericCell(cell, genarate);
                cell.ct = GENERAL_NUMBER_CT;
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
                formatNumericCell(cell, genarate);
                cell.ct = GENERAL_NUMBER_CT;
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
    let cdformat = structuredClone(file["luckysheet_conditionformat_save"]);
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
    if (copyD_number) {
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
    if (copyD_extendNumber) {
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
    if (copyD_date) {
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
    if (copyD_chnNumber) {
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
    if (copyD_chnWeek2) {
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
    if (copyD_chnWeek3) {
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
    if (copyD_other) {
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
    if (type == "0") { return getDataByType0(_this, data, len, direction, dataType); }
    if (type == "1") { return getDataByType1(_this, data, len, direction, dataType); }
    if (type == "2") { return getDataByType2(_this, data, len, direction, dataType); }
    if (type == "3") { return getDataByType3(_this, data, len, direction, dataType); }
    if (type == "4") { return getDataByType4(_this, data, len, direction, dataType); }
    if (type == "5") { return getDataByType5(_this, data, len, direction, dataType); }
    if (type == "6") { return getDataByType6(_this, data, len, direction, dataType); }
    if (type == "7") { return getDataByType7(_this, data, len, direction, dataType); }
    if (type == "8") { return getDataByType8(_this, data, len, direction, dataType); }
    return [];
  }
};

export default coreModule;
