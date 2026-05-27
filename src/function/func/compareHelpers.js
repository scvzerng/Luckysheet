import { isRealNum } from '../../global/validate';

export function booleanOperation(a, operator, b) {
    if(isRealNum(a)){
        a = parseFloat(a);
    }

    if(isRealNum(b)){
        b = parseFloat(b);
    }

    if(operator == "=="){
        if(a == b){
            return true;
        }
        else{
            return false;
        }
    }
    else if(operator == "!="){
        if(a != b){
            return true;
        }
        else{
            return false;
        }
    }
    else if(operator == ">="){
        if(a >= b){
            return true;
        }
        else{
            return false;
        }
    }
    else if(operator == "<="){
        if(a <= b){
            return true;
        }
        else{
            return false;
        }
    }
    else if(operator == ">"){
        if(a > b){
            return true;
        }
        else{
            return false;
        }
    }
    else if(operator == "<"){
        if(a < b){
            return true;
        }
        else{
            return false;
        }
    }
}

export function booleanToNum(v){
    if(v == null){
        return v;
    }

    if(v.toString().toLowerCase() == "true"){
        return 1;
    }

    if(v.toString().toLowerCase() == "false"){
        return 0;
    }

    return v;
}
