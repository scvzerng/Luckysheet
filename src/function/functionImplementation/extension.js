import luckysheetConfigsetting from "../../controllers/luckysheetConfigsetting";
import { getCurrentFile } from "../../utils/storeAccess.js";
import formula from "../../global/formula";
import func_methods from "../../global/func_methods";
import editor from "../../global/editor";
import {  valueIsError } from "../../global/validate";
import { jfrefreshgrid, jfrefreshgridall } from "../../global/refresh";
import {  datagridgrowth  } from "../../global/getdata";
import Store from "../../store";
import { getAirTable, companyTargetData, companyTargetData10, companyTargetData11, companyTargetData12, excelToLuckyArray, excelToArray, askAIData } from "../../demoData/getTargetData";
import { setcellvalue } from "../../global/setdata";

//公式函数计算
const extensionFunctions = {
  "GET_TARGET": function () {
    try {
      var luckysheetCurrentIndex = window.luckysheetCurrentIndex;
      var currentSheetIndex = Store.currentSheetIndex;
      if (luckysheetCurrentIndex !== currentSheetIndex) {
        return;
      }
      var startRow = window.luckysheetCurrentRow;
      var startColumn = window.luckysheetCurrentColumn;

      // const {row, column} = Store.selections[0];
      // const startRow = row[0]
      // const endRow = row[1]
      // const startColumn = column[0]
      // const endColumn = column[1]
      var cell_fp = window.luckysheetCurrentFunction;
      setTimeout(() => {
        var d = editor.deepCopyFlowData(Store.sheetData);
        const target = excelToLuckyArray(companyTargetData);
        const rowheight = startRow + target.length;
        const colwidth = startColumn + target[0].length;
        if (rowheight >= d.length && colwidth >= d[0].length) {
          d = datagridgrowth(d, rowheight - d.length + 1, colwidth - d[0].length + 1);
        } else if (rowheight >= d.length) {
          d = datagridgrowth(d, rowheight - d.length + 1, 0);
        } else if (colwidth >= d[0].length) {
          d = datagridgrowth(d, 0, colwidth - d[0].length + 1);
        }
        target.forEach((row, r) => {
          row.forEach((cell, c) => {
            // d[startRow+r][startColumn+c] = Object.assign({},d[startRow+r][startColumn+c],cell)
            setcellvalue(startRow + r, startColumn + c, d, cell);
          });
        });
        d[startRow][startColumn].f = cell_fp;
        delete d[startRow][startColumn].m;

        // 切换到包含远程公式的页之后300ms内又切换到其他页，不需要刷新，否则会导致公式页的数据刷到当前页
        if (currentSheetIndex === Store.currentSheetIndex) {
          let file = getCurrentFile();
          file.row = d.length;
          file.data = d;
          jfrefreshgridall(d[0].length, d.length, d, null, Store.selections, "datachangeAll", undefined, undefined);

          // jfrefreshgrid(d, [{"row": [startRow, startRow+target.length], "column": [startColumn, startColumn + target[0].length]}]);
        } else {
          let file = getCurrentFile();
          file.data = d;
        }
      }, 300);
      return "loading...";
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "GET_AIRTABLE_DATA": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      var luckysheetCurrentIndex = window.luckysheetCurrentIndex;
      var currentSheetIndex = Store.currentSheetIndex;
      if (luckysheetCurrentIndex !== currentSheetIndex) {
        return;
      }
      var startRow = window.luckysheetCurrentRow;
      var startColumn = window.luckysheetCurrentColumn;

      // airtable url
      const url = func_methods.getFirstValue(arguments[0]);
      // 表示要排序的列的数字
      const sort_index = func_methods.getFirstValue(arguments[1]);
      // 表示所需排序顺序的数字；1表示升序（默认），0表示降序
      const sort_order = func_methods.getFirstValue(arguments[2]);
      // const {row, column} = Store.selections[0];
      // const startRow = row[0]
      // const endRow = row[1]
      // const startColumn = column[0]
      // const endColumn = column[1]
      var cell_fp = window.luckysheetCurrentFunction;
      var d = editor.deepCopyFlowData(Store.sheetData);
      getAirTable(url, sort_index, sort_order, data => {
        const rowheight = startRow + data.length;
        const colwidth = startColumn + data[0].length;
        if (rowheight >= d.length && colwidth >= d[0].length) {
          d = datagridgrowth(d, rowheight - d.length + 1, colwidth - d[0].length + 1);
        } else if (rowheight >= d.length) {
          d = datagridgrowth(d, rowheight - d.length + 1, 0);
        } else if (colwidth >= d[0].length) {
          d = datagridgrowth(d, 0, colwidth - d[0].length + 1);
        }
        data.forEach((row, r) => {
          row.forEach((cell, c) => {
            // d[startRow+r][startColumn+c] = Object.assign({},d[startRow+r][startColumn+c],{v:cell})
            setcellvalue(startRow + r, startColumn + c, d, cell);
          });
        });
        d[startRow][startColumn].f = cell_fp;
        delete d[startRow][startColumn].m;

        // 切换到包含远程公式的页之后300ms内又切换到其他页，不需要刷新，否则会导致公式页的数据刷到当前页
        if (currentSheetIndex === Store.currentSheetIndex) {
          let file = getCurrentFile();
          file.row = d.length;
          file.data = d;
          jfrefreshgridall(d[0].length, d.length, d, null, Store.selections, "datachangeAll", undefined, undefined);
          // jfrefreshgrid(d, [{"row": [startRow, startRow+data.length], "column": [startColumn, startColumn + data[0].length]}]);
        } else {
          let file = getCurrentFile();
          file.data = d;
        }
      }, e => {
        var err = e;
        err = formula.errorInfo(err);
        return [formula.error.v, err];
      });
      return "loading...";
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ASK_AI": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      let luckysheetCurrentIndex = window.luckysheetCurrentIndex;
      let currentSheetIndex = Store.currentSheetIndex;
      if (luckysheetCurrentIndex !== currentSheetIndex) {
        return;
      }
      var startRow = window.luckysheetCurrentRow;
      var startColumn = window.luckysheetCurrentColumn;
      // const {row, column} = Store.selections[0];
      // const startRow = row[0]
      // const endRow = row[1]
      // const startColumn = column[0]
      // const endColumn = column[1]
      var cell_fp = window.luckysheetCurrentFunction;
      var args = arguments;
      var targetText = func_methods.getFirstValue(arguments[0]);
      var rangeData;
      if (args[1]) {
        rangeData = formula.getRangeArrayTwo(args[1].data);
      } else {
        // 默认是target数据
        rangeData = excelToArray(companyTargetData);
      }
      const companyTarget = excelToArray(companyTargetData);
      let resultTable = askAIData(rangeData, companyTarget);

      // 没有传数据，默认为target数据
      if (!args[1]) {
        if (targetText.indexOf('10月') !== -1) {
          resultTable = excelToLuckyArray(companyTargetData10);
        } else if (targetText.indexOf('11月') !== -1) {
          resultTable = excelToLuckyArray(companyTargetData11);
        } else if (targetText.indexOf('12月') !== -1) {
          resultTable = excelToLuckyArray(companyTargetData12);
        } else {
          resultTable = excelToLuckyArray(companyTargetData11);
        }
      }
      setTimeout(() => {
        var d = editor.deepCopyFlowData(Store.sheetData);
        const rowheight = startRow + resultTable.length;
        const colwidth = startColumn + resultTable[0].length;
        if (rowheight >= d.length && colwidth >= d[0].length) {
          d = datagridgrowth(d, rowheight - d.length + 1, colwidth - d[0].length + 1);
        } else if (rowheight >= d.length) {
          d = datagridgrowth(d, rowheight - d.length + 1, 0);
        } else if (colwidth >= d[0].length) {
          d = datagridgrowth(d, 0, colwidth - d[0].length + 1);
        }
        resultTable.forEach((row, r) => {
          row.forEach((cell, c) => {
            // d[startRow+r][startColumn+c] = Object.assign({},d[startRow+r][startColumn+c],cell)
            setcellvalue(startRow + r, startColumn + c, d, cell);
          });
        });
        d[startRow][startColumn].f = cell_fp;
        delete d[startRow][startColumn].m;

        // 切换到包含远程公式的页之后300ms内又切换到其他页，不需要刷新，否则会导致公式页的数据刷到当前页
        if (currentSheetIndex === Store.currentSheetIndex) {
          let file = getCurrentFile();
          file.row = d.length;
          file.data = d;
          jfrefreshgridall(d[0].length, d.length, d, null, Store.selections, "datachangeAll", undefined, undefined);

          // jfrefreshgrid(d, [{"row": [startRow, startRow+resultTable.length], "column": [startColumn, startColumn + resultTable[0].length]}]);
        } else {
          let file = getCurrentFile();
          file.data = d;
        }
      }, 300);
      return "loading...";
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "EVALUATE": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      var cell_r = window.luckysheetCurrentRow;
      var cell_c = window.luckysheetCurrentColumn;
      var sheetindex_now = window.luckysheetCurrentIndex;
      //公式文本
      var strtext = func_methods.getFirstValue(arguments[0]).toString();
      if (valueIsError(strtext)) {
        return strtext;
      }
      //在文本公式前面添加=
      if (strtext.trim().indexOf('=') != 0) {
        strtext = '=' + strtext;
      }
      //console.log(strtext);
      var result_this = formula.execstringformula(strtext, cell_r, cell_c, sheetindex_now);
      return result_this[1];
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "REMOTE": function () {
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }
    try {
      const cellRow = window.luckysheetCurrentRow;
      const cellColumn = window.luckysheetCurrentColumn;
      const cellFunction = window.luckysheetCurrentFunction;
      const remoteFunction = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(remoteFunction)) {
        return remoteFunction;
      }
      luckysheetConfigsetting.remoteFunction(remoteFunction, data => {
        const flowData = editor.deepCopyFlowData(Store.sheetData);
        formula.execFunctionGroup(cellRow, cellColumn, data);
        flowData[cellRow][cellColumn] = {
          "v": data,
          "f": cellFunction
        };
        jfrefreshgrid(flowData, [{
          "row": [cellRow, cellRow],
          "column": [cellColumn, cellColumn]
        }]);
      });
      return "Loading...";
    } catch (e) {
      console.log(e);
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default extensionFunctions;