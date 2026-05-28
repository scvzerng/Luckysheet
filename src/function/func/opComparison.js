import {  error  } from '../../global/validate';
import { getObjType } from '../../utils/util';
import { booleanOperation } from './compareHelpers';

export function handleComparison(fp, tp, sp) {
    if(getObjType(fp) == "array" && getObjType(tp) == "array"){
        let result = [];

        if(getObjType(fp[0]) == "array" && getObjType(tp[0]) == "array"){
            if(fp.length != tp.length && fp[0].length != tp[0].length){
                return error.na;   
            }

            for(let m = 0; m < fp.length; m++){
                let rowArr = [];

                for(let n = 0; n < fp[m].length; n++){
                    let value = booleanOperation(fp[m][n], sp, tp[m][n]);
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
                    let value = booleanOperation(fp[m][n], sp, tp[n]);
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
                    let value = booleanOperation(fp[n], sp, tp[m][n]);
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
                let value = booleanOperation(fp[n], sp, tp[n]);
                result.push(value);
            }
        }

        return result;
    }
    else if(getObjType(fp) == "array"){
        let result = [];

        if(getObjType(fp[0]) == "array"){
            for(let m = 0; m < fp.length; m++){
                let rowArr = [];

                for(let n = 0; n < fp[m].length; n++){
                    let value = booleanOperation(fp[m][n], sp, tp);
                    rowArr.push(value);
                }

                result.push(rowArr);
            }
        }
        else{
            for(let n = 0; n < fp.length; n++){
                let value = booleanOperation(fp[n], sp, tp);
                result.push(value);
            }
        }

        return result;
    }
    else if(getObjType(tp) == "array"){
        let result = [];

        if(getObjType(tp[0]) == "array"){
            for(let m = 0; m < tp.length; m++){
                let rowArr = [];

                for(let n = 0; n < tp[m].length; n++){
                    let value = booleanOperation(fp, sp, tp[m][n]);
                    rowArr.push(value);
                }

                result.push(rowArr);
            }
        }
        else{
            for(let n = 0; n < tp.length; n++){
                let value = booleanOperation(fp, sp, tp[n]);
                result.push(value);
            }
        }

        return result;
    }
    else{
        return booleanOperation(fp, sp, tp);
    }
}
