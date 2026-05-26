import { replaceHtml, getObjType, chatatABC, ABCatNum, luckysheetfontformat } from "../../utils/util";
import { getSheetIndex, getRangetxt, getluckysheetfile } from "../../methods/get";
import { setluckysheetfile } from "../../methods/set";
import { luckyColor } from "../../controllers/constant";
import sheetmanage from "../../controllers/sheetmanage";
import menuButton from "../../controllers/menuButton";
import luckysheetFreezen from "../../controllers/freezen";
import { seletedHighlistByindex, luckysheet_count_show } from "../../controllers/select";
import { isRealNum, isRealNull, valueIsError, isEditMode } from "../validate";
import { isdatetime, isdatatype } from "../datecontroll";
import { getCellTextSplitArr, getCellTextInfo } from "../getRowlen";
import { getcellvalue, getcellFormula, getInlineStringNoStyle, getOrigincell } from "../getdata";
import { setcellvalue } from "../setdata";
import { genarate, valueShowEs } from "../format";
import editor from "../editor";
import tooltip from "../tooltip";
import { rowLocation, colLocation, colLocationByIndex, mouseposition } from "../location";
import { luckysheetRangeLast } from "../cursorPos";
import { jfrefreshgrid } from "../refresh";
import { isInlineStringCell, convertSpanToShareString } from "../../controllers/inlineString";
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
import json from "../json";
import method from "../method";

const dataRead = {
        getPureValueByData: function(data) {
            if (data.length == 0) {
                return [];
            }

            let output = [];

            if (getObjType(data) == "array") {
                if (getObjType(data[0]) == "array") {
                    for (let r = 0; r < data.length; r++) {
                        let row = [];

                        for (let c = 0; c < data[0].length; c++) {
                            let cell = data[r][c];

                            if (getObjType(cell) == "object") {
                                row.push(cell.v);
                            } else {
                                row.push(cell);
                            }
                        }

                        output.push(row);
                    }
                } else {
                    for (let i = 0; i < data.length; i++) {
                        let cell = data[i];

                        if (getObjType(cell) == "object") {
                            output.push(cell.v);
                        } else {
                            output.push(cell);
                        }
                    }
                }
            } else {
                let cell = data;

                if (getObjType(cell) == "object") {
                    output.push(cell.v);
                } else {
                    output.push(cell);
                }
            }

            return output;
        },
        //sparklines添加,

        readCellDataToOneArray: function(rangeValue) {
            let _this = this;

            if (rangeValue == null) {
                return [];
            }

            if (getObjType(rangeValue) != "object") {
                return [rangeValue];
            }

            let dataformat = [];
            let data = [];

            if (rangeValue != null && rangeValue.data != null) {
                data = rangeValue.data;
            } else if (rangeValue != null && !isRealNull(rangeValue.v)) {
                return [rangeValue.v];
            } else {
                return [];
            }

            //适配excel的动态数组格式，{1，2，3，4，5}或者{{1，2，3}，{4，5，6}，{7，8，9}}
            if (getObjType(data) == "array") {
                data = _this.getPureValueByData(data);
            } else if (getObjType(data) == "object") {
                data = data.v;

                return [data];
            } else {
                if (/\{.*?\}/.test(data)) {
                    data = data.replace(/\{/g, "[").replace(/\}/g, "]");
                }

                data = new Function("return " + data)();
            }

            //把二维数组转换为一维数组，sparklines要求数据格式为一维数组
            //let dataformat = [];
            if (getObjType(data[0]) == "array") {
                for (let i = 0; i < data.length; i++) {
                    dataformat = dataformat.concat(data[i]);
                }
            } else {
                dataformat = data;
            }

            return dataformat;
        },
        //sparklines添加
        //获得函数里某个参数的值，使用此函数需要在函数中执行luckysheet_getValue方法,

        getValueByFuncData: function(value, arg) {
            if (value == null) {
                return null;
            }

            let _this = this;

            if (getObjType(value) == "array") {
                if (arg == "avg") {
                    return luckysheet_function.AVERAGE.f.apply(luckysheet_function.AVERAGE, value);
                } else if (arg == "sum") {
                    return luckysheet_function.SUM.f.apply(luckysheet_function.SUM, value);
                } else {
                    if (getObjType(value[0]) == "object") {
                        return luckysheet.mask.getValueByFormat(value[0]);
                    } else {
                        return value[0];
                    }
                }
            } else if (getObjType(value) == "object") {
                return luckysheet.mask.getValueByFormat(value);
            } else {
                return value;
            }
        },
        //sparklines添加,

        sparklinesColorMap: function(args, len) {
            let _this = this;
            let colorLists = null;

            if (len == null) {
                len = 5;
            }

            let index = 0;

            if (args.length > len) {
                for (let i = len; i < args.length; i++) {
                    let colorMap = args[i];
                    let colorListArray = _this.readCellDataToOneArray(colorMap);

                    for (let a = 0; a < colorListArray.length; a++) {
                        let ca = colorListArray[a];

                        if (ca.indexOf(":") > -1) {
                            if (!colorLists) {
                                colorLists = {};
                            }

                            let calist = ca.split(":");

                            if (calist.length == 2) {
                                colorLists[calist[0]] = calist[1];
                            } else if (calist.length > 1) {
                                colorLists[calist[0] + ":" + calist[1]] = calist[2];
                            }
                        } else {
                            if (!colorLists) {
                                colorLists = [];
                            }

                            colorLists.push(ca);
                        }
                    }

                    index++;
                }
            }

            return colorLists;
        },
        //sparklines添加,

        colorList: [
            "#2ec7c9",
            "#fc5c5c",
            "#5ab1ef",
            "#ffb980",
            "#d87a80",
            "#8d98b3",
            "#e5cf0d",
            "#97b552",
            "#95706d",
            "#dc69aa",
            "#07a2a4",
            "#9a7fd1",
            "#588dd5",
            "#f5994e",
            "#c05050",
            "#59678c",
            "#c9ab00",
            "#7eb00a",
            "#6f5553",
            "#c14089",
        ],

        classlist: {
            province: {
                11: "北京",
                12: "天津",
                13: "河北",
                14: "山西",
                15: "内蒙古",
                21: "辽宁",
                22: "吉林",
                23: "黑龙江",
                31: "上海",
                32: "江苏",
                33: "浙江",
                34: "安徽",
                35: "福建",
                36: "江西",
                37: "山东",
                41: "河南",
                42: "湖北",
                43: "湖南",
                44: "广东",
                45: "广西",
                46: "海南",
                50: "重庆",
                51: "四川",
                52: "贵州",
                53: "云南",
                54: "西藏",
                61: "陕西",
                62: "甘肃",
                63: "青海",
                64: "宁夏",
                65: "新疆",
                71: "台湾",
                81: "香港",
                82: "澳门",
                91: "国外",
            },
        }
};

export default dataRead;
