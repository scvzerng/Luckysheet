import {  getSheetIndex,  getluckysheetfile } from "../../../methods/get";
import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isRealNum,  isRealNull,  valueIsError } from "../../../global/validate";
import {  getObjType,  chatatABC } from "../../../utils/util";
import Store from "../../../store";

const lookupReference = {
  "ADDRESS": function () {
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
      //行号
      var row_num = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(row_num)) {
        return row_num;
      }
      if (!isRealNum(row_num)) {
        return formula.error.v;
      }
      row_num = parseInt(row_num);

      //列标
      var column_num = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(column_num)) {
        return column_num;
      }
      if (!isRealNum(column_num)) {
        return formula.error.v;
      }
      column_num = parseInt(column_num);

      //引用类型
      var abs_num = 1;
      if (arguments.length >= 3) {
        abs_num = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(abs_num)) {
          return abs_num;
        }
        if (!isRealNum(abs_num)) {
          return formula.error.v;
        }
        abs_num = parseInt(abs_num);
      }

      //A1标记形式 -- R1C1标记形式
      var A1 = true;
      if (arguments.length >= 4) {
        A1 = func_methods.getCellBoolen(arguments[3]);
        if (valueIsError(A1)) {
          return A1;
        }
      }
      if (row_num <= 0 || column_num <= 0) {
        return formula.error.v;
      }
      if ([1, 2, 3, 4].indexOf(abs_num) == -1) {
        return formula.error.v;
      }

      //计算
      var str;
      if (A1) {
        column_num = chatatABC(column_num - 1);
        switch (abs_num) {
          case 1:
            str = "$" + column_num + "$" + row_num;
            break;
          case 2:
            str = column_num + "$" + row_num;
            break;
          case 3:
            str = "$" + column_num + row_num;
            break;
          case 4:
            str = column_num + row_num;
            break;
        }
      } else {
        switch (abs_num) {
          case 1:
            str = "R" + row_num + "C" + column_num;
            break;
          case 2:
            str = "R" + row_num + "C[" + column_num + "]";
            break;
          case 3:
            str = "R[" + row_num + "]" + "C" + column_num;
            break;
          case 4:
            str = "R[" + row_num + "]" + "C[" + column_num + "]";
            break;
        }
      }
      if (arguments.length == 5) {
        //工作表名称
        var sheet_text = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(sheet_text)) {
          return sheet_text;
        }
        return sheet_text + "!" + str;
      } else {
        return str;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "INDIRECT": function () {
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
      //以带引号的字符串形式提供的单元格引用
      var ref_text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(ref_text)) {
        return ref_text;
      }

      //A1标记形式 -- R1C1标记形式
      var A1 = true;
      if (arguments.length == 2) {
        A1 = func_methods.getCellBoolen(arguments[1]);
        if (valueIsError(A1)) {
          return A1;
        }
      }
      let luckysheetfile = getluckysheetfile();
      let index = getSheetIndex(Store.calculateSheetIndex);
      let currentSheet = luckysheetfile[index];
      let sheetdata = currentSheet.data;
      // sheetdata = Store.sheetData;
      // if (formula.execFunctionGroupData != null) {
      //     sheetdata = formula.execFunctionGroupData;
      // }

      //计算
      if (A1) {} else {}
      if (formula.iscelldata(ref_text)) {
        let cellrange = formula.getcellrange(ref_text);
        let row = cellrange.row[0],
          col = cellrange.column[0];
        if (row < 0 || row >= sheetdata.length || col < 0 || col >= sheetdata[0].length) {
          return formula.error.r;
        }
        if (sheetdata[row][col] == null || isRealNull(sheetdata[row][col].v)) {
          return 0;
        }
        let value = sheetdata[row][col].v;
        if (formula.execFunctionGlobalData != null) {
          let ef = formula.execFunctionGlobalData[row + "_" + col + "_" + Store.calculateSheetIndex];
          if (ef != null) {
            value = ef.v;
          }
        }
        let retAll = {
          "sheetName": currentSheet.name,
          "startCell": ref_text,
          "rowl": row,
          "coll": col,
          "data": value
        };
        return retAll;
      } else {
        return formula.error.r;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ROW": function () {
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
      if (arguments.length == 1) {
        //要返回其行号的单元格
        var reference;
        if (getObjType(arguments[0]) == "array") {
          return formula.error.v;
        } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
          reference = arguments[0].startCell;
        } else {
          reference = arguments[0];
        }
        if (formula.iscelldata(reference)) {
          var cellrange = formula.getcellrange(reference);
          return cellrange["row"][0] + 1;
        } else {
          return formula.error.v;
        }
      } else {
        return window.luckysheetCurrentRow + 1;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ROWS": function () {
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
      //要返回其行数的范围
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array") {
          return arguments[0].length;
        } else {
          return 1;
        }
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        return arguments[0].rowl;
      } else {
        return 1;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COLUMN": function () {
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
      if (arguments.length == 1) {
        //要返回其列号的单元格
        var reference;
        if (getObjType(arguments[0]) == "array") {
          return formula.error.v;
        } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
          reference = arguments[0].startCell;
        } else {
          reference = arguments[0];
        }
        if (formula.iscelldata(reference)) {
          var cellrange = formula.getcellrange(reference);
          return cellrange["column"][0] + 1;
        } else {
          return formula.error.v;
        }
      } else {
        return window.luckysheetCurrentColumn + 1;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COLUMNS": function () {
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
      //返回指定数组或范围中的列数
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array") {
          return arguments[0][0].length;
        } else {
          return arguments[0].length;
        }
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        return arguments[0].coll;
      } else {
        return 1;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
};

export default lookupReference;
