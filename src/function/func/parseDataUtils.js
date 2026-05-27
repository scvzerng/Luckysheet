import { valueIsError, error } from '../../global/validate';
import { genarate } from '../../global/format';
import formula from '../../global/formula';

function luckysheet_parseData(value) {
    if(typeof value === "object" ){
        if(value == null){
            return "";
        }
        else if(Array.isArray(value)){
            let v = genarate(value[0]);
            return v[2];
        }
        else{
            if(Array.isArray(value.data)){
                return error.v;
            }
            else{
                if(value.data.v === undefined){
                    return "";
                }
                else{
                    return value.data.v;
                }
            }
        }
    }
    else if(!formula.isCompareOperator(value).flag){
        let v = genarate(value);
        return v[2];
    }
    else if(typeof value === "string" || typeof value === "number"){
        return value;
    }

    return error.v;
}

function luckysheet_getValue() {
    let args = arguments[0];

    for(let i = 0; i < args.length; i++){
        let value = args[i];

        if(typeof value === "object" ){
            if(value == null){
                value = "";
            }
            else if(Array.isArray(value)){
                let v = genarate(value[0]);
                value = v[2];
            }
            else{
                if(Array.isArray(value.data)){
                    value = value.data;
                }
                else{
                    if(value.data.v === undefined){
                        value = "";
                    }
                    else{
                        value = value.data.v;
                    }
                }
            }
        }
        else if(!formula.isCompareOperator(value).flag){
            let v = genarate(value);
            value = v[2];
        }

        args[i] = value;
    }
}

export { luckysheet_parseData, luckysheet_getValue };
