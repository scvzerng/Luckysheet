import { getObjType } from '../../utils/util';
import { error } from '../../global/validate';

export function handleConcat(fp, tp, sp) {
    if(getObjType(fp) == "array" && getObjType(tp) == "array"){
        let result = [];

        if(getObjType(fp[0]) == "array" && getObjType(tp[0]) == "array"){
            if(fp.length != tp.length && fp[0].length != tp[0].length){
                return error.na;   
            }

            for(let m = 0; m < fp.length; m++){
                let rowArr = [];

                for(let n = 0; n < fp[m].length; n++){
                    rowArr.push(fp[m][n] + "" + tp[m][n]);
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
                    rowArr.push(fp[m][n] + "" + tp[n]);
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
                    rowArr.push(fp[n] + "" + tp[m][n]);
                }

                result.push(rowArr);
            }
        }
        else{
            if(fp.length != tp.length){
                return error.na;   
            }

            for(let n = 0; n < fp.length; n++){
                result.push(fp[n] + "" + tp[n]);
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
                    rowArr.push(fp[m][n] + "" + tp);
                }

                result.push(rowArr);
            }
        }
        else{
            for(let n = 0; n < fp.length; n++){
                result.push(fp[n] + "" + tp);
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
                    rowArr.push(fp + "" + tp[m][n]);
                }

                result.push(rowArr);
            }
        }
        else{
            for(let n = 0; n < tp.length; n++){
                result.push(fp + "" + tp[n]);
            }
        }

        return result;
    }
    else{
        return fp + "" + tp;
    }
}
