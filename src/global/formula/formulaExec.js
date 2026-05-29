import {  getObjType } from "../../utils/util";
import {  getSheetIndex,  getluckysheetfile  } from "../../methods/get";
import { setluckysheetfile } from "../../methods/set";
import {  isRealNull,  valueIsError,  isEditMode  } from "../validate";
import {  getcellFormula } from "../getdata";
import { setcellvalue } from "../setdata";
import editor from "../editor";
import tooltip from "../tooltip";
// import luckysheet_function from '../function/luckysheet_function';
// import functionlist from '../function/functionlist';
import {
    luckysheet_compareWith,
    luckysheet_getarraydata,
    luckysheet_getcelldata,
    luckysheet_parseData,
    luckysheet_getValue,
    luckysheet_indirect_check,
    luckysheet_indirect_check_return,
    luckysheet_offset_check,
    luckysheet_calcADPMM,
    luckysheet_getSpecialReference,
} from "../../function/func";
import Store from "../../store";
import locale from "../../locale/locale";

const formulaExec = {
        execFunctionGlobalData: {},

        execFunctionGroupForce: function(isForce) {
            if (isForce) {
                this.execFunctionGroup(undefined, undefined, undefined, undefined, undefined, true);
            } else {
                this.execFunctionGroup();
            }
        },

        execFunctionGroup: function(origin_r, origin_c, value, index, data, isForce = false) {
            let _this = this;

            if (data == null) {
                data = Store.flowdata;
            }

            if (!window.luckysheet_compareWith) {
                window.luckysheet_compareWith = luckysheet_compareWith;
                window.luckysheet_getarraydata = luckysheet_getarraydata;
                window.luckysheet_getcelldata = luckysheet_getcelldata;
                window.luckysheet_parseData = luckysheet_parseData;
                window.luckysheet_getValue = luckysheet_getValue;
                window.luckysheet_indirect_check = luckysheet_indirect_check;
                window.luckysheet_indirect_check_return = luckysheet_indirect_check_return;
                window.luckysheet_offset_check = luckysheet_offset_check;
                window.luckysheet_calcADPMM = luckysheet_calcADPMM;
                window.luckysheet_getSpecialReference = luckysheet_getSpecialReference;
            }

            if (_this.execFunctionGlobalData == null) {
                _this.execFunctionGlobalData = {};
            }
            // let luckysheetfile = getluckysheetfile();
            // let dynamicArray_compute = luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicArray_compute"] == null ? {} : luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicArray_compute"];

            if (index == null) {
                index = Store.currentSheetIndex;
            }

            if (value != null) {
                //此处setcellvalue 中this.execFunctionGroupData会保存想要更新的值，本函数结尾不要设为null,以备后续函数使用
                // setcellvalue(origin_r, origin_c, _this.execFunctionGroupData, value);
                let cellCache = [[{ v: null }]];
                setcellvalue(0, 0, cellCache, value);
                _this.execFunctionGlobalData[origin_r + "_" + origin_c + "_" + index] = cellCache[0][0];
            }

            //{ "r": r, "c": c, "index": index, "func": func}
            let calcChains = _this.getAllFunctionGroup(),
                formulaObjects = {};

            let sheets = getluckysheetfile();
            let sheetData = {};
            for (let i = 0; i < sheets.length; i++) {
                let sheet = sheets[i];
                sheetData[sheet.index] = sheet.data;
            }

            //把修改涉及的单元格存储为对象
            let updateValueOjects = {},
                updateValueArray = [];
            if (_this.execFunctionExist == null) {
                let key = "r" + origin_r + "c" + origin_c + "i" + index;
                updateValueOjects[key] = 1;
            } else {
                for (let x = 0; x < _this.execFunctionExist.length; x++) {
                    let cell = _this.execFunctionExist[x];
                    let key = "r" + cell.r + "c" + cell.c + "i" + cell.i;
                    updateValueOjects[key] = 1;
                }
            }

            let arrayMatchCache = {};
            let arrayMatch = function(formulaArray, formulaObjects, updateValueOjects, func) {
                for (let a = 0; a < formulaArray.length; a++) {
                    let range = formulaArray[a];
                    let cacheKey =
                        "r" +
                        range.row[0] +
                        "" +
                        range.row[1] +
                        "c" +
                        range.column[0] +
                        "" +
                        range.column[1] +
                        "index" +
                        range.sheetIndex;
                    if (cacheKey in arrayMatchCache) {
                        let amc = arrayMatchCache[cacheKey];
                        // console.log(amc);
                        amc.forEach((item) => {
                            func(item.key, item.r, item.c, item.sheetIndex);
                        });
                    } else {
                        let functionArr = [];
                        for (let r = range.row[0]; r <= range.row[1]; r++) {
                            for (let c = range.column[0]; c <= range.column[1]; c++) {
                                let key = "r" + r + "c" + c + "i" + range.sheetIndex;
                                func(key, r, c, range.sheetIndex);
                                if (
                                    (formulaObjects && key in formulaObjects) ||
                                    (updateValueOjects && key in updateValueOjects)
                                ) {
                                    functionArr.push({
                                        key: key,
                                        r: r,
                                        c: c,
                                        sheetIndex: range.sheetIndex,
                                    });
                                }
                            }
                        }

                        if (formulaObjects || updateValueOjects) {
                            arrayMatchCache[cacheKey] = functionArr;
                        }
                    }
                }
            };

            let existsChildFormulaMatch = {},
                ii = 0;

            //创建公式缓存及其范围的缓存
            // console.time("1");
            for (let i = 0; i < calcChains.length; i++) {
                let formulaCell = calcChains[i];
                let key = "r" + formulaCell.r + "c" + formulaCell.c + "i" + formulaCell.index;
                let calc_funcStr = getcellFormula(formulaCell.r, formulaCell.c, formulaCell.index);
                if (calc_funcStr == null) {
                    continue;
                }
                let txt1 = calc_funcStr.toUpperCase();
                let isOffsetFunc =
                    txt1.indexOf("INDIRECT(") > -1 || txt1.indexOf("OFFSET(") > -1 || txt1.indexOf("INDEX(") > -1;
                let formulaArray = [];

                if (isOffsetFunc) {
                    this.isFunctionRange(calc_funcStr, null, null, formulaCell.index, null, function(str_nb) {
                        let range = _this.getcellrange((str_nb || '').trim(), formulaCell.index);
                        if (range != null) {
                            formulaArray.push(range);
                        }
                    });
                } else if (!(calc_funcStr.substr(0, 2) == '="' && calc_funcStr.substr(calc_funcStr.length - 1, 1) == '"')) {
                    //let formulaTextArray = calc_funcStr.split(/==|!=|<>|<=|>=|[,()=+-\/*%&^><]/g);//无法正确分割单引号或双引号之间有==、!=、-等运算符的情况。导致如='1-2'!A1公式中表名1-2的A1单元格内容更新后，公式的值不更新的bug
                    //解决='1-2'!A1+5会被calc_funcStr.split(/==|!=|<>|<=|>=|[,()=+-\/*%&^><]/g)分割成["","'1","2'!A1",5]的错误情况
                    let point = 0; //指针
                    let squote = -1; //双引号
                    let dquote = -1; //单引号
                    let formulaTextArray = [];
                    let sq_end_array = []; //保存了配对的单引号在formulaTextArray的index索引。
                    let calc_funcStr_length = calc_funcStr.length;
                    for (let i = 0; i < calc_funcStr_length; i++) {
                        let char = calc_funcStr.charAt(i);
                        if (char == "'" && dquote == -1) {
                            //如果是单引号开始
                            if (squote == -1) {
                                if (point != i) {
                                    formulaTextArray.push(
                                        ...calc_funcStr.substring(point, i).split(/==|!=|<>|<=|>=|[,()=+-\/*%&\^><]/),
                                    );
                                }
                                squote = i;
                                point = i;
                            } //单引号结束
                            else {
                                //if (squote == i - 1)//配对的单引号后第一个字符不能是单引号
                                //{
                                //    ;//到此处说明公式错误
                                //}
                                //如果是''代表着输出'
                                if (i < calc_funcStr_length - 1 && calc_funcStr.charAt(i + 1) == "'") {
                                    i++;
                                } else {
                                    //如果下一个字符不是'代表单引号结束
                                    //if (calc_funcStr.charAt(i - 1) == "'") {//配对的单引号后最后一个字符不能是单引号
                                    //    ;//到此处说明公式错误
                                    point = i + 1;
                                    formulaTextArray.push(calc_funcStr.substring(squote, point));
                                    sq_end_array.push(formulaTextArray.length - 1);
                                    squote = -1;
                                    //} else {
                                    //    point = i + 1;
                                    //    formulaTextArray.push(calc_funcStr.substring(squote, point));
                                    //    sq_end_array.push(formulaTextArray.length - 1);
                                    //    squote = -1;
                                    //}
                                }
                            }
                        }
                        if (char == '"' && squote == -1) {
                            //如果是双引号开始
                            if (dquote == -1) {
                                if (point != i) {
                                    formulaTextArray.push(
                                        ...calc_funcStr.substring(point, i).split(/==|!=|<>|<=|>=|[,()=+-\/*%&\^><]/),
                                    );
                                }
                                dquote = i;
                                point = i;
                            } else {
                                //如果是""代表着输出"
                                if (i < calc_funcStr_length - 1 && calc_funcStr.charAt(i + 1) == '"') {
                                    i++;
                                } else {
                                    //双引号结束
                                    point = i + 1;
                                    formulaTextArray.push(calc_funcStr.substring(dquote, point));
                                    dquote = -1;
                                }
                            }
                        }
                    }
                    if (point != calc_funcStr_length) {
                        formulaTextArray.push(
                            ...calc_funcStr.substring(point, calc_funcStr_length).split(/==|!=|<>|<=|>=|[,()=+-\/*%&\^><]/),
                        );
                    }
                    //拼接所有配对单引号及之后一个单元格内容，例如["'1-2'","!A1"]拼接为["'1-2'!A1"]
                    for (let i = sq_end_array.length - 1; i >= 0; i--) {
                        if (sq_end_array[i] != formulaTextArray.length - 1) {
                            formulaTextArray[sq_end_array[i]] =
                                formulaTextArray[sq_end_array[i]] + formulaTextArray[sq_end_array[i] + 1];
                            formulaTextArray.splice(sq_end_array[i] + 1, 1);
                        }
                    }
                    //至此=SUM('1-2'!A1:A2&"'1-2'!A2")由原来的["","SUM","'1","2'!A1:A2","",""'1","2'!A2""]更正为["","SUM","","'1-2'!A1:A2","","",""'1-2'!A2""]

                    for (let i = 0; i < formulaTextArray.length; i++) {
                        let t = formulaTextArray[i];
                        if (t.length <= 1) {
                            continue;
                        }

                        if (t.substr(0, 1) == '"' && t.substr(t.length - 1, 1) == '"' && !_this.iscelldata(t)) {
                            continue;
                        }

                        let range = _this.getcellrange((t || '').trim(), formulaCell.index);

                        if (range == null) {
                            continue;
                        }

                        formulaArray.push(range);
                    }
                }

                let item = {
                    formulaArray: formulaArray,
                    calc_funcStr: calc_funcStr,
                    key: key,
                    r: formulaCell.r,
                    c: formulaCell.c,
                    index: formulaCell.index,
                    parents: {},
                    chidren: {},
                    color: "w",
                };

                formulaObjects[key] = item;

                // if(isForce){
                //     updateValueArray.push(item);
                // }
                // else{
                //     arrayMatch(formulaArray, null, function(key){
                //         if(key in updateValueOjects){
                //             updateValueArray.push(item);
                //         }
                //     });
                // }
            }

            // console.timeEnd("1");

            // console.time("2");
            //形成一个公式之间引用的图结构
            Object.keys(formulaObjects).forEach((key) => {
                let formulaObject = formulaObjects[key];
                arrayMatch(formulaObject.formulaArray, formulaObjects, updateValueOjects, function(childKey) {
                    if (childKey in formulaObjects) {
                        let childFormulaObject = formulaObjects[childKey];
                        formulaObject.chidren[childKey] = 1;
                        childFormulaObject.parents[key] = 1;
                    }
                    // console.log(childKey,formulaObject.formulaArray);
                    if (!isForce && childKey in updateValueOjects) {
                        updateValueArray.push(formulaObject);
                    }
                });

                if (isForce) {
                    updateValueArray.push(formulaObject);
                }
            });

            // console.log(formulaObjects)
            // console.timeEnd("2");

            // console.time("3");
            let formulaRunList = [];
            //计算，采用深度优先遍历公式形成的图结构

            // updateValueArray.forEach((key)=>{
            //     let formulaObject = formulaObjects[key];

            // });

            let stack = updateValueArray,
                existsFormulaRunList = {};
            while (stack.length > 0) {
                let formulaObject = stack.pop();

                if (formulaObject == null || formulaObject.key in existsFormulaRunList) {
                    continue;
                }

                if (formulaObject.color == "b") {
                    formulaRunList.push(formulaObject);
                    existsFormulaRunList[formulaObject.key] = 1;
                    continue;
                }

                let cacheStack = [];
                Object.keys(formulaObject.parents).forEach((parentKey) => {
                    let parentFormulaObject = formulaObjects[parentKey];
                    if (parentFormulaObject != null) {
                        cacheStack.push(parentFormulaObject);
                    }
                });

                ii++;

                if (cacheStack.length == 0) {
                    formulaRunList.push(formulaObject);
                    existsFormulaRunList[formulaObject.key] = 1;
                } else {
                    formulaObject.color = "b";
                    stack.push(formulaObject);
                    stack = stack.concat(cacheStack);
                }
            }

            formulaRunList.reverse();

            // console.log(formulaObjects, ii)
            // console.timeEnd("3");

            // console.time("4");
            for (let i = 0; i < formulaRunList.length; i++) {
                let formulaCell = formulaRunList[i];
                if (formulaCell.level == Math.max) {
                    continue;
                }

                window.luckysheet_getcelldata_cache = null;
                let calc_funcStr = formulaCell.calc_funcStr;

                let v = _this.execfunction(calc_funcStr, formulaCell.r, formulaCell.c, formulaCell.index);

                _this.groupValuesRefreshData.push({
                    r: formulaCell.r,
                    c: formulaCell.c,
                    v: v[1],
                    f: v[2],
                    spe: v[3],
                    index: formulaCell.index,
                });

                // _this.execFunctionGroupData[u.r][u.c] = value;
                _this.execFunctionGlobalData[formulaCell.r + "_" + formulaCell.c + "_" + formulaCell.index] = {
                    v: v[1],
                    f: v[2],
                };
            }
            // console.log(formulaRunList);
            // console.timeEnd("4");

            _this.execFunctionExist = null;
        },
        // When set origin_r and origin_c, that mean just refresh cell value link to [origin_r,origin_c] cell,

        execFunctionGroup1: function(origin_r, origin_c, value, index, data, isForce = false) {
            let _this = this;

            if (data == null) {
                data = Store.flowdata;
            }

            if (!window.luckysheet_compareWith) {
                window.luckysheet_compareWith = luckysheet_compareWith;
                window.luckysheet_getarraydata = luckysheet_getarraydata;
                window.luckysheet_getcelldata = luckysheet_getcelldata;
                window.luckysheet_parseData = luckysheet_parseData;
                window.luckysheet_getValue = luckysheet_getValue;
                window.luckysheet_indirect_check = luckysheet_indirect_check;
                window.luckysheet_indirect_check_return = luckysheet_indirect_check_return;
                window.luckysheet_offset_check = luckysheet_offset_check;
                window.luckysheet_calcADPMM = luckysheet_calcADPMM;
                window.luckysheet_getSpecialReference = luckysheet_getSpecialReference;
            }

            if (_this.execFunctionGlobalData == null) {
                _this.execFunctionGlobalData = {};
            }
            let luckysheetfile = getluckysheetfile();
            let dynamicArray_compute =
                luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicArray_compute"] == null
                    ? {}
                    : luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicArray_compute"];

            if (index == null) {
                index = Store.currentSheetIndex;
            }

            if (value != null) {
                //此处setcellvalue 中this.execFunctionGroupData会保存想要更新的值，本函数结尾不要设为null,以备后续函数使用
                // setcellvalue(origin_r, origin_c, _this.execFunctionGroupData, value);
                let cellCache = [[{ v: null }]];
                setcellvalue(0, 0, cellCache, value);
                _this.execFunctionGlobalData[origin_r + "_" + origin_c + "_" + index] = cellCache[0][0];
            }

            //{ "r": r, "c": c, "index": index, "func": func}
            let group = _this.getAllFunctionGroup(),
                vertex1 = {},
                stack = [],
                count = 0;

            _this.execvertex = {};
            if (_this.execFunctionExist == null) {
                for (let i = 0; i < group.length; i++) {
                    let item = group[i];
                    let file = luckysheetfile[getSheetIndex(item["index"])];
                    if (file == null) {
                        continue;
                    }
                    let cell = file.data[item.r][item.c];
                    let calc_funcStr = getcellFormula(item.r, item.c, item.index);
                    if (cell != null && cell.f != null && cell.f == calc_funcStr) {
                        if (!(item instanceof Object)) {
                            item = new Function("return " + item)();
                        }

                        item.color = "w";
                        item.parent = null;
                        item.chidren = {};
                        item.times = 0;

                        vertex1["r" + item.r + "c" + item.c + "i" + item.index] = item;
                        _this.isFunctionRangeSave = false;

                        if (isForce) {
                            _this.isFunctionRangeSave = true;
                        } else if (origin_r != null && origin_c != null) {
                            _this.isFunctionRangeSelect(calc_funcStr, origin_r, origin_c, index, dynamicArray_compute);
                        }
                        // else {
                        //     _this.isFunctionRangeSelect(calc_funcStr, undefined, undefined ,dynamicArray_compute);
                        // }

                        if (_this.isFunctionRangeSave) {
                            stack.push(item);
                            _this.execvertex["r" + item.r + "c" + item.c + "i" + item.index] = item;
                            count++;
                        }
                    }
                }
            } else {
                for (let x = 0; x < _this.execFunctionExist.length; x++) {
                    let cell = _this.execFunctionExist[x];

                    if ("r" + cell.r + "c" + cell.c + "i" + cell.i in vertex1) {
                        continue;
                    }

                    for (let i = 0; i < group.length; i++) {
                        let item = group[i];
                        let calc_funcStr = getcellFormula(item.r, item.c, item.index);
                        item.color = "w";
                        item.parent = null;
                        item.chidren = {};
                        item.times = 0;

                        vertex1["r" + item.r + "c" + item.c + "i" + item.index] = item;
                        _this.isFunctionRangeSave = false;
                        if (isForce) {
                            _this.isFunctionRangeSave = true;
                        } else {
                            _this.isFunctionRangeSelect(calc_funcStr, cell.r, cell.c, cell.i, dynamicArray_compute);
                        }

                        if (_this.isFunctionRangeSave) {
                            stack.push(item);
                            _this.execvertex["r" + item.r + "c" + item.c + "i" + item.index] = item;
                            count++;
                        }
                    }
                }
            }

            // console.time("1");
            // console.log(group.length);
            // let iii = 0, ii=0;
            //先进先出法，构建逆向执行结构树
            while (stack.length > 0) {
                let u = stack.shift();
                let excludeList = {};
                _this.getChildrenVertex(u, vertex1, excludeList);
                // ii++;
                // console.log(JSON.stringify(excludeList));
                for (let name in vertex1) {
                    let item = vertex1[name];
                    if (item == null) {
                        continue;
                    }

                    let ukey = "r" + u.r + "c" + u.c + "i" + u.index;

                    // if ((u.r == item.r && u.c == item.c && u.index == item.index) ) {
                    //     continue;
                    // }

                    if (name in excludeList) {
                        continue;
                    }

                    _this.isFunctionRangeSave = false;

                    let calc_funcStr = getcellFormula(item.r, item.c, item.index);
                    _this.isFunctionRangeSelect(calc_funcStr, u.r, u.c, u.index, dynamicArray_compute);

                    // iii++;

                    if (_this.isFunctionRangeSave) {
                        if (!(name in _this.execvertex)) {
                            // console.log(JSON.stringify(item), JSON.stringify(u), _this.isFunctionRangeSave);

                            stack.push(item);
                            _this.execvertex[name] = item;
                        }

                        count++;
                        _this.execvertex[name].chidren[ukey] = 1;
                    }
                }
            }
            // console.log(iii, ii);
            // console.timeEnd("1");

            // console.time("2");
            _this.groupValuesRefreshData = [];
            let i = 0;

            while (i < count) {
                for (let name in _this.execvertex) {
                    let u = _this.execvertex[name];

                    if (u.color == "w") {
                        _this.functionDFS(u);
                    } else if (u.color == "b") {
                        i++;
                    }
                }
            }
            // console.timeEnd("2");

            _this.execFunctionExist = null;
        },
        //递归得到引用节点,

        getChildrenVertex: function(u, vertex1, obj) {
            let ukey = "r" + u.r + "c" + u.c + "i" + u.index;
            obj[ukey] = 1;
            if (u.chidren != null) {
                for (let key in u.chidren) {
                    if (vertex1[key] && !(key in obj)) {
                        this.getChildrenVertex(vertex1[key], vertex1, obj);
                    }
                }
            }
        },
        //深度优先算法，处理多级调用函数,

        functionDFS: function(u) {
            let _this = this;
            u.color = "g";
            u.times += 1;
            for (let chd in u.chidren) {
                let v = _this.execvertex[chd];
                if (v.color == "w") {
                    v.parent = "r" + u.r.toString() + "c" + u.c.toString() + "i" + u.index;
                    _this.functionDFS(v);
                }
            }

            u.color = "b";
            window.luckysheet_getcelldata_cache = null;
            let calc_funcStr = getcellFormula(u.r, u.c, u.index);

            let v = _this.execfunction(calc_funcStr, u.r, u.c, u.index);

            // let value = _this.execFunctionGroupData[u.r][u.c];
            // if(value == null){
            //     value = {};
            // }

            // value.v = v[1];
            // value.f = v[2];

            // let cell = getOrigincell(u.r,u.c,u.index);

            _this.groupValuesRefreshData.push({
                r: u.r,
                c: u.c,
                v: v[1],
                f: v[2],
                spe: v[3],
                index: u.index,
            });

            // _this.execFunctionGroupData[u.r][u.c] = value;
            _this.execFunctionGlobalData[u.r + "_" + u.c + "_" + u.index] = {
                v: v[1],
                f: v[2],
            };
        },

        groupValuesRefreshData: [],

        groupValuesRefresh: function() {
            let _this = this;
            let luckysheetfile = getluckysheetfile();
            if (_this.groupValuesRefreshData.length > 0) {
                for (let i = 0; i < _this.groupValuesRefreshData.length; i++) {
                    let item = _this.groupValuesRefreshData[i];

                    // if(item.i != Store.currentSheetIndex){
                    //     continue;
                    // }

                    let file = luckysheetfile[getSheetIndex(item.index)];
                    let data = file.data;
                    if (data == null) {
                        continue;
                    }

                    let updateValue = {};
                    if (item.spe != null) {
                        if (item.spe.type == "dynamicArrayItem") {
                            file.dynamicArray = _this.insertUpdateDynamicArray(item.spe.data);
                        }
                    }
                    updateValue.v = item.v;
                    updateValue.f = item.f;
                    const cell = setcellvalue(item.r, item.c, data, updateValue);
                }

                editor.webWorkerFlowDataCache(Store.flowdata); //worker存数据
                _this.groupValuesRefreshData = [];
            }
        },

        delFunctionGroup: function(r, c, index) {
            if (index == null) {
                index = Store.currentSheetIndex;
            }

            let luckysheetfile = getluckysheetfile();
            let file = luckysheetfile[getSheetIndex(index)];

            let calcChain = file.calcChain;
            if (calcChain != null) {
                for (let i = 0; i < calcChain.length; i++) {
                    let calc = calcChain[i];
                    if (calc.r == r && calc.c == c && calc.index == index) {
                        calcChain.splice(i, 1);
                        break;
                    }
                }
            }

            let dynamicArray = file.dynamicArray;
            if (dynamicArray != null) {
                for (let i = 0; i < dynamicArray.length; i++) {
                    let calc = dynamicArray[i];
                    if (calc.r == r && calc.c == c && (calc.index == null || calc.index == index)) {
                        dynamicArray.splice(i, 1);
                        break;
                    }
                }
            }

            setluckysheetfile(luckysheetfile);
        },

        execfunction: function(txt, r, c, index, isrefresh, notInsertFunc) {
            let _this = this;

            let _locale = locale();
            let locale_formulaMore = _locale.formulaMore;
            // console.log(txt,r,c)
            if (txt.indexOf(_this.error.r) > -1) {
                return [false, _this.error.r, txt];
            }

            if (!_this.checkBracketNum(txt)) {
                txt += ")";
            }

            if (index == null) {
                index = Store.currentSheetIndex;
            }

            Store.calculateSheetIndex = index;

            let fp = _this.functionParserExe(txt).trim();
            //console.log(fp)
            if (fp.substr(0, 20) == "luckysheet_function." || fp.substr(0, 22) == "luckysheet_compareWith") {
                _this.functionHTMLIndex = 0;
            }

            if (!_this.testFunction(txt, fp) || fp == "") {
                tooltip.info("", locale_formulaMore.execfunctionError);
                return [false, _this.error.n, txt];
            }

            let result = null;
            window.luckysheetCurrentRow = r;
            window.luckysheetCurrentColumn = c;
            window.luckysheetCurrentIndex = index;
            window.luckysheetCurrentFunction = txt;

            try {
                if (fp.indexOf("luckysheet_getcelldata") > -1) {
                    let funcg = fp.split("luckysheet_getcelldata('");

                    for (let i = 1; i < funcg.length; i++) {
                        let funcgStr = funcg[i].split("')")[0];
                        let funcgRange = _this.getcellrange(funcgStr);

                        if (!funcgRange || funcgRange.row[0] < 0 || funcgRange.column[0] < 0) {
                            return [true, _this.error.r, txt];
                        }

                        if (
                            funcgRange.sheetIndex == Store.calculateSheetIndex &&
                            r >= funcgRange.row[0] &&
                            r <= funcgRange.row[1] &&
                            c >= funcgRange.column[0] &&
                            c <= funcgRange.column[1]
                        ) {
                            if (isEditMode()) {
                                alert(locale_formulaMore.execfunctionSelfError);
                            } else {
                                tooltip.info("", locale_formulaMore.execfunctionSelfErrorResult);
                            }

                            return [false, 0, txt];
                        }
                    }
                }

                result = new Function("return " + fp)();
                if (typeof result == "string") {
                    result = result.replace(/\x7F/g, '"');
                }
            } catch (e) {
                let err = e;
                console.log(e, fp);
                err = _this.errorInfo(err);
                result = [_this.error.n, err];
            }

            //公式结果是对象，则表示只是选区。如果是单个单元格，则返回其值；如果是多个单元格，则返回 #VALUE!。
            if (getObjType(result) == "object" && result.startCell != null) {
                if (getObjType(result.data) == "array") {
                    result = _this.error.v;
                } else {
                    if (getObjType(result.data) == "object" && !isRealNull(result.data.v)) {
                        result = result.data.v;
                    } else if (!isRealNull(result.data)) {
                        //只有data长或宽大于1才可能是选区
                        // =INDIRECT("I2") 计算结果为 result.data = "J2"
                        if (result.cell > 1 || result.rowl > 1 || getObjType(result.data) == "string" || getObjType(result.data) == "number") {
                            result = result.data;
                        } // 否则就是单个不为null的没有值v的单元格
                        else {
                            result = 0;
                        }
                    } else {
                        result = 0;
                    }
                }
            }

            //公式结果是数组，分错误值 和 动态数组 两种情况
            let dynamicArrayItem = null;

            if (getObjType(result) == "array") {
                let isErr = false;

                if (getObjType(result[0]) != "array" && result.length == 2) {
                    isErr = valueIsError(result[0]);
                }

                if (!isErr) {
                    if (getObjType(result[0]) == "array" && result.length == 1 && result[0].length == 1) {
                        result = result[0][0];
                    } else {
                        dynamicArrayItem = { r: r, c: c, f: txt, index: index, data: result };
                        result = "";
                    }
                } else {
                    result = result[0];
                }
            }

            window.luckysheetCurrentRow = null;
            window.luckysheetCurrentColumn = null;
            window.luckysheetCurrentIndex = null;
            window.luckysheetCurrentFunction = null;

            if (r != null && c != null) {
                if (isrefresh) {
                    _this.execFunctionGroup(r, c, result, index);
                }

                if (!notInsertFunc) {
                    _this.insertUpdateFunctionGroup(r, c, index);
                }
            }

            if (dynamicArrayItem) {
                return [true, result, txt, { type: "dynamicArrayItem", data: dynamicArrayItem }];
            }

            // console.log(result, txt);

            return [true, result, txt];
        },

        testFunction: function(txt, fp) {
            if (txt.substr(0, 1) == "=") {
                return true;
            } else {
                return false;
            }
        },
        //供function/functionImplementation.js的EVALUATE函数调用。,

        execstringformula: function(txt, r, c, index) {
            let _this = this;
            return this.execfunction(txt, r, c, index);
        }
};

export default formulaExec;
