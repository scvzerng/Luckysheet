import {  getSheetIndex,  getluckysheetfile  } from "../../methods/get";
import { setluckysheetfile } from "../../methods/set";
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

const calcChain = {
        insertUpdateDynamicArray: function(dynamicArrayItem) {
            let r = dynamicArrayItem.r,
                c = dynamicArrayItem.c,
                index = dynamicArrayItem.index;
            if (index == null) {
                index = Store.currentSheetIndex;
            }

            let luckysheetfile = getluckysheetfile();
            let file = luckysheetfile[getSheetIndex(index)];

            let dynamicArray = file.dynamicArray;
            if (dynamicArray == null) {
                dynamicArray = [];
            }

            for (let i = 0; i < dynamicArray.length; i++) {
                let calc = dynamicArray[i];
                if (calc.r == r && calc.c == c && calc.index == index) {
                    calc.data = dynamicArrayItem.data;
                    calc.f = dynamicArrayItem.f;
                    return dynamicArray;
                }
            }

            dynamicArray.push(dynamicArrayItem);
            return dynamicArray;
        },

        addFunctionGroup: function(r, c, func, index) {
            if (index == null) {
                index = Store.currentSheetIndex;
            }

            let luckysheetfile = getluckysheetfile();
            let file = luckysheetfile[getSheetIndex(index)];
            if (file.calcChain == null) {
                file.calcChain = [];
            }

            let cc = {
                r: r,
                c: c,
                index: index,
                func: func,
            };
            file.calcChain.push(cc);

            setluckysheetfile(luckysheetfile);
        },

        getAllFunctionGroup: function() {
            let luckysheetfile = getluckysheetfile();
            let ret = [];
            for (let i = 0; i < luckysheetfile.length; i++) {
                let file = luckysheetfile[i];
                let calcChain = file.calcChain;

                /* 备注：再次加载表格获取的数据可能是JSON字符串格式(需要进行发序列化处理) */
                if (calcChain) {
                    let tempCalcChain = [];
                    calcChain.forEach((item, idx) => {
                        if (typeof item === "string") {
                            tempCalcChain.push(JSON.parse(item));
                        } else {
                            tempCalcChain.push(item);
                        }
                    });
                    calcChain = file.calcChain = tempCalcChain;
                }

                let dynamicArray_compute = file.dynamicArray_compute;
                if (calcChain == null) {
                    calcChain = [];
                }

                if (dynamicArray_compute == null) {
                    dynamicArray_compute = [];
                }

                ret = ret.concat(calcChain);

                for (let i = 0; i < dynamicArray_compute.length; i++) {
                    let d = dynamicArray_compute[0];
                    ret.push({
                        r: d.r,
                        c: d.c,
                        index: d.index,
                    });
                }
            }

            return ret;
        },

        getFunctionGroup: function(index) {
            if (index == null) {
                index = Store.currentSheetIndex;
            }

            let luckysheetfile = getluckysheetfile();
            let file = luckysheetfile[getSheetIndex(index)];

            if (file.calcChain == null) {
                return [];
            }

            return file.calcChain;
        },

        updateFunctionGroup: function(r, c, index) {
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
                        break;
                    }
                }
            }

            setluckysheetfile(luckysheetfile);
        },

        insertUpdateFunctionGroup: function(r, c, index) {
            if (index == null) {
                index = Store.currentSheetIndex;
            }

            // let func = getcellFormula(r, c, index);
            // if (func == null || func.length==0) {
            //     this.delFunctionGroup(r, c, index);
            //     return;
            // }

            let luckysheetfile = getluckysheetfile();
            let file = luckysheetfile[getSheetIndex(index)];

            let calcChain = file.calcChain;
            if (calcChain == null) {
                calcChain = [];
            }

            for (let i = 0; i < calcChain.length; i++) {
                let calc = calcChain[i];
                if (calc.r == r && calc.c == c && calc.index == index) {
                    return;
                }
            }

            let cc = {
                r: r,
                c: c,
                index: index,
            };
            calcChain.push(cc);
            file.calcChain = calcChain;

            setluckysheetfile(luckysheetfile);
        }
};

export default calcChain;
