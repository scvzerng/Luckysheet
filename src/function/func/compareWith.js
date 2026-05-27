import func_methods from '../../global/func_methods';
import { isRealNum, valueIsError, error } from '../../global/validate';
import { getObjType } from '../../utils/util';
import { handleMultiply } from './opMultiply';
import { handleDivide } from './opDivide';
import { handleAddSubMod } from './opAddSubMod';
import { handleComparison } from './opComparison';
import { handleConcat } from './opConcat';
import { handlePower } from './opPower';

function luckysheet_compareWith() {
    let sp = arguments[1];

    let data_fp = arguments[0];
    let fp;
    if(getObjType(data_fp) == "object" && data_fp.startCell != null){
        if(sp == "&"){
            fp = func_methods.getCellDataDyadicArr(data_fp, "text");
        }
        else{
            fp = func_methods.getCellDataDyadicArr(data_fp, "number");
        }

        if(fp.length == 1 && fp[0].length == 1){
            fp = fp[0][0];
        }
    }
    else{
        fp = data_fp;
    }

    let data_tp = arguments[2];
    let tp;
    if(getObjType(data_tp) == "object" && data_tp.startCell != null){
        if(sp == "&"){
            tp = func_methods.getCellDataDyadicArr(data_tp, "text");
        }
        else{
            tp = func_methods.getCellDataDyadicArr(data_tp, "number");
        }

        if(tp.length == 1 && tp[0].length == 1){
            tp = tp[0][0];
        }
    }
    else{
        tp = data_tp;
    }

    if(valueIsError(fp)){
        return fp;
    }

    if(valueIsError(tp)){
        return tp;
    }

    if(getObjType(fp) == "array" && getObjType(fp[0]) == "array" && !func_methods.isDyadicArr(fp)){
        return error.v;
    }

    if(getObjType(tp) == "array" && getObjType(tp[0]) == "array" && !func_methods.isDyadicArr(tp)){
        return error.v;
    }

    if(sp == "<>"){
        sp = "!=";
    }

    if(sp == "="){
        sp = "==";
    }

    if(fp==null && tp==null){
        return "#INVERSE!";
    }
    else if(fp=="#INVERSE!"){
        fp =0;
        if(sp=="-"){
            sp = "+";
        }
        else if(sp=="+"){
            sp = "-";
        }
    }
    else if(sp == "-" && fp == null){
        fp = 0;
    }
    else if(sp == "/" && (tp == 0 || tp == null)){
        return error.d;
    }

    if(sp == "*"){
        return handleMultiply(fp, tp, sp);
    }
    else if(sp == "/"){
        return handleDivide(fp, tp, sp);
    }
    else if(sp == "+" || sp == "-" || sp == "%"){
        return handleAddSubMod(fp, tp, sp);
    }
    else if(sp == "==" || sp == "!=" || sp == ">=" || sp == "<=" || sp == ">" || sp == "<"){
        return handleComparison(fp, tp, sp);
    }
    else if(sp == "&"){
        return handleConcat(fp, tp, sp);
    }
    else if(sp == "^"){
        return handlePower(fp, tp, sp);
    }
}

export { luckysheet_compareWith };
