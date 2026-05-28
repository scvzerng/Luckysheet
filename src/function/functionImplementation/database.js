import formula from "../../global/formula";
import func_methods from "../../global/func_methods";
import {  isRealNum,  isRealNull,  valueIsError } from "../../global/validate";
import {  getObjType } from "../../utils/util";

//公式函数计算
const databaseFunctions = {
  "DGET": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      if (resultIndexes.length === 0) {
        return formula.error.v;
      }
      if (resultIndexes.length > 1) {
        return formula.error.nm;
      }
      return targetFields[resultIndexes[0]];
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DMAX": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var maxValue = targetFields[resultIndexes[0]];
      for (var i = 1; i < resultIndexes.length; i++) {
        if (maxValue < targetFields[resultIndexes[i]]) {
          maxValue = targetFields[resultIndexes[i]];
        }
      }
      return maxValue;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DMIN": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = findField(database, field);
        targetFields = rest(database[index]);
      } else {
        targetFields = rest(database[field]);
      }
      var minValue = targetFields[resultIndexes[0]];
      for (var i = 1; i < resultIndexes.length; i++) {
        if (minValue > targetFields[resultIndexes[i]]) {
          minValue = targetFields[resultIndexes[i]];
        }
      }
      return minValue;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DAVERAGE": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var sum = 0;
      for (var i = 0; i < resultIndexes.length; i++) {
        sum += targetFields[resultIndexes[i]];
      }
      return resultIndexes.length === 0 ? formula.error.d : sum / resultIndexes.length;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DCOUNT": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var targetValues = [];
      for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
      }
      return window.luckysheet_function.COUNT.f.apply(window.luckysheet_function.COUNT, targetValues);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DCOUNTA": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var targetValues = [];
      for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
      }
      return window.luckysheet_function.COUNTA.f.apply(window.luckysheet_function.COUNTA, targetValues);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DPRODUCT": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var targetValues = [];
      for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
      }
      targetValues = func_methods.compact(targetValues);
      var result = 1;
      for (i = 0; i < targetValues.length; i++) {
        result *= targetValues[i];
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DSTDEV": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var targetValues = [];
      for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
      }
      targetValues = func_methods.compact(targetValues);
      return window.luckysheet_function.STDEVA.f.apply(window.luckysheet_function.STDEVA, targetValues);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DSTDEVP": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var targetValues = [];
      for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
      }
      targetValues = func_methods.compact(targetValues);
      return window.luckysheet_function.STDEVP.f.apply(window.luckysheet_function.STDEVP, targetValues);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DSUM": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var targetValues = [];
      for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
      }
      targetValues = func_methods.compact(targetValues);
      var result = 0;
      for (i = 0; i < targetValues.length; i++) {
        result += targetValues[i];
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DVAR": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var targetValues = [];
      for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
      }
      targetValues = func_methods.compact(targetValues);
      return window.luckysheet_function.VAR_S.f.apply(window.luckysheet_function.VAR_S, targetValues);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DVARP": function () {
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
      //数据库的单元格区域
      var data_database = arguments[0];
      var database = [];
      if (getObjType(data_database) == "object" && data_database.startCell != null) {
        if (data_database.data == null) {
          return formula.error.v;
        }
        database = func_methods.getCellDataDyadicArr(data_database, "text");
      } else {
        return formula.error.v;
      }

      //列
      var field = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(field)) {
        return field;
      }
      if (isRealNull(field)) {
        return formula.error.v;
      }

      //条件的单元格区域
      var data_criteria = arguments[2];
      var criteria = [];
      if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.data == null) {
          return formula.error.v;
        }
        criteria = func_methods.getCellDataDyadicArr(data_criteria, "text");
      } else {
        return formula.error.v;
      }
      if (!isRealNum(field) && getObjType(field) !== "string") {
        return formula.error.v;
      }
      var resultIndexes = func_methods.findResultIndex(database, criteria);
      var targetFields = [];
      if (getObjType(field) === "string") {
        var index = func_methods.findField(database, field);
        targetFields = func_methods.rest(database[index]);
      } else {
        targetFields = func_methods.rest(database[field]);
      }
      var targetValues = [];
      for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
      }
      targetValues = func_methods.compact(targetValues);
      return window.luckysheet_function.VAR_P.f.apply(window.luckysheet_function.VAR_P, targetValues);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default databaseFunctions;