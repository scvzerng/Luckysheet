import func_methods from '../../global/func_methods';
import { isRealNum, valueIsError, error } from '../../global/validate';
import { getObjType } from '../../utils/util';
import { booleanToNum } from './compareHelpers';
import { luckysheet_calcADPMM } from './arrayCalcUtils';
import { inverse } from '../../function/matrix_methods';

export function handleDivide(fp, tp, sp) {
    if(getObjType(fp) == "array" && getObjType(tp) == "array"){
        let result = [];

        if(getObjType(fp[0]) == "array" && getObjType(tp[0]) == "array"){
            //二维数组相除（m*n 与 m*n 等于 m*n；m*p 与 p*n 等于 m*n；其它错误） 
            if(fp.length == tp.length && fp[0].length == tp[0].length){
                for(let m = 0; m < fp.length; m++){
                    let rowArr = [];

                    for(let n = 0; n < fp[m].length; n++){
                        fp[m][n] = booleanToNum(fp[m][n]);
                        tp[m][n] = booleanToNum(tp[m][n]);

                        let value;
                        if(isRealNum(fp[m][n]) && isRealNum(tp[m][n])){
                            if(parseFloat(tp[m][n]) == 0){
                                value = error.d;
                            }
                            else{
                                value = luckysheet_calcADPMM(fp[m][n], sp, tp[m][n]);// parseFloat(fp[m][n]) / parseFloat(tp[m][n]);    
                            }
                        }
                        else{
                            value = error.v;
                        }

                        rowArr.push(value);
                    }

                    result.push(rowArr);
                }
            }
            else if(fp[0].length == tp.length){
                let tp_inverse = inverse(tp);

                let rowlen = fp.length;
                let collen = tp_inverse[0].length;

                for(let m = 0; m < rowlen; m++){
                    let rowArr = [];

                    for(let n = 0; n < collen; n++){
                        let value = 0;

                        for(let p = 0; p < fp[0].length; p++){
                            fp[m][p] = booleanToNum(fp[m][p]);
                            tp_inverse[p][n] = booleanToNum(tp_inverse[p][n]);

                            if(isRealNum(fp[m][p]) && isRealNum(tp_inverse[p][n])){
                                value += luckysheet_calcADPMM(fp[m][p], "*", tp_inverse[p][n]);// parseFloat(fp[m][p]) * parseFloat(tp_inverse[p][n]);
                            }
                            else{
                                value += error.v;
                            }
                        }

                        if(value.toString() == "NaN"){
                            value = error.v;
                        }

                        rowArr.push(value);
                    }

                    result.push(rowArr);
                }
            }
            else{
                return error.na;
            }
        }
        else if(getObjType(fp[0]) == "array"){
            //二维数组与一维数组相除（m*n 与 n 等于 m*n；m*1 与 n 等于 m*n；其它错误）
            if(fp[0].length == tp.length){
                for(let m = 0; m < fp.length; m++){
                    let rowArr = [];

                    for(let n = 0; n < fp[m].length; n++){
                        fp[m][n] = booleanToNum(fp[m][n]);
                        tp[n] = booleanToNum(tp[n]);

                        let value;
                        if(isRealNum(fp[m][n]) && isRealNum(tp[n])){
                            if(parseFloat(tp[n]) == 0){
                                value = error.d;
                            }
                            else{
                                value = luckysheet_calcADPMM(fp[m][n], sp, tp[n]);// parseFloat(fp[m][n]) / parseFloat(tp[n]);
                            }
                        }
                        else{
                            value = error.v;
                        }

                        rowArr.push(value);
                    }

                    result.push(rowArr);
                }
            }
            else if(fp[0].length == 1){
                let rowlen = fp.length;
                let collen = tp.length;

                for(let m = 0; m < rowlen; m++){
                    let rowArr = [];

                    for(let n = 0; n < collen; n++){
                        fp[m][0] = booleanToNum(fp[m][0]);
                        tp[n] = booleanToNum(tp[n]);

                        let value;
                        if(isRealNum(fp[m][0]) && isRealNum(tp[n])){
                            if(parseFloat(tp[n]) == 0){
                                value = error.d;
                            }
                            else{
                                value = luckysheet_calcADPMM(fp[m][0], sp, tp[n]);// parseFloat(fp[m][0]) / parseFloat(tp[n]);
                            }
                        }
                        else{
                            value = error.v;
                        }

                        rowArr.push(value);
                    }

                    result.push(rowArr);
                }
            }
            else{
                return error.na;
            }
        }
        else if(getObjType(tp[0]) == "array"){
            //二维数组与一维数组相除（m*n 与 n 等于 m*n；m*1 与 n 等于 m*n；其它错误）
            if(tp[0].length == fp.length){
                for(let m = 0; m < tp.length; m++){
                    let rowArr = [];

                    for(let n = 0; n < tp[m].length; n++){
                        fp[n] = booleanToNum(fp[n]);
                        tp[m][n] = booleanToNum(tp[m][n]);

                        let value;
                        if(isRealNum(fp[n]) && isRealNum(tp[m][n])){
                            if(parseFloat(tp[m][n]) == 0){
                                value = error.d;
                            }
                            else{
                                value = luckysheet_calcADPMM(fp[n], sp, tp[m][n]);//parseFloat(fp[n]) / parseFloat(tp[m][n]);
                            }
                        }
                        else{
                            value = error.v;
                        }

                        rowArr.push(value);
                    }

                    result.push(rowArr);
                }
            }
            else if(tp[0].length == 1){
                let rowlen = tp.length;
                let collen = fp.length;

                for(let m = 0; m < rowlen; m++){
                    let rowArr = [];

                    for(let n = 0; n < collen; n++){
                        fp[n] = booleanToNum(fp[n]);
                        tp[m][0] = booleanToNum(tp[m][0]);

                        let value;
                        if(isRealNum(fp[n]) && isRealNum(tp[m][0])){
                            if(parseFloat(tp[m][0]) == 0){
                                value = error.d;
                            }
                            else{
                                value = luckysheet_calcADPMM(fp[n], sp, tp[m][0]);//parseFloat(fp[n]) / parseFloat(tp[m][0]);
                            }
                        }
                        else{
                            value = error.v;
                        }

                        rowArr.push(value);
                    }

                    result.push(rowArr);
                }
            }
            else{
                return error.na;
            }
        }
        else{
            //一维数组与一维数组相除时，数组大小不一样是错误
            if(fp.length != tp.length){
                return error.na;   
            }

            for(let n = 0; n < fp.length; n++){
                fp[n] = booleanToNum(fp[n]);
                tp[n] = booleanToNum(tp[n]);

                let value;
                if(isRealNum(fp[n]) && isRealNum(tp[n])){
                    if(parseFloat(tp[n]) == 0){
                        value = error.d;
                    }
                    else{
                        value = luckysheet_calcADPMM(fp[n], sp, tp[n]);//parseFloat(fp[n]) / parseFloat(tp[n]);
                    }
                }
                else{
                    value = error.v;
                }

                result.push(value);
            }
        }

        return result;
    }
    else if(getObjType(fp) == "array"){
        tp = booleanToNum(tp);

        let result = [];

        if(getObjType(fp[0]) == "array"){
            for(let m = 0; m < fp.length; m++){
                let rowArr = [];

                for(let n = 0; n < fp[m].length; n++){
                    fp[m][n] = booleanToNum(fp[m][n]);

                    let value;
                    if(isRealNum(fp[m][n]) && isRealNum(tp)){
                        if(parseFloat(tp) == 0){
                            value = error.d;
                        }
                        else{
                            value = luckysheet_calcADPMM(fp[m][n], sp, tp);//parseFloat(fp[m][n]) / parseFloat(tp);
                        }
                    }
                    else{
                        value = error.v;
                    }

                    rowArr.push(value);
                }

                result.push(rowArr);
            }
        }
        else{
            for(let n = 0; n < fp.length; n++){
                fp[n] = booleanToNum(fp[n]);

                let value;
                if(isRealNum(fp[n]) && isRealNum(tp)){
                    if(parseFloat(tp) == 0){
                        value = error.d;
                    }
                    else{
                        value = luckysheet_calcADPMM(fp[n], sp, tp);//parseFloat(fp[n]) / parseFloat(tp);
                    }
                }
                else{
                    value = error.v;
                }

                result.push(value);
            }
        }

        return result;
    }
    else if(getObjType(tp) == "array"){
        fp = booleanToNum(fp);

        let result = [];

        if(getObjType(tp[0]) == "array"){
            for(let m = 0; m < tp.length; m++){
                let rowArr = [];

                for(let n = 0; n < tp[m].length; n++){
                    tp[m][n] = booleanToNum(tp[m][n]);

                    let value;
                    if(isRealNum(fp) && isRealNum(tp[m][n])){
                        if(parseFloat(tp[m][n]) == 0){
                            value = error.d;
                        }
                        else{
                            value = luckysheet_calcADPMM(fp, sp, tp[m][n]);//parseFloat(fp) / parseFloat(tp[m][n]);
                        }
                    }
                    else{
                        value = error.v;
                    }

                    rowArr.push(value);
                }

                result.push(rowArr);
            }
        }
        else{
            for(let n = 0; n < tp.length; n++){
                tp[n] = booleanToNum(tp[n]);

                let value;
                if(isRealNum(fp) && isRealNum(tp[n])){
                    if(parseFloat(tp[n]) == 0){
                        value = error.d;
                    }
                    else{
                        value = luckysheet_calcADPMM(fp, sp, tp[n]);//parseFloat(fp) / parseFloat(tp[n]);
                    }
                }
                else{
                    value = error.v;
                }

                result.push(value);
            }
        }

        return result;
    }
    else{
        fp = booleanToNum(fp);
        tp = booleanToNum(tp);

        let result;
        if(isRealNum(fp) && isRealNum(tp)){
            if(parseFloat(tp) == 0){
                result = error.d;
            }
            else{
                result = luckysheet_calcADPMM(fp, sp, tp);//parseFloat(fp) / parseFloat(tp);
            }
        }
        else{
            result = error.v;
        }

        return result;
    }
}
