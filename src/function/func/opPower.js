import {  isRealNum,  error  } from '../../global/validate';
import { getObjType } from '../../utils/util';
import { booleanToNum } from './compareHelpers';

export function handlePower(fp, tp, sp) {
    if(getObjType(fp) == "array" && getObjType(tp) == "array"){
        let result = [];

        if(getObjType(fp[0]) == "array" && getObjType(tp[0]) == "array"){
            if(fp.length != tp.length && fp[0].length != tp[0].length){
                return error.na;   
            }

            for(let m = 0; m < fp.length; m++){
                let rowArr = [];

                for(let n = 0; n < fp[m].length; n++){
                    fp[m][n] = booleanToNum(fp[m][n]);
                    tp[m][n] = booleanToNum(tp[m][n]);

                    let value;
                    if(isRealNum(fp[m][n]) && isRealNum(tp[m][n])){
                        value = Math.pow(parseFloat(fp[m][n]), parseFloat(tp[m][n]));
                    }
                    else{
                        value = error.v;
                    }

                    rowArr.push(value);
                }

                result.push(rowArr);
            }
        }
        else if(getObjType(fp[0]) == "array"){
            if(fp[0].length != tp.length){
                return error.na;
            }

            for(let m = 0; m < fp.length; m++){
                let rowArr = [];

                for(let n = 0; n < fp[m].length; n++){
                    fp[m][n] = booleanToNum(fp[m][n]);
                    tp[n] = booleanToNum(tp[n]);

                    let value;
                    if(isRealNum(fp[m][n]) && isRealNum(tp[n])){
                        value = Math.pow(parseFloat(fp[m][n]), parseFloat(tp[n]));
                    }
                    else{
                        value = error.v;
                    }

                    rowArr.push(value);
                }

                result.push(rowArr);
            }
        }
        else if(getObjType(tp[0]) == "array"){
            if(tp[0].length != fp.length){
                return error.na;
            }

            for(let m = 0; m < tp.length; m++){
                let rowArr = [];

                for(let n = 0; n < tp[m].length; n++){
                    fp[n] = booleanToNum(fp[n]);
                    tp[m][n] = booleanToNum(tp[m][n]);

                    let value;
                    if(isRealNum(fp[n]) && isRealNum(tp[m][n])){
                        value = Math.pow(parseFloat(fp[n]), parseFloat(tp[m][n]));
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
            if(fp.length != tp.length){
                return error.na;   
            }

            for(let n = 0; n < fp.length; n++){
                fp[n] = booleanToNum(fp[n]);
                tp[n] = booleanToNum(tp[n]);

                let value;
                if(isRealNum(fp[n]) && isRealNum(tp[n])){
                    value = Math.pow(parseFloat(fp[n]), parseFloat(tp[n]));
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
                        value = Math.pow(parseFloat(fp[m][n]), parseFloat(tp));
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
                    value = Math.pow(parseFloat(fp[n]), parseFloat(tp));
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
                        value = Math.pow(parseFloat(fp), parseFloat(tp[m][n]));
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
                    value = Math.pow(parseFloat(fp), parseFloat(tp[n]));
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
            result = Math.pow(parseFloat(fp), parseFloat(tp));
        }
        else{
            result = error.v;
        }

        return result;
    }
}
